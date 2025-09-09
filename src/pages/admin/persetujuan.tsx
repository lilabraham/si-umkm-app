// LOKASI FILE: src/pages/admin/persetujuan.tsx

import { useState } from 'react';
import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { admin, db } from '@/lib/firebaseAdmin';
import { auth } from '@/lib/firebase';
import nookies from 'nookies';
import { Check, X, UserCheck, Inbox, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/Layout/AdminLayout'; // Impor layout admin

// Tipe data untuk calon penjual
interface PendingUser {
  uid: string;
  displayName: string;
  shopName: string;
  whatsapp: string;
  description: string;
  email: string;
}

interface PersetujuanPageProps {
  initialPendingUsers: PendingUser[];
}

const PersetujuanPage: NextPage<PersetujuanPageProps> = ({ initialPendingUsers }) => {
  const [pendingUsers, setPendingUsers] = useState(initialPendingUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleManageUser = async (targetUserId: string, action: 'approve' | 'reject') => {
    setLoading(targetUserId);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Tidak dapat memverifikasi sesi Anda. Silakan login ulang.");
      }

      const res = await fetch('/api/admin/manage-user', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ targetUserId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Gagal ${action} pengguna.`);
      }

      setPendingUsers(currentUsers => currentUsers.filter(user => user.uid !== targetUserId));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Admin: Persetujuan Penjual</title>
      </Head>
      
      {/* Konten Halaman dimulai di sini, background dan layout utama sudah dihandle oleh AdminLayout */}
      <div className="p-6 lg:p-10">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Persetujuan Pendaftaran Penjual</h1>
          <p className="text-lg text-gray-600 mt-1">Tinjau dan kelola aplikasi pendaftaran penjual baru.</p>
        </motion.header>

        {error && (
          <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded-md flex items-center gap-3">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <AnimatePresence>
              {pendingUsers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama & Toko</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi Usaha</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                      <motion.tr 
                        key={user.uid}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><UserCheck className="h-5 w-5 text-gray-400 mr-3" /><div><div className="text-sm font-medium text-gray-900">{user.displayName}</div><div className="text-sm text-gray-500">{user.shopName}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{user.email}</div><div className="text-sm text-gray-500">{user.whatsapp}</div></td>
                        <td className="px-6 py-4"><p className="text-sm text-gray-600 max-w-xs truncate" title={user.description}>{user.description}</p></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end">
                          <motion.button onClick={() => handleManageUser(user.uid, 'reject')} disabled={loading === user.uid} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50" title="Tolak" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            {loading === user.uid ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                          </motion.button>
                          <motion.button onClick={() => handleManageUser(user.uid, 'approve')} disabled={loading === user.uid} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50" title="Setujui" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            {loading === user.uid ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                          </motion.button>
                        </div></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <motion.div className="text-center py-20 px-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Inbox className="mx-auto h-16 w-16 text-gray-400" /><h3 className="mt-4 text-xl font-semibold text-gray-800">Kotak Masuk Kosong</h3><p className="mt-2 text-gray-500">Tidak ada pendaftaran penjual baru yang perlu ditinjau saat ini.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(context);
    const token = await admin.auth().verifyIdToken(cookies.token || '');
    
    const userDoc = await db.collection('users').doc(token.uid).get();
    if (userDoc.data()?.role !== 'admin') {
      return { redirect: { destination: '/', permanent: false } };
    }

    const pendingSnapshot = await db.collection('users').where('role', '==', 'pending_penjual').get();
    const initialPendingUsers = pendingSnapshot.docs.map(doc => ({
      uid: doc.id,
      displayName: doc.data().displayName || '',
      shopName: doc.data().shopName || '',
      whatsapp: doc.data().whatsapp || '',
      description: doc.data().description || '',
      email: doc.data().email || '',
    }));
    
    return { props: { initialPendingUsers: JSON.parse(JSON.stringify(initialPendingUsers)) } }; // JSON stringify/parse untuk serialisasi
  } catch (error) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default PersetujuanPage;