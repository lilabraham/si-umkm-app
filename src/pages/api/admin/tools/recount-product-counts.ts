import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, getFirestore } from "@/lib/firebaseAdmin";

const isPublic = (v: any) => {
  const s = String(v ?? "public").trim().toLowerCase();
  return ["public","published","visible","true","1"].includes(s);
};

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

    const sellers = await db.collection("users").where("role","==","penjual").get();
    let updated = 0;

    for (const s of sellers.docs) {
      const uid = s.id;
      const [qOwner, qShop] = await Promise.all([
        db.collection("products").where("ownerId","==", uid).get(),
        db.collection("products").where("shopId","==", uid).get(),
      ]);
      const ids = new Set<string>();
      [qOwner, qShop].forEach(qs => qs.forEach(d => {
        const p = d.data() as any;
        if (isPublic(p?.visibility)) ids.add(d.id);
      }));
      await db.collection("users").doc(uid).update({ productCount: ids.size });
      updated++;
    }

    res.status(200).json({ updated });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Internal error" });
  }
}
