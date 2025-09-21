// LOKASI FILE: src/pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
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
    const { folder } = (req.body ?? {}) as { folder?: string };

    // Standarisasi folder
    const targetFolder =
      folder === 'profil' ? 'profil-penjual' : 'produk-umkm';

    // Gunakan preset "signed" (buat di dashboard Cloudinary)
    const uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET || 'si-umkm-app';

    // Parameter yang ikut ditandatangani
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, any> = {
      timestamp,
      upload_preset: uploadPreset,
      folder: targetFolder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: targetFolder,
      uploadPreset,
    });
  } catch (err) {
    console.error('Create signature error:', err);
    return res
      .status(500)
      .json({ error: 'Failed to create Cloudinary upload signature.' });
  }
}
