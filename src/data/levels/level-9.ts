import { createLevel } from '@/data/levels/types';

/** Nivel 9: recorrido largo de arriba a abajo con hoyos repartidos. */
const layout = [
  '#########',
  '#......S#',
  '#.#.#O#O#',
  '#..O....#',
  '#.#.#.#.#',
  '#.....O.#',
  '#.#O#O#.#',
  '#O......#',
  '#.#.#.#.#',
  '#....O.O#',
  '#.#O#...#',
  '#....G..#',
  '#########',
] as const;

export const LEVEL_NINE = createLevel({
  id: 9,
  name: 'Marea',
  rows: layout,
});
