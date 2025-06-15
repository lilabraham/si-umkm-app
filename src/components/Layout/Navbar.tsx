import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Store } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Produk', href: '/produk' },
    { name: 'Pelatihan', href: '/pelatihan' },
    { name: 'Admin', href: '/admin/dashboard' },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-7 w-7 text-blue-500" />
          <span className="text-2xl font-bold text-white">
            Si-UMKM
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-gray-300 hover:text-white font-medium transition-colors duration-300">
              {link.name}
            </Link>
          ))}
          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300">
              Login
            </button>
          </Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700">
          <div className="px-6 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            ))}
            {/* ... (tombol login mobile) ... */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;