# ⚡ UndipGampang (UNDIP Schedule & Theme Suite)

**UndipGampang** adalah ekstensi Google Chrome (Manifest V3) yang dirancang khusus untuk mahasiswa Universitas Diponegoro (UNDIP). Ekstensi ini mempermudah pengelolaan jadwal kuliah dari portal SIAP UNDIP ke Google Calendar/iCal serta menghadirkan kustomisasi tampilan web SIAP UNDIP secara instan.

---

## ✨ Fitur Utama

### 📅 1. Ekspor Jadwal Kuliah Multimode
- **Deteksi Otomatis Halaman SIAP**: Mengekstrak jadwal perkuliahan langsung dari tab aktif SIAP UNDIP.
- **Dukungan Drag & Drop HTML**: Ekstrak jadwal dari file `JADWAL KULIAH.html` atau `KLIKLIHATABSEN.html` tanpa harus membuka web.
- **Mode Tanggal Presisi (Absen)**: Mengekstrak tanggal presensi kuliah secara akurat sesuai jadwal pertemuan.
- **Mode Estimasi Mingguan**: Menghasilkan jadwal berulang mingguan otomatis selama 16 minggu semester berjalan.
- **Multi-Format Export**:
  - 📅 **Google Calendar / Apple Calendar (`.ics`)**
  - 📊 **Spreadsheet / Excel (`.csv`)**
  - 📋 **Salin Ringkasan Teks (WhatsApp / Chat)**

### 🎨 2. SIAP UNDIP Customizer & Mascot Suite
- **🐾 Desktop Pet Mascot**: Menampilkan maskot animated GIF interaktif (Pikachu ⚡, Gengar 👻, Eevee 🦊, Cyber Cat 🐱) atau URL GIF custom.
- **🎨 Preset Tema Modern**:
  - 🌌 **Cyberpunk** (Dark Mode dengan Neon Accent)
  - 🌅 **Sunset** (Warm Gradient)
  - 🌿 **Emerald** (Fresh Green)
  - 🌸 **Sakura** (Soft Pastel Pink)
  - 🖤 **OLED Dark** (Pure Black High Contrast)
- **🖼️ Custom Wallpaper & Avatar**: Personalisasi foto profil dan background portal SIAP UNDIP menggunakan URL gambar pilihanmu.
- **🚀 Fun Greeting Banner**: Pesan sapaan interaktif di bagian atas halaman SIAP UNDIP.

---

## 🚀 Cara Instalasi di Browser (Google Chrome / Edge / Brave)

1. **Download / Clone Repository**:
   ```bash
   git clone https://github.com/hamkaaaa/undipgampang.git
   ```
2. Buka browser dan buka halaman ekstensi:
   - **Google Chrome**: Ketik `chrome://extensions/` di address bar.
   - **Microsoft Edge**: Ketik `edge://extensions/` di address bar.
   - **Brave Browser**: Ketik `brave://extensions/` di address bar.
3. Aktifkan **Developer mode** (Mode Pengembang) di pojok kanan atas.
4. Klik tombol **Load unpacked** (Muat ekstensi yang tidak dikemas).
5. Pilih folder repository `undipgampang` yang telah di-download/clone.
6. Ekstensi **UndipGampang ⚡** siap digunakan!

---

## 📖 Cara Penggunaan

### 🗓️ Mengekspor Jadwal ke Google Calendar (`.ics`)
1. Buka portal [SIAP UNDIP](https://siap.undip.ac.id/) dan buka halaman **Jadwal Kuliah** / **Absensi**.
2. Klik ikon ekstensi **UndipGampang** di toolbar browser.
3. Ekstensi akan secara otomatis mendeteksi jadwal yang ada.
4. Pilih mode ekspor (**🎯 Tanggal Presisi** atau **🔄 Estimasi Mingguan**).
5. Klik **Download Google Calendar (.ics)**.
6. Buka Google Calendar -> Setting -> Import & Export -> Import file `.ics` yang baru didownload.

### 🎨 Mengubah Tampilan Web SIAP UNDIP
1. Klik ikon ekstensi **UndipGampang**.
2. Pindah ke tab **🎨 Theme & Pet**.
3. Pilih maskot favorit, tema warna, atau masukkan URL wallpaper & foto profil custom.
4. Klik **💾 Simpan & Terapkan di Web SIAP UNDIP**.
5. Buka/Refresh halaman SIAP UNDIP untuk melihat hasilnya.

---

## 🛠️ Struktur Proyek

```text
undipgampang/
├── manifest.json            # Konfigurasi Chrome Extension Manifest V3
├── popup/
│   ├── popup.html           # UI Popup Antarmuka Ekstensi
│   ├── popup.css            # Styling Popup Modern
│   └── popup.js             # Logika Kontroler Popup
├── scripts/
│   ├── parser.js            # Parser Tabel HTML SIAP UNDIP
│   ├── ics-generator.js     # Generator Spesifikasi iCalendar (.ics)
│   ├── customizer-engine.js # Engine Injector Tema & Desktop Pet
│   └── content.js           # Content Script Penghubung SIAP Web
├── icons/                   # Aset Ikon Ekstensi (16px, 48px, 128px)
├── .gitignore
└── README.md
```

---

## 🔒 Privasi & Keamanan

- **100% Client-Side**: Semua pemrosesan data jadwal dan preferensi tema dilakukan secara lokal di dalam browser Anda.
- **Bebas Tracking**: Ekstensi ini **tidak pernah** mengumpulkan, menyimpan, atau mengirimkan credentials/data mahasiswa ke server eksternal mana pun.

---

## 🤝 Kontribusi & Feedback

Kontribusi, issue report, dan saran fitur sangat dialu-alukan!
1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/FiturBaru`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`)
4. Push ke branch (`git push origin feature/FiturBaru`)
5. Buat **Pull Request**

---

Made with ❤️ for Mahasiswa UNDIP
