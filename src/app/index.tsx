import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceLine } from '@/components/balance-line';
import { FloatingBackground } from '@/components/floating-background';
import { GradientCard } from '@/components/gradient-card';
import { Palette } from '@/constants/palette';
import { usePlayer } from '@/store/player';

export default function HomeScreen() {
  const router = useRouter();
  const displayName = usePlayer((state) => state.displayName);
  const unlockedLevels = usePlayer((state) => state.unlockedLevels);
  const profileSubtitle = displayName
    ? `${displayName} · Nivel ${unlockedLevels}`
    : `Invitado · Nivel ${unlockedLevels}`;

  if (displayName === null) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={Palette.cardPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}>
              <View style={styles.logoInner}>
                <View style={styles.logoDot} />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.eyebrow}>AVENTURA EN MOVIMIENTO</Text>
          <Text style={styles.title}>
            <Text style={styles.titleDark}>Tilt</Text>
            <Text style={styles.titlePurple}>Maze</Text>
          </Text>
          <Text style={styles.subtitle}>Inclina. Rueda. ¡Llega a la meta!</Text>

          <BalanceLine />

          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <GradientCard
                title="Jugar nivel"
                subtitle="Elige tu laberinto"
                colors={Palette.cardPurple}
                shadowColor={Palette.shadowPurple}
                icon={<Ionicons name="play" size={26} color={Palette.surface} />}
                onPress={() => router.push('/levels')}
              />
              <GradientCard
                title="Cosméticos"
                subtitle="Personaliza tu bola"
                colors={Palette.cardPink}
                shadowColor={Palette.shadowPink}
                icon={<Ionicons name="color-palette" size={24} color={Palette.surface} />}
                onPress={() => router.push('/cosmetics')}
              />
            </View>
            <View style={styles.gridRow}>
              <GradientCard
                title="Configuración"
                subtitle="Sonido y control"
                colors={Palette.cardTeal}
                shadowColor={Palette.shadowTeal}
                icon={<Ionicons name="settings-outline" size={25} color={Palette.surface} />}
                onPress={() => router.push('/settings')}
              />
              <GradientCard
                title="Perfil"
                subtitle={profileSubtitle}
                colors={Palette.cardYellow}
                shadowColor={Palette.shadowYellow}
                textColor={Palette.navy}
                iconBackground="rgba(255, 255, 255, 0.42)"
                icon={<Ionicons name="person-outline" size={25} color={Palette.navy} />}
                onPress={() => router.push('/profile')}
              />
            </View>
          </View>

          <Text style={styles.footer}>Mueve tu teléfono con suavidad y domina el laberinto.</Text>
        </ScrollView>
      </SafeAreaView>
    </FloatingBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 4,
  },
  logoWrap: {
    marginBottom: 14,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  logoBadge: {
    width: 86,
    height: 86,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 3.5,
    borderColor: Palette.surface,
    position: 'relative',
  },
  logoDot: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.cardYellow[0],
  },
  eyebrow: {
    color: Palette.periwinkle,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 2,
  },
  titleDark: {
    color: Palette.navy,
  },
  titlePurple: {
    color: Palette.purple,
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  grid: {
    width: '100%',
    maxWidth: 440,
    gap: 14,
    marginTop: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 14,
  },
  footer: {
    color: Palette.muted,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 10,
  },
});
