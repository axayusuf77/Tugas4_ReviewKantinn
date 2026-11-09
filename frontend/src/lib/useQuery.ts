import { useCallback, useEffect, useState } from 'react'
import { ApiError, toApiError } from './errors'

interface Result<T> {
  source: unknown
  token: number
  data?: T
  error?: ApiError
}

/**
 * Pemuat data sederhana. Status "loading" diturunkan dari perbandingan
 * fetcher/token saat ini dengan hasil terakhir, jadi tidak ada setState
 * sinkron di dalam effect. Kirim fetcher yang dibungkus useCallback.
 */
export function useQuery<T>(fetcher: () => Promise<T>) {
  const [token, setToken] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    let active = true

    fetcher().then(
      (data) => {
        if (active) setResult({ source: fetcher, token, data })
      },
      (error: unknown) => {
        if (active) setResult({ source: fetcher, token, error: toApiError(error) })
      },
    )

    return () => {
      active = false
    }
  }, [fetcher, token])

  const reload = useCallback(() => setToken((value) => value + 1), [])
  const settled = result !== null && result.source === fetcher && result.token === token

  return {
    loading: !settled,
    data: settled ? result.data : undefined,
    error: settled ? result.error : undefined,
    reload,
  }
}
