// Yavanet – αυτόματη ροή περιεχομένου. Τρέχει κάθε 15 λεπτά (GitHub Actions).
// 1) εντολές ιδιοκτήτη από Telegram  2) συλλογή πηγών  3) επιλογή θεμάτων (AI)
// 4) συγγραφή εβραϊκά/αγγλικά (AI)  5) έλεγχοι  6) δημοσίευση ή έγκριση  7) διανομή  8) ενημερώσεις άρθρων
import fs from "node:fs";
import path from "node:path";
import {
  ROOT, STATE_FILE, env, DRY, log, sha, readJSON, writeJSON, athensNow, isoAthens, fetchText, parseFeed, mainText, extractLinks,
  claude, provider, hasAI, aiQuotaHit, parseJSON, tg, notifyOwner, loadArticles, saveArticle, slugify, missingNumbers, overlapRatio, pushSend, pushSetup,
  seoFields,
} from "./lib.mjs";
import { SELECT_SYSTEM, selectPrompt, WRITE_SYSTEM, writePrompt, VERIFY_SYSTEM, verifyPrompt, neutralPrompt, updatePrompt } from "./prompts.mjs";
import { SITE, SECTIONS } from "../site/config.mjs";
import { ART_KEYS } from "../site/art.mjs";

// Όριο ανά μέρα ΚΑΙ ανά ώρα: έτσι δεν «καίγεται» όλο το όριο το πρωί και μένει το απόγευμα χωρίς άρθρα
const MAX_PER_DAY = Number(env.MAX_PER_DAY || 36);
const MAX_PER_HOUR = Number(env.MAX_PER_HOUR || 4);
const MIN_PER_DAY = Number(env.MIN_PER_DAY || 8);
const MAX_PER_RUN = Number(env.MAX_PER_RUN || 4);
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

// Κλήση AI που επιστρέφει JSON· αν η απάντηση βγει «χαλασμένη», ξαναδοκιμάζει μία φορά
async function ask(opts) {
  for (let i = 0; ; i++) {
    const text = await claude(opts);
    try { return parseJSON(text); } catch (e) { if (i >= 2) throw new Error("Μη έγκυρη απάντηση AI: " + e.message); log("μη έγκυρο JSON, νέα προσπάθεια"); }
  }
}

/* ================= 1. Εντολές ιδιοκτήτη (Telegram) ================= */
async function handleTelegram() {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_OWNER_CHAT_ID) return;
  // Άμεση λειτουργία: το μήνυμα/κουμπί ήρθε από το site (webhook) μέσω GitHub
  if (env.TG_UPDATE) {
    try { await processUpdate(JSON.parse(env.TG_UPDATE)); } catch (e) { log("TG_UPDATE", e.message); }
    return;
  }
  const updates = (await tg("getUpdates", { offset: state.tgOffset + 1, timeout: 0, allowed_updates: ["message", "callback_query"] })) || [];
  for (const u of updates) { state.tgOffset = Math.max(state.tgOffset, u.update_id); await processUpdate(u); }
}
async function processUpdate(u) {
  const cq = u.callback_query, msg = u.message;
  const chat = String((cq ? cq.message.chat.id : msg && msg.chat.id) || "");
  if (chat !== String(env.TELEGRAM_OWNER_CHAT_ID)) return; // μόνο ο ιδιοκτήτης
  try {
    if (cq) {
      const [action, id] = String(cq.data || "").split(":");
      if (!env.TG_UPDATE) await tg("answerCallbackQuery", { callback_query_id: cq.id });
      if (action === "approve") await approve(id);
      else if (action === "reject") { if (state.pending[id]) { reject(state.pending[id].draft.en.title, "Απορρίφθηκε από τον ιδιοκτήτη"); delete state.pending[id]; await notifyOwner("✓ Απορρίφθηκε."); } }
      else if (action === "edit") await notifyOwner(`Στείλε: /edit ${id} <τι να αλλάξει>\nπ.χ. /edit ${id} πιο σύντομο, χωρίς το δεύτερο κομμάτι`);
      return;
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
// Απεργίες στις μεταφορές: το πιο χρήσιμο νέο για Ισραηλινό τουρίστα – παρακάμπτουν τα όρια
const STRIKE_RE = /απεργ|στάσ(η|εις) εργασίας|χειρόφρενο|ΠΝΟ(?![Α-Ωα-ωά-ώ])|ΟΣΥΠΑ|ελεγκτ(ές|ών) εναέριας|\bstrike|walkout/i;
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
      // Νέα πηγή χωρίς ημερομηνίες (html): την πρώτη φορά σημειώνουμε ό,τι υπάρχει ως «ήδη γνωστό», για να μη δημοσιευτούν παλιά νέα
      if (s.type === "html" && !state.sourceStatus[s.id]) { for (const i of list) state.seen[sha(i.url)] = Date.now() + 76 * 86400e3; state.sourceStatus[s.id] = { ok: true, at: new Date().toISOString(), items: list.length, baseline: true }; continue; }
      if (s.include) list = list.filter((i) => new RegExp(s.include, "i").test(i.title + " " + i.summary));
      if (s.exclude) list = list.filter((i) => !new RegExp(s.exclude, "i").test(i.title + " " + i.summary));
      const fresh = list.filter((i) => { const t = Date.parse(i.published); return !t || Date.now() - t < 36 * 3600e3; });
      for (const i of fresh) {
        const id = sha(i.url);
        if (state.seen[id]) continue;
        items.push({ ...i, id, sourceId: s.id, sourceName: s.name, official: !!s.official, emergency: !!s.emergency, sectionHint: s.section, strike: STRIKE_RE.test(i.title + " " + (i.summary || "")) });
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
  const hourAgo = Date.now() - 3600e3;
  const lastHour = (state.today.published || []).filter((x) => Date.parse(x.at) > hourAgo).length;
  const remaining = Math.max(0, Math.min(MAX_PER_DAY - state.today.count, MAX_PER_HOUR - lastHour));
  if (!remaining && !items.some((i) => i.official || i.strike)) { log(`όριο (ημέρα ${state.today.count}/${MAX_PER_DAY}, ώρα ${lastHour}/${MAX_PER_HOUR}) – η επιλογή περιμένει`); return []; }
  let hint = "";
  if (now.hour >= 17 && state.today.count < MIN_PER_DAY) hint = `\nWe have published only ${state.today.count} today; our minimum is ${MIN_PER_DAY}. Be a bit more inclusive with relevant items.`;
  const out = (await ask({ system: SELECT_SYSTEM, prompt: selectPrompt(items, { remaining: Math.min(remaining, MAX_PER_RUN) + 2, recentTitles: recent }) + hint, model: SELECT_MODEL, maxTokens: 2000, temperature: 0, role: "select" }));
  for (const i of items) state.seen[i.id] = Date.now() + (i.published ? 0 : 76 * 86400e3); // σελίδες χωρίς ημερομηνία: μνήμη 90 ημερών
  const picks = (out.picks || []).map((p) => ({ ...p, item: items.find((i) => i.id === p.id) })).filter((p) => p.item);
  // Καταγραφή για έλεγχο: τι είδε η AI και τι διάλεξε
  const chosen = new Set(picks.map((p) => p.id));
  state.lastSelection = { at: new Date().toISOString(), considered: items.length, picked: picks.length, items: items.slice(0, 30).map((i) => `${chosen.has(i.id) ? "✓" : "·"} ${i.sourceId} | ${i.title.slice(0, 90)}`) };
  // Τα έκτακτα από επίσημες πηγές δεν μετράνε στο ημερήσιο όριο
  const brk = picks.filter((p) => (p.breaking && p.item.official) || p.item.strike);
  const allNormal = picks.filter((p) => !brk.includes(p));
  const normal = allNormal.slice(0, Math.min(MAX_PER_RUN, remaining));
  // Όσα επιλέχθηκαν αλλά δεν χωράνε τώρα, ξαναεξετάζονται στην επόμενη εκτέλεση
  for (const p of [...allNormal.slice(normal.length), ...brk.slice(3)]) delete state.seen[p.item.id];
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
// Το AI μερικές φορές «μπλέκει» ελληνικά/αραβικά γράμματα μέσα σε εβραϊκές λέξεις (π.χ. סקיאθος).
// Μεταγράφουμε τα ξένα γράμματα σε εβραϊκά· ό,τι δεν διορθώνεται αναφέρεται ως πρόβλημα.
const GR2HE = { α: "א", ά: "א", β: "ב", γ: "ג", δ: "ד", ε: "", έ: "", ζ: "ז", η: "י", ή: "י", θ: "ת", ι: "י", ί: "י", ϊ: "י", κ: "ק", λ: "ל", μ: "מ", ν: "נ", ξ: "קס", ο: "ו", ό: "ו", π: "פ", ρ: "ר", σ: "ס", ς: "ס", τ: "ט", υ: "י", ύ: "י", φ: "פ", χ: "ח", ψ: "פס", ω: "ו", ώ: "ו" };
const GR2LAT = { Α: "A", Β: "V", Γ: "G", Δ: "D", Ε: "E", Ζ: "Z", Η: "I", Θ: "TH", Ι: "I", Κ: "K", Λ: "L", Μ: "M", Ν: "N", Ξ: "X", Ο: "O", Π: "P", Ρ: "R", Σ: "S", Τ: "T", Υ: "Y", Φ: "F", Χ: "CH", Ψ: "PS", Ω: "O" };
const AR2HE = { "ا": "א", "أ": "א", "إ": "א", "آ": "א", "ب": "ב", "ت": "ת", "ث": "ת", "ج": "ג", "ح": "ח", "خ": "ח", "د": "ד", "ذ": "ד", "ر": "ר", "ز": "ז", "س": "ס", "ش": "ש", "ص": "צ", "ض": "ד", "ط": "ט", "ظ": "ז", "ع": "ע", "غ": "ג", "ف": "פ", "ق": "ק", "ك": "ק", "ک": "ק", "ل": "ל", "م": "מ", "ن": "נ", "ه": "ה", "و": "ו", "ي": "י", "ی": "י", "ى": "י", "ة": "ה", "ء": "" };
const MIXED = /[\u0590-\u05FF]+[A-Za-z\u0370-\u03FF\u0600-\u06FF]+[\u0590-\u05FF]*|[\u0370-\u03FF\u0600-\u06FF]+[\u0590-\u05FF]+/g;
function fixScripts(draft) {
  if (!draft || !draft.he) return draft;
  const fix = (t) => typeof t !== "string" ? t : t
    .replace(MIXED, (w) => [...w].map((c) => GR2HE[c.toLowerCase()] ?? AR2HE[c] ?? c).join(""))
    .replace(/[\u0600-\u06FF]+/g, (w) => [...w].map((c) => AR2HE[c] ?? "").join(""))
    // ελληνική λέξη μόνη της μέσα σε εβραϊκό κείμενο: ακρωνύμια → λατινικά (ΕΛΣΤΑΤ → ELSTAT), ονόματα → εβραϊκά (Λέσβος → לסבוס)
    .replace(/[\u0370-\u03FF\u1F00-\u1FFF]+/g, (w) => w === w.toUpperCase() && w.length > 1
      ? [...w.normalize("NFD").replace(/[\u0300-\u036f]/g, "")].map((c) => GR2LAT[c] ?? c).join("")
      : [...w].map((c) => GR2HE[c.toLowerCase()] ?? c).join(""));
  for (const k of Object.keys(draft.he)) draft.he[k] = Array.isArray(draft.he[k]) ? draft.he[k].map(fix) : fix(draft.he[k]);
  return draft;
}
function mixedLeft(draft) { return (JSON.stringify(draft.he).replace(/\\n/g, " ").match(MIXED) || []); }
// Διορθώσεις ορθογραφίας στα εβραϊκά από τον ελεγκτή (μόνο σύντομες, μόνο αν το λάθος υπάρχει αυτούσιο)
function applyHeFixes(draft, fixes) {
  let n = 0;
  for (const f of (Array.isArray(fixes) ? fixes : []).slice(0, 15)) {
    if (!f || typeof f.from !== "string" || typeof f.to !== "string" || !f.from.trim() || f.from === f.to || f.from.length > 60 || f.to.length > 80) continue;
    if (!/[\u0590-\u05FF]/.test(f.to) || /[A-Za-z\u0370-\u03FF]/.test(f.to.replace(/[A-Z]{2,}/g, ""))) continue;
    for (const k of Object.keys(draft.he)) {
      const rep = (x) => typeof x === "string" && x.includes(f.from) ? (n++, x.split(f.from).join(f.to)) : x;
      draft.he[k] = Array.isArray(draft.he[k]) ? draft.he[k].map(rep) : rep(draft.he[k]);
    }
  }
  if (n) log("hebrew fixes", n);
}
async function checks(draft, text) {
  const shape = shapeOk(draft); if (shape) return [shape];
  fixScripts(draft);
  const issues = [];
  const mx = mixedLeft(draft);
  if (mx.length) issues.push("Mixed-script (broken) Hebrew words: " + mx.slice(0, 5).join(", ") + ". Write every Hebrew word only in Hebrew letters.");
  const all = (l) => [draft[l].title, draft[l].dek, ...draft[l].tldr, draft[l].means || "", draft[l].body].join("\n");
  const miss = missingNumbers(all("en") + "\n" + all("he"), text);
  if (miss.length) issues.push("Αριθμοί που δεν υπάρχουν στην πηγή: " + miss.slice(0, 6).join(", "));
  const ov = overlapRatio(all("en"), text);
  if (ov > 0.2) issues.push(`Μεγάλη ομοιότητα με την πηγή (${Math.round(ov * 100)}%)`);
  if (!issues.length) {
    const v = (await ask({ system: VERIFY_SYSTEM, prompt: verifyPrompt({ text, article: draft }), model: WRITE_MODEL, maxTokens: 1500, temperature: 0 }));
    applyHeFixes(draft, v.fixes);
    if (!v.ok && (v.issues || []).length) issues.push(...v.issues);
    else if (!v.ok) issues.push("Ο έλεγχος γεγονότων απέρριψε το άρθρο");
  }
  return issues;
}
async function write(item, pick, { instruction, neutral } = {}) {
  const text = await sourceText(item);
  const source = { name: item.sourceName, url: item.url };
  const prompt = neutral ? neutralPrompt({ source, text, today: now.date }) : writePrompt({ source, text, section: pick.section || item.sectionHint, sensitive: pick.sensitive, breaking: pick.breaking, today: now.date, instruction });
  let draft = (await ask({ system: WRITE_SYSTEM, prompt, model: WRITE_MODEL, maxTokens: 7000 }));
  let issues = await checks(draft, text);
  if (issues.length && !neutral) {
    // Μία προσπάθεια διόρθωσης
    draft = (await ask({ system: WRITE_SYSTEM, prompt: prompt + `\n\nA previous draft was rejected for: ${issues.join("; ")}. Fix these problems.`, model: WRITE_MODEL, maxTokens: 7000 }));
    issues = await checks(draft, text);
  }
  return { draft, issues, text };
}

/* ================= 6. Δημοσίευση / έγκριση ================= */
const photoId = (u) => (String(u || "").match(/photos\/(\d+)/) || [])[1] || u;
async function pickImage(draft) {
  const key = ART_KEYS.includes(draft.imageKey) ? draft.imageKey : null;
  // Φωτογραφίες από το Pexels (δωρεάν, επιτρέπει αυτόματη επιλογή, με αναφορά φωτογράφου)
  if (env.PEXELS_API_KEY && draft.imageQuery) {
    try {
      const r = await fetch(`https://api.pexels.com/v1/search?per_page=15&orientation=landscape&query=${encodeURIComponent(draft.imageQuery)}`, { headers: { Authorization: env.PEXELS_API_KEY } });
      const d = await r.json();
      // Όχι την ίδια φωτογραφία σε δύο άρθρα: παραλείπει όσες χρησιμοποιούνται ήδη
      const used = new Set(loadArticles().filter((a) => a.image && a.image.type === "photo" && a.slug !== draft.slug).map((a) => photoId(a.image.url)));
      const photos = d.photos || [];
      const p = photos.find((x) => !used.has(String(x.id))) || photos[0];
      if (p) return { type: "photo", url: p.src.large2x || p.src.large, alt: p.alt || draft.en.title, credit: `Photo: ${p.photographer} / Pexels`, creditUrl: p.url, license: "Pexels License", fallbackKey: key };
    } catch (e) { log("pexels", e.message); }
  }
  return { type: "illustration", key: key || "sea" };
}
// Ειδοποίηση στο κινητό: απεργίες πάντα, έκτακτα από επίσημη πηγή το πολύ 1 ανά 3 ώρες
async function maybePush(a, item) {
  const isStrike = !!a.strike, isEmergency = a.breaking && item.official;
  if (!isStrike && !isEmergency) return;
  if (!isStrike && state.lastPush && Date.now() - state.lastPush < 3 * 3600e3) return;
  try {
    const r = await pushSend(SITE.url, {
      tag: a.slug,
      he: { title: (isStrike ? "🚨 " : "🔴 ") + a.he.title, body: (a.strike && a.strike.he) || a.he.dek, url: articleUrl(a) },
      en: { title: (isStrike ? "🚨 " : "🔴 ") + a.en.title, body: (a.strike && a.strike.en) || a.en.dek, url: articleUrl(a, "en") },
    });
    if (r.sent) state.lastPush = Date.now();
  } catch (e) { log("push", e.message); }
}
function normStrike(x) {
  if (!x || typeof x !== "object") return null;
  const dates = (Array.isArray(x.dates) ? x.dates : []).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  if (!dates.length) return null;
  const OK = ["flights", "ferries", "metro", "buses", "trains", "taxis", "public-sector", "other"];
  const sectors = (Array.isArray(x.sectors) ? x.sectors : []).filter((v) => OK.includes(v));
  return { dates, sectors: sectors.length ? sectors : ["other"], hours: String(x.hours || "").slice(0, 80), he: String(x.he || "").slice(0, 160), en: String(x.en || "").slice(0, 160) };
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
    strike: normStrike(draft.strike),
    alert: draft.alert && draft.alert.he && draft.alert.en ? { he: String(draft.alert.he).slice(0, 30), en: String(draft.alert.en).slice(0, 30) } : null,
    he: { title: draft.he.title, ...seoFields(draft.he), dek: draft.he.dek, tldr: draft.he.tldr.slice(0, 3), means: draft.he.means || "", body: draft.he.body },
    en: { title: draft.en.title, ...seoFields(draft.en), dek: draft.en.dek, tldr: draft.en.tldr.slice(0, 3), means: draft.en.means || "", body: draft.en.body },
    meta: { itemId: item.id, imageQuery: draft.imageQuery || "", sourceHash: sha(text), model: provider() === "gemini" ? (env.GEMINI_MODEL || "gemini-2.5-flash") : WRITE_MODEL, checkedAt: new Date().toISOString(), official: item.official },
  };
  if (article.breaking) article.section = "breaking";
  if (!article.strike) delete article.strike;
  saveArticle(article);
  if (!(article.breaking && item.official) && !article.strike) state.today.count++;
  if (article.strike) await notifyOwner(`🚨 Απεργία: ${(await toGreek({ t: article.strike.en })).t}\n${(article.strike.dates || []).join(", ")}\n${articleUrl(article)}`);
  await maybePush(article, item);
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
// Μετάφραση στα ελληνικά για τον ιδιοκτήτη (μηνύματα Telegram)· αν αποτύχει, μένουν τα αγγλικά
async function toGreek(x) {
  try {
    const r = await ask({ system: "Μεταφράζεις ειδησεογραφικά κείμενα από τα αγγλικά στα ελληνικά, με φυσικά, απλά ελληνικά. Επιστρέφεις ΜΟΝΟ JSON με τα ίδια κλειδιά.", prompt: JSON.stringify(x), maxTokens: 1200 });
    return r && typeof r === "object" ? { ...x, ...r } : x;
  } catch (e) { log("toGreek", e.message); return x; }
}
async function askApproval(id) {
  const p = state.pending[id];
  const d = p.draft;
  const el = p.el || (p.el = await toGreek({ title: d.en.title, dek: d.en.dek, tldr: d.en.tldr }));
  const msg = `🟡 Ευαίσθητο θέμα – χρειάζεται έγκριση (ID ${id})

📰 ${el.title}

${el.dek}

• ${(Array.isArray(el.tldr) ? el.tldr : d.en.tldr).join("\n• ")}

Εβραϊκός τίτλος: ${d.he.title}
Πηγή: ${p.item.sourceName}
${p.item.url}
${p.issues && p.issues.length ? "\nΣημειώσεις ελέγχου: " + p.issues.join("; ") : ""}
Αν δεν απαντήσεις σε ${APPROVAL_TIMEOUT_MIN} λεπτά, θα δημοσιευτεί μια σύντομη ουδέτερη εκδοχή μόνο με τα επίσημα γεγονότα.`;
  return notifyOwner(msg, { reply_markup: { inline_keyboard: [[{ text: "✅ Δημοσίευση", callback_data: `approve:${id}` }, { text: "❌ Απόρριψη", callback_data: `reject:${id}` }], [{ text: "✏️ Αλλαγή", callback_data: `edit:${id}` }]] } });
}
async function approve(id) {
  const p = state.pending[id];
  if (!p) {
    const done = state.today && state.today.published.find((x) => x.pendingId === id);
    return notifyOwner(done ? "✅ Έχει ήδη δημοσιευθεί." : `Δεν βρέθηκε: ${id}\nΑν μόλις ήρθε, ξαναστείλε σε 1 λεπτό: /approve ${id}`);
  }
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
// Ελέγχει αν το θέμα είναι το ΙΔΙΟ γεγονός με άρθρο των τελευταίων 3 ημερών (π.χ. νέα εξέλιξη)
async function findDuplicate(item) {
  const recent = loadArticles().filter((a) => !a.hidden && a.en && Date.now() - Date.parse(a.publishedAt) < 72 * 3600e3);
  if (!recent.length) return null;
  try {
    const out = await ask({
      system: "You compare news items. Return JSON only.", role: "select", model: SELECT_MODEL, maxTokens: 300, temperature: 0,
      prompt: `NEW ITEM (may be Greek or English):\n${item.title}\n${(item.summary || "").slice(0, 400)}\n\nRECENT ARTICLES (slug | title):\n${recent.map((a) => `${a.slug} | ${a.en.title}`).join("\n")}\n\nIs the new item about the SAME specific event/story as one of the recent articles (for example a new development of the same incident, the same weather warning for the same area, the same law)? Different events that are merely similar topics are NOT the same.\nReturn {"duplicateOf": "<slug>" or null}.`,
    });
    return recent.find((a) => a.slug === out.duplicateOf) || null;
  } catch (e) { log("duplicate check", e.message); return null; }
}
// Νέα εξέλιξη ενός θέματος: ενημερώνει το υπάρχον άρθρο αντί να φτιάξει καινούργιο
function mergeInto(existing, draft, item) {
  for (const l of ["he", "en"]) existing[l] = { title: draft[l].title, dek: draft[l].dek, tldr: draft[l].tldr.slice(0, 3), means: draft[l].means || existing[l].means || "", body: draft[l].body };
  existing.updatedAt = isoAthens();
  const st = normStrike(draft.strike); if (st) existing.strike = st; // π.χ. η απεργία αναβλήθηκε ή άλλαξαν οι ημέρες
  if (!existing.sources.some((x) => x.url === item.url)) existing.sources.unshift({ name: item.sourceName, url: item.url });
  existing.meta = { ...(existing.meta || {}), updatedFrom: item.id };
  saveArticle(existing);
  state.today.published.push({ slug: existing.slug, title: "↻ " + existing.en.title, at: existing.updatedAt, section: existing.section });
  log("↻ ενημερώθηκε (νέα εξέλιξη)", existing.slug);
}

async function handlePick(pick, { manual = false } = {}) {
  const item = pick.item;
  const dup = manual ? null : await findDuplicate(item);
  if (dup && (pick.sensitive || dup.sensitive)) { reject(item.title, `Ίδιο θέμα με «${dup.en.title}» – δεν γράφτηκε ξανά`); return; }
  const r = await write(item, pick, dup ? { instruction: `This is a NEW DEVELOPMENT of a story we already covered ("${dup.en.title}"). Write the complete, updated article with the latest facts from this source, so it can replace the old one.` } : {});
  if (dup && !r.issues.length && !r.draft.sensitive) { mergeInto(dup, r.draft, item); return; }
  if (dup) { reject(item.title, `Ίδιο θέμα με «${dup.en.title}»` + (r.issues.length ? ": " + r.issues.join("; ") : " (ευαίσθητο)")); return; }
  if (r.issues.length) { reject(item.title, r.issues.join("; ")); if (manual) await notifyOwner("Δεν πέρασε τους ελέγχους: " + r.issues.join("; ")); return; }
  const sensitive = !!(pick.sensitive || r.draft.sensitive);
  const breaking = !!((pick.breaking || r.draft.breaking) && item.official);
  if (sensitive && !breaking && !manual) {
    const id = sha(item.id).slice(0, 6);
    state.pending[id] = { createdAt: Date.now(), item, pick, draft: r.draft, text: r.text, issues: [] };
    if (await askApproval(id)) state.pending[id].notified = true;
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
      const u = (await ask({ system: WRITE_SYSTEM, prompt: updatePrompt({ article: a, text, today: now.date }), model: WRITE_MODEL, maxTokens: 7000 }));
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

/* ================= Μόνιμα άρθρα-οδηγοί ================= */
// Όταν δεν βγαίνουν αρκετά νέα, γράφει έναν οδηγό (ταξίδια, ζωή στην Ελλάδα, εβραϊκή Ελλάδα) από τη Wikipedia.
async function evergreen() {
  if (env.EVERGREEN === "0" || aiQuotaHit()) return;
  if (now.hour < 8 || now.hour > 21) return;
  if (state.today.count >= MAX_PER_DAY) return;
  // Οδηγός μόνο όταν έχει περάσει πάνω από ~1 ώρα χωρίς νέο άρθρο
  const lastPub = Math.max(0, ...loadArticles().filter((a) => !a.hidden).map((a) => Date.parse(a.publishedAt) || 0));
  const GAP = Number(env.EVERGREEN_GAP_MIN || 60) * 60e3;
  if (Date.now() - lastPub < GAP) return;
  if (state.lastEvergreen && Date.now() - state.lastEvergreen < GAP) return;
  state.evergreenDone ||= [];
  const { topics = [] } = readJSON(path.join(ROOT, "automation/evergreen.json"), {});
  const t = topics.find((x) => !state.evergreenDone.includes(x.id));
  if (!t) return;
  state.lastEvergreen = Date.now();
  state.evergreenDone.push(t.id);
  try {
    const api = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(t.wiki)}`;
    const d = JSON.parse(await fetchText(api));
    const page = Object.values((d.query && d.query.pages) || {})[0] || {};
    const text = (page.extract || "").slice(0, 14000);
    if (text.length < 800) throw new Error("λίγο κείμενο στη Wikipedia");
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent((page.title || t.wiki).replace(/ /g, "_"))}`;
    const item = { id: "eg-" + t.id, url, title: page.title || t.wiki, summary: "", text, sourceName: `Wikipedia – ${page.title || t.wiki}`, official: false, sectionHint: t.section };
    const pick = { section: t.section, sensitive: false, breaking: false };
    const r = await write(item, pick, { instruction: `This is an EVERGREEN GUIDE, not breaking news. Angle: ${t.angle} Do not describe anything as happening "today" or "this week". Use only facts from the source. Section must be "${t.section}".${t.titleHe ? ` The Hebrew title MUST start with "${t.titleHe}" (this is what Israelis type into Google), e.g. "${t.titleHe}: ...". Make this guide longer and richer: 500–800 words per language, with "## " sections such as how to get around, what to see, beaches or neighbourhoods, and tips.` : ""}` });
    if (r.issues.length) { reject(item.title, "Οδηγός: " + r.issues.join("; ")); return; }
    r.draft.section = t.section; r.draft.breaking = false;
    await publish(r.draft, item, pick, r.text);
    log("📘 οδηγός:", t.id);
  } catch (e) { if (!aiQuotaHit()) reject(t.wiki, "Οδηγός: " + e.message); }
}

/* ================= Φωτογραφίες σε παλαιότερα άρθρα ================= */
// Όταν υπάρχει κλειδί Pexels, βάζει φωτογραφία σε άρθρα που έχουν ακόμα εικονογράφηση (έως 4 ανά εκτέλεση)
async function backfillPhotos() {
  if (!env.PEXELS_API_KEY) return;
  // Χειροκίνητα άρθρα / συνεργάτες: η φωτογραφία τους δεν αλλάζει ποτέ αυτόματα
  const all = loadArticles().filter((a) => !a.hidden && !a.partner && !a.showcase && !(a.meta && (a.meta.lockImage || a.meta.manual && a.image && a.image.type === "photo"))).sort((a, b) => (a.publishedAt || "").localeCompare(b.publishedAt || ""));
  // Διπλές φωτογραφίες: το νεότερο άρθρο παίρνει άλλη (μία προσπάθεια ανά άρθρο)
  const seenIds = new Set(), dups = [];
  for (const a of all) if (a.image && a.image.type === "photo") { const id = photoId(a.image.url); if (seenIds.has(id) && !(a.meta && a.meta.photoDedup)) dups.push(a); seenIds.add(id); }
  const list = all.filter((a) => (!a.image || a.image.type !== "photo") && !(a.meta && a.meta.photoTried)).reverse().concat(dups.reverse()).slice(0, 6);
  for (const a of list) {
    const wasDup = dups.includes(a);
    const query = a.imageQuery || (a.meta && a.meta.imageQuery) || a.en.title.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3).slice(0, 4).join(" ") + " Greece";
    const img = await pickImage({ slug: a.slug, imageKey: a.image && (a.image.key || a.image.fallbackKey), imageQuery: query, en: a.en });
    a.meta = { ...(a.meta || {}), photoTried: true, ...(wasDup ? { photoDedup: true } : {}) };
    if (img.type === "photo" && !(wasDup && photoId(img.url) === photoId(a.image.url))) { a.image = img; log("📷 φωτογραφία:", a.slug); }
    saveArticle(a);
  }
}

/* ================= Εκτέλεση ================= */
// Προσωρινά προβλήματα (όριο AI, δίκτυο): δεν είναι «σφάλματα», ξαναδοκιμάζονται στην επόμενη εκτέλεση
const transient = (e) => /όριο αιτημάτων|υπερφόρτωση|fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|network|aborted|timeout|\b50[234]\b/i.test(String((e && e.message) || e) + " " + String((e && e.cause && e.cause.code) || ""));

(async () => {
  if (!hasAI()) { log("Δεν έχει οριστεί ακόμα κλειδί AI (GEMINI_API_KEY ή ANTHROPIC_API_KEY) – παράλειψη."); return; }
  try {
    await handleTelegram();
    if (!env.TG_UPDATE && state.pushKey !== "ok") { const k = await pushSetup(SITE.url).catch(() => null); if (k) state.pushKey = "ok"; }
    if (env.TG_UPDATE) return; // γρήγορη εκτέλεση μόνο για την εντολή του ιδιοκτήτη
    // Πρώτη σύνδεση με Telegram: μήνυμα καλωσορίσματος + αποστολή όσων περιμένουν έγκριση
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_OWNER_CHAT_ID) {
      if (!state.tgWelcomed) { const ok = await notifyOwner("✅ Το Yavanet συνδέθηκε με το Telegram σου!\nΕδώ θα σου έρχονται τα ευαίσθητα άρθρα για έγκριση και η ημερήσια αναφορά.\n\n" + HELP); if (ok) state.tgWelcomed = true; }
      for (const [id, p] of Object.entries(state.pending)) if (!p.notified && state.tgWelcomed) { await askApproval(id); p.notified = true; }
    }
    if (state.paused) { log("σε παύση"); return; }
    await backfillPhotos(); // χωρίς AI: τρέχει ακόμα κι αν τελείωσε το ημερήσιο όριο
    await timeouts();
    const items = await collect();
    log(`νέα θέματα: ${items.length}`);
    const picks = await select(items);
    log(`επιλέχθηκαν: ${picks.length}`);
    for (const p of picks) {
      if (aiQuotaHit()) { state.seen[p.item.id] = 0; delete state.seen[p.item.id]; continue; } // θα ξαναδοκιμαστεί
      try { await handlePick(p); } catch (e) { if (aiQuotaHit() || transient(e)) { delete state.seen[p.item.id]; log("προσωρινό πρόβλημα, ξανά στην επόμενη εκτέλεση:", e.message); continue; } reject(p.item.title, "Σφάλμα: " + e.message); state.today.errors.push(e.message); }
    }
    await evergreen();
    if (env.UPDATE_CHECK !== "0") await updates();
  } catch (e) {
    if (aiQuotaHit()) { log("Τελείωσε το δωρεάν ημερήσιο όριο AI – συνέχεια στην επόμενη εκτέλεση."); return; }
    if (transient(e)) { log("Προσωρινό πρόβλημα δικτύου/ορίου – συνέχεια στην επόμενη εκτέλεση:", e.message); return; }
    log("ΣΦΑΛΜΑ", e.stack || e.message);
    state.today.errors.push(String(e.message));
    if (state.today.errors.length === 3) await notifyOwner("⚠️ Η αυτόματη ροή έχει σφάλματα: " + e.message);
    process.exitCode = 1;
  } finally { save(); }
})();
