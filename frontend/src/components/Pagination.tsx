interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Nomor halaman yang ditampilkan: pertama, terakhir, dan dua tetangga halaman aktif. */
function visiblePages(page: number, totalPages: number): Array<number | 'gap'> {
  const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1])
  const sorted = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)
  const result: Array<number | 'gap'> = []

  sorted.forEach((n, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && n - previous > 1) result.push('gap')
    result.push(n)
  })

  return result
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="pager" aria-label="Halaman daftar warung">
      <button
        type="button"
        className="btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Sebelumnya
      </button>

      <ul className="pager-pages">
        {visiblePages(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="pager-gap">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="page-btn"
                aria-label={`Halaman ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Berikutnya
      </button>
    </nav>
  )
}
