import { useState, useCallback, useEffect, useRef } from 'react'
import { analyzeIELTSSpeaking } from '../services/geminiAI'

/**
 * useIELTSAnalysis
 *
 * Manages IELTS Speaking AI analysis lifecycle.
 *
 * Usage:
 *   const { result, loading, error, analyze, reset } = useIELTSAnalysis()
 *
 * Auto-trigger mode:
 *   Pass `transcript` and set `autoAnalyze: true`.
 *   The hook will fire automatically whenever the transcript changes and is
 *   non-empty, with a 600 ms debounce so the user finishing their sentence
 *   doesn't trigger mid-word.
 *
 * @param {object}  [opts]
 * @param {string}  [opts.transcript]   — transcript to watch (auto-trigger mode)
 * @param {boolean} [opts.autoAnalyze]  — fire automatically when transcript changes
 * @param {number}  [opts.debounceMs]   — debounce delay in ms (default 600)
 */
export function useIELTSAnalysis({ transcript, autoAnalyze = false, debounceMs = 600 } = {}) {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const abortRef = useRef(null)

  // ── Manual trigger ────────────────────────────────────────────────────────
  const analyze = useCallback(async (text) => {
    const input = text ?? transcript

    if (!input || !input.trim()) {
      setError('No transcript provided. Please record your answer first.')
      return
    }

    // Cancel any in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeIELTSSpeaking(input)
      setResult(data)
    } catch (err) {
      if (err?.name === 'AbortError') return // silently ignore cancellations
      setError(err?.message ?? 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [transcript])

  // ── Auto-trigger with debounce ────────────────────────────────────────────
  useEffect(() => {
    if (!autoAnalyze || !transcript || !transcript.trim()) return

    const timer = setTimeout(() => {
      analyze(transcript)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [transcript, autoAnalyze, debounceMs, analyze])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    abortRef.current?.abort()
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { result, loading, error, analyze, reset }
}
