// LOKASI FILE: src/pages/api/toko/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
// DIHAPUS: Impor dari library sisi klien tidak lagi digunakan
// import { collection, getDocs, query, where, limit } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseAdmin';

interface Toko {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Toko | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Store ID is required.' });
  }

  try {
    // DIUBAH: Menggunakan metode query yang benar dari Firebase Admin SDK
    const productsRef = db.collection('products');
    const query = productsRef.where("shopId", "==", id).limit(1);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Toko tidak ditemukan.' });
    }

    const firstProduct = querySnapshot.docs[0].data();

    // Pastikan field yang dibutuhkan ada sebelum membuat respons
    if (!firstProduct.shopName || !firstProduct.imageUrl) {
        return res.status(500).json({ error: 'Data produk tidak lengkap.' });
    }

    const tokoData: Toko = {
      id: id,
      name: firstProduct.shopName,
      imageUrl: firstProduct.imageUrl,
      description: `Produk-produk berkualitas dari ${firstProduct.shopName}.`,
    };

    res.status(200).json(tokoData);

  } catch (error) {
    console.error(`Error fetching data for toko ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}