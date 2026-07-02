import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Headphones, Clock, CheckCircle2, Trophy,
  RotateCcw, ChevronRight, ShieldAlert,
} from 'lucide-react';
import { SectionLoader } from '../components/common/Loader';
import { useAntiCheatGuard } from '../hooks/useAntiCheatGuard';

// ── Per-part localStorage key ─────────────────────────────────────────────────
const storageKey = (part) => `skillListening_testId_p${part}`;

// ── Helpers shared with Reading ───────────────────────────────────────────────
function getYouTubeId(url) {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?\s]{11})/);
  return m?.[1] ?? null;
}

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
    <div className={`flex items-center gap-1.5 text-xs font-bold tabular-nums transition-colors duration-500 ${isLow ? 'text-red-400' : isMid ? 'text-amber-400' : 'text-gray-400'}`}>
      <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isLow ? 'animate-pulse' : ''}`} />
      <span key={seconds} className="timer-tick">{mins}:{secs.toString().padStart(2, '0')}</span>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLow ? 'bg-red-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
    </div>
  );
}

// ── Violation overlay ─────────────────────────────────────────────────────────
function ViolationOverlay({ onDismiss }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4" aria-modal="true" role="alertdialog">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl p-7 text-center" style={{ background: 'linear-gradient(145deg, rgba(239,68,68,0.12) 0%, rgba(10,16,35,0.95) 100%)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Test avtomatik yakunlandi</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">Tab yoki oyna almashtirish aniqlandi. Javoblaringiz avtomatik topshirildi.</p>
        <button type="button" onClick={onDismiss} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500/80 to-rose-600/80 hover:from-red-500 hover:to-rose-600 transition-all duration-200">
          Natijalarni ko'rish
        </button>
      </div>
    </div>
  );
}

// ── Audio player ──────────────────────────────────────────────────────────────
function AudioPlayer({ url }) {
  if (!url) return null;
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <div className="rounded-2xl overflow-hidden border border-white/[0.08] mb-6" style={{ background: 'rgba(10,16,35,0.7)' }}>
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest">Audio</span>
        </div>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
            title="Listening Audio"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-white/[0.08] p-4 mb-6" style={{ background: 'rgba(10,16,35,0.7)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Headphones className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest">Audio</span>
      </div>
      <audio controls src={url} className="w-full rounded-lg" />
    </div>
  );
}

// ── Inline blank input ────────────────────────────────────────────────────────
function FillBlank({ index, value, onChange, submitted, isCorrect, correctAnswer }) {
  const ansLen   = correctAnswer?.length ?? 6;
  const inputLen = Math.max(value?.length ?? 0, ansLen) + 2;
  const width    = `${Math.max(inputLen, 8)}ch`;
  let inputCls = 'rounded-lg border px-3 py-[3px] text-sm font-semibold text-center outline-none transition-all duration-200 ';
  if (!submitted) {
    inputCls += value
      ? 'bg-emerald-500/15 border-emerald-400/50 text-white focus:border-emerald-300 focus:bg-emerald-500/20 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]'
      : 'bg-white/[0.05] border-white/20 text-white/70 focus:bg-emerald-500/10 focus:border-emerald-400/50';
  } else {
    inputCls += isCorrect
      ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300'
      : 'bg-red-500/15 border-red-400/60 text-red-300';
  }
  return (
    <span className="relative inline-flex items-center mx-1 align-middle">
      <span className={`absolute -top-2.5 left-1 text-[9px] font-black leading-none px-1 py-px rounded-sm ${submitted ? (isCorrect ? 'bg-emerald-500/25 text-emerald-400' : 'bg-red-500/25 text-red-400') : 'bg-emerald-500/20 text-emerald-400'}`}>{index + 1}</span>
      <input type="text" value={value} onChange={onChange} disabled={submitted} autoComplete="off" autoCorrect="off" spellCheck={false} placeholder="···" className={inputCls} style={{ width }} aria-label={`Blank ${index + 1}`} />
      {submitted && !isCorrect && (
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 font-semibold whitespace-nowrap">✓ {correctAnswer}</span>
      )}
    </span>
  );
}

// ── Passage ───────────────────────────────────────────────────────────────────
function Passage({ paragraphs, answers, userAnswers, onAnswerChange, submitted, results }) {
  return (
    <div className="space-y-6">
      {paragraphs.map((segments, pIdx) => (
        <p key={pIdx} className="text-[#c8d6e8] text-[15px] sm:text-base leading-[2.6] sm:leading-[2.8]">
          {segments.map((seg, sIdx) =>
            seg.type === 'text' ? (
              <span key={sIdx}>{seg.content}</span>
            ) : (
              <FillBlank key={sIdx} index={seg.index} value={userAnswers[seg.index]} onChange={e => onAnswerChange(seg.index, e.target.value)} submitted={submitted} isCorrect={results[seg.index]} correctAnswer={answers[seg.index]} />
            )
          )}
        </p>
      ))}
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
    emerald: { text: 'text-emerald-300', bar: 'bg-emerald-400', ring: 'bg-emerald-500/20 border-emerald-500/30' },
    amber:   { text: 'text-amber-300',   bar: 'bg-amber-400',   ring: 'bg-amber-500/20 border-amber-500/30'   },
    red:     { text: 'text-red-300',     bar: 'bg-red-400',     ring: 'bg-red-500/20 border-red-500/30'       },
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
      <p className={`text-xs mt-2 ${colors.text}`}>{isGreat ? 'Excellent! 🎉' : isOkay ? 'Good — review highlights.' : 'Keep practising!'}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SkillListeningPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const partParam      = searchParams.get('part') ?? '1';

  const [test,        setTest]        = useState(null);
  const [loadError,   setLoadError]   = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [submitted,   setSubmitted]   = useState(false);
  const [results,     setResults]     = useState([]);
  const [violated,    setViolated]    = useState(false);
  const passageRef = useRef(null);

  const total       = test?.answers?.length ?? 0;
  const filledCount = userAnswers.filter(a => a.trim().length > 0).length;
  const allFilled   = total > 0 && filledCount === total;
  const score       = results.filter(Boolean).length;

  useEffect(() => {
    if (!test) return;
    setUserAnswers(Array(test.answers.length).fill(''));
    setSubmitted(false);
    setResults([]);
  }, [test?.id]);

  useEffect(() => {
    let cancelled = false;
    setTest(null);
    setLoadError(false);

    const load = async () => {
      try {
        const { collection, getDocs, query, where, doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');

        const savedId = localStorage.getItem(storageKey(partParam));
        if (savedId) {
          const snap = await getDoc(doc(db, 'skillListeningTests', savedId));
          if (!cancelled && snap.exists()) {
            const data = snap.data();
            const paragraphs = (data.paragraphs ?? []).map(p => Array.isArray(p) ? p : (p.segs ?? []));
            setTest({ id: snap.id, ...data, paragraphs });
            return;
          }
          localStorage.removeItem(storageKey(partParam));
        }

        const colSnap = await getDocs(
          query(collection(db, 'skillListeningTests'), where('part', '==', Number(partParam)))
        );
        if (cancelled) return;
        if (!colSnap.empty) {
          const all = colSnap.docs.map(d => {
            const data = d.data();
            const paragraphs = (data.paragraphs ?? []).map(p => Array.isArray(p) ? p : (p.segs ?? []));
            return { id: d.id, ...data, paragraphs };
          });
          const chosen = all[Math.floor(Math.random() * all.length)];
          localStorage.setItem(storageKey(partParam), chosen.id);
          setTest(chosen);
        } else {
          setLoadError(true);
        }
      } catch (e) {
        if (!cancelled) { console.error('Listening test load:', e); setLoadError(true); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [partParam]);

  const handleChange  = (index, value) => setUserAnswers(prev => { const n = [...prev]; n[index] = value; return n; });

  const handleCheck = useCallback(() => {
    if (!test) return;
    const res = test.answers.map((ans, i) => (userAnswers[i] ?? '').trim().toLowerCase() === ans.toLowerCase());
    setResults(res);
    setSubmitted(true);
    setTimeout(() => passageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [test, userAnswers]);

  const handleViolation = useCallback(() => {
    if (!test) return;
    setViolated(true);
    setResults(test.answers.map((ans, i) => (userAnswers[i] ?? '').trim().toLowerCase() === ans.toLowerCase()));
    setSubmitted(true);
  }, [test, userAnswers]);

  useAntiCheatGuard({ active: !!test && !submitted, onViolation: handleViolation });

  const handleExit  = () => { localStorage.removeItem(storageKey(partParam)); navigate('/skill-tests'); };
  const handleReset = () => { setUserAnswers(Array(total).fill('')); setSubmitted(false); setResults([]); setViolated(false); };

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}>
        {loadError ? (
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5"><Headphones className="w-7 h-7 text-emerald-400" /></div>
            <p className="text-white font-semibold mb-2">Test topilmadi</p>
            <p className="text-slate-400 text-sm mb-6">Part {partParam} uchun listening test hali qo'shilmagan.</p>
            <button onClick={handleExit} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>
          </div>
        ) : (
          <SectionLoader text="Test yuklanmoqda…" />
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}>
      {violated && <ViolationOverlay onDismiss={() => setViolated(false)} />}

      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-emerald-700/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-teal-700/[0.04] blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ background: 'rgba(3,9,22,0.88)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center gap-5">
          <button type="button" onClick={handleExit} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors group flex-shrink-0 px-3 py-2 rounded-lg hover:bg-white/[0.06]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="hidden sm:inline">Skills</span>
          </button>
          <div className="w-px h-5 bg-white/10 flex-shrink-0" />
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/15 border border-emerald-500/25 flex-shrink-0">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest leading-none mb-0.5">Listening Test</p>
              <span className="text-white font-semibold text-sm truncate block leading-tight">{test.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} className={`h-1.5 w-5 rounded-full transition-all duration-300 ${submitted ? (results[i] ? 'bg-emerald-400' : 'bg-red-400') : (userAnswers[i]?.trim() ? 'bg-emerald-400' : 'bg-white/15')}`} />
                ))}
              </div>
              <span className="text-[10px] font-semibold text-gray-500 leading-none">
                {submitted ? `${score}/${total} correct` : `${filledCount}/${total} filled`}
              </span>
            </div>
            <div className="w-px h-5 bg-white/10 flex-shrink-0" />
            <LiveTimer initialMinutes={test.timeLimit} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* LEFT: audio + passage */}
          <div className="flex-1 min-w-0" ref={passageRef}>
            <AudioPlayer url={test.audioUrl} />

            <div className="rounded-2xl border border-white/[0.08] p-6 sm:p-8" style={{ background: 'rgba(10,16,35,0.7)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-white/[0.07]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15 border border-emerald-500/25 flex-shrink-0">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mb-0.5">Listening Questions</p>
                  <h2 className="text-white font-bold text-base leading-tight">{test.title}</h2>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-500">{test.level}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6 text-xs text-emerald-300/80 border border-emerald-500/[0.15]" style={{ background: 'rgba(16,185,129,0.06)' }}>
                <span className="text-sm flex-shrink-0">🎧</span>
                <span>Listen to the audio and fill in each <span className="font-semibold text-emerald-300">numbered blank</span> with the correct word.</span>
              </div>
              <Passage paragraphs={test.paragraphs} answers={test.answers} userAnswers={userAnswers} onAnswerChange={handleChange} submitted={submitted} results={results} />
            </div>

            {/* Mobile actions */}
            <div className="lg:hidden mt-4 flex flex-col gap-3">
              {!submitted ? (
                <button type="button" onClick={handleCheck} disabled={!allFilled} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <CheckCircle2 className="w-4 h-4" /> Check Answers {!allFilled && <span className="text-emerald-200/60 text-xs">({total - filledCount} left)</span>}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button type="button" onClick={handleReset} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <button type="button" onClick={handleExit} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg transition-all">
                    More Tests <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: sticky sidebar */}
          <div className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 flex-shrink-0 sticky top-[92px]">
            {submitted && <div className="animate-fade-in-up"><ScoreCard score={score} total={total} /></div>}

            <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(10,16,35,0.7)', backdropFilter: 'blur(12px)' }}>
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{submitted ? 'Results' : 'Your Answers'}</span>
                {!submitted && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${allFilled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.07] text-gray-500'}`}>{filledCount}/{total}</span>}
              </div>
              <div className="p-3 space-y-2">
                {test.answers.map((ans, i) => {
                  const empty = !userAnswers[i]?.trim();
                  return (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${submitted ? (results[i] ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20') : (empty ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-emerald-500/10 border-emerald-500/20')}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${submitted ? (results[i] ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300') : (empty ? 'bg-white/10 text-gray-500' : 'bg-emerald-500/30 text-emerald-300')}`}>{i + 1}</span>
                      <span className={`flex-1 text-xs font-medium truncate ${submitted ? (results[i] ? 'text-emerald-300' : 'text-red-300') : (empty ? 'text-gray-600 italic' : 'text-white')}`}>{empty ? 'not filled' : userAnswers[i]}</span>
                      {submitted && !results[i] && <span className="text-[10px] text-emerald-400 font-semibold flex-shrink-0 whitespace-nowrap">→ {ans}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {!submitted ? (
                <button type="button" onClick={handleCheck} disabled={!allFilled} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                  <CheckCircle2 className="w-4 h-4" /> {allFilled ? 'Check Answers' : `Fill ${total - filledCount} more`}
                </button>
              ) : (
                <>
                  <button type="button" onClick={handleReset} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-all duration-200">
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <button type="button" onClick={handleExit} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                    More Skill Tests <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {!submitted && (
              <div className="rounded-xl border border-white/[0.06] p-4" style={{ background: 'rgba(10,16,35,0.5)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💡 Tip</p>
                <p className="text-xs text-gray-600 leading-relaxed">Listen carefully and fill in each blank as you hear the answer. You can pause and replay the audio as needed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
