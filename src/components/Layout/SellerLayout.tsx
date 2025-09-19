import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ShoppingCart, User, LogOut, Home, Mail } from 'lucide-react';

interface SellerLayoutProps {
  children: ReactNode;
}

const SellerLayout = ({ children }: SellerLayoutProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const sidebarLinks = [
    { name: 'Manajemen Produk', href: '/dashboard', icon: ShoppingCart },
    { name: 'Profil Toko', href: '/dashboard/profil', icon: User },

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
              <h2 className="text-xl font-bold text-gray-800">Dashboard Penjual</h2>
              <p className="text-xs text-gray-500 truncate">{currentUser?.displayName || currentUser?.email}</p>
            </div>
            <nav className="flex flex-col space-y-2">
              {sidebarLinks.map(link => {
                const isActive = router.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
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
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="flex items-center gap-3">
                  <Home size={18} />
                  <span>Kembali ke Website</span>
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-800"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
