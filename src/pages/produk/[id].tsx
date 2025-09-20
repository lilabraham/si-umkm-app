// LOKASI FILE: src/pages/produk/[id].tsx
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Breadcrumb from '@/components/common/Breadcrumb';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string;
  ownerId: string;
  category?: string;
}

interface Seller {
  whatsapp: string;
}

interface ProductDetailPageProps {
  product: Product | null;
  seller: Seller | null;
}

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product, seller }) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  if (!product || !seller) {
    return (
      <div className="text-center py-20">
        <h1>Produk tidak ditemukan.</h1>
      </div>
    );
  }

  // Normalisasi nomor WA -> wa.me/62xxxxxxxx
  const waNumber = seller.whatsapp
    ? (() => {
        let p = seller.whatsapp.trim();
        if (p.startsWith('+')) p = p.substring(1);
        if (p.startsWith('0')) p = '62' + p.slice(1);
        return p;
      })()
    : '';

  const wa = waNumber ? `https://wa.me/${waNumber}` : '';

  const backToStoreHref =
    product.category && product.category !== ''
      ? { pathname: `/toko/${product.ownerId}`, query: { kategori: product.category } }
      : { pathname: `/toko/${product.ownerId}` };

  // Handler seragam: jika belum login -> ke /login?next=..., jika sudah -> buka WA
  const handleContact = () => {
    if (!wa) return;
    if (!currentUser) {
      const next = encodeURIComponent(router.asPath || `/produk/${product.id}`);
      router.push(`/login?next=${next}`);
      return;
    }
    window.open(wa, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Head>
        <title>{`${product.name} - Si-UMKM`}</title>
        <meta name="description" content={product.description} />
      </Head>

      <motion.div
        className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Breadcrumb
          items={[
            { label: 'Beranda', href: '/' },
            { label: product.shopName, href: `/toko/${product.ownerId}` },
            { label: product.name }, // aktif
          ]}
          className="mb-4"
        />

        {/* === HERO === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Kiri: Gambar */}
          <section className="w-full">
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-lg shadow-sm">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 520px"
                priority
              />
            </div>
          </section>

          {/* Kanan: Info */}
          <aside className="w-full">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <Link
                href={`/toko/${product.ownerId}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {product.shopName}
              </Link>

              {product.category && (
                <>
                  <span className="text-slate-400">•</span>
                  <Link href={backToStoreHref} className="inline-block">
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] text-gray-600 hover:bg-slate-50"
                      title="Lihat kategori ini di toko"
                    >
                      <Tag size={11} />
                      {product.category}
                    </span>
                  </Link>
                </>
              )}
            </div>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h1>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Rp {product.price.toLocaleString('id-ID')}
            </p>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              {product.description}
            </p>

            {/* CTA WA */}
            {wa && (
              <button
                type="button"
                onClick={handleContact}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                <MessageSquare size={16} />
                Hubungi Penjual via WhatsApp
              </button>
            )}
          </aside>
        </div>
      </motion.div>

      {/* Sticky CTA WhatsApp (mobile only) */}
      {wa && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Harga</p>
              <p className="text-base font-bold text-slate-900">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleContact}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              aria-label="Hubungi penjual via WhatsApp"
            >
              <MessageSquare size={16} />
              <span className="ml-2">Hubungi Penjual</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================== SSG ================== */
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { getFirestore } = await import('@/lib/firebaseAdmin'); // server-only
    const db = getFirestore();
    const snap = await db.collection('products').get();
    const paths = snap.docs.map((doc: any) => ({ params: { id: doc.id } }));
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { id } = ctx.params as { id: string };
  try {
    const { getFirestore } = await import('@/lib/firebaseAdmin'); // server-only
    const db = getFirestore();

    const productDoc = await db.collection('products').doc(id).get();
    if (!productDoc.exists) return { notFound: true };

    const productData = productDoc.data()!;
    const sellerDoc = await db.collection('users').doc(productData.ownerId).get();

    const product: Product = {
      id: productDoc.id,
      name: productData.name,
      price: productData.price,
      description: productData.description,
      shopName: productData.shopName,
      imageUrl: productData.imageUrl,
      ownerId: productData.ownerId,
      category: productData.category || '',
    };

    const seller: Seller = {
      whatsapp: (sellerDoc.exists && sellerDoc.data()?.whatsapp) || '',
    };

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        seller,
      },
      revalidate: 10,
    };
  } catch {
    return { notFound: true };
  }
};

export default ProductDetailPage;
