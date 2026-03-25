'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { getStudents, getBatches, getNotices } from '@/lib/firestore';
import { Users, BookOpen, Bell, CreditCard } from 'lucide-react';

interface Stats {
  students: number;
  batches: number;
  notices: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ students: 0, batches: 0, notices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getBatches(), getNotices()]).then(([students, batches, notices]) => {
      setStats({ students: students.length, batches: batches.length, notices: notices.length });
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Batches', value: stats.batches, icon: BookOpen, color: 'text-green-400', bg: 'bg-green-900/20' },
    { label: 'Notices', value: stats.notices, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-900/20' },
    { label: 'Fee Records', value: '—', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Welcome back 👋</h1>
        <p className="text-sm text-slate-400 mt-1">Here's what's happening at Savan Classes today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{loading ? '—' : value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Add Student', href: '/students' },
            { label: 'Mark Attendance', href: '/attendance' },
            { label: 'Enter Marks', href: '/marks' },
            { label: 'Collect Fee', href: '/fees' },
            { label: 'Post Notice', href: '/notices' },
            { label: 'Upload Content', href: '/content' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="bg-background border border-slate-700 hover:border-primary/50 rounded-xl p-3 text-sm text-slate-300 hover:text-primary transition-colors text-center"
            >
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
