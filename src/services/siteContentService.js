/**
 * Site Content Service
 *
 * Single source of truth for UI content (stats, features, services, navLinks …).
 * Data flow:
 *   1. DEFAULT_CONTENT is returned synchronously — zero flicker on first render.
 *   2. On mount, one Firestore read hydrates the module-level cache.
 *   3. All hook instances share the same cache — only ONE Firestore read per session.
 *   4. If Firestore has updated values (e.g. admin changed stats), state silently updates.
 *
 * No imports from /data folder — all defaults are embedded here.
 */

import { doc, getDoc } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { db } from '../firebase'

// ── Embedded defaults (mirrors former /data/siteData.js) ─────────────────────
const _listeningParts = [
  { title: 'Short Conversations' },
  { title: 'Daily Situations' },
  { title: 'Study & Education' },
  { title: 'Academic Talk' },
  { title: 'Opinions & Discussions' },
  { title: 'Advanced Understanding' },
]

const DEFAULT_CONTENT = {
  navLinks: [
    { label: 'nav.home',      href: '/#top' },
    { label: 'nav.services',  href: '/#services' },
    { label: 'nav.mockTests', href: '/#ielts-mock-tests' },
    { label: 'nav.results',   href: '/result' },
    { label: 'nav.contact',   href: '/#contact' },
    { label: 'nav.about',     href: '/about' },
    { label: 'nav.levels',    href: '/level' },
  ],

  stats: [
    { id: 'st1', label: 'Students',       value: '12k+' },
    { id: 'st2', label: 'Practice Hours', value: '40k+' },
    { id: 'st3', label: 'Mock Tests',     value: '5k+' },
  ],

  features: [
    { id: 'f1', title: 'Timed Practice',    description: 'Train under real-time conditions.',         icon: 'Timer'      },
    { id: 'f2', title: 'Instant Feedback',  description: 'Get results right after submission.',        icon: 'Zap'        },
    { id: 'f3', title: 'Progress Tracking', description: 'Visualize improvements over time.',          icon: 'BarChart2'  },
    { id: 'f4', title: 'Expert Tips',       description: 'Teacher-approved strategies.',               icon: 'TrendingUp' },
    { id: 'f5', title: 'Global Content',    description: 'Content from international sources.',        icon: 'Globe'      },
    { id: 'f6', title: 'Secure Exams',      description: 'Trusted, secure testing environment.',       icon: 'ShieldCheck'},
  ],

  services: [
    { id: 's1', slug: 'listening',   title: 'Listening Practice',      description: 'Focused listening exercises with transcripts.',        features: ['Audio transcripts', 'Real exam format', 'Speed control', 'Section-wise practice'] },
    { id: 's2', slug: 'reading',     title: 'Reading Drills',           description: 'Timed reading passages and strategies.',               features: ['Academic texts', 'Time management', 'Question types', 'Vocabulary building'] },
    { id: 's3', slug: 'writing',     title: 'Writing Coaching',         description: 'Step-by-step writing feedback and templates.',         features: ['Task 1 & 2', 'Sample essays', 'Grammar checks', 'Band score tips'] },
    { id: 's4', slug: 'speaking',    title: 'Speaking Sessions',        description: 'Mock speaking tests with live feedback.',              features: ['Real exam format', 'Record & review', 'Fluency practice', 'Pronunciation'] },
    { id: 's5', slug: 'mock-tests',  title: 'Mock Tests',               description: 'Full-length mock exams with scoring.',                 features: ['Complete tests', 'Instant scoring', 'Detailed reports', 'Progress tracking'] },
    { id: 's6', slug: 'analytics',   title: 'Performance Analytics',    description: 'Track progress and weak areas.',                       features: ['Visual charts', 'Skill analysis', 'Weakness alerts', 'Study recommendations'] },
  ],

  listeningParts: _listeningParts,

  listeningPage: {
    badge:             'Premium Cefr Listening Lab',
    title:             'Cefr Listening',
    highlightedTitle:  'Practice',
    subtitle:          'Train with realistic Cefr listening tests, timed sections, and focused part-by-part practice in one polished exam workspace.',
    stats: [
      { id: 'tests',    label: '6 practice tests',   icon: 'Headphones', color: 'text-cyan-300'   },
      { id: 'format',   label: '30 minute format',   icon: 'Clock3',     color: 'text-blue-300'   },
      { id: 'tracking', label: 'Band score tracking', icon: 'Signal',    color: 'text-violet-300' },
    ],
    searchPlaceholder: 'Search listening tests...',
    sectionEyebrow:    'All Tests',
    sectionTitle:      'Choose your next session',
    updateLabel:       'Updated weekly',
    cardDescription:   'Six-part Cefr listening practice with exam-style tasks.',
    tests: [
      { number: '01', title: 'Cambridge Listening Test 1', duration: '30 min', parts: _listeningParts },
      { number: '02', title: 'Cefr Practice Test 2',       duration: '32 min', parts: _listeningParts },
      { number: '03', title: 'Band 7+ Listening Drill',    duration: '28 min', parts: _listeningParts },
      { number: '04', title: 'Academic Listening Set',     duration: '35 min', parts: _listeningParts },
      { number: '05', title: 'Real Exam Simulation',       duration: '30 min', parts: _listeningParts },
      { number: '06', title: 'Advanced Listening Test',    duration: '34 min', parts: _listeningParts },
    ],
  },

  vocabularyWords: ['apt', 'brief', 'concise', 'rapid', 'swift'],
  grammarTopics:   ['Present Simple', 'Past Simple', 'Conditionals', 'Passive Voice'],
}

// ── Module-level cache — ONE Firestore read per browser session ──────────────
let cachedContent  = null
let fetchPromise   = null

function loadSiteContent() {
  if (cachedContent) return Promise.resolve(cachedContent)
  if (fetchPromise)  return fetchPromise

  fetchPromise = getDoc(doc(db, 'siteContent', 'config'))
    .then(snap => {
      if (snap.exists()) cachedContent = snap.data()
      return cachedContent
    })
    .catch(() => null) // network error → keep defaults silently

  return fetchPromise
}

/**
 * Returns the requested content field.
 * Starts with the embedded DEFAULT_CONTENT value (instant render, no spinner),
 * then silently upgrades to Firestore data once the single read completes.
 *
 * @param {keyof typeof DEFAULT_CONTENT} field
 */
export function useSiteContent(field) {
  const [data, setData] = useState(DEFAULT_CONTENT[field])

  useEffect(() => {
    loadSiteContent().then(content => {
      if (content && content[field] !== undefined) {
        setData(content[field])
      }
    })
  }, [field])

  return data
}

/** Force-clear the cache (e.g. after an admin content update). */
export function clearSiteContentCache() {
  cachedContent = null
  fetchPromise  = null
}

export { DEFAULT_CONTENT }
