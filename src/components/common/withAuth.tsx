// LOKASI FILE: src/components/common/withAuth.tsx

import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ComponentType, useEffect } from 'react';

// Izinkan string bebas agar kompatibel dengan enum/union di Context
type AllowedRole = 'admin' | 'penjual' | 'pembeli' | (string & {});

const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: AllowedRole[]
) => {
  const AuthComponent = (props: P) => {
    // ⬇️ PENTING: ambil userRole dari AuthContext (BUKAN currentUser.role)
    const { currentUser, loading, userRole } = useAuth();
    const router = useRouter();

    const roleResolved = userRole !== null && userRole !== undefined;

    useEffect(() => {
      // 1) Jangan lakukan apa pun selama loading
      if (loading) return;

      // 2) Jika tidak login, baru redirect ke /login
      if (!currentUser) {
        router.replace('/login');
        return;
      }

      // 3) Jika login tapi role belum selesai diambil dari Firestore, TUNGGU
      if (!roleResolved) return;

      // 4) Jika role sudah ada & tidak diizinkan → redirect ke Home
      if (!allowedRoles.includes(userRole as AllowedRole)) {
        router.replace('/');
      }
    }, [currentUser, loading, roleResolved, userRole, router, allowedRoles]);

    // Tampilkan layar loading selama:
    // - masih loading
    // - belum login
    // - sudah login tapi role belum resolved (mencegah redirect dini)
    if (loading || !currentUser || !roleResolved) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }

    // Jika role resolved & tidak termasuk allowedRoles, komponen akan segera di-redirect oleh effect di atas.
    // Untuk mencegah flicker konten, tetap tampilkan spinner tipis.
    if (!allowedRoles.includes(userRole as AllowedRole)) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }

    // Lolos semua pengecekan
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
