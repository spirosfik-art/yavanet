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

// Επισκέπτες από το Cloudflare Web Analytics (μετράει όλους, χωρίς cookies). Χρειάζεται token μόνο-ανάγνωσης.
async function traffic(hours = 24) {
  const token = (env.CLOUDFLARE_ANALYTICS_TOKEN || "").trim();
  const acc = (env.CLOUDFLARE_ACCOUNT_ID || "308ac8a2b91936b2e0985d38cddcb260").trim();
  const site = (env.CF_WA_SITE_TAG || "b9ab4561444f463a8a3206f744e69799").trim();
  if (!token) return null;
  const to = new Date(), from = new Date(to - hours * 3600e3), prev = new Date(from - hours * 3600e3);
  const f = (a, b) => `{siteTag: "${site}", datetime_geq: "${a.toISOString()}", datetime_lt: "${b.toISOString()}"}`;
  const q = `{ viewer { accounts(filter: {accountTag: "${acc}"}) {
    now: rumPageloadEventsAdaptiveGroups(limit: 1, filter: ${f(from, to)}) { count sum { visits } }
    before: rumPageloadEventsAdaptiveGroups(limit: 1, filter: ${f(prev, from)}) { count sum { visits } }
    countries: rumPageloadEventsAdaptiveGroups(limit: 8, filter: ${f(from, to)}, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { countryName } }
    pages: rumPageloadEventsAdaptiveGroups(limit: 10, filter: ${f(from, to)}, orderBy: [count_DESC]) { count dimensions { requestPath } }
    refs: rumPageloadEventsAdaptiveGroups(limit: 6, filter: ${f(from, to)}, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { refererHost } }
  } } }`;
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ query: q }), signal: AbortSignal.timeout(30000) });
  const d = await r.json();
  if (d.errors?.length) throw new Error(d.errors.map((e) => e.message).join("; "));
  const a = d.data.viewer.accounts[0] || {};
  const tot = (x) => ({ views: x?.[0]?.count || 0, visits: x?.[0]?.sum?.visits || 0 });
  const dec = (p) => { try { return decodeURIComponent(p); } catch { return p; } };
  const host = (h) => !h || /yavanet/.test(h) ? "απευθείας / εσωτερικά" : h;
  const refs = {};
  for (const x of a.refs || []) { const k = host(x.dimensions.refererHost); refs[k] = (refs[k] || 0) + x.sum.visits; }
  return {
    now: tot(a.now), before: tot(a.before),
    countries: (a.countries || []).map((x) => { const c = x.dimensions.countryName || ""; const fl = /^[A-Z]{2}$/.test(c) ? String.fromCodePoint(...[...c].map((ch) => 0x1f1a5 + ch.charCodeAt(0))) : ""; return `${fl}${c || "–"} ${x.sum.visits}`; }),
    pages: (a.pages || []).map((x) => `• ${dec(x.dimensions.requestPath).slice(0, 70)} (${x.count})`),
    refs: Object.entries(refs).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`),
  };
}

(async () => {
  const s = readJSON(STATE_FILE, {});
  if (kind === "stats") {
    // Μόνο νούμερα επισκεψιμότητας στο log (χωρίς Telegram/email), για γρήγορο έλεγχο
    const tr = await traffic();
    log(JSON.stringify(tr, null, 1));
    return;
  }
  if (kind === "weekly") {
    // Εβδομαδιαία σύνοψη (κάθε Δευτέρα): 7 ημέρες σε σύγκριση με τις προηγούμενες 7
    let tr = null, trErr = "";
    try { tr = await traffic(24 * 7); } catch (e) { trErr = e.message; }
    const leads = await leadsSince(Date.now() - 7 * 86400e3).catch(() => null);
    const pct = (a, b) => (b ? ` (${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}% από την προηγούμενη εβδομάδα)` : "");
    const fs = await import("node:fs");
    const since = Date.now() - 7 * 86400e3;
    const pub = fs.readdirSync(new URL("../content/articles/", import.meta.url)).map((f) => { try { return JSON.parse(fs.readFileSync(new URL("../content/articles/" + f, import.meta.url))); } catch { return null; } }).filter((a) => a && Date.parse(a.publishedAt) >= since);
    const byKind = (leads || []).reduce((m, c) => { const k = (c.attributes || {}).LEAD_KIND || "–"; m[k] = (m[k] || 0) + 1; return m; }, {});
    const txt = `🗓️ Yavanet – εβδομαδιαία αναφορά (έως ${athensNow().date})

${tr ? `👥 Επισκέψεις: ${tr.now.visits}${pct(tr.now.visits, tr.before.visits)}
📄 Προβολές σελίδων: ${tr.now.views}${pct(tr.now.views, tr.before.views)}
🌍 Χώρες: ${tr.countries.join(" · ") || "–"}
🔗 Από πού ήρθαν: ${tr.refs.join(" · ") || "–"}
🔝 Κορυφαίες σελίδες:
${tr.pages.join("\n") || "–"}` : `👥 Επισκέψεις: ${trErr ? "σφάλμα Cloudflare – " + trErr.slice(0, 120) : "λείπει το CLOUDFLARE_ANALYTICS_TOKEN"}`}

📨 Νέες επαφές: ${leads ? leads.length : "–"}${Object.keys(byKind).length ? "\n" + Object.entries(byKind).map(([k, v]) => `• ${k}: ${v}`).join("\n") : ""}
📰 Νέα άρθρα: ${pub.length} (οδηγοί: ${pub.filter((a) => a.guide || /^eg-/.test(String(a.meta?.itemId || ""))).length})

Λεπτομέρειες: https://analytics.google.com · https://search.google.com/search-console · https://clarity.microsoft.com`;
    await notifyOwner(txt);
    await sendEmail(`Yavanet – εβδομαδιαία αναφορά ${athensNow().date}`, `<pre style="font-family:Arial;font-size:14px;white-space:pre-wrap">${esc(txt)}</pre>`);
    log(txt);
    return;
  }
  if (kind === "daily") {
    const t = s.today || { published: [], rejected: [], errors: [] };
    const leads = await leadsSince(Date.now() - 24 * 3600e3).catch(() => null);
    const bad = Object.entries(s.sourceStatus || {}).filter(([, v]) => !v.ok);
    const pend = Object.entries(s.pending || {});
    let tr = null, trErr = "";
    try { tr = await traffic(); } catch (e) { trErr = e.message; log("traffic error", e.message); }
    const diff = (a, b) => (b ? ` (${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}% από χθες)` : "");
    const trTxt = tr
      ? `👥 Επισκέψεις (24ω): ${tr.now.visits}${diff(tr.now.visits, tr.before.visits)}
📄 Προβολές σελίδων: ${tr.now.views}
🌍 Χώρες: ${tr.countries.join(" · ") || "–"}
🔗 Από πού ήρθαν: ${tr.refs.join(" · ") || "–"}
🔝 Κορυφαίες σελίδες:
${tr.pages.join("\n") || "–"}`
      : `👥 Επισκέψεις: ${trErr ? "σφάλμα Cloudflare – " + trErr.slice(0, 120) : "λείπει το CLOUDFLARE_ANALYTICS_TOKEN"}`;
    const txt = `📊 Yavanet – ${athensNow().date}
Δημοσιεύθηκαν: ${t.published.length}
${t.published.map((p) => `• ${p.title}`).join("\n")}
Απορρίφθηκαν: ${t.rejected.length}
${t.rejected.slice(-10).map((r) => `• ${r.title} → ${r.reason}`).join("\n")}
Σε αναμονή έγκρισης: ${pend.length}
Νέες επαφές (24ω): ${leads ? leads.length : "–"}
Πηγές με πρόβλημα: ${bad.map(([k]) => k).join(", ") || "καμία"}

${trTxt}

Λεπτομέρειες: https://analytics.google.com · Heatmaps: https://clarity.microsoft.com`;
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
