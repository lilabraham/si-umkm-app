import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, getFirestore } from "@/lib/firebaseAdmin";

function getToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return (req as any).cookies?.token || (req as any).cookies?.session || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const adminAuth = getAuth();
    const db = getFirestore();

    const decoded = await adminAuth.verifyIdToken(token);
    const me = await db.collection("users").doc(decoded.uid).get();
    if (me.data()?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const snap = await db.collection("products").get();
    let patched = 0; const batch = db.batch();
    snap.forEach((doc) => {
      const p = doc.data() as any;
      const ownerId = String(p?.ownerId || "").trim();
      const shopId = String(p?.shopId || "").trim();
      if (!shopId && ownerId) {
        batch.update(doc.ref, { shopId: ownerId });
        patched++;
      }
    });
    if (patched) await batch.commit();
    res.status(200).json({ patched });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "error" });
  }
}
