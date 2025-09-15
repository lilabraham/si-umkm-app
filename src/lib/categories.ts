// LOKASI: src/lib/categories.ts
export type Category = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
};

export async function fetchCategories(params?: { q?: string; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.limit) search.set('limit', String(params.limit));

  const resp = await fetch(`/api/categories${search.toString() ? `?${search}` : ''}`, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-store' },
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || `Failed ${resp.status}`);
  }
  const json = await resp.json();
  const items = Array.isArray(json?.items) ? json.items : [];
  // normalisasi minimal
  return items.map((c: any) => ({
    id: String(c?.id || ''),
    name: String(c?.name || ''),
    slug: String(c?.slug || ''),
    iconUrl: c?.iconUrl ? String(c.iconUrl) : null,
  })) as Category[];
}

// Hook ringan untuk form React
import { useEffect, useState } from 'react';
export function useCategories(q?: string) {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        const items = await fetchCategories({ q, limit: 200 });
        if (!aborted) setData(items);
      } catch (e: any) {
        if (!aborted) setError(e?.message || 'Gagal memuat kategori');
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [q]);

  return { data, loading, error };
}
