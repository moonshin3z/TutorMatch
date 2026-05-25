import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Tutor {
  id: number
  nombre: string
  email: string
  carrera: string
  semestre: number
  bio: string
  rating: number
  totalReviews: number
  experiencia: number
  precio: number
  modalidad: string
  cursos: { codigo: string; nombre: string }[]
  horarios: { id: number; dia: string; horaInicio: string; horaFin: string }[]
  nivel: { nombre: string } | null
}

interface Review {
  texto: string
  calificacion: number
  nombreReviewer: string
  carreraReviewer: string
  semestreReviewer: number
  fecha: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS_ORDER = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre']

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

function formatDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return `${d} de ${MONTHS[m - 1]} de ${y}`
}

// ── Componentes pequeños ──────────────────────────────────────────────────────
function Stars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const full = Math.round(value)
  return (
    <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'text-amber-500' : 'text-uvg-border'}>★</span>
      ))}
    </span>
  )
}

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${
            n <= (hover || value) ? 'text-amber-500' : 'text-uvg-border'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ModalidadBadge({ modalidad }: { modalidad: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    VIRTUAL:    { label: 'Virtual',    cls: 'badge-blue' },
    PRESENCIAL: { label: 'Presencial', cls: 'badge-gray' },
    AMBAS:      { label: 'V + P',      cls: 'badge-gray' },
  }
  const m = map[modalidad] ?? { label: modalidad, cls: 'badge-gray' }
  return <span className={m.cls}>{m.label}</span>
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function TutorProfile() {
  const { id }         = useParams<{ id: string }>()
  const navigate       = useNavigate()
  const location       = useLocation()
  const { role, id: userId, nombre: userName } = useAuthStore()

  // Match reasons pasadas desde TutorCard vía router state
  const matchReasons  = (location.state as { matchReasons?: string[] } | null)?.matchReasons

  const [tutor, setTutor]       = useState<Tutor | null>(null)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)

  // Si viene desde "Guardados" con openReview=true, abre el form directamente
  const openReviewOnMount = (location.state as { openReview?: boolean } | null)?.openReview === true

  // Estado del formulario de reseña
  const [showForm, setShowForm] = useState(openReviewOnMount)
  const [stars, setStars]             = useState(5)
  const [reviewText, setReviewText]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [reviewSent, setReviewSent]   = useState(false)

  // Estado del botón "Solicitar tutoría" — persiste en localStorage
  const storageKey = `tm_solicitado_${id}`
  const [solicitado, setSolicitado] = useState(
    () => localStorage.getItem(storageKey) === 'true'
  )

  const fetchData = async () => {
    const [tutorRes, reviewsRes] = await Promise.all([
      api.get(`/tutores/${id}`),
      api.get(`/tutores/${id}/reviews`),
    ])
    setTutor(tutorRes.data)
    setReviews(reviewsRes.data)
  }

  useEffect(() => {
    fetchData().catch(() => navigate('/', { replace: true })).finally(() => setLoading(false))
  }, [id])

  // Disponibilidad agrupada por día
  const byDay = DAYS_ORDER.reduce((acc, dia) => {
    const slots = tutor?.horarios.filter(h => h.dia === dia) ?? []
    if (slots.length) acc[dia] = slots
    return acc
  }, {} as Record<string, Tutor['horarios']>)

  const submitReview = async () => {
    if (!reviewText.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/tutores/${id}/reviews`, { texto: reviewText.trim(), calificacion: stars })
      await fetchData()
      setReviewSent(true)
      setShowForm(false)
      setReviewText('')
      setStars(5)
    } finally {
      setSubmitting(false)
    }
  }

  const solicitarTutoria = async () => {
    await api.post(`/recomendaciones/${userId}/recomendar/${id}`)
    localStorage.setItem(storageKey, 'true')
    setSolicitado(true)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse h-32 bg-uvg-border/30" />
        ))}
      </div>
    )
  }

  if (!tutor) return null

  const isStudent = role === 'ESTUDIANTE'

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4 pb-24">

      {/* ── Volver ── */}
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2 text-xs">
        ← Volver al feed
      </button>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 1 — Header del tutor
      ══════════════════════════════════════════════════════════ */}
      <div className="card-lg">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`
            w-[72px] h-[72px] rounded-md flex-shrink-0
            flex items-center justify-center
            text-xl font-bold select-none
            ${avatarColor(tutor.nombre)}
          `}>
            {initials(tutor.nombre)}
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-uvg-text leading-tight">{tutor.nombre}</h1>

            {/* Carrera y semestre — identidad académica */}
            {tutor.carrera && (
              <p className="text-xs text-uvg-muted mt-0.5">
                {tutor.carrera}
                {tutor.semestre > 0 && ` · ${tutor.semestre}° semestre`}
              </p>
            )}
            {tutor.experiencia > 0 && (
              <p className="text-xs text-uvg-subtle mt-0.5">
                {tutor.experiencia} año{tutor.experiencia !== 1 ? 's' : ''} dando tutorías
              </p>
            )}

            {/* Rating + precio */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm">
                <span className="text-amber-500">★</span>
                <span className="font-medium ml-0.5">{tutor.rating > 0 ? tutor.rating.toFixed(1) : '—'}</span>
                {reviews.length > 0 && (
                  <span className="text-uvg-muted font-normal ml-1">({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
                )}
              </span>
              {tutor.precio > 0 && (
                <span className="text-sm font-mono text-uvg-text">Q{tutor.precio}/hr</span>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <ModalidadBadge modalidad={tutor.modalidad} />
              {tutor.nivel && <span className="badge-green">{tutor.nivel.nombre}</span>}
            </div>
          </div>
        </div>

        {/* Bio */}
        {tutor.bio && (
          <p className="text-sm text-uvg-muted leading-relaxed mt-4 pt-4 border-t border-uvg-border">
            {tutor.bio}
          </p>
        )}

        {/* CTAs — solo estudiantes */}
        {isStudent && (
          <div className="mt-4 pt-4 border-t border-uvg-border flex flex-col gap-2">
            <button
              onClick={solicitarTutoria}
              disabled={solicitado}
              className={`btn-primary w-full ${solicitado ? 'opacity-80 cursor-default' : ''}`}
            >
              {solicitado ? '✓ Tutor guardado en tu lista' : 'Solicitar tutoría'}
            </button>
            {tutor.email && (
              <a
                href={`mailto:${tutor.email}?subject=Solicitud de tutoría — TutorMatch UVG`}
                className="btn-secondary w-full text-center text-sm"
              >
                Contactar por correo → {tutor.email}
              </a>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 2 — Tu match con [nombre] (solo si hay datos)
      ══════════════════════════════════════════════════════════ */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="card border-l-[3px] border-l-uvg-green animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-uvg-green flex-shrink-0" />
            <h2 className="heading-section">Tu match con {tutor.nombre.split(' ')[0]}</h2>
          </div>
          <ul className="space-y-1.5">
            {matchReasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-uvg-muted leading-snug">
                <span className="text-uvg-green mt-[3px] flex-shrink-0 text-xs">●</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 3 — Materias que enseña
      ══════════════════════════════════════════════════════════ */}
      <div className="card">
        <h2 className="heading-section mb-3">Materias que enseña</h2>
        {tutor.cursos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tutor.cursos.map(c => (
              <span key={c.codigo} className="chip text-xs">{c.nombre}</span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-uvg-subtle">Sin materias registradas.</p>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 4 — Disponibilidad
      ══════════════════════════════════════════════════════════ */}
      <div className="card">
        <h2 className="heading-section mb-4">Disponibilidad</h2>
        {Object.keys(byDay).length > 0 ? (
          <dl className="space-y-3">
            {Object.entries(byDay).map(([dia, slots]) => (
              <div key={dia} className="flex items-start gap-4">
                <dt className="text-xs font-medium text-uvg-muted w-24 flex-shrink-0 pt-0.5">{dia}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {slots.map(h => (
                    <span key={h.id} className="badge-green">
                      {h.horaInicio}–{h.horaFin}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-xs text-uvg-subtle">Sin horarios registrados.</p>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 5 — Reseñas
      ══════════════════════════════════════════════════════════ */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-section">
            Reseñas
            {reviews.length > 0 && (
              <span className="text-uvg-muted font-normal text-xs ml-2">({reviews.length})</span>
            )}
          </h2>
          {isStudent && !reviewSent && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="text-xs text-uvg-green font-medium hover:underline"
            >
              {showForm ? 'Cancelar' : '+ Dejar reseña'}
            </button>
          )}
        </div>

        {/* Formulario de reseña */}
        {showForm && (
          <div className="border border-uvg-border rounded-md p-4 mb-4 animate-fade-up space-y-3">
            <p className="text-xs font-medium text-uvg-muted">Tu calificación</p>
            <StarSelector value={stars} onChange={setStars} />
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder={`¿Cómo fue tu experiencia con ${tutor.nombre.split(' ')[0]}?`}
              rows={3}
              className="form-input resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary text-xs py-1.5">
                Cancelar
              </button>
              <button
                onClick={submitReview}
                disabled={submitting || !reviewText.trim()}
                className="btn-primary text-xs py-1.5"
              >
                {submitting ? 'Publicando...' : 'Publicar reseña'}
              </button>
            </div>
          </div>
        )}

        {/* Confirmación de envío */}
        {reviewSent && (
          <div className="alert-success mb-4 animate-fade-up">
            Reseña publicada. ¡Gracias por tu feedback!
          </div>
        )}

        {/* Lista de reseñas */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className={`${i > 0 ? 'pt-4 border-t border-uvg-border' : ''}`}>
                {/* Estrellas + calificación */}
                <div className="flex items-center gap-2 mb-1.5">
                  <Stars value={r.calificacion} size="sm" />
                  <span className="text-xs font-mono text-uvg-muted">{r.calificacion.toFixed(1)}</span>
                </div>

                {/* Texto de la reseña */}
                <p className="text-sm text-uvg-text leading-relaxed mb-2">
                  "{r.texto}"
                </p>

                {/* Identidad del reviewer — la prueba social clave */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-uvg-text">{r.nombreReviewer}</p>
                    <p className="text-xs text-uvg-muted">
                      {r.carreraReviewer}
                      {r.semestreReviewer > 0 && ` · ${r.semestreReviewer}° semestre`}
                    </p>
                  </div>
                  {r.fecha && (
                    <p className="text-2xs text-uvg-subtle">{formatDate(r.fecha)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state py-8">
            <p className="empty-state-title">Sin reseñas todavía</p>
            <p className="empty-state-body">
              {isStudent
                ? 'Sé el primero en dejar una reseña después de tu tutoría.'
                : 'Aún no hay reseñas para este tutor.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
