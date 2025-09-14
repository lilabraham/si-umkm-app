// LOKASI FILE: src/pages/api/reviews/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

type ReviewDTO = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const col = db.collection('reviews');

  // ====== GET: ambil review by productId (urut terbaru) ======
  if (req.method === 'GET') {
    try {
      const { productId } = req.query;
      if (typeof productId !== 'string' || !productId) {
        return res.status(400).json({ message: 'productId diperlukan.' });
      }

      // urutkan by createdAt desc → butuh index (sudah kamu buat)
      const snap = await col
        .where('productId', '==', productId)
        .orderBy('createdAt', 'desc')
        .get();

      const reviews: ReviewDTO[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt ? {
            seconds: data.createdAt._seconds ?? data.createdAt.seconds,
            nanoseconds: data.createdAt._nanoseconds ?? data.createdAt.nanoseconds,
          } : null
        };
      });

      return res.status(200).json(reviews);
    } catch (error) {
      console.error('API Reviews GET Error:', error);
      return res.status(500).json({ message: 'Gagal mengambil ulasan.' });
    }
  }

  // ====== POST: tambah review ======
  if (req.method === 'POST') {
    try {
      const { productId, userId, userName, rating, comment } = req.body as {
        productId: string; userId: string; userName: string; rating: number; comment: string;
      };
      if (!productId || !userId || !userName || !rating || !comment) {
        return res.status(400).json({ message: 'Data ulasan tidak lengkap.' });
      }

      // Verifikasi token (harus dikirim sebagai Bearer di header)
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Tidak terautentikasi.' });

      const adminAuth = getAuth();
      const decoded = await adminAuth.verifyIdToken(token);
      if (decoded.uid !== userId) return res.status(403).json({ message: 'Token tidak cocok.' });

      // Ambil role user dari koleksi users
      const userDoc = await db.collection('users').doc(userId).get();
      const role = userDoc.data()?.role as 'admin' | 'penjual' | 'pembeli' | undefined;

      // 1) Larang admin review
      if (role === 'admin') {
        return res.status(403).json({ message: 'Admin tidak dapat memberikan ulasan.' });
      }

      // Ambil pemilik produk
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
      const ownerId = productDoc.data()?.ownerId as string;

      // 2) Larang penjual review produknya sendiri
      if (decoded.uid === ownerId) {
        return res.status(403).json({ message: 'Anda tidak dapat mengulas produk milik Anda sendiri.' });
      }

      // 3) Batasi 1 review per user per produk
      const existing = await col
        .where('productId', '==', productId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!existing.empty) {
        return res.status(409).json({ message: 'Anda sudah pernah mengulas produk ini.' });
      }

      const newReview = {
        productId,
        userId,
        userName,
        rating: Number(rating),
        comment,
        createdAt: FieldValue.serverTimestamp(),
      };
      const docRef = await col.add(newReview);

      // kembalikan payload agar langsung tampil di UI
      return res.status(201).json({ id: docRef.id, ...newReview });
    } catch (error) {
      console.error('API Reviews POST Error:', error);
      return res.status(500).json({ message: 'Gagal menyimpan ulasan.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
}
