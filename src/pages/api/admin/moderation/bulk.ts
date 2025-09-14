import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

type BulkAction = 'approve' | 'hide' | 'delete';

function getToken(req: NextApiRequest): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.substring(7);
  // @ts-ignore
  const cookie = req.cookies?.token || null;
  return cookie || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized: missing token' });

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { action, type, reportIds } = req.body as {
      action: BulkAction;
      type: 'product';
      reportIds: string[];
    };

    if (type !== 'product') return res.status(400).json({ error: 'Unsupported type' });
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: 'Empty reportIds' });
    }
    if (!['approve', 'hide', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const rDocs = await Promise.all(
      reportIds.map((id) => db.collection('reports').doc(id).get())
    );

    const batch = db.batch();
    let processed = 0;

    for (const rDoc of rDocs) {
      if (!rDoc.exists) continue;
      const r = rDoc.data() as any;

      const productId = String(
        r?.targetId ?? r?.itemId ?? r?.productId ?? r?.product?.productId ?? ''
      ).trim();

      // siapkan info produk
      let ownerId: string | null = null;
      let wasPublic = false;
      const pDoc = productId ? await db.collection('products').doc(productId).get() : null;
      if (pDoc?.exists) {
        const p = pDoc.data() as any;
        ownerId = String(p?.ownerId || '');
        wasPublic = !(p?.visibility === 'hidden' || p?.visible === false);
      }

      // === aksi ke produk
      if (productId && pDoc?.exists) {
        const pRef = db.collection('products').doc(productId);
        if (action === 'approve') {
          if (!wasPublic) batch.update(pRef, { visibility: 'public' });
        } else if (action === 'hide') {
          if (wasPublic) batch.update(pRef, { visibility: 'hidden' });
        } else if (action === 'delete') {
          batch.delete(pRef);
        }
      }

      // === resolve report
      batch.update(db.collection('reports').doc(rDoc.id), {
        status: 'resolved',
        resolution: action,
        resolvedAt: FieldValue.serverTimestamp(),
        resolvedBy: decoded.uid,
      });

      // === admin log
      batch.set(db.collection('admin_logs').doc(), {
        type: 'report_resolve',
        action,
        reportId: rDoc.id,
        targetType: 'product',
        targetId: productId || null,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
      });

      // === counter users
      if (ownerId) {
        const uRef = db.collection('users').doc(ownerId);

        if (action === 'approve') {
          // hidden -> public
          if (!wasPublic) {
            batch.set(
              uRef,
              {
                publicProductCount: FieldValue.increment(1),
                productCount: FieldValue.increment(1), // agar UI lama yang pakai productCount ikut benar
              },
              { merge: true }
            );
          }
        } else if (action === 'hide') {
          // public -> hidden
          if (wasPublic) {
            batch.set(
              uRef,
              {
                publicProductCount: FieldValue.increment(-1),
                productCount: FieldValue.increment(-1),
              },
              { merge: true }
            );
          }
        } else if (action === 'delete') {
          // delete: total -1; jika sebelumnya public → publicCount & productCount -1
          const data: any = { totalProductCount: FieldValue.increment(-1) };
          if (wasPublic) {
            data.publicProductCount = FieldValue.increment(-1);
            data.productCount = FieldValue.increment(-1);
          }
          batch.set(uRef, data, { merge: true });
        }
      }

      processed++;
    }

    await batch.commit();
    return res.status(200).json({ processed });
  } catch (e: any) {
    console.error('[moderation:bulk] error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
