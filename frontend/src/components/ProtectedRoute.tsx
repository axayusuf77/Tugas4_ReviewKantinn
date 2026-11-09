import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'
import { Spinner } from './ui'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

/** Penjaga halaman di sisi frontend. Server tetap memeriksa token dan role. */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return (
      <div className="page-center">
        <Spinner label="Memeriksa sesi login" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
