import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { ids, action } = req.body as { ids: string[]; action: 'approve' | 'hide' | 'delete' };
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids required' });
    if (!['approve', 'hide', 'delete'].includes(action)) return res.status(400).json({ error: 'invalid action' });

    const getDocs = await Promise.all(ids.map((id) => db.collection('reports').doc(id).get()));
    const reports = getDocs.filter((d) => d.exists).map((d) => ({ id: d.id, ...(d.data() as any) }));

    const batch = db.batch();
    for (const r of reports) {
      if (r.targetType === 'product') {
        const ref = db.collection('products').doc(r.targetId);
        if (action === 'approve') batch.update(ref, { visibility: 'public' });
        if (action === 'hide') batch.update(ref, { visibility: 'hidden' });
        if (action === 'delete') batch.delete(ref);
      }

      const reportRef = db.collection('reports').doc(r.id);
      batch.update(reportRef, {
        status: 'resolved',
        resolvedAt: FieldValue.serverTimestamp(),
        resolvedBy: decoded.uid,
        resolution: action,
      });

      const logRef = db.collection('admin_logs').doc();
      batch.set(logRef, {
        type: 'report_resolve',
        action,
        reportId: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    return res.status(200).json({ ok: true, count: reports.length });
  } catch (e) {
    console.error('/api/admin/reports/resolve error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
