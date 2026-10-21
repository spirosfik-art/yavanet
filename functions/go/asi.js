// Σύνδεσμος διαφήμισης: yavanet.gr/go/asi → κατευθείαν WhatsApp του Asi (GET). Το POST/σελίδα φόρμας μένει διαθέσιμο αλλά δεν χρησιμοποιείται.
// (Παλιά περιγραφή:) Δείχνει τον Asi + δύο επιλογές:
//  1) «Αφήστε το τηλέφωνό σας» → ειδοποίηση Telegram στον Σπύρο με όνομα/τηλέφωνο (ο Asi στέλνει τον οδηγό).
//  2) Κουμπί WhatsApp → ειδοποίηση Telegram και άνοιγμα WhatsApp του Asi.
// Απλές επισκέψεις της σελίδας δεν στέλνουν ειδοποίηση (μόνο μετριούνται), ώστε να μη γεμίζει το Telegram.
import { clean, telegram, withDefaults, json, readBody, sameOrigin, escHtml } from "../../lib/forms.js";

const ASI_WA = "972546221414";
const MSG = "שלום אסי, ראיתי את המודעה על השקעה בדירה לתיירות רפואית באתונה ואשמח לקבל את המדריך המלא";
const WA = `https://wa.me/${ASI_WA}?text=${encodeURIComponent(MSG)}`;
const BOT = /facebookexternalhit|facebot|meta-externalagent|instagram.*bot|bot|crawler|spider|preview|whatsapp\/|telegrambot|slackbot|curl|python/i;

const day = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
async function bump(env, key, ttl = 3 * 86400) {
  if (!env.PUSH_KV) return 0;
  const n = +((await env.PUSH_KV.get(key)) || 0) + 1;
  await env.PUSH_KV.put(key, String(n), { expirationTtl: ttl });
  return n;
}
async function get(env, key) { return env.PUSH_KV ? +((await env.PUSH_KV.get(key)) || 0) : 0; }

function device(ua) { return /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Άλλη"; }
function from(p) {
  const src = clean(p.utm_source, 40), med = clean(p.utm_medium, 40), camp = clean(p.utm_campaign, 80);
  if (!src) return "Απευθείας σύνδεσμος";
  const s = /^(fb|facebook)$/i.test(src) ? "Facebook" : /^(ig|instagram)$/i.test(src) ? "Instagram" : src;
  return `${s}${/paid|ads|cpc/i.test(med) ? " (διαφήμιση)" : med ? ` (${med})` : ""}${camp ? ` · ${camp}` : ""}`;
}

export async function onRequestGet({ request, env: rawEnv, waitUntil }) {
  // Κατευθείαν στο WhatsApp του Asi. Σε κινητό ανοίγει απευθείας η εφαρμογή (whatsapp://),
  // χωρίς την ενδιάμεση σελίδα του WhatsApp· αν δεν ανοίξει σε 1,2″, πάει στο wa.me.
  const env = withDefaults(rawEnv);
  const u = new URL(request.url);
  const ua = request.headers.get("user-agent") || "";
  if (!BOT.test(ua)) {
    const ip = request.headers.get("cf-connecting-ip") || "";
    const seenKey = "asi:seen:" + ip + ":" + new Date().toISOString().slice(0, 13);
    const seen = ip && env.PUSH_KV ? await env.PUSH_KV.get(seenKey) : null;
    if (!seen) {
      if (ip && env.PUSH_KV) await env.PUSH_KV.put(seenKey, "1", { expirationTtl: 3600 }).catch(() => {});
      const n = await bump(env, "asi:view:" + day()).catch(() => 0);
      const p = Object.fromEntries(u.searchParams);
      const geo = [request.cf?.country, request.cf?.city].filter(Boolean).join(" / ") || "—";
      const t = telegram(env, [
        "📲 Πάτησε τη διαφήμιση → WhatsApp του Asi (+972 54-622-1414)",
        `Από πού: ${from(p)}`,
        `Χώρα / πόλη: ${geo} · ${device(ua)}`,
        `Σήμερα: ${n} άτομα`,
      ].join("\n")).catch(() => {});
      if (waitUntil) waitUntil(t); else await t;
    }
  }
  const mobile = /iPhone|iPad|Android/i.test(ua);
  if (!mobile) return new Response(null, { status: 302, headers: { location: WA, "cache-control": "no-store" } });
  const app = `whatsapp://send?phone=${ASI_WA}&text=${encodeURIComponent(MSG)}`;
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>WhatsApp · אסי דורון</title>
<style>body{margin:0;background:#0d1726;color:#f4efe6;font-family:system-ui,-apple-system,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}a{display:inline-block;margin-top:18px;background:#25d366;color:#06260f;font-weight:700;font-size:18px;padding:15px 26px;border-radius:12px;text-decoration:none}img{width:84px;height:84px;border-radius:50%;border:2px solid #c9a45c;object-fit:cover}</style></head>
<body><div><img src="/asi-avatar-v3.jpg" alt=""><div style="margin-top:12px">פותח וואטסאפ עם אסי דורון…</div><a href="${WA}">לחצו כאן לשליחת הודעה לאסי</a></div>
<script>location.href=${JSON.stringify(app)};setTimeout(function(){if(!document.hidden)location.replace(${JSON.stringify(WA)})},1200);</script></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  if (!b || b.hp) return json({ ok: true });
  const ua = request.headers.get("user-agent") || "";
  const geo = [request.cf?.country, request.cf?.city].filter(Boolean).join(" / ") || "—";
  const d = day();
  const hour = "asi:rl:" + new Date().toISOString().slice(0, 13);
  if ((await get(env, hour)) >= 80) return json({ ok: true });
  await bump(env, hour, 7200);
  const views = await get(env, "asi:view:" + d);

  if (b.act === "lead") {
    const name = clean(b.name, 60), phone = clean(b.phone, 30);
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.replace(/\D/g, "").length < 8) return json({ ok: false, err: "phone" }, 400);
    const leads = await bump(env, "asi:lead:" + d);
    let intl = digits.replace(/^\+/, "");
    if (/^0\d{8,9}$/.test(intl)) intl = "972" + intl.slice(1);
    await telegram(env, [
      "🟢 ΝΕΟΣ ΠΕΛΑΤΗΣ (διαφήμιση ιατρικού τουρισμού – Asi)",
      `Όνομα: ${name || "—"}`,
      `Τηλέφωνο: ${phone}`,
      `WhatsApp του πελάτη: https://wa.me/${intl}`,
      `Από πού: ${from(b)}`,
      `Χώρα / πόλη: ${geo} · ${device(ua)}`,
      "Ζητάει τον οδηγό. Προώθησέ το στον Asi να του γράψει.",
      `Σήμερα: ${views} επισκέψεις σελίδας · ${leads} τηλέφωνα`,
    ].join("\n")).catch(() => {});
    return json({ ok: true });
  }
  if (b.act === "wa") {
    const n = await bump(env, "asi:wa:" + d);
    await telegram(env, [
      "📲 Πάτησε το κουμπί WhatsApp → Asi (+972 54-622-1414)",
      `Από πού: ${from(b)}`,
      `Χώρα / πόλη: ${geo} · ${device(ua)}`,
      "Αν στείλει μήνυμα, θα το δει ο Asi στο WhatsApp του.",
      `Σήμερα: ${views} επισκέψεις σελίδας · ${n} πάτησαν WhatsApp`,
    ].join("\n")).catch(() => {});
    return json({ ok: true });
  }
  return json({ ok: false }, 400);
}

function page() {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>המדריך המלא: דירה לתיירות רפואית באתונה · אסי דורון</title>
<meta name="description" content="מדריך מלא עם כל העלויות לרכישת דירה להשכרה לתיירות רפואית באתונה. אסי דורון, AS-IS, בשיתוף יוונט.">
<meta property="og:image" content="https://yavanet.gr/asi-og-v3.jpg"><meta name="robots" content="noindex">
<style>
:root{--bg:#0d1726;--card:#14223a;--gold:#c9a45c;--txt:#f4efe6;--mut:#aab4c3;--wa:#25d366}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--txt);font-family:"Assistant","Heebo",system-ui,-apple-system,"Segoe UI",Arial,sans-serif}
.w{max-width:520px;margin:0 auto;padding:22px 16px 40px}
.top{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:var(--mut);letter-spacing:.02em}
.top img{height:38px;border-radius:6px}
.hero{display:flex;gap:16px;align-items:center;margin:22px 0 10px}
.hero img{width:96px;height:96px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);flex:none}
.hero b{display:block;font-size:20px}.hero span{color:var(--mut);font-size:14px;line-height:1.4}
h1{font-size:26px;line-height:1.25;margin:16px 0 8px}h1 em{font-style:normal;color:var(--gold)}
.sub{color:var(--mut);font-size:16px;line-height:1.5;margin:0 0 18px}
ul{list-style:none;padding:0;margin:0 0 22px;display:grid;gap:10px}
li{background:var(--card);border-radius:12px;padding:12px 14px;font-size:15.5px;line-height:1.4;display:flex;gap:10px}
li:before{content:"✓";color:var(--gold);font-weight:700}
.box{background:linear-gradient(180deg,#1a2b48,#14223a);border:1px solid rgba(201,164,92,.35);border-radius:16px;padding:18px}
.box h2{font-size:19px;margin:0 0 4px}.box p{margin:0 0 14px;color:var(--mut);font-size:14.5px}
input{width:100%;font:inherit;font-size:17px;padding:14px;border-radius:10px;border:1px solid #2c3d5c;background:#0f1a2d;color:var(--txt);margin-bottom:10px}
input::placeholder{color:#7d8899}
button,.wa{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;font:inherit;font-weight:700;font-size:18px;padding:15px;border-radius:12px;border:0;cursor:pointer;text-decoration:none}
button{background:var(--gold);color:#1a1405}
.or{text-align:center;color:var(--mut);margin:18px 0;font-size:14px}
.wa{background:var(--wa);color:#06260f}
.wa svg{width:24px;height:24px}
.ok{display:none;text-align:center;padding:10px 0}.ok b{display:block;font-size:20px;margin-bottom:6px;color:var(--gold)}
.err{color:#ff8a80;font-size:14px;display:none;margin:-4px 0 8px}
.fine{color:#7d8899;font-size:12px;line-height:1.5;margin-top:22px;text-align:center}
.fine a{color:#aab4c3}
</style></head><body><div class="w">
<div class="top"><span>יוונט מציג · AS-IS by Asi Doron</span><img src="/asi-logo.jpg" alt="AS-IS"></div>
<div class="hero"><img src="/asi-avatar-v3.jpg" alt="אסי דורון"><div><b>אסי דורון</b><span>9 שנים ביוון · מלווה משקיעים ישראלים מהפגישה הראשונה ועד המפתח</span></div></div>
<h1>דירה לתיירות רפואית באתונה: <em>המדריך המלא עם כל העלויות</em></h1>
<p class="sub">השכרה לטווח בינוני – בין חודש אחד לשנה – למטופלים ולמשפחות שלהם, ליד בתי החולים הפרטיים.</p>
<ul>
<li>כל העלויות בשקיפות מלאה: מס העברה, נוטריון, עורך דין, מהנדס ועוד</li>
<li>ליווי משפטי מלא, בדיקות ורישום – אתם לא צריכים לעשות כלום</li>
<li>נכסים בלעדיים שלא מתפרסמים, שיפוץ, ריהוט וניהול שוכרים</li>
</ul>
<div class="box" id="f">
<form id="lf" novalidate>
<h2>קבלו את המדריך בוואטסאפ</h2>
<p>השאירו שם וטלפון, ואסי ישלח לכם את המדריך ויחזור אליכם אישית.</p>
<input name="name" autocomplete="name" placeholder="שם">
<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="טלפון (וואטסאפ)" dir="ltr" style="text-align:right">
<input name="hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;height:0;opacity:0">
<div class="err" id="e">נא להזין מספר טלפון תקין</div>
<button type="submit" id="sb">שלחו לי את המדריך</button>
</form>
<div class="ok" id="ok"><b>תודה! 🙏</b>אסי ישלח לכם את המדריך בוואטסאפ בהקדם.</div>
</div>
<div class="or">או דברו עם אסי ישירות עכשיו</div>
<a class="wa" id="wa" href="${WA}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.8-4.3-.1-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>שלחו הודעה לאסי בוואטסאפ</a>
<p class="fine">+972 54-622-1414 · הפרטים שתשאירו משמשים רק כדי שאסי יחזור אליכם.<br>ההכנסה המוצגת במדריך היא פוטנציאלית בלבד. מימון: יש לבדוק מול הבנק או מתווך אשראי מורשה. · <a href="https://yavanet.gr/">yavanet.gr</a></p>
</div>
<script>
(function(){var q={};location.search.slice(1).split("&").forEach(function(p){var k=p.split("=");if(k[0])q[decodeURIComponent(k[0])]=decodeURIComponent((k[1]||"").replace(/\\+/g," "))});
function send(d,cb){var b=JSON.stringify(Object.assign({utm_source:q.utm_source,utm_medium:q.utm_medium,utm_campaign:q.utm_campaign},d));
try{fetch(location.pathname,{method:"POST",headers:{"content-type":"application/json"},body:b,keepalive:true}).then(function(r){return r.json()}).then(function(j){cb&&cb(j)}).catch(function(){cb&&cb({ok:false})})}catch(e){cb&&cb({ok:false})}}
document.getElementById("wa").addEventListener("click",function(){send({act:"wa"})});
var f=document.getElementById("lf");f.addEventListener("submit",function(ev){ev.preventDefault();var ph=f.phone.value.replace(/[^\\d]/g,"");var e=document.getElementById("e");
if(ph.length<8){e.style.display="block";return}e.style.display="none";var sb=document.getElementById("sb");sb.disabled=true;sb.textContent="שולח…";
send({act:"lead",name:f.name.value,phone:f.phone.value,hp:f.hp.value},function(j){if(j&&j.ok){f.style.display="none";document.getElementById("ok").style.display="block"}else{sb.disabled=false;sb.textContent="שלחו לי את המדריך";e.style.display="block"}})});
})();
</script></body></html>`;
}
