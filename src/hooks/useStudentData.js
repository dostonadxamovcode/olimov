/**
 * Custom hook for student data with real-time updates
 * Optimized for performance with proper caching and error handling
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  subscribeToAllStudents,
  subscribeToCEFRStudents,
  subscribeToIELTSStudents 
} from '../services/optimizedFirestore'

/**
 * Hook for combined CEFR and IELTS student data
 */
export const useStudentData = () => {
  const [data, setData] = useState({
    cefr: [],
    ielts: [],
    loading: true,
    error: null
  })
  
  const unsubscribeRef = useRef(null)
  
  useEffect(() => {
    unsubscribeRef.current = subscribeToAllStudents((result) => {
      setData(result)
    })
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])
  
  return data
}

/**
 * Hook for CEFR students only
 */
export const useCEFRStudents = () => {
  const [data, setData] = useState({
    data: [],
    loading: true,
    error: null
  })
  
  const unsubscribeRef = useRef(null)
  
  useEffect(() => {
    unsubscribeRef.current = subscribeToCEFRStudents((result) => {
      setData(result)
    })
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])
  
  return data
}

/**
 * Hook for IELTS students only
 */
export const useIELTSStudents = () => {
  const [data, setData] = useState({
    data: [],
    loading: true,
    error: null
  })
  
  const unsubscribeRef = useRef(null)
  
  useEffect(() => {
    unsubscribeRef.current = subscribeToIELTSStudents((result) => {
      setData(result)
    })
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])
  
  return data
}

/**
 * Memoized computation hook for top achievers
 */
export const useTopAchievers = (students, limit = 5) => {
  const [topAchievers, setTopAchievers] = useState([])
  
  useEffect(() => {
    if (!students || students.length === 0) {
      setTopAchievers([])
      return
    }
    
    // Sort and get top achievers
    const sorted = [...students]
      .sort((a, b) => {
        const scoreA = a.overallScore
        const scoreB = b.overallScore
        
        // Handle CEFR strings
        if (typeof scoreA === 'string' && typeof scoreB === 'string') {
          const cefrOrder = { 'C2': 6, 'C1': 5, 'B2': 4, 'B1': 3, 'A2': 2, 'A1': 1 }
          if (/^[A-C][12]$/.test(scoreA.trim()) && /^[A-C][12]$/.test(scoreB.trim())) {
            return cefrOrder[scoreB.trim()] - cefrOrder[scoreA.trim()]
          }
        }
        
        // Numeric comparison
        const numA = typeof scoreA === 'number' ? scoreA : parseFloat(scoreA) || 0
        const numB = typeof scoreB === 'number' ? scoreB : parseFloat(scoreB) || 0
        return numB - numA
      })
      .slice(0, limit)
    
    setTopAchievers(sorted)
  }, [students, limit])
  
  return topAchievers
}

/**
 * Memoized computation hook for statistics
 */
export const useStudentStats = (students) => {
  const [stats, setStats] = useState({
    total: 0,
    highestScore: 0,
    highestScoreStudent: null,
    averageScore: 0
  })
  
  useEffect(() => {
    if (!students || students.length === 0) {
      setStats({
        total: 0,
        highestScore: 0,
        highestScoreStudent: null,
        averageScore: 0
      })
      return
    }
    
    const total = students.length
    
    // Find highest score
    let highestScore = 0
    let highestScoreStudent = null
    
    students.forEach(student => {
      const score = student.overallScore
      let numericScore
      
      if (typeof score === 'string') {
        if (/^[A-C][12]$/.test(score.trim())) {
          const cefrOrder = { 'C2': 6, 'C1': 5, 'B2': 4, 'B1': 3, 'A2': 2, 'A1': 1 }
          numericScore = cefrOrder[score.trim()] * 10 // Convert to numeric for comparison
        } else {
          numericScore = parseFloat(score) || 0
        }
      } else {
        numericScore = score || 0
      }
      
      if (numericScore > highestScore) {
        highestScore = numericScore
        highestScoreStudent = student
      }
    })
    
    // Calculate average
    const totalScore = students.reduce((sum, student) => {
      const score = student.overallScore
      let numericScore
      
      if (typeof score === 'string') {
        if (/^[A-C][12]$/.test(score.trim())) {
          const cefrOrder = { 'C2': 6, 'C1': 5, 'B2': 4, 'B1': 3, 'A2': 2, 'A1': 1 }
          numericScore = cefrOrder[score.trim()] * 10
        } else {
          numericScore = parseFloat(score) || 0
        }
      } else {
        numericScore = score || 0
      }
      
      return sum + numericScore
    }, 0)
    
    const averageScore = total > 0 ? Math.round(totalScore / total) : 0
    
    setStats({
      total,
      highestScore,
      highestScoreStudent,
      averageScore
    })
  }, [students])
  
  return stats
}