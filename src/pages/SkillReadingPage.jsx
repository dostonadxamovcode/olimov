import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Clock, CheckCircle2, XCircle, Trophy,
  RotateCcw, ChevronRight,
} from 'lucide-react';
import { getReadingTestByPart } from '../data/readingTests';  // fallback only

// ── Inline blank input ────────────────────────────────────────────────────────
function FillBlank({ index, value, onChange, submitted, isCorrect, correctAnswer }) {
  const ansLen   = correctAnswer?.length ?? 6;
  const inputLen = Math.max(value?.length ?? 0, ansLen) + 2;
  const width    = `${Math.max(inputLen, 8)}ch`;

  let boxStyle = 'relative inline-flex items-center mx-1 align-middle';
  let inputCls =
    'rounded-lg border px-3 py-[3px] text-sm font-semibold text-center outline-none transition-all duration-200 ';

  if (!submitted) {
    inputCls += value
      ? 'bg-blue-500/15 border-blue-400/50 text-white focus:border-blue-300 focus:bg-blue-500/20 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
      : 'bg-white/[0.05] border-white/20 text-white/70 placeholder-white/20 focus:bg-blue-500/10 focus:border-blue-400/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]';
  } else {
    inputCls += isCorrect
      ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300 shadow-[0_0_0_2px_rgba(52,211,153,0.15)]'
      : 'bg-red-500/15 border-red-400/60 text-red-300 shadow-[0_0_0_2px_rgba(248,113,113,0.15)]';
  }

  return (
    <span className={boxStyle}>
      {/* Number chip */}
      <span
        className={`absolute -top-2.5 left-1 text-[9px] font-black leading-none px-1 py-px rounded-sm ${
          submitted
            ? isCorrect
              ? 'bg-emerald-500/25 text-emerald-400'
              : 'bg-red-500/25 text-red-400'
            : 'bg-blue-500/20 text-blue-400'
        }`}
      >
        {index + 1}
      </span>

      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={submitted}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="···"
        className={inputCls}
        style={{ width }}
        aria-label={`Blank ${index + 1}`}
      />

      {/* Correct answer hint under wrong answer */}
      {submitted && !isCorrect && (
        <span
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 font-semibold whitespace-nowrap"
        >
          ✓ {correctAnswer}
        </span>
      )}
    </span>
  );
}

// ── Passage ───────────────────────────────────────────────────────────────────
function Passage({ paragraphs, answers, userAnswers, onAnswerChange, submitted, results }) {
  return (
    <div className="space-y-6">
      {paragraphs.map((segments, pIdx) => (
        <p
          key={pIdx}
          className="text-[#c8d6e8] text-[15px] sm:text-base leading-[2.6] sm:leading-[2.8]"
        >
          {segments.map((seg, sIdx) =>
            seg.type === 'text' ? (
              <span key={sIdx}>{seg.content}</span>
            ) : (
              <FillBlank
                key={sIdx}
                index={seg.index}
                value={userAnswers[seg.index]}
                onChange={e => onAnswerChange(seg.index, e.target.value)}
                submitted={submitted}
                isCorrect={results[seg.index]}
                correctAnswer={answers[seg.index]}
              />
            )
          )}
        </p>
      ))}
    </div>
  );
}

// ── Sidebar blank tracker row ─────────────────────────────────────────────────
function BlankRow({ number, value, submitted, isCorrect, correctAnswer }) {
  const isEmpty = !value?.trim();

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
        submitted
          ? isCorrect
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
          : isEmpty
            ? 'bg-white/[0.03] border-white/[0.07]'
            : 'bg-blue-500/10 border-blue-500/20'
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
          submitted
            ? isCorrect
              ? 'bg-emerald-500/30 text-emerald-300'
              : 'bg-red-500/30 text-red-300'
            : isEmpty
              ? 'bg-white/10 text-gray-500'
              : 'bg-blue-500/30 text-blue-300'
        }`}
      >
        {number}
      </span>

      <span className={`flex-1 text-xs font-medium truncate ${
        submitted
          ? isCorrect ? 'text-emerald-300' : 'text-red-300'
          : isEmpty ? 'text-gray-600 italic' : 'text-white'
      }`}>
        {isEmpty ? 'not filled' : value}
      </span>

      {submitted && (
        isCorrect
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          : (
            <span className="text-[10px] text-emerald-400 font-semibold flex-shrink-0 whitespace-nowrap">
              → {correctAnswer}
            </span>
          )
      )}
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
      {/* Bar */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs mt-2 ${colors.sub}`}>
        {isGreat ? 'Excellent work! 🎉' : isOkay ? 'Good effort — review highlights.' : 'Keep practising!'}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SkillReadingPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const partParam      = searchParams.get('part') ?? '1';

  const [test, setTest]           = useState(() => getReadingTestByPart(partParam));
  const [userAnswers, setUserAnswers] = useState(() => Array(test.answers.length).fill(''));
  const [submitted,   setSubmitted]   = useState(false);
  const [results,     setResults]     = useState([]);

  const total = test.answers.length;

  // Reset answers whenever the test object changes
  useEffect(() => {
    setUserAnswers(Array(test.answers.length).fill(''));
    setSubmitted(false);
    setResults([]);
  }, [test.id]);

  // On part change: fetch ALL tests for this part from Firestore, pick one randomly.
  // Falls back to static data only if Firestore returns nothing.
  useEffect(() => {
    const tryFirestore = async () => {
      try {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const snap = await getDocs(
          query(collection(db, 'skillReadingTests'), where('part', '==', Number(partParam)))
        );
        if (!snap.empty) {
          const all = snap.docs.map(d => {
            const data = d.data();
            // Firestore stores paragraphs as [{segs:[...]}, ...] to avoid nested
            // arrays (Firestore limitation). Unwrap .segs back to plain arrays so
            // the Passage renderer receives the same format as static data.
            const paragraphs = (data.paragraphs ?? []).map(p =>
              Array.isArray(p) ? p : (p.segs ?? [])
            );
            return { id: d.id, ...data, paragraphs };
          });
          const picked = all[Math.floor(Math.random() * all.length)];
          setTest(picked);
        } else {
          setTest(getReadingTestByPart(partParam));
        }
      } catch (e) {
        console.error('Firestore reading test load:', e);
        setTest(getReadingTestByPart(partParam));
      }
    };
    tryFirestore();
  }, [partParam]);
  const passageRef = useRef(null);

  const handleChange = (index, value) => {
    setUserAnswers(prev => { const n = [...prev]; n[index] = value; return n; });
  };

  const handleCheck = () => {
    const res = test.answers.map((ans, i) => userAnswers[i].trim().toLowerCase() === ans.toLowerCase());
    setResults(res);
    setSubmitted(true);
    setTimeout(() => passageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleReset = () => {
    setUserAnswers(Array(total).fill(''));
    setSubmitted(false);
    setResults([]);
  };

  const score       = results.filter(Boolean).length;
  const allFilled   = userAnswers.every(a => a.trim().length > 0);
  const filledCount = userAnswers.filter(a => a.trim().length > 0).length;

  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-700/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-700/[0.04] blur-3xl pointer-events-none" />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(3,9,22,0.88)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/skill-tests')}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 group flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="hidden sm:inline">Skills</span>
          </button>

          <div className="w-px h-4 bg-white/10 flex-shrink-0" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-white font-semibold text-sm truncate">{test.title}</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Progress pills */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: total }).map((_, i) => {
                const filled = userAnswers[i]?.trim().length > 0;
                return (
                  <div
                    key={i}
                    className={`h-1.5 w-5 rounded-full transition-all duration-300 ${
                      submitted
                        ? results[i] ? 'bg-emerald-400' : 'bg-red-400'
                        : filled ? 'bg-blue-400' : 'bg-white/15'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {submitted ? `${score}/${total}` : `${filledCount}/${total}`}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{test.timeLimit} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* ── LEFT: passage ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0" ref={passageRef}>

            {/* Passage card */}
            <div
              className="rounded-2xl border border-white/[0.08] p-6 sm:p-8 lg:p-10"
              style={{ background: 'rgba(10,16,35,0.7)', backdropFilter: 'blur(12px)' }}
            >
              {/* Passage title */}
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-white/[0.07]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/15 border border-blue-500/25 flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-0.5">Reading Passage</p>
                  <h2 className="text-white font-bold text-base leading-tight">{test.title}</h2>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-500">{test.level}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-500 hidden sm:inline-block">{test.topic}</span>
                </div>
              </div>

              {/* Instructions strip */}
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6 text-xs text-blue-300/80 border border-blue-500/[0.15]"
                style={{ background: 'rgba(59,130,246,0.06)' }}>
                <span className="text-sm flex-shrink-0">📖</span>
                <span>Fill in each <span className="font-semibold text-blue-300">numbered blank</span> with the correct missing word. Use the context to guide your answer.</span>
              </div>

              {/* The passage */}
              <Passage
                paragraphs={test.paragraphs}
                answers={test.answers}
                userAnswers={userAnswers}
                onAnswerChange={handleChange}
                submitted={submitted}
                results={results}
              />
            </div>

            {/* Mobile actions (shown below passage on small screens) */}
            <div className="lg:hidden mt-4 flex flex-col gap-3">
              {!submitted ? (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!allFilled}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Check Answers
                  {!allFilled && <span className="text-blue-200/60 text-xs">({total - filledCount} left)</span>}
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

          {/* ── RIGHT: sticky sidebar ──────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 flex-shrink-0 sticky top-16">

            {/* Score card (after submit) */}
            {submitted && (
              <div className="animate-fade-in-up">
                <ScoreCard score={score} total={total} />
              </div>
            )}

            {/* Blank tracker */}
            <div
              className="rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{ background: 'rgba(10,16,35,0.7)', backdropFilter: 'blur(12px)' }}
            >
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {submitted ? 'Results' : 'Your Answers'}
                </span>
                {!submitted && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    allFilled ? 'bg-blue-500/20 text-blue-300' : 'bg-white/[0.07] text-gray-500'
                  }`}>
                    {filledCount}/{total}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                {test.answers.map((ans, i) => (
                  <BlankRow
                    key={i}
                    number={i + 1}
                    value={userAnswers[i]}
                    submitted={submitted}
                    isCorrect={results[i]}
                    correctAnswer={ans}
                  />
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="flex flex-col gap-2.5">
              {!submitted ? (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!allFilled}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {allFilled ? 'Check Answers' : `Fill ${total - filledCount} more`}
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
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">💡 Tip</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Look at the words immediately before and after the blank — they reveal the grammar and meaning of the missing word.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
