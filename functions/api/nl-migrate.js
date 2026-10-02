// Μεταφορά εγγραφών newsletter από το Cloudflare KV (nl:*) στις λίστες του Brevo.
// Μόνο για την αυτόματη ροή: απαιτεί κεφαλίδα x-admin-secret (παράγεται από το TELEGRAM_BOT_TOKEN).
import { json, brevo, withDefaults } from "../../lib/forms.js";

async function sha256hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  if (!env.TELEGRAM_BOT_TOKEN || !env.PUSH_KV || !env.BREVO_API_KEY) return json({ ok: false, error: "not-configured" }, 503);
  const key = (await sha256hex("yavanet:nlmigrate:" + env.TELEGRAM_BOT_TOKEN)).slice(0, 48);
  if (request.headers.get("x-admin-secret") !== key) return json({ ok: false }, 403);
  let moved = 0, failed = 0, cursor;
  do {
    const page = await env.PUSH_KV.list({ prefix: "nl:", cursor });
    for (const k of page.keys) {
      try {
        const rec = JSON.parse((await env.PUSH_KV.get(k.name)) || "null");
        if (!rec || !rec.email) { await env.PUSH_KV.delete(k.name); continue; }
        const list = Number(rec.lang === "en" ? env.BREVO_NL_LIST_EN : env.BREVO_NL_LIST_HE);
        // Έδωσαν ρητή συγκατάθεση στη φόρμα (consentAt): προστίθενται απευθείας στη λίστα
        await brevo(env, "/contacts", { email: rec.email, updateEnabled: true, listIds: [list], attributes: { LANG: rec.lang || "he", SIGNUP_PAGE: rec.page || "", CONSENT_AT: rec.consentAt || "" } });
        await env.PUSH_KV.put("nlm:" + rec.email, JSON.stringify({ ...rec, migratedAt: new Date().toISOString() }));
        await env.PUSH_KV.delete(k.name);
        moved++;
      } catch (e) { console.error(e.message); failed++; }
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return json({ ok: true, moved, failed });
}
