import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

async function getProductCountByOwner(ownerId: string) {
  try {
    const db = getFirestore(); // ⬅️ ambil di sini, jangan pakai variabel di luar scope
    // Aggregation count() jika tersedia:
    // @ts-ignore
    if (typeof (db.collection('products').where('ownerId', '==', ownerId) as any).count === 'function') {
      // @ts-ignore
      const agg = await (db.collection('products').where('ownerId', '==', ownerId) as any).count().get();
      // @ts-ignore
      return agg.data()?.count || 0;
    }
    // Fallback manual
    const snap = await db.collection('products').where('ownerId', '==', ownerId).get();
    return snap.size;
  } catch {
    return 0;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing toko id' });

  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Toko tidak ditemukan' });

    const u = userDoc.data() || {};
    const toko = {
      id: userDoc.id,
      name: (u as any).shopName || (u as any).displayName || 'Toko',
      imageUrl: (u as any).shopImageUrl || (u as any).photoURL || '',
      description: (u as any).description || '',
      productCount: await getProductCountByOwner(userDoc.id),
    };

    return res.status(200).json(toko);
  } catch (e: any) {
    console.error('[GET /api/toko/:id] Error:', e);
    return res.status(500).json({ error: 'Failed to fetch store' });
  }
}
