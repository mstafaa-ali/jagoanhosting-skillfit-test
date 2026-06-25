# Study Case

Saya adalah seorang RT yang menjabat di sebuah daerah di sebuah perumahan elite. Pada perumahan ini terdapat iuran bulanan yang harus dibayarkan oleh masing masing warga setiap bulannya sebesar :

* Satpam : 100k
* Kebersihan : 15k

Pada perumahan ini, terdapat total 20 rumah. Yang sudah dihuni secara tetap ada 15 rumah. Sedangkan 5 lainnya terkadang kosong atau ada yang mengisi sementara / kontrak selama periode tertentu.

Selain iuran, terdapat pengeluaran bulanan yang dikelola oleh RT seperti perbaikan jalan, perbaikan selokan, dll. Pengeluaran ini tidak selalu perbulan muncul, namun ada juga pengeluaran bulanan yang muncul seperti gaji satpam, biaya token listrik pos satpam.

Disini sebagai RT, saya ingin lebih mudah dalam mengelola administrasi pembayaran dan pengeluaran. Khusus untuk penghuni tetap setiap bulannya akan ditagih sesuai dengan biaya bulanan di atas, sedangkan untuk 5 rumah lainnya, akan ditagih jika terdapat penghuninya.

---

# Tugas

Buatlah sebuah aplikasi yang bisa saya gunakan untuk mengelola administrasi ini.

---

# Kriteria

Pada aplikasi ini saya harus dapat :

## Mengelola Penghuni

### Action

* Bisa Menambah / Mengubah penghuni

### Attribute yang harus ada pada penghuni adalah :

* Nama Lengkap
* Foto KTP
* Status Penghuni kontrak / tetap
* Nomor Telepon
* Sudah menikah atau belum

---

## Mengelola Rumah

* Bisa Menambah / Mengubah Rumah
* Bisa Menambah / Mengubah penghuni rumah.
* Harus Terdapat catatan historical pada masing masing rumah siapa penghuninya
* Harus Terdapat history pembayaran beserta informasi penghuninya yang harus membayar dengan statusnya lunas atau belum

### Status rumah dengan penghuni terdapat 2 jenis :

* Dihuni
* Tidak dihuni

### Jika dihuni, harus bisa diketahui siapa penghuninya.

---

## Mengelola Pembayaran

* Bisa menambah data penghuni yang melakukan pembayaran iuran bulanan.

### Iuran bulanan terdapat 2, yaitu :

* Iuran kebersihan
* Iuran satpam

### Ketentuan pembayaran

* Terkadang terdapat penghuni yang membayar iuran bulanan 1 tahun, namun untuk iuran satpam biasanya bulanan.

---

## Reporting

* Terdapat report summary beserta saldo sisa untuk Pemasukan dan pengeluaran perbulan. (dalam bentuk grafik yang bisa menampilkan selama 1 tahun)
* Terdapat report untuk detail pengeluaran perbulan (pengeluaran dan pemasukan untuk bulan tertentu)

---

# Output

* ERD
* Repo Aplikasi
* Panduan Instalasi

> *Jika panduan ini tidak lengkap dan mengakibatkan kegagalan proses instalasi akan dianggap gagal*

---

# Ketentuan

* Dilarang menggunakan Docker sebagai basicnya.
* Berikan rangkuman hasil tugas kamu dalam screenshot per fiturnya

### Backend dan frontend dibuat secara terpisah

Kamu buat menggunakan :

* Framework PHP – Laravel
* Library Javascript – React
* DBMS – MySQL
