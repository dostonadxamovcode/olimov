import { useEffect, useRef, useCallback } from 'react'
import {
  createExamSession,
  updateExamSessionHeartbeat,
  terminateExamSession,
  completeExamSession,
  getLatestSession,
} from '../services/examSession'

// ── Constants ─────────────────────────────────────────────────────────────────
const HEARTBEAT_MS    = 5_000   // send heartbeat every 5 s
const GAP_THRESHOLD   = 8_000   // gap > 8 s on return = violation
const MOUNT_THRESHOLD = 12_000  // Firestore stale check on mount

const FLAG = (tid, uid) => `xs_${tid}_${uid}`

/**
 * Server-based exam security — heartbeat + inactivity detection.
 *
 * SECURITY IS ALWAYS ACTIVE regardless of test type (practice or real).
 * isPractice was intentionally removed from this hook.
 *
 * Flow:
 *  1. Heartbeat updates Firestore `lastActive` every 5 s while exam is open
 *  2. visibilitychange/pagehide → heartbeat stops, hiddenAt recorded
 *  3. visibilitychange(visible)/pageshow → gap check
 *     gap > 8 s → TERMINATE
 *     gap ≤ 8 s → resume heartbeat
 *  4. On mount (refresh/new tab): Firestore session checked
 *     status=terminated OR lastActive stale → TERMINATE
 */
export function useExamSecurity({
  isActive,
  userId,
  testId,
  levelId,
  testTitle,
  autoSubmit,
}) {
  // ── Refs — updated synchronously on every render ───────────────────────────
  const isActiveRef   = useRef(isActive)
  const userIdRef     = useRef(userId)
  const testIdRef     = useRef(testId)
  const autoSubmitRef = useRef(autoSubmit)

  isActiveRef.current   = isActive
  userIdRef.current     = userId
  testIdRef.current     = testId
  autoSubmitRef.current = autoSubmit

  const sessionIdRef   = useRef(null)
  const terminatedRef  = useRef(false)
  const sessionCreated = useRef(false)
  const heartbeatRef   = useRef(null)
  const hiddenAtRef    = useRef(null)

  // ── startHeartbeat ──────────────────────────────────────────────────────────
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return

    heartbeatRef.current = setInterval(() => {
      const sid = sessionIdRef.current
      if (!sid || terminatedRef.current) return
      updateExamSessionHeartbeat(sid)
        .then(() => console.log('[ExamSecurity] heartbeat sent'))
        .catch(e => console.log('[ExamSecurity] heartbeat error:', e))
    }, HEARTBEAT_MS)

    console.log('[ExamSecurity] heartbeat started')
  }, [])

  // ── stopHeartbeat ───────────────────────────────────────────────────────────
  const stopHeartbeat = useCallback(() => {
    if (!heartbeatRef.current) return
    clearInterval(heartbeatRef.current)
    heartbeatRef.current = null
    console.log('[ExamSecurity] heartbeat stopped')
  }, [])

  // ── terminate ───────────────────────────────────────────────────────────────
  const terminate = useCallback((reason = 'app_switch_or_inactivity') => {
    if (!isActiveRef.current)  { console.log('[ExamSecurity] skip — not active'); return }
    if (terminatedRef.current) { console.log('[ExamSecurity] skip — already terminated'); return }

    terminatedRef.current = true
    stopHeartbeat()

    const uid = userIdRef.current
    const tid = testIdRef.current

    console.log('EXAM TERMINATED — reason:', reason)

    // 1. sessionStorage flag (synchronous — survives page reload and bfcache)
    try { sessionStorage.setItem(FLAG(tid, uid), '1') } catch {}

    // 2. Auto-submit current answers (fire-and-forget)
    try { autoSubmitRef.current?.() } catch {}

    // 3. Firestore session update (fire-and-forget)
    if (sessionIdRef.current) {
      terminateExamSession(sessionIdRef.current, reason)
    }

    // 4. Redirect — window.location works even when React is not rendering
    console.log('[ExamSecurity] redirecting to /exam-terminated')
    window.location.replace('/exam-terminated')
  }, [stopHeartbeat])

  // ── 1. Re-entry check on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || !userId || !testId) return

    const flag = FLAG(testId, userId)

    // Fast path: sessionStorage (no network)
    if (sessionStorage.getItem(flag)) {
      console.log('[ExamSecurity] re-entry blocked (sessionStorage)')
      window.location.replace('/exam-terminated')
      return
    }

    // Slow path: Firestore (handles new browser session / different device)
    getLatestSession(userId, testId).then(session => {
      if (!session) return

      if (session.status === 'terminated') {
        try { sessionStorage.setItem(flag, '1') } catch {}
        console.log('[ExamSecurity] re-entry blocked (Firestore terminated)')
        window.location.replace('/exam-terminated')
        return
      }

      // Check for stale heartbeat on mount (user was away, then refreshed)
      if (session.lastActive) {
        const lastMs = session.lastActive.toMillis?.() ?? (session.lastActive.seconds * 1000)
        const gap    = Date.now() - lastMs
        console.log('[ExamSecurity] mount lastActive gap:', gap, 'ms')
        if (gap > MOUNT_THRESHOLD) {
          console.log('[ExamSecurity] stale session on mount — gap:', gap, 'ms')
          terminate('app_switch_or_inactivity')
        }
      }
    }).catch(() => {})
  }, [isActive, userId, testId, terminate])

  // ── 2. Session creation (once) ─────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || !userId || !testId || sessionCreated.current) return
    sessionCreated.current = true

    createExamSession({ userId, testId, levelId, testTitle })
      .then(id => {
        sessionIdRef.current = id
        console.log('[ExamSecurity] session created:', id)
      })
      .catch(e => console.log('[ExamSecurity] createExamSession error:', e))
    // levelId/testTitle excluded from deps — prevent duplicate creation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, userId, testId])

  // ── 3. Heartbeat + visibility management ──────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    startHeartbeat()

    const onHide = (source) => {
      console.log('[ExamSecurity] page hidden —', source)
      stopHeartbeat()
      hiddenAtRef.current = Date.now()
    }

    const onReturn = (source) => {
      if (!hiddenAtRef.current) return

      const gap = Date.now() - hiddenAtRef.current
      console.log('[ExamSecurity] returned via', source, '— gap:', gap, 'ms')

      if (gap > GAP_THRESHOLD) {
        console.log('[ExamSecurity] VIOLATION — gap:', gap, 'ms > threshold:', GAP_THRESHOLD, 'ms')
        terminate('app_switch_or_inactivity')
      } else {
        console.log('[ExamSecurity] gap OK — resuming heartbeat')
        hiddenAtRef.current = null
        startHeartbeat()
      }
    }

    const onVisibilityChange = () => {
      console.log('[ExamSecurity] visibilitychange —', document.visibilityState)
      if (document.hidden) {
        onHide('visibilitychange')
      } else {
        onReturn('visibilitychange')
      }
    }

    const onPageHide = (e) => {
      console.log('[ExamSecurity] pagehide — persisted:', e.persisted)
      onHide('pagehide')
    }

    const onPageShow = (e) => {
      console.log('[ExamSecurity] pageshow — persisted:', e.persisted)
      if (e.persisted) {
        onReturn('pageshow')
        // Extra guard for bfcache: if exam still active after restore, terminate
        if (!terminatedRef.current && isActiveRef.current) {
          terminate('bfcache_restore')
        }
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      stopHeartbeat()
      console.log('[ExamSecurity] cleanup')
    }
  }, [isActive, startHeartbeat, stopHeartbeat, terminate])

  // ── 4. markCompleted — disarm before normal submit ─────────────────────────
  const markCompleted = useCallback(async () => {
    console.log('[ExamSecurity] markCompleted — disarming')
    terminatedRef.current = true
    stopHeartbeat()

    if (sessionIdRef.current) {
      try { completeExamSession(sessionIdRef.current) } catch {}
    }
    if (userId && testId) {
      try { sessionStorage.removeItem(FLAG(testId, userId)) } catch {}
    }
  }, [userId, testId, stopHeartbeat])

  return { markCompleted }
}
