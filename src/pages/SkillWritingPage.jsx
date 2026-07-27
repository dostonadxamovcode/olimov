import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, PenLine, Clock, CheckCircle2, RotateCcw, ChevronRight, Eye, EyeOff,
} from 'lucide-react';
import { SectionLoader } from '../components/common/Loader';
import { useAntiCheatGuard } from '../hooks/useAntiCheatGuard';

const storageKey = (task) => `skillWriting_testId_t${task}`;

// ── Live countdown timer ──────────────────────────────────────────────────────
function LiveTimer({ initialMinutes, onExpire }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => {
      if (s <= 1) { clearInterval(id); onExpire?.(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []);
  const mins  = Math.floor(seconds / 60);
  const secs  = seconds % 60;
  const isLow = seconds <= 60;
  const isMid = seconds <= 300;
  return (
    <div className={`flex items-center gap-1.5 text-sm font-bold tabular-nums transition-colors duration-500 ${isLow ? 'text-red-400' : isMid ? 'text-amber-400' : 'text-gray-300'}`}>
      <Clock className={`w-4 h-4 flex-shrink-0 ${isLow ? 'animate-pulse' : ''}`} />
      <span key={seconds} className="timer-tick">{mins}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
}

// ── Word counter ──────────────────────────────────────────────────────────────
function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SkillWritingPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const taskParam      = searchParams.get('task') ?? '1';

  const [test,       setTest]       = useState(null);
  const [loadError,  setLoadError]  = useState(false);
  const [essay,      setEssay]      = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [expired,    setExpired]    = useState(false);
  const textareaRef = useRef(null);

  const wordCount  = countWords(essay);
  const wordLimit  = test?.wordLimit ?? 150;
  const overLimit  = wordCount >= wordLimit;

  useEffect(() => {
    let cancelled = false;
    setTest(null);
    setLoadError(false);
    setEssay('');
    setSubmitted(false);
    setShowSample(false);

    const load = async () => {
      try {
        const { collection, getDocs, query, where, doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');

        const savedId = localStorage.getItem(storageKey(taskParam));
        if (savedId) {
          const snap = await getDoc(doc(db, 'skillWritingTests', savedId));
          if (!cancelled && snap.exists()) { setTest({ id: snap.id, ...snap.data() }); return; }
          localStorage.removeItem(storageKey(taskParam));
        }

        const colSnap = await getDocs(
          query(collection(db, 'skillWritingTests'), where('part', '==', Number(taskParam)))
        );
        if (cancelled) return;
        if (!colSnap.empty) {
          const all    = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          const chosen = all[Math.floor(Math.random() * all.length)];
          localStorage.setItem(storageKey(taskParam), chosen.id);
          setTest(chosen);
        } else {
          setLoadError(true);
        }
      } catch (e) {
        if (!cancelled) { console.error('Writing test load:', e); setLoadError(true); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [taskParam]);

  const handleSubmit = useCallback(() => {
    if (essay.trim().length < 20) return;
    setSubmitted(true);
  }, [essay]);

  const handleExit  = () => { localStorage.removeItem(storageKey(taskParam)); navigate('/skill-tests'); };
  const handleReset = () => { setEssay(''); setSubmitted(false); setShowSample(false); setExpired(false); textareaRef.current?.focus(); };

  const handleViolation = useCallback(() => {
    if (!test || submitted) return;
    localStorage.removeItem(storageKey(taskParam));
    navigate('/exam-terminated');
  }, [test, submitted, taskParam, navigate]);

  useAntiCheatGuard({ active: !!test && !submitted, onViolation: handleViolation });

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}>
        {loadError ? (
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5"><PenLine className="w-7 h-7 text-amber-400" /></div>
            <p className="text-white font-semibold mb-2">Test topilmadi</p>
            <p className="text-slate-400 text-sm mb-6">Task {taskParam} uchun writing test hali qo'shilmagan.</p>
            <button onClick={handleExit} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>
          </div>
        ) : <SectionLoader text="Test yuklanmoqda…" />}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}>
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-amber-700/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-orange-700/[0.04] blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ background: 'rgba(3,9,22,0.88)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[76px] flex items-center gap-5">
          <button type="button" onClick={handleExit} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors group flex-shrink-0 px-3 py-2 rounded-lg hover:bg-white/[0.06]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="hidden sm:inline">Skills</span>
          </button>
          <div className="w-px h-5 bg-white/10 flex-shrink-0" />
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 border border-amber-500/25 flex-shrink-0">
              <PenLine className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest leading-none mb-0.5">Writing Task {taskParam}</p>
              <span className="text-white font-semibold text-sm truncate block leading-tight">{test.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${overLimit ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/[0.06] text-gray-400 border-white/10'}`}>
                {wordCount} / {wordLimit}+ words
              </span>
            </div>
            <div className="w-px h-5 bg-white/10 flex-shrink-0" />
            {!submitted && <LiveTimer initialMinutes={test.timeLimit} onExpire={() => { setExpired(true); handleSubmit(); }} />}
            {submitted && <span className="text-xs font-bold text-emerald-400">Submitted ✓</span>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* LEFT: prompt + optional image */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] p-6" style={{ background: 'rgba(10,16,35,0.7)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/[0.07]">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 border border-amber-500/25 flex-shrink-0">
                  <PenLine className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Task {taskParam} Prompt</p>
                </div>
                {test.topic && <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-500">{test.topic}</span>}
              </div>

              {test.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-white/[0.08]">
                  <img src={test.imageUrl} alt="Task chart or graph" loading="lazy" decoding="async" className="w-full h-auto max-h-64 object-contain bg-white/5" />
                </div>
              )}

              <p className="text-[#c8d6e8] text-sm leading-relaxed">{test.prompt}</p>

              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{test.timeLimit} min</span>
                <span className="text-gray-700">·</span>
                <span>Min. {test.wordLimit} words</span>
                {test.level && <><span className="text-gray-700">·</span><span>{test.level}</span></>}
              </div>
            </div>

            {/* Sample answer (after submit) */}
            {submitted && test.sampleAnswer && (
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(10,16,35,0.7)' }}>
                <button
                  type="button"
                  onClick={() => setShowSample(s => !s)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {showSample ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showSample ? 'Hide' : 'Show'} Sample Answer
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showSample ? 'rotate-90' : ''}`} />
                </button>
                {showSample && (
                  <div className="px-5 pb-5 border-t border-white/[0.06]">
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line pt-4">{test.sampleAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: writing area */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(10,16,35,0.7)', backdropFilter: 'blur(12px)' }}>
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Response</span>
                <span className={`text-xs font-bold ${overLimit ? 'text-emerald-400' : 'text-gray-500'}`}>{wordCount} words</span>
              </div>
              <textarea
                ref={textareaRef}
                value={essay}
                onChange={e => setEssay(e.target.value)}
                disabled={submitted}
                placeholder={`Write your response here…\n\nAim for at least ${test.wordLimit} words.`}
                className="w-full bg-transparent px-5 py-4 text-[#c8d6e8] text-sm leading-relaxed resize-none outline-none placeholder-gray-600 disabled:opacity-60"
                style={{ minHeight: 420 }}
              />
            </div>

            {/* Action bar */}
            {!submitted ? (
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${overLimit ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  {overLimit ? `${wordCount - wordLimit} words over minimum` : `${wordLimit - wordCount} more words needed`}
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={essay.trim().length < 20}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-300 font-semibold text-sm">{expired ? 'Time is up — response saved.' : 'Response submitted!'}</p>
                    <p className="text-emerald-400/70 text-xs mt-0.5">{wordCount} words written</p>
                  </div>
                </div>
                <div className="flex gap-2.5 mt-4">
                  <button type="button" onClick={handleReset} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <button type="button" onClick={handleExit} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg transition-all hover:-translate-y-0.5">
                    More Tests <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
