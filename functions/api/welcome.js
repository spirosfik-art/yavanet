// Email καλωσορίσματος: στέλνεται μία φορά, αφού ο συνδρομητής επιβεβαιώσει (double opt-in) και γυρίσει στο site.
import { json, readBody, sameOrigin, brevo, telegram, withDefaults, escHtml } from "../../lib/forms.js";
import { readWelcomeToken } from "../../lib/welcome.js";

const SITE = "https://yavanet.gr";
const WA = "https://wa.me/306906723676";
const T = {
  he: {
    subject: "ברוכים הבאים ליוונט 🇬🇷 + המתנה שלכם",
    hi: "ברוכים הבאים ליוונט!", intro: "תודה שהצטרפתם. מעכשיו תקבלו מאיתנו את מה שחשוב לדעת על יוון – בעברית.",
    gift: "🎁 המתנה שלכם: המדריך המלא לקניית דירה ביוון (PDF)", giftBtn: "להורדת המדריך",
    what: "מה תקבלו מאיתנו", plan: ["כל בוקר ב-8:00: חמש החדשות החשובות מיוון", "בכל יום ראשון: נדל״ן השבוע – חוקים, מחירים והזדמנויות"],
    best: "הכי שימושי באתר",
    links: [["📰 חדשות יוון ושביתות היום", "/strike-today/"], ["🏠 מחירי דירות לפי שכונה", "/madad/"], ["🛂 שאלון ויזת זהב", "/golden-visa-quiz/"], ["🕍 זמני שבת וכשרות", "/shabbat/"], ["👨‍👩‍👧 אתונה עם ילדים", "/a/athens-with-kids-family-activities-guide/"], ["🗣️ שיחון יוונית עם הקראה", "/phrasebook/"]],
    q: "יש לכם שאלה על יוון?", qBtn: "כתבו לנו בוואטסאפ", sign: "צוות יוונט · yavanet.gr", dir: "rtl",
  },
  en: {
    subject: "Welcome to Yavanet 🇬🇷 + your gift",
    hi: "Welcome to Yavanet!", intro: "Thanks for joining. From now on you'll get what matters about Greece, straight to your inbox.",
    gift: "🎁 Your gift: the complete guide to buying property in Greece (PDF)", giftBtn: "Download the guide",
    what: "What you'll get", plan: ["Every morning at 8:00: the five key stories from Greece", "Every Sunday: real estate this week – laws, prices and opportunities"],
    best: "Most useful on the site",
    links: [["📰 Greece news & today's strikes", "/en/strike-today/"], ["🏠 Athens prices by neighbourhood", "/en/madad/"], ["🛂 Golden Visa quiz", "/en/golden-visa-quiz/"], ["🕍 Shabbat times & kosher", "/en/shabbat/"], ["👨‍👩‍👧 Athens with kids", "/en/a/athens-with-kids-family-activities-guide/"], ["🗣️ Greek phrasebook with audio", "/en/phrasebook/"]],
    q: "Got a question about Greece?", qBtn: "WhatsApp us", sign: "The Yavanet team · yavanet.gr", dir: "ltr",
  },
};
const utm = (u) => SITE + u + (u.includes("?") ? "&" : "?") + "utm_source=newsletter&utm_medium=email&utm_campaign=welcome";
function html(lang) {
  const t = T[lang], al = t.dir === "rtl" ? "right" : "left";
  const btn = (href, label, bg) => `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${escHtml(label)}</a>`;
  return `<!doctype html><html dir="${t.dir}"><body style="margin:0;background:#F3F6F9;font-family:Arial,Helvetica,sans-serif;color:#1B2A36"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px"><tr><td style="padding:26px;text-align:${al};font-size:16px;line-height:1.6">
<h1 style="font-size:22px;margin:0 0 10px;color:#0B3A5B">${escHtml(t.hi)} 👋</h1><p>${escHtml(t.intro)}</p>
<div style="background:#FFF6E5;border-radius:12px;padding:16px;margin:18px 0"><b>${escHtml(t.gift)}</b><p style="margin:12px 0 0">${btn(utm(`/yavanet-guide-buying-property-${lang}.pdf`), t.giftBtn, "#C9862B")}</p></div>
<h2 style="font-size:18px;color:#0B3A5B;margin:18px 0 6px">${escHtml(t.what)}</h2><ul style="padding-${al}:18px;margin:0">${t.plan.map((x) => `<li>${escHtml(x)}</li>`).join("")}</ul>
<h2 style="font-size:18px;color:#0B3A5B;margin:18px 0 6px">${escHtml(t.best)}</h2>${t.links.map(([l, u]) => `<p style="margin:6px 0"><a href="${utm(u)}" style="color:#0B5A8C">${escHtml(l)}</a></p>`).join("")}
<div style="background:#EAF8EF;border-radius:12px;padding:16px;margin:20px 0 6px"><b>${escHtml(t.q)}</b><p style="margin:10px 0 0">${btn(WA, t.qBtn, "#25D366")}</p></div>
<p style="font-size:13px;color:#5B6B78;margin-top:18px">${escHtml(t.sign)}</p></td></tr></table></td></tr></table></body></html>`;
}

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  const who = b && (await readWelcomeToken(env, b.w));
  if (!who) return json({ ok: false }, 400);
  const key = "welcome:" + who.email;
  if (env.PUSH_KV && (await env.PUSH_KV.get(key))) return json({ ok: true, already: true });
  if (!env.BREVO_API_KEY) return json({ ok: false }, 503);
  await brevo(env, "/smtp/email", {
    sender: { email: env.SENDER_EMAIL, name: who.lang === "he" ? "יוונט" : "Yavanet" }, to: [{ email: who.email }],
    subject: T[who.lang].subject, htmlContent: html(who.lang), tags: ["welcome"],
  });
  if (env.PUSH_KV) await env.PUSH_KV.put(key, new Date().toISOString());
  try { await telegram(env, `✅ Επιβεβαίωσε την εγγραφή στο newsletter (${who.lang}): ${who.email}\n(στάλθηκε email καλωσορίσματος)`); } catch (e) { }
  return json({ ok: true });
}
