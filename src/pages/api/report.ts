// LOKASI FILE: src/pages/api/report.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const auth = getAuth();
const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Metode ${req.method} tidak diizinkan` });
  }

  try {
    // ⬇️ verifikasi login
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!idToken) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = await auth.verifyIdToken(idToken);
    const reporterUid = decoded.uid;

    const { productId, reason } = req.body || {};
    if (!productId || typeof reason !== 'string' || !reason.trim()) {
      return res.status(400).json({ error: 'productId dan reason wajib diisi.' });
    }

    // ⬇️ ambil data produk untuk denormalisasi (membantu admin)
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    const p = productDoc.data() as any;

    // larang penjual & admin melapor produk sendiri
    if (p?.ownerId === reporterUid) {
      return res.status(403).json({ error: 'Anda tidak dapat melaporkan produk Anda sendiri.' });
    }
    const reporterDoc = await db.collection('users').doc(reporterUid).get();
    const role = reporterDoc.data()?.role || 'pembeli';
    if (role === 'admin') {
      return res.status(403).json({ error: 'Admin tidak dapat membuat laporan.' });
    }

    // tulis ke koleksi "reports"
    const payload = {
      type: 'product' as const,
      productId,
      reason: reason.trim(),
      status: 'pending' as const,                // untuk admin/moderasi
      visibility: p?.visibility === 'hidden' ? 'hidden' : 'visible',
      reportedAt: FieldValue.serverTimestamp(),
      reporter: { uid: reporterUid, name: reporterDoc.data()?.displayName || '' },

      // denormalisasi info produk (muncul di tabel moderasi)
      product: {
        name: p?.name || '',
        shopName: p?.shopName || '',
        imageUrl: p?.imageUrl || '',
      },
    };

    const ref = await db.collection('reports').add(payload);
    return res.status(201).json({ id: ref.id });
  } catch (e: any) {
    console.error('[report] error:', e);
    return res.status(500).json({ error: 'Gagal membuat laporan.' });
  }
}
