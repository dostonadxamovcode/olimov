import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { normalizeCEFRStudent } from '../utils/dataNormalization'

/**
 * Legacy function for backward compatibility
 * @deprecated Use useStudentData hook or subscribeToCEFRStudents for real-time updates
 */
export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, 'students'))

  const students = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  // Normalize all student documents using new utility
  return students.map(normalizeCEFRStudent)
}