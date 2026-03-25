'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getNotices, createNotice, deleteNotice, getBatches } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Plus, Trash2, Bell } from 'lucide-react';
import type { Notice, Batch } from '@/types';

export default function NoticesPage() {
  const { phone } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', batchId: 'all' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [n, b] = await Promise.all([getNotices(), getBatches()]);
    setNotices(n);
    setBatches(b);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    await createNotice({
      title: form.title,
      content: form.content,
      batchIds: form.batchId === 'all' ? [] : [form.batchId],
      createdAt: Date.now(),
      createdBy: phone,
    });
    setForm({ title: '', content: '', batchId: 'all' });
    setShowAdd(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    await deleteNotice(id);
    await load();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader
          title={`Notices (${notices.length})`}
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1" />Post Notice</Button>}
        />

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No notices yet</div>
        ) : (
          <div className="space-y-3">
            {notices.map(notice => {
              const targetBatches = notice.batchIds.length === 0
                ? 'All Students'
                : batches.filter(b => notice.batchIds.includes(b.id)).map(b => b.name).join(', ');
              return (
                <div key={notice.id} className="bg-background rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell size={14} className="text-primary" />
                        <p className="font-semibold text-white text-sm">{notice.title}</p>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{notice.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="info">{targetBatches}</Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(notice.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(notice.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Post Notice">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title" />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write notice content..."
              rows={4}
              className="w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors resize-none"
            />
          </div>
          <Select
            label="Target"
            value={form.batchId}
            onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))}
            options={[{ value: 'all', label: 'All Students' }, ...batches.map(b => ({ value: b.id, label: b.name }))]}
          />
          <Button className="w-full" onClick={handleCreate} disabled={saving}>
            {saving ? 'Posting...' : 'Post Notice'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
