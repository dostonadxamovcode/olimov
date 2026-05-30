import { useEffect, useRef, useCallback } from 'react'
import {
  createExamSession,
  terminateExamSession,
  completeExamSession,
  getLatestSession,
} from '../services/examSession'

const sessionKey = (testId, userId) => `exam_terminated__${testId}__${userId}`

/**
 * Strict mobile exam security hook.
 *
 * Design principles:
 * - Event listeners attach ONCE on mount (empty deps), read state via refs
 * - All mutable values kept in refs → no stale closures in handlers
 * - window.location.replace used instead of React navigate (works when JS is freezing)
 * - sessionStorage as synchronous first line of defence (survives page reload)
 * - Firestore writes are fire-and-forget (non-blocking on terminate path)
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
  // ── Refs — updated synchronously every render, safe to read from event handlers ──
  const isActiveRef    = useRef(isActive)
  const isPracticeRef  = useRef(isPractice)
  const userIdRef      = useRef(userId)
  const testIdRef      = useRef(testId)
  const autoSubmitRef  = useRef(autoSubmit)

  // Update ALL refs on every render (synchronous — no async gap)
  isActiveRef.current   = isActive
  isPracticeRef.current = isPractice
  userIdRef.current     = userId
  testIdRef.current     = testId
  autoSubmitRef.current = autoSubmit

  const sessionIdRef    = useRef(null)
  const terminatedRef   = useRef(false)
  const sessionCreated  = useRef(false)

  // ── Terminate ref — always current, called by listeners ──────────────────
  // Defined as a ref so listeners never need to re-register
  const terminateRef = useRef(null)
  terminateRef.current = (reason = 'mobile_app_switch') => {
    // Guard: skip if not in active exam, practice mode, or already terminated
    if (!isActiveRef.current || isPracticeRef.current || terminatedRef.current) return
    terminatedRef.current = true

    const uid = userIdRef.current
    const tid = testIdRef.current

    // 1. sessionStorage — SYNCHRONOUS, survives JS freeze and page reload
    if (uid && tid) {
      try { sessionStorage.setItem(sessionKey(tid, uid), 'terminated') } catch {}
    }

    // 2. Auto-submit — fire-and-forget, do NOT await (JS may freeze)
    try { autoSubmitRef.current?.() } catch {}

    // 3. Firestore session update — fire-and-forget
    if (sessionIdRef.current) {
      try { terminateExamSession(sessionIdRef.current, reason) } catch {}
    }

    // 4. Redirect — window.location is synchronous and works even when
    //    React is not rendering (page freeze / component unmount)
    window.location.replace('/exam-terminated')
  }

  // ── 1. Re-entry protection ────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId) return

    const key = sessionKey(testId, userId)

    // Fast path: sessionStorage (synchronous, instant)
    if (sessionStorage.getItem(key) === 'terminated') {
      window.location.replace('/exam-terminated')
      return
    }

    // Slow path: Firestore check (handles new browser session / different device)
    getLatestSession(userId, testId).then(session => {
      if (session?.status === 'terminated') {
        try { sessionStorage.setItem(key, 'terminated') } catch {}
        window.location.replace('/exam-terminated')
      }
    }).catch(() => {})
  }, [isActive, isPractice, userId, testId])

  // ── 2. Session creation — guarded, runs once ──────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId || sessionCreated.current) return
    sessionCreated.current = true

    createExamSession({ userId, testId, levelId, testTitle })
      .then(id => { sessionIdRef.current = id })
      .catch(() => {})
    // NOTE: levelId/testTitle intentionally excluded from deps to prevent
    // duplicate session creation on subsequent renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPractice, userId, testId])

  // ── 3. Event listeners — attached ONCE on mount ───────────────────────────
  // Empty deps array = attach once, never re-register.
  // Handlers read latest state via terminateRef (always current).
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        terminateRef.current('mobile_app_switch')
      }
    }

    // pagehide: iOS Safari swipe-away, back navigation, tab close
    const onPageHide = () => {
      terminateRef.current('mobile_app_switch')
    }

    // capture: true → fires in capture phase before any child handlers
    document.addEventListener('visibilitychange', onVisibilityChange, true)
    window.addEventListener('pagehide', onPageHide, true)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange, true)
      window.removeEventListener('pagehide', onPageHide, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — handlers read state through refs

  // ── 4. markCompleted — call BEFORE navigating on normal submit ────────────
  const markCompleted = useCallback(async () => {
    // Disarm listeners — prevents false positive when React Router navigates away
    terminatedRef.current = true

    if (sessionIdRef.current) {
      try { completeExamSession(sessionIdRef.current) } catch {}
    }
    if (userId && testId) {
      try { sessionStorage.removeItem(sessionKey(testId, userId)) } catch {}
    }
  }, [userId, testId])

  return { markCompleted }
}
