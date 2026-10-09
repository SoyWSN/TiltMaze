/**
 * Estado global del jugador (zustand).
 *
 * Esta tienda es la única fuente de verdad del estado en la app. La capa
 * `src/services/persistence.ts` escucha sus cambios y los guarda en Firestore
 * (`users/{uid}`), de modo que el progreso sobrevive al cerrar la app.
 */
import { create } from 'zustand';

import { FREE_ITEM_IDS } from '@/data/cosmetics';
import { LEVEL_COUNT as TOTAL_LEVELS } from '@/data/levels';

export const LEVEL_COUNT = TOTAL_LEVELS;

export type Equipped = { skinId: string; themeId: string };
export type PlayerSettings = { biometric: boolean; notifications: boolean };

/** Forma del documento `users/{uid}` en Firestore. */
export type PlayerSnapshot = {
  displayName: string | null;
  /** Mayor nivel desbloqueado (1..LEVEL_COUNT). */
  unlockedLevels: number;
  /** Récord personal por nivel, en milisegundos. */
  bestScores: Record<string, number>;
  /** Ids de cosméticos comprados (los gratis siempre incluidos). */
  ownedItems: string[];
  equipped: Equipped;
  settings: PlayerSettings;
};

export type PlayerState = PlayerSnapshot & {
  /** uid del usuario anónimo de Firebase (null hasta autenticarse). */
  uid: string | null;
  /** Estado del arranque: `loading` mientras se autentica e hidrata. */
  status: 'loading' | 'ready';
  /** Si la sesión ya superó el bloqueo biométrico. */
  biometricUnlocked: boolean;

  setUid: (uid: string | null) => void;
  setStatus: (status: 'loading' | 'ready') => void;
  setBiometricUnlocked: (unlocked: boolean) => void;
  /** Aplica los datos traídos de Firestore (mezcla con los valores por defecto). */
  hydrate: (data: Partial<PlayerSnapshot> | null) => void;

  createProfile: (displayName: string) => void;
  setDisplayName: (displayName: string) => void;
  /** Registra el fin de un nivel; devuelve true si fue récord personal. */
  completeLevel: (levelId: number, timeMs: number) => boolean;
  addOwnedItem: (itemId: string) => void;
  /** Otorga todos los cosméticos de un pack. */
  addOwnedItems: (itemIds: string[]) => void;
  equip: (equip: Partial<Equipped>) => void;
  setSettings: (settings: Partial<PlayerSettings>) => void;
  reset: () => void;
};

const DEFAULT_EQUIPPED: Equipped = { skinId: 'ball_roja', themeId: 'theme_default' };
const DEFAULT_SETTINGS: PlayerSettings = { biometric: false, notifications: false };

/** Mezcla los items comprados con los gratis, sin duplicados. */
function mergeOwned(owned?: string[]): string[] {
  return Array.from(new Set([...FREE_ITEM_IDS, ...(owned ?? [])]));
}

/** Serializa el estado a la forma que se guarda en Firestore. */
export function snapshotOf(state: PlayerState): PlayerSnapshot {
  return {
    displayName: state.displayName,
    unlockedLevels: state.unlockedLevels,
    bestScores: state.bestScores,
    ownedItems: state.ownedItems,
    equipped: state.equipped,
    settings: state.settings,
  };
}

export const usePlayer = create<PlayerState>((set, get) => ({
  displayName: null,
  unlockedLevels: 1,
  bestScores: {},
  ownedItems: [...FREE_ITEM_IDS],
  equipped: { ...DEFAULT_EQUIPPED },
  settings: { ...DEFAULT_SETTINGS },
  uid: null,
  status: 'loading',
  biometricUnlocked: false,

  setUid: (uid) => set({ uid }),
  setStatus: (status) => set({ status }),
  setBiometricUnlocked: (biometricUnlocked) => set({ biometricUnlocked }),

  hydrate: (data) =>
    set({
      displayName: data?.displayName ?? null,
      unlockedLevels: data?.unlockedLevels ?? 1,
      bestScores: data?.bestScores ?? {},
      ownedItems: mergeOwned(data?.ownedItems),
      equipped: data?.equipped ?? { ...DEFAULT_EQUIPPED },
      settings: data?.settings ?? { ...DEFAULT_SETTINGS },
    }),

  createProfile: (displayName) => set({ displayName }),
  setDisplayName: (displayName) => set({ displayName }),

  completeLevel: (levelId, timeMs) => {
    const key = String(levelId);
    const previous = get().bestScores[key];
    const isRecord = previous === undefined || timeMs < previous;
    set({
      bestScores: isRecord ? { ...get().bestScores, [key]: timeMs } : get().bestScores,
      unlockedLevels: Math.min(LEVEL_COUNT, Math.max(get().unlockedLevels, levelId + 1)),
    });
    return isRecord;
  },

  addOwnedItem: (itemId) => {
    const owned = get().ownedItems;
    set({ ownedItems: owned.includes(itemId) ? owned : [...owned, itemId] });
  },

  addOwnedItems: (itemIds) => {
    const owned = get().ownedItems;
    const nuevos = itemIds.filter((id) => !owned.includes(id));
    if (nuevos.length > 0) {
      set({ ownedItems: [...owned, ...nuevos] });
    }
  },

  equip: (equip) => set({ equipped: { ...get().equipped, ...equip } }),

  setSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),

  reset: () =>
    set({
      displayName: null,
      unlockedLevels: 1,
      bestScores: {},
      ownedItems: [...FREE_ITEM_IDS],
      equipped: { ...DEFAULT_EQUIPPED },
      settings: { ...DEFAULT_SETTINGS },
    }),
}));
