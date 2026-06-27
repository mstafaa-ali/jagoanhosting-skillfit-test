# JagoanHosting SkillFit Test - Fullstack Application

Aplikasi ini terdiri dari **Backend (Laravel)** dan **Frontend (React + Vite)**. Berikut adalah panduan langkah demi langkah untuk menjalankan aplikasi ini di lingkungan lokal Anda.

## Persyaratan Sistem (Prerequisites)
Pastikan sistem Anda telah terinstal:
- PHP (v8.1 atau lebih baru direkomendasikan)
- Composer
- Node.js (v18 atau lebih baru direkomendasikan) dan npm
- MySQL / MariaDB

---

## 1. Setup Backend (Laravel)

1. Buka terminal dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```

2. Instal semua dependensi PHP menggunakan Composer:
   ```bash
   composer install
   ```

3. Salin file konfigurasi lingkungan (Environment):
   ```bash
   cp .env.example .env
   ```

4. Generate Application Key:
   ```bash
   php artisan key:generate
   ```

5. Konfigurasi Database:
   Buka file `.env` di dalam folder `backend` dan sesuaikan kredensial database Anda. Buat database kosong terlebih dahulu di MySQL (misalnya `skillfit_db`).
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=skillfit_db
   DB_USERNAME=root
   DB_PASSWORD=password_anda
   ```

6. Jalankan Migrasi dan Seeder (untuk membuat tabel dan data dummy awal):
   ```bash
   php artisan migrate --seed
   ```

7. Jalankan Server Development Backend:
   ```bash
   php artisan serve
   ```
   *Backend API sekarang dapat diakses di `http://127.0.0.1:8000`.*

---

## 2. Setup Frontend (React + Vite)

1. Buka tab terminal baru (biarkan server backend tetap berjalan) dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```

2. Instal semua dependensi JavaScript menggunakan npm:
   ```bash
   npm install
   ```

3. Konfigurasi URL API (Opsional jika sudah dikonfigurasi secara bawaan):
   Jika terdapat file `.env.example`, salin menjadi `.env` dan pastikan mengarah ke backend lokal Anda.
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

4. Jalankan Server Development Frontend:
   ```bash
   npm run dev
   ```
   *Buka tautan yang muncul (biasanya `http://localhost:5173`) di browser Anda untuk melihat aplikasi.*

---

## Akun Default (Autentikasi)

Setelah menjalankan seeder (`php artisan migrate --seed`), Anda dapat login ke dalam aplikasi menggunakan akun default berikut:

- **Email:** `admin@rt.com`
- **Password:** `password123`

---

## Menjalankan Pengujian (Testing)

**Backend (Pest / PHPUnit):**
Dari dalam direktori `backend`, jalankan:
```bash
php artisan test
```

**Frontend (Vitest):**
Dari dalam direktori `frontend`, jalankan:
```bash
npm run test
```

---