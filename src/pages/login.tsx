// src/pages/login.tsx
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Lock, Store, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const LoginPage = () => {
  const { currentUser, loading: authLoading, userRole } = useAuth(); // ⬅️ ambil userRole
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset Password modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

   useEffect(() => {
    if (!authLoading && currentUser) {
      if (userRole === 'admin') router.push('/admin/dashboard');
      else if (userRole === 'penjual') router.push('/dashboard');
      else router.push('/');
    }
  }, [currentUser, authLoading, userRole, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Email atau password salah.');
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'pembeli',
                createdAt: serverTimestamp(),
            });
        }
    } catch (err: any) {
        setError(err.message || 'Gagal masuk dengan Google.');
        setLoading(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ type: 'success', text: 'Link reset password telah dikirim ke email Anda.' });
    } catch {
      setResetMessage({ type: 'error', text: 'Email tidak ditemukan atau terjadi kesalahan.' });
    } finally {
      setResetLoading(false);
    }
  };

  if (authLoading || currentUser) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={40}/>
        </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-600 text-white">
              <div>
                  <Link href="/" className="flex items-center gap-3"><Store className="h-8 w-8" /><span className="text-2xl font-bold">Si-UMKM</span></Link>
                  <p className="mt-4 text-blue-100 leading-relaxed">Platform terpadu untuk digitalisasi dan kemajuan Usaha Mikro, Kecil, dan Menengah.</p>
              </div>
              <p className="text-sm text-blue-200">&copy; {new Date().getFullYear()} Si-UMKM. All Rights Reserved.</p>
          </div>
          <div className="p-8 sm:p-12 flex flex-col justify-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang!</h1>
                  <p className="text-slate-500 mb-8">Masuk atau daftar untuk melanjutkan.</p>
                  <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                          <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                          <div className="relative">
                              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1-2 text-gray-400" />
                              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" />
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            {/* BARU: Link "Lupa Password?" */}
                            <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-sm font-medium text-blue-600 hover:underline">
                              Lupa Password?
                            </button>
                          </div>
                          <div className="relative">
                              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1-2 text-gray-400" />
                              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-md px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" />
                          </div>
                      </div>
                      {error && (<div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm"><AlertCircle size={16} /><span>{error}</span></div>)}
                      <div className="flex flex-col gap-3 pt-2">
                          <motion.button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              {loading ? <Loader2 className="animate-spin" /> : 'Login'}
                          </motion.button>
                      </div>
                  </form>
                  <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                      <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">ATAU LANJUTKAN DENGAN</span></div>
                  </div>
                  <motion.button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex justify-center items-center gap-3 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 58.9l-65.2 65.2c-23.1-22.4-56.3-35.8-98.8-35.8-84.9 0-153.3 67.2-153.3 150s68.4 150 153.3 150c93.2 0 132.3-72.3 137-108.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                      <span className="text-sm font-medium text-gray-700">Masuk dengan Google</span>
                  </motion.button>
                  <p className="mt-8 text-center text-sm text-gray-600">
                    Belum punya akun? <Link href="/register" className="font-medium text-blue-600 hover:underline">Daftar sebagai pembeli</Link> atau <Link href="/daftar-penjual" className="font-medium text-blue-600 hover:underline">penjual</Link>.
                  </p>
              </motion.div>
          </div>
        </div>
      </div>
      
      {/* BARU: Modal untuk Lupa Password */}
      <AnimatePresence>
        {isResetModalOpen && (
          <motion.div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-6">Masukkan email Anda, kami akan mengirimkan link untuk membuat password baru.</p>
              
              <form onSubmit={handlePasswordReset}>
                <div>
                  <label htmlFor="reset-email" className="text-sm font-medium text-gray-700">Email</label>
                  <input id="reset-email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <AnimatePresence>
                {resetMessage && (
                  <motion.div 
                    className="mt-4 p-3 rounded-md flex items-center gap-3 text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ backgroundColor: resetMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: resetMessage.type === 'success' ? '#065F46' : '#991B1B' }}
                  >
                    {resetMessage.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                    <span>{resetMessage.text}</span>
                  </motion.div>
                )}
                </AnimatePresence>

                <div className="flex items-center justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setIsResetModalOpen(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">
                    Batal
                  </button>
                  <button type="submit" disabled={resetLoading} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-md disabled:bg-gray-400 flex items-center">
                    {resetLoading ? <Loader2 className="animate-spin mr-2" size={18}/> : null}
                    Kirim Email
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default LoginPage;