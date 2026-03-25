'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { getBatches, getStudentAttendance } from '@/lib/firestore';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';
import type { Batch, AttendanceRecord } from '@/types';

export default function StudentAttendancePage() {
  const { user, phone } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    if (!user?.batchIds) return;
    getBatches().then(b => {
      const myBatches = b.filter(batch => user.batchIds?.includes(batch.id));
      setBatches(myBatches);
      if (myBatches.length > 0) setSelectedBatch(myBatches[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedBatch) return;
    getStudentAttendance(selectedBatch).then(setRecords);
  }, [selectedBatch]);

  const monthRecords = records.filter(r => r.date.startsWith(month));
  const presentDays = new Set(
    monthRecords.filter(r => r.present.includes(phone)).map(r => r.date)
  );
  const absentDays = new Set(
    monthRecords.filter(r => r.absent.includes(phone)).map(r => r.date)
  );

  const daysInMonth = getDaysInMonth(new Date(month + '-01'));
  const totalMarked = presentDays.size + absentDays.size;
  const percentage = totalMarked > 0 ? Math.round((presentDays.size / totalMarked) * 100) : 0;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const date = `${month}-${day}`;
    return { date, day: i + 1 };
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="My Attendance" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="bg-background border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary"
          >
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="bg-background border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-400">{presentDays.size}</p>
            <p className="text-xs text-slate-400">Present</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-red-400">{absentDays.size}</p>
            <p className="text-xs text-slate-400">Absent</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>{percentage}%</p>
            <p className="text-xs text-slate-400">Overall</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-slate-500 py-1">{d}</div>
          ))}
          {/* Empty cells for start offset */}
          {Array.from({ length: new Date(month + '-01').getDay() }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(({ date, day }) => {
            const isPresent = presentDays.has(date);
            const isAbsent = absentDays.has(date);
            return (
              <div key={date} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${
                isPresent ? 'bg-green-600 text-white' :
                isAbsent ? 'bg-red-900/60 text-red-300' :
                'text-slate-500'
              }`}>
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> Present</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-900/60 inline-block" /> Absent</span>
        </div>
      </Card>
    </div>
  );
}
