import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

type Visibility = 'public' | 'hidden';

function getToken(req: NextApiRequest): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.substring(7);
  // @ts-ignore
  const cookie = req.cookies?.token || null;
  return cookie || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // no-cache
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized: missing token' });

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { productIds, visibility } = req.body as {
      productIds: string[];
      visibility: Visibility;
    };
    if (!Array.isArray(productIds) || !productIds.length) {
      return res.status(400).json({ error: 'productIds required' });
    }
    if (!['public', 'hidden'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility' });
    }

    const docs = await Promise.all(
      productIds.map((id) => db.collection('products').doc(id).get())
    );

    const batch = db.batch();
    let processed = 0;

    for (const d of docs) {
      if (!d.exists) continue;
      const p = d.data() as any;
      const ownerId = String(p?.ownerId || '');
      const wasPublic = !(p?.visibility === 'hidden' || p?.visible === false);
      const willPublic = visibility === 'public';

      // update produk
      batch.update(d.ref, { visibility });

      // update counter user
      if (ownerId) {
        const uRef = db.collection('users').doc(ownerId);
        // productCount = jumlah produk PUBLIC yang tampil (agar UI lama tetap benar)
        if (wasPublic !== willPublic) {
          batch.set(
            uRef,
            { productCount: willPublic ? 1 : -1, publicProductCount: willPublic ? 1 : -1 },
            { merge: true }
          );
        }
      }

      // admin log
      batch.set(db.collection('admin_logs').doc(), {
        type: 'product_visibility_change',
        productId: d.id,
        from: wasPublic ? 'public' : 'hidden',
        to: willPublic ? 'public' : 'hidden',
        by: decoded.uid,
        at: new Date(),
      });

      processed++;
    }

    await batch.commit();
    return res.status(200).json({ processed });
  } catch (e: any) {
    console.error('/api/admin/products/visibility error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
