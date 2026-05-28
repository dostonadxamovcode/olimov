import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  collection, 
  where, 
  getDocs,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore'
import { auth } from '../firebase'
import { db } from '../firebase'

// Presence tracking configuration
const PRESENCE_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds
const HEARTBEAT_INTERVAL = 2 * 60 * 1000 // 2 minutes heartbeat

let presenceUnsubscribe = null
let heartbeatInterval = null

/**
 * Initialize presence tracking for the current user
 * Call this when user logs in
 */
export const initializePresence = async (userId) => {
  if (!userId) return

  try {
    // Set user as online with current timestamp
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
      email: auth.currentUser?.email,
      displayName: auth.currentUser?.displayName,
      photoURL: auth.currentUser?.photoURL
    }, { merge: true })

    // Set up heartbeat to keep user marked as online
    startHeartbeat(userId)

    // Set up cleanup on disconnect
    setupDisconnectHandler(userId)

    return true
  } catch (error) {
    console.error('Error initializing presence:', error)
    return false
  }
}

/**
 * Start heartbeat to keep user marked as online
 */
const startHeartbeat = (userId) => {
  // Clear existing heartbeat if any
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }

  // Set up new heartbeat
  heartbeatInterval = setInterval(async () => {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        lastSeen: serverTimestamp()
      })
    } catch (error) {
      console.error('Heartbeat error:', error)
    }
  }, HEARTBEAT_INTERVAL)
}

/**
 * Set up Firebase Realtime Database-like disconnect handler
 * Since Firestore doesn't have native disconnect, we use window events
 */
const setupDisconnectHandler = (userId) => {
  const handleDisconnect = async () => {
    await setUserOffline(userId)
  }

  // Handle page unload
  window.addEventListener('beforeunload', handleDisconnect)
  window.addEventListener('pagehide', handleDisconnect)

  // Store cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleDisconnect)
    window.removeEventListener('pagehide', handleDisconnect)
  }
}

/**
 * Mark user as offline
 * Call this when user logs out
 */
export const setUserOffline = async (userId) => {
  if (!userId) return

  try {
    // Stop heartbeat
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }

    // Unsubscribe from presence updates
    if (presenceUnsubscribe) {
      presenceUnsubscribe()
      presenceUnsubscribe = null
    }

    // Mark user as offline
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      isOnline: false,
      lastSeen: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error setting user offline:', error)
    return false
  }
}

/**
 * Get currently online users
 * Users who have been active within the PRESENCE_TIMEOUT
 */
export const getOnlineUsers = async () => {
  try {
    const cutoffTime = new Date(Date.now() - PRESENCE_TIMEOUT)
    
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('isOnline', '==', true)
    )
    
    const snapshot = await getDocs(q)
    const onlineUsers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Filter by lastSeen to ensure they're actually recent
    const now = Date.now()
    return onlineUsers.filter(user => {
      if (!user.lastSeen) return false
      const lastSeenTime = user.lastSeen.toDate ? user.lastSeen.toDate() : new Date(user.lastSeen)
      return (now - lastSeenTime.getTime()) < PRESENCE_TIMEOUT
    })
  } catch (error) {
    console.error('Error getting online users:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for online users query. User may not be superadmin.')
    }
    return []
  }
}

/**
 * Subscribe to online users updates (real-time)
 * @param {function} callback - Function to call with updated online users list
 * @returns {function} Unsubscribe function
 */
export const subscribeToOnlineUsers = (callback) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('isOnline', '==', true)
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const onlineUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Filter by lastSeen to ensure they're actually recent
      const now = Date.now()
      const activeUsers = onlineUsers.filter(user => {
        if (!user.lastSeen) return false
        const lastSeenTime = user.lastSeen.toDate ? user.lastSeen.toDate() : new Date(user.lastSeen)
        return (now - lastSeenTime.getTime()) < PRESENCE_TIMEOUT
      })

      callback(activeUsers)
    }, (error) => {
      console.error('Error in online users subscription:', error)
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for online users subscription. User may not be superadmin.')
        callback([]) // Return empty array on permission denied
      }
    })

    return unsubscribe
  } catch (error) {
    console.error('Error subscribing to online users:', error)
    if (error.code === 'permission-denied') {
      console.warn('Permission denied for online users query. User may not be superadmin.')
    }
    return () => {}
  }
}

/**
 * Clean up presence tracking
 */
export const cleanupPresence = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
  
  if (presenceUnsubscribe) {
    presenceUnsubscribe()
    presenceUnsubscribe = null
  }
}