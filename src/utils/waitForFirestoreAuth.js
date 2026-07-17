import { auth } from '../firebase'

/**
 * Waits until Firebase Auth has finished initializing before Firestore reads.
 * Refreshes the ID token when a user is signed in.
 */
export async function waitForFirestoreReady() {
  await auth.authStateReady()
  const user = auth.currentUser
  if (user) await user.getIdToken()
}

/** @deprecated Use waitForFirestoreReady */
export const waitForFirestoreAuth = waitForFirestoreReady
