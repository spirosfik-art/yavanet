// Ειδοποιήσεις απεργίας για ταξίδια (/strike-check/): node automation/strike-alerts.mjs
// Επαφές Brevo με STRIKE_ALERT=1 και TRIP_FROM..TRIP_TO (καταχωρούνται από το /api/lead, kind "strike-alert", χωρίς λίστα).
// Για κάθε επερχόμενη απεργία μετακινήσεων (άρθρα με πεδίο strike) που πέφτει μέσα στις ημέρες του ταξιδιού, στέλνεται ΕΝΑ email ανά απεργία:
// τα slug που στάλθηκαν κρατιούνται στο χαρακτηριστικό STRIKE_SENT της επαφής (idempotent). Μετά το τέλος του ταξιδιού: STRIKE_ALERT=0.
// STRIKE_MODE=all (από τη συνδυαστική φόρμα καιρού+απεργιών, μετά από double opt-in στο /api/alerts): χωρίς ημερομηνίες ταξιδιού,
// ένα email για κάθε ΝΕΑ απεργία σε πλοία ή πτήσεις (άρθρο μετά την επιβεβαίωση, μείον 24 ώρες), με σύνδεσμο διαγραφής.
import { env, log, loadArticles, brevo, notifyOwner, DRY } from "./lib.mjs";
import { unsubUrl } from "../lib/alerts.js";
import { SITE } from "../site/config.mjs";

if (!env.BREVO_API_KEY) { log("strike-alerts: χωρίς BREVO_API_KEY – παράλειψη"); process.exit(0); }
const SENDER = env.SENDER_EMAIL || "info@yavanet.gr";
const BASE = SITE.url.replace(/\/$/, "");
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Athens" }).format(new Date());
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SECTOR = { flights: ["✈️ טיסות", "✈️ Flights"], ferries: ["⛴️ מעבורות", "⛴️ Ferries"], metro: ["🚇 מטרו", "🚇 Metro"], buses: ["🚌 אוטובוסים", "🚌 Buses"], trains: ["🚆 רכבות", "🚆 Trains"], taxis: ["🚕 מוניות", "🚕 Taxis"], "public-sector": ["🏛️ שירות ציבורי", "🏛️ Public sector"], other: ["⚠️ אחר", "⚠️ Other"] };

// Μόνο απεργίες που επηρεάζουν μετακινήσεις (όπως η μπάρα απεργίας του site)
const TRAVEL = ["flights", "ferries", "metro", "buses", "trains", "taxis"];
const strikes = loadArticles().filter((a) => !a.hidden && a.strike && Array.isArray(a.strike.dates) && a.strike.dates.some((d) => d >= today) && (a.strike.sectors || []).some((x) => TRAVEL.includes(x)));
if (!strikes.length) { log("strike-alerts: δεν υπάρχουν επερχόμενες απεργίες"); process.exit(0); }

// Όλες οι επαφές (σελίδες των 1000) → όσες έχουν STRIKE_ALERT=1
const contacts = [];
for (let off = 0; off < 50000; off += 1000) {
  const r = await brevo(`/contacts?limit=1000&offset=${off}&sort=desc`, null, "GET");
  const list = (r && r.contacts) || [];
  contacts.push(...list.filter((c) => c.attributes && String(c.attributes.STRIKE_ALERT) === "1"));
  if (list.length < 1000) break;
}
log(`strike-alerts: ${contacts.length} επαφές με ειδοποίηση, ${strikes.length} επερχόμενες απεργίες`);

const fmt = (d, he) => new Date(d + "T12:00:00Z").toLocaleDateString(he ? "he-IL" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
function mail(he, s, days, from, to, unsub = "") {
  const art = `${BASE}${he ? "" : "/en"}/a/${s.slug}/?utm_source=strike-alert&utm_medium=email`;
  const check = from ? `${BASE}${he ? "" : "/en"}/strike-check/?from=${from}&to=${to}` : `${BASE}${he ? "" : "/en"}/strikes/`;
  const what = (s.strike[he ? "he" : "en"] || s[he ? "he" : "en"].title);
  const sec = (s.strike.sectors || []).map((x) => (SECTOR[x] || SECTOR.other)[he ? 0 : 1]).join(" · ");
  const subject = from
    ? (he ? `🚨 שביתה ביוון בזמן הטיול שלכם: ${days.map((d) => fmt(d, true)).join(", ")}` : `🚨 Strike in Greece during your trip: ${days.map((d) => fmt(d, false)).join(", ")}`)
    : (he ? `🚨 שביתה ביוון (${sec}): ${days.map((d) => fmt(d, true)).join(", ")}` : `🚨 Strike in Greece (${sec}): ${days.map((d) => fmt(d, false)).join(", ")}`);
  const html = `<!doctype html><html dir="${he ? "rtl" : "ltr"}" lang="${he ? "he" : "en"}"><body style="margin:0;background:#F6F9FB;font-family:Arial,Helvetica,sans-serif;color:#0E1B26"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:16px"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:14px"><tr><td style="padding:24px;text-align:${he ? "right" : "left"};font-size:16px;line-height:1.6">
<h1 style="font-size:21px;margin:0 0 10px;color:#0B3A5B">${from ? (he ? "הוכרזה שביתה בתאריכי הטיול שלכם" : "A strike has been announced during your trip") : (he ? "הוכרזה שביתה שמשבשת מעבורות או טיסות ביוון" : "A strike disrupting ferries or flights in Greece")}</h1>
<p style="margin:0 0 6px"><b>${esc(days.map((d) => fmt(d, he)).join(", "))}</b> · ${esc(sec)}</p>
<p style="margin:0 0 16px">${esc(what)}</p>
<p style="margin:0 0 18px"><a href="${art}" style="display:inline-block;background:#0B3A5B;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${he ? "לפרטים המלאים" : "Full details"}</a></p>
<p style="margin:0 0 6px;font-size:14px">${he ? "שביתות לפעמים מתבטלות או משתנות ברגע האחרון – בדקו מול חברת התעופה או המעבורות." : "Strikes are sometimes called off or changed at the last minute – check with your airline or ferry company."}</p>
<p style="margin:0 0 6px;font-size:14px"><a href="${check}">${from ? (he ? "כל השביתות בתאריכי הטיול שלכם" : "All strikes during your trip") : (he ? "כל השביתות הקרובות" : "All upcoming strikes")}</a></p>
<p style="margin:16px 0 0;font-size:12px;color:#5B6B78">${from
    ? (he ? `קיבלתם את המייל כי ביקשתם התראה על שביתות בין ${from} ל-${to} ביוונט. כדי להפסיק, השיבו למייל הזה עם המילה "הסר".` : `You are receiving this because you asked Yavanet for strike alerts between ${from} and ${to}. To stop, reply to this email with "unsubscribe".`)
    : (he ? `קיבלתם את המייל כי נרשמתם ביוונט להתראות על מזג אוויר ושביתות. <a href="${esc(unsub)}" style="color:#5B6B78">להפסקת ההתראות</a>` : `You are receiving this because you signed up on Yavanet for weather and strike alerts. <a href="${esc(unsub)}" style="color:#5B6B78">Unsubscribe</a>`)}</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, html };
}

let sent = 0, closed = 0;
const ALL_SECTORS = ["flights", "ferries"]; // STRIKE_MODE=all: μόνο πλοία και πτήσεις (ό,τι υπόσχεται η φόρμα)
for (const c of contacts) {
  const A = c.attributes || {};
  if (String(A.STRIKE_MODE || "") === "all") {
    const since = Date.parse(A.ALERTS_CONFIRMED_AT || "") - 864e5;
    if (!since) continue;
    const done = new Set(String(A.STRIKE_SENT || "").split(",").map((x) => x.trim()).filter(Boolean));
    const he = String(A.LANG || "he") !== "en";
    for (const s of strikes) {
      if (done.has(s.slug) || !(s.strike.sectors || []).some((x) => ALL_SECTORS.includes(x)) || Date.parse(s.publishedAt) < since) continue;
      const days = s.strike.dates.filter((d) => d >= today).sort();
      if (!days.length) continue;
      done.add(s.slug);
      try { await brevo(`/contacts/${encodeURIComponent(c.email)}`, { attributes: { STRIKE_SENT: [...done].slice(-40).join(",") } }, "PUT"); }
      catch (e) { log("strike-alerts: δεν αποθηκεύτηκε STRIKE_SENT – παράλειψη", c.email, e.message); done.delete(s.slug); continue; }
      try {
        const un = await unsubUrl(env, BASE, c.email, he ? "he" : "en");
        const m = mail(he, s, days, "", "", un);
        await brevo("/smtp/email", { sender: { email: SENDER, name: he ? "יוונט" : "Yavanet" }, replyTo: { email: SENDER }, to: [{ email: c.email }], subject: m.subject, htmlContent: m.html, tags: ["strike-alert"], headers: { "List-Unsubscribe": `<${un}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
        sent++;
      } catch (e) { log("strike-alerts: αποστολή απέτυχε", c.email, e.message); }
    }
    continue;
  }
  const from = String(A.TRIP_FROM || "").slice(0, 10), to = String(A.TRIP_TO || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) continue;
  if (to < today) { // το ταξίδι τελείωσε: σταματάμε τις ειδοποιήσεις
    try { await brevo(`/contacts/${encodeURIComponent(c.email)}`, { attributes: { STRIKE_ALERT: "0" } }, "PUT"); closed++; } catch (e) { log("strike-alerts: σφάλμα", e.message); }
    continue;
  }
  const done = new Set(String(A.STRIKE_SENT || "").split(",").map((x) => x.trim()).filter(Boolean));
  const he = String(A.LANG || "he") !== "en";
  for (const s of strikes) {
    if (done.has(s.slug)) continue;
    const days = s.strike.dates.filter((d) => d >= today && d >= from && d <= to).sort();
    if (!days.length) continue;
    const m = mail(he, s, days, from, to);
    // Πρώτα σημειώνουμε την αποστολή (STRIKE_SENT) και μετά στέλνουμε: αν κάτι αποτύχει, καλύτερα ένα email λιγότερο παρά επαναλήψεις κάθε 15 λεπτά.
    done.add(s.slug);
    try { await brevo(`/contacts/${encodeURIComponent(c.email)}`, { attributes: { STRIKE_SENT: [...done].slice(-40).join(",") } }, "PUT"); }
    catch (e) { log("strike-alerts: δεν αποθηκεύτηκε STRIKE_SENT – παράλειψη", c.email, e.message); done.delete(s.slug); continue; }
    try {
      await brevo("/smtp/email", { sender: { email: SENDER, name: he ? "יוונט" : "Yavanet" }, replyTo: { email: SENDER }, to: [{ email: c.email }], subject: m.subject, htmlContent: m.html, tags: ["strike-alert"] });
      sent++;
    } catch (e) { log("strike-alerts: αποστολή απέτυχε", c.email, e.message); }
  }
}
log(`strike-alerts: στάλθηκαν ${sent} emails, ${closed} ταξίδια έληξαν${DRY ? " (dry run)" : ""}`);
if (sent) { try { await notifyOwner(`🚨 Ειδοποιήσεις απεργίας ταξιδιού: στάλθηκαν ${sent} emails`); } catch { } }
