// src/pages/login.tsx

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const LoginPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // PERBAIKAN: State untuk memastikan komponen hanya dirender di sisi client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Logika redirect
  useEffect(() => {
    // Jangan lakukan apa-apa jika belum ter-mount atau auth masih loading
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
    try {
      if (action === 'signIn') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
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

  // Tampilkan loading spinner jika belum siap atau akan redirect
  // Ini akan memastikan server dan client merender hal yang sama pada render pertama
  if (!isMounted || authLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading...</p>
        </div>
    );
  }

  // Hanya tampilkan form jika sudah pasti tidak ada user yang login
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-center">Login / Register Pengguna</h1>
        <form onSubmit={(e) => { e.preventDefault(); handleAuthAction('signIn'); }} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm" />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex space-x-4">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
              {loading ? '...' : 'Login'}
            </button>
            <button type="button" onClick={() => handleAuthAction('signUp')} disabled={loading} className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-400">
              {loading ? '...' : 'Daftar'}
            </button>
          </div>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Atau</span></div>
        </div>
        <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex justify-center items-center py-2 border rounded-md hover:bg-gray-50">
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
