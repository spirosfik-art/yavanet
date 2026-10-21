// Σύνδεσμος διαφήμισης: yavanet.gr/go/asi → WhatsApp του Asi Doron.
// Πριν την ανακατεύθυνση στέλνει ειδοποίηση Telegram στον Σπύρο (από ποια διαφήμιση, χώρα, συσκευή).
// Οι «ρομπότ» του Facebook/Instagram που φτιάχνουν προεπισκόπηση δεν μετράνε. Τίποτα δεν αποθηκεύεται για τον επισκέπτη.
import { clean, telegram, withDefaults } from "../../lib/forms.js";

const ASI_WA = "972546221414";
const MSG = "שלום אסי, ראיתי את המודעה על השקעה בדירה לתיירות רפואית באתונה ואשמח לקבל את המדריך המלא";
const BOT = /facebookexternalhit|facebot|meta-externalagent|instagram.*bot|bot|crawler|spider|preview|whatsapp\/|telegrambot|slackbot|curl|python/i;

export async function onRequestGet({ request, env: rawEnv, waitUntil }) {
  const env = withDefaults(rawEnv);
  const u = new URL(request.url);
  const wa = `https://wa.me/${ASI_WA}?text=${encodeURIComponent(MSG)}`;
  const ua = request.headers.get("user-agent") || "";
  if (!BOT.test(ua)) {
    let limited = false;
    if (env.PUSH_KV) {
      const k = "go:" + new Date().toISOString().slice(0, 13);
      const n = +((await env.PUSH_KV.get(k)) || 0);
      limited = n >= 60;
      if (!limited) await env.PUSH_KV.put(k, String(n + 1), { expirationTtl: 7200 });
    }
    if (!limited) {
      const dev = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Άλλη";
      const src = clean(u.searchParams.get("utm_source"), 40), med = clean(u.searchParams.get("utm_medium"), 40), camp = clean(u.searchParams.get("utm_campaign"), 80), ad = clean(u.searchParams.get("utm_content"), 80);
      const from = src ? `${/^(fb|facebook)$/i.test(src) ? "Facebook" : /^(ig|instagram)$/i.test(src) ? "Instagram" : src}${/paid|ads|cpc/i.test(med) ? " (διαφήμιση)" : med ? ` (${med})` : ""}${camp ? ` · καμπάνια: ${camp}` : ""}${ad ? ` · διαφήμιση: ${ad}` : ""}` : "Απευθείας σύνδεσμος";
      const text = [
        "📲 Πάτησε WhatsApp → Asi Doron (+972 54-622-1414)",
        "Κουμπί: διαφήμιση «Επένδυση για ιατρικό τουρισμό» (yavanet.gr/go/asi)",
        `Από πού ήρθε: ${from}`,
        `Χώρα / πόλη: ${[request.cf?.country, request.cf?.city].filter(Boolean).join(" / ") || "—"} · ${dev}`,
        "Το μήνυμα πάει κατευθείαν στον Asi.",
      ].join("\n");
      const p = telegram(env, text).catch(() => {});
      if (waitUntil) waitUntil(p); else await p;
    }
  }
  return new Response(null, { status: 302, headers: { location: wa, "cache-control": "no-store" } });
}
