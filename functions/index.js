/**
 * Webhook de Stripe (único backend de TiltMaze).
 *
 * Recibe `checkout.session.completed` (reenviado por Stripe CLI en local) y
 * marca la compra `purchases/{client_reference_id}` como `paid`. La app escucha
 * ese cambio y desbloquea el cosmético.
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
    }
  }

  res.json({ received: true });
});
