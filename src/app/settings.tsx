import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/components/app-text';
import { FloatingBackground } from '@/components/floating-background';
import { Palette } from '@/constants/palette';
import { authenticate, checkBiometric } from '@/services/biometric';
import { signOut } from '@/services/auth';
import { registerForPush, unregisterPush } from '@/services/notifications';
import { usePlayer } from '@/store/player';

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  children: ReactNode;
};

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={Palette.purple} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const settings = usePlayer((state) => state.settings);
  const setSettings = usePlayer((state) => state.setSettings);
  const setBiometricUnlocked = usePlayer((state) => state.setBiometricUnlocked);
  const displayName = usePlayer((state) => state.displayName);
  const uid = usePlayer((state) => state.uid);

  const toggleBiometric = async (value: boolean) => {
    if (!value) {
      setSettings({ biometric: false });
      return;
    }
    const status = await checkBiometric();
    if (!status.compatible || !status.enrolled) {
      Alert.alert(
        'Huella no disponible',
        'Este dispositivo no tiene huella o rostro configurado.',
      );
      return;
    }
    const ok = await authenticate('Activa el desbloqueo con huella');
    if (ok) {
      setSettings({ biometric: true });
      setBiometricUnlocked(true);
    } else {
      Alert.alert('No se pudo activar', 'La huella no coincidió. Inténtalo de nuevo.');
    }
  };

  const toggleNotifications = async (value: boolean) => {
    if (!value) {
      setSettings({ notifications: false });
      if (uid) {
        await unregisterPush(uid);
      }
      return;
    }
    if (!uid) {
      Alert.alert('Espera un momento', 'La sesión aún se está iniciando. Inténtalo de nuevo.');
      return;
    }
    const token = await registerForPush(uid);
    if (token) {
      setSettings({ notifications: true });
      Alert.alert(
        'Notificaciones activadas',
        'Te avisaremos cuando se confirme una compra y de las novedades del juego.',
      );
    } else {
      Alert.alert(
        'Permiso denegado',
        'Activa las notificaciones de TiltMaze en los ajustes del sistema para recibir avisos.',
      );
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      'Se creará un nuevo invitado y volverás a la pantalla de inicio. Perderás el progreso actual de este dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await signOut();
              // Vuelve al "login" (onboarding) con el invitado nuevo.
              router.replace('/onboarding');
            })();
          },
        },
      ],
    );
  };

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>CONFIGURACIÓN</Text>
          <Text style={styles.title}>Ajustes</Text>

          <View style={styles.section}>
            <SettingRow
              icon="finger-print-outline"
              label="Desbloqueo con huella"
              description="Pide tu huella al abrir la app">
              <Switch
                value={settings.biometric}
                onValueChange={(value) => void toggleBiometric(value)}
                trackColor={{ false: '#D9D5EA', true: Palette.purple }}
                thumbColor={Palette.surface}
              />
            </SettingRow>

            <SettingRow
              icon="notifications-outline"
              label="Notificaciones"
              description="Recibe avisos de tus compras y novedades">
              <Switch
                value={settings.notifications}
                onValueChange={(value) => void toggleNotifications(value)}
                trackColor={{ false: '#D9D5EA', true: Palette.purple }}
                thumbColor={Palette.surface}
              />
            </SettingRow>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/sensors')}
            style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
            <Ionicons name="speedometer-outline" size={18} color={Palette.purple} />
            <Text style={styles.linkText}>Prueba de sensores</Text>
            <Ionicons name="chevron-forward" size={16} color={Palette.muted} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={confirmSignOut}
            style={({ pressed }) => [styles.link, styles.linkDanger, pressed && styles.linkPressed]}>
            <Ionicons name="log-out-outline" size={18} color={Palette.shadowPink} />
            <Text style={[styles.linkText, styles.linkTextDanger]}>Cerrar sesión</Text>
          </Pressable>

          <Text style={styles.footer}>Jugando como {displayName ?? 'Invitado'}</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
    gap: 10,
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
    marginBottom: 10,
  },
  section: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Palette.surface,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Palette.shadowTeal,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.border,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.backgroundAlt,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: Palette.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  rowDescription: {
    color: Palette.muted,
    fontSize: 12.5,
    marginTop: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 440,
    backgroundColor: Palette.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
    shadowColor: Palette.shadowTeal,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  linkDanger: {
    shadowColor: Palette.shadowPink,
  },
  linkPressed: {
    opacity: 0.85,
  },
  linkText: {
    flex: 1,
    color: Palette.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  linkTextDanger: {
    color: Palette.shadowPink,
  },
  footer: {
    color: Palette.muted,
    fontSize: 12.5,
    marginTop: 18,
  },
});
