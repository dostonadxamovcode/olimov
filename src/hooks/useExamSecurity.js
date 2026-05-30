import { useEffect, useRef, useCallback } from 'react'
import {
  createExamSession,
  terminateExamSession,
  completeExamSession,
  getLatestSession,
} from '../services/examSession'

const sessionKey = (testId, userId) => `exam_terminated__${testId}__${userId}`

/**
 * Multi-layer mobile exam security hook.
 *
 * ROOT CAUSE OF PREVIOUS FAILURE:
 * - iOS Safari puts page into bfcache on pagehide → window.location.replace is cancelled
 * - Android Chrome defers navigation started in background → user sees exam briefly on return
 *
 * FIX:
 * - Add `pageshow` listener: when page is restored from bfcache, immediately check sessionStorage
 * - Add `visibilitychange` visible check: when page becomes visible again, check sessionStorage
 * - Both paths call checkTerminated() which synchronously redirects if session is terminated
 *
 * Layers:
 *   1. visibilitychange (hidden)  → terminate + set sessionStorage
 *   2. pagehide                   → terminate + set sessionStorage
 *   3. visibilitychange (visible) → checkTerminated (catches deferred nav failure)
 *   4. pageshow (persisted=true)  → checkTerminated (catches iOS bfcache restoration)
 *   5. window blur + hidden       → terminate (extra coverage)
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
  // ── Refs — updated synchronously every render ──────────────────────────────
  const isActiveRef    = useRef(isActive)
  const isPracticeRef  = useRef(isPractice)
  const userIdRef      = useRef(userId)
  const testIdRef      = useRef(testId)
  const autoSubmitRef  = useRef(autoSubmit)

  // Synchronous update — no useEffect lag
  isActiveRef.current   = isActive
  isPracticeRef.current = isPractice
  userIdRef.current     = userId
  testIdRef.current     = testId
  autoSubmitRef.current = autoSubmit

  const sessionIdRef   = useRef(null)
  const terminatedRef  = useRef(false)
  const sessionCreated = useRef(false)

  // ── Terminate — ref so listeners always call latest version ───────────────
  const terminateRef = useRef(null)
  terminateRef.current = (source = 'unknown') => {
    if (!isActiveRef.current)   { console.log('[ExamSecurity] skip — exam not active'); return }
    if (isPracticeRef.current)  { console.log('[ExamSecurity] skip — practice mode');   return }
    if (terminatedRef.current)  { console.log('[ExamSecurity] skip — already terminated'); return }

    terminatedRef.current = true
    console.log('[ExamSecurity] TERMINATING EXAM — source:', source)

    const uid = userIdRef.current
    const tid = testIdRef.current

    // Step 1 — sessionStorage: SYNCHRONOUS, survives bfcache + page reload
    if (uid && tid) {
      try {
        sessionStorage.setItem(sessionKey(tid, uid), 'terminated')
        console.log('[ExamSecurity] sessionStorage set')
      } catch (e) {
        console.log('[ExamSecurity] sessionStorage error', e)
      }
    }

    // Step 2 — auto-submit: fire-and-forget (do NOT await — page may freeze)
    try {
      autoSubmitRef.current?.()
      console.log('[ExamSecurity] autoSubmit fired')
    } catch (e) {
      console.log('[ExamSecurity] autoSubmit error', e)
    }

    // Step 3 — Firestore: fire-and-forget
    if (sessionIdRef.current) {
      try {
        terminateExamSession(sessionIdRef.current, source)
        console.log('[ExamSecurity] Firestore terminate fired — sessionId:', sessionIdRef.current)
      } catch (e) {
        console.log('[ExamSecurity] Firestore error', e)
      }
    } else {
      console.log('[ExamSecurity] no sessionId yet — Firestore update skipped')
    }

    // Step 4 — redirect: window.location works even when JS is semi-frozen
    // NOTE: on iOS this may be cancelled by bfcache — pageshow handler catches that case
    console.log('[ExamSecurity] calling window.location.replace')
    window.location.replace('/exam-terminated')
  }

  // ── Re-entry check: runs when session is found terminated ─────────────────
  // Called from multiple places (mount, visibilitychange-visible, pageshow)
  const checkTerminatedRef = useRef(null)
  checkTerminatedRef.current = () => {
    const uid = userIdRef.current
    const tid = testIdRef.current
    if (!uid || !tid || isPracticeRef.current) return

    const key = sessionKey(tid, uid)
    if (sessionStorage.getItem(key) === 'terminated') {
      console.log('[ExamSecurity] terminated session in sessionStorage — redirecting')
      window.location.replace('/exam-terminated')
    }
  }

  // ── 1. Re-entry protection on mount ───────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId) return

    console.log('[ExamSecurity] re-entry check — userId:', userId, 'testId:', testId)

    const key = sessionKey(testId, userId)

    // Fast path: sessionStorage (synchronous)
    if (sessionStorage.getItem(key) === 'terminated') {
      console.log('[ExamSecurity] sessionStorage terminated on mount — blocking')
      window.location.replace('/exam-terminated')
      return
    }

    // Slow path: Firestore (handles new browser session or different device)
    getLatestSession(userId, testId)
      .then(session => {
        console.log('[ExamSecurity] Firestore session on mount:', session?.status)
        if (session?.status === 'terminated') {
          try { sessionStorage.setItem(key, 'terminated') } catch {}
          window.location.replace('/exam-terminated')
        }
      })
      .catch(e => console.log('[ExamSecurity] getLatestSession error', e))
  }, [isActive, isPractice, userId, testId])

  // ── 2. Session creation — exactly once ────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId || sessionCreated.current) return
    sessionCreated.current = true

    console.log('[ExamSecurity] creating Firestore session')
    createExamSession({ userId, testId, levelId, testTitle })
      .then(id => {
        sessionIdRef.current = id
        console.log('[ExamSecurity] session created:', id)
      })
      .catch(e => console.log('[ExamSecurity] createExamSession error', e))
    // levelId/testTitle excluded from deps — prevents duplicate session creation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPractice, userId, testId])

  // ── 3. Event listeners — attached ONCE on mount ───────────────────────────
  useEffect(() => {
    console.log('[ExamSecurity] ExamPage mounted — attaching listeners')

    // ── Layer 1: visibilitychange ─────────────────────────────────────────
    const onVisibilityChange = () => {
      const hidden = document.hidden
      const state  = document.visibilityState
      console.log('[ExamSecurity] visibilitychange — hidden:', hidden, 'state:', state)

      if (hidden) {
        // Page going to background → terminate
        console.log('[ExamSecurity] VISIBILITY LOST — APP SWITCH DETECTED')
        terminateRef.current('visibilitychange')
      } else {
        // Page becoming visible again.
        // FIX: if terminate() ran but navigation was deferred (Android bfcache/background),
        // check sessionStorage now and redirect synchronously.
        console.log('[ExamSecurity] page visible again — checking terminated state')
        checkTerminatedRef.current()
      }
    }

    // ── Layer 2: pagehide ─────────────────────────────────────────────────
    // Fires on iOS Safari when user swipes app away, presses home, or opens another app.
    // Also fires before bfcache entry.
    const onPageHide = (e) => {
      console.log('[ExamSecurity] pagehide — persisted:', e.persisted)
      console.log('[ExamSecurity] PAGEHIDE VIOLATION')
      terminateRef.current('pagehide')
    }

    // ── Layer 3: pageshow ─────────────────────────────────────────────────
    // CRITICAL FIX for iOS bfcache:
    // When iOS Safari restores page from bfcache (persisted=true), the previous
    // window.location.replace() call was silently cancelled. We must check here.
    const onPageShow = (e) => {
      console.log('[ExamSecurity] pageshow — persisted:', e.persisted)
      if (e.persisted) {
        // Page was restored from bfcache — previous terminate/redirect was cancelled
        console.log('[ExamSecurity] bfcache restore detected — rechecking terminated state')
        checkTerminatedRef.current()

        // Also re-attempt terminate if exam was active (handles case where
        // visibilitychange fired but terminate() didn't complete)
        if (isActiveRef.current && !isPracticeRef.current) {
          const key = sessionKey(testIdRef.current, userIdRef.current)
          // If not yet marked terminated in sessionStorage but exam was hidden → terminate now
          // (This is a catch-all for any race condition during bfcache transition)
          if (!terminatedRef.current && sessionStorage.getItem(key) !== 'terminated') {
            console.log('[ExamSecurity] bfcache restore with active exam — terminating')
            terminateRef.current('bfcache_restore')
          }
        }
      }
    }

    // ── Layer 4: window blur (extra coverage) ─────────────────────────────
    // Only terminate when page is ALSO hidden — prevents false positives
    // from keyboard open, in-page focus changes, alerts.
    const onWindowBlur = () => {
      console.log('[ExamSecurity] window.blur — visibilityState:', document.visibilityState)
      if (document.visibilityState === 'hidden') {
        console.log('[ExamSecurity] BLUR VIOLATION (page hidden)')
        terminateRef.current('blur')
      }
    }

    // capture:true = fires before any child handler, cannot be stopped by stopPropagation
    document.addEventListener('visibilitychange', onVisibilityChange, true)
    window.addEventListener('pagehide',           onPageHide,          true)
    window.addEventListener('pageshow',           onPageShow,          true)
    window.addEventListener('blur',               onWindowBlur,        true)

    console.log('[ExamSecurity] all listeners attached')

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange, true)
      window.removeEventListener('pagehide',           onPageHide,          true)
      window.removeEventListener('pageshow',           onPageShow,          true)
      window.removeEventListener('blur',               onWindowBlur,        true)
      console.log('[ExamSecurity] listeners removed (component unmount)')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — reads all state through refs

  // ── 4. markCompleted — disarms listeners before normal submit ─────────────
  const markCompleted = useCallback(async () => {
    console.log('[ExamSecurity] markCompleted — disarming')
    // Prevent listeners from triggering during React Router navigation
    terminatedRef.current = true

    if (sessionIdRef.current) {
      try {
        completeExamSession(sessionIdRef.current)
        console.log('[ExamSecurity] session marked completed')
      } catch (e) {
        console.log('[ExamSecurity] completeExamSession error', e)
      }
    }
    if (userId && testId) {
      try { sessionStorage.removeItem(sessionKey(testId, userId)) } catch {}
    }
  }, [userId, testId])

  return { markCompleted }
}
