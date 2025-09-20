// LOKASI FILE: src/pages/api/toko/export-shops-csv.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nookies from "nookies";

const isPublic = (v: any) => {
  const s = String(v ?? "public").trim().toLowerCase();
  return s === "public" || s === "published" || s === "visible" || s === "true" || s === "1";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = nookies.get({ req });
    const tokenStr = cookies.token || "";

    const { getAuth, getFirestore } = await import("@/lib/firebaseAdmin");
    const adminAuth = getAuth();
    const db = getFirestore();

    const decoded = await adminAuth.verifyIdToken(tokenStr);
    const me = await db.collection("users").doc(decoded.uid).get();
    if (me.data()?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const snap = await db.collection("users").where("role", "==", "penjual").get();

    const headers = ["uid","displayName","shopName","email","whatsapp","productCount","createdAt"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const rows: string[] = [headers.join(",")];

    for (const d of snap.docs) {
      const u: any = d.data();
      const createdAt = u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : "";

      // union ownerId/shopId
      const [qOwner, qShop] = await Promise.all([
        db.collection("products").where("ownerId", "==", d.id).get(),
        db.collection("products").where("shopId", "==", d.id).get(),
      ]);

      const ids = new Set<string>();
      const collect = (qs: FirebaseFirestore.QuerySnapshot) =>
        qs.forEach((pd) => {
          const pv = pd.data() as any;
          if (isPublic(pv?.visibility)) ids.add(pd.id);
        });
      collect(qOwner);
      collect(qShop);

      rows.push([
        esc(d.id),
        esc(u.displayName),
        esc(u.shopName),
        esc(u.email),
        esc(u.whatsapp),
        esc(ids.size),
        esc(createdAt),
      ].join(","));
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="shops_export.csv"');
    res.status(200).send(rows.join("\r\n"));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to export shops" });
  }
}
