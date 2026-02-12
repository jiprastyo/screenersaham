# 📊 Screener Saham Indonesia v2.0

Stock screener untuk pasar saham Indonesia dengan analisis teknikal otomatis.  
**Versi 2.0** — Major upgrade dengan 12 kolom data dan fitur filter advanced.

---

## 🆕 What's New in v2.0

### **🗄️ Separated Database**
- **`stocks_data.js`** — Database terpisah dengan 956 tickers + metadata
- Update saham dan kategori **tanpa touch HTML/CSS/logic**
- Mudah maintain dan extend

### **📊 Enhanced Table (12 Columns)**
```
Ticker | Skor | Harga | %Chg | 1%Entry | MA(7) | Vol | 
RSI | StochRSI | MACD | ATR | ADR
```

**Key improvements:**
- ✅ **Tooltips di semua header** — Hover untuk lihat penjelasan
- ✅ **StochRSI column** — Momentum sensitif tambahan
- ✅ **ATR column** — Average True Range untuk stop loss
- ✅ **MACD enhanced** — Tampil histogram value
- ✅ **ADR detailed** — % dan nominal value
- ✅ **1% Entry** — Modal wajar untuk tidak mencolok
- ✅ **MA tooltips** — Hover dot untuk lihat EMA3/5/10/20, SMA50/100/200

### **🎨 Compact Design**
- **~30% lebih narrow** — Lebih banyak data fit di screen
- **No vertical borders** — Cleaner look
- **Smaller fonts & padding** — Efficient use of space
- **Mobile optimized** — Hide non-critical columns on small screens

### **🔍 New Filters**

#### **Fraksi Harga** (by IHSG tick size)
- `< Rp 200` — fraksi Rp 1
- `Rp 200-500` — fraksi Rp 2
- `Rp 500-2K` — fraksi Rp 5
- `Rp 2K-5K` — fraksi Rp 10
- `> Rp 5K` — fraksi Rp 25

Useful untuk:
- Filter saham by price range
- Avoid stocks with awkward tick sizes
- Find suitable entry points

#### **VMA Volume** (6 options)
- VMA 3, 5, 10, 20, 50, 200
- Filter stocks with volume above moving average
- Combine multiple VMAs for strong volume confirmation

---

## 🚀 Quick Start

### **1. Clone & Setup**
```bash
git clone https://github.com/USERNAME/screenersaham.git
cd screenersaham

# Pastikan struktur file:
# ├── stocks_data.js       ← NEW! Database terpisah
# ├── index.html           ← atau index_v2.html
# ├── fetch_data.js
# ├── package.json
# ├── .github/workflows/update-data.yml
# └── data/
#     ├── .gitkeep
#     └── issi_data.json
```

### **2. GitHub Pages**
```
Settings → Pages → Source: main/(root) → Save
Wait ~1 min → Site live
```

### **3. GitHub Actions**
```
Settings → Actions → General
✓ Read and write permissions
✓ Allow GitHub Actions to create PRs
Save

Tab Actions → Update Data Saham → Run workflow
Wait 10-15 min → Data generated
```

### **4. Verify**
```
Refresh website → Should see 956 stocks with full data
```

---

## 📊 Features Deep Dive

### **Column Explanations** (hover headers for tooltips)

| Column | Description | Formula/Logic |
|--------|-------------|---------------|
| **Ticker** | Kode saham (clickable → TradingView) | Link to chart |
| **Skor** | Setup score 0-10 | MA×7 + RSI×1.5 + MACD×1 + Vol×0.5 |
| **Harga** | Last closing price | From Yahoo Finance |
| **% Chg** | Daily price change | `(Price - PrevClose) / PrevClose × 100` |
| **1% Entry** | 1% of daily transaction value | `Volume × Price × 0.01` |
| **MA (7)** | Price above which MAs? | EMA3/5/10/20 + SMA50/100/200 |
| **Vol** | Volume vs VMA average | Compare to VMA3/5/20/50 |
| **RSI** | Relative Strength Index (14) | <35 oversold, 50-70 sweet spot, >80 overbought |
| **StochRSI** | Stochastic RSI | More sensitive momentum indicator |
| **MACD** | Moving Average Convergence Divergence | Histogram: positive=bullish, negative=bearish |
| **ATR** | Average True Range | Volatility for stop loss (Price - 2×ATR) |
| **ADR** | Average Daily Range | % and nominal daily movement |

### **Setup Score System**
```
Total: 0–10 points

MA Alignment (7 pts):
  +1 for each MA price is above
  (EMA3, EMA5, EMA10, EMA20, SMA50, SMA100, SMA200)

RSI Sweet Spot (1.5 pts):
  RSI 50-70: +1.5 (ideal entry zone)
  RSI 70-80: +0.5 (still ok)
  RSI 40-50: +0.5 (building momentum)

MACD Bullish (1 pt):
  Histogram > 0: +1

Volume Active (0.5 pt):
  Volume > VMA20: +0.5

Labels:
  ≥8.0 = KUAT (strong setup)
  6.0-7.9 = BAGUS (good setup)
  4.0-5.9 = PANTAU (watch)
  <4.0 = LEMAH (weak)
```

### **Preset Strategies**

**🚀 Siap Breakout**
- EMA5 ✓ + EMA20 ✓
- RSI 50-70
- MACD Bullish
- Volume > VMA20

**📈 Uptrend Kuat**
- 5+ of 7 MA ✓
- MACD Bullish
- EMA20 ✓

**⚡ Momentum Naik**
- RSI 55-75
- MACD Bullish
- EMA20 ✓

**🔊 Volume Spike**
- Volume > VMA3+5+20
- EMA20 ✓

**🔍 Jenuh Jual**
- RSI < 35

---

## 🔧 Advanced Usage

### **Combining Filters**

**Example 1: Blue-chip momentum plays**
```
Indeks: LQ45 + ISSI (AND logic)
Preset: Momentum Naik
Fraksi: > Rp 5K
Result: Liquid large-caps with strong momentum
```

**Example 2: Mid-cap breakout candidates**
```
Papan: Utama
Preset: Siap Breakout
Fraksi: Rp 2K-5K
VMA: VMA20 + VMA50
Result: Mid-caps with volume confirmation
```

**Example 3: Oversold bounce (high risk)**
```
Preset: Jenuh Jual
MA: EMA20 ✓ + SMA50 ✓ (still in uptrend)
Fraksi: < Rp 500 (avoid penny stocks)
Result: Oversold in uptrend with catalyst potential
```

### **Search Multiple Tickers**
```
Type: "BBCA BBRI TLKM GOTO"
Separate with spaces
Useful for monitoring watchlist
```

### **Sorting**
```
Click any column header to sort
Click again to reverse order
Default: Score (descending)
```

---

## 📱 Mobile Optimization

**Hidden on mobile** (< 768px):
- StochRSI column
- ATR column
- ADR nominal value (% still visible)

**Why?**
- Focus on most critical data
- Better horizontal scroll experience
- Less cluttered on small screens

**To see all data:**
- Rotate to landscape, OR
- Horizontal scroll table, OR
- Use desktop/tablet

---

## 🗄️ Database Management

### **Update Stock List**

Edit `stocks_data.js`:

```javascript
// Add new ticker
const TK = [...existing, "NEWT"];

// Add metadata
const TM = {
  ...existing,
  "NEWT": {
    p: "Utama",              // Papan
    i: ["ISSI", "LQ45"]      // Indeks
  }
};
```

Commit & push → workflow will fetch data for new ticker.

### **Update Categories**

Change Papan or Indeks:

```javascript
"BBCA": {
  p: "Utama",  // Change this
  i: ["ISSI", "LQ45", "KOMPAS100"]  // Or this
}
```

No need to touch HTML!

---

## 🔄 Data Update Schedule

**Automatic via GitHub Actions:**
- **09:00 WIB** — Before market open
- **12:00 WIB** — Mid-day
- **17:30 WIB** — After market close

**Manual trigger:**
```
Actions → Update Data Saham → Run workflow
```

**Data source:** Yahoo Finance API

---

## 🐛 Troubleshooting

### **Table empty despite data**
```
1. F12 → Console → Check for errors
2. Hard refresh: Ctrl+Shift+R
3. Verify stocks_data.js loaded:
   Console: type "TK" → should see array
4. Check data/issi_data.json size >100 KB
```

### **Missing columns (StochRSI, ATR)**
```
- Check if using index_v2.html (not old index.html)
- Verify fetch_data.js has VMA10/200 calculation
- Re-run workflow to regenerate data
```

### **Filters not working**
```
- Check Console for JS errors
- Verify filter chips clickable
- Try "Reset Semua" then re-apply
```

### **Workflow fails**
```
Common causes:
- Permissions not set (read/write)
- Yahoo Finance timeout (retry)
- npm install fail (check package.json)

See TROUBLESHOOTING.md for detailed guide
```

---

## 📦 File Structure

```
screenersaham/
├── index_v2.html          # Main frontend (v2)
├── stocks_data.js         # Database (956 tickers) ← NEW!
├── fetch_data.js          # Data fetcher (with VMA10/200)
├── package.json           # Dependencies
├── .github/
│   └── workflows/
│       └── update-data.yml  # Auto-update (3x daily)
├── data/
│   ├── .gitkeep
│   └── issi_data.json     # Generated data
├── README_v2.md           # This file
└── UPGRADE_GUIDE_v2.md    # Migration guide from v1
```

---

## 🔄 Migration from v1

**If upgrading from v1:**

1. **Backup** current index.html
2. **Upload** new files:
   - `stocks_data.js` (NEW)
   - `index_v2.html` → rename to `index.html`
   - `fetch_data.js` (updated with VMA10/200)
3. **Commit & push**
4. **Run workflow** to regenerate data with new VMA
5. **Test** all features work

See `UPGRADE_GUIDE_V2.md` for detailed instructions.

---

## ⚠️ Disclaimer

**Bukan rekomendasi investasi.**

Screener ini hanya alat bantu analisis teknikal. Keputusan trading sepenuhnya tanggung jawab Anda. Selalu:
- Lakukan riset fundamental
- Perhatikan manajemen risiko
- Jangan trade dengan uang yang tidak bisa Anda rugikan
- Konsultasi dengan financial advisor jika perlu

---

## 📝 Credits

- **Data**: [Yahoo Finance](https://finance.yahoo.com)
- **Auto-update**: GitHub Actions
- **Hosting**: GitHub Pages (free)
- **Charts**: [TradingView](https://www.tradingview.com)

---

## 🆘 Support

**Need help?**
- Read `TROUBLESHOOTING.md`
- Check `UPGRADE_GUIDE_V2.md`
- Open GitHub Issue
- Check Console (F12) for errors

---

Made with ❤️ for Indonesian traders

**Version:** 2.0  
**Last Updated:** 2024-02-12  
**Changelog:** See UPGRADE_GUIDE_V2.md
