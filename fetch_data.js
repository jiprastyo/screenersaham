// fetch_data.js — GitHub Actions
// Ambil data saham dari Yahoo Finance, simpan ke data/issi_data.json
// Repo: screenersaham

import fetch from 'node-fetch';
import { writeFileSync, mkdirSync } from 'fs';

const TICKERS = ["AADI", "AALI", "ABBA", "ABDA", "ABMM", "ACES", "ACRO", "ACST", "ADCP", "ADES", "ADHI", "ADMF", "ADMG", "ADMR", "ADRO", "AEGS", "AGAR", "AGII", "AGRO", "AGRS", "AHAP", "AIMS", "AISA", "AKKU", "AKPI", "AKRA", "AKSI", "ALDO", "ALII", "ALKA", "ALMI", "ALTO", "AMAG", "AMAN", "AMAR", "AMFG", "AMIN", "AMMN", "AMMS", "AMOR", "AMRT", "ANDI", "ANJT", "ANTM", "APEX", "APIC", "APII", "APLI", "APLN", "ARCI", "AREA", "ARGO", "ARII", "ARKA", "ARKO", "ARMY", "ARNA", "ARTA", "ARTI", "ARTO", "ASBI", "ASDM", "ASGR", "ASHA", "ASII", "ASJT", "ASLC", "ASLI", "ASMI", "ASPI", "ASPR", "ASRI", "ASRM", "ASSA", "ATAP", "ATIC", "ATLA", "AUTO", "AVIA", "AWAN", "AXIO", "AYAM", "AYLS", "BABP", "BABY", "BACA", "BAIK", "BAJA", "BALI", "BANK", "BAPA", "BAPI", "BATA", "BATR", "BAUT", "BAYU", "BBCA", "BBHI", "BBKP", "BBLD", "BBMD", "BBNI", "BBRI", "BBRM", "BBSI", "BBSS", "BBTN", "BBYB", "BCAP", "BCIC", "BCIP", "BDKR", "BDMN", "BEBS", "BEEF", "BEER", "BEKS", "BELI", "BELL", "BESS", "BEST", "BFIN", "BGTG", "BHAT", "BHIT", "BIKA", "BIKE", "BIMA", "BINA", "BINO", "BIPI", "BIPP", "BIRD", "BISI", "BJBR", "BJTM", "BKDP", "BKSL", "BKSW", "BLES", "BLOG", "BLTA", "BLTZ", "BLUE", "BMAS", "BMBL", "BMHS", "BMRI", "BMSR", "BMTR", "BNBA", "BNBR", "BNGA", "BNII", "BNLI", "BOAT", "BOBA", "BOGA", "BOLA", "BOLT", "BOSS", "BPFI", "BPII", "BPTR", "BRAM", "BREN", "BRIS", "BRMS", "BRNA", "BRPT", "BRRC", "BSBK", "BSDE", "BSIM", "BSML", "BSSR", "BSWD", "BTEK", "BTEL", "BTON", "BTPN", "BTPS", "BUAH", "BUDI", "BUKA", "BUKK", "BULL", "BUMI", "BUVA", "BVIC", "BWPT", "BYAN", "CAKK", "CAMP", "CANI", "CARE", "CARS", "CASA", "CASH", "CASS", "CBDK", "CBMF", "CBPE", "CBRE", "CBUT", "CCSI", "CDIA", "CEKA", "CENT", "CFIN", "CGAS", "CHEK", "CHEM", "CHIP", "CINT", "CITA", "CITY", "CLAY", "CLEO", "CLPI", "CMNP", "CMNT", "CMPP", "CMRY", "CNKO", "CNMA", "CNTX", "COAL", "COCO", "COIN", "COWL", "CPIN", "CPRI", "CPRO", "CRAB", "CRSN", "CSAP", "CSIS", "CSMI", "CSRA", "CTBN", "CTRA", "CTTH", "CUAN", "CYBR", "DAAZ", "DADA", "DART", "DATA", "DAYA", "DCII", "DEAL", "DEFI", "DEPO", "DEWA", "DEWI", "DFAM", "DGIK", "DGNS", "DGWG", "DIGI", "DILD", "DIVA", "DKFT", "DKHH", "DLTA", "DMAS", "DMMX", "DMND", "DNAR", "DNET", "DOID", "DOOH", "DOSS", "DPNS", "DPUM", "DRMA", "DSFI", "DSNG", "DSSA", "DUCK", "DUTI", "DVLA", "DWGL", "DYAN", "EAST", "ECII", "EDGE", "EKAD", "ELIT", "ELPI", "ELSA", "ELTY", "EMAS", "EMDE", "EMTK", "ENAK", "ENRG", "ENVY", "ENZO", "EPAC", "EPMT", "ERAA", "ERAL", "ERTX", "ESIP", "ESSA", "ESTA", "ESTI", "ETWA", "EURO", "EXCL", "FAPA", "FAST", "FASW", "FILM", "FIMP", "FIRE", "FISH", "FITT", "FLMC", "FMII", "FOLK", "FOOD", "FORE", "FORU", "FPNI", "FUJI", "FUTR", "FWCT", "GAMA", "GDST", "GDYR", "GEMA", "GEMS", "GGRM", "GGRP", "GHON", "GIAA", "GJTL", "GLOB", "GLVA", "GMFI", "GMTD", "GOLD", "GOLF", "GOLL", "GOOD", "GOTO", "GPRA", "GPSO", "GRIA", "GRPH", "GRPM", "GSMF", "GTBO", "GTRA", "GTSI", "GULA", "GUNA", "GWSA", "GZCO", "HADE", "HAIS", "HAJJ", "HALO", "HATM", "HBAT", "HDFA", "HDIT", "HEAL", "HELI", "HERO", "HEXA", "HGII", "HILL", "HITS", "HKMU", "HMSP", "HOKI", "HOME", "HOMI", "HOPE", "HOTL", "HRME", "HRTA", "HRUM", "HUMI", "HYGN", "IATA", "IBFN", "IBOS", "IBST", "ICBP", "ICON", "IDEA", "IDPR", "IFII", "IFSH", "IGAR", "IIKP", "IKAI", "IKAN", "IKBI", "IKPM", "IMAS", "IMJS", "IMPC", "INAF", "INAI", "INCF", "INCI", "INCO", "INDF", "INDO", "INDR", "INDS", "INDX", "INDY", "INET", "INKP", "INOV", "INPC", "INPP", "INPS", "INRU", "INTA", "INTD", "INTP", "IOTF", "IPAC", "IPCC", "IPCM", "IPOL", "IPPE", "IPTV", "IRRA", "IRSX", "ISAP", "ISAT", "ISEA", "ISSP", "ITIC", "ITMA", "ITMG", "JARR", "JAST", "JATI", "JAWA", "JAYA", "JECC", "JGLE", "JIHD", "JKON", "JMAS", "JPFA", "JRPT", "JSKY", "JSMR", "JSPT", "JTPE", "KAEF", "KAQI", "KARW", "KAYU", "KBAG", "KBLI", "KBLM", "KBLV", "KBRI", "KDSI", "KDTN", "KEEN", "KEJU", "KETR", "KIAS", "KICI", "KIJA", "KING", "KINO", "KIOS", "KJEN", "KKES", "KKGI", "KLAS", "KLBF", "KLIN", "KMDS", "KMTR", "KOBX", "KOCI", "KOIN", "KOKA", "KONI", "KOPI", "KOTA", "KPIG", "KRAS", "KREN", "KRYA", "KSIX", "KUAS", "LABA", "LABS", "LAJU", "LAND", "LAPD", "LCGP", "LCKM", "LEAD", "LFLO", "LIFE", "LINK", "LION", "LIVE", "LMAS", "LMAX", "LMPI", "LMSH", "LOPI", "LPCK", "LPGI", "LPIN", "LPKR", "LPLI", "LPPF", "LPPS", "LRNA", "LSIP", "LTLS", "LUCK", "LUCY", "MABA", "MAGP", "MAHA", "MAIN", "MANG", "MAPA", "MAPB", "MAPI", "MARI", "MARK", "MASB", "MAXI", "MAYA", "MBAP", "MBMA", "MBSS", "MBTO", "MCAS", "MCOL", "MCOR", "MDIA", "MDIY", "MDKA", "MDKI", "MDLA", "MDLN", "MDRN", "MEDC", "MEDS", "MEGA", "MEJA", "MENN", "MERI", "MERK", "META", "MFMI", "MGLV", "MGNA", "MGRO", "MHKI", "MICE", "MIDI", "MIKA", "MINA", "MINE", "MIRA", "MITI", "MKAP", "MKNT", "MKPI", "MKTR", "MLBI", "MLIA", "MLPL", "MLPT", "MMIX", "MMLP", "MNCN", "MOLI", "MORA", "MPIX", "MPMX", "MPOW", "MPPA", "MPRO", "MPXL", "MRAT", "MREI", "MSIE", "MSIN", "MSJA", "MSKY", "MSTI", "MTDL", "MTEL", "MTFN", "MTLA", "MTMH", "MTPS", "MTRA", "MTSM", "MTWI", "MUTU", "MYOH", "MYOR", "MYTX", "NAIK", "NANO", "NASA", "NASI", "NATO", "NAYZ", "NCKL", "NELY", "NEST", "NETV", "NFCX", "NICE", "NICK", "NICL", "NIKL", "NINE", "NIRO", "NISP", "NOBU", "NPGF", "NRCA", "NSSS", "NTBK", "NUSA", "NZIA", "OASA", "OBAT", "OBMD", "OCAP", "OILS", "OKAS", "OLIV", "OMED", "OMRE", "OPMS", "PACK", "PADA", "PADI", "PALM", "PAMG", "PANI", "PANR", "PANS", "PART", "PBID", "PBRX", "PBSA", "PCAR", "PDES", "PDPP", "PEGE", "PEHA", "PEVE", "PGAS", "PGEO", "PGJO", "PGLI", "PGUN", "PICO", "PIPA", "PJAA", "PJHB", "PKPK", "PLAN", "PLAS", "PLIN", "PMJS", "PMMP", "PMUI", "PNBN", "PNBS", "PNGO", "PNIN", "PNLF", "PNSE", "POLA", "POLI", "POLL", "POLU", "POLY", "POOL", "PORT", "POSA", "POWR", "PPGL", "PPRE", "PPRI", "PPRO", "PRAY", "PRDA", "PRIM", "PSAB", "PSAT", "PSDN", "PSGO", "PSKT", "PSSI", "PTBA", "PTDU", "PTIS", "PTMP", "PTMR", "PTPP", "PTPS", "PTPW", "PTRO", "PTSN", "PTSP", "PUDP", "PURA", "PURE", "PURI", "PWON", "PYFA", "PZZA", "RAAM", "RAFI", "RAJA", "RALS", "RANC", "RATU", "RBMS", "RCCC", "RDTX", "REAL", "RELF", "RELI", "RGAS", "RICY", "RIGS", "RIMO", "RISE", "RLCO", "RMKE", "RMKO", "ROCK", "RODA", "RONY", "ROTI", "RSCH", "RSGK", "RUIS", "RUNS", "SAFE", "SAGE", "SAME", "SAMF", "SAPX", "SATU", "SBAT", "SBMA", "SCCO", "SCMA", "SCNP", "SCPI", "SDMU", "SDPC", "SDRA", "SEMA", "SFAN", "SGER", "SGRO", "SHID", "SHIP", "SICO", "SIDO", "SILO", "SIMA", "SIMP", "SINI", "SIPD", "SKBM", "SKLT", "SKRN", "SKYB", "SLIS", "SMAR", "SMBR", "SMCB", "SMDM", "SMDR", "SMGA", "SMGR", "SMIL", "SMKL", "SMKM", "SMLE", "SMMA", "SMMT", "SMRA", "SMRU", "SMSM", "SNLK", "SOCI", "SOFA", "SOHO", "SOLA", "SONA", "SOSS", "SOTS", "SOUL", "SPMA", "SPRE", "SPTO", "SQMI", "SRAJ", "SRIL", "SRSN", "SRTG", "SSIA", "SSMS", "SSTM", "STAA", "STAR", "STRK", "STTP", "SUGI", "SULI", "SUNI", "SUPA", "SUPR", "SURE", "SURI", "SWAT", "SWID", "TALF", "TAMA", "TAMU", "TAPG", "TARA", "TAXI", "TAYS", "TBIG", "TBLA", "TBMS", "TCID", "TCPI", "TDPM", "TEBE", "TECH", "TELE", "TFAS", "TFCO", "TGKA", "TGRA", "TGUK", "TIFA", "TINS", "TIRA", "TIRT", "TKIM", "TLDN", "TLKM", "TMAS", "TMPO", "TNCA", "TOBA", "TOOL", "TOPS", "TOSK", "TOTL", "TOTO", "TOWR", "TOYS", "TPIA", "TPMA", "TRAM", "TRGU", "TRIL", "TRIM", "TRIN", "TRIO", "TRIS", "TRJA", "TRON", "TRST", "TRUE", "TRUK", "TRUS", "TSPC", "TUGU", "TYRE", "UANG", "UCID", "UDNG", "UFOE", "ULTJ", "UNIC", "UNIQ", "UNIT", "UNSP", "UNTD", "UNTR", "UNVR", "URBN", "UVCR", "VAST", "VERN", "VICI", "VICO", "VINS", "VISI", "VIVA", "VKTR", "VOKS", "VRNA", "VTNY", "WAPO", "WEGE", "WEHA", "WGSH", "WICO", "WIDI", "WIFI", "WIIM", "WIKA", "WINE", "WINR", "WINS", "WIRG", "WMPP", "WMUU", "WOMF", "WOOD", "WOWS", "WSBP", "WSKT", "WTON", "YELO", "YOII", "YPAS", "YULE", "YUPI", "ZATA", "ZBRA", "ZINC", "ZONE", "ZYRX"]
;

// ── MATH ──────────────────────────────────────
function ema(a,p){if(!a||a.length<p)return null;const k=2/(p+1);let v=a.slice(0,p).reduce((x,y)=>x+y,0)/p;for(let i=p;i<a.length;i++)v=a[i]*k+v*(1-k);return v}
function sma(a,p){if(!a||a.length<p)return null;return a.slice(-p).reduce((x,y)=>x+y,0)/p}
function rsi(a){if(!a||a.length<15)return null;const s=a.slice(-15);let g=0,l=0;for(let i=1;i<s.length;i++){const d=s[i]-s[i-1];if(d>0)g+=d;else l-=d}const ag=g/14,al=l/14;return al===0?100:100-100/(1+ag/al)}
function stochRSI(a){if(!a||a.length<33)return null;const ra=[];for(let i=15;i<=a.length;i++){const s=a.slice(0,i).slice(-15);let g=0,l=0;for(let j=1;j<s.length;j++){const d=s[j]-s[j-1];if(d>0)g+=d;else l-=d}const ag=g/14,al=l/14;ra.push(al===0?100:100-100/(1+ag/al))}if(ra.length<14)return null;const rec=ra.slice(-14),mn=Math.min(...rec),mx=Math.max(...rec);return mx===mn?50:((ra[ra.length-1]-mn)/(mx-mn))*100}
function macd(a){if(!a||a.length<35)return null;const lines=[];for(let i=26;i<=a.length;i++){const sl=a.slice(0,i),m12=ema(sl,12),m26=ema(sl,26);if(m12!==null&&m26!==null)lines.push(m12-m26)}if(lines.length<9)return null;const sig=ema(lines,9);if(sig===null)return null;const line=lines.at(-1),hist=line-sig;let prevHist=null;if(lines.length>=2){const pl=lines.slice(0,-1),ps=ema(pl,9);if(ps!==null)prevHist=pl.at(-1)-ps}return{line,signal:sig,hist,bull:hist>0,cross:prevHist!==null&&Math.sign(hist)!==Math.sign(prevHist)}}
function atr(rows,p=14){if(!rows||rows.length<p+1)return null;const trs=[];for(let i=1;i<rows.length;i++)trs.push(Math.max(rows[i].h-rows[i].l,Math.abs(rows[i].h-rows[i-1].c),Math.abs(rows[i].l-rows[i-1].c)));return trs.length>=p?trs.slice(-p).reduce((a,b)=>a+b,0)/p:null}
function adr(rows,p=14){if(!rows||rows.length<p)return null;const r=rows.slice(-p);return{nom:r.reduce((a,b)=>a+(b.h-b.l),0)/p,pct:r.reduce((a,b)=>a+(b.h-b.l)/b.l,0)/p*100}}

// ── FETCH ONE TICKER ──────────────────────────
async function fetchOne(ticker){
  const sym=ticker+'.JK';
  const urls=[
    `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1y`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1y`,
  ];
  for(const url of urls){
    try{
      const res=await fetch(url,{
        headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'},
        signal:AbortSignal.timeout(12000)
      });
      if(!res.ok)continue;
      const j=await res.json();
      const r=j?.chart?.result?.[0];
      if(!r)continue;
      const meta=r.meta||{},raw=r.indicators?.quote?.[0]||{},ts=r.timestamp||[];
      const rows=[];
      for(let i=0;i<ts.length;i++){
        const c=raw.close?.[i],h=raw.high?.[i],l=raw.low?.[i],v=raw.volume?.[i];
        if(c!=null&&h!=null&&l!=null&&v!=null&&!isNaN(c)&&c>0&&h>0&&l>0)rows.push({c,h,l,v});
      }
      if(rows.length<30)continue;
      const closes=rows.map(x=>x.c),vols=rows.map(x=>x.v);
      const last=closes.at(-1),prev=closes.at(-2)??last,pct=((last-prev)/prev)*100;
      const e3=ema(closes,3),e5=ema(closes,5),e10=ema(closes,10),e20=ema(closes,20);
      const s50=sma(closes,50),s100=sma(closes,100),s200=sma(closes,200);
      const rsiV=rsi(closes),srsiV=stochRSI(closes),macdV=macd(closes);
      const atrV=atr(rows),adrV=adr(rows);
      const lastVol=vols.at(-1)??0,lastValue=lastVol*last,pct1today=lastValue*0.01;
      const vm3=sma(vols,3),vm5=sma(vols,5),vm20=sma(vols,20),vm50=sma(vols,50);
      const ms={ema3:e3!==null&&last>e3,ema5:e5!==null&&last>e5,ema10:e10!==null&&last>e10,ema20:e20!==null&&last>e20,sma50:s50!==null&&last>s50,sma100:s100!==null&&last>s100,sma200:s200!==null&&last>s200,vma3:vm3!==null&&lastVol>vm3,vma5:vm5!==null&&lastVol>vm5,vma20:vm20!==null&&lastVol>vm20,vma50:vm50!==null&&lastVol>vm50};
      const above4=ms.ema3&&ms.ema5&&ms.ema10&&ms.ema20;
      let bull=0,bear=0;['ema3','ema5','ema10','ema20','sma50','sma100','sma200'].forEach(k=>{if(ms[k])bull++;else bear++});
      if(rsiV!==null){if(rsiV>50)bull++;else bear++}
      if(srsiV!==null){if(srsiV>50)bull++;else bear++}
      if(macdV){if(macdV.bull)bull++;else bear++}
      const company=(meta.longName||meta.shortName||'').replace(/\s*\([^)]*\)\s*/g,'').trim()||ticker;
      return{ticker,company,price:last,pct,maStatus:ms,above4,bull,bear,rsi:rsiV,stochRsi:srsiV,macdBull:macdV?.bull??null,macdHist:macdV?.hist??null,macdCross:macdV?.cross??false,atrV,adrPct:adrV?.pct??null,adrNom:adrV?.nom??null,lastVol,lastValue,pct1today};
    }catch(_){}
  }
  return null;
}

// ── MAIN ──────────────────────────────────────
(async()=>{
  const BATCH=8;
  const results=[];
  let ok=0,fail=0;
  console.log(`Fetching ${TICKERS.length} tickers…`);
  for(let i=0;i<TICKERS.length;i+=BATCH){
    const chunk=TICKERS.slice(i,i+BATCH);
    const res=await Promise.allSettled(chunk.map(t=>fetchOne(t)));
    res.forEach((r,idx)=>{if(r.status==='fulfilled'&&r.value){results.push(r.value);ok++}else{fail++;process.stdout.write(`  FAIL: ${chunk[idx]}\n`)}});
    process.stdout.write(`\r  ${Math.min(i+BATCH,TICKERS.length)}/${TICKERS.length} — ok:${ok} fail:${fail}   `);
    await new Promise(r=>setTimeout(r,150));
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  mkdirSync('data',{recursive:true});
  const now=new Date();
  const wib=now.toLocaleString('id-ID',{timeZone:'Asia/Jakarta'});
  const out={fetchedAt:now.toISOString(),fetchedAtWIB:wib,count:results.length,data:results};
  writeFileSync('data/issi_data.json',JSON.stringify(out));
  console.log(`Saved data/issi_data.json (${(JSON.stringify(out).length/1024).toFixed(0)} KB)`);
})();
