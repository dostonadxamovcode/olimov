/**
 * Admin Dashboard Firebase Service
 * Handles dashboard statistics, charts data, and activity logs
 */

import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

// Collection name
const DASHBOARD_COLLECTION = 'adminDashboard'

// ── Initial Dashboard Data ─────────────────────────────────────────────────────

const INITIAL_DASHBOARD_DATA = {
  stats: [
    {
      id: 'students-registration',
      label: 'Students Registration',
      value: '247',
      change: '+12% from last month',
      up: true,
      color: '#3b82f6',
      icon: 'Users'
    },
    {
      id: 'partner-agencies',
      label: 'Partner Agencies',
      value: '29',
      change: '3 New this month',
      up: true,
      color: '#a855f7',
      icon: 'GraduationCap'
    },
    {
      id: 'approved-applications',
      label: 'Approved Applications',
      value: '133',
      change: '+12% from last month',
      up: true,
      color: '#22c55e',
      icon: 'FileText'
    },
    {
      id: 'pending-applications',
      label: 'Pending Application',
      value: '120',
      change: '5 New today',
      up: false,
      color: '#f97316',
      icon: 'FileText'
    }
  ],
  trendData: [
    { month: 'Jan', value: 44 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 67 },
    { month: 'Apr', value: 65 },
    { month: 'May', value: 78 },
    { month: 'Jun', value: 91 }
  ],
  statusData: [
    { name: 'In Review', value: 20, color: '#facc15' },
    { name: 'Pending', value: 29, color: '#f97316' },
    { name: 'Approved', value: 43, color: '#3b82f6' },
    { name: 'Rejected', value: 8, color: '#ef4444' }
  ],
  uniData: [
    { name: 'AUB', value: 87 },
    { name: 'TUD', value: 74 },
    { name: 'MIT', value: 61 },
    { name: 'UCL', value: 55 },
    { name: 'NUS', value: 42 }
  ],
  recentActivity: [
    { title: 'New Application', sub: 'John Doe – University of Auckland', time: '15 min ago', dot: '#3b82f6' },
    { title: 'Document Upload', sub: 'Sara Kim – AUT University', time: '1 hour ago', dot: '#22c55e' },
    { title: 'Application Approved', sub: 'Ali Hassan – Victoria University', time: '2 hours ago', dot: '#f97316' },
    { title: 'New Student', sub: 'Emma Wilson – registered', time: '3 hours ago', dot: '#a855f7' },
    { title: 'Commission Paid', sub: '$1,240 – Partner Agency NZ', time: '5 hours ago', dot: '#facc15' }
  ],
  updatedAt: serverTimestamp()
}

// ── Dashboard Service Functions ──────────────────────────────────────────────────

/**
 * Get all dashboard data
 */
export const getDashboardData = async () => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      // Initialize with default data if not exists
      await initializeDashboardData()
      return INITIAL_DASHBOARD_DATA
    }
  } catch (error) {
    console.error('Error getting dashboard data:', error)
    throw error
  }
}

/**
 * Initialize dashboard data with default values
 */
export const initializeDashboardData = async () => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    await setDoc(docRef, INITIAL_DASHBOARD_DATA)
    console.log('Dashboard data initialized successfully')
    return INITIAL_DASHBOARD_DATA
  } catch (error) {
    console.error('Error initializing dashboard data:', error)
    throw error
  }
}

/**
 * Update dashboard statistics
 */
export const updateStats = async (stats) => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    await updateDoc(docRef, {
      stats,
      updatedAt: serverTimestamp()
    })
    console.log('Stats updated successfully')
  } catch (error) {
    console.error('Error updating stats:', error)
    throw error
  }
}

/**
 * Update single stat item
 */
export const updateStatItem = async (statId, updates) => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    const currentData = await getDashboardData()
    
    const updatedStats = currentData.stats.map(stat => 
      stat.id === statId ? { ...stat, ...updates } : stat
    )
    
    await updateDoc(docRef, {
      stats: updatedStats,
      updatedAt: serverTimestamp()
    })
    console.log(`Stat ${statId} updated successfully`)
  } catch (error) {
    console.error('Error updating stat item:', error)
    throw error
  }
}

/**
 * Update trend data
 */
export const updateTrendData = async (trendData) => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    await updateDoc(docRef, {
      trendData,
      updatedAt: serverTimestamp()
    })
    console.log('Trend data updated successfully')
  } catch (error) {
    console.error('Error updating trend data:', error)
    throw error
  }
}

/**
 * Update status data
 */
export const updateStatusData = async (statusData) => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    await updateDoc(docRef, {
      statusData,
      updatedAt: serverTimestamp()
    })
    console.log('Status data updated successfully')
  } catch (error) {
    console.error('Error updating status data:', error)
    throw error
  }
}

/**
 * Update university data
 */
export const updateUniData = async (uniData) => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    await updateDoc(docRef, {
      uniData,
      updatedAt: serverTimestamp()
    })
    console.log('University data updated successfully')
  } catch (error) {
    console.error('Error updating university data:', error)
    throw error
  }
}

/**
 * Add activity to recent activity log
 */
export const addActivity = async (activity) => {
  try {
    const currentData = await getDashboardData()
    const newActivity = {
      ...activity,
      timestamp: serverTimestamp()
    }
    
    // Keep only last 10 activities
    const updatedRecentActivity = [
      newActivity,
      ...currentData.recentActivity.slice(0, 9)
    ]
    
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    await updateDoc(docRef, {
      recentActivity: updatedRecentActivity,
      updatedAt: serverTimestamp()
    })
    console.log('Activity added successfully')
  } catch (error) {
    console.error('Error adding activity:', error)
    throw error
  }
}

/**
 * Clear all recent activities
 */
export const clearActivities = async () => {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
    await updateDoc(docRef, {
      recentActivity: [],
      updatedAt: serverTimestamp()
    })
    console.log('Activities cleared successfully')
  } catch (error) {
    console.error('Error clearing activities:', error)
    throw error
  }
}

/**
 * Subscribe to dashboard data changes (real-time)
 */
export const subscribeToDashboard = (callback) => {
  const docRef = doc(db, DASHBOARD_COLLECTION, 'config')
  
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data(), null)
      } else {
        // Initialize if not exists
        initializeDashboardData().then(() => {
          callback(INITIAL_DASHBOARD_DATA, null)
        })
      }
    },
    (error) => {
      console.error('Error subscribing to dashboard:', error)
      callback(null, error)
    }
  )
  
  return unsubscribe
}

/**
 * Reset dashboard data to defaults
 */
export const resetDashboardData = async () => {
  try {
    await initializeDashboardData()
    console.log('Dashboard data reset to defaults')
  } catch (error) {
    console.error('Error resetting dashboard data:', error)
    throw error
  }
}

// Custom hook for dashboard data
export const useDashboardData = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const unsubscribe = subscribeToDashboard((dashboardData, err) => {
      if (err) {
        setError(err)
        setLoading(false)
      } else {
        setData(dashboardData)
        setLoading(false)
      }
    })
    
    return () => unsubscribe()
  }, [])
  
  return { data, loading, error }
}

export default {
  getDashboardData,
  initializeDashboardData,
  updateStats,
  updateStatItem,
  updateTrendData,
  updateStatusData,
  updateUniData,
  addActivity,
  clearActivities,
  subscribeToDashboard,
  resetDashboardData,
  useDashboardData
}