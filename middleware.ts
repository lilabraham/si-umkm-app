// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // 'jose' adalah library modern untuk JWT

// Kunci rahasia harus sama dengan yang di API login
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  // Ambil URL yang diminta
  const { pathname } = req.nextUrl;

  // Jika permintaan adalah untuk halaman login admin, biarkan saja
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // Jika permintaan untuk halaman admin lainnya, periksa token
  if (pathname.startsWith('/admin')) {
    // Ambil token dari cookie
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      // Jika tidak ada token, redirect ke halaman login
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verifikasi token
      await jwtVerify(token, JWT_SECRET);
      // Jika token valid, lanjutkan ke halaman yang diminta
      return NextResponse.next();
    } catch (error) {
      // Jika token tidak valid (kadaluarsa, salah, dll), redirect ke login
      console.log('JWT Verification Error:', error);
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('error', 'sesi_kadaluarsa');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Untuk semua rute lain, lanjutkan seperti biasa
  return NextResponse.next();
}

// Tentukan path mana saja yang akan dijalankan oleh middleware ini
export const config = {
  matcher: '/admin/:path*',
};
