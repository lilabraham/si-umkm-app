import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { HTMLAttributes, useMemo } from "react";

type Props = {
  phone?: string | null;           // nomor WA penjual (bisa "08..." atau "62...")
  productTitle?: string;           // opsional: nama produk untuk template pesan
  shopName?: string;               // opsional: nama toko untuk template pesan
} & HTMLAttributes<HTMLButtonElement>;

function normalizePhone(raw?: string | null): string | null {
  if (!raw) return null;
  // hapus semua karakter non-digit
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.substring(1);
  if (p.startsWith("0")) p = "62" + p.substring(1);
  if (!p.startsWith("62")) {
    // kalau sudah 62 biarkan, kalau tidak dan juga bukan 0, tetap pakai apa adanya
  }
  return p;
}

export default function ContactSellerButton({
  phone,
  productTitle,
  shopName,
  className = "",
  ...rest
}: Props) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const phoneNorm = useMemo(() => normalizePhone(phone), [phone]);

  const message = useMemo(() => {
    const base =
      productTitle
        ? `Halo, saya tertarik dengan produk "${productTitle}" di Si-UMKM. Apakah masih tersedia?`
        : `Halo, saya tertarik dengan produk di Si-UMKM. Apakah masih tersedia?`;
    return encodeURIComponent(base);
  }, [productTitle]);

  const handleClick = () => {
    // 1) Belum login -> arahkan ke /login?next=<path-sekarang>
    if (!currentUser) {
      const next = encodeURIComponent(router.asPath || "/");
      router.push(`/login?next=${next}`);
      return;
    }
    // 2) Sudah login -> buka WhatsApp
    if (!phoneNorm) {
      alert("Nomor WhatsApp penjual belum tersedia.");
      return;
    }
    const url = `https://wa.me/${phoneNorm}?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 font-semibold text-white shadow-sm hover:brightness-95 active:brightness-90 " +
        className
      }
      {...rest}
    >
      {/* kamu bisa ganti dengan ikon WhatsApp-mu sendiri */}
      <span className="text-base">💬</span>
      <span>Hubungi Penjual via WhatsApp</span>
    </button>
  );
}
