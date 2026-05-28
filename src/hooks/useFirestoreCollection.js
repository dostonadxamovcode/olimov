import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export const useFirestoreCollection = (collectionName, conditions = [], orderByField) => {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Stable serialized key — avoids re-subscribing when caller passes inline array
  const conditionsKey = JSON.stringify(conditions)
  const conditionsRef = useRef(conditionsKey)
  conditionsRef.current = conditionsKey

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const constraints = conditions.map(({ field, operator, value }) =>
      where(field, operator, value)
    )

    const q = query(collection(db, collectionName), ...constraints)

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        if (cancelled) return
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (orderByField) {
          docs.sort((a, b) => (a[orderByField] ?? '') > (b[orderByField] ?? '') ? 1 : -1)
        }
        setData(docs)
        setLoading(false)
      },
      (err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, conditionsKey, orderByField])

  return { data, loading, error }
}
