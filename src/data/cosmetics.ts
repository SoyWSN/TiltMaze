import type { ImageRequireSource } from 'react-native';

/**
 * Catálogo de cosméticos de TiltMaze (precios en pesos mexicanos).
 *
 * - `previewColor` es el color de la bola (para skins) o de la tarjeta.
 * - `boardTheme` son los colores del tablero (para temas).
 * - `image` es el arte de la bola (skins premium con imagen en lugar de color plano).
 * - `paymentLinkUrl` se crea en el dashboard de Stripe y se pega aquí el día 5.
 *   El mínimo de cargo de Stripe en MXN en modo real es $10.00; los precios
 *   de $5–$8 MXN funcionan en modo test.
 */
export type CosmeticType = 'skin' | 'theme' | 'pack';

export type BoardTheme = {
  board: string;
  wall: string;
  hole: string;
  holeRim: string;
  start: string;
  goal: string;
};

export type Cosmetic = {
  id: string;
  name: string;
  type: CosmeticType;
  /** Precio en pesos mexicanos (entero). 0 = gratis / incluido. */
  priceMXN: number;
  /** Payment Link de Stripe. null = gratis / de serie. */
  paymentLinkUrl: string | null;
  /** Color de la bola o de la vista previa. */
  previewColor: string;
  /** Arte de la bola (skins premium con imagen en lugar de color plano). */
  image?: ImageRequireSource;
  /** Solo para temas: colores del tablero. */
  boardTheme?: BoardTheme;
  /** Solo para el pack: ids de los cosméticos incluidos. */
  includes?: string[];
};

export const DEFAULT_BOARD_THEME: BoardTheme = {
  board: '#D8C39A',
  wall: '#29364B',
  hole: '#10151E',
  holeRim: '#69758A',
  start: '#35C991',
  goal: '#F4D35E',
};

export const DEFAULT_SKIN_ID = 'ball_roja';
export const DEFAULT_THEME_ID = 'theme_default';

export const COSMETICS: Cosmetic[] = [
  // ── Pelotas gratis (cambio de color) ──────────────────────────────
  { id: 'ball_roja', name: 'Roja', type: 'skin', priceMXN: 0, paymentLinkUrl: null, previewColor: '#F05D5E' },
  { id: 'ball_azul', name: 'Azul', type: 'skin', priceMXN: 0, paymentLinkUrl: null, previewColor: '#4F8EF7' },
  { id: 'ball_verde', name: 'Verde', type: 'skin', priceMXN: 0, paymentLinkUrl: null, previewColor: '#35C991' },
  { id: 'ball_amarilla', name: 'Amarilla', type: 'skin', priceMXN: 0, paymentLinkUrl: null, previewColor: '#F2C94C' },
  { id: 'ball_rosa', name: 'Rosa', type: 'skin', priceMXN: 0, paymentLinkUrl: null, previewColor: '#F0709E' },
  { id: 'ball_morada', name: 'Morada', type: 'skin', priceMXN: 0, paymentLinkUrl: null, previewColor: '#8C52F5' },
  { id: 'ball_naranja', name: 'Naranja', type: 'skin', priceMXN: 0, paymentLinkUrl: null, previewColor: '#F2994A' },

  // ── Pelotas premium (día 5 · Stripe) ──────────────────────────────
  {
    id: 'skin_fuego',
    name: 'Fuego',
    type: 'skin',
    priceMXN: 10,
    paymentLinkUrl: 'https://buy.stripe.com/test_8x200k811dwp27U6s6bjW00',
    previewColor: '#FF5722',
    image: require('../assets/balls/ball-fuego.png'),
  },
  {
    id: 'skin_galaxia',
    name: 'Galaxia',
    type: 'skin',
    priceMXN: 10,
    paymentLinkUrl: 'https://buy.stripe.com/test_6oU28sdll63XeUG4jYbjW01',
    previewColor: '#7C4DFF',
    image: require('../assets/balls/ball-galaxia.png'),
  },
  {
    id: 'skin_emoji',
    name: 'Emoji',
    type: 'skin',
    priceMXN: 10,
    paymentLinkUrl: 'https://buy.stripe.com/test_8x2bJ29551NHdQCg2GbjW02',
    previewColor: '#FFC107',
    image: require('../assets/balls/ball-emoji.png'),
  },

  // ── Tableros ──────────────────────────────────────────────────────
  {
    id: 'theme_default',
    name: 'Madera',
    type: 'theme',
    priceMXN: 0,
    paymentLinkUrl: null,
    previewColor: '#8B5A2B',
    boardTheme: DEFAULT_BOARD_THEME,
  },
  {
    id: 'theme_bamboo',
    name: 'Bamboo',
    type: 'theme',
    priceMXN: 20,
    paymentLinkUrl: 'https://buy.stripe.com/test_bJeaEY9553VP8wi9EibjW04',
    previewColor: '#4CAF50',
    boardTheme: {
      board: '#CFE8C8',
      wall: '#2F5D3A',
      hole: '#0F2417',
      holeRim: '#7FA98C',
      start: '#2E9E6B',
      goal: '#E9B949',
    },
  },
  {
    id: 'theme_neon',
    name: 'Neón',
    type: 'theme',
    priceMXN: 20,
    paymentLinkUrl: 'https://buy.stripe.com/test_bJe14oa99gIB5k603IbjW03',
    previewColor: '#121212',
    boardTheme: {
      board: '#1B1B33',
      wall: '#4B3A8F',
      hole: '#07071A',
      holeRim: '#7C6BF0',
      start: '#00E676',
      goal: '#FFEA00',
    },
  },

];

/** Cosméticos que todo jugador tiene desde el inicio (los gratis). */
export const FREE_ITEM_IDS = COSMETICS.filter((item) => item.priceMXN === 0).map(
  (item) => item.id,
);

export const getCosmetic = (id: string): Cosmetic | undefined =>
  COSMETICS.find((cosmetic) => cosmetic.id === id);

/** Color de la bola según la skin equipada. */
export const ballColorFor = (skinId: string): string =>
  getCosmetic(skinId)?.previewColor ?? '#F05D5E';

/** Imagen de la bola según la skin equipada (si tiene arte). */
export const ballImageFor = (skinId: string): ImageRequireSource | undefined =>
  getCosmetic(skinId)?.image;

/** Colores del tablero según el tema equipado. */
export const boardThemeFor = (themeId: string): BoardTheme =>
  getCosmetic(themeId)?.boardTheme ?? DEFAULT_BOARD_THEME;

/** Etiqueta de precio formateada, p.ej. "$5 MXN" o "Gratis". */
export const priceLabel = (cosmetic: Cosmetic): string =>
  cosmetic.priceMXN === 0 ? 'Gratis' : `$${cosmetic.priceMXN} MXN`;
