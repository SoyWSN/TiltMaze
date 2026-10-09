/**
 * Notificaciones push con Firebase Cloud Messaging (día 6).
 *
 * Conceptos clave:
 * - **Token FCM**: identifica este dispositivo ante FCM. Se guarda en
 *   `users/{uid}.fcmToken` para que el webhook de Stripe sepa a quién avisar.
 * - **Primer plano**: FCM no muestra nada solo; `onMessage` entrega el mensaje y
 *   la app decide (aquí: un banner in-app, ver `src/components/notification-banner.tsx`).
 * - **Segundo plano / cerrada**: si el mensaje trae `notification`, el sistema
 *   muestra la notificación por sí solo. El tap llega por `onNotificationOpenedApp`
 *   (background) o `getInitialNotification` (app cerrada).
 *
 * API modular de `@react-native-firebase/messaging` v26 (sin export default).
 */
import {
  AuthorizationStatus,
  deleteToken,
  getInitialNotification as rnGetInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

import { clearFcmToken, saveFcmToken } from '@/services/firestore';

/** Callback para mensajes recibidos con la app abierta. */
export type MessageHandler = (message: RemoteMessage) => void;

const messaging = getMessaging();

/** Se mantiene el `unsubscribe` del refresco de token entre llamadas. */
let tokenRefreshUnsub: (() => void) | null = null;

function stopTokenRefresh(): void {
  tokenRefreshUnsub?.();
  tokenRefreshUnsub = null;
}

/**
 * Pide permiso para mostrar notificaciones.
 * - Android 13+ (API 33): permiso en tiempo de ejecución `POST_NOTIFICATIONS`.
 * - Android 12 o inferior: concedido por defecto.
 * - iOS: `requestPermission` de FCM.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const status = await requestPermission(messaging);
  return (
    status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Pide permiso, obtiene el token FCM y lo guarda en Firestore. Devuelve el token
 * (`null` si el usuario denegó el permiso). También queda escuchando los refrescos
 * de token para mantener Firestore al día.
 */
export async function registerForPush(uid: string): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    return null;
  }

  stopTokenRefresh();
  tokenRefreshUnsub = onTokenRefresh(messaging, (token) => {
    void saveFcmToken(uid, token);
  });

  const token = await getToken(messaging);
  if (!token) {
    return null;
  }
  await saveFcmToken(uid, token);
  return token;
}

/** Deja de escuchar refrescos, borra el token del dispositivo y de Firestore. */
export async function unregisterPush(uid: string): Promise<void> {
  stopTokenRefresh();
  try {
    await deleteToken(messaging);
  } catch {
    // Sin red o sin token: da igual, igualmente limpiamos Firestore.
  }
  await clearFcmToken(uid);
}

/** Registra el handler de mensajes en Background/Quit (llamar una sola vez, temprano). */
export function registerBackgroundHandler(): void {
  setBackgroundMessageHandler(messaging, async (message) => {
    // El sistema ya mostró la notificación (trae `notification`); aquí solo
    // se deja constancia. Sirve además para futuros mensajes "data-only".
    if (__DEV__) {
      console.log('[FCM background]', message.messageId ?? message.data);
    }
  });
}

/** Mensajes recibidos con la app en primer plano (el sistema no los muestra solo). */
export function watchForegroundMessages(handler: MessageHandler): () => void {
  return onMessage(messaging, handler);
}

/** Tap en una notificación cuando la app estaba en segundo plano. */
export function watchNotificationOpens(handler: MessageHandler): () => void {
  return onNotificationOpenedApp(messaging, handler);
}

/** Notificación que abrió la app desde el estado cerrado (una sola vez). */
export function getInitialNotification(): Promise<RemoteMessage | null> {
  return rnGetInitialNotification(messaging);
}
