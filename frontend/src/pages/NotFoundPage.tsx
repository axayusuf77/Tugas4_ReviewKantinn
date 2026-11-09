import { Link } from 'react-router-dom'
import { StateMessage } from '../components/ui'

export function NotFoundPage() {
  return (
    <StateMessage
      tone="empty"
      title="Halaman tidak ditemukan"
      action={
        <Link to="/" className="btn btn-primary">
          Kembali ke daftar warung
        </Link>
      }
    >
      Alamat yang kamu buka tidak ada di Review Kantin.
    </StateMessage>
  )
}
