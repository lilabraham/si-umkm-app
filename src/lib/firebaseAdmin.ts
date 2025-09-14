// LOKASI FILE: src/lib/firebaseAdmin.ts
// Versi modular & robust untuk Next.js + Turbopack

import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth as _getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore as _getFirestore } from 'firebase-admin/firestore';

let _app: App | null = null;

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

  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (projectId && clientEmail && privateKey) {
      _app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      _app = initializeApp();
    }
  } catch (e) {
    console.error('[firebaseAdmin] init error:', e);
    _app = getApps()[0] ?? initializeApp();
  }
  return _app!;
}

export function getAuth(): Auth {
  return _getAuth(ensureApp());
}
export function getFirestore(): Firestore {
  return _getFirestore(ensureApp());
}
