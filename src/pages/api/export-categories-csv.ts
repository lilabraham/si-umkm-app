// LOKASI FILE: src/pages/api/export-categories-csv.ts
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

    const snap = await db.collection('categories').get();

    const headers = ['id','name','slug','createdAt'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const rows: string[] = [headers.join(',')];
    snap.forEach((d) => {
      const c: any = d.data();
      const createdAt = c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : '';
      rows.push([esc(d.id), esc(c.name), esc(c.slug || ''), esc(createdAt)].join(','));
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="categories_export.csv"');
    res.status(200).send(rows.join('\r\n'));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to export categories' });
  }
}
