// src/pages/produk/[id].tsx

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string; // Ini adalah string Base64 yang sangat panjang
  ownerId: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: { seconds: number, nanoseconds: number } | null;
}

interface ProductDetailPageProps {
  product: Product | null;
  initialReviews: Review[];
}

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product, initialReviews }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!product) {
    return <div className="text-center py-20"><h1>Produk tidak ditemukan.</h1></div>;
  }

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
          productId: product.id,
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
    } catch (error: any) {
      setMessage(error.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`${product.name} - Si-UMKM`}</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image
              src={product.imageUrl}
              alt={`Foto produk ${product.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/EEE/31343C?text=Gambar+Rusak'; }}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-blue-600">{product.shopName}</p>
            <h1 className="text-4xl font-extrabold text-gray-900 mt-2">{product.name}</h1>
            <p className="text-4xl font-bold text-gray-800 mt-6">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            <div className="border-t my-6"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Deskripsi Produk</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
            <div className="mt-8">
              <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">Hubungi Penjual (Segera Hadir)</button>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t pt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ulasan & Rating</h2>
            {isMounted && currentUser && (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold mb-4">Tulis Ulasan Anda</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-4">
                    <label className="block mb-2 font-medium">Rating Anda</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`cursor-pointer ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} onClick={() => setRating(star)} />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="comment" className="block mb-2 font-medium">Komentar</label>
                    <textarea id="comment" rows={4} className="w-full p-2 border rounded-md" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                  </div>
                  <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md" disabled={loading}>
                    {loading ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                  {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
                </form>
              </div>
            )}
            {isMounted && !currentUser && (
              <div className="bg-gray-100 p-4 rounded-lg text-center mb-8">
                  <p>Anda harus <Link href="/login" className="text-blue-600 font-semibold hover:underline">login</Link> untuk memberikan ulasan.</p>
              </div>
            )}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (<Star key={i} size={16} className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />))}
                      </div>
                      <p className="ml-4 font-bold text-gray-800">{review.userName}</p>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))
              ) : (<p className="text-gray-500">Belum ada ulasan untuk produk ini.</p>)}
            </div>
        </div>
      </div>
    </>
  );
};

// PERBAIKAN: Logika getStaticPaths yang lengkap
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

// PERBAIKAN: Logika getStaticProps yang lengkap dan lebih efisien
export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as { id: string };
  try {
    // Optimasi: Gunakan API yang mengambil satu produk berdasarkan ID
    const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produk/${id}`);
    
    if (!productRes.ok) {
      // Jika produk tidak ditemukan oleh API, kembalikan 404
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
