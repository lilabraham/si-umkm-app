// LOKASI FILE: src/lib/firebaseAdmin.ts
// Versi modular & robust untuk Next.js + Turbopack (dengan caching instance)

import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth as _getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore as _getFirestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function ensureApp(): App {
  if (_app) return _app;

  const existing = getApps();
  if (existing.length) {
    _app = existing[0]!;
    return _app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Vercel/ENV sering menyimpan newline sebagai "\n"
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (projectId && clientEmail && privateKey) {
      _app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      // Fallback ke GOOGLE_APPLICATION_CREDENTIALS atau default creds
      _app = initializeApp();
    }
  } catch (e) {
    console.error('[firebaseAdmin] init error:', e);
    // Jika race-condition saat HMR, ambil app pertama
    _app = getApps()[0] ?? initializeApp();
  }
  return _app!;
}

// Fungsi getter (dikembalikan instance yang sama)
export function getAuth(): Auth {
  if (!_auth) _auth = _getAuth(ensureApp());
  return _auth!;
}

export function getFirestore(): Firestore {
  if (!_db) _db = _getFirestore(ensureApp());
  return _db!;
}

// Ekspor konstanta siap pakai (opsional, memudahkan import)
export const adminAuth: Auth = getAuth();
export const adminFirestore: Firestore = getFirestore();
