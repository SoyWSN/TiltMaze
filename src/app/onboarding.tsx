import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingBackground } from '@/components/floating-background';
import { Palette } from '@/constants/palette';
import { authenticate, checkBiometric } from '@/services/biometric';
import { usePlayer } from '@/store/player';

export default function OnboardingScreen() {
  const router = useRouter();
  const createProfile = usePlayer((state) => state.createProfile);
  const setSettings = usePlayer((state) => state.setSettings);

  const [name, setName] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(false);

  const handleStart = async () => {
    createProfile(name.trim() || 'Invitado');

    if (enableBiometric) {
      const status = await checkBiometric();
      if (status.compatible && status.enrolled) {
        const ok = await authenticate('Activa el desbloqueo con huella');
        if (ok) {
          setSettings({ biometric: true });
        }
      }
    }

    router.replace('/');
  };

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <View style={styles.content}>
            <LinearGradient
              colors={Palette.cardPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}>
              <View style={styles.badgeInner}>
                <View style={styles.badgeDot} />
              </View>
            </LinearGradient>

            <Text style={styles.eyebrow}>BIENVENIDO</Text>
            <Text style={styles.title}>TiltMaze</Text>
            <Text style={styles.subtitle}>¿Cómo te llamas?</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre (o Invitado)"
              placeholderTextColor={Palette.muted}
              maxLength={20}
              autoCapitalize="words"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={() => void handleStart()}
            />

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: enableBiometric }}
              onPress={() => setEnableBiometric((value) => !value)}
              style={styles.biometricRow}>
              <Ionicons
                name="finger-print-outline"
                size={20}
                color={Palette.purple}
              />
              <Text style={styles.biometricLabel}>Bloquear con huella al abrir</Text>
              <Ionicons
                name={enableBiometric ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={enableBiometric ? Palette.purple : Palette.line}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => void handleStart()}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
              <Text style={styles.buttonText}>Empezar a jugar</Text>
              <Ionicons name="arrow-forward" size={20} color={Palette.surface} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FloatingBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  badge: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    marginBottom: 12,
  },
  badgeInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 3.5,
    borderColor: Palette.surface,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Palette.cardYellow[0],
  },
  eyebrow: {
    color: Palette.periwinkle,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  title: {
    color: Palette.navy,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  input: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Palette.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    color: Palette.navy,
    fontWeight: '700',
    textAlign: 'center',
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 340,
    backgroundColor: Palette.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 12,
  },
  biometricLabel: {
    flex: 1,
    color: Palette.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.purple,
    borderRadius: 999,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginTop: 18,
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
