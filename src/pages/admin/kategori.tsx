// LOKASI: src/pages/admin/kategori.tsx
import type { NextPage } from 'next';
import AdminLayout from '@/components/layout/AdminLayout';
import { useEffect, useMemo, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Loader2, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/firebase';

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

const AdminKategoriPage: NextPage = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'add'|'edit'>('add');
  const [form, setForm] = useState<Partial<Category>>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter(c =>
      c.name.toLowerCase().includes(k) ||
      c.slug.toLowerCase().includes(k)
    );
  }, [items, q]);

  const resetForm = () => setForm({ name: '', slug: '', icon: '' });

  const fetchData = async () => {
    setLoading(true); setErr(null);
    try {
      const token = await auth.currentUser?.getIdToken(); // ⬅️ ambil token
      const res = await fetch('/api/admin/categories', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'cache-control': 'no-store',
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // ⬅️ kirim Authorization
        },
      });

      if (!res.ok) {
        const t = await res.text();
        let msg = 'Gagal memuat kategori.';
        try { msg = JSON.parse(t).error || msg; } catch {}
        throw new Error(msg);
      }
      const data = await res.json() as { items: Category[] };
      setItems(data.items);
    } catch (e: any) {
      setErr(e.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setMode('add'); resetForm(); setIsOpen(true); };
  const openEdit = (c: Category) => { setMode('edit'); setForm(c); setIsOpen(true); };

  const autoSlug = (name: string) =>
    name.toLowerCase()
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setErr(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (mode === 'add') {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ name: form.name, slug: form.slug, icon: form.icon }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan kategori.');
      } else {
        const res = await fetch(`/api/admin/categories/${form.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ name: form.name, slug: form.slug, icon: form.icon }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui kategori.');
      }
      setIsOpen(false);
      fetchData();
    } catch (e: any) {
      setErr(e.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    setErr(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menghapus kategori.');
      fetchData();
    } catch (e: any) {
      setErr(e.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
          <p className="text-gray-600 mt-1">Kelola daftar kategori produk agar data rapi dan mudah ditelusuri.</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kategori…"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18}/> Tambah
          </button>
        </div>

        {err && (
          <div className="my-3 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={18} /> <span className="text-sm">{err}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Icon (opsional)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="inline-block animate-spin text-blue-600"/></td></tr>
                ) : filtered.length ? (
                  filtered.map(c => (
                    <tr key={c.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-4 py-3 text-slate-700">{c.slug}</td>
                      <td className="px-4 py-3 text-slate-700">{c.icon || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(c)} className="p-2 rounded-full hover:bg-blue-100 text-slate-600 hover:text-blue-600" title="Edit">
                            <Edit size={16}/>
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 rounded-full hover:bg-red-100 text-slate-600 hover:text-red-600" title="Hapus">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">Belum ada kategori.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <motion.div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isOpen ? '' : 'pointer-events-none opacity-0'}`}
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w/full max-w-lg p-6 relative"
          initial={false}
          animate={{ scale: isOpen ? 1 : 0.95, y: isOpen ? 0 : 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">{mode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nama</label>
              <input
                value={form.name || ''}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm(s => ({ ...s, name, slug: s.id ? s.slug : autoSlug(name) }));
                }}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Slug</label>
              <input
                value={form.slug || ''}
                onChange={(e) => setForm(s => ({ ...s, slug: e.target.value.toLowerCase() }))}
                className="w-full border rounded-md px-3 py-2"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Huruf kecil, gunakan tanda hubung. Contoh: <code>makanan-minuman</code></p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Icon (opsional)</label>
              <input
                value={form.icon || ''}
                onChange={(e) => setForm(s => ({ ...s, icon: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="mis. 🍜 / 🎨 / URL ikon"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 font-semibold mr-2">Batal</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
                {submitting ? <Loader2 className="animate-spin inline-block"/> : 'Simpan'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminKategoriPage;
