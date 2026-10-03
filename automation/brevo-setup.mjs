// Ρύθμιση Brevo (τρέχει μετά από κάθε deploy, είναι ασφαλές να ξανατρέξει):
// 1) χαρακτηριστικά επαφών, 2) πρότυπα email διπλής επιβεβαίωσης (HE/EN), 3) μεταφορά εγγραφών από το Cloudflare KV.
// Ενεργό από 03.10.2026 (BREVO_API_KEY στο GitHub, συγχρονίζεται στο Cloudflare Pages με το deploy).
import { createHash } from "node:crypto";
import { env, log as log0, brevo, notifyOwner } from "./lib.mjs";
const report = [];
const log = (...a) => { log0(...a); report.push(a.join(" ")); };
process.on("beforeExit", async () => { const imp = report.filter((l) => !l.includes("χαρακτηριστικό") && !l.includes("(ενημερώθηκε)") && !/μεταφορά εγγραφών 200 .*"moved":0,"failed":0/.test(l)); if (imp.length && !globalThis.__sent) { globalThis.__sent = 1; await Promise.resolve().then(() => notifyOwner("⚙️ Brevo setup\n" + imp.join("\n"))).catch(() => {}); } });
process.on("uncaughtException", async (e) => { await Promise.resolve().then(() => notifyOwner("⚠️ Brevo setup σφάλμα: " + e.message)).catch(() => {}); process.exit(1); });
process.on("unhandledRejection", async (e) => { await Promise.resolve().then(() => notifyOwner("⚠️ Brevo setup σφάλμα: " + (e && e.message || e))).catch(() => {}); process.exit(1); });

if (!env.BREVO_API_KEY) { log("Brevo: δεν υπάρχει BREVO_API_KEY – παράλειψη."); process.exit(0); }

// 1) Χαρακτηριστικά επαφών (αν υπάρχουν ήδη, το Brevo απαντά σφάλμα που αγνοούμε)
for (const name of ["LANG", "SIGNUP_PAGE", "CONSENT_AT", "LEAD_KIND", "LEAD_SOURCE", "AREA", "BUDGET", "LEAD_STATUS", "COUNTRY", "LEAD_AT", "DOI_SENT", "STRIKE_ALERT", "TRIP_FROM", "TRIP_TO", "STRIKE_SENT"]) {
  try { await brevo(`/contacts/attributes/normal/${name}`, { type: "text" }); log("Brevo: χαρακτηριστικό", name); } catch (e) { }
}

// 2) Πρότυπα διπλής επιβεβαίωσης
const sender = { name: "Yavanet", email: env.SENDER_EMAIL };
const btn = (href, label) => `<a href="${href}" style="display:inline-block;background:#0B3A5B;color:#fff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:10px;font-size:16px">${label}</a>`;
const shell = (dir, body) => `<!doctype html><html dir="${dir}"><body style="margin:0;background:#F3F6F9;font-family:Arial,Helvetica,sans-serif;color:#1B2A36"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px"><tr><td style="padding:28px;text-align:${dir === "rtl" ? "right" : "left"};font-size:16px;line-height:1.6">${body}</td></tr></table></td></tr></table></body></html>`;
const TPL = {
  he: {
    name: "Yavanet DOI HE", subject: "יוונט · אשרו את ההרשמה לניוזלטר",
    html: shell("rtl", `<h1 style="font-size:22px;margin:0 0 12px;color:#0B3A5B">כמעט סיימנו 👋</h1><p>קיבלנו בקשה לרשום את הכתובת הזו לניוזלטר של יוונט: חדשות יוון בעברית, נדל״ן וטיולים.</p><p>כדי להשלים את ההרשמה, לחצו על הכפתור:</p><p style="margin:24px 0">${btn("{{ doubleoptin }}", "אישור ההרשמה")}</p><p style="font-size:13px;color:#5B6B78">לא נרשמתם? פשוט התעלמו מהמייל הזה ולא תקבלו מאיתנו דבר.</p><p style="font-size:13px;color:#5B6B78">יוונט · yavanet.gr</p>`),
  },
  en: {
    name: "Yavanet DOI EN", subject: "Yavanet · Please confirm your newsletter subscription",
    html: shell("ltr", `<h1 style="font-size:22px;margin:0 0 12px;color:#0B3A5B">Almost done 👋</h1><p>We received a request to subscribe this address to the Yavanet newsletter: Greece news for Israelis, property and travel.</p><p>To complete your subscription, tap the button:</p><p style="margin:24px 0">${btn("{{ doubleoptin }}", "Confirm subscription")}</p><p style="font-size:13px;color:#5B6B78">Didn't sign up? Just ignore this email and you won't hear from us.</p><p style="font-size:13px;color:#5B6B78">Yavanet · yavanet.gr</p>`),
  },
};
try {
const existing = (await brevo("/smtp/templates?limit=100&offset=0", null, "GET")).templates || [];
for (const [lang, t] of Object.entries(TPL)) {
  const found = existing.find((x) => x.name === t.name);
  const body = { templateName: t.name, subject: t.subject, sender, htmlContent: t.html, tag: "optin", isActive: true };
  if (found) { await brevo(`/smtp/templates/${found.id}`, body, "PUT"); log(`Brevo: πρότυπο ${t.name} = ${found.id} (ενημερώθηκε)`); }
  else { const r = await brevo("/smtp/templates", body); log(`Brevo: πρότυπο ${t.name} = ${r.id} (νέο)`); }
}
} catch (e) { log("Brevo: σφάλμα στα πρότυπα –", e.message); }

// 3) Μεταφορά εγγραφών από το Cloudflare KV στο Brevo
if (env.TELEGRAM_BOT_TOKEN) {
  const key = createHash("sha256").update("yavanet:nlmigrate:" + env.TELEGRAM_BOT_TOKEN.replace(/\s/g, "")).digest("hex").slice(0, 48);
  const base = (env.SITE_URL || "https://yavanet.gr").replace(/\/$/, "");
  try {
    const r = await fetch(base + "/api/nl-migrate", { method: "POST", headers: { "x-admin-secret": key } });
    log("Brevo: μεταφορά εγγραφών", r.status, (await r.text()).slice(0, 200));
  } catch (e) { log("Brevo: μεταφορά εγγραφών απέτυχε", e.message); }
}

// 4) Επανεπιβεβαίωση (double opt-in) για εγγραφές που μεταφέρθηκαν χωρίς επιβεβαίωση. Στέλνεται μία φορά (DOI_SENT).
const RECONFIRM = [{ email: "ondropship@gmail.com", lang: "he" }];
const SITE = (env.SITE_URL || "https://yavanet.gr").replace(/\/$/, "");
for (const { email, lang } of RECONFIRM) {
  try {
    const c = await brevo(`/contacts/${encodeURIComponent(email)}`, null, "GET").catch(() => null);
    if (c && c.attributes && c.attributes.DOI_SENT) continue;
    const list = Number(lang === "he" ? env.BREVO_NL_LIST_HE : env.BREVO_NL_LIST_EN);
    const tpl = (((await brevo("/smtp/templates?limit=100&offset=0", null, "GET")).templates) || []).find((t) => t.name === (lang === "he" ? "Yavanet DOI HE" : "Yavanet DOI EN"));
    if (!tpl) { log("Brevo: επανεπιβεβαίωση – δεν βρέθηκε πρότυπο"); continue; }
    if (c) await brevo(`/contacts/lists/${list}/contacts/remove`, { emails: [email] }).catch(() => {});
    await brevo("/contacts/doubleOptinConfirmation", { email, includeListIds: [list], templateId: tpl.id, redirectionUrl: SITE + (lang === "he" ? "/?subscribed=1" : "/en/?subscribed=1"), attributes: { LANG: lang } });
    await brevo(`/contacts/${encodeURIComponent(email)}`, { attributes: { DOI_SENT: new Date().toISOString() } }, "PUT").catch(() => {});
    log(`Brevo: στάλθηκε email επιβεβαίωσης στο ${email} (βγήκε από τη λίστα μέχρι να επιβεβαιώσει)`);
  } catch (e) { log(`Brevo: επανεπιβεβαίωση ${email} απέτυχε –`, e.message); }
}
