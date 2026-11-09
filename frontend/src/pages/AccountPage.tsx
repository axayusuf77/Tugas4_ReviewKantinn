import { Check, X } from 'lucide-react'
import { Spinner, StateMessage } from '../components/ui'
import { getMe } from '../lib/api'
import { ROLE_LABEL } from '../lib/roles'
import { useQuery } from '../lib/useQuery'
import type { UserRole } from '../types'

interface Permission {
  label: string
  allowed: Record<UserRole, boolean | string>
}

const PERMISSIONS: Permission[] = [
  {
    label: 'Melihat daftar dan detail warung',
    allowed: { admin: true, owner: true, customer: true },
  },
  {
    label: 'Menambah warung',
    allowed: { admin: true, owner: true, customer: false },
  },
  {
    label: 'Mengubah warung',
    allowed: { admin: 'Semua warung', owner: 'Hanya warung milik sendiri', customer: false },
  },
  {
    label: 'Menghapus warung',
    allowed: { admin: true, owner: false, customer: false },
  },
]

export function AccountPage() {
  // Data dibaca ulang dari server (GET /auth/me), bukan dari ingatan browser.
  const { loading, data: me, error, reload } = useQuery(getMe)

  if (loading) {
    return (
      <div className="page-center">
        <Spinner label="Memuat data akun" />
      </div>
    )
  }

  if (error) {
    return (
      <StateMessage
        tone="error"
        title="Data akun belum bisa dimuat"
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

  if (!me) return null

  return (
    <div className="narrow">
      <h1 className="page-title">Akunku</h1>
      <p className="lede">Data ini diambil dari server lewat GET /auth/me.</p>

      <div className="panel">
        <dl className="facts">
          <div>
            <dt>Nama</dt>
            <dd>{me.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd className="break">{me.email}</dd>
          </div>
          <div>
            <dt>Peran</dt>
            <dd>
              <span className="role-badge role-badge-dark">{ROLE_LABEL[me.role]}</span>
            </dd>
          </div>
          <div>
            <dt>Nomor akun</dt>
            <dd>{me.id}</dd>
          </div>
        </dl>

        <h2 className="section-title">Yang bisa kamu lakukan</h2>
        <ul className="perm-list">
          {PERMISSIONS.map((permission) => {
            const value = permission.allowed[me.role]
            const allowed = value !== false

            return (
              <li key={permission.label} className={allowed ? 'perm perm-yes' : 'perm perm-no'}>
                {allowed ? (
                  <Check aria-hidden="true" size={18} />
                ) : (
                  <X aria-hidden="true" size={18} />
                )}
                <span>
                  {permission.label}
                  <span className="sr-only">{allowed ? ': bisa' : ': tidak bisa'}</span>
                  {typeof value === 'string' && <small className="perm-note">{value}</small>}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
