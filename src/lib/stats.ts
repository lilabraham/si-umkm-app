// src/lib/stats.ts
export type ProductCsv = {
  id: string;
  name: string;
  price: string | number;
  category: string;   // bisa ID, slug, atau nama kategori
  ownerId?: string;
  createdAt?: string;
  visibility?: string | boolean | number | null; // bisa tidak ada di CSV export
};

export type ShopCsv = {
  uid?: string;
  shopName?: string;
  createdAt?: string;
  [k: string]: any;
};

export type CategoryCsv = {
  id: string;
  name: string;
  slug?: string;
  createdAt?: string;
};

export type PublicProduct = {
  id: string;
  name: string;
  price: number;
  category: string;   // NAMA kategori untuk ditampilkan
  ownerId: string;
};

export type FrequencyRow = { key: string; count: number };

export const groupBy = <T, K extends string | number>(
  arr: T[],
  getKey: (x: T) => K
): Record<K, T[]> =>
  arr.reduce((acc, item) => {
    const k = getKey(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);

export const countBy = <T, K extends string | number>(
  arr: T[],
  getKey: (x: T) => K
): Record<K, number> => {
  const g = groupBy(arr, getKey);
  const out: Record<K, number> = {} as any;
  (Object.keys(g) as K[]).forEach((k) => (out[k] = g[k].length));
  return out;
};

export const toFrequencyRows = (counts: Record<string, number>): FrequencyRow[] =>
  Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

export const cleanPrice = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  if (typeof v === "string") {
    const digits = v.replace(/[^\d]/g, "");
    return digits ? Number(digits) : NaN;
  }
  return NaN;
};

const norm = (x: unknown) => String(x ?? "").trim().toLowerCase();

const isPublicVisibility = (v: unknown): boolean => {
  const s = norm(v);
  if (!s) return true; // ===> CSV export-mu tidak punya kolom visibility → anggap PUBLIC
  return (
    s === "public" ||
    s === "published" ||
    s === "publish" ||
    s === "visible" ||
    s === "active" ||
    s === "true" ||
    s === "1"
  );
};

/** Buat peta kategori fleksibel (id→name, slug→name, name→name) */
export const makeCategoriesMap = (cats: CategoryCsv[]): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const c of cats) {
    if (!c) continue;
    if (c.id) map[norm(c.id)] = c.name;
    if (c.slug) map[norm(c.slug)] = c.name;
    if (c.name) map[norm(c.name)] = c.name; // kalau produk langsung pakai nama
  }
  return map;
};

export const onlyPublicProducts = (
  products: ProductCsv[],
  categoriesMap: Record<string, string>
): PublicProduct[] => {
  return products
    .filter((p) => isPublicVisibility(p.visibility))
    .map((p) => {
      const price = cleanPrice(p.price);
      const key = norm(p.category);
      const categoryName = categoriesMap[key] || p.category || "Lainnya";
      return {
        id: String(p.id),
        name: String(p.name ?? ""),
        price,
        category: String(categoryName),
        ownerId: String(p.ownerId ?? ""),
      };
    })
    .filter((p) => Number.isFinite(p.price));
};

// ===== Histogram =====
export type Bin = { binStart: number; binEnd: number; count: number };
export const histogram = (values: number[], bins = 10): Bin[] => {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return [];
  const min = Math.min(...xs), max = Math.max(...xs);
  if (min === max) return [{ binStart: min, binEnd: max, count: xs.length }];
  const step = (max - min) / bins;
  const edges = Array.from({ length: bins + 1 }, (_, i) => min + i * step);
  const counts = new Array(bins).fill(0);
  for (const v of xs) {
    let idx = Math.floor((v - min) / step);
    if (idx === bins) idx = bins - 1;
    counts[idx]++;
  }
  return counts.map((c, i) => ({ binStart: edges[i], binEnd: edges[i + 1], count: c }));
};

// ===== Five-number summary =====
export const quantile = (arr: number[], q: number): number => {
  const xs = arr.slice().sort((a, b) => a - b);
  if (xs.length === 0) return NaN;
  const pos = (xs.length - 1) * q, base = Math.floor(pos), rest = pos - base;
  return xs[base + 1] !== undefined ? xs[base] + rest * (xs[base + 1] - xs[base]) : xs[base];
};

export type FiveNum = { min: number; q1: number; median: number; q3: number; max: number; count: number };

export const fiveNumberSummary = (values: number[]): FiveNum => {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return { min: NaN, q1: NaN, median: NaN, q3: NaN, max: NaN, count: 0 };
  return { min: xs[0], q1: quantile(xs, 0.25), median: quantile(xs, 0.5), q3: quantile(xs, 0.75), max: xs[xs.length - 1], count: xs.length };
};

export type BoxByCategory = { category: string; stats: FiveNum };
export const boxplotByCategory = (items: PublicProduct[]): BoxByCategory[] => {
  const g = groupBy(items, (d) => d.category);
  return Object.entries(g).map(([category, rows]) => ({
    category, stats: fiveNumberSummary(rows.map((r) => r.price)),
  })).filter((d) => d.stats.count > 0);
};

// ===== Narasi =====
export const formatIDR = (n: number) => Math.round(n).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export type CsvRow = Record<string, any>;
export const toCsv = (rows: CsvRow[], headerOrder?: string[]): string => {
  if (!rows.length) return "";
  const headers = headerOrder?.length ? headerOrder : Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v ?? "";
    const str = typeof s === "string" ? s : String(s);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const head = headers.join(",");
  const body = rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");
  return `${head}\n${body}`;
};

export const describeFrequency = (freq: FrequencyRow[]): string => {
  if (freq.length === 0) return "Tidak ada data kategori produk yang tersedia.";
  const top = freq[0];
  const total = freq.reduce((s, r) => s + r.count, 0);
  const share = ((top.count / Math.max(total, 1)) * 100).toFixed(1);
  return `Kategori terbanyak adalah "${top.key}" (${top.count} item, ${share}% dari total).`;
};

export const describeHistogram = (bins: Bin[]): string => {
  if (!bins.length) return "Tidak ada data harga yang dapat dianalisis.";
  const peak = bins.reduce((a, b) => (b.count > a.count ? b : a));
  return `Sebaran harga terkonsentrasi pada rentang Rp${formatIDR(peak.binStart)}–Rp${formatIDR(peak.binEnd)}.`;
};

export const describePie = (freq: FrequencyRow[]): string => {
  if (!freq.length) return "Proporsi kategori tidak tersedia.";
  const total = freq.reduce((s, r) => s + r.count, 0);
  const top = freq[0];
  const share = ((top.count / Math.max(total, 1)) * 100).toFixed(1);
  return `Proporsi terbesar berasal dari kategori "${top.key}" sekitar ${share}%.`;
};

export const describeBoxplot = (boxes: BoxByCategory[]): string => {
  if (!boxes.length) return "Ringkasan lima angka per kategori belum tersedia.";
  const medians = boxes.map((b) => ({ k: b.category, m: b.stats.median })).sort((a, b) => b.m - a.m);
  const top = medians[0];
  return `Median harga tertinggi pada kategori "${top.k}" (≈ Rp${formatIDR(top.m)}).`;
};
