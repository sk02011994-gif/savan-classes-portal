'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getStudents, setUser, deleteUser, getBatches, updateBatch } from '@/lib/firestore';
import { Search, UserPlus, Trash2, ExternalLink } from 'lucide-react';
import type { User, Batch } from '@/types';
import Link from 'next/link';

export default function StudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', batchId: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [s, b] = await Promise.all([getStudents(), getBatches()]);
    setStudents(s);
    setBatches(b);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const handleAdd = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    await setUser(form.phone, {
      name: form.name,
      phone: form.phone,
      role: 'student',
      batchIds: form.batchId ? [form.batchId] : [],
      createdAt: Date.now(),
    });
    if (form.batchId) {
      const batch = batches.find(b => b.id === form.batchId);
      if (batch && !batch.studentPhones.includes(form.phone)) {
        await updateBatch(form.batchId, {
          studentPhones: [...batch.studentPhones, form.phone],
        });
      }
    }
    setForm({ name: '', phone: '', batchId: '' });
    setShowAdd(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (phone: string) => {
    if (!confirm('Delete this student?')) return;
    await deleteUser(phone);
    await load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={`Students (${students.length})`}
          action={<Button size="sm" onClick={() => setShowAdd(true)}><UserPlus size={14} className="inline mr-1" />Add</Button>}
        />
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full bg-background border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary transition-colors"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No students found</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(student => {
              const studentBatches = batches.filter(b => student.batchIds?.includes(b.id));
              return (
                <div key={student.phone} className="flex items-center justify-between bg-background rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{student.name || '—'}</p>
                    <p className="text-xs text-slate-400">{student.phone}</p>
                    {studentBatches.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {studentBatches.map(b => (
                          <Badge key={b.id} variant="info">{b.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/students/${student.phone}`}>
                      <Button variant="ghost" size="sm"><ExternalLink size={14} /></Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(student.phone)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Student">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name" />
          <Input label="Phone (without +91)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} placeholder="10-digit number" maxLength={10} />
          <Select
            label="Assign Batch (optional)"
            value={form.batchId}
            onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))}
            options={[{ value: '', label: 'No batch' }, ...batches.map(b => ({ value: b.id, label: b.name }))]}
          />
          <Button className="w-full" onClick={handleAdd} disabled={saving}>
            {saving ? 'Saving...' : 'Add Student'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
