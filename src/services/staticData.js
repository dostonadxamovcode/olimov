import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// ── STATIC DATA FALLBACKS ──────────────────────────────────────────────────────
// Static data fallbacks for when Firebase is unavailable
import {
  navLinks,
  stats,
  features,
  services,
  listeningParts,
  vocabularyWords,
  grammarTopics
} from '../data/siteData'

// Additional static data that was hardcoded in components


const CONTACT_INFO = [
  { icon: 'Mail', label: 'Email', value: 'olimovmax2003@gmail.com' },
  { icon: 'Phone', label: 'Phone', value: '+998 90 040 67 28' },
  { icon: 'MapPin', label: 'Location', value: 'Fegana, Uzbekistan' },
]

const ABOUT_PAGE_CONTACTS = [
  { icon: 'Phone', label: '+998900406728', href: 'tel:+998900406728' },
  { icon: 'MessageCircle', label: '@itisteacher_max', href: 'https://t.me/itisteacher_max' },
  { icon: 'Mail', label: 'olimovmax2003@gmail.com', href: 'mailto:olimovmax2003@gmail.com' },
]

const MILESTONES = [
  { icon: 'Users', value: '500+', label: 'Students Trained' },
  { icon: 'Star', value: '7.0', label: 'Avg Band Score' },
  { icon: 'Clock', value: '24/7', label: 'Platform Access' },
  { icon: 'CheckCircle', value: '30+', label: 'Achievements' },
]

const VALUES = [
  'Expert-curated CEFR content aligned with official band descriptors',
  'Personalized learning paths for every student',
  'Regular content updates to reflect latest exam trends',
  'Community of learners and peer study support',
]

const LEARNING_TABS = [
  { id: 'vocab', label: 'Vocabulary Builder', icon: 'BookMarked' },
  { id: 'grammar', label: 'Grammar Practice', icon: 'Layers' },
  { id: 'materials', label: 'Study Materials', icon: 'FileTextTool' },
]

const MATERIALS = [
  { title: 'CEFR Writing Task 1 - Sample Answers', type: 'PDF', size: '2.4 MB' },
  { title: 'CEFR Writing Task 2 - Essay Templates', type: 'PDF', size: '1.8 MB' },
  { title: 'Academic Word List (570 words)', type: 'PDF', size: '0.9 MB' },
  { title: 'Speaking - Part 2 Cue Cards (200+)', type: 'PDF', size: '3.1 MB' },
]

const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'add-test', label: 'Add Test', icon: 'PlusCircle' },
  { id: 'tests', label: 'Tests', icon: 'BookOpen' },
  { id: 'settings', label: 'Dashboard Settings', icon: 'Settings' },
  { id: 'programs', label: 'Programs', icon: 'GraduationCap' },
  { id: 'students', label: 'Students', icon: 'Users' },
  { id: 'applications', label: 'Applications', icon: 'FileText' },
  { id: 'commission', label: 'Commission', icon: 'DollarSign' },
]

const PROFILE_TABS = [
  { id: 'account', label: 'Account Settings', icon: 'User' },
  { id: 'security', label: 'Login & Security', icon: 'Shield' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'interface', label: 'Interface', icon: 'Settings' },
]

const HERO_WORDS = ['mastery.', 'success.', 'precision.', 'fluency.']

const GRADIENT_COLORS = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-red-600',
  'from-red-500 to-pink-600',
  'from-indigo-500 to-blue-600'
]

const BULLET_COLORS = [
  'text-green-400',
  'text-blue-400',
  'text-purple-400',
  'text-orange-400',
  'text-red-400',
  'text-indigo-400'
]

// ── ICON MAPPING SYSTEM ────────────────────────────────────────────────────────
// Icon componentlarini string sifatida saqlash uchun mapping
import {
  // Admin icons
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Settings,
  GraduationCap,
  Users,
  FileText,
  DollarSign,
  Home,
  // Profile icons
  User,
  ShieldCheck as Shield,
  Bell,
  // Contact icons
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  // About icons
  Star,
  Clock,
  CheckCircle,
  // Level icons
  Sprout,
  TrendingUp,
  ChartBar as BarChart2,
  Trophy as Award,
  Star as StarLevel,
  // Feature icons
  Timer,
  Zap,
  Globe,
  // Services icons
  Headphones,
  FilePenLine,
  Mic,
  // Learning tools icons
  BookMarked,
  Layers,
} from 'lucide-react'

export const iconMap = {
  // Admin icons
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Settings,
  GraduationCap,
  Users,
  FileText,
  DollarSign,
  Home,
  
  // Profile icons
  User,
  Shield,
  Bell,
  
  // Contact icons
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  
  // About icons
  Star,
  Clock,
  CheckCircle,
  
  // Level icons
  Sprout,
  BookOpenLevel,
  TrendingUp,
  BarChart2,
  Award,
  StarLevel,
  
  // Feature icons
  Timer,
  Zap,
  BarChart2Feature,
  TrendingUpFeature,
  Globe,
  ShieldCheck,
  
  // Services icons
  Headphones,
  BookOpenService,
  FilePenLine,
  Mic,
  Trophy,
  BarChart3,
  
  // Learning tools icons
  BookMarked,
  Layers,
  FileTextTool,
}

// ── FIREBASE COLLECTIONS STRUCTURE ─────────────────────────────────────────────
export const STATIC_DATA_COLLECTIONS = {
  NAVIGATION: 'siteNavigation',
  LEVELS: 'cefrLevels',
  SITE_CONTENT: 'siteContent',
  CONTACT_INFO: 'contactInfo',
  ABOUT_DATA: 'aboutData',
  LEARNING_TOOLS: 'learningTools',
  ADMIN_NAVIGATION: 'adminNavigation',
  PROFILE_TABS: 'profileTabs',
  HERO_DATA: 'heroData',
}

// ── INITIAL DATA STRUCTURES ─────────────────────────────────────────────────────
export const initialNavigationData = {
  navLinks: navLinks, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialLevelsData = {
  levels: LEVELS, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialSiteContentData = {
  stats: stats, // Using static data as initial value
  features: features, // Using static data as initial value
  services: services.map((service, index) => ({
    ...service,
    icon: ['Headphones', 'BookOpenService', 'FilePenLine', 'Mic', 'Trophy', 'BarChart3'][index]
  })), // Add icons to services
  serviceStyles: {
    gradientColors: GRADIENT_COLORS,
    bulletColors: BULLET_COLORS
  },
  listeningParts: listeningParts, // Using static data as initial value
  vocabularyWords: vocabularyWords, // Using static data as initial value
  grammarTopics: grammarTopics, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialContactInfoData = {
  contactInfo: CONTACT_INFO, // Using static data as initial value
  aboutPageContacts: ABOUT_PAGE_CONTACTS, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialAboutData = {
  milestones: MILESTONES, // Using static data as initial value
  values: VALUES, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialLearningToolsData = {
  tabs: LEARNING_TABS, // Using static data as initial value
  materials: MATERIALS, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialAdminNavigationData = {
  navItems: ADMIN_NAV_ITEMS, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialProfileTabsData = {
  tabs: PROFILE_TABS, // Using static data as initial value
  updatedAt: new Date().toISOString(),
}

export const initialHeroData = {
  words: ['mastery.', 'success.', 'precision.', 'fluency.'],
  updatedAt: new Date().toISOString(),
}

// ── FIREBASE CRUD OPERATIONS ─────────────────────────────────────────────────────

// Get static data from Firebase
export const getStaticData = async (collectionName, docId = 'config') => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return null
    }
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error)
    throw error
  }
}

// Set static data to Firebase
export const setStaticData = async (collectionName, data, docId = 'config') => {
  try {
    const docRef = doc(db, collectionName, docId)
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error(`Error setting ${collectionName}:`, error)
    throw error
  }
}

// Real-time listener for static data
export const subscribeToStaticData = (collectionName, docId = 'config', callback) => {
  const docRef = doc(db, collectionName, docId)
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data())
    } else {
      callback(null)
    }
  }, (error) => {
    console.error(`Error listening to ${collectionName}:`, error)
    callback(null, error)
  })
  
  return unsubscribe
}

// Initialize all static data collections
export const initializeAllStaticData = async () => {
  const collections = [
    { name: STATIC_DATA_COLLECTIONS.NAVIGATION, data: initialNavigationData },
    { name: STATIC_DATA_COLLECTIONS.LEVELS, data: initialLevelsData },
    { name: STATIC_DATA_COLLECTIONS.SITE_CONTENT, data: initialSiteContentData },
    { name: STATIC_DATA_COLLECTIONS.CONTACT_INFO, data: initialContactInfoData },
    { name: STATIC_DATA_COLLECTIONS.ABOUT_DATA, data: initialAboutData },
    { name: STATIC_DATA_COLLECTIONS.LEARNING_TOOLS, data: initialLearningToolsData },
    { name: STATIC_DATA_COLLECTIONS.ADMIN_NAVIGATION, data: initialAdminNavigationData },
    { name: STATIC_DATA_COLLECTIONS.PROFILE_TABS, data: initialProfileTabsData },
    { name: STATIC_DATA_COLLECTIONS.HERO_DATA, data: initialHeroData },
  ]
  
  const results = []
  for (const collection of collections) {
    try {
      const existingData = await getStaticData(collection.name)
      if (!existingData) {
        await setStaticData(collection.name, collection.data)
        results.push({ collection: collection.name, status: 'initialized' })
      } else {
        results.push({ collection: collection.name, status: 'exists' })
      }
    } catch (error) {
      results.push({ collection: collection.name, status: 'error', error: error.message })
    }
  }
  
  return results
}

// ── REACT HOOKS ─────────────────────────────────────────────────────────────────

export const useStaticData = (collectionName, docId = 'config') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const unsubscribe = subscribeToStaticData(collectionName, docId, (result, err) => {
      if (err) {
        setError(err)
        setLoading(false)
      } else {
        setData(result)
        setLoading(false)
        setError(null)
      }
    })
    
    return () => unsubscribe()
  }, [collectionName, docId])
  
  return { data, loading, error }
}