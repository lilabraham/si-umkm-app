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
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import withAuth from '@/components/common/withAuth';
import SellerLayout from '@/components/layout/SellerLayout';

type CategoryOption = { label: string; value: string };

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shopName: string;
  imageUrl: string;
  ownerId: string;
  category: string; // slug/name
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

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // kategori dinamis
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [category, setCategory] = useState<string>('');

  // ====== Load kategori publik ======
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/categories?limit=200', {
          cache: 'no-store',
          headers: { 'cache-control': 'no-store' },
        });
        if (!res.ok) throw new Error('Gagal memuat kategori');
        const data = await res.json().catch(() => ({}));
        const items = Array.isArray(data?.items) ? data.items : [];
        const opts: CategoryOption[] = items
          .filter((c: any) => c?.isActive !== false)
          .map((c: any) => ({
            label: String(c?.name || ''),
            value: String(c?.slug || c?.name || '').toLowerCase(),
          }));
        if (!cancelled) {
          setCategoryOptions(opts);
          setCategory((prev) => prev || (opts[0]?.value ?? ''));
          setError((e) => (e === 'Kategori belum tersedia. Hubungi admin.' ? null : e));
        }
      } catch {
        if (!cancelled) {
          setCategoryOptions([]);
          setCategory('');
          setError((old) => old || 'Kategori belum tersedia. Hubungi admin.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ====== Load produk milik saya ======
  const fetchMyProducts = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('ownerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      setMyProducts(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) })) as Product[],
      );
    } catch {
      setError('Gagal memuat produk Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchMyProducts();
  }, [currentUser]);

  // ====== VALIDASI & PREVIEW FILE (maks 5MB, gambar saja) ======
  const MAX_MB = 5;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Hanya gambar yang diperbolehkan (JPG, PNG, WEBP, HEIC/HEIF, AVIF, GIF, SVG).');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Ukuran file maks ${MAX_MB}MB.`);
      return;
    }

    setError(null);
    setProductImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const openModal = (mode: 'add' | 'edit', product: Partial<Product> = {}) => {
    setModalMode(mode);
    setCurrentProduct(product);
    setPreviewUrl(mode === 'edit' ? product.imageUrl || null : null);
    setProductImageFile(null);
    setError(null);
    if (mode === 'edit') {
      setCategory((product.category as string) || (categoryOptions[0]?.value ?? ''));
    } else {
      setCategory(categoryOptions[0]?.value ?? '');
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
  };

  // ====== Direct signed upload ke Cloudinary ======
  type SignResponse = {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
    uploadPreset: string;
  };

  const getSignature = async (folder: 'produk' | 'profil' = 'produk') => {
    const r = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });
    const json: any = await r.json();
    if (!r.ok) throw new Error(json?.error || 'Gagal membuat signature upload.');
    return json as SignResponse;
  };

  const uploadToCloudinary = async (file: File, folder: 'produk' | 'profil' = 'produk') => {
    const { signature, timestamp, cloudName, apiKey, folder: targetFolder, uploadPreset } =
      await getSignature(folder);

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('upload_preset', uploadPreset);
    form.append('folder', targetFolder);

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const upRes = await fetch(endpoint, { method: 'POST', body: form });
    const up = await upRes.json();
    if (!upRes.ok) {
      throw new Error(up?.error?.message || 'Gagal upload gambar.');
    }
    return up.secure_url as string;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (!categoryOptions.length || !category) {
        throw new Error('Kategori belum tersedia. Hubungi admin.');
      }

      let imageUrl = currentProduct.imageUrl || '';
      if (productImageFile) {
        imageUrl = await uploadToCloudinary(productImageFile, 'produk');
      }
      if (!imageUrl && modalMode === 'add') throw new Error('Gambar produk wajib diisi.');

      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const shopName = userDoc.exists()
        ? (userDoc.data() as any).shopName
        : currentUser.displayName;

      const dataToSave = {
        name: currentProduct.name || '',
        price: Number(currentProduct.price || 0),
        description: currentProduct.description || '',
        imageUrl,
        shopId: currentUser.uid,
        shopName: shopName || '',
        ownerId: currentUser.uid,
        category,
      };

      if (modalMode === 'add') {
        await addDoc(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() });
        await updateDoc(userRef, { productCount: increment(1) });
      } else {
        if (!currentProduct.id) throw new Error('ID Produk tidak ditemukan.');
        await updateDoc(doc(db, 'products', currentProduct.id), dataToSave);
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
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          const curr = Number(snap.data()?.productCount) || 0;
          tx.update(userRef, { productCount: Math.max(0, curr - 1) });
        });
      }
      fetchMyProducts();
    } catch {
      setError('Gagal menghapus produk.');
    }
  };

  // helper label kategori dari slug
  const categoryLabel = (val: string) => {
    if (!val) return 'Tanpa Kategori';
    const hit = categoryOptions.find((c) => c.value === val);
    if (hit) return hit.label;
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const displayName =
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Penjual';

  return (
    <SellerLayout>
      <Head>
        <title>Dashboard Penjual - SI-UMKM</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header + ucapan selamat datang */}
        <motion.div
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Penjual</h1>
            <p className="mt-1 text-sm text-slate-600">
              Selamat datang, <span className="font-semibold">{displayName}</span>. Kelola produk Anda di sini.
            </p>
          </div>
          <motion.button
            onClick={() => openModal('add')}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} className="mr-2" /> Tambah Produk
          </motion.button>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* GRID: kartu produk */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          {isLoading ? (
            <div className="flex h-52 items-center justify-center">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : myProducts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {myProducts.map((p) => (
                <div
                  key={p.id}
                  className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Kebab */}
                  <div className="absolute right-2 top-2 z-10">
                    <button
                      onClick={() => setOpenMenuId((s) => (s === p.id ? null : p.id))}
                      className="rounded-full bg-white/80 p-1.5 text-slate-700 shadow hover:bg-white"
                      aria-label="Menu"
                    >
                      <MoreVertical size={16} />
                    </button>
                    <AnimatePresence>
                      {openMenuId === p.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute right-0 mt-2 w-36 overflow-hidden rounded-md border bg-white text-sm shadow-lg"
                        >
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              openModal('edit', p);
                            }}
                            className="block w-full px-3 py-2 text-left hover:bg-slate-50"
                          >
                            <Edit className="mr-1 inline-block" size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              handleDelete(p.id);
                            }}
                            className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-1 inline-block" size={14} /> Hapus
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Gambar */}
                  <div className="relative w-full">
                    <div className="aspect-[4/3] w-full">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width:1024px) 50vw, 20vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100">
                          <ImageIcon className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info singkat */}
                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{p.name}</h3>
                    <div className="mt-0.5 text-[13px] font-semibold text-blue-600">
                      Rp {Number(p.price || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {categoryLabel(p.category)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Belum ada produk. Tambahkan produk pertama Anda.
            </div>
          )}
        </div>

        {/* MODAL Add/Edit */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
                initial={{ scale: 0.96, y: 8, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, y: 8, opacity: 0 }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-800"
                  aria-label="Tutup"
                >
                  <CloseIcon size={20} />
                </button>

                <h2 className="mb-5 text-lg font-bold">
                  {modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={currentProduct.name || ''}
                      onChange={handleFormChange}
                      className="mt-1 w-full rounded-md border border-slate-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="price" className="text-sm font-medium text-slate-700">
                        Harga
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        defaultValue={(currentProduct.price as number) || 0}
                        onChange={handleFormChange}
                        className="mt-1 w-full rounded-md border border-slate-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="text-sm font-medium text-slate-700">
                        Kategori
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!categoryOptions.length}
                      >
                        {categoryOptions.length ? (
                          categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))
                        ) : (
                          <option value="">(Kategori belum tersedia)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label htmlFor="description" className="text-sm font-medium text-slate-700">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      defaultValue={currentProduct.description || ''}
                      onChange={handleFormChange}
                      rows={4}
                      className="mt-1 w-full resize-none rounded-md border border-slate-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Foto Produk</label>
                    <div className="mt-1 rounded-lg border-2 border-dashed p-6 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        id="file-upload"
                      />
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={150}
                          height={150}
                          className="mx-auto mb-2 rounded-md object-cover"
                        />
                      ) : (
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
                      >
                        {previewUrl ? 'Ganti Gambar' : 'Pilih Gambar'}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                      disabled={isSubmitting || !categoryOptions.length || !category}
                    >
                      {isSubmitting ? (
                        <Loader2 className="inline-block animate-spin" />
                      ) : modalMode === 'add' ? (
                        'Simpan Produk'
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SellerLayout>
  );
};

export default withAuth(SellerDashboardPage, ['penjual', 'admin']);
