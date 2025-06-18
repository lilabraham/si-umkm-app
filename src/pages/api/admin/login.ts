// src/pages/api/admin/login.ts
// KODE YANG SUDAH DIPERBAIKI

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie'; // PERBAIKAN: Impor library cookie dengan cara yang benar

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  const { username, password } = req.body;

  // Ambil kredensial admin dari environment variables
  const ADMIN_USER = process.env.ADMIN_USERNAME;
  const ADMIN_PASS = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

  // Validasi sederhana
  if (!ADMIN_USER || !ADMIN_PASS || !JWT_SECRET) {
    return res.status(500).json({ message: 'Konfigurasi server admin tidak lengkap.' });
  }

  // Cek apakah username dan password cocok
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Jika cocok, buat token JWT
    const token = jwt.sign(
      { username: username, role: 'admin' }, // Payload token
      JWT_SECRET, // Kunci rahasia
      { expiresIn: '8h' } // Token akan kadaluarsa dalam 8 jam
    );

    // Atur token sebagai HTTP-Only cookie
    // Ini lebih aman daripada menyimpannya di localStorage
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
      httpOnly: true, // Mencegah akses dari JavaScript di sisi klien
      secure: process.env.NODE_ENV !== 'development', // Gunakan 'secure' di produksi (HTTPS)
      maxAge: 8 * 60 * 60, // Masa berlaku cookie (8 jam dalam detik)
      sameSite: 'strict', // Mencegah serangan CSRF
      path: '/', // Cookie berlaku di seluruh situs
    }));

    // Kirim respons berhasil
    res.status(200).json({ success: true, message: 'Login berhasil' });

  } else {
    // Jika kredensial salah
    res.status(401).json({ success: false, message: 'Username atau password salah' });
  }
}