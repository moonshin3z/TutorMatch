import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import StudentDashboard from './pages/StudentDashboard'
import TutorDashboard from './pages/TutorDashboard'
import TutorProfile from './pages/TutorProfile'
import TutorSetup from './pages/TutorSetup'
import GraphView from './pages/GraphView'

function RootRedirect() {
  const { token, role, onboardingCompleto } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (role === 'ESTUDIANTE' && !onboardingCompleto) return <Navigate to="/onboarding" replace />
  return <Navigate to={role === 'ESTUDIANTE' ? '/estudiante' : '/tutor'} replace />
}

// Navbar sólo fuera del onboarding (necesita estar dentro de BrowserRouter para useLocation)
function AppShell() {
  const { token } = useAuthStore()
  const { pathname } = useLocation()
  const showNavbar = token && pathname !== '/onboarding' && pathname !== '/tutor-setup'

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={
          <ProtectedRoute role="ESTUDIANTE">
            <Onboarding />
          </ProtectedRoute>
        } />
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
        <Route path="/tutor-setup" element={
          <ProtectedRoute role="TUTOR">
            <TutorSetup />
          </ProtectedRoute>
        } />
        <Route path="/tutor/:id" element={
          <ProtectedRoute>
            <TutorProfile />
          </ProtectedRoute>
        } />
        <Route path="/grafo" element={
          <ProtectedRoute role="ESTUDIANTE">
            <GraphView />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
