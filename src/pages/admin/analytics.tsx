// LOKASI FILE: src/pages/admin/analytics.tsx
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Package, Store, Layers } from "lucide-react";

import AdminLayout from "@/components/layout/AdminLayout"; // ⬅️ DITAMBAHKAN

import {
  CategoryCsv,
  ShopCsv,
  ProductCsv,
  countBy,
  toFrequencyRows,
  histogram,
  boxplotByCategory,
  describeFrequency,
  describeHistogram,
  describePie,
  describeBoxplot,
  PublicProduct,
} from "@/lib/stats";

import FrequencyTable from "@/components/analytics/FrequencyTable";
import BarCategoryChart from "@/components/analytics/BarCategoryChart";
import PriceHistogram from "@/components/analytics/PriceHistogram";
import CategoryDonutChart from "@/components/analytics/CategoryDonutChart";
import PriceBoxplot from "@/components/analytics/PriceBoxplot";

/* ===================== GUARD ADMIN (SSR) ===================== */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const token = ctx.req.cookies?.token || ctx.req.cookies?.session || "";
    if (!token) {
      return { redirect: { destination: "/login?next=/admin/analytics", permanent: false } };
    }

    const { getAuth, getFirestore } = await import("@/lib/firebaseAdmin");
    const adminAuth = getAuth();
    const db = getFirestore();

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = (decoded as any).uid as string | undefined;
    const email = (decoded as any).email as string | undefined;

    let isAdmin = (decoded as any).role === "admin" || (decoded as any).admin === true;

    if (!isAdmin && email) {
      const allow = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (allow.includes(email.toLowerCase())) isAdmin = true;
    }

    if (!isAdmin && uid) {
      try {
        const userDoc = await db.collection("users").doc(uid).get();
        const role = String((userDoc.data() as any)?.role || "").toLowerCase();
        if (role === "admin") isAdmin = true;
      } catch {}
    }

    if (!isAdmin) return { redirect: { destination: "/403", permanent: false } };
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login?next=/admin/analytics", permanent: false } };
  }
};
/* =================== END GUARD =================== */

/* =================== Helper =================== */
const fetchCsv = async <T,>(url: string): Promise<T[]> => {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();
  const parsed = Papa.parse<T>(text, { header: true, skipEmptyLines: true });
  return (parsed.data as any[]).filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""));
};

const fallbackData = {
  categories: [
    { id: "c1", name: "Makanan" },
    { id: "c2", name: "Minuman" },
    { id: "c3", name: "Kerajinan" },
  ] as CategoryCsv[],
  shops: [
    { uid: "u1", shopName: "Toko Sari" },
    { uid: "u2", shopName: "Kedai Segar" },
  ] as ShopCsv[],
  products: [
    { id: "p1", name: "Keripik Singkong", price: "15000", category: "Makanan", ownerId: "u1" },
    { id: "p2", name: "Sambal Botol", price: "20000", category: "Makanan", ownerId: "u1" },
    { id: "p3", name: "Es Sirup", price: "10000", category: "Minuman", ownerId: "u2" },
    { id: "p4", name: "Anyaman Bambu", price: "80000", category: "Kerajinan", ownerId: "u1" },
  ] as ProductCsv[],
};

type LoadState = "idle" | "loading" | "ready" | "error";

// normalisasi visibility: kosong → public
const isPublic = (v: any) => {
  const s = String(v ?? "public").trim().toLowerCase();
  return ["public", "published", "visible", "true", "1"].includes(s);
};

// pembersih angka harga
const toPrice = (v: any) => {
  const num = Number(String(v ?? "").replace(/[^\d\-]/g, ""));
  return Number.isFinite(num) ? num : NaN;
};

// peta kategori: dukung id/slug/name (case-insensitive)
const buildCategoryMap = (cats: CategoryCsv[]) => {
  const map: Record<string, string> = {};
  cats.forEach((c) => {
    const id = String(c?.id ?? "").trim().toLowerCase();
    const name = String(c?.name ?? "").trim();
    const slug = String((c as any)?.slug ?? "").trim().toLowerCase();
    if (id) map[id] = name;
    if (slug) map[slug] = name;
    if (name) map[name.toLowerCase()] = name;
  });
  return map;
};

// >>> TIPE LOKAL
type ProductWithVisibility = PublicProduct & { visibility?: string | null };

/* =================== Halaman =================== */
const AnalyticsPage: NextPage = () => {
  const [state, setState] = useState<LoadState>("idle");
  const [productsRaw, setProductsRaw] = useState<ProductCsv[]>([]);
  const [shops, setShops] = useState<ShopCsv[]>([]);
  const [categories, setCategories] = useState<CategoryCsv[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setState("loading");
      try {
        const [p, s, c] = await Promise.all([
          fetchCsv<ProductCsv>("/api/admin/export-products-csv"),
          fetchCsv<ShopCsv>("/api/toko/export-shops-csv"),
          fetchCsv<CategoryCsv>("/api/export-categories-csv"),
        ]);

        if (!mounted) return;

        const normalizedProducts: ProductCsv[] = (p.length ? p : fallbackData.products).map((row: any) => ({
          ...row,
          visibility: row?.visibility ?? "public",
        }));

        setProductsRaw(normalizedProducts);
        setShops(s.length ? s : fallbackData.shops);
        setCategories(c.length ? c : fallbackData.categories);
        setState("ready");
      } catch {
        if (!mounted) return;
        setProductsRaw(fallbackData.products);
        setShops(fallbackData.shops);
        setCategories(fallbackData.categories);
        setState("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Normalisasi kategori + transform produk
  const categoriesMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const productsAll: ProductWithVisibility[] = useMemo(() => {
    const labelUnknown = "Tanpa Kategori";
    const src = productsRaw.length ? productsRaw : fallbackData.products;
    return src.map((p: any) => {
      const catRaw = String(p?.category ?? "").trim().toLowerCase();
      const catName = categoriesMap[catRaw] || String(p?.category ?? "").trim() || labelUnknown;
      return {
        id: String(p?.id ?? ""),
        name: String(p?.name ?? ""),
        price: toPrice(p?.price),
        category: catName,
        ownerId: String(p?.ownerId ?? p?.shopId ?? ""),
        visibility: String(p?.visibility ?? "public"),
      } as ProductWithVisibility;
    });
  }, [productsRaw, categoriesMap]);

  // Produk dengan harga valid
  const productsWithPrice: ProductWithVisibility[] = useMemo(
    () => productsAll.filter((p) => Number.isFinite(p.price) && p.price >= 0),
    [productsAll]
  );

  /* =================== KPI =================== */
  const totalUMKM = shops.length;
  const totalProduk = productsAll.filter((p) => isPublic(p.visibility)).length;
  const totalKategori = categories.length;

  /* =================== Agregasi =================== */
  const freqRows = useMemo(() => {
    const publicOnly = productsAll.filter((p) => isPublic(p.visibility));
    const counts = countBy(publicOnly, (p) => p.category);
    Object.keys(counts).forEach((k) => !counts[k] && delete counts[k]);
    return toFrequencyRows(counts);
  }, [productsAll]);

  const bins = useMemo(() => histogram(productsWithPrice.map((p) => p.price), 10), [productsWithPrice]);
  const boxes = useMemo(() => boxplotByCategory(productsWithPrice), [productsWithPrice]);

  /* =================== Narasi =================== */
  const freqText = useMemo(() => describeFrequency(freqRows), [freqRows]);
  const barText = freqText;
  const pieText = useMemo(() => describePie(freqRows), [freqRows]);
  const histText = useMemo(() => describeHistogram(bins), [bins]);
  const boxText = useMemo(() => describeBoxplot(boxes), [boxes]);

  const isLoading = state === "loading";

  return (
    <AdminLayout /* opsional: bisa beri prop active="analytics" kalau layout mendukung */>
      <Head>
        <title>Admin Analytics | UMKM Randudongkal</title>
      </Head>

      {/* Tema terang */}
      <main className="mx-auto max-w-[1400px] px-6 py-8 space-y-8 bg-[#F8F9FA] min-h-screen text-[#333]">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Analitik Deskriptif UMKM Randudongkal</h1>
          <p className="text-sm text-[#333]/70 mt-1">
            Dashboard statistik dari data ekspor admin (produk, kategori, penjual). Visual rapi untuk presentasi sidang.
          </p>
        </motion.div>

        {/* KPI */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KpiCard icon={Store} label="Total Sellers" value={totalUMKM} loading={isLoading} />
          <KpiCard icon={Package} label="Total Produk (Public/Kosong)" value={totalProduk} loading={isLoading} />
          <KpiCard icon={Layers} label="Total Kategori" value={totalKategori} loading={isLoading} />
        </section>

        {/* Grid 2 kolom */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kiri: Bar + Tabel */}
          <div className="space-y-6">
            <BarCategoryChart
              title="Produk per Kategori"
              subtitle="Batang vertikal (ujung membulat) • Sumbu-X: Kategori • Sumbu-Y: Jumlah"
              data={freqRows}
              exportName="bar_produk_kategori.csv"
              loading={isLoading}
            />
            <FrequencyTable
              title="Tabel Frekuensi"
              subtitle="Diurutkan dari kategori dengan jumlah terbanyak"
              rows={freqRows}
              exportName="tabel_frekuensi_kategori.csv"
              loading={isLoading}
            />
          </div>

          {/* Kanan: Donut + Boxplot */}
          <div className="space-y-6">
            <CategoryDonutChart
              title="Proporsi Produk per Kategori"
              subtitle="Donut chart (persentase kontribusi tiap kategori)"
              data={freqRows}
              exportName="donut_kategori.csv"
              loading={isLoading}
            />
            <PriceBoxplot
              title="Boxplot Harga per Kategori"
              subtitle="Ringkasan lima angka: min, Q1, median, Q3, max"
              data={boxes}
              exportName="boxplot_harga_kategori.csv"
              height={380}
              loading={isLoading}
            />
          </div>
        </section>

        {/* Histogram lebar penuh */}
        <section>
          <PriceHistogram
            title="Distribusi Harga (Histogram)"
            subtitle="Bin lebar sama untuk memotret sebaran harga keseluruhan"
            bins={bins}
            exportName="histogram_harga.csv"
            loading={isLoading}
          />
        </section>

        {/* Narasi 2–4 kalimat */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <p className="text-sm text-[#333]/80">{barText}</p>
          <p className="text-sm text-[#333]/80">{pieText}</p>
          <p className="text-sm text-[#333]/80">{histText}</p>
          <p className="text-sm text-[#333]/80">{boxText}</p>
        </section>

        <p className="text-xs text-[#333]/60">
          Catatan: Produk dengan <i>visibility</i> kosong diperlakukan sebagai <b>public</b>. Harga non-numerik tidak
          diikutkan pada histogram/boxplot agar visual tetap representatif.
        </p>
      </main>
    </AdminLayout>
  );
};

/* =================== Komponen kecil =================== */
const KpiCard = ({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | string;
  icon: any;
  loading?: boolean;
}) => (
  <motion.div
    className="rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5 p-5"
    initial={{ opacity: 0, y: 6 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <div className="flex items-center gap-4">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4A90E2]/10 text-[#4A90E2] ring-1 ring-[#4A90E2]/20">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-medium tracking-wide text-[#333]/70">{label}</div>
        {loading ? (
          <div className="mt-1 h-7 w-28 bg-zinc-200 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-semibold mt-1">{value}</div>
        )}
      </div>
    </div>
  </motion.div>
);

export default AnalyticsPage;
