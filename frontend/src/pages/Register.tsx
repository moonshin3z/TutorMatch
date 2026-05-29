import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

type Role = 'ESTUDIANTE' | 'TUTOR'

const ROLES: { value: Role; title: string; desc: string }[] = [
  {
    value: 'ESTUDIANTE',
    title: 'Soy estudiante',
    desc:  'Buscás apoyo con tus cursos. Te recomendamos tutores compatibles con tu horario y nivel.',
  },
  {
    value: 'TUTOR',
    title: 'Soy tutor',
    desc:  'Compartís tu conocimiento. Los estudiantes que necesiten tus materias te van a encontrar.',
  },
]

export default function Register() {
  const [role, setRole] = useState<Role | null>(null)
  const [form, setForm] = useState({
    nombre: '', email: '', password: '',
    carrera: '', semestre: '1', experiencia: '0',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth }           = useAuthStore()
  const navigate              = useNavigate()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setError('')
    setLoading(true)
    try {
      const base = { nombre: form.nombre, email: form.email, password: form.password }
      const payload = role === 'ESTUDIANTE'
        ? { ...base, carrera: form.carrera, semestre: Number(form.semestre) }
        : { ...base, carrera: form.carrera, semestre: Number(form.semestre),
            experiencia: Number(form.experiencia) }

      const endpoint = role === 'ESTUDIANTE'
        ? '/auth/register/estudiante'
        : '/auth/register/tutor'

      const { data } = await api.post(endpoint, payload)
      setAuth(data)
      navigate(role === 'ESTUDIANTE' ? '/onboarding' : '/tutor-setup')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center px-4 py-12">

      {/* Wordmark */}
      <div className="mb-8 text-center">
        <p className="text-xl font-bold text-uvg-green">TutorMatch</p>
        <p className="text-xs text-uvg-muted mt-0.5">Universidad del Valle de Guatemala</p>
      </div>

      <div className="w-full max-w-sm">

        {/* ── Paso 1: elegir rol ── */}
        {!role && (
          <div>
            <h2 className="text-xl font-semibold text-uvg-text mb-1">Crear cuenta</h2>
            <p className="text-sm text-uvg-muted mb-5">¿Qué vas a hacer en TutorMatch?</p>

            <div className="flex flex-col gap-3">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className="text-left p-4 border border-[#E5E5E2] rounded-[8px]
                    bg-white hover:border-[#1F3D2B] transition-colors group"
                >
                  <p className="text-[15px] font-[500] text-uvg-text group-hover:text-uvg-green
                    transition-colors">
                    {r.title}
                  </p>
                  <p className="text-[13px] text-uvg-muted mt-1 leading-snug">{r.desc}</p>
                </button>
              ))}
            </div>

            <p className="text-[13px] text-center text-uvg-muted mt-5">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-uvg-green font-medium hover:underline">
                Ingresar
              </Link>
            </p>
          </div>
        )}

        {/* ── Paso 2: datos según rol ── */}
        {role && (
          <div>
            {/* Back al selector */}
            <button
              onClick={() => setRole(null)}
              className="text-xs text-uvg-muted hover:text-uvg-text mb-5 flex items-center gap-1"
            >
              ← Cambiar tipo de cuenta
            </button>

            <h2 className="text-xl font-semibold text-uvg-text mb-1">
              {role === 'ESTUDIANTE' ? 'Registro de estudiante' : 'Registro de tutor'}
            </h2>
            <p className="text-sm text-uvg-muted mb-5">Completá tus datos para empezar</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="form-label">Nombre completo</label>
                <input className="form-input" value={form.nombre}
                  onChange={e => set('nombre', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Correo electrónico</label>
                <input type="email" className="form-input"
                  placeholder="usuario@uvg.edu.gt"
                  value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  minLength={6} required />
              </div>

              {/* Carrera + semestre — ambos roles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="form-label">Carrera</label>
                  <input className="form-input" placeholder="Ej. Ingeniería en Sistemas"
                    value={form.carrera} onChange={e => set('carrera', e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Semestre</label>
                  <select className="form-input" value={form.semestre}
                    onChange={e => set('semestre', e.target.value)}>
                    {[1,2,3,4,5,6,7,8,9,10].map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </div>
                {role === 'TUTOR' && (
                  <div>
                    <label className="form-label">Años tutorando</label>
                    <input type="number" className="form-input" min="0" max="20"
                      value={form.experiencia}
                      onChange={e => set('experiencia', e.target.value)} />
                  </div>
                )}
              </div>

              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-200
                  rounded px-3 py-2">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-[13px] text-center text-uvg-muted mt-4">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-uvg-green font-medium hover:underline">
                Ingresar
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
