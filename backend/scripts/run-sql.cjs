// Menjalankan file .sql yang memakai pemisah "GO" tanpa SSMS.
// Berguna kalau memakai DBeaver atau editor lain yang tidak mengenali GO.
//
// Pakai (dari folder backend, setelah npm install):
//   node scripts/run-sql.cjs <user> <password> <file.sql> [file.sql ...]
// Contoh:
//   node scripts/run-sql.cjs sa "PasswordAdmin" db/02-schema.sql db/03-seed-full.sql db/04-demo-accounts-tugas4.sql
//
// Server dan port bisa diubah lewat variabel lingkungan DB_SERVER dan DB_PORT.
// Tambahkan --dry untuk hanya melihat jumlah batch per file tanpa konek ke database.

const fs = require('node:fs')
const path = require('node:path')

const dry = process.argv.includes('--dry')
const args = process.argv.slice(2).filter((a) => a !== '--dry')
const [user, password, ...files] = dry ? ['', '', ...args] : args

function splitBatches(text) {
  const batches = []
  let current = []

  for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    if (/^\s*GO\s*(--.*)?$/i.test(line)) {
      batches.push(current.join('\n'))
      current = []
    } else {
      current.push(line)
    }
  }
  batches.push(current.join('\n'))

  return batches.filter((b) => b.trim().length > 0)
}

async function main() {
  if (files.length === 0 || (!dry && (!user || !password))) {
    console.error('Pakai: node scripts/run-sql.cjs <user> <password> <file.sql> [file.sql ...]')
    process.exit(1)
  }

  if (dry) {
    for (const file of files) {
      const text = fs.readFileSync(path.resolve(file), 'utf8')
      console.log(`${file}: ${splitBatches(text).length} batch`)
    }
    return
  }

  const sql = require('mssql')
  const pool = await new sql.ConnectionPool({
    server: process.env.DB_SERVER || 'localhost',
    port: Number(process.env.DB_PORT || 1433),
    user,
    password,
    database: 'master',
    options: { encrypt: false, trustServerCertificate: true },
    requestTimeout: 60_000,
  }).connect()

  try {
    for (const file of files) {
      console.log(`\n=== ${file} ===`)
      const batches = splitBatches(fs.readFileSync(path.resolve(file), 'utf8'))

      for (let i = 0; i < batches.length; i += 1) {
        const request = pool.request()
        request.on('info', (info) => console.log('  ' + info.message))

        try {
          const result = await request.batch(batches[i])
          for (const set of result.recordsets ?? []) {
            if (set.length > 0) console.table(set)
          }
        } catch (error) {
          console.error(`\nGAGAL di ${file}, batch ${i + 1} dari ${batches.length}:`)
          console.error('  ' + error.message)
          console.error('\nBerhenti di sini. Perbaiki dulu, lalu jalankan ulang.')
          process.exitCode = 1
          return
        }
      }
    }

    console.log('\nSelesai: semua file berhasil dijalankan.')
  } finally {
    await pool.close()
  }
}

main().catch((error) => {
  console.error('Gagal konek / menjalankan:', error.message)
  process.exit(1)
})
