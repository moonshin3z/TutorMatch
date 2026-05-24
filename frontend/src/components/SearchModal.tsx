import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

interface Curso   { codigo: string; nombre: string }
interface Horario { id: number; dia: string; horaInicio: string; horaFin: string }
interface Nivel   { id: number; nombre: string; valor: number }

interface CurrentPrefs {
  cursoCodigos:  string[]
  horarioIds:    number[]
  nivel:         string
  modalidad:     string
}

interface Props {
  open:         boolean
  currentPrefs: CurrentPrefs
  onClose:      () => void
  onApplied:    () => void
}

const DAYS_ORDER  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MODALIDADES = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL',    label: 'Virtual'    },
  { value: 'AMBAS',      label: 'Sin preferencia' },
]
const NIVELES = ['Básico', 'Intermedio', 'Avanzado']

export default function SearchModal({ open, currentPrefs, onClose, onApplied }: Props) {
  const { id } = useAuthStore()

  const [cursos,   setCursos]   = useState<Curso[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])

  // Estado del formulario — pre-poblado con preferencias actuales
  const [selCursos,    setSelCursos]    = useState<string[]>(currentPrefs.cursoCodigos)
  const [selHorarios,  setSelHorarios]  = useState<number[]>(currentPrefs.horarioIds)
  const [selNivel,     setSelNivel]     = useState(currentPrefs.nivel)
  const [selModalidad, setSelModalidad] = useState(currentPrefs.modalidad)
  const [saving,       setSaving]       = useState(false)

  // Re-sincroniza cuando se abren las preferencias actuales
  useEffect(() => {
    if (open) {
      setSelCursos(currentPrefs.cursoCodigos)
      setSelHorarios(currentPrefs.horarioIds)
      setSelNivel(currentPrefs.nivel)
      setSelModalidad(currentPrefs.modalidad)
    }
  }, [open])

  useEffect(() => {
    api.get('/cursos').then(r => setCursos(r.data))
    api.get('/horarios').then(r => setHorarios(r.data))
  }, [])

  const toggleCurso   = (c: string) =>
    setSelCursos(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const toggleHorario = (h: number) =>
    setSelHorarios(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h])

  const byDay = DAYS_ORDER.reduce((acc, dia) => {
    const slots = horarios.filter(h => h.dia === dia)
    if (slots.length) acc[dia] = slots
    return acc
  }, {} as Record<string, Horario[]>)

  const apply = async () => {
    if (selCursos.length === 0) return
    setSaving(true)
    try {
      await api.put(`/estudiantes/${id}/busqueda`, {
        cursos:    selCursos,
        horarios:  selHorarios,
        nivel:     selNivel,
        modalidad: selModalidad,
      })
      onApplied()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet — desliza desde abajo en mobile, modal centrado en desktop */}
      <div className="
        fixed z-50 bg-uvg-surface
        bottom-0 inset-x-0 rounded-t-xl
        md:bottom-auto md:top-1/2 md:left-1/2
        md:-translate-x-1/2 md:-translate-y-1/2
        md:inset-x-auto md:rounded-xl md:w-full md:max-w-lg
        flex flex-col max-h-[90vh]
      ">
        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-uvg-border flex-shrink-0">
          <h2 className="font-semibold text-uvg-text">Buscar de nuevo</h2>
          <button onClick={onClose} className="text-uvg-muted hover:text-uvg-text text-lg leading-none">
            ×
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">

          {/* ── Materias ── */}
          <section>
            <p className="label-meta mb-3">¿Qué materia necesitás?</p>
            <div className="grid grid-cols-2 gap-2">
              {cursos.map(c => {
                const active = selCursos.includes(c.codigo)
                return (
                  <button
                    key={c.codigo}
                    onClick={() => toggleCurso(c.codigo)}
                    className={`text-left p-3 rounded-md border text-xs transition-colors ${
                      active
                        ? 'border-uvg-green bg-uvg-green-light'
                        : 'border-uvg-border hover:border-uvg-border-strong bg-uvg-bg'
                    }`}
                  >
                    <p className={`font-semibold ${active ? 'text-uvg-green' : 'text-uvg-text'}`}>
                      {c.codigo}
                    </p>
                    <p className="text-uvg-muted mt-0.5 leading-snug">{c.nombre}</p>
                  </button>
                )
              })}
            </div>
            {selCursos.length === 0 && (
              <p className="text-xs text-red-500 mt-2">Seleccioná al menos una materia.</p>
            )}
          </section>

          {/* ── Nivel ── */}
          <section>
            <p className="label-meta mb-3">¿Cuál es tu nivel actual?</p>
            <div className="flex gap-2">
              {NIVELES.map(n => (
                <button
                  key={n}
                  onClick={() => setSelNivel(n)}
                  className={`flex-1 py-2 rounded border text-xs font-medium transition-colors ${
                    selNivel === n
                      ? 'border-uvg-green bg-uvg-green text-white'
                      : 'border-uvg-border text-uvg-muted hover:border-uvg-border-strong'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* ── Modalidad ── */}
          <section>
            <p className="label-meta mb-3">¿Cómo preferís las clases?</p>
            <div className="flex gap-2">
              {MODALIDADES.map(m => (
                <button
                  key={m.value}
                  onClick={() => setSelModalidad(m.value)}
                  className={`flex-1 py-2 rounded border text-xs font-medium transition-colors ${
                    selModalidad === m.value
                      ? 'border-uvg-green bg-uvg-green text-white'
                      : 'border-uvg-border text-uvg-muted hover:border-uvg-border-strong'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Horarios ── */}
          <section>
            <p className="label-meta mb-3">¿Cuándo podés?</p>
            <div className="space-y-3">
              {Object.entries(byDay).map(([dia, slots]) => (
                <div key={dia}>
                  <p className="text-xs font-medium text-uvg-muted mb-1.5">{dia}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map(h => {
                      const active = selHorarios.includes(h.id)
                      return (
                        <button
                          key={h.id}
                          onClick={() => toggleHorario(h.id)}
                          className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                            active
                              ? 'border-uvg-green bg-uvg-green-light text-uvg-green'
                              : 'border-uvg-border text-uvg-muted hover:border-uvg-border-strong'
                          }`}
                        >
                          {h.horaInicio}–{h.horaFin}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer fijo con botón */}
        <div className="px-5 py-4 border-t border-uvg-border flex-shrink-0">
          <button
            onClick={apply}
            disabled={saving || selCursos.length === 0}
            className="btn-primary w-full"
          >
            {saving ? 'Buscando...' : `Ver tutores para ${selCursos.length > 0 ? selCursos.join(', ') : '...'}`}
          </button>
        </div>
      </div>
    </>
  )
}
