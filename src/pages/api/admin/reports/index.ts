// LOKASI: src/pages/api/report/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

function getToken(req: NextApiRequest): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.substring(7);
  // @ts-ignore - Next.js types
  const cookie = req.cookies?.token || null;
  return cookie || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Non-cache
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;

    const db = getFirestore();

    // Validasi input
    const { productId, reason } = (req.body || {}) as {
      productId?: string;
      reason?: string;
    };
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'productId required' });
    }
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return res.status(400).json({ error: 'reason required' });
    }

    // Verifikasi user role (buyer diutamakan; admin tidak boleh)
    const userDoc = await db.collection('users').doc(uid).get();
    const userRole = (userDoc.data()?.role || '').toString();
    if (userRole === 'admin') {
      return res.status(403).json({ error: 'Admin cannot submit reports' });
    }

    // Ambil snapshot produk untuk memo tampilan di admin
    const prodDoc = await db.collection('products').doc(productId).get();
    if (!prodDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const p = prodDoc.data() as any;

    // Tulis KE ROOT COLLECTION 'reports'
    // Skema SELARAS dgn /api/admin/reports + Moderation baru:
    // targetType: 'product' | targetId: productId
    // status: 'pending'  (nanti jadi 'resolved' + resolution: approve/hide/delete)
    // createdAt: serverTimestamp
    // createdBy: uid
    // snapshot produk dasar untuk tampilan admin
    const docRef = await db.collection('reports').add({
      targetType: 'product',
      targetId: productId,
      reason: reason.trim(),
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      createdBy: uid,
      product: {
        name: p?.name || '',
        shopName: p?.shopName || '',
        imageUrl: p?.imageUrl || '',
        category: p?.category || '',
        price: p?.price || 0,
        visibility: p?.visibility ?? (p?.visible === false ? 'hidden' : 'public'),
      },
    });

    return res.status(201).json({ ok: true, id: docRef.id });
  } catch (e: any) {
    console.error('/api/report POST error', e);
    if (e?.code === 'auth/argument-error' || e?.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }
    return res.status(500).json({ error: 'Internal error' });
  }
}
