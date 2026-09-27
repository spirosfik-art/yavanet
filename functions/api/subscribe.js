// Εγγραφή στο newsletter με διπλή επιβεβαίωση (Brevo double opt-in)
import { json, clean, validEmail, readBody, sameOrigin, brevo, telegram } from "../../lib/forms.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  if (!b) return json({ ok: false }, 400);
  if (b.website) return json({ ok: true }); // honeypot για bots
  const email = clean(b.email, 200).toLowerCase();
  const lang = b.lang === "en" ? "en" : "he";
  if (!validEmail(email) || !b.consent) return json({ ok: false, error: "invalid" }, 400);
  const list = Number(lang === "he" ? env.BREVO_NL_LIST_HE : env.BREVO_NL_LIST_EN);
  // Χωρίς Brevo ακόμα: κρατάμε την εγγραφή στο Cloudflare KV (για μεταφορά στο Brevo αργότερα) και ειδοποιούμε τον ιδιοκτήτη
  if (!env.BREVO_API_KEY || !list) {
    if (!env.PUSH_KV) return json({ ok: false }, 503);
    const key = "nl:" + email;
    const isNew = !(await env.PUSH_KV.get(key));
    await env.PUSH_KV.put(key, JSON.stringify({ email, lang, page: clean(b.page, 200), source: clean(b.source, 40), consentAt: new Date().toISOString() }));
    if (isNew) { try { await telegram(env, `📬 Νέα εγγραφή στο newsletter (${lang})${b.source ? " · " + clean(b.source, 40) : ""}: ${email}`); } catch (e) { } }
    return json({ ok: true, direct: true });
  }
  try {
    await brevo(env, "/contacts/doubleOptinConfirmation", {
      email,
      includeListIds: [list],
      templateId: Number(lang === "he" ? env.BREVO_DOI_TEMPLATE_HE : env.BREVO_DOI_TEMPLATE_EN),
      redirectionUrl: new URL(lang === "he" ? "/?subscribed=1" : "/en/?subscribed=1", request.url).toString(),
      attributes: { LANG: lang, SIGNUP_PAGE: clean(b.page, 200), CONSENT_AT: new Date().toISOString() },
    });
    return json({ ok: true });
  } catch (e) {
    console.error(e.message);
    return json({ ok: false }, 502);
  }
}
