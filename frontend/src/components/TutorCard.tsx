import { useNavigate } from 'react-router-dom'

export interface Recomendacion {
  id: number
  nombre: string
  rating: number
  experiencia: number
  nivel: string
  cursos: string[]
  cursosCodigos: string[]
  horarios: string[]
  score: number
  matchReasons: string[]
  precio: number
  modalidad: string
  bio: string
  fotoUrl: string
}

interface Props {
  tutor: Recomendacion
  highlight?: boolean   // true cuando score > 12
}

// Genera color de fondo del avatar según inicial del nombre
const AVATAR_COLORS = [
  'bg-[#EEF4F1] text-[#1F3D2B]',
  'bg-[#EEF0FA] text-[#1E3A5F]',
  'bg-[#FDF3EE] text-[#7A3B1F]',
  'bg-[#F3EEF4] text-[#4A1F6B]',
]
function avatarColor(nombre: string) {
  return AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(nombre: string) {
  return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function ModalidadBadge({ modalidad }: { modalidad: string }) {
  if (!modalidad) return null
  const map: Record<string, { label: string; cls: string }> = {
    VIRTUAL:    { label: 'Virtual',     cls: 'badge-blue' },
    PRESENCIAL: { label: 'Presencial',  cls: 'badge-gray' },
    AMBAS:      { label: 'V + P',       cls: 'badge-gray' },
  }
  const m = map[modalidad] ?? { label: modalidad, cls: 'badge-gray' }
  return <span className={m.cls}>{m.label}</span>
}

export default function TutorCard({ tutor, highlight }: Props) {
  const navigate = useNavigate()

  // Top 2 match reasons — si hay más, se truncan
  const reasons = tutor.matchReasons?.slice(0, 3) ?? []

  return (
    <article
      className={`
        bg-uvg-surface rounded-md border border-uvg-border
        flex flex-col
        transition-colors duration-150
        hover:border-uvg-border-strong
        ${highlight ? 'border-l-[3px] border-l-uvg-green' : ''}
      `}
    >
      {/* ── Cuerpo ── */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Header: avatar + info básica */}
        <div className="flex items-start gap-3">
          {/* Avatar cuadrado con iniciales */}
          <div className={`
            w-12 h-12 rounded-md flex-shrink-0
            flex items-center justify-center
            text-sm font-semibold select-none
            ${avatarColor(tutor.nombre)}
          `}>
            {initials(tutor.nombre)}
          </div>

          {/* Nombre + metadata */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-uvg-text leading-tight truncate">
              {tutor.nombre}
            </p>
            <p className="text-xs text-uvg-muted mt-0.5">
              {tutor.experiencia > 0
                ? `${tutor.experiencia} año${tutor.experiencia !== 1 ? 's' : ''} de experiencia`
                : 'Tutor nuevo'}
            </p>
            {/* Rating + precio + modalidad */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-medium text-uvg-text">
                ★ <span className="text-amber-500">{tutor.rating > 0 ? tutor.rating.toFixed(1) : '—'}</span>
              </span>
              {tutor.precio > 0 && (
                <span className="text-xs text-uvg-muted font-mono">Q{tutor.precio}/hr</span>
              )}
              <ModalidadBadge modalidad={tutor.modalidad} />
            </div>
          </div>
        </div>

        {/* Cursos */}
        {tutor.cursos?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tutor.cursos.slice(0, 3).map(c => (
              <span key={c} className="badge-gray">{c}</span>
            ))}
            {tutor.cursos.length > 3 && (
              <span className="badge-gray">+{tutor.cursos.length - 3}</span>
            )}
          </div>
        )}

        {/* Match reasons */}
        {reasons.length > 0 && (
          <div className="border-t border-uvg-border pt-3">
            <p className="text-2xs font-semibold text-uvg-muted uppercase tracking-wider mb-2">
              Por qué es match
            </p>
            <ul className="space-y-1">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-uvg-muted leading-snug">
                  <span className="text-uvg-green mt-[2px] flex-shrink-0">●</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 pb-4">
        <button
          onClick={() => navigate(`/tutor/${tutor.id}`)}
          className="w-full btn-secondary text-xs py-2"
        >
          Ver perfil completo →
        </button>
      </div>
    </article>
  )
}
