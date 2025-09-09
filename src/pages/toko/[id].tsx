// LOKASI FILE: src/pages/toko/[id].tsx

import type { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import { useRouter } from 'next/router';
import ProductCard from '@/components/ui/ProductCard'; // Pastikan path ini benar
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Variants } from 'framer-motion'; // <-- 1. Impor 'Variants' di sini


// Tipe data untuk Produk dan Toko (harus cocok dengan tipe di API)
interface Product {
  id: string;
  name: string;
  price: number;
  shopName: string;
  imageUrl: string;
  rating?: number;
}

interface Toko {
    id: string;
    name: string;
    imageUrl: string; // Gambar banner/utama toko
    description?: string;
}

interface TokoDetailPageProps {
  toko: Toko | null;
  products: Product[];
}

const TokoDetailPage: NextPage<TokoDetailPageProps> = ({ toko, products }) => {
  const router = useRouter();

  // Jika halaman sedang dibuat (fallback), tampilkan pesan loading
  if (router.isFallback) {
    return <div className="text-center py-20">Loading...</div>;
  }

  // Jika getStaticProps mengembalikan notFound: true
  if (!toko) {
    return <div className="text-center py-20">Toko tidak ditemukan.</div>;
  }
  
  // Varian animasi untuk kartu produk
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Toko */}
        <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                {toko.name}
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600">
                {toko.description || `Daftar produk unggulan dari ${toko.name}.`}
            </p>
        </header>
        
        {/* Grid Produk */}
        {products.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                 {/* PERHATIAN: Pastikan props 'product' di sini cocok
                   dengan yang diharapkan oleh komponen ProductCard Anda.
                   Misalnya, jika ProductCard butuh 'shopName', pastikan 
                   data produk dari API Anda menyediakannya.
                 */}
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-slate-500 text-lg">Belum ada produk di toko ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Fungsi ini memberitahu Next.js halaman toko mana saja yang harus dibuat saat build
export const getStaticPaths: GetStaticPaths = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/api/toko`);
  const allToko: Toko[] = await res.json();

  const paths = allToko.map((toko) => ({
    params: { id: toko.id },
  }));

  return { paths, fallback: 'blocking' }; // 'blocking' agar halaman baru bisa dibuat jika ada toko baru
};

// Fungsi ini mengambil data SPESIFIK untuk SATU halaman toko saat build
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tokoId = params?.id as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    // Ambil detail toko dan daftar produknya secara paralel
    const [tokoRes, productsRes] = await Promise.all([
      fetch(`${apiUrl}/api/toko/${tokoId}`),
      fetch(`${apiUrl}/api/produk?tokoId=${tokoId}`) // Memanggil API produk dengan filter
    ]);

    // Jika data toko tidak ditemukan, tampilkan halaman 404
    if (!tokoRes.ok) {
        return { notFound: true };
    }

    const toko: Toko = await tokoRes.json();
    const products: Product[] = await productsRes.json();

    return {
      props: {
        toko,
        products,
      },
      revalidate: 60, // Halaman akan coba di-update setiap 60 detik
    };
  } catch (error) {
    console.error(`Gagal mengambil data untuk toko ${tokoId}:`, error);
    return { notFound: true };
  }
};

export default TokoDetailPage;