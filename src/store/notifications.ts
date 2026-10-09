/**
 * Estado efímero de las notificaciones recibidas en primer plano.
 *
 * FCM no muestra notificaciones cuando la app está abierta, así que `onMessage`
 * deja el mensaje aquí y `<NotificationBanner />` lo pinta. El auto-cierre vive
 * en el propio store (fuera de React) para no chocar con las reglas del
 * React Compiler sobre efectos/estado.
 */
import { create } from 'zustand';

export type PushBanner = {
  title: string;
  body: string;
  /** Ruta a abrir al tocar el banner (p. ej. "cosmetics"). */
  navigationId?: string;
};

type NotificationState = {
  banner: PushBanner | null;
  show: (banner: PushBanner) => void;
  dismiss: () => void;
};

const AUTO_DISMISS_MS = 6000;

let timer: ReturnType<typeof setTimeout> | null = null;

export const useNotifications = create<NotificationState>((set) => ({
  banner: null,
  show: (banner) => {
    if (timer) {
      clearTimeout(timer);
    }
    set({ banner });
    timer = setTimeout(() => set({ banner: null }), AUTO_DISMISS_MS);
  },
  dismiss: () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    set({ banner: null });
  },
}));
