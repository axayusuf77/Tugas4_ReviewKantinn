import { MapPin, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Rating, Spinner, StateMessage } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deleteStall, getStall } from '../lib/api'
import { toApiError } from '../lib/errors'
import { canDeleteStall, canEditStall } from '../lib/roles'
import { useQuery } from '../lib/useQuery'
import { NotFoundPage } from './NotFoundPage'

function parseId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const id = Number(value)
  return id > 0 ? id : null
}

export function StallDetailPage() {
  const { id: rawId } = useParams()
  const stallId = parseId(rawId)

  if (stallId === null) return <NotFoundPage />
  return <StallDetail stallId={stallId} />
}

function StallDetail({ stallId }: { stallId: number }) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const fetchStall = useCallback(() => getStall(stallId), [stallId])
  const { loading, data: stall, error, reload } = useQuery(fetchStall)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function confirmDelete() {
    if (!stall) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteStall(stall.id)
      toast.success(`Warung “${stall.name}” sudah dihapus.`)
      navigate('/')
    } catch (failure) {
      const apiError = toApiError(failure)
      setDeleteError(
        apiError.status === 409
          ? 'Warung ini masih dipakai data lain seperti menu atau ulasan, jadi belum bisa dihapus.'
          : apiError.message,
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-center">
        <Spinner label="Memuat detail warung" />
      </div>
    )
  }

  if (error?.status === 404) {
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
        Warung dengan nomor {stallId} tidak ada. Mungkin sudah dihapus.
      </StateMessage>
    )
  }

  if (error) {
    return (
      <StateMessage
        tone="error"
        title="Detail warung belum bisa dimuat"
        action={
          <button type="button" className="btn btn-primary" onClick={reload}>
            Coba lagi
          </button>
        }
      >
        {error.message}
      </StateMessage>
    )
  }

  if (!stall) return null

  const mine = user?.role === 'owner' && user.id === stall.ownerId

  return (
    <article>
      <p className="crumb">
        <Link to="/">Semua warung</Link>
      </p>

      <header className="sign">
        <h1>{stall.name}</h1>
        <p className="sign-tags">
          {stall.category && <span className="tag">{stall.category}</span>}
          {stall.isPopular && <span className="tag tag-pop">Populer</span>}
          {mine && <span className="tag">Warung milikmu</span>}
        </p>
      </header>

      <div className="panel">
        <dl className="facts">
          <div>
            <dt>Lokasi</dt>
            <dd>
              {stall.location ? (
                <span className="row-place">
                  <MapPin aria-hidden="true" size={16} />
                  {stall.location}
                </span>
              ) : (
                <span className="muted">Belum diisi</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Rating</dt>
            <dd>
              <Rating value={stall.avgRating} count={stall.reviewCount} />
            </dd>
          </div>
        </dl>

        <h2 className="section-title">Tentang warung ini</h2>
        {stall.description ? (
          <p className="prose">{stall.description}</p>
        ) : (
          <p className="muted">Pemilik belum menulis deskripsi.</p>
        )}

        {(canEditStall(user, stall) || canDeleteStall(user)) && (
          <div className="detail-actions">
            {canEditStall(user, stall) && (
              <Link to={`/stalls/${stall.id}/edit`} className="btn btn-primary">
                <Pencil aria-hidden="true" size={18} />
                Ubah warung
              </Link>
            )}
            {canDeleteStall(user) && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setDeleteError(null)
                  setConfirmOpen(true)
                }}
              >
                <Trash2 aria-hidden="true" size={18} />
                Hapus warung
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus warung ini?"
        confirmLabel="Hapus warung"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      >
        <p>
          <strong>{stall.name}</strong> akan dihapus dari database dan tidak bisa dikembalikan.
        </p>
      </ConfirmDialog>
    </article>
  )
}
