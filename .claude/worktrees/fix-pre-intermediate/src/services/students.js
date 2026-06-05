import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}