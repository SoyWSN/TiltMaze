import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ComingSoon } from '@/components/coming-soon';
import { Palette } from '@/constants/palette';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ComingSoon
      eyebrow="CONFIGURACIÓN"
      title="Configuración"
      description="Aquí activarás el desbloqueo con huella dactilar, el sonido y la sensibilidad de los controles."
      icon="settings-outline"
      colors={Palette.cardTeal}
      shadowColor={Palette.shadowTeal}
      availableOn="día 4">
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/sensors')}
        style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
        <Ionicons name="speedometer-outline" size={18} color={Palette.purple} />
        <Text style={styles.linkText}>Prueba de sensores</Text>
        <Ionicons name="chevron-forward" size={16} color={Palette.muted} />
      </Pressable>
    </ComingSoon>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 18,
    minWidth: 260,
    shadowColor: Palette.shadowTeal,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
});
