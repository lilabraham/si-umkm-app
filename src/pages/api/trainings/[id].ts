// LOKASI FILE: src/pages/api/trainings/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import cookie from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID tidak valid.' });
  }

  const trainingDocRef = doc(db, 'trainings', id);

  switch (req.method) {
    case 'PUT':
      try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const csrfTokenFromCookie = cookies.csrf_token;
        const csrfTokenFromBody = req.body.csrfToken;

        if (!csrfTokenFromCookie || !csrfTokenFromBody || csrfTokenFromCookie !== csrfTokenFromBody) {
          return res.status(403).json({ message: 'Token CSRF tidak valid atau tidak ada.' });
        }
        
        // PERBAIKAN: Menggunakan '_' untuk menandakan variabel tidak terpakai
        const { csrfToken: _, ...updateData } = req.body;

        await updateDoc(trainingDocRef, updateData);
        res.status(200).json({ id, ...updateData });
      } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui pelatihan', error });
      }
      break;

    case 'DELETE':
      try {
        await deleteDoc(trainingDocRef);
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pelatihan', error });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}