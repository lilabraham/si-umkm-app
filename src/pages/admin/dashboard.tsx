// LOKASI FILE: src/pages/admin/dashboard.tsx
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import nookies from 'nookies';
import AdminLayout from '@/components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { Users, ShoppingCart, Tags, Download } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

type CategoryStat = { category: string; count: number };

interface DashboardProps {
  counts: {
    sellers: number;
    products: number;
    categories: number;
  };
  perCategory: CategoryStat[];
}

const isPublic = (v: any) => {
  const s = String(v ?? 'public').trim().toLowerCase();
  return s === 'public' || s === 'published' || s === 'visible' || s === 'true' || s === '1';
};

const AdminDashboardPage: NextPage<DashboardProps> = ({ counts, perCategory }) => {
  const exportTo = (href: string) => window.open(href, '_blank');

  return (
    <AdminLayout>
      <Head><title>Dashboard Admin - SI-UMKM</title></Head>

      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Ringkasan data inti dan export.</p>
        </motion.div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<Users size={18} />} label="UMKM Aktif" value={counts.sellers} accent="blue" />
          <StatCard icon={<ShoppingCart size={18} />} label="Produk Aktif" value={counts.products} accent="emerald" />
          <StatCard icon={<Tags size={18} />} label="Kategori" value={counts.categories} accent="amber" />
        </div>

        {/* Tabel Rekap + Export */}
        <div className="bg-white border rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b">
            <h2 className="font-semibold text-slate-800">Produk per Kategori</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => exportTo('/api/admin/export-products-csv')}
                className="inline-flex items-center gap-1.5 rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download size={14} /> Export Produk
              </button>
              <button
                onClick={() => exportTo('/api/toko/export-shops-csv')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download size={14} /> Export Toko
              </button>
              <button
                onClick={() => exportTo('/api/export-categories-csv')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download size={14} /> Export Kategori
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-4 py-2 border-b">Kategori</th>
                  <th className="text-right px-4 py-2 border-b">Jumlah Produk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {perCategory.length ? (
                  perCategory.map((row) => (
                    <tr key={row.category || '—'} className="hover:bg-slate-50">
                      <td className="px-4 py-2">{row.category || '—'}</td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums">{row.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={2} className="p-10 text-center text-slate-500">Belum ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aksi cepat */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admin/produk" className="px-4 py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
            Kelola Produk
          </Link>
          <Link href="/admin/kategori" className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300">
            Kelola Kategori
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const tokenStr = cookies.token || '';

    const { getAuth, getFirestore } = await import('@/lib/firebaseAdmin');
    const adminAuth = getAuth();
    const db = getFirestore();
    const decoded = await adminAuth.verifyIdToken(tokenStr);

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') {
      return { redirect: { destination: '/', permanent: false } };
    }

    const [sellersSnap, productsSnap, categoriesSnap] = await Promise.all([
      db.collection('users').where('role', '==', 'penjual').get(),
      db.collection('products').get(),           // <-- AMBIL SEMUA
      db.collection('categories').get(),
    ]);

    // Normalisasi: visibility kosong dianggap public
    const productsPublic: Array<{category?: string; visibility?: any}> = [];
    productsSnap.forEach((d) => {
      const p = d.data() as any;
      if (isPublic(p?.visibility)) productsPublic.push(p);
    });

    // Rekap per kategori
    const perCatMap = new Map<string, number>();
    productsPublic.forEach((p) => {
      const cat = String(p?.category ?? '').trim() || 'Tanpa Kategori';
      perCatMap.set(cat, (perCatMap.get(cat) || 0) + 1);
    });
    const perCategory = Array.from(perCatMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const counts = {
      sellers: sellersSnap.size,
      products: productsPublic.length,   // <-- KONSISTEN
      categories: categoriesSnap.size,
    };

    return { props: { counts, perCategory } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default AdminDashboardPage;
