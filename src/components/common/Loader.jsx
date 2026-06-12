import { memo } from 'react'

// ── Core arc spinner ────────────────────────────────────────────────────────
// Built with conic-gradient + radial-gradient mask — pure CSS, zero SVG IDs,
// 100% GPU composited (only `transform` animates via Tailwind's animate-spin).
//
// Sizes:  xs=16  sm=22  md=36  lg=52  (px)
// Themes: default=brand (sky→violet), light=white (for dark buttons)

const DIMS = {
  xs: { dim: 16, thick: 1.5, dur: '0.7s'  },
  sm: { dim: 22, thick: 2,   dur: '0.75s' },
  md: { dim: 36, thick: 3,   dur: '0.8s'  },
  lg: { dim: 52, thick: 3.5, dur: '0.85s' },
}

export const Spinner = memo(function Spinner({ size = 'md', light = false, className = '' }) {
  const { dim, thick, dur } = DIMS[size] ?? DIMS.md

  const gradient = light
    ? 'conic-gradient(from 180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.32) 55%, transparent 72%)'
    : 'conic-gradient(from 180deg, #0ea5e9 0%, #8b5cf6 55%, transparent 72%)'

  const maskVal = `radial-gradient(farthest-side, transparent calc(100% - ${thick}px - 0.5px), #000 calc(100% - ${thick}px))`

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin ${className}`}
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: gradient,
        WebkitMask: maskVal,
        mask: maskVal,
        animationDuration: dur,
        animationTimingFunction: 'linear',
      }}
    />
  )
})

// ── Loader — spinner + optional label ───────────────────────────────────────
// Backwards-compatible with the old dual-ring Loader API.
export const Loader = memo(function Loader({ size = 'md', text, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} />
      {text && (
        <p className="text-slate-400 text-sm font-medium tracking-wide select-none">
          {text}
        </p>
      )}
    </div>
  )
})

// ── PageLoader — full-screen, anti-flicker 150ms delay ──────────────────────
// Covers Header + Footer during auth init and lazy-chunk route transitions.
// The `loader-enter` class holds opacity:0 for 150ms — fast loads (< 150ms)
// unmount the component before it ever becomes visible, preventing flicker.
export const PageLoader = memo(function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030712] loader-enter">
      <Spinner size="lg" />
    </div>
  )
})

// ── SectionLoader — centered inside a card or content area ──────────────────
export const SectionLoader = memo(function SectionLoader({ text, minH = '200px' }) {
  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: minH }}>
      <Loader size="md" text={text} />
    </div>
  )
})

// ── ButtonSpinner — inline inside submit / action buttons ───────────────────
// light=true  → white arc  (for primary gradient / dark buttons)
// light=false → brand arc  (for secondary / outline buttons)
export const ButtonSpinner = memo(function ButtonSpinner({ light = true }) {
  return <Spinner size="sm" light={light} />
})
