import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createExamSession,
  terminateExamSession,
  getLatestSession,
} from '../services/examSession'

const SESSION_KEY = (testId, userId) => `exam_session__${testId}__${userId}`

/**
 * Strict mobile exam security hook.
 *
 * @param {object} opts
 * @param {boolean}  opts.isActive      - true only when exam is fully loaded and running
 * @param {boolean}  opts.isPractice    - skip security for practice/demo mode
 * @param {string}   opts.userId        - Firebase UID or 'anonymous'
 * @param {string}   opts.testId        - Firestore test document ID
 * @param {string}   [opts.levelId]     - level code (a1, b2, …)
 * @param {string}   [opts.testTitle]   - display title
 * @param {Function} opts.autoSubmit    - async fn that saves the result before termination
 * @returns {{ markCompleted: Function }} - call on normal submit
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
  const navigate       = useNavigate()
  const sessionIdRef   = useRef(null)
  const terminatedRef  = useRef(false)     // prevents double-fire
  const autoSubmitRef  = useRef(autoSubmit)

  // Keep autoSubmit ref current without re-attaching listeners
  useEffect(() => { autoSubmitRef.current = autoSubmit }, [autoSubmit])

  // ── 1. Check for existing terminated session ──────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId) return

    // Fast path: sessionStorage flag set during this browser session
    const stored = sessionStorage.getItem(SESSION_KEY(testId, userId))
    if (stored === 'terminated') {
      navigate('/exam-terminated', { replace: true })
      return
    }

    // Slow path: Firestore query (handles page refresh + new tab)
    getLatestSession(userId, testId).then(session => {
      if (session && session.status === 'terminated') {
        sessionStorage.setItem(SESSION_KEY(testId, userId), 'terminated')
        navigate('/exam-terminated', { replace: true })
      }
    })
  }, [isActive, isPractice, userId, testId, navigate])

  // ── 2. Create Firestore session ───────────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId) return

    createExamSession({ userId, testId, levelId, testTitle }).then(id => {
      sessionIdRef.current = id
    })
  }, [isActive, isPractice, userId, testId, levelId, testTitle])

  // ── 3. Terminate handler (runs once) ─────────────────────────────────────
  const terminate = useCallback(async (reason = 'mobile_app_switch') => {
    if (terminatedRef.current) return
    terminatedRef.current = true

    // 3a. Auto-submit answers (fire-and-forget — do not await result)
    try { await autoSubmitRef.current?.() } catch { /* ignore */ }

    // 3b. Update Firestore session
    if (sessionIdRef.current) {
      terminateExamSession(sessionIdRef.current, reason) // fire-and-forget
    }

    // 3c. Mark in sessionStorage so page refresh is also blocked
    if (userId && testId) {
      sessionStorage.setItem(SESSION_KEY(testId, userId), 'terminated')
    }

    // 3d. Navigate immediately — don't wait for Firestore
    navigate('/exam-terminated', { replace: true })
  }, [navigate, userId, testId])

  // ── 4. Visibility API listeners ───────────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice) return

    const onVisibility = () => {
      if (document.hidden) terminate('mobile_app_switch')
    }

    // pagehide fires on iOS Safari when user swipes the app away
    const onPageHide = (e) => {
      // e.persisted = true means page entered bfcache (back-forward cache),
      // not a real navigation away. Still terminate to be strict.
      terminate('mobile_app_switch')
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [isActive, isPractice, terminate])

  // ── 5. markCompleted — call on normal exam finish ─────────────────────────
  const markCompleted = useCallback(async () => {
    // Prevent the pagehide/visibilitychange from firing during navigation
    terminatedRef.current = true

    if (sessionIdRef.current) {
      const { completeExamSession } = await import('../services/examSession')
      completeExamSession(sessionIdRef.current)
    }
    if (userId && testId) {
      sessionStorage.removeItem(SESSION_KEY(testId, userId))
    }
  }, [userId, testId])

  return { markCompleted }
}
