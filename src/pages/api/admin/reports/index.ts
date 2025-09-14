import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

const auth = getAuth();
const db = getFirestore();

function getToken(req: NextApiRequest): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.substring(7);
  // @ts-ignore
  const cookie = req.cookies?.token || null;
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

    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const type = String(req.query.type || 'product');     // product|review|all
    const status = String(req.query.status || 'pending'); // pending|resolved|all
    const q = String(req.query.q || '').toLowerCase();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '20'), 10)));

    const snap = await db.collection('reports').orderBy('createdAt', 'desc').limit(500).get();
    let items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    // filter
    items = items.filter((r) => (type === 'all' ? true : r.targetType === type));
    if (status !== 'all') items = items.filter((r) => r.status === status);

    // enrich product
    const productIds = items.filter((r) => r.targetType === 'product').map((r) => r.targetId as string);
    const uniqueProductIds = Array.from(new Set(productIds)).slice(0, 50);
    const productsMap: Record<string, any> = {};
    if (uniqueProductIds.length) {
      const results = await Promise.all(uniqueProductIds.map((pid) => db.collection('products').doc(pid).get()));
      results.forEach((doc) => {
        if (doc.exists) {
          const d = doc.data() as any;
          productsMap[doc.id] = {
            id: doc.id,
            name: d.name || '',
            imageUrl: d.imageUrl || '',
            shopName: d.shopName || '',
            category: d.category || '',
            price: d.price || 0,
            visibility: d.visibility || 'public',
          };
        }
      });
    }

    // search
    const key = q.trim();
    if (key) {
      items = items.filter((r) => {
        const inReason = String(r.reason || '').toLowerCase().includes(key);
        if (r.targetType === 'product') {
          const p = productsMap[r.targetId];
          const inProd =
            String(p?.name || '').toLowerCase().includes(key) ||
            String(p?.shopName || '').toLowerCase().includes(key) ||
            String(r.targetId).toLowerCase().includes(key);
          return inReason || inProd;
        }
        return inReason || String(r.targetId).toLowerCase().includes(key);
      });
    }

    items = items.map((r) => (r.targetType === 'product' ? { ...r, product: productsMap[r.targetId] || null } : r));

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);

    return res.status(200).json({ items: pageItems });
  } catch (e) {
    console.error('/api/admin/reports GET error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
    