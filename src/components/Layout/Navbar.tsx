// LOKASI FILE: src/components/layout/Navbar.tsx

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, Store, LogIn, LogOut, User, ShieldCheck, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Produk', href: '/produk' },
    { name: 'Pelatihan', href: '/pelatihan' },
  ];

  const handleUserLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setIsOpen(false);
      setIsProfileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };
  
  const mobileMenuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'tween', ease: 'easeInOut', duration: 0.4 } },
    exit: { x: '100%', opacity: 0, transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 } },
  } as const;

  const mobileLinkVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };
  
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = router.pathname === href;
    return (
      <Link href={href}>
        <span className={`relative text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>
          {children}
          {isActive && (
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-600"
              layoutId="underline"
            />
          )}
        </span>
      </Link>
    );
  };
  
  const MobileNavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void }) => {
    const isActive = router.pathname === href;
    const activeClasses = 'text-blue-600 font-semibold border-l-4 border-blue-600 pl-4';
    const inactiveClasses = 'text-slate-800 font-bold pl-5 hover:text-blue-600';
    
    return (
        <Link href={href} onClick={onClick} className={`block py-2 text-lg transition-all ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </Link>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">Si-UMKM</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => <NavLink key={link.name} href={link.href}>{link.name}</NavLink>)}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : currentUser ? (
                <div className="relative" ref={profileMenuRef}>
                  <motion.button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all">
                      {currentUser.photoURL ? (
                        <Image src={currentUser.photoURL} alt="Foto Profil" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <User size={18} className="text-slate-500" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div 
                        className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-bold text-sm text-gray-800 truncate">{currentUser.displayName || "Pengguna"}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <div className="p-2">
                          {currentUser.role === 'admin' && (
                            <Link href="/admin/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-blue-600 rounded-md transition-colors"><ShieldCheck size={16} /> Admin Panel</Link>
                          )}
                          {currentUser.role === 'penjual' && (
                            <>
                              <Link href="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-blue-600 rounded-md transition-colors"><LayoutDashboard size={16} /> Manajemen Produk</Link>
                              <Link href="/dashboard/profil" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-slate-100 hover:text-blue-600 rounded-md transition-colors"><User size={16} /> Profil Toko</Link>
                            </>
                          )}
                          <hr className="my-1"/>
                          <button onClick={handleUserLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors">
                            <LogOut size={16} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/daftar-penjual" className="text-sm font-medium bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition-all">
                    Mulai Berjualan
                  </Link>
                  <Link href="/login" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700">
                    <span className="flex items-center gap-2"><LogIn size={16} /> Login</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <motion.button onClick={() => setIsOpen(!isOpen)} className="text-slate-800 p-2 rounded-md hover:bg-slate-100" whileTap={{ scale: 0.8 }} aria-label="Toggle Navigation Menu">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit" className="md:hidden fixed inset-0 bg-white z-40 pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-full">
              <motion.div className="flex flex-col gap-2" initial="hidden" animate="visible" transition={{ staggerChildren: 0.07 }}>
                {navLinks.map((link) => (
                  <motion.div key={link.name} variants={mobileLinkVariants}>
                    <MobileNavLink href={link.href} onClick={() => setIsOpen(false)}>
                      {link.name}
                    </MobileNavLink>
                  </motion.div>
                ))}
                <hr className="border-slate-200 my-4" />
                {!loading && (
                  <>
                    {currentUser ? (
                      <>
                        {currentUser.role === 'penjual' && (
                          <>
                            <motion.div variants={mobileLinkVariants}><MobileNavLink href="/dashboard" onClick={() => setIsOpen(false)}><div className="flex items-center gap-3"><LayoutDashboard size={20} /> Manajemen Produk</div></MobileNavLink></motion.div>
                            <motion.div variants={mobileLinkVariants}><MobileNavLink href="/dashboard/profil" onClick={() => setIsOpen(false)}><div className="flex items-center gap-3"><User size={20} /> Profil Toko</div></MobileNavLink></motion.div>
                          </>
                        )}
                        {currentUser.role === 'admin' && (
                           <motion.div variants={mobileLinkVariants}><Link href="/admin/dashboard" className="flex items-center gap-3 text-lg font-bold text-yellow-600 pl-5 py-2" onClick={() => setIsOpen(false)}><ShieldCheck size={20} /> Admin Panel</Link></motion.div>
                        )}
                        <motion.button onClick={handleUserLogout} className="flex items-center gap-3 text-lg font-bold text-red-600 mt-auto pl-5 py-2">
                          <LogOut size={20} /> Logout
                        </motion.button>
                      </>
                    ) : (
                      <motion.div variants={mobileLinkVariants} className="mt-6 flex flex-col gap-4">
                        <Link href="/daftar-penjual" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 w-full bg-white text-blue-600 border border-blue-600 font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-50">
                            <ShoppingBag size={20}/> Mulai Berjualan
                        </Link>
                        <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-700">
                            <LogIn size={20}/> Login
                        </Link>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;