// as-is.gr: serves the static site and sends WhatsApp clicks and form leads to Spyros's Telegram via the Yavanet notifier.
const NOTIFY = "https://yavanet.gr/api/partner";
const dev = (ua) => /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Άλλη";
const cut = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, n);
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const sameSite = (req) => { const o = req.headers.get("origin"); return !o || new URL(o).host === new URL(req.url).host; };
const BOT = /bot|crawl|spider|preview|facebookexternalhit/i;

async function send(req, payload) {
  const ua = req.headers.get("user-agent") || "";
  const geo = [req.cf?.country, req.cf?.city].filter(Boolean).join(" / ") || "—";
  const r = await fetch(NOTIFY, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ site: "as-is.gr", geo, device: dev(ua), ...payload }) });
  return r.ok;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.hostname === "www.as-is.gr") { url.hostname = "as-is.gr"; return Response.redirect(url.toString(), 301); }
    if (req.method === "POST" && (url.pathname === "/api/click" || url.pathname === "/api/lead")) {
      if (!sameSite(req)) return json({ ok: false }, 403);
      let b; try { b = JSON.parse(await req.text()); } catch { return json({ ok: false }, 400); }
      if (BOT.test(req.headers.get("user-agent") || "")) return json({ ok: true });
      const s = b.src && typeof b.src === "object" ? { s: cut(b.src.s, 60), m: cut(b.src.m, 60), c: cut(b.src.c, 80), r: cut(b.src.r, 120), l: cut(b.src.l, 200) } : {};
      if (url.pathname === "/api/click") {
        ctx.waitUntil(send(req, { event: "whatsapp", btn: cut(b.btn, 40), page: cut(b.page, 200), src: s }).catch(() => {}));
        return json({ ok: true });
      }
      if (cut(b.website, 200)) return json({ ok: true }); // honeypot
      const name = cut(b.name, 80), phone = cut(b.phone, 40);
      if (!name || phone.replace(/\D/g, "").length < 7) return json({ ok: false }, 400);
      const ok = await send(req, { event: "lead", name, phone, goal: cut(b.goal, 80), msg: cut(b.msg, 800), page: cut(b.page, 200), src: s }).catch(() => false);
      return json({ ok }, ok ? 200 : 502);
    }
    return env.ASSETS.fetch(req);
  },
};
