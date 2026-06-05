import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  X, CheckCircle2, XCircle, HelpCircle,
  ChevronRight, Trophy, RotateCcw, ArrowLeft, Info,
  Loader2, AlertCircle,
} from 'lucide-react'
import { useReadingTests } from '../hooks/useReadingTests'

// ─── Level config ──────────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
  all:              { label: 'ALL LEVELS',       bg: 'bg-blue-500/15',    text: 'text-blue-300',    border: 'border-blue-500/25'    },
  beginner:         { label: 'BEGINNER',         bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/25' },
  elementary:       { label: 'ELEMENTARY',       bg: 'bg-cyan-500/15',    text: 'text-cyan-300',    border: 'border-cyan-500/25'    },
  Pre_Intermediate: { label: 'PRE-INTERMEDIATE', bg: 'bg-indigo-500/15',  text: 'text-indigo-300',  border: 'border-indigo-500/25'  },
  intermediate:     { label: 'INTERMEDIATE',     bg: 'bg-teal-500/15',    text: 'text-teal-300',    border: 'border-teal-500/25'    },
  advanced:         { label: 'ADVANCED',         bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/25'   },
}

const OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN']

const OPTION_META = {
  TRUE:        { icon: CheckCircle2, idle: 'border-white/[0.08] bg-white/[0.03]', active: 'border-emerald-500/60 bg-emerald-500/12', iconColor: 'text-emerald-400' },
  FALSE:       { icon: XCircle,      idle: 'border-white/[0.08] bg-white/[0.03]', active: 'border-rose-500/60    bg-rose-500/12',     iconColor: 'text-rose-400'    },
  'NOT GIVEN': { icon: HelpCircle,   idle: 'border-white/[0.08] bg-white/[0.03]', active: 'border-amber-500/60  bg-amber-500/12',     iconColor: 'text-amber-400'   },
}

const REVEAL_CORRECT = 'border-emerald-500/70 bg-emerald-500/10'
const REVEAL_WRONG   = 'border-rose-500/70    bg-rose-500/10'
const REVEAL_NEUTRAL = 'border-white/[0.06]   bg-white/[0.02] opacity-50'

// ─── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      <p className="text-slate-500 text-sm">Loading questions…</p>
    </div>
  )
}

// ─── Error screen ──────────────────────────────────────────────────────────────

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh] text-center px-4">
      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-rose-400" />
      </div>
      <div>
        <p className="text-slate-200 font-semibold mb-1">Failed to load questions</p>
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-700 hover:bg-teal-600 transition-[background-color] duration-150"
      >
        <RotateCcw className="w-4 h-4" /> Try Again
      </button>
    </div>
  )
}

// ─── Empty screen ──────────────────────────────────────────────────────────────

function EmptyScreen({ onBack }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh] text-center px-4">
      <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
        <Info className="w-7 h-7 text-slate-500" />
      </div>
      <div>
        <p className="text-slate-200 font-semibold mb-1">No questions yet</p>
        <p className="text-slate-500 text-sm">There are no questions for this level in the database.</p>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-[background-color] duration-150"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  )
}

// ─── Result screen ─────────────────────────────────────────────────────────────

function ResultScreen({ score, total, onRetry, onExit }) {
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0
  const grade =
    pct >= 90 ? { label: 'Excellent', color: 'text-emerald-300' } :
    pct >= 70 ? { label: 'Good',      color: 'text-blue-300'    } :
    pct >= 50 ? { label: 'Fair',      color: 'text-amber-300'   } :
                { label: 'Keep Going',color: 'text-rose-300'     }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center animate-fadeInUp">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.2) 0%,rgba(16,185,129,0.05) 70%)' }}
      >
        <Trophy className="w-9 h-9 text-emerald-400" />
      </div>

      <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2">Test Complete</p>
      <h2 className="text-3xl font-bold text-white mb-1">
        {score}<span className="text-slate-500 text-xl font-medium">/{total}</span>
      </h2>
      <p className={`text-lg font-semibold mb-1 ${grade.color}`}>{grade.label}</p>
      <p className="text-slate-500 text-sm mb-8">{pct}% correct answers</p>

      <div className="w-full max-w-xs bg-white/[0.04] rounded-full h-2 mb-8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-[color,background-color] duration-150"
        >
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-teal-700 hover:bg-teal-600 transition-[background-color] duration-150"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ReadingTFNGPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const level    = location.state?.level ?? 'intermediate'
  const lc       = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.intermediate

  // ── Firebase data ────────────────────────────────────────────────────────────
  const { questions, loading, error, refetch } = useReadingTests(level)

  // ── Exam state ───────────────────────────────────────────────────────────────
  const [phase,    setPhase]    = useState('exam')
  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score,    setScore]    = useState(0)

  const total = questions.length
  const q     = questions[current]

  // ── Reset when questions reload (retry) ───────────────────────────────────
  useEffect(() => {
    setCurrent(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    setPhase('exam')
  }, [questions])

  // ── Escape key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate('/skill-tests') }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (!selected || revealed || !q) return
    if (selected === q.correctAnswer) setScore(s => s + 1)
    setRevealed(true)
  }, [selected, revealed, q])

  const handleNext = useCallback(() => {
    if (current + 1 >= total) {
      setPhase('result')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }, [current, total])

  const handleRetry = () => refetch()

  // ── Option appearance ─────────────────────────────────────────────────────

  const optionStyle = (opt) => {
    if (!revealed) {
      return selected === opt
        ? OPTION_META[opt].active
        : `${OPTION_META[opt].idle} hover:border-white/20 hover:bg-white/[0.055]`
    }
    if (opt === q?.correctAnswer) return REVEAL_CORRECT
    if (opt === selected)         return REVEAL_WRONG
    return REVEAL_NEUTRAL
  }

  const optionIconColor = (opt) => {
    if (!revealed) return selected === opt ? OPTION_META[opt].iconColor : 'text-slate-600'
    if (opt === q?.correctAnswer) return 'text-emerald-400'
    if (opt === selected)         return 'text-rose-400'
    return 'text-slate-700'
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg,#070a14 0%,#060810 100%)' }}>

      {/* ── Fixed header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 sm:px-6 h-14"
        style={{
          background: 'rgba(6,8,16,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-wide truncate"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', color: '#a5b4fc' }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-indigo-400" />
          Reading / True / False / Not Given
        </span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {phase === 'exam' && !loading && total > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-[11px] font-mono text-slate-400">{score}/{revealed ? current + 1 : current}</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-[11px] font-mono font-semibold text-slate-300">{current + 1}/{total}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/skill-tests')}
            aria-label="Exit test"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-200 transition-[color,background-color] duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-10 flex flex-col">

        {/* Loading */}
        {loading && <LoadingScreen />}

        {/* Error */}
        {!loading && error && <ErrorScreen message={error} onRetry={refetch} />}

        {/* Empty */}
        {!loading && !error && total === 0 && (
          <EmptyScreen onBack={() => navigate('/skill-tests')} />
        )}

        {/* Result */}
        {!loading && !error && total > 0 && phase === 'result' && (
          <ResultScreen
            score={score}
            total={total}
            onRetry={handleRetry}
            onExit={() => navigate('/skill-tests')}
          />
        )}

        {/* Exam */}
        {!loading && !error && total > 0 && phase === 'exam' && q && (
          <div key={current} className="animate-fadeInUp space-y-4" style={{ animationDuration: '220ms' }}>

            {/* HOW TO CHOOSE banner */}
            <div
              className="flex gap-3 rounded-xl p-4"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}
            >
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed text-slate-400 space-y-0.5">
                <p className="text-indigo-300 font-semibold text-[11px] tracking-widest uppercase mb-1">How to choose</p>
                <p><span className="font-semibold text-emerald-300">TRUE</span> — the statement agrees with the information in the passage.</p>
                <p><span className="font-semibold text-rose-300">FALSE</span> — the statement contradicts the information in the passage.</p>
                <p><span className="font-semibold text-amber-300">NOT GIVEN</span> — the information is not found anywhere in the passage.</p>
              </div>
            </div>

            {/* Level badge + question label */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase border ${lc.bg} ${lc.text} ${lc.border}`}>
                {lc.label}
              </span>
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                Question {current + 1}<span className="text-slate-700"> / {total}</span>
              </span>
            </div>

            {/* Passage card */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(13,16,30,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg,#6366f1,#06b6d4)' }} />
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Reading Passage</p>
              </div>
              <p className="text-[13px] sm:text-sm leading-7 text-slate-300 whitespace-pre-line">{q.passage}</p>
            </div>

            {/* Statement */}
            <div
              className="rounded-xl px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-2">Statement</p>
              <p className="text-[15px] sm:text-base font-semibold text-slate-100 leading-relaxed">"{q.statement}"</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {OPTIONS.map((opt) => {
                const { icon: Icon } = OPTION_META[opt]
                return (
                  <button
                    key={opt}
                    onClick={() => !revealed && setSelected(opt)}
                    disabled={revealed}
                    className={`relative group flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-[color,background-color,border-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:cursor-default active:scale-[0.98] ${optionStyle(opt)}`}
                  >
                    <Icon className={`w-5 h-5 transition-colors duration-150 ${optionIconColor(opt)}`} strokeWidth={2} />
                    <span className={`text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${
                      !revealed && selected === opt ? 'text-white' :
                      !revealed ? 'text-slate-500 group-hover:text-slate-300' :
                      opt === q.correctAnswer ? 'text-emerald-300' :
                      opt === selected ? 'text-rose-300' :
                      'text-slate-700'
                    }`}>{opt}</span>

                    {revealed && opt === q.correctAnswer && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </span>
                    )}
                    {revealed && opt === selected && opt !== q.correctAnswer && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <XCircle className="w-3 h-3 text-rose-400" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Explanation after reveal */}
            {revealed && (
              <div
                className="flex gap-3 rounded-xl p-4 animate-fadeIn"
                style={{
                  background:   selected === q.correctAnswer ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
                  border: `1px solid ${selected === q.correctAnswer ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                {selected === q.correctAnswer
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <XCircle      className="w-4 h-4 text-rose-400    flex-shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`text-xs font-bold mb-1 ${selected === q.correctAnswer ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {selected === q.correctAnswer ? 'Correct!' : `Incorrect — the answer is ${q.correctAnswer}`}
                  </p>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            )}

            {/* Submit / Next */}
            {!revealed ? (
              <button
                onClick={handleSubmit}
                disabled={!selected}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-[background-color,opacity] duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:  selected ? 'linear-gradient(135deg,#0f766e 0%,#0d9488 100%)' : 'rgba(255,255,255,0.06)',
                  border:      selected ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow:   selected ? '0 8px 24px -8px rgba(15,118,110,0.5)' : 'none',
                }}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-[background-color] duration-150"
                style={{ background: 'linear-gradient(135deg,#0f766e 0%,#0d9488 100%)', boxShadow: '0 8px 24px -8px rgba(15,118,110,0.5)' }}
              >
                {current + 1 >= total
                  ? <><Trophy className="w-4 h-4" /> View Results</>
                  : <>Next Question <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      {phase === 'exam' && !loading && total > 0 && (
        <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-500"
            style={{ width: `${((current + (revealed ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
