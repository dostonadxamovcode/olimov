import { useEffect, useRef, useCallback } from 'react'
import {
  getExamSession,
  updateExamSessionHeartbeat,
  terminateExamSession,
  completeExamSession,
} from '../services/examSession'

const HEARTBEAT_MS    = 5_000   // heartbeat interval
const GAP_THRESHOLD   = 8_000   // max allowed away-time
const MOUNT_THRESHOLD = 12_000  // stale heartbeat check on mount/refresh

/**
 * URL-based exam security.
 *
 * sessionId comes from the URL (/exam/:sessionId) — NOT from location.state or
 * any React ref. This means it survives:
 *   - page refresh
 *   - mobile app switch
 *   - bfcache restore
 *   - tab switching
 *
 * Single stop condition:  if (!sessionId) return
 * No isPractice, no isActive prop, no UI-mode checks.
 *
 * @param {string}   sessionId   Firestore examSessions doc ID (from useParams)
 * @param {Function} autoSubmit  async fn — saves answers before termination
 */
export function useExamSecurity(sessionId, autoSubmit) {
  const autoSubmitRef   = useRef(autoSubmit)
  autoSubmitRef.current = autoSubmit          // always current, no useEffect lag

  const terminatedRef  = useRef(false)
  const sessionValidRef = useRef(false)       // true after Firestore mount check passes
  const heartbeatRef   = useRef(null)
  const hiddenAtRef    = useRef(null)

  // ── startHeartbeat ──────────────────────────────────────────────────────────
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return          // prevent duplicate intervals

    heartbeatRef.current = setInterval(() => {
      if (!sessionId || terminatedRef.current) return
      updateExamSessionHeartbeat(sessionId)
        .then(() => console.log('[ExamSecurity] heartbeat sent'))
        .catch(e => console.log('[ExamSecurity] heartbeat error:', e))
    }, HEARTBEAT_MS)

    console.log('[ExamSecurity] heartbeat started')
  }, [sessionId])

  // ── stopHeartbeat ───────────────────────────────────────────────────────────
  const stopHeartbeat = useCallback(() => {
    if (!heartbeatRef.current) return
    clearInterval(heartbeatRef.current)
    heartbeatRef.current = null
    console.log('[ExamSecurity] heartbeat stopped')
  }, [])

  // ── terminate ───────────────────────────────────────────────────────────────
  const terminate = useCallback((reason = 'app_switch_or_inactivity') => {
    if (terminatedRef.current) {
      console.log('[ExamSecurity] already terminated')
      return
    }
    terminatedRef.current = true
    stopHeartbeat()

    console.log('EXAM TERMINATED — reason:', reason, '| sessionId:', sessionId)

    // 1. Auto-submit current answers (fire-and-forget)
    try { autoSubmitRef.current?.() } catch {}

    // 2. Firestore update (fire-and-forget)
    if (sessionId) terminateExamSession(sessionId, reason)

    // 3. Redirect — works even when JS is semi-frozen
    window.location.replace('/exam-terminated')
  }, [sessionId, stopHeartbeat])

  // ── Mount: validate session from Firestore (survives refresh) ──────────────
  // sessionId from URL param is the only source of truth.
  useEffect(() => {
    if (!sessionId) return

    console.log('[ExamSecurity] mount — validating session:', sessionId)

    getExamSession(sessionId).then(session => {
      if (!session) {
        console.log('[ExamSecurity] session not found — redirecting')
        window.location.replace('/exam-terminated')
        return
      }

      if (session.status !== 'active') {
        console.log('[ExamSecurity] session not active:', session.status, '— redirecting')
        window.location.replace('/exam-terminated')
        return
      }

      // Check for stale heartbeat (user was away, then refreshed)
      if (session.lastActive) {
        const lastMs = session.lastActive.toMillis?.() ?? (session.lastActive.seconds * 1000)
        const gap    = Date.now() - lastMs
        console.log('[ExamSecurity] mount lastActive gap:', gap, 'ms')
        if (gap > MOUNT_THRESHOLD) {
          console.log('[ExamSecurity] stale session on mount — terminating')
          terminate('app_switch_or_inactivity')
          return
        }
      }

      // Session is valid
      sessionValidRef.current = true
      console.log('[ExamSecurity] session valid — starting heartbeat')
      startHeartbeat()
    }).catch(e => {
      // Network error — start heartbeat anyway (don't lock out on bad network)
      console.log('[ExamSecurity] session fetch error (network?):', e)
      sessionValidRef.current = true
      startHeartbeat()
    })

    return () => stopHeartbeat()
  }, [sessionId, startHeartbeat, stopHeartbeat, terminate])

  // ── Visibility + pagehide + pageshow listeners ─────────────────────────────
  useEffect(() => {
    if (!sessionId) return

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
        console.log('[ExamSecurity] VIOLATION — gap:', gap, 'ms')
        terminate('app_switch_or_inactivity')
        return
      }

      // Gap is within threshold — resume
      console.log('[ExamSecurity] gap OK — resuming')
      hiddenAtRef.current = null
      if (sessionValidRef.current) startHeartbeat()

      // Extra: confirm session still active in Firestore after brief absence
      getExamSession(sessionId).then(session => {
        if (!session || session.status !== 'active') {
          terminate('session_invalidated')
        }
      }).catch(() => {})
    }

    const onVisibilityChange = () => {
      console.log('[ExamSecurity] visibilitychange —', document.visibilityState)
      if (document.hidden) onHide('visibilitychange')
      else onReturn('visibilitychange')
    }

    const onPageHide = (e) => {
      console.log('[ExamSecurity] pagehide — persisted:', e.persisted)
      onHide('pagehide')
    }

    const onPageShow = (e) => {
      console.log('[ExamSecurity] pageshow — persisted:', e.persisted)
      if (e.persisted) onReturn('pageshow')
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      stopHeartbeat()
    }
  }, [sessionId, startHeartbeat, stopHeartbeat, terminate])

  // ── markCompleted — disarm before normal submit ────────────────────────────
  const markCompleted = useCallback(async () => {
    console.log('[ExamSecurity] markCompleted — disarming')
    terminatedRef.current = true
    stopHeartbeat()
    if (sessionId) {
      try { completeExamSession(sessionId) } catch {}
    }
  }, [sessionId, stopHeartbeat])

  return { markCompleted }
}
