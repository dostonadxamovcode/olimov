import {
  collection, doc, setDoc, updateDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'examSessions'

export async function createExamSession({ userId, testId, levelId, testTitle }) {
  const ref = doc(collection(db, COL))
  await setDoc(ref, {
    userId,
    testId,
    levelId:   levelId  ?? null,
    testTitle: testTitle ?? null,
    status:          'active',
    startedAt:       serverTimestamp(),
    terminatedReason: null,
    terminatedAt:    null,
    completedAt:     null,
  })
  return ref.id
}

export async function terminateExamSession(sessionId, reason = 'mobile_app_switch') {
  try {
    await updateDoc(doc(db, COL, sessionId), {
      status:          'terminated',
      terminatedReason: reason,
      terminatedAt:    serverTimestamp(),
    })
  } catch {
    // fire-and-forget — navigation happens regardless
  }
}

export async function completeExamSession(sessionId) {
  try {
    await updateDoc(doc(db, COL, sessionId), {
      status:      'completed',
      completedAt: serverTimestamp(),
    })
  } catch {
    // non-critical — result already saved
  }
}

// Returns the most recent non-active session (terminated) for userId+testId.
// Used to block re-entry after violation.
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
