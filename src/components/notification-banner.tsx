/**
 * Banner que muestra en primer plano las notificaciones FCM (FCM no las muestra
 * solo cuando la app está abierta). Tocar el banner abre la pantalla indicada
 * en `navigationId`; la "x" lo cierra antes del auto-cierre del store.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText as Text } from '@/components/app-text';
import { Palette } from '@/constants/palette';
import { useNotifications } from '@/store/notifications';

export function NotificationBanner() {
  const banner = useNotifications((state) => state.banner);
  const dismiss = useNotifications((state) => state.dismiss);
  const insets = useSafeAreaInsets();

  if (!banner) {
    return null;
  }

  const onPress = () => {
    dismiss();
    if (banner.navigationId === 'cosmetics') {
      router.push('/cosmetics');
    }
  };

  return (
    <View style={[styles.wrap, { top: insets.top + 8 }]} pointerEvents="box-none">
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name="notifications" size={18} color={Palette.surface} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {banner.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {banner.body}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={dismiss} hitSlop={12} style={styles.close}>
          <Ionicons name="close" size={18} color={Palette.muted} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 440,
    backgroundColor: Palette.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purple,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: Palette.navy,
    fontSize: 14.5,
    fontWeight: '800',
  },
  body: {
    color: Palette.muted,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 1,
  },
  close: {
    padding: 2,
  },
});
