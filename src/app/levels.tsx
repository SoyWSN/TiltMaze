import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/components/app-text';
import { FloatingBackground } from '@/components/floating-background';
import { Palette } from '@/constants/palette';
import { LEVELS } from '@/data/levels';
import { usePlayer } from '@/store/player';

const formatTime = (milliseconds: number) => {
  const centiseconds = Math.floor(milliseconds / 10) % 100;
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / 60000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

const CARD_LOOKS = [
  { colors: Palette.cardPurple, shadow: Palette.shadowPurple, text: Palette.surface },
  { colors: Palette.cardPink, shadow: Palette.shadowPink, text: Palette.surface },
  { colors: Palette.cardTeal, shadow: Palette.shadowTeal, text: Palette.surface },
  { colors: Palette.cardYellow, shadow: Palette.shadowYellow, text: Palette.navy },
];

export default function LevelsScreen() {
  const router = useRouter();
  const unlockedLevels = usePlayer((state) => state.unlockedLevels);
  const bestScores = usePlayer((state) => state.bestScores);

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>SELECCIONA</Text>
          <Text style={styles.title}>Elige un nivel</Text>
          <Text style={styles.subtitle}>Completa un nivel para desbloquear el siguiente.</Text>

          <View style={styles.grid}>
            {LEVELS.map((level) => {
              const unlocked = level.id <= unlockedLevels;
              const best = bestScores[String(level.id)];

              if (!unlocked) {
                return (
                  <View key={level.id} style={[styles.card, styles.cardLocked]}>
                    <View style={styles.cardInner}>
                      <View style={styles.cardTop}>
                        <Ionicons name="lock-closed" size={30} color="#9AA0AE" />
                      </View>
                      <View>
                        <Text style={[styles.levelName, styles.textLocked]} numberOfLines={1}>
                          Nivel {level.id}
                        </Text>
                        <Text style={[styles.levelTime, styles.textLocked]}>Bloqueado</Text>
                      </View>
                    </View>
                  </View>
                );
              }

              const look = CARD_LOOKS[(level.id - 1) % CARD_LOOKS.length];
              return (
                <Pressable
                  key={level.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({ pathname: '/game', params: { level: String(level.id) } })
                  }
                  style={({ pressed }) => [
                    styles.card,
                    { shadowColor: look.shadow },
                    pressed && styles.pressed,
                  ]}>
                  <LinearGradient
                    colors={look.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardInner}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.number, { color: look.text }]}>{level.id}</Text>
                      {best !== undefined && (
                        <View style={styles.doneBadge}>
                          <Ionicons name="checkmark" size={13} color={Palette.surface} />
                        </View>
                      )}
                    </View>
                    <View>
                      <Text
                        style={[styles.levelName, { color: look.text }]}
                        numberOfLines={1}>
                        {level.name}
                      </Text>
                      <Text style={[styles.levelTime, { color: look.text }]}>
                        {best !== undefined ? formatTime(best) : 'Sin completar'}
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.footer}>
            {unlockedLevels} de {LEVELS.length} niveles desbloqueados
          </Text>
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
    paddingTop: 16,
    paddingBottom: 36,
    gap: 12,
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
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 320,
  },
  grid: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginTop: 6,
  },
  card: {
    width: '47%',
    borderRadius: 24,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardLocked: {
    backgroundColor: '#E4E2EC',
    elevation: 0,
    shadowOpacity: 0,
  },
  cardInner: {
    height: 138,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  number: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  doneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  levelName: {
    fontSize: 15,
    fontWeight: '800',
  },
  levelTime: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.9,
    marginTop: 1,
  },
  textLocked: {
    color: '#9AA0AE',
  },
  footer: {
    color: Palette.muted,
    fontSize: 12.5,
    marginTop: 18,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
