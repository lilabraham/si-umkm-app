// LOKASI FILE: src/components/Layout/Navbar.tsx

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
  
  const AdminNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = router.pathname.startsWith(href);
    return (
      <Link href={href}>
        <span className={`relative text-sm font-semibold transition-colors border-2 rounded-full px-3 py-1 ${isActive ? 'border-yellow-400 text-yellow-500 bg-yellow-50' : 'border-transparent text-slate-600 hover:text-yellow-600'}`}>
          {children}
        </span>
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

          <div className="md:hidden">
            <motion.button onClick={() => setIsOpen(!isOpen)} className="text-slate-800 p-2" whileTap={{ scale: 0.8 }}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden fixed inset-0 bg-white z-40 pt-16"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-full">
              <motion.div 
                className="flex flex-col gap-5" 
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.07 }}
              >
                {navLinks.map((link) => (
                  <motion.div key={link.name} variants={mobileLinkVariants}>
                    <Link href={link.href} className="text-lg font-semibold text-slate-700 hover:text-blue-600 transition-colors" onClick={() => setIsOpen(false)}>
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <hr className="border-slate-200 my-4" />
                
                {isMounted && (
                  <>
                    {currentUser && (
                       <motion.div variants={mobileLinkVariants}>
                          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-slate-700" onClick={() => setIsOpen(false)}>
                           <User size={20} /> Dashboard
                          </Link>
                        </motion.div>
                    )}
                    {isAdmin && (
                      <motion.div variants={mobileLinkVariants}>
                        <Link href="/admin/dashboard" className="flex items-center gap-3 text-lg font-semibold text-yellow-600" onClick={() => setIsOpen(false)}>
                          <ShieldCheck size={20} /> Admin Panel
                        </Link>
                      </motion.div>
                    )}

                    {currentUser ? (
                      <motion.button onClick={handleUserLogout} className="flex items-center gap-3 text-lg font-semibold text-red-600 mt-auto">
                        <LogOut size={20} /> Logout
                      </motion.button>
                    ) : !isAdmin && (
                      <motion.div variants={mobileLinkVariants}>
                        <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm">
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