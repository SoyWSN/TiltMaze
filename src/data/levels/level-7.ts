import { createLevel } from '@/data/levels/types';

/** Nivel 7: inicio arriba a la derecha y meta abajo a la izquierda, con trampas cruzadas. */
const layout = [
  '#########',
  '#...SO..#',
  '#.#O#.#.#',
  '#.O.....#',
  '#.#.#.#.#',
  '#....O..#',
  '#.#.#.#.#',
  '#..O....#',
  '#.#.#O#.#',
  '#O....O.#',
  '#.#.#.#.#',
  '#.G.O...#',
  '#########',
] as const;

export const LEVEL_SEVEN = createLevel({
  id: 7,
  name: 'Espejo',
  rows: layout,
});
