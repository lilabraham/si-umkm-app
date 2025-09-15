// LOKASI: src/pages/api/admin/products/visibility.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const auth = getAuth();
const db = getFirestore();

function pickToken(req: NextApiRequest): string | null {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  // @ts-ignore
  return req.cookies?.token || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = pickToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = await auth.verifyIdToken(token);
    const me = await db.collection('users').doc(decoded.uid).get();
    if (me.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { productIds, visibility } = (req.body || {}) as {
      productIds: string[];
      visibility: 'public' | 'hidden';
    };

    if (!Array.isArray(productIds) || !productIds.length) {
      return res.status(400).json({ error: 'productIds required' });
    }
    if (!['public', 'hidden'].includes(visibility)) {
      return res.status(400).json({ error: 'invalid visibility' });
    }

    // Ambil dokumen produk yang ada
    const docs = await Promise.all(productIds.map((id) => db.collection('products').doc(id).get()));
    const exist = docs.filter((d) => d.exists);
    if (!exist.length) return res.status(200).json({ processed: 0, owners: 0 });

    // Update visibility (jika berbeda) + catat SEMUA owner untuk di-recount
    const ownersSet = new Set<string>();
    const batch = db.batch();

    for (const doc of exist) {
      const data = doc.data() as any;
      const ownerId = data?.ownerId;
      if (ownerId) ownersSet.add(ownerId);

      const currentVis: 'public' | 'hidden' = data?.visibility === 'hidden' ? 'hidden' : 'public';
      if (currentVis !== visibility) {
        batch.update(doc.ref, { visibility });
        const logRef = db.collection('admin_logs').doc();
        batch.set(logRef, {
          type: 'product_visibility',
          productId: doc.id,
          ownerId,
          visibility,
          by: decoded.uid,
          at: FieldValue.serverTimestamp(),
        });
      }
    }

    await batch.commit();

    // RECOUNT authoritatif untuk SEMUA owner yang terlibat (idempotent & aman)
    const owners = Array.from(ownersSet);
    await Promise.all(
      owners.map(async (ownerId) => {
        const [pubSnap, allSnap] = await Promise.all([
          db
            .collection('products')
            .where('ownerId', '==', ownerId)
            .where('visibility', '==', 'public')
            .get(),
          db.collection('products').where('ownerId', '==', ownerId).get(),
        ]);

        const publicCount = pubSnap.size;
        const totalCount = allSnap.size;

        await db.collection('users').doc(ownerId).update({
          publicProductCount: publicCount,
          productCount: publicCount, // kompatibel dengan UI
          totalProductCount: totalCount,
          updatedAt: FieldValue.serverTimestamp(),
        });
      })
    );

    // On-demand ISR revalidate → segarkan halaman publik
    try {
      await res.revalidate('/produk/produk');
    } catch (_) {}
    for (const ownerId of owners) {
      try {
        await res.revalidate(`/toko/${encodeURIComponent(ownerId)}`);
      } catch (_) {}
    }

    return res.status(200).json({ processed: exist.length, owners: owners.length });
  } catch (e) {
    console.error('/api/admin/products/visibility error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
