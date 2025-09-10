// LOKASI FILE: src/pages/api/toko/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

interface Toko {
  id: string;
  name: string;
  imageUrl: string;
  productCount: number; // Tambahkan properti ini
}

interface ProductData {
  shopId: string;    
  shopName: string;  
  imageUrl?: string;
  imagegirl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Toko[] | { error: string }>
) {
  if (req.method !== 'GET') { /* ... */ }

  try {
    const productsSnapshot = await db.collection('products').get();
    if (productsSnapshot.empty) return res.status(200).json([]);

    const allProducts = productsSnapshot.docs.map(doc => doc.data() as ProductData);

    // DIUBAH: Sekarang kita tidak hanya menyimpan data toko, tapi juga menghitung produknya
    const tokoMap = new Map<string, { name: string; imageUrl: string; productCount: number }>();

    for (const product of allProducts) {
      if (product.shopId && product.shopName) {
        if (!tokoMap.has(product.shopId)) {
          // Jika toko baru, inisialisasi dengan data & hitungan 1
          tokoMap.set(product.shopId, {
            name: product.shopName,
            imageUrl: product.imageUrl || product.imagegirl || '',
            productCount: 1, 
          });
        } else {
          // Jika toko sudah ada, cukup tambah hitungan produknya
          const currentToko = tokoMap.get(product.shopId)!;
          currentToko.productCount++;
        }
      }
    }

    // Ubah Map menjadi array dengan format yang benar
    const uniqueTokoList: Toko[] = Array.from(tokoMap.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));

    res.status(200).json(uniqueTokoList);

  } catch (error) {
    console.error('Error fetching unique toko list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}