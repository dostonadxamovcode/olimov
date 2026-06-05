import { useState, useEffect } from 'react'
import { X, Target, Sprout, BookOpen, TrendingUp, Leaf, TreePine, ChevronRight } from 'lucide-react'

const LEVELS = [
  {
    id: 'all',
    title: 'All Levels',
    subtitle: 'Complete collection',
    icon: Target,
    glow: 'rgba(59,130,246,0.20)',
    borderHover: 'hover:border-blue-500/40',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    topBar: 'from-blue-500 to-cyan-400',
    dot: 'bg-blue-400',
  },
  {
    id: 'beginner',
    title: 'Beginner',
    subtitle: 'A0 – A1 level',
    icon: Sprout,
    glow: 'rgba(16,185,129,0.20)',
    borderHover: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    topBar: 'from-emerald-500 to-teal-400',
    dot: 'bg-emerald-400',
  },
  {
    id: 'elementary',
    title: 'Elementary',
    subtitle: 'A1 – A2 level',
    icon: BookOpen,
    glow: 'rgba(6,182,212,0.20)',
    borderHover: 'hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    iconColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    topBar: 'from-cyan-500 to-blue-400',
    dot: 'bg-cyan-400',
  },
  {
    id: 'Pre_Intermediate',
    title: 'Pre-Intermediate',
    subtitle: 'A2 – B1 level',
    icon: TrendingUp,
    glow: 'rgba(99,102,241,0.20)',
    borderHover: 'hover:border-indigo-500/40',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    iconColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    topBar: 'from-indigo-500 to-blue-500',
    dot: 'bg-indigo-400',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    subtitle: 'B1 – B2 level',
    icon: Leaf,
    glow: 'rgba(139,92,246,0.20)',
    borderHover: 'hover:border-violet-500/40',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    iconColor: 'text-violet-400',
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    topBar: 'from-violet-500 to-purple-400',
    dot: 'bg-violet-400',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    subtitle: 'B2 – C1 level',
    icon: TreePine,
    glow: 'rgba(245,158,11,0.20)',
    borderHover: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    topBar: 'from-amber-500 to-orange-400',
    dot: 'bg-amber-400',
  },
]

// Counts keyed by card questionCount so the modal stays data-driven
function getCount(baseCount, levelId) {
  if (!baseCount) return '–'
  const map = {
    all:              baseCount * 5,
    beginner:         baseCount,
    elementary:       baseCount,
    Pre_Intermediate: baseCount,
    intermediate:     baseCount,
    advanced:         baseCount,
  }
  return map[levelId] ?? baseCount
}

export default function LevelSelectModal({
  isOpen,
  onClose,
  onSelectLevel,
  // Passed from the parent card
  testType = 'Skill Test',
  questionCount = 15,
}) {
  // ── Transition state ──────────────────────────────────────────────────────
  const [mounted, setMounted]   = useState(false)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // Two rAF ticks so the browser paints the hidden state before animating in
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      )
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 280)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Choose your level"
    >
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{
          transition: 'opacity 250ms ease',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0e1020 0%, #0b0d19 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
          transition: 'opacity 250ms ease, transform 280ms cubic-bezier(0.16,1,0.3,1)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(12px)',
        }}
      >
        {/* top shimmer */}
        <div
          className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)' }}
        />
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-56 h-56 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)', filter: 'blur(36px)' }} />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-44 h-44 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.25) 0%,transparent 70%)', filter: 'blur(30px)' }} />

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Test-type badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-wide truncate"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.22)',
              color: '#a5b4fc',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-indigo-400" />
            {testType}
          </span>

          {/* Question counter + close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-[11px] font-mono text-slate-400">0/{questionCount}</span>
              <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <span className="text-[11px] font-mono font-semibold text-slate-300">1/{questionCount}</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-200 transition-[color,background-color] duration-150"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-6 pb-6">

          {/* Title */}
          <div className="text-center mb-6">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5">
              Select difficulty
            </p>
            <h2 className="text-xl font-bold text-slate-100 mb-1">
              Choose your level
            </h2>
            <p className="text-[13px] text-slate-500">
              Pick the difficulty that fits you best
            </p>
          </div>

          {/* 2 × 3 grid (6 levels) */}
          <div className="grid grid-cols-2 gap-3">
            {LEVELS.map((level, i) => {
              const Icon = level.icon
              const count = getCount(questionCount, level.id)
              return (
                <button
                  key={level.id}
                  onClick={() => { onSelectLevel?.(level.id); onClose() }}
                  className={`group relative text-left rounded-xl border border-white/[0.07] ${level.borderHover} bg-white/[0.03] hover:bg-white/[0.055] active:scale-[0.97] transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60`}
                  style={{
                    // stagger the entrance
                    transitionDelay: visible ? `${i * 40}ms` : '0ms',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(6px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px -8px ${level.glow}` }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* gradient top bar on hover */}
                  <div
                    className={`absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r ${level.topBar} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                  />

                  <div className="p-4">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border mb-3 ${level.iconBg}`}>
                      <Icon className={`w-4 h-4 ${level.iconColor}`} strokeWidth={2} />
                    </div>

                    {/* Title + subtitle */}
                    <p className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors duration-150 mb-0.5 leading-tight">
                      {level.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mb-3">
                      {level.subtitle}
                    </p>

                    {/* Badge + arrow */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${level.badgeBg}`}>
                        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${level.dot}`} />
                        {count} Q
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-slate-600 group-hover:${level.iconColor} group-hover:translate-x-0.5 transition-[color,transform] duration-150`}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
