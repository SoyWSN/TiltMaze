/**
 * `AppText` / `AppTextInput`: `Text` y `TextInput` con la fuente redondeada de la
 * app (Fredoka), respetando el `fontWeight` de cada estilo.
 *
 * Se usan **aliasando el import** para no tocar el JSX existente:
 *
 *   import { AppText as Text } from '@/components/app-text';
 *
 * Fredoka trae cada peso como familia separada, así que el wrapper elige la familia
 * según el `fontWeight` del estilo y fija `fontWeight: 'normal'` para evitar la
 * "negrita sintética". Para el texto anidado (p. ej. el título "Tilt"/"Maze"), un
 * contexto propaga la familia del padre a los hijos que no fijan su propio peso.
 */
import { createContext, useContext } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { fontFamilyForWeight } from '@/constants/fonts';

/** Familia heredada del `Text` padre (undefined en el nivel superior). */
const FamilyContext = createContext<string | undefined>(undefined);

function resolveFamily(
  style: StyleProp<TextStyle> | undefined,
  inherited: string | undefined,
): string {
  const flat: TextStyle = style ? StyleSheet.flatten(style) : {};
  if (flat.fontWeight !== undefined) {
    return fontFamilyForWeight(flat.fontWeight);
  }
  return inherited ?? fontFamilyForWeight(undefined);
}

export function AppText({ style, ...rest }: TextProps) {
  const inherited = useContext(FamilyContext);
  const fontFamily = resolveFamily(style, inherited);
  return (
    <FamilyContext.Provider value={fontFamily}>
      <Text style={[style, { fontFamily, fontWeight: 'normal' }]} {...rest} />
    </FamilyContext.Provider>
  );
}

export function AppTextInput({ style, ...rest }: TextInputProps) {
  return (
    <TextInput
      style={[style, { fontFamily: resolveFamily(style, undefined), fontWeight: 'normal' }]}
      {...rest}
    />
  );
}
