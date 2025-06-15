import Link from 'next/link';
import { Facebook, Twitter, Instagram, Store } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom Tentang */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
             {/* ... (tidak ada perubahan signifikan) ... */}
          </div>
          {/* Kolom Navigasi */}
          <div>
            {/* ... (tidak ada perubahan signifikan) ... */}
          </div>
          {/* Kolom Legal */}
          <div>
            {/* ... (tidak ada perubahan signifikan) ... */}
          </div>
          {/* Kolom Media Sosial */}
          <div>
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white hover:scale-110 transition-all"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white hover:scale-110 transition-all"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white hover:scale-110 transition-all"><Instagram size={20} /></a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Si-UMKM. Dibuat dengan ❤️ di Brebes, Indonesia.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;