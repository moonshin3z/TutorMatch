import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'
import TutorCard from '../components/TutorCard'

interface Recomendacion {
  id: number; nombre: string; rating: number; experiencia: number
  nivel: string; cursos: string[]; horarios: string[]; score: number
}
interface Curso { codigo: string; nombre: string; departamento: string }
interface Horario { id: number; dia: string; horaInicio: string; horaFin: string }
interface Nivel { id: number; nombre: string; valor: number }
interface Perfil {
  nombre: string; carrera: string; semestre: number; email: string
  cursos: Curso[]; horarios: Horario[]; nivelBuscado: Nivel | null
}

type Tab = 'recomendaciones' | 'perfil'

export default function StudentDashboard() {
  const { id } = useAuthStore()
  const [tab, setTab] = useState<Tab>('recomendaciones')
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([])
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [allCursos, setAllCursos] = useState<Curso[]>([])
  const [allHorarios, setAllHorarios] = useState<Horario[]>([])
  const [allNiveles, setAllNiveles] = useState<Nivel[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [recRes, perfilRes, cursosRes, horariosRes, nivelesRes] = await Promise.all([
        api.get(`/recomendaciones/${id}`),
        api.get(`/estudiantes/${id}`),
        api.get('/cursos'),
        api.get('/horarios'),
        api.get('/niveles'),
      ])
      setRecomendaciones(recRes.data)
      setPerfil(perfilRes.data)
      setAllCursos(cursosRes.data)
      setAllHorarios(horariosRes.data)
      setAllNiveles(nivelesRes.data.sort((a: Nivel, b: Nivel) => a.valor - b.valor))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const addCurso = async (codigo: string) => {
    await api.put(`/estudiantes/${id}/cursos`, { codigo })
    flash('Curso agregado'); fetchAll()
  }
  const removeCurso = async (codigo: string) => {
    await api.delete(`/estudiantes/${id}/cursos/${codigo}`)
    flash('Curso eliminado'); fetchAll()
  }
  const addHorario = async (horarioId: number) => {
    await api.put(`/estudiantes/${id}/horarios`, { horarioId })
    flash('Horario agregado'); fetchAll()
  }
  const removeHorario = async (horarioId: number) => {
    await api.delete(`/estudiantes/${id}/horarios/${horarioId}`)
    flash('Horario eliminado'); fetchAll()
  }
  const setNivel = async (nivel: string) => {
    await api.put(`/estudiantes/${id}/nivel`, { nivel })
    flash('Nivel actualizado'); fetchAll()
  }

  const cursosDisponibles = allCursos.filter(
    c => !perfil?.cursos.some(pc => pc.codigo === c.codigo)
  )
  const horariosDisponibles = allHorarios.filter(
    h => !perfil?.horarios.some(ph => ph.id === h.id)
  )

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-uvg-muted text-sm">Cargando...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Flash */}
      {msg && (
        <div className="mb-4 bg-uvg-green-light border border-uvg-green text-uvg-green text-sm rounded px-4 py-2">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-uvg-border">
        {(['recomendaciones', 'perfil'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-uvg-green text-uvg-green'
                : 'border-transparent text-uvg-muted hover:text-uvg-text'
            }`}
          >
            {t === 'recomendaciones' ? 'Recomendaciones' : 'Mi perfil'}
          </button>
        ))}
      </div>

      {/* ── Recomendaciones ── */}
      {tab === 'recomendaciones' && (
        <div>
          <p className="text-sm text-uvg-muted mb-4">
            Tutores compatibles según tus cursos, horarios y nivel buscado.
          </p>
          {recomendaciones.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-uvg-muted text-sm">No hay recomendaciones disponibles.</p>
              <p className="text-xs text-uvg-muted mt-1">
                Agrega cursos y horarios en "Mi perfil" para obtener resultados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recomendaciones.map(t => (
                <TutorCard key={t.id} tutor={t} onRecomendado={fetchAll} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Perfil ── */}
      {tab === 'perfil' && perfil && (
        <div className="space-y-5">
          {/* Info básica */}
          <div className="card">
            <h3 className="font-semibold text-sm mb-3">Información personal</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-uvg-muted">Nombre</span><p className="font-medium mt-0.5">{perfil.nombre}</p></div>
              <div><span className="text-uvg-muted">Correo</span><p className="font-medium mt-0.5">{perfil.email}</p></div>
              <div><span className="text-uvg-muted">Carrera</span><p className="font-medium mt-0.5">{perfil.carrera}</p></div>
              <div><span className="text-uvg-muted">Semestre</span><p className="font-medium mt-0.5">{perfil.semestre}</p></div>
            </div>
          </div>

          {/* Nivel buscado */}
          <div className="card">
            <h3 className="font-semibold text-sm mb-3">Nivel de tutoría buscado</h3>
            <div className="flex gap-2">
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
            <h3 className="font-semibold text-sm mb-3">Cursos en los que necesito tutoría</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {perfil.cursos.map(c => (
                <span key={c.codigo}
                  className="inline-flex items-center gap-1.5 badge-gray px-3 py-1">
                  <span>{c.nombre}</span>
                  <button onClick={() => removeCurso(c.codigo)}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold leading-none">✕</button>
                </span>
              ))}
              {perfil.cursos.length === 0 && (
                <span className="text-xs text-uvg-muted">Sin cursos agregados</span>
              )}
            </div>
            {cursosDisponibles.length > 0 && (
              <div className="border-t border-uvg-border pt-3">
                <p className="text-xs text-uvg-muted mb-2">Agregar curso:</p>
                <div className="flex flex-wrap gap-1.5">
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
            <h3 className="font-semibold text-sm mb-3">Mi disponibilidad</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {perfil.horarios.map(h => (
                <span key={h.id}
                  className="inline-flex items-center gap-1.5 badge-green px-3 py-1">
                  <span>{h.dia} {h.horaInicio}–{h.horaFin}</span>
                  <button onClick={() => removeHorario(h.id)}
                    className="text-uvg-green hover:text-uvg-green-dark text-xs font-bold leading-none opacity-70 hover:opacity-100">✕</button>
                </span>
              ))}
              {perfil.horarios.length === 0 && (
                <span className="text-xs text-uvg-muted">Sin horarios agregados</span>
              )}
            </div>
            {horariosDisponibles.length > 0 && (
              <div className="border-t border-uvg-border pt-3">
                <p className="text-xs text-uvg-muted mb-2">Agregar horario:</p>
                <div className="flex flex-wrap gap-1.5">
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
        </div>
      )}
    </div>
  )
}
