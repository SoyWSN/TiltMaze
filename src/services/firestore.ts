/**
 * Acceso a Firestore, API modular de `@react-native-firebase/firestore` v26.
 *
 * - `users/{uid}` guarda el perfil y progreso de cada jugador.
 * - `purchases/{id}` (día 5) lo crea la app y lo actualiza el webhook de Stripe.
 */
import { doc, getDoc, getFirestore, setDoc } from '@react-native-firebase/firestore';

import type { PlayerSnapshot } from '@/store/player';

const USERS = 'users';

function playerDoc(uid: string) {
  return doc(getFirestore(), USERS, uid);
}

/** Lee el documento del jugador, o `null` si aún no existe. */
export async function loadPlayer(uid: string): Promise<PlayerSnapshot | null> {
  const snapshot = await getDoc(playerDoc(uid));
  return snapshot.exists() ? (snapshot.data() as PlayerSnapshot) : null;
}

/** Crea o actualiza el documento del jugador (merge por campo). */
export async function savePlayer(uid: string, data: PlayerSnapshot): Promise<void> {
  await setDoc(playerDoc(uid), data, { merge: true });
}

/** Guarda el token FCM del dispositivo en `users/{uid}.fcmToken`. */
export async function saveFcmToken(uid: string, token: string): Promise<void> {
  await setDoc(playerDoc(uid), { fcmToken: token }, { merge: true });
}

/** Borra el token FCM (al desactivar las notificaciones). */
export async function clearFcmToken(uid: string): Promise<void> {
  await setDoc(playerDoc(uid), { fcmToken: null }, { merge: true });
}
