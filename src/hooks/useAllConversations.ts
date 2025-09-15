import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function useAllConversations(pageSize = 50) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'conversations'),
      orderBy('updatedAt', 'desc'),
      limit(pageSize)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      (err) => {
        console.error('onSnapshot(all conversations) error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [pageSize]);

  return { items, loading, error };
}
