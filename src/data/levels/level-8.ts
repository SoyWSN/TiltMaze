import { createLevel } from '@/data/levels/types';

/** Nivel 8: pasillos estrechos y muchos hoyos; exige precisión. */
const layout = [
  '#########',
  '#..O.S..#',
  '#.###O#.#',
  '#.......#',
  '#.#.#O#O#',
  '#.#O....#',
  '#.#.#.#.#',
  '#.....O.#',
  '#.###O#.#',
  '#.O.....#',
  '###.#O#.#',
  '#....G.O#',
  '#########',
] as const;

export const LEVEL_EIGHT = createLevel({
  id: 8,
  name: 'Trampa',
  rows: layout,
});
