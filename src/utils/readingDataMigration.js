/**
 * Complete Data Migration — /data → Firebase Firestore
 *
 * All static content is embedded here so the /data folder can be safely deleted.
 * Run ONCE from the browser console after logging in as admin:
 *
 *   window.migrateData()           — skip collections that already have data
 *   window.migrateDataForce()      — overwrite existing data
 *   window.migrateReadingTests()   — only fill-in-blank tests
 *   window.migrateReadingPart2()   — only matching test
 *   window.migrateSiteContent()    — only UI content (stats, features …)
 *   window.migrateMockQuestions()  — only mock-test questions
 */

import {
  collection, doc, writeBatch,
  serverTimestamp, getDocs, query, limit, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDED STATIC DATA  (formerly /data/readingTests.js)
// ─────────────────────────────────────────────────────────────────────────────
const READING_TESTS = [
  {
    id: 'tom-barry', part: 1, title: 'Tom Barry — International Skateboarder!',
    level: 'A2', topic: 'Sport & Leisure', timeLimit: 15,
    answers: ['magazine', 'videos', 'skateboarding', 'street', 'skate'],
    paragraphs: [
      [{ type: 'text', content: 'Tom Barry is 17, and started skateboarding when he was nine. He grew up in New York where he practised hard and won his first competition when he was 14. He was lucky. A writer from SKATE IT! ' }, { type: 'blank', index: 0 }, { type: 'text', content: ' watched him that day, then wrote an article about him.' }],
      [{ type: 'text', content: '"They even made some videos of me!" Tom said. "I left school last year and now the magazine is paying me to skate and to skateboard in international competitions. But I\'m not doing this for the money. I\'m doing this because it\'s so much fun! The writer is planning to collect my ' }, { type: 'blank', index: 1 }, { type: 'text', content: ' and make a short film about me."' }],
      [{ type: 'text', content: 'Tom has just returned from Japan. ' }, { type: 'blank', index: 2 }, { type: 'text', content: ' is the third most popular sport for boys aged 12–16 in the USA, but in Japan it is less well-known.' }],
      [{ type: 'text', content: '"I took my skateboard out onto the city street and the traffic stopped as people watched me!" Tom said.' }],
      [{ type: 'text', content: '"A problem for skateboarders in Japan is that there aren\'t many places where they can skate outside. Skate parks are usually inside big buildings in large cities, so ' }, { type: 'blank', index: 3 }, { type: 'text', content: ' skating is difficult there. But things are changing. I loved the trip and hope to go back to Japan to ' }, { type: 'blank', index: 4 }, { type: 'text', content: ' there again very soon."' }],
    ],
  },
  {
    id: 'saras-new-job', part: 2, title: "Sara's New Job",
    level: 'B1', topic: 'Work & Career', timeLimit: 15,
    answers: ['nervous', 'office', 'friendly', 'lunchtime', 'manager'],
    paragraphs: [
      [{ type: 'text', content: 'Sara was feeling very ' }, { type: 'blank', index: 0 }, { type: 'text', content: ' when she arrived at work on her first day. She did not know anyone at the company and was worried about making mistakes.' }],
      [{ type: 'text', content: 'The ' }, { type: 'blank', index: 1 }, { type: 'text', content: ' was a large, open-plan building near the city centre. Sara was shown to her desk, given a computer, and introduced to the team she would be working with.' }],
      [{ type: 'text', content: 'To her surprise, all her new colleagues were very ' }, { type: 'blank', index: 2 }, { type: 'text', content: ' and helped her whenever she had questions. She had expected the environment to feel more competitive.' }],
      [{ type: 'text', content: 'At ' }, { type: 'blank', index: 3 }, { type: 'text', content: ', three people from her team invited her to eat with them in the cafeteria. They told funny stories about the company and made her laugh.' }],
      [{ type: 'text', content: 'By the end of the day, her ' }, { type: 'blank', index: 4 }, { type: 'text', content: ' called her into a meeting room and said she had made an excellent start. Sara left the building feeling happy and excited about her new role.' }],
    ],
  },
  {
    id: 'power-of-music', part: 3, title: 'The Power of Music',
    level: 'B1+', topic: 'Science & Society', timeLimit: 15,
    answers: ['mood', 'brain', 'rhythm', 'emotions', 'performance'],
    paragraphs: [
      [{ type: 'text', content: 'Most people know that listening to music can change their ' }, { type: 'blank', index: 0 }, { type: 'text', content: ' within seconds. An upbeat track can lift spirits, while a slow melody often brings a sense of calm or sadness.' }],
      [{ type: 'text', content: 'Scientists who study the ' }, { type: 'blank', index: 1 }, { type: 'text', content: ' have found that music activates more areas of it than almost any other human activity, involving memory, language, movement, and emotion simultaneously.' }],
      [{ type: 'text', content: 'The ' }, { type: 'blank', index: 2 }, { type: 'text', content: ' of a song directly affects the body: fast-tempo music increases heart rate and energy levels, while slower pieces can lower blood pressure and promote relaxation.' }],
      [{ type: 'text', content: 'Music also helps people express deep ' }, { type: 'blank', index: 3 }, { type: 'text', content: ' that are difficult to describe in words. Many people reach for music instinctively when grieving, celebrating, or feeling overwhelmed.' }],
      [{ type: 'text', content: 'Research shows that students who study with appropriate background music often achieve a better ' }, { type: 'blank', index: 4 }, { type: 'text', content: ' in memory tests, suggesting that music can support — rather than distract from — focused learning.' }],
    ],
  },
  {
    id: 'benefits-of-reading', part: 4, title: 'The Benefits of Reading',
    level: 'B2', topic: 'Education & Wellbeing', timeLimit: 20,
    answers: ['vocabulary', 'concentration', 'empathy', 'knowledge', 'reduces'],
    paragraphs: [
      [{ type: 'text', content: 'Reading regularly is one of the most effective ways to expand your ' }, { type: 'blank', index: 0 }, { type: 'text', content: ', as encountering words in context helps them embed in memory far more effectively than rote memorisation or word lists.' }],
      [{ type: 'text', content: 'Unlike scrolling through social media, reading a sustained text demands continuous ' }, { type: 'blank', index: 1 }, { type: 'text', content: '. Over time, this trains the brain to maintain focus for longer periods, a skill that has broad benefits in work and study.' }],
      [{ type: 'text', content: 'Literary fiction, in particular, has been shown to develop ' }, { type: 'blank', index: 2 }, { type: 'text', content: ': because readers must inhabit the perspectives of characters quite different from themselves, they become more skilled at understanding the feelings of real people around them.' }],
      [{ type: 'text', content: 'Non-fiction builds factual ' }, { type: 'blank', index: 3 }, { type: 'text', content: ' across an enormous range of subjects. A single well-chosen book can convey years of research, compressed into an accessible and engaging narrative.' }],
      [{ type: 'text', content: 'Several studies have confirmed that reading before sleep ' }, { type: 'blank', index: 4 }, { type: 'text', content: ' stress levels more efficiently than watching television or browsing a phone, making it one of the simplest and cheapest wellness tools available.' }],
    ],
  },
  {
    id: 'deep-ocean', part: 5, title: 'Secrets of the Deep Ocean',
    level: 'B2+', topic: 'Science & Environment', timeLimit: 20,
    answers: ['pressure', 'species', 'bioluminescence', 'exploration', 'resources'],
    paragraphs: [
      [{ type: 'text', content: 'The deep ocean — defined as water below 200 metres — remains one of Earth\'s least explored environments because the extreme ' }, { type: 'blank', index: 0 }, { type: 'text', content: ' at such depths can crush most conventional equipment within seconds.' }],
      [{ type: 'text', content: 'Despite these challenges, scientists have already identified thousands of ' }, { type: 'blank', index: 1 }, { type: 'text', content: ' that survive in total darkness, feeding on organic material — known as marine snow — that drifts down from the sunlit surface far above.' }],
      [{ type: 'text', content: 'Many of these creatures produce their own light through a biological process called ' }, { type: 'blank', index: 2 }, { type: 'text', content: ', which they use to attract prey, communicate with potential mates, or confuse predators in the permanent blackness of the abyss.' }],
      [{ type: 'text', content: 'Advances in remotely operated vehicles and autonomous submersibles have made deep-sea ' }, { type: 'blank', index: 3 }, { type: 'text', content: ' progressively more practical, allowing researchers to film, sample, and map areas that no human has ever directly witnessed.' }],
      [{ type: 'text', content: 'As surface ' }, { type: 'blank', index: 4 }, { type: 'text', content: ' — including rare minerals critical for battery technology — become harder and more costly to access, commercial interest in extracting them from the seabed has grown significantly, raising serious environmental concerns.' }],
    ],
  },
  {
    id: 'ai-in-medicine', part: 6, title: 'Artificial Intelligence in Medicine',
    level: 'C1', topic: 'Technology & Healthcare', timeLimit: 20,
    answers: ['diagnose', 'precision', 'algorithms', 'ethical', 'revolutionise'],
    paragraphs: [
      [{ type: 'text', content: 'Artificial intelligence is increasingly being deployed to help clinicians ' }, { type: 'blank', index: 0 }, { type: 'text', content: ' diseases at a far earlier stage than was previously possible, particularly in imaging-heavy fields such as radiology, dermatology, and pathology.' }],
      [{ type: 'text', content: 'Machine learning models trained on millions of annotated medical images can identify malignant tumours with a level of ' }, { type: 'blank', index: 1 }, { type: 'text', content: ' that routinely matches — and in some landmark studies, surpasses — the diagnostic accuracy of experienced consultant specialists.' }],
      [{ type: 'text', content: 'These systems rely on sophisticated ' }, { type: 'blank', index: 2 }, { type: 'text', content: ' capable of detecting subtle statistical patterns distributed across thousands of data points — correlations that the human eye, however expert, would be unlikely to recognise consistently.' }],
      [{ type: 'text', content: 'Nevertheless, the integration of AI into clinical decision-making raises profound ' }, { type: 'blank', index: 3 }, { type: 'text', content: ' questions. When an algorithm contributes to a misdiagnosis, it remains deeply unclear whether legal and moral responsibility should lie with the developer, the hospital, or the individual clinician.' }],
      [{ type: 'text', content: 'Proponents argue that, deployed responsibly and transparently, AI will ultimately ' }, { type: 'blank', index: 4 }, { type: 'text', content: ' preventive medicine by enabling personalised treatment plans calibrated to a patient\'s unique genetic profile, lifestyle data, and real-time biosignals.' }],
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDED STATIC DATA  (formerly /data/readingPart2Data.js)
// ─────────────────────────────────────────────────────────────────────────────
const READING_PART2 = {
  id: 'reading-part2-jobs', part: 2,
  title: 'Reading Part 2', subtitle: 'Job Advertisements',
  level: 'B1', topic: 'Work & Career', timeLimit: 20,
  instructions: 'The advertisements below describe eight different jobs. For each question (A–H), choose the correct advertisement (1–8). Each advertisement may only be used ONCE.',
  articles: [
    { id: 1, company: 'HealthPlus Medical Centre',         role: 'Medical Receptionist / Clinical Coordinator', description: 'We are seeking a dedicated professional to join our team. The successful candidate will coordinate patient appointments, maintain medical records, and provide administrative support to our clinical staff. Previous experience in a healthcare setting is essential. A formal qualification in health administration or a related medical field is required.', contact: 'careers@healthplus.org  |  Tel: 0800 123 456' },
    { id: 2, company: 'Horizon Adventures',                role: 'Outdoor Activities Leader',                   description: 'We are looking for enthusiastic individuals to lead group experiences including hiking, kayaking, and rock climbing. All applicants must hold a current National Governing Body (NGB) qualification in at least one outdoor activity discipline and a valid First Aid certificate. Flexible seasonal contracts available.', contact: 'jobs@horizonadventures.co.uk' },
    { id: 3, company: 'DevCraft Ltd',                      role: 'Junior Software Engineer',                    description: 'DevCraft Ltd invites applications for a Junior Software Engineer position within our development team. Candidates must demonstrate proficiency in at least one object-oriented programming language — Python, Java, or C++ preferred. A degree in Computer Science or a closely related discipline is required. You will collaborate with senior engineers on client-facing products.', contact: 'www.devcraft.io/careers  |  Ref: JSE-2024' },
    { id: 4, company: 'Maple Grove Academy',               role: 'Primary School Teaching Assistant',           description: 'We are seeking a patient and enthusiastic Teaching Assistant to support classroom learning for pupils aged 5 to 11. Working closely with class teachers, you will help deliver engaging lessons and provide individual support to children who may need extra guidance. No prior teaching qualification is required — full training will be provided.', contact: 'Mrs Patel  |  office@maplegrove.sch.uk' },
    { id: 5, company: 'Saveur Bistro',                     role: 'Commis Chef',                                 description: 'We are looking for a motivated individual to join the kitchen team at Saveur Bistro, a popular French-inspired restaurant in the city centre. The successful applicant will assist in preparing dishes under the supervision of our Head Chef. Previous experience in a professional kitchen is expected, and a catering qualification would be an advantage.', contact: 'chef@saveur-bistro.co.uk' },
    { id: 6, company: 'GreenPath Environmental Solutions', role: 'Environmental Field Officer',                  description: 'We are recruiting an Environmental Field Officer to conduct ecological surveys, habitat assessments, and water quality monitoring. A significant proportion of your working time will be spent on-site in the field rather than in an office. A degree in Environmental Science or Ecology is preferred. A full driving licence is essential.', contact: 'recruit@greenpathenv.com  |  Closing: 30 July' },
    { id: 7, company: 'PrismDesign Studio',                role: 'Junior Graphic Designer',                     description: 'PrismDesign Studio is seeking a talented Junior Graphic Designer to join our creative agency. Applicants should be proficient in the Adobe Creative Suite and must submit a strong, varied portfolio of previous design work with their application. We operate a hybrid working model, giving team members the flexibility to work from home on agreed days.', contact: 'hello@prismdesign.studio' },
    { id: 8, company: 'Analytix Pro',                      role: 'Business Intelligence Analyst',               description: 'We are looking for a detail-oriented Business Intelligence Analyst to join our data team. You will gather and interpret large volumes of business data, build dashboards using Power BI or Tableau, and produce clear reports to be presented to senior management and non-technical stakeholders. Strong Excel and SQL skills are essential.', contact: 'www.analytixpro.com/jobs' },
  ],
  questions: [
    { letter: 'A', text: 'Which job involves direct contact with patients in a healthcare setting?' },
    { letter: 'B', text: 'Which job requires applicants to hold a specialist outdoor activity qualification?' },
    { letter: 'C', text: 'Which job requires proficiency in at least one programming language?' },
    { letter: 'D', text: 'Which job involves supporting the learning of children aged 5 to 11?' },
    { letter: 'E', text: 'Which job involves preparing food in a professional kitchen environment?' },
    { letter: 'F', text: 'Which job describes a role where most work takes place in outdoor field locations?' },
    { letter: 'G', text: 'Which job asks candidates to submit examples of previous creative work?' },
    { letter: 'H', text: 'Which job requires experience with data visualisation tools such as Power BI?' },
  ],
  answers: { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8 },
}

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDED STATIC DATA  (formerly /data/siteData.js)
// ─────────────────────────────────────────────────────────────────────────────
const _lp = [
  { title: 'Short Conversations' }, { title: 'Daily Situations' },
  { title: 'Study & Education' },   { title: 'Academic Talk' },
  { title: 'Opinions & Discussions' }, { title: 'Advanced Understanding' },
]

const SITE_DATA = {
  navLinks: [
    { label: 'nav.home', href: '/#top' }, { label: 'nav.services', href: '/#services' },
    { label: 'nav.mockTests', href: '/#ielts-mock-tests' }, { label: 'nav.results', href: '/result' },
    { label: 'nav.contact', href: '/#contact' }, { label: 'nav.about', href: '/about' },
    { label: 'nav.levels', href: '/level' },
  ],
  stats: [
    { id: 'st1', label: 'Students', value: '12k+' },
    { id: 'st2', label: 'Practice Hours', value: '40k+' },
    { id: 'st3', label: 'Mock Tests', value: '5k+' },
  ],
  features: [
    { id: 'f1', title: 'Timed Practice',    description: 'Train under real-time conditions.',         icon: 'Timer'       },
    { id: 'f2', title: 'Instant Feedback',  description: 'Get results right after submission.',        icon: 'Zap'         },
    { id: 'f3', title: 'Progress Tracking', description: 'Visualize improvements over time.',          icon: 'BarChart2'   },
    { id: 'f4', title: 'Expert Tips',       description: 'Teacher-approved strategies.',               icon: 'TrendingUp'  },
    { id: 'f5', title: 'Global Content',    description: 'Content from international sources.',        icon: 'Globe'       },
    { id: 'f6', title: 'Secure Exams',      description: 'Trusted, secure testing environment.',       icon: 'ShieldCheck' },
  ],
  services: [
    { id: 's1', slug: 'listening',  title: 'Listening Practice',   description: 'Focused listening exercises with transcripts.',        features: ['Audio transcripts', 'Real exam format', 'Speed control', 'Section-wise practice'] },
    { id: 's2', slug: 'reading',    title: 'Reading Drills',        description: 'Timed reading passages and strategies.',               features: ['Academic texts', 'Time management', 'Question types', 'Vocabulary building'] },
    { id: 's3', slug: 'writing',    title: 'Writing Coaching',      description: 'Step-by-step writing feedback and templates.',         features: ['Task 1 & 2', 'Sample essays', 'Grammar checks', 'Band score tips'] },
    { id: 's4', slug: 'speaking',   title: 'Speaking Sessions',     description: 'Mock speaking tests with live feedback.',              features: ['Real exam format', 'Record & review', 'Fluency practice', 'Pronunciation'] },
    { id: 's5', slug: 'mock-tests', title: 'Mock Tests',            description: 'Full-length mock exams with scoring.',                 features: ['Complete tests', 'Instant scoring', 'Detailed reports', 'Progress tracking'] },
    { id: 's6', slug: 'analytics',  title: 'Performance Analytics', description: 'Track progress and weak areas.',                       features: ['Visual charts', 'Skill analysis', 'Weakness alerts', 'Study recommendations'] },
  ],
  listeningParts: _lp,
  listeningPage: {
    badge: 'Premium Cefr Listening Lab', title: 'Cefr Listening', highlightedTitle: 'Practice',
    subtitle: 'Train with realistic Cefr listening tests, timed sections, and focused part-by-part practice in one polished exam workspace.',
    stats: [
      { id: 'tests', label: '6 practice tests', icon: 'Headphones', color: 'text-cyan-300' },
      { id: 'format', label: '30 minute format', icon: 'Clock3', color: 'text-blue-300' },
      { id: 'tracking', label: 'Band score tracking', icon: 'Signal', color: 'text-violet-300' },
    ],
    searchPlaceholder: 'Search listening tests...',
    sectionEyebrow: 'All Tests', sectionTitle: 'Choose your next session',
    updateLabel: 'Updated weekly', cardDescription: 'Six-part Cefr listening practice with exam-style tasks.',
    tests: [
      { number: '01', title: 'Cambridge Listening Test 1', duration: '30 min', parts: _lp },
      { number: '02', title: 'Cefr Practice Test 2',       duration: '32 min', parts: _lp },
      { number: '03', title: 'Band 7+ Listening Drill',    duration: '28 min', parts: _lp },
      { number: '04', title: 'Academic Listening Set',     duration: '35 min', parts: _lp },
      { number: '05', title: 'Real Exam Simulation',       duration: '30 min', parts: _lp },
      { number: '06', title: 'Advanced Listening Test',    duration: '34 min', parts: _lp },
    ],
  },
  vocabularyWords: ['apt', 'brief', 'concise', 'rapid', 'swift'],
  grammarTopics:   ['Present Simple', 'Past Simple', 'Conditionals', 'Passive Voice'],
  mockTestQuestions: [
    { id: 'q1', section: 'Listening', question: 'What is the main topic of the conversation?',      options: ['Weather', 'Travel', 'Education', 'Health'],                  correct: 2, passage: null },
    { id: 'q2', section: 'Reading',   question: 'What does the author imply about technology?',     options: ['It harms society', 'It helps learning', 'It is irrelevant', 'It is expensive'], correct: 1, passage: null },
    { id: 'q3', section: 'Writing',   question: 'Which sentence best summarizes the paragraph?',   options: ['A', 'B', 'C', 'D'],                                         correct: 0, passage: 'A short sample passage used for testing purposes.' },
    { id: 'q4', section: 'Speaking',  question: 'How would you describe your hometown?',            options: ['Small', 'Large', 'Modern', 'Historic'],                      correct: 0, passage: null },
    { id: 'q5', section: 'Vocabulary', question: 'Choose the synonym for "quick".',                 options: ['Slow', 'Fast', 'Lazy', 'Quiet'],                             correct: 1, passage: null },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
async function collectionIsEmpty(colName) {
  const snap = await getDocs(query(collection(db, colName), limit(1)))
  return snap.empty
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. skillReadingTests
// ─────────────────────────────────────────────────────────────────────────────
export async function migrateReadingTests(force = false) {
  if (!force && !(await collectionIsEmpty('skillReadingTests')))
    return { status: 'skipped', reason: 'skillReadingTests already has data' }

  const batch = writeBatch(db)
  for (const test of READING_TESTS) {
    // Firestore can't store nested arrays → wrap each paragraph in { segs: [...] }
    batch.set(doc(collection(db, 'skillReadingTests')), {
      id: test.id, part: test.part, title: test.title,
      level: test.level, topic: test.topic, timeLimit: test.timeLimit,
      answers: test.answers,
      paragraphs: test.paragraphs.map(segs => ({ segs })),
      createdAt: serverTimestamp(),
    })
  }
  await batch.commit()
  return { status: 'success', uploaded: READING_TESTS.length }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. skillReadingPart2Tests
// ─────────────────────────────────────────────────────────────────────────────
export async function migrateReadingPart2(force = false) {
  if (!force && !(await collectionIsEmpty('skillReadingPart2Tests')))
    return { status: 'skipped', reason: 'skillReadingPart2Tests already has data' }

  const d = READING_PART2
  await setDoc(doc(collection(db, 'skillReadingPart2Tests')), {
    part: d.part, title: d.title, subtitle: d.subtitle,
    level: d.level, topic: d.topic, timeLimit: d.timeLimit,
    instructions: d.instructions, articles: d.articles,
    questions: d.questions, answers: d.answers,
    createdAt: serverTimestamp(),
  })
  return { status: 'success', uploaded: 1 }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. siteContent/config  (single document — stats, features, services …)
// ─────────────────────────────────────────────────────────────────────────────
export async function migrateSiteContent(force = false) {
  const empty = await collectionIsEmpty('siteContent')
  if (!force && !empty)
    return { status: 'skipped', reason: 'siteContent already has data' }

  const { mockTestQuestions: _mq, ...rest } = SITE_DATA
  await setDoc(doc(db, 'siteContent', 'config'), {
    ...rest,
    updatedAt: serverTimestamp(),
  })
  return { status: 'success' }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. questions  (mock test questions — individual documents)
// ─────────────────────────────────────────────────────────────────────────────
export async function migrateMockQuestions(force = false) {
  if (!force && !(await collectionIsEmpty('questions')))
    return { status: 'skipped', reason: 'questions already has data' }

  const batch = writeBatch(db)
  for (const q of SITE_DATA.mockTestQuestions) {
    batch.set(doc(db, 'questions', q.id), {
      section: q.section, question: q.question,
      options: q.options, correct: q.correct,
      passage: q.passage ?? null,
      createdAt: serverTimestamp(),
    })
  }
  await batch.commit()
  return { status: 'success', uploaded: SITE_DATA.mockTestQuestions.length }
}

// ─────────────────────────────────────────────────────────────────────────────
// Run all
// ─────────────────────────────────────────────────────────────────────────────
export async function migrateAllData(options = {}) {
  const { force = false } = options
  const results = {}

  for (const [key, fn] of [
    ['readingTests',   () => migrateReadingTests(force)],
    ['readingPart2',   () => migrateReadingPart2(force)],
    ['siteContent',    () => migrateSiteContent(force)],
    ['mockQuestions',  () => migrateMockQuestions(force)],
  ]) {
    try {
      console.log(`[Migration] ${key}…`)
      results[key] = await fn()
    } catch (err) {
      results[key] = { status: 'error', error: err.message }
      console.error(`[Migration] ${key} failed:`, err)
    }
  }

  console.log('[Migration] Complete:')
  console.table(results)
  return results
}

// Expose to browser console for one-time admin usage
if (typeof window !== 'undefined') {
  window.migrateData          = ()  => migrateAllData()
  window.migrateDataForce     = ()  => migrateAllData({ force: true })
  window.migrateReadingTests  = ()  => migrateReadingTests()
  window.migrateReadingPart2  = ()  => migrateReadingPart2()
  window.migrateSiteContent   = ()  => migrateSiteContent()
  window.migrateMockQuestions = ()  => migrateMockQuestions()
  console.log('[Migration] Ready — run: window.migrateData()')
}

export default migrateAllData
