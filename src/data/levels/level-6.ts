import { createLevel } from '@/data/levels/types';

/** Nivel 6: columnas alternas con hoyos intercalados. */
const layout = [
  '#########',
  '#..O.S..#',
  '#.#.#O#.#',
  '#...O...#',
  '#.#...#.#',
  '#..O.O..#',
  '#.#.#.#.#',
  '#......O#',
  '#O#O..#.#',
  '#....O..#',
  '#.#O#...#',
  '#...G...#',
  '#########',
] as const;

export const LEVEL_SIX = createLevel({
  id: 6,
  name: 'Dédalo',
  rows: layout,
});
