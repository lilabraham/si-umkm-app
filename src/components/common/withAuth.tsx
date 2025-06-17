// src/components/common/withAuth.tsx

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ComponentType } from 'react';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthWrapper = (props: P) => {
    // Ambil currentUser dan juga loading dari context
    const { currentUser, loading } = useAuth(); 
    const router = useRouter();

    useEffect(() => {
      // Jangan lakukan apa-apa selagi status auth masih loading
      if (loading) {
        return;
      }
      
      // Jika loading sudah selesai dan TIDAK ADA user, baru redirect
      if (!currentUser) {
        router.push('/login');
      }
    }, [currentUser, loading, router]); // Tambahkan loading sebagai dependency

    // Selagi loading, tampilkan pesan atau spinner
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <p>Memeriksa autentikasi...</p>
        </div>
      );
    }

    // Jika loading selesai dan ada user, tampilkan halaman yang diminta
    if (currentUser) {
      return <WrappedComponent {...props} />;
    }

    // fallback jika terjadi kondisi aneh
    return null; 
  };

  return AuthWrapper;
};

export default withAuth;
