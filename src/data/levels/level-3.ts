import { createLevel } from '@/data/levels/types';

/** Nivel 3: caminos con bifurcaciones y hoyos intercalados. */
const layout = [
  '#########',
  '#S...#..#',
  '#.##.#.##',
  '#..O...##',
  '###....##',
  '###.O.O.#',
  '###...#.#',
  '#.....#.#',
  '#.###.#.#',
  '#..O..#.#',
  '#.###.#.#',
  '#.O....G#',
  '#########',
] as const;

export const LEVEL_THREE = createLevel({
  id: 3,
  name: 'Encrucijada',
  rows: layout,
});
