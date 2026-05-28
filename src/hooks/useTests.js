import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { getDocumentsWithCache } from '../services/cacheService'

export function useTests(level = null) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    const fetchTests = async () => {
      try {
        // Server-side filtering with query
        const q = level
          ? query(
              collection(db, 'tests'),
              where('level', '==', level),
              orderBy('createdAt', 'desc')
            )
          : query(
              collection(db, 'tests'),
              orderBy('createdAt', 'desc')
            )

        // Use cache service
        const cacheKey = level ? `tests_level_${level}` : 'tests_all'
        const data = await getDocumentsWithCache(q, cacheKey)

        if (!active) return
        setTests(data)
      } catch (e) {
        if (active) setError(e.message || 'Failed to load tests.')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchTests()

    return () => { active = false }
  }, [level])

  return { tests, loading, error }
}
