export const MA_KEYS = ["ema3", "ema5", "ema10", "ema20", "sma50", "sma100", "sma200"];
export const VOL_KEYS = ["vma3", "vma5", "vma10", "vma20", "vma50", "vma100", "vma200"];

export const PRESET_IDS = [
  "trendkuat",
  "breakout",
  "momentum",
  "volakum",
  "oversold",
  "goldcross",
  "ema_short_near",
  "ema_short_tight_liq",
  "pullback_breakout_ema",
  "ema_short_near2_rsi_close",
  "ema_short_near2_rsi_close_m2tick",
  "ema_short_near2_stoch_oversold_close",
  "ema_short_near2_stoch_oversold_m2tick",
  "ema_short_near2_stoch_oversold_rsi_close",
  "ema_short_near2_stoch_oversold_rsi_m2tick",
  "ema_short_near2_stoch_oversold_rsi_mfi_oversold_m2tick",
  "ema_short_near2_stoch_oversold_mfi_oversold_m2tick",
  "ema_short_near2_rsi_mfi_oversold_m2tick",
  "mfi_ema_rsi_pullback",
  "mfi_ma_rsi_breakout",
  "mfi_ma_macd_limit2tick",
];

export const PRESET_LABELS = {
  trendkuat: "Trend Kuat",
  breakout: "Siap Breakout",
  momentum: "Momentum",
  volakum: "Akumulasi Vol",
  oversold: "Jenuh Jual",
  goldcross: "Golden Cross",
  ema_short_near: "EMA Short Dekat",
  ema_short_tight_liq: "EMA Short Ketat + LQ",
  pullback_breakout_ema: "Pullback EMA Breakout",
  ema_short_near2_rsi_close: "EMA Short <=2% + RSI50-70 (Buy Close)",
  ema_short_near2_rsi_close_m2tick: "EMA Short <=2% + RSI50-70 (Buy Close-2Tick)",
  ema_short_near2_stoch_oversold_close: "EMA Short <=2% + Stoch RSI Oversold (Buy Close)",
  ema_short_near2_stoch_oversold_m2tick: "EMA Short <=2% + Stoch RSI Oversold (Buy Close-2Tick)",
  ema_short_near2_stoch_oversold_rsi_close:
    "EMA Short <=2% + Stoch RSI Oversold + RSI50-70 (Buy Close)",
  ema_short_near2_stoch_oversold_rsi_m2tick:
    "EMA Short <=2% + Stoch RSI Oversold + RSI50-70 (Buy Close-2Tick)",
  ema_short_near2_stoch_oversold_rsi_mfi_oversold_m2tick:
    "EMA <=2% + Stoch OS + RSI50-70 + MFI OS (Close-2Tick)",
  ema_short_near2_stoch_oversold_mfi_oversold_m2tick:
    "EMA <=2% + Stoch OS + MFI OS (Close-2Tick)",
  ema_short_near2_rsi_mfi_oversold_m2tick:
    "EMA <=2% + RSI50-70 + MFI OS (Close-2Tick)",
  mfi_ema_rsi_pullback: "EMA20/50 + MFI Cross20 + RSI50-70 (Next Open)",
  mfi_ma_rsi_breakout: "SMA20/50 + MFI Rising + RSI50-70 (Breakout T+2)",
  mfi_ma_macd_limit2tick: "SMA50 + MACD Up + MFI Cross50 (Limit C-2Tick)",
};

function isShortEmaBullNear2(d) {
  const ms = d.maStatus || {};
  return (
    ms.ema3 &&
    ms.ema5 &&
    ms.ema10 &&
    ms.ema20 &&
    d.shortEmaNearestDistPct != null &&
    d.shortEmaNearestDistPct <= 2
  );
}

function isStochRsiOversold(d) {
  return d.stochRsi != null && d.stochRsi <= 20;
}

function isRsi50to70(d) {
  return d.rsi != null && d.rsi >= 50 && d.rsi <= 70;
}

function isMfiOversold(d) {
  return d.mfi != null && d.mfi <= 20;
}

function isMfiCrossUp20(d) {
  return d.mfiCrossUp20 === true;
}

function isMfiCrossUp50(d) {
  return d.mfiCrossUp50 === true;
}

function isMfiRisingAbove50(d) {
  return d.mfi != null && d.mfi > 50 && d.mfiRising === true;
}

export const PRESET_RULES = {
  trendkuat: (d) => {
    const ms = d.maStatus || {};
    const maCount = MA_KEYS.filter((k) => Boolean(ms[k])).length;
    return (
      maCount >= 5 &&
      ms.ema20 &&
      ms.sma50 &&
      d.macdBull === true &&
      d.rsi != null &&
      d.rsi >= 45 &&
      d.rsi <= 80
    );
  },
  breakout: (d) => {
    const ms = d.maStatus || {};
    return (
      ms.ema3 &&
      ms.ema5 &&
      ms.ema10 &&
      ms.ema20 &&
      d.rsi != null &&
      d.rsi >= 50 &&
      d.rsi <= 70 &&
      d.macdBull === true &&
      (ms.vma3 || ms.vma5 || ms.vma20)
    );
  },
  momentum: (d) => {
    const ms = d.maStatus || {};
    return ms.ema10 && ms.ema20 && d.rsi != null && d.rsi >= 50 && d.rsi <= 75 && d.macdBull === true;
  },
  volakum: (d) => {
    const ms = d.maStatus || {};
    const volCount = VOL_KEYS.filter((k) => Boolean(ms[k])).length;
    return volCount >= 4 && ms.ema20;
  },
  oversold: (d) => d.rsi != null && d.rsi < 35,
  goldcross: (d) => {
    const ms = d.maStatus || {};
    return ms.ema10 && ms.ema20 && !ms.sma200 && d.macdBull === true && d.macdCross === true;
  },
  ema_short_near: (d) => {
    const ms = d.maStatus || {};
    return (
      ms.ema3 &&
      ms.ema5 &&
      ms.ema10 &&
      ms.ema20 &&
      d.shortEmaNearestDistPct != null &&
      d.shortEmaNearestDistPct <= 5
    );
  },
  ema_short_tight_liq: (d) => {
    const ms = d.maStatus || {};
    return (
      ms.ema3 &&
      ms.ema5 &&
      ms.ema10 &&
      ms.ema20 &&
      d.shortEmaNearestDistPct != null &&
      d.shortEmaNearestDistPct <= 2 &&
      d.avgValue20 != null &&
      d.avgValue20 >= 100000000
    );
  },
  pullback_breakout_ema: (d) =>
    d.pullbackBreakoutSignal === true &&
    d.avgValue20 != null &&
    d.avgValue20 >= 50000000,
  ema_short_near2_rsi_close: (d) => {
    const ms = d.maStatus || {};
    return (
      ms.ema3 &&
      ms.ema5 &&
      ms.ema10 &&
      ms.ema20 &&
      d.shortEmaNearestDistPct != null &&
      d.shortEmaNearestDistPct <= 2 &&
      d.rsi != null &&
      d.rsi >= 50 &&
      d.rsi <= 70
    );
  },
  ema_short_near2_rsi_close_m2tick: (d) => {
    const ms = d.maStatus || {};
    return (
      ms.ema3 &&
      ms.ema5 &&
      ms.ema10 &&
      ms.ema20 &&
      d.shortEmaNearestDistPct != null &&
      d.shortEmaNearestDistPct <= 2 &&
      d.rsi != null &&
      d.rsi >= 50 &&
      d.rsi <= 70
    );
  },
  ema_short_near2_stoch_oversold_close: (d) => isShortEmaBullNear2(d) && isStochRsiOversold(d),
  ema_short_near2_stoch_oversold_m2tick: (d) => isShortEmaBullNear2(d) && isStochRsiOversold(d),
  ema_short_near2_stoch_oversold_rsi_close: (d) =>
    isShortEmaBullNear2(d) && isStochRsiOversold(d) && isRsi50to70(d),
  ema_short_near2_stoch_oversold_rsi_m2tick: (d) =>
    isShortEmaBullNear2(d) && isStochRsiOversold(d) && isRsi50to70(d),
  ema_short_near2_stoch_oversold_rsi_mfi_oversold_m2tick: (d) =>
    isShortEmaBullNear2(d) && isStochRsiOversold(d) && isRsi50to70(d) && isMfiOversold(d),
  ema_short_near2_stoch_oversold_mfi_oversold_m2tick: (d) =>
    isShortEmaBullNear2(d) && isStochRsiOversold(d) && isMfiOversold(d),
  ema_short_near2_rsi_mfi_oversold_m2tick: (d) =>
    isShortEmaBullNear2(d) && isRsi50to70(d) && isMfiOversold(d),
  mfi_ema_rsi_pullback: (d) => {
    const ms = d.maStatus || {};
    return (
      ms.ema20 &&
      d.ema20AboveEma50 === true &&
      isMfiCrossUp20(d) &&
      isRsi50to70(d)
    );
  },
  mfi_ma_rsi_breakout: (d) => {
    const ms = d.maStatus || {};
    return ms.sma20 && ms.sma50 && isMfiRisingAbove50(d) && isRsi50to70(d);
  },
  mfi_ma_macd_limit2tick: (d) => {
    const ms = d.maStatus || {};
    return ms.sma50 && d.macdBull === true && d.macdCrossUp === true && isMfiCrossUp50(d);
  },
};

export function evaluatePresetSignal(presetId, snapshot) {
  const rule = PRESET_RULES[presetId];
  if (!rule) {
    return false;
  }
  return Boolean(rule(snapshot));
}
