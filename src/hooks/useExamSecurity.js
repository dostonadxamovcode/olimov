import { useEffect, useRef, useCallback } from 'react'
import {
  createExamSession,
  terminateExamSession,
  completeExamSession,
  getLatestSession,
} from '../services/examSession'

/**
 * ROOT CAUSE OF PREVIOUS FAILURES
 * ─────────────────────────────────
 * Problem 1 (iOS Safari — bfcache):
 *   visibilitychange fires → window.location.replace('/exam-terminated') is called
 *   BUT iOS puts page into bfcache and CANCELS the navigation silently.
 *   User returns → sees exam page again → thinks security didn't work.
 *   FIX: listen to `pageshow` (e.persisted=true) → check sessionStorage → redirect.
 *
 * Problem 2 (Android Chrome — deferred navigation):
 *   visibilitychange fires in background → window.location.replace is QUEUED.
 *   User returns → Chrome processes queue → brief exam flash → then /exam-terminated.
 *   FIX: listen to `visibilitychange` VISIBLE → check sessionStorage → redirect immediately.
 *
 * sessionStorage is the synchronous source of truth.
 * It is set INSTANTLY when violation is detected.
 * Every path that could show the exam page again checks it.
 */

const FLAG = (testId, userId) => `xs_${testId}_${userId}`

export function useExamSecurity({
  isActive,
  isPractice = false,
  userId,
  testId,
  levelId,
  testTitle,
  autoSubmit,
}) {
  // ── Refs: updated synchronously every render, safe to read from any event ──
  const isActiveRef   = useRef(isActive)
  const isPracticeRef = useRef(isPractice)
  const userIdRef     = useRef(userId)
  const testIdRef     = useRef(testId)
  const autoSubmitRef = useRef(autoSubmit)

  isActiveRef.current   = isActive
  isPracticeRef.current = isPractice
  userIdRef.current     = userId
  testIdRef.current     = testId
  autoSubmitRef.current = autoSubmit

  const sessionIdRef   = useRef(null)
  const terminatedRef  = useRef(false)
  const sessionCreated = useRef(false)

  // ── 1. Re-entry block: runs when isActive first becomes true ───────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId) return

    const flag = FLAG(testId, userId)

    // Fast path (sessionStorage)
    if (sessionStorage.getItem(flag)) {
      console.log('[ExamSecurity] re-entry blocked via sessionStorage')
      window.location.replace('/exam-terminated')
      return
    }

    // Slow path (Firestore — catches new browser session / different device)
    getLatestSession(userId, testId)
      .then(s => {
        if (s?.status === 'terminated') {
          try { sessionStorage.setItem(FLAG(testId, userId), '1') } catch {}
          console.log('[ExamSecurity] re-entry blocked via Firestore')
          window.location.replace('/exam-terminated')
        }
      })
      .catch(() => {})
  }, [isActive, isPractice, userId, testId])

  // ── 2. Session creation: exactly once ──────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId || sessionCreated.current) return
    sessionCreated.current = true

    createExamSession({ userId, testId, levelId, testTitle })
      .then(id => { sessionIdRef.current = id })
      .catch(() => {})
    // levelId/testTitle excluded from deps — prevents duplicate session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPractice, userId, testId])

  // ── 3. Core event listeners ────────────────────────────────────────────────
  // Attached ONCE on mount. Handlers read all mutable values through refs.
  // No dependency on any prop/state → never removed and re-added unexpectedly.
  useEffect(() => {
    console.log('[ExamSecurity] mounted — listeners attached')

    // ── Internal helpers ────────────────────────────────────────────────────

    // terminate: called when violation is detected
    const terminate = (source) => {
      if (!isActiveRef.current) {
        console.log('[ExamSecurity] terminate skipped — exam not active')
        return
      }
      if (isPracticeRef.current) {
        console.log('[ExamSecurity] terminate skipped — practice mode')
        return
      }
      if (terminatedRef.current) {
        console.log('[ExamSecurity] terminate skipped — already ran')
        return
      }

      terminatedRef.current = true

      const uid = userIdRef.current
      const tid = testIdRef.current

      console.log('APP SWITCH DETECTED')
      console.log('VISIBILITY LOST')
      console.log('EXAM TERMINATED — source:', source)

      // Step 1: sessionStorage — SYNCHRONOUS, the only reliable signal
      //         survives bfcache, page freeze, JS engine pause
      try { sessionStorage.setItem(FLAG(tid, uid), '1') } catch {}

      // Step 2: auto-submit — fire-and-forget (do NOT await)
      try { autoSubmitRef.current?.() } catch {}

      // Step 3: Firestore — fire-and-forget
      if (sessionIdRef.current) {
        try { terminateExamSession(sessionIdRef.current, source) } catch {}
      }

      // Step 4: redirect — may be deferred or cancelled by mobile browser
      //         That's OK — checkTerminated() catches the case on return
      console.log('[ExamSecurity] redirecting to /exam-terminated')
      window.location.replace('/exam-terminated')
    }

    // checkTerminated: called when page BECOMES visible again.
    // Handles cases where the initial redirect was blocked/deferred.
    const checkTerminated = () => {
      if (isPracticeRef.current) return
      const uid = userIdRef.current
      const tid = testIdRef.current
      if (!uid || !tid) return

      try {
        if (sessionStorage.getItem(FLAG(tid, uid))) {
          console.log('[ExamSecurity] violation found on return — redirecting')
          window.location.replace('/exam-terminated')
        }
      } catch {}
    }

    // ── Layer 1: visibilitychange ───────────────────────────────────────────
    // PRIMARY — fires on home button, app switch, tab change on all platforms
    const onVisibilityChange = () => {
      console.log('[ExamSecurity] visibilitychange —',
        document.hidden ? 'HIDDEN' : 'VISIBLE',
        '| state:', document.visibilityState)

      if (document.hidden) {
        terminate('visibilitychange')
      } else {
        // Page became visible again.
        // This is the FIX for Android deferred navigation:
        // terminate() already ran and set sessionStorage, but redirect was queued.
        // When user returns, we redirect here immediately.
        checkTerminated()
      }
    }

    // ── Layer 2: pagehide ───────────────────────────────────────────────────
    // iOS Safari: fires on home button, app switch, back navigation, bfcache entry
    const onPageHide = (e) => {
      console.log('[ExamSecurity] pagehide — persisted:', e.persisted)
      terminate('pagehide')
    }

    // ── Layer 3: pageshow ───────────────────────────────────────────────────
    // THE KEY FIX for iOS bfcache:
    // When iOS restores page from bfcache, the previous window.location.replace
    // was silently cancelled. pageshow(persisted=true) is our second chance.
    const onPageShow = (e) => {
      console.log('[ExamSecurity] pageshow — persisted:', e.persisted)
      if (e.persisted) {
        // Page was restored from bfcache — check if we need to redirect
        checkTerminated()
        // Also re-terminate if exam is active (handles edge case where
        // terminate() didn't complete before page was frozen)
        if (!terminatedRef.current && isActiveRef.current && !isPracticeRef.current) {
          terminate('bfcache_restore')
        }
      }
    }

    // ── Layer 4: window blur ────────────────────────────────────────────────
    // Extra coverage. Only acts when page is also hidden to avoid false
    // positives from on-screen keyboard, in-page focus changes, alerts.
    const onBlur = () => {
      console.log('[ExamSecurity] window.blur — visibilityState:', document.visibilityState)
      if (document.visibilityState === 'hidden') {
        terminate('blur')
      }
    }

    // capture: true → fires before any child handler, even if child calls stopPropagation
    document.addEventListener('visibilitychange', onVisibilityChange, true)
    window.addEventListener('pagehide', onPageHide, true)
    window.addEventListener('pageshow', onPageShow, true)
    window.addEventListener('blur',     onBlur,     true)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange, true)
      window.removeEventListener('pagehide', onPageHide, true)
      window.removeEventListener('pageshow', onPageShow, true)
      window.removeEventListener('blur',     onBlur,     true)
      console.log('[ExamSecurity] listeners removed')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — all state read through refs

  // ── 4. markCompleted: disarms security before normal navigate ─────────────
  const markCompleted = useCallback(async () => {
    console.log('[ExamSecurity] markCompleted — disarming')
    terminatedRef.current = true // prevents false trigger on React Router navigate

    if (sessionIdRef.current) {
      try { completeExamSession(sessionIdRef.current) } catch {}
    }
    if (userId && testId) {
      try { sessionStorage.removeItem(FLAG(testId, userId)) } catch {}
    }
  }, [userId, testId])

  return { markCompleted }
}
