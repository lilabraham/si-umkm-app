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

  // Skeleton saat fallback blocking sedang generate
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
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/toko`);
    const data = res.ok ? await res.json() : [];

    // Normalisasi: dukung berbagai bentuk (array / {items} / {shops} / {data})
    const shops: any[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any).items)
      ? (data as any).items
      : Array.isArray((data as any).shops)
      ? (data as any).shops
      : Array.isArray((data as any).data)
      ? (data as any).data
      : [];

    const paths = shops
      .filter((s) => s && (s.uid || s.id))
      .map((s) => ({ params: { id: String(s.uid || s.id) } }));

    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tokoId = params?.id as string;

  try {
    // Server-only: ambil langsung dari Firestore Admin (stabil, tidak butuh token)
    const { getFirestore } = await import('@/lib/firebaseAdmin');
    const db = getFirestore();

    // Detail toko
    const tokoDoc = await db.collection('users').doc(tokoId).get();
    if (!tokoDoc.exists) return { notFound: true };

    const u = tokoDoc.data() || {};
    const toko: Toko = {
      id: tokoDoc.id,
      name: u.shopName || u.displayName || 'Toko',
      imageUrl: u.shopImageUrl || u.photoURL || '',
      description: u.description || '',
    };

    // Daftar produk milik toko
    const prodSnap = await db.collection('products').where('ownerId', '==', tokoId).get();
    const products: Product[] = prodSnap.docs
      .map((d) => {
        const p = d.data() as any;
        return {
          id: d.id,
          name: p.name || '',
          price: p.price || 0,
          description: p.description || '',
          imageUrl: p.imageUrl || '',
          shopName: p.shopName || toko.name,
          ownerId: p.ownerId || tokoId,
          category: p.category || '',
          visibility: p.visibility || 'public',
          createdAt: p.createdAt?.seconds
            ? { seconds: p.createdAt.seconds, nanoseconds: p.createdAt.nanoseconds }
            : null,
        };
      })
      // jika kamu pakai visibility, tampilkan yang bukan hidden
      .filter((p: any) => p.visibility !== 'hidden')
      // mapping ke tipe Product di atas (buang field ekstra)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        shopName: p.shopName,
        imageUrl: p.imageUrl,
        category: p.category || '',
      }));

    return {
      props: {
        toko,
        products,
      },
      revalidate: 60, // ISR
    };
  } catch (e) {
    console.error('[toko/[id]] getStaticProps error:', e);
    return { notFound: true };
  }
};

export default TokoDetailPage;
