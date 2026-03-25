'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentBottomNav } from '@/components/layout/StudentBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { isStudent, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login');
    if (!loading && isAuthenticated && !isStudent) router.replace('/dashboard');
  }, [loading, isAuthenticated, isStudent, router]);

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = 'session=; path=/; max-age=0';
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isStudent) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-slate-700/50 bg-surface/80 backdrop-blur sticky top-0 z-20">
        <span className="text-primary font-semibold text-sm">SAVAN CLASSES</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{user?.name ?? 'Student'}</span>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
            <LogOut size={15} className="text-slate-400" />
          </button>
        </div>
      </header>
      <main className="pb-20 px-4 py-4">{children}</main>
      <StudentBottomNav />
    </div>
  );
}
