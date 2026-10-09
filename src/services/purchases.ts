/**
 * Compras de cosméticos (Stripe, día 5).
 *
 * Flujo: la app crea un doc `purchases/{id}` con `status: "pending"` y abre el
 * Payment Link pasando ese `id` como `client_reference_id`. Al pagar, el webhook
 * (Cloud Function) marca el doc como `paid`; esta capa lo detecta en tiempo real
 * y desbloquea el cosmético.
 */
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';

import { getCosmetic } from '@/data/cosmetics';
import { usePlayer } from '@/store/player';

const PURCHASES = 'purchases';

/** Crea una compra pendiente y devuelve su id (se usa como `client_reference_id`). */
export async function createPurchase(
  uid: string,
  productId: string,
  amountMXN: number,
): Promise<string> {
  const ref = await addDoc(collection(getFirestore(), PURCHASES), {
    uid,
    productId,
    amountCents: Math.round(amountMXN * 100),
    status: 'pending',
    createdAt: Date.now(),
  });
  return ref.id;
}

/** Concede el cosmético comprado (expande packs) al jugador local. */
function grantItem(productId: string): void {
  const item = getCosmetic(productId);
  if (!item) {
    return;
  }
  const ids = item.type === 'pack' && item.includes ? item.includes : [item.id];
  usePlayer.getState().addOwnedItems(ids);
}

/** Escucha las compras del jugador y desbloquea las que estén pagadas. */
export function watchPurchases(uid: string): () => void {
  const purchasesQuery = query(
    collection(getFirestore(), PURCHASES),
    where('uid', '==', uid),
  );
  return onSnapshot(purchasesQuery, (snapshot) => {
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.status === 'paid') {
        grantItem(data.productId);
      }
    }
  });
}
