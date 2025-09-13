// LOKASI FILE: src/pages/dashboard/index.tsx

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  increment,
  runTransaction,  
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Edit,
  Trash2,
  X as CloseIcon,
  Image as ImageIcon,
  Loader2,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import withAuth from '@/components/common/withAuth';

// ======================
// Kategori (konstan)
// ======================
const CATEGORY_OPTIONS = [
  { label: 'Makanan', value: 'makanan' },
  { label: 'Minuman', value: 'minuman' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Kerajinan', value: 'kerajinan' },
  { label: 'Kecantikan', value: 'kecantikan' },
  { label: 'Lainnya', value: 'lainnya' },
] as const;

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]['value'];

// ======================
// Interface Product
// ======================
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string;
  ownerId: string;
  category: CategoryValue; // <-- field kategori
}

const SellerDashboardPage: NextPage = () => {
  const { currentUser } = useAuth();

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

  // State kategori di form (default 'lainnya')
  const [category, setCategory] = useState<CategoryValue>('lainnya');

  const fetchMyProducts = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('ownerId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      setMyProducts(
        querySnapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) })) as Product[],
      );
    } catch (error) {
      console.error('Gagal mengambil produk:', error);
      setError('Gagal memuat produk Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMyProducts();
    }
  }, [currentUser]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file maks 2MB.');
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
    // set kategori saat edit atau default saat add
    setCategory((product.category as CategoryValue) || 'lainnya');
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
          body: JSON.stringify({ file: fileBase64, folder: 'produk' }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Gagal upload gambar.');
        imageUrl = uploadData.secure_url;
      }
      if (!imageUrl && modalMode === 'add') throw new Error('Gambar produk wajib diisi.');

      const { id, ...productData } = currentProduct;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const correctShopName = userDoc.exists() ? (userDoc.data() as any).shopName : currentUser.displayName;

      const dataToSave = {
        name: productData.name || '',
        price: Number(productData.price || 0),
        description: productData.description || '',
        imageUrl: imageUrl,
        shopId: currentUser.uid,
        shopName: correctShopName || '',
        ownerId: currentUser.uid,
        category: category, // <-- simpan kategori
      };

      if (modalMode === 'add') {
        await addDoc(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() });

        // ➕ denormalisasi counter produk toko
        await updateDoc(doc(db, 'users', currentUser.uid), {
          productCount: increment(1),
        });
      } else {
        if (!id) throw new Error('ID Produk tidak ditemukan untuk diedit.');
        await updateDoc(doc(db, 'products', id), dataToSave);
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
  if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
  try {
    await deleteDoc(doc(db, 'products', productId));

    // ➖ Denormalisasi aman: pakai transaction supaya tidak jadi negatif
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        const current = Number(snap.data()?.productCount) || 0;
        const next = Math.max(0, current - 1);
        tx.update(userRef, { productCount: next });
      });
    }

    fetchMyProducts();
  } catch (error) {
    setError('Gagal menghapus produk.');
  }
};


  return (
    <div className="bg-slate-50 min-h-screen">
      <Head>
        <title>Dashboard Penjual - SI-UMKM</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Penjual</h1>
            <p className="text-slate-500">Selamat datang, {currentUser?.displayName}. Kelola produk Anda di sini.</p>
          </div>
          <motion.button
            onClick={() => openModal('add')}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} className="mr-2" /> Tambah Produk
          </motion.button>
        </motion.div>

        {error && (
          <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded-md flex items-center gap-3">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <motion.div className="bg-white shadow-md rounded-xl p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Daftar Produk Anda</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : myProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-gray-200 p-4 flex flex-col bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="relative w-full h-40 mb-3">
                    <Image src={product.imageUrl} alt={product.name} fill sizes="30vw" className="rounded-md object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-800 truncate">{product.name}</h3>
                    <p className="text-sm text-blue-600 font-semibold">Rp {product.price.toLocaleString('id-ID')}</p>
                    {/* Badge kategori kecil */}
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-600">
                        {CATEGORY_OPTIONS.find((c) => c.value === product.category)?.label || 'Lainnya'}
                      </span>
                    </div>
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => openModal('edit', product)}
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
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
            <motion.div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  aria-label="Tutup"
                >
                  <CloseIcon size={20} />
                </button>

                <h2 className="text-xl font-bold mb-5">{modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={currentProduct.name || ''}
                      onChange={handleFormChange}
                      className="mt-1 w-full border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="text-sm font-medium text-gray-700">
                        Harga
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        defaultValue={(currentProduct.price as number) || 0}
                        onChange={handleFormChange}
                        className="mt-1 w-full border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Select Kategori */}
                    <div>
                      <label htmlFor="category" className="text-sm font-medium text-gray-700">
                        Kategori
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryValue)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                        required
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      defaultValue={currentProduct.description || ''}
                      onChange={handleFormChange}
                      rows={4}
                      className="mt-1 w-full border-gray-300 rounded-md p-3 shadow-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Foto Produk</label>
                    <div className="mt-1 border-2 border-dashed rounded-lg p-6 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        id="file-upload"
                      />
                      {previewUrl ? (
                        <Image src={previewUrl} alt="Preview" width={150} height={150} className="mx-auto mb-2 rounded-md" />
                      ) : (
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-semibold text-blue-600 hover:underline mt-2"
                      >
                        {previewUrl ? 'Ganti Gambar' : 'Pilih Gambar'}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : modalMode === 'add' ? 'Simpan Produk' : 'Simpan Perubahan'}
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
};

export default withAuth(SellerDashboardPage, ['penjual', 'admin']);
