// Φόρμες επαφής: σύμβουλος ακινήτων, «Ρωτήστε τον ειδικό», αναφορά λάθους, γνώμη, διαφημιστές, επιχειρήσεις, GDPR.
// Κάθε επαφή μπαίνει στο CRM (λίστα επαφών Brevo) και ειδοποιεί αμέσως την εταιρεία με email και Telegram.
import { json, clean, validEmail, readBody, sameOrigin, brevo, telegram, escHtml, withDefaults } from "../../lib/forms.js";
import { cleanRegions, signToken, ALERT_REGIONS } from "../../lib/alerts.js";

const KINDS = {
  "property-lead": "🏠 Νέα επαφή ακινήτων",
  "medtour-lead": "🏥 Ενδιαφέρον για Airbnb δίπλα σε νοσοκομεία",
  "ask-expert": "❓ Ερώτηση «Ρωτήστε τον ειδικό»",
  "law-alerts": "🔔 Εγγραφή σε ειδοποιήσεις νόμων",
  "error-report": "⚠️ Αναφορά λάθους σε άρθρο",
  "feedback": "💬 Γνώμη αναγνώστη",
  "advertiser": "📣 Ενδιαφέρον διαφημιστή",
  "business-listing": "🏪 Αίτηση καταχώρησης επιχείρησης",
  "gdpr-request": "🔒 Αίτημα GDPR (πρόσβαση/διαγραφή)",
  "contact": "✉️ Μήνυμα επικοινωνίας",
  "asi-contact": "📲 Επαφή για τον Άση (πριν από WhatsApp/τηλέφωνο)",
  "strike-alert": "🚨 Ειδοποίηση απεργίας για ταξίδι (/strike-check/)",
  "weather-alert": "🌧️ Εγγραφή σε ειδοποιήσεις καιρού (email)",
};
const ASI = { wa: "972546221414", tel: "+972 54-622-1414" };
const ASI_SERVICES = { "real-estate": "Real Estate", "management": "Management", "airbnb": "Airbnb", "renovation": "Renovation" };
// Ποιες φόρμες είναι πιθανοί πελάτες (μπαίνουν στη λίστα CRM)
const CRM_KINDS = new Set(["asi-contact", "property-lead", "medtour-lead", "ask-expert", "law-alerts", "advertiser", "business-listing"]);

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  if (!b) return json({ ok: false }, 400);
  if (b.website) return json({ ok: true });
  const kind = KINDS[b.kind] ? b.kind : "contact";
  const d = {
    kind, name: clean(b.name, 120), email: clean(b.email, 200).toLowerCase(), phone: clean(b.phone, 60),
    area: clean(b.area, 120), budget: clean(b.budget, 60), message: clean(b.message, 4000),
    article: clean(b.article, 200), page: clean(b.page, 300), referrer: clean(b.referrer, 300), lang: b.lang === "en" ? "en" : "he",
    country: request.cf?.country || "", city: request.cf?.city || "", at: new Date().toISOString(),
  };
  if (kind === "asi-contact") {
    d.service = ASI_SERVICES[b.service] || "";
    if (!d.service) return json({ ok: false, error: "invalid" }, 400);
    if (!d.name) d.name = d.email;
    d.message = `Υπηρεσία: ${d.service} · ${b.mode === "tel" ? "ζήτησε τηλέφωνο" : "πάει στο WhatsApp"}`;
  }
  if (kind === "strike-alert") {
    // Ημερομηνίες ταξιδιού: YYYY-MM-DD, λογική σειρά, έως 1 χρόνο μπροστά. Χωρίς όνομα (μόνο email).
    const iso = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : "");
    d.tripFrom = iso(b.trip_from); d.tripTo = iso(b.trip_to);
    const max = new Date(Date.now() + 400 * 864e5).toISOString().slice(0, 10), today = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    if (!d.tripFrom || !d.tripTo || d.tripTo < d.tripFrom || d.tripTo < today || d.tripFrom > max) return json({ ok: false, error: "invalid" }, 400);
    if (!d.name) d.name = d.email;
    d.message = `Ταξίδι: ${d.tripFrom} → ${d.tripTo}`;
  }
  if (kind === "weather-alert") {
    // Περιοχές + επίπεδο (+ προαιρετικά απεργίες μετακινήσεων). Τίποτα δεν αποθηκεύεται πριν την επιβεβαίωση (double opt-in):
    // τα στοιχεία ταξιδεύουν υπογεγραμμένα μέσα στο link του email επιβεβαίωσης → /api/alerts?a=confirm
    d.regions = cleanRegions(b.regions);
    d.level = b.level === "all" ? "all" : "severe";
    d.strike = !!b.strike && b.strike !== "0";
    if (!d.regions.length) return json({ ok: false, error: "invalid" }, 400);
    if (!d.name) d.name = d.email;
    const rn = d.regions.map((r) => (r === "all" ? "Όλη η Ελλάδα" : (ALERT_REGIONS.find((x) => x.id === r) || {}).en || r));
    d.message = `Περιοχές: ${rn.join(", ")} · Επίπεδο: ${d.level === "all" ? "όλες (και κίτρινες)" : "πορτοκαλί + κόκκινες"}${d.strike ? " · + απεργίες (πλοία/πτήσεις)" : ""}\n(στάλθηκε email επιβεβαίωσης – ενεργοποιείται όταν το πατήσει)`;
  }
  if (!validEmail(d.email) || !b.consent || !d.name) return json({ ok: false, error: "invalid" }, 400);

  const lines = [
    ["Είδος", KINDS[kind]], ["Όνομα", d.name], ["Email", d.email], ["Τηλέφωνο", d.phone], ["Περιοχή", d.area], ["Προϋπολογισμός", d.budget],
    ["Μήνυμα", d.message], ["Άρθρο", d.article], ["Σελίδα", d.page], ["Ήρθε από", d.referrer], ["Χώρα / πόλη", [d.country, d.city].filter(Boolean).join(" / ")], ["Γλώσσα", d.lang], ["Ώρα", d.at],
  ].filter(([, v]) => v);

  const jobs = [];
  // Ειδοποίηση απεργίας: επαφή Brevo ΧΩΡΙΣ λίστα (όχι newsletter, όχι CRM). Το automation/strike-alerts.mjs στέλνει τα emails.
  if (kind === "strike-alert" && env.BREVO_API_KEY) {
    jobs.push(brevo(env, "/contacts", {
      email: d.email, updateEnabled: true,
      attributes: { STRIKE_ALERT: "1", TRIP_FROM: d.tripFrom, TRIP_TO: d.tripTo, LANG: d.lang, SIGNUP_PAGE: d.page, CONSENT_AT: d.at },
    }));
  }
  if (kind === "weather-alert") {
    if (!env.BREVO_API_KEY || !env.SENDER_EMAIL) return json({ ok: false, error: "not-configured" }, 503);
    let tok;
    try { tok = await signToken(env, "confirm", { e: d.email, l: d.lang, r: d.regions, v: d.level, s: d.strike ? 1 : 0, p: d.page, at: d.at }); }
    catch (e) { console.error(e.message); return json({ ok: false, error: "not-configured" }, 503); }
    const url = new URL("/api/alerts?a=confirm&t=" + encodeURIComponent(tok), request.url).toString();
    jobs.push(brevo(env, "/smtp/email", { sender: { email: env.SENDER_EMAIL, name: d.lang === "he" ? "יוונט" : "Yavanet" }, to: [{ email: d.email }], subject: confirmMail(d.lang, d.strike).subject, htmlContent: confirmMail(d.lang, d.strike, url).html, tags: ["alert-optin"] })
      .then(() => { d.confirmSent = true; }));
  }
  if (CRM_KINDS.has(kind) && env.BREVO_API_KEY && env.BREVO_LEADS_LIST) {
    jobs.push(brevo(env, "/contacts", {
      email: d.email, updateEnabled: true, listIds: [Number(env.BREVO_LEADS_LIST)],
      attributes: { FIRSTNAME: d.name === d.email ? "" : d.name, SMS_TEXT: d.phone, LEAD_KIND: kind + (d.service ? " · " + d.service : ""), LEAD_SOURCE: d.article || d.page, AREA: d.area, BUDGET: d.budget, LEAD_STATUS: "Νέα", LANG: d.lang, COUNTRY: d.country, LEAD_AT: d.at },
    }));
  }
  if (env.BREVO_API_KEY && env.NOTIFY_EMAIL && env.SENDER_EMAIL) {
    jobs.push(brevo(env, "/smtp/email", {
      sender: { email: env.SENDER_EMAIL, name: "Yavanet" }, to: [{ email: env.NOTIFY_EMAIL }], replyTo: { email: d.email, name: d.name },
      subject: `${KINDS[kind]} · ${d.name}`,
      htmlContent: `<table cellpadding="6" style="font-family:Arial;font-size:14px">${lines.map(([k, v]) => `<tr><td><b>${escHtml(k)}</b></td><td>${escHtml(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`,
    }));
  }
  jobs.push(telegram(env, lines.map(([k, v]) => `${k}: ${v}`).join("\n")));

  const res = await Promise.allSettled(jobs);
  const failed = res.filter((r) => r.status === "rejected");
  failed.forEach((f) => console.error(f.reason?.message));
  if (kind === "weather-alert") return d.confirmSent ? json({ ok: true, confirm: true }) : json({ ok: false }, 502);
  if (kind === "asi-contact") {
    // Ο αριθμός δίνεται ΜΟΝΟ αφού αφήσει email και υπηρεσία (δεν υπάρχει μέσα στις σελίδες).
    const txt = d.lang === "he" ? `היי אסי, הגעתי מיוונט. אני מתעניין/ת ב: ${d.service}` : `Hi Asi, I found you on Yavanet. I'm interested in: ${d.service}`;
    return json({ ok: true, wa: `https://wa.me/${ASI.wa}?text=${encodeURIComponent(txt)}`, tel: ASI.tel });
  }
  return failed.length === res.length ? json({ ok: false }, 502) : json({ ok: true });
}

// Email επιβεβαίωσης (double opt-in) για ειδοποιήσεις καιρού/απεργιών
function confirmMail(lang, strike, url = "") {
  const he = lang === "he", al = he ? "right" : "left";
  const subject = he ? "יוונט · אשרו את ההרשמה להתראות מזג אוויר" : "Yavanet · Please confirm your weather alerts";
  const what = he ? `התראות במייל על אזהרות מזג אוויר ביוון${strike ? " ועל שביתות שמשבשות מעבורות וטיסות" : ""}` : `email alerts about weather warnings in Greece${strike ? " and strikes disrupting ferries and flights" : ""}`;
  const html = `<!doctype html><html dir="${he ? "rtl" : "ltr"}" lang="${lang}"><body style="margin:0;background:#F3F6F9;font-family:Arial,Helvetica,sans-serif;color:#1B2A36"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px"><tr><td style="padding:28px;text-align:${al};font-size:16px;line-height:1.6">
<h1 style="font-size:22px;margin:0 0 12px;color:#0B3A5B">${he ? "כמעט סיימנו 👋" : "Almost done 👋"}</h1>
<p>${he ? "קיבלנו בקשה לשלוח לכתובת הזו" : "We received a request to send this address"} ${escHtml(what)}.</p>
<p>${he ? "כדי להפעיל את ההתראות, לחצו על הכפתור:" : "To turn the alerts on, tap the button:"}</p>
<p style="margin:24px 0"><a href="${escHtml(url)}" style="display:inline-block;background:#0B3A5B;color:#fff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:10px;font-size:16px">${he ? "אישור ההרשמה להתראות" : "Confirm my alerts"}</a></p>
<p style="font-size:13px;color:#5B6B78">${he ? "לא נרשמתם? פשוט התעלמו מהמייל הזה ולא תקבלו מאיתנו דבר. הקישור תקף ל-7 ימים." : "Didn't sign up? Just ignore this email and you won't hear from us. The link is valid for 7 days."}</p>
<p style="font-size:13px;color:#5B6B78">${he ? "יוונט" : "Yavanet"} · yavanet.gr</p></td></tr></table></td></tr></table></body></html>`;
  return { subject, html };
}
