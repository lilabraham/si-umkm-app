// LOKASI FILE: src/pages/produk.tsx
// KODE YANG SUDAH DIPERBARUI SECARA LENGKAP

import type { GetStaticProps, NextPage } from 'next';
import { useState, useMemo } from 'react';
import TokoCard from '@/components/ui/TokoCard'; // DIUBAH: Menggunakan TokoCard
import { Search, Frown, Store } from 'lucide-react'; // DIUBAH: Menambah ikon Store
import { motion } from 'framer-motion';

// DIUBAH: Interface data sekarang untuk Toko
interface Toko {
  id: string;
  name: string;
  imageUrl: string;
}

interface TokoPageProps {
  initialToko: Toko[];
}

const ProdukPage: NextPage<TokoPageProps> = ({ initialToko = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // DIUBAH: Logika filter disesuaikan untuk mencari nama toko
  const tokoToDisplay = useMemo(() => {
    if (!searchTerm) {
      return initialToko;
    }
    return initialToko.filter(toko => 
      toko.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, initialToko]);

  // Varian animasi (tidak berubah)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  } as const;

  return (
    // Styling inti dari container utama (bg-slate-50) tidak diubah
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          {/* DIUBAH: Teks disesuaikan untuk konteks toko/UMKM */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Jelajahi UMKM Lokal
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500">
            Temukan dan dukung para pelaku UMKM berbakat di sekitar Anda.
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
              // DIUBAH: Placeholder disesuaikan
              placeholder="Cari nama toko UMKM..."
              className="w-full py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </form>
        
        {tokoToDisplay.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" // DIUBAH: Gap sedikit diperbesar
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* DIUBAH: Melakukan map dan render TokoCard */}
            {tokoToDisplay.map((toko) => (
              <TokoCard
                key={toko.id}
                toko={toko}
                variants={cardVariants}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
             {/* DIUBAH: Teks dan ikon disesuaikan untuk konteks toko */}
             <Store className="mx-auto text-gray-400" size={48} />
             <h3 className="mt-4 text-xl font-semibold text-gray-800">Oops! Toko tidak ditemukan</h3>
             <p className="mt-2 text-gray-500">
               Kami tidak dapat menemukan UMKM untuk kata kunci “<span className="font-semibold text-gray-700">{searchTerm}</span>”.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    // DIUBAH: Idealnya, Anda membuat API endpoint baru untuk mengambil daftar toko
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/toko`); // Misal: /api/toko
    
    if (!res.ok) {
      throw new Error(`Failed to fetch toko: ${res.statusText}`);
    }
    const toko: Toko[] = await res.json();

    return { 
      props: { 
        initialToko: toko
      }, 
      revalidate: 60 
    };
  } catch (error) { // Menangkap error spesifik untuk logging
    console.error("Gagal mengambil data toko saat build:", error);
    return { props: { initialToko: [] } };
  }
};

export default ProdukPage;