// fetch_data.js — GitHub Actions
// Ambil data saham dari Yahoo Finance untuk 2 timeframe (1d, 1wk)
// 1D: langsung dari Yahoo interval=1d range=1y
// 1W: di-aggregate dari daily bars (interval=1d range=5y) per minggu ISO (Sen-Jum)
//     Sebelum Senin 09:00 WIB → minggu berjalan tidak dimasukkan
//     Minggu berjalan = kumulatif data harian Sen s/d hari terakhir perdagangan
// Simpan 2 metrik transaksi:
// - pct1today: 1% dari nilai transaksi hari terakhir
// - pct120d: 1% dari rata-rata nilai transaksi 20 hari perdagangan terakhir
// Repo: screenersaham

import { writeFileSync, mkdirSync, readFileSync, existsSync, statSync } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (typeof fetch !== "function") {
  throw new Error("Global fetch is unavailable. Use Node.js 18+.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const MIN_SUCCESS_RATIO = 0.9;
// Reversible payload mode:
// true  => keep legacy `data` field (duplicate of timeframes["1d"])
// false => compact payload; frontend reads from `timeframes`.
const EMIT_LEGACY_DATA_FIELD = false;
const OFFLINE_CACHE_DIR = path.join(rootDir, "data", "offline-cache", "yahoo-chart");
const OFFLINE_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam
const OFFLINE_CACHE_FALLBACK_STALE = true;
const OFFLINE_CACHE_INCREMENTAL_OVERLAP_SEC = 15 * 24 * 60 * 60; // 15 hari overlap

const TICKERS = [
  "AADI",
  "AALI",
  "ABBA",
  "ABDA",
  "ABMM",
  "ACES",
  "ACRO",
  "ACST",
  "ADCP",
  "ADES",
  "ADHI",
  "ADMF",
  "ADMG",
  "ADMR",
  "ADRO",
  "AEGS",
  "AGAR",
  "AGII",
  "AGRO",
  "AGRS",
  "AHAP",
  "AIMS",
  "AISA",
  "AKKU",
  "AKPI",
  "AKRA",
  "AKSI",
  "ALDO",
  "ALII",
  "ALKA",
  "ALMI",
  "ALTO",
  "AMAG",
  "AMAN",
  "AMAR",
  "AMFG",
  "AMIN",
  "AMMN",
  "AMMS",
  "AMOR",
  "AMRT",
  "ANDI",
  "ANJT",
  "ANTM",
  "APEX",
  "APIC",
  "APII",
  "APLI",
  "APLN",
  "ARCI",
  "AREA",
  "ARGO",
  "ARII",
  "ARKA",
  "ARKO",
  "ARMY",
  "ARNA",
  "ARTA",
  "ARTI",
  "ARTO",
  "ASBI",
  "ASDM",
  "ASGR",
  "ASHA",
  "ASII",
  "ASJT",
  "ASLC",
  "ASLI",
  "ASMI",
  "ASPI",
  "ASPR",
  "ASRI",
  "ASRM",
  "ASSA",
  "ATAP",
  "ATIC",
  "ATLA",
  "AUTO",
  "AVIA",
  "AWAN",
  "AXIO",
  "AYAM",
  "AYLS",
  "BABP",
  "BABY",
  "BACA",
  "BAIK",
  "BAJA",
  "BALI",
  "BANK",
  "BAPA",
  "BAPI",
  "BATA",
  "BATR",
  "BAUT",
  "BAYU",
  "BBCA",
  "BBHI",
  "BBKP",
  "BBLD",
  "BBMD",
  "BBNI",
  "BBRI",
  "BBRM",
  "BBSI",
  "BBSS",
  "BBTN",
  "BBYB",
  "BCAP",
  "BCIC",
  "BCIP",
  "BDKR",
  "BDMN",
  "BEBS",
  "BEEF",
  "BEER",
  "BEKS",
  "BELI",
  "BELL",
  "BESS",
  "BEST",
  "BFIN",
  "BGTG",
  "BHAT",
  "BHIT",
  "BIKA",
  "BIKE",
  "BIMA",
  "BINA",
  "BINO",
  "BIPI",
  "BIPP",
  "BIRD",
  "BISI",
  "BJBR",
  "BJTM",
  "BKDP",
  "BKSL",
  "BKSW",
  "BLES",
  "BLOG",
  "BLTA",
  "BLTZ",
  "BLUE",
  "BMAS",
  "BMBL",
  "BMHS",
  "BMRI",
  "BMSR",
  "BMTR",
  "BNBA",
  "BNBR",
  "BNGA",
  "BNII",
  "BNLI",
  "BOAT",
  "BOBA",
  "BOGA",
  "BOLA",
  "BOLT",
  "BOSS",
  "BPFI",
  "BPII",
  "BPTR",
  "BRAM",
  "BREN",
  "BRIS",
  "BRMS",
  "BRNA",
  "BRPT",
  "BRRC",
  "BSBK",
  "BSDE",
  "BSIM",
  "BSML",
  "BSSR",
  "BSWD",
  "BTEK",
  "BTEL",
  "BTON",
  "BTPN",
  "BTPS",
  "BUAH",
  "BUDI",
  "BUKA",
  "BUKK",
  "BULL",
  "BUMI",
  "BUVA",
  "BVIC",
  "BWPT",
  "BYAN",
  "CAKK",
  "CAMP",
  "CANI",
  "CARE",
  "CARS",
  "CASA",
  "CASH",
  "CASS",
  "CBDK",
  "CBMF",
  "CBPE",
  "CBRE",
  "CBUT",
  "CCSI",
  "CDIA",
  "CEKA",
  "CENT",
  "CFIN",
  "CGAS",
  "CHEK",
  "CHEM",
  "CHIP",
  "CINT",
  "CITA",
  "CITY",
  "CLAY",
  "CLEO",
  "CLPI",
  "CMNP",
  "CMNT",
  "CMPP",
  "CMRY",
  "CNKO",
  "CNMA",
  "CNTX",
  "COAL",
  "COCO",
  "COIN",
  "COWL",
  "CPIN",
  "CPRI",
  "CPRO",
  "CRAB",
  "CRSN",
  "CSAP",
  "CSIS",
  "CSMI",
  "CSRA",
  "CTBN",
  "CTRA",
  "CTTH",
  "CUAN",
  "CYBR",
  "DAAZ",
  "DADA",
  "DART",
  "DATA",
  "DAYA",
  "DCII",
  "DEAL",
  "DEFI",
  "DEPO",
  "DEWA",
  "DEWI",
  "DFAM",
  "DGIK",
  "DGNS",
  "DGWG",
  "DIGI",
  "DILD",
  "DIVA",
  "DKFT",
  "DKHH",
  "DLTA",
  "DMAS",
  "DMMX",
  "DMND",
  "DNAR",
  "DNET",
  "DOID",
  "DOOH",
  "DOSS",
  "DPNS",
  "DPUM",
  "DRMA",
  "DSFI",
  "DSNG",
  "DSSA",
  "DUCK",
  "DUTI",
  "DVLA",
  "DWGL",
  "DYAN",
  "EAST",
  "ECII",
  "EDGE",
  "EKAD",
  "ELIT",
  "ELPI",
  "ELSA",
  "ELTY",
  "EMAS",
  "EMDE",
  "EMTK",
  "ENAK",
  "ENRG",
  "ENVY",
  "ENZO",
  "EPAC",
  "EPMT",
  "ERAA",
  "ERAL",
  "ERTX",
  "ESIP",
  "ESSA",
  "ESTA",
  "ESTI",
  "ETWA",
  "EURO",
  "EXCL",
  "FAPA",
  "FAST",
  "FASW",
  "FILM",
  "FIMP",
  "FIRE",
  "FISH",
  "FITT",
  "FLMC",
  "FMII",
  "FOLK",
  "FOOD",
  "FORE",
  "FORU",
  "FPNI",
  "FUJI",
  "FUTR",
  "FWCT",
  "GAMA",
  "GDST",
  "GDYR",
  "GEMA",
  "GEMS",
  "GGRM",
  "GGRP",
  "GHON",
  "GIAA",
  "GJTL",
  "GLOB",
  "GLVA",
  "GMFI",
  "GMTD",
  "GOLD",
  "GOLF",
  "GOLL",
  "GOOD",
  "GOTO",
  "GPRA",
  "GPSO",
  "GRIA",
  "GRPH",
  "GRPM",
  "GSMF",
  "GTBO",
  "GTRA",
  "GTSI",
  "GULA",
  "GUNA",
  "GWSA",
  "GZCO",
  "HADE",
  "HAIS",
  "HAJJ",
  "HALO",
  "HATM",
  "HBAT",
  "HDFA",
  "HDIT",
  "HEAL",
  "HELI",
  "HERO",
  "HEXA",
  "HGII",
  "HILL",
  "HITS",
  "HKMU",
  "HMSP",
  "HOKI",
  "HOME",
  "HOMI",
  "HOPE",
  "HOTL",
  "HRME",
  "HRTA",
  "HRUM",
  "HUMI",
  "HYGN",
  "IATA",
  "IBFN",
  "IBOS",
  "IBST",
  "ICBP",
  "ICON",
  "IDEA",
  "IDPR",
  "IFII",
  "IFSH",
  "IGAR",
  "IIKP",
  "IKAI",
  "IKAN",
  "IKBI",
  "IKPM",
  "IMAS",
  "IMJS",
  "IMPC",
  "INAF",
  "INAI",
  "INCF",
  "INCI",
  "INCO",
  "INDF",
  "INDO",
  "INDR",
  "INDS",
  "INDX",
  "INDY",
  "INET",
  "INKP",
  "INOV",
  "INPC",
  "INPP",
  "INPS",
  "INRU",
  "INTA",
  "INTD",
  "INTP",
  "IOTF",
  "IPAC",
  "IPCC",
  "IPCM",
  "IPOL",
  "IPPE",
  "IPTV",
  "IRRA",
  "IRSX",
  "ISAP",
  "ISAT",
  "ISEA",
  "ISSP",
  "ITIC",
  "ITMA",
  "ITMG",
  "JARR",
  "JAST",
  "JATI",
  "JAWA",
  "JAYA",
  "JECC",
  "JGLE",
  "JIHD",
  "JKON",
  "JMAS",
  "JPFA",
  "JRPT",
  "JSKY",
  "JSMR",
  "JSPT",
  "JTPE",
  "KAEF",
  "KAQI",
  "KARW",
  "KAYU",
  "KBAG",
  "KBLI",
  "KBLM",
  "KBLV",
  "KBRI",
  "KDSI",
  "KDTN",
  "KEEN",
  "KEJU",
  "KETR",
  "KIAS",
  "KICI",
  "KIJA",
  "KING",
  "KINO",
  "KIOS",
  "KJEN",
  "KKES",
  "KKGI",
  "KLAS",
  "KLBF",
  "KLIN",
  "KMDS",
  "KMTR",
  "KOBX",
  "KOCI",
  "KOIN",
  "KOKA",
  "KONI",
  "KOPI",
  "KOTA",
  "KPIG",
  "KRAS",
  "KREN",
  "KRYA",
  "KSIX",
  "KUAS",
  "LABA",
  "LABS",
  "LAJU",
  "LAND",
  "LAPD",
  "LCGP",
  "LCKM",
  "LEAD",
  "LFLO",
  "LIFE",
  "LINK",
  "LION",
  "LIVE",
  "LMAS",
  "LMAX",
  "LMPI",
  "LMSH",
  "LOPI",
  "LPCK",
  "LPGI",
  "LPIN",
  "LPKR",
  "LPLI",
  "LPPF",
  "LPPS",
  "LRNA",
  "LSIP",
  "LTLS",
  "LUCK",
  "LUCY",
  "MABA",
  "MAGP",
  "MAHA",
  "MAIN",
  "MANG",
  "MAPA",
  "MAPB",
  "MAPI",
  "MARI",
  "MARK",
  "MASB",
  "MAXI",
  "MAYA",
  "MBAP",
  "MBMA",
  "MBSS",
  "MBTO",
  "MCAS",
  "MCOL",
  "MCOR",
  "MDIA",
  "MDIY",
  "MDKA",
  "MDKI",
  "MDLA",
  "MDLN",
  "MDRN",
  "MEDC",
  "MEDS",
  "MEGA",
  "MEJA",
  "MENN",
  "MERI",
  "MERK",
  "META",
  "MFMI",
  "MGLV",
  "MGNA",
  "MGRO",
  "MHKI",
  "MICE",
  "MIDI",
  "MIKA",
  "MINA",
  "MINE",
  "MIRA",
  "MITI",
  "MKAP",
  "MKNT",
  "MKPI",
  "MKTR",
  "MLBI",
  "MLIA",
  "MLPL",
  "MLPT",
  "MMIX",
  "MMLP",
  "MNCN",
  "MOLI",
  "MORA",
  "MPIX",
  "MPMX",
  "MPOW",
  "MPPA",
  "MPRO",
  "MPXL",
  "MRAT",
  "MREI",
  "MSIE",
  "MSIN",
  "MSJA",
  "MSKY",
  "MSTI",
  "MTDL",
  "MTEL",
  "MTFN",
  "MTLA",
  "MTMH",
  "MTPS",
  "MTRA",
  "MTSM",
  "MTWI",
  "MUTU",
  "MYOH",
  "MYOR",
  "MYTX",
  "NAIK",
  "NANO",
  "NASA",
  "NASI",
  "NATO",
  "NAYZ",
  "NCKL",
  "NELY",
  "NEST",
  "NETV",
  "NFCX",
  "NICE",
  "NICK",
  "NICL",
  "NIKL",
  "NINE",
  "NIRO",
  "NISP",
  "NOBU",
  "NPGF",
  "NRCA",
  "NSSS",
  "NTBK",
  "NUSA",
  "NZIA",
  "OASA",
  "OBAT",
  "OBMD",
  "OCAP",
  "OILS",
  "OKAS",
  "OLIV",
  "OMED",
  "OMRE",
  "OPMS",
  "PACK",
  "PADA",
  "PADI",
  "PALM",
  "PAMG",
  "PANI",
  "PANR",
  "PANS",
  "PART",
  "PBID",
  "PBRX",
  "PBSA",
  "PCAR",
  "PDES",
  "PDPP",
  "PEGE",
  "PEHA",
  "PEVE",
  "PGAS",
  "PGEO",
  "PGJO",
  "PGLI",
  "PGUN",
  "PICO",
  "PIPA",
  "PJAA",
  "PJHB",
  "PKPK",
  "PLAN",
  "PLAS",
  "PLIN",
  "PMJS",
  "PMMP",
  "PMUI",
  "PNBN",
  "PNBS",
  "PNGO",
  "PNIN",
  "PNLF",
  "PNSE",
  "POLA",
  "POLI",
  "POLL",
  "POLU",
  "POLY",
  "POOL",
  "PORT",
  "POSA",
  "POWR",
  "PPGL",
  "PPRE",
  "PPRI",
  "PPRO",
  "PRAY",
  "PRDA",
  "PRIM",
  "PSAB",
  "PSAT",
  "PSDN",
  "PSGO",
  "PSKT",
  "PSSI",
  "PTBA",
  "PTDU",
  "PTIS",
  "PTMP",
  "PTMR",
  "PTPP",
  "PTPS",
  "PTPW",
  "PTRO",
  "PTSN",
  "PTSP",
  "PUDP",
  "PURA",
  "PURE",
  "PURI",
  "PWON",
  "PYFA",
  "PZZA",
  "RAAM",
  "RAFI",
  "RAJA",
  "RALS",
  "RANC",
  "RATU",
  "RBMS",
  "RCCC",
  "RDTX",
  "REAL",
  "RELF",
  "RELI",
  "RGAS",
  "RICY",
  "RIGS",
  "RIMO",
  "RISE",
  "RLCO",
  "RMKE",
  "RMKO",
  "ROCK",
  "RODA",
  "RONY",
  "ROTI",
  "RSCH",
  "RSGK",
  "RUIS",
  "RUNS",
  "SAFE",
  "SAGE",
  "SAME",
  "SAMF",
  "SAPX",
  "SATU",
  "SBAT",
  "SBMA",
  "SCCO",
  "SCMA",
  "SCNP",
  "SCPI",
  "SDMU",
  "SDPC",
  "SDRA",
  "SEMA",
  "SFAN",
  "SGER",
  "SGRO",
  "SHID",
  "SHIP",
  "SICO",
  "SIDO",
  "SILO",
  "SIMA",
  "SIMP",
  "SINI",
  "SIPD",
  "SKBM",
  "SKLT",
  "SKRN",
  "SKYB",
  "SLIS",
  "SMAR",
  "SMBR",
  "SMCB",
  "SMDM",
  "SMDR",
  "SMGA",
  "SMGR",
  "SMIL",
  "SMKL",
  "SMKM",
  "SMLE",
  "SMMA",
  "SMMT",
  "SMRA",
  "SMRU",
  "SMSM",
  "SNLK",
  "SOCI",
  "SOFA",
  "SOHO",
  "SOLA",
  "SONA",
  "SOSS",
  "SOTS",
  "SOUL",
  "SPMA",
  "SPRE",
  "SPTO",
  "SQMI",
  "SRAJ",
  "SRIL",
  "SRSN",
  "SRTG",
  "SSIA",
  "SSMS",
  "SSTM",
  "STAA",
  "STAR",
  "STRK",
  "STTP",
  "SUGI",
  "SULI",
  "SUNI",
  "SUPA",
  "SUPR",
  "SURE",
  "SURI",
  "SWAT",
  "SWID",
  "TALF",
  "TAMA",
  "TAMU",
  "TAPG",
  "TARA",
  "TAXI",
  "TAYS",
  "TBIG",
  "TBLA",
  "TBMS",
  "TCID",
  "TCPI",
  "TDPM",
  "TEBE",
  "TECH",
  "TELE",
  "TFAS",
  "TFCO",
  "TGKA",
  "TGRA",
  "TGUK",
  "TIFA",
  "TINS",
  "TIRA",
  "TIRT",
  "TKIM",
  "TLDN",
  "TLKM",
  "TMAS",
  "TMPO",
  "TNCA",
  "TOBA",
  "TOOL",
  "TOPS",
  "TOSK",
  "TOTL",
  "TOTO",
  "TOWR",
  "TOYS",
  "TPIA",
  "TPMA",
  "TRAM",
  "TRGU",
  "TRIL",
  "TRIM",
  "TRIN",
  "TRIO",
  "TRIS",
  "TRJA",
  "TRON",
  "TRST",
  "TRUE",
  "TRUK",
  "TRUS",
  "TSPC",
  "TUGU",
  "TYRE",
  "UANG",
  "UCID",
  "UDNG",
  "UFOE",
  "ULTJ",
  "UNIC",
  "UNIQ",
  "UNIT",
  "UNSP",
  "UNTD",
  "UNTR",
  "UNVR",
  "URBN",
  "UVCR",
  "VAST",
  "VERN",
  "VICI",
  "VICO",
  "VINS",
  "VISI",
  "VIVA",
  "VKTR",
  "VOKS",
  "VRNA",
  "VTNY",
  "WAPO",
  "WEGE",
  "WEHA",
  "WGSH",
  "WICO",
  "WIDI",
  "WIFI",
  "WIIM",
  "WIKA",
  "WINE",
  "WINR",
  "WINS",
  "WIRG",
  "WMPP",
  "WMUU",
  "WOMF",
  "WOOD",
  "WOWS",
  "WSBP",
  "WSKT",
  "WTON",
  "YELO",
  "YOII",
  "YPAS",
  "YULE",
  "YUPI",
  "ZATA",
  "ZBRA",
  "ZINC",
  "ZONE",
  "ZYRX",
];

function sanitizeToken(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function offlineCachePath(ticker, interval, range) {
  return path.join(
    OFFLINE_CACHE_DIR,
    `${sanitizeToken(ticker)}-${sanitizeToken(interval)}-${sanitizeToken(range)}.json`,
  );
}

function normalizeCachedRows(rows) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const row of rows) {
    const c = Number(row?.c);
    const h = Number(row?.h);
    const l = Number(row?.l);
    const v = Number(row?.v);
    const ts = Number(row?.ts);
    const oRaw = row?.o;
    const o =
      oRaw == null || Number.isNaN(Number(oRaw)) || Number(oRaw) <= 0
        ? c
        : Number(oRaw);
    if (
      Number.isFinite(c) &&
      Number.isFinite(h) &&
      Number.isFinite(l) &&
      Number.isFinite(v) &&
      Number.isFinite(ts) &&
      c > 0 &&
      h > 0 &&
      l > 0 &&
      v >= 0
    ) {
      out.push({ o, c, h, l, v, ts });
    }
  }
  return out;
}

function readOfflineCache(cachePath) {
  if (!existsSync(cachePath)) return null;
  try {
    const payload = JSON.parse(readFileSync(cachePath, "utf8"));
    const rows = normalizeCachedRows(payload?.rows);
    if (!rows.length) return null;
    const fetchedAtIso = String(payload?.fetchedAt || "");
    const fetchedAtMs = Date.parse(fetchedAtIso);
    const ageMs = Number.isFinite(fetchedAtMs) ? Date.now() - fetchedAtMs : Number.POSITIVE_INFINITY;
    return {
      company: payload?.company || payload?.ticker || "",
      rows,
      fetchedAt: fetchedAtIso,
      fresh: ageMs <= OFFLINE_CACHE_TTL_MS,
    };
  } catch (_) {
    return null;
  }
}

function writeOfflineCache(cachePath, payload) {
  try {
    mkdirSync(path.dirname(cachePath), { recursive: true });
    writeFileSync(cachePath, JSON.stringify(payload), "utf8");
  } catch (_) {}
}

function buildYahooUrls(symbol, interval, range, period1, period2) {
  if (
    Number.isFinite(period1) &&
    Number.isFinite(period2) &&
    period2 > period1
  ) {
    return [
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&period1=${Math.floor(period1)}&period2=${Math.floor(period2)}`,
      `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&period1=${Math.floor(period1)}&period2=${Math.floor(period2)}`,
    ];
  }
  return [
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
  ];
}

function mergeRowsByTs(existingRows, newRows) {
  const map = new Map();
  for (const row of existingRows || []) {
    if (Number.isFinite(Number(row?.ts))) {
      map.set(Number(row.ts), row);
    }
  }
  for (const row of newRows || []) {
    if (Number.isFinite(Number(row?.ts))) {
      map.set(Number(row.ts), row);
    }
  }
  return [...map.values()].sort((a, b) => a.ts - b.ts);
}

async function fetchYahooRows(symbol, ticker, interval, range, period1, period2) {
  const urls = buildYahooUrls(symbol, interval, range, period1, period2);
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const j = await res.json(),
        r = j?.chart?.result?.[0];
      if (!r) continue;
      const meta = r.meta || {},
        raw = r.indicators?.quote?.[0] || {},
        ts = r.timestamp || [];
      const rows = [];
      for (let i = 0; i < ts.length; i++) {
        const oRaw = raw.open?.[i];
        const c = raw.close?.[i],
          h = raw.high?.[i],
          l = raw.low?.[i],
          v = raw.volume?.[i];
        const o =
          oRaw != null && !isNaN(oRaw) && Number(oRaw) > 0 ? Number(oRaw) : c;
        if (
          c != null &&
          h != null &&
          l != null &&
          v != null &&
          !isNaN(c) &&
          c > 0 &&
          h > 0 &&
          l > 0
        )
          rows.push({ o, c, h, l, v, ts: ts[i] });
      }
      if (!rows.length) continue;
      const company =
        (meta.longName || meta.shortName || "")
          .replace(/\s*\([^)]*\)\s*/g, "")
          .trim() || ticker;
      return { rows, company };
    } catch (_) {}
  }
  return null;
}

// ── MATH ──────────────────────────────────────
function ema(a, p) {
  if (!a || a.length < p) return null;
  const k = 2 / (p + 1);
  let v = a.slice(0, p).reduce((x, y) => x + y, 0) / p;
  for (let i = p; i < a.length; i++) v = a[i] * k + v * (1 - k);
  return v;
}
function sma(a, p) {
  if (!a || a.length < p) return null;
  return a.slice(-p).reduce((x, y) => x + y, 0) / p;
}
function rsi(a) {
  if (!a || a.length < 15) return null;
  const s = a.slice(-15);
  let g = 0,
    l = 0;
  for (let i = 1; i < s.length; i++) {
    const d = s[i] - s[i - 1];
    if (d > 0) g += d;
    else l -= d;
  }
  const ag = g / 14,
    al = l / 14;
  return al === 0 ? 100 : 100 - 100 / (1 + ag / al);
}
function stochRSI(a) {
  if (!a || a.length < 33) return null;
  const ra = [];
  for (let i = 15; i <= a.length; i++) {
    const s = a.slice(0, i).slice(-15);
    let g = 0,
      l = 0;
    for (let j = 1; j < s.length; j++) {
      const d = s[j] - s[j - 1];
      if (d > 0) g += d;
      else l -= d;
    }
    const ag = g / 14,
      al = l / 14;
    ra.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
  }
  if (ra.length < 14) return null;
  const rec = ra.slice(-14),
    mn = Math.min(...rec),
    mx = Math.max(...rec);
  return mx === mn ? 50 : ((ra[ra.length - 1] - mn) / (mx - mn)) * 100;
}
function mfi(rows, p = 14) {
  if (!rows || rows.length < p + 1) return null;
  let pos = 0;
  let neg = 0;
  for (let i = rows.length - p; i < rows.length; i++) {
    const tp = (rows[i].h + rows[i].l + rows[i].c) / 3;
    const prevTp = (rows[i - 1].h + rows[i - 1].l + rows[i - 1].c) / 3;
    const flow = tp * rows[i].v;
    if (tp > prevTp) pos += flow;
    else if (tp < prevTp) neg += flow;
  }
  if (neg === 0) return 100;
  const mr = pos / neg;
  return 100 - 100 / (1 + mr);
}
function macd(a) {
  if (!a || a.length < 35) return null;
  const lines = [];
  for (let i = 26; i <= a.length; i++) {
    const sl = a.slice(0, i),
      m12 = ema(sl, 12),
      m26 = ema(sl, 26);
    if (m12 !== null && m26 !== null) lines.push(m12 - m26);
  }
  if (lines.length < 9) return null;
  const sig = ema(lines, 9);
  if (sig === null) return null;
  const line = lines.at(-1),
    hist = line - sig;
  let prevHist = null;
  if (lines.length >= 2) {
    const pl = lines.slice(0, -1),
      ps = ema(pl, 9);
    if (ps !== null) prevHist = pl.at(-1) - ps;
  }
  return {
    line,
    signal: sig,
    hist,
    bull: hist > 0,
    cross: prevHist !== null && Math.sign(hist) !== Math.sign(prevHist),
  };
}
function atr(rows, p = 14) {
  if (!rows || rows.length < p + 1) return null;
  const trs = [];
  for (let i = 1; i < rows.length; i++)
    trs.push(
      Math.max(
        rows[i].h - rows[i].l,
        Math.abs(rows[i].h - rows[i - 1].c),
        Math.abs(rows[i].l - rows[i - 1].c),
      ),
    );
  return trs.length >= p ? trs.slice(-p).reduce((a, b) => a + b, 0) / p : null;
}
function adr(rows, p = 14) {
  if (!rows || rows.length < p) return null;
  const r = rows.slice(-p);
  return {
    nom: r.reduce((a, b) => a + (b.h - b.l), 0) / p,
    pct: (r.reduce((a, b) => a + (b.h - b.l) / b.l, 0) / p) * 100,
  };
}

// ── CALCULATE INDICATORS FROM ROWS ──────────
function calc(ticker, company, rows, pct1today, pct120d) {
  const closes = rows.map((x) => x.c),
    vols = rows.map((x) => x.v);
  const last = closes.at(-1),
    prev = closes.at(-2) ?? last,
    pct = ((last - prev) / prev) * 100;
  const e3 = ema(closes, 3),
    e5 = ema(closes, 5),
    e10 = ema(closes, 10),
    e20 = ema(closes, 20);
  const shortEmaStackBull =
    e3 != null && e5 != null && e10 != null && e20 != null && e3 > e5 && e5 > e10 && e10 > e20;
  const shortEmaNearestDistPct = [e3, e5, e10, e20]
    .filter((v) => v != null && v > 0)
    .reduce((min, emaValue) => {
      const dist = Math.abs(((last - emaValue) / emaValue) * 100);
      return min == null || dist < min ? dist : min;
    }, null);
  const lastRow = rows.at(-1) || null;
  const prevRow = rows.at(-2) || null;
  const pullbackToEma =
    lastRow != null &&
    e10 != null &&
    e20 != null &&
    (lastRow.l <= e10 || lastRow.l <= e20) &&
    last > e10 &&
    last > e20;
  const pullbackBreakoutSignal =
    shortEmaStackBull && pullbackToEma && prevRow != null && prevRow.h != null && last > prevRow.h;
  const avgValue20 = pct120d != null ? pct120d * 100 : null;
  const s50 = sma(closes, 50),
    s100 = sma(closes, 100),
    s200 = sma(closes, 200);
  const rsiV = rsi(closes),
    mfiV = mfi(rows),
    srsiV = stochRSI(closes),
    macdV = macd(closes);
  const atrV = atr(rows),
    adrV = adr(rows);
  const lastVol = vols.at(-1) ?? 0,
    lastValue = lastVol * last;
  const vm3 = sma(vols, 3),
    vm5 = sma(vols, 5),
    vm10 = sma(vols, 10),
    vm20 = sma(vols, 20),
    vm50 = sma(vols, 50),
    vm100 = sma(vols, 100),
    vm200 = sma(vols, 200);
  const ms = {
    ema3: e3 !== null && last > e3,
    ema5: e5 !== null && last > e5,
    ema10: e10 !== null && last > e10,
    ema20: e20 !== null && last > e20,
    sma50: s50 !== null && last > s50,
    sma100: s100 !== null && last > s100,
    sma200: s200 !== null && last > s200,
    vma3: vm3 !== null && lastVol > vm3,
    vma5: vm5 !== null && lastVol > vm5,
    vma10: vm10 !== null && lastVol > vm10,
    vma20: vm20 !== null && lastVol > vm20,
    vma50: vm50 !== null && lastVol > vm50,
    vma100: vm100 !== null && lastVol > vm100,
    vma200: vm200 !== null && lastVol > vm200,
  };
  const above4 = ms.ema3 && ms.ema5 && ms.ema10 && ms.ema20;
  let bull = 0,
    bear = 0;
  ["ema3", "ema5", "ema10", "ema20"].forEach((k) => {
    if (ms[k]) bull++;
    else bear++;
  });
  if (s50 !== null) {
    if (ms.sma50) bull++;
    else bear++;
  }
  if (s100 !== null) {
    if (ms.sma100) bull++;
    else bear++;
  }
  if (s200 !== null) {
    if (ms.sma200) bull++;
    else bear++;
  }
  if (rsiV !== null) {
    if (rsiV > 50) bull++;
    else bear++;
  }
  if (srsiV !== null) {
    if (srsiV > 50) bull++;
    else bear++;
  }
  if (macdV) {
    if (macdV.bull) bull++;
    else bear++;
  }
  return {
    ticker,
    company,
    price: last,
    pct,
    maStatus: ms,
    above4,
    bull,
    bear,
    rsi: rsiV,
    mfi: mfiV,
    stochRsi: srsiV,
    macdBull: macdV?.bull ?? null,
    macdHist: macdV?.hist ?? null,
    macdCross: macdV?.cross ?? false,
    shortEmaStackBull,
    shortEmaNearestDistPct,
    pullbackBreakoutSignal,
    atrV,
    adrPct: adrV?.pct ?? null,
    adrNom: adrV?.nom ?? null,
    lastVol,
    lastValue,
    avgValue20,
    pct1today,
    pct120d,
  };
}

// ── FETCH RAW OHLCV WITH TIMESTAMPS ─────────
async function fetchRaw(ticker, interval, range) {
  const cachePath = offlineCachePath(ticker, interval, range);
  const cached = readOfflineCache(cachePath);
  if (cached?.fresh) {
    return { rows: cached.rows, company: cached.company || ticker };
  }

  const sym = ticker + ".JK";
  if (cached?.rows?.length) {
    const lastTs = Number(cached.rows[cached.rows.length - 1]?.ts);
    if (Number.isFinite(lastTs) && lastTs > 0) {
      const period1 = Math.max(
        0,
        Math.floor(lastTs - OFFLINE_CACHE_INCREMENTAL_OVERLAP_SEC),
      );
      const period2 = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      const incremental = await fetchYahooRows(
        sym,
        ticker,
        interval,
        range,
        period1,
        period2,
      );
      if (incremental?.rows?.length) {
        const mergedRows = mergeRowsByTs(cached.rows, incremental.rows);
        const mergedCompany = incremental.company || cached.company || ticker;
        writeOfflineCache(cachePath, {
          ticker,
          interval,
          range,
          company: mergedCompany,
          fetchedAt: new Date().toISOString(),
          rows: mergedRows,
        });
        return { rows: mergedRows, company: mergedCompany };
      }
    }
  }

  const full = await fetchYahooRows(sym, ticker, interval, range);
  if (full?.rows?.length) {
    writeOfflineCache(cachePath, {
      ticker,
      interval,
      range,
      company: full.company,
      fetchedAt: new Date().toISOString(),
      rows: full.rows,
    });
    return full;
  }

  if (cached && OFFLINE_CACHE_FALLBACK_STALE) {
    return { rows: cached.rows, company: cached.company || ticker };
  }
  return null;
}

// ── BUILD WEEKLY CANDLES FROM DAILY BARS ─────
// Group daily bars by ISO week (Mon=start). Each weekly candle:
//   O=Monday open, H=max(highs), L=min(lows), C=Friday close, V=sum(vols)
// Current week = cumulative of daily bars so far this week.
// Before Monday 09:00 WIB, last candle = previous complete week.
function buildWeekly(dailyRows) {
  if (!dailyRows || dailyRows.length < 5) return [];
  // Group by ISO week key: find Monday of each bar's date
  const weeks = new Map();
  for (const r of dailyRows) {
    // Convert ts to WIB date
    const d = new Date((r.ts + 7 * 3600) * 1000);
    const dow = d.getUTCDay(); // 0=Sun..6=Sat
    // Find Monday of this week (ISO: Mon=1)
    const dayOff = dow === 0 ? 6 : dow - 1; // days since Monday
    const mon = new Date(d);
    mon.setUTCDate(mon.getUTCDate() - dayOff);
    const wk = mon.toISOString().slice(0, 10); // "YYYY-MM-DD" of Monday
    if (!weeks.has(wk)) weeks.set(wk, []);
    weeks.get(wk).push(r);
  }
  // Convert to sorted weekly candles
  const keys = [...weeks.keys()].sort();
  const out = [];
  for (const wk of keys) {
    const bars = weeks.get(wk);
    if (bars.length === 0) continue;
    out.push({
      c: bars.at(-1).c,
      h: Math.max(...bars.map((b) => b.h)),
      l: Math.min(...bars.map((b) => b.l)),
      v: bars.reduce((s, b) => s + b.v, 0),
    });
  }
  return out;
}

// ── FETCH ONE TICKER (1d + 1wk) ─────
async function fetchOne(ticker) {
  const raw1d = await fetchRaw(ticker, "1d", "1y");
  if (!raw1d || raw1d.rows.length < 30) return null;
  const company = raw1d.company;

  // 1% transaksi hari ini dan 1% transaksi rata-rata 20 hari
  const lastDaily = raw1d.rows.at(-1);
  const pct1today = ((lastDaily?.v ?? 0) * (lastDaily?.c ?? 0)) * 0.01;
  const daily20 = raw1d.rows.slice(-20);
  const avgValue20 = daily20.length
    ? daily20.reduce((s, r) => s + r.v * r.c, 0) / daily20.length
    : 0;
  const pct120d = avgValue20 * 0.01;

  // Strip ts for calc (only needs c,h,l,v)
  const d1rows = raw1d.rows.map((r) => ({ c: r.c, h: r.h, l: r.l, v: r.v }));
  const result = { "1d": calc(ticker, company, d1rows, pct1today, pct120d) };

  // 1wk — build from daily bars aggregated into weekly candles
  // Use 5y daily for enough weekly history
  const raw5y = await fetchRaw(ticker, "1d", "5y");
  if (raw5y && raw5y.rows.length >= 30) {
    // On weekends or before Monday 09:00 WIB, all daily data in Yahoo is
    // already from complete weeks (last bar = Friday), so no filtering needed.
    // During weekdays (Mon 09:00+ to Fri), the current week is a partial
    // in-progress week which buildWeekly handles naturally as cumulative.
    // So we always pass all daily bars — no exclusion needed.
    const wkRows = buildWeekly(raw5y.rows);
    if (wkRows.length >= 30)
      result["1wk"] = calc(ticker, company, wkRows, pct1today, pct120d);
  }

  return result;
}

// ── MAIN ──────────────────────────────────────
async function main() {
  const BATCH = 5;
  const tfR = { "1d": [], "1wk": [] };
  let ok = 0,
    fail = 0;
  console.log(
    `Fetching ${TICKERS.length} tickers × 2 timeframes (1d, 1wk from daily agg)…`,
  );
  for (let i = 0; i < TICKERS.length; i += BATCH) {
    const chunk = TICKERS.slice(i, i + BATCH);
    const res = await Promise.allSettled(chunk.map((t) => fetchOne(t)));
    res.forEach((r, idx) => {
      if (r.status === "fulfilled" && r.value) {
        for (const tf of ["1d", "1wk"])
          if (r.value[tf]) tfR[tf].push(r.value[tf]);
        ok++;
      } else {
        fail++;
        process.stdout.write(`  FAIL: ${chunk[idx]}\n`);
      }
    });
    process.stdout.write(
      `\r  ${Math.min(i + BATCH, TICKERS.length)}/${TICKERS.length} — ok:${ok} fail:${fail}   `,
    );
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  console.log(`  1d:${tfR["1d"].length} 1wk:${tfR["1wk"].length}`);

  const minSuccess = Math.ceil(TICKERS.length * MIN_SUCCESS_RATIO);
  if (ok < minSuccess) {
    throw new Error(
      `Insufficient data coverage: ${ok}/${TICKERS.length} (< ${minSuccess})`,
    );
  }

  mkdirSync("data", { recursive: true });
  const now = new Date();
  const wib = now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const hh = now
    .toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ".");
  const out = {
    fetchedAt: now.toISOString(),
    fetchedAtWIB: wib,
    fetchedTimeWIB: hh + " WIB",
    expectedCount: TICKERS.length,
    failedCount: fail,
    count: tfR["1d"].length,
    timeframes: tfR,
    ...(EMIT_LEGACY_DATA_FIELD ? { data: tfR["1d"] } : {}),
  };
  writeFileSync("data/issi_data.json", JSON.stringify(out));
  console.log(
    `Saved data/issi_data.json (${(JSON.stringify(out).length / 1024).toFixed(0)} KB)`,
  );
}

main().catch((err) => {
  console.error("Fatal fetch error:", err?.message || err);
  process.exit(1);
});
