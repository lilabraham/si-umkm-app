import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebaseAdmin';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ message: 'ID tidak valid.' });

  const db = getFirestore();
  const trainingRef = db.collection('trainings').doc(id);

  switch (req.method) {
    case 'PUT':
      try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const csrfTokenFromCookie = cookies.csrf_token;
        const csrfTokenFromBody = (req.body || {}).csrfToken;

        if (!csrfTokenFromCookie || !csrfTokenFromBody || csrfTokenFromCookie !== csrfTokenFromBody) {
          return res.status(403).json({ message: 'Token CSRF tidak valid atau tidak ada.' });
        }

        const updateData = { ...(req.body || {}) };
        delete (updateData as any).csrfToken;

        await trainingRef.update(updateData);
        return res.status(200).json({ id, ...updateData });
      } catch (error) {
        return res.status(500).json({ message: 'Gagal memperbarui pelatihan', error });
      }

    case 'DELETE':
      try {
        await trainingRef.delete();
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ message: 'Gagal menghapus pelatihan', error });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Metode ${req.method} Tidak Diizinkan`);
  }
}
