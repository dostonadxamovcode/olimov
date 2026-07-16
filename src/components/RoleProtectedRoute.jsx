import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { currentUser, userRole, loading } = useAuth()
  const location = useLocation()

  // Don't show PageLoader here - MainLayout handles auth loading
  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />

  return allowedRoles.includes(userRole)
    ? <Outlet />
    : <Navigate to="/" replace />
}
