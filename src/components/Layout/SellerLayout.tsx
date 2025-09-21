// LOKASI FILE: components/layout/SellerLayout.tsx
import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ShoppingCart,
  User,
  LogOut,
  Home,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface SellerLayoutProps {
  children: ReactNode;
}

type NavItem = { name: string; href: string; icon: any };

const SellerLayout = ({ children }: SellerLayoutProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  // ===== NAV ITEMS (tetap) =====
  const sidebarLinks: NavItem[] = useMemo(
    () => [
      { name: "Manajemen Produk", href: "/dashboard", icon: ShoppingCart },
      { name: "Profil Toko", href: "/dashboard/profil", icon: User },
    ],
    []
  );

  // ===== Collapse state (persist) =====
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sellerSidebarCollapsed") === "1";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sellerSidebarCollapsed", collapsed ? "1" : "0");
    }
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed((v) => !v);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(href + "/");

  const displayName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "Penjual";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* ===================== SIDEBAR CAPSULE ===================== */}
        <aside
          className={[
            // tinggi penuh + ada jarak dari top/bottom agar tidak nempel footer
            "my-4 ml-3 mr-4",
            "relative flex min-h-[calc(100vh-2rem)] flex-col",
            "transition-all duration-300 ease-in-out",
            collapsed ? "w-[88px]" : "w-[280px]",
            // kapsul + gradient gelap premium
            "rounded-[28px] bg-gradient-to-b from-[#111827] via-[#0f1a2a] to-[#1b1c3a]",
            "shadow-[0_20px_60px_rgba(2,6,23,0.35)] ring-1 ring-white/10",
            "text-slate-200",
          ].join(" ")}
        >
          {/* HEADER BRAND + TOGGLE */}
          <div className="relative px-4 pt-4 pb-2">
            <div className="flex items-center gap-3">
              {/* Badge 2x2 sebagai logo minimal */}
              <div
                className={[
                  "grid h-11 w-11 shrink-0 place-items-center",
                  "rounded-2xl bg-white/10 ring-1 ring-white/10",
                ].join(" ")}
              >
                <div className="grid grid-cols-2 gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-white/90" />
                  <span className="h-2.5 w-2.5 rounded-sm bg-white/50" />
                  <span className="h-2.5 w-2.5 rounded-sm bg-white/50" />
                  <span className="h-2.5 w-2.5 rounded-sm bg-white/90" />
                </div>
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold leading-5 text-white">
                    Dashboard Penjual
                  </div>
                  <div className="text-xs text-violet-300/80">{displayName}</div>
                </div>
              )}
            </div>

            {/* Toggle SELALU di dalam kapsul (kanan-atas), tidak menabrak */}
            <button
              onClick={toggleCollapse}
              aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
              title={collapsed ? "Perluas" : "Ciutkan"}
              className={[
                "absolute right-0 top-5 grid h-9 w-9 place-items-center",
                "rounded-full bg-[#0b1320]/90 text-slate-100",
                "ring-1 ring-white/10 shadow-md hover:bg-[#111a2a]",
                "transition-colors",
              ].join(" ")}
            >
              {collapsed ? (
                <ChevronsRight className="h-5 w-5" />
              ) : (
                <ChevronsLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* NAV GROUP (ikon di BAGIAN ATAS, tidak di tengah) */}
          <nav className="mt-3 flex flex-col gap-2 px-3">
            {sidebarLinks.map((link) => {
              const active = isActive(link.href);

              // Kartu compact saat collapsed: bulat, icon center
              if (collapsed) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={[
                      "group relative",
                      "grid h-12 w-12 place-items-center",
                      "rounded-2xl bg-white/5 ring-1 ring-white/10",
                      active ? "outline outline-1 outline-violet-400/60" : "",
                      "mx-auto", // ikon stack rapi di atas
                    ].join(" ")}
                  >
                    <link.icon
                      className={[
                        "h-[22px] w-[22px] stroke-[1.8]",
                        active ? "text-violet-300" : "text-slate-300 group-hover:text-white",
                      ].join(" ")}
                    />
                    {/* Tooltip saat hover */}
                    <span className="pointer-events-none absolute left-[64px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                      {link.name}
                    </span>
                  </Link>
                );
              }

              // Expanded: pill dengan icon + label
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={[
                    "group flex items-center gap-3 rounded-full px-4 py-3",
                    "bg-white/5 ring-1 ring-white/10",
                    "hover:bg-white/8 transition-colors",
                    active ? "outline outline-1 outline-violet-400/60" : "",
                  ].join(" ")}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <link.icon
                      className={[
                        "h-[20px] w-[20px] stroke-[1.8]",
                        active ? "text-violet-300" : "text-slate-300 group-hover:text-white",
                      ].join(" ")}
                    />
                  </span>
                  <span
                    className={[
                      "text-sm font-medium",
                      active ? "text-violet-200" : "text-slate-200",
                    ].join(" ")}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* FOOTER ACTIONS – diberi padding bawah besar agar tidak menempel footer */}
          <div className="mt-auto px-4 pb-6 pt-4">
            <div className="h-px w-full bg-white/10 mb-3" />
            {/* Kembali ke website */}
            <Link
              href="/"
              className={[
                "flex items-center gap-3 rounded-full px-4 py-2.5",
                "text-sm font-medium text-slate-200",
                "hover:bg-white/8 ring-1 ring-white/10",
                collapsed ? "justify-center" : "",
              ].join(" ")}
            >
              <Home className="h-5 w-5" />
              {!collapsed && <span>Kembali ke Website</span>}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={[
                "mt-2 inline-flex w-full items-center gap-3 rounded-full px-4 py-2.5",
                "text-sm font-semibold text-rose-300 hover:bg-rose-500/10",
                "ring-1 ring-white/10",
                collapsed ? "justify-center" : "",
              ].join(" ")}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ===================== MAIN CONTENT ===================== */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
