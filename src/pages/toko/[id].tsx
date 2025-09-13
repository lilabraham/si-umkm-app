// LOKASI FILE: src/pages/toko/[id].tsx

import type { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Search, X } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import Breadcrumb from '@/components/common/Breadcrumb';
import SkeletonProductCard from '@/components/ui/SkeletonProductCard';

/* ===== Types ===== */
interface Product {
  id: string;
  name: string;
  price: number;
  shopName: string;
  imageUrl: string;
  rating?: number;
  category?: string;
}

interface Toko {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
}

interface TokoDetailPageProps {
  toko: Toko | null;
  products: Product[];
}

/* ===== Page ===== */
const TokoDetailPage: NextPage<TokoDetailPageProps> = ({ toko, products }) => {
  const router = useRouter();
  if (router.isFallback) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const cardVariants = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* judul placeholder */}
        <div className="mb-6 h-7 w-56 rounded bg-slate-200 animate-pulse" />
        <div className="mb-8 h-4 w-80 rounded bg-slate-200 animate-pulse" />

        {/* search bar placeholder */}
        <div className="mb-10 h-10 w-full md:w-[720px] rounded-full bg-slate-200 animate-pulse" />

        {/* grid skeleton */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} variants={cardVariants} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

  if (!toko) return <div className="text-center py-20">Toko tidak ditemukan.</div>;

  // kumpulkan kategori unik
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const activeCategory = (router.query.kategori as string) || '';

  // state pencarian (client-side)
  const [q, setQ] = useState('');

  // produk yang tampil (filter kategori + keyword)
  const visibleProducts = useMemo(() => {
    let list = products;
    if (activeCategory) {
      const k = activeCategory.toLowerCase();
      list = list.filter((p) => (p.category || '').toLowerCase() === k);
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(s));
    }
    return list;
  }, [products, activeCategory, q]);

  // animasi ringan
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const cardVariants: Variants = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // set query kategori di URL (shallow)
  const setCategory = (cat: string) => {
    const pathname = router.pathname;
    const query = { ...router.query } as Record<string, any>;
    if (cat) query.kategori = cat;
    else delete query.kategori;
    router.push({ pathname, query }, undefined, { shallow: true, scroll: true });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Head>
        <title>{`${toko.name} - Si-UMKM`}</title>
        <meta name="description" content={toko.description || `Produk dari toko ${toko.name}`} />
      </Head>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'UMKM', href: '/produk/produk' },
          { label: toko.name }, // halaman aktif
        ]}
      />

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{toko.name}</h1>
          {toko.description && (
            <p className="mt-2 max-w-2xl mx-auto text-sm text-slate-600">{toko.description}</p>
          )}
        </header>

        {/* ===== Search bar ala halaman /produk (pill besar, icon kiri) ===== */}
        <div className="mb-6">
          <div className="mx-auto w-full md:w-[720px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari produk di toko ini…"
                className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Cari produk di toko ini"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Bersihkan pencarian"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kategori pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              !activeCategory
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title={`Kategori ${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid produk */}
        {visibleProducts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {visibleProducts.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-sm border rounded-lg bg-white">
            Tidak ada produk yang cocok.
          </div>
        )}
      </div>
    </div>
  );
};

/* ===== Static generation ===== */
export const getStaticPaths: GetStaticPaths = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/api/toko`);
  const allToko: Toko[] = await res.json();
  const paths = allToko.map((t) => ({ params: { id: t.id } }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tokoId = params?.id as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const [tokoRes, productsRes] = await Promise.all([
      fetch(`${apiUrl}/api/toko/${tokoId}`),
      fetch(`${apiUrl}/api/produk?tokoId=${tokoId}`),
    ]);

    if (!tokoRes.ok) {
      return { notFound: true };
    }

    const toko = await tokoRes.json();

    // 🔒 Pastikan selalu array
    let productsJson: any = [];
    try {
      productsJson = await productsRes.json();
    } catch {
      productsJson = [];
    }
    const products: any[] = Array.isArray(productsJson) ? productsJson : [];

    return {
      props: {
        toko,
        products,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error(`Gagal mengambil data untuk toko ${tokoId}:`, error);
    return { notFound: true };
  }
};

export default TokoDetailPage;
