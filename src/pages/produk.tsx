// src/pages/produk.tsx
import Head from 'next/head';
import ProductCard from '@/components/ui/ProductCard';

// Data placeholder - nanti akan diganti dengan data dari API
const mockProducts = [
  { id: 1, name: 'Kopi Robusta Brebes', seller: 'Warung Kopi Jaya', price: 50000, rating: 4.8, imageUrl: '/images/kopi.jpg' },
  { id: 2, name: 'Keripik Bawang Asli', seller: 'UMKM Makmur', price: 25000, rating: 4.9, imageUrl: '/images/keripik.jpg' },
  { id: 3, name: 'Batik Tulis Mega Mendung', seller: 'Galeri Batik Cirebon', price: 350000, rating: 5.0, imageUrl: '/images/batik tulis.jpg' },
  // ...tambahkan produk lainnya
];

const ProdukPage = () => {
  return (
    <>
      <Head>
        <title>Daftar Produk - Si-UMKM</title>
      </Head>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Temukan Produk UMKM Unggulan</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ProdukPage;