// src/pages/api/admin/logout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Hapus cookie dengan mengatur masa berlakunya ke masa lalu
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      expires: new Date(0), // Atur tanggal kadaluarsa ke masa lalu
      sameSite: 'strict',
      path: '/',
    }));
    res.status(200).json({ success: true, message: 'Logout berhasil' });
  } else {
    res.status(405).json({ message: 'Metode tidak diizinkan' });
  }
}
