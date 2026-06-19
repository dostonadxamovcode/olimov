import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './common/Loader'

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { currentUser, userRole, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />

  return allowedRoles.includes(userRole)
    ? <Outlet />
    : <Navigate to="/" replace />
}
