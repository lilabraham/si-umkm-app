import type { NextPage } from 'next';
import { useEffect, useMemo, useState, ChangeEvent, FormEvent } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  X as CloseIcon,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // ⬅️ tambahan

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  shopName?: string;
  category?: string;
  createdAt?: { seconds: number; nanoseconds: number };
  visibility?: 'public' | 'hidden'; // ⬅️ tambahan (opsional, untuk tampilkan tombol Pulihkan)
};

type ApiListResponse = {
  items: Product[];
};

const PAGE_SIZE = 20;

const AdminProdukPage: NextPage = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [sellerId, setSellerId] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  const { currentUser } = useAuth(); // ⬅️ tambahan

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (sellerId !== 'all') params.set('sellerId', sellerId);
      if (category !== 'all') params.set('category', category);
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));

      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'cache-control': 'no-store' },
      });

      if (res.status === 304) {
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        let msg = 'Gagal memuat produk.';
        try {
          const data = JSON.parse(text);
          msg = data.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = (await res.json().catch(() => ({ items: [] }))) as ApiListResponse;
      setItems(data.items);
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const uniqueSellers = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((p) => {
      if (p.ownerId) map.set(p.ownerId, p.shopName || p.ownerId);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [items]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [items]);

  const applyFilters = () => {
    setPage(1);
    fetchData();
  };

  const openEdit = (p: Product) => {
    setCurrentProduct({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      category: p.category || '',
      ownerId: p.ownerId,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentProduct?.id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentProduct.name,
          price: Number(currentProduct.price || 0),
          description: currentProduct.description || '',
          imageUrl: currentProduct.imageUrl || '',
          category: currentProduct.category || '',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menyimpan perubahan.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menghapus produk.');
      }
      fetchData();
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan.');
    }
  };

  // ⬇️⬇️ Tambahan: aksi Pulihkan (hidden → public)
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setError(null);
    try {
      setRestoringId(id);
      const token = await currentUser?.getIdToken();
      const res = await fetch('/api/admin/products/visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productIds: [id], visibility: 'public' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Gagal memulihkan produk.');
      await fetchData();
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan.');
    } finally {
      setRestoringId(null);
    }
  };
  // ⬆️⬆️ Tambahan selesai

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="text-gray-600 mt-1">Cari, filter, edit, dan hapus produk dari semua penjual.</p>
        </div>

        {/* Controls */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari produk…"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full outline-none text-sm bg-transparent"
              >
                <option value="all">Semua penjual</option>
                {uniqueSellers.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Semua kategori</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c[0]?.toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={applyFilters}
              className="w-full md:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Terapkan
            </button>
            <button
              onClick={() => {
                setQ('');
                setSellerId('all');
                setCategory('all');
                setPage(1);
                fetchData();
              }}
              className="px-3 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300"
              title="Reset"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="my-3 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={18} /> <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Produk</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Toko</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Kategori</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Harga</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Loader2 className="inline-block animate-spin text-blue-600" />
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-slate-200" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{p.shopName || '-'}</td>
                      <td className="px-4 py-3 text-slate-700 capitalize">{p.category || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-blue-700">
                        Rp {Number(p.price || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* ⬇️ Tombol Pulihkan: tampil hanya jika produk hidden */}
                          {p.visibility === 'hidden' && (
                            <button
                              onClick={() => handleRestore(p.id)}
                              disabled={restoringId === p.id}
                              className="px-2.5 py-1.5 rounded-md text-xs font-semibold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                              title="Pulihkan produk (tampilkan kembali)"
                            >
                              {restoringId === p.id ? 'Memproses…' : 'Pulihkan'}
                            </button>
                          )}

                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-full hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-full hover:bg-red-100 text-slate-600 hover:text-red-600"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination simple */}
          <div className="p-3 border-t flex items-center justify-between">
            <p className="text-xs text-slate-500">Halaman {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-md bg-slate-200 text-slate-800 text-sm hover:bg-slate-300"
                disabled={page <= 1}
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-md bg-slate-200 text-slate-800 text-sm hover:bg-slate-300"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative"
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
              >
                <CloseIcon size={20} />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Produk</h3>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Nama Produk</label>
                    <input
                      value={currentProduct.name || ''}
                      onChange={(e) => setCurrentProduct((s) => ({ ...s, name: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Harga</label>
                    <input
                      type="number"
                      value={Number(currentProduct.price || 0)}
                      onChange={(e) =>
                        setCurrentProduct((s) => ({ ...s, price: Number(e.target.value || 0) }))
                      }
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Kategori</label>
                    <input
                      value={currentProduct.category || ''}
                      onChange={(e) => setCurrentProduct((s) => ({ ...s, category: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="makanan / fashion / dll"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Gambar (URL)</label>
                    <input
                      value={currentProduct.imageUrl || ''}
                      onChange={(e) =>
                        setCurrentProduct((s) => ({ ...s, imageUrl: e.target.value }))
                      }
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="https://…"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                    <textarea
                      value={currentProduct.description || ''}
                      onChange={(e) =>
                        setCurrentProduct((s) => ({ ...s, description: e.target.value }))
                      }
                      className="w-full border rounded-md px-3 py-2 min-h-[88px] resize-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin inline-block" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminProdukPage;
