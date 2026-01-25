import streamlit as st
import yfinance as yf
import pandas as pd
import pandas_ta as ta

# Judul Aplikasi
st.set_page_config(layout="wide")
st.title("🚀 IHSG Technical Stock Screener")

# List Saham Contoh (Bisa ditambah atau load dari CSV)
# Tips: Saham IHSG di Yahoo Finance menggunakan akhiran .JK
ticker_list = ["BBCA.JK", "BBRI.JK", "TLKM.JK", "ASII.JK", "ADRO.JK", "GOTO.JK", "ICBP.JK"]

@st.cache_data
def get_data(tickers):
    screened_data = []
    for ticker in tickers:
        try:
            df = yf.download(ticker, period="1y", interval="1d", progress=False)
            if df.empty: continue
            
            # Hitung Moving Averages
            for ma in [3, 5, 10, 20, 50, 100, 200]:
                df[f'MA{ma}'] = ta.sma(df['Close'], length=ma)
            
            # Hitung RSI
            df['RSI'] = ta.rsi(df['Close'], length=14)
            
            # Hitung ATR & ADR (Average Daily Range %)
            df['ATR'] = ta.atr(df['High'], df['Low'], df['Close'], length=14)
            df['ADR_Pct'] = ((df['High'] - df['Low']) / df['Low']).rolling(window=14).mean() * 100
            
            # Data Terakhir
            latest = df.iloc[-1]
            prev_close = df.iloc[-2]['Close']
            
            # Logika Status Syariah (Manual/Static mapping untuk contoh)
            # Di aplikasi nyata, Anda bisa scraping data ISSI dari IDX
            is_syariah = "Ya" if ticker in ["TLKM.JK", "ADRO.JK", "ICBP.JK"] else "Tidak"

            screened_data.append({
                "Ticker": ticker,
                "Price": latest['Close'],
                "Change %": ((latest['Close'] - prev_close) / prev_close) * 100,
                "Value (B)": (latest['Close'] * latest['Volume']) / 1e9, # Nilai Transaksi dalam Miliar
                "RSI": latest['RSI'],
                "ADR %": latest['ADR_Pct'],
                "ATR": latest['ATR'],
                "Syariah": is_syariah,
                "Above MA20": latest['Close'] > latest['MA20'],
                "Above MA200": latest['Close'] > latest['MA200']
            })
        except:
            continue
    return pd.DataFrame(screened_data)

# Sidebar Filter
st.sidebar.header("Filter Kriteria")
min_value = st.sidebar.number_input("Min Transaksi (Miliar IDR)", value=10)
syariah_only = st.sidebar.checkbox("Hanya Saham Syariah")

# Jalankan Screener
data = get_data(ticker_list)

# Terapkan Filter
if syariah_only:
    data = data[data['Syariah'] == "Ya"]
data = data[data['Value (B)'] >= min_value]

st.dataframe(data.style.format({"Price": "{:.0f}", "Change %": "{:.2f}%", "Value (B)": "{:.2f}", "RSI": "{:.2f}", "ADR %": "{:.2f}"}))
