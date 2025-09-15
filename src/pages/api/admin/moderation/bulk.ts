import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const auth = getAuth();
const db = getFirestore();

function pickToken(req: NextApiRequest): string | null {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  // @ts-ignore
  return req.cookies?.token || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = pickToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = await auth.verifyIdToken(token);
    const me = await db.collection('users').doc(decoded.uid).get();
    if (me.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { action, type, reportIds } = (req.body || {}) as {
      action: 'approve' | 'hide' | 'delete';
      type: 'product';                // saat ini hanya produk
      reportIds: string[];
    };

    if (type !== 'product') return res.status(400).json({ error: 'only product supported' });
    if (!['approve', 'hide', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'invalid action' });
    }
    if (!Array.isArray(reportIds) || !reportIds.length) {
      return res.status(400).json({ error: 'reportIds required' });
    }

    // Ambil dokumen report yang dipilih
    const reportDocs = await Promise.all(
      reportIds.map((id) => db.collection('reports').doc(id).get())
    );
    const pickedReports = reportDocs
      .filter((d) => d.exists)
      .map((d) => ({ id: d.id, ...(d.data() as any) }));

    if (!pickedReports.length) {
      return res.status(200).json({ ok: true, processed: 0, owners: 0, affectedReports: 0 });
    }

    const ownersSet = new Set<string>();
    const affectedProductIds = new Set<string>();

    // ====== 1) Update produk + resolve report yang dipilih ======
    const batch1 = db.batch();
    let affectedProducts = 0;

    for (const r of pickedReports) {
      // Kompatibel skema lama/baru: targetId || productId
      const targetId: string | undefined =
        (r && (r.targetId || r.productId)) ? String(r.targetId || r.productId) : undefined;

      // Resolve report walau target tidak ada supaya tidak nyangkut
      const reportRef = db.collection('reports').doc(r.id);

      if (!targetId) {
        batch1.update(reportRef, {
          status: 'resolved',
          resolution: action,
          resolvedAt: FieldValue.serverTimestamp(),
          resolvedBy: decoded.uid,
          note: 'no target id in report',
        });
        continue;
      }

      const prodRef = db.collection('products').doc(targetId);
      const prodDoc = await prodRef.get();

      if (prodDoc.exists) {
        const pdata = prodDoc.data() as any;
        const ownerId = pdata?.ownerId;
        if (ownerId) ownersSet.add(ownerId);
        affectedProductIds.add(targetId);

        if (action === 'approve') {
          batch1.update(prodRef, { visibility: 'public' });
          affectedProducts++;
        } else if (action === 'hide') {
          batch1.update(prodRef, { visibility: 'hidden' });
          affectedProducts++;
        } else if (action === 'delete') {
          batch1.delete(prodRef);
          affectedProducts++;
        }

        const logRef = db.collection('admin_logs').doc();
        batch1.set(logRef, {
          type: 'report_resolve',
          action,
          reportId: r.id,
          targetType: 'product',
          targetId,
          ownerId,
          by: decoded.uid,
          at: FieldValue.serverTimestamp(),
        });
      }

      batch1.update(reportRef, {
        status: 'resolved',
        resolution: action,
        resolvedAt: FieldValue.serverTimestamp(),
        resolvedBy: decoded.uid,
      });
    }

    await batch1.commit();

    // ====== 2) AUTO-RESOLVE report saudara untuk produk yang sama ======
    // (supaya baris lain yang menimpa produk sama tidak membingungkan)
    let siblingResolved = 0;
    const productIds = Array.from(affectedProductIds);

    // Firestore 'in' max 10 item → chunking sederhana
    const chunks: string[][] = [];
    for (let i = 0; i < productIds.length; i += 10) chunks.push(productIds.slice(i, i + 10));

    for (const ids of chunks) {
      // Ambil semua report untuk productIds ini
      const qSnap = await db
        .collection('reports')
        .where('productId', 'in', ids) // skema kita memakai productId
        .get();

      if (!qSnap.empty) {
        const batch2 = db.batch();
        qSnap.docs.forEach((doc) => {
          // skip yang sudah dipilih (sudah di-resolve pada batch1)
          if (reportIds.includes(doc.id)) return;

          const data = doc.data() as any;
          // hanya resolve yang masih pending (hindari write tidak perlu)
          if ((data?.status || 'pending') !== 'pending') return;

          batch2.update(doc.ref, {
            status: 'resolved',
            resolution: action,
            resolvedAt: FieldValue.serverTimestamp(),
            resolvedBy: decoded.uid,
            note: 'auto-resolved (same product)',
          });
          siblingResolved++;
        });

        if ((batch2 as any)._ops?.length) {
          await batch2.commit();
        }
      }
    }

    // ====== 3) RECOUNT authoritatif per owner (idempotent & aman) ======
    const owners = Array.from(ownersSet);
    await Promise.all(
      owners.map(async (ownerId) => {
        const [pubSnap, allSnap] = await Promise.all([
          db
            .collection('products')
            .where('ownerId', '==', ownerId)
            .where('visibility', '==', 'public')
            .get(),
          db.collection('products').where('ownerId', '==', ownerId).get(),
        ]);

        const publicCount = pubSnap.size;
        const totalCount = allSnap.size;

        await db.collection('users').doc(ownerId).update({
          publicProductCount: publicCount,
          productCount: publicCount, // kompatibel UI
          totalProductCount: totalCount,
          updatedAt: FieldValue.serverTimestamp(),
        });
      })
    );

    // ====== 4) Revalidate halaman publik agar cache segera segar ======
    try {
      await res.revalidate('/produk/produk');
    } catch (_) {}
    for (const ownerId of owners) {
      try {
        await res.revalidate(`/toko/${encodeURIComponent(ownerId)}`);
      } catch (_) {}
    }

    return res.status(200).json({
      ok: true,
      processed: affectedProducts,
      owners: owners.length,
      affectedReports: pickedReports.length + siblingResolved,
      siblingResolved,
    });
  } catch (e) {
    console.error('/api/admin/moderation/bulk error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
