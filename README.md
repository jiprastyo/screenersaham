# 📊 Screener Saham Indonesia

Stock screener untuk pasar saham Indonesia dengan analisis teknikal otomatis. Data diupdate 3x sehari via GitHub Actions.

## 🚀 Cara Deploy

### 1. Clone & Push ke GitHub

```bash
git clone https://github.com/USERNAME/screenersaham.git
cd screenersaham

# Copy semua file dari download ke folder ini
# Pastikan struktur folder seperti ini:
# ├── .github/
# │   └── workflows/
# │       └── update-data.yml
# ├── data/
# │   ├── .gitkeep
# │   └── issi_data.json  (akan di-generate)
# ├── index.html
# ├── fetch_data.js
# ├── package.json
# └── README.md

git add .
git commit -m "Initial commit: screener saham"
git push origin main
```

### 2. Setup GitHub Pages

1. Buka repository di GitHub
2. **Settings** → **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `main` / `(root)` 
5. **Save**
6. Tunggu ~1 menit, site akan live di `https://USERNAME.github.io/screenersaham`

### 3. Setup GitHub Actions (PENTING!)

> ⚠️ **Langkah ini WAJIB**, jika tidak site akan error "Data tidak tersedia"

1. **Settings** → **Actions** → **General**
2. Scroll ke **Workflow permissions**
3. Pilih **Read and write permissions**
4. ✅ Centang **Allow GitHub Actions to create and approve pull requests**
5. **Save**

### 4. Jalankan Workflow Pertama Kali (Manual)

1. Buka tab **Actions** di repository
2. Pilih workflow **Update Data Saham** di sidebar kiri
3. Klik tombol **Run workflow** (dropdown)
4. Pilih branch `main`
5. Klik **Run workflow** hijau

Workflow akan berjalan ~10-15 menit:
- Fetch data 956 saham dari Yahoo Finance
- Generate file `data/issi_data.json`
- Commit otomatis ke repository

### 5. Verifikasi

Setelah workflow selesai (✅ hijau):
1. Cek file `data/issi_data.json` sudah ada di repo
2. Refresh halaman site Anda
3. Data seharusnya muncul dengan 956 saham

---

## 📅 Auto-Update Schedule

Setelah setup awal, data akan update otomatis **3x per hari**:
- **09:00 WIB** (sebelum market buka)
- **12:00 WIB** (siang)
- **17:30 WIB** (setelah market tutup)

---

## 🔧 Troubleshooting

### Error: "Data tidak tersedia. Jalankan workflow GitHub Actions"

**Penyebab**: File `data/issi_data.json` belum di-generate.

**Solusi**:
1. Cek **Actions** → apakah ada workflow yang running atau failed?
2. Jika failed, klik workflow → klik job → baca error log
3. Kemungkinan penyebab:
   - Permissions belum diset (lihat step 3)
   - Yahoo Finance API timeout (retry workflow)
   - Branch name salah (pastikan `main`)

### Workflow Stuck/Timeout

Yahoo Finance kadang lambat. Solusi:
1. Cancel workflow yang stuck
2. **Run workflow** lagi
3. Biasanya berhasil di attempt ke-2 atau ke-3

### Data Tidak Update Otomatis

Cek di **Actions** → apakah scheduled run berjalan?
- Jika tidak ada: pastikan workflow permissions sudah correct
- Jika failed: baca error log, kemungkinan API rate limit

---

## 📊 Fitur

- **956 saham IDX** (semua papan: Utama, Pengembangan, Akselerasi, dll)
- **Skor Setup 0-10** (MA alignment, RSI, MACD, volume)
- **5 Preset Strategy**: Siap Breakout, Uptrend Kuat, Momentum, Volume Spike, Jenuh Jual
- **Filter Advanced**: Indeks (AND logic), Papan, Harga Min/Max, MA, Oscillator
- **Multiple Ticker Search**: Ketik "BBCA BBRI TLKM" → langsung filter
- **Responsive Mobile**: Font besar, sticky header, touch-optimized
- **Help Popup**: Penjelasan lengkap semua istilah & formula

---

## ⚠️ Disclaimer

**Bukan rekomendasi investasi.** Screener ini hanya alat bantu analisis teknikal. Keputusan trading sepenuhnya tanggung jawab Anda. Selalu lakukan riset fundamental dan kelola risiko dengan baik.

---

## 📝 Credits

- Data: [Yahoo Finance](https://finance.yahoo.com)
- Auto-update: GitHub Actions
- Hosting: GitHub Pages (gratis)

Made with ❤️ for Indonesian traders
