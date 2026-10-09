import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text, AppTextInput as TextInput } from '@/components/app-text';
import { FloatingBackground } from '@/components/floating-background';
import { Palette, type GradientColors } from '@/constants/palette';
import { getCosmetic } from '@/data/cosmetics';
import { LEVELS } from '@/data/levels';
import { usePlayer } from '@/store/player';

const formatTime = (milliseconds: number) => {
  const centiseconds = Math.floor(milliseconds / 10) % 100;
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / 60000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

export default function ProfileScreen() {
  const displayName = usePlayer((state) => state.displayName);
  const setDisplayName = usePlayer((state) => state.setDisplayName);
  const unlockedLevels = usePlayer((state) => state.unlockedLevels);
  const bestScores = usePlayer((state) => state.bestScores);
  const ownedItems = usePlayer((state) => state.ownedItems);
  const equipped = usePlayer((state) => state.equipped);

  const [nameDraft, setNameDraft] = useState(displayName ?? '');

  const completedCount = Object.keys(bestScores).length;
  const equippedSkin = getCosmetic(equipped.skinId)?.name ?? equipped.skinId;
  const equippedTheme = getCosmetic(equipped.themeId)?.name ?? equipped.themeId;

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== displayName) {
      setDisplayName(trimmed);
    } else {
      setNameDraft(displayName ?? '');
    }
  };

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={Palette.cardYellow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}>
            <Ionicons name="person" size={42} color={Palette.navy} />
          </LinearGradient>

          <Text style={styles.eyebrow}>PERFIL</Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onBlur={saveName}
            onSubmitEditing={saveName}
            placeholder="Tu nombre"
            placeholderTextColor={Palette.muted}
            maxLength={20}
            autoCapitalize="words"
            style={styles.nameInput}
            returnKeyType="done"
          />

          <View style={styles.statsRow}>
            <StatCard value={String(completedCount)} label="Superados" color={Palette.cardPurple} shadow={Palette.shadowPurple} />
            <StatCard value={String(unlockedLevels)} label="Desbloqueados" color={Palette.cardTeal} shadow={Palette.shadowTeal} />
            <StatCard value={String(ownedItems.length)} label="Cosméticos" color={Palette.cardPink} shadow={Palette.shadowPink} />
          </View>

          <View style={styles.equippedCard}>
            <Ionicons name="color-palette-outline" size={20} color={Palette.purple} />
            <View style={styles.equippedText}>
              <Text style={styles.equippedTitle}>Equipado</Text>
              <Text style={styles.equippedValue}>
                Bola {equippedSkin} · Tablero {equippedTheme}
              </Text>
            </View>
          </View>

          <View style={styles.recordsCard}>
            <Text style={styles.recordsTitle}>Récords por nivel</Text>
            {LEVELS.map((level) => {
              const best = bestScores[String(level.id)];
              return (
                <View key={level.id} style={styles.recordRow}>
                  <Text style={styles.recordLevel}>
                    {level.id}. {level.name}
                  </Text>
                  <Text style={[styles.recordTime, best === undefined && styles.recordEmpty]}>
                    {best !== undefined ? formatTime(best) : '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </FloatingBackground>
  );
}

function StatCard({
  value,
  label,
  color,
  shadow,
}: {
  value: string;
  label: string;
  color: GradientColors;
  shadow: string;
}) {
  return (
    <LinearGradient
      colors={color}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.statCard, { shadowColor: shadow }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
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
    paddingTop: 24,
    paddingBottom: 40,
    gap: 10,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.shadowYellow,
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
  nameInput: {
    color: Palette.navy,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 160,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statsRow: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 2,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  statValue: {
    color: Palette.surface,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: Palette.surface,
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.92,
  },
  equippedCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Palette.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 6,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  equippedText: {
    flex: 1,
  },
  equippedTitle: {
    color: Palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  equippedValue: {
    color: Palette.navy,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  recordsCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Palette.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 6,
    shadowColor: Palette.shadowTeal,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  recordsTitle: {
    color: Palette.navy,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.border,
  },
  recordLevel: {
    color: Palette.text,
    fontSize: 13.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  recordTime: {
    color: Palette.navy,
    fontSize: 13.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  recordEmpty: {
    color: Palette.muted,
    fontWeight: '600',
  },
});
