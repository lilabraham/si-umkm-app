// LOKASI FILE: src/pages/register.tsx

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
// DIUBAH: Tambahkan 'updateProfile'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Mail, Lock, User, Store, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Buat pengguna di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. PERBAIKAN: Update profil pengguna dengan nama lengkap dari form
      await updateProfile(user, { displayName: displayName });

      // 3. Simpan data pengguna ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName, // Pastikan nama lengkap juga disimpan di sini
        role: 'pembeli',
        createdAt: serverTimestamp(),
      });

      router.push('/');

    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Kolom Kiri - Informasi */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-600 text-white">
                <div>
                    <Link href="/" className="flex items-center gap-3">
  <span className="flex items-center gap-3">
    <Store className="h-8 w-8" />
    <span className="text-2xl font-bold">Si-UMKM</span>
  </span>
</Link>
                    <p className="mt-4 text-blue-100 leading-relaxed">
                        Bergabunglah dengan ribuan pengguna dan UMKM untuk tumbuh bersama di platform kami.
                    </p>
                </div>
                <p className="text-sm text-blue-200">&copy; {new Date().getFullYear()} Si-UMKM. All Rights Reserved.</p>
            </div>

            {/* Kolom Kanan - Form Pendaftaran */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Buat Akun Anda</h1>
                    <p className="text-slate-500 mb-8">Hanya perlu beberapa langkah untuk memulai.</p>
                    
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label htmlFor="displayName" className="text-sm font-medium text-gray-700 mb-1 block">Nama Lengkap</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword">Konfirmasi Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 transition-all" />
                            </div>
                        </div>
                        
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-3 pt-2">
                            <motion.button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex justify-center items-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Daftar Sekarang'}
                            </motion.button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                      Sudah punya akun? <Link href="/login" className="font-medium text-blue-600 hover:underline">Login di sini</Link>
                    </p>
                    <p className="mt-2 text-center text-sm text-gray-600">
                      Ingin mendaftar sebagai penjual? <Link href="/daftar-penjual" className="font-medium text-blue-600 hover:underline">Klik di sini</Link>
                    </p>
                </motion.div>
            </div>
          </div>
      </div>
  );
};

export default RegisterPage;