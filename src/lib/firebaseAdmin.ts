// src/lib/firebaseAdmin.ts

// DIUBAH: Tambahkan 'export' di sini
import admin from 'firebase-admin'; 
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// DIUBAH: Ekspor juga 'admin' agar bisa digunakan di tempat lain
export { db, admin };