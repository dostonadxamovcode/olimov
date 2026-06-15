import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Pencil, Save, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2,
} from 'lucide-react';
import { ButtonSpinner, SectionLoader } from '../components/common/Loader';
import { toastError, toastSuccess } from '../utils/errorHandler';

// ── Constants ─────────────────────────────────────────────────────────────────
const LEVELS    = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
const ALL_PARTS = Array.from({ length: 10 }, (_, i) => i + 1);
const P2_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// ── Shared field style ────────────────────────────────────────────────────────
const fieldCls = (err) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border ${
    err ? 'border-red-500/50' : 'border-white/10'
  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`;

// ── Part 1 helpers ────────────────────────────────────────────────────────────
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
  return paragraphs
    .map(p => {
      const segs = Array.isArray(p) ? p : (p.segs ?? []);
      return segs.map(s => (s.type === 'blank' ? '___' : (s.content ?? ''))).join('');
    })
    .join('\n\n');
}

function countBlanks(text) {
  return (text || '').split('___').length - 1;
}

// ── Default states ────────────────────────────────────────────────────────────
const makeEmptyArticles = () =>
  Array.from({ length: 8 }, (_, i) => ({
    id:          i + 1,
    company:     '',
    role:        '',
    description: '',
    contact:     '',
  }));

const makeEmptyAnswers = () => Object.fromEntries(P2_LETTERS.map(l => [l, '']));

const EMPTY_FORM = {
  part:         1,
  title:        '',
  level:        'A2',
  timeLimit:    15,
  // Part 1
  passage:      '',
  p1answers:    [],
  // Part 2
  subtitle:     '',
  topic:        '',
  instructions: '',
  articles:     makeEmptyArticles(),
  questions:    P2_LETTERS.map(l => ({ letter: l, text: '' })),
  p2answers:    makeEmptyAnswers(),
};

// ── Part 2 — Article accordion card ──────────────────────────────────────────
function ArticleAccordion({ idx, article, onChange, errors }) {
  const [open, setOpen] = useState(true);
  const hasErrors =
    errors[`article_${idx}_company`] || errors[`article_${idx}_description`];
  const isComplete = !!article.company && !!article.description;

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
      hasErrors ? 'border-red-500/30' : 'border-white/[0.08]'
    } bg-white/[0.02]`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors"
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 border ${
          hasErrors
            ? 'bg-red-500/20 text-red-300 border-red-500/30'
            : isComplete
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
              : 'bg-blue-500/15 text-blue-300 border-blue-500/25'
        }`}>
          {idx + 1}
        </span>

        <span className={`flex-1 text-sm font-medium truncate ${
          article.company ? 'text-slate-200' : 'text-slate-600 italic'
        }`}>
          {article.company
            ? `${article.company}${article.role ? ` — ${article.role}` : ''}`
            : `Article ${idx + 1} — click to expand`
          }
        </span>

        {hasErrors && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
        {!hasErrors && isComplete && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500/60 flex-shrink-0" />
        )}

        {open
          ? <ChevronUp   className="w-4 h-4 text-slate-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-white/[0.06]">
          {/* Company */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Company / Organisation *
            </label>
            <input
              type="text"
              value={article.company}
              onChange={e => onChange('company', e.target.value)}
              placeholder="e.g. HealthPlus Medical Centre"
              className={fieldCls(errors[`article_${idx}_company`])}
            />
            {errors[`article_${idx}_company`] && (
              <p className="mt-1 text-xs text-red-400">{errors[`article_${idx}_company`]}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Job Role / Title
            </label>
            <input
              type="text"
              value={article.role}
              onChange={e => onChange('role', e.target.value)}
              placeholder="e.g. Medical Receptionist / Clinical Coordinator"
              className={fieldCls(false)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Job Description *
            </label>
            <textarea
              value={article.description}
              onChange={e => onChange('description', e.target.value)}
              placeholder="Write the job advertisement text here. Include key features that match a specific question."
              rows={4}
              className={`${fieldCls(errors[`article_${idx}_description`])} resize-y`}
            />
            {errors[`article_${idx}_description`] && (
              <p className="mt-1 text-xs text-red-400">{errors[`article_${idx}_description`]}</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Contact Details
            </label>
            <input
              type="text"
              value={article.contact}
              onChange={e => onChange('contact', e.target.value)}
              placeholder="e.g. careers@example.com  |  Tel: 0800 123 456"
              className={fieldCls(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Part 2 form section ───────────────────────────────────────────────────────
function Part2Form({ form, setForm, errors, setErrors }) {
  const updateArticle = (idx, field, val) => {
    setForm(f => {
      const arts = [...f.articles];
      arts[idx] = { ...arts[idx], [field]: val };
      return { ...f, articles: arts };
    });
    if (field === 'company' || field === 'description') {
      setErrors(e => ({ ...e, [`article_${idx}_${field}`]: '' }));
    }
  };

  const updateQuestion = (idx, val) => {
    setForm(f => {
      const qs = [...f.questions];
      qs[idx] = { ...qs[idx], text: val };
      return { ...f, questions: qs };
    });
    setErrors(e => ({ ...e, [`question_${idx}`]: '' }));
  };

  const updateAnswer = (letter, val) => {
    const num = val === '' ? '' : Number(val);
    setForm(f => ({ ...f, p2answers: { ...f.p2answers, [letter]: num } }));
    setErrors(e => ({ ...e, [`answer_${letter}`]: '' }));
  };

  const completeArticles = form.articles.filter(a => a.company && a.description).length;

  return (
    <div className="space-y-6">

      {/* ── Articles ── */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Advertisement Cards
            <span className="ml-2 text-sm font-normal text-slate-500">— 8 required</span>
          </h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            completeArticles === 8
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
              : 'bg-white/[0.05] text-slate-500 border-white/[0.07]'
          }`}>
            {completeArticles}/8 complete
          </span>
        </div>

        <div className="space-y-2">
          {form.articles.map((article, idx) => (
            <ArticleAccordion
              key={idx}
              idx={idx}
              article={article}
              onChange={(field, val) => updateArticle(idx, field, val)}
              errors={errors}
            />
          ))}
        </div>
      </div>

      {/* ── Questions ── */}
      <div className="premium-card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Questions
          <span className="ml-2 text-sm font-normal text-slate-500">— A to J (10 questions)</span>
        </h2>

        <div className="space-y-3">
          {form.questions.map((q, idx) => (
            <div key={q.letter} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-xs font-black text-blue-300 flex-shrink-0 mt-3">
                {q.letter}
              </span>
              <div className="flex-1">
                <input
                  type="text"
                  value={q.text}
                  onChange={e => updateQuestion(idx, e.target.value)}
                  placeholder={`Question ${q.letter} — e.g. Which job involves direct contact with patients?`}
                  className={fieldCls(errors[`question_${idx}`])}
                />
                {errors[`question_${idx}`] && (
                  <p className="mt-1 text-xs text-red-400">{errors[`question_${idx}`]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Answers ── */}
      <div className="premium-card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Correct Answers
          <span className="ml-2 text-sm font-normal text-slate-500">
            — select the correct article for each question
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {form.questions.map(q => {
            const hasErr = !!errors[`answer_${q.letter}`];
            return (
              <div key={q.letter} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 border ${
                  form.p2answers[q.letter] !== '' && form.p2answers[q.letter] != null
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/25'
                }`}>
                  {q.letter}
                </span>

                <div className="flex-1">
                  <select
                    value={form.p2answers[q.letter] ?? ''}
                    onChange={e => updateAnswer(q.letter, e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                      hasErr
                        ? 'border-red-500/50 text-red-300'
                        : form.p2answers[q.letter] !== '' && form.p2answers[q.letter] != null
                          ? 'border-emerald-500/25 text-white'
                          : 'border-white/10 text-slate-500'
                    }`}
                  >
                    <option value="">— Select article (1–8) —</option>
                    {form.articles.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.id}. {a.company || `Article ${a.id}`}
                      </option>
                    ))}
                  </select>
                  {hasErr && (
                    <p className="mt-0.5 text-[10px] text-red-400">{errors[`answer_${q.letter}`]}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminSkillTestFormPage() {
  const navigate       = useNavigate();
  const { id }         = useParams();
  const [searchParams] = useSearchParams();
  const isEditing      = Boolean(id);

  const editPart = searchParams.get('part') ? Number(searchParams.get('part')) : null;

  const [form,    setForm]    = useState({
    ...EMPTY_FORM,
    part:      editPart ?? 1,
    level:     editPart === 2 ? 'B1' : 'A2',
    timeLimit: editPart === 2 ? 20   : 15,
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const isP2 = Number(form.part) === 2;

  // ── Load existing test ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db }          = await import('../firebase');

        const col  = editPart === 2 ? 'skillReadingPart2Tests' : 'skillReadingTests';
        const snap = await getDoc(doc(db, col, id));

        if (!snap.exists()) {
          toastError('Test not found');
          navigate('/admin/skill-tests');
          return;
        }

        const d = snap.data();

        if (editPart === 2) {
          setForm(f => ({
            ...f,
            part:         2,
            title:        d.title        ?? '',
            subtitle:     d.subtitle     ?? '',
            topic:        d.topic        ?? '',
            level:        d.level        ?? 'B1',
            timeLimit:    d.timeLimit    ?? 20,
            instructions: d.instructions ?? '',
            articles:     d.articles?.length ? d.articles.map(a => ({
              id:          a.id,
              company:     a.company     ?? a.title       ?? '',
              role:        a.role        ?? '',
              description: a.description ?? a.content     ?? '',
              contact:     a.contact     ?? a.contactInfo ?? '',
            })) : makeEmptyArticles(),
            questions:    d.questions?.length
              ? d.questions
              : P2_LETTERS.map(l => ({ letter: l, text: '' })),
            p2answers:    d.answers ?? makeEmptyAnswers(),
          }));
        } else {
          setForm(f => ({
            ...f,
            part:      d.part      ?? 1,
            title:     d.title     ?? '',
            level:     d.level     ?? 'A2',
            timeLimit: d.timeLimit ?? 15,
            passage:   paragraphsToPassage(d.paragraphs),
            p1answers: d.answers   ?? [],
          }));
        }
      } catch (e) {
        toastError(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, editPart]);

  // ── Part change ─────────────────────────────────────────────────────────────
  const handlePartChange = (val) => {
    const n = Number(val);
    setForm(f => ({
      ...f,
      part:      n,
      level:     n === 2 ? 'B1' : f.level,
      timeLimit: n === 2 ? 20   : f.timeLimit,
    }));
    setErrors({});
  };

  // ── Validate Part 1 ─────────────────────────────────────────────────────────
  const validateP1 = () => {
    const errs = {};
    if (!form.title.trim())                    errs.title   = 'Title is required';
    if (countBlanks(form.passage) === 0)       errs.passage = 'Add at least one blank using ___';
    if (form.p1answers.some(a => !a.trim()))   errs.answers = 'All answer fields must be filled';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Validate Part 2 ─────────────────────────────────────────────────────────
  const validateP2 = () => {
    const errs = {};

    if (!form.title.trim()) errs.title = 'Title is required';

    form.articles.forEach((a, idx) => {
      if (!a.company.trim())     errs[`article_${idx}_company`]     = 'Company name required';
      if (!a.description.trim()) errs[`article_${idx}_description`] = 'Description required';
    });

    form.questions.forEach((q, idx) => {
      if (!q.text.trim()) errs[`question_${idx}`] = 'Question text required';
    });

    P2_LETTERS.forEach(l => {
      const v = form.p2answers[l];
      if (v === '' || v == null) errs[`answer_${l}`] = 'Select an article';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e?.preventDefault();
    const valid = isP2 ? validateP2() : validateP1();
    if (!valid) { toastError('Please fix the errors before saving.'); return; }

    setSaving(true);
    try {
      const fsm    = await import('firebase/firestore');
      const { db } = await import('../firebase');

      if (isP2) {
        const payload = {
          type:         'reading',
          part:         2,
          title:        form.title.trim(),
          subtitle:     form.subtitle.trim(),
          topic:        form.topic.trim(),
          level:        form.level,
          timeLimit:    Number(form.timeLimit),
          instructions: form.instructions.trim(),
          articles:     form.articles.map(a => ({
            id:          a.id,
            company:     a.company.trim(),
            role:        a.role.trim(),
            description: a.description.trim(),
            contact:     (a.contact ?? '').trim(),
          })),
          questions: form.questions.map(q => ({
            letter: q.letter,
            text:   q.text.trim(),
          })),
          answers: Object.fromEntries(
            P2_LETTERS.map(l => [l, Number(form.p2answers[l])])
          ),
        };

        if (isEditing && editPart === 2) {
          await fsm.updateDoc(
            fsm.doc(db, 'skillReadingPart2Tests', id),
            { ...payload, updatedAt: fsm.serverTimestamp() }
          );
          toastSuccess('Test updated!');
        } else {
          await fsm.addDoc(
            fsm.collection(db, 'skillReadingPart2Tests'),
            { ...payload, createdAt: fsm.serverTimestamp() }
          );
          toastSuccess('Test saved!');
        }
      } else {
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
          part:      Number(form.part),
          title:     form.title.trim(),
          level:     form.level,
          timeLimit: Number(form.timeLimit),
          answers:   form.p1answers.map(a => a.trim().toLowerCase()),
          paragraphs,
        };

        if (isEditing && !editPart) {
          await fsm.updateDoc(
            fsm.doc(db, 'skillReadingTests', id),
            { ...payload, updatedAt: fsm.serverTimestamp() }
          );
          toastSuccess('Test updated!');
        } else {
          await fsm.addDoc(
            fsm.collection(db, 'skillReadingTests'),
            { ...payload, createdAt: fsm.serverTimestamp() }
          );
          toastSuccess('Test saved!');
        }
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

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen site-bg flex items-center justify-center">
        <SectionLoader text="Loading test…" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className={`mx-auto ${isP2 ? 'max-w-3xl' : 'max-w-2xl'}`}>

        {/* Header */}
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
              ? <Pencil   className="w-7 h-7 text-indigo-400" />
              : <BookOpen className="w-7 h-7 text-blue-400" />
            }
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {isEditing
                ? isP2 ? 'Edit Reading Part 2' : 'Edit Reading Test'
                : isP2 ? 'New Reading Part 2'  : 'New Reading Test'
              }
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            {isP2
              ? 'Create an IELTS-style matching test: 8 advertisement cards + 10 questions (A–J).'
              : 'Create a fill-in-the-blanks reading test.'
            }
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 animate-fadeInUp">

          {/* ── Shared: Test Info ── */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Test Information</h2>

            <div className="grid grid-cols-3 gap-4">
              {/* Part */}
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
                {isEditing && (
                  <p className="mt-1 text-[10px] text-slate-600 italic">Cannot change part when editing</p>
                )}
              </div>

              {/* Level */}
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

              {/* Time */}
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
                onChange={e => {
                  setForm(f => ({ ...f, title: e.target.value }));
                  setErrors(v => ({ ...v, title: '' }));
                }}
                placeholder={isP2
                  ? 'e.g. Reading Part 2'
                  : 'e.g. Tom Barry — International Skateboarder'
                }
                className={fieldCls(errors.title)}
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>

            {/* Part 2 extra fields */}
            {isP2 && (
              <>
                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                    placeholder="e.g. Job Advertisements"
                    className={fieldCls(false)}
                  />
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    placeholder="e.g. Work & Career"
                    className={fieldCls(false)}
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Instructions</label>
                  <textarea
                    value={form.instructions}
                    onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                    placeholder="e.g. The advertisements below describe eight different jobs. For each question (A–J), choose the correct advertisement (1–8)."
                    rows={3}
                    className={`${fieldCls(false)} resize-y`}
                  />
                </div>

                {/* Type badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/[0.07] border border-blue-500/15">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Type:</span>
                  <span className="text-xs text-blue-300 font-semibold">
                    Reading · 8 Articles · 10 Questions (A–J)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Part 2 form ── */}
          {isP2 && (
            <Part2Form
              form={form}
              setForm={setForm}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {/* ── Part 1 form ── */}
          {!isP2 && (
            <>
              {/* Passage */}
              <div className="premium-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Reading Passage</h2>
                  {blanks > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      {blanks} blank{blanks !== 1 ? 's' : ''} detected
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] text-sm text-blue-300/80">
                  <span className="flex-shrink-0 mt-0.5">💡</span>
                  <span>
                    Use{' '}
                    <code className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-mono">___</code>
                    {' '}to create blanks. Separate paragraphs with a blank line.
                  </span>
                </div>

                <div>
                  <textarea
                    value={form.passage}
                    onChange={e => {
                      const val   = e.target.value;
                      const count = countBlanks(val);
                      setForm(f => ({
                        ...f,
                        passage:   val,
                        p1answers: Array(count).fill('').map((_, i) => f.p1answers[i] ?? ''),
                      }));
                      setErrors(v => ({ ...v, passage: '' }));
                    }}
                    placeholder={`Write the full reading passage here.\n\nSeparate paragraphs with a blank line.\n\nExample:\nTom Barry is 17, and started ___ when he was nine.`}
                    rows={10}
                    className={`${fieldCls(errors.passage)} resize-y leading-relaxed`}
                    style={{ minHeight: 220 }}
                  />
                  {errors.passage && <p className="mt-1 text-sm text-red-400">{errors.passage}</p>}
                </div>
              </div>

              {/* Answers */}
              {blanks > 0 && (
                <div className="premium-card p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-white">
                    Correct Answers
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      — {blanks} blank{blanks !== 1 ? 's' : ''}
                    </span>
                  </h2>

                  {errors.answers && <p className="text-sm text-red-400">{errors.answers}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: blanks }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-blue-300 bg-blue-500/15 border border-blue-500/25 flex-shrink-0">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={form.p1answers[i] ?? ''}
                          onChange={e => {
                            const ans = [...form.p1answers];
                            ans[i]    = e.target.value;
                            setForm(f => ({ ...f, p1answers: ans }));
                            setErrors(v => ({ ...v, answers: '' }));
                          }}
                          placeholder={`Answer ${i + 1}`}
                          className={fieldCls(errors.answers && !form.p1answers[i]?.trim())}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Actions ── */}
          <div className="flex justify-end gap-4 pb-10">
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
                <><ButtonSpinner />Saving…</>
              ) : (
                <><Save className="w-5 h-5" />{isEditing ? 'Update Test' : 'Save Test'}</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
