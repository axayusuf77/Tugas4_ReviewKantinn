# Review Kantin

Tugas 4 mata kuliah Rekayasa Sistem Informasi: frontend React yang terhubung ke backend Express dan SQL Server dari Tugas 2 (CRUD) dan Tugas 3 (autentikasi). Aplikasinya menampilkan daftar warung kantin kampus, dan pemilik warung atau admin bisa mengelolanya sesuai hak akses.

Metode komunikasi HTTP yang dipilih: **Axios** (dipakai konsisten di semua request).

## Isi repository

```
backend/    API Express + TypeScript (hasil Tugas 3, plus penyesuaian untuk Tugas 4)
frontend/   Aplikasi React + TypeScript + Vite
```

## Teknologi

| Bagian | Yang dipakai |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Axios, lucide-react, font Bowlby One dan Figtree (dibundel lewat `@fontsource`) |
| Backend | Express 5, TypeScript (dijalankan dengan tsx), Drizzle ORM, driver `mssql`, Zod, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, Swagger UI |
| Database | Microsoft SQL Server |

## Fitur

- Daftar warung dengan pencarian nama, filter kategori, dan pagination. Posisi pencarian, filter, dan halaman tersimpan di URL, jadi tahan refresh dan tombol back.
- Detail warung.
- Tambah, ubah, dan hapus warung sesuai role. Hapus selalu lewat dialog konfirmasi.
- Registrasi, login, logout, dan halaman akun yang datanya diambil dari `GET /auth/me`.
- Tampilan menyesuaikan role: tombol tambah, ubah, dan hapus hanya muncul kalau akunnya boleh.
- Loading state (kerangka daftar dan spinner), empty state, dan error state dengan tombol coba lagi.
- Penanganan error terpusat: validasi 400 tampil di bawah kolom yang bersangkutan, 401 mengakhiri sesi, 403 dan error lain tampil sebagai pesan yang jelas.

## Hak akses per role

| Aksi | Tamu | Customer | Owner | Admin |
|---|:-:|:-:|:-:|:-:|
| Lihat daftar dan detail warung | ya | ya | ya | ya |
| Registrasi dan login | ya | | | |
| Tambah warung | | | ya | ya |
| Ubah warung | | | milik sendiri | semua |
| Hapus warung | | | | ya |

Aturan di frontend hanya menentukan apa yang **ditampilkan**. Yang memutuskan boleh atau tidak tetap backend. Contohnya, kalau owner membuka form ubah warung milik owner lain, form tetap tampil dengan peringatan, lalu pesan 403 dari server ditampilkan saat disimpan.

## Endpoint yang dipakai

| Fitur | Endpoint | Dipanggil dari |
|---|---|---|
| Daftar warung | `GET /stalls?search=&category=&page=&limit=` | `frontend/src/lib/api.ts` (`getStalls`) |
| Detail warung | `GET /stalls/:id` | `getStall` |
| Tambah warung | `POST /stalls` | `createStall` |
| Ubah warung | `PUT /stalls/:id` | `updateStall` |
| Hapus warung | `DELETE /stalls/:id` | `deleteStall` |
| Registrasi | `POST /auth/register` | `register` |
| Login | `POST /auth/login` | `login` |
| Info pengguna | `GET /auth/me` | `getMe` |
| Logout | tidak ada endpoint | token dibuang di browser (`AuthContext`) |

## Cara menjalankan

### 1. Prasyarat

- Node.js 22 atau lebih baru.
- SQL Server yang aktif di `localhost:1433` (TCP/IP diaktifkan, SQL Server Authentication diizinkan).

### 2. Siapkan database

Buat database kosong bernama `review_kantin`, lalu jalankan file di `backend/db/` **berurutan**:

| File | Fungsi |
|---|---|
| `01-create-login-tugas2.sql` | Membuat login SQL Server. Ganti `GANTI_DENGAN_PASSWORD_KAMU` dulu. |
| `02-schema.sql` | Membuat tabel. |
| `03-seed-full.sql` | Mengisi data contoh (10 warung). |
| `04-demo-accounts-tugas4.sql` | Memberi password asli ke akun demo supaya bisa login. |

File memakai pemisah `GO`. Di SSMS bisa langsung dijalankan. Kalau editor kamu tidak mengenali `GO` (misalnya DBeaver), pakai runner bawaan dari folder `backend` setelah `npm install`:

```bash
node scripts/run-sql.cjs <user_admin> "<password_admin>" db/01-create-login-tugas2.sql db/02-schema.sql db/03-seed-full.sql db/04-demo-accounts-tugas4.sql
```

Pakai akun yang punya hak membuat objek (misalnya `sa`), bukan login aplikasi yang hanya bisa baca dan tulis data.

### 3. Jalankan backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Isi `backend/.env`:

| Variabel | Isi |
|---|---|
| `PORT` | Port API, default `3000` |
| `CORS_ORIGIN` | Alamat frontend yang diizinkan, default `http://localhost:5173` |
| `DB_SERVER`, `DB_PORT`, `DB_NAME` | Biasanya `localhost`, `1433`, `review_kantin` |
| `DB_USER`, `DB_PASSWORD` | Login SQL Server yang dibuat di langkah 2 |
| `JWT_SECRET` | String acak panjang. Buat dengan `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Masa berlaku token, default `2h` |

```bash
npm run dev
```

Cek `http://localhost:3000/health`. Dokumentasi API (Swagger) ada di `http://localhost:3000/docs`.

### 4. Jalankan frontend

Di terminal lain:

```bash
cd frontend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

`VITE_API_BASE_URL` di `frontend/.env` berisi alamat backend, default `http://localhost:3000`. Buka `http://localhost:5173`.

Pemeriksaan kode: `npm run lint` dan `npm run build` di folder `frontend`.

## Akun demo

Dibuat oleh `04-demo-accounts-tugas4.sql`. Semuanya memakai password `Kantin12345` (hanya untuk lingkungan belajar).

| Email | Role | Catatan |
|---|---|---|
| `admin@kantin.test` | Admin | Bisa mengelola semua warung |
| `tini@kantin.test` | Owner | Pemilik Warung Bu Tini (id 1) |
| `slamet@kantin.test` | Owner | Pemilik Kedai Pak Slamet (id 3) |
| `bagas@student.test` | Customer | Hanya bisa melihat |

Registrasi lewat aplikasi selalu menghasilkan role **customer**, sengaja begitu supaya orang tidak bisa mendaftar sebagai admin. Untuk menjadikan akun baru sebagai owner, ubah langsung di database:

```sql
UPDATE dbo.USERS SET role = N'owner' WHERE email = N'emailmu@contoh.com';
```

## Cara kerja autentikasi dan error

- Backend memakai JWT dengan header `Authorization: Bearer <token>`. Setelah login, token disimpan di `localStorage` dan dipasang otomatis ke setiap request oleh interceptor Axios (`frontend/src/lib/http.ts`).
- Saat aplikasi dibuka dan ada token tersimpan, frontend memanggil `GET /auth/me` untuk memastikan token masih berlaku. Kalau ditolak, token dibuang.
- Semua error Axios diseragamkan jadi satu bentuk `ApiError` (`frontend/src/lib/errors.ts`) yang memuat status, pesan, dan daftar error per field dari backend.
- Respons 401 pada endpoint terlindungi mengosongkan sesi lalu mengarahkan ke halaman login, dan setelah login pengguna dibawa kembali ke halaman tujuannya.
- Halaman terlindungi dijaga oleh `ProtectedRoute`: belum login diarahkan ke `/login`, role tidak cocok diarahkan ke `/forbidden`.
- Backend tidak punya endpoint logout, jadi logout berarti membuang token di browser.

Struktur kode frontend:

```
frontend/src/
  lib/         api.ts, http.ts, errors.ts, validation.ts, roles.ts, token.ts, useQuery.ts
  context/     AuthContext.tsx, ToastContext.tsx
  components/  Layout, ProtectedRoute, StallRow, StallForm, ConfirmDialog, Pagination, ui
  pages/       StallListPage, StallDetailPage, StallFormPage, LoginPage, RegisterPage, AccountPage, ...
```

## Perubahan pada backend dibanding Tugas 3

Ketentuan tugas membolehkan perbaikan backend supaya integrasi bisa jalan. Yang diubah:

- `src/index.ts`: menambah CORS (browser menolak request dari `localhost:5173` ke `localhost:3000` tanpa ini) dan `PORT` dari `.env`.
- `package.json`: menambah dependency `cors` dan `@types/cors`.
- `.env.example`: dilengkapi `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`.
- `db/04-demo-accounts-tugas4.sql`: baru, untuk akun demo.
- `db/01-create-login-tugas2.sql`: password yang sebelumnya tertulis langsung diganti placeholder.
- `scripts/run-sql.cjs`: baru, runner untuk file SQL ber-`GO`.

Catatan: route `GET /api/v1/reviews`, `DELETE /api/v1/reviews/:id`, dan `GET /api/v1/users` (peninggalan Tugas 2) memanggil fungsi yang sudah tidak ada setelah refactor Tugas 3, jadi akan error kalau dipanggil. Ketiganya di luar lingkup Tugas 4 dan tidak dipakai frontend.

## Catatan keamanan

- Token JWT di `localStorage` bisa dibaca skrip apa pun yang berjalan di halaman. Ini pilihan yang umum karena backend memakai Bearer token, dan frontend ini tidak merender HTML dari input pengguna. Kalau suatu saat dipakai sungguhan, cookie `httpOnly` lebih aman.
- `.env` tidak boleh di-commit. Hanya `.env.example` yang ada di repository.
