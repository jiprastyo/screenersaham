import streamlit as st
import yfinance as yf
import pandas as pd
import pandas_ta as ta

# --- 1. Konfigurasi Mobile-First & CSS ---
st.set_page_config(page_title="Strong Uptrend Screener", layout="wide")

mobile_css = """
    <style>
    /* Sembunyikan elemen bawaan Streamlit yang memakan tempat */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Mengurangi Padding Atas Bawah Kiri Kanan agar Full Screen di HP */
    .block-container {
        padding-top: 1rem !important;
        padding-bottom: 1rem !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
    }
    
    /* Menyamaratakan Ukuran Font & Jenis Font */
    html, body, [class*="css"], .stDataFrame {
        font-family: 'Roboto', sans-serif;
        font-size: 14px !important;
    }
    
    /* Mengatur Header Tabel agar tidak terlalu besar */
    .stDataFrame th {
        font-size: 13px !important;
        padding: 5px !important;
    }
    </style>
"""
st.markdown(mobile_css, unsafe_allow_html=True)

# --- 2. Data & Setup ---
# Tips: Tambahkan kode saham lainnya sesuai kebutuhan Anda
daftar_saham = [
    "BBCA.JK", "BBRI.JK", "BMRI.JK", "BBNI.JK", "TLKM.JK", "ASII.JK", 
    "UNTR.JK", "ICBP.JK", "ADRO.JK", "PTBA.JK", "PGAS.JK", "ANTM.JK", 
    "BRIS.JK", "ACES.JK", "SIDO.JK", "GOTO.JK", "MDKA.JK", "INKP.JK",
    "CPIN.JK", "KLBF.JK", "SMGR.JK", "INCO.JK", "TINS.JK", "MEDC.JK"
]

# Database Syariah (Simulasi)
saham_syariah = [
    "TLKM.JK", "ASII.JK", "UNTR.JK", "ICBP.JK", "ADRO.JK", "PTBA.JK", 
    "PGAS.JK", "ANTM.JK", "BRIS.JK", "ACES.JK", "SIDO.JK", "GOTO.JK",
    "MDKA.JK", "INKP.JK", "CPIN.JK", "KLBF.JK", "SMGR.JK", "INCO.JK",
    "TINS.JK", "MEDC.JK"
]

# --- 3. Fungsi Screener (Optimized) ---
@st.cache_data(ttl=300) # Cache 5 menit
def get_strong_momentum_stocks(tickers):
    results = []
    
    # Progress bar kecil di atas
    bar = st.progress(0)
    
    for i, ticker in enumerate(tickers):
        bar.progress((i + 1) / len(tickers))
        try:
            # Ambil data secukupnya (6 bulan cukup untuk MA200)
            df = yf.download(ticker, period="6mo", interval="1d", progress=False)
            
            if df.empty or len(df) < 50: continue # Skip jika data tidak cukup
            
            # Hitung Indikator Wajib (MA Pendek)
            close = df['Close']
            ma3 = ta.sma(close, length=3).iloc[-1]
            ma5 = ta.sma(close, length=5).iloc[-1]
            ma10 = ta.sma(close, length=10).iloc[-1]
            ma20 = ta.sma(close, length=20).iloc[-1]
            last_price = close.iloc[-1]

            # --- CORE LOGIC: PRE-FILTER ---
            # Hanya ambil jika Harga > MA3, MA5, MA10, DAN MA20
            is_strong_uptrend = (
                last_price > ma3 and 
                last_price > ma5 and 
                last_price > ma10 and 
                last_price > ma20
            )

            if is_strong_uptrend:
                # Jika lolos filter awal, baru hitung indikator tambahan (hemat resource)
                ma50 = ta.sma(close, length=50).iloc[-1]
                ma100 = ta.sma(close, length=100).iloc[-1]
                ma200 = ta.sma(close, length=200).iloc[-1] if len(df) >= 200 else 0
                
                rsi = ta.rsi(close, length=14).iloc[-1]
                atr = ta.atr(df['High'], df['Low'], close, length=14).iloc[-1]
                
                # ADR %
                high = df['High']
                low = df['Low']
                daily_range_pct = ((high - low) / low) * 100
                adr_pct = daily_range_pct.rolling(window=14).mean().iloc[-1]
                
                # Transaksi
                vol = df['Volume'].iloc[-1]
                val_m = (last_price * vol) / 1_000_000_000
                
                # Syariah Check
                is_syariah = "S" if ticker in saham_syariah else "-"

                results.append({
                    "Kode": ticker.replace(".JK", ""),
                    "Harga": last_price,
                    "Sya": is_syariah, # Singkatan agar muat di HP
                    "RSI": rsi,
                    "Val(M)": val_m,
                    "ADR%": adr_pct,
                    "MA50": "UP" if last_price > ma50 else "DOWN", # Ringkas
                    "MA200": "UP" if last_price > ma200 else "DOWN"
                })
                
        except:
            continue
            
    bar.empty()
    return pd.DataFrame(results)

# --- 4. UI Compact Mobile ---
st.write("🔥 **Strong Momentum (Price > MA 3,5,10,20)**")

# Filter UI (Expander Default Tertutup agar hemat tempat)
with st.expander("⚙️ Filter Tambahan"):
    col1, col2 = st.columns(2)
    min_tx = col1.number_input("Min Tx (M)", value=5)
    filter_syariah = col2.checkbox("Syariah Only", value=True)

# Main Process
df_result = get_strong_momentum_stocks(daftar_saham)

if not df_result.empty:
    # Filter Logic User
    if filter_syariah:
        df_result = df_result[df_result['Sya'] == "S"]
    
    df_result = df_result[df_result['Val(M)'] >= min_tx]
    
    # Sort berdasarkan RSI (Kekuatan Tren)
    df_result = df_result.sort_values(by="RSI", ascending=False)
    
    # Display Compact
    st.write(f"Ditemukan: {len(df_result)} saham")
    
    # Styling Tabel:
    # - Harga diberi warna background hijau tipis (karena sudah pasti uptrend)
    # - Angka diformat tanpa desimal berlebih
    st.dataframe(
        df_result.style.format({
            "Harga": "{:,.0f}",
            "RSI": "{:.0f}",
            "Val(M)": "{:.1f}",
            "ADR%": "{:.1f}%"
        }).background_gradient(subset=['RSI'], cmap='Greens'),
        use_container_width=True,
        hide_index=True # Sembunyikan index 0,1,2 agar hemat tempat
    )
else:
    st.info("Belum ada saham yang memenuhi kriteria Super Short Term Uptrend saat ini.")
