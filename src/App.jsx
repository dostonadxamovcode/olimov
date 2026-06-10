import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isSuperAdmin } from './utils/roles'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import MainLayout from './layouts/MainLayout'
import { PageLoader } from './components/common/Loader'

const Home         = lazy(() => import('./pages/Home'))
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
const AdminSkillTestFormPage = lazy(() => import('./pages/AdminSkillTestFormPage'))
const Profile        = lazy(() => import('./pages/Profile'))
const SkillTestsPage  = lazy(() => import('./pages/SkillTestsPage'))
const SkillReadingPage= lazy(() => import('./pages/SkillReadingPage'))

function LoginGate({ children }) {
  const { currentUser, userRole } = useAuth()
  if (currentUser) {
    const isAdmin =
      userRole === 'superadmin' ||
      isSuperAdmin(currentUser.email) ||
      currentUser.email.toLowerCase() === 'superadmin@gmail.com'
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />
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
    element: <RoleProtectedRoute allowedRoles={['superadmin']} />,
    children: [
      { index: true,                    element: <LazyPage><AdminPage /></LazyPage> },
      { path: 'add-test',               element: <LazyPage><AddTestPage /></LazyPage> },
      { path: 'tests',                  element: <LazyPage><AdminPage /></LazyPage> },
      { path: 'skill-tests',            element: <LazyPage><AdminPage /></LazyPage> },
      { path: 'skill-tests/add',        element: <LazyPage><AdminSkillTestFormPage /></LazyPage> },
      { path: 'skill-tests/edit/:id',   element: <LazyPage><AdminSkillTestFormPage /></LazyPage> },
      { path: 'students',               element: <LazyPage><AdminPage /></LazyPage> },
      { path: 'edit-test/:id',          element: <LazyPage><EditTestPage /></LazyPage> },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,                    element: <LazyPage><Home /></LazyPage> },
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
  { path: '/skill-tests/reading',  element: <LazyPage><SkillReadingPage /></LazyPage> },
  { path: '/tests/:testId',        element: <LazyPage><ExamPage /></LazyPage> },
  { path: '/exam/:level/:testId',  element: <LazyPage><ExamPage /></LazyPage> },
  { path: '/test-result',          element: <LazyPage><TestResultPage /></LazyPage> },
  { path: '/exam-terminated',      element: <LazyPage><ExamTerminated /></LazyPage> },
])

// Blocks the entire app until Firebase auth check completes (avoids Header/Footer
// flashing before the page content is ready on first load).
function AppReadyGate({ children }) {
  const { loading } = useAuth()
  if (loading) return <PageLoader />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <AppReadyGate>
        <RouterProvider router={router} />
      </AppReadyGate>
    </AuthProvider>
  )
}
