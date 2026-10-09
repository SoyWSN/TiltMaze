/**
 * Hook de arranque de la app (se monta una sola vez en el layout raíz).
 *
 * 1. Garantiza un usuario anónimo en Firebase.
 * 2. Hidrata el estado del jugador desde `users/{uid}`.
 * 3. Arranca la persistencia (guardado automático en Firestore).
 * 4. Escucha las compras (Stripe) para desbloquear cosméticos al pagar.
 *
 * Mientras `status !== 'ready'`, el layout muestra una pantalla de carga.
 */
import { useEffect } from 'react';

import { onAuthStateChanged, signInAnonymously } from '@/services/auth';
import { loadPlayer } from '@/services/firestore';
import { startPersistence, stopPersistence } from '@/services/persistence';
import { watchPurchases } from '@/services/purchases';
import { usePlayer } from '@/store/player';

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
}
