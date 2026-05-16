import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { nombre, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-uvg-border sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-uvg-green font-bold text-lg tracking-tight">TutorMatch</span>
          <span className="text-uvg-muted text-sm">— UVG</span>
        </div>

        <div className="flex items-center gap-4">
          {nombre && (
            <>
              <span className="text-sm text-uvg-muted hidden sm:block">
                {role === 'ESTUDIANTE' ? 'Estudiante' : 'Tutor'} ·{' '}
                <span className="text-uvg-text font-medium">{nombre}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5">
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
