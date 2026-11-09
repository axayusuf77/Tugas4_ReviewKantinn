import axios from 'axios'

export interface ApiErrorDetail {
  field: string
  message: string
}

/**
 * Satu bentuk error untuk seluruh aplikasi.
 * status 0 berarti request tidak sampai ke server (jaringan atau timeout).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[]

  constructor(
    status: number,
    code: string,
    message: string,
    details: ApiErrorDetail[] = [],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toDetails(value: unknown): ApiErrorDetail[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (
      isObject(item) &&
      typeof item.field === 'string' &&
      typeof item.message === 'string'
    ) {
      return [{ field: item.field, message: item.message }]
    }
    return []
  })
}

function codeFromStatus(status: number): string {
  if (status === 400) return 'VALIDATION_ERROR'
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status >= 500) return 'SERVER_ERROR'
  return 'REQUEST_FAILED'
}

function fallbackMessage(status: number): string {
  if (status === 401) return 'Sesi login tidak valid atau sudah habis.'
  if (status === 403) return 'Akunmu tidak punya izin untuk aksi ini.'
  if (status === 404) return 'Data yang dicari tidak ditemukan.'
  if (status >= 500) return 'Server sedang bermasalah. Coba lagi sebentar lagi.'
  return 'Permintaan gagal diproses.'
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const response = error.response

    if (!response) {
      const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'

      return timedOut
        ? new ApiError(
            0,
            'TIMEOUT',
            'Server terlalu lama menjawab. Coba lagi sebentar lagi.',
          )
        : new ApiError(
            0,
            'NETWORK_ERROR',
            'Tidak bisa terhubung ke server. Pastikan backend sudah berjalan.',
          )
    }

    const body = isObject(response.data) ? response.data : null

    return new ApiError(
      response.status,
      codeFromStatus(response.status),
      typeof body?.message === 'string' ? body.message : fallbackMessage(response.status),
      toDetails(body?.errors),
    )
  }

  if (error instanceof Error && error.message) {
    return new ApiError(0, 'UNKNOWN_ERROR', error.message)
  }

  return new ApiError(0, 'UNKNOWN_ERROR', 'Terjadi kesalahan yang tidak diketahui.')
}

export function errorMessage(error: unknown): string {
  return toApiError(error).message
}

/** Ubah daftar errors dari backend ({ field, message }) jadi map field -> pesan. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {}

  for (const detail of toApiError(error).details) {
    if (result[detail.field] === undefined) {
      result[detail.field] = detail.message
    }
  }

  return result
}
