import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Curso   { codigo: string; nombre: string; departamento: string }
interface Horario { id: number; dia: string; horaInicio: string; horaFin: string }
interface Nivel   { id: number; nombre: string; valor: number }
interface Review  {
  texto: string; calificacion: number
  nombreReviewer: string; carreraReviewer: string; semestreReviewer: number; fecha: string
}
interface Perfil {
  nombre: string; email: string; rating: number; totalReviews: number
  experiencia: number; bio: string; precio: number; modalidad: string
  cursos: Curso[]; horarios: Horario[]
  nivel: Nivel | null
}

type Tab = 'perfil' | 'disponibilidad' | 'reseñas'

const DAYS_ORDER = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MODALIDADES = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL',    label: 'Virtual'    },
  { value: 'AMBAS',      label: 'V + P'      },
]
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre']

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(nombre: string) {
  return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(s: string) {
  if (!s) return ''
  const [y, m, d] = s.split('-').map(Number)
  return `${d} de ${MONTHS[m - 1]} de ${y}`
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value)
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'text-amber-500' : 'text-uvg-border'}>★</span>
      ))}
    </span>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function TutorDashboard() {
  const { id } = useAuthStore()

  const [tab, setTab]           = useState<Tab>('perfil')
  const [perfil, setPerfil]     = useState<Perfil | null>(null)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [allCursos, setAllCursos]   = useState<Curso[]>([])
  const [allHorarios, setAllHorarios] = useState<Horario[]>([])
  const [allNiveles, setAllNiveles]   = useState<Nivel[]>([])
  const [loading, setLoading]   = useState(true)
  const [flash, setFlash]       = useState('')

  // Estado del formulario de perfil
  const [bio, setBio]           = useState('')
  const [precio, setPrecio]     = useState('')
  const [modalidad, setModalidad] = useState('')
  const [saving, setSaving]     = useState(false)

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2500) }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [perfilRes, reviewsRes, cursosRes, horariosRes, nivelesRes] = await Promise.all([
        api.get(`/tutores/${id}`),
        api.get(`/tutores/${id}/reviews`),
        api.get('/cursos'),
        api.get('/horarios'),
        api.get('/niveles'),
      ])
      const p: Perfil = perfilRes.data
      setPerfil(p)
      setReviews(reviewsRes.data)
      setAllCursos(cursosRes.data)
      setAllHorarios(horariosRes.data)
      setAllNiveles(nivelesRes.data.sort((a: Nivel, b: Nivel) => a.valor - b.valor))
      // Sincroniza el formulario con los datos actuales
      setBio(p.bio ?? '')
      setPrecio(p.precio > 0 ? String(p.precio) : '')
      setModalidad(p.modalidad ?? '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  // ── Acciones ──────────────────────────────────────────────────────────────

  const savePerfil = async () => {
    setSaving(true)
    try {
      await api.put(`/tutores/${id}/perfil`, {
        bio: bio.trim() || null,
        precio: precio ? Number(precio) : null,
        modalidad: modalidad || null,
      })
      showFlash('Perfil actualizado')
      await fetchAll()
    } finally {
      setSaving(false)
    }
  }

  const setNivel = async (nivelNombre: string) => {
    await api.put(`/tutores/${id}/nivel`, { nivel: nivelNombre })
    showFlash('Nivel actualizado')
    fetchAll()
  }

  const addCurso = async (codigo: string) => {
    await api.put(`/tutores/${id}/cursos`, { codigo })
    showFlash('Curso agregado')
    fetchAll()
  }

  const removeCurso = async (codigo: string) => {
    await api.delete(`/tutores/${id}/cursos/${codigo}`)
    showFlash('Curso eliminado')
    fetchAll()
  }

  const toggleHorario = async (h: Horario, activo: boolean) => {
    if (activo) {
      await api.delete(`/tutores/${id}/horarios/${h.id}`)
    } else {
      await api.put(`/tutores/${id}/horarios`, { horarioId: h.id })
    }
    fetchAll()
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="card animate-pulse h-28 bg-uvg-border/30" />
        ))}
      </div>
    )
  }

  if (!perfil) return null

  const cursosDisponibles = allCursos.filter(
    c => !perfil.cursos.some(p => p.codigo === c.codigo)
  )

  // Disponibilidad agrupada por día
  const byDay = DAYS_ORDER.reduce((acc, dia) => {
    const slots = allHorarios.filter(h => h.dia === dia)
    if (slots.length) acc[dia] = slots
    return acc
  }, {} as Record<string, Horario[]>)

  const activeIds = new Set(perfil.horarios.map(h => h.id))

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      {/* Flash */}
      {flash && <div className="alert-success mb-4 animate-fade-up">{flash}</div>}

      {/* ── Header de identidad ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-md bg-uvg-green-light flex items-center justify-center flex-shrink-0">
          <span className="text-uvg-green font-bold">{initials(perfil.nombre)}</span>
        </div>
        <div>
          <p className="font-semibold text-uvg-text">{perfil.nombre}</p>
          <p className="text-xs text-uvg-muted">{perfil.email}</p>
        </div>
        {perfil.rating > 0 && (
          <div className="ml-auto text-right">
            <p className="text-sm font-medium text-uvg-text">
              <span className="text-amber-500">★</span> {perfil.rating.toFixed(1)}
            </p>
            {reviews.length > 0 && (
              <p className="text-2xs text-uvg-muted">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="tab-bar mb-6">
        {(['perfil','disponibilidad','reseñas'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={tab === t ? 'tab-item-active' : 'tab-item-inactive'}>
            {t === 'perfil' ? 'Mi perfil' : t === 'disponibilidad' ? 'Disponibilidad' : `Reseñas${reviews.length > 0 ? ` (${reviews.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ══════════════════════════ TAB: PERFIL ══════════════════════════════ */}
      {tab === 'perfil' && (
        <div className="space-y-4">

          {/* Bio */}
          <div className="card">
            <h2 className="heading-section mb-3">Presentación</h2>
            <p className="text-xs text-uvg-muted mb-2">
              Los estudiantes ven esto antes de contactarte. Sé directo y específico.
            </p>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Ej: Ing. en Sistemas, 5to año. Especialista en algoritmos. Explico paso a paso, sin saltar pasos."
              className="form-input resize-none"
            />
            <p className="text-2xs text-uvg-subtle text-right mt-1">{bio.length}/300</p>
          </div>

          {/* Precio y modalidad en una fila */}
          <div className="card">
            <h2 className="heading-section mb-4">Tarifa y formato</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Precio por hora (Q)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={precio}
                  onChange={e => setPrecio(e.target.value)}
                  placeholder="80"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Modalidad</label>
                <div className="flex flex-col gap-1.5 mt-0.5">
                  {MODALIDADES.map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setModalidad(m.value)}
                      className={`text-left text-xs px-3 py-1.5 rounded border transition-colors ${
                        modalidad === m.value
                          ? 'border-uvg-green bg-uvg-green text-white'
                          : 'border-uvg-border text-uvg-muted hover:border-uvg-border-strong'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Nivel de dominio */}
          <div className="card">
            <h2 className="heading-section mb-3">Nivel de dominio</h2>
            <div className="flex gap-2 flex-wrap">
              {allNiveles.map(n => (
                <button
                  key={n.id}
                  onClick={() => setNivel(n.nombre)}
                  className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
                    perfil.nivel?.nombre === n.nombre
                      ? 'bg-uvg-green text-white border-uvg-green'
                      : 'border-uvg-border text-uvg-muted hover:border-uvg-green hover:text-uvg-green'
                  }`}
                >
                  {n.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Cursos */}
          <div className="card">
            <h2 className="heading-section mb-3">Cursos que enseño</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {perfil.cursos.map(c => (
                <span key={c.codigo} className="chip">
                  {c.nombre}
                  <button
                    onClick={() => removeCurso(c.codigo)}
                    className="text-uvg-muted hover:text-red-500 text-xs"
                  >✕</button>
                </span>
              ))}
              {perfil.cursos.length === 0 && (
                <p className="text-xs text-uvg-subtle">Ningún curso agregado todavía.</p>
              )}
            </div>
            {cursosDisponibles.length > 0 && (
              <div className="divider pt-3">
                <p className="label-meta mb-2 pt-3">Agregar</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {cursosDisponibles.map(c => (
                    <button
                      key={c.codigo}
                      onClick={() => addCurso(c.codigo)}
                      className="text-xs border border-uvg-border rounded px-2.5 py-1 hover:border-uvg-green hover:text-uvg-green transition-colors"
                    >
                      + {c.codigo}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guardar bio/precio/modalidad */}
          <button
            onClick={savePerfil}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}

      {/* ════════════════════════ TAB: DISPONIBILIDAD ══════════════════════ */}
      {tab === 'disponibilidad' && (
        <div className="space-y-4">
          <p className="text-sm text-uvg-muted">
            Activá los bloques en los que podés dar tutorías. Los estudiantes solo verán opciones compatibles con su horario.
          </p>

          {Object.entries(byDay).map(([dia, slots]) => {
            const anyActive = slots.some(h => activeIds.has(h.id))
            return (
              <div key={dia} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="heading-section">{dia}</h3>
                  {anyActive && (
                    <span className="badge-green">
                      {slots.filter(h => activeIds.has(h.id)).length} activo{slots.filter(h => activeIds.has(h.id)).length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {slots.map(h => {
                    const activo = activeIds.has(h.id)
                    return (
                      <button
                        key={h.id}
                        onClick={() => toggleHorario(h, activo)}
                        className={`px-3 py-2 rounded border text-xs font-medium transition-colors ${
                          activo
                            ? 'bg-uvg-green-light border-uvg-green text-uvg-green'
                            : 'border-uvg-border text-uvg-muted hover:border-uvg-border-strong'
                        }`}
                      >
                        {h.horaInicio}–{h.horaFin}
                        {activo && <span className="ml-1.5 opacity-70">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {Object.keys(byDay).length === 0 && (
            <div className="empty-state border border-uvg-border rounded-md">
              <p className="empty-state-title">Sin horarios disponibles</p>
              <p className="empty-state-body">Contactá al administrador para agregar bloques horarios al sistema.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════ TAB: RESEÑAS ══════════════════════════ */}
      {tab === 'reseñas' && (
        <div className="space-y-4">

          {/* Resumen */}
          {reviews.length > 0 && (
            <div className="card flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-semibold text-uvg-text">
                  {perfil.rating > 0 ? perfil.rating.toFixed(1) : '—'}
                </p>
                <Stars value={perfil.rating} />
              </div>
              <div className="divider h-12 w-px mx-2" />
              <div>
                <p className="text-2xl font-semibold text-uvg-text">{reviews.length}</p>
                <p className="text-xs text-uvg-muted">reseña{reviews.length !== 1 ? 's' : ''} recibida{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}

          {/* Lista de reseñas */}
          {reviews.length > 0 ? (
            <div className="card space-y-5">
              {reviews.map((r, i) => (
                <div key={i} className={i > 0 ? 'pt-5 border-t border-uvg-border' : ''}>
                  {/* Estrellas */}
                  <div className="flex items-center gap-2 mb-2">
                    <Stars value={r.calificacion} />
                    <span className="text-xs font-mono text-uvg-muted">{r.calificacion.toFixed(1)}</span>
                  </div>

                  {/* Texto */}
                  <p className="text-sm text-uvg-text leading-relaxed mb-3">"{r.texto}"</p>

                  {/* Identidad del reviewer */}
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-uvg-text">{r.nombreReviewer}</p>
                      <p className="text-xs text-uvg-muted">
                        {r.carreraReviewer}
                        {r.semestreReviewer > 0 && ` · ${r.semestreReviewer}° semestre`}
                      </p>
                    </div>
                    {r.fecha && (
                      <p className="text-2xs text-uvg-subtle flex-shrink-0">{formatDate(r.fecha)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state border border-uvg-border rounded-md">
              <p className="empty-state-title">Todavía no tenés reseñas</p>
              <p className="empty-state-body">
                Cuando los estudiantes completen tutorías contigo, podrán dejar reseñas aquí.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
