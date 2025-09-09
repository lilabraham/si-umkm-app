// LOKASI FILE: src/pages/dashboard/index.tsx

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UploadCloud, Edit, Trash2, X as CloseIcon, Image as ImageIcon, Loader2, Plus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nookies from 'nookies';
import { admin } from '@/lib/firebaseAdmin';

// Tipe data Product
interface Product {
  id: string; 
  name: string; 
  price: number; 
  description: string; 
  shopName: string; 
  imageUrl: string; 
  ownerId: string;
}

const SellerDashboardPage: NextPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMyProducts = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/produk?tokoId=${currentUser.uid}`);
      if (!response.ok) throw new Error('Gagal mengambil data produk');
      const userProducts: Product[] = await response.json();
      setMyProducts(userProducts);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMyProducts();
    }
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
        setError("Ukuran file maks 2MB.");
        return;
      }
      setError(null);
      setProductImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openModal = (mode: 'add' | 'edit', product: Partial<Product> = {}) => {
      setModalMode(mode);
      setCurrentProduct(product);
      setPreviewUrl(mode === 'edit' ? product.imageUrl || null : null);
      setProductImageFile(null);
      setError(null);
      setIsModalOpen(true);
  };
  
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setError(null);
    
    try {
        let imageUrl = currentProduct.imageUrl || '';
        if (productImageFile) {
            const fileBase64 = await toBase64(productImageFile);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: fileBase64 }),
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || 'Gagal upload gambar.');
            imageUrl = uploadData.secure_url;
        }

        if (!imageUrl) throw new Error("Gambar produk wajib diisi.");
        
        const { id, ...productData } = currentProduct;
        const dataToSave = {
            name: productData.name || '',
            price: Number(productData.price || 0),
            description: productData.description || '',
            imageUrl: imageUrl,
            shopId: currentUser.uid,
            shopName: currentUser.displayName || currentUser.email,
            ownerId: currentUser.uid,
        };

        if (modalMode === 'add') {
            await addDoc(collection(db, "products"), { ...dataToSave, createdAt: serverTimestamp() });
        } else {
            if(!id) throw new Error("ID Produk tidak ditemukan untuk diedit.");
            await updateDoc(doc(db, "products", id), dataToSave);
        }

        setIsModalOpen(false);
        fetchMyProducts();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (productId: string) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
        await deleteDoc(doc(db, "products", productId));
        fetchMyProducts();
    } catch (error) {
        setError("Gagal menghapus produk.");
    }
  };

  if (authLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={40}/>
        </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Head>
          <title>Dashboard Penjual - SI-UMKM</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Penjual</h1>
                <p className="text-slate-500">Selamat datang, {currentUser?.displayName}. Kelola produk Anda di sini.</p>
            </div>
            <motion.button onClick={() => openModal('add')} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Plus size={20} className="mr-2" /> Tambah Produk
            </motion.button>
        </motion.div>
        
        {error && (<div className="my-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded-md flex items-center gap-3"><AlertTriangle size={20} /><span>{error}</span></div>)}

        <motion.div className="bg-white shadow-md rounded-xl p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Daftar Produk Anda</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
            ) : myProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myProducts.map((product) => (
                  <div key={product.id} className="rounded-xl border border-gray-200 p-4 flex flex-col bg-white hover:shadow-lg transition-shadow">
                    <div className='relative w-full h-40 mb-3'>
                        <Image src={product.imageUrl} alt={product.name} fill sizes="30vw" className="rounded-md object-cover" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-slate-800 truncate">{product.name}</h3>
                        <p className="text-sm text-blue-600 font-semibold">Rp {product.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-end space-x-2">
                      <button onClick={() => openModal('edit', product)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                 <ImageIcon size={40} className="mx-auto text-gray-400 mb-4" />
                 <p className="font-semibold text-gray-700">Anda belum memiliki produk.</p>
                 <p className="text-sm mt-1">Klik tombol "Tambah Produk" untuk memulai.</p>
              </div>
            )}
        </motion.div>
        
        <AnimatePresence>
            {isModalOpen && (
              <motion.div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800"><CloseIcon size={20} /></button>
                  <h2 className="text-xl font-bold mb-5">{modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium">Nama Produk</label>
                        <input type="text" name="name" id="name" defaultValue={currentProduct.name || ''} onChange={handleFormChange} className="mt-1 w-full border-gray-300 rounded-md p-2" required />
                    </div>
                    <div>
                        <label htmlFor="price" className="text-sm font-medium">Harga</label>
                        <input type="number" name="price" id="price" defaultValue={currentProduct.price || ''} onChange={handleFormChange} className="mt-1 w-full border-gray-300 rounded-md p-2" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="text-sm font-medium">Deskripsi</label>
                        <textarea name="description" id="description" defaultValue={currentProduct.description || ''} onChange={handleFormChange} rows={3} className="mt-1 w-full border-gray-300 rounded-md p-2 resize-none" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Foto Produk</label>
                      <div className="mt-1 border-2 border-dashed rounded-md p-6 text-center">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" id="file-upload"/>
                        {previewUrl ? <Image src={previewUrl} alt="Preview" width={150} height={150} className="mx-auto mb-2 rounded-md"/> : <ImageIcon className="mx-auto h-12 w-12 text-gray-400"/>}
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:underline">
                          {previewUrl ? 'Ganti Gambar' : 'Pilih Gambar'}
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-md" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin"/> : (modalMode === 'add' ? 'Simpan Produk' : 'Simpan Perubahan')}
                        </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const cookies = nookies.get(context);
        const token = await admin.auth().verifyIdToken(cookies.token || '');
        const { uid } = token;
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const userRole = userDoc.data()?.role;
        if (userRole !== 'penjual' && userRole !== 'admin') {
          return { redirect: { destination: '/login', permanent: false } };
        }
        return { props: {} };
    } catch (error) {
        return { redirect: { destination: '/login', permanent: false } };
    }
};

export default SellerDashboardPage;