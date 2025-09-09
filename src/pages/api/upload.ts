// LOKASI FILE: src/pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary menggunakan kredensial dari .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Izinkan hanya metode POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { file } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    // Menggunakan Cloudinary Uploader API untuk meng-upload file
    const uploadResponse = await cloudinary.uploader.upload(file, {
      upload_preset: 'si-umkm-app', // PENTING: Ganti dengan Upload Preset Anda (lihat langkah 5)
      folder: 'produk-umkm', // Opsional: Menyimpan gambar dalam folder tertentu di Cloudinary
    });

    // Kirim kembali URL gambar yang aman
    res.status(200).json({ secure_url: uploadResponse.secure_url });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Something went wrong during the upload.' });
  }
}