export type UserRole = 'admin' | 'owner' | 'customer'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface Stall {
  id: number
  ownerId: number
  name: string
  category: string | null
  location: string | null
  description: string | null
  avgRating: number
  reviewCount: number
  isPopular: boolean
}

export interface PageMeta {
  page: number
  limit: number
  total: number
}

export interface StallQuery {
  search?: string
  category?: string
  page?: number
  limit?: number
}

/** Isi body POST/PUT /stalls. ownerId sengaja tidak ada: server mengambilnya dari token. */
export interface StallPayload {
  name: string
  category: string | null
  location: string | null
  description: string | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginResult {
  token: string
  tokenType: 'Bearer'
  expiresIn: string
  user: User
}
