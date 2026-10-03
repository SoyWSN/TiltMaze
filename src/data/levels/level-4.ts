import { createLevel } from '@/data/levels/types';

/** Nivel 4: terreno denso en hoyos, exige precisión. */
const layout = [
  '#########',
  '#S....#.#',
  '#.##.##.#',
  '#.#...#.#',
  '#.#.#.#.#',
  '#...O...#',
  '#O###.#.#',
  '#.O....O#',
  '#..O.O..#',
  '#.....O.#',
  '#.O...O.#',
  '#G......#',
  '#########',
] as const;

export const LEVEL_FOUR = createLevel({
  id: 4,
  name: 'Riesgo alto',
  rows: layout,
});
