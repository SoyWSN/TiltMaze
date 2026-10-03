/**
 * Paleta de TiltMaze, tomada del mockup de la pantalla principal.
 * Todo el estilo de la app (fondo pastel, tarjetas con degradado y sombras
 * de color) se basa en estos valores para mantener coherencia entre pantallas.
 */
export const Palette = {
  // Fondos y superficies
  background: '#F5F3FF',
  backgroundAlt: '#EDE8FF',
  surface: '#FFFFFF',
  border: '#E7E2F7',

  // Tipografía
  navy: '#2E2C6B',
  purple: '#6C4CF1',
  periwinkle: '#7B78E8',
  text: '#3A3F51',
  muted: '#7A8093',

  // Detalles del mockup
  line: '#D6D0EC',
  pinkDot: '#F0709E',
  gold: '#F5A623',

  // Degradados de las tarjetas
  cardPurple: ['#8C52F5', '#6A33D8'] as const,
  cardPink: ['#F45B9B', '#E23078'] as const,
  cardTeal: ['#24C6D9', '#0FA0B5'] as const,
  cardYellow: ['#FCD24A', '#F2A81D'] as const,

  // Pelota dorada
  ball: ['#FFE07A', '#F5A623'] as const,

  // Sombras de color por tarjeta
  shadowPurple: '#7C4DFF',
  shadowPink: '#EC4899',
  shadowTeal: '#12B3C7',
  shadowYellow: '#F2A81D',
} as const;

export type GradientColors = readonly [string, string];
