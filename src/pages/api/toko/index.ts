// src/pages/api/toko/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '@/lib/firebaseAdmin';

type Shop = {
  uid: string;
  shopName: string;
  description?: string;
  whatsapp?: string;
  email?: string;
  shopImageUrl?: string;
  displayName?: string;
  productCount?: number;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

async function getProductCountByOwner(ownerId: string): Promise<number> {
  const db = getFirestore();

  // denormalisasi di users (kalau ada)
  const userSnap = await db.collection('users').doc(ownerId).get();
  const denorm = (userSnap.data() as any)?.productCount;
  if (typeof denorm === 'number' && denorm >= 0) return denorm;

  // aggregation count() bila tersedia
  try {
    // @ts-ignore
    const q = db.collection('products').where('ownerId', '==', ownerId);
    // @ts-ignore
    if (typeof (q as any).count === 'function') {
      // @ts-ignore
      const agg = await (q as any).count().get();
      // @ts-ignore
      return agg.data()?.count ?? 0;
    }
  } catch { /* ignore */ }

  // fallback manual
  const snap = await db.collection('products').where('ownerId', '==', ownerId).get();
  return snap.size;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const db = getFirestore();
    const { tokoId, q, page = '1', pageSize = '20' } = req.query as {
      tokoId?: string; q?: string; page?: string; pageSize?: string;
    };

    // ===== detail toko
    if (tokoId) {
      const doc = await db.collection('users').doc(tokoId).get();
      if (!doc.exists) return res.status(404).json({ error: 'Toko tidak ditemukan' });

      const data = doc.data() as any;
      const item: Shop = {
        uid: doc.id,
        shopName: data.shopName || data.displayName || '',
        description: data.description || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        shopImageUrl: data.shopImageUrl || '',
        displayName: data.displayName || '',
        createdAt: data.createdAt?.seconds
          ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds }
          : null,
        productCount: await getProductCountByOwner(doc.id),
      };
      return res.status(200).json(item);
    }

    // ===== dari users ber-role penjual
    const usersSnap = await db.collection('users').where('role', '==', 'penjual').get();
    let items: Shop[] = usersSnap.docs.map((d) => {
      const data = d.data() as any;
      return {
        uid: d.id,
        shopName: data.shopName || data.displayName || '',
        description: data.description || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        shopImageUrl: data.shopImageUrl || '',
        displayName: data.displayName || '',
        createdAt: data.createdAt?.seconds
          ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds }
          : null,
        productCount: typeof data.productCount === 'number' ? data.productCount : undefined,
      };
    });

    // filter q
    if (q && q.trim()) {
      const s = q.trim().toLowerCase();
      items = items.filter(
        (it) =>
          it.shopName?.toLowerCase().includes(s) ||
          it.displayName?.toLowerCase().includes(s) ||
          it.email?.toLowerCase().includes(s)
      );
    }

    // isi productCount yg belum ada
    const needCounts = items.map((it, idx) => ({ it, idx })).filter(({ it }) => typeof it.productCount !== 'number');
    if (needCounts.length > 0) {
      const counts = await Promise.all(needCounts.map(({ it }) => getProductCountByOwner(it.uid)));
      needCounts.forEach(({ idx }, i) => { items[idx].productCount = counts[i] ?? 0; });
    }

    // ===== fallback dari products kalau masih kosong
    if (items.length === 0) {
      const prodSnap = await db.collection('products').limit(500).get();
      const byOwner = new Map<string, number>();
      prodSnap.docs.forEach((p) => {
        const d = p.data() as any;
        const ownerId = String(d.ownerId || '');
        if (!ownerId) return;
        byOwner.set(ownerId, (byOwner.get(ownerId) ?? 0) + 1);
      });

      const ownerIds = Array.from(byOwner.keys());
      if (ownerIds.length) {
        const userDocs = await Promise.all(ownerIds.map((uid) => db.collection('users').doc(uid).get()));
        items = userDocs
          .filter((ud) => ud.exists)
          .map((ud) => {
            const data = ud.data() as any;
            return {
              uid: ud.id,
              shopName: data?.shopName || data?.displayName || '',
              description: data?.description || '',
              whatsapp: data?.whatsapp || '',
              email: data?.email || '',
              shopImageUrl: data?.shopImageUrl || '',
              displayName: data?.displayName || '',
              createdAt: data?.createdAt?.seconds
                ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds }
                : null,
              productCount: byOwner.get(ud.id) ?? 0,
            } as Shop;
          });
      }
    }

    // urutkan
    items.sort((a, b) => {
      const c = (b.productCount ?? 0) - (a.productCount ?? 0);
      if (c !== 0) return c;
      return (a.shopName || '').localeCompare(b.shopName || '');
    });

    // pagination
    const p = Math.max(1, parseInt(page || '1', 10));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize || '20', 10)));
    const start = (p - 1) * ps;
    const paged = items.slice(start, start + ps);

    // multi bentuk untuk kompatibilitas FE lama
    return res.status(200).json({
      total: items.length,
      page: p,
      pageSize: ps,
      items: paged,
      shops: paged,
      data: paged,
    });
  } catch (e) {
    console.error('[GET /api/toko] Error:', e);
    return res.status(500).json({ error: 'Failed to fetch shops' });
  }
}
