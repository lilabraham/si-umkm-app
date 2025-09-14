// LOKASI: src/pages/api/admin/moderation/bulk.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

type BulkAction = 'approve' | 'hide' | 'delete';
type ItemType = 'product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // ===== auth admin =====
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const adminAuth = getAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // ===== payload =====
    const { action, type, reportIds } = req.body as {
      action: BulkAction;
      type: ItemType;
      reportIds: string[];
    };

    if (!action || !type || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    if (type !== 'product') {
      return res.status(400).json({ error: 'Unsupported type' });
    }

    // Ambil report -> map ke produk
    const reportSnaps = await Promise.all(
      reportIds.map((id) => db.collection('reports').doc(id).get())
    );
    const validReports = reportSnaps.filter((d) => d.exists);
    const productIds = validReports.map((d) => (d.data() as any).itemId as string);

    const batch = db.batch();

    for (let i = 0; i < validReports.length; i++) {
      const rDoc = validReports[i];
      const rRef = db.collection('reports').doc(rDoc.id);
      const productId = (rDoc.data() as any).itemId as string;
      const pRef = db.collection('products').doc(productId);

      if (action === 'approve') {
        batch.update(rRef, {
          status: 'approved',
          resolvedAt: new Date(),
          resolvedBy: decoded.uid,
        });
        batch.update(pRef, {
          visible: true,
          isDeleted: false,
        });
      } else if (action === 'hide') {
        batch.update(rRef, {
          status: 'hidden',
          resolvedAt: new Date(),
          resolvedBy: decoded.uid,
        });
        batch.update(pRef, {
          visible: false,
        });
      } else if (action === 'delete') {
        // soft delete lebih aman; jika ingin hard delete, ganti jadi batch.delete(pRef)
        batch.update(rRef, {
          status: 'hidden',
          resolvedAt: new Date(),
          resolvedBy: decoded.uid,
          note: 'auto-hidden because product deleted',
        });
        batch.update(pRef, {
          isDeleted: true,
          visible: false,
          deletedAt: new Date(),
          deletedBy: decoded.uid,
        });
      }
    }

    await batch.commit();

    return res.status(200).json({
      ok: true,
      processed: validReports.length,
      productIds,
    });
  } catch (e: any) {
    console.error('[moderation:bulk] error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
