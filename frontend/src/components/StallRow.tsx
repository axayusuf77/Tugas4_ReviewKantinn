import { MapPin, Pencil, Trash2, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { canDeleteStall, canEditStall } from '../lib/roles'
import type { Stall, User } from '../types'
import { Rating } from './ui'

interface StallRowProps {
  stall: Stall
  user: User | null
  onDelete: (stall: Stall) => void
}

/** Satu kartu warung: blok warna di atas, lalu nama, rating, lokasi, dan kategori. */
export function StallRow({ stall, user, onDelete }: StallRowProps) {
  const showEdit = canEditStall(user, stall)
  const showDelete = canDeleteStall(user)

  return (
    <li className="row">
      <div className="row-thumb" data-tone={stall.id % 5} aria-hidden="true">
        <Utensils size={34} />
        {stall.isPopular && <span className="tag tag-pop row-badge">Terlaris</span>}
      </div>

      <div className="row-body">
        <Link to={`/stalls/${stall.id}`} className="row-line">
          <span className="row-name">{stall.name}</span>
        </Link>
        <Rating value={stall.avgRating} count={stall.reviewCount} />

        <p className="row-sub">
          {stall.location && (
            <span className="row-place">
              <MapPin aria-hidden="true" size={14} />
              {stall.location}
            </span>
          )}
          {stall.category && <span className="tag">{stall.category}</span>}
        </p>
      </div>

      {(showEdit || showDelete) && (
        <div className="row-actions">
          {showEdit && (
            <Link
              to={`/stalls/${stall.id}/edit`}
              className="icon-btn"
              aria-label={`Ubah ${stall.name}`}
              title="Ubah"
            >
              <Pencil aria-hidden="true" size={18} />
            </Link>
          )}
          {showDelete && (
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              aria-label={`Hapus ${stall.name}`}
              title="Hapus"
              onClick={() => onDelete(stall)}
            >
              <Trash2 aria-hidden="true" size={18} />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
