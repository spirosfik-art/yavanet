// Φόρμες επαφής: σύμβουλος ακινήτων, «Ρωτήστε τον ειδικό», αναφορά λάθους, γνώμη, διαφημιστές, επιχειρήσεις, GDPR.
// Κάθε επαφή μπαίνει στο CRM (λίστα επαφών Brevo) και ειδοποιεί αμέσως την εταιρεία με email και Telegram.
import { json, clean, validEmail, readBody, sameOrigin, brevo, telegram, escHtml, withDefaults } from "../../lib/forms.js";

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
  if (!validEmail(d.email) || !b.consent || !d.name) return json({ ok: false, error: "invalid" }, 400);

  const lines = [
    ["Είδος", KINDS[kind]], ["Όνομα", d.name], ["Email", d.email], ["Τηλέφωνο", d.phone], ["Περιοχή", d.area], ["Προϋπολογισμός", d.budget],
    ["Μήνυμα", d.message], ["Άρθρο", d.article], ["Σελίδα", d.page], ["Ήρθε από", d.referrer], ["Χώρα / πόλη", [d.country, d.city].filter(Boolean).join(" / ")], ["Γλώσσα", d.lang], ["Ώρα", d.at],
  ].filter(([, v]) => v);

  const jobs = [];
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
  if (kind === "asi-contact") {
    // Ο αριθμός δίνεται ΜΟΝΟ αφού αφήσει email και υπηρεσία (δεν υπάρχει μέσα στις σελίδες).
    const txt = d.lang === "he" ? `היי אסי, הגעתי מיוונט. אני מתעניין/ת ב: ${d.service}` : `Hi Asi, I found you on Yavanet. I'm interested in: ${d.service}`;
    return json({ ok: true, wa: `https://wa.me/${ASI.wa}?text=${encodeURIComponent(txt)}`, tel: ASI.tel });
  }
  return failed.length === res.length ? json({ ok: false }, 502) : json({ ok: true });
}
