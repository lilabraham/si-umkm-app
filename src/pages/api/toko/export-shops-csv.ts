// LOKASI FILE: src\pages\api\toko\export-shops-csv.ts
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
    if (me.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // Ambil user role=penjual
    const snap = await db.collection('users').where('role', '==', 'penjual').get();

    const headers = ['uid','displayName','shopName','email','whatsapp','productCount','createdAt'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows: string[] = [headers.join(',')];
    snap.forEach((d) => {
      const u: any = d.data();
      const createdAt = u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : '';
      rows.push([
        esc(d.id),
        esc(u.displayName),
        esc(u.shopName),
        esc(u.email),
        esc(u.whatsapp),
        esc(u.productCount ?? 0),
        esc(createdAt),
      ].join(','));
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="shops_export.csv"');
    res.status(200).send(rows.join('\r\n'));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to export shops' });
  }
}
