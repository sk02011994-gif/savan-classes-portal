'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getBatches, createBatch, deleteBatch, getStudents, updateBatch } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Users } from 'lucide-react';
import type { Batch, User } from '@/types';

export default function BatchesPage() {
  const { phone } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', schedule: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [b, s] = await Promise.all([getBatches(), getStudents()]);
    setBatches(b);
    setStudents(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.subject) return;
    setSaving(true);
    await createBatch({
      name: form.name,
      subject: form.subject,
      schedule: form.schedule,
      adminPhone: phone,
      studentPhones: [],
      createdAt: Date.now(),
    });
    setForm({ name: '', subject: '', schedule: '' });
    setShowAdd(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this batch?')) return;
    await deleteBatch(id);
    await load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={`Batches (${batches.length})`}
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1" />New Batch</Button>}
        />

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No batches yet. Create one!</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {batches.map(batch => {
              const batchStudents = students.filter(s => batch.studentPhones.includes(s.phone));
              return (
                <div key={batch.id} className="bg-background rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{batch.name}</p>
                      <p className="text-xs text-primary mt-0.5">{batch.subject}</p>
                      {batch.schedule && <p className="text-xs text-slate-400 mt-1">{batch.schedule}</p>}
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(batch.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                    <Users size={13} />
                    <span>{batchStudents.length} students</span>
                  </div>
                  {batchStudents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {batchStudents.slice(0, 4).map(s => (
                        <span key={s.phone} className="text-xs bg-slate-700 rounded-full px-2 py-0.5 text-slate-300">{s.name || s.phone}</span>
                      ))}
                      {batchStudents.length > 4 && (
                        <span className="text-xs bg-slate-700 rounded-full px-2 py-0.5 text-slate-400">+{batchStudents.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Batch">
        <div className="space-y-4">
          <Input label="Batch Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Class 10 Maths" />
          <Input label="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics" />
          <Input label="Schedule (optional)" value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} placeholder="e.g. Mon/Wed/Fri 4-5 PM" />
          <Button className="w-full" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Batch'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
