// LOKASI FILE: src/pages/daftar-penjual.tsx

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
// DIUBAH: Impor 'signOut' dari firebase/auth
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const DaftarPenjualPage = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    shopName: '',
    whatsapp: '',
    description: '',
    email: '',
    password: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (formData.password.length < 6) {
        setError("Password minimal harus 6 karakter.");
        setLoading(false);
        return;
    }

    try {
      // 1. Buat pengguna di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update profil pengguna dengan nama display (kita gunakan nama toko)
      await updateProfile(user, { displayName: formData.shopName });

      // 3. Simpan data aplikasi penjual ke Firestore dengan status 'pending_penjual'
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: formData.displayName,
        shopName: formData.shopName,
        whatsapp: formData.whatsapp,
        description: formData.description,
        role: 'pending_penjual',
        createdAt: serverTimestamp(),
      });
      
      setSuccess("Pendaftaran berhasil! Akun Anda sedang dalam peninjauan oleh Admin.");
      
      // ================== PERUBAHAN DI SINI ==================
      // 4. Logout pengguna secara otomatis setelah pendaftaran berhasil
      await signOut(auth);
      // =======================================================

    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 flex items-center justify-center min-h-screen py-12 px-4">
      <motion.div 
        className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">Pendaftaran Penjual</h1>
        <p className="text-center text-gray-500 mb-6">Ajukan aplikasi untuk bergabung dengan platform kami.</p>
        
        {!success ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... sisa kode form tidak ada perubahan ... */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
             <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Nama Lengkap Anda</label>
             <input id="displayName" name="displayName" type="text" value={formData.displayName} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Budi Santoso"/>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Nama Toko / Usaha</label>
            <input id="shopName" name="shopName" type="text" value={formData.shopName} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Warung Bakso Pak Kumis" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">Nomor WhatsApp Aktif</label>
            <input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: 081234567890" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Singkat Usaha</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Jelaskan produk yang Anda jual..." />
          </motion.div>
          
          <hr/>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <label htmlFor="email">Email untuk Login</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </motion.div>

          {error && <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md flex items-center gap-3 text-sm"><AlertTriangle size={18} /><span>{error}</span></div>}
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400">
              {loading ? 'Mengirim Aplikasi...' : 'Ajukan Pendaftaran'}
            </button>
          </motion.div>
        </form>
        ) : (
        <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Pendaftaran Terkirim!</h2>
            <p className="mt-2 text-gray-600">{success}</p>
            <p className="mt-2 text-gray-600">Admin akan segera meninjau aplikasi Anda. Anda akan mendapatkan notifikasi melalui email jika pendaftaran Anda disetujui.</p>
            <Link href="/" className="mt-6 inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Kembali ke Halaman Utama
            </Link>
        </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DaftarPenjualPage;