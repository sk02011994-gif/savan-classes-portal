'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getBatches, getStudents, getTests, createTest, updateTest } from '@/lib/firestore';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Batch, User, Test } from '@/types';
import { format } from 'date-fns';

export default function MarksPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', date: format(new Date(), 'yyyy-MM-dd'), maxMarks: '100' });
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = async (batchId: string) => {
    if (!batchId) return;
    const t = await getTests(batchId);
    setTests(t);
  };

  useEffect(() => {
    Promise.all([getBatches(), getStudents()]).then(([b, s]) => {
      setBatches(b);
      setStudents(s);
      if (b.length > 0) {
        setSelectedBatch(b[0].id);
        load(b[0].id);
      }
    });
  }, []);

  const batchStudents = students.filter(s =>
    batches.find(b => b.id === selectedBatch)?.studentPhones.includes(s.phone)
  );

  const handleCreateTest = async () => {
    if (!form.name || !selectedBatch) return;
    setSaving(true);
    await createTest(selectedBatch, {
      name: form.name,
      date: form.date,
      maxMarks: parseInt(form.maxMarks),
      scores: {},
    });
    setForm({ name: '', date: format(new Date(), 'yyyy-MM-dd'), maxMarks: '100' });
    setShowAdd(false);
    await load(selectedBatch);
    setSaving(false);
  };

  const handleSaveScores = async (testId: string) => {
    setSaving(true);
    const numericScores: Record<string, number> = {};
    Object.entries(scores).forEach(([phone, val]) => {
      if (val !== '') numericScores[phone] = parseFloat(val);
    });
    await updateTest(selectedBatch, testId, { scores: numericScores });
    await load(selectedBatch);
    setScores({});
    setExpandedTest(null);
    setSaving(false);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader
          title="Marks & Tests"
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1" />New Test</Button>}
        />
        <Select
          label="Batch"
          value={selectedBatch}
          onChange={e => { setSelectedBatch(e.target.value); load(e.target.value); }}
          options={batches.map(b => ({ value: b.id, label: b.name }))}
        />
      </Card>

      {tests.map(test => (
        <Card key={test.id}>
          <button
            onClick={() => {
              if (expandedTest === test.id) { setExpandedTest(null); setScores({}); }
              else {
                setExpandedTest(test.id);
                const s: Record<string, string> = {};
                batchStudents.forEach(st => { s[st.phone] = test.scores[st.phone]?.toString() ?? ''; });
                setScores(s);
              }
            }}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <p className="font-semibold text-white">{test.name}</p>
              <p className="text-xs text-slate-400">{test.date} &middot; Max: {test.maxMarks}</p>
            </div>
            {expandedTest === test.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {expandedTest === test.id && (
            <div className="mt-4 space-y-2">
              {batchStudents.map(student => (
                <div key={student.phone} className="flex items-center gap-3 bg-background rounded-xl px-4 py-2.5">
                  <div className="flex-1">
                    <p className="text-sm text-white">{student.name || student.phone}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={test.maxMarks}
                    value={scores[student.phone] ?? ''}
                    onChange={e => setScores(s => ({ ...s, [student.phone]: e.target.value }))}
                    placeholder={`/${test.maxMarks}`}
                    className="w-20 bg-surface border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white text-center outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <Button className="w-full mt-2" onClick={() => handleSaveScores(test.id)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Scores'}
              </Button>
            </div>
          )}
        </Card>
      ))}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Test">
        <div className="space-y-4">
          <Input label="Test Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Unit Test 1" />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors" />
          </div>
          <Input label="Max Marks" type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} />
          <Button className="w-full" onClick={handleCreateTest} disabled={saving}>
            {saving ? 'Creating...' : 'Create Test'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
