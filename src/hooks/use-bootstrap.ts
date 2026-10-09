/**
 * Hook de arranque de la app (se monta una sola vez en el layout raíz).
 *
 * 1. Garantiza un usuario anónimo en Firebase.
 * 2. Hidrata el estado del jugador desde `users/{uid}`.
 * 3. Arranca la persistencia (guardado automático en Firestore).
 * 4. Escucha las compras (Stripe) para desbloquear cosméticos al pagar.
 * 5. Registra las notificaciones push (FCM) y sus listeners.
 *
 * Mientras `status !== 'ready'`, el layout muestra una pantalla de carga.
 */
import type { RemoteMessage } from '@react-native-firebase/messaging';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { onAuthStateChanged, signInAnonymously } from '@/services/auth';
import { loadPlayer } from '@/services/firestore';
import {
  getInitialNotification,
  registerForPush,
  watchForegroundMessages,
  watchNotificationOpens,
} from '@/services/notifications';
import { startPersistence, stopPersistence } from '@/services/persistence';
import { watchPurchases } from '@/services/purchases';
import { useNotifications } from '@/store/notifications';
import { usePlayer } from '@/store/player';

/** Convierte un mensaje FCM en el banner que pinta la app en primer plano. */
function showBannerFromMessage(message: RemoteMessage): void {
  if (__DEV__) {
    console.log('[FCM foreground]', message.messageId, message.notification?.title);
  }
  const navigationId = message.data?.navigationId;
  useNotifications.getState().show({
    title: message.notification?.title ?? 'TiltMaze',
    body: message.notification?.body ?? '',
    navigationId: typeof navigationId === 'string' ? navigationId : undefined,
  });
}

export function useBootstrap(): void {
  const setUid = usePlayer((state) => state.setUid);
  const setStatus = usePlayer((state) => state.setStatus);
  const hydrate = usePlayer((state) => state.hydrate);

  useEffect(() => {
    let active = true;
    let purchasesUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged((user) => {
      if (!active) {
        return;
      }
      void (async () => {
        if (!user) {
          // Se cerró sesión: detén la escucha de compras y la persistencia del uid
          // anterior antes de crear el invitado nuevo (evita errores de permisos).
          purchasesUnsub?.();
          purchasesUnsub = null;
          stopPersistence();
          // Sin sesión: crea un invitado anónimo (vuelve a disparar el listener).
          try {
            await signInAnonymously();
          } catch {
            // Sin red: se entra igualmente con estado en memoria (sin persistencia).
            if (active) {
              setStatus('ready');
            }
          }
          return;
        }

        const uid = user.uid;
        setUid(uid);
        const doc = await loadPlayer(uid);
        hydrate(doc);
        startPersistence(uid);
        purchasesUnsub?.();
        purchasesUnsub = watchPurchases(uid);

        // Si el jugador ya activó las notificaciones, registra el token de nuevo
        // (el token puede cambiar entre instalaciones/actualizaciones).
        if (usePlayer.getState().settings.notifications) {
          void registerForPush(uid).catch(() => {
            // Sin permiso o sin red: no es crítico para arrancar.
          });
        }

        if (active) {
          setStatus('ready');
        }
      })();
    });

    return () => {
      active = false;
      unsubscribe();
      purchasesUnsub?.();
      stopPersistence();
    };
  }, [setUid, setStatus, hydrate]);

  // Listeners de FCM (independientes de la sesión): se montan una sola vez.
  useEffect(() => {
    const unsubMessage = watchForegroundMessages(showBannerFromMessage);
    const unsubOpen = watchNotificationOpens((message) => {
      if (message.data?.navigationId === 'cosmetics') {
        router.push('/cosmetics');
      }
    });

    // App abierta desde una notificación (estaba cerrada): muéstrala como banner.
    void getInitialNotification().then((message) => {
      if (message) {
        showBannerFromMessage(message);
      }
    });

    return () => {
      unsubMessage();
      unsubOpen();
    };
  }, []);
}
