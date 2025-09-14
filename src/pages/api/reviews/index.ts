import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const col = db.collection('reviews');

  if (req.method === 'GET') {
    try {
      const { productId } = req.query;
      if (typeof productId !== 'string' || !productId) {
        return res.status(400).json({ message: 'productId diperlukan.' });
        }
      const snap = await col.where('productId', '==', productId).get();
      const reviews = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      return res.status(200).json(reviews);
    } catch (error) {
      console.error('API Reviews Error:', error);
      return res.status(500).json({ message: 'Gagal mengambil ulasan.', error });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, userId, userName, rating, comment } = req.body;
      if (!productId || !userId || !userName || !rating || !comment) {
        return res.status(400).json({ message: 'Data ulasan tidak lengkap.' });
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
      return res.status(201).json({ id: docRef.id, ...newReview });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menyimpan ulasan.', error });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}
