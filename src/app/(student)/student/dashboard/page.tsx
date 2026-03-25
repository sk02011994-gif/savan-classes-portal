'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { getFeePayments, getNotices, getBatches, getStudentAttendance } from '@/lib/firestore';
import { Bell, CreditCard, CalendarCheck, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import type { FeePayment, Notice, Batch } from '@/types';

export default function StudentDashboard() {
  const { user, phone } = useAuth();
  const [dues, setDues] = useState<FeePayment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (!phone) return;
    Promise.all([
      getFeePayments(phone),
      getNotices(),
      getBatches(),
    ]).then(([f, n, b]) => {
      setDues(f.filter(p => p.status !== 'paid'));
      setNotices(n.slice(0, 3));
      setBatches(b.filter(batch => user?.batchIds?.includes(batch.id)));
    });
  }, [phone, user]);

  const quickLinks = [
    { label: 'Attendance', href: '/student/attendance', icon: CalendarCheck, color: 'text-green-400 bg-green-900/20' },
    { label: 'My Marks', href: '/student/marks', icon: BarChart2, color: 'text-blue-400 bg-blue-900/20' },
    { label: 'Fees', href: '/student/fees', icon: CreditCard, color: 'text-amber-400 bg-amber-900/20' },
    { label: 'Notices', href: '/student/notices', icon: Bell, color: 'text-purple-400 bg-purple-900/20' },
  ];

  return (
    <div className="space-y-4">
      <Card glow>
        <p className="text-slate-400 text-sm">Welcome back,</p>
        <h1 className="text-xl font-bold text-white mt-0.5">{user?.name ?? 'Student'} 👋</h1>
        {batches.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {batches.map(b => <Badge key={b.id} variant="info">{b.name}</Badge>)}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:border hover:border-primary/30 transition-all cursor-pointer">
              <div className={`w-10 h-10 rounded-xl ${color.split(' ')[1]} flex items-center justify-center mb-2`}>
                <Icon size={20} className={color.split(' ')[0]} />
              </div>
              <p className="text-sm font-medium text-white">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {dues.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm">Pending Fees</h3>
            <Badge variant="danger">{dues.length} due</Badge>
          </div>
          <div className="space-y-2">
            {dues.slice(0, 3).map(fee => (
              <div key={fee.id} className="flex items-center justify-between bg-background rounded-xl px-3 py-2">
                <p className="text-xs text-slate-300">{fee.month} — ₹{fee.amount}</p>
                <Badge variant={fee.status === 'overdue' ? 'danger' : 'warning'}>{fee.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {notices.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm">Latest Notices</h3>
            <Link href="/student/notices" className="text-xs text-primary">See all</Link>
          </div>
          <div className="space-y-2">
            {notices.map(notice => (
              <div key={notice.id} className="bg-background rounded-xl px-3 py-2.5">
                <p className="text-sm font-medium text-white">{notice.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
