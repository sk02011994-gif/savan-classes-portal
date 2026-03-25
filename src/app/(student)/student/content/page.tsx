'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { getBatches, getMaterials } from '@/lib/firestore';
import { FileText, Video, ClipboardList, Download } from 'lucide-react';
import type { Batch, Material, ContentType } from '@/types';

const typeIcons: Record<ContentType, typeof FileText> = {
  note: FileText,
  video: Video,
  assignment: ClipboardList,
};

const typeBadge: Record<ContentType, 'info' | 'success' | 'warning'> = {
  note: 'info',
  video: 'success',
  assignment: 'warning',
};

export default function StudentContentPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter] = useState<'all' | ContentType>('all');

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
    getMaterials(selectedBatch).then(setMaterials);
  }, [selectedBatch]);

  const filtered = filter === 'all' ? materials : materials.filter(m => m.type === filter);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Study Materials" />
        {batches.length > 1 && (
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="w-full bg-background border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary mb-3"
          >
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <div className="flex gap-2">
          {(['all', 'note', 'video', 'assignment'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-slate-900' : 'bg-surface-2 text-slate-300'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><div className="text-center py-8 text-slate-500 text-sm">No materials available</div></Card>
      ) : (
        filtered.map(material => {
          const Icon = typeIcons[material.type];
          return (
            <Card key={material.id}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{material.title}</p>
                  {material.description && <p className="text-xs text-slate-400 truncate">{material.description}</p>}
                  <Badge variant={typeBadge[material.type]}>{material.type}</Badge>
                </div>
                {material.url && (
                  <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-medium hover:bg-primary/20 transition-colors">
                      <Download size={13} /> Open
                    </button>
                  </a>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
