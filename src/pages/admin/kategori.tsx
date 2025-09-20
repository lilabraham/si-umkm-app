// LOKASI: src/pages/admin/kategori.tsx
import type { NextPage } from "next";
import AdminLayout from "@/components/layout/AdminLayout";
import { useEffect, useMemo, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { auth } from "@/lib/firebase";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string; // URL/icon string/emoji
  createdAt?: { seconds: number; nanoseconds: number };
};

const isUrl = (v?: string) => !!v && /^(https?:)?\/\//i.test(v) || !!v && v.startsWith("data:");

const AdminKategoriPage: NextPage = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<Partial<Category>>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(k) || c.slug.toLowerCase().includes(k)
    );
  }, [items, q]);

  const resetForm = () => setForm({ name: "", slug: "", icon: "" });

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/categories", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: {
          "cache-control": "no-store",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const t = await res.text();
        let msg = "Gagal memuat kategori.";
        try {
          msg = JSON.parse(t).error || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = (await res.json()) as { items: Category[] };
      setItems(data.items);
    } catch (e: any) {
      setErr(e.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setMode("add");
    resetForm();
    setIsOpen(true);
  };
  const openEdit = (c: Category) => {
    setMode("edit");
    setForm(c);
    setIsOpen(true);
  };

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (mode === "add") {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            icon: form.icon,
          }),
        });
        if (!res.ok)
          throw new Error((await res.json()).error || "Gagal menyimpan kategori.");
      } else {
        const res = await fetch(`/api/admin/categories/${form.id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            icon: form.icon,
          }),
        });
        if (!res.ok)
          throw new Error(
            (await res.json()).error || "Gagal memperbarui kategori."
          );
      }
      setIsOpen(false);
      fetchData();
    } catch (e: any) {
      setErr(e.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    setErr(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Gagal menghapus kategori.");
      fetchData();
    } catch (e: any) {
      setErr(e.message || "Terjadi kesalahan.");
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 lg:px-10 py-8">
        {/* Breadcrumbs + Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <nav className="text-sm text-[#333]/60 mb-1">Admin / Kategori</nav>
            <h1 className="text-2xl font-bold text-[#111]">Kategori</h1>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] text-white px-4 py-2.5 font-semibold hover:bg-[#316FD1] shadow-sm active:scale-[.99]"
          >
            <Plus size={18} /> Tambah Kategori
          </button>
        </div>

        {/* Toolbar: search */}
        <div className="mb-5 flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 bg-white border border-black/5 ring-1 ring-black/5 rounded-lg px-3 py-2 shadow-sm">
              <Search size={18} className="text-[#333]/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kategori…"
                className="w-full outline-none text-sm bg-transparent placeholder:text-[#333]/50"
              />
            </div>
          </div>
        </div>

        {err && (
          <div className="my-3 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={18} />{" "}
            <span className="text-sm">{err}</span>
          </div>
        )}

        {/* TABLE CARD */}
        <div className="bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              {/* Header */}
              <thead>
                <tr className="bg-[#F1F5F9]">
                  <th className="text-left px-5 py-3 font-semibold text-[#333]">Nama</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#333]">Slug</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#333]">Icon</th>
                  <th className="text-right px-5 py-3 font-semibold text-[#333]">Aksi</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <Loader2 className="inline-block animate-spin text-[#3B82F6]" />
                    </td>
                  </tr>
                ) : filtered.length ? (
                  filtered.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`${
                        idx % 2 === 1 ? "bg-[#FAFBFF]" : "bg-white"
                      } border-t border-black/5 hover:bg-[#F7F8FC]`}
                    >
                      <td className="px-5 py-4 font-semibold text-[#111] align-middle">
                        {c.name}
                      </td>
                      <td className="px-5 py-4 text-[#333] align-middle">{c.slug}</td>

                      {/* ICON PREVIEW (32x32 bulat) */}
                      <td className="px-5 py-4 align-middle">
                        <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-black/5 shadow-sm bg-slate-100 flex items-center justify-center">
                          {isUrl(c.icon) ? (
                            <img
                              src={c.icon as string}
                              alt={c.name}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : c.icon ? (
                            <span className="text-base leading-none">
                              {/* emoji / huruf dipusatkan */}
                              {c.icon}
                            </span>
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right align-middle">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 rounded-full text-slate-500 hover:text-[#3B82F6] hover:bg-[#EFF6FF]"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50"
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
                    <td
                      colSpan={4}
                      className="px-5 py-14 text-center text-[#333]/60"
                    >
                      Belum ada kategori.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <motion.div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          isOpen ? "" : "pointer-events-none opacity-0"
        }`}
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative"
          initial={false}
          animate={{ scale: isOpen ? 1 : 0.98, y: isOpen ? 0 : 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <h3 className="text-lg font-bold text-[#111] mb-4">
            {mode === "add" ? "Tambah Kategori" : "Edit Kategori"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#333]">Nama</label>
              <input
                value={form.name || ""}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((s) => ({
                    ...s,
                    name,
                    slug: s.id ? s.slug : autoSlug(name),
                  }));
                }}
                className="w-full border border-black/10 ring-1 ring-black/5 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#333]">Slug</label>
              <input
                value={form.slug || ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, slug: e.target.value.toLowerCase() }))
                }
                className="w-full border border-black/10 ring-1 ring-black/5 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
                required
              />
              <p className="text-xs text-[#333]/60 mt-1">
                Huruf kecil, gunakan tanda hubung. Contoh:{" "}
                <code>makanan-minuman</code>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#333]">Icon (opsional)</label>
              <input
                value={form.icon || ""}
                onChange={(e) => setForm((s) => ({ ...s, icon: e.target.value }))}
                className="w-full border border-black/10 ring-1 ring-black/5 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
                placeholder="Tempel URL gambar / emoji / teks singkat"
              />
              <p className="text-xs text-[#333]/60 mt-1">
                Untuk preview optimal, gunakan URL gambar (akan tampil 32×32 bulat).
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 font-semibold mr-2"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-md bg-[#3B82F6] text-white font-semibold hover:bg-[#316FD1] disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="animate-spin inline-block" />
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminKategoriPage;
