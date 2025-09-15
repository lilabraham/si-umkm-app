import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Store } from 'lucide-react';
import TokoCard from '@/components/ui/TokoCard';
import SkeletonTokoCard from '@/components/ui/SkeletonTokoCard';

// ==== Bentuk data yang dipakai komponen card ====
interface Toko {
  id: string;
  name: string;
  imageUrl: string;
  productCount: number;             // jumlah produk PUBLIC yang tampil
  publicProductCount?: number;      // hanya ditambahkan kalau memang number
}

interface TokoPageProps {
  initialToko: Toko[];
}

/** ========= Normalizer =========
 * Menerima berbagai bentuk respons:
 * - array langsung
 * - { items: [...] }
 * - { shops: [...] }
 * - { data: [...] }
 * Memetakan ke { id, name, imageUrl, productCount }
 *
 * Aman serialisasi: tidak mengisi properti dengan undefined.
 */
function normalizeTokoResponse(json: any): Toko[] {
  const src = Array.isArray(json)
    ? json
    : Array.isArray(json?.items)
    ? json.items
    : Array.isArray(json?.shops)
    ? json.shops
    : Array.isArray(json?.data)
    ? json.data
    : [];

  if (!Array.isArray(src)) return [];

  return src.map((s: any) => {
    let count = 0;
    if (typeof s?.productCount === 'number') count = s.productCount;
    else if (typeof s?.publicProductCount === 'number') count = s.publicProductCount;
    else if (typeof s?.productsCount === 'number') count = s.productsCount;

    const obj: Toko = {
      id: String(s?.id ?? s?.uid ?? ''),
      name: String(s?.shopName ?? s?.displayName ?? s?.name ?? 'Toko'),
      imageUrl: String(s?.shopImageUrl ?? s?.imageUrl ?? ''),
      productCount: count,
    };
    if (typeof s?.publicProductCount === 'number') {
      obj.publicProductCount = s.publicProductCount;
    }
    return obj;
  });
}

const TokoPage: NextPage<TokoPageProps> = ({ initialToko = [] }) => {
  // state untuk pencarian
  const [searchTerm, setSearchTerm] = useState('');

  // ⬇️ state data yang ditampilkan (diisi dari SSG lalu dioverride hasil refetch client)
  const [toko, setToko] = useState<Toko[]>(initialToko);
  const [loadingFirstClientFetch, setLoadingFirstClientFetch] = useState(false);

  // ⬇️ client-side refetch ringan saat mount → memastikan angka langsung segar
  useEffect(() => {
    let aborted = false;
    const run = async () => {
      try {
        setLoadingFirstClientFetch(true);
        const res = await fetch(`/api/toko?ts=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-store' },
        });
        if (!res.ok) return;
        const raw = await res.json().catch(() => []);
        const fresh = normalizeTokoResponse(raw);
        if (!aborted && Array.isArray(fresh) && fresh.length >= 0) {
          setToko(fresh);
        }
      } finally {
        if (!aborted) setLoadingFirstClientFetch(false);
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, []);

  // filter pencarian berdasarkan state 'toko' (bukan langsung props)
  const tokoToDisplay = useMemo(() => {
    if (!searchTerm.trim()) return toko;
    const q = searchTerm.toLowerCase();
    return toko.filter((t) => t.name.toLowerCase().includes(q));
  }, [searchTerm, toko]);

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
        {toko.length === 0 && !searchTerm.trim() ? (
          // 1) Skeleton state (saat SSG kosong &/atau fetch awal client sedang jalan)
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
            {tokoToDisplay.map((t) => (
              <TokoCard key={t.id} toko={t} variants={cardVariants} />
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
    // SSG + ISR; angka akan disegarkan lagi oleh refetch client dan revalidate on-demand
    const res = await fetch(`${apiUrl}/api/toko`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch toko: ${res.status} ${res.statusText}`);
    const raw = await res.json();

    const toko: Toko[] = normalizeTokoResponse(raw);

    return {
      props: { initialToko: toko },
      revalidate: 10, // tetap pendek; revalidate on-demand juga sudah dipasang di endpoint admin
    };
  } catch (error) {
    console.error('Gagal mengambil data toko saat build:', error);
    return { props: { initialToko: [] }, revalidate: 10 };
  }
};

export default TokoPage;
