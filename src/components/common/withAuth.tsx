// LOKASI FILE: src/components/common/withAuth.tsx

import { useRouter } from 'next/router';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ComponentType, useEffect } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: UserRole[]
) => {
  const AuthComponent = (props: P) => {
    const { currentUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!currentUser) {
          // Jika tidak ada user setelah loading selesai, tendang ke login
          router.replace('/login');
        } else if (!allowedRoles.includes(currentUser.role)) {
          // Jika peran tidak sesuai, tendang ke halaman utama
          router.replace('/');
        }
      }
    }, [currentUser, loading, router, allowedRoles]);

    // Selama loading atau jika user tidak valid (akan segera di-redirect oleh useEffect),
    // tampilkan layar loading untuk mencegah kedipan konten yang salah.
    if (loading || !currentUser || !allowedRoles.includes(currentUser.role)) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }

    // Jika semua pengecekan lolos, tampilkan halaman yang sebenarnya
    return <WrappedComponent {...props} />;
  };
  return AuthComponent;
};

export default withAuth;