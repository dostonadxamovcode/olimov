import { useEffect, useRef, useCallback } from 'react'
import {
  createExamSession,
  updateExamSessionHeartbeat,
  terminateExamSession,
  completeExamSession,
  getLatestSession,
} from '../services/examSession'

// ── Constants ─────────────────────────────────────────────────────────────────
const HEARTBEAT_MS   = 5_000   // send heartbeat every 5 s
const GAP_THRESHOLD  = 8_000   // gap > 8 s after returning = violation
const MOUNT_THRESHOLD = 15_000  // Firestore check on mount (larger = tolerates clock skew)

const FLAG = (tid, uid) => `xs_${tid}_${uid}`

/**
 * Server-based exam security — heartbeat + inactivity detection.
 *
 * HOW IT WORKS:
 *   1. When exam is active: heartbeat updates Firestore `lastActive` every 5 s
 *   2. When user leaves (app switch, home button, tab change):
 *        visibilitychange/pagehide fires → heartbeat STOPS → hiddenAt recorded
 *   3. When user RETURNS:
 *        visibilitychange(visible) / pageshow fires →
 *        if (Date.now() - hiddenAt > 8 s) → TERMINATE
 *        else → restart heartbeat (user was away briefly, OK)
 *   4. On every mount (refresh, new tab):
 *        Firestore session checked → if terminated OR lastActive stale → TERMINATE
 *
 * NOTE: visibilitychange / pagehide are only used to CONTROL the heartbeat
 * and to CHECK on return. They do NOT trigger instant termination anymore.
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
  // Refs — updated synchronously every render
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
  const heartbeatRef   = useRef(null)   // setInterval id
  const hiddenAtRef    = useRef(null)   // timestamp when page was hidden

  // ── startHeartbeat ──────────────────────────────────────────────────────────
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return // already running

    heartbeatRef.current = setInterval(() => {
      const sid = sessionIdRef.current
      if (!sid || terminatedRef.current) return
      updateExamSessionHeartbeat(sid)
        .then(() => console.log('[ExamSecurity] heartbeat sent'))
        .catch(e => console.log('[ExamSecurity] heartbeat error:', e))
    }, HEARTBEAT_MS)

    console.log('[ExamSecurity] heartbeat started (every', HEARTBEAT_MS, 'ms)')
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
    if (!isActiveRef.current)  { console.log('[ExamSecurity] terminate skipped — not active'); return }
    if (isPracticeRef.current) { console.log('[ExamSecurity] terminate skipped — practice');   return }
    if (terminatedRef.current) { console.log('[ExamSecurity] terminate skipped — already done'); return }

    terminatedRef.current = true
    stopHeartbeat()

    const uid = userIdRef.current
    const tid = testIdRef.current

    console.log('EXAM TERMINATED — reason:', reason)

    // 1. sessionStorage flag (synchronous, survives reload)
    try { sessionStorage.setItem(FLAG(tid, uid), '1') } catch {}

    // 2. Auto-submit current answers (fire-and-forget)
    try { autoSubmitRef.current?.() } catch {}

    // 3. Firestore session update (fire-and-forget)
    if (sessionIdRef.current) {
      terminateExamSession(sessionIdRef.current, reason)
    }

    // 4. Redirect
    window.location.replace('/exam-terminated')
  }, [stopHeartbeat])

  // ── 1. Re-entry check (on mount and when isActive first becomes true) ───────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId) return

    const flag = FLAG(testId, userId)

    // Fast path: sessionStorage (no network)
    if (sessionStorage.getItem(flag)) {
      console.log('[ExamSecurity] re-entry blocked (sessionStorage)')
      window.location.replace('/exam-terminated')
      return
    }

    // Slow path: Firestore
    getLatestSession(userId, testId).then(session => {
      if (!session) return

      if (session.status === 'terminated') {
        try { sessionStorage.setItem(flag, '1') } catch {}
        console.log('[ExamSecurity] re-entry blocked (Firestore status=terminated)')
        window.location.replace('/exam-terminated')
        return
      }

      // Check if last heartbeat is too stale (user was away before refresh)
      if (session.lastActive) {
        const lastMs = session.lastActive.toMillis?.() ?? (session.lastActive.seconds * 1000)
        const gap    = Date.now() - lastMs
        console.log('[ExamSecurity] mount lastActive gap:', gap, 'ms')
        if (gap > MOUNT_THRESHOLD) {
          console.log('[ExamSecurity] INACTIVITY on mount — gap:', gap, 'ms')
          terminate('app_switch_or_inactivity')
        }
      }
    }).catch(() => {})
  }, [isActive, isPractice, userId, testId, terminate])

  // ── 2. Session creation (once) ─────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice || !userId || !testId || sessionCreated.current) return
    sessionCreated.current = true

    createExamSession({ userId, testId, levelId, testTitle })
      .then(id => {
        sessionIdRef.current = id
        console.log('[ExamSecurity] session created:', id)
      })
      .catch(e => console.log('[ExamSecurity] createExamSession error:', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPractice, userId, testId])

  // ── 3. Heartbeat + visibility management ──────────────────────────────────
  useEffect(() => {
    if (!isActive || isPractice) return

    startHeartbeat()

    // Called when page becomes hidden (user left)
    const onHide = (source) => {
      console.log('[ExamSecurity] page hidden —', source, '— stopping heartbeat')
      stopHeartbeat()
      hiddenAtRef.current = Date.now()
    }

    // Called when page becomes visible again (user returned)
    const onReturn = (source) => {
      if (!hiddenAtRef.current) return

      const gap = Date.now() - hiddenAtRef.current
      console.log('[ExamSecurity] returned via', source, '— gap:', gap, 'ms')

      if (gap > GAP_THRESHOLD) {
        console.log('[ExamSecurity] INACTIVITY VIOLATION — gap:', gap, 'ms — threshold:', GAP_THRESHOLD, 'ms')
        terminate('app_switch_or_inactivity')
      } else {
        console.log('[ExamSecurity] gap OK (' + gap + 'ms) — resuming heartbeat')
        hiddenAtRef.current = null
        startHeartbeat()
      }
    }

    // visibilitychange: used ONLY to start/stop heartbeat and check gap on return
    // NOT used for instant termination
    const onVisibilityChange = () => {
      console.log('[ExamSecurity] visibilitychange —',
        document.visibilityState, '| hidden:', document.hidden)

      if (document.hidden) {
        onHide('visibilitychange')
      } else {
        onReturn('visibilitychange')
      }
    }

    // pagehide: iOS Safari, back navigation, bfcache entry
    const onPageHide = (e) => {
      console.log('[ExamSecurity] pagehide — persisted:', e.persisted)
      onHide('pagehide')
    }

    // pageshow: bfcache restoration — check gap
    const onPageShow = (e) => {
      console.log('[ExamSecurity] pageshow — persisted:', e.persisted)
      if (e.persisted) onReturn('pageshow(bfcache)')
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      stopHeartbeat()
      console.log('[ExamSecurity] cleanup — heartbeat stopped, listeners removed')
    }
  }, [isActive, isPractice, startHeartbeat, stopHeartbeat, terminate])

  // ── 4. markCompleted — call before normal submit navigation ────────────────
  const markCompleted = useCallback(async () => {
    console.log('[ExamSecurity] markCompleted')
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
