// LOKASI FILE: src/components/Layout/Navbar.tsx
// KODE YANG SUDAH DIPERBAIKI SESUAI REQUIREMENT

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, Store, LogIn, LogOut, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
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
  
  const mobileMenuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'tween', ease: 'easeInOut', duration: 0.4 } },
    exit: { x: '100%', opacity: 0, transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 } },
  } as const;

  const mobileLinkVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };
  
  // Komponen NavLink untuk Desktop
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
  
  // Komponen NavLink untuk Admin di Desktop
  const AdminNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = router.pathname.startsWith(href);
    return (
      <Link href={href}>
        {/* REQ-2: Menggunakan warna yang lebih kontras untuk Admin Panel di Desktop */}
        <span className={`relative text-sm font-semibold transition-colors border-2 rounded-full px-3 py-1 ${isActive ? 'border-yellow-500 text-yellow-600 bg-yellow-100/80' : 'border-transparent text-slate-600 hover:text-yellow-600'}`}>
          {children}
        </span>
      </Link>
    );
  };

  // REQ-4: Komponen NavLink khusus untuk Mobile dengan Indikator Aktif
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
          
          {/* Navigasi Desktop */}
          <motion.div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => <NavLink key={link.name} href={link.href}>{link.name}</NavLink>)}
            {isMounted && currentUser && <NavLink href="/dashboard">Dashboard</NavLink>}
            {isMounted && isAdmin && <AdminNavLink href="/admin/dashboard">Admin Panel</AdminNavLink>}
          </motion.div>

          <div className="hidden md:flex items-center gap-3">
            {isMounted && (
              <>
                {currentUser ? (
                  <motion.button onClick={handleUserLogout} className="flex items-center gap-2 text-sm font-medium bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <LogOut size={16} /> Logout
                  </motion.button>
                ) : !isAdmin && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login" className="flex items-center gap-2 text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-all">
                      <LogIn size={16} /> Login
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* REQ-3: Tombol Hamburger Menu dengan Aksesibilitas dan Efek Hover */}
          <div className="md:hidden">
            <motion.button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-slate-800 p-2 rounded-md hover:bg-slate-100 transition-colors" 
              whileTap={{ scale: 0.8 }}
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Kontainer Menu Mobile (Sidebar) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden fixed inset-0 bg-white z-40 pt-16" // pt-16 sama dengan tinggi navbar (h-16)
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-full">
              <motion.div 
                className="flex flex-col gap-2" // Mengurangi gap agar lebih rapat
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.07 }}
              >
                {/* REQ-4: Menggunakan komponen MobileNavLink yang baru */}
                {navLinks.map((link) => (
                  <motion.div key={link.name} variants={mobileLinkVariants}>
                    <MobileNavLink href={link.href} onClick={() => setIsOpen(false)}>
                      {link.name}
                    </MobileNavLink>
                  </motion.div>
                ))}
                
                <hr className="border-slate-200 my-4" />
                
                {isMounted && (
                  <>
                    {currentUser && (
                       <motion.div variants={mobileLinkVariants}>
                         <MobileNavLink href="/dashboard" onClick={() => setIsOpen(false)}>
                           <div className="flex items-center gap-3">
                             <User size={20} /> Dashboard
                           </div>
                         </MobileNavLink>
                       </motion.div>
                    )}
                    {isAdmin && (
                      <motion.div variants={mobileLinkVariants}>
                        {/* REQ-2: Menggunakan warna yang lebih kontras dan ikon */}
                        <Link href="/admin/dashboard" className="flex items-center gap-3 text-lg font-bold text-yellow-600 pl-5 py-2" onClick={() => setIsOpen(false)}>
                          <ShieldCheck size={20} /> Admin Panel
                        </Link>
                      </motion.div>
                    )}

                    {currentUser ? (
                      <motion.button onClick={handleUserLogout} className="flex items-center gap-3 text-lg font-bold text-red-600 mt-auto pl-5 py-2">
                        <LogOut size={20} /> Logout
                      </motion.button>
                    ) : !isAdmin && (
                      <motion.div variants={mobileLinkVariants} className="mt-6">
                        <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
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