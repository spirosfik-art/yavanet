// Εγγραφή στο newsletter με διπλή επιβεβαίωση (Brevo double opt-in)
import { json, clean, validEmail, readBody, sameOrigin, brevo } from "../../lib/forms.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const b = await readBody(request);
  if (!b) return json({ ok: false }, 400);
  if (b.website) return json({ ok: true }); // honeypot για bots
  const email = clean(b.email, 200).toLowerCase();
  const lang = b.lang === "en" ? "en" : "he";
  if (!validEmail(email) || !b.consent) return json({ ok: false, error: "invalid" }, 400);
  const list = Number(lang === "he" ? env.BREVO_NL_LIST_HE : env.BREVO_NL_LIST_EN);
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
