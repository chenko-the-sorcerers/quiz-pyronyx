# Pyronyx Quiz

Website quiz native HTML, CSS, dan JavaScript untuk peserta join memakai nama,
menjawab 10 soal, lalu melihat ranking dengan animasi podium.

## Jalankan Lokal

```bash
python3 -m http.server 4173
```

Buka:

```text
http://localhost:4173/
```

## Supabase

App sudah diarahkan ke proyek Supabase:

```js
const SUPABASE_URL = "https://hmpiffdsavbepuzuesnd.supabase.co";
```

Sebelum dipakai live, buka Supabase SQL Editor lalu jalankan isi file
`supabase.sql`. Selama tabel belum tersedia atau koneksi gagal, aplikasi tetap
menyimpan hasil ke `localStorage` browser untuk demo lokal.

## Catatan Deploy

Nama yang disiapkan untuk deploy:

```text
kuispyronyx
quiz-pyro
```
