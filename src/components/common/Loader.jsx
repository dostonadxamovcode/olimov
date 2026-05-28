import { memo } from 'react'

/**
 * Dual-ring spinner — blue outer ring, purple inner ring (counter-rotating).
 * Three sizes: sm | md | lg
 * Optional label below the spinner.
 */
export const Loader = memo(function Loader({ size = 'md', text, className = '' }) {
  const ring = {
    sm: 'w-6 h-6 border-[2px]',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-14 h-14 border-[3px]',
  }
  const inner = {
    sm: 'inset-[3px]',
    md: 'inset-[4px]',
    lg: 'inset-[5px]',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer ring — blue, clockwise */}
        <div
          className={`${ring[size]} rounded-full border-white/10 border-t-blue-500 animate-spin`}
        />
        {/* Inner ring — purple, counter-clockwise */}
        <div
          className={`absolute ${inner[size]} rounded-full border-[2px] border-white/5 border-b-purple-500 animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '0.55s' }}
        />
      </div>
      {text && (
        <p className="text-slate-400 text-sm font-medium tracking-wide select-none">
          {text}
        </p>
      )}
    </div>
  )
})

/**
 * Full-screen centered loader — use for page-level suspense / route fallback.
 */
export const PageLoader = memo(function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#080c14]/70 backdrop-blur-sm z-50">
      <Loader size="lg" />
    </div>
  )
})

/**
 * Section-centered loader — use inside cards or content areas.
 * min-h keeps layout stable during loading.
 */
export const SectionLoader = memo(function SectionLoader({ text, minH = '200px' }) {
  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: minH }}>
      <Loader size="md" text={text} />
    </div>
  )
})

/**
 * Tiny white spinner for inside buttons (Submit / Save states).
 */
export const ButtonSpinner = memo(function ButtonSpinner() {
  return (
    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  )
})
