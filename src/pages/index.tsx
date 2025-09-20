// LOKASI FILE: src/pages/index.tsx

import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import HeroCinematic from '@/components/home/HeroCinematic';
import Reveal from '@/components/motion/Reveal';

type Product = {
  id: string;
  name: string;
  price: number;
  shopName: string;
  imageUrl?: string | null;
};

interface HomePageProps {
  products: Product[];
}

// Geometric, modern sans (mendekati Circular/Gilroy)
const pj = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const TEAL = '#004D40';
const BG = '#FDFBF7';
const TEXT = '#333333';

const HomePage: NextPage<HomePageProps> = ({ products }) => {
  const featured = products.slice(0, 3);

  return (
    <div className={`${pj.className}`} style={{ backgroundColor: BG, color: TEXT }}>
      <Head>
        <title>Si-UMKM — cinematic marketplace lokal</title>
        <meta
          name="description"
          content="Marketplace premium yang menghubungkan Anda dengan karya terbaik dari para kreator UMKM Indonesia."
        />
      </Head>

      {/* ======================= 1) HERO ======================= */}
      <HeroCinematic />

      {/* =================== 2) FEATURED PRODUCTS =================== */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal as="div" y={18}>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[color:#1f2b28]">
                Kurasi Pilihan Bulan Ini
              </h2>
              <p className="mt-2 text-sm md:text-base text-black/60">
                Koleksi premium pilihan editor — karya autentik dari penjuru nusantara.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, idx) => (
              <Reveal key={p.id} as="article" y={26} delay={idx * 0.08}>
                <div className="rounded-2xl bg-white shadow-[0_3px_18px_rgba(0,0,0,0.06)] overflow-hidden ring-1 ring-black/5">
                  <Link href={`/produk/${p.id}`} className="block group">
                    <div className="relative aspect-[4/3] w-full">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-neutral-200" />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base md:text-lg font-semibold text-black/90">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-[15px] text-black/60">
                        Rp {Number(p.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= 3) MISSION ======================= */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-center">
          {/* Left: portrait */}
          <Reveal as="div" y={28} className="relative min-h-[360px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-[0_3px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
            <Image
              src="/images/artisan-portrait.jpg" // ganti dengan potret hangat
              alt="Artisan lokal"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Reveal>

          {/* Right: copy */}
          <div>
            <Reveal as="h3" y={16} className="text-2xl md:text-3xl font-extrabold text-[color:#1f2b28]">
              Memberdayakan Kreator Lokal.
            </Reveal>
            <Reveal y={18} delay={0.05}>
              <p className="mt-4 text-black/75 leading-relaxed">
                Kami percaya kualitas lahir dari proses yang penuh perhatian. Platform ini
                menghubungkan pengrajin dengan pembeli yang menghargai keaslian dan ketelitian.
              </p>
            </Reveal>
            <Reveal y={18} delay={0.1}>
              <p className="mt-3 text-black/75 leading-relaxed">
                Dengan kurasi yang selektif, pendidikan pasar, dan dukungan teknologi, kami
                membantu karya lokal tampil premium tanpa meninggalkan akar budaya.
              </p>
            </Reveal>
            <Reveal y={18} delay={0.15}>
              <Link
                href="/misi"
                className="mt-6 inline-flex items-center justify-center rounded-xl border px-5 py-2.5 font-semibold text-[color:#0c6a60] border-[color:#0c6a60] hover:bg-[#0c6a60] hover:text-white transition"
              >
                Pelajari Misi Kami
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== 4) FINAL CTA BANNER ==================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/rice-terrace.jpg" // foto lanskap Indonesia
            alt="Lanskap Indonesia"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ backgroundColor: `${TEAL}`, opacity: 0.72 }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28 text-center">
          <Reveal as="h4" y={16} className="text-white font-extrabold text-2xl md:text-4xl leading-tight">
            Siap Menjadi Bagian dari Cerita?
          </Reveal>
          <Reveal y={20} delay={0.06}>
            <Link
              href="/produk/produk"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-white text-[color:#0c6a60] px-6 py-3 font-semibold hover:opacity-90"
            >
              Belanja Sekarang
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const base =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';
    const res = await fetch(`${base}/api/produk`, { next: { revalidate: 60 } as any });
    const all: any[] = res.ok ? await res.json() : [];

    const products: Product[] = (all || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      shopName: p.shopName,
      imageUrl: p.imageUrl || null,
    }));

    return { props: { products }, revalidate: 60 };
  } catch {
    return { props: { products: [] }, revalidate: 60 };
  }
};

export default HomePage;
