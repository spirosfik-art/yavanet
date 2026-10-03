// Εγγραφή στο newsletter με διπλή επιβεβαίωση (Brevo double opt-in)
import { json, clean, validEmail, readBody, sameOrigin, brevo, telegram, withDefaults, doiTemplate } from "../../lib/forms.js";
import { welcomeToken } from "../../lib/welcome.js";

export async function onRequestPost({ request, env: rawEnv }) {
  const env = withDefaults(rawEnv);
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  if (!b) return json({ ok: false }, 400);
  if (b.website) return json({ ok: true }); // honeypot για bots
  const email = clean(b.email, 200).toLowerCase();
  const lang = b.lang === "en" ? "en" : "he";
  if (!validEmail(email) || !b.consent) return json({ ok: false, error: "invalid" }, 400);
  const list = Number(lang === "he" ? env.BREVO_NL_LIST_HE : env.BREVO_NL_LIST_EN);
  // Αποθήκευση στο Cloudflare KV (όταν δεν υπάρχει Brevo ή αν το Brevo αποτύχει) – μεταφέρονται αργότερα με το /api/nl-migrate
  const keep = async () => {
    if (!env.PUSH_KV) return json({ ok: false }, 503);
    const key = "nl:" + email;
    const isNew = !(await env.PUSH_KV.get(key));
    await env.PUSH_KV.put(key, JSON.stringify({ email, lang, page: clean(b.page, 200), source: clean(b.source, 40), consentAt: new Date().toISOString() }));
    if (isNew) { try { await telegram(env, `📬 Νέα εγγραφή στο newsletter (${lang})${b.source ? " · " + clean(b.source, 40) : ""}: ${email}`); } catch (e) { } }
    return json({ ok: true, direct: true });
  };
  if (!env.BREVO_API_KEY || !list) return keep();
  try {
    await brevo(env, "/contacts/doubleOptinConfirmation", {
      email,
      includeListIds: [list],
      templateId: await doiTemplate(env, lang),
      redirectionUrl: new URL((lang === "he" ? "/?subscribed=1&w=" : "/en/?subscribed=1&w=") + encodeURIComponent(await welcomeToken(env, email, lang)), request.url).toString(),
      attributes: { LANG: lang, SIGNUP_PAGE: clean(b.page, 200), CONSENT_AT: new Date().toISOString() },
    });
    try { await telegram(env, `📬 Νέα εγγραφή στο newsletter (${lang})${b.source ? " · " + clean(b.source, 40) : ""}: ${email}\n(στάλθηκε email επιβεβαίωσης – μπαίνει στη λίστα όταν το πατήσει)`); } catch (e) { }
    return json({ ok: true });
  } catch (e) {
    console.error(e.message);
    return keep();
  }
}
