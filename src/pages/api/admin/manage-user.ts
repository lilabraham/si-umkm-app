// LOKASI FILE: src/pages/api/admin/manage-user.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { admin, db } from '@/lib/firebaseAdmin'; // Menggunakan Firebase Admin
import type { UserRole } from '@/context/AuthContext';

// Tipe data untuk request body
interface RequestBody {
  targetUserId: string;
  action: 'approve' | 'reject';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Hanya izinkan metode POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // 2. Verifikasi token admin yang melakukan permintaan dari cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Tidak terautentikasi.' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // 3. Cek apakah pengguna yang melakukan permintaan adalah admin
    const adminDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (adminDoc.data()?.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Anda bukan admin.' });
    }

    // 4. Proses permintaan untuk mengubah peran pengguna lain
    const { targetUserId, action }: RequestBody = req.body;
    if (!targetUserId || !action) {
      return res.status(400).json({ error: 'User ID dan aksi diperlukan.' });
    }

    const userDocRef = db.collection('users').doc(targetUserId);
    
    // Tentukan peran baru berdasarkan aksi
    let newRole: UserRole | 'rejected_penjual' = 'pembeli'; // Default
    if (action === 'approve') {
      newRole = 'penjual';
    } else if (action === 'reject') {
      newRole = 'rejected_penjual'; // Kita beri status 'ditolak'
    } else {
      return res.status(400).json({ error: 'Aksi tidak valid.' });
    }
    
    // 5. Update peran pengguna di Firestore
    await userDocRef.update({ role: newRole });

    res.status(200).json({ message: `Pengguna ${targetUserId} berhasil di-${action}. Peran baru: ${newRole}` });

  } catch (error) {
    console.error("Error managing user:", error);
    res.status(500).json({ error: 'Terjadi kesalahan di server.' });
  }
}