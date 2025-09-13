// LOKASI FILE: src/pages/api/toko/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

async function getProductCountByOwner(ownerId: string) {
  try {
    const productsRef = db.collection('products').where('ownerId', '==', ownerId);
    const agg = await productsRef.count().get();
    return agg.data().count || 0;
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
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Toko tidak ditemukan' });

    const u = userDoc.data() || {};
    const toko = {
      id: userDoc.id,
      name: u.shopName || u.displayName || 'Toko',
      imageUrl: u.shopImageUrl || u.photoURL || '',
      description: u.description || '',
      productCount: await getProductCountByOwner(userDoc.id),
      // tambahkan field lain bila perlu (whatsapp, social, dsb)
    };

    return res.status(200).json(toko);
  } catch (e: any) {
    console.error('[GET /api/toko/:id] Error:', e);
    return res.status(500).json({ error: 'Failed to fetch store' });
  }
}
