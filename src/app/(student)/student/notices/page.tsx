'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { subscribeNotices, getBatches } from '@/lib/firestore';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import type { Notice, Batch } from '@/types';

export default function StudentNoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    getBatches().then(setBatches);
    const unsub = subscribeNotices(setNotices);
    return unsub;
  }, []);

  const myNotices = notices.filter(n =>
    n.batchIds.length === 0 || n.batchIds.some(id => user?.batchIds?.includes(id))
  );

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-white">Notices</h2>
      {myNotices.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-slate-500 text-sm">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            No notices yet
          </div>
        </Card>
      ) : (
        myNotices.map(notice => {
          const targetBatches = notice.batchIds.length === 0
            ? 'All Students'
            : batches.filter(b => notice.batchIds.includes(b.id)).map(b => b.name).join(', ');
          return (
            <Card key={notice.id}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell size={15} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{notice.title}</p>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">{notice.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info">{targetBatches}</Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(notice.createdAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
