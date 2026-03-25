'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { getFeePayments } from '@/lib/firestore';
import { format } from 'date-fns';
import type { FeePayment } from '@/types';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function StudentFeesPage() {
  const { phone } = useAuth();
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone) return;
    getFeePayments(phone).then(p => { setPayments(p); setLoading(false); });
  }, [phone]);

  const paid = payments.filter(p => p.status === 'paid');
  const pending = payments.filter(p => p.status === 'pending');
  const overdue = payments.filter(p => p.status === 'overdue');
  const totalDue = [...pending, ...overdue].reduce((s, p) => s + p.amount, 0);

  const icons = { paid: CheckCircle, pending: Clock, overdue: AlertCircle };
  const colors = { paid: 'text-green-400', pending: 'text-amber-400', overdue: 'text-red-400' };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><p className="text-xs text-slate-400">Paid</p><p className="text-lg font-bold text-green-400">{paid.length}</p></Card>
        <Card><p className="text-xs text-slate-400">Pending</p><p className="text-lg font-bold text-amber-400">{pending.length}</p></Card>
        <Card><p className="text-xs text-slate-400">Overdue</p><p className="text-lg font-bold text-red-400">{overdue.length}</p></Card>
      </div>

      {totalDue > 0 && (
        <Card className="border border-red-800/40 bg-red-900/10">
          <p className="text-xs text-red-400 font-medium">Total Due</p>
          <p className="text-2xl font-bold text-white mt-1">₹{totalDue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Please pay at the earliest to avoid penalty</p>
        </Card>
      )}

      <Card>
        <CardHeader title="Payment History" />
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No records found</div>
        ) : (
          <div className="space-y-2">
            {payments.map(payment => {
              const Icon = icons[payment.status];
              return (
                <div key={payment.id} className="flex items-center justify-between bg-background rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={colors[payment.status]} />
                    <div>
                      <p className="text-sm font-medium text-white">{payment.month}</p>
                      <p className="text-xs text-slate-400">
                        {payment.status === 'paid' && payment.paidAt
                          ? `Paid on ${format(new Date(payment.paidAt), 'dd MMM yyyy')}`
                          : `Due: ${format(new Date(payment.dueDate), 'dd MMM yyyy')}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">₹{payment.amount}</p>
                    <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'danger' : 'warning'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
