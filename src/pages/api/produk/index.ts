// src/pages/api/produk/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { sanitizeInput } from '@/lib/sanitize'; // <-- Impor fungsi sanitasi kita

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string;
  ownerId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const productsCollection = collection(db, 'products');

  switch (req.method) {
    case 'GET':
      try {
        const q = query(productsCollection);
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk', error });
      }
      break;

    case 'POST':
      try {
        const { name, price, description, ownerId, shopName, imageUrl } = req.body;
        
        if (!name || !price || !description || !ownerId || !shopName) {
          return res.status(400).json({ message: 'Data tidak lengkap.' });
        }

        // ================== PERUBAHAN DI SINI ==================
        // Bersihkan semua input teks dari pengguna sebelum disimpan
        const sanitizedProductData = {
          name: sanitizeInput(name),
          price: Number(price), // Pastikan harga adalah angka
          description: sanitizeInput(description),
          ownerId: ownerId, // ID tidak perlu disanitasi
          shopName: sanitizeInput(shopName),
          imageUrl: imageUrl, // URL gambar (Base64) tidak perlu disanitasi
        };
        // =======================================================

        const docRef = await addDoc(productsCollection, sanitizedProductData);
        
        res.status(201).json({ id: docRef.id, ...sanitizedProductData });
      } catch (error) {
        res.status(500).json({ message: 'Gagal menyimpan data ke Firestore', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}
