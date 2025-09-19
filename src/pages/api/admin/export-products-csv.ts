// LOKASI FILE: src/pages/api/admin/export-products-csv.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nookies from 'nookies';

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

    // Ambil produk "public" saja untuk keperluan penyajian data
    const snap = await db.collection('products').where('visibility', '==', 'public').get();

    // Header CSV
    const headers = [
      'id','name','price','category','shopId','shopName','imageUrl','createdAt'
    ];

    // Escape CSV helper
    const esc = (v: any) => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows: string[] = [];
    rows.push(headers.join(','));

    snap.forEach((d) => {
      const p = d.data() as any;
      const createdAt = p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : '';
      rows.push([
        esc(d.id),
        esc(p.name),
        esc(p.price),
        esc(p.category || ''),
        esc(p.shopId || p.ownerId || ''),
        esc(p.shopName || ''),
        esc(p.imageUrl || ''),
        esc(createdAt),
      ].join(','));
    });

    const csv = rows.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
    res.status(200).send(csv);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to export' });
  }
}
