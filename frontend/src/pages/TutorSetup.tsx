import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

interface Curso   { codigo: string; nombre: string }
interface Horario { id: number; dia: string; horaInicio: string; horaFin: string }

const TOTAL = 3
const DAYS_ORDER = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MODALIDADES = [
  { valor: 'PRESENCIAL', label: 'Presencial',           desc: 'Nos reunimos en campus o cerca.' },
  { valor: 'VIRTUAL',    label: 'Virtual',              desc: 'Por videollamada, desde donde estés.' },
  { valor: 'AMBAS',      label: 'Sin preferencia',      desc: 'Me adapto a lo que le convenga al estudiante.' },
]

export default function TutorSetup() {
  const { id, nombre } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep]                         = useState(1)
  const [cursos, setCursos]                     = useState<Curso[]>([])
  const [horarios, setHorarios]                 = useState<Horario[]>([])
  const [selectedCursos, setSelectedCursos]     = useState<string[]>([])
  const [bio, setBio]                           = useState('')
  const [precio, setPrecio]                     = useState('')
  const [modalidad, setModalidad]               = useState('')
  const [selectedHorarios, setSelectedHorarios] = useState<number[]>([])
  const [saving, setSaving]                     = useState(false)

  useEffect(() => {
    api.get('/cursos').then(r => setCursos(r.data))
    api.get('/horarios').then(r => setHorarios(r.data))
  }, [])

  const toggleCurso   = (c: string) =>
    setSelectedCursos(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const toggleHorario = (h: number) =>
    setSelectedHorarios(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h])

  const horariosByDay = DAYS_ORDER.reduce((acc, dia) => {
    const slots = horarios.filter(h => h.dia === dia)
    if (slots.length) acc[dia] = slots
    return acc
  }, {} as Record<string, Horario[]>)

  const canContinue =
    step === 1 ? selectedCursos.length > 0 :
    step === 2 ? modalidad !== '' :
    true

  const finish = async () => {
    setSaving(true)
    try {
      await Promise.all(
        selectedCursos.map(c => api.put(`/tutores/${id}/cursos`, { codigo: c }))
      )
      await Promise.all(
        selectedHorarios.map(h => api.put(`/tutores/${id}/horarios`, { horarioId: h }))
      )
      await api.put(`/tutores/${id}/perfil`, {
        bio:      bio.trim() || null,
        precio:   precio ? Number(precio) : null,
        modalidad: modalidad || null,
      })
      navigate('/tutor', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const next = () => step < TOTAL ? setStep(s => s + 1) : finish()
  const skip = () => navigate('/tutor', { replace: true })

  return (
    <div className="min-h-screen bg-uvg-bg flex flex-col">

      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center justify-between max-w-sm mx-auto w-full">
        <span className="text-uvg-green font-semibold text-base tracking-tight">TutorMatch</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-uvg-muted">{step} de {TOTAL}</span>
          <button onClick={skip} className="text-xs text-uvg-subtle hover:text-uvg-muted">
            Saltar →
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-uvg-border h-[3px]">
        <div
          className="bg-uvg-green h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / TOTAL) * 100}%` }}
        />
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col px-5 py-8 max-w-sm mx-auto w-full">
        <div key={step} className="animate-fade-up flex-1 flex flex-col">

          {/* ── Paso 1: Materias ── */}
          {step === 1 && (
            <>
              <StepHeader
                title={`Hola, ${(nombre ?? '').split(' ')[0]}. ¿Qué materias podés enseñar?`}
                sub="Seleccioná todas las que domines bien."
              />
              <div className="grid grid-cols-2 gap-2">
                {cursos.map(c => {
                  const active = selectedCursos.includes(c.codigo)
                  return (
                    <button
                      key={c.codigo}
                      onClick={() => toggleCurso(c.codigo)}
                      className={`text-left p-3 rounded-md border transition-colors ${
                        active
                          ? 'border-uvg-green bg-uvg-green-light'
                          : 'border-uvg-border hover:border-uvg-border-strong bg-uvg-surface'
                      }`}
                    >
                      <p className={`text-xs font-semibold ${active ? 'text-uvg-green' : 'text-uvg-text'}`}>
                        {c.codigo}
                      </p>
                      <p className="text-xs text-uvg-muted mt-0.5 leading-snug">{c.nombre}</p>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ── Paso 2: Perfil y modalidad ── */}
          {step === 2 && (
            <>
              <StepHeader
                title="Contanos cómo enseñás"
                sub="Esto es lo primero que ven los estudiantes."
              />
              <div className="flex flex-col gap-4">
                <div>
                  <label className="form-label">Presentación breve</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    maxLength={300}
                    placeholder="Ej: Ing. en Sistemas, 5to semestre. Me especializo en algoritmos y explico paso a paso..."
                    className="form-input resize-none"
                  />
                  <p className="text-2xs text-uvg-subtle text-right mt-1">{bio.length}/300</p>
                </div>

                <div>
                  <label className="form-label">Precio por hora (Q) — opcional</label>
                  <input
                    type="number"
                    min="0"
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    placeholder="Ej. 75"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Modalidad de clases</label>
                  <div className="flex flex-col gap-2 mt-1">
                    {MODALIDADES.map(m => {
                      const active = modalidad === m.valor
                      return (
                        <button
                          key={m.valor}
                          type="button"
                          onClick={() => setModalidad(m.valor)}
                          className={`text-left p-3 rounded-md border transition-colors ${
                            active
                              ? 'border-uvg-green bg-uvg-green-light'
                              : 'border-uvg-border hover:border-uvg-border-strong bg-uvg-surface'
                          }`}
                        >
                          <p className={`text-sm font-semibold ${active ? 'text-uvg-green' : 'text-uvg-text'}`}>
                            {m.label}
                          </p>
                          <p className="text-xs text-uvg-muted mt-0.5">{m.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Paso 3: Disponibilidad ── */}
          {step === 3 && (
            <>
              <StepHeader
                title="¿Cuándo estás disponible?"
                sub="Cuantos más bloques marques, más estudiantes podés alcanzar."
              />
              <div className="flex flex-col gap-5 overflow-y-auto">
                {Object.entries(horariosByDay).map(([dia, slots]) => (
                  <div key={dia}>
                    <p className="text-xs font-semibold text-uvg-muted uppercase tracking-wider mb-2">
                      {dia}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(h => {
                        const active = selectedHorarios.includes(h.id)
                        return (
                          <button
                            key={h.id}
                            onClick={() => toggleHorario(h.id)}
                            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                              active
                                ? 'border-uvg-green bg-uvg-green-light text-uvg-green'
                                : 'border-uvg-border hover:border-uvg-border-strong text-uvg-muted bg-uvg-surface'
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
            </>
          )}
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : skip()}
            className={`btn-ghost ${step === 1 ? 'text-uvg-subtle' : ''}`}
          >
            {step === 1 ? 'Saltar todo' : '← Atrás'}
          </button>
          <button
            onClick={next}
            disabled={!canContinue || saving}
            className="btn-primary"
          >
            {saving ? 'Guardando...' : step === TOTAL ? 'Ir a mi dashboard →' : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-uvg-text leading-tight tracking-tight">{title}</h1>
      <p className="text-sm text-uvg-muted mt-2">{sub}</p>
    </div>
  )
}
