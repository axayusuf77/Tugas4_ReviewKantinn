/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import * as api from '../lib/api'
import { UNAUTHORIZED_EVENT } from '../lib/http'
import { clearToken, getToken, setToken } from '../lib/token'
import type { RegisterPayload, User } from '../types'
import { useToast } from './ToastContext'

interface AuthContextValue {
  user: User | null
  /** false selama sesi lama masih diperiksa lewat GET /auth/me. */
  isReady: boolean
  login: (email: string, password: string) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(() => getToken() === null)

  // Saat aplikasi dibuka: kalau ada token tersimpan, tanya server siapa pemiliknya.
  useEffect(() => {
    if (getToken() === null) return

    let active = true

    api.getMe().then(
      (current) => {
        if (!active) return
        setUser(current)
        setIsReady(true)
      },
      () => {
        if (!active) return
        clearToken()
        setUser(null)
        setIsReady(true)
      },
    )

    return () => {
      active = false
    }
  }, [])

  // Server menjawab 401 di tengah pemakaian: sesi dianggap berakhir.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      toast.error('Sesi login sudah habis. Silakan masuk lagi.')
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [toast])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password })
    setToken(result.token)
    setUser(result.user)
    return result.user
  }, [])

  const register = useCallback((payload: RegisterPayload) => api.register(payload), [])

  // Backend tidak punya endpoint logout: sesi berakhir dengan membuang token di browser.
  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isReady, login, register, logout }),
    [user, isReady, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider.')
  return context
}
