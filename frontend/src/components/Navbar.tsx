import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Ícono SVG de grafo (nodos conectados)
function GraphIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="5"  cy="12" r="3" />
      <circle cx="19" cy="5"  r="3" />
      <circle cx="19" cy="19" r="3" />
      <line x1="8"  y1="11" x2="16" y2="6.5" />
      <line x1="8"  y1="13" x2="16" y2="17.5" />
    </svg>
  )
}

export default function Navbar() {
  const { nombre, role, logout } = useAuthStore()
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  return (
    <header className="bg-uvg-surface border-b border-uvg-border sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-uvg-green font-bold text-base tracking-tight">TutorMatch</span>
          <span className="text-uvg-subtle text-xs">UVG</span>
        </div>

        {/* Acciones */}
        {nombre && (
          <div className="flex items-center gap-3">
            {/* Botón al grafo — solo para estudiantes, solo si no estamos ya ahí */}
            {role === 'ESTUDIANTE' && pathname !== '/grafo' && (
              <button
                onClick={() => navigate('/grafo')}
                title="Ver mi grafo de conexiones"
                className="flex items-center gap-1 text-xs text-uvg-muted
                  hover:text-uvg-green transition-colors"
              >
                <GraphIcon />
                <span className="hidden sm:inline">Mi grafo</span>
              </button>
            )}

            <span className="text-xs text-uvg-muted hidden sm:block truncate max-w-[120px]">
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
