import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

interface Curso { codigo: string; nombre: string; departamento: string }
interface Horario { id: number; dia: string; horaInicio: string; horaFin: string }
interface Nivel { id: number; nombre: string; valor: number }
interface Perfil {
  nombre: string; email: string; rating: number; experiencia: number
  cursos: Curso[]; horarios: Horario[]; nivel: Nivel | null
}

type Tab = 'perfil' | 'disponibilidad'

export default function TutorDashboard() {
  const { id } = useAuthStore()
  const [tab, setTab] = useState<Tab>('perfil')
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [allCursos, setAllCursos] = useState<Curso[]>([])
  const [allHorarios, setAllHorarios] = useState<Horario[]>([])
  const [allNiveles, setAllNiveles] = useState<Nivel[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [perfilRes, cursosRes, horariosRes, nivelesRes] = await Promise.all([
        api.get(`/tutores/${id}`),
        api.get('/cursos'),
        api.get('/horarios'),
        api.get('/niveles'),
      ])
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
    await api.put(`/tutores/${id}/cursos`, { codigo })
    flash('Curso agregado'); fetchAll()
  }
  const removeCurso = async (codigo: string) => {
    await api.delete(`/tutores/${id}/cursos/${codigo}`)
    flash('Curso eliminado'); fetchAll()
  }
  const addHorario = async (horarioId: number) => {
    await api.put(`/tutores/${id}/horarios`, { horarioId })
    flash('Horario agregado'); fetchAll()
  }
  const removeHorario = async (horarioId: number) => {
    await api.delete(`/tutores/${id}/horarios/${horarioId}`)
    flash('Horario eliminado'); fetchAll()
  }
  const setNivel = async (nivel: string) => {
    await api.put(`/tutores/${id}/nivel`, { nivel })
    flash('Nivel actualizado'); fetchAll()
  }

  function Stars({ rating }: { rating: number }) {
    return (
      <span className="text-amber-500">
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
        <span className="text-uvg-muted text-sm ml-1">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      </span>
    )
  }

  const cursosDisponibles = allCursos.filter(c => !perfil?.cursos.some(pc => pc.codigo === c.codigo))
  const horariosDisponibles = allHorarios.filter(h => !perfil?.horarios.some(ph => ph.id === h.id))

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-uvg-muted text-sm">Cargando...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {msg && (
        <div className="mb-4 bg-uvg-green-light border border-uvg-green text-uvg-green text-sm rounded px-4 py-2">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-uvg-border">
        {(['perfil', 'disponibilidad'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-uvg-green text-uvg-green'
                : 'border-transparent text-uvg-muted hover:text-uvg-text'
            }`}>
            {t === 'perfil' ? 'Mi perfil' : 'Disponibilidad'}
          </button>
        ))}
      </div>

      {tab === 'perfil' && perfil && (
        <div className="space-y-5">
          {/* Info card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-uvg-green-light flex items-center justify-center">
                  <span className="text-uvg-green font-bold">
                    {perfil.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{perfil.nombre}</p>
                  <p className="text-xs text-uvg-muted">{perfil.email}</p>
                </div>
              </div>
              <div className="text-right">
                <Stars rating={perfil.rating} />
                <p className="text-xs text-uvg-muted mt-0.5">{perfil.experiencia} año{perfil.experiencia !== 1 ? 's' : ''} de exp.</p>
              </div>
            </div>
          </div>

          {/* Nivel */}
          <div className="card">
            <h3 className="font-semibold text-sm mb-3">Mi nivel de dominio</h3>
            <div className="flex gap-2">
              {allNiveles.map(n => (
                <button key={n.id} onClick={() => setNivel(n.nombre)}
                  className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
                    perfil.nivel?.nombre === n.nombre
                      ? 'bg-uvg-green text-white border-uvg-green'
                      : 'border-uvg-border text-uvg-muted hover:border-uvg-green hover:text-uvg-green'
                  }`}>
                  {n.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Cursos */}
          <div className="card">
            <h3 className="font-semibold text-sm mb-3">Cursos que enseño</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {perfil.cursos.map(c => (
                <span key={c.codigo} className="inline-flex items-center gap-1.5 badge-gray px-3 py-1">
                  <span>{c.nombre}</span>
                  <button onClick={() => removeCurso(c.codigo)}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold">✕</button>
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
        </div>
      )}

      {tab === 'disponibilidad' && perfil && (
        <div className="space-y-5">
          <div className="card">
            <h3 className="font-semibold text-sm mb-3">Horarios disponibles para tutorías</h3>

            {perfil.horarios.length > 0 ? (
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="text-left text-xs text-uvg-muted border-b border-uvg-border">
                    <th className="pb-2 font-medium">Día</th>
                    <th className="pb-2 font-medium">Horario</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {perfil.horarios.map(h => (
                    <tr key={h.id} className="border-b border-uvg-border last:border-0">
                      <td className="py-2.5">{h.dia}</td>
                      <td className="py-2.5 text-uvg-muted">{h.horaInicio} – {h.horaFin}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => removeHorario(h.id)} className="btn-danger">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-uvg-muted mb-3">Sin horarios registrados</p>
            )}

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
