import { createLevel } from '@/data/levels/types';

const layout = [
  '#########',
  '#S..#...#',
  '###.#.###',
  '#...#.###',
  '#.###.###',
  '#.....###',
  '#####.###',
  '#O....###',
  '#.###...#',
  '#..O...G#',
  '#####.#.#',
  '#.....#.#',
  '#########',
] as const;

export const LEVEL_ONE = createLevel({
  id: 1,
  name: 'Primeros pasos',
  rows: layout,
});
