import { createLevel } from '@/data/levels/types';

/** Nivel enviado por el usuario: zigzag entre filas de hoyos. */
const layout = [
  '#########',
  '##..S..##',
  '##.....##',
  '##OOO..##',
  '##.....##',
  '##..OOO##',
  '##.....##',
  '##OOO..##',
  '##.....##',
  '##..OOO##',
  '##.....##',
  '##..G..##',
  '#########',
] as const;

export const LEVEL_TWO = createLevel({
  id: 2,
  name: 'Campo minado',
  rows: layout,
});
