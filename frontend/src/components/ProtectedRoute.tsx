import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props {
  children: React.ReactNode
  role?: 'ESTUDIANTE' | 'TUTOR'
}

export default function ProtectedRoute({ children, role }: Props) {
  const { token, role: userRole } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'ESTUDIANTE' ? '/estudiante' : '/tutor'} replace />
  }

  return <>{children}</>
}
