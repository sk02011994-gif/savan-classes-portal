'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getBatches, getStudents, getAttendance, saveAttendance } from '@/lib/firestore';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Save } from 'lucide-react';
import type { Batch, User } from '@/types';

export default function AttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getBatches(), getStudents()]).then(([b, s]) => {
      setBatches(b);
      setStudents(s);
      if (b.length > 0) setSelectedBatch(b[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedBatch || !date) return;
    getAttendance(selectedBatch, date).then(record => {
      if (record) {
        const map: Record<string, boolean> = {};
        record.present.forEach(p => { map[p] = true; });
        record.absent.forEach(p => { map[p] = false; });
        setAttendance(map);
      } else {
        setAttendance({});
      }
    });
  }, [selectedBatch, date]);

  const batchStudents = students.filter(s =>
    batches.find(b => b.id === selectedBatch)?.studentPhones.includes(s.phone)
  );

  const toggle = (phone: string) => {
    setAttendance(a => ({ ...a, [phone]: !a[phone] }));
    setSaved(false);
  };

  const markAll = (present: boolean) => {
    const map: Record<string, boolean> = {};
    batchStudents.forEach(s => { map[s.phone] = present; });
    setAttendance(map);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedBatch) return;
    setSaving(true);
    const present = batchStudents.filter(s => attendance[s.phone] === true).map(s => s.phone);
    const absent = batchStudents.filter(s => attendance[s.phone] !== true).map(s => s.phone);
    await saveAttendance(selectedBatch, date, { date, present, absent });
    setSaved(true);
    setSaving(false);
  };

  const presentCount = batchStudents.filter(s => attendance[s.phone] === true).length;

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader title="Mark Attendance" />
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Select
            label="Batch"
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            options={batches.map(b => ({ value: b.id, label: b.name }))}
          />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>
        </div>

        {batchStudents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No students in this batch</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">{presentCount}/{batchStudents.length} present</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => markAll(true)}>All Present</Button>
                <Button variant="secondary" size="sm" onClick={() => markAll(false)}>All Absent</Button>
              </div>
            </div>

            <div className="space-y-2">
              {batchStudents.map(student => {
                const isPresent = attendance[student.phone] === true;
                return (
                  <button
                    key={student.phone}
                    onClick={() => toggle(student.phone)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                      isPresent ? 'bg-green-900/20 border border-green-800/40' : 'bg-background border border-slate-700'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{student.name || student.phone}</p>
                      <p className="text-xs text-slate-400">{student.phone}</p>
                    </div>
                    {isPresent
                      ? <CheckCircle size={20} className="text-green-400" />
                      : <XCircle size={20} className="text-slate-500" />
                    }
                  </button>
                );
              })}
            </div>

            <Button className="w-full mt-4" onClick={handleSave} disabled={saving}>
              <Save size={15} className="inline mr-2" />
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Attendance'}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
