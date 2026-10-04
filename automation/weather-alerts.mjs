// Ειδοποιήσεις καιρού με email: node automation/weather-alerts.mjs  (τρέχει στο pipeline, μετά το deploy, όπως το strike-alerts.mjs)
// Επαφές Brevo με WX_ALERT=1 (μπαίνουν ΜΟΝΟ μετά από double opt-in στο /api/alerts), WX_REGIONS (crete,attica,… ή all), WX_LEVEL (severe|all), LANG.
// Όταν δημοσιεύεται ΝΕΟ άρθρο καιρού (ίδια ανίχνευση με το site: isWeather/wxInfo), στέλνεται ΕΝΑ email σε όσους ταιριάζουν περιοχή και επίπεδο.
//  - Ποτέ για άρθρα παλαιότερα από 12 ώρες (publishedAt· ή updatedAt αν το άρθρο ανέβηκε σε κόκκινο).
//  - Αρχείο αποστολών: automation/wx-alerts.json (slug → επίπεδο) – το commit γίνεται στο ίδιο βήμα του workflow.
//    Επιπλέον κάθε επαφή κρατά WX_SENT (slug:επίπεδο) ώστε να μη σταλεί δεύτερη φορά ακόμη κι αν χαθεί το αρχείο.
//  - Αν ένα άρθρο που στάλθηκε ως κίτρινο/πορτοκαλί αναβαθμιστεί σε κόκκινο, στέλνεται ξανά (μία φορά).
// Χρήση για δοκιμή: DRY_RUN=1 (δεν στέλνει, δεν γράφει) · WX_TEST_EMAIL=x@y (στέλνει μόνο σε αυτή την επαφή).
import path from "node:path";
import { env, log, loadArticles, brevo, notifyOwner, DRY, ROOT, readJSON, writeJSON } from "./lib.mjs";
import { SITE } from "../site/config.mjs";
import { isWeather, wxInfo } from "../site/weather.mjs";
import { wxLevelFor, wxLevelUrl } from "../site/wxlevels.mjs";
import { ALERT_REGIONS, articleRegions, levelOk, regionsOk, cleanRegions, unsubUrl } from "../lib/alerts.js";

const LOG_FILE = path.join(ROOT, "automation/wx-alerts.json");
const MAX_AGE = 12 * 3600e3;
const RANK = { yellow: 1, orange: 2, red: 3 };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function pickNew(articles, sentLog, now = Date.now()) {
  const out = [];
  for (const a of articles) {
    if (!isWeather(a)) continue;
    const wx = wxInfo(a), prev = sentLog[a.slug];
    const pub = Date.parse(a.publishedAt), upd = Date.parse(a.updatedAt || a.publishedAt);
    if (!prev) { if (now - pub <= MAX_AGE && now >= pub - 3600e3) out.push({ a, wx, upgrade: false }); continue; }
    // Αναβάθμιση σε κόκκινο μέσα σε 12 ώρες από την ενημέρωση
    if (wx.level === "red" && (RANK[prev.level] || 0) < RANK.red && now - upd <= MAX_AGE) out.push({ a, wx, upgrade: true });
  }
  return out;
}

const fmtDate = (iso, he) => new Date(iso).toLocaleString(he ? "he-IL" : "en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" });
const LV = { red: ["🔴 אזהרה אדומה", "🔴 Red warning", "#B3261E"], orange: ["🟠 אזהרה כתומה", "🟠 Orange warning", "#C2610C"], yellow: ["🟡 אזהרה צהובה", "🟡 Yellow warning", "#A07900"] };
const DO = {
  red: ["הקפידו מאוד על הוראות הרשויות. אם קיבלתם הודעת 112, פעלו מיד לפי מה שכתוב בה.", "Follow the authorities' instructions closely. If you get a 112 message, act on it immediately."],
  orange: ["כדאי לדחות טיולים, שייט ונסיעות לא חיוניות באזור האזהרה ולהתעדכן בתחזית.", "Postpone hikes, boat trips and non-essential travel in the warning area, and keep up with the forecast."],
  yellow: ["בדרך כלל אפשר להמשיך כרגיל, אבל בדקו את התחזית לפני טיול, שייט או נהיגה בהרים.", "You can usually carry on as normal, but check the forecast before a hike, a boat trip or a mountain drive."],
  none: ["היו זהירים, התעדכנו בתחזית והישמעו להוראות הרשויות.", "Be careful, keep up with the forecast and follow the authorities' advice."],
};
const TIPS = [
  ["אל תחצו נחלים או דרכים מוצפות, לא ברגל ולא ברכב.", "Do not cross streams or flooded roads, on foot or by car."],
  ["בסופת רעמים: מחסה בבניין או ברכב, לא מתחת לעץ גבוה בשטח פתוח.", "In a thunderstorm: shelter in a building or a car, never under a tall tree in open ground."],
  ["לפני הפלגה או טיסה, בדקו מול חברת המעבורות או חברת התעופה.", "Before sailing or flying, check with the ferry company or the airline."],
];

export function buildMail({ a, wx, upgrade }, lang, unsub, BASE) {
  const he = lang === "he", i = he ? 0 : 1;
  const utm = (u) => u + (u.includes("?") ? "&" : "?") + "utm_source=alert&utm_medium=email&utm_campaign=weather";
  const art = utm(`${BASE}${he ? "" : "/en"}/a/${a.slug}/`);
  const lp = wxLevelFor({ wx })[0];
  const levelUrl = lp ? utm(`${BASE}${he ? "" : "/en"}${wxLevelUrl(lp.id)}`) : utm(`${BASE}${he ? "" : "/en"}/weather-warnings/`);
  const lv = wx.level ? LV[wx.level] : null;
  const regs = articleRegions(a);
  const where = regs.length ? regs.map((r) => ALERT_REGIONS.find((x) => x.id === r)[lang]).join(" · ") : (wx.regions.length ? wx.regions.map((r) => r[lang]).join(" · ") : (he ? "יוון" : "Greece"));
  const head = `${lv ? lv[i] : "⚠️ " + (he ? "מזג אוויר קשה" : "Severe weather")} · ${wx.type.icon} ${wx.type[lang]}`;
  const subject = `${upgrade ? (he ? "עדכון: " : "Update: ") : ""}${lv ? lv[i].split(" ")[0] : "⚠️"} ${he ? `${lv ? lv[0].slice(3) : "אזהרת מזג אוויר"} – ${where}` : `${lv ? lv[1].slice(3) : "Weather warning"} – ${where}`}`;
  const title = a[lang]?.title || a.en.title, dek = a[lang]?.dek || a.en.dek;
  const when = fmtDate(a.updatedAt && upgrade ? a.updatedAt : a.publishedAt, he);
  const html = `<!doctype html><html dir="${he ? "rtl" : "ltr"}" lang="${lang}"><body style="margin:0;background:#F6F9FB;font-family:Arial,Helvetica,sans-serif;color:#0E1B26"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:16px"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:14px"><tr><td style="padding:24px;text-align:${he ? "right" : "left"};font-size:16px;line-height:1.6">
<p style="margin:0 0 8px;font-weight:bold;color:${lv ? lv[2] : "#0B3A5B"}">${esc(head)}</p>
<h1 style="font-size:21px;margin:0 0 8px;color:#0B3A5B">${esc(title)}</h1>
<p style="margin:0 0 4px">📍 <b>${esc(where)}</b></p>
<p style="margin:0 0 12px;font-size:14px;color:#5B6B78">🕒 ${esc(when)} (${he ? "שעון אתונה" : "Athens time"})</p>
<p style="margin:0 0 14px">${esc(dek)}</p>
<div style="background:#FFF6E5;border-radius:12px;padding:14px;margin:0 0 16px"><b>${he ? "מה עושים" : "What to do"}</b><p style="margin:6px 0">${esc(DO[wx.level || "none"][i])}</p><ul style="margin:0;padding-${he ? "right" : "left"}:18px">${TIPS.map((t) => `<li>${esc(t[i])}</li>`).join("")}</ul></div>
<p style="margin:0 0 14px"><a href="${art}" style="display:inline-block;background:#0B3A5B;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${he ? "לפרטים המלאים" : "Full details"}</a></p>
<p style="margin:0 0 6px;font-size:14px"><a href="${levelUrl}">${lp ? esc(he ? `${lp.he.name}: מה זה אומר?` : `${lp.en.name}: what does it mean?`) : (he ? "כל אזהרות מזג האוויר ביוון" : "All Greece weather warnings")}</a> · <a href="https://meteoalarm.org/en/live/region/GR">MeteoAlarm</a></p>
<p style="margin:0 0 6px;font-size:14px">${he ? "במצב חירום חייגו 112." : "In an emergency call 112."}</p>
<p style="margin:16px 0 0;font-size:12px;color:#5B6B78">${he ? `קיבלתם את המייל כי נרשמתם ביוונט להתראות על אזהרות מזג אוויר. אזהרה יכולה להתעדכן או להסתיים: המצב העדכני באתר ΕΜΥ ובמפה של MeteoAlarm. <a href="${esc(unsub)}" style="color:#5B6B78">להפסקת ההתראות</a>` : `You are receiving this because you signed up on Yavanet for weather warning alerts. Warnings can be updated or lifted: the current status is on the EMY website and the MeteoAlarm map. <a href="${esc(unsub)}" style="color:#5B6B78">Unsubscribe</a>`}</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, html };
}

async function main() {
  if (!env.BREVO_API_KEY) { log("weather-alerts: χωρίς BREVO_API_KEY – παράλειψη"); return; }
  if (!env.TELEGRAM_BOT_TOKEN) { log("weather-alerts: χωρίς TELEGRAM_BOT_TOKEN (υπογραφή link διαγραφής) – παράλειψη"); return; }
  const SENDER = env.SENDER_EMAIL || "info@yavanet.gr";
  const BASE = SITE.url.replace(/\/$/, "");
  const sentLog = readJSON(LOG_FILE, {});
  const fresh = pickNew(loadArticles(), sentLog);
  if (!fresh.length) { log("weather-alerts: κανένα νέο άρθρο καιρού"); return; }

  // Επαφές με WX_ALERT=1 (σελίδες των 1000)
  const contacts = [];
  for (let off = 0; off < 50000; off += 1000) {
    const r = await brevo(`/contacts?limit=1000&offset=${off}&sort=desc`, null, "GET");
    const list = (r && r.contacts) || [];
    contacts.push(...list.filter((c) => c.attributes && String(c.attributes.WX_ALERT) === "1" && !c.emailBlacklisted && (!env.WX_TEST_EMAIL || c.email === env.WX_TEST_EMAIL)));
    if (list.length < 1000) break;
  }
  log(`weather-alerts: ${fresh.length} νέα άρθρα καιρού, ${contacts.length} συνδρομητές`);

  const report = [];
  for (const item of fresh) {
    const { a, wx } = item, key = `${a.slug}:${wx.level || "none"}`;
    const regs = articleRegions(a);
    let sent = 0, failed = 0;
    // Πρώτα σημειώνουμε το άρθρο ως σταλμένο: αν κάτι αποτύχει, καλύτερα ένα email λιγότερο παρά επαναλήψεις κάθε 15 λεπτά
    sentLog[a.slug] = { level: wx.level || "none", at: new Date().toISOString(), regions: regs };
    if (!DRY) writeJSON(LOG_FILE, sentLog);
    for (const c of contacts) {
      const A = c.attributes || {};
      const subRegs = cleanRegions(A.WX_REGIONS);
      if (!subRegs.length || !regionsOk(subRegs, regs) || !levelOk(String(A.WX_LEVEL || "severe"), wx.level)) continue;
      const done = String(A.WX_SENT || "").split(",").filter(Boolean);
      if (done.includes(key)) continue;
      const lang = String(A.LANG || "he") === "en" ? "en" : "he";
      try {
        done.push(key);
        await brevo(`/contacts/${encodeURIComponent(c.email)}`, { attributes: { WX_SENT: done.slice(-30).join(",") } }, "PUT");
        A.WX_SENT = done.slice(-30).join(",");
        const un = await unsubUrl(env, BASE, c.email, lang);
        const m = buildMail(item, lang, un, BASE);
        await brevo("/smtp/email", { sender: { email: SENDER, name: lang === "he" ? "יוונט" : "Yavanet" }, replyTo: { email: SENDER }, to: [{ email: c.email }], subject: m.subject, htmlContent: m.html, tags: ["weather-alert"], headers: { "List-Unsubscribe": `<${un}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
        sent++;
      } catch (e) { failed++; log("weather-alerts: αποστολή απέτυχε", c.email, e.message); }
    }
    sentLog[a.slug].sent = sent;
    report.push(`${item.upgrade ? "⬆️ " : ""}${wx.level || "—"} · ${a.slug} · ${regs.join(",") || "όλη η Ελλάδα"} → ${sent} emails${failed ? `, ${failed} αποτυχίες` : ""}`);
  }
  if (!DRY) writeJSON(LOG_FILE, sentLog);
  log("weather-alerts:", report.join(" | "), DRY ? "(dry run)" : "");
  try { await notifyOwner(`🌧️ Ειδοποιήσεις καιρού με email\n${report.join("\n")}`); } catch { }
}

// Τρέχει μόνο όταν καλείται απευθείας (όχι όταν γίνεται import για δοκιμές)
if (import.meta.url === `file://${process.argv[1]}`) {
  await main().catch(async (e) => { log("weather-alerts: σφάλμα", e.message); try { await notifyOwner("⚠️ weather-alerts σφάλμα: " + e.message); } catch { } });
}
