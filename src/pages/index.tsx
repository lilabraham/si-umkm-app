// LOKASI FILE: src/pages/index.tsx

import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
// PERBAIKAN: Menghapus impor state yang tidak terpakai
// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ui/ProductCard';
import TestimonialCard from '@/components/ui/TestimonialCard'; 

interface Product {
  id: string; name: string; price: number; description: string; shopName: string; imageUrl: string; ownerId: string;
}
interface HomePageProps {
  products: Product[];
}
const testimonials = [
  { text: 'Platform ini sangat membantu usaha bawang merah saya. Sekarang lebih mudah menjangkau pelanggan di luar kota!', author: 'Ibu Siti Aminah', role: 'Petani Bawang Merah, Brebes', avatarUrl: '/avatar/siti.jpg' },
  { text: 'Fitur info pelatihannya sangat bermanfaat. Saya jadi tahu program-program pemerintah untuk UMKM.', author: 'Budi Santoso', role: 'Pengrajin Batik Salem', avatarUrl: '/avatar/budi.jpg' },
  { text: 'Tampilan websitenya modern dan mudah digunakan. Produk saya jadi terlihat lebih profesional.', author: 'Rina Wulandari', role: 'Produsen Telur Asin', avatarUrl: '/avatar/rina.jpg' }
];

const HomePage: NextPage<HomePageProps> = ({ products }) => {
  // PERBAIKAN: Menghapus state yang tidak terpakai
  // const { currentUser } = useAuth();
  // const [isAdmin, setIsAdmin] = useState(false);
  // const [isMounted, setIsMounted] = useState(false);
  // useEffect(() => { ... }, []);
  // const renderCtaButton = () => { ... };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  } as const;

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  } as const;

  return (
    <div className="bg-[#0F172A]">
      <Head>
        <title>Si-UMKM - Platform Digitalisasi UMKM Brebes</title>
        <meta name="description" content="Membantu UMKM Brebes mendaftarkan produk, mendapatkan ulasan, dan mengakses program pelatihan." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <motion.section 
          className="relative"
          initial="hidden" animate="visible" variants={sectionVariants}
        >
          <div className="container mx-auto px-6 py-20 lg:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">Wujudkan UMKM Naik Kelas Bersama Kami</h1>
                <p className="text-base md:text-lg text-slate-300 mt-4 max-w-xl">Platform terpadu untuk mempublikasikan produk, menerima ulasan, dan mendapatkan akses eksklusif ke program pembinaan pemerintah.</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/produk" className="inline-block mt-8 bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 text-black font-semibold rounded px-6 py-3 shadow-md shadow-yellow-400/20">
                    Jelajahi Produk
                  </Link>
                </motion.div>
              </div>
              <motion.div className="hidden md:block" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Image src="/images/orangjualan.jpg" alt="Ilustrasi UMKM" width={500} height={500} className="rounded-xl shadow-2xl object-cover" priority />
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="py-20 lg:py-24 bg-slate-900/50"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Temukan Produk UMKM Unggulan</h2>
              <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-lg leading-relaxed">Jelajahi produk-produk terbaik hasil karya UMKM lokal.</p>
            </div>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={cardContainerVariants}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} variant="compact" variants={cardVariants}/>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="bg-[#1A1A1A] py-16"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}
        >
          <div className="container mx-auto px-6">
            <h2 className="text-yellow-400 text-center text-xl font-bold tracking-widest">SALE, SALE, SALE..!!</h2>
            <p className="text-center text-slate-300 mt-1 mb-10">Tanpa basa-basi, potongan harga langsung kami beri.</p>
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-900">
              <Image src="/images/diskon10.jpg" alt="Promo" fill className="object-cover z-0 opacity-20" />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                <div className="text-white">
                  <h3 className="text-3xl lg:text-4xl font-bold">Deal of the Day!</h3>
                  <p className="mt-3 text-lg text-slate-300">Potongan harga untuk semua produk pilihan kami yang membuat Anda ingin menambah isi keranjang Anda.</p>
                </div>
                <div className="text-center md:text-right text-white">
                  <p className="text-7xl lg:text-8xl font-bold drop-shadow-lg text-yellow-400">10%</p>
                  <p className="font-semibold mt-1 text-slate-300">Tidak besar, tapi sangat lumayan.</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2.5 rounded-md mt-6 transition-all duration-300">
                    Grab The Deal Now
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
        
        <motion.section 
          className="py-20 lg:py-24"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}
        >
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">Apa Kata Mereka?</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-lg leading-relaxed">Kisah sukses dari para pelaku UMKM yang telah bergabung bersama kami.</p>
                </div>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={cardContainerVariants}
                >
                    {testimonials.map((testimonial, index) => (
                      <motion.div key={index} variants={cardVariants}>
                          <TestimonialCard {...testimonial} />
                      </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produk`);
    if (!res.ok) {
      console.error('Gagal mengambil data produk dari API');
      return { props: { products: [] } };
    }
    const products: Product[] = await res.json();
    const featuredProducts = products.slice(0, 3);
    return {
      props: { products: featuredProducts, },
      revalidate: 60,
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        products: [],
      },
    };
  }
};

export default HomePage;