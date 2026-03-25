'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/lib/firestore';
import type { User } from '@/types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    const phone = fbUser.phoneNumber?.replace('+91', '') ?? '';
    const userData = await getUser(phone);
    setUser(userData);
    setLoading(false);
  };

  const refreshUser = async () => {
    if (firebaseUser) await loadUser(firebaseUser);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, fbUser => {
      setFirebaseUser(fbUser);
      loadUser(fbUser);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
