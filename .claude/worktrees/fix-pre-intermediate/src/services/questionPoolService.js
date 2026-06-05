import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']

/**
 * Fisher-Yates shuffle algorithm for unbiased randomization
 */
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Fetch questions from a question pool for a specific level
 * @param {string} level - The level identifier (e.g., 'a1', 'a2')
 * @returns {Promise<Array|null>} - Array of questions from the pool or null if not found
 */
export async function fetchQuestionPool(level) {
  try {
    // Single source of truth: levelPool format
    const collectionName = `${level}Pool`

    const poolRef = collection(db, collectionName)

    // Try with orderBy, fallback to simple getDocs if index issue
    let snapshot
    try {
      const poolQuery = query(poolRef, orderBy('createdAt', 'desc'))
      snapshot = await getDocs(poolQuery)
    } catch (orderByError) {
      snapshot = await getDocs(poolRef)
    }

    if (snapshot.empty) {
      return null
    }

    let allQuestions = []
    let validDocs = 0
    let invalidDocs = 0

    snapshot.forEach(doc => {
      const data = doc.data()

      // Validate document structure
      if (!data.questions) {
        invalidDocs++
        return
      }

      if (!Array.isArray(data.questions)) {
        invalidDocs++
        return
      }

      if (data.questions.length === 0) {
        invalidDocs++
        return
      }

      validDocs++
      allQuestions.push(...data.questions)
    })

    if (allQuestions.length === 0) {
      return null
    }

    return allQuestions
  } catch (error) {
    console.error(`Error fetching question pool for ${level}:`, error)

    if (error.code === 'permission-denied') {
      console.error(`Permission denied for collection '${level}Pool'. Check Firestore security rules.`)
    }

    return null
  }
}

/**
 * Generate random test questions from a pool
 * @param {Array} poolQuestions - Array of questions from the pool
 * @param {number} requiredCount - Number of questions needed for the test
 * @returns {Array} - Randomly selected questions
 */
export function generateRandomQuestions(poolQuestions, requiredCount) {
  if (!poolQuestions || poolQuestions.length === 0) {
    return []
  }

  if (poolQuestions.length <= requiredCount) {
    // If pool has fewer or equal questions than required, return all shuffled
    return shuffleArray(poolQuestions)
  }

  // Shuffle and slice the required number of questions
  const shuffled = shuffleArray(poolQuestions)
  return shuffled.slice(0, requiredCount)
}

/**
 * Get questions for a test, using pool if available, otherwise fallback to test's own questions
 * @param {Object} test - The test object with questions
 * @param {string} level - The level identifier
 * @param {number} questionCount - Number of questions needed (optional, defaults to test's question count)
 * @returns {Promise<Object>} - Object with questions and source info
 */
export async function getTestQuestions(test, level, questionCount = null) {
  const testQuestions = test.questions || []
  const requiredCount = questionCount || testQuestions.length

  // Try to fetch from question pool
  const poolQuestions = await fetchQuestionPool(level)

  if (poolQuestions && poolQuestions.length > 0) {
    console.log(`Using question pool for ${level}: ${poolQuestions.length} questions available`)
    const randomQuestions = generateRandomQuestions(poolQuestions, requiredCount)
    return {
      questions: randomQuestions,
      source: 'pool',
      poolSize: poolQuestions.length,
      testId: test.id
    }
  }

  // Fallback to test's own questions
  return {
    questions: testQuestions,
    source: 'test',
    testId: test.id
  }
}

/**
 * Check if a level has a question pool
 * @param {string} level - The level identifier
 * @returns {Promise<boolean>} - True if pool exists and has questions
 */
export async function hasQuestionPool(level) {
  const poolQuestions = await fetchQuestionPool(level)
  return poolQuestions && poolQuestions.length > 0
}