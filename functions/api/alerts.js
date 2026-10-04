// Ειδοποιήσεις καιρού/απεργιών με email: επιβεβαίωση εγγραφής (double opt-in) και διαγραφή.
//   GET  /api/alerts?a=confirm&t=…  → μικρή σελίδα με κουμπί (τα «σκάνερ» των email ανοίγουν links με GET: δεν ενεργοποιούμε τίποτα με GET)
//   POST /api/alerts?a=confirm&t=…  → επαφή Brevo (χωρίς λίστα) με WX_ALERT=1, WX_REGIONS, WX_LEVEL, LANG (+ STRIKE_ALERT=1, STRIKE_MODE=all)
//   GET  /api/alerts?a=unsub&t=…    → σελίδα με κουμπί διαγραφής
//   POST /api/alerts?a=unsub&t=…    → WX_ALERT=0 (+ STRIKE_ALERT=0 αν ήταν STRIKE_MODE=all). Δέχεται και το one-click του List-Unsubscribe (RFC 8058).
import { json, brevo, telegram, withDefaults, escHtml } from "../../lib/forms.js";
import { readToken, cleanRegions, ALERT_REGIONS } from "../../lib/alerts.js";

const DAY = 864e5;
const T = {
  he: {
    dir: "rtl", confirmH: "אישור ההרשמה להתראות", confirmP: "לחצו על הכפתור כדי להתחיל לקבל התראות במייל.", confirmBtn: "כן, להפעיל התראות",
    unsubH: "הפסקת ההתראות במייל", unsubP: "לחצו על הכפתור כדי להפסיק לקבל מאיתנו התראות על מזג אוויר ושביתות.", unsubBtn: "להפסיק התראות",
    bad: "הקישור לא תקין או שפג תוקפו. אפשר להירשם שוב בעמוד אזהרות מזג האוויר.", err: "משהו השתבש, נסו שוב בעוד כמה דקות.", back: "לעמוד אזהרות מזג האוויר",
  },
  en: {
    dir: "ltr", confirmH: "Confirm your alerts", confirmP: "Tap the button to start receiving email alerts.", confirmBtn: "Yes, turn alerts on",
    unsubH: "Stop email alerts", unsubP: "Tap the button to stop receiving weather and strike alerts from us.", unsubBtn: "Stop alerts",
    bad: "This link is invalid or has expired. You can sign up again on the weather warnings page.", err: "Something went wrong, please try again in a few minutes.", back: "Weather warnings page",
  },
};
const hub = (lang) => (lang === "en" ? "/en/weather-warnings/" : "/weather-warnings/");
function page(lang, h, p, action = "", btn = "", status = 200) {
  const t = T[lang];
  const html = `<!doctype html><html lang="${lang}" dir="${t.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escHtml(h)} · Yavanet</title>
<style>body{margin:0;background:#F3F6F9;font:16px/1.6 Arial,Helvetica,sans-serif;color:#1B2A36}main{max-width:520px;margin:40px auto;padding:0 16px}.c{background:#fff;border-radius:14px;padding:24px}h1{font-size:22px;color:#0B3A5B;margin:0 0 10px}button{background:#0B3A5B;color:#fff;border:0;border-radius:10px;padding:14px 24px;font-size:16px;font-weight:700;cursor:pointer}a{color:#0B5A8C}@media (prefers-color-scheme:dark){body{background:#0E1B26;color:#E6EEF4}.c{background:#16283A}h1{color:#9CCBEA}a{color:#9CCBEA}}</style></head>
<body><main><div class="c"><h1>${escHtml(h)}</h1><p>${escHtml(p)}</p>${action ? `<form method="post" action="${escHtml(action)}"><button type="submit">${escHtml(btn)}</button></form>` : ""}<p style="font-size:14px;margin-top:18px"><a href="${hub(lang)}">${escHtml(t.back)}</a></p></div></main></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

async function parse(request, env) {
  const u = new URL(request.url), a = u.searchParams.get("a"), tok = u.searchParams.get("t");
  if (a === "confirm") return { a, d: await readToken(env, "confirm", tok, 7 * DAY), u };
  if (a === "unsub") return { a, d: await readToken(env, "unsub", tok), u };
  return { a: null, d: null, u };
}

export async function onRequestGet({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  const { a, d, u } = await parse(request, env);
  const lang = d && d.l === "en" ? "en" : "he", t = T[lang];
  if (!d) return page(lang, a === "unsub" ? t.unsubH : t.confirmH, t.bad, "", "", 400);
  return a === "confirm" ? page(lang, t.confirmH, t.confirmP, u.pathname + u.search, t.confirmBtn) : page(lang, t.unsubH, t.unsubP, u.pathname + u.search, t.unsubBtn);
}

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  const { a, d, u } = await parse(request, env);
  const lang = d && d.l === "en" ? "en" : "he", t = T[lang];
  if (!d || !d.e) return a ? page(lang, a === "unsub" ? t.unsubH : t.confirmH, t.bad, "", "", 400) : json({ ok: false }, 400);
  if (!env.BREVO_API_KEY) return page(lang, t.confirmH, t.err, "", "", 503);
  const now = new Date().toISOString();
  if (a === "confirm") {
    const regions = cleanRegions(d.r);
    if (!regions.length) return page(lang, t.confirmH, t.bad, "", "", 400);
    const attributes = { WX_ALERT: "1", WX_REGIONS: regions.join(","), WX_LEVEL: d.v === "all" ? "all" : "severe", LANG: lang, SIGNUP_PAGE: String(d.p || "").slice(0, 200), CONSENT_AT: d.at, ALERTS_CONFIRMED_AT: now };
    if (d.s) Object.assign(attributes, { STRIKE_ALERT: "1", STRIKE_MODE: "all" });
    try { await brevo(env, "/contacts", { email: d.e, updateEnabled: true, attributes }); }
    catch (e) { console.error(e.message); return page(lang, t.confirmH, t.err, "", "", 502); }
    const rn = regions.map((r) => (r === "all" ? "Όλη η Ελλάδα" : (ALERT_REGIONS.find((x) => x.id === r) || {}).en || r)).join(", ");
    try { await telegram(env, `✅ Επιβεβαίωσε ειδοποιήσεις καιρού (${lang}): ${d.e}\nΠεριοχές: ${rn} · ${attributes.WX_LEVEL === "all" ? "όλα τα επίπεδα" : "πορτοκαλί + κόκκινο"}${d.s ? " · + απεργίες" : ""}`); } catch (e) { }
    return Response.redirect(new URL(hub(lang) + "?alerts=confirmed", u).toString(), 303);
  }
  // Διαγραφή: ποτέ δεν αγγίζουμε λίστες newsletter. Οι απεργίες σβήνουν μόνο αν μπήκαν από αυτή τη φόρμα (STRIKE_MODE=all).
  try {
    let strikeAll = false;
    try { const c = await brevo(env, `/contacts/${encodeURIComponent(d.e)}`, null, "GET"); strikeAll = !!(c && c.attributes && c.attributes.STRIKE_MODE === "all"); } catch (e) { }
    await brevo(env, `/contacts/${encodeURIComponent(d.e)}`, { attributes: { WX_ALERT: "0", ...(strikeAll ? { STRIKE_ALERT: "0", STRIKE_MODE: "" } : {}), ALERTS_UNSUB_AT: now } }, "PUT");
  } catch (e) { console.error(e.message); if (!/404/.test(e.message)) return page(lang, t.unsubH, t.err, "", "", 502); }
  try { await telegram(env, `🔕 Διαγραφή από ειδοποιήσεις καιρού/απεργιών: ${d.e}`); } catch (e) { }
  // One-click (RFC 8058) από το πρόγραμμα email: αρκεί 200
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("form") && (await request.clone().text()).includes("List-Unsubscribe=One-Click")) return json({ ok: true });
  return Response.redirect(new URL(hub(lang) + "?alerts=off", u).toString(), 303);
}
