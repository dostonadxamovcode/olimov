import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mic, Pencil, Save, Plus, Trash2 } from 'lucide-react';
import { ButtonSpinner, SectionLoader } from '../components/common/Loader';
import { toastError, toastSuccess } from '../utils/errorHandler';

const LEVELS    = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
const ALL_PARTS = [1, 2, 3];

const fieldCls = (err) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border ${
    err ? 'border-red-500/50' : 'border-white/10'
  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all`;

const EMPTY = {
  part: 1,
  title: '',
  level: 'B1',
  timeLimit: 5,
  topic: '',
  questions: [{ text: '' }],
  cueCard: '',
  preparationTime: 60,
};

export default function AdminSpeakingFormPage() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = Boolean(id);

  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const isPart2 = Number(form.part) === 2;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db }          = await import('../firebase');
        const snap = await getDoc(doc(db, 'skillSpeakingTests', id));
        if (!snap.exists()) { toastError('Test not found'); navigate('/admin/skill-tests'); return; }
        const d = snap.data();
        setForm({
          part:            d.part            ?? 1,
          title:           d.title           ?? '',
          level:           d.level           ?? 'B1',
          timeLimit:       d.timeLimit       ?? 5,
          topic:           d.topic           ?? '',
          questions:       d.questions?.length ? d.questions : [{ text: '' }],
          cueCard:         d.cueCard         ?? '',
          preparationTime: d.preparationTime ?? 60,
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
    setForm(f => ({
      ...f,
      part:      n,
      timeLimit: n === 2 ? 2 : n === 1 ? 5 : 10,
    }));
    setErrors({});
  };

  const addQuestion = () => {
    setForm(f => ({ ...f, questions: [...f.questions, { text: '' }] }));
  };

  const removeQuestion = (idx) => {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  };

  const updateQuestion = (idx, text) => {
    setForm(f => {
      const qs = [...f.questions];
      qs[idx]  = { ...qs[idx], text };
      return { ...f, questions: qs };
    });
    setErrors(v => ({ ...v, [`q_${idx}`]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (isPart2) {
      if (!form.cueCard.trim()) errs.cueCard = 'Cue card text is required';
    } else {
      form.questions.forEach((q, i) => {
        if (!q.text.trim()) errs[`q_${i}`] = 'Question text required';
      });
    }
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
        skill:           'speaking',
        part:            Number(form.part),
        title:           form.title.trim(),
        level:           form.level,
        timeLimit:       Number(form.timeLimit),
        topic:           form.topic.trim(),
        questions:       isPart2 ? [] : form.questions.map(q => ({ text: q.text.trim() })),
        cueCard:         isPart2 ? form.cueCard.trim() : '',
        preparationTime: isPart2 ? Number(form.preparationTime) : 0,
      };

      if (isEditing) {
        await fsm.updateDoc(fsm.doc(db, 'skillSpeakingTests', id), { ...payload, updatedAt: fsm.serverTimestamp() });
        toastSuccess('Test updated!');
      } else {
        await fsm.addDoc(fsm.collection(db, 'skillSpeakingTests'), { ...payload, createdAt: fsm.serverTimestamp() });
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
            {isEditing ? <Pencil className="w-7 h-7 text-purple-400" /> : <Mic className="w-7 h-7 text-purple-400" />}
            <h1 className="text-3xl font-bold text-white">{isEditing ? 'Edit Speaking Test' : 'New Speaking Test'}</h1>
          </div>
          <p className="text-slate-400 text-sm">
            {isPart2 ? 'Part 2: provide a cue card topic for the student to speak about.' : 'Parts 1 & 3: add questions for the student to answer.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Test Info */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Test Information</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Part</label>
                <select
                  value={form.part}
                  onChange={e => handlePartChange(e.target.value)}
                  disabled={isEditing}
                  className={`${fieldCls(false)} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {ALL_PARTS.map(n => <option key={n} value={n}>Part {n}</option>)}
                </select>
                {isEditing && <p className="mt-1 text-[10px] text-slate-600 italic">Cannot change part when editing</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CEFR Level</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className={fieldCls(false)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time (min)</label>
                <input type="number" min={1} max={30} value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: e.target.value }))} className={fieldCls(false)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input type="text" value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }} placeholder={isPart2 ? 'e.g. Part 2 – Describe a place' : 'e.g. Part 1 – Everyday topics'} className={fieldCls(errors.title)} />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
              <input type="text" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Travel, Work, Education" className={fieldCls(false)} />
            </div>
          </div>

          {/* Part 2: Cue Card */}
          {isPart2 ? (
            <div className="premium-card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Cue Card</h2>
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] text-sm text-purple-300/80">
                <span className="flex-shrink-0 mt-0.5">🎤</span>
                <span>Describe the topic clearly so students know what to speak about for 1–2 minutes.</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cue Card Text *</label>
                <textarea
                  value={form.cueCard}
                  onChange={e => { setForm(f => ({ ...f, cueCard: e.target.value })); setErrors(v => ({ ...v, cueCard: '' })); }}
                  placeholder={`Describe a place you have visited.\n\nYou should say:\n• Where it is\n• When you went there\n• What you did there\n• And explain why you liked it`}
                  rows={8}
                  className={`${fieldCls(errors.cueCard)} resize-y`}
                />
                {errors.cueCard && <p className="mt-1 text-sm text-red-400">{errors.cueCard}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preparation Time (seconds)</label>
                <input type="number" min={30} max={120} value={form.preparationTime} onChange={e => setForm(f => ({ ...f, preparationTime: e.target.value }))} className={fieldCls(false)} />
                <p className="mt-1 text-[11px] text-slate-600">Standard is 60 seconds to prepare notes.</p>
              </div>
            </div>
          ) : (
            /* Parts 1 & 3: Question list */
            <div className="premium-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Questions</h2>
                <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/25 hover:bg-purple-500/25 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>
              <div className="space-y-3">
                {form.questions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-xs font-black text-purple-300 flex-shrink-0 mt-3">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={q.text}
                        onChange={e => updateQuestion(idx, e.target.value)}
                        placeholder={`Question ${idx + 1} — e.g. What do you do in your free time?`}
                        className={fieldCls(errors[`q_${idx}`])}
                      />
                      {errors[`q_${idx}`] && <p className="mt-0.5 text-xs text-red-400">{errors[`q_${idx}`]}</p>}
                    </div>
                    {form.questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(idx)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-colors mt-3 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pb-10">
            <button type="button" onClick={() => navigate('/admin/skill-tests')} className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <><ButtonSpinner />Saving…</> : <><Save className="w-5 h-5" />{isEditing ? 'Update Test' : 'Save Test'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
