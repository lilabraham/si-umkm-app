// src/pages/index.tsx (atau src/app/page.tsx)

import Head from 'next/head';
import Image from 'next/image';
import FeatureCard from '@/components/ui/FeatureCard';
import ProductCard from '@/components/ui/ProductCard';
import TestimonialCard from '@/components/ui/TestimonialCard'; // Impor komponen baru
import { PackageCheck, Star, BookOpenCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Data produk (tidak berubah)
const dummyProducts = [
  { id: 1, name: 'Kopi Robusta Brebes', seller: 'Warung Kopi Jaya', price: 50000, rating: 4.8, imageUrl: '/images/kopi.jpg' },
  { id: 2, name: 'Keripik Bawang Asli', seller: 'UMKM Makmur', price: 25000, rating: 4.9, imageUrl: '/images/keripik.jpg' },
  { id: 3, name: 'Batik Tulis Mega Mendung', seller: 'Galeri Batik Cirebon', price: 350000, rating: 5.0, imageUrl: '/images/batik tulis.jpg' },
];

// Data fitur (tidak berubah)
const features = [
  { Icon: PackageCheck, title: 'Publikasi Produk', description: 'Daftarkan dan pamerkan produk Anda ke jangkauan pasar yang lebih luas.' },
  { Icon: Star, title: 'Ulasan & Rating', description: 'Dapatkan masukan berharga dari pelanggan untuk meningkatkan kualitas.' },
  { Icon: BookOpenCheck, title: 'Info Pelatihan', description: 'Akses jadwal dan materi program pembinaan dari pemerintah.' },
];

// Data testimoni baru
const testimonials = [
    { text: 'Platform ini sangat membantu usaha bawang merah saya. Sekarang lebih mudah menjangkau pelanggan di luar kota!', author: 'Ibu Siti Aminah', role: 'Petani Bawang Merah, Brebes', avatarUrl: '/avatar/siti.jpg' },
    { text: 'Fitur info pelatihannya sangat bermanfaat. Saya jadi tahu program-program pemerintah untuk UMKM.', author: 'Budi Santoso', role: 'Pengrajin Batik Salem', avatarUrl: '/avatar/budi.jpg' },
    { text: 'Tampilan websitenya modern dan mudah digunakan. Produk saya jadi terlihat lebih profesional.', author: 'Rina Wulandari', role: 'Produsen Telur Asin', avatarUrl: '/avatar/rina.jpg' }
];


const HomePage = () => {
  return (
    <div className="bg-slate-900">
      <Head>
        <title>Si-UMKM - Platform Digitalisasi UMKM Brebes</title>
        <meta name="description" content="Membantu UMKM Brebes mendaftarkan produk, mendapatkan ulasan, dan mengakses program pelatihan." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Hero Section (tidak berubah) */}
        <section className="bg-gradient-to-br from-white smoke-600 via-white-700 to-gray-500 text-black">
          <div className="container mx-auto px-6 py-20 lg:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">Wujudkan UMKM Naik Kelas Bersama Kami</h1>
                <p className="mt-4 text-lg lg:text-xl text-black-100 max-w-xl">Platform terpadu untuk mempublikasikan produk, menerima ulasan, dan mendapatkan akses eksklusif ke program pembinaan pemerintah.</p>
                <button className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105">Daftar Sekarang</button>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <div className="hidden md:block">
                  <Image src="/images/orangjualan.jpg" alt="Ilustrasi UMKM" width={500} height={500} className="rounded-xl shadow-2xl object-cover" priority />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Seksi Produk Unggulan */}
        <section className="bg-white py-20 lg:py-24"> {/* DIUBAH: Background menjadi putih bersih */}
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      
      {/* DIUBAH: Warna teks dibuat lebih gelap agar kontras */}
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900"> 
        Temukan Produk UMKM Unggulan
      </h2>
      <p className="text-gray-700 mt-2 max-w-2xl mx-auto text-lg leading-relaxed">
        Jelajahi produk-produk terbaik hasil karya UMKM lokal Brebes dan sekitarnya.
      </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dummyProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* AWAL SEKSI PROMOSI BARU */}
{/* DIUBAH: Latar belakang seksi menggunakan warna coklat gelap */}
<section className="bg-[#1C1611] py-20 lg:py-24">
  <div className="container mx-auto px-6">
    {/* Bagian Judul "SALE" */}
    <div className="text-center mb-12">
      {/* DIUBAH: Judul menggunakan warna aksen kuning keemasan */}
      <h2 className="text-3xl md:text-4xl font-bold tracking-wider text-amber-500">
        SALE, SALE, SALE..!!
      </h2>
      {/* DIUBAH: Subtitle menggunakan warna putih gading agar lebih jelas */}
      <p className="text-lg text-gray-300 mt-2">
        Tanpa basa-basi, potongan harga langsung kami beri.
      </p>
    </div>

    {/* Bagian Banner "Deal of the Day" */}
    {/* Banner ini sudah memiliki overlay gelap, jadi tidak perlu diubah */}
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Gambar Background */}
      <Image
        src="/images/diskon10.jpg"
        alt="Promo Kopi"
        fill
        className="object-cover z-0"
      />
      {/* 2. Overlay Gelap untuk Kontras Teks */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      {/* 3. Konten Teks & Tombol */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-8 items-center p-8 md:p-16 min-h-[350px]">
        {/* Kolom Kiri: Deskripsi Deal */}
        <div className="md:col-span-3 text-white">
          <h3 className="text-4xl lg:text-5xl font-extrabold">
            Deal of the Day!
          </h3>
          <p className="mt-4 text-lg max-w-lg leading-relaxed text-slate-200">
            Potongan harga untuk semua produk kopi kami yang membuat Anda ingin menambah isi gelas kopi Anda.
          </p>
          {/* DIUBAH: Tombol menggunakan warna aksen agar konsisten */}
          <button className="mt-8 bg-amber-500 text-black font-bold px-8 py-3 rounded-md shadow-lg 
                           transition-transform duration-300 ease-in-out hover:bg-amber-400 hover:scale-105">
            Grab The Deal Now
          </button>
        </div>
        {/* Kolom Kanan: Persentase Diskon (tidak perlu diubah, sudah kontras) */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center text-white">
          <p className="text-7xl lg:text-8xl font-bold drop-shadow-lg">
            10%
          </p>
          <p className="font-semibold mt-1">Tidak besar, tapi sangat lumayan.</p>
        </div>
      </div>
    </div>
  </div>
</section>
{/* AKHIR SEKSI PROMOSI BARU */}

        {/* SEKSI TESTIMONI (BARU) */}
        <section className="py-20 lg:py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">Apa Kata Mereka?</h2>
                    <p className="text-white-400 mt-2 max-w-2xl mx-auto text-lg leading-relaxed">Kisah sukses dari para pelaku UMKM yang telah bergabung bersama kami.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                         <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                            <TestimonialCard {...testimonial} />
                         </motion.div>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;