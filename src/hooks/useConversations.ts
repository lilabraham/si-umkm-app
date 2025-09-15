import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function useConversations(uid?: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(!!uid);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) { setItems([]); setLoading(false); return; }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid),
      orderBy('updatedAt', 'desc'),
      limit(30)
    );

    const unsub = onSnapshot(q,
      snap => {
        setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      err => {
        console.error('onSnapshot(conversations) error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  return { items, loading, error };
}
