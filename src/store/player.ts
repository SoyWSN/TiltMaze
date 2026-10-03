/**
 * Estado global del jugador (zustand).
 *
 * Día 4: la persistencia en Firestore se hará desde src/services (la tienda
 * seguirá siendo la única fuente de verdad del estado en la app).
 */
import { create } from 'zustand';

import { FREE_ITEM_IDS } from '@/data/cosmetics';
import { LEVEL_COUNT as TOTAL_LEVELS } from '@/data/levels';

export const LEVEL_COUNT = TOTAL_LEVELS;

export type Equipped = { skinId: string; themeId: string };
export type PlayerSettings = { biometric: boolean; notifications: boolean };

export type PlayerState = {
  displayName: string | null;
  /** Mayor nivel desbloqueado (1..LEVEL_COUNT). */
  unlockedLevels: number;
  /** Récord personal por nivel, en milisegundos. */
  bestScores: Record<string, number>;
  /** Ids de cosméticos comprados (los gratis siempre incluidos). */
  ownedItems: string[];
  equipped: Equipped;
  settings: PlayerSettings;
  createProfile: (displayName: string) => void;
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

export const usePlayer = create<PlayerState>((set, get) => ({
  displayName: null,
  unlockedLevels: 1,
  bestScores: {},
  ownedItems: [...FREE_ITEM_IDS],
  equipped: { ...DEFAULT_EQUIPPED },
  settings: { ...DEFAULT_SETTINGS },

  createProfile: (displayName) => set({ displayName }),

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
