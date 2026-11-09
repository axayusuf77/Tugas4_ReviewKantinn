import { Plus, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { StallRow } from '../components/StallRow'
import { LoadingRows, StateMessage } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deleteStall, getStallCategories, getStalls } from '../lib/api'
import { toApiError } from '../lib/errors'
import { canCreateStall } from '../lib/roles'
import { useQuery } from '../lib/useQuery'
import type { Stall } from '../types'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

export function StallListPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  // Pencarian, filter, dan halaman disimpan di URL supaya tahan refresh dan tombol back.
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = parsePage(searchParams.get('page'))

  const [searchInput, setSearchInput] = useState(search)
  const [syncedSearch, setSyncedSearch] = useState(search)
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    setSearchInput(search)
  }

  const [pendingDelete, setPendingDelete] = useState<Stall | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(patch)) {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        }
        return next
      })
    },
    [setSearchParams],
  )

  // Tunggu pengguna berhenti mengetik sebelum menembak ke backend.
  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === search) return

    const timer = window.setTimeout(
      () => updateParams({ search: trimmed, page: null }),
      SEARCH_DEBOUNCE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [searchInput, search, updateParams])

  const fetchStalls = useCallback(
    () => getStalls({ search, category, page, limit: PAGE_SIZE }),
    [search, category, page],
  )
  const stalls = useQuery(fetchStalls)
  const categories = useQuery(getStallCategories)

  const filtersActive = search !== '' || category !== ''
  const categoryOptions = categories.data ?? []
  if (category && !categoryOptions.includes(category)) categoryOptions.push(category)

  const total = stalls.data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastShown = Math.min(page * PAGE_SIZE, total)

  function resetFilters() {
    setSearchInput('')
    updateParams({ search: null, category: null, page: null })
  }

  async function confirmDelete() {
    if (!pendingDelete) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteStall(pendingDelete.id)
      toast.success(`Warung “${pendingDelete.name}” sudah dihapus.`)
      setPendingDelete(null)

      const wasLastOnPage = (stalls.data?.data.length ?? 0) === 1
      if (wasLastOnPage && page > 1) updateParams({ page: String(page - 1) })
      else stalls.reload()
      void categories.reload()
    } catch (error) {
      const apiError = toApiError(error)
      setDeleteError(
        apiError.status === 409
          ? 'Warung ini masih dipakai data lain seperti menu atau ulasan, jadi belum bisa dihapus.'
          : apiError.message,
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Warung di kantin</h1>
          <p className="lede">Cari warung, lihat ratingnya, lalu buka detailnya.</p>
        </div>
        {canCreateStall(user) && (
          <Link to="/stalls/new" className="btn btn-primary">
            <Plus aria-hidden="true" size={18} />
            Tambah warung
          </Link>
        )}
      </div>

      <form className="toolbar" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="search">
          <Search aria-hidden="true" size={18} />
          <input
            className="input"
            type="search"
            aria-label="Cari nama warung"
            placeholder="Cari nama warung"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <select
          className="input"
          aria-label="Filter kategori"
          value={category}
          onChange={(event) => updateParams({ category: event.target.value, page: null })}
        >
          <option value="">Semua kategori</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {filtersActive && (
          <button type="button" className="btn" onClick={resetFilters}>
            Hapus filter
          </button>
        )}
      </form>

      {stalls.loading && <LoadingRows rows={PAGE_SIZE} />}

      {stalls.error && (
        <StateMessage
          tone="error"
          title="Daftar warung belum bisa dimuat"
          action={
            <button type="button" className="btn btn-primary" onClick={stalls.reload}>
              Coba lagi
            </button>
          }
        >
          {stalls.error.message}
        </StateMessage>
      )}

      {stalls.data && stalls.data.data.length === 0 && (
        <StateMessage
          tone="empty"
          title={filtersActive ? 'Tidak ada warung yang cocok' : 'Belum ada warung'}
          action={
            filtersActive ? (
              <button type="button" className="btn" onClick={resetFilters}>
                Hapus filter
              </button>
            ) : page > 1 ? (
              <button type="button" className="btn" onClick={() => updateParams({ page: null })}>
                Kembali ke halaman 1
              </button>
            ) : canCreateStall(user) ? (
              <Link to="/stalls/new" className="btn btn-primary">
                Tambah warung pertama
              </Link>
            ) : undefined
          }
        >
          {filtersActive
            ? 'Coba kata kunci lain atau pilih kategori yang berbeda.'
            : page > 1
              ? 'Halaman ini tidak punya data.'
              : 'Warung yang ditambahkan pemilik akan muncul di sini.'}
        </StateMessage>
      )}

      {stalls.data && stalls.data.data.length > 0 && (
        <>
          <p className="count" aria-live="polite">
            Menampilkan {firstShown} sampai {lastShown} dari {total} warung
          </p>
          <ul className="board">
            {stalls.data.data.map((stall) => (
              <StallRow
                key={stall.id}
                stall={stall}
                user={user}
                onDelete={(target) => {
                  setDeleteError(null)
                  setPendingDelete(target)
                }}
              />
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(next) => updateParams({ page: next === 1 ? null : String(next) })}
          />
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus warung ini?"
        confirmLabel="Hapus warung"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        <p>
          <strong>{pendingDelete?.name}</strong> akan dihapus dari database dan tidak bisa
          dikembalikan.
        </p>
      </ConfirmDialog>
    </>
  )
}
