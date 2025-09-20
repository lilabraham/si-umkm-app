// LOKASI FILE : components/layout/AdminLayout.tsx

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  ShoppingCart,
  Tags,
  LogOut,
  Home,
  ChartBar,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

type NavItem = { name: string; href: string; icon: any };

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const sidebarLinks: NavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manajemen Produk", href: "/admin/produk", icon: ShoppingCart },
    { name: "Kategori", href: "/admin/kategori", icon: Tags },
    { name: "Analytics", href: "/admin/analytics", icon: ChartBar },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const email = currentUser?.email || "admin@gmail.com";
  const avatar = currentUser?.photoURL;

  const Initial = () => (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[11px] font-semibold text-slate-700">
      {email?.[0]?.toUpperCase() || "A"}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#333]">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r border-black/5 ring-1 ring-black/5 shadow-sm p-6 hidden md:flex md:flex-col">
          {/* Logo / Brand */}
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
            <p className="text-xs text-[#333]/60">SI-UMKM</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = router.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={false}
                  className={`relative group flex items-center gap-3 pl-4 pr-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#3B82F6] bg-[#EFF6FF]"
                      : "text-[#333]/80 hover:bg-[#F7F8FC]"
                  }`}
                >
                  {/* Indikator aktif: pill biru di kiri */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-r-full transition-all ${
                      isActive ? "bg-[#3B82F6]" : "bg-transparent"
                    }`}
                  />
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer user */}
          <div className="mt-auto pt-5 border-t border-black/5">
            <div className="flex items-center gap-3 px-1 mb-2">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-black/5"
                />
              ) : (
                <Initial />
              )}
              <div>
                <p className="text-xs text-[#333]/60">Masuk sebagai</p>
                <p className="text-sm font-semibold truncate max-w-[160px]">{email}</p>
              </div>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium text-[#333]/80 hover:bg-[#F7F8FC]"
            >
              <Home size={18} />
              <span>Kembali ke Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
