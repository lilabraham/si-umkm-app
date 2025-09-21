// LOKASI FILE : components/layout/AdminLayout.tsx

import { ReactNode, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  ShoppingCart,
  Tags,
  BarChart3,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}
type NavItem = { name: string; href: string; icon: any };

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  // ===== Nav items (4) + Logout di bawah =====
  const navItems: NavItem[] = useMemo(
    () => [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Manajemen Produk", href: "/admin/produk", icon: ShoppingCart },
      { name: "Kategori", href: "/admin/kategori", icon: Tags },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
    []
  );

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(href + "/");

  // ===== Collapsible state (persist) =====
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("capsuleCollapsed") === "1";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("capsuleCollapsed", collapsed ? "1" : "0");
    }
  }, [collapsed]);

  // ===== Auth =====
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const email = currentUser?.email || "admin@gmail.com";

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#1A202C]">
      <div className="flex">
        {/* ===================== SIDEBAR CAPSULE (Collapsible) ===================== */}
        <aside
          className={[
            "sticky top-0 h-screen shrink-0 px-2 py-4 transition-all duration-300",
            collapsed ? "w-20" : "w-64",
          ].join(" ")}
        >
          {/* Kapsul: gradient gelap + rounded ekstrem */}
          <div
            className={[
              "relative h-full w-full rounded-[28px] p-3",
              "bg-gradient-to-b from-[#1F2937] via-[#1B2331] to-[#251C51]",
              "shadow-[0_16px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/5",
              "flex flex-col",
            ].join(" ")}
          >
            {/* Toggle collapse di kanan-atas kapsul */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="absolute -right-3 top-5 grid h-7 w-7 place-items-center rounded-full bg-[#1F2937] text-slate-200 ring-1 ring-white/10 hover:bg-[#2D3748]"
              aria-label={collapsed ? "Perluas" : "Ciutkan"}
              title={collapsed ? "Perluas" : "Ciutkan"}
            >
              {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </button>

            {/* ===== Brand mini di paling atas ===== */}
            <div className="flex items-center gap-3 px-1 pt-1 pb-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <div className="grid grid-cols-2 gap-0.5">
                  <span className="h-2 w-2 rounded-sm bg-white/90" />
                  <span className="h-2 w-2 rounded-sm bg-white/60" />
                  <span className="h-2 w-2 rounded-sm bg-white/60" />
                  <span className="h-2 w-2 rounded-sm bg-white/90" />
                </div>
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-white font-extrabold leading-5">SI-UMKM</div>
                  <div className="text-[11px] text-white/60 -mt-0.5">Admin Panel</div>
                </div>
              )}
            </div>

            {/* ===== NAV GROUP: DIPOSISIKAN DI ATAS (bukan tengah) ===== */}
            <nav className="mt-1 flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const iconBase =
                  "h-6 w-6 transition-colors duration-200 ease-in-out";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    className={[
                      "group flex items-center rounded-2xl px-3 py-2",
                      "hover:bg-white/5 hover:ring-1 hover:ring-white/10",
                      active ? "bg-white/10 ring-1 ring-purple-400/30" : "",
                    ].join(" ")}
                    title={collapsed ? item.name : undefined}
                    aria-label={item.name}
                  >
                    <item.icon
                      className={
                        active
                          ? `${iconBase} text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]`
                          : `${iconBase} text-slate-300 group-hover:text-slate-100`
                      }
                    />
                    {!collapsed && (
                      <span
                        className={[
                          "ml-3 text-sm",
                          active ? "text-purple-200 font-semibold" : "text-slate-200",
                        ].join(" ")}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ===== Spacer yang besar agar ikon tetap di atas ===== */}
            <div className="flex-1" />

            {/* ===== Logout di dasar kapsul ===== */}
            <div className="mb-1">
              <button
                onClick={handleLogout}
                className={[
                  "flex items-center rounded-2xl px-3 py-2 text-slate-300",
                  "hover:text-white hover:bg-white/5 hover:ring-1 hover:ring-white/10",
                  collapsed ? "justify-center" : "",
                ].join(" ")}
                title={collapsed ? "Logout" : undefined}
                aria-label="Logout"
              >
                <LogOut className="h-6 w-6" />
                {!collapsed && <span className="ml-3 text-sm text-slate-200">Logout</span>}
              </button>

              {!collapsed && (
                <p className="mt-2 px-2 text-[11px] leading-4 text-white/50 truncate">
                  Masuk sebagai <span className="text-white/80">{email}</span>
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ===================== MAIN CONTENT ===================== */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
