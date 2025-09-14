// src/pages/_app.tsx

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
// DIUBAH: Menggunakan path 'layout' huruf kecil untuk konsistensi
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

// DIPINDAHKAN: Instance Apollo Client dibuat di luar komponen
// agar tidak dibuat ulang pada setiap render. Ini adalah praktik terbaik.
const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Struktur Provider Anda sudah benar
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