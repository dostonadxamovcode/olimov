import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './common/Loader'

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  return currentUser
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />
}
