import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'
import TutorCard, { type Recomendacion } from '../components/TutorCard'

interface Curso   { codigo: string; nombre: string }
interface Horario { id: number; dia: string; horaInicio: string; horaFin: string }
interface Nivel   { id: number; nombre: string }
interface Perfil  {
  nombre: string; carrera: string; semestre: number; email: string
  cursos: Curso[]; horarios: Horario[]
  nivelBuscado: Nivel | null
}

interface Filters { materia: string; nivel: string; modalidad: string; dia: string }

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MODALIDADES = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL',    label: 'Virtual' },
  { value: 'AMBAS',      label: 'V + P' },
]

function greeting(nombre: string) {
  const h = new Date().getHours()
  const saludo = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
  return `${saludo}, ${nombre.split(' ')[0]}.`
}

export default function StudentDashboard() {
  const { id, nombre } = useAuthStore()

  const [tab, setTab]                             = useState<'feed' | 'perfil'>('feed')
  const [recs, setRecs]                           = useState<Recomendacion[]>([])
  const [perfil, setPerfil]                       = useState<Perfil | null>(null)
  const [allCursos, setAllCursos]                 = useState<Curso[]>([])
  const [allHorarios, setAllHorarios]             = useState<Horario[]>([])
  const [allNiveles, setAllNiveles]               = useState<Nivel[]>([])
  const [loading, setLoading]                     = useState(true)
  const [filters, setFilters]                     = useState<Filters>({ materia: '', nivel: '', modalidad: '', dia: '' })
  const [flash, setFlash]                         = useState('')

  const setF = (k: keyof Filters, v: string) => setFilters(f => ({ ...f, [k]: v }))
  const anyFilter = Object.values(filters).some(Boolean)

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2500) }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [recsRes, perfilRes, cursosRes, horariosRes, nivelesRes] = await Promise.all([
        api.get(`/recomendaciones/${id}`),
        api.get(`/estudiantes/${id}`),
        api.get('/cursos'),
        api.get('/horarios'),
        api.get('/niveles'),
      ])
      setRecs(recsRes.data)
      setPerfil(perfilRes.data)
      setAllCursos(cursosRes.data)
      setAllHorarios(horariosRes.data)
      setAllNiveles(nivelesRes.data.sort((a: Nivel & { valor: number }, b: Nivel & { valor: number }) => a.valor - b.valor))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  // ── Filtrado client-side ──────────────────────────────────────────────────
  const filtered = recs.filter(t => {
    if (filters.materia && !t.cursosCodigos?.includes(filters.materia)) return false
    if (filters.nivel && t.nivel !== filters.nivel) return false
    if (filters.modalidad && t.modalidad !== filters.modalidad && t.modalidad !== 'AMBAS') return false
    if (filters.dia && !t.horarios?.some(h => h.startsWith(filters.dia))) return false
    return true
  })

  // ── Perfil tab: helpers ───────────────────────────────────────────────────
  const cursosDisponibles = allCursos.filter(c => !perfil?.cursos.some(p => p.codigo === c.codigo))
  const horariosDisponibles = allHorarios.filter(h => !perfil?.horarios.some(p => p.id === h.id))

  const addCurso = async (codigo: string) => {
    await api.put(`/estudiantes/${id}/cursos`, { codigo }); showFlash('Curso agregado'); fetchAll()
  }
  const removeCurso = async (codigo: string) => {
    await api.delete(`/estudiantes/${id}/cursos/${codigo}`); showFlash('Eliminado'); fetchAll()
  }
  const addHorario = async (horarioId: number) => {
    await api.put(`/estudiantes/${id}/horarios`, { horarioId }); showFlash('Horario agregado'); fetchAll()
  }
  const removeHorario = async (horarioId: number) => {
    await api.delete(`/estudiantes/${id}/horarios/${horarioId}`); showFlash('Eliminado'); fetchAll()
  }
  const setNivel = async (nivel: string) => {
    await api.put(`/estudiantes/${id}/nivel`, { nivel }); showFlash('Nivel actualizado'); fetchAll()
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card animate-pulse h-36 bg-uvg-border/30" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Flash */}
      {flash && (
        <div className="alert-success mb-4">{flash}</div>
      )}

      {/* Tabs */}
      <div className="tab-bar mb-6">
        <button
          onClick={() => setTab('feed')}
          className={tab === 'feed' ? 'tab-item-active' : 'tab-item-inactive'}
        >
          Mis tutores
        </button>
        <button
          onClick={() => setTab('perfil')}
          className={tab === 'perfil' ? 'tab-item-active' : 'tab-item-inactive'}
        >
          Mi perfil
        </button>
      </div>

      {/* ══════════════════════════════════════ FEED ══════════════════════════ */}
      {tab === 'feed' && (
        <div>
          {/* Saludo + conteo */}
          <div className="mb-5">
            <h1 className="heading-page">{greeting(nombre ?? 'estudiante')}</h1>
            <p className="text-sm text-uvg-muted mt-1">
              {filtered.length > 0
                ? `${filtered.length} tutor${filtered.length !== 1 ? 'es' : ''} recomendado${filtered.length !== 1 ? 's' : ''} para ti`
                : 'Ajusta los filtros o actualiza tu perfil para ver resultados'}
            </p>
          </div>

          {/* Barra de filtros */}
          <div className="mb-5 -mx-1 px-1 overflow-x-auto">
            <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>

              {/* Materia */}
              <select
                value={filters.materia}
                onChange={e => setF('materia', e.target.value)}
                className={`text-xs px-3 py-1.5 rounded border cursor-pointer transition-colors outline-none ${
                  filters.materia
                    ? 'border-uvg-green bg-uvg-green text-white'
                    : 'border-uvg-border bg-uvg-surface text-uvg-muted hover:border-uvg-border-strong'
                }`}
              >
                <option value="">Materia</option>
                {allCursos.map(c => <option key={c.codigo} value={c.codigo}>{c.codigo}</option>)}
              </select>

              {/* Nivel */}
              <select
                value={filters.nivel}
                onChange={e => setF('nivel', e.target.value)}
                className={`text-xs px-3 py-1.5 rounded border cursor-pointer transition-colors outline-none ${
                  filters.nivel
                    ? 'border-uvg-green bg-uvg-green text-white'
                    : 'border-uvg-border bg-uvg-surface text-uvg-muted hover:border-uvg-border-strong'
                }`}
              >
                <option value="">Nivel</option>
                {allNiveles.map(n => <option key={n.id} value={n.nombre}>{n.nombre}</option>)}
              </select>

              {/* Modalidad */}
              <select
                value={filters.modalidad}
                onChange={e => setF('modalidad', e.target.value)}
                className={`text-xs px-3 py-1.5 rounded border cursor-pointer transition-colors outline-none ${
                  filters.modalidad
                    ? 'border-uvg-green bg-uvg-green text-white'
                    : 'border-uvg-border bg-uvg-surface text-uvg-muted hover:border-uvg-border-strong'
                }`}
              >
                <option value="">Modalidad</option>
                {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>

              {/* Día */}
              <select
                value={filters.dia}
                onChange={e => setF('dia', e.target.value)}
                className={`text-xs px-3 py-1.5 rounded border cursor-pointer transition-colors outline-none ${
                  filters.dia
                    ? 'border-uvg-green bg-uvg-green text-white'
                    : 'border-uvg-border bg-uvg-surface text-uvg-muted hover:border-uvg-border-strong'
                }`}
              >
                <option value="">Día</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              {/* Limpiar */}
              {anyFilter && (
                <button
                  onClick={() => setFilters({ materia: '', nivel: '', modalidad: '', dia: '' })}
                  className="text-xs px-3 py-1.5 rounded border border-uvg-border text-uvg-muted hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  Limpiar ×
                </button>
              )}
            </div>
          </div>

          {/* Cards */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(t => (
                <TutorCard key={t.id} tutor={t} highlight={t.score > 12} />
              ))}
            </div>
          ) : recs.length === 0 ? (
            /* Empty state: sin recomendaciones en absoluto */
            <div className="empty-state border border-uvg-border rounded-md">
              <p className="empty-state-title">Aún no tenemos tutores para vos</p>
              <p className="empty-state-body">
                Agregá más cursos y horarios disponibles en tu perfil para que el sistema encuentre matches.
              </p>
              <button
                onClick={() => setTab('perfil')}
                className="btn-primary mt-4"
              >
                Actualizar mi perfil →
              </button>
            </div>
          ) : (
            /* Empty state: filtros sin resultado */
            <div className="empty-state border border-uvg-border rounded-md">
              <p className="empty-state-title">Ningún tutor coincide con esos filtros</p>
              <p className="empty-state-body">
                Probá quitando algún filtro para ver más opciones.
              </p>
              <button
                onClick={() => setFilters({ materia: '', nivel: '', modalidad: '', dia: '' })}
                className="btn-secondary mt-4"
              >
                Quitar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════ PERFIL ══════════════════════════ */}
      {tab === 'perfil' && perfil && (
        <div className="space-y-4">

          {/* Info básica */}
          <div className="card">
            <h2 className="heading-section mb-4">Información personal</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <div><dt className="text-uvg-muted text-xs">Nombre</dt><dd className="font-medium mt-0.5">{perfil.nombre}</dd></div>
              <div><dt className="text-uvg-muted text-xs">Correo</dt><dd className="font-medium mt-0.5 text-xs truncate">{perfil.email}</dd></div>
              <div><dt className="text-uvg-muted text-xs">Carrera</dt><dd className="font-medium mt-0.5">{perfil.carrera}</dd></div>
              <div><dt className="text-uvg-muted text-xs">Semestre</dt><dd className="font-medium mt-0.5">{perfil.semestre}</dd></div>
            </dl>
          </div>

          {/* Nivel */}
          <div className="card">
            <h2 className="heading-section mb-3">Nivel de tutoría buscado</h2>
            <div className="flex gap-2 flex-wrap">
              {allNiveles.map(n => (
                <button
                  key={n.id}
                  onClick={() => setNivel(n.nombre)}
                  className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
                    perfil.nivelBuscado?.nombre === n.nombre
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
            <h2 className="heading-section mb-3">Cursos que necesito</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {perfil.cursos.map(c => (
                <span key={c.codigo} className="chip">
                  {c.nombre}
                  <button onClick={() => removeCurso(c.codigo)} className="text-uvg-muted hover:text-red-500 text-xs">✕</button>
                </span>
              ))}
              {perfil.cursos.length === 0 && <p className="text-xs text-uvg-subtle">Ningún curso agregado.</p>}
            </div>
            {cursosDisponibles.length > 0 && (
              <div className="divider pt-3">
                <p className="label-meta mb-2 pt-3">Agregar</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {cursosDisponibles.map(c => (
                    <button key={c.codigo} onClick={() => addCurso(c.codigo)}
                      className="text-xs border border-uvg-border rounded px-2.5 py-1 hover:border-uvg-green hover:text-uvg-green transition-colors">
                      + {c.codigo}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Horarios */}
          <div className="card">
            <h2 className="heading-section mb-3">Mi disponibilidad</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {perfil.horarios.map(h => (
                <span key={h.id} className="chip">
                  {h.dia} {h.horaInicio}–{h.horaFin}
                  <button onClick={() => removeHorario(h.id)} className="text-uvg-muted hover:text-red-500 text-xs">✕</button>
                </span>
              ))}
              {perfil.horarios.length === 0 && <p className="text-xs text-uvg-subtle">Ningún horario agregado.</p>}
            </div>
            {horariosDisponibles.length > 0 && (
              <div className="divider pt-3">
                <p className="label-meta mb-2 pt-3">Agregar</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {horariosDisponibles.map(h => (
                    <button key={h.id} onClick={() => addHorario(h.id)}
                      className="text-xs border border-uvg-border rounded px-2.5 py-1 hover:border-uvg-green hover:text-uvg-green transition-colors">
                      + {h.dia} {h.horaInicio}–{h.horaFin}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nota del feed */}
          <p className="text-xs text-uvg-subtle text-center pb-2">
            Los cambios en tu perfil se reflejan inmediatamente en la pestaña{' '}
            <button onClick={() => setTab('feed')} className="text-uvg-green underline">Mis tutores</button>.
          </p>
        </div>
      )}
    </div>
  )
}
