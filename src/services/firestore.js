import {
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ── Tests ────────────────────────────────────────────────────────────────────
export const getTests = async (filters = {}) => {
  let q = collection(db, 'tests')
  const constraints = []
  if (filters.category) constraints.push(where('category', '==', filters.category))
  if (filters.level)    constraints.push(where('level', '==', filters.level))
  if (constraints.length) q = query(q, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getTest = async (id) => {
  const snap = await getDoc(doc(db, 'tests', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const createTest = (data) =>
  addDoc(collection(db, 'tests'), { ...data, createdAt: serverTimestamp() })

export const updateTest = (id, data) =>
  updateDoc(doc(db, 'tests', id), { ...data, updatedAt: serverTimestamp() })

export const deleteTest = (id) => deleteDoc(doc(db, 'tests', id))

// ── Results ──────────────────────────────────────────────────────────────────
export const saveResult = (data) =>
  addDoc(collection(db, 'results'), { ...data, answeredAt: serverTimestamp() })

export const getUserResults = async (userId) => {
  const q = query(
    collection(db, 'results'),
    where('userId', '==', userId),
    orderBy('answeredAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getAllResults = async () => {
  const q = query(collection(db, 'results'), orderBy('answeredAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
