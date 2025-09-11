// LOKASI FILE: src/pages/api/toko/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

interface Toko {
  id: string;
  name: string;
  imageUrl: string;
  productCount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Toko[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // 1. Ambil semua PENGGUNA yang perannya 'penjual'
    const sellersSnapshot = await db.collection('users').where('role', '==', 'penjual').get();
    if (sellersSnapshot.empty) {
      return res.status(200).json([]);
    }
    
    // 2. Ambil semua PRODUK untuk dihitung
    const productsSnapshot = await db.collection('products').get();
    const allProducts = productsSnapshot.docs.map(doc => doc.data());

    // 3. Buat peta untuk menghitung jumlah produk per toko
    const productCounts = new Map<string, number>();
    for (const product of allProducts) {
      if (product.ownerId) {
        productCounts.set(product.ownerId, (productCounts.get(product.ownerId) || 0) + 1);
      }
    }

    // 4. Buat daftar toko final berdasarkan data profil penjual
    const tokoList: Toko[] = sellersSnapshot.docs.map(doc => {
      const sellerData = doc.data();
      const sellerId = doc.id;

      return {
        id: sellerId,
        name: sellerData.shopName || sellerData.displayName || 'Nama Toko Belum Diatur',
        // Mengambil gambar utama dari profil penjual (shopImageUrl)
        imageUrl: sellerData.shopImageUrl || '', 
        // Mengambil jumlah produk dari hasil hitungan
        productCount: productCounts.get(sellerId) || 0,
      };
    });

    res.status(200).json(tokoList);

  } catch (error) {
    console.error('Error fetching toko list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}