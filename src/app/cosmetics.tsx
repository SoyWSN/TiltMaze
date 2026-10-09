import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { AppText as Text } from '@/components/app-text';
import { FloatingBackground } from '@/components/floating-background';
import { Palette } from '@/constants/palette';
import {
  COSMETICS,
  DEFAULT_BOARD_THEME,
  ballColorFor,
  getCosmetic,
  priceLabel,
  type Cosmetic,
} from '@/data/cosmetics';
import { createPurchase } from '@/services/purchases';
import { usePlayer } from '@/store/player';

const SKINS = COSMETICS.filter((item) => item.type === 'skin');
const THEMES = COSMETICS.filter((item) => item.type === 'theme');

/** Añade el `client_reference_id` (id de la compra) al Payment Link. */
function buildPaymentUrl(base: string, clientReferenceId: string): string {
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}client_reference_id=${encodeURIComponent(clientReferenceId)}`;
}

function BallSwatch({
  cosmetic,
  owned,
  equipped,
  onPress,
}: {
  cosmetic: Cosmetic;
  owned: boolean;
  equipped: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.swatch, pressed && styles.pressed]}>
      <View style={[styles.swatchRing, equipped && styles.swatchRingActive]}>
        <View
          style={[
            styles.swatchBall,
            { backgroundColor: cosmetic.image ? 'transparent' : cosmetic.previewColor },
          ]}>
          {cosmetic.image ? (
            <Image source={cosmetic.image} style={styles.ballImage} contentFit="cover" />
          ) : (
            <View style={styles.ballShine} />
          )}
        </View>
        {equipped && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={12} color={Palette.surface} />
          </View>
        )}
        {!owned && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={11} color={Palette.surface} />
          </View>
        )}
      </View>
      <Text style={styles.swatchName} numberOfLines={1}>
        {cosmetic.name}
      </Text>
      <Text style={[styles.swatchMeta, owned ? styles.swatchMetaOwned : styles.swatchMetaPrice]}>
        {owned ? (equipped ? 'En uso' : 'Gratis') : priceLabel(cosmetic)}
      </Text>
    </Pressable>
  );
}

function ThemeCard({
  cosmetic,
  owned,
  equipped,
  onPress,
}: {
  cosmetic: Cosmetic;
  owned: boolean;
  equipped: boolean;
  onPress: () => void;
}) {
  const theme = cosmetic.boardTheme ?? DEFAULT_BOARD_THEME;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.themeCard, equipped && styles.themeCardActive, pressed && styles.pressed]}>
      <View style={[styles.themePreview, { backgroundColor: theme.board }]}>
        <View style={[styles.themeWall, { backgroundColor: theme.wall }]} />
        <View style={[styles.themeGoal, { backgroundColor: theme.goal }]} />
      </View>
      <View style={styles.themeInfo}>
        <Text style={styles.themeName}>{cosmetic.name}</Text>
        <Text style={styles.themeMeta}>
          {equipped ? 'En uso' : owned ? 'Toca para equipar' : priceLabel(cosmetic)}
        </Text>
      </View>
      {equipped ? (
        <Ionicons name="checkmark-circle" size={22} color={Palette.purple} />
      ) : owned ? (
        <Ionicons name="chevron-forward" size={18} color={Palette.muted} />
      ) : (
        <Ionicons name="lock-closed" size={18} color={Palette.muted} />
      )}
    </Pressable>
  );
}

export default function CosmeticsScreen() {
  const ownedItems = usePlayer((state) => state.ownedItems);
  const equipped = usePlayer((state) => state.equipped);
  const equip = usePlayer((state) => state.equip);
  const uid = usePlayer((state) => state.uid);
  const [notice, setNotice] = useState<string | null>(null);

  const equippedSkin = getCosmetic(equipped.skinId);
  const equippedTheme = getCosmetic(equipped.themeId);

  const handleBuy = async (cosmetic: Cosmetic) => {
    if (!cosmetic.paymentLinkUrl || cosmetic.paymentLinkUrl.includes('REPLACE_ME')) {
      setNotice(`El pago de «${cosmetic.name}» aún no está configurado en Stripe.`);
      return;
    }
    if (!uid) {
      setNotice('Aún no hay sesión. Espera un momento e inténtalo de nuevo.');
      return;
    }
    setNotice(`Abriendo el pago de «${cosmetic.name}» (${priceLabel(cosmetic)})…`);
    try {
      const purchaseId = await createPurchase(uid, cosmetic.id, cosmetic.priceMXN);
      const url = buildPaymentUrl(cosmetic.paymentLinkUrl, purchaseId);
      // `createTask: false` abre el navegador en la MISMA tarea que la app, así al
      // cerrarlo (la X) se vuelve a TiltMaze en vez de salir al inicio del teléfono.
      await WebBrowser.openBrowserAsync(url, { createTask: false });
      setNotice('Completa el pago en el navegador y el cosmético se desbloqueará solo.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('handleBuy error:', message);
      setNotice(`No se pudo abrir el pago: ${message}`);
    }
  };

  const onSkinPress = (cosmetic: Cosmetic) => {
    if (!ownedItems.includes(cosmetic.id)) {
      void handleBuy(cosmetic);
      return;
    }
    setNotice(null);
    equip({ skinId: cosmetic.id });
  };

  const onThemePress = (cosmetic: Cosmetic) => {
    if (!ownedItems.includes(cosmetic.id)) {
      void handleBuy(cosmetic);
      return;
    }
    setNotice(null);
    equip({ themeId: cosmetic.id });
  };

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>COSMÉTICOS</Text>
          <Text style={styles.title}>Personaliza tu bola</Text>

          <View style={styles.previewCard}>
            <View
              style={[
                styles.previewBall,
                {
                  backgroundColor: equippedSkin?.image
                    ? 'transparent'
                    : ballColorFor(equipped.skinId),
                },
              ]}>
              {equippedSkin?.image ? (
                <Image source={equippedSkin.image} style={styles.ballImage} contentFit="cover" />
              ) : (
                <View style={styles.ballShine} />
              )}
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewLabel}>EN USO</Text>
              <Text style={styles.previewName}>{equippedSkin?.name ?? 'Roja'}</Text>
              <Text style={styles.previewTheme}>Tablero: {equippedTheme?.name ?? 'Madera'}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pelotas</Text>
            <Text style={styles.sectionHint}>Toca una para equiparla</Text>
          </View>
          <View style={styles.swatchGrid}>
            {SKINS.map((cosmetic) => (
              <BallSwatch
                key={cosmetic.id}
                cosmetic={cosmetic}
                owned={ownedItems.includes(cosmetic.id)}
                equipped={equipped.skinId === cosmetic.id}
                onPress={() => onSkinPress(cosmetic)}
              />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tableros</Text>
            <Text style={styles.sectionHint}>Cambia el escenario</Text>
          </View>
          <View style={styles.themeList}>
            {THEMES.map((cosmetic) => (
              <ThemeCard
                key={cosmetic.id}
                cosmetic={cosmetic}
                owned={ownedItems.includes(cosmetic.id)}
                equipped={equipped.themeId === cosmetic.id}
                onPress={() => onThemePress(cosmetic)}
              />
            ))}
          </View>

          {notice && (
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={16} color={Palette.purple} />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          )}
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
    paddingTop: 14,
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
    textAlign: 'center',
  },
  previewCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Palette.surface,
    borderRadius: 22,
    padding: 18,
    marginTop: 4,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  previewBall: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    shadowColor: '#E0A21B',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  ballShine: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  ballImage: {
    width: '100%',
    height: '100%',
  },
  previewInfo: {
    flex: 1,
  },
  previewLabel: {
    color: Palette.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  previewName: {
    color: Palette.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  previewTheme: {
    color: Palette.muted,
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sectionTitle: {
    color: Palette.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHint: {
    flexShrink: 1,
    color: Palette.muted,
    fontSize: 12,
    textAlign: 'right',
    marginLeft: 10,
  },
  swatchGrid: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  swatch: {
    width: 70,
    alignItems: 'center',
    gap: 4,
  },
  swatchRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 2,
    borderColor: Palette.border,
    shadowColor: '#6B5CA5',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  swatchRingActive: {
    borderColor: Palette.purple,
    borderWidth: 3,
  },
  swatchBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purple,
    borderWidth: 2,
    borderColor: Palette.surface,
  },
  lockBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.muted,
    borderWidth: 2,
    borderColor: Palette.surface,
  },
  swatchName: {
    color: Palette.navy,
    fontSize: 12.5,
    fontWeight: '700',
  },
  swatchMeta: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  swatchMetaOwned: {
    color: Palette.purple,
  },
  swatchMetaPrice: {
    color: Palette.muted,
  },
  themeList: {
    width: '100%',
    maxWidth: 440,
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#6B5CA5',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  themeCardActive: {
    borderColor: Palette.purple,
  },
  themePreview: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeWall: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  themeGoal: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    color: Palette.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  themeMeta: {
    color: Palette.muted,
    fontSize: 12.5,
    marginTop: 1,
  },
  packCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F1ECFF',
    borderRadius: 20,
    padding: 14,
    marginTop: 10,
  },
  packIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purple,
  },
  packName: {
    color: Palette.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  packPrice: {
    color: Palette.purple,
    fontSize: 15,
    fontWeight: '800',
  },
  noticeBox: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 4,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  noticeText: {
    flex: 1,
    color: Palette.text,
    fontSize: 12.5,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.85,
  },
});
