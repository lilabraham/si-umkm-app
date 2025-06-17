// src/pages/_app.tsx

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
// Impor library Apollo Client
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

// Buat instance Apollo Client
// Ini akan terhubung ke API GraphQL yang sudah kita buat
const client = new ApolloClient({
  uri: '/api/graphql', // URL server GraphQL kita
  cache: new InMemoryCache(), // Digunakan untuk caching data
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Bungkus AuthProvider dengan ApolloProvider
    // agar semua komponen di bawahnya bisa melakukan query GraphQL
    <ApolloProvider client={client}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default MyApp;
