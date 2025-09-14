// LOKASI FILE: src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signOut,
  reload,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import nookies from 'nookies';

// ⬇️ gunakan SDK CLIENT, bukan Admin
import { auth, db } from '@/lib/firebase';

export type Role = 'admin' | 'penjual' | 'pembeli';

type AuthContextValue = {
  currentUser: User | null;
  loading: boolean;
  userRole: Role | null;
  storeId: string | null;
  refreshUser: () => Promise<void>; 
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  userRole: null,
  storeId: null,
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserMeta = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      const data = snap.data() as any | undefined;
      setUserRole((data?.role as Role) ?? null);
      setStoreId((data?.storeId as string) ?? null);
    } catch {
      setUserRole(null);
      setStoreId(null);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserRole(null);
        setStoreId(null);
        setLoading(false);
        nookies.destroy(undefined, 'token');
        return;
      }
      setLoading(true);
      await fetchUserMeta(user.uid);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        nookies.destroy(undefined, 'token');
        return;
      }
      const token = await user.getIdToken();
      nookies.set(undefined, 'token', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 5,
        sameSite: 'lax',
      });
    });
    return () => unsub();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setCurrentUser({ ...(auth.currentUser as User) });
      await fetchUserMeta(auth.currentUser.uid);
      const token = await auth.currentUser.getIdToken(true);
      nookies.set(undefined, 'token', token, { path: '/', maxAge: 60 * 60 * 24 * 5, sameSite: 'lax' });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
    setStoreId(null);
    nookies.destroy(undefined, 'token');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, userRole, storeId, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
