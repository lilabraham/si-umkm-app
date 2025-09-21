// LOKASI: src/pages/tentang-kami.tsx
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { NextPage } from 'next';
import { Mail, MessageCircle, BadgeCheck, Users, Sparkles } from 'lucide-react';
import { Inter, Playfair_Display } from 'next/font/google';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700', '800'], display: 'swap' });

const BG = '#FDFBF7';
const BEIGE = '#F5F3F0';
const TEAL = '#004D40';
const TERRACOTTA = '#E87A5D';

// ==== gunakan cubic-bezier (bukan string) ====
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ===== Variants =====
const heroParent: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: EASE,
      duration: 0.7,
      when: 'beforeChildren',
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
};

const heroLine: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { ease: EASE, duration: 0.7 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { ease: EASE, duration: 0.7 } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { ease: EASE, duration: 0.8 } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { ease: EASE, duration: 0.8 } },
};

const staggerParent: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { ease: EASE, duration: 0.6 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { ease: EASE, duration: 0.6 } },
};

const TentangKamiPage: NextPage = () => {
  return (
    <div className={inter.className} style={{ backgroundColor: BG, color: '#333' }}>
      <Head>
        <title>Tentang Kami — Si-UMKM</title>
        <meta
          name="description"
          content="Marketplace modern yang memberdayakan kreator UMKM Indonesia melalui kurasi, teknologi, dan komunitas."
        />
      </Head>

      {/* 1) HERO */}
      <section className="relative min-h-[72vh] md:min-h-[80vh] overflow-hidden">
        {/* Ken Burns */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.06] }}
          transition={{ duration: 18, ease: EASE, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Image src="/images/about-hero.jpg" alt="Pengrajin lokal Indonesia" fill priority className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.35)]" />
        <div className="relative z-10 mx-auto flex min-h-[72vh] md:min-h-[80vh] max-w-6xl items-center px-4">
          <motion.div className="max-w-3xl text-white" variants={heroParent} initial="hidden" animate="visible">
            <motion.h1 className={`${playfair.className} text-3xl md:text-5xl font-semibold leading-tight`} variants={heroLine}>
              Memberdayakan Kreator, Menyatukan Komunitas.
            </motion.h1>
            <motion.p className="mt-4 text-base md:text-lg text-white/90" variants={heroLine}>
              Kami percaya kualitas lahir dari tangan-tangan terampil. Misi kami adalah membawa karya UMKM Indonesia ke
              audiens yang lebih luas—secara adil, transparan, dan manusiawi.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 2) OUR STORY */}
      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-center">
          <motion.div
            className="relative h-[320px] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 md:h-[440px]"
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <Image src="/images/founder.jpg" alt="Tim inti Si-UMKM" fill className="object-cover" />
          </motion.div>

          <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
            <h2 className={`${playfair.className} text-2xl md:text-3xl font-semibold text-[color:#1f2b28]`}>
              Cerita di Balik Layar.
            </h2>
            <p className="mt-4 leading-relaxed text-black/80">
              Si-UMKM lahir dari kegelisahan sederhana: banyak karya hebat yang tidak tersorot. Kami memulai dari workshop
              kecil, mendengarkan kebutuhan para pelaku usaha, lalu membangun platform yang memudahkan mereka tampil profesional
              tanpa meninggalkan akar budaya.
            </p>
            <p className="mt-3 leading-relaxed text-black/80">
              Hari ini, kami berfokus pada kurasi berkualitas, pendidikan pasar, dan fasilitas transaksi yang aman. Tujuan kami
              satu: memperluas jangkauan para kreator lokal, sembari merawat kepercayaan dan menghubungkan mereka dengan
              komunitas yang menghargai keaslian.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3) OUR VALUES */}
      <section className="py-16 md:py-20" style={{ backgroundColor: BEIGE }}>
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div variants={cardUp} className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
              <Sparkles className="h-8 w-8 text-[color:#6b7280]" />
              <h3 className="mt-4 text-lg font-bold">Keaslian</h3>
              <p className="mt-1 text-black/70">Produk terkurasi yang jujur terhadap asal, proses, dan cerita pembuatnya.</p>
            </motion.div>

            <motion.div variants={cardUp} className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
              <Users className="h-8 w-8 text-[color:#6b7280]" />
              <h3 className="mt-4 text-lg font-bold">Komunitas</h3>
              <p className="mt-1 text-black/70">Kami merayakan kolaborasi—menghubungkan pengrajin, pembeli, dan mitra lokal.</p>
            </motion.div>

            <motion.div variants={cardUp} className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
              <BadgeCheck className="h-8 w-8 text-[color:#6b7280]" />
              <h3 className="mt-4 text-lg font-bold">Kualitas</h3>
              <p className="mt-1 text-black/70">Standar visual & mutu yang konsisten untuk menghadirkan pengalaman premium.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4) CONTACT */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: `linear-gradient(180deg, ${TERRACOTTA}1A, ${BEIGE})` }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <motion.h2
            className={`${playfair.className} text-center text-2xl md:text-3xl font-semibold text-[color:#1f2b28]`}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            Mari Terhubung & Berkolaborasi.
          </motion.h2>

          <motion.div
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div variants={scaleIn}>
              <Link
                href="mailto:iqroace@gmail.com"
                className="group block rounded-2xl border border-black/10 bg-white p-8 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,77,64,0.35)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: TEAL }}>
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-black/60">Email</p>
                    <p className="text-lg font-semibold group-hover:underline">iqroace@gmail.com</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Link
                href="https://wa.me/6289501181894"
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-black/10 bg-white p-8 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[rgba(0,77,64,0.35)]"
              >
                <motion.div className="flex items-center gap-4" whileHover={{ y: -2, scale: 1.02 }} transition={{ ease: EASE, duration: 0.25 }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: TEAL }}>
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-black/60">WhatsApp</p>
                    <p className="text-lg font-semibold group-hover:underline">0895 0118 1894</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div className="mt-10 text-center" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
            <Link href="/produk/produk" className="inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold text-white" style={{ backgroundColor: TEAL }}>
              Jelajahi Produk UMKM
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TentangKamiPage;
