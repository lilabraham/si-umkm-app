// LOKASI FILE: src/pages/admin/login.tsx

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { ShieldCheck, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// DIUBAH: Impor yang diperlukan dari Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';


const AdminLoginPage = () => {
  // DIUBAH: 'username' menjadi 'email' agar sesuai dengan Firebase Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ======================= LOGIKA UTAMA DIPERBARUI DI SINI =======================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Lakukan login menggunakan Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Cek peran pengguna di database Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // 3. Verifikasi apakah pengguna adalah admin
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        // Jika benar admin, arahkan ke dashboard
        router.push('/admin/dashboard');
      } else {
        // Jika bukan admin (atau datanya tidak ada), logout paksa dan beri pesan error
        await auth.signOut();
        setError("Akses ditolak. Akun ini bukan merupakan akun admin.");
      }

    } catch (err: any) {
      // Menangani error dari Firebase (misal: password salah)
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);  
    }
  };
  // ==============================================================================

  return (
    // SELURUH KODE JSX DI BAWAH INI TIDAK DIUBAH SAMA SEKALI, HANYA DISESUAIKAN VARIABELNYA
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-slate-900 to-slate-800 text-white overflow-hidden">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/30 mb-6"
        >
          <ShieldCheck className="h-8 w-8 text-blue-400" />
        </motion.div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-sm text-slate-400 mt-1">Akses panel manajemen khusus.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-slate-400">Email</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 pl-10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password"  className="text-xs font-medium text-slate-400">Password</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 pl-10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  className="flex items-center gap-2 text-red-400 bg-red-500/10 p-2 rounded-md text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <motion.button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/20 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Login'}
              </motion.button>
            </div>
          </form>
        </div>
        <div className="text-center mt-6">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                Kembali ke Halaman Utama
            </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;