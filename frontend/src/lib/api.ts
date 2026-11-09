import type { AxiosResponse } from 'axios'
import type {
  LoginPayload,
  LoginResult,
  PageMeta,
  RegisterPayload,
  Stall,
  StallPayload,
  StallQuery,
  User,
} from '../types'
import { ApiError } from './errors'
import { http } from './http'

export { API_BASE_URL } from './http'

interface SuccessEnvelope<T> {
  status: 'success'
  message?: string
  meta?: PageMeta
  data: T
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Pastikan respons sesuai format backend: { status: 'success', data }. */
function unwrap<T>(response: AxiosResponse<unknown>): SuccessEnvelope<T> {
  const payload = response.data

  if (!isObject(payload) || payload.status !== 'success' || !('data' in payload)) {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Format respons server tidak sesuai kesepakatan.',
    )
  }

  return payload as unknown as SuccessEnvelope<T>
}

/* ------------------------------ Warung ------------------------------ */

let categoriesCache: Promise<string[]> | null = null

export async function getStalls(
  query: StallQuery = {},
): Promise<{ data: Stall[]; meta: PageMeta }> {
  const params: Record<string, string | number> = {}
  if (query.search) params.search = query.search
  if (query.category) params.category = query.category
  if (query.page) params.page = query.page
  if (query.limit) params.limit = query.limit

  const envelope = unwrap<Stall[]>(await http.get('/stalls', { params }))

  if (!Array.isArray(envelope.data) || !envelope.meta) {
    throw new ApiError(200, 'INVALID_RESPONSE', 'Daftar warung tidak valid.')
  }

  return { data: envelope.data, meta: envelope.meta }
}

export async function getStall(id: number): Promise<Stall> {
  return unwrap<Stall>(await http.get(`/stalls/${id}`)).data
}

export async function createStall(payload: StallPayload): Promise<Stall> {
  const stall = unwrap<Stall>(await http.post('/stalls', payload)).data
  categoriesCache = null
  return stall
}

export async function updateStall(id: number, payload: StallPayload): Promise<Stall> {
  const stall = unwrap<Stall>(await http.put(`/stalls/${id}`, payload)).data
  categoriesCache = null
  return stall
}

export async function deleteStall(id: number): Promise<Stall> {
  const stall = unwrap<Stall>(await http.delete(`/stalls/${id}`)).data
  categoriesCache = null
  return stall
}

/**
 * Backend belum punya endpoint khusus kategori, jadi daftar kategori diambil
 * dari data warung (maksimal 100 per request sesuai batas backend).
 */
export function getStallCategories(): Promise<string[]> {
  if (!categoriesCache) {
    categoriesCache = getStalls({ limit: 100 })
      .then(({ data }) => {
        const unique = new Set<string>()
        for (const stall of data) {
          if (stall.category) unique.add(stall.category)
        }
        return [...unique].sort((a, b) => a.localeCompare(b, 'id'))
      })
      .catch((error: unknown) => {
        categoriesCache = null
        throw error
      })
  }

  return categoriesCache
}

/* ------------------------------- Auth ------------------------------- */

export async function register(payload: RegisterPayload): Promise<User> {
  return unwrap<{ user: User }>(await http.post('/auth/register', payload)).data.user
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  return unwrap<LoginResult>(await http.post('/auth/login', payload)).data
}

export async function getMe(): Promise<User> {
  return unwrap<User>(await http.get('/auth/me')).data
}
