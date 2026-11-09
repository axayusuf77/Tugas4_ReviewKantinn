import type { Stall, User, UserRole } from '../types'

// Aturan ini hanya menentukan apa yang DITAMPILKAN. Yang menentukan boleh atau
// tidaknya tetap server: 401 dan 403 dari backend selalu ditangani frontend.

export function canCreateStall(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'owner'
}

export function canEditStall(user: User | null, stall: Stall): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.role === 'owner' && stall.ownerId === user.id
}

export function canDeleteStall(user: User | null): boolean {
  return user?.role === 'admin'
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  owner: 'Owner',
  customer: 'Customer',
}
