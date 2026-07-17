import { collection, getDocs, getCountFromServer } from 'firebase/firestore'
import { db } from '../firebase'
import { waitForFirestoreReady } from '../utils/waitForFirestoreAuth'

const USERS_COLLECTION = 'users'

/**
 * Returns total users count. Tries server aggregation first, falls back to
 * getDocs().size when RunAggregationQuery is denied.
 */
export async function fetchUsersCount() {
  await waitForFirestoreReady()
  const usersRef = collection(db, USERS_COLLECTION)

  try {
    const snapshot = await getCountFromServer(usersRef)
    return snapshot.data().count
  } catch (error) {
    if (error?.code !== 'permission-denied') {
      console.error('Failed loading users collection', error)
      throw error
    }

    // Fallback: list query (same list permission, avoids aggregation API)
    try {
      const snapshot = await getDocs(usersRef)
      return snapshot.size
    } catch (fallbackError) {
      console.error('Failed loading users collection', fallbackError)
      throw fallbackError
    }
  }
}

/** Returns all user profiles for admin dashboard. */
export async function fetchAllUsers() {
  await waitForFirestoreReady()
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION))
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Failed loading users collection', error)
    throw error
  }
}
