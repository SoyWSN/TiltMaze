# Día 6 — Notificaciones push (FCM): runbook

Cómo funcionan y cómo probar las notificaciones de **TiltMaze** con Firebase Cloud
Messaging. Complementa a [`SETUP.md`](./SETUP.md) (checklist de consola) y
[`STRIPE.md`](./STRIPE.md) (webhook, que ahora también manda el push de compra).

## Cómo funciona (resumen)

1. **Token**: al abrir la app, FCM da un token único al dispositivo. Se guarda en
   `users/{uid}.fcmToken` (`src/services/notifications.ts` → `registerForPush`).
2. **Enviar**: un servidor (aquí, el webhook en `functions/index.js`) envía un mensaje
   a ese token con `notification` (título + cuerpo) y `data` (payload para la app).
3. **Recibir**:
   - **Primer plano** → FCM **no** muestra nada; `onMessage` lo entrega y la app pinta un
     **banner in-app** (`src/components/notification-banner.tsx`).
   - **Segundo plano / cerrada** → como el mensaje trae `notification`, **el sistema la
     muestra sola**. El tap abre la app (`onNotificationOpenedApp` / `getInitialNotification`).
4. **Tap** → según `data.navigationId` la app navega (p. ej. a `/cosmetics`).

## Qué ya está implementado

- `src/services/notifications.ts`: permiso, token, refresco de token, listeners y
  `setBackgroundMessageHandler`.
- `src/hooks/use-bootstrap.ts`: registra los listeners y vuelve a registrar el token si el
  jugador ya tenía las notificaciones activadas.
- `src/app/settings.tsx`: el interruptor **Notificaciones** pide permiso y guarda/borra el token.
- `src/components/notification-banner.tsx` + `src/store/notifications.ts`: banner en primer plano.
- `functions/index.js`: al confirmarse una compra (`checkout.session.completed`), envía el push
  **“¡Gracias por tu compra!”** al token del comprador.

> ⚠️ **Requiere dev build nueva**: `@react-native-firebase/messaging` es un módulo nativo.
> Regenera con `eas build --profile development --platform android` (o `npx expo run:android`).

---

## 1. Activar en la app

1. En la app → **Configuración → Notificaciones** → actívalo.
2. Android 13+ pedirá el permiso **“Permitir notificaciones”** → **Permitir**.
3. Verifica en la consola de Firebase → **Firestore → `users/{uid}`** que aparezca `fcmToken`.
   (Para ver tu `uid`: en la app, **Perfil**.)

---

## 2. Prueba rápida desde la consola de Firebase

Sirve para comprobar que el token y el dispositivo funcionan, sin depender de Stripe.

1. Copia tu token de `users/{uid}.fcmToken`.
2. Firebase console → **Engage → Messaging → Create campaign → Notifications** → redacta el
   mensaje → **Send test message** → pega el token → **Test**.
3. Con la app **en primer plano** verás el **banner in-app**; con la app en **segundo plano o
   cerrada** verás la **notificación del sistema**.

> En Firebase, para el envío de prueba elige el **token** (no un tema/topic).

---

## 3. Prueba real: push de “gracias por la compra”

Es el flujo de este día: el push lo dispara el webhook al confirmar el pago.

1. Arranca el webhook local como en [`STRIPE.md`](./STRIPE.md) (emulador + `stripe listen`) y
   **calienta el worker**.
2. En la app con **Notificaciones activadas**, ve a **Cosméticos** y compra uno premium con la
   tarjeta de prueba `4242 4242 4242 4242`.
3. Al completarse el pago, el webhook marca la compra `paid` **y** envía el push.
   - App en segundo plano/cerrada → notificación del sistema **“¡Gracias por tu compra! 🎉”**.
   - App en primer plano → banner in-app.
4. Tocar la notificación abre **Cosméticos** (`data.navigationId = "cosmetics"`).

> El `productName` que aparece en el mensaje se guarda al crear la compra
> (`src/services/purchases.ts`), así el webhook no necesita conocer el catálogo.

---

## 4. Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| No aparece `fcmToken` en Firestore | El interruptor está apagado o se denegó el permiso. Actívalo en **Configuración** (y en los ajustes del sistema si lo bloqueaste). |
| No llega nada con la app abierta | Es lo esperado en FCM: en primer plano se pinta el **banner**, no una notificación del sistema. |
| No llega nada con la app cerrada | Revisa que el mensaje traiga `notification`; que el token siga siendo válido (regenerado el build, el token cambia y se re-guarda al abrir). |
| El webhook marca la compra pero no manda push | El usuario no tenía `fcmToken`. Se registra solo al activar las notificaciones; revisa la consola del emulador (`Push de compra enviado` / `Sin token FCM`). |
| Error al enviar desde el emulador | El service account de `functions/serviceAccountKey.json` debe poder usar FCM (rol *Firebase Admin SDK*). |

## Notas

- Los valores de `data` en FCM llegan **siempre como texto** (strings).
- En Android 13+ el permiso `POST_NOTIFICATIONS` es en tiempo de ejecución; en Android 12 o
  inferior se concede al instalar.
- El icono/color por defecto de las notificaciones se configura en `firebase.json`
  (clave `react-native`, la lee el config plugin de React Native Firebase).
