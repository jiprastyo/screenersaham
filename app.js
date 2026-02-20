(function () {
    "use strict";

    const DATA_URL = "data/issi_data.json";
    const THEME_KEY = "screener_card_theme";

    const IDX_MAP = {
        issi: "ISSI",
        lq45: "LQ45",
        k100: "KOMPAS100",
        bumn: "BUMN",
    };

    const MA_KEYS = ["ema3", "ema5", "ema10", "ema20", "sma50", "sma100", "sma200"];
    const VOL_KEYS = ["vma3", "vma5", "vma10", "vma20", "vma50", "vma100", "vma200"];
    const CARD_CHUNK_MOBILE = 24;
    const CARD_CHUNK_DESKTOP = 42;

    const PRESET_OPTIONS = [
        { value: "all", label: "Preset" },
        {
            value: "ema_short_near2_stoch_oversold_rsi_mfi_oversold_m2tick",
            label: "EMA<=2 + StochOS + RSI + MFIOS",
        },
        {
            value: "ema_short_near2_stoch_oversold_mfi_oversold_m2tick",
            label: "EMA<=2 + StochOS + MFIOS",
        },
        {
            value: "ema_short_near2_rsi_mfi_oversold_m2tick",
            label: "EMA<=2 + RSI + MFIOS",
        },
        {
            value: "ema_short_near2_stoch_oversold_rsi_m2tick",
            label: "EMA<=2 + StochOS + RSI",
        },
        {
            value: "ema_short_near2_stoch_oversold_m2tick",
            label: "EMA<=2 + StochOS",
        },
        {
            value: "ema_short_near2_rsi_close_m2tick",
            label: "EMA<=2 + RSI50-70",
        },
    ];

    // Archived presets are intentionally hidden from site filter dropdown.
    // Keep this list so we can quickly re-enable them for future comparisons.
    const ARCHIVED_PRESET_OPTIONS = [
        { value: "trendkuat", label: "Trend Kuat" },
        { value: "breakout", label: "Siap Breakout" },
        { value: "momentum", label: "Momentum" },
        { value: "volakum", label: "Akumulasi Vol" },
        { value: "oversold", label: "Jenuh Jual" },
        { value: "goldcross", label: "Golden Cross" },
        { value: "ema_short_near", label: "EMA Short Dekat" },
        { value: "ema_short_tight_liq", label: "EMA Short Ketat + LQ" },
        { value: "pullback_breakout_ema", label: "Pullback EMA Breakout" },
        { value: "ema_short_near2_rsi_close", label: "EMA <=2% + RSI50-70 (Close)" },
        { value: "ema_short_near2_stoch_oversold_close", label: "EMA <=2% + Stoch OS (Close)" },
        {
            value: "ema_short_near2_stoch_oversold_rsi_close",
            label: "EMA <=2% + Stoch OS + RSI50-70 (Close)",
        },
        { value: "mfi_ema_rsi_pullback", label: "EMA20/50 + MFI Cross20 + RSI50-70" },
        { value: "mfi_ma_rsi_breakout", label: "SMA20/50 + MFI Rising + RSI50-70" },
        { value: "mfi_ma_macd_limit2tick", label: "SMA50 + MACD Up + MFI Cross50" },
    ];

    const PRESET_NOTES = {
        all: "",
        ema_short_near2_stoch_oversold_rsi_mfi_oversold_m2tick:
            "Entry: close-2 tick, syarat EMA short bullish, Stoch RSI oversold, RSI 50-70, MFI oversold.",
        ema_short_near2_stoch_oversold_mfi_oversold_m2tick:
            "Entry: close-2 tick, syarat EMA short bullish, Stoch RSI oversold, MFI oversold.",
        ema_short_near2_rsi_mfi_oversold_m2tick:
            "Entry: close-2 tick, syarat EMA short bullish, RSI 50-70, MFI oversold.",
        ema_short_near2_stoch_oversold_rsi_m2tick:
            "Entry: close-2 tick, syarat EMA short bullish, Stoch RSI oversold, RSI 50-70.",
        ema_short_near2_stoch_oversold_m2tick:
            "Entry: close-2 tick, syarat EMA short bullish, Stoch RSI oversold.",
        ema_short_near2_rsi_close_m2tick:
            "Entry: close-2 tick, syarat EMA short bullish, RSI 50-70.",
    };

    const INDICATOR_HELP = {
        PxMA: {
            title: "PxMA",
            meaning:
                "Status harga terhadap moving average harga (EMA/SMA). Kotak hijau = harga di atas MA terkait, merah = di bawah.",
            pros: "Mudah baca arah tren jangka pendek-menengah dan cepat menyaring saham yang masih bullish structure.",
            cons: "Lagging saat market berbalik cepat dan rentan false signal saat harga sideways sempit.",
        },
        VxMA: {
            title: "VxMA",
            meaning:
                "Status volume terhadap moving average volume (VMA). Kotak hijau = volume di atas VMA terkait, merah = di bawah.",
            pros: "Memberi konteks validasi minat pasar, terutama saat breakout atau pullback penting.",
            cons: "Volume spike sesaat bisa menipu; perlu dikonfirmasi dengan struktur harga dan level.",
        },
        "1% Trx Hari Ini": {
            title: "1% Trx Hari Ini",
            meaning:
                "Estimasi nilai 1% dari transaksi hari ini. Dipakai untuk cek kecocokan ukuran entry terhadap likuiditas harian.",
            pros: "Praktis untuk membatasi dampak slippage terhadap ukuran transaksi harian saat entry.",
            cons: "Sangat dipengaruhi kondisi intraday hari itu, sehingga bisa berubah cepat dan kurang stabil.",
        },
        "1% Trx 20 Hari": {
            title: "1% Trx 20 Hari",
            meaning:
                "Estimasi nilai 1% dari rata-rata transaksi 20 hari. Digunakan sebagai patokan likuiditas yang lebih stabil.",
            pros: "Lebih stabil dibanding harian, cocok untuk baseline kapasitas entry normal strategi.",
            cons: "Kurang responsif pada perubahan likuiditas mendadak akibat berita atau rotasi sektor.",
        },
        MFI: {
            title: "MFI",
            meaning:
                "Money Flow Index (14) menggabungkan harga dan volume. <=20 cenderung oversold, >=80 cenderung overbought.",
            pros: "Menggabungkan dimensi harga dan volume sehingga sinyal ekstrem sering lebih bermakna.",
            cons: "Bisa lama berada di area ekstrem saat tren kuat, sehingga timing entry bisa terlalu cepat.",
        },
        RSI: {
            title: "RSI",
            meaning:
                "Relative Strength Index (14) mengukur kekuatan momentum harga. Zona 50-70 umumnya dipakai sebagai momentum sehat.",
            pros: "Sederhana, cepat, dan efektif untuk membaca momentum lanjutan dalam tren yang sehat.",
            cons: "Pada saham sangat volatil RSI sering whipsaw; butuh filter tren agar sinyal lebih bersih.",
        },
        StochRSI: {
            title: "StochRSI",
            meaning:
                "Oscillator dari RSI. <20 cenderung jenuh jual (oversold), >80 cenderung jenuh beli (overbought).",
            pros: "Sangat sensitif untuk menangkap pullback pendek dan potensi rebound cepat.",
            cons: "Sensitivitas tinggi membuat noise besar; tanpa filter tren mudah memberi sinyal palsu.",
        },
        ATR: {
            title: "ATR",
            meaning:
                "Average True Range (14) mengukur volatilitas. Di kartu ditampilkan juga estimasi SL berbasis 1.5 x ATR.",
            pros: "Objektif untuk sizing stop loss dinamis sesuai karakter volatilitas masing-masing saham.",
            cons: "Tidak memberi arah tren; hanya besar gerak, jadi tetap perlu indikator arah terpisah.",
        },
        ADR: {
            title: "ADR",
            meaning:
                "Average Daily Range (14) versi persentase. Menunjukkan lebar gerak harian rata-rata saham.",
            pros: "Membantu menilai ruang gerak harian realistis terhadap target TP dan manajemen ekspektasi.",
            cons: "Kurang akurat saat terjadi regime shift volatilitas karena berbasis rata-rata historis.",
        },
        MACD: {
            title: "MACD",
            meaning:
                "MACD (12,26,9) untuk momentum tren. Bull/Cross/Bear membantu membaca arah dan perubahan momentum.",
            pros: "Bagus untuk konfirmasi momentum tren menengah dan mendeteksi transisi fase momentum.",
            cons: "Sering terlambat pada reversal cepat dan bisa whipsaw saat pasar datar.",
        },
        Skor: {
            title: "Skor",
            meaning:
                "Skor komposit (0-10) dari MA, RSI, MACD, dan volume. Makin tinggi skor, makin kuat struktur setup menurut rule internal.",
            pros: "Mempercepat ranking kandidat karena banyak sinyal sudah diringkas dalam satu angka.",
            cons: "Abstraksi tinggi bisa menutupi detail indikator; tetap perlu cek konteks chart sebelum entry.",
        },
    };

    const TIMEFRAME_OPTIONS = [
        { value: "reset", label: "Timeframe (1D)" },
        { value: "1d", label: "1D" },
        { value: "1wk", label: "1W" },
    ];

    const IDX_OPTIONS = [
        { value: "all", label: "Indeks" },
        { value: "issi", label: "ISSI" },
        { value: "lq45", label: "LQ45" },
        { value: "k100", label: "KOMPAS100" },
        { value: "bumn", label: "BUMN" },
    ];

    const MA_OPTIONS = [
        { value: "ema3", label: "EMA 3" },
        { value: "ema5", label: "EMA 5" },
        { value: "ema10", label: "EMA 10" },
        { value: "ema20", label: "EMA 20" },
        { value: "sma50", label: "SMA 50" },
        { value: "sma100", label: "SMA 100" },
        { value: "sma200", label: "SMA 200" },
    ];

    const VMA_OPTIONS = [
        { value: "vma3", label: "VMA 3" },
        { value: "vma5", label: "VMA 5" },
        { value: "vma10", label: "VMA 10" },
        { value: "vma20", label: "VMA 20" },
        { value: "vma50", label: "VMA 50" },
        { value: "vma100", label: "VMA 100" },
        { value: "vma200", label: "VMA 200" },
    ];

    const RSI_OPTIONS = [
        { value: "all", label: "RSI" },
        { value: "os", label: "<30 (Oversold)" },
        { value: "weak", label: "30-50" },
        { value: "sweet", label: "50-70" },
        { value: "strong", label: "70-80" },
        { value: "ob", label: ">80 (Overbought)" },
    ];

    const SRSI_OPTIONS = [
        { value: "all", label: "StochRSI" },
        { value: "os", label: "<20 (Oversold)" },
        { value: "mid", label: "20-80" },
        { value: "ob", label: ">80 (Overbought)" },
    ];

    const ATR_OPTIONS = [
        { value: "all", label: "ATR" },
        { value: "lesu", label: "Lesu" },
        { value: "normal", label: "Normal" },
        { value: "aktif", label: "Aktif" },
    ];

    const ADR_OPTIONS = [
        { value: "all", label: "ADR" },
        { value: "lesu", label: "Lesu" },
        { value: "normal", label: "Normal" },
        { value: "aktif", label: "Aktif" },
    ];

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

    const PRESETS = {
        trendkuat: function (d) {
            const ms = d.maStatus || {};
            const maCount = MA_KEYS.filter(function (k) {
                return ms[k];
            }).length;
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
        breakout: function (d) {
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
        momentum: function (d) {
            const ms = d.maStatus || {};
            return (
                ms.ema10 &&
                ms.ema20 &&
                d.rsi != null &&
                d.rsi >= 50 &&
                d.rsi <= 75 &&
                d.macdBull === true
            );
        },
        volakum: function (d) {
            const ms = d.maStatus || {};
            const volCount = VOL_KEYS.filter(function (k) {
                return ms[k];
            }).length;
            return volCount >= 4 && ms.ema20;
        },
        oversold: function (d) {
            return d.rsi != null && d.rsi < 35;
        },
        goldcross: function (d) {
            const ms = d.maStatus || {};
            return ms.ema10 && ms.ema20 && !ms.sma200 && d.macdBull === true && d.macdCross === true;
        },
        ema_short_near: function (d) {
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
        ema_short_tight_liq: function (d) {
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
        pullback_breakout_ema: function (d) {
            return d.pullbackBreakoutSignal === true && d.avgValue20 != null && d.avgValue20 >= 50000000;
        },
        ema_short_near2_rsi_close: function (d) {
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
        ema_short_near2_rsi_close_m2tick: function (d) {
            return PRESETS.ema_short_near2_rsi_close(d);
        },
        ema_short_near2_stoch_oversold_close: function (d) {
            return isShortEmaBullNear2(d) && isStochRsiOversold(d);
        },
        ema_short_near2_stoch_oversold_m2tick: function (d) {
            return PRESETS.ema_short_near2_stoch_oversold_close(d);
        },
        ema_short_near2_stoch_oversold_rsi_close: function (d) {
            return isShortEmaBullNear2(d) && isStochRsiOversold(d) && isRsi50to70(d);
        },
        ema_short_near2_stoch_oversold_rsi_m2tick: function (d) {
            return PRESETS.ema_short_near2_stoch_oversold_rsi_close(d);
        },
        ema_short_near2_stoch_oversold_rsi_mfi_oversold_m2tick: function (d) {
            return (
                isShortEmaBullNear2(d) &&
                isStochRsiOversold(d) &&
                isRsi50to70(d) &&
                isMfiOversold(d)
            );
        },
        ema_short_near2_stoch_oversold_mfi_oversold_m2tick: function (d) {
            return isShortEmaBullNear2(d) && isStochRsiOversold(d) && isMfiOversold(d);
        },
        ema_short_near2_rsi_mfi_oversold_m2tick: function (d) {
            return isShortEmaBullNear2(d) && isRsi50to70(d) && isMfiOversold(d);
        },
    };

    const state = {
        rawTfData: {},
        data: [],
        filtered: [],
        activeTF: "1d",
        preset: "all",
        idx: "all",
        sektor: "all",
        maF: new Set(),
        vmaF: new Set(),
        rsi: "all",
        srsi: "all",
        atr: "all",
        adr: "all",
        search: "",
        sortCol: "score",
        sortDir: "desc",
        forceView: "grid",
        mobileFiltersOpen: true,
        renderLimit: 0,
        cardObserver: null,
        searchTimer: null,
        helpAnchorEl: null,
    };

    const els = {
        tsText: document.getElementById("tsText"),
        statsCount: document.getElementById("statsCount"),
        presetSelect: document.getElementById("presetSelect"),
        presetInfo: document.getElementById("presetInfo"),
        timeframeSelect: document.getElementById("timeframeSelect"),
        idxSelect: document.getElementById("idxSelect"),
        sektorSelect: document.getElementById("sektorSelect"),
        maSelect: document.getElementById("maSelect"),
        vmaSelect: document.getElementById("vmaSelect"),
        rsiSelect: document.getElementById("rsiSelect"),
        srsiSelect: document.getElementById("srsiSelect"),
        atrSelect: document.getElementById("atrSelect"),
        adrSelect: document.getElementById("adrSelect"),
        controlsPanel: document.getElementById("controlsPanel"),
        filterToggleBtn: document.getElementById("filterToggleBtn"),
        resetBtnSticky: document.getElementById("resetBtnSticky"),
        searchInput: document.getElementById("searchInput"),
        sortSelect: document.getElementById("sortSelect"),
        activeFilters: document.getElementById("activeFilters"),
        cardList: document.getElementById("cardList"),
        themeToggle: document.getElementById("themeToggle"),
        helpModal: null,
        helpDialog: null,
        helpTitle: null,
        helpText: null,
        helpPros: null,
        helpCons: null,
        helpClose: null,
    };

    if (!els.cardList) {
        return;
    }

    init();

    function init() {
        if (typeof TM !== "object") {
            showError("Metadata saham (`stocks_database.js`) tidak terbaca.");
            return;
        }

        window.SCREENER_ARCHIVED_PRESETS = ARCHIVED_PRESET_OPTIONS.slice();
        ensureHelpModal();
        hydrateTheme();
        updateViewMode();
        setupSelectOptions();
        bindEvents();
        loadData();
    }

    function setupSelectOptions() {
        populateSelect(els.presetSelect, PRESET_OPTIONS, state.preset);
        populateSelect(els.timeframeSelect, TIMEFRAME_OPTIONS, state.activeTF);
        populateSelect(els.idxSelect, IDX_OPTIONS, state.idx);

        const sectors = getSectorList();
        const sektorOptions = [{ value: "all", label: "Sektor" }].concat(
            sectors.map(function (s) {
                return { value: s, label: s };
            }),
        );
        populateSelect(els.sektorSelect, sektorOptions, state.sektor);

        populateToggleSelect(els.maSelect, MA_OPTIONS, state.maF, "PxMA");
        populateToggleSelect(els.vmaSelect, VMA_OPTIONS, state.vmaF, "VxMA");
        populateSelect(els.rsiSelect, RSI_OPTIONS, state.rsi);
        populateSelect(els.srsiSelect, SRSI_OPTIONS, state.srsi);
        populateSelect(els.atrSelect, ATR_OPTIONS, state.atr);
        populateSelect(els.adrSelect, ADR_OPTIONS, state.adr);
        updatePresetInfo();
        updateFilterHighlights();
        fitAllSelectWidths();
    }

    function fitAllSelectWidths() {
        [
            els.timeframeSelect,
            els.sortSelect,
            els.sektorSelect,
            els.idxSelect,
            els.maSelect,
            els.vmaSelect,
            els.rsiSelect,
            els.srsiSelect,
            els.atrSelect,
            els.adrSelect,
            els.presetSelect,
        ].forEach(fitSelectWidthByOptionLength);
    }

    function fitSelectWidthByOptionLength(selectEl) {
        if (!selectEl || !selectEl.classList.contains("fit-select")) {
            return;
        }
        const options = Array.from(selectEl.options || []);
        if (!options.length) {
            return;
        }

        const maxTextLen = options.reduce(function (maxLen, opt) {
            const textLen = String(opt.textContent || "").trim().length;
            return textLen > maxLen ? textLen : maxLen;
        }, 0);

        const extra = selectEl === els.sortSelect ? 6 : 5;
        const minCh = 9;
        const maxCh = 38;
        const widthCh = Math.max(minCh, Math.min(maxCh, maxTextLen + extra));
        selectEl.style.width = widthCh + "ch";
    }

    function populateSelect(selectEl, options, currentValue) {
        if (!selectEl) {
            return;
        }
        selectEl.innerHTML = options
            .map(function (opt) {
                return (
                    '<option value="' +
                    escapeHtml(opt.value) +
                    '"' +
                    (opt.value === currentValue ? " selected" : "") +
                    ">" +
                    escapeHtml(opt.label) +
                    "</option>"
                );
            })
            .join("");
        fitSelectWidthByOptionLength(selectEl);
    }

    function populateToggleSelect(selectEl, options, selectedSet, label) {
        if (!selectEl) {
            return;
        }
        const clearValue = "__reset__";
        const selectedCount = selectedSet ? selectedSet.size : 0;
        const topLabel = selectedCount ? label + " (" + selectedCount + ")" : label;
        const rendered = [{ value: clearValue, label: topLabel }].concat(
            options.map(function (opt) {
                return {
                    value: opt.value,
                    label: (selectedSet.has(opt.value) ? "✓ " : "") + opt.label,
                };
            }),
        );
        populateSelect(selectEl, rendered, clearValue);
        selectEl.value = clearValue;
    }

    function bindEvents() {
        bindSelect(els.presetSelect, "preset");

        els.timeframeSelect.addEventListener("change", function () {
            const selected = els.timeframeSelect.value || "1d";
            switchTimeframe(selected === "reset" ? "1d" : selected);
        });

        bindSelect(els.idxSelect, "idx");
        bindSelect(els.sektorSelect, "sektor");
        bindToggleMultiSelect(els.maSelect, MA_OPTIONS, state.maF, "PxMA");
        bindToggleMultiSelect(els.vmaSelect, VMA_OPTIONS, state.vmaF, "VxMA");
        bindSelect(els.rsiSelect, "rsi");
        bindSelect(els.srsiSelect, "srsi");
        bindSelect(els.atrSelect, "atr");
        bindSelect(els.adrSelect, "adr");

        els.searchInput.addEventListener("input", function () {
            state.search = els.searchInput.value || "";
            debounceApply();
        });

        els.sortSelect.addEventListener("change", function () {
            const raw = String(els.sortSelect.value || "score:desc");
            const parts = raw.split(":");
            state.sortCol = parts[0] || "score";
            state.sortDir = parts[1] === "asc" ? "asc" : "desc";
            applyFiltersAndRender();
        });

        if (els.resetBtnSticky) {
            els.resetBtnSticky.addEventListener("click", function () {
                resetAllFilters();
            });
        }
        if (els.filterToggleBtn) {
            els.filterToggleBtn.addEventListener("click", function () {
                toggleMobileFilters();
            });
        }

        els.cardList.addEventListener("click", function (event) {
            const loadMoreBtn = event.target.closest(".load-more-btn");
            if (loadMoreBtn) {
                event.preventDefault();
                loadMoreCards();
                return;
            }
            const hintBtn = event.target.closest(".hint-btn");
            if (!hintBtn) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const key = hintBtn.getAttribute("data-help-key") || "";
            openIndicatorHelp(key, hintBtn);
        });

        els.themeToggle.addEventListener("click", function () {
            const root = document.documentElement;
            const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", nextTheme);
            try {
                localStorage.setItem(THEME_KEY, nextTheme);
            } catch (_) {}
        });

        window.addEventListener("resize", function () {
            syncMobileFilterState();
            placeIndicatorHelp();
        });

        if (els.helpClose) {
            els.helpClose.addEventListener("click", closeIndicatorHelp);
        }
        document.addEventListener("click", function (event) {
            if (!els.helpModal || els.helpModal.hidden) {
                return;
            }
            const inDialog = event.target.closest("#indicatorHelpModal .hint-dialog");
            const isHintBtn = event.target.closest(".hint-btn");
            if (!inDialog && !isHintBtn) {
                closeIndicatorHelp();
            }
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeIndicatorHelp();
            }
        });

        syncMobileFilterState();
    }

    function bindSelect(selectEl, stateKey) {
        if (!selectEl) {
            return;
        }
        selectEl.addEventListener("change", function () {
            state[stateKey] = selectEl.value || "all";
            if (stateKey === "preset") {
                updatePresetInfo();
            }
            applyFiltersAndRender();
        });
    }

    function bindToggleMultiSelect(selectEl, options, selectedSet, label) {
        if (!selectEl) {
            return;
        }
        selectEl.addEventListener("change", function () {
            const value = selectEl.value || "__reset__";
            if (value === "__reset__") {
                selectedSet.clear();
            } else if (selectedSet.has(value)) {
                selectedSet.delete(value);
            } else {
                selectedSet.add(value);
            }
            populateToggleSelect(selectEl, options, selectedSet, label);
            applyFiltersAndRender();
        });
    }

    function hydrateTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === "dark" || saved === "light") {
                document.documentElement.setAttribute("data-theme", saved);
            }
        } catch (_) {}
    }

    function updateViewMode() {
        els.cardList.classList.add("cards-only");
        els.cardList.classList.remove("view-grid");
        els.cardList.classList.remove("view-list");
    }

    function updatePresetInfo() {
        if (!els.presetInfo) {
            return;
        }
        const key = state.preset || "all";
        const note = PRESET_NOTES[key] || PRESET_NOTES.all || "";
        els.presetInfo.textContent = note;
        els.presetInfo.hidden = !note;
    }

    function isMobileViewport() {
        return window.matchMedia("(max-width: 820px)").matches;
    }

    function syncMobileFilterState() {
        if (!els.controlsPanel || !els.filterToggleBtn) {
            return;
        }
        els.controlsPanel.classList.toggle("filter-collapsed", !state.mobileFiltersOpen);
        els.filterToggleBtn.textContent = state.mobileFiltersOpen ? "Tutup Filter ▴" : "Buka Filter ▾";
        updatePresetInfo();
    }

    function toggleMobileFilters() {
        state.mobileFiltersOpen = !state.mobileFiltersOpen;
        syncMobileFilterState();
    }

    function ensureHelpModal() {
        if (document.getElementById("indicatorHelpModal")) {
            els.helpModal = document.getElementById("indicatorHelpModal");
            els.helpDialog = els.helpModal.querySelector(".hint-dialog");
            els.helpTitle = document.getElementById("indicatorHelpTitle");
            els.helpText = document.getElementById("indicatorHelpText");
            els.helpPros = document.getElementById("indicatorHelpPros");
            els.helpCons = document.getElementById("indicatorHelpCons");
            els.helpClose = document.getElementById("indicatorHelpClose");
            return;
        }
        document.body.insertAdjacentHTML(
            "beforeend",
            '<div id="indicatorHelpModal" class="hint-modal" hidden>' +
                '<div class="hint-dialog" role="dialog" aria-labelledby="indicatorHelpTitle">' +
                '<button type="button" class="hint-close" id="indicatorHelpClose" aria-label="Tutup bantuan">&times;</button>' +
                '<h3 id="indicatorHelpTitle" class="hint-title"></h3>' +
                '<p id="indicatorHelpText" class="hint-text"></p>' +
                '<div class="hint-sections">' +
                '<div class="hint-section">' +
                '<p class="hint-subtitle">Kelebihan</p>' +
                '<p id="indicatorHelpPros" class="hint-subtext"></p>' +
                "</div>" +
                '<div class="hint-section">' +
                '<p class="hint-subtitle">Kekurangan</p>' +
                '<p id="indicatorHelpCons" class="hint-subtext"></p>' +
                "</div>" +
                "</div>" +
                "</div>" +
                "</div>",
        );
        els.helpModal = document.getElementById("indicatorHelpModal");
        els.helpDialog = els.helpModal.querySelector(".hint-dialog");
        els.helpTitle = document.getElementById("indicatorHelpTitle");
        els.helpText = document.getElementById("indicatorHelpText");
        els.helpPros = document.getElementById("indicatorHelpPros");
        els.helpCons = document.getElementById("indicatorHelpCons");
        els.helpClose = document.getElementById("indicatorHelpClose");
    }

    function openIndicatorHelp(key, anchorEl) {
        if (
            !els.helpModal ||
            !els.helpDialog ||
            !els.helpTitle ||
            !els.helpText ||
            !els.helpPros ||
            !els.helpCons
        ) {
            return;
        }
        const help = INDICATOR_HELP[key];
        if (!help) {
            return;
        }
        els.helpTitle.textContent = help.title;
        els.helpText.textContent = help.meaning;
        els.helpPros.textContent = help.pros || "-";
        els.helpCons.textContent = help.cons || "-";
        els.helpModal.hidden = false;
        state.helpAnchorEl = anchorEl || null;
        placeIndicatorHelp(anchorEl);
    }

    function closeIndicatorHelp() {
        if (!els.helpModal) {
            return;
        }
        els.helpModal.hidden = true;
        state.helpAnchorEl = null;
    }

    function placeIndicatorHelp(nextAnchor) {
        if (!els.helpModal || !els.helpDialog || els.helpModal.hidden) {
            return;
        }

        const anchor = nextAnchor || state.helpAnchorEl;
        if (!anchor || !anchor.isConnected) {
            closeIndicatorHelp();
            return;
        }
        state.helpAnchorEl = anchor;

        const gap = 8;
        const margin = 8;
        const anchorRect = anchor.getBoundingClientRect();

        els.helpDialog.style.left = "-9999px";
        els.helpDialog.style.top = "-9999px";
        const dialogW = els.helpDialog.offsetWidth;
        const dialogH = els.helpDialog.offsetHeight;

        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const anchorCenter = anchorRect.left + anchorRect.width / 2;

        let left = anchorCenter - dialogW / 2;
        left = Math.max(margin, Math.min(viewportW - dialogW - margin, left));

        let top = anchorRect.bottom + gap;
        let place = "bottom";
        if (top + dialogH > viewportH - margin) {
            top = anchorRect.top - dialogH - gap;
            place = "top";
        }
        if (top < margin) {
            top = Math.max(margin, Math.min(viewportH - dialogH - margin, top));
        }

        const arrowX = Math.max(16, Math.min(dialogW - 16, anchorCenter - left));
        els.helpModal.style.setProperty("--hint-arrow-x", arrowX + "px");
        els.helpModal.setAttribute("data-place", place);

        els.helpDialog.style.left = left + "px";
        els.helpDialog.style.top = top + "px";
    }

    async function loadData() {
        showLoading("Memuat data saham...");

        try {
            const response = await fetch(DATA_URL, { cache: "no-store" });
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const payload = await response.json();
            state.rawTfData = getRawTfData(payload) || { "1d": [] };

            const fetchedLabel = payload && payload.fetchedAt ? formatWib(payload.fetchedAt) : "-";
            els.tsText.textContent = "Data: " + fetchedLabel + " WIB";

            switchTimeframe(state.activeTF);
        } catch (error) {
            showError("Gagal memuat data: " + error.message);
        }
    }

    function getRawTfData(payload) {
        if (!payload || typeof payload !== "object") {
            return null;
        }
        if (payload.timeframes && Array.isArray(payload.timeframes["1d"])) {
            return payload.timeframes;
        }
        if (Array.isArray(payload.data)) {
            return { "1d": payload.data };
        }
        return null;
    }

    function switchTimeframe(tf) {
        state.activeTF = tf === "1wk" ? "1wk" : "1d";
        if (els.timeframeSelect) {
            els.timeframeSelect.value = state.activeTF;
        }

        const rawData = state.rawTfData[state.activeTF] || state.rawTfData["1d"] || [];
        state.data = enrichData(rawData, state.activeTF);
        applyFiltersAndRender();
    }

    function enrichData(rows, tf) {
        return rows.map(function (row) {
            const meta = TM[row.ticker] || {};
            const price = toFiniteNumber(row.price);
            const atrV = toFiniteNumber(row.atrV);
            const atrPct = price > 0 && atrV != null ? (atrV / price) * 100 : null;

            const pct1today =
                toFiniteNumber(row.pct1today) != null
                    ? toFiniteNumber(row.pct1today)
                    : tf === "1d" && toFiniteNumber(row.lastValue) != null
                      ? toFiniteNumber(row.lastValue) * 0.01
                      : null;

            const pct120d = toFiniteNumber(row.pct120d) != null ? toFiniteNumber(row.pct120d) : pct1today;
            const avgValue20 =
                toFiniteNumber(row.avgValue20) != null
                    ? toFiniteNumber(row.avgValue20)
                    : pct120d != null
                      ? pct120d * 100
                      : null;

            const entry = {
                ticker: row.ticker || "",
                company: row.company || "",
                price: price,
                pct: toFiniteNumber(row.pct),
                maStatus: row.maStatus || {},
                rsi: toFiniteNumber(row.rsi),
                mfi: toFiniteNumber(row.mfi),
                stochRsi: toFiniteNumber(row.stochRsi),
                macdBull: row.macdBull === true,
                macdCross: row.macdCross === true,
                macdHist: toFiniteNumber(row.macdHist),
                shortEmaNearestDistPct: toFiniteNumber(row.shortEmaNearestDistPct),
                pullbackBreakoutSignal: row.pullbackBreakoutSignal === true,
                atrV: atrV,
                atrPct: atrPct,
                adrPct: toFiniteNumber(row.adrPct),
                pct1today: pct1today,
                pct120d: pct120d,
                avgValue20: avgValue20,
                papan: meta.p || row.papan || "",
                indeks: Array.isArray(meta.i) ? meta.i : Array.isArray(row.indeks) ? row.indeks : [],
                sektor: meta.s || row.sektor || "",
            };

            entry.score = calcScore(entry);
            return entry;
        });
    }

    function calcScore(entry) {
        let score = 0;
        const ms = entry.maStatus || {};

        MA_KEYS.forEach(function (key) {
            if (ms[key]) {
                score += 1;
            }
        });

        if (entry.rsi != null) {
            if (entry.rsi >= 50 && entry.rsi <= 70) {
                score += 1.5;
            } else if (entry.rsi > 70 && entry.rsi <= 80) {
                score += 0.5;
            } else if (entry.rsi >= 40 && entry.rsi < 50) {
                score += 0.5;
            }
        }

        if (entry.macdBull === true) {
            score += 1;
        }

        if (ms.vma20) {
            score += 0.5;
        }

        return Math.min(10, Math.round(score * 10) / 10);
    }

    function applyFiltersAndRender() {
        state.filtered = applyFilters(state.data);
        state.renderLimit = getInitialRenderLimit(state.filtered.length);
        disconnectCardObserver();
        updateFilterHighlights();
        renderAll();
    }

    function updateFilterHighlights() {
        setFilterActive(els.presetSelect, state.preset !== "all");
        setFilterActive(els.timeframeSelect, state.activeTF !== "1d");
        setFilterActive(els.idxSelect, state.idx !== "all");
        setFilterActive(els.sektorSelect, state.sektor !== "all");
        setFilterActive(els.maSelect, state.maF.size > 0);
        setFilterActive(els.vmaSelect, state.vmaF.size > 0);
        setFilterActive(els.rsiSelect, state.rsi !== "all");
        setFilterActive(els.srsiSelect, state.srsi !== "all");
        setFilterActive(els.atrSelect, state.atr !== "all");
        setFilterActive(els.adrSelect, state.adr !== "all");
        setFilterActive(els.searchInput, Boolean((state.search || "").trim()));
    }

    function setFilterActive(el, active) {
        if (!el) {
            return;
        }
        el.classList.toggle("is-active", Boolean(active));
    }

    function applyFilters(rows) {
        let data = rows.slice();

        const query = (state.search || "").trim().toUpperCase();
        if (query) {
            const tokens = query.split(/\s+/).filter(Boolean);
            data = data.filter(function (item) {
                const ticker = String(item.ticker || "").toUpperCase();
                const company = String(item.company || "").toUpperCase();
                return tokens.some(function (token) {
                    return ticker.includes(token);
                }) || company.includes(query);
            });
        }

        if (state.preset !== "all" && PRESETS[state.preset]) {
            data = data.filter(PRESETS[state.preset]);
        }

        if (state.idx !== "all") {
            data = data.filter(function (item) {
                const indices = Array.isArray(item.indeks) ? item.indeks : [];
                return indices.includes(IDX_MAP[state.idx]);
            });
        }

        if (state.sektor !== "all") {
            data = data.filter(function (item) {
                return item.sektor === state.sektor;
            });
        }

        if (state.maF.size) {
            const activeMa = Array.from(state.maF);
            data = data.filter(function (item) {
                return activeMa.every(function (key) {
                    return item.maStatus && item.maStatus[key] === true;
                });
            });
        }

        if (state.vmaF.size) {
            const activeVma = Array.from(state.vmaF);
            data = data.filter(function (item) {
                return activeVma.every(function (key) {
                    return item.maStatus && item.maStatus[key] === true;
                });
            });
        }

        if (state.rsi !== "all") {
            data = data.filter(function (item) {
                if (item.rsi == null) {
                    return false;
                }
                if (state.rsi === "os") {
                    return item.rsi < 30;
                }
                if (state.rsi === "weak") {
                    return item.rsi >= 30 && item.rsi < 50;
                }
                if (state.rsi === "sweet") {
                    return item.rsi >= 50 && item.rsi <= 70;
                }
                if (state.rsi === "strong") {
                    return item.rsi > 70 && item.rsi <= 80;
                }
                if (state.rsi === "ob") {
                    return item.rsi > 80;
                }
                return true;
            });
        }

        if (state.srsi !== "all") {
            data = data.filter(function (item) {
                if (item.stochRsi == null) {
                    return false;
                }
                if (state.srsi === "os") {
                    return item.stochRsi < 20;
                }
                if (state.srsi === "mid") {
                    return item.stochRsi >= 20 && item.stochRsi <= 80;
                }
                if (state.srsi === "ob") {
                    return item.stochRsi > 80;
                }
                return true;
            });
        }

        if (state.atr !== "all") {
            data = data.filter(function (item) {
                if (item.atrPct == null) {
                    return false;
                }
                if (state.atr === "lesu") {
                    return item.atrPct < 1.5;
                }
                if (state.atr === "normal") {
                    return item.atrPct >= 1.5 && item.atrPct < 5;
                }
                if (state.atr === "aktif") {
                    return item.atrPct >= 5;
                }
                return true;
            });
        }

        if (state.adr !== "all") {
            data = data.filter(function (item) {
                if (item.adrPct == null) {
                    return false;
                }
                if (state.adr === "lesu") {
                    return item.adrPct < 1.5;
                }
                if (state.adr === "normal") {
                    return item.adrPct >= 1.5 && item.adrPct < 5;
                }
                if (state.adr === "aktif") {
                    return item.adrPct >= 5;
                }
                return true;
            });
        }

        sortRows(data);
        return data;
    }

    function sortRows(rows) {
        const col = state.sortCol;
        const factor = state.sortDir === "asc" ? 1 : -1;

        rows.sort(function (a, b) {
            if (col === "ticker") {
                return String(a.ticker || "").localeCompare(String(b.ticker || "")) * factor;
            }

            const va = toFiniteNumber(a[col]);
            const vb = toFiniteNumber(b[col]);

            if (va == null && vb == null) {
                return 0;
            }
            if (va == null) {
                return 1;
            }
            if (vb == null) {
                return -1;
            }
            return (va - vb) * factor;
        });
    }

    function renderAll() {
        els.statsCount.textContent = state.filtered.length.toLocaleString("id-ID") + " saham";
        renderActiveFilterTags();
        renderCards();
    }

    function renderActiveFilterTags() {
        const tags = [];

        pushSelectTag(tags, "Preset", els.presetSelect, state.preset);
        pushSelectTag(tags, "Timeframe", els.timeframeSelect, state.activeTF, "1d");
        pushSelectTag(tags, "Indeks", els.idxSelect, state.idx);
        pushSelectTag(tags, "Sektor", els.sektorSelect, state.sektor);
        pushMultiSetTag(tags, "PxMA", MA_OPTIONS, state.maF);
        pushMultiSetTag(tags, "VxMA", VMA_OPTIONS, state.vmaF);
        pushSelectTag(tags, "RSI", els.rsiSelect, state.rsi);
        pushSelectTag(tags, "StochRSI", els.srsiSelect, state.srsi);
        pushSelectTag(tags, "ATR", els.atrSelect, state.atr);
        pushSelectTag(tags, "ADR", els.adrSelect, state.adr);

        if (state.search.trim()) {
            tags.push("Cari: " + state.search.trim());
        }

        if (!tags.length) {
            els.activeFilters.innerHTML = '<span class="af-empty">Tidak ada filter aktif</span>';
            return;
        }

        els.activeFilters.innerHTML = tags
            .map(function (tag) {
                const withPrefix = tag.indexOf("Cari: ") === 0 ? tag : "Filter: " + tag;
                return '<span class="af-tag">' + escapeHtml(withPrefix) + "</span>";
            })
            .join("");
    }

    function pushSelectTag(target, label, selectEl, value, defaultValue) {
        if (!selectEl) {
            return;
        }
        const dv = defaultValue || "all";
        if (!value || value === dv) {
            return;
        }
        const option = selectEl.options[selectEl.selectedIndex];
        const text = option ? option.textContent : value;
        target.push(label + ": " + text);
    }

    function pushMultiSetTag(target, label, options, selectedSet) {
        if (!selectedSet || !selectedSet.size) {
            return;
        }
        const labels = options
            .filter(function (opt) {
                return selectedSet.has(opt.value);
            })
            .map(function (opt) {
                return opt.label;
            });
        if (labels.length) {
            target.push(label + ": " + labels.join(", "));
        }
    }

    function renderCards() {
        disconnectCardObserver();

        if (!state.filtered.length) {
            els.cardList.innerHTML = '<div class="stock-card"><div class="card-company">Tidak ada saham yang cocok dengan filter.</div></div>';
            return;
        }

        const capped = Math.min(
            state.filtered.length,
            Math.max(state.renderLimit || 0, getInitialRenderLimit(state.filtered.length)),
        );
        state.renderLimit = capped;
        els.cardList.innerHTML = state.filtered
            .slice(0, capped)
            .map(function (item) {
                return renderCardMarkup(item);
            })
            .join("");

        if (capped < state.filtered.length) {
            renderLoadMoreSentinel(capped);
        }
    }

    function renderCardMarkup(item) {
        const pctClass = item.pct > 0 ? "pos" : item.pct < 0 ? "neg" : "neu";
        const score = scoreInfo(item.score);
        const macdText = item.macdBull ? (item.macdCross ? "Bull + Cross" : "Bull") : item.macdCross ? "Cross" : "Bear/Netral";
        const rsiZone = rsiLabel(item.rsi);
        const srsiZone = srsiLabel(item.stochRsi);
        const atrZone = rangeLabel(item.atrPct);
        const adrZone = rangeLabel(item.adrPct);
        const pctBadge = item.pct > 0 ? "up" : item.pct < 0 ? "dn" : "nu";
        const maSquares = signalSquares(item.maStatus, MA_KEYS, ["P3", "P5", "P10", "P20", "P50", "P1", "P2"], "ma");
        const vmaSquares = signalSquares(item.maStatus, VOL_KEYS, ["V3", "V5", "V10", "V20", "V50", "V1", "V2"], "vol");
        const slAtrPrice =
            item.price != null && item.atrV != null ? Math.max(0, item.price - item.atrV * 1.5) : null;
        const mfiText = metricChip(
            formatDec(item.mfi, 1) + " (" + mfiLabel(item.mfi) + ")",
            toneByMfi(item.mfi),
            true,
        );
        const rsiText = metricChip(
            formatDec(item.rsi, 1) + " (" + rsiZone + ")",
            toneByRsi(item.rsi),
            true,
        );
        const srsiText = metricChip(
            formatDec(item.stochRsi, 1) + " (" + srsiZone + ")",
            toneByStochRsi(item.stochRsi),
            true,
        );
        const atrText = metricChip(
            formatDec(item.atrV, 1) +
                " · " +
                formatDec(item.atrPct, 2) +
                "% (" +
                atrZone +
                ") · SL 1.5x: " +
                formatPrice(slAtrPrice),
            toneByRange(item.atrPct),
            true,
        );
        const adrText = metricChip(
            formatDec(item.adrPct, 2) + "% (" + adrZone + ")",
            toneByRange(item.adrPct),
            true,
        );
        const macdChip = metricChip(
            macdText,
            item.macdBull ? "good" : item.macdCross ? "warn" : "bad",
            true,
        );
        const symbolUrl = stockbitSymbolUrl(item.ticker);
        const indexBadges = (item.indeks || [])
            .map(function (idx) {
                return badge(idx, idx === "ISSI" ? "issi" : "");
            })
            .join("");

        return (
            '<article class="stock-card">' +
            '<div class="card-top-sticky">' +
            '<div class="card-head">' +
            '<div><a class="card-title card-title-link" href="' +
            symbolUrl +
            '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(item.ticker) +
            '</a><div class="card-company">' +
            escapeHtml(companyDisplayName(item.company)) +
            "</div></div>" +
            '<div class="price-cell">' +
            '<div class="price-main">' +
            formatPrice(item.price) +
            "</div>" +
            '<span class="pct-badge ' +
            pctBadge +
            " " +
            pctClass +
            '">' +
            formatPct(item.pct) +
            "</span>" +
            "</div>" +
            "</div>" +
            '<div class="badges">' +
            indexBadges +
            badge(item.sektor) +
            badge(item.papan) +
            "</div>" +
            "</div>" +
            '<div class="card-grid">' +
            cardItem("PxMA", maSquares) +
            cardItem("VxMA", vmaSquares) +
            cardItem("1% Trx Hari Ini", formatRupiah(item.pct1today)) +
            cardItem("1% Trx 20 Hari", formatRupiah(item.pct120d)) +
            cardItem("MFI", mfiText) +
            cardItem("RSI", rsiText) +
            cardItem("StochRSI", srsiText) +
            cardItem("ATR", atrText) +
            cardItem("ADR", adrText) +
            cardItem("MACD", macdChip) +
            cardItem("Skor", '<span class="score ' + score.cls + '">' + formatDec(item.score, 1) + "</span>") +
            "</div>" +
            "</article>"
        );
    }

    function renderLoadMoreSentinel(currentCount) {
        const remaining = state.filtered.length - currentCount;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn load-more-btn";
        button.textContent = "Muat Lagi (" + remaining.toLocaleString("id-ID") + " sisa)";
        els.cardList.appendChild(button);

        if (!("IntersectionObserver" in window)) {
            return;
        }

        state.cardObserver = new IntersectionObserver(
            function (entries) {
                const shouldLoad = entries.some(function (entry) {
                    return entry.isIntersecting;
                });
                if (shouldLoad) {
                    loadMoreCards();
                }
            },
            {
                root: null,
                rootMargin: "260px 0px",
                threshold: 0.01,
            },
        );
        state.cardObserver.observe(button);
    }

    function loadMoreCards() {
        if (state.renderLimit >= state.filtered.length) {
            disconnectCardObserver();
            return;
        }
        state.renderLimit = Math.min(state.filtered.length, state.renderLimit + getCardChunkSize());
        renderCards();
    }

    function disconnectCardObserver() {
        if (!state.cardObserver) {
            return;
        }
        state.cardObserver.disconnect();
        state.cardObserver = null;
    }

    function getCardChunkSize() {
        return isMobileViewport() ? CARD_CHUNK_MOBILE : CARD_CHUNK_DESKTOP;
    }

    function getInitialRenderLimit(totalRows) {
        const total = Number(totalRows) || 0;
        if (total <= 0) {
            return 0;
        }
        return Math.min(total, getCardChunkSize());
    }

    function cardItem(key, valueHtml, className) {
        const cls = className ? "card-kv " + className : "card-kv";
        return '<div class="' + cls + '"><div class="k">' + renderIndicatorKeyLabel(key) + '</div><div class="v">' + valueHtml + "</div></div>";
    }

    function renderIndicatorKeyLabel(key) {
        const safeKey = escapeHtml(key);
        if (!INDICATOR_HELP[key]) {
            return '<span class="k-text">' + safeKey + "</span>";
        }
        return (
            '<span class="k-text">' +
            safeKey +
            '</span><button type="button" class="hint-btn" data-help-key="' +
            safeKey +
            '" aria-label="Bantuan ' +
            safeKey +
            '">?</button>'
        );
    }

    function metricChip(text, tone, borderless) {
        const safeTone = tone || "neutral";
        const noBorder = borderless ? " metric-borderless" : "";
        return '<span class="metric ' + safeTone + noBorder + '">' + escapeHtml(text) + "</span>";
    }

    function toneByRsi(value) {
        if (value == null) {
            return "neutral";
        }
        if (value >= 50 && value <= 70) {
            return "good";
        }
        if (value < 40 || value > 80) {
            return "bad";
        }
        return "warn";
    }

    function toneByMfi(value) {
        if (value == null) {
            return "neutral";
        }
        if (value <= 20) {
            return "good";
        }
        if (value > 80) {
            return "bad";
        }
        if (value >= 50) {
            return "good";
        }
        return "warn";
    }

    function toneByStochRsi(value) {
        if (value == null) {
            return "neutral";
        }
        if (value <= 20) {
            return "good";
        }
        if (value >= 80) {
            return "bad";
        }
        return "warn";
    }

    function toneByRange(value) {
        if (value == null) {
            return "neutral";
        }
        if (value < 1.5) {
            return "bad";
        }
        if (value < 5) {
            return "good";
        }
        return "warn";
    }

    function badge(text, cls) {
        if (!text) {
            return "";
        }
        const className = cls ? "badge " + cls : "badge";
        return '<span class="' + className + '">' + escapeHtml(text) + "</span>";
    }

    function showLoading(message) {
        disconnectCardObserver();
        els.cardList.innerHTML = '<div class="stock-card"><div class="card-company">' + escapeHtml(message) + "</div></div>";
    }

    function showError(message) {
        showLoading(message);
        els.tsText.textContent = "Data: gagal";
        els.statsCount.textContent = "0 saham";
    }

    function resetAllFilters() {
        state.preset = "all";
        state.activeTF = "1d";
        state.idx = "all";
        state.sektor = "all";
        state.maF.clear();
        state.vmaF.clear();
        state.rsi = "all";
        state.srsi = "all";
        state.atr = "all";
        state.adr = "all";
        state.search = "";
        state.sortCol = "score";
        state.sortDir = "desc";

        els.presetSelect.value = state.preset;
        els.timeframeSelect.value = state.activeTF;
        els.idxSelect.value = state.idx;
        els.sektorSelect.value = state.sektor;
        populateToggleSelect(els.maSelect, MA_OPTIONS, state.maF, "PxMA");
        populateToggleSelect(els.vmaSelect, VMA_OPTIONS, state.vmaF, "VxMA");
        els.rsiSelect.value = state.rsi;
        els.srsiSelect.value = state.srsi;
        els.atrSelect.value = state.atr;
        els.adrSelect.value = state.adr;
        updatePresetInfo();

        els.searchInput.value = "";
        els.sortSelect.value = "score:desc";

        switchTimeframe("1d");
    }

    function debounceApply() {
        if (state.searchTimer) {
            clearTimeout(state.searchTimer);
            state.searchTimer = null;
        }
        state.searchTimer = setTimeout(function () {
            applyFiltersAndRender();
        }, 200);
    }

    function getSectorList() {
        if (typeof SEKTOR_LIST !== "undefined" && Array.isArray(SEKTOR_LIST) && SEKTOR_LIST.length) {
            return SEKTOR_LIST.slice();
        }

        const dynamic = Object.keys(TM || {}).reduce(function (acc, ticker) {
            const sector = TM[ticker] && TM[ticker].s;
            if (sector) {
                acc.add(sector);
            }
            return acc;
        }, new Set());

        return Array.from(dynamic).sort();
    }

    function toFiniteNumber(value) {
        return Number.isFinite(value) ? value : Number.isFinite(Number(value)) ? Number(value) : null;
    }

    function formatPrice(value) {
        if (value == null) {
            return "—";
        }
        if (value >= 1000) {
            return Math.round(value).toLocaleString("id-ID");
        }
        return value.toFixed(value >= 10 ? 0 : 2);
    }

    function formatPct(value) {
        if (value == null) {
            return "—";
        }
        return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
    }

    function formatDec(value, digits) {
        if (value == null) {
            return "—";
        }
        return Number(value).toFixed(digits || 0);
    }

    function formatRupiah(value) {
        if (value == null || !Number.isFinite(value) || value === 0) {
            return "—";
        }
        const abs = Math.abs(value);
        if (abs >= 1e12) {
            return "Rp " + (value / 1e12).toFixed(1) + " T";
        }
        if (abs >= 1e9) {
            return "Rp " + (value / 1e9).toFixed(1) + " Mil";
        }
        if (abs >= 1e6) {
            return "Rp " + (value / 1e6).toFixed(1) + " Jt";
        }
        if (abs >= 1e3) {
            return "Rp " + (value / 1e3).toFixed(1) + " Rb";
        }
        return "Rp " + value.toFixed(0);
    }

    function formatWib(isoDate) {
        const date = new Date(isoDate);
        if (Number.isNaN(date.getTime())) {
            return "-";
        }
        const wib = new Date(date.getTime() + 7 * 3600000);
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const dd = wib.getUTCDate();
        const mm = months[wib.getUTCMonth()];
        const yyyy = wib.getUTCFullYear();
        const hh = String(wib.getUTCHours()).padStart(2, "0");
        const mi = String(wib.getUTCMinutes()).padStart(2, "0");
        return dd + " " + mm + " " + yyyy + ", " + hh + "." + mi;
    }

    function stockbitSymbolUrl(ticker) {
        const symbol = encodeURIComponent(String(ticker || "").trim().toUpperCase());
        return "https://stockbit.com/#/symbol/" + symbol;
    }

    function signalSquares(source, keys, labels, mode) {
        const className = mode === "vol" ? "vol-squares" : "ma-squares";
        const squareClass = mode === "vol" ? "vol-sq" : "ma-sq";
        const items = keys
            .map(function (key, idx) {
                const on = source && source[key] === true;
                const label = labels[idx] || key;
                return (
                    '<span class="' +
                    squareClass +
                    " " +
                    (on ? "on" : "off") +
                    '" title="' +
                    escapeHtml(label) +
                    '">' +
                    escapeHtml(label) +
                    "</span>"
                );
            })
            .join("");
        return '<div class="' + className + '">' + items + "</div>";
    }

    function rsiLabel(value) {
        if (value == null) {
            return "—";
        }
        if (value < 30) {
            return "Oversold";
        }
        if (value < 50) {
            return "Lemah";
        }
        if (value <= 70) {
            return "Sweet";
        }
        if (value <= 80) {
            return "Kuat";
        }
        return "Overbought";
    }

    function mfiLabel(value) {
        if (value == null) {
            return "—";
        }
        if (value <= 20) {
            return "Oversold";
        }
        if (value < 50) {
            return "Lemah";
        }
        if (value <= 80) {
            return "Normal";
        }
        return "Overbought";
    }

    function srsiLabel(value) {
        if (value == null) {
            return "—";
        }
        if (value < 20) {
            return "Oversold";
        }
        if (value <= 80) {
            return "Netral";
        }
        return "Overbought";
    }

    function rangeLabel(value) {
        if (value == null) {
            return "—";
        }
        if (value < 1.5) {
            return "Lesu";
        }
        if (value < 5) {
            return "Normal";
        }
        return "Aktif";
    }

    function scoreInfo(score) {
        if (score >= 8) {
            return { cls: "hi" };
        }
        if (score >= 6) {
            return { cls: "md" };
        }
        return { cls: "lo" };
    }

    function companyDisplayName(value) {
        const raw = String(value || "").trim();
        if (!raw) {
            return "—";
        }

        let text = raw.replace(/^\s*(?:P\s*\.?\s*T\s*\.?)(?:\s+|$)/i, "");
        let prev = "";

        while (text && text !== prev) {
            prev = text;
            text = text
                .replace(/\s*[,.-]?\s*(?:T\s*\.?\s*B\s*\.?\s*K\s*\.?)\s*$/i, "")
                .replace(/\s*[,.-]?\s*\(?\s*PERSEROAN\s+TERBATAS\s*\)?\s*$/i, "")
                .replace(/\s*[,.-]?\s*\(?\s*PERSERO\s*\)?\s*$/i, "")
                .replace(/\s*[,.-]+\s*$/g, "")
                .trim();
        }

        return text || raw;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
})();
