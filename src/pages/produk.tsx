// src/pages/produk.tsx
import Head from 'next/head';
import ProductCard from '@/components/ui/ProductCard';

// Data placeholder - nanti akan diganti dengan data dari API
const mockProducts = [
  { id: 1, name: 'Kopi Robusta Brebes', seller: 'Warung Kopi Jaya', price: 50000, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1511920183353-34e85a742469?q=80&w=1887' },
  { id: 2, name: 'Keripik Bawang Asli', seller: 'UMKM Makmur', price: 25000, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1603569437111-913486514932?q=80&w=1887' },
  { id: 3, name: 'Batik Tulis Mega Mendung', seller: 'Galeri Batik Cirebon', price: 350000, rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1583497135336-40743b353e41?q=80&w=1887' },
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