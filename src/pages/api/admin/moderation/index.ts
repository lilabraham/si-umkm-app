// LOKASI: src/pages/api/admin/moderation/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, getFirestore } from '@/lib/firebaseAdmin';

type ModerationItem = {
  reportId: string;
  itemType: 'product';
  productId: string;
  reason: string;
  status: 'pending' | 'approved' | 'hidden' | 'dismissed';
  visibility: 'visible' | 'hidden';
  reportedAt: FirebaseFirestore.Timestamp | null;
  // data tampilan
  product?: {
    name?: string;
    shopName?: string;
    imageUrl?: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // ===== auth admin =====
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const adminAuth = getAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // ===== filter dari query =====
    // type: 'product' | 'review' -> untuk sekarang fokus 'product'
    const type = (req.query.type as string) || 'product';
    const status = (req.query.status as string) || 'pending'; // pending|approved|hidden|all
    const q = ((req.query.q as string) || '').toLowerCase();
    const pageSize = Math.min(Number(req.query.pageSize || 50), 100);

    if (type !== 'product') {
      return res.status(200).json({ items: [], total: 0 });
    }

    // Struktur koleksi laporan:
    // collection: 'reports'
    // fields: { itemType: 'product', itemId: <productId>, reason, status, createdAt }
    let ref = db.collection('reports').where('itemType', '==', 'product') as FirebaseFirestore.Query;

    if (status !== 'all') {
      ref = ref.where('status', '==', status);
    }

    const snap = await ref.orderBy('createdAt', 'desc').limit(pageSize).get();

    const items: ModerationItem[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        reportId: d.id,
        itemType: 'product',
        productId: data.itemId,
        reason: data.reason || '',
        status: (data.status || 'pending') as ModerationItem['status'],
        visibility: 'visible',
        reportedAt: data.createdAt || null,
      };
    });

    // Ambil data produk untuk tampilan kolom
    const productIds = [...new Set(items.map((i) => i.productId))];
    if (productIds.length) {
      const productSnaps = await Promise.all(
        productIds.map((pid) => db.collection('products').doc(pid).get())
      );
      const productMap = new Map(
        productSnaps
          .filter((d) => d.exists)
          .map((d) => [
            d.id,
            {
              name: (d.data() as any)?.name || '',
              shopName: (d.data() as any)?.shopName || '',
              imageUrl: (d.data() as any)?.imageUrl || '',
              visible: (d.data() as any)?.visible !== false, // default true
            },
          ])
      );

      items.forEach((i) => {
        const p = productMap.get(i.productId);
        if (p) {
          i.product = { name: p.name, shopName: p.shopName, imageUrl: p.imageUrl };
          i.visibility = p.visible ? 'visible' : 'hidden';
        }
      });
    }

    // Pencarian ringan di server (nama produk / toko / alasan / id)
    const filtered = q
      ? items.filter((i) => {
          const text = `${i.product?.name || ''} ${i.product?.shopName || ''} ${
            i.reason || ''
          } ${i.productId} ${i.reportId}`.toLowerCase();
          return text.includes(q);
        })
      : items;

    return res.status(200).json({ items: filtered, total: filtered.length });
  } catch (e: any) {
    console.error('[moderation:list] error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
