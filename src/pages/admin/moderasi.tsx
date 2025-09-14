// LOKASI FILE: src/pages/admin/moderasi.tsx
import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useMemo, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/AdminLayout';
import nookies from 'nookies';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';
import { useAuth } from '@/context/AuthContext';
import { Search } from 'lucide-react';

type ReportItem = {
  id: string;
  targetType: 'product' | 'review';
  targetId: string;
  reason?: string;
  status?: 'pending' | 'resolved';
  createdAt?: { seconds: number; nanoseconds: number } | null;
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
    shopName?: string;
    category?: string;
    price?: number;
    visibility?: 'public' | 'hidden';
  } | null;
};

const ModerasiPage: NextPage = () => {
  const { currentUser } = useAuth();

  const [items, setItems] = useState<ReportItem[]>([]);
  const [type, setType] = useState<'all' | 'product'>('product'); // review belum diimplementasi server → default product
  const [status, setStatus] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [q, setQ] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string>('');

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const fetchReports = async () => {
    setLoading(true);
    setMsg('');
    try {
      const token = await currentUser?.getIdToken();
      const params = new URLSearchParams();
      params.set('type', type);
      params.set('status', status);
      if (q.trim()) params.set('q', q.trim());

      const res = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await res.json();
      if (res.ok) {
        setItems(Array.isArray(data.items) ? data.items : []);
        setSelected({});
      } else {
        setMsg(data?.error || 'Gagal memuat data.');
      }
    } catch (e: any) {
      setMsg(e?.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load awal
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilters = (e: FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) return setSelected({});
    const next: Record<string, boolean> = {};
    items.forEach((it) => (next[it.id] = true));
    setSelected(next);
  };

  const doAction = async (action: 'approve' | 'hide' | 'delete') => {
    if (!selectedIds.length) {
      setMsg('Pilih minimal satu report dulu.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch('/api/admin/reports/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Gagal eksekusi tindakan.');
      setMsg(`Berhasil ${action} ${data?.count ?? selectedIds.length} report.`);
      await fetchReports();
    } catch (e: any) {
      setMsg(e?.message || 'Gagal eksekusi tindakan.');
    } finally {
      setLoading(false);
    }
  };

  const fmtDateTime = (ts?: { seconds: number; nanoseconds: number } | null) =>
    ts?.seconds ? new Date(ts.seconds * 1000).toLocaleString('id-ID') : '-';

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10">
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800">Moderasi</h2>
        </motion.div>

        {/* Filter bar */}
        <form onSubmit={onApplyFilters} className="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative w-full md:w-96">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari alasan / nama produk / nama toko / ID…"
              className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'all' | 'product')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="product">Produk</option>
            <option value="all">Semua</option>
            {/* review belum didukung oleh API → nanti */}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'pending' | 'resolved')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="all">Semua</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Memuat…' : 'Terapkan'}
          </button>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => doAction('approve')}
              className="px-3 py-2 rounded-md text-sm font-semibold border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
              disabled={loading || !selectedIds.length}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => doAction('hide')}
              className="px-3 py-2 rounded-md text-sm font-semibold border border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
              disabled={loading || !selectedIds.length}
            >
              Sembunyikan
            </button>
            <button
              type="button"
              onClick={() => doAction('delete')}
              className="px-3 py-2 rounded-md text-sm font-semibold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
              disabled={loading || !selectedIds.length}
            >
              Hapus Produk
            </button>
          </div>
        </form>

        {msg && (
          <div className="mb-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
            {msg}
          </div>
        )}

        {/* Tabel */}
        <div className="rounded-xl shadow-md bg-white w-full border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => toggleAll(e.currentTarget.checked)}
                    aria-label="Pilih semua"
                  />
                </th>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Produk</th>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Alasan</th>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Visibility</th>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Status</th>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Dilaporkan</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={!!selected[r.id]}
                        onChange={(e) =>
                          setSelected((s) => ({ ...s, [r.id]: e.currentTarget.checked }))
                        }
                        aria-label={`Pilih report ${r.id}`}
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-800">
                      <div className="font-medium">{r.product?.name || r.targetId}</div>
                      <div className="text-gray-500 text-xs">{r.product?.shopName || '-'}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-700">
                      {r.reason || '-'}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${
                          (r.product?.visibility || 'public') === 'public'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {r.product?.visibility || 'public'}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${
                          (r.status || 'pending') === 'pending'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {r.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-600">
                      {fmtDateTime(r.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Tidak ada report untuk filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const cookies = nookies.get(ctx);
    const tokenStr = cookies.token || '';
    const adminAuth = getAuth();
    const db = getFirestore();

    const decoded = await adminAuth.verifyIdToken(tokenStr);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') {
      return { redirect: { destination: '/', permanent: false } };
    }
    return { props: {} };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default ModerasiPage;
