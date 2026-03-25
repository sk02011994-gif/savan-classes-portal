'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/batches': 'Batches',
  '/attendance': 'Attendance',
  '/marks': 'Marks & Tests',
  '/fees': 'Fee Management',
  '/notices': 'Notices',
  '/chat': 'Chat',
  '/content': 'Course Content',
};

export function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const base = '/' + pathname.split('/')[1];
  const title = titles[base] ?? 'Portal';

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-700/50 bg-background/80 backdrop-blur sticky top-0 z-20">
      <h2 className="font-semibold text-white text-sm">{title}</h2>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">A</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">{user?.name ?? 'Admin'}</span>
      </div>
    </header>
  );
}
