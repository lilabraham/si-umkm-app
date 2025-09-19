import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState, FormEvent } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ProductListView, {
  ProductListItem,
  Filters,
  Option,
} from '@/components/admin/ProductListView';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* ====== types sesuai API ====== */
type Product = {
  id: string;
  name: string;
  price: number; // rupiah
  description?: string;
  imageUrl?: string;
  ownerId: string;
  shopName?: string;
  category?: string;
  visibility?: 'public' | 'hidden';
};

type ApiListResponse = {
  items: Product[];
};

const PAGE_SIZE = 20;

/* Debounce kecil agar fetch tidak tiap keypress */
function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const AdminProdukPage: NextPage = () => {
  // data
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // filters (dioper ke ProductListView)
  const [filters, setFilters] = useState<Filters>({ q: '', sellerId: '', category: '' });
  const debouncedFilters = useDebounced(filters, 350); // <-- auto apply

  // modal edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  const { currentUser } = useAuth();

  // fetch list (pakai filters yang sudah didebounce)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedFilters.q.trim()) params.set('q', debouncedFilters.q.trim());
      if (debouncedFilters.sellerId) params.set('sellerId', debouncedFilters.sellerId);
      if (debouncedFilters.category) params.set('category', debouncedFilters.category);
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));

      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'cache-control': 'no-store' },
      });
      if (!res.ok) {
        const txt = await res.text();
        let msg = 'Gagal memuat produk.';
        try {
          const j = JSON.parse(txt);
          msg = j.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = (await res.json().catch(() => ({ items: [] }))) as ApiListResponse;
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch saat page ATAU filters (debounced) berubah
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedFilters]);

  // options dropdown (cukup dari data yang sudah tampil)
  const sellerOptions: Option[] = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((p) => {
      if (p.ownerId) map.set(p.ownerId, p.shopName || p.ownerId);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [items]);

  const categoryOptions: Option[] = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).map((v) => ({ value: v, label: v }));
  }, [items]);

  // perubahan filter (auto reset page ke 1)
  const onChangeFilters = (patch: Partial<Filters>) =>
    setFilters((s) => {
      const next = { ...s, ...patch };
      setPage(1);
      return next;
    });

  const resetFilters = () => {
    setFilters({ q: '', sellerId: '', category: '' });
    setPage(1);
  };

  // edit & delete
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

  const saveEdit = async (e: FormEvent) => {
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
      setError(e?.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteOne = async (id: string) => {
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
      setError(e?.message || 'Terjadi kesalahan.');
    }
  };

  // (opsional) pulihkan hidden -> public
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const restoreOne = async (id: string) => {
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
      setError(e?.message || 'Terjadi kesalahan.');
    } finally {
      setRestoringId(null);
    }
  };

  // mapping ke view items
  const viewItems: ProductListItem[] = useMemo(
    () =>
      items.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.visibility === 'hidden' ? '(Disembunyikan) ' + (p.description || '') : p.description,
        photoURL: p.imageUrl,
        sellerName: p.shopName || '-',
        category: p.category || '',
        price: Number(p.price || 0),
      })),
    [items]
  );

  // estimasi paginasi sederhana
  const totalPages = Math.max(1, page + (items.length === PAGE_SIZE ? 1 : 0));

  return (
    <AdminLayout>
      <Head><title>Manajemen Produk - SI-UMKM</title></Head>
      <div className="p-6 lg:p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Produk</h1>
          <p className="mt-1 text-slate-600">Cari, filter, edit, dan hapus produk dari semua penjual.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <ProductListView
          items={viewItems}
          loading={loading}
          page={page}
          totalPages={totalPages}
          filters={filters}
          sellerOptions={sellerOptions}
          categoryOptions={categoryOptions}
          onChangeFilters={(patch) => onChangeFilters(patch)}  // <-- auto apply
          onApply={() => { /* tidak dipakai */ }}
          onReset={resetFilters}
          onEdit={(id) => {
            const p = items.find((x) => x.id === id);
            if (p) openEdit(p);
          }}
          onDelete={(id) => deleteOne(id)}
          onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPage((p) => p + 1)}
        />

        {items.some((p) => p.visibility === 'hidden') && (
          <div className="mt-3 text-xs text-slate-600">
            Beberapa produk disembunyikan. Buka detail produk lalu pulihkan jika diperlukan.
          </div>
        )}
      </div>

      {/* ======= EDIT MODAL ======= */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"
              initial={{ scale: 0.96, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 10, opacity: 0 }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-800"
              >
                <X size={20} />
              </button>

              <h3 className="mb-4 text-lg font-bold text-slate-900">Edit Produk</h3>

              <form onSubmit={saveEdit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Nama Produk</label>
                    <input
                      value={currentProduct.name || ''}
                      onChange={(e) => setCurrentProduct((s) => ({ ...s, name: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Harga</label>
                    <input
                      type="number"
                      value={Number(currentProduct.price || 0)}
                      onChange={(e) => setCurrentProduct((s) => ({ ...s, price: Number(e.target.value || 0) }))}
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Kategori</label>
                    <input
                      value={currentProduct.category || ''}
                      onChange={(e) => setCurrentProduct((s) => ({ ...s, category: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="makanan / fashion / dll"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Gambar (URL)</label>
                    <input
                      value={currentProduct.imageUrl || ''}
                      onChange={(e) => setCurrentProduct((s) => ({ ...s, imageUrl: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="https://…"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                    <textarea
                      value={currentProduct.description || ''}
                      onChange={(e) => setCurrentProduct((s) => ({ ...s, description: e.target.value }))}
                      className="min-h-[88px] w-full resize-none rounded-md border px-3 py-2"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between">
                  {currentProduct.id &&
                    items.find((x) => x.id === currentProduct.id)?.visibility === 'hidden' && (
                      <button
                        type="button"
                        onClick={() => restoreOne(currentProduct.id as string)}
                        disabled={restoringId === currentProduct.id}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                      >
                        {restoringId === currentProduct.id ? 'Memproses…' : 'Pulihkan Produk'}
                      </button>
                    )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="inline-block animate-spin" /> : 'Simpan'}
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
