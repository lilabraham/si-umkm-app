// LOKASI FILE: src/pages/api/trainings/index.ts
// KODE YANG SUDAH DIPERBAIKI (FINAL)

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';

export interface Training {
  id: string;
  title: string;
  description: string;
  schedule: string;
  location: string;
  organizer: string;
  createdAt?: { seconds: number; nanoseconds: number; };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const trainingsCollection = collection(db, 'trainings');

  switch (req.method) {
    case 'GET':
      try {
        const q = query(trainingsCollection);
        const querySnapshot = await getDocs(q);
        const trainings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Training[];
        res.status(200).json(trainings);
      } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pelatihan', error });
      }
      break;

    case 'POST':
      try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const authToken = cookies.auth_token;

        if (!authToken) {
          return res.status(401).json({ message: 'Tidak terotentikasi. Silakan login sebagai admin.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT_SECRET tidak diatur di environment variables.');
        }
        
        // Blok try...catch khusus untuk verifikasi JWT
        try {
          jwt.verify(authToken, jwtSecret);
        } catch { // <-- PERBAIKAN: Menghapus (jwtError) dari sini
          return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
        }
        
        const csrfTokenFromCookie = cookies.csrf_token;
        const csrfTokenFromBody = req.body.csrfToken;

        if (!csrfTokenFromCookie || !csrfTokenFromBody || csrfTokenFromCookie !== csrfTokenFromBody) {
          return res.status(403).json({ message: 'Token CSRF tidak valid atau tidak ada.' });
        }
        
        const trainingData = { ...req.body };
        delete trainingData.csrfToken;
        
        const { title, description, schedule, location, organizer } = trainingData;
        
        if (!title || !description || !schedule || !location || !organizer) {
          return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }
        const newTraining = { title, description, schedule, location, organizer, createdAt: serverTimestamp() };
        const docRef = await addDoc(trainingsCollection, newTraining);
        res.status(201).json({ id: docRef.id, ...newTraining });

      } catch (error) {
        console.error("Error saat menyimpan pelatihan:", error); 
        res.status(500).json({ message: 'Gagal menyimpan data pelatihan', error: (error as Error).message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}