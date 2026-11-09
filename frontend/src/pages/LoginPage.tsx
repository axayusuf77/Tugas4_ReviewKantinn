import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Alert, Field, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getFieldErrors, toApiError } from '../lib/errors'
import {
  firstErrorField,
  LOGIN_FIELD_ORDER,
  validateLoginForm,
  type LoginFormErrors,
  type LoginFormField,
} from '../lib/validation'

interface LoginLocationState {
  from?: string
  registeredEmail?: string
}

export function LoginPage() {
  const { user, login } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const state = (location.state ?? {}) as LoginLocationState

  const [email, setEmail] = useState(state.registeredEmail ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Sudah login (termasuk sesaat setelah login berhasil): lanjut ke halaman tujuan.
  if (user) return <Navigate to={state.from ?? '/'} replace />

  function focusField(field: LoginFormField) {
    document.getElementById(`login-${field}`)?.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const found = validateLoginForm({ email, password })
    setErrors(found)

    const firstInvalid = firstErrorField(found, LOGIN_FIELD_ORDER)
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    setSubmitting(true)

    try {
      const signedIn = await login(email.trim(), password)
      toast.success(`Selamat datang, ${signedIn.name}.`)
    } catch (error) {
      const apiError = toApiError(error)
      setSubmitting(false)

      if (apiError.status === 400 && apiError.details.length > 0) {
        const fromServer = getFieldErrors(apiError)
        setErrors({ email: fromServer.email, password: fromServer.password })
      } else {
        setFormError(apiError.message)
      }
    }
  }

  return (
    <div className="auth">
      <h1 className="page-title">Masuk</h1>
      <p className="lede">Masuk untuk mengelola warung. Melihat daftar warung tidak perlu akun.</p>

      <div className="panel">
        <form className="form" onSubmit={handleSubmit} noValidate>
          {state.registeredEmail && (
            <Alert kind="success">Akun sudah dibuat. Silakan masuk dengan password barumu.</Alert>
          )}
          {state.from && !state.registeredEmail && (
            <Alert kind="info">Halaman itu butuh login. Masuk dulu, nanti kamu dibawa ke sana.</Alert>
          )}
          {formError && <Alert kind="error">{formError}</Alert>}

          <Field id="login-email" label="Email" error={errors.email}>
            {(control) => (
              <input
                {...control}
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrors((current) => ({ ...current, email: undefined }))
                }}
              />
            )}
          </Field>

          <Field id="login-password" label="Password" error={errors.password}>
            {(control) => (
              <input
                {...control}
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((current) => ({ ...current, password: undefined }))
                }}
              />
            )}
          </Field>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <Spinner label="Memeriksa" /> : 'Masuk'}
            </button>
          </div>
        </form>
      </div>

      <p className="auth-alt">
        Belum punya akun? <Link to="/register">Daftar sebagai customer</Link>
      </p>
    </div>
  )
}
