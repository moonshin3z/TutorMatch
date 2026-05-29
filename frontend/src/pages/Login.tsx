import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data)
      if (data.role === 'TUTOR') navigate('/tutor')
      else navigate(data.onboardingCompleto ? '/estudiante' : '/onboarding')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col md:flex-row">

      {/* Panel izquierdo — solo visible en desktop */}
      <div className="hidden md:flex md:w-[45%] flex-col justify-between
        bg-[#1F3D2B] text-white p-12">
        <div>
          <p className="text-2xl font-semibold tracking-tight">TutorMatch</p>
          <p className="text-[#A8C4B0] text-sm mt-1">Universidad del Valle de Guatemala</p>
        </div>

        <div className="space-y-8">
          <h1 className="text-[32px] font-semibold leading-tight">
            Encontrá al tutor<br />que te faltaba.
          </h1>
          <ul className="space-y-4 text-[15px] text-[#C5D9CC]">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-[#6CBF8A]">●</span>
              Match por cursos, horarios y nivel — no por popularidad
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-[#6CBF8A]">●</span>
              Reseñas verificadas, solo de quien realmente tomó clases
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-[#6CBF8A]">●</span>
              Grafo real de conexiones entre estudiantes y tutores
            </li>
          </ul>
        </div>

        <p className="text-[#6B9B78] text-xs">
          CC2003 · Algoritmos y Estructuras de Datos · 2026
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo mobile */}
        <div className="mb-8 text-center md:hidden">
          <p className="text-xl font-bold text-uvg-green">TutorMatch</p>
          <p className="text-xs text-uvg-muted mt-0.5">Universidad del Valle de Guatemala</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold text-uvg-text mb-1">Bienvenido de vuelta</h2>
          <p className="text-sm text-uvg-muted mb-6">Ingresá con tu correo UVG</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="usuario@uvg.edu.gt"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                autoComplete="current-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-600 bg-red-50 border border-red-200
                rounded px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-[13px] text-center text-uvg-muted mt-5">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-uvg-green font-medium hover:underline">
              Registrate aquí
            </Link>
          </p>

          {/* Credenciales de prueba — solo en desarrollo */}
          <details className="mt-6 border border-uvg-border rounded-md text-xs text-uvg-muted">
            <summary className="px-3 py-2 cursor-pointer hover:text-uvg-text select-none">
              Credenciales de prueba
            </summary>
            <div className="px-3 pb-3 pt-1 space-y-1 font-mono">
              <p>ana@uvg.edu.gt / pass1234 <span className="text-uvg-subtle">(estudiante)</span></p>
              <p>lilian@uvg.edu.gt / pass1234 <span className="text-uvg-subtle">(tutora)</span></p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
