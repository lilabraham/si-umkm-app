// src/components/layout/Footer.tsx

import { Github, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom Tentang */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-white mb-2">SI-UMKM Brebes</h3>
            <p className="text-slate-400 max-w-md">
              Platform digital untuk membantu pertumbuhan dan daya saing UMKM di Kabupaten Brebes melalui teknologi.
            </p>
          </div>

          {/* Kolom Link Cepat */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigasi</h4>
            {/* INI BAGIAN YANG DIPERBAIKI */}
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-blue-400">Beranda</Link>
              </li>
              <li>
                <Link href="/produk" className="text-slate-400 hover:text-blue-400">Produk</Link>
              </li>
              <li>
                <Link href="/pelatihan" className="text-slate-400 hover:text-blue-400">Pelatihan</Link>
              </li>
              <li>
                <Link href="/tentang" className="text-slate-400 hover:text-blue-400">Tentang Kami</Link>
              </li>
            </ul>
          </div>

          {/* Kolom Sosial Media (tidak perlu <a> di dalam Link) */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-blue-400"><Twitter /></Link>
              <Link href="#" className="text-slate-400 hover:text-blue-400"><Instagram /></Link>
              <Link href="https://github.com/lilabraham/si-umkm-app" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400"><Github /></Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
          <p>&copy; {currentYear} SI-UMKM Brebes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;