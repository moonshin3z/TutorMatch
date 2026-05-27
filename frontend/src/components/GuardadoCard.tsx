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
  totalReviews: number
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

// ── Helpers (misma paleta que TutorCard) ─────────────────────────────────────
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatDate(s: string) {
  if (!s) return ''
  const [y, m, d] = s.split('-').map(Number)
  return `${d} de ${MONTHS[m - 1]}`
}

const PALETA = [
  'bg-[#EEF4F1] text-[#1F3D2B]',
  'bg-[#EEF0FA] text-[#1E3A5F]',
  'bg-[#FDF3EE] text-[#7A3B1F]',
  'bg-[#F4F0F9] text-[#4A1F6B]',
]
function bgAvatar(n: string) { return PALETA[n.charCodeAt(0) % PALETA.length] }
function iniciales(n: string) {
  return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

const ORDINALS: Record<number, string> = {
  1:'1er',2:'2do',3:'3er',4:'4to',5:'5to',6:'6to',7:'7mo',8:'8vo',9:'9no',10:'10mo',
}
function ordinal(n: number) { return ORDINALS[n] ?? `${n}°` }

function StarSVG() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.2 6.7.9-4.9 4.7 1.2 6.6L12 17.2l-5.9 3.2 1.2-6.6L2.4 9.1l6.7-.9z"/>
    </svg>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function GuardadoCard({ tutor, onActualizado }: Props) {
  const navigate       = useNavigate()
  const { id: eId }   = useAuthStore()
  const completado     = tutor.estado === 'COMPLETADO'

  const completar = async () => {
    await api.put(`/recomendaciones/${eId}/completar/${tutor.id}`)
    onActualizado()
  }

  const visibles = (tutor.cursos ?? []).slice(0, 3)
  const extras   = (tutor.cursos?.length ?? 0) - 3

  const ratingStr = tutor.rating === 5 ? '5.0' : tutor.rating.toFixed(1)
  const showRating = tutor.totalReviews >= 5 && tutor.rating > 0

  return (
    <article className="
      bg-white border border-[#E5E5E2] rounded-[8px] p-4
      transition-colors duration-150 hover:border-[#1F3D2B]
    ">
      {/* Layout horizontal */}
      <div className="flex gap-3">

        {/* Avatar 64×64 — más compacto que TutorCard, misma estética */}
        <div className={`
          w-16 h-16 rounded-[6px] flex-shrink-0
          flex items-center justify-center
          text-[13px] font-semibold select-none
          ${bgAvatar(tutor.nombre)}
        `}>
          {iniciales(tutor.nombre)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[16px] font-[500] text-[#1A1A1A] leading-tight truncate">
              {tutor.nombre}
            </p>
            {/* Estado: texto discreto, no badge prominente */}
            <span className={`text-[11px] flex-shrink-0 leading-none mt-0.5 ${
              completado ? 'text-[#1F3D2B]' : 'text-[#6B6B66]'
            }`}>
              {completado ? '✓ completada' : 'pendiente'}
            </span>
          </div>

          {tutor.carrera && (
            <p className="text-[13px] text-[#6B6B66] leading-snug">
              {tutor.carrera}{tutor.semestre > 0 && ` · ${ordinal(tutor.semestre)} año`}
            </p>
          )}

          {visibles.length > 0 && (
            <p className="text-[13px] text-[#1A1A1A] leading-snug">
              {visibles.join(' · ')}
              {extras > 0 && <span className="text-[#6B6B66]"> +{extras} más</span>}
            </p>
          )}
        </div>
      </div>

      {/* Fila: rating + precio + fecha */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E5E2]">
        <div className="flex items-center gap-3">
          {showRating ? (
            <span className="flex items-center gap-[5px] text-[13px] text-[#1A1A1A]">
              <StarSVG />
              <span className="font-[500]">{ratingStr}</span>
              <span className="text-[#6B6B66]">({tutor.totalReviews})</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#6B6B66] border border-[#E5E5E2]
              rounded-sm px-1.5 py-0.5 leading-none">
              Nuevo
            </span>
          )}
          {tutor.fecha && (
            <span className="text-[12px] text-[#6B6B66]">
              {formatDate(tutor.fecha)}
            </span>
          )}
        </div>
        {tutor.precio > 0 && (
          <span className="text-[15px] font-[500] text-[#1A1A1A]">
            Q{tutor.precio}/hr
          </span>
        )}
      </div>

      {/* Acciones separadas por border — contextuales según estado */}
      <div className="mt-3 pt-3 border-t border-[#E5E5E2]">
        {!completado ? (
          <button
            onClick={completar}
            className="
              w-full text-[13px] text-[#1F3D2B] font-[500]
              border border-[#1F3D2B] rounded-[6px] py-2
              hover:bg-[#EEF4F1] transition-colors
            "
          >
            Completé la sesión
          </button>
        ) : (
          <div className="flex gap-2">
            <a
              href={`mailto:${tutor.email}?subject=Seguimiento — TutorMatch UVG`}
              className="
                flex-1 text-center text-[13px] text-[#1A1A1A] font-[500]
                border border-[#E5E5E2] rounded-[6px] py-2
                hover:border-[#1A1A1A] transition-colors
              "
            >
              Contactar
            </a>
            <button
              onClick={() => navigate(`/tutor/${tutor.id}`, { state: { openReview: true } })}
              className="
                flex-1 text-[13px] text-white font-[500]
                bg-[#1F3D2B] rounded-[6px] py-2
                hover:bg-[#172E20] transition-colors
              "
            >
              Dejar reseña
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
