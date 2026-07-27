import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Clock, CheckCircle2, XCircle, Trophy,
  RotateCcw, ChevronRight, ShieldAlert,
} from 'lucide-react';
import { SectionLoader } from '../components/common/Loader';
import { useAntiCheatGuard } from '../hooks/useAntiCheatGuard';
import { useAuth } from '../context/AuthContext';
import { waitForFirestoreReady } from '../utils/waitForFirestoreAuth';

// ── Live countdown timer ──────────────────────────────────────────────────────
function LiveTimer({ initialMinutes }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mins  = Math.floor(seconds / 60);
  const secs  = seconds % 60;
  const isLow = seconds <= 60;
  const isMid = seconds <= 300;

  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold tabular-nums transition-colors duration-500 ${
      isLow ? 'text-red-400' : isMid ? 'text-amber-400' : 'text-gray-400'
    }`}>
      <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isLow ? 'animate-pulse' : ''}`} />
      <span key={seconds} className="timer-tick">
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        isLow ? 'bg-red-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
      }`} />
    </div>
  );
}

// ── Tab-switch violation overlay ──────────────────────────────────────────────
function ViolationOverlay({ onDismiss }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4" aria-modal="true" role="alertdialog">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-7 text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(239,68,68,0.12) 0%, rgba(10,16,35,0.95) 100%)',
          border: '1px solid rgba(239,68,68,0.25)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(239,68,68,0.08)',
        }}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Test avtomatik yakunlandi</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Tab yoki oyna almashtirish aniqlandi. Xavfsizlik sababli javoblaringiz avtomatik topshirildi.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500/80 to-rose-600/80 hover:from-red-500 hover:to-rose-600 transition-all duration-200"
        >
          Natijalarni ko'rish
        </button>
      </div>
    </div>
  );
}

// ── Score card ────────────────────────────────────────────────────────────────
function ScoreCard({ score, total }) {
  const pct     = Math.round((score / total) * 100);
  const isGreat = pct >= 80;
  const isOkay  = pct >= 60;
  const accent  = isGreat ? 'emerald' : isOkay ? 'amber' : 'red';
  const colors  = {
    emerald: { text: 'text-emerald-300', sub: 'text-emerald-400', bar: 'bg-emerald-400', ring: 'bg-emerald-500/20 border-emerald-500/30' },
    amber:   { text: 'text-amber-300',   sub: 'text-amber-400',   bar: 'bg-amber-400',   ring: 'bg-amber-500/20 border-amber-500/30'   },
    red:     { text: 'text-red-300',     sub: 'text-red-400',     bar: 'bg-red-400',     ring: 'bg-red-500/20 border-red-500/30'       },
  }[accent];

  return (
    <div className={`rounded-2xl border p-4 ${colors.ring}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.ring}`}>
          <Trophy className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <div className={`text-2xl font-black leading-none ${colors.text}`}>{score}/{total}</div>
          <div className="text-xs text-gray-500 mt-0.5">Correct</div>
        </div>
        <div className={`ml-auto text-lg font-black ${colors.text}`}>{pct}%</div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colors.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs mt-2 ${colors.sub}`}>
        {isGreat ? 'Excellent work! 🎉' : isOkay ? 'Good effort — review highlights.' : 'Keep practising!'}
      </p>
    </div>
  );
}

// ── Question row ──────────────────────────────────────────────────────────────
function QuestionRow({ question, answer, isActive, submitted, isCorrect, correctAnswer, onClick }) {
  const isEmpty = answer == null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={submitted}
      className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
        submitted
          ? isCorrect
            ? 'bg-emerald-500/10 border-emerald-500/20 cursor-default'
            : 'bg-red-500/10 border-red-500/20 cursor-default'
          : isActive
            ? 'bg-blue-500/[0.12] border-blue-400/50 shadow-[0_0_0_1px_rgba(96,165,250,0.2)]'
            : isEmpty
              ? 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.14]'
              : 'bg-blue-500/[0.06] border-blue-500/20 hover:bg-blue-500/[0.1]'
      }`}
    >
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-px ${
        submitted
          ? isCorrect
            ? 'bg-emerald-500/30 text-emerald-300'
            : 'bg-red-500/30 text-red-300'
          : isActive
            ? 'bg-blue-500/40 text-blue-200'
            : isEmpty
              ? 'bg-white/10 text-gray-500'
              : 'bg-blue-500/25 text-blue-300'
      }`}>
        {question.letter}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] leading-snug mb-1 text-slate-500">{question.text}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {submitted ? (
            <>
              <span className={`text-[11px] font-bold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                Your: {answer ?? '—'}
              </span>
              {!isCorrect && (
                <span className="text-[11px] text-emerald-400 font-semibold">
                  → Correct: {correctAnswer}
                </span>
              )}
              {isCorrect
                ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                : <XCircle      className="w-3 h-3 text-red-400    flex-shrink-0" />}
            </>
          ) : (
            <span className={`text-[11px] font-bold ${
              isEmpty
                ? isActive ? 'text-blue-300 animate-pulse' : 'text-gray-600 italic'
                : 'text-blue-300'
            }`}>
              {isEmpty
                ? isActive ? '← click an article' : 'not answered'
                : `Article ${answer}`}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Article card ──────────────────────────────────────────────────────────────
// assignedLetters: string[] — all question letters that have chosen this article
// Multiple questions can choose the same article (no unique constraint)
function ArticleCard({ article, activeQuestion, assignedLetters, submitted, results, onClick }) {
  const isSelectedForActive = !!activeQuestion && assignedLetters.includes(activeQuestion);
  const hasActiveQ          = !!activeQuestion;
  const isAssigned          = assignedLetters.length > 0;

  let containerCls, numBadgeCls, cursor;

  if (submitted) {
    if (isAssigned) {
      const allCorrect = assignedLetters.every(l => results[l]);
      const anyCorrect = assignedLetters.some(l => results[l]);
      containerCls = allCorrect
        ? 'border-emerald-500/35 bg-emerald-500/[0.07]'
        : anyCorrect
          ? 'border-amber-500/30 bg-amber-500/[0.05]'
          : 'border-red-500/25 bg-red-500/[0.05]';
      numBadgeCls = allCorrect
        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/35'
        : anyCorrect
          ? 'bg-amber-500/25 text-amber-300 border-amber-500/30'
          : 'bg-red-500/25 text-red-300 border-red-500/30';
    } else {
      containerCls = 'border-white/[0.06] opacity-40';
      numBadgeCls  = 'bg-white/10 text-gray-600 border-white/10';
    }
    cursor = 'cursor-default';
  } else if (isSelectedForActive) {
    containerCls = 'border-blue-400/60 bg-blue-500/[0.1] ring-1 ring-blue-400/25 shadow-[0_0_28px_rgba(59,130,246,0.14)]';
    numBadgeCls  = 'bg-blue-500/40 text-blue-200 border-blue-400/45';
    cursor       = 'cursor-pointer';
  } else if (hasActiveQ) {
    containerCls = 'border-white/[0.1] bg-white/[0.025] hover:border-blue-400/40 hover:bg-blue-500/[0.06] hover:shadow-[0_0_18px_rgba(59,130,246,0.09)]';
    numBadgeCls  = 'bg-white/10 text-gray-400 border-white/10';
    cursor       = 'cursor-pointer';
  } else if (isAssigned) {
    containerCls = 'border-blue-500/25 bg-blue-500/[0.05]';
    numBadgeCls  = 'bg-blue-500/25 text-blue-300 border-blue-500/25';
    cursor       = 'cursor-default';
  } else {
    containerCls = 'border-white/[0.08] bg-white/[0.02]';
    numBadgeCls  = 'bg-white/10 text-gray-500 border-white/10';
    cursor       = 'cursor-default';
  }

  const isClickable = !submitted && hasActiveQ;

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? e => e.key === 'Enter' && onClick() : undefined}
      className={`relative w-full text-left rounded-xl border overflow-hidden transition-all duration-200 ${containerCls} ${cursor} ${
        isClickable ? 'hover:-translate-y-0.5 active:translate-y-0' : ''
      }`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Number badge (top-left) */}
      <div className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 z-10 border ${numBadgeCls}`}>
        {article.id}
      </div>

      {/* Top-right badges — show which questions chose this article */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
        {submitted
          ? assignedLetters.map(l => (
              <div key={l} className="flex items-center gap-0.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border ${
                  results[l]
                    ? 'bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/20 border-red-500/30 text-red-300'
                }`}>
                  {l}
                </span>
                {results[l]
                  ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  : <XCircle      className="w-3 h-3 text-red-400" />
                }
              </div>
            ))
          : assignedLetters.map(l => (
              <span key={l} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border ${
                l === activeQuestion
                  ? 'bg-blue-500 border-blue-400 text-white'
                  : 'bg-blue-500/25 border-blue-500/30 text-blue-400'
              }`}>
                {l}
              </span>
            ))
        }
      </div>

      {/* Card body — normalize field names from both static and Firestore schemas */}
      {(() => {
        const headerText = article.company     || article.title       || '';
        const roleText   = article.role        || '';
        const bodyText   = article.description || article.content     || '';
        const footerText = article.contact     || article.contactInfo || '';
        return (
          <div className="pt-3 pb-3 pl-12 pr-10">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-gray-500 leading-none mb-0.5">
              {headerText}
            </p>
            {roleText && (
              <p className="text-[13px] font-bold text-white leading-snug mb-2">{roleText}</p>
            )}
            {!roleText && <div className="mb-2" />}
            <div className="h-px bg-white/[0.06] mb-2" />
            <p className="text-[11.5px] text-gray-400 leading-relaxed line-clamp-3 mb-2">{bodyText}</p>
            <div className="h-px bg-white/[0.06] mb-2" />
            <p className="text-[10px] text-gray-600 font-medium truncate">{footerText}</p>
          </div>
        );
      })()}

      {/* Selected shimmer ring */}
      {isSelectedForActive && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 2px rgba(96,165,250,0.4)' }} />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SkillReadingPart2Page() {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  // null = loading, object = loaded test data
  const [activeData,     setActiveData]     = useState(null);
  const [loadError,      setLoadError]      = useState(false);

  const letters = activeData?.questions?.map(q => q.letter) ?? [];
  const total   = letters.length;

  const [userAnswers,    setUserAnswers]    = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [submitted,      setSubmitted]      = useState(false);
  const [results,        setResults]        = useState({});
  const [violated,       setViolated]       = useState(false);

  const sidebarRef    = useRef(null);
  const answeredCount = letters.filter(l => userAnswers[l] != null).length;
  const allAnswered   = total > 0 && answeredCount === total;

  // ── Load from Firestore ───────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const load = async () => {
      try {
        await waitForFirestoreReady();
        if (cancelled) return;

        const { collection, getDocs } = await import('firebase/firestore');
        const { db }                  = await import('../firebase');
        const snap = await getDocs(collection(db, 'skillReadingPart2Tests'));
        if (cancelled) return;
        if (!snap.empty) {
          const docs   = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const picked = docs[Math.floor(Math.random() * docs.length)];
          setActiveData(picked);
          const qs = picked.questions ?? [];
          setUserAnswers(Object.fromEntries(qs.map(q => [q.letter, null])));
        } else {
          setLoadError(true);
        }
      } catch (e) {
        console.error('Failed loading skillReadingPart2Tests');
        console.error(e);
        if (!cancelled) setLoadError(true);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [authLoading]);

  // articleAssignments: articleId → letter[] (multiple questions can share an article)
  const articleAssignments = {};
  letters.forEach(l => {
    const aid = userAnswers[l];
    if (aid != null) {
      if (!articleAssignments[aid]) articleAssignments[aid] = [];
      articleAssignments[aid].push(l);
    }
  });

  // ── Click a question letter ───────────────────────────────────────────────
  const handleQuestionClick = (letter) => {
    if (submitted) return;
    setActiveQuestion(prev => prev === letter ? null : letter);
  };

  // ── Click an article card ─────────────────────────────────────────────────
  const handleArticleClick = (articleId) => {
    if (!activeQuestion || submitted) return;
    const newAnswers = { ...userAnswers };
    if (newAnswers[activeQuestion] === articleId) {
      // Toggle off
      newAnswers[activeQuestion] = null;
      setUserAnswers(newAnswers);
      return;
    }
    newAnswers[activeQuestion] = articleId;
    setUserAnswers(newAnswers);
    // Auto-advance to next unanswered question
    const curIdx    = letters.indexOf(activeQuestion);
    const remaining = [...letters.slice(curIdx + 1), ...letters.slice(0, curIdx)];
    const next      = remaining.find(l => newAnswers[l] == null);
    setActiveQuestion(next ?? null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!allAnswered || !activeData) return;
    const res = {};
    activeData.questions.forEach(q => {
      res[q.letter] = userAnswers[q.letter] === activeData.answers[q.letter];
    });
    setResults(res);
    setSubmitted(true);
    setActiveQuestion(null);
    setTimeout(() => sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [allAnswered, userAnswers, activeData]);

  // ── Anti-cheat violation ──────────────────────────────────────────────────
  const handleViolation = useCallback(() => {
    if (!activeData) return;
    navigate('/exam-terminated');
  }, [navigate, activeData]);

  useAntiCheatGuard({ active: !submitted && !!activeData, onViolation: handleViolation });

  const handleReset = () => {
    setUserAnswers(Object.fromEntries(letters.map(l => [l, null])));
    setActiveQuestion(null);
    setSubmitted(false);
    setResults({});
    setViolated(false);
  };

  const score = submitted ? Object.values(results).filter(Boolean).length : 0;

  const lastLetter = letters[letters.length - 1] ?? 'J';

  // ── Loading / Error states ────────────────────────────────────────────────
  if (!activeData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}
      >
        {loadError ? (
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-white font-semibold mb-2">No test available</p>
            <p className="text-slate-400 text-sm mb-6">
              No Reading Part 2 tests have been created yet. Ask an admin to add one.
            </p>
            <button
              onClick={() => navigate('/skill-tests')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Skills
            </button>
          </div>
        ) : (
          <SectionLoader text="Loading test…" />
        )}
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}
    >
      {violated && <ViolationOverlay onDismiss={() => setViolated(false)} />}

      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-700/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-700/[0.04] blur-3xl pointer-events-none" />

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(3,9,22,0.88)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center gap-5">
          <button
            type="button"
            onClick={() => navigate('/skill-tests')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 group flex-shrink-0 px-3 py-2 rounded-lg hover:bg-white/[0.06]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="hidden sm:inline">Skills</span>
          </button>

          <div className="w-px h-5 bg-white/10 flex-shrink-0" />

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/15 border border-blue-500/25 flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest leading-none mb-0.5">
                Reading Test · Part 2
              </p>
              <span className="text-white font-semibold text-sm truncate block leading-tight">
                {activeData.subtitle || activeData.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Progress pills */}
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-0.5">
                {letters.map(l => {
                  const answered = userAnswers[l] != null;
                  return (
                    <div
                      key={l}
                      className={`h-1.5 w-4 rounded-full transition-all duration-300 ${
                        submitted
                          ? results[l] ? 'bg-emerald-400' : 'bg-red-400'
                          : answered ? 'bg-blue-400' : 'bg-white/15'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-semibold text-gray-500 leading-none">
                {submitted ? `${score}/${total} correct` : `${answeredCount}/${total} answered`}
              </span>
            </div>

            <div className="w-px h-5 bg-white/10 flex-shrink-0" />
            <LiveTimer initialMinutes={activeData.timeLimit} />
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">

        {/* Instructions */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-8 text-xs text-blue-300/80 border border-blue-500/[0.15]"
          style={{ background: 'rgba(59,130,246,0.06)' }}
        >
          <span className="text-sm flex-shrink-0">📖</span>
          <span>{activeData.instructions}</span>
        </div>

        <div className="flex gap-6 lg:gap-8 items-start">

          {/* ── LEFT: article cards ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-3 h-3 text-blue-400" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Advertisements (1–{activeData.articles.length})
              </span>

              {activeQuestion && !submitted && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full animate-pulse">
                  <span className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center text-[9px] font-black">{activeQuestion}</span>
                  Select an article
                </span>
              )}
            </div>

            {/* Article grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeData.articles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  activeQuestion={submitted ? null : activeQuestion}
                  assignedLetters={articleAssignments[article.id] ?? []}
                  submitted={submitted}
                  results={results}
                  onClick={() => handleArticleClick(article.id)}
                />
              ))}
            </div>

            {/* Mobile actions */}
            <div className="lg:hidden mt-6 flex flex-col gap-3">
              {!submitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Answers
                  {!allAnswered && (
                    <span className="text-blue-200/60 text-xs">({total - answeredCount} left)</span>
                  )}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/skill-tests')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg transition-all"
                  >
                    More Tests <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: sticky sidebar ─────────────────────────────────── */}
          <div
            ref={sidebarRef}
            className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 flex-shrink-0 sticky top-[92px]"
          >

            {/* Score card */}
            {submitted && (
              <div className="animate-fade-in-up">
                <ScoreCard score={score} total={total} />
              </div>
            )}

            {/* Questions tracker */}
            <div
              className="rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{ background: 'rgba(10,16,35,0.7)', backdropFilter: 'blur(12px)' }}
            >
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {submitted ? 'Results' : `Questions A–${lastLetter}`}
                </span>
                {!submitted && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    allAnswered
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-white/[0.07] text-gray-500'
                  }`}>
                    {answeredCount}/{total}
                  </span>
                )}
              </div>

              <div className="p-3 space-y-1.5 max-h-[50vh] overflow-y-auto">
                {activeData.questions.map(q => (
                  <QuestionRow
                    key={q.letter}
                    question={q}
                    answer={userAnswers[q.letter]}
                    isActive={activeQuestion === q.letter}
                    submitted={submitted}
                    isCorrect={results[q.letter]}
                    correctAnswer={activeData.answers[q.letter]}
                    onClick={() => handleQuestionClick(q.letter)}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">
              {!submitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {allAnswered ? 'Submit Answers' : `Answer ${total - answeredCount} more`}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/skill-tests')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    More Skill Tests <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Tip card */}
            {!submitted && (
              <div
                className="rounded-xl border border-white/[0.06] p-4"
                style={{ background: 'rgba(10,16,35,0.5)' }}
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  💡 How to answer
                </p>
                <ol className="text-xs text-gray-600 leading-relaxed space-y-1">
                  <li>1. Click a question <span className="text-blue-400 font-semibold">(A–{lastLetter})</span> to activate it.</li>
                  <li>2. Click the matching advertisement <span className="text-blue-400 font-semibold">(1–{activeData.articles.length})</span> to assign it.</li>
                  <li>3. Click the same question again to change your answer.</li>
                  <li>4. Answer all {total} questions then submit.</li>
                </ol>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
