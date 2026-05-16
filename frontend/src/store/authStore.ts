import { create } from 'zustand'

interface AuthState {
  token: string | null
  role: 'ESTUDIANTE' | 'TUTOR' | null
  id: number | null
  nombre: string | null
  email: string | null
  setAuth: (data: { token: string; role: string; id: number; nombre: string; email: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role') as 'ESTUDIANTE' | 'TUTOR' | null,
  id: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null,
  nombre: localStorage.getItem('nombre'),
  email: localStorage.getItem('email'),

  setAuth: ({ token, role, id, nombre, email }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('userId', String(id))
    localStorage.setItem('nombre', nombre)
    localStorage.setItem('email', email)
    set({ token, role: role as 'ESTUDIANTE' | 'TUTOR', id, nombre, email })
  },

  logout: () => {
    localStorage.clear()
    set({ token: null, role: null, id: null, nombre: null, email: null })
  }
}))
