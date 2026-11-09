import axios from 'axios'
import { toApiError } from './errors'
import { clearToken, getToken } from './token'

const fallbackBaseUrl = 'http://localhost:3000'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || fallbackBaseUrl
).replace(/\/+$/, '')

/** Dikirim ke window saat server menolak token (401) pada endpoint yang butuh login. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

// Setiap request membawa token Bearer kalau pengguna sedang login.
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Semua error diseragamkan jadi ApiError. 401 dari endpoint selain login/register
// berarti sesi habis: token dibuang dan aplikasi diberi tahu lewat event.
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : ''
    const isCredentialCall = url.includes('/auth/login') || url.includes('/auth/register')

    if (apiError.status === 401 && !isCredentialCall && getToken()) {
      clearToken()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    return Promise.reject(apiError)
  },
)
