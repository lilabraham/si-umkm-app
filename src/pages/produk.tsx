// LOKASI FILE: src/pages/produk.tsx

import type { GetStaticProps, NextPage } from 'next';
import { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
// Impor library Apollo Client untuk query
import { gql, useLazyQuery } from '@apollo/client';
import { Search } from 'lucide-react';

// Definisikan tipe data Product
interface Product {
  id: string;
  name: string;
  price: number;
  shopName: string;
  imageUrl: string;
}

interface ProdukPageProps {
  initialProducts: Product[];
}

// Definisikan GraphQL Query di sisi client
const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($term: String!) {
    searchProducts(term: $term) {
      id
      name
      price
      shopName
      imageUrl
    }
  }
`;

const ProdukPage: NextPage<ProdukPageProps> = ({ initialProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // State untuk menyimpan hasil pencarian
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);

  // Gunakan hook 'useLazyQuery' dari Apollo untuk menjalankan query saat diperlukan
  const [search, { loading }] = useLazyQuery(SEARCH_PRODUCTS_QUERY, {
    onCompleted: (data) => {
      // Setelah query selesai, simpan hasilnya di state
      setSearchResults(data.searchProducts);
    },
    onError: (error) => {
      console.error("GraphQL search error:", error);
      setSearchResults([]); // Tampilkan hasil kosong jika ada error
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      // Jika input kosong, tampilkan produk awal
      setSearchResults(null);
    } else {
      // Jalankan query dengan variabel 'term'
      search({ variables: { term: searchTerm } });
    }
  };

  // Tentukan produk mana yang akan ditampilkan: hasil pencarian atau produk awal
  const productsToDisplay = searchResults !== null ? searchResults : initialProducts;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Jelajahi Produk UMKM
      </h1>

      {/* Form Pencarian */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 flex shadow-md rounded-lg">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari produk atau nama toko..."
          className="w-full px-4 py-3 border-y border-l border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 flex items-center transition-colors">
          <Search size={20} />
        </button>
      </form>
      
      {/* Tampilkan hasil */}
      {loading ? (
        <p className="text-center text-gray-500">Mencari...</p>
      ) : productsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productsToDisplay.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-12 bg-gray-100 p-8 rounded-lg">
          Produk tidak ditemukan untuk kata kunci "<span className="font-semibold">{searchTerm}</span>".
        </p>
      )}
    </div>
  );
};

// getStaticProps menyediakan data awal saat halaman pertama kali dimuat
export const getStaticProps: GetStaticProps = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produk`);
    const products: Product[] = await res.json();
    return {
      props: {
        initialProducts: products,
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      props: {
        initialProducts: [],
      },
    };
  }
};

export default ProdukPage;
