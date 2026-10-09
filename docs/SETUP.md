# Setup manual: Firebase y Stripe

Configuración que hay que hacer **a mano en las consolas** antes de los días 4–6.
Los días 2–3 (juego) no dependen de nada de esto.

---

## 0. Decisión previa (2 minutos, hacer YA)

Elige el **package name / application ID** de Android, p. ej. `com.tiltmaze.app`.
Lo necesitarás idéntico en Firebase y en `app.json`, y **no se puede cambiar fácil** después de instalar la app en un dispositivo.

### ✅ Ya está decidido y configurado: `com.tiltmaze.app`

Es el identificador único de la app en Android (formato "dominio invertido"). Se declara en **dos sitios que deben coincidir exactamente**:

1. **En el proyecto (ya lo configuré yo):** `TiltMaze/app.json` → `expo.android.package = "com.tiltmaze.app"`. No tienes que tocar nada.
2. **En Firebase (lo escribes tú):** al registrar la app Android (paso 1.4), el campo se llama **"Nombre del paquete de Android"** / "Android package name". Ahí escribe literalmente: `com.tiltmaze.app`

> Como la app no se publica en Google Play, no hay un tercer sitio: solo app.json + Firebase.

---

## 1. Firebase (antes del día 4: persistencia y biometría)

### 1.1 Crear el proyecto
- [ ] Ir a <https://console.firebase.google.com> → **Crear proyecto** (p. ej. `tiltmaze`).
- [ ] Puedes dejar Google Analytics desactivado (no lo usamos).

### 1.2 Firestore (base de datos)

Pasos exactos en la consola (la interfaz cambia a veces, pero el flujo es este):

1. Entra a <https://console.firebase.google.com> → abre el proyecto **tiltmaze**.
2. Menú lateral izquierdo: **Build / Crear → Firestore Database**.
3. Botón **"Crear base de datos" / "Create database"**.
4. **Modal 1 — Ubicación:** en el desplegable elige una región de América. Recomendado: **`nam5 (us-central)`** (multirregión de EE. UU.; para México es la opción estándar).
5. **Modal 2 — Modo de seguridad:** elige **"Iniciar en modo de producción" / "Start in production mode"** *(no* el modo de prueba, que deja la BD abierta).
6. Botón **"Crear / Enable"**. Espera ~1 minuto.

**La base de datos queda VACÍA, y así debe quedar.** Firestore no tiene tablas ni esquema: las colecciones (`users`, `purchases`) y sus campos se crean solos cuando la app escribe el primer documento (día 4). **No crees nada a mano** — la estructura de documentos está definida en `PLAN.md` sección 4.

7. Añade las reglas de seguridad: dentro de Firestore Database, pestaña **"Reglas" / "Rules"**, borra lo que haya y pega:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cada jugador solo puede leer/escribir SU documento
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    // Compras: el jugador crea la suya y puede leer sus propias;
    // solo el webhook (Admin SDK, que ignora reglas) las actualiza
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    // Nada más es accesible
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

8. Pulsa **"Publicar" / "Publish"**.

### 1.3 Authentication (perfil anónimo del jugador)
- [ ] **Build → Authentication → Get started** → habilitar el proveedor **Anónimo**.

### 1.4 Registrar la app Android (necesario para el SDK y el push en el teléfono)

> **Decisión tomada:** registramos la app Android en Firebase. Esto **no publica nada** (no es Google Play): solo genera el archivo de configuración que habilita el push real de FCM. La app sigue siendo un prototipo.

Pasos y campos exactos:

1. Firebase console → **⚙️ Project settings** (Configuración del proyecto) → pestaña **General** → sección **"Tus apps"** → icono **🤖 Android**.
2. Formulario (solo 1 campo obligatorio):
   - **"Nombre del paquete de Android"** (Android package name): `com.tiltmaze.app` ← exactamente igual, ya configurado en `app.json`
   - "Sobrenombre de la app" (nickname): `TiltMaze` (opcional)
   - "Certificado SHA-1" / SHA-1: **dejar vacío** (solo se usa para Google Sign-In, que no necesitamos)
3. **"Registrar app"**.
4. Pantalla de descarga: botón **`google-services.json`** → descárgalo y guárdalo en **`TiltMaze/google-services.json`**.
5. Las pantallas "Next/Continue" del asistente se pueden saltar (eso sí hace Firebase te sugiera instalar cosas — ya lo haremos nosotros en el código).

*(Solo si vas a probar también en iPhone:)* registrar la app iOS (mismo asistente, icono ) y descargar `GoogleService-Info.plist` — para el prototipo Android no hace falta.

> Nota: este archivo **no hace nada** hasta el día 4, cuando instalemos `@react-native-firebase/app` y conectemos el plugin. Pero tenerlo descargado ahorra tiempo.
> Importante: una vez que usemos Firebase, la app ya no correrá en Expo Go → haremos **dev build** (`npx expo run:android` con Android Studio / o EAS).

### 1.5 Cloud Functions (webhook de Stripe) — decide la vía
El webhook del día 5 corre como Cloud Function. Dos opciones:

- **Opción A — Emulador local (sin tarjeta, recomendada para desarrollo):**
  - [ ] Instalar Firebase CLI: `npm i -g firebase-tools` y `firebase login`.
  - El webhook correrá en tu PC (`firebase emulators:start`) y Stripe CLI le reenviará los eventos. Perfecto para desarrollar; para la demo final la laptop debe estar encendida.
- **Opción B — Desplegar de verdad (requiere plan Blaze):**
  - [ ] **Firebase console → Plan → Upgrade to Blaze** (pay-as-you-go, pide tarjeta).
  - Ventaja: el webhook funciona siempre, incluso en la demo sin tu laptop. Con el tráfico de un examen el costo es ~$0 (las Functions tienen capa gratuita generosa).

### 1.6 Push (FCM) — no requiere configuración previa
- El día 6 pediremos permiso desde la app y probaremos enviando un mensaje desde **Firebase console → Messaging → Create your first campaign**. Solo asegúrate de tener acceso a esa sección con tu cuenta.

---

## 2. Stripe (antes del día 5: tienda)

### 2.1 Crear la cuenta
- [ ] Ir a <https://dashboard.stripe.com> y crear cuenta.
- [ ] Quedarse en **modo test** (por defecto al crear la cuenta; el switch "Test mode" arriba a la derecha).

### 2.2 Crear los Payment Links de los 5 cosméticos
Por cada producto de `src/data/cosmetics.ts`:
- [ ] **Product catalog → + Add product** → nombre (p. ej. "Skin de bola: Fuego") → **precio único (one-time)** en **MXN**.
- [ ] Después: **Payment links → + New** → seleccionar el producto → **crear el link**.
- [ ] Apuntar en una tabla (yo lo haré en el catálogo de la app):
  | Cosmético | URL del Payment Link (`https://buy.stripe.com/...`) | Price ID (`price_...`) |

Precios: skins **$10 MXN** (Fuego, Galaxia, Emoji) y temas **$20 MXN** (Bamboo, Neón). El pack se eliminó.

> ⚠️ El mínimo de cargo de Stripe en MXN **en modo real** es $10 MXN. Con precios de $10–$20 MXN la compra funcionaría también en modo real.

### 2.3 Cómo sabemos quién compró (importante)
Cuando la app abre el Payment Link le añade `?client_reference_id=<id_de_la_compra>`. El webhook `checkout.session.completed` recibe ese valor y marca `purchases/{id}` como `paid`. La app escucha sus compras y desbloquea el cosmético. No hace falta mapear Price IDs.

### 2.4 Stripe CLI (probar el webhook en local)
- [ ] Instalar la CLI: <https://docs.stripe.com/stripe-cli> (Windows: `scoop install stripe` o binario).
- [ ] `stripe login` (abre el navegador).
- [ ] El día 5 haremos: `stripe listen --forward-to http://localhost:5001/tiltmaze-726ca/us-central1/stripeWebhook --events checkout.session.completed` → nos dará el **secreto de webhook** (`whsec_...`) → lo guardamos en la configuración de la función.

### 2.5 Tarjeta de prueba para la demo
- Número: `4242 4242 4242 4242`
- Fecha: cualquier fecha futura (p. ej. `12/34`)
- CVC: 3 dígitos cualesquiera (p. ej. `123`)
- CP: cualquiera

---

## 3. Resumen de "hacer ya"

| # | Acción | Bloquea el día |
|---|---|---|
| 1 | Elegir package name de Android | 4 (y todos) |
| 2 | Crear proyecto Firebase + Firestore + Auth anónima | 4 |
| 3 | Descargar `google-services.json` | 4 |
| 4 | Decidir vía de Functions (emulador vs Blaze) | 5 |
| 5 | Crear cuenta Stripe + 5 Payment Links MXN + apuntar URLs | 5 |
| 6 | Instalar Stripe CLI + `stripe login` | 5 |
| 7 | (Nada más para push: se configura el día 6) | 6 |
