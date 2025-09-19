// LOKASI FILE: src/pages/admin/analytics.tsx
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Package, Store, Layers } from "lucide-react";

import {
  CategoryCsv,
  ShopCsv,
  ProductCsv,
  onlyPublicProducts,
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
import CategoryPieChart from "@/components/analytics/CategoryPieChart";
import PriceBoxplot from "@/components/analytics/PriceBoxplot";

// Admin SDK (server-side)
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";

/* ===================== GUARD ADMIN (SSR) ===================== */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const token = ctx.req.cookies?.token || ctx.req.cookies?.session || "";
    if (!token) {
      return { redirect: { destination: "/login?next=/admin/analytics", permanent: false } };
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = (decoded as any).uid as string | undefined;
    const email = (decoded as any).email as string | undefined;

    let isAdmin =
      (decoded as any).role === "admin" ||
      (decoded as any).admin === true;

    if (!isAdmin && email) {
      const allowlist = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (allowlist.includes(email.toLowerCase())) isAdmin = true;
    }

    if (!isAdmin && uid) {
      try {
        const userDoc = await adminFirestore.collection("users").doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data() as any;
          if (typeof data?.role === "string" && data.role.toLowerCase() === "admin") isAdmin = true;
        }
      } catch {}
    }

    if (!isAdmin && uid) {
      try {
        const admDoc = await adminFirestore.collection("admins").doc(uid).get();
        if (admDoc.exists && (admDoc.data() as any)?.enabled === true) isAdmin = true;
      } catch {}
    }

    if (!isAdmin) return { redirect: { destination: "/403", permanent: false } };
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login?next=/admin/analytics", permanent: false } };
  }
};
/* =================== END GUARD ADMIN (SSR) =================== */

// ---------- Fetch CSV di client ----------
const fetchCsv = async <T,>(url: string): Promise<T[]> => {
  const res = await fetch(url);
  const text = await res.text();
  const parsed = Papa.parse<T>(text, { header: true, skipEmptyLines: true });
  return (parsed.data as any[]).filter((r) =>
    Object.values(r).some((v) => String(v ?? "").trim() !== "")
  );
};

// ---------- Fallback sample ----------
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
    { id: "p1", name: "Keripik Singkong", price: "15000", category: "c1", ownerId: "u1", visibility: "public" },
    { id: "p2", name: "Sambal Botol", price: "20000", category: "c1", ownerId: "u1", visibility: "public" },
    { id: "p3", name: "Es Sirup", price: "10000", category: "c2", ownerId: "u2", visibility: "public" },
    { id: "p4", name: "Anyaman Bambu", price: "80000", category: "c3", ownerId: "u1", visibility: "public" },
  ] as ProductCsv[],
};

type LoadState = "idle" | "loading" | "ready" | "error";

const makeCategoriesMapLocal = (cats: CategoryCsv[]): Record<string, string> => {
  const map: Record<string, string> = {};
  cats.forEach((c) => {
    const id = (c.id ?? "").toString().trim();
    const name = (c.name ?? "").toString().trim();
    const slug = (c as any)?.slug ? String((c as any).slug).trim() : "";
    if (id) map[id] = name;
    if (slug) map[slug] = name;
    if (name) map[name] = name;
  });
  return map;
};

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

        // Opsi A: jika visibility tidak ada, anggap public
        const normalizedProducts: ProductCsv[] = (p.length ? p : fallbackData.products).map((row: any) => {
          const hasVis = row && typeof row.visibility !== "undefined" && String(row.visibility ?? "").trim() !== "";
          return { ...row, visibility: hasVis ? row.visibility : "public" };
        });

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
    return () => { mounted = false; };
  }, []);

  const categoriesMap = useMemo(() => makeCategoriesMapLocal(categories), [categories]);

  const products: PublicProduct[] = useMemo(
    () => onlyPublicProducts(productsRaw, categoriesMap),
    [productsRaw, categoriesMap]
  );

  // KPI
  const totalUMKM = shops.length;
  const totalProduk = products.length;
  const totalKategori = categories.length;

  // Agregasi
  const freqRows = useMemo(() => {
    const counts = countBy(products, (p) => p.category);
    Object.keys(counts).forEach((k) => !counts[k] && delete counts[k]);
    return toFrequencyRows(counts);
  }, [products]);

  const bins = useMemo(() => histogram(products.map((p) => p.price), 10), [products]);
  const boxes = useMemo(() => boxplotByCategory(products), [products]);

  // Narasi ringkas
  const freqText = useMemo(() => describeFrequency(freqRows), [freqRows]);
  const barText = freqText;
  const pieText = useMemo(() => describePie(freqRows), [freqRows]);
  const histText = useMemo(() => describeHistogram(bins), [bins]);
  const boxText = useMemo(() => describeBoxplot(boxes), [boxes]);

  const isLoading = state === "loading";

  return (
    <>
      <Head>
        <title>Admin Analytics | UMKM Randudongkal</title>
      </Head>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Analitik Deskriptif UMKM Randudongkal</h1>
          <p className="text-sm text-zinc-500 mt-1">Ringkasan statistik dari data ekspor dashboard (produk, kategori, penjual).</p>
        </motion.div>

        {/* KPI */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KpiCard icon={Store} label="Total UMKM (Penjual)" value={totalUMKM} loading={isLoading} />
          <KpiCard icon={Package} label="Total Produk (Public)" value={totalProduk} loading={isLoading} />
          <KpiCard icon={Layers} label="Total Kategori" value={totalKategori} loading={isLoading} />
        </section>

        {/* Tabel Frekuensi */}
        <section className="space-y-2">
          <FrequencyTable
            title="Tabel Frekuensi Produk per Kategori"
            subtitle="Urutan kategori dengan jumlah produk terbanyak (produk public)."
            rows={freqRows}
            exportName="tabel_frekuensi_kategori.csv"
            loading={isLoading}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{freqText}</p>
        </section>

        {/* Bar Chart */}
        <section className="space-y-2">
          <BarCategoryChart
            title="Produk per Kategori"
            subtitle="Sumbu-X: Kategori • Sumbu-Y: Jumlah Produk"
            data={freqRows}
            exportName="bar_produk_kategori.csv"
            loading={isLoading}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{barText}</p>
        </section>

        {/* Histogram */}
        <section className="space-y-2">
          <PriceHistogram
            title="Histogram Harga"
            subtitle="Distribusi harga produk berdasarkan rentang (bin) yang sama lebar"
            bins={bins}
            exportName="histogram_harga.csv"
            loading={isLoading}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{histText}</p>
        </section>

        {/* Pie */}
        <section className="space-y-2">
          <CategoryPieChart
            title="Proporsi Produk per Kategori"
            subtitle="Kontribusi relatif tiap kategori terhadap total produk public"
            data={freqRows}
            exportName="pie_kategori.csv"
            loading={isLoading}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{pieText}</p>
        </section>

        {/* Boxplot */}
        <section className="space-y-2">
          <PriceBoxplot
            title="Boxplot Harga per Kategori"
            subtitle="Ringkasan lima angka: minimum, Q1, median, Q3, maksimum"
            data={boxes}
            exportName="boxplot_harga_kategori.csv"
            height={380}
            loading={isLoading}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{boxText}</p>
        </section>

        <p className="text-xs text-zinc-500">
          Catatan: Jika kolom <code>visibility</code> tidak tersedia pada CSV, sistem menganggap semua produk bersifat publik.
        </p>
      </main>
    </>
  );
};

const KpiCard = ({
  label,
  value,
  icon: Icon,
  loading,
}: { label: string; value: number | string; icon: any; loading?: boolean }) => (
  <motion.div
    className="rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/70 dark:ring-zinc-800 shadow-sm transition hover:shadow-md p-5"
    initial={{ opacity: 0, y: 6 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <div className="flex items-center gap-3">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300 ring-1 ring-blue-100/70 dark:ring-blue-400/20">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
        {loading ? (
          <div className="mt-1 h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-semibold mt-1">{value}</div>
        )}
      </div>
    </div>
  </motion.div>
);

export default AnalyticsPage;
