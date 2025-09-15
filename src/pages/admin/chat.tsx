// LOKASI FILE: src/pages/admin/chat.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import ChatWindow from '@/components/chat/ChatWindow';
import withAuth from '@/components/common/withAuth';
import { Loader2, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
// ⛔️ HAPUS: import { useConversations } from '@/hooks/useConversations';

type Row = {
  id: string;           // == conversationId (sellerUid)
  isOpen: boolean;
  lastMessage?: string;
  lastMessageAt?: any;
};

const AdminChatPage: NextPage = () => {
  const { currentUser } = useAuth();

  // ⛔️ HAPUS: const { items: conversations, error } = useConversations(currentUser?.uid);

  const [rows, setRows] = useState<Row[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Subscribe list room sekali saja (tidak bergantung activeId)
  useEffect(() => {
    const ref = collection(db, 'conversations');
    const q = query(ref, orderBy('lastMessageAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Row[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          arr.push({
            id: d.id,
            isOpen: data?.isOpen !== false,
            lastMessage: data?.lastMessage || '',
            lastMessageAt: data?.lastMessageAt,
          });
        });
        setRows(arr);
        setLoading(false);

        // ✅ Set default active hanya kalau belum ada (pakai functional setState agar tidak stale)
        setActiveId((prev) => prev ?? (arr[0]?.id ?? null));
      },
      (err) => {
        console.error('chat list subscribe error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []); // ⬅️ kosong

  const open = useMemo(() => rows.filter((r) => r.isOpen), [rows]);
  const closed = useMemo(() => rows.filter((r) => !r.isOpen), [rows]);

  const closeRoom = async (id: string, currentlyClosed: boolean) => {
    // toggle
    await updateDoc(doc(db, 'conversations', id), { isOpen: currentlyClosed });
  };

  return (
    <AdminLayout>
      <Head><title>Admin Chat - SI-UMKM</title></Head>
      <div className="p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <aside className="bg-white border rounded-xl p-4 h-[70vh] overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Percakapan (Open)</h2>
          {loading ? (
            <div className="flex items-center text-slate-500"><Loader2 className="animate-spin mr-2" /> Memuat…</div>
          ) : (
            <>
              <ul className="space-y-2 mb-6">
                {open.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setActiveId(r.id)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        activeId === r.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <MessageSquare size={16} className="text-emerald-600" />
                          {r.id}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); closeRoom(r.id, false); }}
                          className="text-xs inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded"
                          title="Tutup"
                        >
                          <XCircle size={12} /> Close
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{r.lastMessage || '—'}</p>
                    </button>
                  </li>
                ))}
              </ul>

              <h2 className="text-sm font-semibold text-slate-700 mb-2">Closed</h2>
              <ul className="space-y-2">
                {closed.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setActiveId(r.id)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        activeId === r.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <MessageSquare size={16} className="text-slate-400" />
                          {r.id}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); closeRoom(r.id, true); }}
                          className="text-xs inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded"
                          title="Buka kembali"
                        >
                          <CheckCircle2 size={12} /> Reopen
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{r.lastMessage || '—'}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        {/* Room */}
        <section className="lg:col-span-2">
          {activeId ? (
            <ChatWindow
              conversationId={activeId}
              meUid={currentUser!.uid}
              isAdmin={true}
              headerTitle={`Seller: ${activeId}`}
            />
          ) : (
            <div className="h-[70vh] flex items-center justify-center bg-white border rounded-xl">
              <p className="text-slate-500">Pilih percakapan di sebelah kiri.</p>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default withAuth(AdminChatPage, ['admin']);
