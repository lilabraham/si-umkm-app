// src/context/AuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // <-- BARU: Impor untuk ambil data dari Firestore
import { auth, db } from '../lib/firebase'; // <-- BARU: Impor 'db' dari konfigurasi firebase Anda

// BARU: Definisikan tipe peran yang valid
export type UserRole = 'pembeli' | 'penjual' | 'admin';

// DIUBAH: Tipe data pengguna sekarang mencakup 'role'
interface AuthUser extends User {
  role: UserRole;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // BARU: Ambil data peran dari Firestore setelah user login
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        let userRole: UserRole = 'pembeli'; // Peran default adalah 'pembeli'
        if (userDoc.exists()) {
          userRole = userDoc.data().role || 'pembeli';
        }

        const enhancedUser: AuthUser = {
          ...user,
          // Meng-cast ulang user agar sesuai dengan tipe User dari Firebase
          // lalu menambahkan properti custom kita
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          metadata: user.metadata,
          providerData: user.providerData,
          providerId: user.providerId,
          tenantId: user.tenantId,
          refreshToken: user.refreshToken,
          delete: user.delete,
          getIdToken: user.getIdToken,
          getIdTokenResult: user.getIdTokenResult,
          reload: user.reload,
          toJSON: user.toJSON,
          // Properti custom
          role: userRole,
        };
        
        setCurrentUser(enhancedUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}