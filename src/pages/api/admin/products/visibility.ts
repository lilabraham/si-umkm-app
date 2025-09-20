// LOKASI FILE: src/pages/api/admin/products/visibility.ts
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

const normVis = (v: any) => (String(v ?? "public").trim().toLowerCase());
const isPublic = (v: any) => {
  const s = normVis(v);
  return s === "public" || s === "published" || s === "visible" || s === "true" || s === "1";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const adminAuth = getAuth();
    const db = getFirestore();

    const decoded = await adminAuth.verifyIdToken(token);
    const me = await db.collection("users").doc(decoded.uid).get();
    if (me.data()?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const { productIds, visibility } = req.body || {};
    if (!Array.isArray(productIds) || !productIds.length) {
      return res.status(400).json({ error: "productIds kosong" });
    }
    const newVis = normVis(visibility);

    for (const id of productIds) {
      const ref = db.collection("products").doc(String(id));
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) return;
        const before = snap.data() as any;
        const prevPublic = isPublic(before?.visibility);
        const nextPublic = isPublic(newVis);

        if (prevPublic === nextPublic) {
          // cuma update visibility tanpa dampak count
          tx.update(ref, { visibility: newVis });
          return;
        }

        // update visibility
        tx.update(ref, { visibility: newVis });

        // adjust count
        const ownerId = before?.ownerId || before?.shopId;
        if (ownerId) {
          const userRef = db.collection("users").doc(String(ownerId));
          const delta = nextPublic ? +1 : -1;
          tx.update(userRef, { productCount: FieldValue.increment(delta) });
        }
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("/api/admin/products/visibility error", e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}
