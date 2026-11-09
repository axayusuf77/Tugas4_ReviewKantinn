import { MapPin, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { canDeleteStall, canEditStall } from '../lib/roles'
import type { Stall, User } from '../types'
import { Rating } from './ui'

interface StallRowProps {
  stall: Stall
  user: User | null
  onDelete: (stall: Stall) => void
}

/** Satu baris di papan menu: nama, garis titik-titik, lalu rating. */
export function StallRow({ stall, user, onDelete }: StallRowProps) {
  const showEdit = canEditStall(user, stall)
  const showDelete = canDeleteStall(user)

  return (
    <li className="row">
      <div className="row-body">
        <Link to={`/stalls/${stall.id}`} className="row-line">
          <span className="row-name">{stall.name}</span>
          {stall.isPopular && <span className="tag tag-pop">Populer</span>}
          <span className="leader" aria-hidden="true" />
          <Rating value={stall.avgRating} count={stall.reviewCount} />
        </Link>

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
