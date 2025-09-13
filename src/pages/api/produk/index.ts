// LOKASI FILE: src/pages/api/produk/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  shopName?: string;
  ownerId: string;
  category?: string;
  rating?: number;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { tokoId, kategori, q } = req.query as {
      tokoId?: string;
      kategori?: string;
      q?: string;
    };

    let ref: FirebaseFirestore.Query = db.collection('products');

    if (tokoId) {
      ref = ref.where('ownerId', '==', tokoId);
    }
    if (kategori) {
      ref = ref.where('category', '==', kategori);
    }

    // ⛔️ JANGAN orderBy di sini agar tidak perlu index komposit
    // // ref = ref.orderBy('createdAt', 'desc');

    const snap = await ref.get();
    let items: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    // Filter q (fallback sederhana)
    if (q && q.trim()) {
      const s = q.trim().toLowerCase();
      items = items.filter((p) => p.name?.toLowerCase().includes(s));
    }

    // ✅ Urutkan di memori berdasarkan createdAt desc jika ada
    items.sort(
      (a, b) =>
        (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
    );

    return res.status(200).json(items);
  } catch (e: any) {
    console.error('[GET /api/produk] Error:', e);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
}
