import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingBackground } from '@/components/floating-background';
import { Palette, type GradientColors } from '@/constants/palette';

type ComingSoonProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: GradientColors;
  shadowColor: string;
  iconColor?: string;
  availableOn: string;
  children?: ReactNode;
};

/** Pantalla provisional con el mismo estilo, para funciones de días posteriores. */
export function ComingSoon({
  eyebrow,
  title,
  description,
  icon,
  colors,
  shadowColor,
  iconColor = Palette.surface,
  availableOn,
  children,
}: ComingSoonProps) {
  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconBadge, { shadowColor }]}>
            <Ionicons name={icon} size={34} color={iconColor} />
          </LinearGradient>

          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.pill}>
            <Ionicons name="construct-outline" size={15} color={Palette.purple} />
            <Text style={styles.pillText}>Disponible el {availableOn}</Text>
          </View>

          {children}
        </ScrollView>
      </SafeAreaView>
    </FloatingBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 10,
  },
  iconBadge: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    marginBottom: 8,
  },
  eyebrow: {
    color: Palette.periwinkle,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: Palette.navy,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: Palette.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Palette.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 8,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pillText: {
    color: Palette.purple,
    fontSize: 13,
    fontWeight: '700',
  },
});
