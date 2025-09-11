// LOKASI FILE: src/pages/dashboard/profil.tsx

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { Loader2, AlertTriangle, CheckCircle, User, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import withAuth from '@/components/common/withAuth';
import SellerLayout from '@/components/Layout/SellerLayout';

interface ProfileData {
  shopName: string;
  whatsapp: string;
  description: string;
  shopImageUrl?: string;
}

const SellerProfilePage: NextPage = () => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState<ProfileData>({
    shopName: '',
    whatsapp: '',
    description: '',
    shopImageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          shopName: data.shopName || currentUser.displayName || '',
          whatsapp: data.whatsapp || '',
          description: data.description || '',
          shopImageUrl: data.shopImageUrl || '',
        });
        if (data.shopImageUrl) {
            setPreviewUrl(data.shopImageUrl);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({type: 'error', text: 'Ukuran file maks 2MB.'});
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
        let finalImageUrl = formData.shopImageUrl || '';
        if (imageFile) {
            const fileBase64 = await toBase64(imageFile);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: fileBase64, folder: 'profil' }),
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || 'Gagal upload gambar.');
            finalImageUrl = uploadData.secure_url;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
            shopName: formData.shopName,
            displayName: formData.shopName,
            whatsapp: formData.whatsapp,
            description: formData.description,
            shopImageUrl: finalImageUrl,
        });
        await updateProfile(auth.currentUser!, { 
            displayName: formData.shopName,
            photoURL: finalImageUrl || currentUser.photoURL
        });
        setMessage({type: 'success', text: 'Profil berhasil diperbarui!'});
    } catch (err: any) {
        setMessage({type: 'error', text: err.message});
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <SellerLayout>
      <Head>
        <title>Profil Toko - Dashboard Penjual</title>
      </Head>
      <div className="p-6 lg:p-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-800">Profil Toko</h1>
          <p className="text-slate-500 mt-1">Perbarui informasi toko Anda yang akan dilihat oleh pembeli.</p>
        </motion.div>
        
        <motion.div 
            className="mt-8 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Kolom Kiri: Kartu Profil */}
                <div className="md:col-span-1 flex flex-col items-center text-center">
                  <div className="relative w-36 h-36 mb-4 group">
                    <div className="relative w-full h-full">
                      {previewUrl ? (
                        <Image src={previewUrl} alt="Foto Profil Toko" fill className="rounded-full object-cover border-4 border-white shadow-md"/>
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                          <User size={60} className="text-slate-400"/>
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Ganti foto"
                    >
                      <Camera size={18}/>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" id="file-upload"/>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{formData.shopName || 'Nama Toko Anda'}</h2>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  <p className="text-xs text-gray-400 mt-4">PNG, JPG, WEBP (Maks 2MB)</p>
                </div>

                {/* Kolom Kanan: Form Edit */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label htmlFor="shopName" className="text-sm font-semibold text-gray-700">Nama Toko</label>
                    <input type="text" name="shopName" id="shopName" value={formData.shopName} onChange={handleFormChange} className="mt-1 w-full border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
                    <input type="tel" name="whatsapp" id="whatsapp" value={formData.whatsapp} onChange={handleFormChange} className="mt-1 w-full border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required />
                  </div>
                  <div>
                    <label htmlFor="description" className="text-sm font-semibold text-gray-700">Deskripsi Toko</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleFormChange} rows={5} className="mt-1 w-full border-gray-300 rounded-lg p-3 shadow-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200">
                <AnimatePresence>
                {message && (
                    <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        {message.type === 'success' ? (
                            <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-3 text-sm"><CheckCircle size={18} /><span>{message.text}</span></div>
                        ) : (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-3 text-sm"><AlertTriangle size={18} /><span>{message.text}</span></div>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>
                <div className="flex justify-end">
                    <motion.button type="submit" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        {isSubmitting ? <Loader2 className="animate-spin"/> : 'Simpan Perubahan'}
                    </motion.button>
                </div>
            </div>
          </form>
        </motion.div>
      </div>
    </SellerLayout>
  );
}

export default withAuth(SellerProfilePage, ['penjual', 'admin']);