// Απευθείας σύνδεση με Meta Graph API (Instagram + σελίδα Facebook), χωρίς Make.
// Εντολές:
//   node automation/meta.mjs check                 → ελέγχει το κλειδί και δείχνει σελίδα/IG
//   node automation/meta.mjs story <image_url>     → story σε IG + FB
//   node automation/meta.mjs reel-scenes <dir>     → φτιάχνει τις σκηνές HTML του ημερήσιου reel
//   node automation/meta.mjs reel-publish <mp4>    → ανεβάζει το reel σε IG + FB
//   node automation/meta.mjs comments              → απαντά σε σχόλια με λέξεις-κλειδιά
// Μυστικό: META_TOKEN (system-user token με τα δικαιώματα της σελίδας/IG). Προαιρετικά FB_PAGE_ID.
import fs from "node:fs";
import path from "node:path";
import { ROOT, env, log, loadArticles, notifyOwner } from "./lib.mjs";

const V = env.META_GRAPH_VERSION || "v23.0";
const G = `https://graph.facebook.com/${V}`;
const WA = "https://wa.me/306906723676";
const SITE = (env.SITE_URL || "https://yavanet.gr").replace(/\/$/, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(p, { method = "GET", token, params = {} } = {}) {
  const u = new URL(p.startsWith("http") ? p : G + p);
  const body = new URLSearchParams({ ...params, access_token: token });
  const r = method === "GET" ? await fetch(u + (u.search ? "&" : "?") + body) : await fetch(u, { method, body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${p}: ${(j.error && j.error.message) || r.status}`);
  return j;
}

// Από το system-user token βρίσκουμε το token της σελίδας και τον λογαριασμό Instagram
let ctxCache;
export async function ctx() {
  if (ctxCache) return ctxCache;
  if (!env.META_TOKEN) throw new Error("λείπει το META_TOKEN");
  const acc = await api("/me/accounts", { token: env.META_TOKEN, params: { fields: "id,name,access_token,instagram_business_account{id,username}", limit: "50" } });
  const pages = acc.data || [];
  const page = pages.find((p) => p.id === env.FB_PAGE_ID) || pages.find((p) => /yavanet|יוונט/i.test(p.name)) || pages[0];
  if (!page) throw new Error("το κλειδί δεν βλέπει καμία σελίδα (δώσε πρόσβαση στη σελίδα Yavanet στον system user)");
  const ig = page.instagram_business_account;
  ctxCache = { pageId: page.id, pageName: page.name, pageToken: page.access_token, igId: ig && ig.id, igUser: ig && ig.username, userToken: env.META_TOKEN };
  return ctxCache;
}

async function waitReady(id, token, maxMin = 8) {
  for (let i = 0; i < maxMin * 6; i++) {
    const s = await api(`/${id}`, { token, params: { fields: "status_code,status" } });
    if (s.status_code === "FINISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error("container " + s.status_code + " " + (s.status || ""));
    await sleep(10000);
  }
  throw new Error("container timeout");
}

// ---------- Stories ----------
export async function postStory(imageUrl) {
  const c = await ctx();
  const out = [];
  if (c.igId) {
    try {
      const m = await api(`/${c.igId}/media`, { method: "POST", token: c.userToken, params: { image_url: imageUrl, media_type: "STORIES" } });
      await waitReady(m.id, c.userToken, 3);
      await api(`/${c.igId}/media_publish`, { method: "POST", token: c.userToken, params: { creation_id: m.id } });
      out.push("IG story ✓");
    } catch (e) { out.push("IG story ✗ " + e.message); }
  }
  try {
    const ph = await api(`/${c.pageId}/photos`, { method: "POST", token: c.pageToken, params: { url: imageUrl, published: "false" } });
    await api(`/${c.pageId}/photo_stories`, { method: "POST", token: c.pageToken, params: { photo_id: ph.id } });
    out.push("FB story ✓");
  } catch (e) { out.push("FB story ✗ " + e.message); }
  log("story:", out.join(" · "));
  return out;
}

// ---------- Ημερήσιο reel ----------
const ICON = () => fs.readFileSync(path.join(ROOT, "site/assets/icon.svg"), "utf8");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const KICK = { travel: "טיולים", "real-estate": "נדל״ן", israelis: "ישראלים ביוון", living: "חיים ביוון", "jewish-greece": "יהדות", breaking: "מבזק", news: "חדשות", greece: "חדשות", economy: "כלכלה", politics: "חדשות" };
const HEAD = `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet"><style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;position:relative;font-family:Assistant;color:#fff;background:#0B3A5B}
.ph{position:absolute;inset:0;background-size:cover;background-position:center}.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.05) 28%,rgba(0,0,0,.2) 48%,rgba(0,0,0,.93) 78%)}
.top{position:absolute;top:150px;right:70px;left:70px;display:flex;justify-content:space-between;align-items:center;font:800 40px Assistant}.top svg{width:90px;height:90px}
.box{position:absolute;right:70px;left:70px;bottom:330px}h1{font:900 FSpx/1.1 "Frank Ruhl Libre",serif}.dek{font:600 46px/1.35 Assistant;margin-top:26px;opacity:.92}
.tag{display:inline-block;background:#F0B650;color:#0B3A5B;font:800 44px Assistant;padding:14px 32px;border-radius:50px;margin-bottom:30px}.n{position:absolute;top:270px;right:70px;font:900 200px/1 "Frank Ruhl Libre";color:#F0B650;opacity:.95}
.mid{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 90px}.big{font:900 130px/1.08 "Frank Ruhl Libre",serif}.sm{font:700 56px/1.35 Assistant;margin-top:40px}.pill{display:inline-block;background:#fff;color:#0B3A5B;font:800 52px Assistant;padding:24px 48px;border-radius:70px;margin-top:60px}
</style></head><body>`;

export function pickReelArticles(n = 4) {
  const since = Date.now() - 30 * 3600e3;
  const all = loadArticles().filter((a) => a.he && a.he.title && Date.parse(a.publishedAt) > since && !a.sensitive && !a.sponsored);
  const score = (a) => (a.image && a.image.type === "photo" ? 3 : 0) + (a.breaking || a.strike ? 4 : 0) + (["israelis", "travel", "real-estate", "jewish-greece"].includes(a.section) ? 2 : 0) + (/flight|טיס|strike|שביתה|weekend/i.test(a.slug) ? 1 : 0);
  return all.sort((a, b) => score(b) - score(a) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, n);
}

export function reelScenes(dir) {
  const arts = pickReelArticles(4);
  if (arts.length < 2) return null;
  fs.mkdirSync(dir, { recursive: true });
  const icon = ICON();
  const d = new Date().toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem", day: "numeric", month: "long" });
  const files = [];
  const w = (name, body) => { const f = path.join(dir, name); fs.writeFileSync(f, body); files.push(f); };
  w("s0.html", `${HEAD.replace("FS", "100")}<div class="ph" style="background-image:url(${esc(arts[0].image && arts[0].image.type === "photo" ? arts[0].image.url : SITE + "/og.png")});filter:blur(6px) brightness(.45)"></div><div class="top"><span>יוונט</span>${icon}</div><div class="mid"><div class="big">${arts.length} דברים שקרו היום ביוון</div><div class="sm">📍 <span dir="rtl">${esc(d)}</span> · בעברית, בדקה אחת</div></div></body></html>`);
  arts.forEach((a, i) => {
    const t = a.he.title, fsz = t.length > 70 ? 76 : t.length > 45 ? 88 : 104;
    const img = a.image && a.image.type === "photo" ? a.image.url : SITE + "/og.png";
    w(`s${i + 1}.html`, `${HEAD.replace("FS", String(fsz))}<div class="ph" style="background-image:url(${esc(img)})"></div><div class="sh"></div><div class="top"><span>יוונט</span>${icon}</div><div class="n">${i + 1}</div><div class="box"><span class="tag">${esc(a.breaking || a.strike ? "מבזק" : KICK[a.section] || "יוון")}</span><h1>${esc(t)}</h1>${a.he.dek && a.he.dek.length < 140 ? `<div class="dek">${esc(a.he.dek)}</div>` : ""}</div></body></html>`);
  });
  w(`s${arts.length + 1}.html`, `${HEAD.replace("FS", "100")}<div class="top"><span>יוונט</span>${icon}</div><div class="mid"><div class="big">מכירים מישהו שנוסע ליוון?</div><div class="sm">שלחו לו את הסרטון 📲<br>כל החדשות מיוון, בעברית — כל יום</div><div class="pill">עקבו ⬅ yavanet.gr</div></div></body></html>`);
  const caption = `${arts.length} דברים שקרו היום ביוון 🇬🇷\n\n${arts.map((a, i) => `${i + 1}. ${a.he.title}`).join("\n")}\n\nהכתבות המלאות באתר — הקישור בביו 👆\nמכירים מישהו שנוסע ליוון? שלחו לו 📲\n\n#יוון #אתונה #ישראלים_ביוון #חדשות_יוון #טיסות_ליוון #נדלן_ביוון #yavanet`;
  fs.writeFileSync(path.join(dir, "caption.txt"), caption);
  fs.writeFileSync(path.join(dir, "count.txt"), String(files.length));
  return { files, caption, slugs: arts.map((a) => a.slug) };
}

// Ανέβασμα βίντεο με resumable upload (δεν χρειάζεται δημόσιο URL)
export async function postReel(mp4, caption) {
  const c = await ctx();
  const buf = fs.readFileSync(mp4);
  const out = [];
  if (c.igId) {
    try {
      const m = await api(`/${c.igId}/media`, { method: "POST", token: c.userToken, params: { media_type: "REELS", upload_type: "resumable", caption, share_to_feed: "true" } });
      const up = await fetch(`https://rupload.facebook.com/ig-api-upload/${V}/${m.id}`, { method: "POST", headers: { Authorization: "OAuth " + c.userToken, offset: "0", file_size: String(buf.length) }, body: buf });
      if (!up.ok) throw new Error("upload " + up.status + " " + (await up.text()).slice(0, 200));
      await waitReady(m.id, c.userToken, 10);
      const p = await api(`/${c.igId}/media_publish`, { method: "POST", token: c.userToken, params: { creation_id: m.id } });
      out.push("IG reel ✓ " + p.id);
    } catch (e) { out.push("IG reel ✗ " + e.message); }
  }
  try {
    const s = await api(`/${c.pageId}/video_reels`, { method: "POST", token: c.pageToken, params: { upload_phase: "start" } });
    const up = await fetch(`https://rupload.facebook.com/video-upload/${V}/${s.video_id}`, { method: "POST", headers: { Authorization: "OAuth " + c.pageToken, offset: "0", file_size: String(buf.length) }, body: buf });
    if (!up.ok) throw new Error("upload " + up.status);
    await api(`/${c.pageId}/video_reels`, { method: "POST", token: c.pageToken, params: { upload_phase: "finish", video_id: s.video_id, video_state: "PUBLISHED", description: caption } });
    out.push("FB reel ✓");
  } catch (e) { out.push("FB reel ✗ " + e.message); }
  log("reel:", out.join(" · "));
  return out;
}

// ---------- Αυτόματες απαντήσεις σε σχόλια ----------
const KEYWORDS = /מחיר|מחירים|כמה עול|כמה זה|פרטים|מעוניי|מתעניי|וואטסאפ|ווטסאפ|whatsapp|טלפון|לינק|קישור|איפה|דירה|דירות|להשקיע|price|info|details|interested|how much/i;
const REPLY = (who) => `${who ? "@" + who + " " : ""}תודה על השאלה! 🙏 לתשובה מהירה ואישית כתבו לנו בוואטסאפ, בעברית: ${WA}`;
const MAX_AGE_H = 72;
// Spam: κρυπτο/«επενδύσεις», «στείλε DM», προώθηση λογαριασμών, followers, ξένα links
const SPAM = /bitcoin|crypto|forex|binance|usdt|invest(ment|ing)? (with|in)|earn \$|\$\d+ (a|per) (day|week)|make money|passive income|dm (me|us)|send (me )?a dm|check (my|our) (bio|profile|page)|promot(e|ion)|ambassador|followers|giveaway|sugar ?daddy|onlyfans|telegram\.me|t\.me\/|wa\.me\/(?!306906723676)|bit\.ly|tinyurl|הרוויחו|הכנסה פסיבית|השקעה בקריפטו|שלחו לי הודעה פרטית|פרסום לעמוד|עוקבים בחינם/i;
const ownLinks = /yavanet\.gr|306906723676/;
const isSpam = (t) => !!t && SPAM.test(t) && !ownLinks.test(t);

export async function replyComments() {
  const c = await ctx();
  let n = 0;
  const alerts = [], hidden = [], newc = [];
  const fresh = (t) => Date.now() - Date.parse(t) < MAX_AGE_H * 3600e3;
  if (c.igId) {
    const media = await api(`/${c.igId}/media`, { token: c.userToken, params: { fields: "id,permalink,comments_count,comments.limit(50){id,text,username,timestamp,replies{username}}", limit: "15" } });
    for (const m of media.data || []) {
      for (const cm of (m.comments && m.comments.data) || []) {
        if (cm.username !== c.igUser && fresh(cm.timestamp) && isSpam(cm.text)) {
          try { await api(`/${cm.id}`, { method: "POST", token: c.userToken, params: { hide: "true" } }); hidden.push(`IG @${cm.username}: «${(cm.text || "").slice(0, 120)}»`); } catch (e) { log("ig hide", e.message); }
          continue;
        }
        if (cm.username !== c.igUser && fresh(cm.timestamp)) newc.push({ id: cm.id, txt: `📸 @${cm.username}: «${(cm.text || "").slice(0, 200)}»\n${m.permalink}` });
        if (cm.username === c.igUser || !fresh(cm.timestamp) || !KEYWORDS.test(cm.text || "")) continue;
        if (((cm.replies && cm.replies.data) || []).some((r) => r.username === c.igUser)) continue;
        try {
          await api(`/${cm.id}/replies`, { method: "POST", token: c.userToken, params: { message: REPLY(cm.username) } });
          n++; alerts.push(`IG @${cm.username}: «${cm.text}»\n${m.permalink}`);
        } catch (e) { log("ig reply", e.message); }
      }
    }
  }
  const feed = await api(`/${c.pageId}/feed`, { token: c.pageToken, params: { fields: "id,permalink_url,comments.limit(50){id,message,created_time,from,comments.limit(20){from}}", limit: "15" } });
  for (const p of feed.data || []) {
    for (const cm of (p.comments && p.comments.data) || []) {
      if ((cm.from && cm.from.id) !== c.pageId && fresh(cm.created_time) && isSpam(cm.message)) {
        try { await api(`/${cm.id}`, { method: "POST", token: c.pageToken, params: { is_hidden: "true" } }); hidden.push(`FB ${(cm.from && cm.from.name) || ""}: «${(cm.message || "").slice(0, 120)}»`); } catch (e) { log("fb hide", e.message); }
        continue;
      }
      if ((cm.from && cm.from.id) !== c.pageId && fresh(cm.created_time)) newc.push({ id: cm.id, txt: `📘 ${(cm.from && cm.from.name) || ""}: «${(cm.message || "").slice(0, 200)}»\n${p.permalink_url}` });
      if ((cm.from && cm.from.id) === c.pageId || !fresh(cm.created_time) || !KEYWORDS.test(cm.message || "")) continue;
      if (((cm.comments && cm.comments.data) || []).some((r) => r.from && r.from.id === c.pageId)) continue;
      try {
        await api(`/${cm.id}/comments`, { method: "POST", token: c.pageToken, params: { message: REPLY("") } });
        n++; alerts.push(`FB ${(cm.from && cm.from.name) || ""}: «${cm.message}»\n${p.permalink_url}`);
      } catch (e) { log("fb reply", e.message); }
    }
  }
  if (alerts.length) await notifyOwner(`💬 Απάντησα αυτόματα σε ${alerts.length} σχόλια (με link WhatsApp):\n\n${alerts.join("\n\n")}`.slice(0, 3900)).catch(() => {});
  // Ειδοποίηση για ΚΑΘΕ νέο σχόλιο (για απάντηση μέσα στην πρώτη ώρα – σήμα για τον αλγόριθμο)
  const seenFile = path.join(ROOT, "content/ig/comment-seen.json");
  let seen = []; try { seen = JSON.parse(fs.readFileSync(seenFile, "utf8")); } catch {}
  const firstRun = !seen.length;
  const unseen = newc.filter((x) => !seen.includes(x.id));
  if (unseen.length && !firstRun) await notifyOwner(`💬 Νέα σχόλια (${unseen.length}) – απάντησε μέσα σε 1 ώρα για περισσότερη προβολή:\n\n${unseen.map((x) => x.txt).join("\n\n")}`.slice(0, 3900)).catch(() => {});
  if (unseen.length) fs.writeFileSync(seenFile, JSON.stringify([...seen, ...unseen.map((x) => x.id)].slice(-2000)));
  if (hidden.length) await notifyOwner(`🧹 Έκρυψα ${hidden.length} spam σχόλια:\n\n${hidden.join("\n")}`.slice(0, 3900)).catch(() => {});
  log("comments: απαντήσεις", n, "· spam κρυμμένα", hidden.length);
  return n;
}

// ---------- Αυτόματη απάντηση σε μηνύματα (Instagram Direct + Messenger) ----------
// Χρειάζεται δικαιώματα instagram_manage_messages + pages_messaging στο κλειδί.
const DM_REPLY = "שלום! 👋 תודה שכתבתם ליוונט 🇬🇷\nלתשובה מהירה ואישית, בעברית, כתבו לנו בוואטסאפ:\n" + WA + "\n\nמתעניינים בדירה ביוון? ספרו לנו באיזה אזור ומה התקציב, ונחזור אליכם.";
const ESTATE = /דיר|נדל|להשקיע|השקעה|לקנות|קניי|שכיר|להשכיר|גולדן|golden|apartment|property|real estate|invest|buy|rent|ακίνητ|διαμέρισ/i;
export async function replyDMs() {
  const c = await ctx();
  const alerts = [];
  let n = 0;
  const DAY = 24 * 3600e3;
  for (const platform of ["instagram", "messenger"]) {
    let conv;
    try { conv = await api(`/${c.pageId}/conversations`, { token: c.pageToken, params: { platform, fields: "id,updated_time,participants,messages.limit(10){id,message,from,created_time}", limit: "25" } }); }
    catch (e) { log("dms", platform, e.message); continue; }
    for (const cv of conv.data || []) {
      if (Date.now() - Date.parse(cv.updated_time) > DAY) continue;
      const msgs = (cv.messages && cv.messages.data) || [];
      if (!msgs.length) continue;
      const mine = (m) => m.from && (m.from.id === c.pageId || m.from.id === c.igId || (c.igUser && m.from.username === c.igUser));
      const last = msgs[0];
      if (mine(last)) continue;
      // Έχουμε ήδη στείλει το αυτόματο μήνυμα τις τελευταίες 7 μέρες; τότε μόνο ειδοποίηση, όχι νέα απάντηση
      const already = msgs.some((m) => mine(m) && /wa\.me\/306906723676/.test(m.message || "") && Date.now() - Date.parse(m.created_time) < 7 * DAY);
      const who = last.from && (last.from.username || last.from.name) || "?";
      const text = (last.message || "(συνημμένο)").slice(0, 300);
      const lead = ESTATE.test(text) ? "🏠 Πιθανός πελάτης για S.F. Properties\n" : "";
      if (!already) {
        try {
          await api(`/${c.pageId}/messages`, { method: "POST", token: c.pageToken, params: { recipient: JSON.stringify({ id: last.from.id }), messaging_type: "RESPONSE", message: JSON.stringify({ text: DM_REPLY }) } });
          n++;
        } catch (e) { log("dm reply", platform, e.message); }
      }
      const key = `${platform}:${last.id}`;
      alerts.push({ key, txt: `${lead}${platform === "instagram" ? "📸 Instagram" : "💬 Messenger"} · ${who}:\n«${text}»${already ? "" : "\n↪️ στάλθηκε αυτόματα το WhatsApp"}` });
    }
  }
  // ειδοποίηση μόνο για μηνύματα που δεν έχουμε αναφέρει ήδη (κρατάμε τα ids στο state)
  const stFile = path.join(ROOT, "content/ig/dm-seen.json");
  let seen = []; try { seen = JSON.parse(fs.readFileSync(stFile, "utf8")); } catch {}
  const fresh = alerts.filter((a) => !seen.includes(a.key));
  if (fresh.length) {
    await notifyOwner(`📩 Νέα μηνύματα (${fresh.length}):\n\n${fresh.map((a) => a.txt).join("\n\n")}`.slice(0, 3900)).catch(() => {});
    fs.writeFileSync(stFile, JSON.stringify([...seen, ...fresh.map((a) => a.key)].slice(-500)));
  }
  log("dms: απαντήσεις", n, "· νέες ειδοποιήσεις", fresh.length);
  return n;
}

// ---------- Εβδομαδιαία σύνοψη Instagram/Facebook (για την αναφορά της Δευτέρας) ----------
export async function socialWeekly() {
  const c = await ctx();
  const lines = [];
  const stFile = path.join(ROOT, "content/ig/stats.json");
  let prev = {}; try { prev = JSON.parse(fs.readFileSync(stFile, "utf8")); } catch {}
  const cur = { at: new Date().toISOString() };
  const delta = (a, b) => (typeof b === "number" ? ` (${a - b >= 0 ? "+" : ""}${a - b} σε μια εβδομάδα)` : "");
  if (c.igId) {
    const me = await api(`/${c.igId}`, { token: c.userToken, params: { fields: "followers_count,media_count" } });
    cur.ig = me.followers_count;
    lines.push(`📸 Instagram: ${me.followers_count} ακόλουθοι${delta(me.followers_count, prev.ig)}`);
    const since = Date.now() - 7 * 86400e3;
    const media = await api(`/${c.igId}/media`, { token: c.userToken, params: { fields: "id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count", limit: "40" } });
    const week = (media.data || []).filter((m) => Date.parse(m.timestamp) >= since);
    for (const m of week) {
      m.ins = {};
      try {
        const metrics = m.media_product_type === "REELS" ? "reach,saved,shares,views" : "reach,saved,shares,views";
        const r = await api(`/${m.id}/insights`, { token: c.userToken, params: { metric: metrics } });
        for (const x of r.data || []) m.ins[x.name] = (x.values && x.values[0] && x.values[0].value) || x.total_value?.value || 0;
      } catch { m.noIns = true; }
      m.score = (m.ins.saved || 0) * 4 + (m.ins.shares || 0) * 5 + (m.comments_count || 0) * 2 + (m.like_count || 0) + (m.ins.reach || 0) / 50;
    }
    const fmt = (m) => `«${(m.caption || "").split("\n")[0].slice(0, 70)}»\n   ${m.ins.views != null ? `👁 ${m.ins.views} · ` : ""}${m.ins.reach != null ? `reach ${m.ins.reach} · ` : ""}❤️ ${m.like_count || 0} · 💬 ${m.comments_count || 0}${m.ins.saved != null ? ` · 🔖 ${m.ins.saved} · 📤 ${m.ins.shares || 0}` : ""}\n   ${m.permalink}`;
    const posts = week.filter((m) => m.media_product_type !== "REELS").sort((a, b) => b.score - a.score);
    const reels = week.filter((m) => m.media_product_type === "REELS").sort((a, b) => b.score - a.score);
    lines.push(`🗂 Αναρτήσεις της εβδομάδας: ${posts.length} · reels: ${reels.length}`);
    if (posts[0]) lines.push(`🏆 Καλύτερη ανάρτηση:\n   ${fmt(posts[0])}`);
    if (reels[0]) lines.push(`🎬 Καλύτερο reel:\n   ${fmt(reels[0])}`);
    if (week.some((m) => m.noIns)) lines.push("ℹ️ Χωρίς στατιστικά προβολών/αποθηκεύσεων (λείπει το δικαίωμα instagram_manage_insights)");
  }
  try {
    const pg = await api(`/${c.pageId}`, { token: c.pageToken, params: { fields: "followers_count,fan_count" } });
    cur.fb = pg.followers_count || pg.fan_count;
    lines.push(`📘 Facebook: ${cur.fb} ακόλουθοι${delta(cur.fb, prev.fb)}`);
  } catch (e) { log("fb stats", e.message); }
  fs.writeFileSync(stFile, JSON.stringify(cur, null, 1));
  return lines.join("\n");
}

// ---------- CLI ----------
if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, arg] = process.argv.slice(2);
  try {
    if (cmd === "diag") {
      const t = env.META_TOKEN || "";
      log("token: μήκος", t.length, "αρχή", t.slice(0, 4));
      for (const q of ["/me?fields=id,name", "/me/permissions", "/debug_token?input_token=" + encodeURIComponent(t), "/me/accounts?fields=id,name"]) {
        const u = G + q + (q.includes("?") ? "&" : "?") + "access_token=" + encodeURIComponent(t);
        const r = await fetch(u); const j = await r.json().catch(() => ({}));
        log("DIAG", q.split("?")[0], r.status, JSON.stringify(j).replaceAll(t, "<T>").slice(0, 700));
      }
      process.exit(0);
    }
    if (cmd === "check") { const c = await ctx(); log("σελίδα:", c.pageName, c.pageId, "· instagram:", c.igUser || "—", c.igId || ""); }
    else if (cmd === "story") await postStory(arg);
    else if (cmd === "reel-scenes") { const r = reelScenes(arg || "reel-out"); if (!r) { log("reel: λίγα άρθρα σήμερα"); process.exit(0); } log("reel scenes:", r.files.length, r.slugs.join(", ")); }
    else if (cmd === "reel-publish") {
      const caption = fs.readFileSync(path.join(path.dirname(arg), "caption.txt"), "utf8");
      const res = await postReel(arg, caption);
      await notifyOwner(`🎬 Ημερήσιο reel ανέβηκε\n${res.join("\n")}`).catch(() => {});
    }
    else if (cmd === "comments") await replyComments();
    else if (cmd === "dms") await replyDMs();
    else if (cmd === "social-weekly") log(await socialWeekly());
    else { console.log("χρήση: check | story <url> | reel-scenes <dir> | reel-publish <mp4> | comments"); }
  } catch (e) {
    log("meta:", e.message);
    if (!/META_TOKEN/.test(e.message)) await notifyOwner(`⚠️ Meta (${cmd}): ${e.message}`).catch(() => {});
    process.exit(cmd === "check" ? 1 : 0);
  }
}
