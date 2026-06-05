/**
 * Optimized Firebase Services
 * Uses real-time updates with onSnapshot for better performance
 */

import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy
} from 'firebase/firestore'
import { db } from '../firebase'
import { 
  normalizeCEFRStudent, 
  normalizeIELTSStudent,
  filterValidStudents 
} from '../utils/dataNormalization'

/**
 * Real-time CEFR students subscription
 * @param {Function} callback - Function to call with data updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToCEFRStudents = (callback) => {
  const q = query(
    collection(db, 'students'),
    orderBy('name')
  )
  
  return onSnapshot(
    q,
    (snapshot) => {
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Normalize all students
      const normalizedStudents = students.map(normalizeCEFRStudent)
      const validStudents = filterValidStudents(normalizedStudents)
      
      callback({
        data: validStudents,
        loading: false,
        error: null
      })
    },
    (error) => {
      callback({
        data: [],
        loading: false,
        error: error.message
      })
    }
  )
}

/**
 * Real-time IELTS students subscription
 * @param {Function} callback - Function to call with data updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToIELTSStudents = (callback) => {
  const q = query(
    collection(db, 'ielts'),
    orderBy('name')
  )
  
  return onSnapshot(
    q,
    (snapshot) => {
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Normalize all students
      const normalizedStudents = students.map(normalizeIELTSStudent)
      const validStudents = filterValidStudents(normalizedStudents)
      
      callback({
        data: validStudents,
        loading: false,
        error: null
      })
    },
    (error) => {
      callback({
        data: [],
        loading: false,
        error: error.message
      })
    }
  )
}

/**
 * Combined subscription for both CEFR and IELTS students
 * @param {Function} callback - Function to call with combined data updates
 * @returns {Function} - Combined unsubscribe function
 */
export const subscribeToAllStudents = (callback) => {
  let cefrData = []
  let ieltsData = []
  let cefrLoading = true
  let ieltsLoading = true
  let cefrError = null
  let ieltsError = null
  
  const checkComplete = () => {
    callback({
      cefr: cefrData,
      ielts: ieltsData,
      loading: cefrLoading || ieltsLoading,
      error: cefrError || ieltsError
    })
  }
  
  const unsubscribeCEFR = subscribeToCEFRStudents((result) => {
    cefrData = result.data
    cefrLoading = result.loading
    cefrError = result.error
    checkComplete()
  })
  
  const unsubscribeIELTS = subscribeToIELTSStudents((result) => {
    ieltsData = result.data
    ieltsLoading = result.loading
    ieltsError = result.error
    checkComplete()
  })
  
  // Return combined unsubscribe function
  return () => {
    unsubscribeCEFR()
    unsubscribeIELTS()
  }
}

/**
 * Legacy one-time fetch (for backward compatibility)
 * @deprecated Use subscribeToCEFRStudents for real-time updates
 */
export const getCEFRStudentsLegacy = async () => {
  const { getDocs } = await import('firebase/firestore')
  const snapshot = await getDocs(collection(db, 'students'))
  
  const students = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  
  return students.map(normalizeCEFRStudent)
}

/**
 * Legacy one-time fetch for IELTS (for backward compatibility)
 * @deprecated Use subscribeToIELTSStudents for real-time updates
 */
export const getIELTSStudentsLegacy = async () => {
  const { getDocs } = await import('firebase/firestore')
  const snapshot = await getDocs(collection(db, 'ielts'))
  
  const students = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  
  return students.map(normalizeIELTSStudent)
}