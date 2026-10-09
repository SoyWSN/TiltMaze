import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingBackground } from '@/components/floating-background';
import { Palette } from '@/constants/palette';
import { ballColorFor, ballImageFor } from '@/data/cosmetics';
import { useTilt } from '@/game/sensors';
import { usePlayer } from '@/store/player';

const BOX_SIZE = 240;
const DOT_SIZE = 30;
const SENSITIVITY_MIN = 0.5;
const SENSITIVITY_MAX = 2;
const SENSITIVITY_STEP = 0.25;

export default function SensorsScreen() {
  const { data, tilt, neutral, sensitivity, available, calibrate, setSensitivity } = useTilt();
  const ballColor = ballColorFor(usePlayer((state) => state.equipped.skinId));
  const ballImage = ballImageFor(usePlayer((state) => state.equipped.skinId));

  if (!available) {
    return (
      <FloatingBackground>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.title}>Sin acelerómetro</Text>
          <Text style={styles.muted}>
            Este dispositivo (o emulador) no reporta acelerómetro. Prueba en un teléfono físico.
          </Text>
        </SafeAreaView>
      </FloatingBackground>
    );
  }

  const range = BOX_SIZE / 2 - DOT_SIZE / 2;
  const dotLeft = BOX_SIZE / 2 + tilt.x * range - DOT_SIZE / 2;
  const dotTop = BOX_SIZE / 2 + tilt.y * range - DOT_SIZE / 2;

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.previewBox}>
            <View style={[styles.previewDot, { left: dotLeft, top: dotTop }]}>
              <View
                style={[
                  styles.previewDotFill,
                  { backgroundColor: ballImage ? 'transparent' : ballColor },
                ]}>
                {ballImage ? (
                  <Image source={ballImage} style={styles.ballImage} contentFit="cover" />
                ) : (
                  <View style={styles.previewShine} />
                )}
              </View>
            </View>
          </View>

          <Text style={styles.hint}>
            Inclina el teléfono: la bola sigue tu inclinación. Pulsa «Centrar» en tu postura de
            juego para calibrar el neutro.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acelerómetro (g) · cada 16 ms</Text>
            <Text style={styles.value}>
              x: {data?.x.toFixed(3) ?? '—'} y: {data?.y.toFixed(3) ?? '—'} z:{' '}
              {data?.z.toFixed(3) ?? '—'}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.cardTitle}>Inclinación calibrada</Text>
            <Text style={styles.value}>
              x: {tilt.x.toFixed(3)} y: {tilt.y.toFixed(3)}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.cardTitle}>Neutro capturado</Text>
            <Text style={styles.value}>
              x: {neutral.x.toFixed(3)} y: {neutral.y.toFixed(3)}
            </Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setSensitivity(Math.max(SENSITIVITY_MIN, sensitivity - SENSITIVITY_STEP))
              }
              style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}>
              <Ionicons name="remove" size={20} color={Palette.navy} />
            </Pressable>
            <View style={styles.sensitivityBox}>
              <Text style={styles.sensitivityLabel}>SENSIBILIDAD</Text>
              <Text style={styles.sensitivityValue}>{sensitivity.toFixed(2)}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setSensitivity(Math.min(SENSITIVITY_MAX, sensitivity + SENSITIVITY_STEP))
              }
              style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}>
              <Ionicons name="add" size={20} color={Palette.navy} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={calibrate}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <LinearGradient
              colors={Palette.cardPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientFill}
            />
            <Ionicons name="locate" size={18} color={Palette.surface} />
            <Text style={styles.primaryButtonText}>Centrar</Text>
          </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    color: Palette.navy,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 40,
  },
  muted: {
    color: Palette.muted,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  previewBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 28,
    backgroundColor: Palette.surface,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  previewDot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    shadowColor: '#E0A21B',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  previewDotFill: {
    flex: 1,
    borderRadius: DOT_SIZE / 2,
    overflow: 'hidden',
  },
  ballImage: {
    width: '100%',
    height: '100%',
  },
  previewShine: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  hint: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 360,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Palette.surface,
    borderRadius: 22,
    padding: 18,
    gap: 6,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardTitle: {
    color: Palette.navy,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  value: {
    color: Palette.text,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sensitivityBox: {
    minWidth: 130,
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sensitivityLabel: {
    color: Palette.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sensitivityValue: {
    color: Palette.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    minWidth: 180,
    borderRadius: 16,
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: Palette.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },
});
