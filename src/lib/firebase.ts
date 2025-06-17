// src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Hapus atau abaikan storage jika tidak jadi digunakan
// import { getStorage } from "firebase/storage"; 
import { getFirestore } from "firebase/firestore"; // <-- TAMBAHKAN INI

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebaseApp(): FirebaseApp {
    if (getApps().length > 0) return getApp();
    const allConfigPresent = Object.values(firebaseConfig).every(Boolean);
    if (!allConfigPresent) {
        throw new Error("Firebase config values are missing. Please check your .env.local file.");
    }
    return initializeApp(firebaseConfig);
}

const app = initializeFirebaseApp();

export const auth = getAuth(app);
// export const storage = getStorage(app);
export const db = getFirestore(app); // <-- TAMBAHKAN DAN EKSPOR INI
