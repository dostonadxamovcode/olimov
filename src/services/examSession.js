import {
  collection, doc, setDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'examSessions'

export async function createExamSession({
  userId, testId, levelId, testTitle, isPractice = false,
}) {
  const ref = doc(collection(db, COL))
  await setDoc(ref, {
    userId,
    testId,
    levelId:          levelId   ?? null,
    testTitle:        testTitle  ?? null,
    isPractice:       !!isPractice,
    status:           'active',
    startedAt:        serverTimestamp(),
    lastActive:       serverTimestamp(),
    terminatedReason: null,
    terminatedAt:     null,
    completedAt:      null,
  })
  return ref.id   // <-- sessionId, used as URL param
}

// Fetch a single session by its Firestore document ID
export async function getExamSession(sessionId) {
  try {
    const snap = await getDoc(doc(db, COL, sessionId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  } catch {
    return null
  }
}

export async function updateExamSessionHeartbeat(sessionId) {
  await updateDoc(doc(db, COL, sessionId), {
    lastActive: serverTimestamp(),
  })
}

export async function terminateExamSession(sessionId, reason = 'app_switch_or_inactivity') {
  try {
    await updateDoc(doc(db, COL, sessionId), {
      status:           'terminated',
      terminatedReason: reason,
      terminatedAt:     serverTimestamp(),
    })
  } catch { /* fire-and-forget */ }
}

export async function completeExamSession(sessionId) {
  try {
    await updateDoc(doc(db, COL, sessionId), {
      status:      'completed',
      completedAt: serverTimestamp(),
    })
  } catch { /* non-critical */ }
}

// Legacy: returns most recent session for userId+testId (used by old flow)
export async function getLatestSession(userId, testId) {
  try {
    const q = query(
      collection(db, COL),
      where('userId', '==', userId),
      where('testId', '==', testId),
      orderBy('startedAt', 'desc'),
      limit(1),
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    const d = snap.docs[0]
    return { id: d.id, ...d.data() }
  } catch {
    return null
  }
}
