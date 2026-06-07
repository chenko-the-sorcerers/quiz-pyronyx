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

## Anti Double Join

Saat peserta klik Join, aplikasi membuat `device_id`, mencoba mendeteksi IP
publik, lalu menyimpan attempt ke tabel `quiz_attempts`. Perangkat yang sudah
pernah join akan ditolak saat mencoba masuk lagi.

IP disimpan untuk audit, tetapi kunci utama blokir adalah perangkat/browser.
Ini lebih aman untuk event besar karena banyak peserta di WiFi yang sama bisa
berbagi satu IP publik.

## Catatan Deploy

Nama yang disiapkan untuk deploy:

```text
kuispyronyx
quiz-pyro
```
