// LOKASI FILE: src/pages/dashboard/profil.tsx

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { Loader2, AlertTriangle, CheckCircle, User, Camera, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import withAuth from '@/components/common/withAuth';
import SellerLayout from '@/components/layout/SellerLayout';

interface ProfileData {
  shopName: string;
  whatsapp: string;
  description: string;
  shopImageUrl?: string;
}

const SellerProfilePage: NextPage = () => {
  const { currentUser, refreshUser } = useAuth(); // <— AMBIL refreshUser


  const [formData, setFormData] = useState<ProfileData>({
    shopName: '',
    whatsapp: '',
    description: '',
    shopImageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ───────────────────────────────── fetch profil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        setFormData({
          shopName: data.shopName || currentUser.displayName || '',
          whatsapp: data.whatsapp || '',
          description: data.description || '',
          shopImageUrl: data.shopImageUrl || '',
        });
        if (data.shopImageUrl) setPreviewUrl(data.shopImageUrl);
      }
    };
    fetchProfile();
  }, [currentUser]);

  // ───────────────────────────────── util
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => resolve(r.result as string);
      r.onerror = (e) => reject(e);
    });

  // ───────────────────────────────── handlers
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maks 2MB.' });
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
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

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        shopName: formData.shopName,
        displayName: formData.shopName,
        whatsapp: formData.whatsapp,
        description: formData.description,
        shopImageUrl: finalImageUrl,
      });

      await updateProfile(auth.currentUser!, {
        displayName: formData.shopName,
        photoURL: finalImageUrl || currentUser.photoURL || undefined,
      });

    await refreshUser();

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────── UI
  return (
    <SellerLayout>
      <Head>
        <title>Profil Toko - Dashboard Penjual</title>
      </Head>

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb ringkas + link “Lihat Toko” di kanan */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="text-sm text-slate-500">
            <span className="hover:text-slate-700">Dashboard</span>
            <ChevronRight className="inline mx-1 h-4 w-4 text-slate-400" />
            <span className="text-slate-700 font-medium">Profil Toko</span>
          </nav>
          {currentUser && (
            <Link
              href={`/toko/${currentUser.uid}`}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Lihat Toko
            </Link>
          )}
        </div>

        <h1 className="text-2xl md:text-[28px] font-bold text-slate-900">Profil Toko</h1>
        <p className="text-slate-500 mt-1">
          Atur identitas toko Anda. Perubahan akan tampil di daftar toko dan halaman toko.
        </p>

        {/* Card utama: grid 2 kolom (kiri avatar, kanan form), tidak full width */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* KIRI – avatar kecil & tombol ganti */}
              <div className="md:col-span-1 flex flex-col items-center text-center">
                <div className="relative w-28 h-28 md:w-32 md:h-32">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Foto Profil Toko"
                      fill
                      className="rounded-full object-cover border-4 border-white shadow"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 border-4 border-white shadow flex items-center justify-center">
                      <User className="text-slate-400" size={48} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 rounded-full bg-blue-600 text-white p-2 shadow hover:bg-blue-700"
                    aria-label="Ganti foto"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {formData.shopName || 'Nama Toko'}
                </p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
                <p className="mt-3 text-[11px] text-slate-400">PNG, JPG, WEBP — maks 2MB</p>
              </div>

              {/* KANAN – form compact (lebar sedang) */}
              <div className="md:col-span-2 space-y-5">
                <div>
                  <label htmlFor="shopName" className="text-sm font-semibold text-slate-700">
                    Nama Toko
                  </label>
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    value={formData.shopName}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="text-sm font-semibold text-slate-700">
                    Nomor WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Deskripsi Toko
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 shadow-sm outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ceritakan tentang toko Anda…"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bar bawah: notifikasi + tombol simpan (align-right) */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 md:px-8 py-4">
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mb-3"
                  >
                    {message.type === 'success' ? (
                      <div className="flex items-center gap-2 rounded-lg bg-green-100 text-green-800 px-3 py-2 text-sm">
                        <CheckCircle size={18} /> <span>{message.text}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-red-100 text-red-700 px-3 py-2 text-sm">
                        <AlertTriangle size={18} /> <span>{message.text}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Simpan Perubahan'}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </SellerLayout>
  );
};

export default withAuth(SellerProfilePage, ['penjual', 'admin']);
