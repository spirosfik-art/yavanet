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

export async function brevo(env, path, body, method = "POST") {
  const r = await fetch("https://api.brevo.com/v3" + path, {
    method, headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok && r.status !== 204) throw new Error("Brevo " + r.status + " " + (await r.text()).slice(0, 300));
  return r.status === 204 ? null : r.json().catch(() => null);
}

export async function telegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_OWNER_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_OWNER_CHAT_ID, text, disable_web_page_preview: true }),
  }).catch(() => {});
}

export const escHtml = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
