# Walkthrough: Phase 1 (Foundation Backend)

Phase 1 untuk aplikasi Administrasi RT (Iuran Warga) telah diselesaikan. Berikut adalah ringkasan pekerjaan yang telah dilakukan:

## 1. Instalasi Laravel
- Project Laravel 11 baru diinisialisasi di dalam direktori `backend/`.
- Dependensi dasar Laravel telah terinstal.

## 2. Persiapan Database
- Konfigurasi database di `.env` telah disesuaikan untuk menggunakan **MySQL** (saat ini menggunakan database `jagoanhosting_skilltest`).
- File _migration_ telah dibuat untuk tabel-tabel utama:
  - `residents` (Penghuni)
  - `houses` (Rumah)
  - `house_residents` (Tabel pivot untuk histori penghuni rumah)
  - `fee_types` (Jenis Iuran: Satpam, Kebersihan)
  - `billings` (Tagihan / Pembayaran Iuran)
  - `expenses` (Pengeluaran RT)
- Migration sukses dijalankan dan seluruh tabel telah terbentuk di database MySQL.

## 3. Implementasi Model & Relasi
- Model-model Eloquent telah dibuat untuk mencerminkan struktur tabel.
- Relasi antar model telah didefinisikan secara minimalis (menghindari abstraksi berlebih sesuai pendekatan *ponytail*).
  - `Resident` ↔ `House` (Many-to-Many melalui `house_residents`)
  - `Billing` → `House`, `Resident`, dan `FeeType` (Belongs To)
- Form Requests & API Resources untuk saat ini ditiadakan. Validasi akan dilakukan secara _inline_ di Controller untuk menjaga kode tetap ringkas dan meminimalisir jumlah file.

## 4. Auth & API Routing
- Paket **Laravel Sanctum** diinstal untuk mendukung autentikasi API berbasis token.
- File routing `routes/api.php` telah ter-generate.

## Langkah Selanjutnya (Phase 2)
Fase berikutnya akan berfokus pada pembuatan **Core API Endpoints**, meliputi:
- CRUD Residents & Houses (termasuk upload KTP).
- Manajemen assign/remove penghuni ke rumah (histori via pivot).
- Manajemen tagihan (generate, bayar, dan bulk-pay).
- Manajemen pengeluaran & jenis iuran.
