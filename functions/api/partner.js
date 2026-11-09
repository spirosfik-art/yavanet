// Ειδοποιήσεις Telegram για συνεργαζόμενα sites (π.χ. as-is.gr του Άσι): πατήματα WhatsApp και φόρμες.
// Το site-συνεργάτης στέλνει από τον δικό του server τα στοιχεία· εδώ μόνο μορφοποιούνται και πάνε στο Telegram.
import { json, clean, readBody, telegram, withDefaults } from "../../lib/forms.js";
import { srcText } from "./click.js";

const SITES = { "as-is.gr": "AS-IS (Άσι)" };
const BTN = { header: "WhatsApp στο πάνω μενού", hero: "WhatsApp στην κορυφή", cta: "«Στείλτε μήνυμα στο WhatsApp» στο τέλος σελίδας", footer: "WhatsApp στο κάτω μέρος", float: "πράσινο κουμπί κάτω γωνία", contact: "WhatsApp στη σελίδα Επικοινωνίας", project: "Airbnb κοντά σε νοσοκομεία", meet: "κλείστε συνάντηση" };

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  const b = await readBody(request);
  const site = clean(b && b.site, 40);
  if (!b || !SITES[site]) return json({ ok: false }, 400);
  if (env.PUSH_KV) {
    const k = "prt:" + site + ":" + new Date().toISOString().slice(0, 13);
    const n = +((await env.PUSH_KV.get(k)) || 0);
    if (n >= 40) return json({ ok: true, limited: true });
    await env.PUSH_KV.put(k, String(n + 1), { expirationTtl: 7200 });
  }
  const page = clean(b.page, 200) || "/";
  const lang = /^\/en(\/|$)/.test(page) ? "αγγλικά" : "εβραϊκά";
  const where = `Χώρα / πόλη: ${clean(b.geo, 80) || "—"} · ${clean(b.device, 30) || "—"} · ${lang}`;
  const url = `https://${site}${page}`;
  let lines;
  if (b.event === "lead") {
    lines = [`📝 Νέα φόρμα στο ${SITES[site]}`, `Όνομα: ${clean(b.name, 80)}`, `Τηλέφωνο: ${clean(b.phone, 40)}`, `Θέλει: ${clean(b.goal, 80) || "—"}`, b.msg ? `Μήνυμα: ${clean(b.msg, 800)}` : "", `Σελίδα: ${url}`, `Από πού ήρθε: ${srcText(b.src)}`, where];
  } else {
    const k = clean(b.btn, 40);
    lines = [`📲 Πάτησε WhatsApp στο ${SITES[site]}`, `Κουμπί: ${BTN[k] || k || "—"}`, `Σελίδα: ${url}`, `Από πού ήρθε: ${srcText(b.src)}`, b.src && b.src.l ? `Πρώτη σελίδα που είδε: ${clean(b.src.l, 200)}` : "", where, "Αν σου γράψει στο WhatsApp, θα έρθει σε λίγο."];
  }
  try { await telegram(env, lines.filter(Boolean).join("\n")); } catch (e) { return json({ ok: false }, 502); }
  return json({ ok: true });
}
