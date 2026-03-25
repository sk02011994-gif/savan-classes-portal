'use client';

import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { firebaseUser, user, loading, refreshUser } = useAuthContext();

  const phone = firebaseUser?.phoneNumber?.replace('+91', '') ?? '';
  const role = user?.role ?? null;
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';
  const isAuthenticated = !!firebaseUser && !!user;

  return { firebaseUser, user, phone, role, isAdmin, isStudent, isAuthenticated, loading, refreshUser };
}
