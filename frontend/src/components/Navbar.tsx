import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { nombre, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header className="bg-uvg-surface border-b border-uvg-border sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-uvg-green font-bold text-base tracking-tight">TutorMatch</span>
          <span className="text-uvg-subtle text-xs">UVG</span>
        </div>

        {/* Nombre + logout */}
        {nombre && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-uvg-muted hidden sm:block truncate max-w-[160px]">
              {nombre.split(' ')[0]}
            </span>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="text-xs text-uvg-subtle hover:text-uvg-muted transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
