import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Change a user's role. Only superadmin is allowed.
 * Writes an audit log entry after every successful change.
 */
export async function changeUserRole(targetUserId, newRole, currentUser) {
  if (!currentUser || currentUser.role !== 'superadmin') {
    throw new Error('You do not have permission to change user roles.')
  }

  await updateDoc(doc(db, 'users', targetUserId), { role: newRole })

  await addDoc(collection(db, 'roleAuditLog'), {
    targetUserId,
    newRole,
    changedBy:      currentUser.uid,
    changedByEmail: currentUser.email,
    timestamp:      serverTimestamp(),
  })
}
