'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MarksGrowthChart } from '@/components/charts/MarksGrowthChart';
import { useAuth } from '@/hooks/useAuth';
import { getBatches, getTests } from '@/lib/firestore';
import type { Batch, Test } from '@/types';

export default function StudentMarksPage() {
  const { user, phone } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [tests, setTests] = useState<Test[]>([]);

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
    getTests(selectedBatch).then(t => setTests(t.reverse()));
  }, [selectedBatch]);

  const chartData = tests
    .filter(t => t.scores[phone] !== undefined)
    .map(t => ({
      name: t.name.length > 10 ? t.name.slice(0, 10) + '…' : t.name,
      score: t.scores[phone],
      max: t.maxMarks,
      percentage: Math.round((t.scores[phone] / t.maxMarks) * 100),
    }));

  const avg = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.percentage, 0) / chartData.length)
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="My Marks" />
        {batches.length > 1 && (
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="w-full bg-background border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary mb-4"
          >
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}

        {chartData.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">Performance trend</p>
              <Badge variant={avg >= 75 ? 'success' : avg >= 50 ? 'warning' : 'danger'}>Avg: {avg}%</Badge>
            </div>
            <MarksGrowthChart data={chartData} />
          </div>
        )}
      </Card>

      {tests.map(test => {
        const score = test.scores[phone];
        const hasScore = score !== undefined;
        const pct = hasScore ? Math.round((score / test.maxMarks) * 100) : null;
        return (
          <Card key={test.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{test.name}</p>
                <p className="text-xs text-slate-400">{test.date}</p>
              </div>
              {hasScore ? (
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{score}<span className="text-slate-400 text-sm">/{test.maxMarks}</span></p>
                  <Badge variant={pct! >= 75 ? 'success' : pct! >= 50 ? 'warning' : 'danger'}>{pct}%</Badge>
                </div>
              ) : (
                <Badge variant="default">Not yet</Badge>
              )}
            </div>
            {hasScore && (
              <div className="mt-3 bg-background rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${pct! >= 75 ? 'bg-green-500' : pct! >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </Card>
        );
      })}

      {tests.length === 0 && (
        <Card><div className="text-center py-8 text-slate-500 text-sm">No tests recorded yet</div></Card>
      )}
    </div>
  );
}
