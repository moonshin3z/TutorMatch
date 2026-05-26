import { useNavigate } from 'react-router-dom'

// ── Interfaz ──────────────────────────────────────────────────────────────────
export interface Recomendacion {
  id: number
  nombre: string
  carrera: string
  semestre: number
  emailTutor: string
  rating: number
  totalReviews: number
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

// ── Helpers ───────────────────────────────────────────────────────────────────

// Ordinal español para año/semestre
const ORDINALS: Record<number, string> = {
  1: '1er', 2: '2do', 3: '3er', 4: '4to',
  5: '5to', 6: '6to', 7: '7mo', 8: '8vo', 9: '9no', 10: '10mo',
}
function ordinal(n: number) { return ORDINALS[n] ?? `${n}°` }

// Paleta de fondos para el avatar — 4 tonos editoriales
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

// ── Estrella SVG custom (NO Lucide, NO amarilla) ──────────────────────────────
function StarSVG() {
  return (
    <svg
      width="12" height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l2.9 6.2 6.7.9-4.9 4.7 1.2 6.6L12 17.2l-5.9 3.2 1.2-6.6L2.4 9.1l6.7-.9z" />
    </svg>
  )
}

// ── Rating display ─────────────────────────────────────────────────────────────
// < 5 reseñas → "Nuevo" · Rating 5.0 siempre con decimal
function Rating({ rating, total }: { rating: number; total: number }) {
  if (total < 5 || rating === 0) {
    return (
      <span className="text-[11px] text-[#6B6B66] border border-[#E5E5E2]
        rounded-sm px-1.5 py-0.5 leading-none">
        Nuevo
      </span>
    )
  }
  const str = rating === 5 ? '5.0' : rating.toFixed(1)
  return (
    <span className="flex items-center gap-[5px] text-[13px] text-[#1A1A1A]">
      <StarSVG />
      <span className="font-[500]">{str}</span>
      <span className="text-[#6B6B66]">({total})</span>
    </span>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
interface Props {
  tutor: Recomendacion
  highlight?: boolean  // mantenido por compatibilidad, no se usa visualmente
}

export default function TutorCard({ tutor }: Props) {
  const navigate = useNavigate()

  const materias       = tutor.cursos ?? []
  const visibles       = materias.slice(0, 3)
  const extras         = materias.length - 3
  const topReason      = tutor.matchReasons?.[0] ?? ''
  const añoSemestre    = tutor.semestre > 0
    ? ` · ${ordinal(tutor.semestre)} año`
    : ''

  return (
    <article
      onClick={() => navigate(`/tutor/${tutor.id}`, {
        state: { matchReasons: tutor.matchReasons, score: tutor.score }
      })}
      className="
        bg-white border border-[#E5E5E2] rounded-[8px] p-4
        cursor-pointer transition-colors duration-150
        hover:border-[#1F3D2B]
      "
    >
      {/* Layout horizontal asimétrico — inspirado en Letterboxd */}
      <div className="flex gap-3">

        {/* Avatar cuadrado — 96×96 mobile, 120×120 desktop, NO círculo */}
        <div className={`
          w-24 h-24 md:w-[120px] md:h-[120px]
          rounded-[6px] flex-shrink-0
          flex items-center justify-center
          text-[15px] font-semibold select-none
          ${bgAvatar(tutor.nombre)}
        `}>
          {iniciales(tutor.nombre)}
        </div>

        {/* Info — jerarquía tipográfica, sin color como muleta */}
        <div className="flex-1 min-w-0 flex flex-col gap-[5px]">

          {/* Nombre: dominante, 18px */}
          <p className="text-[18px] font-[500] text-[#1A1A1A] leading-tight truncate">
            {tutor.nombre}
          </p>

          {/* Carrera · año: secundario, 13px */}
          {tutor.carrera && (
            <p className="text-[13px] text-[#6B6B66] leading-snug">
              {tutor.carrera}{añoSemestre}
            </p>
          )}

          {/* Materias: separadas por ·, no badges */}
          {visibles.length > 0 && (
            <p className="text-[13px] text-[#1A1A1A] leading-snug">
              {visibles.join(' · ')}
              {extras > 0 && (
                <span className="text-[#6B6B66]"> +{extras} más</span>
              )}
            </p>
          )}

          {/* Reason en itálica — el valor real del producto */}
          {topReason && (
            <p className="
              text-[13px] italic text-[#1A1A1A] leading-snug
              overflow-hidden
              [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]
            ">
              {topReason}
            </p>
          )}
        </div>
      </div>

      {/* Footer: rating izquierda · precio derecha — mismo baseline */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E5E2]">
        <Rating rating={tutor.rating} total={tutor.totalReviews} />
        {tutor.precio > 0 ? (
          <span className="text-[16px] font-[500] text-[#1A1A1A]">
            Q{tutor.precio}/hr
          </span>
        ) : (
          <span className="text-[13px] text-[#6B6B66]">Sin precio definido</span>
        )}
      </div>
    </article>
  )
}
