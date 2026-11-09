import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CATEGORY_MAX,
  DESCRIPTION_MAX,
  firstErrorField,
  LOCATION_MAX,
  NAME_MAX,
  STALL_FIELD_ORDER,
  toStallPayload,
  validateStallForm,
  type StallFormErrors,
  type StallFormField,
  type StallFormValues,
} from '../lib/validation'
import type { StallPayload } from '../types'
import { Alert, Field, Spinner } from './ui'

export interface SubmitResult {
  /** Pesan per field dari server (400). */
  fieldErrors?: Record<string, string>
  /** Pesan umum untuk error selain validasi (403, 404, 500, jaringan). */
  formError?: string
}

interface StallFormProps {
  initial: StallFormValues
  submitLabel: string
  cancelTo: string
  categories: string[]
  notice?: string
  onSubmit: (payload: StallPayload) => Promise<SubmitResult>
}

function focusField(field: StallFormField) {
  document.getElementById(`stall-${field}`)?.focus()
}

function pickFieldErrors(source: Record<string, string>): StallFormErrors {
  const picked: StallFormErrors = {}
  for (const field of STALL_FIELD_ORDER) {
    const message = source[field]
    if (message) picked[field] = message
  }
  return picked
}

export function StallForm({
  initial,
  submitLabel,
  cancelTo,
  categories,
  notice,
  onSubmit,
}: StallFormProps) {
  const [values, setValues] = useState<StallFormValues>(initial)
  const [errors, setErrors] = useState<StallFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function change(field: StallFormField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const found = validateStallForm(values)
    setErrors(found)

    const firstInvalid = firstErrorField(found, STALL_FIELD_ORDER)
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    setSubmitting(true)
    const result = await onSubmit(toStallPayload(values))
    setSubmitting(false)

    if (result.fieldErrors) {
      const fromServer = pickFieldErrors(result.fieldErrors)
      setErrors(fromServer)
      const firstServerError = firstErrorField(fromServer, STALL_FIELD_ORDER)
      if (firstServerError) focusField(firstServerError)
    }

    if (result.formError) setFormError(result.formError)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {notice && <Alert kind="info">{notice}</Alert>}
      {formError && <Alert kind="error">{formError}</Alert>}

      <Field id="stall-name" label="Nama warung" error={errors.name}>
        {(control) => (
          <input
            {...control}
            className="input"
            type="text"
            value={values.name}
            maxLength={NAME_MAX + 20}
            autoComplete="off"
            onChange={(event) => change('name', event.target.value)}
          />
        )}
      </Field>

      <Field
        id="stall-category"
        label="Kategori"
        hint="Boleh dikosongkan. Pilih dari saran atau ketik sendiri, misalnya Nasi atau Minuman."
        error={errors.category}
      >
        {(control) => (
          <>
            <input
              {...control}
              className="input"
              type="text"
              list="stall-category-options"
              value={values.category}
              maxLength={CATEGORY_MAX + 20}
              autoComplete="off"
              onChange={(event) => change('category', event.target.value)}
            />
            <datalist id="stall-category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </>
        )}
      </Field>

      <Field
        id="stall-location"
        label="Lokasi"
        hint="Boleh dikosongkan. Contoh: Kantin FK, dekat pintu barat."
        error={errors.location}
      >
        {(control) => (
          <input
            {...control}
            className="input"
            type="text"
            value={values.location}
            maxLength={LOCATION_MAX + 20}
            autoComplete="off"
            onChange={(event) => change('location', event.target.value)}
          />
        )}
      </Field>

      <Field
        id="stall-description"
        label="Deskripsi"
        hint={`${values.description.length} dari ${DESCRIPTION_MAX} karakter. Boleh dikosongkan.`}
        error={errors.description}
      >
        {(control) => (
          <textarea
            {...control}
            className="input textarea"
            rows={5}
            value={values.description}
            onChange={(event) => change('description', event.target.value)}
          />
        )}
      </Field>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <Spinner label="Menyimpan" /> : submitLabel}
        </button>
        <Link to={cancelTo} className="btn">
          Batal
        </Link>
      </div>
    </form>
  )
}
