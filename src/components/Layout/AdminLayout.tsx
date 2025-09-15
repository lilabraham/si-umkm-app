import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LayoutDashboard, Users, ShoppingCart,  Inbox,Tags,GraduationCap, LogOut, Home } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Persetujuan Penjual', href: '/admin/persetujuan', icon: Users },
    { name: 'Manajemen Produk', href: '/admin/produk', icon: ShoppingCart },
    { name: 'Trainings', href: '/admin/pelatihan', icon: GraduationCap },
    { name: 'Moderasi', href: '/admin/moderasi', icon: Inbox },
    { name: 'Kategori', href: '/admin/kategori', icon: Tags },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 p-5 hidden md:block">
          <div className="flex flex-col h-full">
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
              <p className="text-xs text-gray-500">SI-UMKM</p>
            </div>
            <nav className="flex flex-col space-y-2">
              {sidebarLinks.map(link => {
                const isActive = router.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={false}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <link.icon size={18} />
                      <span>{link.name}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-200">
              {currentUser && (
                <div className="mb-2 px-4">
                  <p className="text-xs text-gray-500">Login sebagai</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.email}</p>
                </div>
              )}
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <span className="flex items-center gap-3">
                  <Home size={18} />
                  <span>Kembali ke Website</span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
