import { useEffect, useRef, useCallback } from 'react'
import {
  createExamSession,
  terminateExamSession,
  completeExamSession,
  getLatestSession,
} from '../services/examSession'

const sessionKey = (testId, userId) => `exam_terminated__${testId}__${userId}`

const DEV = import.meta.env.DEV

function dbg(...args) {
  if (DEV) console.log('[ExamSecurity]', ...args)
}

/**
 * Multi-layer mobile exam security hook.
 *
 * Layers:
 *  1. visibilitychange  — primary (Android + iOS, fires on home/app switch)
 *  2. pagehide          — iOS Safari bfcache, swipe-away
 *  3. window blur       — additional coverage (only when page is also hidden)
 *
 * All values read through refs → listeners attached ONCE on mount → no stale closures.
 * window.location.replace() used (not React navigate) → works even when JS is freezing.
 */
export function useExamSecurity({
  isActive,
  isPractice = false,
  userId,
  testId,
  levelId,
  testTitle,
  autoSubmit,
}) {
  dbg('hook render — isActive:', isActive, 'isPractice:', isPractice, 'testId:', testId)

  // ── Refs updated synchronously every render (no useEffect lag) ─────────────
  const isActiveRef    = useRef(isActive)
  const isPracticeRef  = useRef(isPractice)
  const userIdRef      = useRef(userId)
  const testIdRef      = useRef(testId)
  const autoSubmitRef  = useRef(autoSubmit)

  isActiveRef.current   = isActive
  isPracticeRef.current = isPractice
  userIdRef.current     = userId
  testIdRef.current     = testId
  autoSubmitRef.current = autoSubmit

  const sessionIdRef   = useRef(null)
  const terminatedRef  = useRef(false)
  const sessionCreated = useRef(false)

  // ── Terminate — ref so event handlers always call latest version ──────────
  const terminateRef = useRef(null)
  terminateRef.current = (source = 'unknown') => {
    if (!isActiveRef.current) {
      dbg('terminate called but exam not active, skipping —', source)
      return
    }
    if (isPracticeRef.current) {
      dbg('terminate called but practice mode, skipping —', source)
      return
    }
    if (terminatedRef.current) {
      dbg('terminate already ran, skipping —', source)
      return
    }

    terminatedRef.current = true
    dbg('TERMINATE STARTED —', source)

    const uid = userIdRef.current
    const tid = testIdRef.current

    // Step 1: sessionStorage — synchronous, works even when JS engine freezes
    if (uid && tid) {
      try {
        sessionStorage.setItem(sessionKey(tid, uid), 'terminated')
        dbg('sessionStorage set')
      } catch (e) {
        dbg('sessionStorage failed', e)
      }
    }

    // Step 2: Auto-submit answers — fire-and-forget (do NOT await)
    try {
      autoSubmitRef.current?.()
      dbg('autoSubmit fired')
    } catch (e) {
      dbg('autoSubmit error', e)
    }

    // Step 3: Firestore session update — fire-and-forget
    if (sessionIdRef.current) {
      try {
        terminateExamSession(sessionIdRef.current, source)
        dbg('firestore terminate fired — sessionId:', sessionIdRef.current)
      } catch (e) {
        dbg('firestore terminate error', e)
      }
    } else {
      dbg('no sessionId yet, skipping firestore update')
    }

    // Step 4: Redirect — window.location works even when React is not rendering
    dbg('redirect to /exam-terminated')
    window.location.replace('/exam-terminated')
  }

  // ── 1. Re-entry protection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId) return

    dbg('checking re-entry — userId:', userId, 'testId:', testId)

    const key = sessionKey(testId, userId)

    // Fast path — synchronous sessionStorage check
    if (sessionStorage.getItem(key) === 'terminated') {
      dbg('sessionStorage says terminated — blocking re-entry')
      window.location.replace('/exam-terminated')
      return
    }

    // Slow path — Firestore check (catches new browser session / different device)
    getLatestSession(userId, testId)
      .then(session => {
        dbg('Firestore session:', session?.status)
        if (session?.status === 'terminated') {
          try { sessionStorage.setItem(key, 'terminated') } catch {}
          window.location.replace('/exam-terminated')
        }
      })
      .catch(e => dbg('getLatestSession error', e))
  }, [isActive, isPractice, userId, testId])

  // ── 2. Session creation — runs once ───────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId || sessionCreated.current) return
    sessionCreated.current = true

    dbg('creating Firestore session')
    createExamSession({ userId, testId, levelId, testTitle })
      .then(id => {
        sessionIdRef.current = id
        dbg('session created — id:', id)
      })
      .catch(e => dbg('createExamSession error', e))
    // levelId/testTitle excluded from deps to prevent double creation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPractice, userId, testId])

  // ── 3. Multi-layer event listeners — attached ONCE on mount ───────────────
  // Empty deps [] — handlers read latest state via refs, never re-register.
  useEffect(() => {
    dbg('attaching event listeners')

    // Layer 1: visibilitychange — PRIMARY (Android home button, app switch, tab switch)
    const onVisibilityChange = () => {
      dbg('visibilitychange fired — hidden:', document.hidden,
          'visibilityState:', document.visibilityState)
      if (document.hidden) {
        dbg('VISIBILITY VIOLATION')
        terminateRef.current('visibilitychange')
      }
    }

    // Layer 2: pagehide — iOS Safari swipe-away, back navigation, bfcache
    const onPageHide = () => {
      dbg('PAGEHIDE VIOLATION')
      terminateRef.current('pagehide')
    }

    // Layer 3: window blur — extra coverage
    // Only terminate when page is also hidden to avoid false positives
    // from keyboard open, alerts, in-page focus changes.
    const onWindowBlur = () => {
      dbg('blur fired — visibilityState:', document.visibilityState)
      // A keyboard open on mobile does NOT hide the page, so this guard is safe
      if (document.visibilityState === 'hidden') {
        dbg('BLUR VIOLATION (page also hidden)')
        terminateRef.current('blur')
      } else {
        dbg('blur fired but page still visible — likely keyboard/alert, ignoring')
      }
    }

    // capture:true = fires in capture phase (before child handlers)
    document.addEventListener('visibilitychange', onVisibilityChange, true)
    window.addEventListener('pagehide',           onPageHide,          true)
    window.addEventListener('blur',               onWindowBlur,        true)

    dbg('listeners attached')

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange, true)
      window.removeEventListener('pagehide',           onPageHide,          true)
      window.removeEventListener('blur',               onWindowBlur,        true)
      dbg('listeners removed (cleanup)')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — state is read through refs

  // ── 4. markCompleted — call before navigating on normal submit ─────────────
  const markCompleted = useCallback(async () => {
    dbg('markCompleted called — disarming listeners')
    // Disarm all listeners before navigating away (prevents false positive)
    terminatedRef.current = true

    if (sessionIdRef.current) {
      try {
        completeExamSession(sessionIdRef.current)
        dbg('session marked completed')
      } catch (e) {
        dbg('completeExamSession error', e)
      }
    }
    if (userId && testId) {
      try { sessionStorage.removeItem(sessionKey(testId, userId)) } catch {}
    }
  }, [userId, testId])

  return { markCompleted }
}
