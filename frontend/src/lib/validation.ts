import type { StallPayload } from '../types'

// Batas ini sama dengan schema Zod di backend (stallSchema.ts dan authSchema.ts).
// Validasi di browser hanya membantu pengguna; server tetap memeriksa ulang.
export const NAME_MIN = 3
export const NAME_MAX = 100
export const CATEGORY_MAX = 50
export const LOCATION_MAX = 100
export const DESCRIPTION_MAX = 1000

export const USER_NAME_MIN = 3
export const USER_NAME_MAX = 100
export const EMAIL_MAX = 150
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 72

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function firstErrorField<T extends string>(
  errors: Partial<Record<T, string>>,
  order: readonly T[],
): T | null {
  return order.find((field) => errors[field] !== undefined) ?? null
}

/* ------------------------------ Warung ------------------------------ */

export interface StallFormValues {
  name: string
  category: string
  location: string
  description: string
}

export type StallFormField = keyof StallFormValues
export type StallFormErrors = Partial<Record<StallFormField, string>>

export const STALL_FIELD_ORDER: readonly StallFormField[] = [
  'name',
  'category',
  'location',
  'description',
]

export const EMPTY_STALL_FORM: StallFormValues = {
  name: '',
  category: '',
  location: '',
  description: '',
}

export function validateStallForm(values: StallFormValues): StallFormErrors {
  const errors: StallFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Nama warung wajib diisi.'
  } else if (name.length < NAME_MIN) {
    errors.name = `Nama warung minimal ${NAME_MIN} karakter.`
  } else if (name.length > NAME_MAX) {
    errors.name = `Nama warung maksimal ${NAME_MAX} karakter.`
  }

  if (values.category.trim().length > CATEGORY_MAX) {
    errors.category = `Kategori maksimal ${CATEGORY_MAX} karakter.`
  }

  if (values.location.trim().length > LOCATION_MAX) {
    errors.location = `Lokasi maksimal ${LOCATION_MAX} karakter.`
  }

  if (values.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Deskripsi maksimal ${DESCRIPTION_MAX} karakter.`
  }

  return errors
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toStallPayload(values: StallFormValues): StallPayload {
  return {
    name: values.name.trim(),
    category: emptyToNull(values.category),
    location: emptyToNull(values.location),
    description: emptyToNull(values.description),
  }
}

/* ------------------------------- Login ------------------------------ */

export interface LoginFormValues {
  email: string
  password: string
}

export type LoginFormField = keyof LoginFormValues
export type LoginFormErrors = Partial<Record<LoginFormField, string>>

export const LOGIN_FIELD_ORDER: readonly LoginFormField[] = ['email', 'password']

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'Email wajib diisi.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Format email belum benar.'
  }

  if (!values.password) {
    errors.password = 'Password wajib diisi.'
  }

  return errors
}

/* ----------------------------- Registrasi --------------------------- */

export interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type RegisterFormField = keyof RegisterFormValues
export type RegisterFormErrors = Partial<Record<RegisterFormField, string>>

export const REGISTER_FIELD_ORDER: readonly RegisterFormField[] = [
  'name',
  'email',
  'password',
  'confirmPassword',
]

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()

  if (!name) {
    errors.name = 'Nama wajib diisi.'
  } else if (name.length < USER_NAME_MIN) {
    errors.name = `Nama minimal ${USER_NAME_MIN} karakter.`
  } else if (name.length > USER_NAME_MAX) {
    errors.name = `Nama maksimal ${USER_NAME_MAX} karakter.`
  }

  if (!email) {
    errors.email = 'Email wajib diisi.'
  } else if (email.length > EMAIL_MAX) {
    errors.email = `Email maksimal ${EMAIL_MAX} karakter.`
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Format email belum benar.'
  }

  if (!values.password) {
    errors.password = 'Password wajib diisi.'
  } else if (values.password.length < PASSWORD_MIN) {
    errors.password = `Password minimal ${PASSWORD_MIN} karakter.`
  } else if (values.password.length > PASSWORD_MAX) {
    errors.password = `Password maksimal ${PASSWORD_MAX} karakter.`
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Ketik ulang password untuk memastikan.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Konfirmasi password belum sama.'
  }

  return errors
}
