// LOKASI FILE: src/pages/login.tsx

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
// PERUBAHAN TAMPILAN: Impor ikon dan Framer Motion
import { Mail, Lock, Store, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// --- TIDAK ADA PERUBAHAN PADA LOGIKA UTAMA, STATE, ATAU FUNGSI ---
const LoginPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || authLoading) return;
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, authLoading, isMounted, router]);

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setLoading(true);
    setError('');
    // Validasi dasar di client-side
    if (password.length < 6) {
        setError("Password minimal harus 6 karakter.");
        setLoading(false);
        return;
    }
    try {
      if (action === 'signIn') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
        // Pesan error yang lebih ramah
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError('Email atau password salah.');
        } else if (err.code === 'auth/email-already-in-use') {
            setError('Email ini sudah terdaftar. Silakan login.');
        } else {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };
  // --- AKHIR DARI LOGIKA TIDAK DIUBAH ---

  // PERUBAHAN TAMPILAN: Loading state awal dibuat lebih menarik
  if (!isMounted || authLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={40}/>
        </div>
    );
  }

  return (
    // PERUBAHAN TAMPILAN: Latar belakang gradasi dan layout utama
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Kolom Kiri: Ilustrasi & Branding (Hanya tampil di layar besar) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-600 text-white">
            <div>
                <Link href="/" className="flex items-center gap-3">
                    <Store className="h-8 w-8" />
                    <span className="text-2xl font-bold">Si-UMKM</span>
                </Link>
                <p className="mt-4 text-blue-100 leading-relaxed">
                    Platform terpadu untuk digitalisasi dan kemajuan Usaha Mikro, Kecil, dan Menengah.
                </p>
            </div>
            <p className="text-sm text-blue-200">&copy; {new Date().getFullYear()} Si-UMKM. All Rights Reserved.</p>
        </div>

        {/* Kolom Kanan: Form Login/Register */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang!</h1>
                <p className="text-slate-500 mb-8">Masuk atau daftar untuk melanjutkan.</p>
                
                {/* Form dengan styling input baru */}
                <form className="space-y-5">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" />
                        </div>
                    </div>
                    
                    {/* PERUBAHAN TAMPILAN: Pesan error yang lebih menarik */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {/* PERUBAHAN TAMPILAN: Tombol dengan styling modern */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <motion.button type="button" onClick={() => handleAuthAction('signIn')} disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Login'}
                        </motion.button>
                        <motion.button type="button" onClick={() => handleAuthAction('signUp')} disabled={loading} className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-md font-semibold hover:bg-slate-200 disabled:bg-slate-200 disabled:cursor-not-allowed flex justify-center items-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Daftar'}
                        </motion.button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                    <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">ATAU LANJUTKAN DENGAN</span></div>
                </div>

                {/* Tombol Google dengan styling baru */}
                <motion.button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex justify-center items-center gap-3 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 58.9l-65.2 65.2c-23.1-22.4-56.3-35.8-98.8-35.8-84.9 0-153.3 67.2-153.3 150s68.4 150 153.3 150c93.2 0 132.3-72.3 137-108.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                    <span className="text-sm font-medium text-gray-700">Masuk dengan Google</span>
                </motion.button>
            </motion.div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;