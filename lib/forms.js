// Κοινά βοηθήματα για τις φόρμες (Cloudflare Pages Functions)
export const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
export const clean = (v, max = 2000) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function readBody(request) {
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try { return await request.json(); } catch { return null; }
}

// Επιτρέπουμε αιτήματα μόνο από το δικό μας site
export function sameOrigin(request) {
  const o = request.headers.get("origin");
  if (!o) return true;
  return new URL(o).host === new URL(request.url).host;
}

// Προεπιλογές Brevo (μη μυστικές): λίστες, αποστολέας. Οι μεταβλητές περιβάλλοντος, αν υπάρχουν, έχουν προτεραιότητα.
export const BREVO_DEFAULTS = { BREVO_NL_LIST_HE: "3", BREVO_NL_LIST_EN: "4", BREVO_LEADS_LIST: "5", SENDER_EMAIL: "info@yavanet.gr", NOTIFY_EMAIL: "info@yavanet.gr" };
export function withDefaults(env) {
  const out = Object.assign({}, env);
  for (const [k, v] of Object.entries(BREVO_DEFAULTS)) if (!out[k]) out[k] = v;
  return out;
}
// Πρότυπο email διπλής επιβεβαίωσης: από μεταβλητή, αλλιώς αναζήτηση στο Brevo με το όνομα «Yavanet DOI HE/EN» (με cache στο KV)
export async function doiTemplate(env, lang) {
  const fromEnv = Number(lang === "he" ? env.BREVO_DOI_TEMPLATE_HE : env.BREVO_DOI_TEMPLATE_EN);
  if (fromEnv) return fromEnv;
  const name = lang === "he" ? "Yavanet DOI HE" : "Yavanet DOI EN";
  const ck = "brevo:tpl:" + lang;
  if (env.PUSH_KV) { const c = await env.PUSH_KV.get(ck); if (c) return Number(c); }
  const res = await brevo(env, "/smtp/templates?templateStatus=true&limit=100&offset=0", null, "GET");
  const t = ((res && res.templates) || []).find((x) => x.name === name);
  if (!t) throw new Error("Λείπει το πρότυπο " + name);
  if (env.PUSH_KV) await env.PUSH_KV.put(ck, String(t.id), { expirationTtl: 86400 });
  return t.id;
}

export async function brevo(env, path, body, method = "POST") {
  const r = await fetch("https://api.brevo.com/v3" + path, {
    method, headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok && r.status !== 204) throw new Error("Brevo " + r.status + " " + (await r.text()).slice(0, 300));
  return r.status === 204 ? null : r.json().catch(() => null);
}

export async function telegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_OWNER_CHAT_ID) throw new Error("Telegram δεν έχει ρυθμιστεί");
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_OWNER_CHAT_ID, text, disable_web_page_preview: true }),
  });
  if (!r.ok) throw new Error("Telegram " + r.status);
}

export const escHtml = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
