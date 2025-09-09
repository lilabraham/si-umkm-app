// LOKASI FILE: src/pages/api/produk/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin'; // DIUBAH: Menggunakan db dari Admin SDK
import type { Query } from 'firebase-admin/firestore';
import { sanitizeInput } from '@/lib/sanitize';

// DIUBAH: Interface disesuaikan agar konsisten
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopId: string; // Kunci penting untuk filter
  shopName: string;
  imageUrl: string;
  ownerId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  switch (req.method) {
    case 'GET':
      try {
        // BARU: Logika untuk filter berdasarkan ID Toko
        const { tokoId } = req.query;
        
        let productsQuery: Query = db.collection('products');

        if (tokoId && typeof tokoId === 'string') {
          // Menambahkan filter jika tokoId diberikan
          productsQuery = productsQuery.where('shopId', '==', tokoId);
        }
        
        const querySnapshot = await productsQuery.get();
        
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        res.status(200).json(products);

      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Gagal mengambil data produk', error });
      }
      break;

    case 'POST':
      try {
        // DIUBAH: Menambahkan shopId ke dalam data yang diterima
        const { name, price, description, ownerId, shopName, shopId, imageUrl } = req.body;
        
        if (!name || !price || !description || !ownerId || !shopName || !shopId) {
          return res.status(400).json({ message: 'Data tidak lengkap.' });
        }

        const sanitizedProductData = {
          name: sanitizeInput(name),
          price: Number(price),
          description: sanitizeInput(description),
          ownerId: ownerId,
          shopName: sanitizeInput(shopName),
          shopId: shopId, // shopId juga disimpan
          imageUrl: imageUrl,
          createdAt: new Date(), // Menambahkan timestamp
        };

        // DIUBAH: Menggunakan metode .add() dari Admin SDK
        const docRef = await db.collection('products').add(sanitizedProductData);
        
        res.status(201).json({ id: docRef.id, ...sanitizedProductData });

      } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ message: 'Gagal menyimpan data ke Firestore', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}