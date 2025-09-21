// LOKASI FILE: src/pages/register.tsx
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  Mail,
  Lock,
  User,
  Store as StoreIcon,
  Users as UsersIcon,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

type Role = 'pembeli' | 'penjual';

const RegisterPage = () => {
  const router = useRouter();

  // role default pembeli, bisa dipaksa ke 'penjual' via query ?role=penjual
  const [role, setRole] = useState<Role>('pembeli');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // khusus penjual
  const [shopName, setShopName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ref untuk menggeser viewport ke form penjual saat dibuka via query param
  const sellerBlockRef = useRef<HTMLDivElement | null>(null);

  // --- Auto pilih role=penjual saat datang dari CTA navbar ---
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.role === 'penjual') {
      setRole('penjual');
      // scroll halus ke blok penjual (tunda 1 tick agar sudah tersusun di DOM)
      setTimeout(() => {
        sellerBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [router.isReady, router.query.role]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (role === 'penjual' && (!shopName || !whatsapp || !description)) {
      setError('Lengkapi data toko (nama toko, WhatsApp, deskripsi).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1) Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // 2) Update display name
      await updateProfile(user, { displayName });

      // 3) Simpan ke Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        role,
        // field toko (untuk pembeli kosong supaya konsisten tipe datanya)
        shopName: role === 'penjual' ? shopName : '',
        whatsapp: role === 'penjual' ? whatsapp : '',
        description: role === 'penjual' ? description : '',
        productCount: 0,
        createdAt: serverTimestamp(),
      });

      // 4) Arahkan pasca-daftar
      router.push(role === 'penjual' ? '/dashboard/index' : '/');
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '') || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Panel kiri (desktop only) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-600 text-white">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex items-center gap-3">
                <StoreIcon className="h-8 w-8" />
                <span className="text-2xl font-bold">Si-UMKM</span>
              </span>
            </Link>
            <p className="mt-4 text-blue-100 leading-relaxed">
              Bergabunglah dengan ribuan pengguna dan UMKM untuk tumbuh bersama di platform kami.
            </p>
          </div>
          <p className="text-sm text-blue-200">
            &copy; {new Date().getFullYear()} Si-UMKM. All Rights Reserved.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Brand ringkas di mobile */}
          <div className="lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600">
              <StoreIcon className="h-6 w-6" />
              <span className="text-xl font-bold">Si-UMKM</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Buat Akun Anda</h1>
            <p className="text-slate-500 mb-6">Hanya perlu beberapa langkah untuk memulai.</p>

            {/* Toggle role – responsif & konsisten */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setRole('pembeli')}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  role === 'pembeli'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <UsersIcon size={16} />
                Pembeli
              </button>
              <button
                type="button"
                onClick={() => setRole('penjual')}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  role === 'penjual'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck size={16} />
                Penjual
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Nama lengkap */}
              <div>
                <label htmlFor="displayName" className="text-sm font-medium text-gray-700 mb-1 block">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Field khusus penjual */}
              {role === 'penjual' && (
                <div ref={sellerBlockRef}>
                  <div>
                    <label htmlFor="shopName" className="text-sm font-medium text-gray-700 mb-1 block">
                      Nama Toko / Usaha
                    </label>
                    <input
                      id="shopName"
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 transition-all"
                      placeholder="Contoh: Warung Bakso Pak Kumis"
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 mb-1 block">
                      Nomor WhatsApp Aktif
                    </label>
                    <input
                      id="whatsapp"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 transition-all"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1 block">
                      Deskripsi Singkat Usaha
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 transition-all"
                      placeholder="Jelaskan produk yang Anda jual..."
                    />
                  </div>
                  <hr className="border-slate-200" />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Memproses…' : 'Daftar Sekarang'}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Login di sini
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
