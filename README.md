<h1 align="center">Screener Saham Pribadi</h1>
<p align="center"><em>Dokumentasi Istilah, Formula, dan Kerangka Pikir</em></p>

---

## Daftar Isi

1. [Prolog](#prolog)
2. [Bab 1 - Tujuan Dokumen](#bab-1---tujuan-dokumen)
3. [Bab 2 - Istilah Utama di Aplikasi](#bab-2---istilah-utama-di-aplikasi)
4. [Bab 3 - Penjelasan Kolom dan Filter](#bab-3---penjelasan-kolom-dan-filter)
5. [Bab 4 - Formula Indikator](#bab-4---formula-indikator)
6. [Bab 5 - Formula Skor Setup](#bab-5---formula-skor-setup)
7. [Bab 6 - Preset Strategi](#bab-6---preset-strategi)
8. [Bab 7 - Versi Ringkas untuk User Umum](#bab-7---versi-ringkas-untuk-user-umum)
9. [Bab 8 - Keterbatasan Data dan Metode](#bab-8---keterbatasan-data-dan-metode)
10. [Lampiran Referensi](#lampiran-referensi)
11. [Penutup](#penutup)

---

## Prolog

> Screener ini saya buat sebagai alat bantu pribadi.

Dokumen ini bukan rekomendasi pemilihan saham, bukan sinyal beli, dan bukan ajakan untuk mengikuti sistem saya.

Setiap orang yang menggunakan output screener ini untuk keputusan investasi atau trading bertanggung jawab penuh atas keputusan dan risikonya sendiri.

Pengguna wajib memahami bahwa investasi dan trading memiliki risiko nyata, termasuk kemungkinan kehilangan sebagian atau seluruh modal.

---

## Bab 1 - Tujuan Dokumen

Dokumen ini disusun untuk tiga tujuan utama:

- Menjelaskan istilah yang tampil di screener dalam bahasa non-teknis.
- Menjelaskan cara hitung indikator dan skor yang dipakai aplikasi.
- Menjelaskan kerangka pikir pribadi saya saat memakai screener, tanpa mengarahkan pengguna untuk meniru keputusan.

---

## Bab 2 - Istilah Utama di Aplikasi

### 2.1 Identitas Saham

**Ticker**

Kode saham emiten, misalnya `BBCA`, `BBRI`, `TLKM`.

**Company**

Nama perusahaan emiten.

**Harga / Chg**

Harga penutupan terakhir dan perubahan harian.

Formula:

```text
%Chg = ((Harga_Terakhir - Harga_Sebelumnya) / Harga_Sebelumnya) x 100%
```

### 2.2 Klasifikasi Emiten

**Papan**

- Utama
- Pengembangan
- Akselerasi
- Ekonomi Baru
- Pemantauan Khusus

**Sektor**

- Bahan Baku
- Consumer
- Energi
- Industri
- Infrastruktur
- Kesehatan
- Keuangan
- Properti
- Siklikal
- Teknologi
- Transportasi

**Indeks (yang tersedia di filter)**

- ISSI
- LQ45
- KOMPAS100
- BUMN

### 2.3 Timeframe

- `1D`: data harian.
- `1W`: data mingguan (dibentuk dari agregasi data harian).

### 2.4 Referensi Resmi IDX untuk Tag di Screener

- **Tag Papan** pada screener merujuk kategori papan pencatatan di BEI: [Papan Pencatatan](https://www.idx.id/id/produk/saham/papan-pencatatan/)
- **Tag Sektor** pada screener merujuk klasifikasi sektor IDX-IC: [Pengenalan Klasifikasi IDX-IC](https://www.idx.id/id/berita/artikel/pengenalan-klasifikasi-industri-idx-ic-indonesia-stock-exchange-industrial-classification/)
- **Tag Indeks** pada screener merujuk kelompok produk indeks BEI (misalnya keluarga LQ45, KOMPAS100, ISSI, dan indeks bertema BUMN): [Produk Indeks](https://www.idx.id/id/produk/indeks/)
- **Tag Fraksi Harga** pada screener merujuk ketentuan satuan perdagangan dan fraksi harga BEI: [SK Perubahan Peraturan II-A (Fraksi Harga)](https://www.idx.id/media/15715/sk-kep-00071-bei_112023-perubahan-peraturan-nomor-ii-a-tentang-perdagangan-efek-bersifat-ekuitas.pdf)

---

## Bab 3 - Penjelasan Kolom dan Filter

### 3.1 Kolom MA / Vol

Kolom ini memperlihatkan apakah harga dan volume saat ini berada di atas rata-ratanya.

**MA labels**

- `E3`, `E5`, `E10`, `E20` = EMA 3, 5, 10, 20
- `S50`, `S1`, `S2` = SMA 50, 100, 200

**Vol labels**

- `V3`, `V5`, `V10`, `V20`, `V50`, `V1`, `V2` = VMA 3, 5, 10, 20, 50, 100, 200

Interpretasi umum:

- Makin banyak MA aktif, tren harga cenderung lebih kuat.
- Makin banyak VMA ditembus, aktivitas transaksi cenderung lebih tinggi.

### 3.2 Kolom 1% Transaksi

**1% Transaksi 1D**

```text
1%Trx1D = (Volume_Hari_Ini x Harga_Hari_Ini) x 0.01
```

**1% Transaksi 20D**

```text
AvgValue20 = rata-rata(Volume x Harga) 20 hari
1%Trx20D = AvgValue20 x 0.01
```

Fungsi praktis: membantu menilai apakah ukuran modal sesuai dengan likuiditas saham.

### 3.3 Kolom RSI / StochRSI

**RSI**

- `<30`: Oversold
- `30 sampai <50`: Lemah
- `50 sampai 70`: Sweet
- `>70 sampai 80`: Kuat
- `>80`: Overbought

**StochRSI**

- `<20`: Oversold
- `20 sampai 80`: Netral
- `>80`: Overbought

### 3.4 Kolom ATR / ADR

- `ATR`: volatilitas nominal harian.
- `ADR`: rata-rata rentang gerak harian.

Kategori aktivitas volatilitas di aplikasi:

- `Lesu`: <1.5%
- `Normal`: 1.5% sampai <5%
- `Aktif`: >=5%

### 3.5 Kolom MACD

- `MACD Bull`: histogram positif.
- `MACD Bear`: histogram negatif.
- `MACD Cross`: tanda histogram berubah dari periode sebelumnya.

### 3.6 Logika Filter

- Preset aktif menjadi filter utama.
- Indeks memakai mode **AND** (harus memenuhi semua indeks yang dipilih).
- Papan, sektor, rentang harga, rentang RSI, rentang StochRSI, rentang ATR, rentang ADR memakai **OR** di dalam grup masing-masing.
- MA dan VMA memakai **AND** antar item yang dipilih.
- Min/Max harga manual membatasi harga absolut.

---

## Bab 4 - Formula Indikator

### 4.1 EMA

```text
k = 2 / (p + 1)
EMA_awal = rata-rata p data awal
EMA_baru = Harga_sekarang x k + EMA_sebelumnya x (1 - k)
```

### 4.2 SMA

```text
SMA = rata-rata p data terakhir
```

### 4.3 RSI (14)

Implementasi aplikasi memakai 15 data penutupan terakhir untuk menghasilkan RSI 14.

```text
AvgGain = total kenaikan / 14
AvgLoss = total penurunan / 14
Jika AvgLoss = 0, RSI = 100
RS = AvgGain / AvgLoss
RSI = 100 - (100 / (1 + RS))
```

### 4.4 StochRSI

```text
StochRSI = ((RSI_terakhir - RSI_min14) / (RSI_max14 - RSI_min14)) x 100
Jika RSI_max14 = RSI_min14, nilai dikembalikan 50
```

### 4.5 MACD (12,26,9)

```text
MACD_Line = EMA12 - EMA26
Signal = EMA9(MACD_Line)
Histogram = MACD_Line - Signal
macdBull = Histogram > 0
macdCross = tanda(Histogram) berubah vs periode sebelumnya
```

### 4.6 ATR (14)

```text
TR = max(High-Low, abs(High-Close_prev), abs(Low-Close_prev))
ATR14 = rata-rata 14 TR terakhir
```

### 4.7 ADR (14)

```text
ADR_nom = rata-rata(High-Low) 14 hari
ADR_pct = rata-rata((High-Low)/Low) 14 hari x 100
```

### 4.8 ATR% untuk Klasifikasi Volatilitas

```text
ATR_pct = (ATR / Harga) x 100
```

### 4.9 Konversi Nilai ke Lot

```text
Lembar = Nilai_Uang / Harga
Lot = floor(Lembar / 100)
```

Catatan: 1 lot = 100 lembar.

### 4.10 Fraksi Harga (Tick Size)

- Harga <200: tick 1
- 200 sampai <500: tick 2
- 500 sampai <2000: tick 5
- 2000 sampai <5000: tick 10
- >=5000: tick 25

```text
Harga_Fraksi_Bawah = floor(Harga / tick) x tick
```

### 4.11 Estimasi SL pada Kolom ATR

```text
SL = pembulatan fraksi dari (Harga - 2 x ATR)
```

---

## Bab 5 - Formula Skor Setup

Skor setup adalah skor komposit `0 sampai 10`.

```text
Skor = Poin_MA + Poin_RSI + Poin_MACD + Poin_Volume
```

Skor dibatasi maksimum 10 dan dibulatkan 1 desimal.

### 5.1 Komponen MA (maks 7)

+1 poin untuk setiap kondisi benar:

- Harga > EMA3
- Harga > EMA5
- Harga > EMA10
- Harga > EMA20
- Harga > SMA50
- Harga > SMA100
- Harga > SMA200

### 5.2 Komponen RSI (maks 1.5)

- RSI 50 sampai 70: +1.5
- RSI >70 sampai 80: +0.5
- RSI >=40 sampai <50: +0.5

### 5.3 Komponen MACD (maks 1)

- Jika `macdBull = true`: +1

### 5.4 Komponen Volume (maks 0.5)

- Jika `Volume > VMA20`: +0.5

### 5.5 Label Skor

- `>=8`: KUAT
- `>=6 sampai <8`: BAGUS
- `>=4 sampai <6`: PANTAU
- `<4`: LEMAH

---

## Bab 6 - Preset Strategi

Bagian ini menjelaskan rule preset di aplikasi, lalu konteks teori yang saya pakai sebagai referensi berpikir.

### 6.1 Trend Kuat

**Rule di aplikasi**

- Minimal 5 dari 7 MA aktif
- EMA20 aktif
- SMA50 aktif
- MACD Bull
- RSI 45 sampai 80

**Konteks berpikir pribadi**

Saya memakainya untuk fokus ke saham yang sudah menunjukkan struktur uptrend relatif matang, selaras dengan konsep *trend template* Minervini.

### 6.2 Siap Breakout

**Rule di aplikasi**

- EMA3, EMA5, EMA10, EMA20 aktif
- RSI 50 sampai 70
- MACD Bull
- Salah satu dari VMA3 atau VMA5 atau VMA20 aktif

**Konteks berpikir pribadi**

Saya memakainya untuk mencari kandidat breakout berbasis momentum ala O'Neil/CAN SLIM, dengan perhatian khusus pada konfirmasi volume.

### 6.3 Momentum

**Rule di aplikasi**

- EMA10 aktif
- EMA20 aktif
- RSI 50 sampai 75
- MACD Bull

**Konteks berpikir pribadi**

Saya memakainya saat ingin menumpang laju tren yang sudah berjalan, mendekati kerangka Elder Impulse (tren dan momentum harus searah).

### 6.4 Akumulasi Vol

**Rule di aplikasi**

- Minimal 4 dari 7 VMA aktif
- EMA20 aktif

**Konteks berpikir pribadi**

Saya memakainya untuk menangkap indikasi partisipasi beli yang mulai meningkat, terutama di fase transisi menuju tren naik.

### 6.5 Jenuh Jual

**Rule di aplikasi**

- RSI <35

**Konteks berpikir pribadi**

Saya memakainya untuk skenario kontra-tren jangka pendek. Ini bukan sinyal otomatis; saya tetap menunggu konfirmasi tambahan di chart.

### 6.6 Golden Cross

**Rule di aplikasi**

- EMA10 aktif
- EMA20 aktif
- Belum di atas SMA200
- MACD Bull
- Ada MACD Cross

**Konteks berpikir pribadi**

Saya memakainya sebagai deteksi dini potensi transisi bullish, sambil sadar bahwa sinyal crossover dapat gagal di pasar sideways.

---

## Bab 7 - Versi Ringkas untuk User Umum

### 7.1 Cara Saya Membaca Tabel Secara Cepat

- Saya melihat skor dulu: >=8 kandidat lebih kuat, 6 sampai <8 masih sehat, 4 sampai <6 tahap pantau, <4 bukan prioritas.
- Saya cek MA/Vol untuk menilai kekuatan tren dan aktivitas transaksi.
- Saya cek MACD dan RSI untuk menilai apakah momentum cukup sehat.
- Saya cek ATR/ADR untuk menilai besar kecilnya gerak harga.
- Saya cocokkan 1% transaksi dengan ukuran modal agar tidak memaksa likuiditas.

### 7.2 Cara Saya Memakai Preset

- Trend Kuat: saat saya mencari saham pemimpin tren.
- Siap Breakout: saat saya fokus ke kandidat tembus resistance.
- Momentum: saat saya mencari kelanjutan tren.
- Akumulasi Vol: saat saya mencari penguatan minat beli.
- Jenuh Jual: saat saya mencari pantulan jangka pendek.
- Golden Cross: saat saya mencari fase awal perubahan tren.

### 7.3 Alur Harian yang Biasanya Saya Pakai

1. Pilih preset sesuai konteks pasar yang saya lihat.
2. Kecilkan universe pakai papan, sektor, dan indeks.
3. Sesuaikan filter harga dengan tipe saham dan ukuran modal.
4. Prioritaskan kandidat dengan skor, momentum, dan likuiditas yang lebih baik.
5. Validasi ulang chart sebelum mengeksekusi rencana.

---

## Bab 8 - Keterbatasan Data dan Metode

### 8.1 Keterbatasan Sumber Data

- Data berasal dari Yahoo Finance (pihak ketiga), bukan feed resmi bursa.
- Data dapat mengalami keterlambatan, ketidaklengkapan, atau perbedaan penyesuaian dibanding sumber lain.

### 8.2 Keterbatasan Metode Pengambilan Data

- Pengambilan data bergantung endpoint publik dan kondisi jaringan.
- Permintaan memiliki timeout; sebagian ticker bisa gagal terambil pada siklus tertentu.
- Data mingguan dibangun dari agregasi data harian, bukan data mingguan native.
- Pipeline update memakai ambang cakupan minimum 90%; jadi pada kondisi tertentu, hasil dapat tetap dipublikasikan walau sebagian ticker gagal.
- Proses update bergantung job terjadwal; jika job gagal atau tertunda, data bisa tidak sepenuhnya mutakhir.

### 8.3 Implikasi Penggunaan

- Output screener saya perlakukan sebagai daftar kandidat, bukan keputusan akhir.
- Keputusan transaksi tetap memerlukan validasi manual, skenario risiko, dan batas kerugian yang jelas.

---

## Lampiran Referensi

- Referensi resmi BEI untuk tag Papan: [Papan Pencatatan](https://www.idx.id/id/produk/saham/papan-pencatatan/)
- Referensi resmi BEI untuk tag Sektor (IDX-IC): [Pengenalan Klasifikasi IDX-IC](https://www.idx.id/id/berita/artikel/pengenalan-klasifikasi-industri-idx-ic-indonesia-stock-exchange-industrial-classification/)
- Referensi resmi BEI untuk tag Indeks: [Produk Indeks](https://www.idx.id/id/produk/indeks/)
- Referensi resmi BEI untuk fraksi harga: [SK Perubahan Peraturan II-A](https://www.idx.id/media/15715/sk-kep-00071-bei_112023-perubahan-peraturan-nomor-ii-a-tentang-perdagangan-efek-bersifat-ekuitas.pdf)
- Minervini trend template: [ChartMill](https://www.chartmill.com/documentation/stock-screener/technical-analysis-trading-strategies/496-Mark-Minervini-Trend-Template-A-Step-by-Step-Guide-for-Beginners)
- CAN SLIM (ringkasan): [Investopedia](https://www.investopedia.com/terms/c/canslim.asp)
- Buy zone dan disiplin risiko (IBD): [Investor's Business Daily](https://www.investors.com/how-to-invest/investors-corner/buy-zone-nvidia-stock/)
- Elder Impulse System: [StockCharts ChartSchool](https://chartschool.stockcharts.com/table-of-contents/chart-analysis/chart-types/elder-impulse-system)
- Stage analysis: [Investopedia](https://www.investopedia.com/articles/investing/070715/trading-stage-analysis.asp)
- Golden cross: [StockCharts](https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/moving-average-trading-strategies/trading-using-the-golden-cross)
- Konfirmasi volume breakout (PVO): [StockCharts](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/percentage-volume-oscillator-pvo)
- RSI: [Fidelity](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI)
- StochRSI: [Fidelity](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/stochrsi)

---

## Penutup

Dokumen ini adalah dokumentasi kerja pribadi untuk membantu konsistensi proses screening saya. Silakan dipakai sebagai bahan belajar, tetapi keputusan investasi/trading tetap harus berbasis pertimbangan dan tanggung jawab masing-masing pengguna.
