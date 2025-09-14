// LOKASI: src/pages/api/admin/categories/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

function getToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7);
  // @ts-ignore
  return req.cookies?.token || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { id } = req.query as { id: string };

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = await getAuth().verifyIdToken(token).catch(() => null);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const ref = db.collection('categories').doc(id);

    if (req.method === 'PUT') {
      const { name, slug, icon } = req.body || {};
      if (!name || !slug) return res.status(400).json({ error: 'name & slug wajib' });

      const docSnap = await ref.get();
      if (!docSnap.exists) return res.status(404).json({ error: 'Not found' });

      const current = docSnap.data() as any;
      const nextSlug = String(slug).toLowerCase();

      if (current.slug !== nextSlug) {
        const exists = await db.collection('categories').where('slug', '==', nextSlug).limit(1).get();
        if (!exists.empty) return res.status(409).json({ error: 'Slug sudah digunakan' });
      }

      await ref.update({ name: String(name), slug: nextSlug, icon: icon ? String(icon) : '' });

      await db.collection('admin_logs').add({
        type: 'category_update',
        categoryId: id,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await ref.delete();

      await db.collection('admin_logs').add({
        type: 'category_delete',
        categoryId: id,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[categories:[id]] Uncaught error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
