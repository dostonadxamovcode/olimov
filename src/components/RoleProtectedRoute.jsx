import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { currentUser, userRole } = useAuth()
  const location = useLocation()

  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />

  return allowedRoles.includes(userRole)
    ? <Outlet />
    : <Navigate to="/" replace />
}
