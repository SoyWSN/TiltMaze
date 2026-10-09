import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingBackground } from '@/components/floating-background';
import { Palette } from '@/constants/palette';
import { authenticate, checkBiometric } from '@/services/biometric';
import { usePlayer } from '@/store/player';

/**
 * Si el jugador activó el bloqueo biométrico, muestra una pantalla de
 * desbloqueo antes de revelar el contenido de la app.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const biometricEnabled = usePlayer((state) => state.settings.biometric);
  const unlocked = usePlayer((state) => state.biometricUnlocked);
  const setUnlocked = usePlayer((state) => state.setBiometricUnlocked);

  useEffect(() => {
    if (!biometricEnabled || unlocked) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const status = await checkBiometric();
      if (cancelled) {
        return;
      }
      if (!status.compatible || !status.enrolled) {
        // Sin huella disponible, no tiene sentido bloquear.
        setUnlocked(true);
        return;
      }
      const ok = await authenticate();
      if (!cancelled && ok) {
        setUnlocked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [biometricEnabled, unlocked, setUnlocked]);

  if (!biometricEnabled || unlocked) {
    return <>{children}</>;
  }

  const retry = () => {
    void (async () => {
      const ok = await authenticate();
      if (ok) {
        setUnlocked(true);
      }
    })();
  };

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <LinearGradient
            colors={Palette.cardPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badge}>
            <Ionicons name="finger-print" size={46} color={Palette.surface} />
          </LinearGradient>

          <Text style={styles.title}>TiltMaze está bloqueado</Text>
          <Text style={styles.subtitle}>Usa tu huella para continuar con tu progreso.</Text>

          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Ionicons name="finger-print" size={20} color={Palette.surface} />
            <Text style={styles.buttonText}>Desbloquear</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </FloatingBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    marginBottom: 14,
  },
  title: {
    color: Palette.navy,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.purple,
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
    marginTop: 20,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: Palette.surface,
    fontSize: 16,
    fontWeight: '800',
  },
});
