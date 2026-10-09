# Día 5 — Stripe: compras de cosméticos (runbook)

Este archivo explica cómo dejar funcionando la compra de cosméticos de **TiltMaze** con
Stripe (modo test) y el webhook local. Complementa a [`SETUP.md`](./SETUP.md) (que tiene
el checklist de la consola).

## Qué ya está implementado en código

- **Flujo de compra** (`src/app/cosmetics.tsx` + `src/services/purchases.ts`): al tocar un
  cosmético premium, la app crea un documento `purchases/{id}` con `status: "pending"` y
  abre el Payment Link con `?client_reference_id=<id>`.
- **Webhook** (`functions/index.js`): recibe `checkout.session.completed`, verifica la firma
  y marca `purchases/{id}` como `paid`.
- **Desbloqueo en vivo** (`src/services/purchases.ts`): la app escucha sus compras y, cuando
  una pasa a `paid`, añade el cosmético a `ownedItems`.

**Falta solo lo manual de Stripe (cuenta + links) y correr el webhook.**

---

## 1. Crear la cuenta y los Payment Links

1. Crea la cuenta en <https://dashboard.stripe.com> (quédate en **Test mode**, es el switch
   de arriba a la derecha).
2. Por cada producto de la tabla, en **Product catalog → + Add product**: nombre, precio
   único (*one-time*) en **MXN**.
3. Luego **Payment links → + New** para cada producto → copia la **URL** (`https://buy.stripe.com/...`).
4. Anota las URLs y mándamelas (o pégalas tú en `src/data/cosmetics.ts`, campo `paymentLinkUrl`):

| Cosmético | Precio | id (`productId`) |
|---|---|---|
| Fuego | $10 MXN | `skin_fuego` |
| Galaxia | $10 MXN | `skin_galaxia` |
| Emoji | $10 MXN | `skin_emoji` |
| Bamboo | $20 MXN | `theme_bamboo` |
| Neón | $20 MXN | `theme_neon` |

> No hace falta configurar redirección ni productos con metadata: el webhook identifica la
> compra por `client_reference_id` (el id del doc de compra), no por el precio.

---

## 2. Webhook local (emulador de Firebase Functions)

El webhook corre en tu PC durante el desarrollo/demo. Necesita dos secretos: un
**service account key** (para escribir en Firestore real) y el **webhook secret** de Stripe CLI.

### 2.1 Instalar Firebase CLI
```powershell
npm install -g firebase-tools
firebase login
```

### 2.2 Service account key (una vez)
1. Firebase console → **⚙️ Project settings → Service accounts → Generate new private key**.
2. Descarga el JSON y guárdalo como `functions/serviceAccountKey.json` (ya está en `.gitignore`).

### 2.3 Dependencias de la función
```powershell
cd functions
npm install
cd ..
```

### 2.4 Stripe CLI + secret del webhook
```powershell
# Instala la CLI (una vez): https://docs.stripe.com/stripe-cli  (Windows: scoop install stripe)
stripe login
stripe listen --forward-to http://localhost:5001/tiltmaze-726ca/us-central1/stripeWebhook --events checkout.session.completed
```
- `stripe listen` imprime un secreto `whsec_...`. **Cópialo** para el paso siguiente.

### 2.5 Arrancar el emulador (otra terminal)
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "$PWD\functions\serviceAccountKey.json"
$env:STRIPE_WEBHOOK_SECRET = "whsec_..."
$env:FUNCTIONS_DISCOVERY_TIMEOUT = "120"
firebase emulators:start --only functions --project tiltmaze-726ca
```
- `--project tiltmaze-726ca` es **obligatorio** si no existe `.firebaserc`: sin él el emulador
  arranca como `demo-no-project` y la función queda en otra ruta
  (`/demo-no-project/...`) → toda petición a `/tiltmaze-726ca/...` responde **404**.
  (En este repo ya existe `.firebaserc` con el proyecto por defecto, pero el flag no estorba.)
- `FUNCTIONS_DISCOVERY_TIMEOUT` (en **segundos**) amplía el tiempo que el emulador espera a
  que la función termine de arrancar. **Sin ella, si el primer arranque tarda >30 s** (normal
  en Windows la primera vez por el antivirus), el emulador aborta con
  `Failed to start functions ... Failed to load function.` y la petición se queda **colgada**
  sin respuesta → Stripe reporta el evento como fallido.

### 2.6 Calentar el worker (recomendado, una vez por sesión)
El arranque del worker de la función es lento la primera vez. Caliéntalo **antes** del test:
```powershell
try {
  Invoke-RestMethod -Method Post -Uri "http://localhost:5001/tiltmaze-726ca/us-central1/stripeWebhook" -ContentType "application/json" -Body '{"type":"warmup"}' -TimeoutSec 150
} catch {
  "worker calentado (respuesta esperada 400, HTTP $($_.Exception.Response.StatusCode.value__))"
}
```
> Un `400` es **éxito**: significa que la función ejecutó y rechazó la firma inexistente.
> Los eventos reales de Stripe después de esto se atienden de inmediato.

---

## 3. Probar la compra de extremo a extremo

1. Con la app abierta en el teléfono (dev build), ve a **Cosméticos**.
2. Toca un cosmético premium (p. ej. **Fuego**) → se abre el navegador con el Payment Link.
3. Paga con la tarjeta de prueba:
   - Número: `4242 4242 4242 4242` · Fecha futura (`12/34`) · CVC `123` · CP cualquiera.
4. Al pagar, Stripe avisa al webhook → marca la compra `paid` → la app desbloquea el cosmético
   en vivo (aparece equipable).

> Verificación en Firebase console: aparece un documento en **Firestore → `purchases`** con
> `status: "paid"`, y el cosmético en **`users/{uid}.ownedItems`**.

> **Recuperación de un test que se quedó `pending`** (p. ej. cuando el webhook dio 404):
> en la consola de Firestore → `purchases/{id}` → cambia el campo `status` a `"paid"` y
> publica. La app lo detecta en vivo y desbloquea el cosmético. Recuerda que el **modo test
> no cobra dinero real**; nunca hace falta pagar de nuevo por un test.

> **Test sin pagar:** `stripe trigger checkout.session.completed` dispara un evento de prueba
> (no lleva `client_reference_id`, así que no desbloquea nada; sirve para ver que el webhook recibe).

---

## Notas

- El mínimo de cargo de Stripe en MXN **en modo real** es $10 MXN; los precios actuales ($10–$20) ya cumplen ese mínimo.
- Si un día despliegas a la nube (plan Blaze), el webhook funciona sin tu laptop: `firebase deploy --only functions` y configura el endpoint en el dashboard de Stripe con el secret correspondiente.
