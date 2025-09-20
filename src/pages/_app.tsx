// LOKASI: src/pages/_app.tsx

import "@/styles/globals.css";
import type { AppProps } from "next/app";

// ✅ Pakai next/font/google (tidak perlu install paket font)
import { Inter } from "next/font/google";

// Komponen & konteks yang sudah kamu pakai
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

// Inisialisasi font Inter (variable) → dipakai di Tailwind via CSS variable
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Apollo Client dibuat sekali di luar komponen
const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Terapkan variable font + font-sans (diatur di tailwind.config.js)
    <div className={`${inter.variable} font-sans`}>
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
    </div>
  );
}
