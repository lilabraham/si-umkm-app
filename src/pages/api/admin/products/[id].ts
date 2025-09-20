// LOKASI FILE: src/pages/api/admin/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, getFirestore } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function getToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.substring(7);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookie = (req as any).cookies?.token || null;
  return cookie || null;
}

const isPublic = (v: any) => {
  const s = String(v ?? "public").trim().toLowerCase();
  return s === "public" || s === "published" || s === "visible" || s === "true" || s === "1";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const adminAuth = getAuth();
    const db = getFirestore();
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const ref = db.collection("products").doc(id);

    // =================== UPDATE ===================
    if (req.method === "PUT") {
      const { name, price, description, imageUrl, category } = req.body || {};
      const payload: Record<string, unknown> = {};
      if (typeof name === "string") payload.name = name;
      if (typeof price === "number" && !Number.isNaN(price)) payload.price = price;
      if (typeof description === "string") payload.description = description;
      if (typeof imageUrl === "string") payload.imageUrl = imageUrl;
      if (typeof category === "string") payload.category = category;

      await ref.update(payload);

      await db.collection("admin_logs").add({
        type: "product_update",
        productId: id,
        by: decoded.uid,
        at: FieldValue.serverTimestamp(),
        fields: Object.keys(payload),
      });

      return res.status(200).json({ ok: true });
    }

    // =================== DELETE (sinkron count) ===================
    if (req.method === "DELETE") {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) return;

        const data = snap.data() as any;
        const ownerId = data?.ownerId || data?.shopId || null;
        const visPublic = isPublic(data?.visibility);

        // hapus produk
        tx.delete(ref);

        // log
        const logRef = db.collection("admin_logs").doc();
        tx.set(logRef, {
          type: "product_delete",
          productId: id,
          by: decoded.uid,
          at: FieldValue.serverTimestamp(),
        });

        // kurangi productCount hanya jika produk dihitung (public/visibility kosong)
        if (ownerId && visPublic) {
          const userRef = db.collection("users").doc(String(ownerId));
          tx.update(userRef, { productCount: FieldValue.increment(-1) });
        }
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("/api/admin/products/[id] error", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
