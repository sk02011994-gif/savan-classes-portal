'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Users, CalendarCheck, BarChart2, CreditCard, Bell, MessageSquare,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/attendance', label: 'Attend', icon: CalendarCheck },
  { href: '/marks', label: 'Marks', icon: BarChart2 },
  { href: '/fees', label: 'Fees', icon: CreditCard },
  { href: '/notices', label: 'Notices', icon: Bell },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-700/50 z-30 flex">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
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
