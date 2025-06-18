// LOKASI FILE: src/components/layout/Footer.tsx

import { Github, Twitter, Instagram, Store } from 'lucide-react';
import Link from 'next/link';
// ANIMASI: Impor Framer Motion
import { motion } from 'framer-motion';

const Footer = () => {
  // --- TIDAK ADA PERUBAHAN PADA LOGIKA ---
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Instagram, href: "#", name: "Instagram" },
    { icon: Github, href: "https://github.com/lilabraham/si-umkm-app", name: "GitHub" },
  ];

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Produk', href: '/produk' },
    { name: 'Pelatihan', href: '/pelatihan' },
    { name: 'Tentang Kami', href: '/tentang' },
  ];

  return (
    // TAMPILAN: Latar belakang gelap elegan
    <footer className="bg-neutral-900 text-neutral-300">
      {/* ANIMASI: Container utama dengan animasi fade-in saat scroll */}
      <motion.div
        className="container mx-auto px-6 lg:px-8 py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Kolom 1: Branding */}
          <div className="md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Si-UMKM</span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed text-neutral-400">
              Platform digital untuk membantu pertumbuhan dan daya saing UMKM di Kabupaten Brebes melalui teknologi.
            </p>
          </div>

          {/* Kolom 2: Navigasi */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {/* TAMPILAN: Link dengan efek transisi warna */}
                  <Link href={link.href} className="text-sm hover:text-white transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Sosial Media */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a 
                  key={social.name}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={social.name}
                  className="text-neutral-400 hover:text-white"
                  whileHover={{ scale: 1.2, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Garis pemisah dan Copyright */}
        <div className="mt-16 border-t border-neutral-800 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            &copy; {currentYear} SI-UMKM Brebes. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;