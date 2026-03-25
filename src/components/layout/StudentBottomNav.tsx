'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, CalendarCheck, BarChart2, CreditCard, Bell, MessageSquare, BookOpen,
} from 'lucide-react';

const navItems = [
  { href: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/student/attendance', label: 'Attend', icon: CalendarCheck },
  { href: '/student/marks', label: 'Marks', icon: BarChart2 },
  { href: '/student/fees', label: 'Fees', icon: CreditCard },
  { href: '/student/notices', label: 'Notices', icon: Bell },
  { href: '/student/chat', label: 'Chat', icon: MessageSquare },
  { href: '/student/content', label: 'Content', icon: BookOpen },
];

export function StudentBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-700/50 z-30 flex">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center py-2 text-[10px] transition-colors',
              active ? 'text-primary' : 'text-slate-500'
            )}
          >
            <Icon size={18} />
            <span className="mt-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
