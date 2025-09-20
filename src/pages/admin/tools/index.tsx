import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import AdminLayout from "@/components/layout/AdminLayout";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { getAuth, getFirestore } from "@/lib/firebaseAdmin";

type RunState = "idle" | "running" | "done" | "error";

const AdminToolsPage: NextPage = () => {
  const [backfillState, setBackfillState] = useState<RunState>("idle");
  const [recountState, setRecountState] = useState<RunState>("idle");
  const [log, setLog] = useState<string>("");

  const run = async (url: string, setter: (s: RunState) => void) => {
    try {
      setter("running");
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal menjalankan tugas");
      setLog(prev => `${prev}\n${url} → ${JSON.stringify(json)}`);
      setter("done");
    } catch (e: any) {
      setLog(prev => `${prev}\n${url} → ERROR: ${e?.message || e}`);
      setter("error");
    }
  };

  return (
    <AdminLayout>
      <Head><title>Admin Tools</title></Head>
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin Tools</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Backfill shopId</h2>
            <p className="text-sm text-slate-600">
              Mengisi <code>shopId = ownerId</code> untuk produk yang belum punya <code>shopId</code>.
            </p>
            <button
              onClick={() => run("/api/admin/tools/backfill-shopId", setBackfillState)}
              className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              disabled={backfillState === "running"}
            >
              {backfillState === "running" ? "Memproses…" : "Jalankan"}
            </button>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Recount productCount</h2>
            <p className="text-sm text-slate-600">
              Menghitung ulang jumlah produk public per toko dari koleksi <code>products</code>.
            </p>
            <button
              onClick={() => run("/api/admin/tools/recount-product-counts", setRecountState)}
              className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
              disabled={recountState === "running"}
            >
              {recountState === "running" ? "Memproses…" : "Jalankan"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Log</h3>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-slate-700">
            {log || "Belum ada output."}
          </pre>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const cookies = (ctx as any).req?.cookies || {};
    const token = cookies.token || cookies.session || "";
    if (!token) return { redirect: { destination: "/login", permanent: false } };

    const adminAuth = getAuth();
    const db = getFirestore();
    const decoded = await adminAuth.verifyIdToken(token);
    const snap = await db.collection("users").doc(decoded.uid).get();
    if (snap.data()?.role !== "admin") {
      return { redirect: { destination: "/", permanent: false } };
    }
    return { props: {} };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};

export default AdminToolsPage;
