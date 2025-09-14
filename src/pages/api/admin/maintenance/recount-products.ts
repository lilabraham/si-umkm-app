import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

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

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    const db = getFirestore();

    const adminDoc = await db.collection('users').doc(decoded.uid).get();
    if (adminDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // ambil semua produk
    const snap = await db.collection('products').get();

    // hitung per owner
    const map: Record<
      string,
      { total: number; publicCount: number }
    > = {};

    snap.forEach((doc) => {
      const p = doc.data() as any;
      const ownerId = String(p?.ownerId || '');
      if (!ownerId) return;
      const isPublic = !(p?.visibility === 'hidden' || p?.visible === false);
      if (!map[ownerId]) map[ownerId] = { total: 0, publicCount: 0 };
      map[ownerId].total += 1;
      if (isPublic) map[ownerId].publicCount += 1;
    });

    const batch = db.batch();
    Object.entries(map).forEach(([ownerId, v]) => {
      const ref = db.collection('users').doc(ownerId);
      batch.set(
        ref,
        {
          totalProductCount: v.total,
          publicProductCount: v.publicCount,
          productCount: v.publicCount, // agar UI lama langsung cocok
        },
        { merge: true }
      );
    });

    await batch.commit();
    return res.status(200).json({ owners: Object.keys(map).length });
  } catch (e: any) {
    console.error('/api/admin/maintenance/recount-products error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
