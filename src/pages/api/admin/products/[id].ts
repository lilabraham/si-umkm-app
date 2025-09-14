import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

function getToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.substring(7);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookie = (req as any).cookies?.token || null;
  return cookie || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

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

    const ref = db.collection('products').doc(id);

    if (req.method === 'PUT') {
      const { name, price, description, imageUrl, category } = req.body || {};
      const payload: Record<string, unknown> = {};
      if (typeof name === 'string') payload.name = name;
      if (typeof price === 'number' && !Number.isNaN(price)) payload.price = price;
      if (typeof description === 'string') payload.description = description;
      if (typeof imageUrl === 'string') payload.imageUrl = imageUrl;
      if (typeof category === 'string') payload.category = category;

      await ref.update(payload);

      await db.collection('admin_logs').add({
        type: 'product_update',
        productId: id,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
        fields: Object.keys(payload),
      });

      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await ref.delete();

      await db.collection('admin_logs').add({
        type: 'product_delete',
        productId: id,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('/api/admin/products/[id] error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
