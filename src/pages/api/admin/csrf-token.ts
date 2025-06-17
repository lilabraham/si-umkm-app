// src/pages/api/admin/csrf-token.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import cookie from 'cookie';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  // 1. Buat token rahasia secara acak
  const csrfToken = randomBytes(32).toString('hex');

  // 2. Atur token ini sebagai cookie yang aman
  // Cookie ini tidak bisa diakses oleh JavaScript di browser (httpOnly)
  res.setHeader('Set-Cookie', cookie.serialize('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
  }));

  // 3. Kirim token yang sama kembali ke klien dalam respons JSON
  // Ini akan digunakan untuk dimasukkan ke dalam form
  res.status(200).json({ csrfToken });
}
