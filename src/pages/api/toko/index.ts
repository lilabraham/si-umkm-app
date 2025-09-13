// LOKASI FILE: src/pages/api/toko/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

// Helper: ambil jumlah produk ownerId via Aggregation count()
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

  try {
    // asumsi: users berperan sebagai toko saat role === 'penjual'
    const usersSnap = await db.collection('users').where('role', '==', 'penjual').get();

    const stores = await Promise.all(
      usersSnap.docs.map(async (docu) => {
        const u = docu.data() || {};
        const id = docu.id;

        // Urutan fallback foto toko: shopImageUrl -> photoURL -> ''
        const imageUrl = u.shopImageUrl || u.photoURL || '';

        // Nama toko fallback: shopName -> displayName -> 'Toko'
        const name = u.shopName || u.displayName || 'Toko';

        // Opsional bio/desc (kalau ada)
        const description = u.description || '';

        // ⬇️ Pakai nilai denormalisasi bila tersedia, fallback ke aggregation count
        const rawCount =
          typeof u.productCount === 'number'
           ? u.productCount
            : await getProductCountByOwner(id);

        const productCount = Math.max(0, Number(rawCount) || 0);

        return { id, name, imageUrl, productCount, description };
      })
    );

    // (opsional) sort nama toko biar rapi
    stores.sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json(stores);
  } catch (e: any) {
    console.error('[GET /api/toko] Error:', e);
    return res.status(500).json({ error: 'Failed to fetch stores' });
  }
}
