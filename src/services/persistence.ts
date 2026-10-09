/**
 * Persistencia del estado del jugador en Firestore.
 *
 * Escucha los cambios del store (zustand) y escribe el documento `users/{uid}`
 * con un pequeño debounce para no saturar la red. Es la capa que hace que el
 * progreso sobreviva al cerrar la app.
 */
import { savePlayer } from '@/services/firestore';
import { snapshotOf, usePlayer } from '@/store/player';

const SAVE_DEBOUNCE_MS = 500;

let timer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;
let lastSavedKey: string | null = null;

export function startPersistence(uid: string): void {
  stopPersistence();
  lastSavedKey = null;

  unsubscribe = usePlayer.subscribe((state) => {
    if (state.uid !== uid || state.status !== 'ready') {
      return;
    }
    const snapshot = snapshotOf(state);
    const key = JSON.stringify(snapshot);
    if (key === lastSavedKey) {
      return;
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      lastSavedKey = key;
      savePlayer(uid, snapshot).catch((error) => {
        console.warn('No se pudo guardar el progreso en Firestore', error);
      });
    }, SAVE_DEBOUNCE_MS);
  });
}

export function stopPersistence(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  lastSavedKey = null;
  unsubscribe?.();
  unsubscribe = null;
}
