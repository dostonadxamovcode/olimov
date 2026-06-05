import { useFirestoreCollection } from './useFirestoreCollection'

const toCollection = (level) => {
  const l = level.toLowerCase()
  return l === 'ielts' ? 'ielts' : `${l}Tests`
}

export function useLevelTests(level) {
  const collectionName = toCollection(level)
  const { data: tests, loading, error } = useFirestoreCollection(collectionName)
  return { tests, loading, error }
}
