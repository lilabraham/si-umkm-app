import Head from 'next/head';
import Image from 'next/image';
import FeatureCard from '@/components/ui/FeatureCard';
import ProductCard from '@/components/ui/ProductCard'; // Import ProductCard
import { PackageCheck, Star, BookOpenCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Data produk tiruan sesuai screenshot
const dummyProducts = [
  { id: 1, name: 'Kopi Robusta Brebes', seller: 'Warung Kopi Jaya', price: 50000, rating: 4.8, imageUrl: '/images/kopi.jpg' },
  { id: 2, name: 'Keripik Bawang Asli', seller: 'UMKM Makmur', price: 25000, rating: 4.9, imageUrl: '/images/keripik.jpg' },
  { id: 3, name: 'Batik Tulis Mega Mendung', seller: 'Galeri Batik Cirebon', price: 350000, rating: 5.0, imageUrl: '/images/batik.jpg' },
];

const HomePage = () => {
  const features = [
    { Icon: PackageCheck, title: 'Publikasi Produk', description: 'Daftarkan dan pamerkan produk Anda ke jangkauan pasar yang lebih luas.' },
    { Icon: Star, title: 'Ulasan & Rating', description: 'Dapatkan masukan berharga dari pelanggan untuk meningkatkan kualitas.' },
    { Icon: BookOpenCheck, title: 'Info Pelatihan', description: 'Akses jadwal dan materi program pembinaan dari pemerintah.' },
  ];

  return (
    <>
      <Head>
        <title>Si-UMKM - Platform Digitalisasi UMKM Brebes</title>
        <meta name="description" content="Membantu UMKM Brebes mendaftarkan produk, mendapatkan ulasan, dan mengakses program pelatihan." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* ... (Tidak ada perubahan signifikan di sini, kode Anda sudah bagus) ... */}
         <div className="container mx-auto px-6 py-20 lg:py-24">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             {/* Kolom Teks */}
             <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
               <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                 Wujudkan UMKM Naik Kelas Bersama Kami
               </h1>
               <p className="mt-4 text-lg lg:text-xl text-blue-100 max-w-xl">
                 Platform terpadu untuk mempublikasikan produk, menerima ulasan, dan mendapatkan akses eksklusif ke program pembinaan pemerintah.
               </p>
               <button className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105">
                 Daftar Sekarang
               </button>
             </motion.div>
             {/* Kolom Gambar */}
             <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
               <div className="hidden md:block">
                 <Image
                   src="https://images.unsplash.com/photo-1578500329487-d4f7386121cf?q=80&w=1887"
                   alt="Ilustrasi UMKM"
                   width={500}
                   height={500}
                   className="rounded-xl shadow-2xl object-cover"
                   priority
                 />
               </div>
             </motion.div>
           </div>
         </div>
      </section>

      {/* SEKSI PRODUK UNGGULAN (BARU) */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Temukan Produk UMKM Unggulan
            </h2>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Jelajahi produk-produk terbaik hasil karya UMKM lokal Brebes dan sekitarnya.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="bg-slate-800/50 py-20 lg:py-24"
      >
        {/* ... (Kode fitur Anda, hanya ganti background) ... */}
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">
              Fitur Unggulan Kami
            </h2>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Semua yang Anda butuhkan untuk bertumbuh dalam satu platform yang mudah digunakan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard
                  Icon={feature.Icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;