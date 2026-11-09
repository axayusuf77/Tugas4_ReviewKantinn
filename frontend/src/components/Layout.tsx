import { LogOut, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { canCreateStall, ROLE_LABEL } from '../lib/roles'

export function Layout() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Kamu sudah keluar.')
    navigate('/')
  }

  return (
    <>
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>

      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            Review Kantin
          </Link>

          <nav className="main-nav" aria-label="Menu utama">
            <NavLink to="/" end>
              Warung
            </NavLink>
            {canCreateStall(user) && <NavLink to="/stalls/new">Tambah warung</NavLink>}
          </nav>

          <div className="session">
            {user ? (
              <>
                <Link to="/akun" className="session-user">
                  <UserRound aria-hidden="true" size={18} />
                  <span className="session-name">{user.name}</span>
                  <span className="role-badge">{ROLE_LABEL[user.role]}</span>
                </Link>
                <button type="button" className="btn btn-header" onClick={handleLogout}>
                  <LogOut aria-hidden="true" size={16} />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-header">
                  Masuk
                </Link>
                <Link to="/register" className="btn btn-header btn-header-solid">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="konten" className="page">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">Review Kantin, tugas frontend mata kuliah RSI.</div>
      </footer>
    </>
  )
}
