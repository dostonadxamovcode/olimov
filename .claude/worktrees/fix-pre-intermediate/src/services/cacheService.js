/**
 * Firebase Cache Service
 * Implements caching strategies for Firestore queries
 */

import {
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  query,
  collection
} from 'firebase/firestore'
import { db } from '../firebase'

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Local cache storage
const localCache = new Map()

/**
 * Get cached data with timestamp
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null
 */
const getCachedData = (key) => {
  const cached = localCache.get(key)
  if (!cached) return null

  const { data, timestamp } = cached
  const now = Date.now()

  // Check if cache is still valid
  if (now - timestamp < CACHE_DURATION) {
    return data
  }

  // Cache expired, remove it
  localCache.delete(key)
  return null
}

/**
 * Set cached data with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
const setCachedData = (key, data) => {
  localCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Get documents with cache-first strategy
 * Tries cache first, falls back to server if cache miss or expired
 * @param {Object} q - Firestore query
 * @param {string} cacheKey - Unique cache key for this query
 * @returns {Promise<Array>} Array of documents
 */
export const getDocumentsWithCache = async (q, cacheKey) => {
  try {
    // Try to get from local cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`)
      return cached
    }

    // Try Firestore cache
    try {
      const cachedSnapshot = await getDocsFromCache(q)
      const data = cachedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Store in local cache
      setCachedData(cacheKey, data)

      console.log(`Firestore cache hit for ${cacheKey}`)
      return data
    } catch (cacheError) {
      console.log(`Firestore cache miss for ${cacheKey}, fetching from server`)
    }

    // Fetch from server
    const serverSnapshot = await getDocsFromServer(q)
    const data = serverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Store in local cache
    setCachedData(cacheKey, data)

    return data
  } catch (error) {
    console.error(`Error fetching documents with cache for ${cacheKey}:`, error)
    throw error
  }
}

/**
 * Get documents with network-first strategy
 * Tries server first, falls back to cache if network fails
 * @param {Object} q - Firestore query
 * @param {string} cacheKey - Unique cache key for this query
 * @returns {Promise<Array>} Array of documents
 */
export const getDocumentsNetworkFirst = async (q, cacheKey) => {
  try {
    // Try server first
    const serverSnapshot = await getDocs(q)
    const data = serverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Store in local cache
    setCachedData(cacheKey, data)

    return data
  } catch (error) {
    console.log(`Network failed for ${cacheKey}, trying cache`)

    // Fall back to cache
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    throw error
  }
}

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  localCache.delete(key)
}

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  localCache.clear()
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: localCache.size,
    keys: Array.from(localCache.keys())
  }
}

export default {
  getDocumentsWithCache,
  getDocumentsNetworkFirst,
  clearCache,
  clearAllCache,
  getCacheStats
}