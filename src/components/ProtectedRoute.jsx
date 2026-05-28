import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GuardFallback() {
  return (
    <div className="min-h-[60vh] w-full px-4 pt-28">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-6 w-40 rounded-full bg-white/10" />
        <div className="h-28 rounded-2xl border border-white/10 bg-white/[0.035]" />
      </div>
    </div>
  )
}

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return <GuardFallback />

  return currentUser ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  )
}
