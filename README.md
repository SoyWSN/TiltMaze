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
- **Cosméticos**: 7 pelotas de color **gratis** equipables, temas de tablero (Madera gratis, Bamboo/Neón premium) y candados con precio para lo premium. El cosmético equipado se aplica **al juego y a la pantalla de sensores**.
- **Sistema de diseño** acorde a un mockup: fondo pastel animado, tarjetas con degradado y sombra de color, tipografía bicolor.
- **Pantallas provisionales** con el mismo estilo para Tienda… (Configuración, Perfil), y prueba de sensores.

### 🚧 Pendiente (roadmap por días)
- **Día 3 (resto) — Persistencia:** el progreso (récords, niveles desbloqueados, cosméticos) vive **solo en memoria** (`zustand`) y se reinicia al cerrar la app. Falta guardarlo en Firestore.
- **Día 4 — Firebase + biometría:**
  - Conectar `google-services.json` (ya está en la raíz) con `@react-native-firebase`.
  - Firestore: documentos `users` y `purchases` + reglas.
  - Auth anónimo (habilitar en consola).
  - **Desbloqueo con huella** (`expo-local-authentication`) + pantalla de Configuración real.
  - Requiere **dev build** (ya no Expo Go).
- **Día 5 — Stripe:** crear los Payment Links en MXN, flujo de compra y **Cloud Function (webhook)** que otorga el cosmético. Precios $5–$10 MXN (modo test; **mínimo real en MXN = $10**).
- **Día 6 — Notificaciones push (FCM):** permiso, token, listeners y envío de prueba desde la consola de Firebase.
- **Día 7 — Pulido y demo.**
- Extras opcionales: fuente redondeada (tipo *Fredoka/Baloo*), ranking, más niveles.

### Mapa de requisitos
| Requisito | Estado |
|---|---|
| Sensores (acelerómetro) | ✅ Implementado |
| Base de datos (Firestore) | 🚧 Proyecto creado, falta integrar |
| Huella dactilar | 🚧 Librería instalada, falta el flujo |
| Compras (Stripe) | 🚧 Catálogo listo, falta pago + webhook |
| Notificaciones push | ⬜ Pendiente |

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Expo SDK 57 · React Native 0.86 · TypeScript (strict) |
| Rutas | Expo Router (rutas en `src/app/`) |
| Render del juego | `@shopify/react-native-skia` |
| Sensores | `expo-sensors` (Accelerometer) |
| Estado global | `zustand` |
| UI | `expo-linear-gradient`, `@expo/vector-icons` (Ionicons), `react-native-safe-area-context` |
| Biometría | `expo-local-authentication` (instalado) |
| Datos / push | Firebase (Firestore + FCM) — pendiente |
| Compras | Stripe Payment Links + Cloud Function — pendiente |

---

## Cómo correr

```bash
cd TiltMaze
npm install
npx expo start        # abre con Expo Go o dev build
```

- **Expo Go** funciona para: juego, sensores, cosméticos, navegación y prueba de sensores.
- Necesitarás **dev build** (`npx expo run:android` o EAS) cuando integres **Firebase/FCM** (día 4-6).
- El **acelerómetro solo funciona en un teléfono físico** (no en emuladores).

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
├── app.json                  # config de Expo (tema claro, plugins de sensores y biometría)
├── google-services.json      # config de Firebase (aún sin conectar)
├── docs/SETUP.md             # checklist manual de Firebase y Stripe
└── src/
    ├── app/                  # rutas (Expo Router)
    │   ├── _layout.tsx       # Stack + tema de navegación
    │   ├── index.tsx         # pantalla principal (mockup)
    │   ├── levels.tsx        # selección de niveles
    │   ├── game.tsx          # juego (Skia + física)
    │   ├── cosmetics.tsx     # cosméticos (equipar/comprar)
    │   ├── sensors.tsx       # prueba de sensores
    │   ├── settings.tsx      # placeholder (día 4)
    │   └── profile.tsx       # placeholder (día 4)
    ├── components/           # floating-background, gradient-card, balance-line, coming-soon, themed-*
    ├── constants/            # palette.ts, theme.ts
    ├── data/
    │   ├── cosmetics.ts      # catálogo (gratis + premium) y precios MXN
    │   └── levels/           # types.ts, level-1..5.ts, index.ts (registro)
    ├── game/
    │   ├── sensors.ts        # useTilt(): inclinación calibrada
    │   └── engine.ts         # stepBall(): física
    ├── store/player.ts       # estado del jugador (zustand)
    └── hooks/
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
Edita `src/data/cosmetics.ts`. Los de `priceMXN: 0` se desbloquean solos; los premium usan `paymentLinkUrl` (Stripe, día 5).

---

## Referencias
- Setup manual de Firebase/Stripe: [`docs/SETUP.md`](docs/SETUP.md)
- Plan del proyecto: [`../PLAN.md`](../PLAN.md)
