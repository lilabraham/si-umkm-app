// LOKASI FILE: src/pages/produk/[id].tsx
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Tag, MessageSquare } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string;
  ownerId: string;
  category?: string;
};

type Seller = { whatsapp: string };

interface ProductDetailPageProps {
  product: Product | null;
  seller: Seller | null;
  related: Product[];
}

const formatCategory = (val?: string) => {
  if (!val) return '';
  const pretty = String(val).replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
};

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product, seller, related }) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  if (!product || !seller) {
    return (
      <div className="text-center py-20">
        <h1>Produk tidak ditemukan.</h1>
      </div>
    );
  }

  const wa = seller.whatsapp
    ? `https://wa.me/${seller.whatsapp.startsWith('0') ? '62' + seller.whatsapp.slice(1) : seller.whatsapp}`
    : '';

  const backToStoreHref =
    product.category && product.category !== ''
      ? { pathname: `/toko/${product.ownerId}`, query: { kategori: product.category } }
      : { pathname: `/toko/${product.ownerId}` };

  const goWhatsApp = (e?: React.MouseEvent) => {
    if (!wa) return;
    if (!currentUser) {
      e?.preventDefault();
      router.push('/login');
    }
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
            { label: product.name },
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
              {/* BADGE KATEGORI (gambar utama) */}
              {product.category && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur">
                  <Tag size={12} className="opacity-70" />
                  {formatCategory(product.category)}
                </span>
              )}
            </div>
          </section>

          {/* Kanan: Info */}
          <aside className="w-full">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <Link href={`/toko/${product.ownerId}`} className="font-semibold text-blue-600 hover:underline">
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
                      {formatCategory(product.category)}
                    </span>
                  </Link>
                </>
              )}
            </div>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h1>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Rp {product.price.toLocaleString('id-ID')}
            </p>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed">{product.description}</p>

            {/* CTA WA (login gate) */}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={goWhatsApp}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                <MessageSquare size={16} />
                Hubungi Penjual via WhatsApp
              </a>
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

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={goWhatsApp}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              aria-label="Hubungi penjual via WhatsApp"
            >
              <MessageSquare size={16} />
              <span className="ml-2">Hubungi Penjual</span>
            </a>
          </div>
        </div>
      )}

      {/* ==================== RELATED PRODUCTS ==================== */}
      {related.length > 0 && (
        <section className="mt-12 bg-[#F8F9FA]">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Produk Lainnya dari Toko Ini</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.slice(0, 3).map((p) => (
                <article
                  key={p.id}
                  className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 p-4 flex flex-col"
                >
                  <Link href={`/produk/${p.id}`} className="block">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                      {/* BADGE KATEGORI (kartu terkait) */}
                      {p.category && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur">
                          <Tag size={12} className="opacity-70" />
                          {formatCategory(p.category)}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="mt-3 flex flex-col gap-1">
                    <p className="text-xs text-slate-500">{p.shopName}</p>
                    <Link href={`/produk/${p.id}`} className="hover:underline">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{p.name}</h3>
                    </Link>
                    <p className="text-[15px] font-medium text-slate-900">
                      Rp {Number(p.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={goWhatsApp}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true">
                        <path d="M12.04 2C6.57 2 2.13 6.44 2.13 11.91c0 1.97.53 3.82 1.47 5.41L2 22l4.82-1.57a10.01 10.01 0 0 0 5.22 1.48c5.47 0 9.91-4.44 9.91-9.91C22 6.44 17.56 2 12.09 2h-.05Zm5.77 14.24c-.24.68-1.18 1.1-1.83 1.25-.49.11-1.14.2-3.31-.68-2.77-1.15-4.56-3.96-4.7-4.14-.14-.19-1.12-1.49-1.12-2.84 0-1.35.71-2.01.96-2.29.24-.28.63-.41 1-.41.12 0 .22 0 .32.01.28.01.42.03.6.47.24.58.83 2 .9 2.15.07.15.11.33.02.52-.09.2-.14.32-.29.5-.14.16-.3.36-.43.49-.14.14-.29.29-.13.56.16.28.71 1.18 1.52 1.91 1.05.94 1.93 1.24 2.22 1.38.28.14.45.12.62-.07.2-.24.44-.62.69-1 .18-.28.4-.32.64-.22.24.09 1.51.71 1.77.84.26.13.43.19.49.3.07.1.07.66-.17 1.34Z" />
                      </svg>
                      Beli via WhatsApp
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

/* ================== SSG ================== */
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { getFirestore } = await import('@/lib/firebaseAdmin');
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
    const { getFirestore } = await import('@/lib/firebaseAdmin');
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

    const relSnap = await db
      .collection('products')
      .where('ownerId', '==', productData.ownerId)
      .limit(8)
      .get();

    const relatedAll: Product[] =
      relSnap.docs
        .filter((d: any) => d.id !== id)
        .map((d: any) => {
          const p = d.data();
          return {
            id: d.id,
            name: p.name,
            price: p.price,
            description: p.description,
            shopName: p.shopName,
            imageUrl: p.imageUrl,
            ownerId: p.ownerId,
            category: p.category || '',
          } as Product;
        }) || [];

    const related = relatedAll.slice(0, 3);

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        seller,
        related,
      },
      revalidate: 10,
    };
  } catch {
    return { notFound: true };
  }
};

export default ProductDetailPage;
