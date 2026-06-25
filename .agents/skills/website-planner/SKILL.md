---
name: website-planner
description: Membuat perencanaan pembuatan website yang lengkap dan terstruktur berdasarkan deskripsi yang diberikan pengguna. Aktifkan skill ini ketika pengguna meminta perencanaan website, ingin membuat website baru, atau memberikan deskripsi proyek web.
---

# Skill: Website Planner

## Tujuan

Menghasilkan dokumen perencanaan website yang lengkap, terstruktur, dan siap dieksekusi berdasarkan deskripsi yang diberikan.

## Alur Kerja

### Langkah 1 — Analisis Deskripsi

Sebelum membuat perencanaan, identifikasi dari deskripsi pengguna:

- Jenis website (landing page, e-commerce, portofolio, SaaS, profil perusahaan, dll.)
- Target pengguna akhir
- Fitur utama yang disebutkan atau tersirat
- Skala proyek (kecil / menengah / besar)

Jika ada informasi krusial yang tidak jelas, ajukan **maksimal 2 pertanyaan klarifikasi** sebelum melanjutkan.

### Langkah 2 — Hasilkan Dokumen Perencanaan

Buat Artifact berisi dokumen perencanaan lengkap dengan struktur berikut:

---

## 🎯 Project Overview

- **Nama Proyek:**
- **Deskripsi Singkat:**
- **Tujuan Utama:**
- **Target Pengguna:**
- **Estimasi Kompleksitas:** [Rendah / Sedang / Tinggi]

---

## 🗺️ Sitemap & Struktur Halaman

Tampilkan semua halaman dalam format hierarki:
Home

├── Halaman A

├── Halaman B

│ ├── Sub-halaman B1

│ └── Sub-halaman B2

└── Halaman C

---

## 🧩 Fitur & Fungsionalitas

### Must Have (Wajib di versi pertama)

- Fitur 1 — [penjelasan singkat]
- Fitur 2 — [penjelasan singkat]

### Should Have (Penting, bisa menyusul)

- Fitur 3
- Fitur 4

### Nice to Have (Opsional / fase berikutnya)

- Fitur 5

---

## 🎨 Arah Desain UI/UX

- **Gaya Visual:** (contoh: minimalis modern, bold & playful, corporate clean)
- **Palet Warna:**
  - Primary: `#______` — [fungsi]
  - Secondary: `#______` — [fungsi]
  - Accent: `#______` — [fungsi]
  - Background: `#______`
  - Text: `#______`
- **Tipografi:**
  - Display/Heading: [nama font]
  - Body: [nama font]
- **Elemen Signature:** [satu elemen visual unik yang membuat website ini memorable]

---

## 🛠️ Rekomendasi Tech Stack

| Layer    | Teknologi | Alasan |
| -------- | --------- | ------ |
| Frontend |           |        |
| Backend  |           |        |
| Database |           |        |
| CMS      |           |        |
| Hosting  |           |        |

---

## 📱 Responsivitas & Aksesibilitas

- Breakpoints: mobile (< 768px), tablet (768–1024px), desktop (> 1024px)
- Catatan aksesibilitas khusus proyek ini

---

## 🗓️ Estimasi Waktu Pengerjaan

| Fase      | Deskripsi                   | Durasi     |
| --------- | --------------------------- | ---------- |
| 1         | Desain (Wireframe + Mockup) | X hari     |
| 2         | Setup & Struktur Proyek     | X hari     |
| 3         | Development Halaman Utama   | X hari     |
| 4         | Fitur & Integrasi           | X hari     |
| 5         | Testing & QA                | X hari     |
| 6         | Deployment                  | X hari     |
| **Total** |                             | **X hari** |

---

## ⚠️ Risiko & Mitigasi

| Risiko | Kemungkinan | Mitigasi |
| ------ | ----------- | -------- |
|        |             |          |

---

## ✅ Langkah Berikutnya

Rekomendasikan 1–3 langkah konkret yang harus dilakukan pengguna setelah membaca dokumen ini.

---

## Aturan Output

- Selalu buat perencanaan sebagai **Artifact** agar bisa disimpan dan direvisi.
- Gunakan bahasa yang sama dengan deskripsi pengguna (Indonesia atau Inggris).
- Setiap rekomendasi harus **spesifik** untuk proyek ini, bukan jawaban generik.
- Akhiri dengan **satu pertanyaan** untuk menggali aspek berikutnya jika pengguna ingin melanjutkan.

## Contoh Pemicu Skill Ini

- "Saya ingin membuat website toko online sepatu"
- "Buatkan perencanaan website portofolio untuk fotografer"
- "Plan website company profile untuk startup fintech saya"
- "I want to build a SaaS dashboard for project management"
