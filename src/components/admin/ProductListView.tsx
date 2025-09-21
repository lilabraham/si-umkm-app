// LOKASI FILE: src/components/admin/ProductListView.tsx
import React from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  ChevronDown,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
} from "lucide-react";

/* ===================== Types & Props ===================== */
export type ProductListItem = {
  id: string;
  name: string;
  description?: string;
  photoURL?: string;
  sellerName: string;
  category: string;
  price: number;
};

export type Option = { value: string; label: string };

export type Filters = {
  q: string;
  sellerId: string;
  category: string;
};

type Props = {
  items: ProductListItem[];
  loading?: boolean;

  // filters & actions
  filters: Filters;
  sellerOptions: Option[];
  categoryOptions: Option[];
  onChangeFilters: (patch: Partial<Filters>) => void;
  onApply: () => void;
  onReset: () => void;

  // table actions
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;

  // pagination
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

/* ===================== Helpers ===================== */
const rupiah = (n: number) =>
  "Rp " + (Number(n || 0)).toLocaleString("id-ID");

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs">
    {children}
  </span>
);

/* ===================== Component ===================== */
const ProductListView: React.FC<Props> = ({
  items,
  loading,
  filters,
  sellerOptions,
  categoryOptions,
  onChangeFilters,
  onApply,
  onReset,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
      {/* ================== FILTER BAR ================== */}
      <div className="border-b border-slate-200 p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
          {/* search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={filters.q}
              onChange={(e) => onChangeFilters({ q: e.target.value })}
              placeholder="Cari produk..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* seller */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filters.sellerId}
              onChange={(e) => onChangeFilters({ sellerId: e.target.value })}
              className="w-full appearance-none rounded-lg border border-slate-300 pl-9 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua penjual</option>
              {sellerOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* category */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filters.category}
              onChange={(e) => onChangeFilters({ category: e.target.value })}
              className="w-full appearance-none rounded-lg border border-slate-300 pl-9 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua kategori</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* apply */}
          <button
            onClick={onApply}
            className="rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 hover:bg-blue-700"
          >
            Terapkan
          </button>

          {/* reset */}
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold py-2.5 px-4 hover:bg-slate-200"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* ================== TABLE ================== */}
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            {/* Kolom fixed agar header & body selaras */}
            <colgroup>
              <col className="w-[48%]" />
              <col className="w-[22%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[5%]" />
            </colgroup>

            <thead className="bg-[#F8F9FA] border-b border-slate-200">
              <tr>
                {["PRODUK", "TOKO", "KATEGORI", "HARGA", "AKSI"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-slate-200" />
                        <div className="space-y-2">
                          <div className="h-3 w-44 bg-slate-200 rounded" />
                          <div className="h-2.5 w-28 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-32 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-20 bg-slate-200 rounded-full" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-20 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-end">
                        <div className="h-8 w-8 bg-slate-200 rounded-md" />
                        <div className="h-8 w-8 bg-slate-200 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    {/* PRODUK */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 relative">
                          {p.photoURL ? (
                            <Image
                              src={p.photoURL}
                              alt={p.name}
                              fill
                              sizes="44px"
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-full bg-slate-100" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">
                            {p.name}
                          </div>
                          {p.description ? (
                            <div className="truncate text-[12px] text-slate-500">
                              {p.description}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* TOKO */}
                    <td className="px-4 py-3 align-top">
                      <div className="truncate text-slate-800">{p.sellerName}</div>
                    </td>

                    {/* KATEGORI */}
                    <td className="px-4 py-3 align-top">
                      {p.category ? <Pill>{p.category}</Pill> : <span className="text-slate-400">-</span>}
                    </td>

                    {/* HARGA */}
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-slate-900">{rupiah(p.price)}</div>
                    </td>

                    {/* AKSI */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(p.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-slate-700" />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================== PAGINATION ================== */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Halaman <b>{page}</b> dari <b>{totalPages}</b>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPage}
              className="rounded-lg bg-slate-100 text-slate-700 text-sm font-medium px-3 py-2 hover:bg-slate-200 disabled:opacity-50"
              disabled={page <= 1}
            >
              Sebelumnya
            </button>
            <button
              onClick={onNextPage}
              className="rounded-lg bg-slate-100 text-slate-700 text-sm font-medium px-3 py-2 hover:bg-slate-200 disabled:opacity-50"
              disabled={page >= totalPages}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListView;
