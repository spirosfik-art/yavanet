// Βοηθητικές συναρτήσεις για την αυτοματοποίηση (χωρίς εξωτερικά πακέτα, Node 20+).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const ARTICLES_DIR = path.join(ROOT, "content/articles");
export const STATE_FILE = path.join(ROOT, "automation/state.json");
export const env = process.env;
export const DRY = env.DRY_RUN === "1";

export const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
export const sha = (s) => crypto.createHash("sha1").update(String(s)).digest("hex").slice(0, 12);
export const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
export const writeJSON = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + "\n"); };

export function athensNow() {
  const d = new Date();
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Athens", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) % 24, minute: Number(parts.minute) };
}
export function israelHour() {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false }).format(new Date())) % 24;
}
export function isoAthens(d = new Date()) {
  // ISO με ζώνη ώρας Αθήνας (π.χ. 2026-09-26T08:10:00+03:00)
  const off = -new Date(d.toLocaleString("en-US", { timeZone: "UTC" })).getTime() + new Date(d.toLocaleString("en-US", { timeZone: "Europe/Athens" })).getTime();
  const m = Math.round(off / 60000), sign = m >= 0 ? "+" : "-", hh = String(Math.floor(Math.abs(m) / 60)).padStart(2, "0"), mm = String(Math.abs(m) % 60).padStart(2, "0");
  return new Date(d.getTime() + off).toISOString().slice(0, 19) + `${sign}${hh}:${mm}`;
}

/* ---------- Δίκτυο ---------- */
export async function fetchText(url, { timeout = 20000, headers = {} } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: "follow", headers: { "user-agent": "YavanetBot/1.0 (+https://yavanet.com/p/corrections/)", accept: "*/*", ...headers } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally { clearTimeout(t); }
}

/* ---------- RSS / Atom ---------- */
const decode = (s) => String(s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, "&");
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i")); return m ? decode(m[1]).trim() : ""; };

export function parseFeed(xml) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks) {
    let link = tag(b, "link");
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ""; }
    items.push({
      title: htmlToText(tag(b, "title")),
      url: link.trim(),
      summary: htmlToText(tag(b, "description") || tag(b, "summary") || tag(b, "content")).slice(0, 600),
      published: tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date"),
    });
  }
  return items.filter((i) => i.title && i.url);
}

/* ---------- HTML ---------- */
export function htmlToText(html) {
  return decode(String(html || "")
    .replace(/<(script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[ \t ]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}
export function mainText(html) {
  // Προσπαθεί να κρατήσει το κυρίως κείμενο (article/main), αλλιώς όλη τη σελίδα
  const m = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i);
  return htmlToText(m ? m[0] : html).slice(0, 15000);
}
export function extractLinks(html, base, pattern) {
  const re = /<a\s[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const out = []; let m;
  while ((m = re.exec(html))) {
    let url; try { url = new URL(decode(m[1]), base).toString(); } catch { continue; }
    const title = htmlToText(m[2]).replace(/\s+/g, " ").trim();
    if (title.length < 20 || (pattern && !new RegExp(pattern, "i").test(url))) continue;
    out.push({ title, url, summary: "", published: "" });
  }
  return out.filter((x, i, a) => a.findIndex((y) => y.url === x.url) === i).slice(0, 30);
}

/* ---------- Τεχνητή νοημοσύνη ----------
   AI_PROVIDER=gemini → Google Gemini (δωρεάν επίπεδο, για ξεκίνημα με 0€)
   AI_PROVIDER=claude → Claude API (επί πληρωμή, καλύτερη ποιότητα)
   Αν δεν οριστεί: Claude όταν υπάρχει ANTHROPIC_API_KEY, αλλιώς Gemini. */
export const provider = () => env.AI_PROVIDER || (env.ANTHROPIC_API_KEY ? "claude" : "gemini");
export const hasAI = () => !!(env.ANTHROPIC_API_KEY || env.GEMINI_API_KEY);
let lastGemini = 0;
let geminiAuto = null;
export let quotaHit = false;
export const aiQuotaHit = () => quotaHit;
// Βρίσκει μόνο του το νεότερο διαθέσιμο μοντέλο «flash-lite» (η Google αλλάζει συχνά ονόματα)
async function pickGeminiModel() {
  if (geminiAuto) return geminiAuto;
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": env.GEMINI_API_KEY } });
  const d = await r.json().catch(() => ({}));
  const ver = (n) => (n.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1] * 1;
  const cands = (d.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((n) => /^gemini-[\d.]+-flash(-lite)?$/.test(n));
  // Προτιμάμε «Flash Lite»: στο δωρεάν επίπεδο έχει ~500 αιτήματα/μέρα (το «Flash» μόνο ~20)
  const lite = (n) => (n.endsWith("-lite") ? 1 : 0);
  cands.sort((a, b) => lite(b) - lite(a) || ver(b) - ver(a));
  geminiAuto = cands[0] || "gemini-flash-lite-latest";
  log("μοντέλο Gemini:", geminiAuto);
  return geminiAuto;
}
async function gemini({ system, prompt, role, maxTokens, temperature }) {
  if (!env.GEMINI_API_KEY) throw new Error("Λείπει το GEMINI_API_KEY");
  let model = (role === "select" && env.GEMINI_SELECT_MODEL) || env.GEMINI_MODEL || (await pickGeminiModel());
  for (let attempt = 1; attempt <= 4; attempt++) {
    // Το δωρεάν επίπεδο επιτρέπει ~15 αιτήματα το λεπτό: κρατάμε απόσταση ~4,5 δευτερολέπτων
    const wait = 4500 - (Date.now() - lastGemini); if (wait > 0) await new Promise((s) => setTimeout(s, wait));
    lastGemini = Date.now();
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": env.GEMINI_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: Math.max(maxTokens, 8192), responseMimeType: "application/json" },
      }),
    });
    if (r.status === 429) {
      // Αν τελείωσε το ημερήσιο όριο, σταματάμε αμέσως (ξαναδοκιμάζει στην επόμενη εκτέλεση)
      const body = await r.text();
      const m = body.match(/"retryDelay":\s*"(\d+)s"/);
      const delay = m ? Number(m[1]) : 20;
      if (/PerDay|per day/i.test(body) || delay > 60 || attempt >= 3) { quotaHit = true; throw new Error("Gemini API: όριο αιτημάτων – θα ξαναδοκιμάσει αργότερα"); }
      await new Promise((s) => setTimeout(s, (delay + 2) * 1000)); continue;
    }
    if (r.status >= 500) { await new Promise((s) => setTimeout(s, 10000 * attempt)); continue; }
    const d = await r.json();
    if (r.status === 404 && attempt === 1) { geminiAuto = null; const m2 = await pickGeminiModel(); if (m2 !== model) { log(`το ${model} δεν είναι διαθέσιμο → ${m2}`); model = m2; continue; } }
    if (!r.ok) throw new Error("Gemini API: " + JSON.stringify(d).slice(0, 300));
    const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    if (!text) throw new Error("Gemini: κενή απάντηση (" + (d.candidates?.[0]?.finishReason || d.promptFeedback?.blockReason || "?") + ")");
    return text;
  }
  throw new Error("Gemini API: όριο αιτημάτων – θα ξαναδοκιμάσει στην επόμενη εκτέλεση");
}

export async function claude({ system, prompt, model = env.ANTHROPIC_MODEL || "claude-sonnet-5", maxTokens = 6000, temperature = 0.3, role = "write" }) {
  if (provider() === "gemini") return gemini({ system, prompt, role, maxTokens, temperature });
  if (!env.ANTHROPIC_API_KEY) throw new Error("Λείπει το ANTHROPIC_API_KEY");
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: maxTokens, temperature, system, messages: [{ role: "user", content: prompt }] }),
    });
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 4000 * attempt)); continue; }
    const d = await r.json();
    if (!r.ok) throw new Error("Claude API: " + JSON.stringify(d).slice(0, 300));
    return d.content.filter((c) => c.type === "text").map((c) => c.text).join("");
  }
  throw new Error("Claude API: πολλές αποτυχίες");
}
export function parseJSON(text) {
  const s = String(text).replace(/^[\s\S]*?```(?:json)?\s*/i, (m) => (m.includes("```") ? "" : m)).replace(/```[\s\S]*$/, "");
  const start = Math.min(...["{", "["].map((c) => { const i = s.indexOf(c); return i < 0 ? Infinity : i; }));
  const end = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  return JSON.parse(s.slice(start, end + 1));
}

/* ---------- Telegram ---------- */
export async function tg(method, body) {
  if (!env.TELEGRAM_BOT_TOKEN) return null;
  if (DRY) { log("[dry] telegram", method, JSON.stringify(body).slice(0, 200)); return null; }
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!d.ok) log("telegram error", method, JSON.stringify(d).slice(0, 200));
  return d.result;
}
export const notifyOwner = (text, extra = {}) => env.TELEGRAM_OWNER_CHAT_ID ? tg("sendMessage", { chat_id: env.TELEGRAM_OWNER_CHAT_ID, text: text.slice(0, 4000), disable_web_page_preview: true, ...extra }) : null;

/* ---------- Brevo ---------- */
export async function brevo(pathname, body, method = "POST") {
  if (!env.BREVO_API_KEY) throw new Error("Λείπει το BREVO_API_KEY");
  if (DRY && method !== "GET") { log("[dry] brevo", pathname); return {}; }
  const r = await fetch("https://api.brevo.com/v3" + pathname, { method, headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok && r.status !== 204) throw new Error(`Brevo ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.status === 204 ? {} : r.json().catch(() => ({}));
}
export async function sendEmail(subject, html) {
  if (!env.NOTIFY_EMAIL || !env.SENDER_EMAIL || !env.BREVO_API_KEY) return;
  await brevo("/smtp/email", { sender: { email: env.SENDER_EMAIL, name: "Yavanet" }, to: [{ email: env.NOTIFY_EMAIL }], subject, htmlContent: html });
}

/* ---------- Άρθρα ---------- */
export function loadArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json")).map((f) => ({ file: f, ...readJSON(path.join(ARTICLES_DIR, f), {}) }));
}
export function saveArticle(a) {
  const { file, ...data } = a;
  const name = file || `${data.publishedAt.slice(0, 10)}-${data.slug}.json`;
  if (!DRY) writeJSON(path.join(ARTICLES_DIR, name), data);
  return name;
}
export function slugify(s) {
  return String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 70) || "story-" + Date.now();
}

/* ---------- Έλεγχοι ποιότητας ---------- */
// Αριθμοί του άρθρου που δεν υπάρχουν στην πηγή (ποσά, ποσοστά, ημερομηνίες, στοιχεία)
export function missingNumbers(articleText, sourceText) {
  const norm = (x) => x.replace(/[\s.,'’]/g, "");
  const src = norm(sourceText);
  // Αγνοούμε μικρούς αριθμούς (1–12: βήματα, μήνες κ.λπ.)
  const nums = (articleText.match(/\d[\d.,'’]*\d|\d/g) || []).filter((n) => { const v = norm(n); return v.length >= 2 && Number(v) > 12; });
  const uniq = [...new Set(nums.map(norm))];
  return uniq.filter((n) => !src.includes(n));
}
// Ομοιότητα κειμένου (6 λέξεις στη σειρά) για να μην αντιγράφουμε
export function overlapRatio(a, b) {
  const sh = (t) => { const w = String(t).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean); const s = new Set(); for (let i = 0; i + 6 <= w.length; i++) s.add(w.slice(i, i + 6).join(" ")); return s; };
  const A = sh(a), B = sh(b);
  if (!A.size) return 0;
  let hit = 0; for (const x of A) if (B.has(x)) hit++;
  return hit / A.size;
}
