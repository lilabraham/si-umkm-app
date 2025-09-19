import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  Menu,
  X,
  Store,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  ShoppingBag,
  LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, loading, userRole } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Hindari hydration mismatch: render state-aktif setelah mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuRef]);

  const handleUserLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
    setIsProfileMenuOpen(false);
    router.push('/');
  };

  // Utility: samakan perbandingan path (tanpa query/hash)
  const normalize = (p: string) => p.split('?')[0].split('#')[0];

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = mounted && normalize(router.asPath) === href;
    return (
      <Link
        href={href}
        className={`relative text-sm font-medium transition-colors hover:text-blue-600 ${
          isActive ? 'text-blue-600' : 'text-slate-600'
        }`}
      >
        <span className="relative inline-block">
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
    const isActive = mounted && normalize(router.asPath).startsWith(href);
    return (
      <Link
        href={href}
        className={`relative text-sm font-semibold transition-colors border-2 rounded-full px-3 py-1 ${
          isActive
            ? 'border-yellow-500 text-yellow-600 bg-yellow-100/80'
            : 'border-transparent text-slate-600 hover:text-yellow-600'
        }`}
      >
        <span className="inline-flex items-center gap-2">{children}</span>
      </Link>
    );
  };

  const MobileNavLink = ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
  }) => {
    const isActive = mounted && normalize(router.asPath) === href;
    const activeClasses = 'text-blue-600 font-semibold border-l-4 border-blue-600 pl-4';
    const inactiveClasses = 'text-slate-800 font-bold pl-5 hover:text-blue-600';
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`block py-2 text-lg transition-all ${isActive ? activeClasses : inactiveClasses}`}
      >
        <span className="inline-flex items-center gap-3">{children}</span>
      </Link>
    );
  };

  const mobileMenuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'tween', ease: 'easeInOut', duration: 0.4 } },
    exit: { x: '100%', opacity: 0, transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 } },
  } as const;
  const mobileLinkVariants = { hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1 } };

  // Cache-buster kecil untuk foto profil
  const avatarSrc = currentUser?.photoURL
    ? `${currentUser.photoURL}?v=${currentUser?.metadata?.lastSignInTime || ''}`
    : '';

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2">
              <Store className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">Si-UMKM</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/produk/produk">Produk</NavLink>

            {currentUser && userRole === 'penjual' && <NavLink href="/dashboard">Dashboard</NavLink>}
            {currentUser && userRole === 'admin' && (
              <AdminNavLink href="/admin/dashboard">Admin Panel</AdminNavLink>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <motion.button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all">
                    {avatarSrc ? (
                      <Image src={avatarSrc} alt="Foto Profil" fill className="object-cover" />
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
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-bold text-sm text-gray-800 truncate">
                          {currentUser.displayName || 'Pengguna'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                      <div className="p-2">
                        {userRole === 'admin' && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-slate-100 rounded-md"
                          >
                            <span className="inline-flex items-center gap-3">
                              <ShieldCheck size={16} /> Admin Panel
                            </span>
                          </Link>
                        )}
                        {userRole === 'penjual' && (
                          <>
                            <Link
                              href="/dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-slate-100 rounded-md"
                            >
                              <span className="inline-flex items-center gap-3">
                                <LayoutDashboard size={16} /> Manajemen Produk
                              </span>
                            </Link>
                            <Link
                              href="/dashboard/profil"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-slate-100 rounded-md"
                            >
                              <span className="inline-flex items-center gap-3">
                                <User size={16} /> Profil Toko
                              </span>
                            </Link>
                          </>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleUserLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/daftar-penjual"
                  className="text-sm font-medium bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50"
                >
                  Mulai Berjualan
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700"
                >
                  <span className="flex items-center gap-2">
                    <LogIn size={16} /> Login
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Burger (mobile) */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-800 p-2 rounded-md hover:bg-slate-100"
              whileTap={{ scale: 0.8 }}
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
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
                className="flex flex-col gap-2"
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.07 }}
              >
                <motion.div variants={mobileLinkVariants}>
                  <MobileNavLink href="/" onClick={() => setIsOpen(false)}>
                    Home
                  </MobileNavLink>
                </motion.div>
                <motion.div variants={mobileLinkVariants}>
                  <MobileNavLink href="/produk/produk" onClick={() => setIsOpen(false)}>
                    Produk
                  </MobileNavLink>
                </motion.div>
                <motion.div variants={mobileLinkVariants}>
                  <MobileNavLink href="/pelatihan" onClick={() => setIsOpen(false)}>
                    Pelatihan
                  </MobileNavLink>
                </motion.div>

                <hr className="border-slate-200 my-4" />
                {!loading && (
                  <>
                    {currentUser ? (
                      <>
                        {userRole === 'penjual' && (
                          <motion.div variants={mobileLinkVariants}>
                            <MobileNavLink href="/dashboard" onClick={() => setIsOpen(false)}>
                              <div className="flex items-center gap-3">
                                <User size={20} /> Dashboard
                              </div>
                            </MobileNavLink>
                          </motion.div>
                        )}
                        {userRole === 'admin' && (
                          <motion.div variants={mobileLinkVariants}>
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 text-lg font-bold text-yellow-600 pl-5 py-2"
                            >
                              <span className="inline-flex items-center gap-3">
                                <ShieldCheck size={20} /> Admin Panel
                              </span>
                            </Link>
                          </motion.div>
                        )}
                        <motion.button
                          onClick={handleUserLogout}
                          className="flex items-center gap-3 text-lg font-bold text-red-600 mt-auto pl-5 py-2"
                        >
                          <LogOut size={20} /> Logout
                        </motion.button>
                      </>
                    ) : (
                      <motion.div variants={mobileLinkVariants} className="mt-6 flex flex-col gap-4">
                        <Link
                          href="/daftar-penjual"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-3 w-full bg-white text-blue-600 border border-blue-600 font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-50"
                        >
                          <ShoppingBag size={20} /> Mulai Berjualan
                        </Link>
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-700"
                        >
                          <LogIn size={20} /> Login
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
