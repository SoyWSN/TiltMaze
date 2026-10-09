/**
 * Autenticación con Firebase (proveedor anónimo), API modular de
 * `@react-native-firebase/auth` v26.
 *
 * La app funciona siempre con un usuario anónimo: en el primer arranque se crea
 * uno y, en adelante, el SDK recupera la sesión guardada en el dispositivo.
 */
import {
  getAuth,
  onAuthStateChanged as rnOnAuthStateChanged,
  signInAnonymously as rnSignInAnonymously,
  signOut as rnSignOut,
  type User,
} from '@react-native-firebase/auth';

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return rnOnAuthStateChanged(getAuth(), callback);
}

/** Inicia sesión anónima y devuelve el uid del usuario. */
export async function signInAnonymously(): Promise<string> {
  const credential = await rnSignInAnonymously(getAuth());
  return credential.user.uid;
}

/** Cierra la sesión actual (el arranque creará un invitado nuevo). */
export async function signOut(): Promise<void> {
  await rnSignOut(getAuth());
}

export function currentUid(): string | null {
  return getAuth().currentUser?.uid ?? null;
}
