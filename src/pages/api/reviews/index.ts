// src/pages/api/reviews/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reviewsCollection = collection(db, 'reviews');

  if (req.method === 'GET') {
    try {
      const { productId } = req.query;

      if (typeof productId !== 'string' || !productId) {
        return res.status(400).json({ message: 'productId diperlukan.' });
      }

      // PERBAIKAN: Hapus orderBy untuk menghindari error 'missing index'.
      // Pengurutan bisa dilakukan di front-end jika diperlukan.
      const q = query(
        reviewsCollection, 
        where("productId", "==", productId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json(reviews);

    } catch (error) {
      console.error("API Reviews Error:", error);
      res.status(500).json({ message: 'Gagal mengambil ulasan.', error });
    }
  } 
  else if (req.method === 'POST') {
    // ... (Logika POST tidak berubah) ...
    try {
      const { productId, userId, userName, rating, comment } = req.body;
      if (!productId || !userId || !userName || !rating || !comment) {
        return res.status(400).json({ message: 'Data ulasan tidak lengkap.' });
      }
      const newReview = {
        productId, userId, userName,
        rating: Number(rating),
        comment,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(reviewsCollection, newReview);
      // Kirim kembali data yang baru dibuat agar bisa langsung ditampilkan
      res.status(201).json({ id: docRef.id, ...newReview, createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } });

    } catch (error) {
      res.status(500).json({ message: 'Gagal menyimpan ulasan.', error });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}
