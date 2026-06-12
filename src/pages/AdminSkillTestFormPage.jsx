import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Pencil, Save } from 'lucide-react';
import { ButtonSpinner, SectionLoader } from '../components/common/Loader';
import { toastError, toastSuccess } from '../utils/errorHandler';

const LEVELS = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
const PARTS  = Array.from({ length: 10 }, (_, i) => i + 1);

const fieldCls = (err) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border ${
    err ? 'border-red-500/50' : 'border-white/10'
  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function parsePassageText(text, blankOffset) {
  const parts = text.split('___');
  const segments = [];
  let idx = blankOffset;
  parts.forEach((part, i) => {
    if (part) segments.push({ type: 'text', content: part });
    if (i < parts.length - 1) segments.push({ type: 'blank', index: idx++ });
  });
  return { segments, nextOffset: idx };
}

function paragraphsToPassage(paragraphs) {
  if (!Array.isArray(paragraphs)) return '';
  return paragraphs.map(p => {
    const segs = Array.isArray(p) ? p : (p.segs ?? []);
    return segs.map(s => s.type === 'blank' ? '___' : (s.content ?? '')).join('');
  }).join('\n\n');
}

function countBlanks(text) {
  return (text || '').split('___').length - 1;
}

const EMPTY = { part: 1, title: '', level: 'A2', timeLimit: 15, passage: '', answers: [] };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminSkillTestFormPage() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = Boolean(id);

  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  // ── Load existing test when editing ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db }          = await import('../firebase');
        const snap = await getDoc(doc(db, 'skillReadingTests', id));
        if (snap.exists()) {
          const d = snap.data();
          setForm({
            part:      d.part      ?? 1,
            title:     d.title     ?? '',
            level:     d.level     ?? 'A2',
            timeLimit: d.timeLimit ?? 15,
            passage:   paragraphsToPassage(d.paragraphs),
            answers:   d.answers   ?? [],
          });
        } else {
          toastError('Test not found');
          navigate('/admin/skill-tests');
        }
      } catch (e) {
        toastError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Passage change ──────────────────────────────────────────────────────────
  const updatePassage = (value) => {
    const count = countBlanks(value);
    setForm(f => ({
      ...f,
      passage: value,
      answers: Array(count).fill('').map((_, i) => f.answers[i] ?? ''),
    }));
    setErrors(e => ({ ...e, passage: '' }));
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.title.trim())                 errs.title   = 'Title is required';
    if (countBlanks(form.passage) === 0)    errs.passage = 'Add at least one blank using ___';
    if (form.answers.some(a => !a.trim()))  errs.answers = 'All answer fields must be filled';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e?.preventDefault();
    if (!validate()) { toastError("Please fix the errors before saving."); return; }

    setSaving(true);
    try {
      const firestoreModule = await import('firebase/firestore');
      const { db }          = await import('../firebase');

      let offset = 0;
      const paragraphs = form.passage
        .split(/\n{2,}/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(text => {
          const { segments, nextOffset } = parsePassageText(text, offset);
          offset = nextOffset;
          return { segs: segments };
        });

      const payload = {
        part:       Number(form.part),
        title:      form.title.trim(),
        level:      form.level,
        timeLimit:  Number(form.timeLimit),
        answers:    form.answers.map(a => a.trim().toLowerCase()),
        paragraphs,
      };

      if (isEditing) {
        const { doc, updateDoc, serverTimestamp } = firestoreModule;
        await updateDoc(doc(db, 'skillReadingTests', id), {
          ...payload, updatedAt: serverTimestamp(),
        });
        toastSuccess('Test updated successfully!');
      } else {
        const { collection, addDoc, serverTimestamp } = firestoreModule;
        await addDoc(collection(db, 'skillReadingTests'), {
          ...payload, createdAt: serverTimestamp(),
        });
        toastSuccess('Test saved successfully!');
      }

      navigate('/admin/skill-tests');
    } catch (e) {
      console.error(e);
      toastError(e);
    } finally {
      setSaving(false);
    }
  };

  const blanks = countBlanks(form.passage);

  // ── UI ──────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen site-bg flex items-center justify-center">
        <SectionLoader text="Loading test…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/skill-tests')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Skill Tests
          </button>

          <div className="flex items-center gap-3 mb-2">
            {isEditing
              ? <Pencil className="w-7 h-7 text-indigo-400" />
              : <BookOpen className="w-7 h-7 text-blue-400" />
            }
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {isEditing ? 'Edit Reading Test' : 'New Reading Test'}
            </h1>
          </div>
          <p className="text-slate-400">
            {isEditing
              ? 'Update the fields below and save your changes.'
              : 'Fill in the fields below to create a new fill-in-the-blanks reading test.'
            }
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 animate-fadeInUp">

          {/* ── Test Info ── */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Test Information</h2>

            {/* Part + Level + Time — one row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Part</label>
                <select
                  value={form.part}
                  onChange={e => setForm(f => ({ ...f, part: e.target.value }))}
                  className={fieldCls(false)}
                >
                  {PARTS.map(n => <option key={n} value={n}>Part {n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CEFR Level</label>
                <select
                  value={form.level}
                  onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  className={fieldCls(false)}
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time (min)</label>
                <input
                  type="number" min={5} max={60}
                  value={form.timeLimit}
                  onChange={e => setForm(f => ({ ...f, timeLimit: e.target.value }))}
                  className={fieldCls(false)}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
                placeholder="e.g. Tom Barry — International Skateboarder"
                className={fieldCls(errors.title)}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>
          </div>

          {/* ── Passage ── */}
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Reading Passage</h2>
              {blanks > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                  {blanks} blank{blanks !== 1 ? 's' : ''} detected
                </span>
              )}
            </div>

            {/* Hint */}
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] text-sm text-blue-300/80">
              <span className="flex-shrink-0 mt-0.5">💡</span>
              <span>
                Use{' '}
                <code className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-mono">___</code>
                {' '}to create blanks. Blanks are automatically numbered left to right.
                Separate paragraphs with a blank line.
              </span>
            </div>

            <div>
              <textarea
                value={form.passage}
                onChange={e => updatePassage(e.target.value)}
                placeholder={`Write the full reading passage here.\n\nSeparate paragraphs with a blank line.\n\nExample:\nTom Barry is 17, and started ___ when he was nine.\n\nHe grew up in New York and won his first ___ at 14.`}
                rows={10}
                className={`${fieldCls(errors.passage)} resize-y leading-relaxed`}
                style={{ minHeight: 220 }}
              />
              {errors.passage && (
                <p className="mt-1 text-sm text-red-400">{errors.passage}</p>
              )}
            </div>
          </div>

          {/* ── Answers ── */}
          {blanks > 0 && (
            <div className="premium-card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Correct Answers
                <span className="ml-2 text-sm font-normal text-slate-500">
                  — {blanks} blank{blanks !== 1 ? 's' : ''}
                </span>
              </h2>

              {errors.answers && (
                <p className="text-sm text-red-400">{errors.answers}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: blanks }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-blue-300 bg-blue-500/15 border border-blue-500/25 flex-shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={form.answers[i] ?? ''}
                      onChange={e => {
                        const ans = [...form.answers];
                        ans[i] = e.target.value;
                        setForm(f => ({ ...f, answers: ans }));
                        setErrors(v => ({ ...v, answers: '' }));
                      }}
                      placeholder={`Answer ${i + 1}`}
                      className={fieldCls(errors.answers && !form.answers[i]?.trim())}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/skill-tests')}
              className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <ButtonSpinner />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Update Test' : 'Save Test'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
