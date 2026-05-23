import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

type Role = 'ESTUDIANTE' | 'TUTOR'

export default function Register() {
  const [role, setRole] = useState<Role>('ESTUDIANTE')
  const [form, setForm] = useState({
    nombre: '', email: '', password: '',
    carrera: '', semestre: '1', experiencia: '0'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = role === 'ESTUDIANTE'
        ? '/auth/register/estudiante'
        : '/auth/register/tutor'

      const payload = role === 'ESTUDIANTE'
        ? { nombre: form.nombre, email: form.email, password: form.password,
            carrera: form.carrera, semestre: Number(form.semestre) }
        : { nombre: form.nombre, email: form.email, password: form.password,
            experiencia: Number(form.experiencia),
            carrera: form.carrera, semestre: Number(form.semestre) }

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-uvg-green">TutorMatch</h1>
        <p className="text-uvg-muted text-sm mt-1">Universidad del Valle de Guatemala</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="card">
          <h2 className="text-base font-semibold mb-4">Crear cuenta</h2>

          {/* Role tabs */}
          <div className="flex rounded border border-uvg-border mb-5 overflow-hidden text-sm">
            {(['ESTUDIANTE', 'TUTOR'] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 font-medium transition-colors ${
                  role === r
                    ? 'bg-uvg-green text-white'
                    : 'text-uvg-muted hover:bg-gray-50'
                }`}
              >
                {r === 'ESTUDIANTE' ? 'Estudiante' : 'Tutor'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="form-label">Nombre completo</label>
              <input className="form-input" value={form.nombre}
                onChange={e => set('nombre', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-input" placeholder="usuario@uvg.edu.gt"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-input" placeholder="Mínimo 6 caracteres"
                value={form.password} onChange={e => set('password', e.target.value)}
                minLength={6} required />
            </div>

            {role === 'ESTUDIANTE' && (
              <>
                <div>
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
              </>
            )}

            {role === 'TUTOR' && (
              <>
                <div>
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
                <div>
                  <label className="form-label">Años de experiencia dando tutorías</label>
                  <input type="number" className="form-input" min="0" max="30"
                    value={form.experiencia} onChange={e => set('experiencia', e.target.value)} />
                </div>
              </>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-xs text-center text-uvg-muted mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-uvg-green font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
