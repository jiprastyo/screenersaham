import streamlit as st
import yfinance as yf
import pandas as pd
import pandas_ta as ta

# --- 1. Konfigurasi Halaman & CSS Mobile-First ---
st.set_page_config(page_title="Super Uptrend Screener", layout="wide")

# CSS: Hapus Hamburger, Header, Footer, Padding, dan Samakan Font
hide_style = """
    <style>
    /* Sembunyikan elemen bawaan Streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Atur Font Seragam & Hemat Ruang */
    html, body, [class*="css"]  {
        font-family: 'Roboto', sans-serif;
        font-size: 14px !important; 
    }
    
    /* Perkecil padding atas agar konten naik */
    .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
    
    /* Styling Tabel agar compact */
    div[data-testid="stDataFrame"] {
        font-size: 12px;
    }
    </style>
"""
st.markdown(hide_style, unsafe_allow_html=True)

# --- 2. Database Saham & Syariah ---
# Tips: Tambahkan saham liquid lainnya di sini
daftar_saham = [
    "BBCA.JK", "BBRI.JK", "BMRI.JK", "BBNI.JK", "TLKM.JK", "ASII.JK", 
    "UNTR.JK", "ICBP.JK", "ADRO.JK", "PTBA.JK", "PGAS.JK", "ANTM.JK", 
    "BRIS.JK", "ACES.JK", "SIDO.JK", "GOTO.JK", "MEDC.JK", "INKP.JK",
    "KLBF.JK", "CPIN.JK", "AMRT.JK", "MAPI.JK"
]

# Mapping Syariah (Manual/Contoh)
saham_syariah = [
    "TLKM.JK", "ASII.JK", "UNTR.JK", "ICBP.JK", "ADRO.JK", "PTBA.JK", 
    "PGAS.JK", "ANTM.JK", "BRIS.JK", "ACES.JK", "SIDO.JK", "GOTO.JK",
    "INKP.JK", "KLBF.JK", "CPIN.JK", "AMRT.JK", "MAPI.JK"
]

# --- 3. Logic Screener (Heavy Filtering) ---
@st.cache_data(ttl=1800) # Cache 30 menit
def get_super_uptrend_stocks(tickers, min_tx_val):
    results = []
    
    # Progress Bar sederhana
    progress_text = st.empty()
    bar = st.progress(0)
    
    for i, ticker in enumerate(tickers):
        bar.progress((i + 1) / len(tickers))
        try:
            # Ambil data secukupnya (MA200 butuh ~1 tahun data trading)
            df = yf.download(ticker, period="2y", interval="1d", progress=False)
            
            if df.empty or len(df) < 200: continue
            
            close = df['Close']
            current_price = close.iloc[-1]
            
            # --- FILTER UTAMA: HARGA > SEMUA MA ---
            # Kita cek satu per satu agar hemat komputasi (fail fast)
            ma_periods = [3, 5, 10, 20, 50, 100, 200]
            passed_all_ma = True
            
            for ma in ma_periods:
                ma_val = ta.sma(close, length=ma).iloc[-1]
                if current_price < ma_val:
                    passed_all_ma = False
                    break # Gagal salah satu MA, langsung skip saham ini
            
            if not passed_all_ma:
                continue # Skip ke saham berikutnya
            
            # --- Jika Lolos Filter MA, Baru Hitung Indikator Lain ---
            # 1. Transaksi
            vol = df['Volume'].iloc[-1]
            val_milyar = (current_price * vol) / 1_000_000_000
            
            # Filter Transaksi (dilakukan di sini agar data yang keluar bersih)
            if val_milyar < min_tx_val:
                continue

            # 2. Indikator Tambahan
            rsi = ta.rsi(close, length=14).iloc[-1]
            atr = ta.atr(df['High'], df['Low'], close, length=14).iloc[-1]
            adr_pct = ((df['High'] - df['Low']) / df['Low']).rolling(14).mean().iloc[-1] * 100
            is_syariah = True if ticker in saham_syariah else False

            results.append({
                "Kode": ticker.replace(".JK", ""),
                "Harga": current_price,
                "RSI": rsi,
                "Val(M)": val_milyar,
                "ADR%": adr_pct,
                "ATR": atr,
                "Syr": is_syariah # Boolean untuk checkbox
            })
            
        except:
            continue
            
    progress_text.empty()
    bar.empty()
    return pd.DataFrame(results)

# --- 4. Tampilan UI Compact ---
st.write("#### 🚀 Super Uptrend (Price > All MA)")

# Input Filter (Disederhanakan menjadi satu baris)
col1, col2 = st.columns([1, 1])
with col1:
    min_val = st.number_input("Min Tx (Miliar)", value=5, step=5)
with col2:
    only_syariah = st.checkbox("Syariah Only", value=False)

# Tombol Eksekusi
if st.button("Scan Market", type="primary", use_container_width=True):
    
    df = get_super_uptrend_stocks(daftar_saham, min_val)
    
    if not df.empty:
        # Filter Syariah Terakhir (jika dicentang)
        if only_syariah:
            df = df[df['Syr'] == True]
        
        # Urutkan berdasarkan Value Transaksi terbesar (Paling Liquid di atas)
        df = df.sort_values(by="Val(M)", ascending=False)

        # Tampilkan Dataframe dengan Konfigurasi Mobile Friendly
        st.dataframe(
            df,
            column_config={
                "Kode": st.column_config.TextColumn("Kode", width="small"),
                "Harga": st.column_config.NumberColumn("Harga", format="%d"),
                "RSI": st.column_config.NumberColumn("RSI", format="%.0f"), # Bulatkan RSI
                "Val(M)": st.column_config.ProgressColumn("Val (M)", format="%.1f M", min_value=0, max_value=df['Val(M)'].max()),
                "ADR%": st.column_config.NumberColumn("ADR", format="%.1f%%"),
                "ATR": st.column_config.NumberColumn("ATR", format="%d"),
                "Syr": st.column_config.CheckboxColumn("Syr", width="small")
            },
            hide_index=True,
            use_container_width=True
        )
        st.caption(f"Total: {len(df)} saham. Semua di atas MA 3,5,10,20,50,100,200.")
    else:
        st.warning("Tidak ada saham yang memenuhi kriteria 'Super Uptrend' saat ini.")
