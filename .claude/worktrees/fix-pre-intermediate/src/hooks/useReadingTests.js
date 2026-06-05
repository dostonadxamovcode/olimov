import { useState, useEffect, useCallback } from 'react'
import { fetchRandomReadingTests } from '../services/readingTests'

// How many questions to show per level
const LEVEL_COUNT = {
  all:              15,
  beginner:          8,
  elementary:        8,
  Pre_Intermediate: 10,
  intermediate:     12,
  advanced:         15,
}

/**
 * Fetches a randomised set of TFNG reading questions from Firestore.
 *
 * @param {string} level  'all' | 'beginner' | 'intermediate' | 'advanced'
 * @returns {{ questions, loading, error, refetch }}
 *
 * Usage:
 *   const { questions, loading, error, refetch } = useReadingTests('intermediate')
 */
export function useReadingTests(level = 'intermediate') {
  const count = LEVEL_COUNT[level] ?? 12

  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRandomReadingTests(level, count)
      setQuestions(data)
    } catch (e) {
      setError(e?.message ?? 'Failed to load questions.')
    } finally {
      setLoading(false)
    }
  }, [level, count])

  useEffect(() => { load() }, [load])

  return { questions, loading, error, refetch: load }
}
