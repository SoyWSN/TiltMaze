import { createLevel } from '@/data/levels/types';

/** Nivel 10: el más denso en hoyos; el desafío final. */
const layout = [
  '#########',
  '#.....SO#',
  '#.#.#O#.#',
  '#.#O....#',
  '#.#.#.#.#',
  '#...#.O.#',
  '#.#.#.#.#',
  '#O....O.#',
  '#.#O#O#.#',
  '#.......#',
  '#.#O#O###',
  '#...G...#',
  '#########',
] as const;

export const LEVEL_TEN = createLevel({
  id: 10,
  name: 'Vórtice',
  rows: layout,
});
