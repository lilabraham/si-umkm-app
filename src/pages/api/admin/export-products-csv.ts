// LOKASI FILE: src/pages/api/admin/export-products-csv.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nookies from 'nookies';

const normVis = (v: any) => String(v ?? 'public').trim().toLowerCase();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = nookies.get({ req });
    const tokenStr = cookies.token || '';

    const { getAuth, getFirestore } = await import('@/lib/firebaseAdmin');
    const adminAuth = getAuth();
    const db = getFirestore();

    const decoded = await adminAuth.verifyIdToken(tokenStr);
    const me = await db.collection('users').doc(decoded.uid).get();
    if (me.data()?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // AMBIL SEMUA PRODUK (tidak mem-filter visibility)
    const snap = await db.collection('products').get();

    // Header CSV (lengkap & kompatibel analytics)
    const headers = [
      'id','name','price','category','ownerId','shopId','shopName','visibility','imageUrl','createdAt'
    ];

    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows: string[] = [];
    rows.push(headers.join(','));

    snap.forEach((d) => {
      const p = d.data() as any;
      const createdAt = p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : '';
      const visibility = normVis(p.visibility); // default ke "public" bila kosong

      rows.push([
        esc(d.id),
        esc(p.name),
        esc(p.price),
        esc(p.category || ''),
        esc(p.ownerId || ''),
        esc(p.shopId || ''),
        esc(p.shopName || ''),
        esc(visibility),
        esc(p.imageUrl || ''),
        esc(createdAt),
      ].join(','));
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
    res.status(200).send(rows.join('\r\n'));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to export' });
  }
}
