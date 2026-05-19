import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

interface Tutor {
  id: number; nombre: string; bio: string; rating: number
  experiencia: number; precio: number; modalidad: string
  cursos: { codigo: string; nombre: string }[]
  horarios: { id: number; dia: string; horaInicio: string; horaFin: string }[]
  nivel: { nombre: string } | null
}

function initials(nombre: string) {
  return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function TutorProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/tutores/${id}`)
      .then(r => setTutor(r.data))
      .catch(() => navigate('/', { replace: true }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="card animate-pulse h-48 bg-uvg-border/30" />
      </div>
    )
  }

  if (!tutor) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <button onClick={() => navigate(-1)} className="btn-ghost mb-5 -ml-2 text-xs">
        ← Volver
      </button>

      {/* Header del tutor */}
      <div className="card-lg mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-md bg-uvg-green-light flex items-center justify-center flex-shrink-0">
            <span className="text-uvg-green font-bold text-lg">{initials(tutor.nombre)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-uvg-text">{tutor.nombre}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-uvg-muted">
                ★ <span className="text-amber-500 font-medium">{tutor.rating > 0 ? tutor.rating.toFixed(1) : '—'}</span>
              </span>
              {tutor.precio > 0 && (
                <span className="text-sm font-mono text-uvg-text">Q{tutor.precio}/hr</span>
              )}
              {tutor.experiencia > 0 && (
                <span className="text-sm text-uvg-muted">{tutor.experiencia} años exp.</span>
              )}
            </div>
          </div>
        </div>

        {tutor.bio && (
          <p className="text-sm text-uvg-muted mt-4 leading-relaxed">{tutor.bio}</p>
        )}
      </div>

      {/* Cursos y nivel */}
      <div className="card mb-4">
        <h2 className="heading-section mb-3">Materias que enseña</h2>
        <div className="flex flex-wrap gap-2">
          {tutor.cursos?.map(c => (
            <span key={c.codigo} className="chip">{c.nombre}</span>
          ))}
          {tutor.nivel && (
            <span className="badge-green ml-1">{tutor.nivel.nombre}</span>
          )}
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="card mb-4">
        <h2 className="heading-section mb-3">Disponibilidad</h2>
        {tutor.horarios?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tutor.horarios.map(h => (
              <span key={h.id} className="badge-gray">
                {h.dia} {h.horaInicio}–{h.horaFin}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-uvg-subtle">Horarios no disponibles.</p>
        )}
      </div>

      <p className="text-center text-xs text-uvg-subtle py-2">
        Perfil completo con reviews disponible en la siguiente fase.
      </p>
    </div>
  )
}
