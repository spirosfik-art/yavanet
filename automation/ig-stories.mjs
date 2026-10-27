// Αυτόματα ημερήσια stories (IG + FB) μέσω Meta API.
//   node automation/ig-stories.mjs render <morning|topic|evening|alerts> <outDir>   → γράφει JPEG + plan.json (χωρίς ανάρτηση)
//   node automation/ig-stories.mjs publish <outDir> <baseUrl>                        → ανεβάζει όσα γράφει το plan.json
// morning: καιρός σε 4 πόλεις + απεργίες/αργίες σήμερα · topic: θέμα ημέρας (Κυρ m², Δευ κουίζ, Τρ λέξη, Τετ συμβουλή, Πεμ πτήσεις, Παρ ώρες Σαββάτου)
// evening: «σήμερα στο Yavanet» (3 τίτλοι + νέο reel) · alerts: έκτακτη απεργία μετακινήσεων ή πορτοκαλί/κόκκινη προειδοποίηση καιρού.
// Σάββατο: κανένα story πριν τις 19:00 (Σαββατο). Τίποτα δεν ανεβαίνει δύο φορές (content/ig/stories.json).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, log, loadArticles, notifyOwner } from "./lib.mjs";
import { HOLIDAYS } from "../site/holidays.mjs";
import { PHRASES } from "../site/phrasebook.mjs";
import { SHAB_CITIES } from "../site/shabbat.mjs";
import { isWeather, wxInfo } from "../site/weather.mjs";

const NAVY = "#0B3A5B", DEEP = "#072A43", GOLD = "#F0B650";
const STATE = path.join(ROOT, "content/ig/stories.json");
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const athens = (d = new Date()) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Athens", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false, weekday: "short" }).formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour % 24, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) };
};
const NOW = athens(process.env.STORY_DATE ? new Date(process.env.STORY_DATE + "T09:00:00Z") : new Date());
const heDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const weekNo = Math.floor((Date.parse(NOW.date) - Date.parse("2026-01-04")) / (7 * 864e5)); // αλλάζει κάθε Κυριακή
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return { done: {}, alerts: [] }; } };
async function getJSON(u, ms = 20000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(u, { signal: ac.signal }); return r.ok ? await r.json() : null; } catch { return null; } finally { clearTimeout(t); }
}

// ---------- κοινό σχέδιο (ίδιο με τα εξώφυλλα των highlights) ----------
const CSS = `*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;position:relative;color:#fff;font-family:Assistant,sans-serif;background:radial-gradient(circle at 50% 40%,#13507b 0%,${NAVY} 45%,${DEEP} 100%)}
.bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(5px) brightness(.38);transform:scale(1.06)}
.top{position:absolute;top:150px;left:0;right:0;text-align:center;font:800 40px Assistant;color:rgba(255,255,255,.8);letter-spacing:1px}
.k{position:absolute;top:330px;left:0;right:0;text-align:center}.k span{display:inline-block;background:${GOLD};color:${DEEP};font:800 50px Assistant;padding:14px 44px;border-radius:50px}
h1{position:absolute;top:470px;left:70px;right:70px;text-align:center;font:900 FSpx/1.12 "Frank Ruhl Libre",serif}
.list{position:absolute;top:LTpx;left:90px;right:90px;border-top:4px solid ${GOLD};padding-top:46px}
.row{display:flex;justify-content:space-between;align-items:center;font:700 54px/1.3 Assistant;margin-bottom:30px;gap:24px}.row b{font-weight:800}.row span{white-space:nowrap;direction:rtl}
.li{font:600 52px/1.35 Assistant;margin-bottom:32px;text-align:center}.li.al{color:${GOLD};font-weight:800}
.cta{position:absolute;bottom:300px;left:80px;right:80px;text-align:center;font:800 52px Assistant;color:${GOLD}}
.ft{position:absolute;bottom:150px;left:0;right:0;text-align:center;font:800 42px Assistant;color:rgba(255,255,255,.75)}`;
function page({ kick, title, rows = [], lines = [], cta, bg, fs = 100, lt = 900, after = "" }) {
  const body = rows.length
    ? rows.map(([a, b]) => `<div class="row"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("")
    : lines.map((l) => (typeof l === "string" ? `<div class="li">${esc(l)}</div>` : `<div class="li al">${esc(l.t)}</div>`)).join("");
  return `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;700;800&display=block" rel="stylesheet"><style>${CSS.replace("FS", fs).replace("LT", lt)}</style></head><body>${bg ? `<div class="bg" style="background-image:url('${esc(bg)}')"></div>` : ""}<div class="top">יוונט · יוון בעברית</div><div class="k"><span>${esc(kick)}</span></div><h1>${esc(title)}</h1><div class="list">${body}</div>${after}${cta ? `<div class="cta">${esc(cta)}</div>` : ""}<div class="ft">yavanet.gr</div></body></html>`;
}
const chrome = [process.env.CHROME, "google-chrome", "google-chrome-stable", "chromium", "chromium-browser"].find((c) => { if (!c) return false; try { execFileSync("which", [c], { stdio: "ignore" }); return true; } catch { return false; } });
function shoot(html, out) {
  const hf = out.replace(/\.jpg$/, ".html");
  fs.writeFileSync(hf, html);
  execFileSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=9000", "--window-size=1080,1920", `--screenshot=${out}`, "file://" + path.resolve(hf)], { stdio: "ignore", timeout: 90000 });
  fs.rmSync(hf);
  const h = fs.readFileSync(out).subarray(0, 2);
  if (!(h[0] === 0xff && h[1] === 0xd8) || fs.statSync(out).size < 30000) throw new Error("κακή εικόνα " + out);
}
const fit = (t) => (t.length > 34 ? 84 : t.length > 22 ? 96 : 110);

// ---------- δεδομένα ----------
const TRAVEL = ["flights", "ferries", "metro", "buses", "trains", "taxis"];
const SECT = { flights: "✈️ טיסות", ferries: "⛴️ מעבורות", metro: "🚇 מטרו", buses: "🚌 אוטובוסים", trains: "🚆 רכבות", taxis: "🚕 מוניות" };
const arts = () => loadArticles().filter((a) => !a.hidden && !a.sponsored && a.he && a.he.title);
const strikesOn = (d) => arts().filter((a) => a.strike && (a.strike.dates || []).includes(d) && (a.strike.sectors || []).some((x) => TRAVEL.includes(x)));
const WX = [["athens", "אתונה", 37.98, 23.73], ["thessaloniki", "סלוניקי", 40.64, 22.93], ["heraklion", "כרתים", 35.34, 25.13], ["rhodes", "רודוס", 36.43, 28.22]];
const WCODE = (c) => (c === 0 ? "☀️" : c <= 2 ? "🌤️" : c === 3 ? "☁️" : c <= 48 ? "🌫️" : c <= 67 ? "🌧️" : c <= 77 ? "❄️" : c <= 82 ? "🌦️" : "⛈️");
async function weather() {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${WX.map((x) => x[2]).join(",")}&longitude=${WX.map((x) => x[3]).join(",")}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FAthens&forecast_days=1`;
  const j = await getJSON(u);
  const list = Array.isArray(j) ? j : j ? [j] : [];
  if (list.length !== WX.length) return null;
  return list.map((x, i) => [WX[i][1], `${WCODE(x.daily.weather_code[0])}  ${Math.round(x.daily.temperature_2m_min[0])}°–${Math.round(x.daily.temperature_2m_max[0])}°`]);
}
// NOAA ηλιοβασίλεμα (εφεδρικό, αν δεν απαντήσει το Hebcal)
function sunsetUTC(dateIso, lat, lng) {
  const d = new Date(dateIso + "T12:00:00Z"), rad = Math.PI / 180;
  const n = Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5);
  const g = (2 * Math.PI / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(lat * rad) * Math.cos(dec)) - Math.tan(lat * rad) * Math.tan(dec)) / rad;
  return new Date(Date.parse(dateIso + "T00:00:00Z") + (720 - 4 * (lng - ha) - eq) * 60e3);
}
const hm = (dt) => dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" });
async function shabbat(friday) {
  const cities = ["athens", "thessaloniki", "rhodes", "heraklion"].map((id) => SHAB_CITIES.find((c) => c.id === id));
  const out = [];
  for (const c of cities) {
    const j = await getJSON(`https://www.hebcal.com/shabbat?cfg=json&latitude=${c.lat}&longitude=${c.lng}&tzid=Europe/Athens&b=18&M=on&gy=${friday.slice(0, 4)}&gm=${+friday.slice(5, 7)}&gd=${+friday.slice(8, 10)}`);
    const it = j && j.items || [];
    const cl = it.find((x) => x.category === "candles" && x.date.startsWith(friday));
    const hv = it.find((x) => x.category === "havdalah");
    const sat = new Date(Date.parse(friday) + 864e5).toISOString().slice(0, 10);
    const light = cl ? hm(new Date(cl.date)) : hm(new Date(sunsetUTC(friday, c.lat, c.lng) - 18 * 60e3));
    const out2 = hv ? hm(new Date(hv.date)) : hm(new Date(+sunsetUTC(sat, c.lat, c.lng) + 42 * 60e3));
    out.push([c.he.replace(" (כרתים)", ""), `הדלקה ${light} · צאת ${out2}`]);
  }
  const parasha = await getJSON(`https://www.hebcal.com/shabbat?cfg=json&geonameid=264371&b=18&gy=${friday.slice(0, 4)}&gm=${+friday.slice(5, 7)}&gd=${+friday.slice(8, 10)}`);
  const p = parasha && (parasha.items || []).find((x) => x.category === "parashat");
  return { rows: out, parasha: p ? p.hebrew : "" };
}

const TIPS = [
  ["מהשדה למרכז אתונה", ["מטרו קו 3 (הכחול) עד סינטגמה", "כ-40 דקות, בלי להחליף קו", "יש גם אוטובוס X95 שפועל 24 שעות"]],
  ["מים מהברז באתונה", ["מי הברז באתונה ראויים לשתייה", "אין צורך לקנות בקבוקים כל יום", "באיים הקטנים עדיף לשאול במלון"]],
  ["נייר טואלט ביוון", ["לא זורקים אותו לאסלה", "זורקים לפח שליד האסלה", "הצנרת הישנה נסתמת בקלות"]],
  ["״נֶה״ זה כן!", ["Ναι (נֶה) = כן", "Όχι (אוחי) = לא", "מבלבל, אבל מהר מתרגלים 😉"]],
  ["יום ראשון ביוון", ["רוב החנויות סגורות", "פתוח: מסעדות, קיוסקים ואזורי תיירות", "קניות? תכננו לשישי או לשבת"]],
  ["מוניות באתונה", ["אפליקציות: FreeNow או Uber", "המונית הצהובה עם מונה", "מהשדה למרכז יש תעריף קבוע"]],
  ["כרטיס תחבורה באתונה", ["כרטיס 90 דקות: מטרו, אוטובוס וחשמלית", "אפשר לשלם בכרטיס אשראי בכניסה", "מתקפים כל פעם שעולים"]],
  ["כמה טיפ משאירים?", ["במסעדה: נהוג 5–10%", "במונית: מעגלים למעלה", "השאירו במזומן, ישירות למלצר"]],
  ["מספר חירום ביוון", ["112 – מספר החירום האירופי", "עובד גם בלי כרטיס SIM מקומי", "אפשר לדבר באנגלית"]],
  ["שעות החנויות", ["שני, רביעי, שבת: חנויות קטנות עד 15:00", "שלישי, חמישי, שישי: פתוחות גם בערב", "רשתות וקניונים: כל היום"]],
  ["לחם בטברנה", ["הלחם על השולחן לרוב בתשלום", "זה נקרא ״קוּבֵר״ (κουβέρ)", "לא רוצים? אמרו למלצר מראש"]],
  ["מוזיאונים בחינם", ["יום ראשון הראשון בחודש", "נובמבר עד מרץ", "באתרים של משרד התרבות"]],
];

// ---------- τα stories ----------
async function morning() {
  const wx = await weather();
  const st = strikesOn(NOW.date);
  const hol = HOLIDAYS.find((h) => h.d === NOW.date && h.shops !== "sales");
  const lines = [];
  if (st.length) for (const s of st.slice(0, 2)) lines.push({ t: `🚨 שביתה היום: ${(s.strike.sectors || []).filter((x) => SECT[x]).map((x) => SECT[x]).join(" · ")}` });
  else lines.push("✅ אין שביתות תחבורה היום");
  if (hol) lines.push(hol.shops === "closed" ? { t: `🏛️ ${hol.he}: רוב החנויות סגורות` } : `🗓️ ${hol.he}`);
  else if (NOW.wd === 0) lines.push("🛍️ יום ראשון: רוב החנויות סגורות");
  const rows = wx || [];
  if (!rows.length && !st.length && !hol) return null; // χωρίς καιρό και χωρίς νέα: δεν ανεβάζουμε κενό story
  const lt2 = 640 + 46 + rows.length * 100 + 70;
  const after = `<div class="list" style="top:${lt2}px;border-top:0;padding-top:0">${lines.map((l) => (typeof l === "string" ? `<div class="li">${esc(l)}</div>` : `<div class="li al">${esc(l.t)}</div>`)).join("")}</div>`;
  const html = page({ kick: "בוקר טוב מיוון ☀️", title: heDate(NOW.date), fs: 96, lt: 640, rows, after, cta: "כל העדכונים בעברית 👆 הקישור בביו" });
  return [{ id: `morning-${NOW.date}`, html }];
}

const BASICS = PHRASES.filter((p) => (p[0] === "basics" || p[0] === "food") && p[1].length <= 22).map((p) => [p[0], p[1].replace(/\s*\(.*?\)/g, "").trim(), ...p.slice(2)]);
async function topic() {
  const d = NOW.wd;
  if (d === 0) {
    const m = fs.readdirSync(path.join(ROOT, "content/madad")).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort().pop();
    const M = JSON.parse(fs.readFileSync(path.join(ROOT, "content/madad", m), "utf8"));
    const a = M.areas[weekNo % M.areas.length];
    const sign = (x) => (x > 0 ? "+" : "") + x.toFixed(1) + "%";
    return [{ id: `topic-${NOW.date}`, html: page({ kick: "נדל״ן · מדד השבוע", title: a.he, fs: fit(a.he), lt: 900, rows: [["מכירה, למ״ר", `€${a.sale.toLocaleString("en-US")}`], ["שינוי בשנה", sign(a.saleChg)], ["שכירות, למ״ר לחודש", `€${a.rent.toFixed(1)}`], ["שינוי בשנה", sign(a.rentChg)]], cta: "כל השכונות במדד 👆 הקישור בביו" }) }];
  }
  if (d === 1 || d === 2) {
    const i = weekNo % BASICS.length, q = BASICS[i];
    if (d === 1) {
      const others = BASICS.filter((p, j) => j !== i && p[1] !== q[1] && !/[?.]/.test(p[1]));
      const opts = [q[1], others[(weekNo * 7 + 3) % others.length][1], others[(weekNo * 11 + 5) % others.length][1]].filter((v, k, s) => s.indexOf(v) === k);
      while (opts.length < 3) opts.push(others[opts.length][1]);
      const order = [[0, 1, 2], [1, 0, 2], [1, 2, 0]][weekNo % 3].map((k) => opts[k]);
      const L = ["א", "ב", "ג"];
      return [{ id: `topic-${NOW.date}`, html: page({ kick: "חידון יווני 🤔", title: `מה פירוש ״${q[4]}״?`, fs: fit(q[4] + "מה פירוש"), lt: 900, lines: [`(${q[3]})`, ...order.map((o, k) => `${L[k]}. ${o}`)], cta: "התשובה בסטורי של מחר 👀" }) }];
    }
    return [{ id: `topic-${NOW.date}`, html: page({ kick: "מילה של השבוע", title: q[4], fs: fit(q[4]), lt: 900, lines: [q[3], `= ${q[1]}`, { t: "זו התשובה לחידון של אתמול ✔️" }], cta: "עוד 100 משפטים בשיחון 👆 הקישור בביו" }) }];
  }
  if (d === 3) {
    const [t, ls] = TIPS[weekNo % TIPS.length];
    return [{ id: `topic-${NOW.date}`, html: page({ kick: "טיפ של יוונט 💡", title: t, fs: fit(t), lt: 900, lines: ls, cta: "שמרו את הסטורי הזה 🔖" }) }];
  }
  if (d === 4) {
    const F = JSON.parse(fs.readFileSync(path.join(ROOT, "content/flights.json"), "utf8"));
    const seen = new Set();
    const rows = (F.deals || []).filter((x) => x.transfers === 0 && !seen.has(x.dest) && seen.add(x.dest)).slice(0, 4).map((x) => [x.he, x.airline]);
    if (!rows.length) return null;
    return [{ id: `topic-${NOW.date}`, html: page({ kick: "טיסות ✈️", title: "טיסות ישירות מישראל ליוון השבוע", fs: 92, lt: 900, rows, cta: "מחירים מתעדכנים כל יום 👆 הקישור בביו" }) }];
  }
  if (d === 5) {
    const s = await shabbat(NOW.date);
    return [{ id: `topic-${NOW.date}`, html: page({ kick: "שבת שלום 🕯️", title: s.parasha ? `זמני שבת · ${s.parasha}` : "זמני שבת ביוון", fs: 88, lt: 900, rows: s.rows, lines: [], cta: "שבת שלום מיוונט 🤍" }) }];
  }
  return null; // Σάββατο
}

async function evening() {
  const EVE = process.env.STORY_DATE ? NOW.date : athens(new Date(Date.now() - 5 * 3600e3)).date; // αν το GitHub αργήσει μετά τα μεσάνυχτα: η βραδιά της προηγούμενης μέρας
  const today = arts().filter((a) => athens(new Date(a.publishedAt)).date === EVE && !/נהרג|הרוג|נספ|מת |מתו |תאונ|התרסק|אסון/.test(a.he.title))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3);
  if (today.length < 2) return null;
  let reel = false;
  try { reel = JSON.parse(fs.readFileSync(path.join(ROOT, "content/ig/reel-last.json"), "utf8")).date === EVE; } catch {}
  const img = today.map((a) => a.image && a.image.type === "photo" && /^https?:/.test(a.image.url) && a.image.url).find(Boolean);
  const lines = today.map((a) => "• " + (a.he.title.length > 58 ? a.he.title.slice(0, 56).replace(/\s\S*$/, "") + "…" : a.he.title));
  if (reel) lines.push({ t: "🎬 רילס חדש בפרופיל" });
  return [{ id: `evening-${EVE}`, html: page({ kick: "היום ביוונט 📰", title: "מה קרה היום ביוון", fs: 96, lt: 800, lines, bg: img, cta: "הכתבות המלאות 👆 הקישור בביו" }).replace(/\.li\{font:600 52px/, ".li{text-align:right;font:600 50px") }];
}

async function alerts(state) {
  const now = Date.now(), out = [];
  const fresh = (a) => now - Date.parse(a.publishedAt) < 8 * 3600e3 && !state.alerts.includes(a.slug);
  for (const a of arts().filter(fresh)) {
    const strike = a.strike && (a.strike.sectors || []).some((x) => ["flights", "ferries", "metro"].includes(x)) && (a.strike.dates || []).some((d) => d >= NOW.date);
    const wx = !strike && isWeather(a) && ["orange", "red"].includes(wxInfo(a).level);
    if (!strike && !wx) continue;
    const kick = strike ? "🚨 התראת שביתה" : wxInfo(a).level === "red" ? "🔴 אזהרת מזג אוויר" : "🟠 אזהרת מזג אוויר";
    const lines = strike ? [(a.strike.sectors || []).filter((x) => SECT[x]).map((x) => SECT[x]).join(" · "), ...a.strike.dates.filter((d) => d >= NOW.date).slice(0, 3).map((d) => "📅 " + heDate(d))] : [a.he.dek.length > 110 ? a.he.dek.slice(0, 108).replace(/\s\S*$/, "") + "…" : a.he.dek];
    const img = a.image && a.image.type === "photo" && /^https?:/.test(a.image.url) ? a.image.url : null;
    out.push({ id: `alert-${a.slug}`, slug: a.slug, html: page({ kick, title: a.he.title, fs: a.he.title.length > 60 ? 70 : 80, lt: 1000, lines, bg: img, cta: "כל הפרטים 👆 הקישור בביו" }) });
    if (out.length >= 2) break;
  }
  return out;
}

// ---------- CLI ----------
const [cmd, a1, a2, a3] = process.argv.slice(2);
if (cmd === "render") {
  const kind = a1, dir = a2 || "stories-out";
  fs.mkdirSync(dir, { recursive: true });
  const state = readState();
  if (NOW.wd === 6 && NOW.hour < 19 && !process.env.FORCE) { log("stories: Σάββατο – τίποτα πριν τις 19:00"); fs.writeFileSync(path.join(dir, "plan.json"), "[]"); process.exit(0); }
  const fn = { morning, topic, evening, alerts }[kind];
  if (!fn) throw new Error("άγνωστο είδος " + kind);
  let items = (await fn(state)) || [];
  items = items.filter((x) => process.env.FORCE || !state.done[x.id]);
  const plan = [];
  for (const it of items) {
    const file = `${it.id}-${Date.now().toString(36)}.jpg`;
    try { shoot(it.html, path.join(dir, file)); plan.push({ id: it.id, slug: it.slug, file }); log("✓ render", file); }
    catch (e) { log("✗ render", it.id, e.message); }
  }
  fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify(plan, null, 1));
  log(`stories ${kind}: ${plan.length} έτοιμα`);
} else if (cmd === "publish") {
  const { postStory } = await import("./meta.mjs");
  const dir = a1, base = a2.replace(/\/$/, "");
  const plan = JSON.parse(fs.readFileSync(path.join(dir, "plan.json"), "utf8"));
  const state = readState();
  for (const p of plan) {
    const r = await postStory(`${base}/${p.file}`);
    if (r.some((x) => x.startsWith("IG story ✓"))) {
      state.done[p.id] = new Date().toISOString();
      if (p.slug) state.alerts.push(p.slug);
      if (p.id.startsWith("alert-")) await notifyOwner(`🚨 Story έκτακτο ανέβηκε: ${p.slug}`).catch(() => {});
    } else await notifyOwner(`⚠️ Story ${p.id}: ${r.join(" · ")}`).catch(() => {});
  }
  const keep = Object.entries(state.done).sort((x, y) => (x[1] < y[1] ? 1 : -1)).slice(0, 120);
  fs.writeFileSync(STATE, JSON.stringify({ done: Object.fromEntries(keep), alerts: state.alerts.slice(-80) }, null, 1));
} else console.log("χρήση: render <morning|topic|evening|alerts> <dir> · publish <dir> <baseUrl>");
