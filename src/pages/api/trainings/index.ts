// src/pages/api/trainings/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, serverTimestamp } from 'firebase/firestore';
import cookie from 'cookie'; // Impor library cookie

export interface Training {
  id: string;
  title: string;
  description: string;
  schedule: string;
  location: string;
  organizer: string;
  createdAt?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const trainingsCollection = collection(db, 'trainings');

  switch (req.method) {
    case 'GET':
      // Logika GET tidak perlu perlindungan CSRF karena hanya membaca data
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
        // ================== VALIDASI CSRF DIMULAI ==================
        const cookies = cookie.parse(req.headers.cookie || '');
        const csrfTokenFromCookie = cookies.csrf_token;
        const csrfTokenFromBody = req.body.csrfToken;

        if (!csrfTokenFromCookie || !csrfTokenFromBody || csrfTokenFromCookie !== csrfTokenFromBody) {
          return res.status(403).json({ message: 'Token CSRF tidak valid atau tidak ada.' });
        }
        // ========================================================
        
        // Hapus csrfToken dari data sebelum disimpan ke database
        const { csrfToken, ...trainingData } = req.body;
        const { title, description, schedule, location, organizer } = trainingData;
        
        if (!title || !description || !schedule || !location || !organizer) {
          return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }
        const newTraining = { title, description, schedule, location, organizer, createdAt: serverTimestamp() };
        const docRef = await addDoc(trainingsCollection, newTraining);
        res.status(201).json({ id: docRef.id, ...newTraining });
      } catch (error) {
        res.status(500).json({ message: 'Gagal menyimpan data pelatihan', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}
