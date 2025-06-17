// src/context/AuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Tipe untuk nilai yang akan disediakan oleh context
// PASTIKAN BARIS INI ADA UNTUK MENGHILANGKAN ERROR
interface AuthContextType {
  currentUser: User | null;
  loading: boolean; // <-- PENYEBAB ERROR ADA DI SINI JIKA BARIS INI TIDAK ADA
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      console.error("AuthContext Error: Firebase Auth object is null.");
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    loading, // <-- PASTIKAN 'loading' JUGA DISERTAKAN DI SINI
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}