// LOKASI FILE: src/components/admin/ProductListView.tsx
import Image from 'next/image';
import { Search, Filter, RotateCw, Edit2, Trash2 } from 'lucide-react';

export type ProductListItem = {
  id: string;
  name: string;
  description?: string;
  photoURL?: string;
  sellerName: string;
  category?: string;
  price: number; // rupiah (integer)
};

export type Option = { value: string; label: string };

export type Filters = {
  q: string;
  sellerId: string;   // '' = semua
  category: string;   // '' = semua
};

export default function ProductListView({
  items,
  loading = false,
  page,
  totalPages,
  filters,
  sellerOptions,
  categoryOptions,
  onChangeFilters,
  onApply,
  onReset,
  onEdit,
  onDelete,
  onPrevPage,
  onNextPage,
}: {
  items: ProductListItem[];
  loading?: boolean;
  page: number;
  totalPages: number;
  filters: Filters;
  sellerOptions: Option[];
  categoryOptions: Option[];
  onChangeFilters: (patch: Partial<Filters>) => void;
  onApply: () => void;
  onReset: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}) {
  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const hasItems = items.length > 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-2xl border bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={filters.q}
              onChange={(e) => onChangeFilters({ q: e.target.value })}
              placeholder="Cari produk…"
              className="w-full rounded-xl border-slate-300 pl-10 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Seller */}
          <div className="relative w-full md:w-64">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter size={18} />
            </div>
            <select
              value={filters.sellerId}
              onChange={(e) => onChangeFilters({ sellerId: e.target.value })}
              className="w-full rounded-xl border-slate-300 pl-10 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Semua penjual</option>
              {sellerOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori */}
          <div className="relative w-full md:w-64">
            <select
              value={filters.category}
              onChange={(e) => onChangeFilters({ category: e.target.value })}
              className="w-full rounded-xl border-slate-300 pl-3 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Semua kategori</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:ml-auto">
            <button
              onClick={onApply}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Terapkan
            </button>
            <button
              onClick={onReset}
              title="Reset filter"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RotateCw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* Header sticky (tetap blur, tapi tidak tembus ke row pertama) */}
        <div className="sticky top-16 z-30">
          <div className="relative border-b">
            {/* Overlay: hampir-opaque + blur → baris pertama tidak “menabrak”, blur tetap ada */}
            <div className="absolute inset-0 backdrop-blur-md bg-white/98 supports-[backdrop-filter]:bg-white/85"></div>
            <div className="relative px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">Produk</div>
                <div className="col-span-2">Toko</div>
                <div className="col-span-2">Kategori</div>
                <div className="col-span-1 text-right">Harga</div>
                <div className="col-span-1 text-right">Aksi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-slate-100">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
            : hasItems
            ? items.map((p) => (
                <Row
                  key={p.id}
                  p={p}
                  onEdit={() => onEdit(p.id)}
                  onDelete={() => onDelete(p.id)}
                  formatIDR={formatIDR}
                />
              ))
            : <EmptyState />}
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">
            Halaman {page} dari {Math.max(totalPages, 1)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevPage}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 enabled:hover:bg-slate-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={onNextPage}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 enabled:hover:bg-slate-50 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-komponen ---------- */

function Row({
  p,
  onEdit,
  onDelete,
  formatIDR,
}: {
  p: ProductListItem;
  onEdit: () => void;
  onDelete: () => void;
  formatIDR: (n: number) => string;
}) {
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-slate-50">
      {/* Produk */}
      <div className="col-span-6 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-slate-100">
          {p.photoURL ? <Image src={p.photoURL} alt={p.name} fill className="object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{p.name}</div>
          {p.description ? <div className="truncate text-xs text-slate-500">{p.description}</div> : null}
        </div>
      </div>

      {/* Toko */}
      <div className="col-span-2 self-center text-sm text-slate-700">{p.sellerName || '—'}</div>

      {/* Kategori */}
      <div className="col-span-2 self-center">
        {p.category ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {p.category}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </div>

      {/* Harga */}
      <div className="col-span-1 self-center text-right text-sm font-semibold tabular-nums text-slate-900">
        {formatIDR(p.price)}
      </div>

      {/* Aksi */}
      <div className="col-span-1 self-center">
        <div className="flex justify-end gap-1.5">
          <button
            onClick={onEdit}
            title="Edit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            title="Hapus"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-3 animate-pulse">
      <div className="col-span-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-slate-200" />
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-slate-200" />
          <div className="h-3 w-28 rounded bg-slate-200" />
        </div>
      </div>
      <div className="col-span-2 self-center h-3 w-24 rounded bg-slate-200" />
      <div className="col-span-2 self-center h-5 w-20 rounded-full bg-slate-200" />
      <div className="col-span-1 self-center h-3 w-16 rounded bg-slate-200 justify-self-end" />
      <div className="col-span-1 self-center h-8 w-8 rounded-lg bg-slate-200 justify-self-end" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center text-slate-500">
      Belum ada produk yang cocok dengan filter.
    </div>
  );
}
