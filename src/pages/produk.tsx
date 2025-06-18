// LOKASI FILE: src/pages/produk.tsx
// KODE YANG SUDAH DIPERBAIKI

import type { GetStaticProps, NextPage } from 'next';
import { useState, useMemo } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { Search, Frown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  shopName: string;
  imageUrl: string;
  rating?: number;
}
interface ProdukPageProps {
  initialProducts: Product[];
}

const ProdukPage: NextPage<ProdukPageProps> = ({ initialProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const productsToDisplay = useMemo(() => {
    if (!searchTerm) {
      return initialProducts;
    }
    return initialProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shopName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, initialProducts]);

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Jelajahi Produk UMKM Lokal
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500">
            Temukan produk unggulan dari para pelaku UMKM di sekitar Anda.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk UMKM atau nama toko..."
              className="w-full py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </form>
        
        {productsToDisplay.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {productsToDisplay.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variants={cardVariants}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
             <Frown className="mx-auto text-gray-400" size={48} />
             <h3 className="mt-4 text-xl font-semibold text-gray-800">Oops! Produk tidak ditemukan</h3>
             {/* PERBAIKAN: Menggunakan kutipan yang aman untuk JSX */}
             <p className="mt-2 text-gray-500">
                Kami tidak dapat menemukan produk untuk kata kunci “<span className="font-semibold text-gray-700">{searchTerm}</span>”.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Pastikan NEXT_PUBLIC_API_URL sudah benar di environment variables Vercel Anda
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/produk`);
    if (!res.ok) {
      // Jika respons tidak ok (cth: 404, 500), lempar error untuk masuk ke blok catch
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    const products: Product[] = await res.json();

    return { 
      props: { 
        initialProducts: products 
      }, 
      revalidate: 60 
    };
  } catch { // PERBAIKAN: Menghapus variabel 'error' yang tidak digunakan
    console.warn("Gagal mengambil data produk saat build, halaman akan menampilkan data kosong.");
    return { props: { initialProducts: [] } };
  }
};

export default ProdukPage;