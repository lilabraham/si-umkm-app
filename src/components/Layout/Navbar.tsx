// LOKASI FILE: components/layout/Navbar.tsx
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  Menu, X, Store, LogIn, LogOut, User, ShieldCheck, ShoppingBag, LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, loading, userRole } = useAuth();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // --- ambil nama profil (seperti sebelumnya) ---
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
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
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentUser?.uid) { setProfileName(null); return; }
      try {
        setProfileLoading(true);
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (!active) return;
        const name = (snap.exists() ? (snap.data() as any)?.displayName : '') || '';
        setProfileName(name || null);
      } catch {
        if (!active) return;
        setProfileName(null);
      } finally {
        if (active) setProfileLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentUser?.uid]);

  const handleUserLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
    setIsProfileMenuOpen(false);
    router.push('/');
  };

  const normalize = (p: string) => p.split('?')[0].split('#')[0];

  // ====== NAV HEIGHT → spacer agar konten tidak tertabrak ======
  const navRef = useRef<HTMLElement | null>(null);
  const [navH, setNavH] = useState(64); // fallback
  useEffect(() => {
    if (!navRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0].contentRect.height;
      if (h && Math.round(h) !== Math.round(navH)) setNavH(h);
    });
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [navH]);

  // offset otomatis untuk semua halaman KECUALI beranda (agar hero tetap ter-overlay)
  const shouldOffset = router.pathname !== '/';

  // ====== Link helpers (warna tetap putih karena gaya Chevron) ======
  const CenterNavLink = ({
    href, children, prefetch = true,
  }: { href: string; children: React.ReactNode; prefetch?: boolean }) => {
    const isActive = mounted && normalize(router.asPath) === href;
    return (
      <Link
        href={href}
        prefetch={prefetch}
        className={`group relative px-3 text-xs tracking-[0.12em] uppercase transition-colors
          ${isActive ? 'text-white font-semibold' : 'text-white/90 hover:text-white'}`}
      >
        {children}
        <span
          className={`absolute left-1/2 top-[1.65rem] -translate-x-1/2 h-1 w-1 rounded-full bg-white transition-opacity
            ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
        />
      </Link>
    );
  };

  const AdminNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = mounted && normalize(router.asPath).startsWith(href);
    return (
      <Link
        href={href}
        prefetch={false}
        className={`relative text-xs tracking-[0.12em] uppercase font-semibold border border-white/40 px-3 py-1
          transition-colors text-white/90 hover:text-white hover:border-white ${isActive ? 'bg-white/10' : ''}`}
      >
        <span className="inline-flex items-center gap-2">{children}</span>
      </Link>
    );
  };

  const MobileLink = ({
    href, children, prefetch = true,
  }: { href: string; children: React.ReactNode; prefetch?: boolean }) => {
    const isActive = mounted && normalize(router.asPath) === href;
    const activeClasses = 'text-teal-700 font-semibold border-l-4 border-teal-700 pl-4';
    const inactiveClasses = 'text-slate-800 font-bold pl-5 hover:text-teal-700';
    return (
      <Link
        href={href}
        prefetch={prefetch}
        onClick={() => setIsOpen(false)}
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

  const avatarSrc = currentUser?.photoURL
    ? `${currentUser.photoURL}?v=${currentUser?.metadata?.lastSignInTime || ''}`
    : '';
  const displayName =
    (profileName && profileName.trim()) ||
    (currentUser?.displayName && currentUser.displayName.trim()) ||
    currentUser?.email ||
    'Pengguna';

  return (
    <>
      {/* NAVBAR: tetap fixed + transparan ala Chevron */}
      <nav ref={navRef as any} className="fixed inset-x-0 top-0 z-50">
        {/* gradient readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />

        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* LEFT: logo putih */}
              <Link href="/" prefetch className="relative z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-2">
                  <Store className="h-6 w-6 text-white" />
                  <span className="text-lg font-bold text-white">SI-UMKM</span>
                </span>
              </Link>

              {/* CENTER: links */}
              <div className="relative z-10 hidden md:flex items-center justify-center gap-6">
                <CenterNavLink href="/" prefetch>Home</CenterNavLink>
                <CenterNavLink href="/produk/produk" prefetch={false}>Produk</CenterNavLink>
                {currentUser && userRole === 'penjual' && (
                  <CenterNavLink href="/dashboard" prefetch={false}>Dashboard</CenterNavLink>
                )}
                {currentUser && userRole === 'admin' && (
                  <AdminNavLink href="/admin/dashboard">Admin Panel</AdminNavLink>
                )}
              </div>

              {/* RIGHT: avatar putih / CTA */}
              <div className="relative z-10 hidden md:flex items-center gap-3">
                {loading ? (
                  <div className="h-9 w-32 rounded-lg bg-white/20" />
                ) : currentUser ? (
                  <div className="relative" ref={profileMenuRef}>
                    <motion.button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} whileTap={{ scale: 0.95 }}>
                      <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/90">
                        {avatarSrc ? (
                          <Image src={avatarSrc} alt="Foto Profil" fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white/20">
                            <User size={18} className="text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md border border-black/10 bg-white shadow-xl"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="border-b border-black/5 p-4">
                            {profileLoading ? (
                              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                            ) : (
                              <p className="truncate text-sm font-bold text-gray-800">{displayName}</p>
                            )}
                            <p className="truncate text-xs text-gray-500">{currentUser?.email}</p>
                          </div>
                          <div className="p-2">
                            {userRole === 'admin' && (
                              <Link
                                href="/admin/dashboard"
                                prefetch={false}
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <ShieldCheck size={16} /> Admin Panel
                              </Link>
                            )}
                            {userRole === 'penjual' && (
                              <>
                                <Link
                                  href="/dashboard"
                                  prefetch={false}
                                  onClick={() => setIsProfileMenuOpen(false)}
                                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <LayoutDashboard size={16} /> Manajemen Produk
                                </Link>
                                <Link
                                  href="/dashboard/profil"
                                  prefetch={false}
                                  onClick={() => setIsProfileMenuOpen(false)}
                                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <User size={16} /> Profil Toko
                                </Link>
                              </>
                            )}
                            <hr className="my-1" />
                            <button
                              onClick={handleUserLogout}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
                      prefetch={false}
                      className="rounded-md border border-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-white hover:text-teal-800 transition"
                    >
                      Mulai Berjualan
                    </Link>
                    <Link
                      href="/login"
                      prefetch={false}
                      className="rounded-md bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal-800 hover:opacity-90 transition"
                    >
                      <span className="flex items-center gap-2">
                        <LogIn size={16} /> Login
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Burger (mobile) */}
              <div className="relative z-10 md:hidden">
                <motion.button
                  onClick={() => setIsOpen(!isOpen)}
                  className="rounded-md p-2 text-white hover:bg-white/10"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle Navigation Menu"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
              </div>
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
              className="fixed inset-0 z-40 bg-white pt-16 md:hidden"
            >
              <div className="container mx-auto flex h-full flex-col px-4 py-6 sm:px-6 lg:px-8">
                <motion.div className="flex flex-col gap-2" initial="hidden" animate="visible" transition={{ staggerChildren: 0.07 }}>
                  <motion.div variants={mobileLinkVariants}>
                    <MobileLink href="/" prefetch>Home</MobileLink>
                  </motion.div>
                  <motion.div variants={mobileLinkVariants}>
                    <MobileLink href="/produk/produk" prefetch={false}>Produk</MobileLink>
                  </motion.div>
                  <motion.div variants={mobileLinkVariants}>
                    <MobileLink href="/pelatihan" prefetch={false}>Pelatihan</MobileLink>
                  </motion.div>

                  <hr className="my-4 border-slate-200" />
                  {!loading && (
                    <>
                      {currentUser ? (
                        <>
                          {userRole === 'penjual' && (
                            <motion.div variants={mobileLinkVariants}>
                              <MobileLink href="/dashboard" prefetch={false}>
                                <div className="flex items-center gap-3">
                                  <User size={20} /> Dashboard
                                </div>
                              </MobileLink>
                            </motion.div>
                          )}
                          {userRole === 'admin' && (
                            <motion.div variants={mobileLinkVariants}>
                              <Link
                                href="/admin/dashboard"
                                prefetch={false}
                                onClick={() => setIsOpen(false)}
                                className="py-2 pl-5 text-lg font-bold text-yellow-600"
                              >
                                <span className="inline-flex items-center gap-3">
                                  <ShieldCheck size={20} /> Admin Panel
                                </span>
                              </Link>
                            </motion.div>
                          )}
                          <motion.button
                            onClick={handleUserLogout}
                            className="mt-auto flex items-center gap-3 py-2 pl-5 text-lg font-bold text-red-600"
                          >
                            <LogOut size={20} /> Logout
                          </motion.button>
                        </>
                      ) : (
                        <motion.div variants={mobileLinkVariants} className="mt-6 flex flex-col gap-4">
                          <Link
                            href="/daftar-penjual"
                            prefetch={false}
                            onClick={() => setIsOpen(false)}
                            className="flex w-full items-center justify-center gap-3 rounded-md border border-teal-700 bg-white py-3 font-semibold text-teal-800 hover:bg-teal-50"
                          >
                            <ShoppingBag size={20} /> Mulai Berjualan
                          </Link>
                          <Link
                            href="/login"
                            prefetch={false}
                            onClick={() => setIsOpen(false)}
                            className="flex w-full items-center justify-center gap-3 rounded-md bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800"
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

      {/* === OFFSET: cegah konten tertabrak saat nav fixed === */}
      {shouldOffset && <div aria-hidden className="w-full" style={{ height: navH }} />}

    </>
  );
};

export default Navbar;
