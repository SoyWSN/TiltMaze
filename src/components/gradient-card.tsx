import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { AppText as Text } from '@/components/app-text';
import { Palette, type GradientColors } from '@/constants/palette';

type GradientCardProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  subtitle: string;
  colors: GradientColors;
  shadowColor: string;
  icon: ReactNode;
  textColor?: string;
  iconBackground?: string;
};

/** Tarjeta con degradado, ícono en recuadro translúcido y sombra de color. */
export function GradientCard({
  title,
  subtitle,
  colors,
  shadowColor,
  icon,
  textColor = Palette.surface,
  iconBackground = 'rgba(255, 255, 255, 0.24)',
  ...rest
}: GradientCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.pressable, { shadowColor }, pressed && styles.pressed]}
      {...rest}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>{icon}</View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    borderRadius: 26,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  card: {
    height: 150,
    borderRadius: 26,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    gap: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    opacity: 0.92,
  },
});
