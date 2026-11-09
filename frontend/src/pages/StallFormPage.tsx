import { useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StallForm, type SubmitResult } from '../components/StallForm'
import { Spinner, StateMessage } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { createStall, getStall, getStallCategories, updateStall } from '../lib/api'
import { getFieldErrors, toApiError } from '../lib/errors'
import { useQuery } from '../lib/useQuery'
import { EMPTY_STALL_FORM, type StallFormValues } from '../lib/validation'
import type { Stall, StallPayload } from '../types'
import { NotFoundPage } from './NotFoundPage'

interface StallFormPageProps {
  mode: 'create' | 'edit'
}

function parseId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const id = Number(value)
  return id > 0 ? id : null
}

function toFormValues(stall: Stall): StallFormValues {
  return {
    name: stall.name,
    category: stall.category ?? '',
    location: stall.location ?? '',
    description: stall.description ?? '',
  }
}

export function StallFormPage({ mode }: StallFormPageProps) {
  const { id: rawId } = useParams()
  const stallId = mode === 'edit' ? parseId(rawId) : null

  if (mode === 'edit' && stallId === null) return <NotFoundPage />
  return <StallFormScreen mode={mode} stallId={stallId} />
}

function StallFormScreen({ mode, stallId }: { mode: 'create' | 'edit'; stallId: number | null }) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const fetchStall = useCallback(
    () => (stallId === null ? Promise.resolve(null) : getStall(stallId)),
    [stallId],
  )
  const stallQuery = useQuery(fetchStall)
  const categoriesQuery = useQuery(getStallCategories)

  async function handleSubmit(payload: StallPayload): Promise<SubmitResult> {
    try {
      const saved =
        mode === 'create' || stallId === null
          ? await createStall(payload)
          : await updateStall(stallId, payload)

      toast.success(
        mode === 'create'
          ? `Warung “${saved.name}” sudah ditambahkan.`
          : `Perubahan “${saved.name}” sudah disimpan.`,
      )
      navigate(`/stalls/${saved.id}`)
      return {}
    } catch (error) {
      const apiError = toApiError(error)

      if (apiError.status === 400 && apiError.details.length > 0) {
        return {
          fieldErrors: getFieldErrors(apiError),
          formError: 'Ada isian yang belum sesuai. Periksa kolom yang ditandai.',
        }
      }

      // 401 sudah ditangani global (sesi habis). 403, 404, 500 tampil apa adanya.
      return { formError: apiError.message }
    }
  }

  if (stallQuery.loading) {
    return (
      <div className="page-center">
        <Spinner label="Memuat data warung" />
      </div>
    )
  }

  if (stallQuery.error?.status === 404) {
    return (
      <StateMessage
        tone="empty"
        title="Warung tidak ditemukan"
        action={
          <Link to="/" className="btn btn-primary">
            Kembali ke daftar warung
          </Link>
        }
      >
        Warung yang mau diubah tidak ada. Mungkin sudah dihapus.
      </StateMessage>
    )
  }

  if (stallQuery.error) {
    return (
      <StateMessage
        tone="error"
        title="Data warung belum bisa dimuat"
        action={
          <button type="button" className="btn btn-primary" onClick={stallQuery.reload}>
            Coba lagi
          </button>
        }
      >
        {stallQuery.error.message}
      </StateMessage>
    )
  }

  const stall = stallQuery.data ?? null

  // Pemilik lain tetap boleh membuka form, tapi diberi tahu bahwa server akan menolak.
  const notOwner = mode === 'edit' && stall && user?.role === 'owner' && stall.ownerId !== user.id

  return (
    <div className="narrow">
      <p className="crumb">
        <Link to={stall ? `/stalls/${stall.id}` : '/'}>{stall ? stall.name : 'Semua warung'}</Link>
      </p>
      <h1 className="page-title">{mode === 'create' ? 'Tambah warung' : 'Ubah warung'}</h1>
      <p className="lede">
        {mode === 'create'
          ? 'Warung baru otomatis jadi milik akunmu.'
          : 'Perubahan langsung disimpan ke database.'}
      </p>

      <StallForm
        key={stall?.id ?? 'new'}
        initial={stall ? toFormValues(stall) : EMPTY_STALL_FORM}
        submitLabel={mode === 'create' ? 'Simpan warung' : 'Simpan perubahan'}
        cancelTo={stall ? `/stalls/${stall.id}` : '/'}
        categories={categoriesQuery.data ?? []}
        notice={
          notOwner
            ? 'Warung ini terdaftar atas pemilik lain. Server akan menolak perubahan dari akunmu.'
            : undefined
        }
        onSubmit={handleSubmit}
      />
    </div>
  )
}
