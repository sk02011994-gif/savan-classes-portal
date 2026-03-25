'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getStudents, getFeePayments, addFeePayment, updateFeePayment } from '@/lib/firestore';
import { format } from 'date-fns';
import { Plus, CheckCircle } from 'lucide-react';
import type { User, FeePayment } from '@/types';

interface StudentFee {
  student: User;
  payments: FeePayment[];
}

export default function FeesPage() {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [form, setForm] = useState({
    phone: '', amount: '', month: format(new Date(), 'yyyy-MM'), status: 'pending', note: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const load = async () => {
    const s = await getStudents();
    setStudents(s);
    const all = await Promise.all(
      s.map(async student => ({
        student,
        payments: await getFeePayments(student.phone),
      }))
    );
    setStudentFees(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.phone || !form.amount) return;
    setSaving(true);
    await addFeePayment(form.phone, {
      amount: parseFloat(form.amount),
      month: form.month,
      status: form.status as any,
      dueDate: new Date(form.dueDate).getTime(),
      note: form.note,
    });
    setForm({ phone: '', amount: '', month: format(new Date(), 'yyyy-MM'), status: 'pending', note: '', dueDate: format(new Date(), 'yyyy-MM-dd') });
    setShowAdd(false);
    await load();
    setSaving(false);
  };

  const markPaid = async (studentPhone: string, paymentId: string) => {
    await updateFeePayment(studentPhone, paymentId, { status: 'paid', paidAt: Date.now() });
    await load();
  };

  const filtered = studentFees.filter(sf => {
    if (filterStatus === 'all') return true;
    return sf.payments.some(p => p.status === filterStatus);
  });

  const totalPending = studentFees.reduce((sum, sf) =>
    sum + sf.payments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0), 0
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <p className="text-xs text-slate-400">Total Pending</p>
          <p className="text-xl font-bold text-red-400 mt-1">₹{totalPending.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Students</p>
          <p className="text-xl font-bold text-white mt-1">{students.length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Fee Records"
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1" />Add Fee</Button>}
        />
        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'overdue', 'paid'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-slate-900' : 'bg-surface-2 text-slate-300'}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(({ student, payments }) => {
              const shownPayments = filterStatus === 'all' ? payments : payments.filter(p => p.status === filterStatus);
              if (shownPayments.length === 0) return null;
              return (
                <div key={student.phone} className="bg-background rounded-xl p-4">
                  <p className="font-medium text-white text-sm mb-3">{student.name || student.phone} <span className="text-slate-400 font-normal">· {student.phone}</span></p>
                  <div className="space-y-2">
                    {shownPayments.map(payment => (
                      <div key={payment.id} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-white">{payment.month} — ₹{payment.amount}</p>
                          {payment.note && <p className="text-xs text-slate-400">{payment.note}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'danger' : 'warning'}>
                            {payment.status}
                          </Badge>
                          {payment.status !== 'paid' && (
                            <Button variant="ghost" size="sm" onClick={() => markPaid(student.phone, payment.id)}>
                              <CheckCircle size={14} className="text-green-400" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Fee Record">
        <div className="space-y-4">
          <Select label="Student" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            options={[{ value: '', label: 'Select student' }, ...students.map(s => ({ value: s.phone, label: s.name || s.phone }))]} />
          <Input label="Amount (₹)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 1500" />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Month</label>
            <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
              className="w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors" />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            options={[{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }]} />
          <Input label="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Any note..." />
          <Button className="w-full" onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Add Fee Record'}</Button>
        </div>
      </Modal>
    </div>
  );
}
