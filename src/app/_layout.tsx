import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FloatingBackground } from '@/components/floating-background';
import { LockGate } from '@/components/lock-gate';
import { NotificationBanner } from '@/components/notification-banner';
import { Palette } from '@/constants/palette';
import { useBootstrap } from '@/hooks/use-bootstrap';
import { registerBackgroundHandler } from '@/services/notifications';
import { usePlayer } from '@/store/player';

// Handler de mensajes FCM con la app en segundo plano/cerrada. Debe registrarse
// lo antes posible, por eso va en el ámbito del módulo (no dentro de un efecto).
registerBackgroundHandler();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Palette.background,
    card: Palette.background,
    text: Palette.navy,
    primary: Palette.purple,
    border: 'transparent',
  },
};

function LoadingScreen() {
  return (
    <FloatingBackground>
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Palette.purple} />
        <Text style={styles.loadingText}>Cargando…</Text>
      </View>
    </FloatingBackground>
  );
}

export default function RootLayout() {
  useBootstrap();
  const status = usePlayer((state) => state.status);

  if (status !== 'ready') {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <LockGate>
        <Stack
          screenOptions={{
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: Palette.background },
            headerTintColor: Palette.navy,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: Palette.background },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen name="game" options={{ title: 'Jugar' }} />
          <Stack.Screen name="levels" options={{ title: 'Niveles' }} />
          <Stack.Screen name="sensors" options={{ title: 'Sensores' }} />
          <Stack.Screen name="cosmetics" options={{ title: 'Cosméticos' }} />
          <Stack.Screen name="settings" options={{ title: 'Configuración' }} />
          <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
        </Stack>
      </LockGate>
      <NotificationBanner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    color: Palette.muted,
    fontSize: 15,
    fontWeight: '600',
  },
});
