import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Footer situs: ringkasan aplikasi, menu cepat, dan identitas pembuat. */
export function Footer() {
  const { user } = useAuth()

  return (
    <footer className="site-footer">
      <div className="footer-inner footer-grid">
        <section className="footer-col footer-about">
          <p className="footer-brand">Review Kantin</p>
          <p>
            Daftar warung kantin kampus lengkap dengan rating, dan bisa dikelola oleh pemilik
            warung atau admin.
          </p>
        </section>

        <nav className="footer-col" aria-label="Menu footer">
          <h2 className="footer-title">Menu</h2>
          <ul className="footer-list">
            <li>
              <Link to="/">Daftar warung</Link>
            </li>
            {user ? (
              <li>
                <Link to="/akun">Akun saya</Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login">Masuk</Link>
                </li>
                <li>
                  <Link to="/register">Daftar</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <section className="footer-col">
          <h2 className="footer-title">Dibuat oleh</h2>
          <ul className="footer-list">
            <li>Yusuf Al Amin (L0225050)</li>
            <li>Program Studi Sains Data</li>
            <li>Universitas Sebelas Maret</li>
            <li>
              <a
                href="https://github.com/axayusuf77/Tugas4_ReviewKantinn"
                target="_blank"
                rel="noreferrer"
              >
                Repository GitHub
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="footer-bottom">
        <div className="footer-inner footer-bottom-inner">
          <span>© 2026 Review Kantin. Tugas 4 Rekayasa Sistem Informasi.</span>
          <span>React, TypeScript, Express, dan SQL Server.</span>
        </div>
      </div>
    </footer>
  )
}
