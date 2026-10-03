import { createLevel } from '@/data/levels/types';

/** Nivel 5: recorrido serpenteante con un tramo angosto y hoyos al final. */
const layout = [
  '#########',
  '#S..#...#',
  '#.#.#.#.#',
  '#.#...#.#',
  '#.#####.#',
  '#.....#.#',
  '#####.#.#',
  '#.....#.#',
  '#######.#',
  '#...O...#',
  '#.O...O.#',
  '#G..O...#',
  '#########',
] as const;

export const LEVEL_FIVE = createLevel({
  id: 5,
  name: 'Serpiente',
  rows: layout,
});
