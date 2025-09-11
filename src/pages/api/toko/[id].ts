// LOKASI FILE: src/pages/api/toko/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
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
    // LOGIKA DIUBAH: Langsung ambil data dari koleksi 'users' berdasarkan ID penjual/toko
    const userDocRef = db.collection('users').doc(id);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Toko tidak ditemukan.' });
    }
    
    const userData = userDoc.data();
    if (!userData) {
      return res.status(404).json({ error: 'Data toko tidak lengkap.' });
    }

    const tokoData: Toko = {
      id: id,
      name: userData.shopName || userData.displayName || 'Nama Toko Belum Diatur',
      imageUrl: userData.shopImageUrl || '', // Mengambil gambar utama dari profil
      description: userData.description || `Produk-produk berkualitas dari ${userData.shopName}`,
    };

    res.status(200).json(tokoData);

  } catch (error) {
    console.error(`Error fetching data for toko ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}