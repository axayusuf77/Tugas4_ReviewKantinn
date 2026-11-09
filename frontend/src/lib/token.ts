// Backend memakai JWT Bearer, jadi token disimpan di sisi browser.
// localStorage bisa saja diblokir (mode privat), jadi ada cadangan di memori.
const STORAGE_KEY = 'review-kantin.token'

let memoryToken: string | null = null

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryToken
  } catch {
    return memoryToken
  }
}

export function setToken(token: string): void {
  memoryToken = token
  try {
    window.localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // Penyimpanan diblokir: token hanya hidup selama tab terbuka.
  }
}

export function clearToken(): void {
  memoryToken = null
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Tidak ada yang perlu dibersihkan.
  }
}
