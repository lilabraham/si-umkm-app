// LOKASI FILE: src/pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // DIUBAH: Sekarang kita juga menerima 'folder' dari body request
    const { file, folder } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    // Tentukan folder tujuan di Cloudinary, defaultnya 'produk-umkm'
    const targetFolder = folder === 'profil' ? 'profil-penjual' : 'produk-umkm';

    const uploadResponse = await cloudinary.uploader.upload(file, {
      upload_preset: 'si-umkm-app', // PASTIKAN NAMA PRESET ANDA BENAR
      folder: targetFolder, // Menggunakan folder yang sudah ditentukan
    });

    res.status(200).json({ secure_url: uploadResponse.secure_url });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Something went wrong during the upload.' });
  }
}