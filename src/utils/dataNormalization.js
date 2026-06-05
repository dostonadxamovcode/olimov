/**
 * Data Normalization Utilities
 * Handles all data transformation and normalization for consistent UI rendering
 */

// Score normalization
export const toScore = (value) => {
  const score = Number(value)
  return Number.isFinite(score) ? score : 0
}

// Format score for display (handles CEFR strings and numeric scores)
export const formatScore = (value) => {
  if (typeof value === 'string') {
    const cefrPattern = /^[A-C][12]$/
    if (cefrPattern.test(value.trim())) {
      return value.trim()
    }
  }
  const score = toScore(value)
  return score > 0 ? String(score) : '—'
}

// Get initials from name
export const getInitials = (name = '') => {
  const trimmedName = name.trim()
  if (trimmedName === 'Unnamed student' || trimmedName === '') {
    return '?'
  }
  return trimmedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
}

// CEFR level ordering for sorting
export const CEFR_ORDER = { 'C2': 6, 'C1': 5, 'B2': 4, 'B1': 3, 'A2': 2, 'A1': 1 }

// Check if value is a valid CEFR level
export const isCEFRLevel = (value) => {
  if (typeof value !== 'string') return false
  return /^[A-C][12]$/.test(value.trim())
}

// Normalize field names (remove trailing spaces)
export const normalizeFieldNames = (data) => {
  const normalized = {}
  Object.keys(data).forEach(key => {
    const normalizedKey = key.trim()
    normalized[normalizedKey] = data[key]
  })
  return normalized
}

// Normalize CEFR student data
export const normalizeCEFRStudent = (student = {}) => {
  const normalizedData = normalizeFieldNames(student)
  
  const name = String(normalizedData.name || 'Unnamed student').trim()
  const reading = toScore(normalizedData.reading)
  const listening = toScore(normalizedData.listening)
  const writing = toScore(normalizedData.writing)
  const speaking = toScore(normalizedData.speaking)
  
  // Handle overallScore
  let overallScore = normalizedData.overallScore
  if (typeof overallScore === 'string') {
    if (isCEFRLevel(overallScore)) {
      overallScore = overallScore.trim()
    } else {
      overallScore = toScore(overallScore)
    }
  } else {
    overallScore = toScore(overallScore)
  }
  
  // Calculate average if overallScore is numeric and 0
  const averageScore = Math.round((reading + listening + writing + speaking) / 4)
  if (typeof overallScore === 'number' && overallScore === 0) {
    overallScore = averageScore
  }
  
  return {
    id: student.id,
    name,
    initials: String(normalizedData.initials || getInitials(name)).trim() || '?',
    reading,
    listening,
    writing,
    speaking,
    overallScore,
    date: normalizedData.date || '',
    certificateId: normalizedData.certificateId || '',
    type: 'CEFR' // Data type identifier
  }
}

// Normalize IELTS student data
export const normalizeIELTSStudent = (student = {}) => {
  const normalizedData = normalizeFieldNames(student)
  
  const name = String(normalizedData.name || 'Unnamed student').trim()
  const reading = toScore(normalizedData.reading)
  const listening = toScore(normalizedData.listening)
  const writing = toScore(normalizedData.writing)
  const speaking = toScore(normalizedData.speaking)
  
  // IELTS scores are typically 0-9, handle as numbers
  let overallScore = toScore(normalizedData.overallScore || normalizedData.band)
  const averageScore = (reading + listening + writing + speaking) / 4
  
  if (overallScore === 0 && averageScore > 0) {
    overallScore = Math.round(averageScore * 10) / 10 // Keep one decimal
  }
  
  return {
    id: student.id,
    name,
    initials: String(normalizedData.initials || getInitials(name)).trim() || '?',
    reading,
    listening,
    writing,
    speaking,
    overallScore,
    date: normalizedData.date || normalizedData.testDate || '',
    certificateId: normalizedData.certificateId || normalizedData.testReportNumber || '',
    type: 'IELTS' // Data type identifier
  }
}

// Calculate average score
export const getAverageScore = (student) => {
  return Math.round(
    (toScore(student.reading) +
      toScore(student.listening) +
      toScore(student.writing) +
      toScore(student.speaking)) / 4
  )
}

// Score color for gradients
export const getScoreColor = (score, isIELTS = false) => {
  const value = isIELTS ? score : score
  
  if (typeof value === 'string') {
    if (isCEFRLevel(value)) {
      const cefr = value.trim()
      if (cefr === 'C2' || cefr === 'C1') return 'from-[#0ea5e9] to-[#8b5cf6]'
      if (cefr === 'B2' || cefr === 'B1') return 'from-[#8b5cf6] to-[#a855f7]'
      if (cefr === 'A2') return 'from-[#a855f7] to-[#f43f5e]'
      if (cefr === 'A1') return 'from-[#f59e0b] to-[#f43f5e]'
    }
  }
  
  const numericValue = toScore(value)
  if (isIELTS) {
    // IELTS scores are 0-9
    if (numericValue >= 8) return 'from-[#0ea5e9] to-[#8b5cf6]'
    if (numericValue >= 7) return 'from-[#8b5cf6] to-[#a855f7]'
    if (numericValue >= 6) return 'from-[#a855f7] to-[#f43f5e]'
    if (numericValue >= 5) return 'from-[#f59e0b] to-[#f43f5e]'
    return 'from-[#374151] to-[#4b5563]'
  } else {
    // CEFR scores are typically higher
    if (numericValue >= 70) return 'from-[#0ea5e9] to-[#8b5cf6]'
    if (numericValue >= 60) return 'from-[#8b5cf6] to-[#a855f7]'
    if (numericValue >= 50) return 'from-[#a855f7] to-[#f43f5e]'
    if (numericValue >= 40) return 'from-[#f59e0b] to-[#f43f5e]'
    return 'from-[#374151] to-[#4b5563]'
  }
}

// Score text color
export const getScoreTextColor = (score, isIELTS = false) => {
  const value = isIELTS ? score : score
  
  if (typeof value === 'string') {
    if (isCEFRLevel(value)) {
      const cefr = value.trim()
      if (cefr === 'C2' || cefr === 'C1') return 'text-[#0ea5e9]'
      if (cefr === 'B2' || cefr === 'B1') return 'text-[#8b5cf6]'
      if (cefr === 'A2') return 'text-[#a855f7]'
      if (cefr === 'A1') return 'text-[#f59e0b]'
    }
  }
  
  const numericValue = toScore(value)
  if (isIELTS) {
    if (numericValue >= 8) return 'text-[#0ea5e9]'
    if (numericValue >= 7) return 'text-[#8b5cf6]'
    if (numericValue >= 6) return 'text-[#a855f7]'
    if (numericValue >= 5) return 'text-[#f59e0b]'
    return 'text-gray-400'
  } else {
    if (numericValue >= 70) return 'text-[#0ea5e9]'
    if (numericValue >= 60) return 'text-[#8b5cf6]'
    if (numericValue >= 50) return 'text-[#a855f7]'
    if (numericValue >= 40) return 'text-[#f59e0b]'
    return 'text-gray-400'
  }
}

// Safe sorting function that handles both CEFR strings and numeric scores
export const sortByScore = (a, b) => {
  const scoreA = a.overallScore
  const scoreB = b.overallScore
  
  // Handle CEFR strings
  if (typeof scoreA === 'string' && typeof scoreB === 'string') {
    if (isCEFRLevel(scoreA) && isCEFRLevel(scoreB)) {
      return CEFR_ORDER[scoreB.trim()] - CEFR_ORDER[scoreA.trim()]
    }
  }
  
  // Fallback to numeric comparison
  return toScore(scoreB) - toScore(scoreA)
}

// Filter out invalid students
export const filterValidStudents = (students) => {
  return students.filter(student => 
    student.name && 
    student.name !== 'Unnamed student' &&
    student.name.trim() !== ''
  )
}