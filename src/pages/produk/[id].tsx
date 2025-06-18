// LOKASI FILE: src/pages/produk/[id].tsx

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star, MessageSquare, Send, UserCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Product {
  id: string; name: string; price: number; description: string; shopName: string; imageUrl: string; ownerId: string;
}
interface Review {
  id: string; userName: string; rating: number; comment: string; createdAt: { seconds: number, nanoseconds: number } | null;
}
interface ProductDetailPageProps {
  product: Product | null;
  initialReviews: Review[];
}

const StarRating = ({ rating, size = 16 }: { rating: number, size?: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product, initialReviews }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment) {
      setMessage("Rating dan komentar wajib diisi.");
      return;
    }
    if (!currentUser) {
      setMessage("Anda harus login untuk memberikan ulasan.");
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          userId: currentUser.uid,
          userName: currentUser.email?.split('@')[0] || 'Anonim',
          rating,
          comment,
        }),
      });
      if (!response.ok) throw new Error("Gagal mengirim ulasan.");
      const newReview = await response.json();
      setReviews(prev => [newReview, ...prev].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
      setRating(0);
      setComment('');
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message || "Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  const { averageRating, totalReviews } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
    };
  }, [reviews]);

  if (!product) {
    return <div className="text-center py-20"><h1>Produk tidak ditemukan.</h1></div>;
  }
  
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Head>
        <title>{`${product.name} - Si-UMKM`}</title>
        <meta name="description" content={product.description} />
      </Head>

      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          <motion.div 
            className="sticky top-24"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="relative w-full aspect-square max-h-[500px] bg-white rounded-xl shadow-lg p-4 border">
              <Image
                src={product.imageUrl}
                alt={`Foto produk ${product.name}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/EEE/31343C?text=Gambar+Rusak'; }}
              />
            </div>
          </motion.div>

          <div className="w-full">
            <p className="text-sm font-semibold text-blue-600">{product.shopName}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{product.name}</h1>
            <p className="text-2xl lg:text-3xl font-bold text-slate-800 mt-4">
              Rp {product.price.toLocaleString('id-ID')}
            </p>

            <motion.button 
              className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare size={20} />
              Hubungi Penjual
            </motion.button>
            
            <div className="border-t border-slate-200 pt-4 mt-6">
                <h2 className="text-lg font-semibold text-slate-800">Deskripsi Produk</h2>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">{product.description}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 lg:mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
            Ulasan & Rating
          </h2>
          
          {totalReviews > 0 && (
            <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-lg border shadow-sm">
                <p className="text-4xl font-bold text-slate-800">{averageRating.toFixed(1)}</p>
                <div>
                    <StarRating rating={averageRating} size={20} />
                    <p className="text-sm text-slate-500">dari {totalReviews} ulasan</p>
                </div>
            </div>
          )}

          {isMounted && currentUser && (
            <div className="bg-white p-6 rounded-xl mb-8 border shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Tulis Ulasan Anda</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-slate-700">Rating Anda</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <Star className={`cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} onClick={() => setRating(star)} />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="comment" className="block mb-2 text-sm font-medium text-slate-700">Komentar</label>
                  <textarea id="comment" rows={4} className="w-full p-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                </div>
                <div className="flex items-center gap-4">
                    <motion.button type="submit" className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition-all" disabled={loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {loading ? <><Loader2 className="animate-spin" size={18}/> Mengirim...</> : <><Send size={16}/> Kirim Ulasan</>}
                    </motion.button>
                    {message && <p className="text-red-500 text-sm">{message}</p>}
                </div>
              </form>
            </div>
          )}

          {isMounted && !currentUser && (
            <div className="bg-slate-100 text-slate-600 text-sm px-4 py-3 rounded-lg border border-slate-200 text-center mb-8">
              <p><Link href="/login" className="text-blue-600 font-semibold hover:underline">Login</Link> untuk memberikan ulasan.</p>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <motion.div 
                  key={review.id} 
                  className="bg-white rounded-lg shadow-sm p-4 border border-slate-200 transition hover:shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start">
                    <UserCircle className="h-10 w-10 text-slate-400" />
                    <div className="ml-4">
                        <div className="flex items-center gap-3">
                            <p className="font-semibold text-slate-800 text-sm">{review.userName}</p>
                            <StarRating rating={review.rating} size={14} />
                        </div>
                        <p className="text-slate-600 text-sm mt-1">{review.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (<p className="text-slate-500 text-center py-8">Belum ada ulasan untuk produk ini.</p>)}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produk`);
        if (!res.ok) {
            console.error("Failed to fetch products for paths");
            return { paths: [], fallback: 'blocking' };
        }
        const products: Product[] = await res.json();
        const paths = products.map((product) => ({
            params: { id: product.id },
        }));
        return { paths, fallback: 'blocking' };
    } catch (error) {
        console.error("Error in getStaticPaths: ", error);
        return { paths: [], fallback: 'blocking' };
    }
};
export const getStaticProps: GetStaticProps = async (context) => {
    const { id } = context.params as { id: string };
    try {
      const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produk/${id}`);
      if (!productRes.ok) {
        return { notFound: true };
      }
      const product: Product = await productRes.json();
      const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews?productId=${product.id}`);
      const initialReviews: Review[] = reviewsRes.ok ? await reviewsRes.json() : [];
      return {
        props: {
          product,
          initialReviews: initialReviews.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
        },
        revalidate: 10,
      };
    } catch (error) {
      console.error(`Error fetching data for product ${id}:`, error);
      return { notFound: true };
    }
};

export default ProductDetailPage;