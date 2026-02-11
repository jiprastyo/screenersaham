// fetch_data.js — GitHub Actions script
// Fetch ISSI data from Yahoo Finance → data/issi_data.json

import fetch from 'node-fetch';
import { writeFileSync, mkdirSync } from 'fs';

const TICKERS = ["AADI","AALI","ABMM","ACES","ACST","ADCP","ADES","ADHI","ADMG","ADMR","ADRO","AGAR","AGII","AIMS","AISA","AKKU","AKPI","AKRA","AKSI","ALDO","ALKA","AMAN","AMFG","AMIN","ANDI","ANJT","ANTM","APII","APLI","APLN","ARCI","AREA","ARGO","ARII","ARNA","ARTA","ASGR","ASHA","ASII","ASLC","ASLI","ASPI","ASRI","ASSA","ATAP","ATIC","ATLA","AUTO","AVIA","AWAN","AXIO","AYAM","AYLS","BABY","BAIK","BANK","BAPI","BATA","BATR","BAUT","BAYU","BBRM","BBSS","BCIP","BDKR","BEEF","BELI","BELL","BESS","BEST","BIKE","BINO","BIPP","BIRD","BISI","BKDP","BKSL","BLES","BLOG","BLTA","BLTZ","BLUE","BMHS","BMSR","BMTR","BNBR","BOAT","BOBA","BOGA","BOLA","BOLT","BRAM","BRIS","BRMS","BRNA","BRPT","BRRC","BSBK","BSDE","BSML","BSSR","BTPS","BUAH","BUKK","BULL","BUMI","BUVA","BYAN","CAKK","CAMP","CANI","CARE","CASS","CBDK","CBPE","CBRE","CCSI","CEKA","CGAS","CHEK","CHEM","CINT","CITA","CITY","CLEO","CLPI","CMNP","CMPP","CMRY","CNKO","CNMA","COAL","CPIN","CPRO","CRAB","CRSN","CSAP","CSIS","CSMI","CSRA","CTBN","CTRA","CYBR","DAAZ","DADA","DATA","DAYA","DCII","DEFI","DEPO","DEWA","DEWI","DGIK","DGNS","DGWG","DILD","DIVA","DKFT","DKHH","DMAS","DMMX","DMND","DOOH","DOSS","DRMA","DSFI","DSNG","DSSA","DUTI","DVLA","DWGL","DYAN","EAST","ECII","EDGE","EKAD","ELIT","ELPI","ELSA","ELTY","EMDE","ENAK","ENRG","EPAC","EPMT","ERAA","ERAL","ESIP","ESSA","ESTA","EXCL","FAST","FASW","FILM","FIRE","FISH","FITT","FMII","FOLK","FOOD","FORE","FPNI","FUTR","FWCT","GDST","GDYR","GEMA","GEMS","GGRP","GHON","GIAA","GJTL","GLVA","GMTD","GOLD","GOLF","GOOD","GPRA","GPSO","GRIA","GRPH","GTBO","GTRA","GTSI","GULA","GUNA","GWSA","GZCO","HADE","HAIS","HALO","HATM","HDIT","HEAL","HERO","HEXA","HGII","HITS","HOKI","HOMI","HOPE","HRME","HRUM","HUMI","HYGN","IATA","IBST","ICBP","ICON","IDPR","IFII","IFSH","IGAR","IIKP","IKAI","IKAN","IKBI","IKPM","IMPC","INCI","INCO","INDF","INDR","INDS","INDX","INDY","INET","INKP","INPP","INTD","INTP","IOTF","IPCC","IPCM","IPOL","IPTV","IRRA","IRSX","ISAT","ISSP","ITMA","ITMG","JAST","JATI","JAWA","JAYA","JECC","JGLE","JIHD","JKON","JMAS","JPFA","JRPT","JSMR","JSPT","JTPE","KAQI","KARW","KBAG","KBLI","KBLM","KDSI","KDTN","KEEN","KEJU","KETR","KIAS","KICI","KIJA","KINO","KIOS","KJEN","KKES","KKGI","KLAS","KLBF","KMDS","KOBX","KOCI","KOIN","KOKA","KONI","KOPI","KOTA","KPIG","KREN","KRYA","KSIX","KUAS","LABA","LABS","LAJU","LAND","LCKM","LION","LIVE","LMPI","LMSH","LPCK","LPIN","LPKR","LPLI","LPPF","LRNA","LSIP","LTLS","LUCK","MAHA","MAIN","MAPA","MAPB","MAPI","MARK","MAXI","MBAP","MBMA","MBTO","MCAS","MCOL","MDIY","MDKA","MDKI","MDLA","MEDC","MEDS","MERI","MERK","META","MFMI","MGNA","MHKI","MICE","MIDI","MIKA","MINA","MINE","MIRA","MITI","MKAP","MKPI","MKTR","MLIA","MLPL","MLPT","MMIX","MMLP","MNCN","MORA","MPIX","MPMX","MPOW","MPPA","MPRO","MRAT","MSIN","MSJA","MSKY","MSTI","MTDL","MTEL","MTFN","MTLA","MTMH","MTPS","MTSM","MUTU","MYOH","MYOR","NAIK","NASA","NASI","NCKL","NELY","NEST","NETV","NFCX","NICE","NICL","NIKL","NPGF","NRCA","NTBK","NZIA","OASA","OBAT","OBMD","OILS","OKAS","OMED","OMRE","PADA","PALM","PAMG","PANI","PANR","PART","PBID","PBSA","PCAR","PDES","PDPP","PEHA","PEVE","PGAS","PGEO","PGLI","PGUN","PICO","PIPA","PJAA","PJHB","PKPK","PLIN","PMJS","PMUI","PNBS","PNGO","PNSE","POLI","POLU","PORT","POWR","PPRE","PPRI","PPRO","PRAY","PRDA","PRIM","PSAB","PSAT","PSDN","PSGO","PSKT","PSSI","PTBA","PTIS","PTMP","PTMR","PTPP","PTPS","PTPW","PTSN","PTSP","PURA","PURI","PWON","PZZA","RAAM","RAFI","RAJA","RALS","RANC","RATU","RBMS","RDTX","RGAS","RIGS","RISE","RMKE","RMKO","ROCK","RODA","RONY","ROTI","RSGK","RUIS","SAFE","SAGE","SAME","SAMF","SAPX","SATU","SBMA","SCCO","SCNP","SCPI","SEMA","SGER","SGRO","SHID","SHIP","SICO","SIDO","SILO","SIMP","SIPD","SKBM","SKLT","SKRN","SLIS","SMAR","SMBR","SMCB","SMDM","SMDR","SMGA","SMGR","SMIL","SMKL","SMLE","SMMT","SMRA","SMSM","SNLK","SOCI","SOHO","SOLA","SONA","SOSS","SOTS","SPMA","SPTO","SRTG","SSIA","SSTM","STAA","STTP","SULI","SUNI","SUPR","SURI","SWID","TALF","TAMA","TAMU","TAPG","TARA","TAXI","TBMS","TCID","TCPI","TEBE","TFAS","TFCO","TGKA","TGUK","TINS","TIRA","TIRT","TKIM","TLDN","TLKM","TMAS","TMPO","TNCA","TOBA","TOOL","TOSK","TOTL","TOTO","TPIA","TPMA","TRIS","TRJA","TRON","TRST","TRUE","TRUK","TSPC","TYRE","UANG","UCID","UFOE","ULTJ","UNIC","UNIQ","UNTR","UNVR","UVCR","VAST","VERN","VICI","VISI","VKTR","VOKS","WAPO","WEGE","WEHA","WINR","WINS","WIRG","WMUU","WOOD","WOWS","WTON","YELO","YPAS","YUPI","ZATA","ZONE","ZYRX"];

// ── MATH ──────────────────────────────────────────────────────
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
  const s = a.slice(-15); let g = 0, l = 0;
  for (let i = 1; i < s.length; i++) { const d = s[i] - s[i-1]; if (d > 0) g += d; else l -= d; }
  const ag = g/14, al = l/14;
  return al === 0 ? 100 : 100 - 100 / (1 + ag / al);
}
function stochRSI(a) {
  if (!a || a.length < 33) return null;
  const ra = [];
  for (let i = 15; i <= a.length; i++) {
    const s = a.slice(0, i).slice(-15); let g = 0, l = 0;
    for (let j = 1; j < s.length; j++) { const d = s[j]-s[j-1]; if(d>0)g+=d; else l-=d; }
    const ag=g/14, al=l/14;
    ra.push(al===0 ? 100 : 100-100/(1+ag/al));
  }
  if (ra.length < 14) return null;
  const rec = ra.slice(-14), mn = Math.min(...rec), mx = Math.max(...rec);
  return mx === mn ? 50 : ((ra[ra.length-1] - mn) / (mx - mn)) * 100;
}
function macd(a) {
  if (!a || a.length < 35) return null;
  const lines = [];
  for (let i = 26; i <= a.length; i++) {
    const sl = a.slice(0, i);
    const m12 = ema(sl, 12), m26 = ema(sl, 26);
    if (m12 !== null && m26 !== null) lines.push(m12 - m26);
  }
  if (lines.length < 9) return null;
  const sig = ema(lines, 9);
  if (sig === null) return null;
  const line = lines.at(-1), hist = line - sig;
  let prevHist = null;
  if (lines.length >= 2) {
    const pl = lines.slice(0, -1), ps = ema(pl, 9);
    if (ps !== null) prevHist = pl.at(-1) - ps;
  }
  return { line, signal: sig, hist, bull: hist > 0, cross: prevHist !== null && Math.sign(hist) !== Math.sign(prevHist) };
}
function atr(rows, p = 14) {
  if (!rows || rows.length < p + 1) return null;
  const trs = [];
  for (let i = 1; i < rows.length; i++)
    trs.push(Math.max(rows[i].h-rows[i].l, Math.abs(rows[i].h-rows[i-1].c), Math.abs(rows[i].l-rows[i-1].c)));
  return trs.length >= p ? trs.slice(-p).reduce((a,b) => a+b, 0) / p : null;
}
function adr(rows, p = 14) {
  if (!rows || rows.length < p) return null;
  const r = rows.slice(-p);
  return {
    nom: r.reduce((a,b) => a + (b.h - b.l), 0) / p,
    pct: r.reduce((a,b) => a + (b.h - b.l) / b.l, 0) / p * 100
  };
}

// ── FETCH ONE ─────────────────────────────────────────────────
async function fetchOne(ticker) {
  const sym = ticker + '.JK';
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1y`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1y`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(12000)
      });
      if (!res.ok) continue;
      const j = await res.json();
      const r = j?.chart?.result?.[0];
      if (!r) continue;

      const meta = r.meta || {};
      const raw = r.indicators?.quote?.[0] || {};
      const ts = r.timestamp || [];
      const rows = [];
      for (let i = 0; i < ts.length; i++) {
        const c=raw.close?.[i], h=raw.high?.[i], l=raw.low?.[i], v=raw.volume?.[i];
        if (c!=null&&h!=null&&l!=null&&v!=null&&!isNaN(c)&&c>0&&h>0&&l>0) rows.push({c,h,l,v});
      }
      if (rows.length < 30) continue;

      const closes = rows.map(x => x.c), vols = rows.map(x => x.v);
      const last = closes.at(-1), prev = closes.at(-2) ?? last;
      const pct = ((last - prev) / prev) * 100;

      const e3=ema(closes,3), e5=ema(closes,5), e10=ema(closes,10), e20=ema(closes,20);
      const s50=sma(closes,50), s100=sma(closes,100), s200=sma(closes,200);
      const rsiV=rsi(closes), srsiV=stochRSI(closes);
      const macdV=macd(closes);
      const atrV=atr(rows), adrV=adr(rows);
      const lastVol=vols.at(-1)??0;
      const lastValue=lastVol*last, pct1today=lastValue*0.01;
      const vm3=sma(vols,3), vm5=sma(vols,5), vm20=sma(vols,20), vm50=sma(vols,50);

      const ms = {
        ema3:e3!==null&&last>e3, ema5:e5!==null&&last>e5,
        ema10:e10!==null&&last>e10, ema20:e20!==null&&last>e20,
        sma50:s50!==null&&last>s50, sma100:s100!==null&&last>s100, sma200:s200!==null&&last>s200,
        vma3:vm3!==null&&lastVol>vm3, vma5:vm5!==null&&lastVol>vm5,
        vma20:vm20!==null&&lastVol>vm20, vma50:vm50!==null&&lastVol>vm50,
      };
      const above4 = ms.ema3&&ms.ema5&&ms.ema10&&ms.ema20;
      let bull=0, bear=0;
      ['ema3','ema5','ema10','ema20','sma50','sma100','sma200'].forEach(k=>{if(ms[k])bull++;else bear++;});
      if(rsiV!==null){if(rsiV>50)bull++;else bear++;}
      if(srsiV!==null){if(srsiV>50)bull++;else bear++;}
      if(macdV){if(macdV.bull)bull++;else bear++;}

      const company = (meta.longName||meta.shortName||'').replace(/\s*\([^)]*\)\s*/g,'').trim()||ticker;

      return {
        ticker, company, price:last, pct,
        maStatus:ms, above4, bull, bear,
        rsi:rsiV, stochRsi:srsiV,
        macdBull:macdV?.bull??null, macdHist:macdV?.hist??null, macdCross:macdV?.cross??false,
        atrV, adrPct:adrV?.pct??null, adrNom:adrV?.nom??null,
        lastVol, vm20, lastValue, pct1today,
      };
    } catch (_) {}
  }
  return null;
}

// ── MAIN ──────────────────────────────────────────────────────
(async () => {
  const BATCH = 8;
  const results = [];
  let ok = 0, fail = 0;

  console.log(`Fetching ${TICKERS.length} ISSI tickers…`);
  for (let i = 0; i < TICKERS.length; i += BATCH) {
    const chunk = TICKERS.slice(i, i + BATCH);
    const res = await Promise.allSettled(chunk.map(t => fetchOne(t)));
    res.forEach((r, idx) => {
      if (r.status === 'fulfilled' && r.value) { results.push(r.value); ok++; }
      else { fail++; process.stdout.write(`  FAIL: ${chunk[idx]}\n`); }
    });
    process.stdout.write(`\r  ${i+BATCH}/${TICKERS.length} processed — ok:${ok} fail:${fail}`);
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`);

  mkdirSync('data', { recursive: true });
  const now = new Date();
  const wib = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const output = { fetchedAt: now.toISOString(), fetchedAtWIB: wib, count: results.length, data: results };
  writeFileSync('data/issi_data.json', JSON.stringify(output));
  console.log(`Saved data/issi_data.json (${(JSON.stringify(output).length/1024).toFixed(0)} KB)`);
})();
