// Αναφορές: node automation/report.mjs daily|monthly
// daily: τι δημοσιεύτηκε, τι απορρίφθηκε και γιατί, τι περιμένει έγκριση, πηγές με πρόβλημα, νέες επαφές (Telegram + email)
// monthly: πόσες επαφές ήρθαν από το site, από ποια άρθρα, και πόσες έγιναν πελάτες (από το CRM του Brevo)
import { env, log, readJSON, STATE_FILE, brevo, sendEmail, notifyOwner, athensNow } from "./lib.mjs";
import { SITE } from "../site/config.mjs";

const kind = process.argv[2] || "daily";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function leadsSince(ms) {
  if (!env.BREVO_API_KEY || !env.BREVO_LEADS_LIST) return null;
  const out = []; let offset = 0;
  while (true) {
    const d = await brevo(`/contacts/lists/${env.BREVO_LEADS_LIST}/contacts?limit=500&offset=${offset}&modifiedSince=${encodeURIComponent(new Date(ms).toISOString())}`, null, "GET");
    out.push(...(d.contacts || []));
    if (!d.contacts || d.contacts.length < 500) break;
    offset += 500;
  }
  return out.filter((c) => Date.parse((c.attributes || {}).LEAD_AT || c.createdAt) >= ms);
}

(async () => {
  const s = readJSON(STATE_FILE, {});
  if (kind === "daily") {
    const t = s.today || { published: [], rejected: [], errors: [] };
    const leads = await leadsSince(Date.now() - 24 * 3600e3).catch(() => null);
    const bad = Object.entries(s.sourceStatus || {}).filter(([, v]) => !v.ok);
    const pend = Object.entries(s.pending || {});
    const txt = `📊 Yavanet – ${athensNow().date}
Δημοσιεύθηκαν: ${t.published.length}
${t.published.map((p) => `• ${p.title}`).join("\n")}
Απορρίφθηκαν: ${t.rejected.length}
${t.rejected.slice(-10).map((r) => `• ${r.title} → ${r.reason}`).join("\n")}
Σε αναμονή έγκρισης: ${pend.length}
Νέες επαφές (24ω): ${leads ? leads.length : "–"}
Πηγές με πρόβλημα: ${bad.map(([k]) => k).join(", ") || "καμία"}
Επισκεψιμότητα: https://analytics.google.com · Heatmaps: https://clarity.microsoft.com`;
    await notifyOwner(txt);
    await sendEmail(`Yavanet – ημερήσια αναφορά ${athensNow().date}`, `<pre style="font-family:Arial;font-size:14px;white-space:pre-wrap">${esc(txt)}</pre>`);
    log(txt);
  } else {
    const start = new Date(); start.setUTCDate(1); start.setUTCMonth(start.getUTCMonth() - 1); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(); end.setUTCDate(1); end.setUTCHours(0, 0, 0, 0);
    const leads = ((await leadsSince(start.getTime())) || []).filter((c) => Date.parse((c.attributes || {}).LEAD_AT || c.createdAt) < end.getTime());
    const by = (k) => leads.reduce((m, c) => { const v = (c.attributes || {})[k] || "–"; m[v] = (m[v] || 0) + 1; return m; }, {});
    const fmt = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `• ${k}: ${v}`).join("\n");
    const clients = leads.filter((c) => /πελάτης|client/i.test((c.attributes || {}).LEAD_STATUS || "")).length;
    const txt = `📈 Yavanet – επαφές ${start.toISOString().slice(0, 7)}
Σύνολο επαφών από το site: ${leads.length}
Έγιναν πελάτες: ${clients}
Ανά είδος:\n${fmt(by("LEAD_KIND"))}
Ανά κατάσταση:\n${fmt(by("LEAD_STATUS"))}
Από ποια σελίδα/άρθρο:\n${fmt(by("LEAD_SOURCE")).split("\n").slice(0, 15).join("\n")}
Χώρα:\n${fmt(by("COUNTRY"))}`;
    await notifyOwner(txt);
    await sendEmail(`Yavanet – μηνιαία αναφορά επαφών`, `<pre style="font-family:Arial;font-size:14px;white-space:pre-wrap">${esc(txt)}</pre><p><a href="${SITE.url}">${SITE.url}</a></p>`);
    log(txt);
  }
})().catch((e) => { log("report error", e.message); process.exitCode = 1; });
