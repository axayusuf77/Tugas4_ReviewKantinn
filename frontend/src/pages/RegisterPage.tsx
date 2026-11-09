import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Alert, Field, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getFieldErrors, toApiError } from '../lib/errors'
import {
  firstErrorField,
  PASSWORD_MAX,
  PASSWORD_MIN,
  REGISTER_FIELD_ORDER,
  validateRegisterForm,
  type RegisterFormErrors,
  type RegisterFormField,
  type RegisterFormValues,
} from '../lib/validation'

const EMPTY_VALUES: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<RegisterFormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  function change(field: RegisterFormField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function focusField(field: RegisterFormField) {
    document.getElementById(`register-${field}`)?.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const found = validateRegisterForm(values)
    setErrors(found)

    const firstInvalid = firstErrorField(found, REGISTER_FIELD_ORDER)
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    setSubmitting(true)

    try {
      const created = await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      navigate('/login', { replace: true, state: { registeredEmail: created.email } })
    } catch (error) {
      const apiError = toApiError(error)
      setSubmitting(false)

      if (apiError.status === 400 && apiError.details.length > 0) {
        const fromServer = getFieldErrors(apiError)
        const mapped: RegisterFormErrors = {
          name: fromServer.name,
          email: fromServer.email,
          password: fromServer.password,
        }
        setErrors(mapped)
        const first = firstErrorField(mapped, REGISTER_FIELD_ORDER)
        if (first) focusField(first)
        else setFormError(apiError.message)
      } else if (apiError.status === 409) {
        setErrors({ email: apiError.message })
        focusField('email')
      } else {
        setFormError(apiError.message)
      }
    }
  }

  return (
    <div className="auth">
      <h1 className="page-title">Daftar</h1>
      <p className="lede">Akun baru berperan sebagai customer. Peran owner dan admin diatur lewat database.</p>

      <div className="panel">
        <form className="form" onSubmit={handleSubmit} noValidate>
          {formError && <Alert kind="error">{formError}</Alert>}

          <Field id="register-name" label="Nama lengkap" error={errors.name}>
            {(control) => (
              <input
                {...control}
                className="input"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(event) => change('name', event.target.value)}
              />
            )}
          </Field>

          <Field id="register-email" label="Email" error={errors.email}>
            {(control) => (
              <input
                {...control}
                className="input"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => change('email', event.target.value)}
              />
            )}
          </Field>

          <Field
            id="register-password"
            label="Password"
            hint={`${PASSWORD_MIN} sampai ${PASSWORD_MAX} karakter.`}
            error={errors.password}
          >
            {(control) => (
              <input
                {...control}
                className="input"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={(event) => change('password', event.target.value)}
              />
            )}
          </Field>

          <Field id="register-confirmPassword" label="Ulangi password" error={errors.confirmPassword}>
            {(control) => (
              <input
                {...control}
                className="input"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(event) => change('confirmPassword', event.target.value)}
              />
            )}
          </Field>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <Spinner label="Mendaftarkan" /> : 'Buat akun'}
            </button>
          </div>
        </form>
      </div>

      <p className="auth-alt">
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </p>
    </div>
  )
}
