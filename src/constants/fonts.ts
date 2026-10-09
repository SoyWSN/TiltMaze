/**
 * Fuente redondeada de la app: **Fredoka** (Google Fonts).
 *
 * Fredoka trae cada peso como un archivo/familia distinto, así que no basta con
 * `fontWeight`: hay que elegir la familia estática correcta. Este módulo centraliza
 * tanto las fuentes que se cargan en `_layout.tsx` (`FONT_SOURCES`) como el mapeo
 * `fontWeight → familia` que usa el componente `AppText`.
 */
import {
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import type { TextStyle } from 'react-native';

/** Fuentes que se cargan con `useFonts` en el layout raíz. */
export const FONT_SOURCES = {
  Fredoka_300Light,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
};

/** Mapea un `fontWeight` a la variante estática de Fredoka (300–700). */
const WEIGHT_TO_FAMILY: Record<string, string> = {
  '100': 'Fredoka_300Light',
  '200': 'Fredoka_300Light',
  '300': 'Fredoka_300Light',
  '400': 'Fredoka_400Regular',
  normal: 'Fredoka_400Regular',
  '500': 'Fredoka_500Medium',
  '600': 'Fredoka_600SemiBold',
  '700': 'Fredoka_700Bold',
  bold: 'Fredoka_700Bold',
  '800': 'Fredoka_700Bold',
  '900': 'Fredoka_700Bold',
};

export function fontFamilyForWeight(weight: TextStyle['fontWeight']): string {
  return WEIGHT_TO_FAMILY[String(weight ?? '400')] ?? 'Fredoka_400Regular';
}
