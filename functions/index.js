/**
 * Webhook de Stripe (único backend de TiltMaze).
 *
 * Recibe `checkout.session.completed` (reenviado por Stripe CLI en local) y
 * marca la compra `purchases/{client_reference_id}` como `paid`. La app escucha
 * ese cambio y desbloquea el cosmético. Después envía una notificación push
 * (FCM) al dispositivo del comprador: "¡Gracias por tu compra!".
 *
 * En local corre con el emulador de Firebase Functions:
 *   firebase emulators:start --only functions
 * Y Stripe CLI reenvía los eventos:
 *   stripe listen --forward-to http://localhost:5001/tiltmaze-726ca/us-central1/stripeWebhook
 *
 * Nota: firebase-functions v6 solo soporta la API v2 (2.ª generación),
 * por eso se importa `onRequest` desde `firebase-functions/v2/https`.
 */
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Envía un push de agradecimiento al dueño de la compra usando su token FCM.
 * Nunca lanza: un fallo de push no debe tumbar el webhook.
 */
async function sendPurchasePush(purchaseId) {
  try {
    const purchaseSnap = await admin.firestore().collection('purchases').doc(purchaseId).get();
    const purchase = purchaseSnap.data();
    if (!purchase || !purchase.uid) {
      return;
    }

    const userSnap = await admin.firestore().collection('users').doc(purchase.uid).get();
    const token = userSnap.get('fcmToken');
    if (!token) {
      console.log(`Sin token FCM para ${purchase.uid}; no se envía push`);
      return;
    }

    const nombre = purchase.productName || 'tu cosmético';
    await admin.messaging().send({
      token,
      notification: {
        title: '¡Gracias por tu compra! 🎉',
        body: `Desbloqueaste «${nombre}». Ábrelo en la tienda para equiparlo.`,
      },
      // `data` llega siempre como strings; la app lo usa para navegar al tocar.
      data: {
        navigationId: 'cosmetics',
        productId: String(purchase.productId || ''),
      },
      android: { priority: 'high' },
    });
    console.log(`Push de compra enviado a ${purchase.uid}`);
  } catch (error) {
    console.warn('No se pudo enviar el push de compra:', error.message);
  }
}

exports.stripeWebhook = onRequest(async (req, res) => {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET no está configurado');
    return res.status(500).send('STRIPE_WEBHOOK_SECRET no configurado');
  }

  if (!req.rawBody) {
    console.error('req.rawBody no disponible en esta petición');
    return res.status(500).send('rawBody no disponible');
  }

  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      webhookSecret,
    );
  } catch (err) {
    console.error('Firma del webhook inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const purchaseId = session.client_reference_id;

    if (purchaseId) {
      await admin.firestore().collection('purchases').doc(purchaseId).update({
        status: 'paid',
        paidAt: Date.now(),
        amountCents: session.amount_total ?? null,
      });
      console.log(`Compra ${purchaseId} marcada como pagada`);
      await sendPurchasePush(purchaseId);
    }
  }

  res.json({ received: true });
});
