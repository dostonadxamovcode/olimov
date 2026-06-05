import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { normalizeIELTSStudent } from "../utils/dataNormalization"

/**
 * Legacy function for backward compatibility
 * @deprecated Use useStudentData hook or subscribeToIELTSStudents for real-time updates
 */
export async function GetIELTSStudent() {
  try {
    const snapshot = await getDocs(collection(db, "ielts"))

    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Normalize all IELTS student documents using new utility
    return students.map(normalizeIELTSStudent)
  } catch (error) {
    console.error('Error fetching IELTS students:', error)
    // Return empty array instead of throwing error to prevent UI crash
    return []
  }
}