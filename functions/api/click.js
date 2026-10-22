// Ειδοποίηση Telegram όταν κάποιος πατάει κουμπί WhatsApp: ποιο κουμπί, σε ποια σελίδα, από πού ήρθε ο επισκέπτης.
// Δεν αποθηκεύεται τίποτα για τον επισκέπτη (ούτε IP). Όριο: 40 ειδοποιήσεις την ώρα, για να μη γίνει spam.
import { json, clean, readBody, sameOrigin, telegram, withDefaults } from "../../lib/forms.js";

const SRC = { facebook: "Facebook", fb: "Facebook", google: "Google", instagram: "Instagram", whatsapp: "WhatsApp", newsletter: "Newsletter", alert: "Email ειδοποίησης", push: "Push ειδοποίηση", telegram: "Telegram" };
const BTN = { "wa-ask": "«Ρωτήστε μας στο WhatsApp» στο τέλος άρθρου", "wa-ask-footer": "WhatsApp στο κάτω μέρος της σελίδας", "wa-float": "πράσινο κουμπί κάτω δεξιά", wafloat: "πράσινο κουμπί κάτω δεξιά", "wa-spiros": "το όνομα του Σπύρου μέσα σε άρθρο", "wa-tlv": "«Στείλτε μας τον προϋπολογισμό» στη σύγκριση Τελ Αβίβ–Αθήνα", "wa-mid": "κουτάκι WhatsApp στη μέση του άρθρου", "wa-asi-medtour": "Airbnb κοντά σε νοσοκομεία", btn: "κουμπί μέσα στη σελίδα", "wa-area": "«Ψάχνετε διαμέρισμα;» στη σελίδα τιμών γειτονιάς" };
function btnText(b) { const k = String(b || "").split(" ")[0]; return (BTN[k] ? BTN[k] + " · " : "") + String(b || "").replace(/^\S+\s*/, ""); }
export function srcText(s) { return source(s); }
function source(s) {
  if (!s || typeof s !== "object") return "Άγνωστη";
  const src = clean(s.s, 60), med = clean(s.m, 60), camp = clean(s.c, 80), ref = clean(s.r, 120);
  let out = "";
  if (src) {
    out = SRC[src.toLowerCase()] || src;
    if (/paid|cpc|ads/i.test(med)) out += " (διαφήμιση)";
    else if (/group/i.test(med) || /groups/i.test(camp)) out += " (ομάδα)";
    else if (med) out += ` (${med})`;
    if (camp) out += ` · καμπάνια: ${camp}`;
  } else if (ref) {
    const h = ref.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\.|^m\.|^l\./, "");
    out = /facebook|fb\.com/.test(h) ? "Facebook" : /google\./.test(h) ? "Google (αναζήτηση)" : /bing\./.test(h) ? "Bing" : /instagram/.test(h) ? "Instagram" : h;
  } else out = "Απευθείας (χωρίς σύνδεσμο)";
  return out;
}

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  if (!b) return json({ ok: false }, 400);
  if (env.PUSH_KV) {
    const k = "clk:" + new Date().toISOString().slice(0, 13);
    const n = +((await env.PUSH_KV.get(k)) || 0);
    if (n >= 40) return json({ ok: true, limited: true });
    await env.PUSH_KV.put(k, String(n + 1), { expirationTtl: 7200 });
  }
  const ua = request.headers.get("user-agent") || "";
  const dev = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Άλλη";
  const s = b.src || {};
  const lines = [
    `📲 Πάτησε WhatsApp → ${clean(b.to, 60) || "?"}`,
    `Κουμπί: ${btnText(clean(b.btn, 80)) || "—"}`,
    b.listing ? `Ακίνητο: ${clean(b.listing, 20)} (https://yavanet.gr/nadlan/${clean(b.listing, 20)}/)` : "",
    `Σελίδα: ${clean(b.title, 120)}\nhttps://yavanet.gr${clean(b.page, 200)}`,
    `Από πού ήρθε: ${source(s)}`,
    s.l ? `Πρώτη σελίδα που είδε: ${clean(s.l, 200)}` : "",
    b.pv ? `Σελίδες που είδε: ${Math.min(+b.pv || 0, 999)}` : "",
    `Χώρα / πόλη: ${[request.cf?.country, request.cf?.city].filter(Boolean).join(" / ") || "—"} · ${dev} · ${b.lang === "en" ? "αγγλικά" : "εβραϊκά"}`,
    "Αν σου γράψει στο WhatsApp, θα έρθει σε λίγο.",
  ].filter(Boolean);
  try { await telegram(env, lines.join("\n")); } catch (e) { return json({ ok: false }, 502); }
  return json({ ok: true });
}
