// LOKASI FILE: src/pages/api/toko/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

interface Toko {
  id: string;
  name: string;
  imageUrl: string;
}

// DIUBAH: Interface disesuaikan dengan field yang ada di Firestore Anda
interface ProductDoc {
  id: string;
  shopName: string;  // Ini yang akan kita gunakan
  imagegirl: string; // Nama field gambar Anda adalah 'imagegirl'
  // 'shopId' tidak ada di data Anda, jadi kita hapus dari ekspektasi
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
    const productsCollectionRef = db.collection('products');
    const productsSnapshot = await productsCollectionRef.get();
    
    if (productsSnapshot.empty) {
      return res.status(200).json([]);
    }

    const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDoc));

    const tokoMap = new Map<string, Toko>();
    for (const product of allProducts) {
      // DIUBAH: Logika disederhanakan, hanya butuh shopName
      if (product.shopName) {
        // DIUBAH: Menggunakan shopName sebagai ID unik di Map
        if (!tokoMap.has(product.shopName)) {
          tokoMap.set(product.shopName, {
            // Karena tidak ada shopId, kita gunakan shopName sebagai ID
            // Kita ubah menjadi format URL-friendly (slug)
            id: product.shopName.toLowerCase().replace(/\s+/g, '-'), 
            name: product.shopName,
            // DIUBAH: Menggunakan 'imagegirl' sebagai sumber gambar
            imageUrl: product.imagegirl, 
          });
        }
      }
    }
    const uniqueTokoList = Array.from(tokoMap.values());

    res.status(200).json(uniqueTokoList);

  } catch (error) {
    console.error('Error fetching unique toko list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}