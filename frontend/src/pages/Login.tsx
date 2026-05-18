import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo area */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-uvg-green">TutorMatch</h1>
        <p className="text-uvg-muted text-sm mt-1">Universidad del Valle de Guatemala</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="card">
          <h2 className="text-base font-semibold mb-5">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
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
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-xs text-center text-uvg-muted mt-4">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-uvg-green font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-uvg-muted mt-4">
          Credenciales de prueba: <strong>ana@uvg.edu.gt</strong> / <strong>pass1234</strong>
        </p>
      </div>
    </div>
  )
}
