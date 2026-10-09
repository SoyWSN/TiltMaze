# TiltMaze — contexto del proyecto (para agentes)

Juego de laberinto para móvil (**Expo SDK 57 / React Native 0.86 / TypeScript**) controlado con la **inclinación del teléfono**. Prototipo de la materia *Desarrollo de Dispositivos Inteligentes*; no se publica en tiendas.

## Lee esto primero
- [`README.md`](README.md) — qué es, estado actual, estructura y cómo extenderlo.
- [`docs/SETUP.md`](docs/SETUP.md) — checklist manual de Firebase y Stripe.
- [`docs/STRIPE.md`](docs/STRIPE.md) — runbook de Stripe (crear cuenta/links, webhook local con el emulador + Stripe CLI).
- [`docs/PUSH.md`](docs/PUSH.md) — runbook de notificaciones push FCM (token, pruebas, push de compra).
- [`../PLAN.md`](../PLAN.md) — plan general por días (fuera de `TiltMaze/`).

## Objetivo y estado

**Requisitos del proyecto:** sensores del teléfono, base de datos (Firebase), compras (Stripe), notificaciones push y biometría (huella).

**Implementado y probado en teléfono (dev build de EAS):**
- Juego jugable con **10 niveles** (mapas ASCII), física propia, render con **Skia**.
- Control por **acelerómetro** con calibración y sensibilidad (`src/game/sensors.ts` → `useTilt`).
- **Pantalla de niveles** con desbloqueo progresivo y mejores tiempos (`src/app/levels.tsx`).
- **Cosméticos** equipables: 7 pelotas de color gratis + **3 pelotas premium con imagen** (Fuego/Galaxia/Emoji) + temas de tablero, con premium bloqueado tras Stripe (`src/data/cosmetics.ts`, `src/app/cosmetics.tsx`).
- Sistema de diseño pastel (fondo animado, tarjetas con degradado) en **todas** las pantallas.
- **Firebase (día 4):** auth anónimo + Firestore, persistencia del progreso, onboarding, bloqueo con huella y Configuración/Perfil reales (`src/services/*`, `src/hooks/use-bootstrap.ts`).
- **Stripe (día 5):** pago con Payment Link + webhook en Cloud Function (emulador local) que marca la compra `paid` y **desbloquea el cosmético en vivo**. Probado de extremo a extremo en modo test (`functions/index.js`, `docs/STRIPE.md`).
- **Push FCM (día 6):** permiso + token guardado en `users/{uid}.fcmToken`, listeners (primer plano → banner in-app; segundo plano/cerrada → notificación del sistema), toggle en Configuración y **push “¡Gracias por tu compra!”** disparado por el webhook al pagar (`src/services/notifications.ts`, `functions/index.js`, `docs/PUSH.md`). Probado de extremo a extremo en teléfono.

**Pendiente:**
- **Pulido y demo** (día 7).
- Extras opcionales: fuente redondeada, ranking.

## Arquitectura

```
src/
  app/            rutas Expo Router: _layout, index, levels, game, cosmetics, sensors, settings, profile, onboarding
  assets/balls/   PNG de las pelotas premium (ball-fuego, ball-galaxia, ball-emoji)
  components/     floating-background, gradient-card, balance-line, coming-soon, lock-gate, notification-banner, themed-*
  constants/      palette.ts (colores del mockup), theme.ts (tema base del template)
  data/
    cosmetics.ts  catálogo (gratis + premium + imágenes), precios MXN, helpers ballColorFor/ballImageFor/boardThemeFor
    levels/       types.ts (createLevel/getTile), level-1..10.ts, index.ts (registro LEVELS)
  game/
    sensors.ts    useTilt(): acelerómetro → inclinación calibrada
    engine.ts     stepBall(): gravedad, fricción, colisiones, hoyos, meta
  hooks/
    use-bootstrap.ts  arranque: auth → hidratar Firestore → activar persistencia → escuchar compras → listeners FCM
  services/       auth.ts, firestore.ts, biometric.ts, persistence.ts, purchases.ts, notifications.ts
  store/          player.ts (perfil, récords, desbloqueo, cosméticos), notifications.ts (banner push)
functions/        webhook de Stripe + push de compra (Cloud Function v2) — ver docs/STRIPE.md y docs/PUSH.md
```

Puntos de entrada clave:
- `usePlayer` (zustand) es la **fuente de verdad** del estado del jugador; se **persiste en Firestore** vía `src/services/persistence.ts` (lo hidrata `use-bootstrap`).
- `LEVELS` / `getLevel` / `getNextLevel` (`src/data/levels/index.ts`) — registro de niveles.
- `Palette` (`src/constants/palette.ts`) — todos los colores de la UI.
- `COSMETICS` / `ballColorFor` / `ballImageFor` (`src/data/cosmetics.ts`) — catálogo y helpers de pintado.

## Convenciones y decisiones

- **Rutas en `src/app/`** (Expo Router). Navegación con `Link`, `router`, `useLocalSearchParams`.
- El juego recibe el nivel por query param: `/game?level=N`. Cambiar de nivel **remonta** `GameBoard` vía `key={level.id}` (no usar efectos para resetear).
- **Física en unidades de casilla** (independiente de píxeles). Bola radio `0.2` casillas; hoyo `0.31`.
- **Convención de inclinación** (`useTilt`): `x` negativo = izquierda; `y` positivo = abajo en pantalla. El motor aplica la gravedad en consecuencia. No invertir sin tocar ambos.
- **Tema claro forzado** (`app.json` → `userInterfaceStyle: "light"`).
- **Precios en MXN.** Pelotas $10 MXN y tableros $20 MXN (ya cumplen el mínimo real de $10 MXN de Stripe). No hay pack.
- **Pelotas premium con imagen:** un cosmético `skin` puede traer `image` (PNG). En la UI se pinta con **`expo-image`** (`contentFit="cover"`, recortada a círculo por el contenedor); en el juego se pinta con **Skia** (`useImage` + `Group` con `clip`). Ver el gotcha de RN `Image`.
- **Notificaciones push (FCM):** el token vive en `users/{uid}.fcmToken` (fuera del store zustand; se guarda con `saveFcmToken`/`clearFcmToken`). `settings.notifications` decide si se registra. En primer plano la app pinta un banner propio (`src/store/notifications.ts` + `notification-banner.tsx`); en segundo plano lo muestra el sistema. El push de compra lo manda `functions/index.js` al confirmarse el pago.
- Catálogo de niveles y cosméticos son **datos estáticos** en la app (no Firestore). Firestore guarda perfil/progreso/compras.

## Gotchas (importante)

- **Íconos:** importar siempre por subpath — `import Ionicons from '@expo/vector-icons/Ionicons'`. El barrel `import { Ionicons } from '@expo/vector-icons'` carga **todos** los sets y rompe el bundle (`Unable to resolve "./Zocial"`) además de inflar la app.
- **Lint de React (React Compiler):** no llamar `setState` ni `Date.now()`/`Animated` impuros directamente en un efecto o en render; usa `useRef`, remount con `key`, o maneja estado por eventos. Reglas activas: `react-hooks/set-state-in-effect`, `react-hooks/purity`.
- **`StyleSheet.absoluteFillObject` no existe** en RN 0.86 (tipos); usa `StyleSheet.absoluteFill` o `position:'absolute'` + `top/right/bottom/left: 0`.
- **Imágenes raster en la UI: usa `expo-image`, NO el `Image` de `react-native`.** En RN 0.86 (New Architecture) el `Image` de react-native renderiza mal (react-native#48790): ignora el tamaño y dibuja la imagen a escala natural anclada arriba-izquierda (parece "en blanco"). `expo-image` (ya instalado) lo evita; dale `contentFit="cover"` y `width/height: '100%'`. En el juego se usa el `Image` de **Skia**, que no tiene ese problema.
- **Reglas de Firestore: `request.resource.data.uid`** (no `request.data.uid`) para validar al dueño al **crear** un doc. `resource.data.uid` para leer. Ver `docs/SETUP.md`.
- **Emulador de Functions:** arráncalo con `--project tiltmaze-726ca` (o ten `.firebaserc`), si no arranca como `demo-no-project` y todas las rutas responden **404**. Define además `FUNCTIONS_DISCOVERY_TIMEOUT=120` porque el primer arranque del worker puede tardar >30 s (Windows/antivirus). Detalles en `docs/STRIPE.md`.
- **`firebase-functions` v6 solo exporta la API v2**: usa `require('firebase-functions/v2/https').onRequest` — `functions.https.onRequest` (v1) ya no existe y la función no carga.
- **`@react-native-firebase/messaging` es un módulo nativo → exige dev build nueva.** Tras instalarlo, Expo Go crashea con "native module not found"; hay que regenerar el build (EAS) antes de probar.
- **Permiso de notificaciones Android 13+**: hay que pedir `POST_NOTIFICATIONS` en runtime con `PermissionsAndroid` (ya en `src/services/notifications.ts`). En Android ≤12 se concede al instalar. `requestPermission`/`AuthorizationStatus` de FCM están **deprecados** en Android; se usan solo en iOS.
- **`setBackgroundMessageHandler` debe registrarse temprano**, fuera de un efecto: está en el ámbito del módulo de `src/app/_layout.tsx`.
- **FCM no muestra nada con la app en primer plano**: `onMessage` entrega el mensaje y la app decide (aquí, `notification-banner`). Si está en segundo plano/cerrada y el mensaje trae `notification`, el sistema la muestra solo.
- **Los valores de `data` de FCM llegan siempre como texto** (strings); no asumas números/objetos (ver `showBannerFromMessage`).
- **`WebBrowser.openBrowserAsync` en Android: usa `{ createTask: false }`.** Por defecto (`createTask: true`) el navegador abre en una **tarea separada** y, al cerrarlo con la X, Android te saca al inicio del teléfono en vez de volver a la app. Con `createTask: false` vive en la misma tarea y la X regresa a TiltMaze (ver `src/app/cosmetics.tsx`).
- **ScrollView en contenedor centrado:** darle `style={{ width: '100%' }}`; si no, se encoge al contenido y se corta a la derecha.
- **Expo Go** sirve para Skia, sensores, degradados e íconos. **Firebase/FCM y FaceID en iOS** requieren **dev build** (`npx expo run:android` o EAS).
- **`@react-native-firebase` v26 usa API modular** (estilo firebase-js-sdk v9+): importa funciones nombradas (`getAuth`, `signInAnonymously(auth)`, `signOut(auth)`, `onAuthStateChanged(auth, cb)`; `getFirestore`, `doc`, `getDoc`, `setDoc`) — **no** hay export default ni `FirebaseAuthTypes`. Además `DocumentSnapshot.exists()` y `.data()` son **métodos** (llámalos con paréntesis).
- Los sensores **solo** se prueban en teléfono físico.

## Cómo extender

- **Nuevo nivel:** crea `src/data/levels/level-N.ts` con `createLevel({ id, name, rows })` y regístralo en `src/data/levels/index.ts`. Reglas del mapa: rectangular, borde `#`, un solo `S` y `G`, y camino S→G **sin hoyos** (validable con BFS). Ver `README.md`.
- **Nuevo cosmético:** edita `src/data/cosmetics.ts` (`priceMXN: 0` = gratis). Ver `README.md`.
- **Imagen en una pelota:** suelta el PNG (256×256, fondo transparente) en `src/assets/balls/` y añade `image: require('../assets/balls/mi-pelota.png')` al cosmético en `src/data/cosmetics.ts`. Se recorta a círculo sola en UI y juego.
- **Mandar un push desde el servidor:** `admin.messaging().send({ token, notification, data })` (ver `sendPurchasePush` en `functions/index.js`). Para que el tap navegue, manda `data: { navigationId: 'cosmetics' }` (u otro id).
- **Nueva pantalla destino de un push:** añade el `navigationId` en `showBannerFromMessage` y `watchNotificationOpens` de `src/hooks/use-bootstrap.ts`.

## Comandos

```bash
npx expo install <pkg>   # usar SIEMPRE esto (no npm add) para versiones compatibles con el SDK
npx expo start           # servidor de desarrollo (--clear para limpiar caché de Metro)
npx tsc --noEmit         # typecheck
npx expo lint            # lint
npx expo-doctor          # diagnóstico de dependencias y config
```

**Antes de dar una tarea por terminada:** corre `npx tsc --noEmit` y `npx expo lint`.

---

# Convenciones de Expo (del template)

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json` (currently **~57.0.26**).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
