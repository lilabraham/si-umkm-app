// src/pages/api/graphql.ts

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

// Definisikan tipe data Product kita di sini agar konsisten
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string;
  ownerId: string;
}

// 1. Definisikan Skema GraphQL (Struktur Data)
// Skema ini memberi tahu GraphQL data seperti apa yang kita miliki
const typeDefs = gql`
  # Ini adalah tipe data untuk sebuah produk
  type Product {
    id: ID!
    name: String
    price: Float
    description: String
    shopName: String
    imageUrl: String
    ownerId: String
  }

  # Ini adalah query (pertanyaan) yang bisa diajukan oleh client
  type Query {
    # Mengambil semua produk
    allProducts: [Product]
    # Mencari produk berdasarkan nama
    searchProducts(term: String!): [Product]
  }
`;

// 2. Definisikan Resolvers (Logika untuk Menjawab Query)
// Ini adalah fungsi yang akan dijalankan saat sebuah query diterima
const resolvers = {
  Query: {
    // Resolver untuk query 'allProducts'
    allProducts: async (): Promise<Product[]> => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(query(productsCollection));
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        return productList;
      } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
      }
    },
    // Resolver untuk query 'searchProducts'
    searchProducts: async (_: any, { term }: { term: string }): Promise<Product[]> => {
      try {
        if (!term) {
          return []; // Kembalikan array kosong jika tidak ada term pencarian
        }
        
        // Ambil semua produk, lalu filter di sisi server
        // Ini adalah cara sederhana. Untuk aplikasi besar, gunakan layanan pencarian seperti Algolia/Elasticsearch
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(query(productsCollection));
        const allProducts = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        const searchTerm = term.toLowerCase();
        const filteredProducts = allProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.shopName.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );
        
        return filteredProducts;
      } catch (error) {
        console.error("Error searching products:", error);
        return [];
      }
    },
  },
};

// 3. Buat instance Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 4. Hubungkan server dengan Next.js
export default startServerAndCreateNextHandler(server);
