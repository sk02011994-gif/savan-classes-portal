'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck, BarChart2,
  CreditCard, Bell, MessageSquare, Upload, LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/batches', label: 'Batches', icon: BookOpen },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/marks', label: 'Marks', icon: BarChart2 },
  { href: '/fees', label: 'Fees', icon: CreditCard },
  { href: '/notices', label: 'Notices', icon: Bell },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/content', label: 'Content', icon: Upload },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = 'session=; path=/; max-age=0';
    router.replace('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-surface border-r border-slate-700/50 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <h1 className="text-lg font-semibold text-primary">SAVAN CLASSES</h1>
        <p className="text-xs text-slate-500 mt-0.5">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
