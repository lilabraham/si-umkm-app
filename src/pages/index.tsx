// LOKASI FILE: src/pages/index.tsx

import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ui/ProductCard';

// Interface Product tidak diubah
interface Product {
  id: string;
  name: string;
  price: number;
  shopName: string;
  rating?: number;
  imageUrl?: string;
}

interface HomePageProps {
  products: Product[];
}

// Data Testimoni tidak diubah
const testimonials = [
  {
    text:
      'Platform ini sangat membantu usaha bawang merah saya. Sekarang lebih mudah menjangkau pelanggan di luar kota!',
    author: 'Ibu Siti Aminah',
    role: 'Petani Bawang Merah, Brebes',
    avatarUrl: '/avatar/siti.jpg',
  },
  {
    text:
      'Fitur info pelatihannya sangat bermanfaat. Saya jadi tahu program-program pemerintah untuk UMKM.',
    author: 'Budi Santoso',
    role: 'Pengrajin Batik Salem',
    avatarUrl: '/avatar/budi.jpg',
  },
  {
    text:
      'Tampilan websitenya modern dan mudah digunakan. Produk saya jadi terlihat lebih profesional.',
    author: 'Rina Wulandari',
    role: 'Produsen Telur Asin',
    avatarUrl: '/avatar/rina.jpg',
  },
];

const HomePage: NextPage<HomePageProps> = ({ products }) => {
  const { currentUser } = useAuth(); // Logika auth tetap ada untuk ProductCard

  // Variants framer-motion (pakai easing cubic-bezier, bukan string)
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const cardContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } as any },
  };

  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    // Background terang
    <div className="bg-slate-50">
      <Head>
        <title>Si-UMKM - Platform Digitalisasi UMKM</title>
        <meta
          name="description"
          content="Membantu UMKM mendaftarkan produk, mendapatkan ulasan, dan mengakses program pelatihan."
        />
      </Head>
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
  {/* Background foto + overlay halus */}
  <div className="absolute inset-0">
    <img
      src="/images/umkm-market.jpg" /* ganti fotomu */
      alt="Pasar UMKM"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40" />
  </div>

  <div className="relative container mx-auto px-4 md:px-6 py-20 md:py-28">
    <div className="max-w-3xl">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
        Temukan & Dukung Produk Lokal
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        Jelajahi produk unik karya UMKM desa Randudongkal.
      </p>

      {/* Search + CTA */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-xl border px-3 py-2 shadow-sm">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-gray-400"><path stroke="currentColor" strokeWidth="2" d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"/></svg>
            <input
              placeholder="Cari dimsum, batik, kopi, kerajinan…"
              className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
        <a href="/produk/produk" className="inline-flex items-center justify-center rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 shadow-lg shadow-green-500/20 transition">
          Belanja Sekarang
        </a>
      </div>

      {/* Kategori cepat */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['Makanan', 'Fashion', 'Kerajinan', 'Minuman', 'Kecantikan'].map((k) => (
          <a key={k} href={`/kategori/${k.toLowerCase()}`}
             className="text-sm px-3 py-1.5 rounded-full bg-white/80 border hover:bg-white transition text-gray-700">
            {k}
          </a>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          1.2K+ UMKM terdaftar
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Review asli pembeli
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Chat cepat via WhatsApp
        </div>
      </div>
    </div>
  </div>
</section>


        {/* Produk Unggulan */}
        <motion.section
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900">
                Produk Unggulan Minggu Ini
              </h2>
              <p className="text-gray-600 mt-2">
                Pilihan terbaik yang paling disukai oleh para pelanggan kami.
              </p>
            </div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  variants={cardVariants}
                />
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Promo/Deal of the Day */}
        <motion.section
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-yellow-300/50 shadow-sm">
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-yellow-100/50 rounded-full" />
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-yellow-100/50 rounded-full" />
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Penawaran Spesial!
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Dapatkan diskon khusus untuk produk-produk pilihan. Jangan
                    sampai ketinggalan!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all"
                  >
                    Lihat Promo
                  </motion.button>
                </div>
                <div className="hidden md:block">
                  <Image
                    src="/images/promo-image.png"
                    alt="Promo"
                    width={300}
                    height={300}
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Testimoni */}
        <motion.section
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900">
                Apa Kata Mereka?
              </h2>
              <p className="text-gray-600 mt-2">
                Kami bangga telah membantu banyak UMKM bertumbuh.
              </p>
            </div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center"
                >
                  <Image
                    src={testimonial.avatarUrl}
                    alt={testimonial.author}
                    width={64}
                    height={64}
                    className="rounded-full mx-auto"
                  />
                  <p className="mt-4 text-gray-700 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold text-gray-800">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
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
    const allProducts: any[] = await res.json();

    // Kirim hanya data yang dibutuhkan
    const featuredProducts = allProducts.slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      shopName: p.shopName,
      rating: p.rating || null,
      imageUrl: p.imageUrl || null,
    }));

    return {
      props: { products: featuredProducts },
      revalidate: 60,
    };
  } catch (error) {
    console.error(error);
    return {
      props: { products: [] },
    };
  }
};

export default HomePage;
