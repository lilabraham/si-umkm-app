// LOKASI: src/pages/api/admin/categories/index.ts
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

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = await getAuth().verifyIdToken(token).catch(() => null);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    if (req.method === 'GET') {
      const snap = await db.collection('categories').orderBy('name').get();
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const { name, slug, icon } = req.body || {};
      if (!name || !slug) return res.status(400).json({ error: 'name & slug wajib' });

      const newSlug = String(slug).toLowerCase();
      const exists = await db.collection('categories').where('slug', '==', newSlug).limit(1).get();
      if (!exists.empty) return res.status(409).json({ error: 'Slug sudah digunakan' });

      const ref = await db.collection('categories').add({
        name: String(name),
        slug: newSlug,
        icon: icon ? String(icon) : '',
        createdAt: FieldValue.serverTimestamp(),
      });

      await db.collection('admin_logs').add({
        type: 'category_create',
        categoryId: ref.id,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ ok: true, id: ref.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[categories:index] Uncaught error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
