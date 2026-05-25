import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export interface TutorGuardado {
  id: number
  nombre: string
  carrera: string
  semestre: number
  email: string
  rating: number
  precio: number
  modalidad: string
  cursos: string[]
  estado: 'PENDIENTE' | 'COMPLETADO'
  fecha: string
}

interface Props {
  tutor: TutorGuardado
  onActualizado: () => void
}

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatDate(s: string) {
  if (!s) return ''
  const [y, m, d] = s.split('-').map(Number)
  return `${d} de ${MONTHS[m - 1]}`
}

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

export default function GuardadoCard({ tutor, onActualizado }: Props) {
  const navigate = useNavigate()
  const { id: estudianteId } = useAuthStore()

  const completar = async () => {
    await api.put(`/recomendaciones/${estudianteId}/completar/${tutor.id}`)
    onActualizado()
  }

  const completado = tutor.estado === 'COMPLETADO'

  return (
    <div className={`bg-uvg-surface rounded-md border flex flex-col transition-colors
      ${completado ? 'border-uvg-border' : 'border-uvg-border hover:border-uvg-border-strong'}`}
    >
      <div className="p-4 flex gap-3 flex-1">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center
          text-sm font-semibold select-none ${avatarColor(tutor.nombre)}`}>
          {initials(tutor.nombre)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-uvg-text leading-tight truncate">
                {tutor.nombre}
              </p>
              {tutor.carrera && (
                <p className="text-xs text-uvg-muted mt-0.5">
                  {tutor.carrera}{tutor.semestre > 0 && ` · ${tutor.semestre}° sem`}
                </p>
              )}
            </div>

            {/* Badge de estado */}
            {completado ? (
              <span className="badge-green flex-shrink-0">✓ Completada</span>
            ) : (
              <span className="badge-gray flex-shrink-0">Pendiente</span>
            )}
          </div>

          {/* Rating + precio */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {tutor.rating > 0 && (
              <span className="text-xs">
                <span className="text-amber-500">★</span>
                <span className="font-medium ml-0.5">{tutor.rating.toFixed(1)}</span>
              </span>
            )}
            {tutor.precio > 0 && (
              <span className="text-xs font-mono text-uvg-muted">Q{tutor.precio}/hr</span>
            )}
          </div>

          {/* Cursos */}
          {tutor.cursos?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tutor.cursos.slice(0, 3).map(c => (
                <span key={c} className="badge-gray">{c}</span>
              ))}
              {tutor.cursos.length > 3 && (
                <span className="badge-gray">+{tutor.cursos.length - 3}</span>
              )}
            </div>
          )}

          {/* Fecha */}
          {tutor.fecha && (
            <p className="text-2xs text-uvg-subtle mt-2">
              Guardado el {formatDate(tutor.fecha)}
            </p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className={`px-4 pb-4 flex gap-2 ${completado ? 'flex-col sm:flex-row' : ''}`}>
        {!completado && (
          <button
            onClick={completar}
            className="btn-primary w-full text-xs py-2"
          >
            Marcar tutoría como completada ✓
          </button>
        )}

        {completado && (
          <>
            <a
              href={`mailto:${tutor.email}?subject=Seguimiento tutoría — TutorMatch UVG`}
              className="btn-secondary flex-1 text-xs py-2 text-center"
            >
              Contactar
            </a>
            <button
              onClick={() => navigate(`/tutor/${tutor.id}`, { state: { openReview: true } })}
              className="btn-primary flex-1 text-xs py-2"
            >
              Dejar reseña →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
