import { useEffect, useRef, type ReactNode } from 'react'
import { Alert, Spinner } from './ui'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  busy: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

/** Dialog konfirmasi memakai elemen <dialog> bawaan: fokus terkunci dan Esc menutup. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onCancel()
      }}
    >
      {open && (
        <div className="dialog-body">
          <h2 id="confirm-title">{title}</h2>
          <div className="dialog-text">{children}</div>
          {error && <Alert kind="error">{error}</Alert>}
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={onCancel} disabled={busy}>
              Batal
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
              {busy ? <Spinner label="Menghapus" /> : confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
