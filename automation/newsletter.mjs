// Newsletter: node automation/newsletter.mjs daily|weekly
// Daily «Kalimera από το Yavanet»: 8:00 ώρα Ισραήλ, 5 σημαντικότερα νέα.
// Weekly «Ακίνητα την εβδομάδα»: Κυριακή, νόμοι & ακίνητα.
import { env, log, loadArticles, brevo, israelHour, claude, hasAI, parseJSON, athensNow, notifyOwner, DRY } from "./lib.mjs";
import { NEWSLETTER_SYSTEM } from "./prompts.mjs";
import { SITE, SECTIONS } from "../site/config.mjs";

const kind = process.argv[2] || "daily";
if (!env.BREVO_API_KEY) { log("Το Brevo δεν έχει ρυθμιστεί ακόμα – παράλειψη."); process.exit(0); }
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const url = (a, lang) => SITE.url.replace(/\/$/, "") + (lang === "he" ? "" : "/en") + `/a/${a.slug}/?utm_source=newsletter&utm_medium=email&utm_campaign=${kind}`;

// Το GitHub τρέχει σε ώρα UTC· ελέγχουμε ότι είναι 8:00 στο Ισραήλ (θερινή/χειμερινή ώρα)
if (kind === "daily" && env.FORCE !== "1" && israelHour() !== 8) { log("όχι 8:00 Ισραήλ – παράλειψη"); process.exit(0); }

const all = loadArticles().filter((a) => !a.hidden && !a.sponsored).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const since = Date.now() - (kind === "daily" ? 26 : 7 * 24) * 3600e3;
let pool = all.filter((a) => Date.parse(a.publishedAt) > since);
if (kind === "weekly") pool = pool.filter((a) => a.section === "real-estate").concat(pool.filter((a) => a.section !== "real-estate"));
if (!pool.length) { log("δεν υπάρχουν νέα άρθρα"); process.exit(0); }

async function pickTop(list, n) {
  if (list.length <= n || !hasAI()) return list.slice(0, n);
  try {
    const out = parseJSON(await claude({ system: NEWSLETTER_SYSTEM, model: env.SELECT_MODEL || "claude-haiku-4-5-20251001", maxTokens: 500, temperature: 0, role: "select",
      prompt: `Pick the ${n} most important stories for Israelis interested in Greece (priority: Israelis in Greece, then government real-estate news, then the rest). Return {"slugs":[...]}.\n${list.map((a) => `${a.slug} | ${a.section} | ${a.en.title}`).join("\n")}` }));
    const chosen = out.slugs.map((s) => list.find((a) => a.slug === s)).filter(Boolean);
    return chosen.length ? chosen.slice(0, n) : list.slice(0, n);
  } catch { return list.slice(0, n); }
}

function html(lang, items, title) {
  const rtl = lang === "he";
  const sec = (s) => (SECTIONS.find((x) => x.slug === s) || {})[lang] || "";
  return `<!doctype html><html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}"><body style="margin:0;background:#F6F9FB;font-family:Arial,Helvetica,sans-serif;color:#0E1B26">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0B3A5B;padding:22px 24px;color:#fff;text-align:${rtl ? "right" : "left"}"><div style="font-family:Georgia,serif;font-size:30px;font-weight:bold">Yavan<span style="color:#F0B650">et</span></div><div style="font-size:15px;opacity:.9">${esc(title)}</div></td></tr>
${items.map((a) => `<tr><td style="padding:18px 24px;border-bottom:1px solid #D6E1E9;text-align:${rtl ? "right" : "left"}">
<div style="font-size:12px;font-weight:bold;color:#1C6E9C">${esc(sec(a.section))}</div>
<a href="${url(a, lang)}" style="display:block;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#0B3A5B;text-decoration:none;margin:4px 0">${esc(a[lang].title)}</a>
<div style="font-size:15px;color:#556777;line-height:1.5">${esc(a[lang].dek)}</div></td></tr>`).join("")}
<tr><td style="padding:18px 24px;font-size:12px;color:#556777;text-align:${rtl ? "right" : "left"}">${rtl ? "קיבלת את המייל כי נרשמת לניוזלטר של Yavanet." : "You receive this email because you subscribed to the Yavanet newsletter."} <a href="{{ unsubscribe }}" style="color:#1C6E9C">${rtl ? "ביטול הרשמה" : "Unsubscribe"}</a></td></tr>
</table></td></tr></table></body></html>`;
}

(async () => {
  const items = await pickTop(pool, kind === "daily" ? 5 : 6);
  const { date } = athensNow();
  const cfg = {
    he: { list: env.BREVO_NL_LIST_HE, subject: kind === "daily" ? `קלימרה מ-Yavanet · ${items[0].he.title}` : "נדל״ן השבוע ביוון · Yavanet", title: kind === "daily" ? "קלימרה! 5 החדשות החשובות מיוון היום" : "נדל״ן השבוע: חוקים, מחירים והזדמנויות" },
    en: { list: env.BREVO_NL_LIST_EN, subject: kind === "daily" ? `Kalimera from Yavanet · ${items[0].en.title}` : "Real estate this week in Greece · Yavanet", title: kind === "daily" ? "Kalimera! Today's 5 key stories from Greece" : "Real estate this week: laws, prices and opportunities" },
  };
  for (const lang of ["he", "en"]) {
    if (!cfg[lang].list) continue;
    const c = await brevo("/emailCampaigns", {
      name: `Yavanet ${kind} ${lang} ${date}`, subject: cfg[lang].subject.slice(0, 150), type: "classic",
      sender: { name: "Yavanet", email: env.SENDER_EMAIL }, recipients: { listIds: [Number(cfg[lang].list)] },
      htmlContent: html(lang, items, cfg[lang].title),
    });
    if (!DRY && c.id) await brevo(`/emailCampaigns/${c.id}/sendNow`, null);
    log("✓ newsletter", kind, lang);
  }
  await notifyOwner(`📧 Στάλθηκε το newsletter (${kind}) με ${items.length} θέματα.`);
})().catch(async (e) => { log("newsletter error", e.message); await notifyOwner("⚠️ Newsletter απέτυχε: " + e.message); process.exitCode = 1; });
