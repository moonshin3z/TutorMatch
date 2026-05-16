import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import TutorDashboard from './pages/TutorDashboard'

function RootRedirect() {
  const { token, role } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={role === 'ESTUDIANTE' ? '/estudiante' : '/tutor'} replace />
}

export default function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      {token && <Navbar />}
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/estudiante" element={
          <ProtectedRoute role="ESTUDIANTE">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/tutor" element={
          <ProtectedRoute role="TUTOR">
            <TutorDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
