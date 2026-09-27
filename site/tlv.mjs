// «Η διαμέρισμά σου στο Τελ Αβίβ = ; στην Αθήνα»: viral εργαλείο σύγκρισης (δεδομένα: Δείκτης Yavanet + Numbeo)
import { esc, P } from "./templates.mjs";

export function tlvPage(lang, madad, fx) {
  const he = lang === "he";
  const areas = madad.areas.map((a) => ({ n: a[lang], s: a.sale, r: a.rent }));
  const def = Math.max(0, areas.findIndex((a) => /Koukaki/.test(a.n) || /קוקאקי/.test(a.n)));
  const data = { he, fx, areas, def, url: "https://yavanet.gr" + P(lang, "/tlv-vs-athens/"), month: madad.month };
  const L = he ? {
    h1: "הדירה שלך בתל אביב = כמה דירות באתונה?",
    intro: "הכניסו כמה שווה הדירה שלכם, או כמה אתם משלמים שכירות, ותראו מה זה קונה באתונה. לפי מחירים אמיתיים לכל שכונה.",
    tBuy: "🏠 כמה שווה הדירה שלי", tRent: "🔑 כמה אני משלם שכירות",
    val: "שווי הדירה שלכם (₪)", rent: "שכר הדירה החודשי שלכם (₪)", size: "גודל דירה באתונה", area: "שכונה באתונה",
    img: "📸 צרו תמונה לשיתוף", wa: "שתפו בוואטסאפ", all: "בכל השכונות", cta: "רוצים לדעת מה באמת אפשר לקנות? דברו איתנו בעברית",
  } : {
    h1: "Your Tel Aviv flat = how many flats in Athens?",
    intro: "Enter what your flat is worth, or what you pay in rent, and see what it buys in Athens, using real prices for each neighbourhood.",
    tBuy: "🏠 What my flat is worth", tRent: "🔑 What I pay in rent",
    val: "Your flat's value (₪)", rent: "Your monthly rent (₪)", size: "Flat size in Athens", area: "Athens neighbourhood",
    img: "📸 Create an image to share", wa: "Share on WhatsApp", all: "In every neighbourhood", cta: "Want to know what you can really buy? Talk to us",
  };
  const opts = areas.map((a, i) => `<option value="${i}"${i === def ? " selected" : ""}>${esc(a.n)}</option>`).join("");
  const src = `<a href="${esc(madad.source.url)}" target="_blank" rel="noopener">${esc(madad.source.name)}</a>`;
  const note = he
    ? `מחיר ממוצע למ״ר מבוקש לפי ${src} (${esc(madad.month)}). בחישוב הקנייה הוספנו כ-8% עלויות רכישה (מס, נוטריון, עורך דין, רישום). ההמרה לפי ₪${fx} לאירו. זו הערכה בלבד, והמחיר בפועל תלוי בדירה. שימו לב: ממשלת יוון הודיעה על <a href="${P(lang, "/a/greece-15-percent-transfer-tax-non-eu-buyers-2027/")}">מס רכישה של 15% לישראלים מיולי 2027</a>.`
    : `Average asking price per m² from ${src} (${esc(madad.month)}). Purchase results include about 8% buying costs (tax, notary, lawyer, registration). Conversion at ₪${fx} per euro. Estimate only; actual prices depend on the flat. Note: Greece announced a <a href="${P(lang, "/a/greece-15-percent-transfer-tax-non-eu-buyers-2027/")}">15% transfer tax for non-EU buyers from July 2027</a>.`;
  const title = L.h1;
  const body = `<div class="page-h"><h1>${esc(L.h1)}</h1><p>${esc(L.intro)}</p></div>
<div class="grid"><div class="col">
<section class="tlv" id="tlv">
  <div class="tlv-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-m="buy">${L.tBuy}</button><button type="button" role="tab" aria-selected="false" data-m="rent">${L.tRent}</button></div>
  <div class="tlv-form">
    <label data-show="buy">${L.val}<input id="tlv-v" type="text" inputmode="numeric" value="3,500,000" dir="ltr"></label>
    <label data-show="rent" hidden>${L.rent}<input id="tlv-r" type="text" inputmode="numeric" value="7,500" dir="ltr"></label>
    <label data-show="buy">${L.size}<select id="tlv-s">${[50, 70, 90, 120].map((v) => `<option value="${v}"${v === 70 ? " selected" : ""}>${v} ${he ? "מ״ר" : "m²"}</option>`).join("")}</select></label>
    <label>${L.area}<select id="tlv-a">${opts}</select></label>
  </div>
  <div class="tlv-res" id="tlv-res" aria-live="polite"></div>
  <div class="tlv-share"><button type="button" class="btn gold" id="tlv-img">${L.img}</button><a class="btn wa" id="tlv-wa" href="#" target="_blank" rel="noopener">${L.wa}</a></div>
  <h2 class="tlv-allh">${L.all}</h2>
  <div class="tlv-all" id="tlv-all"></div>
  <p class="small">${note}</p>
</section>
<section class="guide-cta"><h2>${he ? "רוצים ליווי אישי, בעברית?" : "Want personal guidance?"}</h2><p>${esc(L.cta)}</p><a class="btn gold" href="${P(lang, "/advisor/")}">${he ? "דברו עם יועץ נדל״ן" : "Talk to a property adviser"}</a></section>
</div>__WIDGETS__</div>
<script type="application/json" id="tlv-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<script>${CLIENT}</script>`;
  return { title, description: L.intro, body };
}

const CLIENT = `(function(){
var D=JSON.parse(document.getElementById('tlv-data').textContent),he=D.he,mode='buy';
var $=function(i){return document.getElementById(i)};
var num=function(s){return +String(s).replace(/[^0-9.]/g,'')||0};
var fmt=function(n){return Math.round(n).toLocaleString('en-US')};
function fmtIn(el){var v=num(el.value);el.value=v?fmt(v):''}
function calc(){
  var a=D.areas[+$('tlv-a').value],res,share,rows;
  if(mode==='buy'){
    var eur=num($('tlv-v').value)/D.fx,m2=+$('tlv-s').value;
    var one=a.s*m2*1.08,k=Math.floor(eur/one),left=(eur-k*one)*D.fx;
    res=k>=1?(he?'<div class="big"><b>'+k+'</b> '+(k===1?'דירה':'דירות')+'</div><p>של '+m2+' מ״ר ב<strong>'+a.n+'</strong></p>'+(left>1000?'<p class="left">ועוד נשארים לכם <b dir="ltr">₪'+fmt(left)+'</b></p>':'')
      :'<div class="big"><b>'+k+'</b> '+(k===1?'flat':'flats')+'</div><p>of '+m2+' m² in <strong>'+a.n+'</strong></p>'+(left>1000?'<p class="left">and you still have <b dir="ltr">₪'+fmt(left)+'</b> left</p>':''))
      :(he?'<div class="big"><b dir="ltr">'+Math.round(eur/(a.s*1.08))+'</b> מ״ר</div><p>ב<strong>'+a.n+'</strong></p>':'<div class="big"><b>'+Math.round(eur/(a.s*1.08))+'</b> m²</div><p>in <strong>'+a.n+'</strong></p>');
    share=k>=1?(he?'הדירה שלי בתל אביב = '+k+' דירות של '+m2+' מ״ר ב'+a.n+' 🤯':'My Tel Aviv flat = '+k+' flats of '+m2+' m² in '+a.n+' 🤯'):(he?'הדירה שלי בתל אביב = '+Math.round(eur/(a.s*1.08))+' מ״ר ב'+a.n:'My Tel Aviv flat = '+Math.round(eur/(a.s*1.08))+' m² in '+a.n);
    var list=D.areas.map(function(x){return{n:x.n,v:Math.floor(eur/(x.s*m2*1.08)*10)/10}}).sort(function(p,q){return q.v-p.v});
    var mx=list[0].v||1;rows=list.map(function(x){return '<div class="tlv-row"><span>'+x.n+'</span><i style="width:'+Math.max(2,x.v/mx*100)+'%"></i><b dir="ltr">'+x.v.toFixed(1)+'</b></div>'}).join('');
  }else{
    var r=num($('tlv-r').value)/D.fx,m=Math.round(r/a.r),ath70=a.r*70,save=(r-ath70)*D.fx*12;
    res=he?'<div class="big"><b dir="ltr">'+m+'</b> מ״ר</div><p>זה מה ששכר הדירה שלכם שוכר ב<strong>'+a.n+'</strong></p>'+(save>0?'<p class="left">דירת 70 מ״ר שם: <b dir="ltr">₪'+fmt(ath70*D.fx)+'</b> לחודש. חיסכון של <b dir="ltr">₪'+fmt(save)+'</b> בשנה</p>':'')
      :'<div class="big"><b>'+m+'</b> m²</div><p>that is what your rent gets you in <strong>'+a.n+'</strong></p>'+(save>0?'<p class="left">A 70 m² flat there: <b dir="ltr">₪'+fmt(ath70*D.fx)+'</b> a month. You save <b dir="ltr">₪'+fmt(save)+'</b> a year</p>':'');
    share=he?'בשכר הדירה שלי בתל אביב אפשר לשכור '+m+' מ״ר ב'+a.n+' 🤯':'My Tel Aviv rent gets '+m+' m² in '+a.n+' 🤯';
    var list2=D.areas.map(function(x){return{n:x.n,v:Math.round(r/x.r)}}).sort(function(p,q){return q.v-p.v});
    var mx2=list2[0].v||1;rows=list2.map(function(x){return '<div class="tlv-row"><span>'+x.n+'</span><i style="width:'+Math.max(2,x.v/mx2*100)+'%"></i><b dir="ltr">'+x.v+' m²</b></div>'}).join('');
  }
  $('tlv-res').innerHTML=res;$('tlv-all').innerHTML=rows;D.share=share;
  $('tlv-wa').href='https://wa.me/?text='+encodeURIComponent(share+'\\n'+(he?'בדקו כמה שלכם שווה: ':'Check yours: ')+D.url);
}
document.querySelectorAll('.tlv-tabs button').forEach(function(b){b.addEventListener('click',function(){mode=b.dataset.m;document.querySelectorAll('.tlv-tabs button').forEach(function(x){x.setAttribute('aria-selected',x===b)});document.querySelectorAll('[data-show]').forEach(function(x){x.hidden=x.dataset.show!==mode});calc()})});
['tlv-v','tlv-r'].forEach(function(i){$(i).addEventListener('input',calc);$(i).addEventListener('blur',function(){fmtIn($(i))})});
['tlv-s','tlv-a'].forEach(function(i){$(i).addEventListener('change',calc)});
calc();
function wrap(ctx,t,x,y,w,lh){var words=t.split(' '),line='',out=[];words.forEach(function(wd){var tt=line?line+' '+wd:wd;if(ctx.measureText(tt).width>w&&line){out.push(line);line=wd}else line=tt});out.push(line);out.forEach(function(l,i){ctx.fillText(l,x,y+i*lh)});return y+out.length*lh}
$('tlv-img').addEventListener('click',function(){
  var c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d');
  var g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#071a2c');g.addColorStop(1,'#0e4a73');x.fillStyle=g;x.fillRect(0,0,1080,1350);
  x.fillStyle='rgba(255,255,255,.06)';for(var i=0;i<60;i++){x.beginPath();x.arc((i*197)%1080,(i*131)%600,2,0,7);x.fill()}
  x.direction=he?'rtl':'ltr';x.textAlign='center';var ff='system-ui,-apple-system,Arial,sans-serif';
  x.fillStyle='#e0a93b';x.font='800 44px '+ff;x.fillText(he?'תל אביב 🇮🇱 ⟵ אתונה 🇬🇷':'Tel Aviv 🇮🇱 → Athens 🇬🇷',540,170);
  x.fillStyle='#fff';x.font='900 84px '+ff;var y=wrap(x,D.share.replace(' 🤯',''),540,360,920,108);
  x.font='120px '+ff;x.fillText('🤯',540,y+110);
  x.fillStyle='rgba(255,255,255,.85)';x.font='600 40px '+ff;x.fillText(he?'בדקו כמה הדירה שלכם שווה ביוון':'Check what yours is worth in Greece',540,1130);
  x.fillStyle='#e0a93b';x.font='900 64px '+ff;x.fillText('yavanet.gr',540,1230);
  c.toBlob(function(blob){
    var f=new File([blob],'yavanet-tlv-athens.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],text:D.share+' '+D.url}).catch(function(){});
    else{var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='yavanet-tlv-athens.png';a.click()}
  },'image/png');
});
})();`;
