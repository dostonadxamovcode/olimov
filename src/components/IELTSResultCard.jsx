import { memo } from 'react'
import {
  Star, BookOpen, Zap, Mic2, Brain,
  TrendingUp, MessageSquare, CheckCircle2, XCircle, ArrowRight, Save,
} from 'lucide-react'

// ── Utility helpers ───────────────────────────────────────────────────────────

function clamp(n) {
  return Math.min(100, Math.max(0, Number(n) || 0))
}

function scoreGradient(score) {
  if (score >= 80) return { color: '#10b981', track: 'rgba(16,185,129,0.15)' }
  if (score >= 60) return { color: '#f59e0b', track: 'rgba(245,158,11,0.15)' }
  return                { color: '#ef4444', track: 'rgba(239,68,68,0.15)'  }
}

function bandGradient(band) {
  if (band >= 8)  return 'from-emerald-500 to-teal-400'
  if (band >= 6.5) return 'from-violet-500 to-indigo-400'
  if (band >= 5)  return 'from-amber-500  to-orange-400'
  return                 'from-rose-500   to-red-400'
}

// ── Radial score ring ─────────────────────────────────────────────────────────

function ScoreRing({ score, size = 76 }) {
  const s       = clamp(score)
  const { color, track } = scoreGradient(s)
  const sw      = 5
  const r       = (size - sw * 2) / 2
  const circ    = 2 * Math.PI * r
  const dash    = (s / 100) * circ

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track}      strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

// ── Score card ────────────────────────────────────────────────────────────────

function ScoreCard({ icon: Icon, label, score }) {
  const s = clamp(score)
  const { color } = scoreGradient(s)

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] p-4"
      style={{ background: 'rgba(255,255,255,0.025)' }}
    >
      <div className="relative w-[76px] h-[76px]">
        <ScoreRing score={s} />
        <span
          className="absolute inset-0 flex items-center justify-center text-xl font-black"
          style={{ color }}
        >
          {s}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-medium whitespace-nowrap">{label}</span>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

const ACCENT = {
  purple: { border: 'border-purple-500/20',  text: 'text-purple-400'  },
  emerald:{ border: 'border-emerald-500/20', text: 'text-emerald-400' },
  amber:  { border: 'border-amber-500/20',   text: 'text-amber-400'   },
  sky:    { border: 'border-sky-500/20',     text: 'text-sky-400'     },
  rose:   { border: 'border-rose-500/20',    text: 'text-rose-400'    },
}

function Section({ title, icon: Icon, accent = 'purple', children }) {
  const a = ACCENT[accent] ?? ACCENT.purple
  return (
    <div
      className={`rounded-2xl border ${a.border} p-5`}
      style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(8px)' }}
    >
      <div className={`flex items-center gap-2 mb-4 ${a.text}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * IELTSResultCard
 *
 * Renders the full AI evaluation result returned by analyzeIELTSSpeaking().
 *
 * Props:
 *   result   {object}    — AI result object
 *   saved    {boolean}   — show "Saved" badge when true
 *   onReset  {Function}  — "Analyze Again" button handler
 */
export const IELTSResultCard = memo(function IELTSResultCard({ result, saved = false, onReset }) {
  if (!result) return null

  const {
    cefrLevel          = '—',
    ieltsBand          = 0,
    wordCount          = 0,
    grammarMistakes    = 0,
    vocabularyScore    = 0,
    fluencyScore       = 0,
    grammarScore       = 0,
    pronunciationScore = 0,
    overallFeedback    = '',
    mistakes           = [],
    advancedVocabulary = [],
    improvementTips    = [],
    improvedAnswer     = '',
  } = result

  const band = Number(ieltsBand) || 0

  return (
    <div className="w-full space-y-4">

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl border border-white/[0.07] p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(59,130,246,0.07) 100%)',
        }}
      >
        {/* Decorative glow blob */}
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)' }}
        />

        {/* Saved badge */}
        {saved && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium mb-4">
            <Save className="w-3.5 h-3.5" />
            <span>Result saved to Firestore</span>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4 relative">
          {/* Band + CEFR */}
          <div className="flex flex-col gap-3">
            {/* Band pill */}
            <div
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 bg-gradient-to-r ${bandGradient(band)} shadow-lg w-fit`}
            >
              <Star className="w-4 h-4 text-white/80 fill-white/60 shrink-0" />
              <span className="text-white font-black text-xl tracking-wide">Band {band}</span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-0.5 text-purple-300 text-sm font-bold">
                {cefrLevel}
              </span>
              <span className="text-slate-500 text-xs">{wordCount} words</span>
              {grammarMistakes > 0 && (
                <span className="text-rose-400 text-xs">
                  {grammarMistakes} grammar error{grammarMistakes !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Reset button */}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all shrink-0"
            >
              Analyze Again
            </button>
          )}
        </div>

        {/* Overall feedback */}
        {overallFeedback && (
          <p className="text-slate-300 text-sm leading-relaxed mt-4 pt-4 border-t border-white/[0.06]">
            {overallFeedback}
          </p>
        )}
      </div>

      {/* ── Score grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreCard icon={BookOpen} label="Grammar"       score={grammarScore}       />
        <ScoreCard icon={Brain}    label="Vocabulary"    score={vocabularyScore}    />
        <ScoreCard icon={Zap}      label="Fluency"       score={fluencyScore}       />
        <ScoreCard icon={Mic2}     label="Pronunciation" score={pronunciationScore} />
      </div>

      {/* ── Grammar mistakes ─────────────────────────────────────────────────── */}
      {mistakes.length > 0 && (
        <Section title="Grammar Mistakes" icon={XCircle} accent="rose">
          <ol className="space-y-3">
            {mistakes.map((m, i) => (
              <li
                key={i}
                className="rounded-xl border border-white/[0.05] p-3"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  <span className="text-rose-400 text-xs font-semibold line-through break-all">
                    {m.original}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-emerald-400 text-xs font-semibold break-all">
                    {m.corrected}
                  </span>
                </div>
                {m.explanation && (
                  <p className="text-slate-400 text-xs leading-relaxed">{m.explanation}</p>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ── Advanced vocabulary ──────────────────────────────────────────────── */}
      {advancedVocabulary.length > 0 && (
        <Section title="Advanced Vocabulary Used" icon={CheckCircle2} accent="emerald">
          <div className="flex flex-wrap gap-2">
            {advancedVocabulary.map((word, i) => (
              <span
                key={i}
                className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Improvement tips ─────────────────────────────────────────────────── */}
      {improvementTips.length > 0 && (
        <Section title="Improvement Tips" icon={TrendingUp} accent="sky">
          <ul className="space-y-2.5">
            {improvementTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Model answer ─────────────────────────────────────────────────────── */}
      {improvedAnswer && (
        <Section title="Band 8+ Model Answer" icon={MessageSquare} accent="amber">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {improvedAnswer}
          </p>
        </Section>
      )}
    </div>
  )
})
