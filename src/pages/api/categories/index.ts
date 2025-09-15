// LOKASI: src/pages/api/categories/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebaseAdmin';

// Skema yang direturn ke client
type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  isActive: boolean;
};

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cache untuk client/CDN; data kategori berubah jarang.
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const q = String(req.query.q || '').toLowerCase();
    const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '100'), 10)));

    // Koleksi: "categories"
    // Field umum yang kita dukung: name, slug, iconUrl (opsional), isActive (opsional)
    // Kalau isActive tidak ada → dianggap true (backward compatible).
    const snap = await db.collection('categories').orderBy('name', 'asc').limit(limit).get();

    let items: CategoryDTO[] = snap.docs.map((d) => {
      const c = d.data() as any;
      return {
        id: d.id,
        name: String(c?.name || ''),
        slug: String(c?.slug || ''),
        iconUrl: c?.iconUrl ? String(c.iconUrl) : null,
        isActive: typeof c?.isActive === 'boolean' ? c.isActive : true,
      };
    });

    // filter aktif
    items = items.filter((c) => c.isActive);

    // filter pencarian jika ada
    if (q) {
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ items });
  } catch (e) {
    console.error('/api/categories GET error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
