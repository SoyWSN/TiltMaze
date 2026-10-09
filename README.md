# TiltMaze 🎯

Juego de laberinto para móvil (**React Native + Expo**) controlado con la **inclinación del teléfono**: guía la bola hasta la meta esquivando los hoyos, desbloquea niveles y personaliza tu bola con cosméticos.

> Proyecto de la materia *Desarrollo de Dispositivos Inteligentes*. Es un **prototipo**: no se publica en tiendas.

---

## Estado actual

### ✅ Implementado
- **Juego jugable con 5 niveles** dibujados a mano (tiles ASCII): *Primeros pasos, Campo minado, Encrucijada, Riesgo alto, Serpiente*.
- **Control por acelerómetro** con **calibración** ("Centrar") y ajuste de **sensibilidad**.
- **Física propia** en unidades de casilla: gravedad según inclinación, fricción, choques círculo-muro, hoyos (vuelven al inicio) y meta.
- **Render con Skia** (@shopify/react-native-skia) a 60 fps.
- **Pantalla de niveles** con cuadrícula: número grande, nombre, mejor tiempo, **desbloqueo progresivo** y niveles bloqueados en gris.
- **Overlay de victoria** con animación *pop*, tiempo y botones **Repetir / Siguiente** (el "Siguiente" desaparece en el último nivel).
- **Cosméticos**: 7 pelotas de color **gratis** + **3 pelotas premium con imagen** (Fuego, Galaxia, Emoji) equipables, temas de tablero (Madera gratis, Bamboo/Neón premium) y candados con precio para lo premium. El cosmético equipado se aplica **al juego y a la pantalla de sensores**.
- **Sistema de diseño** acorde a un mockup: fondo pastel animado, tarjetas con degradado y sombra de color, tipografía bicolor.
- **Firebase (día 4):** auth anónimo + Firestore, **persistencia real** del progreso (récords, desbloqueos, cosméticos), **bloqueo con huella**, **onboarding** (nombre + huella) y pantallas reales de **Configuración** y **Perfil**. Probado en dev build.
- **Stripe (día 5):** compra de cosméticos con **Payment Links** (modo test) + **webhook** en Cloud Function que marca la compra `paid` y **desbloquea el cosmético en vivo**. Flujo probado de extremo a extremo.
- **Notificaciones push (día 6):** token FCM guardado por jugador, permiso + interruptor en Configuración, banner in-app en primer plano, notificación del sistema en segundo plano y push **“¡Gracias por tu compra!”** disparado por el webhook al pagar.

### 🚧 Pendiente (roadmap por días)
- **Día 7 — Pulido y demo.**
- Extras opcionales: fuente redondeada (tipo *Fredoka/Baloo*), ranking, más niveles.

### Mapa de requisitos
| Requisito | Estado |
|---|---|
| Sensores (acelerómetro) | ✅ Implementado |
| Base de datos (Firestore) | ✅ Implementado y probado |
| Huella dactilar | ✅ Implementado y probado |
| Compras (Stripe) | ✅ Implementado y probado (modo test) |
| Notificaciones push (FCM) | ✅ Implementado |

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Expo SDK 57 · React Native 0.86 · TypeScript (strict) |
| Rutas | Expo Router (rutas en `src/app/`) |
| Render del juego | `@shopify/react-native-skia` |
| Sensores | `expo-sensors` (Accelerometer) |
| Estado global | `zustand` |
| UI | `expo-linear-gradient`, `@expo/vector-icons` (Ionicons), `expo-image`, `react-native-safe-area-context` |
| Biometría | `expo-local-authentication` |
| Datos | Firebase (`@react-native-firebase`: auth anónimo + Firestore) |
| Compras | Stripe Payment Links + Cloud Function (webhook) |
| Push | Firebase Cloud Messaging (`@react-native-firebase/messaging`) |

---

## Cómo correr

```bash
cd TiltMaze
npm install
npx expo start --dev-client   # requiere la dev build instalada en el teléfono
```

- El proyecto usa **dev build** (EAS): **Expo Go ya no sirve** porque Firebase/FCM requieren código nativo.
- El **acelerómetro solo funciona en un teléfono físico** (no en emuladores).
- Para probar las **compras** (Stripe), sigue [`docs/STRIPE.md`](docs/STRIPE.md) (webhook local con el emulador + Stripe CLI).
- Para probar las **notificaciones push** (FCM), sigue [`docs/PUSH.md`](docs/PUSH.md).

Comandos útiles:

```bash
npx tsc --noEmit        # typecheck
npx expo lint           # lint
npx expo-doctor         # diagnóstico de dependencias
npx expo start --clear  # iniciar limpiando caché de Metro
```

---

## Estructura del proyecto

```
TiltMaze/
├── app.json                  # config de Expo (tema claro, plugins de sensores/biometría/push)
├── google-services.json      # config de Firebase
├── .firebaserc               # proyecto por defecto (tiltmaze-726ca)
├── firebase.json             # config de Functions + notificaciones (clave react-native)
├── eas.json                  # perfiles de EAS Build
├── functions/                # webhook de Stripe + push de compra (Cloud Function v2)
├── docs/
│   ├── SETUP.md              # checklist de Firebase y Stripe
│   ├── STRIPE.md             # runbook de Stripe (links + webhook local)
│   └── PUSH.md               # runbook de notificaciones push (FCM)
└── src/
    ├── app/                  # rutas (Expo Router)
    │   ├── _layout.tsx       # splash → LockGate → Stack
    │   ├── index.tsx         # pantalla principal
    │   ├── onboarding.tsx    # nombre + huella (primer arranque)
    │   ├── levels.tsx        # selección de niveles
    │   ├── game.tsx          # juego (Skia + física)
    │   ├── cosmetics.tsx     # cosméticos (equipar/comprar)
    │   ├── sensors.tsx       # prueba de sensores
    │   ├── settings.tsx      # Configuración real
    │   └── profile.tsx       # Perfil real
    ├── assets/balls/         # PNG de las pelotas premium
    ├── components/           # floating-background, gradient-card, lock-gate, notification-banner, themed-*
    ├── constants/            # palette.ts, theme.ts
    ├── data/
    │   ├── cosmetics.ts      # catálogo (gratis + premium + imágenes) y precios MXN
    │   └── levels/           # types.ts, level-1..5.ts, index.ts (registro)
    ├── game/
    │   ├── sensors.ts        # useTilt(): inclinación calibrada
    │   └── engine.ts         # stepBall(): física
    ├── hooks/use-bootstrap.ts # auth → hidratar → persistencia → compras → listeners FCM
    ├── services/             # auth, firestore, biometric, persistence, purchases, notifications
    └── store/                # player.ts (jugador), notifications.ts (banner push)
```

El plan general del proyecto vive en **`../PLAN.md`** (fuera de `TiltMaze/`).

---

## Cómo extender

### Agregar un nivel
1. Crea `src/data/levels/level-N.ts`:
   ```ts
   import { createLevel } from '@/data/levels/types';

   const layout = [
     '#########',
     '#S....G.#',
     '#########',
   ] as const;

   export const LEVEL_N = createLevel({ id: 6, name: 'Mi nivel', rows: layout });
   ```
2. Regístralo en `src/data/levels/index.ts` (array `LEVELS`).

Reglas del mapa: rectangular, borde cerrado con `#`, **un solo** `S` y `G`, `O` = hoyo, `.` = libre, y debe existir **camino S→G sin pasar por hoyos**. Recomendado ≤ 11 columnas para móvil.

### Agregar un cosmético
Edita `src/data/cosmetics.ts`. Los de `priceMXN: 0` se desbloquean solos; los premium usan `paymentLinkUrl` (Stripe). Para una pelota con **imagen**, coloca el PNG (256×256, fondo transparente) en `src/assets/balls/` y añade `image: require('../assets/balls/archivo.png')` — se recorta a círculo sola en la tienda y en el juego.

---

## Referencias
- Runbook de Stripe: [`docs/STRIPE.md`](docs/STRIPE.md)
- Runbook de notificaciones push: [`docs/PUSH.md`](docs/PUSH.md)
- Setup manual de Firebase/Stripe: [`docs/SETUP.md`](docs/SETUP.md)
- Plan del proyecto: [`../PLAN.md`](../PLAN.md)
