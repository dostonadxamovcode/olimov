/**
 * Data Migration Utility
 * Helps migrate hardcoded data to Firebase collections
 * Run this script to populate initial data in Firestore
 */

import {
  levelsService,
  servicesService,
  featuresService,
  statisticsService,
  settingsService
} from '../services/firebaseCollections'

// ── Initial Data ───────────────────────────────────────────────────────────────

const INITIAL_LEVELS = [
  {
    id: 'a1',
    code: 'A1',
    name: 'Beginner',
    description: 'Basic words and simple phrases.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-400',
    order: 1,
    isActive: true
  },
  {
    id: 'a2',
    code: 'A2',
    name: 'Elementary',
    description: 'Simple conversations on familiar topics.',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-400',
    order: 2,
    isActive: true
  },
  {
    id: 'b1',
    code: 'B1',
    name: 'Intermediate',
    description: 'Handle most travel situations and describe experiences.',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-400',
    order: 3,
    isActive: true
  },
  {
    id: 'b2',
    code: 'B2',
    name: 'Pre-Intermediate',
    description: 'Fluent interaction with native speakers.',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-400',
    order: 4,
    isActive: true
  },
  {
    id: 'c1',
    code: 'C1',
    name: 'Advanced',
    description: 'Fluent expression for social and professional use.',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-400',
    order: 5,
    isActive: true
  },
  {
    id: 'c2',
    code: 'C2',
    name: 'Proficient',
    description: 'Near-native precision and fluency.',
    color: 'yellow',
    gradient: 'from-yellow-400 to-amber-300',
    order: 6,
    isActive: true
  }
]

const INITIAL_SERVICES = [
  {
    id: 'listening',
    slug: 'listening',
    title: 'Listening Practice',
    description: 'Focused listening exercises with transcripts.',
    icon: 'Headphones',
    features: ['Audio transcripts', 'Real exam format', 'Speed control', 'Section-wise practice'],
    order: 1,
    isActive: true
  },
  {
    id: 'reading',
    slug: 'reading',
    title: 'Reading Drills',
    description: 'Timed reading passages and strategies.',
    icon: 'BookOpen',
    features: ['Academic texts', 'Time management', 'Question types', 'Vocabulary building'],
    order: 2,
    isActive: true
  },
  {
    id: 'writing',
    slug: 'writing',
    title: 'Writing Coaching',
    description: 'Step-by-step writing feedback and templates.',
    icon: 'PenTool',
    features: ['Task 1 & 2', 'Sample essays', 'Grammar checks', 'Band score tips'],
    order: 3,
    isActive: true
  },
  {
    id: 'speaking',
    slug: 'speaking',
    title: 'Speaking Sessions',
    description: 'Mock speaking tests with live feedback.',
    icon: 'Mic',
    features: ['Real exam format', 'Record & review', 'Fluency practice', 'Pronunciation'],
    order: 4,
    isActive: true
  },
  {
    id: 'mock-tests',
    slug: 'mock-tests',
    title: 'Mock Tests',
    description: 'Full-length mock exams with scoring.',
    icon: 'FileText',
    features: ['Complete tests', 'Instant scoring', 'Detailed reports', 'Progress tracking'],
    order: 5,
    isActive: true
  },
  {
    id: 'analytics',
    slug: 'analytics',
    title: 'Performance Analytics',
    description: 'Track progress and weak areas.',
    icon: 'BarChart3',
    features: ['Visual charts', 'Skill analysis', 'Weakness alerts', 'Study recommendations'],
    order: 6,
    isActive: true
  }
]

const INITIAL_FEATURES = [
  {
    id: 'timed-practice',
    title: 'Timed Practice',
    description: 'Train under real-time conditions.',
    icon: 'Timer',
    order: 1,
    isActive: true
  },
  {
    id: 'instant-feedback',
    title: 'Instant Feedback',
    description: 'Get results right after submission.',
    icon: 'Zap',
    order: 2,
    isActive: true
  },
  {
    id: 'progress-tracking',
    title: 'Progress Tracking',
    description: 'Visualize improvements over time.',
    icon: 'BarChart2',
    order: 3,
    isActive: true
  },
  {
    id: 'expert-tips',
    title: 'Expert Tips',
    description: 'Teacher-approved strategies.',
    icon: 'TrendingUp',
    order: 4,
    isActive: true
  },
  {
    id: 'global-content',
    title: 'Global Content',
    description: 'Content from international sources.',
    icon: 'Globe',
    order: 5,
    isActive: true
  },
  {
    id: 'secure-exams',
    title: 'Secure Exams',
    description: 'Trusted, secure testing environment.',
    icon: 'ShieldCheck',
    order: 6,
    isActive: true
  }
]

const INITIAL_STATISTICS = [
  {
    id: 'students',
    key: 'students',
    label: 'Students',
    value: '12k+',
    icon: 'Users',
    order: 1
  },
  {
    id: 'practice-hours',
    key: 'practiceHours',
    label: 'Practice Hours',
    value: '40k+',
    icon: 'Clock',
    order: 2
  },
  {
    id: 'mock-tests',
    key: 'mockTests',
    label: 'Mock Tests',
    value: '5k+',
    icon: 'FileText',
    order: 3
  }
]

const INITIAL_SETTINGS = [
  {
    key: 'siteName',
    value: 'Olimov CEFR Pro',
    description: 'Site name displayed in header and title'
  },
  {
    key: 'siteDescription',
    value: 'Professional CEFR English learning platform',
    description: 'Site description for SEO'
  },
  {
    key: 'contactEmail',
    value: 'contact@olimov.com',
    description: 'Contact email address'
  },
  {
    key: 'maintenanceMode',
    value: false,
    description: 'Enable maintenance mode'
  },
  {
    key: 'registrationOpen',
    value: true,
    description: 'Allow new user registrations'
  }
]

// ── Migration Functions ─────────────────────────────────────────────────────────

/**
 * Migrate levels to Firebase
 */
export const migrateLevels = async () => {
  console.log('🚀 Starting levels migration...')
  
  for (const level of INITIAL_LEVELS) {
    try {
      await levelsService.set(level.id, level)
      console.log(`✅ Level ${level.code} migrated successfully`)
    } catch (error) {
      console.error(`❌ Error migrating level ${level.code}:`, error)
    }
  }
  
  console.log('🎉 Levels migration completed!')
}

/**
 * Migrate services to Firebase
 */
export const migrateServices = async () => {
  console.log('🚀 Starting services migration...')
  
  for (const service of INITIAL_SERVICES) {
    try {
      await servicesService.set(service.id, service)
      console.log(`✅ Service ${service.title} migrated successfully`)
    } catch (error) {
      console.error(`❌ Error migrating service ${service.title}:`, error)
    }
  }
  
  console.log('🎉 Services migration completed!')
}

/**
 * Migrate features to Firebase
 */
export const migrateFeatures = async () => {
  console.log('🚀 Starting features migration...')
  
  for (const feature of INITIAL_FEATURES) {
    try {
      await featuresService.set(feature.id, feature)
      console.log(`✅ Feature ${feature.title} migrated successfully`)
    } catch (error) {
      console.error(`❌ Error migrating feature ${feature.title}:`, error)
    }
  }
  
  console.log('🎉 Features migration completed!')
}

/**
 * Migrate statistics to Firebase
 */
export const migrateStatistics = async () => {
  console.log('🚀 Starting statistics migration...')
  
  for (const stat of INITIAL_STATISTICS) {
    try {
      await statisticsService.update(stat.id, stat)
      console.log(`✅ Statistic ${stat.label} migrated successfully`)
    } catch (error) {
      console.error(`❌ Error migrating statistic ${stat.label}:`, error)
    }
  }
  
  console.log('🎉 Statistics migration completed!')
}

/**
 * Migrate settings to Firebase
 */
export const migrateSettings = async () => {
  console.log('🚀 Starting settings migration...')
  
  for (const setting of INITIAL_SETTINGS) {
    try {
      await settingsService.update(setting.key, setting.value)
      console.log(`✅ Setting ${setting.key} migrated successfully`)
    } catch (error) {
      console.error(`❌ Error migrating setting ${setting.key}:`, error)
    }
  }
  
  console.log('🎉 Settings migration completed!')
}

/**
 * Run all migrations
 */
export const migrateAllData = async () => {
  console.log('🌟 Starting complete data migration...')
  console.log('=' .repeat(50))
  
  try {
    await migrateLevels()
    console.log()
    await migrateServices()
    console.log()
    await migrateFeatures()
    console.log()
    await migrateStatistics()
    console.log()
    await migrateSettings()
    console.log()
    console.log('🎊 All data migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

/**
 * Check if data has been migrated
 */
export const checkMigrationStatus = async () => {
  try {
    const levels = await levelsService.getAll()
    const services = await servicesService.getAll()
    const features = await featuresService.getAll()
    const settings = await settingsService.getAll()
    
    return {
      levels: levels.length > 0,
      services: services.length > 0,
      features: features.length > 0,
      settings: Object.keys(settings).length > 0,
      isComplete: levels.length > 0 && services.length > 0 && features.length > 0 && Object.keys(settings).length > 0
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return {
      levels: false,
      services: false,
      features: false,
      settings: false,
      isComplete: false
    }
  }
}

export default {
  migrateLevels,
  migrateServices,
  migrateFeatures,
  migrateStatistics,
  migrateSettings,
  migrateAllData,
  checkMigrationStatus
}