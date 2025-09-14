import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

function getToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.substring(7);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookie = (req as any).cookies?.token || null;
  return cookie || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const auth = getAuth();
    const db = getFirestore();

    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // query params
    const q = String(req.query.q || '').toLowerCase();
    const sellerId = String(req.query.sellerId || '');
    const category = String(req.query.category || '');
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '20'), 10)));

    const snap = await db.collection('products').orderBy('createdAt', 'desc').limit(500).get();
    let items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    if (sellerId && sellerId !== 'all') items = items.filter((p) => p.ownerId === sellerId);
    if (category && category !== 'all') items = items.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());
    if (q) {
      const k = q.trim();
      items = items.filter(
        (p) =>
          String(p.name || '').toLowerCase().includes(k) ||
          String(p.description || '').toLowerCase().includes(k) ||
          String(p.shopName || '').toLowerCase().includes(k)
      );
    }

    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);
    return res.status(200).json({ items: pageItems });
  } catch (e) {
    console.error('/api/admin/products GET error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
