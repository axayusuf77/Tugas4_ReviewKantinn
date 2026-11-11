import { CircleCheck, Info, LoaderCircle, Star, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

/* -------------------------------- Alert ------------------------------- */

interface AlertProps {
  kind: 'error' | 'success' | 'info'
  children: ReactNode
}

export function Alert({ kind, children }: AlertProps) {
  const Icon = kind === 'error' ? TriangleAlert : kind === 'success' ? CircleCheck : Info

  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" size={20} className="alert-icon" />
      <div>{children}</div>
    </div>
  )
}

/* -------------------------------- Field ------------------------------- */

interface FieldControlProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: (control: FieldControlProps) => ReactNode
}

export function Field({ id, label, error, hint, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          <TriangleAlert aria-hidden="true" size={16} />
          {error}
        </p>
      )}
    </div>
  )
}

/* ------------------------------ Rating -------------------------------- */

interface RatingProps {
  value: number
  count: number
}

export function Rating({ value, count }: RatingProps) {
  if (count === 0) {
    return <span className="rating rating-empty">Belum ada ulasan</span>
  }

  return (
    <span className="rating">
      <Star aria-hidden="true" size={16} />
      <span>{value.toFixed(1)}</span>
      <small>({count} ulasan)</small>
    </span>
  )
}

/* ------------------------------ Spinner ------------------------------- */

export function Spinner({ label }: { label: string }) {
  return (
    <span className="spinner-label" role="status">
      <LoaderCircle aria-hidden="true" size={18} className="spin" />
      {label}
    </span>
  )
}

/* ---------------------------- State message --------------------------- */

interface StateMessageProps {
  tone: 'empty' | 'error'
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function StateMessage({ tone, title, children, action }: StateMessageProps) {
  return (
    <div className={`state state-${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  )
}

/* ----------------------------- Skeleton ------------------------------- */

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="board" aria-busy="true" role="status" aria-label="Memuat daftar warung">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="row row-skeleton">
          <div className="skeleton skeleton-thumb" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-sub" />
          </div>
        </div>
      ))}
    </div>
  )
}
