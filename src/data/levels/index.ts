import { LEVEL_ONE } from '@/data/levels/level-1';
import { LEVEL_TWO } from '@/data/levels/level-2';
import { LEVEL_THREE } from '@/data/levels/level-3';
import { LEVEL_FOUR } from '@/data/levels/level-4';
import { LEVEL_FIVE } from '@/data/levels/level-5';
import { LEVEL_SIX } from '@/data/levels/level-6';
import { LEVEL_SEVEN } from '@/data/levels/level-7';
import { LEVEL_EIGHT } from '@/data/levels/level-8';
import { LEVEL_NINE } from '@/data/levels/level-9';
import { LEVEL_TEN } from '@/data/levels/level-10';
import type { MazeLevel } from '@/data/levels/types';

export * from '@/data/levels/types';

/** Registro de niveles ordenado por id. Agregar un nivel = importarlo aquí. */
export const LEVELS: MazeLevel[] = [
  LEVEL_ONE,
  LEVEL_TWO,
  LEVEL_THREE,
  LEVEL_FOUR,
  LEVEL_FIVE,
  LEVEL_SIX,
  LEVEL_SEVEN,
  LEVEL_EIGHT,
  LEVEL_NINE,
  LEVEL_TEN,
];

export const LEVEL_COUNT = LEVELS.length;

export function getLevel(id: number): MazeLevel {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}

/** Siguiente nivel después de `id`, o undefined si ya es el último. */
export function getNextLevel(id: number): MazeLevel | undefined {
  return LEVELS.find((level) => level.id === id + 1);
}
