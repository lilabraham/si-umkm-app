import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';

export interface Training {
  id: string;
  title: string;
  description: string;
  schedule: string;
  location: string;
  organizer: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getFirestore();

  switch (req.method) {
    case 'GET':
      try {
        const snap = await db.collection('trainings').get();
        const trainings = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Training[];
        return res.status(200).json(trainings);
      } catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil data pelatihan', error });
      }

    case 'POST':
      try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const authToken = cookies.auth_token;
        if (!authToken) return res.status(401).json({ message: 'Tidak terotentikasi. Silakan login sebagai admin.' });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET tidak diatur di environment variables.');

        try {
          jwt.verify(authToken, jwtSecret);
        } catch {
          return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
        }

        const csrfTokenFromCookie = cookies.csrf_token;
        const csrfTokenFromBody = (req.body || {}).csrfToken;
        if (!csrfTokenFromCookie || !csrfTokenFromBody || csrfTokenFromCookie !== csrfTokenFromBody) {
          return res.status(403).json({ message: 'Token CSRF tidak valid atau tidak ada.' });
        }

        const trainingData = { ...(req.body || {}) };
        delete (trainingData as any).csrfToken;

        const { title, description, schedule, location, organizer } = trainingData as any;
        if (!title || !description || !schedule || !location || !organizer) {
          return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        const newTraining = {
          title,
          description,
          schedule,
          location,
          organizer,
          createdAt: FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('trainings').add(newTraining);
        return res.status(201).json({ id: docRef.id, ...newTraining });
      } catch (error: any) {
        console.error('Error saat menyimpan pelatihan:', error);
        return res
          .status(500)
          .json({ message: 'Gagal menyimpan data pelatihan', error: (error as Error).message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}
