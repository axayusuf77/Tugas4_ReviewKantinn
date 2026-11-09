import { Link } from 'react-router-dom'
import { StateMessage } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../lib/roles'

export function ForbiddenPage() {
  const { user } = useAuth()

  return (
    <StateMessage
      tone="error"
      title="Halaman ini bukan untuk akunmu"
      action={
        <Link to="/" className="btn btn-primary">
          Kembali ke daftar warung
        </Link>
      }
    >
      {user
        ? `Akun dengan peran ${ROLE_LABEL[user.role]} tidak boleh membuka halaman ini. Hanya owner dan admin yang bisa mengelola warung.`
        : 'Masuk dulu dengan akun yang punya izin.'}
    </StateMessage>
  )
}
