import api from '../api/client'
import { useAuthStore } from '../store/authStore'

interface Props {
  tutor: {
    id: number
    nombre: string
    rating: number
    experiencia: number
    nivel: string
    cursos: string[]
    horarios: string[]
    score: number
  }
  onRecomendado?: () => void
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500 text-sm">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="text-uvg-muted ml-1 text-xs">{rating.toFixed(1)}</span>
    </span>
  )
}

function NivelBadge({ nivel }: { nivel: string }) {
  const cls =
    nivel === 'Avanzado' ? 'badge-green' :
    nivel === 'Intermedio' ? 'badge-blue' : 'badge-gray'
  return <span className={cls}>{nivel}</span>
}

export default function TutorCard({ tutor, onRecomendado }: Props) {
  const { id: estudianteId } = useAuthStore()

  const marcarRecomendado = async () => {
    await api.post(`/recomendaciones/${estudianteId}/recomendar/${tutor.id}`)
    onRecomendado?.()
  }

  return (
    <div className="card flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-uvg-green-light flex items-center justify-center">
              <span className="text-uvg-green font-semibold text-sm">
                {tutor.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{tutor.nombre}</p>
              <p className="text-xs text-uvg-muted">{tutor.experiencia} año{tutor.experiencia !== 1 ? 's' : ''} de experiencia</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Stars rating={tutor.rating} />
          <NivelBadge nivel={tutor.nivel} />
        </div>
      </div>

      {/* Cursos */}
      <div>
        <p className="text-xs font-medium text-uvg-muted mb-1">Cursos</p>
        <div className="flex flex-wrap gap-1">
          {tutor.cursos.map(c => (
            <span key={c} className="badge-gray">{c}</span>
          ))}
        </div>
      </div>

      {/* Horarios */}
      <div>
        <p className="text-xs font-medium text-uvg-muted mb-1">Horarios disponibles</p>
        <div className="flex flex-wrap gap-1">
          {tutor.horarios.map(h => (
            <span key={h} className="badge bg-uvg-green-light text-uvg-green">{h}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-uvg-border mt-1">
        <span className="text-xs text-uvg-muted">
          Puntuación de compatibilidad: <strong className="text-uvg-text">{tutor.score}</strong>
        </span>
        <button onClick={marcarRecomendado} className="btn-primary text-xs py-1.5">
          Recomendar
        </button>
      </div>
    </div>
  )
}
