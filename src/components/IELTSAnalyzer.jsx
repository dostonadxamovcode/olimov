import { memo } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'
import { ButtonSpinner } from './common/Loader'

/**
 * IELTSAnalyzer
 * Renders the "Analyze with AI" button + inline error message.
 * Keeps UI concerns separate from analysis logic (handled by useIELTSAnalysis).
 *
 * Props:
 *   onAnalyze   () => void   — called when button is pressed
 *   loading     boolean      — shows spinner and disables button
 *   error       string|null  — renders error banner below the button
 *   disabled    boolean      — additional disabled state (e.g. no transcript yet)
 *   className   string       — extra wrapper classes
 */
export const IELTSAnalyzer = memo(function IELTSAnalyzer({
  onAnalyze,
  loading  = false,
  error    = null,
  disabled = false,
  className = '',
}) {
  const isDisabled = loading || disabled

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* CTA button */}
      <button
        type="button"
        onClick={onAnalyze}
        disabled={isDisabled}
        aria-busy={loading}
        className={[
          'inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl',
          'text-base font-semibold text-white tracking-wide',
          'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500',
          'shadow-lg shadow-purple-500/25',
          'transition-all duration-200',
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:-translate-y-0.5 hover:shadow-purple-500/40 active:translate-y-0',
        ].join(' ')}
      >
        {loading ? (
          <>
            <ButtonSpinner light />
            <span>Analyzing…</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze with AI</span>
          </>
        )}
      </button>

      {/* Loading hint */}
      {loading && (
        <p className="text-slate-400 text-sm animate-pulse text-center">
          AI is evaluating your answer — this usually takes 5–10 seconds…
        </p>
      )}

      {/* Error banner */}
      {!loading && error && (
        <div
          role="alert"
          className="flex items-start gap-3 w-full max-w-lg rounded-2xl border border-red-500/25 px-4 py-3"
          style={{ background: 'rgba(239,68,68,0.08)' }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  )
})
