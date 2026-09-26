// Καταγραφή συγκατάθεσης cookies (GDPR: απόδειξη συγκατάθεσης). Αποθηκεύεται ανώνυμα σε Cloudflare KV αν υπάρχει.
import { json, readBody, sameOrigin } from "../../lib/forms.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  if (!b) return json({ ok: false }, 400);
  const rec = { stats: !!b.stats, ads: !!b.ads, v: Number(b.v) || 1, at: new Date().toISOString(), country: request.cf?.country || "" };
  if (env.CONSENT_LOG) {
    const id = crypto.randomUUID();
    await env.CONSENT_LOG.put(`c:${rec.at}:${id}`, JSON.stringify(rec), { expirationTtl: 60 * 60 * 24 * 400 });
  }
  return json({ ok: true });
}
