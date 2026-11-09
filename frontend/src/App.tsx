import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AccountPage } from './pages/AccountPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { StallDetailPage } from './pages/StallDetailPage'
import { StallFormPage } from './pages/StallFormPage'
import { StallListPage } from './pages/StallListPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Publik */}
        <Route index element={<StallListPage />} />
        <Route path="stalls/:id" element={<StallDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />

        {/* Semua role yang sudah login */}
        <Route element={<ProtectedRoute />}>
          <Route path="akun" element={<AccountPage />} />
        </Route>

        {/* Hanya owner dan admin */}
        <Route element={<ProtectedRoute roles={['owner', 'admin']} />}>
          <Route path="stalls/new" element={<StallFormPage mode="create" />} />
          <Route path="stalls/:id/edit" element={<StallFormPage mode="edit" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
