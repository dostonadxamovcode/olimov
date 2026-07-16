import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './utils/readingDataMigration' // exposes window.migrateData() for admin use
import { isSuperAdmin } from './utils/roles'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import MainLayout from './layouts/MainLayout'
import { PageLoader } from './components/common/Loader'
// Home is the landing page — eager import so it renders immediately without Suspense delay
import Home from './pages/Home'

const AboutPage    = lazy(() => import('./pages/AboutPage'))
const Courses      = lazy(() => import('./pages/Courses'))
const Tools        = lazy(() => import('./pages/Tools'))
const Listening    = lazy(() => import('./pages/Listening'))
const Reading      = lazy(() => import('./pages/Reading'))
const Writing      = lazy(() => import('./pages/Writing'))
const Speaking     = lazy(() => import('./pages/Speaking'))
const MockTestsPage= lazy(() => import('./pages/MockTestsPage'))
const Analytics    = lazy(() => import('./pages/Analytics'))
const NotFound     = lazy(() => import('./pages/NotFound'))
const Login        = lazy(() => import('./pages/Login'))
const Register     = lazy(() => import('./pages/Register'))
const LevelSelection=lazy(() => import('./pages/LevelSelection'))
const BeginnerPage = lazy(() => import('./pages/BeginnerPage'))
const AddTestPage  = lazy(() => import('./pages/AddTestPage'))
const EditTestPage = lazy(() => import('./pages/EditTestPage'))
const ExamPage     = lazy(() => import('./pages/ExamPage'))
const ResultsPage  = lazy(() => import('./pages/ResultsPage'))
const TestResultPage=lazy(() => import('./pages/TestResultPage'))
const ExamTerminated=lazy(() => import('./pages/ExamTerminated'))
const AdminPage    = lazy(() => import('./pages/AdminPage'))
const AdminSkillTestFormPage    = lazy(() => import('./pages/AdminSkillTestFormPage'))
const AdminListeningFormPage    = lazy(() => import('./pages/AdminListeningFormPage'))
const AdminWritingFormPage      = lazy(() => import('./pages/AdminWritingFormPage'))
const AdminSpeakingFormPage     = lazy(() => import('./pages/AdminSpeakingFormPage'))
const Profile                   = lazy(() => import('./pages/Profile'))
const SkillTestsPage            = lazy(() => import('./pages/SkillTestsPage'))
const SkillReadingPage          = lazy(() => import('./pages/SkillReadingPage'))
const SkillReadingPart2Page     = lazy(() => import('./pages/SkillReadingPart2Page'))
const SkillListeningPage        = lazy(() => import('./pages/SkillListeningPage'))
const SkillWritingPage          = lazy(() => import('./pages/SkillWritingPage'))
const SkillSpeakingPage         = lazy(() => import('./pages/SkillSpeakingPage'))
const UnitTests                 = lazy(() => import('./pages/UnitTests'))
const PracticeSession           = lazy(() => import('./pages/PracticeSession'))
const UnitTest                  = lazy(() => import('./pages/UnitTest'))
const SeedFirestore             = lazy(() => import('./pages/SeedFirestore'))

function SuperadminOnlyRoute({ children }) {
  const { userRole } = useAuth()
  if (userRole !== 'superadmin') return <Navigate to="/admin" replace />
  return children
}

function LoginGate({ children }) {
  const { currentUser, userRole, loading } = useAuth()
  // Wait for auth so logged-in users aren't shown the login form before redirect
  if (loading) return <PageLoader />
  if (currentUser) {
    const hasAdminAccess =
      userRole === 'superadmin' ||
      userRole === 'admin' ||
      isSuperAdmin(currentUser.email) ||
      currentUser.email.toLowerCase() === 'superadmin@gmail.com'
    return <Navigate to={hasAdminAccess ? '/admin' : '/'} replace />
  }
  return children
}

// Full-screen overlay — covers Header + Footer during lazy chunk loading
function PageFallback() {
  return <PageLoader />
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

const router = createBrowserRouter([
  { path: '/login',    element: <LoginGate><LazyPage><Login /></LazyPage></LoginGate> },
  { path: '/register', element: <LoginGate><LazyPage><Register /></LazyPage></LoginGate> },
  { path: '/auth',     element: <Navigate to="/login" replace /> },
  {
    path: '/admin',
    element: <RoleProtectedRoute allowedRoles={['superadmin', 'admin']} />,
    children: [
      { index: true,                    element: <LazyPage><AdminPage /></LazyPage> },
      { path: 'add-test',               element: <LazyPage><AddTestPage /></LazyPage> },
      { path: 'tests',                  element: <LazyPage><AdminPage /></LazyPage> },
      { path: 'skill-tests',            element: <LazyPage><AdminPage /></LazyPage> },
      { path: 'skill-tests/add',                   element: <LazyPage><AdminSkillTestFormPage /></LazyPage>  },
      { path: 'skill-tests/edit/:id',             element: <LazyPage><AdminSkillTestFormPage /></LazyPage>  },
      { path: 'skill-tests/listening/add',        element: <LazyPage><AdminListeningFormPage /></LazyPage> },
      { path: 'skill-tests/listening/edit/:id',   element: <LazyPage><AdminListeningFormPage /></LazyPage> },
      { path: 'skill-tests/writing/add',          element: <LazyPage><AdminWritingFormPage /></LazyPage>   },
      { path: 'skill-tests/writing/edit/:id',     element: <LazyPage><AdminWritingFormPage /></LazyPage>   },
      { path: 'skill-tests/speaking/add',         element: <LazyPage><AdminSpeakingFormPage /></LazyPage>  },
      { path: 'skill-tests/speaking/edit/:id',    element: <LazyPage><AdminSpeakingFormPage /></LazyPage>  },
      { path: 'students',               element: <SuperadminOnlyRoute><LazyPage><AdminPage /></LazyPage></SuperadminOnlyRoute> },
      { path: 'edit-test/:id',          element: <LazyPage><EditTestPage /></LazyPage> },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,                    element: <Home /> },
      { path: 'about',                  element: <LazyPage><AboutPage /></LazyPage> },
      { path: 'tools',                  element: <LazyPage><Tools /></LazyPage> },
      { path: 'courses',                element: <LazyPage><Courses /></LazyPage> },
      { path: 'services/listening',     element: <LazyPage><Listening /></LazyPage> },
      { path: 'services/reading',       element: <LazyPage><Reading /></LazyPage> },
      { path: 'services/writing',       element: <LazyPage><Writing /></LazyPage> },
      { path: 'services/speaking',      element: <LazyPage><Speaking /></LazyPage> },
      { path: 'services/mock-tests',    element: <LazyPage><MockTestsPage /></LazyPage> },
      { path: 'services/analytics',     element: <LazyPage><Analytics /></LazyPage> },
      { path: 'skill-tests',             element: <LazyPage><SkillTestsPage /></LazyPage> },
      { path: 'level',                  element: <LazyPage><LevelSelection /></LazyPage> },
      { path: 'result',                 element: <LazyPage><ResultsPage /></LazyPage> },
      { path: 'unit-tests',             element: <LazyPage><UnitTests /></LazyPage> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <LazyPage><Profile /></LazyPage> },
        ],
      },
      { path: 'listen', element: <Navigate to="/services/listening" replace /> },
      { path: 'cours',  element: <Navigate to="/courses" replace /> },
      { path: '*',      element: <LazyPage><NotFound /></LazyPage> },
    ],
  },
  { path: '/skill-tests/reading',        element: <LazyPage><SkillReadingPage /></LazyPage>      },
  { path: '/skill-tests/reading-part2', element: <LazyPage><SkillReadingPart2Page /></LazyPage>  },
  { path: '/skill-tests/listening',     element: <LazyPage><SkillListeningPage /></LazyPage>    },
  { path: '/skill-tests/writing',       element: <LazyPage><SkillWritingPage /></LazyPage>      },
  { path: '/skill-tests/speaking',      element: <LazyPage><SkillSpeakingPage /></LazyPage>     },
  { path: '/tests/:testId',        element: <LazyPage><ExamPage /></LazyPage> },
  { path: '/exam/:level/:testId',  element: <LazyPage><ExamPage /></LazyPage> },
  { path: '/test-result',          element: <LazyPage><TestResultPage /></LazyPage> },
  { path: '/exam-terminated',      element: <LazyPage><ExamTerminated /></LazyPage> },
  { path: '/practice-session',     element: <LazyPage><PracticeSession /></LazyPage> },
  { path: '/unit-test/:unitId',    element: <LazyPage><UnitTest /></LazyPage> },
  { path: '/seed-firestore',       element: <LazyPage><SeedFirestore /></LazyPage> },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
