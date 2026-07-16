import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  // Don't show PageLoader here - MainLayout handles auth loading
  if (loading) return null
  return currentUser
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />
}
