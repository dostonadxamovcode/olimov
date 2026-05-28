/**
 * Centralized Firebase Collections Service
 * Provides a clean, consistent API for all Firestore collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  getDocsFromCache,
  getDocsFromServer
} from 'firebase/firestore'
import { db } from '../firebase'

// ── Collection Names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  TESTS: 'tests',
  RESULTS: 'results',
  LEVELS: 'levels',
  SERVICES: 'services',
  FEATURES: 'features',
  STATISTICS: 'statistics',
  ANNOUNCEMENTS: 'announcements',
  SETTINGS: 'settings',
  LISTENING_TESTS: 'listeningTests',
  STUDENTS: 'students',
  IELTS: 'ielts',
  QUESTIONS: 'questions',
  // Level-specific test collections
  A1_TESTS: 'a1Tests',
  A2_TESTS: 'a2Tests',
  B1_TESTS: 'b1Tests',
  B2_TESTS: 'b2Tests',
  C1_TESTS: 'c1Tests',
  C2_TESTS: 'c2Tests'
}

// ── Generic CRUD Operations ────────────────────────────────────────────────────

/**
 * Get all documents from a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} options - Query options { where, orderBy, limit }
 * @returns {Promise<Array>} Array of documents with IDs
 */
export const getAllDocuments = async (collectionName, options = {}) => {
  try {
    let q = collection(db, collectionName)
    const constraints = []

    if (options.where) {
      options.where.forEach(condition => {
        constraints.push(where(condition.field, condition.operator, condition.value))
      })
    }

    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'))
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints)
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error)
    throw error
  }
}

/**
 * Get a single document by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} Document data or null
 */
export const getDocumentById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId)
    const snapshot = await getDoc(docRef)
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error)
    throw error
  }
}

/**
 * Create a new document
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Document data
 * @returns {Promise<string>} New document ID
 */
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error)
    throw error
  }
}

/**
 * Create or update a document with specific ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @param {boolean} merge - Whether to merge with existing data
 * @returns {Promise<void>}
 */
export const setDocument = async (collectionName, docId, data, merge = false) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge })
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error)
    throw error
  }
}

/**
 * Update an existing document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Data to update
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error)
    throw error
  }
}

/**
 * Delete a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error)
    throw error
  }
}

/**
 * Subscribe to real-time updates for a collection
 * @param {string} collectionName - Name of the collection
 * @param {Function} callback - Callback function(data, error)
 * @param {Object} options - Query options
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCollection = (collectionName, callback, options = {}) => {
  let q = collection(db, collectionName)
  const constraints = []

  if (options.where) {
    options.where.forEach(condition => {
      constraints.push(where(condition.field, condition.operator, condition.value))
    })
  }

  if (options.orderBy) {
    constraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'))
  }

  if (constraints.length > 0) {
    q = query(q, ...constraints)
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(data, null)
    },
    (error) => {
      callback(null, error)
    }
  )

  return unsubscribe
}

/**
 * Subscribe to real-time updates for a single document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Function} callback - Callback function(data, error)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId)

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      const data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
      callback(data, null)
    },
    (error) => {
      callback(null, error)
    }
  )

  return unsubscribe
}

// ── Specific Collection Services ────────────────────────────────────────────────

/**
 * Users Collection
 */
export const usersService = {
  getById: (userId) => getDocumentById(COLLECTIONS.USERS, userId),
  create: (userData) => createDocument(COLLECTIONS.USERS, userData),
  update: (userId, userData) => updateDocument(COLLECTIONS.USERS, userId, userData),
  subscribe: (userId, callback) => subscribeToDocument(COLLECTIONS.USERS, userId, callback)
}

/**
 * Tests Collection
 */
export const testsService = {
  getAll: (options) => getAllDocuments(COLLECTIONS.TESTS, options),
  getById: (testId) => getDocumentById(COLLECTIONS.TESTS, testId),
  create: (testData) => createDocument(COLLECTIONS.TESTS, testData),
  update: (testId, testData) => updateDocument(COLLECTIONS.TESTS, testId, testData),
  delete: (testId) => deleteDocument(COLLECTIONS.TESTS, testId),
  subscribe: (callback, options) => subscribeToCollection(COLLECTIONS.TESTS, callback, options)
}

/**
 * Level-specific Tests
 */
export const levelTestsService = {
  getAll: (level) => getAllDocuments(`${level}Tests`, {
    where: [{ field: 'isPublished', operator: '==', value: true }]
  }),
  getById: (level, testId) => getDocumentById(`${level}Tests`, testId),
  create: (level, testData) => createDocument(`${level}Tests`, testData),
  update: (level, testId, testData) => updateDocument(`${level}Tests`, testId, testData),
  delete: (level, testId) => deleteDocument(`${level}Tests`, testId)
}

/**
 * Results Collection
 */
export const resultsService = {
  getAll: () => getAllDocuments(COLLECTIONS.RESULTS, {
    orderBy: { field: 'answeredAt', direction: 'desc' }
  }),
  getUserResults: (userId) => getAllDocuments(COLLECTIONS.RESULTS, {
    where: [{ field: 'userId', operator: '==', value: userId }],
    orderBy: { field: 'answeredAt', direction: 'desc' }
  }),
  create: (resultData) => createDocument(COLLECTIONS.RESULTS, resultData),
  subscribe: (callback, options) => subscribeToCollection(COLLECTIONS.RESULTS, callback, options)
}

/**
 * Levels Collection
 */
export const levelsService = {
  getAll: () => getAllDocuments(COLLECTIONS.LEVELS, {
    orderBy: { field: 'order', direction: 'asc' }
  }),
  getById: (levelId) => getDocumentById(COLLECTIONS.LEVELS, levelId),
  create: (levelData) => createDocument(COLLECTIONS.LEVELS, levelData),
  update: (levelId, levelData) => updateDocument(COLLECTIONS.LEVELS, levelId, levelData),
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.LEVELS, callback, {
    orderBy: { field: 'order', direction: 'asc' }
  })
}

/**
 * Services Collection
 */
export const servicesService = {
  getAll: () => getAllDocuments(COLLECTIONS.SERVICES, {
    orderBy: { field: 'order', direction: 'asc' }
  }),
  getById: (serviceId) => getDocumentById(COLLECTIONS.SERVICES, serviceId),
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.SERVICES, callback, {
    orderBy: { field: 'order', direction: 'asc' }
  })
}

/**
 * Features Collection
 */
export const featuresService = {
  getAll: () => getAllDocuments(COLLECTIONS.FEATURES, {
    orderBy: { field: 'order', direction: 'asc' }
  }),
  getById: (featureId) => getDocumentById(COLLECTIONS.FEATURES, featureId),
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.FEATURES, callback, {
    orderBy: { field: 'order', direction: 'asc' }
  })
}

/**
 * Statistics Collection
 */
export const statisticsService = {
  getAll: () => getAllDocuments(COLLECTIONS.STATISTICS),
  getById: (statId) => getDocumentById(COLLECTIONS.STATISTICS, statId),
  update: (statId, statData) => updateDocument(COLLECTIONS.STATISTICS, statId, statData),
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.STATISTICS, callback)
}

/**
 * Announcements Collection
 */
export const announcementsService = {
  getAll: () => getAllDocuments(COLLECTIONS.ANNOUNCEMENTS, {
    where: [{ field: 'isActive', operator: '==', value: true }],
    orderBy: { field: 'createdAt', direction: 'desc' }
  }),
  getById: (announcementId) => getDocumentById(COLLECTIONS.ANNOUNCEMENTS, announcementId),
  create: (announcementData) => createDocument(COLLECTIONS.ANNOUNCEMENTS, announcementData),
  update: (announcementId, announcementData) => updateDocument(COLLECTIONS.ANNOUNCEMENTS, announcementId, announcementData),
  delete: (announcementId) => deleteDocument(COLLECTIONS.ANNOUNCEMENTS, announcementId),
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.ANNOUNCEMENTS, callback, {
    where: [{ field: 'isActive', operator: '==', value: true }],
    orderBy: { field: 'createdAt', direction: 'desc' }
  })
}

/**
 * Settings Collection
 */
export const settingsService = {
  getAll: async () => {
    const settings = await getAllDocuments(COLLECTIONS.SETTINGS)
    // Convert to key-value object
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
  },
  getByKey: async (key) => {
    const settings = await getAllDocuments(COLLECTIONS.SETTINGS, {
      where: [{ field: 'key', operator: '==', value: key }]
    })
    return settings.length > 0 ? settings[0].value : null
  },
  update: (key, value) => {
    // First try to find existing setting
    return getAllDocuments(COLLECTIONS.SETTINGS, {
      where: [{ field: 'key', operator: '==', value: key }]
    }).then(settings => {
      if (settings.length > 0) {
        return updateDocument(COLLECTIONS.SETTINGS, settings[0].id, { value })
      } else {
        return createDocument(COLLECTIONS.SETTINGS, { key, value })
      }
    })
  },
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.SETTINGS, (data, error) => {
    if (!error) {
      const settingsObj = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {})
      callback(settingsObj, null)
    } else {
      callback(null, error)
    }
  })
}

/**
 * Students Collection (CEFR)
 */
export const studentsService = {
  getAll: () => getAllDocuments(COLLECTIONS.STUDENTS, {
    orderBy: { field: 'name', direction: 'asc' }
  }),
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.STUDENTS, callback, {
    orderBy: { field: 'name', direction: 'asc' }
  })
}

/**
 * IELTS Collection
 */
export const ieltsService = {
  getAll: () => getAllDocuments(COLLECTIONS.IELTS, {
    orderBy: { field: 'name', direction: 'asc' }
  }),
  subscribe: (callback) => subscribeToCollection(COLLECTIONS.IELTS, callback, {
    orderBy: { field: 'name', direction: 'asc' }
  })
}

export default {
  COLLECTIONS,
  getAllDocuments,
  getDocumentById,
  createDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  subscribeToDocument,
  usersService,
  testsService,
  levelTestsService,
  resultsService,
  levelsService,
  servicesService,
  featuresService,
  statisticsService,
  announcementsService,
  settingsService,
  studentsService,
  ieltsService
}