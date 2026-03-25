'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getBatches, getMaterials, addMaterial, deleteMaterial } from '@/lib/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Plus, Trash2, FileText, Video, ClipboardList, Upload } from 'lucide-react';
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

export default function ContentPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'note' as ContentType });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async (batchId: string) => {
    if (!batchId) return;
    const m = await getMaterials(batchId);
    setMaterials(m);
  };

  useEffect(() => {
    getBatches().then(b => {
      setBatches(b);
      if (b.length > 0) {
        setSelectedBatch(b[0].id);
        load(b[0].id);
      }
    });
  }, []);

  const handleUpload = async () => {
    if (!form.title || !selectedBatch) return;
    setUploading(true);

    let url = '';
    if (file) {
      const storageRef = ref(storage, `content/${selectedBatch}/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      url = await new Promise<string>((resolve, reject) => {
        task.on('state_changed',
          snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref))
        );
      });
    }

    await addMaterial(selectedBatch, {
      title: form.title,
      description: form.description,
      type: form.type,
      url,
      createdAt: Date.now(),
    });

    setForm({ title: '', description: '', type: 'note' });
    setFile(null);
    setProgress(0);
    setShowAdd(false);
    await load(selectedBatch);
    setUploading(false);
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm('Delete this material?')) return;
    await deleteMaterial(selectedBatch, materialId);
    await load(selectedBatch);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader
          title="Course Content"
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1" />Upload</Button>}
        />
        <Select
          label="Batch"
          value={selectedBatch}
          onChange={e => { setSelectedBatch(e.target.value); load(e.target.value); }}
          options={batches.map(b => ({ value: b.id, label: b.name }))}
        />
      </Card>

      {materials.length === 0 ? (
        <Card><div className="text-center py-8 text-slate-500 text-sm">No materials uploaded yet</div></Card>
      ) : (
        <div className="space-y-2">
          {materials.map(material => {
            const Icon = typeIcons[material.type];
            return (
              <Card key={material.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{material.title}</p>
                    {material.description && <p className="text-xs text-slate-400 truncate">{material.description}</p>}
                    <Badge variant={typeBadge[material.type]}>{material.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {material.url && (
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm">View</Button>
                      </a>
                    )}
                    <Button variant="danger" size="sm" onClick={() => handleDelete(material.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Upload Material">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 3 Notes" />
          <Input label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContentType }))}
            options={[{ value: 'note', label: 'Note / PDF' }, { value: 'video', label: 'Video' }, { value: 'assignment', label: 'Assignment' }]} />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">File (optional)</label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-600 hover:border-primary rounded-xl p-4 text-sm text-slate-400 hover:text-primary transition-colors flex flex-col items-center gap-2">
              <Upload size={20} />
              {file ? file.name : 'Click to select file'}
            </button>
            {uploading && progress > 0 && (
              <div className="mt-2 bg-background rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
          <Button className="w-full" onClick={handleUpload} disabled={uploading}>
            {uploading ? `Uploading ${progress}%...` : 'Upload Material'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
