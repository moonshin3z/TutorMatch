import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

interface Curso   { codigo: string; nombre: string; departamento: string }
interface Horario { id: number; dia: string; horaInicio: string; horaFin: string }

const NIVELES = [
  { nombre: 'Básico',      desc: 'Recién empiezo con este tema. Necesito que me expliquen desde cero.' },
  { nombre: 'Intermedio',  desc: 'Tengo la base, pero algunos conceptos no me quedan del todo.' },
  { nombre: 'Avanzado',    desc: 'Entiendo el tema. Quiero reforzar partes específicas.' },
]

const MODALIDADES = [
  { valor: 'PRESENCIAL', label: 'Presencial',            desc: 'Nos reunimos en un lugar en campus o cerca.' },
  { valor: 'VIRTUAL',    label: 'Virtual',               desc: 'Por videollamada, desde donde estés.' },
  { valor: 'AMBAS',      label: 'No tengo preferencia',  desc: 'Cualquiera me funciona.' },
]

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const TOTAL = 4

export default function Onboarding() {
  const { id, onboardingCompleto, setOnboardingCompleto } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep]                       = useState(1)
  const [cursos, setCursos]                   = useState<Curso[]>([])
  const [horarios, setHorarios]               = useState<Horario[]>([])
  const [selectedCursos, setSelectedCursos]   = useState<string[]>([])
  const [selectedNivel, setSelectedNivel]     = useState('')
  const [selectedModalidad, setSelectedModalidad] = useState('')
  const [selectedHorarios, setSelectedHorarios]   = useState<number[]>([])
  const [saving, setSaving]                   = useState(false)

  useEffect(() => {
    if (onboardingCompleto) navigate('/estudiante', { replace: true })
  }, [])

  useEffect(() => {
    api.get('/cursos').then(r => setCursos(r.data))
    api.get('/horarios').then(r => setHorarios(r.data))
  }, [])

  // ── helpers ──────────────────────────────────────────────────────────────
  const toggleCurso = (c: string) =>
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
    step === 2 ? selectedNivel !== '' :
    step === 3 ? selectedModalidad !== '' :
    true

  // ── guardar al finalizar ──────────────────────────────────────────────────
  const finish = async () => {
    setSaving(true)
    try {
      await Promise.all(
        selectedCursos.map(c => api.put(`/estudiantes/${id}/cursos`, { codigo: c }))
      )
      await Promise.all(
        selectedHorarios.map(h => api.put(`/estudiantes/${id}/horarios`, { horarioId: h }))
      )
      if (selectedNivel) {
        await api.put(`/estudiantes/${id}/nivel`, { nivel: selectedNivel })
      }
      await api.put(`/estudiantes/${id}/onboarding`, {
        modalidadPreferida: selectedModalidad || 'AMBAS'
      })
      setOnboardingCompleto(true)
      navigate('/estudiante', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const next = () => step < TOTAL ? setStep(s => s + 1) : finish()
  const back = () => setStep(s => s - 1)

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-uvg-bg flex flex-col">

      {/* Header mínimo con logo */}
      <div className="px-5 pt-6 pb-2 flex items-center justify-between max-w-sm mx-auto w-full">
        <span className="text-uvg-green font-semibold text-base tracking-tight">TutorMatch</span>
        <span className="text-xs text-uvg-muted">{step} de {TOTAL}</span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-uvg-border h-[3px]">
        <div
          className="bg-uvg-green h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / TOTAL) * 100}%` }}
        />
      </div>

      {/* Contenido del paso */}
      <div className="flex-1 flex flex-col px-5 py-8 max-w-sm mx-auto w-full">
        <div key={step} className="animate-fade-up flex-1 flex flex-col">
          {step === 1 && <StepMaterias cursos={cursos} selected={selectedCursos} toggle={toggleCurso} />}
          {step === 2 && <StepNivel selected={selectedNivel} select={setSelectedNivel} />}
          {step === 3 && <StepModalidad selected={selectedModalidad} select={setSelectedModalidad} />}
          {step === 4 && <StepHorarios byDay={horariosByDay} selected={selectedHorarios} toggle={toggleHorario} />}
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <button
            onClick={back}
            className={`btn-ghost ${step === 1 ? 'invisible' : ''}`}
          >
            ← Atrás
          </button>
          <button
            onClick={next}
            disabled={!canContinue || saving}
            className="btn-primary"
          >
            {saving ? 'Guardando...' : step === TOTAL ? 'Ver mis tutores →' : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Paso 1 — Materias ─────────────────────────────────────────────────────

function StepMaterias({ cursos, selected, toggle }: {
  cursos: Curso[]; selected: string[]; toggle: (c: string) => void
}) {
  return (
    <>
      <StepHeader
        title="¿En qué materia necesitas apoyo?"
        sub="Puedes elegir más de una."
      />
      <div className="grid grid-cols-2 gap-2">
        {cursos.map(c => {
          const active = selected.includes(c.codigo)
          return (
            <button
              key={c.codigo}
              onClick={() => toggle(c.codigo)}
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
  )
}

// ── Paso 2 — Nivel ────────────────────────────────────────────────────────

function StepNivel({ selected, select }: {
  selected: string; select: (n: string) => void
}) {
  return (
    <>
      <StepHeader
        title="¿Cómo va tu nivel actual?"
        sub="Elige el que más te representa."
      />
      <div className="flex flex-col gap-3">
        {NIVELES.map(n => {
          const active = selected === n.nombre
          return (
            <button
              key={n.nombre}
              onClick={() => select(n.nombre)}
              className={`text-left p-4 rounded-md border transition-colors ${
                active
                  ? 'border-uvg-green bg-uvg-green-light'
                  : 'border-uvg-border hover:border-uvg-border-strong bg-uvg-surface'
              }`}
            >
              <p className={`text-sm font-semibold ${active ? 'text-uvg-green' : 'text-uvg-text'}`}>
                {n.nombre}
              </p>
              <p className="text-xs text-uvg-muted mt-1 leading-relaxed">{n.desc}</p>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── Paso 3 — Modalidad ────────────────────────────────────────────────────

function StepModalidad({ selected, select }: {
  selected: string; select: (m: string) => void
}) {
  return (
    <>
      <StepHeader
        title="¿Cómo preferís las tutorías?"
        sub="Podés cambiarlo después desde tu perfil."
      />
      <div className="flex flex-col gap-3">
        {MODALIDADES.map(m => {
          const active = selected === m.valor
          return (
            <button
              key={m.valor}
              onClick={() => select(m.valor)}
              className={`text-left p-4 rounded-md border transition-colors ${
                active
                  ? 'border-uvg-green bg-uvg-green-light'
                  : 'border-uvg-border hover:border-uvg-border-strong bg-uvg-surface'
              }`}
            >
              <p className={`text-sm font-semibold ${active ? 'text-uvg-green' : 'text-uvg-text'}`}>
                {m.label}
              </p>
              <p className="text-xs text-uvg-muted mt-1">{m.desc}</p>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── Paso 4 — Horarios ─────────────────────────────────────────────────────

function StepHorarios({ byDay, selected, toggle }: {
  byDay: Record<string, { id: number; dia: string; horaInicio: string; horaFin: string }[]>
  selected: number[]
  toggle: (id: number) => void
}) {
  return (
    <>
      <StepHeader
        title="¿Cuándo podés recibir tutorías?"
        sub="Cuantos más marques, más opciones tenemos para ti."
      />
      <div className="flex flex-col gap-5 overflow-y-auto">
        {Object.entries(byDay).map(([dia, slots]) => (
          <div key={dia}>
            <p className="text-xs font-semibold text-uvg-muted uppercase tracking-wider mb-2">
              {dia}
            </p>
            <div className="flex flex-wrap gap-2">
              {slots.map(h => {
                const active = selected.includes(h.id)
                return (
                  <button
                    key={h.id}
                    onClick={() => toggle(h.id)}
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
  )
}

// ── Header de cada paso ───────────────────────────────────────────────────

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-uvg-text leading-tight tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-uvg-muted mt-2">{sub}</p>
    </div>
  )
}
