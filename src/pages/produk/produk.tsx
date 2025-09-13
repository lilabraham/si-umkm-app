// LOKASI FILE: src/pages/produk/produk.tsx

import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Store } from 'lucide-react';
import TokoCard from '@/components/ui/TokoCard';
import SkeletonTokoCard from '@/components/ui/SkeletonTokoCard';

// Interface data dari API /api/toko
interface Toko {
  id: string;
  name: string;
  imageUrl: string;     // foto profil toko (boleh kosong => fallback di kartu)
  productCount: number; // jumlah produk toko
}

interface TokoPageProps {
  initialToko: Toko[];
}

const TokoPage: NextPage<TokoPageProps> = ({ initialToko = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const tokoToDisplay = useMemo(() => {
    if (!searchTerm.trim()) return initialToko;
    const q = searchTerm.toLowerCase();
    return initialToko.filter((t) => t.name.toLowerCase().includes(q));
  }, [searchTerm, initialToko]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  } as const;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Head>
        <title>Jelajahi UMKM Lokal - Si-UMKM</title>
        <meta
          name="description"
          content="Temukan dan dukung para pelaku UMKM berbakat di sekitar Anda."
        />
      </Head>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Jelajahi UMKM Lokal
          </h1>
          <p className="mt-2 max-w-2xl mx-auto text-slate-600">
            Temukan dan dukung para pelaku UMKM berbakat di sekitar Anda.
          </p>
        </header>

        {/* Search Bar */}
        <form onSubmit={(e) => e.preventDefault()} className="mx-auto w-full md:w-[720px] mb-10">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama toko UMKM..."
              aria-label="Cari nama toko UMKM"
              className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Grid Toko */}
        {initialToko.length === 0 && !searchTerm.trim() ? (
          // 1) Skeleton state
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTokoCard key={i} variants={cardVariants} />
            ))}
          </motion.div>
        ) : tokoToDisplay.length > 0 ? (
          // 2) Grid toko normal
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tokoToDisplay.map((toko) => (
              <TokoCard key={toko.id} toko={toko} variants={cardVariants} />
            ))}
          </motion.div>
        ) : (
          // 3) Empty state
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <Store className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Oops! Toko tidak ditemukan</h3>
            <p className="mt-2 text-gray-500">
              Kami tidak dapat menemukan UMKM untuk kata kunci “
              <span className="font-semibold text-gray-700">{searchTerm}</span>”.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/toko`);
    if (!res.ok) throw new Error(`Failed to fetch toko: ${res.statusText}`);
    const toko: Toko[] = await res.json();

    return {
      props: { initialToko: toko },
      revalidate: 60, // ISR
    };
  } catch (error) {
    console.error('Gagal mengambil data toko saat build:', error);
    return { props: { initialToko: [] }, revalidate: 60 };
  }
};

export default TokoPage;
