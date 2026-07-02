import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PenLine, Pencil, Save } from 'lucide-react';
import { ButtonSpinner, SectionLoader } from '../components/common/Loader';
import { toastError, toastSuccess } from '../utils/errorHandler';

const LEVELS = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];

const fieldCls = (err) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border ${
    err ? 'border-red-500/50' : 'border-white/10'
  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all`;

const EMPTY = {
  part: 1,       // 1 = Task 1, 2 = Task 2
  title: '',
  level: 'B1',
  timeLimit: 20,
  prompt: '',
  imageUrl: '',
  wordLimit: 150,
  topic: '',
  sampleAnswer: '',
};

export default function AdminWritingFormPage() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = Boolean(id);

  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const isTask2 = Number(form.part) === 2;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db }          = await import('../firebase');
        const snap = await getDoc(doc(db, 'skillWritingTests', id));
        if (!snap.exists()) { toastError('Test not found'); navigate('/admin/skill-tests'); return; }
        const d = snap.data();
        setForm({
          part:         d.part         ?? 1,
          title:        d.title        ?? '',
          level:        d.level        ?? 'B1',
          timeLimit:    d.timeLimit    ?? 20,
          prompt:       d.prompt       ?? '',
          imageUrl:     d.imageUrl     ?? '',
          wordLimit:    d.wordLimit    ?? 150,
          topic:        d.topic        ?? '',
          sampleAnswer: d.sampleAnswer ?? '',
        });
      } catch (e) {
        toastError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePartChange = (val) => {
    const n = Number(val);
    setForm(f => ({ ...f, part: n, timeLimit: n === 2 ? 40 : 20, wordLimit: n === 2 ? 250 : 150 }));
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())  errs.title  = 'Title is required';
    if (!form.prompt.trim()) errs.prompt = 'Prompt is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!validate()) { toastError('Please fix the errors before saving.'); return; }
    setSaving(true);
    try {
      const fsm    = await import('firebase/firestore');
      const { db } = await import('../firebase');

      const payload = {
        skill:        'writing',
        part:         Number(form.part),
        title:        form.title.trim(),
        level:        form.level,
        timeLimit:    Number(form.timeLimit),
        prompt:       form.prompt.trim(),
        imageUrl:     form.imageUrl.trim(),
        wordLimit:    Number(form.wordLimit),
        topic:        form.topic.trim(),
        sampleAnswer: form.sampleAnswer.trim(),
      };

      if (isEditing) {
        await fsm.updateDoc(fsm.doc(db, 'skillWritingTests', id), { ...payload, updatedAt: fsm.serverTimestamp() });
        toastSuccess('Test updated!');
      } else {
        await fsm.addDoc(fsm.collection(db, 'skillWritingTests'), { ...payload, createdAt: fsm.serverTimestamp() });
        toastSuccess('Test saved!');
      }
      navigate('/admin/skill-tests');
    } catch (e) {
      console.error(e);
      toastError(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen site-bg flex items-center justify-center"><SectionLoader text="Loading…" /></div>;
  }

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8">
          <button onClick={() => navigate('/admin/skill-tests')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Skill Tests
          </button>
          <div className="flex items-center gap-3 mb-2">
            {isEditing ? <Pencil className="w-7 h-7 text-amber-400" /> : <PenLine className="w-7 h-7 text-amber-400" />}
            <h1 className="text-3xl font-bold text-white">{isEditing ? 'Edit Writing Test' : 'New Writing Test'}</h1>
          </div>
          <p className="text-slate-400 text-sm">Create a writing task prompt (Task 1: chart/graph, Task 2: essay).</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Test Info */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Test Information</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Task Type</label>
                <select
                  value={form.part}
                  onChange={e => handlePartChange(e.target.value)}
                  disabled={isEditing}
                  className={`${fieldCls(false)} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value={1}>Task 1</option>
                  <option value={2}>Task 2</option>
                </select>
                {isEditing && <p className="mt-1 text-[10px] text-slate-600 italic">Cannot change task when editing</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CEFR Level</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className={fieldCls(false)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time (min)</label>
                <input type="number" min={10} max={60} value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: e.target.value }))} className={fieldCls(false)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input type="text" value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }} placeholder={isTask2 ? 'e.g. Task 2 – Environment & Technology' : 'e.g. Task 1 – Bar Chart: Population Growth'} className={fieldCls(errors.title)} />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Word Limit (min)</label>
                <input type="number" min={50} max={500} value={form.wordLimit} onChange={e => setForm(f => ({ ...f, wordLimit: e.target.value }))} className={fieldCls(false)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                <input type="text" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Environment, Technology" className={fieldCls(false)} />
              </div>
            </div>
          </div>

          {/* Prompt */}
          <div className="premium-card p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">
              {isTask2 ? 'Essay Question' : 'Task Description'}
            </h2>

            {!isTask2 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Chart / Graph Image URL</label>
                <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://example.com/chart.png" className={fieldCls(false)} />
                <p className="mt-1 text-[11px] text-slate-600">Paste an image URL showing the chart or graph students must describe.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isTask2 ? 'Essay Prompt *' : 'Task Prompt *'}
              </label>
              <textarea
                value={form.prompt}
                onChange={e => { setForm(f => ({ ...f, prompt: e.target.value })); setErrors(v => ({ ...v, prompt: '' })); }}
                placeholder={isTask2
                  ? 'e.g. Some people believe that technology has made our lives easier. Others argue that it has made life more complicated. Discuss both views and give your own opinion.'
                  : 'e.g. The chart below shows the percentage of households in different income groups in a European city in 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.'
                }
                rows={6}
                className={`${fieldCls(errors.prompt)} resize-y`}
              />
              {errors.prompt && <p className="mt-1 text-sm text-red-400">{errors.prompt}</p>}
            </div>
          </div>

          {/* Sample Answer (optional) */}
          <div className="premium-card p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Sample Answer
              <span className="ml-2 text-sm font-normal text-slate-500">— optional, shown after submission</span>
            </h2>
            <textarea
              value={form.sampleAnswer}
              onChange={e => setForm(f => ({ ...f, sampleAnswer: e.target.value }))}
              placeholder="Write a model answer here. Students will see it after submitting their own response."
              rows={8}
              className={`${fieldCls(false)} resize-y`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pb-10">
            <button type="button" onClick={() => navigate('/admin/skill-tests')} className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <><ButtonSpinner />Saving…</> : <><Save className="w-5 h-5" />{isEditing ? 'Update Test' : 'Save Test'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
