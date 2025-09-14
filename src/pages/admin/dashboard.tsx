// LOKASI FILE: src/pages/admin/dashboard.tsx
import type { GetServerSideProps, NextPage } from 'next';
import AdminLayout from '@/components/layout/AdminLayout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, ShoppingCart, BookOpen, Clock, ChevronRight, Inbox } from 'lucide-react';
import nookies from 'nookies';

type MiniTraining = { id: string; title: string; schedule?: string; location?: string };
type MiniUser = { uid: string; displayName?: string; shopName?: string; email?: string };

interface DashboardProps {
  counts: {
    sellers: number;
    products: number;
    trainings: number;
    pendingSellers: number;
  };
  recentTrainings: MiniTraining[];
  recentPending: MiniUser[];
}

const AdminDashboardPage: NextPage<DashboardProps> = ({ counts, recentTrainings, recentPending }) => {
  return (
    <AdminLayout>
      <div className="p-6 lg:p-10">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Ringkasan sistem & tindakan cepat.</p>
        </motion.div>

        {/* Kartu metrik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">UMKM Aktif</p>
              <Users className="text-blue-600" size={18} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{counts.sellers}</p>
          </motion.div>

          <motion.div
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Produk Aktif</p>
              <ShoppingCart className="text-emerald-600" size={18} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{counts.products}</p>
          </motion.div>

          <motion.div
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pelatihan Terjadwal</p>
              <BookOpen className="text-amber-600" size={18} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{counts.trainings}</p>
          </motion.div>

          <motion.div
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Menunggu Persetujuan</p>
              <Clock className="text-rose-600" size={18} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{counts.pendingSellers}</p>
          </motion.div>
        </div>

        {/* Dua kolom: pending approvals & pelatihan terdekat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Pendaftaran Penjual Baru</h2>
              <Link
                href="/admin/persetujuan"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Lihat semua <ChevronRight size={16} />
              </Link>
            </div>
            {recentPending.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentPending.map((u) => (
                  <li key={u.uid} className="p-4">
                    <p className="font-medium text-gray-800">{u.displayName || u.email || 'Tanpa nama'}</p>
                    <p className="text-sm text-gray-500">{u.shopName || '-'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Inbox className="mx-auto mb-2 text-gray-400" />
                Tidak ada yang pending.
              </div>
            )}
          </motion.div>

          <motion.div
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Pelatihan Terbaru</h2>
              <Link
                href="/admin/pelatihan"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Kelola pelatihan <ChevronRight size={16} />
              </Link>
            </div>
            {recentTrainings.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentTrainings.map((t) => (
                  <li key={t.id} className="p-4">
                    <p className="font-medium text-gray-800">{t.title}</p>
                    <p className="text-sm text-gray-500">
                      {t.schedule || '-'} • {t.location || '-'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Inbox className="mx-auto mb-2 text-gray-400" />
                Belum ada jadwal.
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/pelatihan"
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Tambah Pelatihan
          </Link>
          <Link
            href="/admin/persetujuan"
            className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300"
          >
            Kelola Persetujuan
          </Link>
          <Link
            href="/admin/produk"
            className="px-4 py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Kelola Produk
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // 🔒 server-only import agar Admin SDK tidak ter-bundle ke klien
    const { getAuth, getFirestore } = await import('@/lib/firebaseAdmin');

    const cookies = nookies.get(context);
    const tokenStr = cookies.token || '';

    const adminAuth = getAuth();
    const db = getFirestore();

    const decoded = await adminAuth.verifyIdToken(tokenStr);

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') {
      return { redirect: { destination: '/', permanent: false } };
    }

    const [
      sellersSnap,
      pendingSnap,
      productsSnap,
      trainingsSnap,
      recentTrainingsSnap,
      recentPendingSnap,
    ] = await Promise.all([
      db.collection('users').where('role', '==', 'penjual').get(),
      db.collection('users').where('role', '==', 'pending_penjual').get(),
      db.collection('products').get(),
      db.collection('trainings').get(),
      db.collection('trainings').orderBy('createdAt', 'desc').limit(3).get(),
      db.collection('users').where('role', '==', 'pending_penjual').limit(5).get(),
    ]);

    const counts = {
      sellers: sellersSnap.size,
      products: productsSnap.size,
      trainings: trainingsSnap.size,
      pendingSellers: pendingSnap.size,
    };

    const recentTrainings: MiniTraining[] = recentTrainingsSnap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data?.title || '',
        schedule: data?.schedule || '',
        location: data?.location || '',
      };
    });

    const recentPending: MiniUser[] = recentPendingSnap.docs.map((d) => {
      const data = d.data() as any;
      return {
        uid: d.id,
        displayName: data?.displayName || '',
        shopName: data?.shopName || '',
        email: data?.email || '',
      };
    });

    return {
      props: { counts, recentTrainings, recentPending },
    };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default AdminDashboardPage;
