'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getUser, getBatches, getFeePayments, getTests } from '@/lib/firestore';
import type { User, Batch, FeePayment, Test } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StudentDetail() {
  const { phone } = useParams<{ phone: string }>();
  const [student, setStudent] = useState<User | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [fees, setFees] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUser(phone), getBatches(), getFeePayments(phone)]).then(([u, b, f]) => {
      setStudent(u);
      setBatches(b.filter(batch => u?.batchIds?.includes(batch.id)));
      setFees(f);
      setLoading(false);
    });
  }, [phone]);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-slate-400">Student not found</div>;

  const pending = fees.filter(f => f.status !== 'paid');
  const paid = fees.filter(f => f.status === 'paid');

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/students" className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Students
      </Link>

      <Card glow>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {student.name?.[0] ?? '?'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{student.name}</h2>
            <p className="text-sm text-slate-400">+91 {student.phone}</p>
            <div className="flex gap-1 mt-1">
              {batches.map(b => <Badge key={b.id} variant="info">{b.name}</Badge>)}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Fee Summary" />
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{fees.length}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-400">{paid.length}</p>
            <p className="text-xs text-slate-400">Paid</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-red-400">{pending.length}</p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
        </div>

        {fees.length > 0 && (
          <div className="mt-4 space-y-2">
            {fees.slice(0, 6).map(fee => (
              <div key={fee.id} className="flex items-center justify-between bg-background rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-white">{fee.month}</p>
                  <p className="text-xs text-slate-400">₹{fee.amount}</p>
                </div>
                <Badge variant={fee.status === 'paid' ? 'success' : fee.status === 'overdue' ? 'danger' : 'warning'}>
                  {fee.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
