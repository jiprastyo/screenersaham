import streamlit as st
import yfinance as yf
import pandas as pd
import pandas_ta as ta

# 1. Konfigurasi UI & Sembunyikan Hamburger Menu
st.set_page_config(layout="wide", page_title="IHSG Screener")

hide_style = """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    /* Menyamaratakan font agar terlihat konsisten */
    html, body, [class*="css"]  {
        font-family: 'Source Sans Pro', sans-serif;
        font-size: 16px;
    }
    </style>
"""
st.markdown(hide_style, unsafe_allow_html=True)

st.title("🚀 IHSG Technical Stock Screener")

# List Saham (Pastikan ticker valid)
ticker_list = ["BBCA.JK", "BBRI.JK", "TLKM.JK", "ASII.JK", "ADRO.JK", "GOTO.JK", "ICBP.JK"]

@st.cache_data
def get_data(tickers):
    screened_data = []
    for ticker in tickers:
        try:
            df = yf.download(ticker, period="1y", interval="1d", progress=False)
            if df.empty or len(df) < 200: continue
            
            # Hitung Moving Averages
            for ma in [3, 5, 10, 20, 50, 100, 200]:
                df[f'MA{ma}'] = ta.sma(df['Close'], length=ma)
            
            # Indikator Lain
            df['RSI'] = ta.rsi(df['Close'], length=14)
            df['ATR'] = ta.atr(df['High'], df['Low'], df['Close'], length=14)
            df['ADR_Pct'] = ((df['High'] - df['Low']) / df['Low']).rolling(window=14).mean() * 100
            
            latest = df.iloc[-1]
            prev_close = df.iloc[-2]['Close']
            
            # Status Syariah (Contoh)
            is_syariah = "Ya" if ticker in ["TLKM.JK", "ADRO.JK", "ICBP.JK"] else "Tidak"

            screened_data.append({
                "Ticker": ticker,
                "Price": float(latest['Close']),
                "Change %": float(((latest['Close'] - prev_close) / prev_close) * 100),
                "Value (B)": float((latest['Close'] * latest['Volume']) / 1e9),
                "RSI": float(latest['RSI']),
                "ADR %": float(latest['ADR_Pct']),
                "Syariah": is_syariah,
                "Above MA20": bool(latest['Close'] > latest['MA20']),
                "Above MA200": bool(latest['Close'] > latest['MA200'])
            })
        except Exception as e:
            continue
            
    return pd.DataFrame(screened_data)

# Sidebar
st.sidebar.header("Filter Kriteria")
min_value = st.sidebar.number_input("Min Transaksi (Miliar IDR)", value=0.0, step=1.0)
syariah_only = st.sidebar.checkbox("Hanya Saham Syariah")

# Load Data
df_result = get_data(ticker_list)

# Penanganan Error: Cek apakah data tersedia sebelum filtering
if not df_result.empty:
    # Filter Logic
    if syariah_only:
        df_result = df_result[df_result['Syariah'] == "Ya"]
    
    df_result = df_result[df_result['Value (B)'] >= min_value]

    # Tampilkan Tabel
    st.dataframe(
        df_result.style.format({
            "Price": "{:,.0f}", 
            "Change %": "{:.2f}%", 
            "Value (B)": "{:.2f}", 
            "RSI": "{:.2f}", 
            "ADR %": "{:.2f}"
        }),
        use_container_width=True
    )
else:
    st.error("Data tidak ditemukan atau gagal mengambil data dari Yahoo Finance. Coba lagi nanti.")
