// LOKASI FILE: src/pages/api/graphql.ts

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string;
  ownerId: string;
}

const typeDefs = gql`
  type Product {
    id: ID!
    name: String
    price: Float
    description: String
    shopName: String
    imageUrl: String
    ownerId: String
  }

  type Query {
    allProducts: [Product]
    searchProducts(term: String!): [Product]
  }
`;

const resolvers = {
  Query: {
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
    searchProducts: async (_: unknown, { term }: { term: string }): Promise<Product[]> => { // PERBAIKAN: Mengganti 'any' dengan 'unknown'
      try {
        if (!term) {
          return [];
        }
        
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default startServerAndCreateNextHandler(server);