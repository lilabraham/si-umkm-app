// src/pages/api/produk/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID tidak valid.' });
  }

  const productDocRef = doc(db, 'products', id);

  switch (req.method) {
    // ================== LOGIKA BARU UNTUK GET ==================
    case 'GET':
      try {
        const docSnap = await getDoc(productDocRef);

        if (!docSnap.exists()) {
          return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        // Kirim kembali data produk yang ditemukan beserta ID-nya
        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk.', error });
      }
      break;
    // ==========================================================

    case 'DELETE':
      try {
        await deleteDoc(productDocRef);
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus produk.', error });
      }
      break;

    case 'PUT':
      try {
        const newData = req.body;
        await updateDoc(productDocRef, newData);
        const updatedDoc = await getDoc(productDocRef);
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
      } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui produk.', error });
      }
      break;

    default:
      // Tambahkan 'GET' ke header 'Allow'
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}
