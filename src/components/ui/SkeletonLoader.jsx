import { memo } from 'react'
import { Loader } from '../common/Loader'

// ── Skeleton card — mirrors the real test-card layout ───────────────────────
export const SkeletonCard = memo(function SkeletonCard({ className = '' }) {
  return (
    <div className={`premium-card min-w-0 p-2.5 sm:p-5 ${className}`}>
      <div className="mb-2.5 flex min-w-0 items-center gap-2 sm:mb-4 sm:gap-3">
        <div className="h-8 w-8 shrink-0 rounded-lg sm:h-12 sm:w-12 sm:rounded-xl skeleton-bone" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-3/4 rounded skeleton-bone" />
          <div className="h-3 w-1/2 rounded skeleton-bone opacity-60" />
        </div>
        <div className="h-6 w-12 shrink-0 rounded-full skeleton-bone" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/5 bg-[#030712]/50 p-1 text-center sm:p-2"
          >
            <div className="h-3 w-4 mx-auto mb-1 rounded skeleton-bone opacity-60" />
            <div className="h-4 w-6 mx-auto rounded skeleton-bone" />
          </div>
        ))}
      </div>
    </div>
  )
})

// ── Skeleton stat card — for dashboard / hero stats ─────────────────────────
export const SkeletonStatCard = memo(function SkeletonStatCard({ index = 0 }) {
  return (
    <div
      className="premium-card min-w-0 p-3 text-center sm:p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-2 flex justify-center sm:mb-3">
        <div className="h-9 w-9 rounded-lg sm:h-12 sm:w-12 sm:rounded-xl skeleton-bone" />
      </div>
      <div className="mb-1.5 h-8 w-16 mx-auto rounded skeleton-bone sm:h-10 sm:w-20" />
      <div className="h-3 w-20 mx-auto rounded skeleton-bone opacity-60" />
    </div>
  )
})

// ── Skeleton row — for student lists, test lists ─────────────────────────────
export const SkeletonRow = memo(function SkeletonRow() {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/5 bg-[#030712]/50 p-2 sm:gap-4 sm:rounded-xl sm:p-4">
      <div className="h-8 w-8 shrink-0 rounded-full sm:h-10 sm:w-10 skeleton-bone" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-4 w-3/4 rounded skeleton-bone" />
        <div className="h-3 w-1/2 rounded skeleton-bone opacity-60" />
      </div>
      <div className="h-6 w-10 shrink-0 rounded-full skeleton-bone" />
    </div>
  )
})

// ── Skeleton grid — grid of SkeletonCards ────────────────────────────────────
export const SkeletonGrid = memo(function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
})

// ── LoadingSpinner — backwards-compat alias ───────────────────────────────────
export const LoadingSpinner = memo(function LoadingSpinner({ size = 'md', text }) {
  return <Loader size={size} text={text} />
})

// ── InlineLoading — spinner + text in a row ──────────────────────────────────
export const InlineLoading = memo(function InlineLoading({ text }) {
  return (
    <div className="flex items-center gap-2">
      <Loader size="sm" />
      {text && <span className="text-sm text-slate-400">{text}</span>}
    </div>
  )
})
