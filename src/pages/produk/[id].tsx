// LOKASI FILE: src/pages/produk/[id].tsx

// src/pages/produk/[id].tsx
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, FormEvent, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Star, MessageSquare, Send, UserCircle, Tag, ChevronDown, Loader2 } from 'lucide-react';

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
interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
}
interface Seller {
  whatsapp: string;
}
interface ProductDetailPageProps {
  product: Product | null;
  initialReviews: Review[];
  seller: Seller | null;
}

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

const formatDate = (ts: Review['createdAt']) => {
  if (!ts || typeof ts.seconds !== 'number') return '';
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

type SortKey = 'suggested' | 'recent' | 'highest' | 'lowest';

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product, initialReviews, seller }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('suggested');
  const [openSort, setOpenSort] = useState(false);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) {
      setMessage('Rating dan komentar wajib diisi.');
      return;
    }
    if (!currentUser) {
      setMessage('Anda harus login untuk memberikan ulasan.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Pengguna Terdaftar',
          rating,
          comment,
        }),
      });
      if (!res.ok) throw new Error('Gagal mengirim ulasan.');
      const newReview = await res.json();
      if (!newReview.createdAt) {
        newReview.createdAt = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
      }
      setReviews(prev =>
        [newReview, ...prev].sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        ),
      );
      setRating(0);
      setComment('');
      setShowForm(false);
    } catch (err: any) {
      setMessage(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const { averageRating, totalReviews } = useMemo(() => {
    if (!reviews.length) return { averageRating: 0, totalReviews: 0 };
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { averageRating: total / reviews.length, totalReviews: reviews.length };
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    switch (sortKey) {
      case 'recent':
      case 'suggested':
        return copy.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      case 'highest':
        return copy.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return copy.sort((a, b) => a.rating - b.rating);
      default:
        return copy;
    }
  }, [reviews, sortKey]);

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

        {/* ================== HERO: gambar sedang kiri, info ringkas kanan ================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* KIRI: GAMBAR (ukuran sedang, proporsional, tanpa box tebal) */}
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

          {/* KANAN: INFO RINGKAS */}
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
                  <Link
                    href={backToStoreHref}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] text-gray-600 hover:bg-slate-50"
                    title="Lihat kategori ini di toko"
                  >
                    <Tag size={11} />
                    {product.category}
                  </Link>
                </>
              )}
            </div>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h1>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Rp {product.price.toLocaleString('id-ID')}
            </p>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed">{product.description}</p>

            {/* CTA WA - kecil, di bawah deskripsi (desktop & tablet) */}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                <MessageSquare size={16} />
                Hubungi Penjual via WhatsApp
              </a>
            )}
          </aside>
        </div>

        {/* ================== ULASAN: tanpa card, ala Etsy ================== */}
        <section className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-900">
                {averageRating.toFixed(1)}
              </span>
              <div>
                <StarRating rating={averageRating} size={16} />
                <p className="text-xs text-slate-500">dari {totalReviews} ulasan</p>
              </div>
            </div>

            {/* Sort kecil */}
            <div className="relative">
              <button
                onClick={() => setOpenSort(s => !s)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
              >
                Sort by:{' '}
                {sortKey === 'suggested'
                  ? 'Suggested'
                  : sortKey === 'recent'
                  ? 'Most recent'
                  : sortKey === 'highest'
                  ? 'Highest Rating'
                  : 'Lowest Rating'}
                <ChevronDown size={14} />
              </button>
              {openSort && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-md z-10"
                  onMouseLeave={() => setOpenSort(false)}
                >
                  {([
                    { key: 'suggested', label: 'Suggested' },
                    { key: 'recent', label: 'Most recent' },
                    { key: 'highest', label: 'Highest Rating' },
                    { key: 'lowest', label: 'Lowest Rating' },
                  ] as { key: SortKey; label: string }[]).map(o => (
                    <button
                      key={o.key}
                      onClick={() => {
                        setSortKey(o.key);
                        setOpenSort(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs hover:bg-slate-50 ${
                        sortKey === o.key ? 'font-semibold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trigger form ulasan (tanpa “box” besar) */}
          <div className="mt-5">
            {currentUser ? (
              <>
                <button
                  onClick={() => setShowForm(s => !s)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {showForm ? 'Tutup formulir' : 'Tulis ulasan'}
                </button>

                {showForm && (
                  <form onSubmit={handleReviewSubmit} className="mt-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Rating:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5"
                          aria-label={`Rating ${star}`}
                        >
                          <Star
                            size={16}
                            className={
                              rating >= star
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Tulis komentar Anda…"
                      className="w-full border-b border-slate-300 bg-transparent p-1 text-sm outline-none focus:border-slate-500"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                        Kirim
                      </button>
                      {message && <span className="text-xs text-red-500">{message}</span>}
                    </div>
                  </form>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-600">
                <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                  Login
                </Link>{' '}
                untuk menulis ulasan.
              </p>
            )}
          </div>

          {/* Daftar ulasan: tanpa card, garis pemisah tipis */}
          <div className="mt-6 divide-y divide-slate-200">
            {sortedReviews.length ? (
              sortedReviews.map(r => (
                <div key={r.id} className="py-4">
                  <div className="flex items-start gap-3">
                    <UserCircle className="h-8 w-8 text-slate-400" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-800">{r.userName}</span>
                        <span className="text-slate-300">•</span>
                        <StarRating rating={r.rating} size={12} />
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{formatDate(r.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-800">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">
                Belum ada ulasan untuk produk ini.
              </p>
            )}
          </div>
        </section>
      </motion.div>

      {/* === Sticky CTA WhatsApp (mobile only) === */}
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
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              aria-label="Hubungi penjual via WhatsApp"
            >
              <MessageSquare size={16} />
              <span className="ml-2">Hubungi Penjual</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================== SSG ================== */
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { getFirestore } = await import('@/lib/firebaseAdmin'); // ⬅️ server-only
    const db = getFirestore();
    const snap = await db.collection('products').get();
     const paths = snap.docs.map((doc: any) => ({ params: { id: doc.id } })); // ⬅️ beri tipe any agar TS tidak protes
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async ctx => {
  const { id } = ctx.params as { id: string };
  try {
    const { getFirestore } = await import('@/lib/firebaseAdmin'); // ⬅️ server-only
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

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const reviewsRes = await fetch(`${baseUrl}/api/reviews?productId=${product.id}`);
    const initialReviews: Review[] = reviewsRes.ok ? await reviewsRes.json() : [];

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        initialReviews: initialReviews.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        ),
        seller,
      },
      revalidate: 10,
    };
  } catch {
    return { notFound: true };
  }
};

export default ProductDetailPage;
