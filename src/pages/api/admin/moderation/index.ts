// LOKASI: src/pages/api/admin/moderation/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

type Visibility = 'public' | 'hidden';
type ModerationStatus = 'pending' | 'approved' | 'hidden' | 'dismissed';

type ProductView = {
  name?: string;
  shopName?: string;
  imageUrl?: string;
  visibility?: Visibility;
};

type ModerationItem = {
  reportId: string;
  itemType: 'product';
  productId: string;
  reason: string;
  status: ModerationStatus;
  visibility: 'visible' | 'hidden';
  reportedAt: FirebaseFirestore.Timestamp | null;
  product?: ProductView;
};

function getToken(req: NextApiRequest): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.substring(7);
  // @ts-ignore
  const cookie = req.cookies?.token || null;
  return cookie || null;
}

function mapStatus(r: any): ModerationStatus {
  const raw = String(r?.status ?? 'pending').toLowerCase();
  if (raw === 'pending') return 'pending';
  if (raw === 'approved' || raw === 'hidden' || raw === 'dismissed') return raw;

  if (raw === 'resolved') {
    const res = String(r?.resolution ?? '').toLowerCase();
    if (res === 'approve') return 'approved';
    if (res === 'hide') return 'hidden';
    if (res === 'delete') return 'dismissed';
    return 'approved';
  }
  return 'pending';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  // no-cache untuk panel admin
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized: missing token' });

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const typeParam = String(req.query.type || 'product'); // sekarang fokus product
    const statusParam = String(req.query.status || 'pending').toLowerCase(); // pending|approved|hidden|dismissed|resolved|all
    const q = String(req.query.q || '').toLowerCase();
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '50'), 10)));

    // ambil batch terbaru (single-field index otomatis), urutkan reportedAt desc (fallback createdAt)
    let snap;
    try {
      snap = await db.collection('reports').orderBy('reportedAt', 'desc').limit(500).get();
    } catch {
      snap = await db.collection('reports').orderBy('createdAt', 'desc').limit(500).get();
    }

    // normalisasi → ModerationItem
    let items: ModerationItem[] = [];
    for (const d of snap.docs) {
      const r = d.data() as any;

      // jenis
      const rawType = String(r?.targetType ?? r?.itemType ?? r?.type ?? '').toLowerCase();
      const isProduct =
        rawType === 'product' ||
        !!(r?.targetId || r?.itemId || r?.productId || r?.product?.productId);
      if (typeParam === 'product' && !isProduct) continue;

      // productId dari berbagai bentuk (root & nested)
      const productId = String(
        r?.targetId ?? r?.itemId ?? r?.productId ?? r?.product?.productId ?? ''
      ).trim();
      if (!productId) continue;

      const it: ModerationItem = {
        reportId: d.id,
        itemType: 'product',
        productId,
        reason: String(r?.reason ?? ''),
        status: mapStatus(r),
        visibility: (String(r?.visibility ?? 'visible') === 'hidden' ? 'hidden' : 'visible'),
        reportedAt: (r?.reportedAt ?? r?.createdAt) || null,
        product: r?.product
          ? {
              name: r.product.name || '',
              shopName: r.product.shopName || '',
              imageUrl: r.product.imageUrl || '',
            }
          : undefined,
      };

      items.push(it);
    }

    // filter status
    if (statusParam !== 'all') {
      if (statusParam === 'resolved') {
        items = items.filter(
          (i) => i.status === 'approved' || i.status === 'hidden' || i.status === 'dismissed'
        );
      } else {
        items = items.filter((i) => i.status === statusParam);
      }
    }

    // perkaya dari koleksi products (untuk visibility/nama terkini)
    const productIds = Array.from(new Set(items.map((i) => i.productId))).slice(0, 100);
    if (productIds.length) {
      const productSnaps = await Promise.all(
        productIds.map((pid) => db.collection('products').doc(pid).get())
      );
      const productMap = new Map<string, ProductView>();
      for (const doc of productSnaps) {
        if (!doc.exists) continue;
        const p = doc.data() as any;
        productMap.set(doc.id, {
          name: p?.name || '',
          shopName: p?.shopName || '',
          imageUrl: p?.imageUrl || '',
          visibility: (p?.visibility === 'hidden' || p?.visible === false ? 'hidden' : 'public'),
        });
      }

      items.forEach((it) => {
        const pv = productMap.get(it.productId);
        // gabungkan: data report sebagai fallback, data product sebagai sumber utama
        it.product = {
          name: pv?.name ?? it.product?.name,
          shopName: pv?.shopName ?? it.product?.shopName,
          imageUrl: pv?.imageUrl ?? it.product?.imageUrl,
          visibility: pv?.visibility ?? it.product?.visibility,
        };
        if (it.product?.visibility === 'hidden') it.visibility = 'hidden';
      });
    }

    // pencarian teks
    const key = q.trim();
    if (key) {
      items = items.filter((i) => {
        const hay = `${i.product?.name || ''} ${i.product?.shopName || ''} ${i.reason || ''} ${i.productId} ${i.reportId}`.toLowerCase();
        return hay.includes(key);
      });
    }

    // urutkan lagi by reportedAt desc (null ke belakang)
    items.sort((a, b) => {
      const ta = a.reportedAt?.toMillis?.() ?? 0;
      const tb = b.reportedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });

    if (items.length > pageSize) items = items.slice(0, pageSize);

    return res.status(200).json({ items, total: items.length });
  } catch (e: any) {
    console.error('[moderation:list] error', e);
    if (e?.code === 'auth/argument-error' || e?.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
