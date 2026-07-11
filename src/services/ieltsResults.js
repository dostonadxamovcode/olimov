import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * saveIELTSResult
 *
 * Persists a completed IELTS Speaking session to Firestore.
 * Collection: `ieltsResults`
 *
 * @param {object} payload
 * @param {string} payload.userId
 * @param {string} payload.transcript
 * @param {string} [payload.questionText]
 * @param {object} payload.result        — full AI analysis object
 * @returns {Promise<string>}            — Firestore document ID
 */
export async function saveIELTSResult({ userId, transcript, questionText = '', result }) {
  if (!userId)  throw new Error('userId is required.')
  if (!result)  throw new Error('result is required.')

  const ref = await addDoc(collection(db, 'ieltsResults'), {
    userId,
    transcript,
    questionText,
    result,
    analyzedAt: serverTimestamp(),
  })

  return ref.id
}
