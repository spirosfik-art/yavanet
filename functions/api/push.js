// Ειδοποιήσεις στο κινητό (Web Push) χωρίς εφαρμογή.
// Αποθήκευση εγγραφών στο Cloudflare KV (binding: PUSH_KV). Την αποστολή την κάνει η αυτόματη ροή (GitHub),
// που καλεί εδώ με μυστικό κλειδί για: λίστα εγγραφών, τελευταίο μήνυμα, δημόσιο κλειδί, διαγραφή ληγμένων.
// Οι ειδοποιήσεις στέλνονται «χωρίς περιεχόμενο»: ο service worker ζητά μετά το κείμενο από εδώ (?latest).
import { json, clean, readBody, sameOrigin } from "../../lib/forms.js";

async function sha256hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const idOf = async (endpoint) => "s:" + (await sha256hex(endpoint)).slice(0, 32);
const isAdmin = async (request, env) => env.TELEGRAM_BOT_TOKEN && request.headers.get("x-push-secret") === (await sha256hex("yavanet:push:" + env.TELEGRAM_BOT_TOKEN)).slice(0, 48);

export async function onRequestGet({ request, env }) {
  if (!env.PUSH_KV) return json({ ok: false, error: "not-configured" }, 503);
  const u = new URL(request.url);
  if (u.searchParams.has("key")) {
    const key = await env.PUSH_KV.get("vapid-public");
    return json({ ok: !!key, key });
  }
  if (u.searchParams.has("latest")) {
    const latest = JSON.parse((await env.PUSH_KV.get("latest")) || "null");
    if (!latest) return json({ ok: false });
    let lang = "he";
    const ep = u.searchParams.get("ep");
    if (ep) { const s = JSON.parse((await env.PUSH_KV.get(await idOf(ep))) || "null"); if (s && s.lang === "en") lang = "en"; }
    return new Response(JSON.stringify({ ok: true, ...latest[lang], tag: latest.tag }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
  return json({ ok: false }, 400);
}

export async function onRequestPost({ request, env }) {
  if (!env.PUSH_KV) return json({ ok: false, error: "not-configured" }, 503);
  const b = await readBody(request);
  if (!b) return json({ ok: false }, 400);

  // Ενέργειες διαχείρισης (μόνο η αυτόματη ροή)
  if (request.headers.get("x-push-secret")) {
    if (!(await isAdmin(request, env))) return json({ ok: false }, 403);
    if (b.action === "set-key") { await env.PUSH_KV.put("vapid-public", clean(b.key, 200)); return json({ ok: true }); }
    if (b.action === "set-latest") { await env.PUSH_KV.put("latest", JSON.stringify(b.message)); return json({ ok: true }); }
    if (b.action === "list") {
      const subs = []; let cursor;
      do {
        const r = await env.PUSH_KV.list({ prefix: "s:", cursor });
        for (const k of r.keys) { const v = await env.PUSH_KV.get(k.name); if (v) subs.push({ id: k.name, ...JSON.parse(v) }); }
        cursor = r.list_complete ? null : r.cursor;
      } while (cursor);
      return json({ ok: true, subs });
    }
    if (b.action === "remove") { for (const id of (b.ids || []).slice(0, 500)) await env.PUSH_KV.delete(String(id)); return json({ ok: true }); }
    return json({ ok: false }, 400);
  }

  // Εγγραφή / διαγραφή επισκέπτη
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const endpoint = clean(b.subscription && b.subscription.endpoint, 1000);
  if (!/^https:\/\//.test(endpoint)) return json({ ok: false }, 400);
  const id = await idOf(endpoint);
  if (b.action === "unsubscribe") { await env.PUSH_KV.delete(id); return json({ ok: true }); }
  const count = Number((await env.PUSH_KV.get("count")) || 0);
  if (!(await env.PUSH_KV.get(id))) await env.PUSH_KV.put("count", String(count + 1));
  await env.PUSH_KV.put(id, JSON.stringify({ endpoint, lang: b.lang === "en" ? "en" : "he", at: new Date().toISOString() }));
  return json({ ok: true });
}
