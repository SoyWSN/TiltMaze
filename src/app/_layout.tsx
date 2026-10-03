import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { Palette } from '@/constants/palette';

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

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
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
        <Stack.Screen name="game" options={{ title: 'Jugar' }} />
        <Stack.Screen name="levels" options={{ title: 'Niveles' }} />
        <Stack.Screen name="sensors" options={{ title: 'Sensores' }} />
        <Stack.Screen name="cosmetics" options={{ title: 'Cosméticos' }} />
        <Stack.Screen name="settings" options={{ title: 'Configuración' }} />
        <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
      </Stack>
    </ThemeProvider>
  );
}
