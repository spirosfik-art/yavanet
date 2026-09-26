// Yavanet – αυτόματη ροή περιεχομένου. Τρέχει κάθε 15 λεπτά (GitHub Actions).
// 1) εντολές ιδιοκτήτη από Telegram  2) συλλογή πηγών  3) επιλογή θεμάτων (AI)
// 4) συγγραφή εβραϊκά/αγγλικά (AI)  5) έλεγχοι  6) δημοσίευση ή έγκριση  7) διανομή  8) ενημερώσεις άρθρων
import fs from "node:fs";
import path from "node:path";
import {
  ROOT, STATE_FILE, env, DRY, log, sha, readJSON, writeJSON, athensNow, isoAthens, fetchText, parseFeed, mainText, extractLinks,
  claude, provider, hasAI, parseJSON, tg, notifyOwner, loadArticles, saveArticle, slugify, missingNumbers, overlapRatio,
} from "./lib.mjs";
import { SELECT_SYSTEM, selectPrompt, WRITE_SYSTEM, writePrompt, VERIFY_SYSTEM, verifyPrompt, neutralPrompt, updatePrompt } from "./prompts.mjs";
import { SITE, SECTIONS } from "../site/config.mjs";
import { ART_KEYS } from "../site/art.mjs";

const MAX_PER_DAY = Number(env.MAX_PER_DAY || 15);
const MIN_PER_DAY = Number(env.MIN_PER_DAY || 8);
const MAX_PER_RUN = Number(env.MAX_PER_RUN || 3);
const APPROVAL_TIMEOUT_MIN = Number(env.APPROVAL_TIMEOUT_MIN || 120);
const SELECT_MODEL = env.SELECT_MODEL || "claude-haiku-4-5-20251001";
const WRITE_MODEL = env.ANTHROPIC_MODEL || "claude-sonnet-5";
const SECTION_SLUGS = SECTIONS.map((s) => s.slug);

const state = readJSON(STATE_FILE, {});
state.seen ||= {}; state.pending ||= {}; state.sourceStatus ||= {}; state.tgOffset ||= 0; state.paused ||= false;
const now = athensNow();
if (!state.today || state.today.date !== now.date) {
  if (state.today) { state.history ||= []; state.history.unshift({ date: state.today.date, count: state.today.count, rejected: (state.today.rejected || []).length }); state.history = state.history.slice(0, 60); }
  state.today = { date: now.date, count: 0, published: [], rejected: [], errors: [] };
}
const save = () => { for (const [k, v] of Object.entries(state.seen)) if (Date.now() - v > 14 * 86400e3) delete state.seen[k]; if (!DRY) writeJSON(STATE_FILE, state); };
const articleUrl = (a, lang = "he") => SITE.url.replace(/\/$/, "") + (lang === "he" ? "" : "/en") + `/a/${a.slug}/`;
const reject = (title, reason) => { log("✗", title, "→", reason); state.today.rejected.push({ title: String(title).slice(0, 140), reason: String(reason).slice(0, 300), at: new Date().toISOString() }); };

/* ================= 1. Εντολές ιδιοκτήτη (Telegram) ================= */
async function handleTelegram() {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_OWNER_CHAT_ID) return;
  const updates = (await tg("getUpdates", { offset: state.tgOffset + 1, timeout: 0, allowed_updates: ["message", "callback_query"] })) || [];
  for (const u of updates) {
    state.tgOffset = Math.max(state.tgOffset, u.update_id);
    const cq = u.callback_query, msg = u.message;
    const chat = String((cq ? cq.message.chat.id : msg && msg.chat.id) || "");
    if (chat !== String(env.TELEGRAM_OWNER_CHAT_ID)) continue; // μόνο ο ιδιοκτήτης
    try {
      if (cq) {
        const [action, id] = String(cq.data || "").split(":");
        await tg("answerCallbackQuery", { callback_query_id: cq.id });
        if (action === "approve") await approve(id);
        else if (action === "reject") { if (state.pending[id]) { reject(state.pending[id].draft.en.title, "Απορρίφθηκε από τον ιδιοκτήτη"); delete state.pending[id]; await notifyOwner("✓ Απορρίφθηκε."); } }
        else if (action === "edit") await notifyOwner(`Στείλε: /edit ${id} <τι να αλλάξει>\nπ.χ. /edit ${id} πιο σύντομο, χωρίς το δεύτερο κομμάτι`);
        continue;
      }
      const text = (msg.text || "").trim();
      const [cmd, ...rest] = text.split(/\s+/);
      const arg = rest.join(" ");
      if (cmd === "/pause") { state.paused = true; await notifyOwner("⏸ Η αυτόματη δημοσίευση σταμάτησε. /resume για συνέχεια."); }
      else if (cmd === "/resume") { state.paused = false; await notifyOwner("▶️ Η αυτόματη δημοσίευση συνεχίζει."); }
      else if (cmd === "/status") await notifyOwner(statusText());
      else if (cmd === "/approve") await approve(arg);
      else if (cmd === "/reject") { delete state.pending[arg]; await notifyOwner("✓ Απορρίφθηκε."); }
      else if (cmd === "/edit") { const [id, ...ins] = rest; await editPending(id, ins.join(" ")); }
      else if (cmd === "/remove") await removeArticle(arg);
      else if (cmd === "/story") await manualStory(arg);
      else await notifyOwner(HELP);
    } catch (e) { log("telegram cmd error", e.message); await notifyOwner("Σφάλμα: " + e.message); }
  }
}
const HELP = `Εντολές Yavanet:
/status – κατάσταση σήμερα
/pause – παύση αυτόματης δημοσίευσης
/resume – συνέχεια
/approve ID · /reject ID – έγκριση/απόρριψη ευαίσθητου άρθρου
/edit ID οδηγία – ξαναγράψιμο με οδηγία
/remove slug – κατέβασμα άρθρου από το site
/story URL – γράψε άρθρο από συγκεκριμένο σύνδεσμο`;
function statusText() {
  const p = Object.entries(state.pending).map(([id, x]) => `• ${id}: ${x.draft.en.title}`).join("\n") || "–";
  return `Yavanet ${now.date}\n${state.paused ? "⏸ ΣΕ ΠΑΥΣΗ" : "▶️ Ενεργό"}\nΔημοσιεύθηκαν σήμερα: ${state.today.count}\nΑπορρίφθηκαν: ${state.today.rejected.length}\nΣε αναμονή έγκρισης:\n${p}`;
}

/* ================= 2. Συλλογή πηγών ================= */
async function collect() {
  const { sources } = readJSON(path.join(ROOT, "automation/sources.json"), { sources: [] });
  const items = [];
  for (const s of sources.filter((x) => x.enabled !== false && x.url)) {
    try {
      let list = [];
      if (s.type === "rss") list = parseFeed(await fetchText(s.url));
      else if (s.type === "html") list = extractLinks(await fetchText(s.url), s.url, s.linkPattern);
      else if (s.type === "usgs") {
        const d = JSON.parse(await fetchText(s.url));
        list = (d.features || []).map((f) => ({
          title: f.properties.title, url: f.properties.url, published: new Date(f.properties.time).toISOString(),
          summary: `Earthquake magnitude ${f.properties.mag} — ${f.properties.place}. Time (UTC): ${new Date(f.properties.time).toISOString()}. Depth: ${f.geometry.coordinates[2]} km. Coordinates: ${f.geometry.coordinates[1]}, ${f.geometry.coordinates[0]}.`,
          text: `Earthquake magnitude ${f.properties.mag} — ${f.properties.place}. Time (UTC): ${new Date(f.properties.time).toISOString()}. Depth: ${f.geometry.coordinates[2]} km. Latitude ${f.geometry.coordinates[1]}, longitude ${f.geometry.coordinates[0]}. Source: USGS. Greek authorities: Geodynamic Institute (gein.noa.gr), Civil Protection 112.`,
          geo: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
        }));
      }
      if (s.include) list = list.filter((i) => new RegExp(s.include, "i").test(i.title + " " + i.summary));
      const fresh = list.filter((i) => { const t = Date.parse(i.published); return !t || Date.now() - t < 36 * 3600e3; });
      for (const i of fresh) {
        const id = sha(i.url);
        if (state.seen[id]) continue;
        items.push({ ...i, id, sourceId: s.id, sourceName: s.name, official: !!s.official, emergency: !!s.emergency, sectionHint: s.section });
      }
      state.sourceStatus[s.id] = { ok: true, at: new Date().toISOString(), items: list.length };
    } catch (e) {
      const prev = state.sourceStatus[s.id];
      state.sourceStatus[s.id] = { ok: false, at: new Date().toISOString(), error: e.message, fails: ((prev && prev.fails) || 0) + 1 };
      log("πηγή απέτυχε", s.id, e.message);
      if (state.sourceStatus[s.id].fails === 8) await notifyOwner(`⚠️ Η πηγή «${s.name}» αποτυγχάνει εδώ και 2 ώρες: ${e.message}`);
    }
  }
  return items.sort((a, b) => (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0)).slice(0, 40);
}

/* ================= 3. Επιλογή θεμάτων ================= */
async function select(items) {
  if (!items.length) return [];
  const recent = loadArticles().sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "")).slice(0, 40).map((a) => a.en && a.en.title).filter(Boolean);
  const remaining = Math.max(0, MAX_PER_DAY - state.today.count);
  let hint = "";
  if (now.hour >= 17 && state.today.count < MIN_PER_DAY) hint = `\nWe have published only ${state.today.count} today; our minimum is ${MIN_PER_DAY}. Be a bit more inclusive with relevant items.`;
  const out = parseJSON(await claude({ system: SELECT_SYSTEM, prompt: selectPrompt(items, { remaining: Math.min(remaining, MAX_PER_RUN) + 2, recentTitles: recent }) + hint, model: SELECT_MODEL, maxTokens: 2000, temperature: 0, role: "select" }));
  for (const i of items) state.seen[i.id] = Date.now();
  const picks = (out.picks || []).map((p) => ({ ...p, item: items.find((i) => i.id === p.id) })).filter((p) => p.item);
  // Τα έκτακτα από επίσημες πηγές δεν μετράνε στο ημερήσιο όριο
  const brk = picks.filter((p) => p.breaking && p.item.official);
  const normal = picks.filter((p) => !(p.breaking && p.item.official)).slice(0, Math.min(MAX_PER_RUN, remaining));
  return [...brk.slice(0, 3), ...normal];
}

/* ================= 4–5. Συγγραφή & έλεγχοι ================= */
async function sourceText(item) {
  if (item.text) return item.text;
  try { const t = mainText(await fetchText(item.url)); if (t.length > 300) return t; } catch (e) { log("κείμενο πηγής απέτυχε", e.message); }
  return `${item.title}\n${item.summary}`;
}
function shapeOk(d) {
  if (!d || !d.he || !d.en) return "λείπει γλώσσα";
  for (const l of ["he", "en"]) {
    for (const k of ["title", "dek", "body"]) if (!d[l][k] || typeof d[l][k] !== "string") return `λείπει ${l}.${k}`;
    if (!Array.isArray(d[l].tldr) || d[l].tldr.length < 2) return `λείπει ${l}.tldr`;
  }
  if (!/[֐-׿]/.test(d.he.title + d.he.body)) return "το εβραϊκό κείμενο δεν είναι στα εβραϊκά";
  return null;
}
async function checks(draft, text) {
  const shape = shapeOk(draft); if (shape) return [shape];
  const issues = [];
  const all = (l) => [draft[l].title, draft[l].dek, ...draft[l].tldr, draft[l].means || "", draft[l].body].join("\n");
  const miss = missingNumbers(all("en") + "\n" + all("he"), text);
  if (miss.length) issues.push("Αριθμοί που δεν υπάρχουν στην πηγή: " + miss.slice(0, 6).join(", "));
  const ov = overlapRatio(all("en"), text);
  if (ov > 0.2) issues.push(`Μεγάλη ομοιότητα με την πηγή (${Math.round(ov * 100)}%)`);
  if (!issues.length) {
    const v = parseJSON(await claude({ system: VERIFY_SYSTEM, prompt: verifyPrompt({ text, article: draft }), model: WRITE_MODEL, maxTokens: 1500, temperature: 0 }));
    if (!v.ok) issues.push(...(v.issues || ["Ο έλεγχος γεγονότων απέρριψε το άρθρο"]));
  }
  return issues;
}
async function write(item, pick, { instruction, neutral } = {}) {
  const text = await sourceText(item);
  const source = { name: item.sourceName, url: item.url };
  const prompt = neutral ? neutralPrompt({ source, text, today: now.date }) : writePrompt({ source, text, section: pick.section || item.sectionHint, sensitive: pick.sensitive, breaking: pick.breaking, today: now.date, instruction });
  let draft = parseJSON(await claude({ system: WRITE_SYSTEM, prompt, model: WRITE_MODEL, maxTokens: 7000 }));
  let issues = await checks(draft, text);
  if (issues.length && !neutral) {
    // Μία προσπάθεια διόρθωσης
    draft = parseJSON(await claude({ system: WRITE_SYSTEM, prompt: prompt + `\n\nA previous draft was rejected for: ${issues.join("; ")}. Fix these problems.`, model: WRITE_MODEL, maxTokens: 7000 }));
    issues = await checks(draft, text);
  }
  return { draft, issues, text };
}

/* ================= 6. Δημοσίευση / έγκριση ================= */
async function pickImage(draft) {
  const key = ART_KEYS.includes(draft.imageKey) ? draft.imageKey : null;
  // Φωτογραφίες από το Pexels (δωρεάν, επιτρέπει αυτόματη επιλογή, με αναφορά φωτογράφου)
  if (env.PEXELS_API_KEY && draft.imageQuery) {
    try {
      const r = await fetch(`https://api.pexels.com/v1/search?per_page=5&orientation=landscape&query=${encodeURIComponent(draft.imageQuery)}`, { headers: { Authorization: env.PEXELS_API_KEY } });
      const d = await r.json();
      const p = (d.photos || [])[0];
      if (p) return { type: "photo", url: p.src.large2x || p.src.large, alt: p.alt || draft.en.title, credit: `Photo: ${p.photographer} / Pexels`, creditUrl: p.url, license: "Pexels License", fallbackKey: key };
    } catch (e) { log("pexels", e.message); }
  }
  return { type: "illustration", key: key || "sea" };
}
function uniqueSlug(s) {
  const taken = new Set(loadArticles().map((a) => a.slug));
  let slug = slugify(s), n = 2;
  while (taken.has(slug)) slug = `${slugify(s)}-${n++}`;
  return slug;
}
async function publish(draft, item, pick, text) {
  const article = {
    slug: uniqueSlug(draft.slug || draft.en.title),
    section: SECTION_SLUGS.includes(draft.section) ? draft.section : (pick.section || item.sectionHint || "politics"),
    publishedAt: isoAthens(), updatedAt: null,
    sensitive: !!(draft.sensitive || pick.sensitive), sponsored: false,
    breaking: !!((draft.breaking || pick.breaking) && item.official),
    geo: item.geo || draft.geo || null,
    sources: [{ name: item.sourceName, url: item.url }],
    image: await pickImage(draft),
    he: { title: draft.he.title, dek: draft.he.dek, tldr: draft.he.tldr.slice(0, 3), means: draft.he.means || "", body: draft.he.body },
    en: { title: draft.en.title, dek: draft.en.dek, tldr: draft.en.tldr.slice(0, 3), means: draft.en.means || "", body: draft.en.body },
    meta: { itemId: item.id, imageQuery: draft.imageQuery || "", sourceHash: sha(text), model: provider() === "gemini" ? (env.GEMINI_MODEL || "gemini-2.5-flash") : WRITE_MODEL, checkedAt: new Date().toISOString(), official: item.official },
  };
  if (article.breaking) article.section = "breaking";
  saveArticle(article);
  if (!article.breaking || !item.official) state.today.count++;
  state.today.published.push({ slug: article.slug, title: article.en.title, at: article.publishedAt, section: article.section });
  log("✓ δημοσιεύθηκε", article.slug);
  await distribute(article);
  return article;
}
async function distribute(a) {
  const text = `${a.breaking ? "🔴 " : ""}${a.he.title}\n\n${a.he.dek}\n\n${articleUrl(a)}`;
  if (env.TELEGRAM_CHANNEL_ID) await tg("sendMessage", { chat_id: env.TELEGRAM_CHANNEL_ID, text });
  if (env.MAKE_WEBHOOK_URL && !DRY) {
    // Make.com / Zapier: ανάρτηση σε Facebook, Instagram, X κ.λπ.
    await fetch(env.MAKE_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      url_he: articleUrl(a), url_en: articleUrl(a, "en"), title_he: a.he.title, title_en: a.en.title, dek_he: a.he.dek, dek_en: a.en.dek,
      section: a.section, breaking: a.breaking, image: a.image.type === "photo" ? a.image.url : SITE.url + "/og.png",
      post_he: text, post_en: `${a.en.title}\n\n${a.en.dek}\n\n${articleUrl(a, "en")}`,
    }) }).catch((e) => log("make webhook", e.message));
  }
}
async function askApproval(id) {
  const p = state.pending[id];
  const d = p.draft;
  const msg = `🟡 Ευαίσθητο θέμα – χρειάζεται έγκριση (ID ${id})
${d.en.title}
${d.he.title}

${d.en.dek}

• ${d.en.tldr.join("\n• ")}

Πηγή: ${p.item.sourceName}
${p.item.url}
${p.issues && p.issues.length ? "\nΣημειώσεις ελέγχου: " + p.issues.join("; ") : ""}
Αν δεν απαντήσεις σε ${APPROVAL_TIMEOUT_MIN} λεπτά, θα δημοσιευτεί μια σύντομη ουδέτερη εκδοχή μόνο με τα επίσημα γεγονότα.`;
  await notifyOwner(msg, { reply_markup: { inline_keyboard: [[{ text: "✅ Δημοσίευση", callback_data: `approve:${id}` }, { text: "❌ Απόρριψη", callback_data: `reject:${id}` }], [{ text: "✏️ Αλλαγή", callback_data: `edit:${id}` }]] } });
}
async function approve(id) {
  const p = state.pending[id];
  if (!p) return notifyOwner("Δεν βρέθηκε: " + id);
  const a = await publish(p.draft, p.item, p.pick, p.text || "");
  delete state.pending[id];
  await notifyOwner("✅ Δημοσιεύθηκε: " + articleUrl(a));
}
async function editPending(id, instruction) {
  const p = state.pending[id];
  if (!p) return notifyOwner("Δεν βρέθηκε: " + id);
  const r = await write(p.item, p.pick, { instruction });
  if (r.issues.length) return notifyOwner("Η νέα εκδοχή δεν πέρασε τους ελέγχους: " + r.issues.join("; "));
  Object.assign(p, { draft: r.draft, text: r.text, issues: [] });
  await askApproval(id);
}
async function removeArticle(slug) {
  const a = loadArticles().find((x) => x.slug === slug);
  if (!a) return notifyOwner("Δεν βρέθηκε άρθρο: " + slug);
  a.hidden = true; saveArticle(a);
  await notifyOwner("🗑 Κατέβηκε από το site: " + slug);
}
async function manualStory(url) {
  if (!/^https?:\/\//.test(url)) return notifyOwner("Στείλε: /story https://...");
  const item = { id: sha(url), url, title: url, summary: "", sourceName: new URL(url).hostname.replace(/^www\./, ""), official: false };
  const pick = { section: null, sensitive: false, breaking: false };
  await handlePick({ ...pick, item }, { manual: true });
}
async function handlePick(pick, { manual = false } = {}) {
  const item = pick.item;
  const r = await write(item, pick);
  if (r.issues.length) { reject(item.title, r.issues.join("; ")); if (manual) await notifyOwner("Δεν πέρασε τους ελέγχους: " + r.issues.join("; ")); return; }
  const sensitive = !!(pick.sensitive || r.draft.sensitive);
  const breaking = !!((pick.breaking || r.draft.breaking) && item.official);
  if (sensitive && !breaking && !manual) {
    const id = sha(item.id).slice(0, 6);
    state.pending[id] = { createdAt: Date.now(), item, pick, draft: r.draft, text: r.text, issues: [] };
    await askApproval(id);
    return;
  }
  const a = await publish(r.draft, item, { ...pick, breaking }, r.text);
  if (manual) await notifyOwner("✅ Δημοσιεύθηκε: " + articleUrl(a));
}

/* Ευαίσθητα χωρίς απάντηση → σύντομη ουδέτερη εκδοχή */
async function timeouts() {
  for (const [id, p] of Object.entries(state.pending)) {
    if (Date.now() - p.createdAt < APPROVAL_TIMEOUT_MIN * 60e3) continue;
    delete state.pending[id];
    try {
      const r = await write(p.item, p.pick, { neutral: true });
      if (r.issues.length) { reject(p.draft.en.title, "Ουδέτερη εκδοχή: " + r.issues.join("; ")); continue; }
      r.draft.sensitive = true;
      const a = await publish(r.draft, p.item, p.pick, r.text);
      await notifyOwner(`⏱ Δεν υπήρξε απάντηση για ${id}. Δημοσιεύθηκε σύντομη ουδέτερη εκδοχή: ${articleUrl(a)}\nΓια κατέβασμα: /remove ${a.slug}`);
    } catch (e) { reject(p.draft.en.title, e.message); }
  }
}

/* ================= 8. Ενημερώσεις άρθρων ================= */
async function updates() {
  const recent = loadArticles().filter((a) => a.meta && a.meta.sourceHash && !a.hidden && Date.now() - Date.parse(a.publishedAt) < 72 * 3600e3)
    .sort((a, b) => (a.meta.checkedAt || "").localeCompare(b.meta.checkedAt || "")).slice(0, 2);
  for (const a of recent) {
    try {
      const text = mainText(await fetchText(a.sources[0].url));
      a.meta.checkedAt = new Date().toISOString();
      if (text.length < 300 || sha(text) === a.meta.sourceHash) { saveArticle(a); continue; }
      const u = parseJSON(await claude({ system: WRITE_SYSTEM, prompt: updatePrompt({ article: a, text, today: now.date }), model: WRITE_MODEL, maxTokens: 7000 }));
      a.meta.sourceHash = sha(text);
      if (u.changed && !shapeOk(u)) {
        const issues = await checks(u, text);
        if (!issues.length) {
          a.he = { ...a.he, ...u.he }; a.en = { ...a.en, ...u.en }; a.updatedAt = isoAthens();
          log("↻ ενημερώθηκε", a.slug);
          if (a.sensitive) await notifyOwner(`↻ Ενημερώθηκε αυτόματα (η πηγή άλλαξε): ${articleUrl(a)}`);
        }
      }
      saveArticle(a);
    } catch (e) { log("update", a.slug, e.message); }
  }
}

/* ================= Φωτογραφίες σε παλαιότερα άρθρα ================= */
// Όταν υπάρχει κλειδί Pexels, βάζει φωτογραφία σε άρθρα που έχουν ακόμα εικονογράφηση (έως 4 ανά εκτέλεση)
async function backfillPhotos() {
  if (!env.PEXELS_API_KEY) return;
  const list = loadArticles().filter((a) => !a.hidden && (!a.image || a.image.type !== "photo") && !(a.meta && a.meta.photoTried))
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "")).slice(0, 4);
  for (const a of list) {
    const query = a.imageQuery || (a.meta && a.meta.imageQuery) || a.en.title.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3).slice(0, 4).join(" ") + " Greece";
    const img = await pickImage({ imageKey: a.image && a.image.key, imageQuery: query, en: a.en });
    a.meta = { ...(a.meta || {}), photoTried: true };
    if (img.type === "photo") { a.image = img; log("📷 φωτογραφία:", a.slug); }
    saveArticle(a);
  }
}

/* ================= Εκτέλεση ================= */
(async () => {
  if (!hasAI()) { log("Δεν έχει οριστεί ακόμα κλειδί AI (GEMINI_API_KEY ή ANTHROPIC_API_KEY) – παράλειψη."); return; }
  try {
    await handleTelegram();
    if (state.paused) { log("σε παύση"); return; }
    await timeouts();
    const items = await collect();
    log(`νέα θέματα: ${items.length}`);
    const picks = await select(items);
    log(`επιλέχθηκαν: ${picks.length}`);
    for (const p of picks) {
      try { await handlePick(p); } catch (e) { reject(p.item.title, "Σφάλμα: " + e.message); state.today.errors.push(e.message); }
    }
    if (env.UPDATE_CHECK !== "0") await updates();
    await backfillPhotos();
  } catch (e) {
    log("ΣΦΑΛΜΑ", e.stack || e.message);
    state.today.errors.push(String(e.message));
    if (state.today.errors.length === 3) await notifyOwner("⚠️ Η αυτόματη ροή έχει σφάλματα: " + e.message);
    process.exitCode = 1;
  } finally { save(); }
})();
