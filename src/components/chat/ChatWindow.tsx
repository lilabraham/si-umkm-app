// LOKASI FILE: src/components/chat/ChatWindow.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Send, Lock, Unlock } from 'lucide-react';

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
};

type Conversation = {
  isOpen: boolean;
  lastMessage?: string;
  lastMessageAt?: any;
  createdAt?: any;
  updatedAt?: any;
  participants?: string[];
  sellerId?: string;
};

interface ChatWindowProps {
  conversationId: string;       // == sellerUid
  meUid: string;                // currentUser.uid
  isAdmin: boolean;             // true jika admin
  headerTitle?: string;         // judul di header
  autoCreateIfMissing?: boolean; // untuk penjual: true
}

const ChatWindow = ({
  conversationId,
  meUid,
  isAdmin,
  headerTitle,
  autoCreateIfMissing = false,
}: ChatWindowProps) => {
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // auto scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  /** 1) Pastikan room ada → baru listen */
  useEffect(() => {
    setErr(null);
    const ref = doc(db, 'conversations', conversationId);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          if (autoCreateIfMissing) {
            try {
              await setDoc(
                doc(db, 'conversations', conversationId), // id = sellerUid
                {
                  sellerId: conversationId,                 // WAJIB agar rules lolos utk seller
                  participants: [conversationId, 'admin'],  // opsional; cukup bantu query seller
                  isOpen: true,
                  lastMessage: '',
                  lastMessageAt: serverTimestamp(),
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            } catch (e: any) {
              setErr(e?.message || 'Gagal membuat percakapan.');
            }
          }
          setConv(null);
          setLoading(false);
          return;
        }
        setConv(snap.data() as Conversation);
        setLoading(false);
      },
      (e) => {
        console.error('conv onSnapshot error:', e);
        setErr(e?.message || 'Gagal memuat percakapan.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [conversationId, autoCreateIfMissing]);

  /** 2) Listen pesan */
  useEffect(() => {
    setErr(null);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Message[] = [];
        snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as any) }));
        setMessages(arr);
      },
      (e) => {
        setErr(e?.message || 'Gagal memuat pesan.');
      }
    );
    return () => unsub();
  }, [conversationId]);

  const canSend = useMemo(
    () => !!input.trim() && conv?.isOpen !== false,
    [input, conv]
  );

  const sendMessage = async () => {
    if (!canSend) return;
    setSending(true);
    setErr(null);
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      // 1) tambah pesan
      await addDoc(messagesRef, {
        senderId: meUid,
        text: input.trim(),
        createdAt: serverTimestamp(),
      });
      // 2) update metadata conversation
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: input.trim(),
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setInput('');
    } catch (e: any) {
      setErr(e?.message || 'Gagal mengirim pesan.');
    } finally {
      setSending(false);
    }
  };

  const toggleOpen = async () => {
    if (!isAdmin || !conv) return;
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        isOpen: !conv.isOpen,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      setErr(e?.message || 'Gagal mengubah status percakapan.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Memuat percakapan…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white border rounded-xl overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div className="font-semibold text-slate-800">
          {headerTitle || `Chat dengan Admin`}
        </div>
        {isAdmin && (
          <button
            onClick={toggleOpen}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
              conv?.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {conv?.isOpen ? (<><Unlock size={14} /> Open</>) : (<><Lock size={14} /> Closed</>)}
          </button>
        )}
      </div>

      {/* ERROR BAR */}
      {err && (
        <div className="px-4 py-2 text-xs text-red-600">
          Gagal memuat percakapan: {err}
        </div>
      )}

      {/* LIST PESAN */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => {
          const mine = m.senderId === meUid;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  mine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {!messages.length && (
          <p className="text-center text-sm text-slate-500 mt-8">Belum ada pesan.</p>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t p-3 bg-white">
        {conv?.isOpen === false && !isAdmin ? (
          <div className="text-center text-sm text-slate-500">
            Percakapan ditutup oleh admin.
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === 'Enter' ? sendMessage() : null)}
              placeholder="Tulis pesan…"
              className="flex-1 border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!canSend || sending}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-60"
            >
              <Send size={16} /> Kirim
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
