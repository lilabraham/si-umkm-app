// src/components/Layout/Navbar.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Store } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { currentUser } = useAuth(); // Untuk pengguna UMKM
  const [isAdmin, setIsAdmin] = useState(false); // State baru untuk admin
  const router = useRouter();

  // useEffect untuk memastikan kode hanya berjalan di client
  useEffect(() => {
    setIsMounted(true);
    // Cek status login admin dari localStorage
    const adminStatus = localStorage.getItem('isAdminLoggedIn');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Produk', href: '/produk' },
    { name: 'Pelatihan', href: '/pelatihan' },
  ];

  // Logout untuk pengguna UMKM
  const handleUserLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-7 w-7 text-blue-500" />
          <span className="text-2xl font-bold text-white">Si-UMKM</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-gray-300 hover:text-white font-medium transition-colors duration-300">
              {link.name}
            </Link>
          ))}
          
          {/* ================= LOGIKA KONDISIONAL DIMULAI DI SINI ================= */}
          {isMounted && (
            <>
              {/* Link untuk Admin */}
              {isAdmin && (
                <Link href="/admin/dashboard" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-300">
                  Admin Panel
                </Link>
              )}

              {/* Link dan Tombol untuk Pengguna UMKM */}
              {currentUser ? (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white font-medium transition-colors duration-300">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleUserLogout}
                    className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Tombol Login hanya muncul jika TIDAK ADA pengguna UMKM DAN admin yang login
                !isAdmin && (
                  <Link href="/login">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300">
                      Login
                    </button>
                  </Link>
                )
              )}
            </>
          )}
          {/* ====================================================================== */}
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
            <hr className="border-slate-700" />
            
            {/* Logika Kondisional untuk Menu Mobile */}
            {isMounted && (
              <>
                {isAdmin && (
                  <Link href="/admin/dashboard" className="text-yellow-400 hover:text-yellow-300 font-semibold" onClick={() => setIsOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                {currentUser ? (
                  <>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={handleUserLogout} className="text-left text-red-400 hover:text-red-300">
                      Logout ({currentUser.email})
                    </button>
                  </>
                ) : (
                  !isAdmin && (
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <button className="w-full text-left bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md shadow-md">
                        Login
                      </button>
                    </Link>
                  )
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
