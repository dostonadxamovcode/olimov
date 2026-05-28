export const navLinks = [
  { label: 'Home', href: '/#top' },
  { label: 'Services', href: '/#services' },
  { label: 'Mock Tests', href: '/#mock-tests' },
  { label: 'Results', href: '/result' },
  { label: 'Contact', href: '/#contact' },
  { label: 'About', href: '/about' },
  { label: 'Tools', href: '/tools' },
  { label: 'Courses', href: '/courses' },
  { label: 'Levels', href: '/level' },
]

export const stats = [
  { id: 'st1', label: 'Students', value: '12k+' },
  { id: 'st2', label: 'Practice Hours', value: '40k+' },
  { id: 'st3', label: 'Mock Tests', value: '5k+' },
]

export const features = [
  { id: 'f1', title: 'Timed Practice', description: 'Train under real-time conditions.', icon: 'Timer' },
  { id: 'f2', title: 'Instant Feedback', description: 'Get results right after submission.', icon: 'Zap' },
  { id: 'f3', title: 'Progress Tracking', description: 'Visualize improvements over time.', icon: 'BarChart2' },
  { id: 'f4', title: 'Expert Tips', description: 'Teacher-approved strategies.', icon: 'TrendingUp' },
  { id: 'f5', title: 'Global Content', description: 'Content from international sources.', icon: 'Globe' },
  { id: 'f6', title: 'Secure Exams', description: 'Trusted, secure testing environment.', icon: 'ShieldCheck' },
]

export const services = [
  {
    id: 's1',
    slug: 'listening',
    title: 'Listening Practice',
    description: 'Focused listening exercises with transcripts.',
    features: ['Audio transcripts', 'Real exam format', 'Speed control', 'Section-wise practice']
  },
  {
    id: 's2',
    slug: 'reading',
    title: 'Reading Drills',
    description: 'Timed reading passages and strategies.',
    features: ['Academic texts', 'Time management', 'Question types', 'Vocabulary building']
  },
  {
    id: 's3',
    slug: 'writing',
    title: 'Writing Coaching',
    description: 'Step-by-step writing feedback and templates.',
    features: ['Task 1 & 2', 'Sample essays', 'Grammar checks', 'Band score tips']
  },
  {
    id: 's4',
    slug: 'speaking',
    title: 'Speaking Sessions',
    description: 'Mock speaking tests with live feedback.',
    features: ['Real exam format', 'Record & review', 'Fluency practice', 'Pronunciation']
  },
  {
    id: 's5',
    slug: 'mock-tests',
    title: 'Mock Tests',
    description: 'Full-length mock exams with scoring.',
    features: ['Complete tests', 'Instant scoring', 'Detailed reports', 'Progress tracking']
  },
  {
    id: 's6',
    slug: 'analytics',
    title: 'Performance Analytics',
    description: 'Track progress and weak areas.',
    features: ['Visual charts', 'Skill analysis', 'Weakness alerts', 'Study recommendations']
  },
]

export const listeningParts = [
  { title: 'Short Conversations' },
  { title: 'Daily Situations' },
  { title: 'Study & Education' },
  { title: 'Academic Talk' },
  { title: 'Opinions & Discussions' },
  { title: 'Advanced Understanding' },
]

export const listeningPage = {
  badge: 'Premium Cefr Listening Lab',
  title: 'Cefr Listening',
  highlightedTitle: 'Practice',
  subtitle:
    'Train with realistic Cefr listening tests, timed sections, and focused part-by-part practice in one polished exam workspace.',
  stats: [
    { id: 'tests', label: '6 practice tests', icon: 'Headphones', color: 'text-cyan-300' },
    { id: 'format', label: '30 minute format', icon: 'Clock3', color: 'text-blue-300' },
    { id: 'tracking', label: 'Band score tracking', icon: 'Signal', color: 'text-violet-300' },
  ],
  searchPlaceholder: 'Search listening tests...',
  sectionEyebrow: 'All Tests',
  sectionTitle: 'Choose your next session',
  updateLabel: 'Updated weekly',
  cardDescription: 'Six-part Cefr listening practice with exam-style tasks.',
  tests: [
    {
      number: '01',
      title: 'Cambridge Listening Test 1',
      duration: '30 min',
      parts: listeningParts,
    },
    {
      number: '02',
      title: 'Cefr Practice Test 2',
      duration: '32 min',
      parts: listeningParts,
    },
    {
      number: '03',
      title: 'Band 7+ Listening Drill',
      duration: '28 min',
      parts: listeningParts,
    },
    {
      number: '04',
      title: 'Academic Listening Set',
      duration: '35 min',
      parts: listeningParts,
    },
    {
      number: '05',
      title: 'Real Exam Simulation',
      duration: '30 min',
      parts: listeningParts,
    },
    {
      number: '06',
      title: 'Advanced Listening Test',
      duration: '34 min',
      parts: listeningParts,
    },
  ],
}

export const mockTestQuestions = [
  {
    id: 'q1',
    section: 'Listening',
    question: 'What is the main topic of the conversation?',
    options: ['Weather', 'Travel', 'Education', 'Health'],
    correct: 2,
    passage: null,
  },
  {
    id: 'q2',
    section: 'Reading',
    question: 'What does the author imply about technology?',
    options: ['It harms society', 'It helps learning', 'It is irrelevant', 'It is expensive'],
    correct: 1,
    passage: null,
  },
  {
    id: 'q3',
    section: 'Writing',
    question: 'Which sentence best summarizes the paragraph?',
    options: ['A', 'B', 'C', 'D'],
    correct: 0,
    passage: 'A short sample passage used for testing purposes.',
  },
  {
    id: 'q4',
    section: 'Speaking',
    question: 'How would you describe your hometown?',
    options: ['Small', 'Large', 'Modern', 'Historic'],
    correct: 0,
    passage: null,
  },
  {
    id: 'q5',
    section: 'Vocabulary',
    question: 'Choose the synonym for "quick".',
    options: ['Slow', 'Fast', 'Lazy', 'Quiet'],
    correct: 1,
    passage: null,
  },
]

export const vocabularyWords = ['apt', 'brief', 'concise', 'rapid', 'swift']
export const grammarTopics = ['Present Simple', 'Past Simple', 'Conditionals', 'Passive Voice']
