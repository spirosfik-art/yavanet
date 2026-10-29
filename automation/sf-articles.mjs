// S.F. Properties (sfproperties.gr): αυτόματο εβδομαδιαίο άρθρο-οδηγός σε ελληνικά, αγγλικά και εβραϊκά.
// Παίρνει το επόμενο θέμα από το automation/sf-topics.json (με ελεγμένα στοιχεία), γράφει το άρθρο ΜΟΝΟ από αυτά τα στοιχεία,
// ελέγχει ότι δεν εμφανίζονται αριθμοί που δεν υπάρχουν στα στοιχεία, και το προσθέτει στο sf-data/articles.json.
// Ο worker του sfproperties.gr το δημοσιεύει στα /odigoi/<slug>/, /en/guides/<slug>/, /he/guides/<slug>/.
// node automation/sf-articles.mjs [--dry] [--slug=<slug>]
import path from "node:path";
import { ROOT, log, readJSON, writeJSON, hasAI, claude, parseJSON, missingNumbers, notifyOwner } from "./lib.mjs";

const OUT = path.join(ROOT, "sf-data/articles.json");
const TOPICS = readJSON(path.join(ROOT, "automation/sf-topics.json"), []);
const DRY = process.argv.includes("--dry");
const FORCE = (process.argv.find((a) => a.startsWith("--slug=")) || "").slice(7);
const LANGS = { el: "Greek", en: "English", he: "Hebrew" };
const KEY = "5f3e9a1c7b2d4e8fa6c0b19d2e7f4a63";

const SYS = (lang) => `You are the editor of the S.F. Properties website, a real-estate agency in Athens, Greece (sales, rentals, villas, property management).
Write a helpful, well-structured guide article in ${LANGS[lang]} for people who want to buy, rent or invest in property in Greece.
STRICT RULES:
- Use ONLY the facts provided. Do not add any other numbers, percentages, amounts, dates, laws or names. You may explain the facts in plain words.
- No prices of specific properties. No promises of returns. No legal advice: say that the rules are confirmed with a lawyer for each case.
- Natural, native ${LANGS[lang]}; clear, warm, professional; short paragraphs. Write about 600–900 words.
- Write numbers with digits exactly as in the facts.
${lang === "he" ? "- Hebrew: write place names in Hebrew letters with the Latin name in brackets the first time.\n" : ""}- End with a short paragraph inviting the reader to contact S.F. Properties (WhatsApp or the form) for a private presentation.
Return ONLY JSON: {"title":"(max 65 characters)","desc":"(meta description, max 155 characters)","lead":"(one-paragraph intro)","sections":[{"h2":"...","paras":["..."],"bullets":["..."]}],"faq":[{"q":"question","a":"answer"}]}
Use 4–6 sections; "bullets" may be an empty array; 3–4 FAQ items.`;

const allText = (a) => [a.title, a.desc, a.lead, ...(a.sections || []).flatMap((s) => [s.h2, ...(s.paras || []), ...(s.bullets || [])]), ...(a.faq || []).flat()].join("\n");
const BAD = { el: /[\u0590-\u05FF\u0600-\u06FF\u0400-\u04FF\u3040-\u9FFF\uAC00-\uD7AF]/, en: /[\u0370-\u03FF\u0590-\u05FF\u0600-\u06FF\u0400-\u04FF\u3040-\u9FFF\uAC00-\uD7AF]/, he: /[\u0370-\u03FF\u1F00-\u1FFF\u0600-\u06FF\u0400-\u04FF\u3040-\u9FFF\uAC00-\uD7AF]/ };
const NEED = { el: /[\u0370-\u03FF]/g, he: /[\u0590-\u05FF]/g };
const cleanFor = (lang, t) => !BAD[lang].test(t) && (!NEED[lang] || (t.match(NEED[lang]) || []).length > t.replace(/\s/g, "").length * 0.4);
const valid = (a) => a && typeof a.title === "string" && typeof a.lead === "string" && Array.isArray(a.sections) && a.sections.length >= 3 && Array.isArray(a.faq);

// Σειρά μοντέλων: αν το ένα είναι υπερφορτωμένο, δοκιμάζουμε το επόμενο
const MODELS = (process.env.SF_MODELS || "gemini-flash-latest,gemini-2.5-flash,gemini-2.5-pro").split(",").map((x) => x.trim()).filter(Boolean);
const MANUAL = readJSON(path.join(ROOT, "automation/sf-articles-manual.json"), []);
const GAP_DAYS = Number(process.env.SF_GAP_DAYS || 6);
async function write(topic, lang) {
  const src = topic.facts.join("\n") + "\nYear: " + new Date().getFullYear();
  for (let attempt = 1; attempt <= 3; attempt++) {
    let a;
    process.env.GEMINI_MODEL = MODELS[(attempt - 1) % MODELS.length];
    try { a = parseJSON(await claude({ system: SYS(lang), prompt: JSON.stringify({ topic: topic.topic, facts: topic.facts }), maxTokens: 9000, temperature: 0.4 })); }
    catch (e) { log(lang, "σφάλμα:", e.message.slice(0, 160), "(προσπάθεια", attempt + ")"); continue; }
    if (a && Array.isArray(a.faq)) a.faq = a.faq.map((f) => Array.isArray(f) ? f : [f && f.q, f && f.a]).filter((f) => f[0] && f[1]);
    if (!valid(a)) { log(lang, "μη έγκυρο JSON (προσπάθεια", attempt + ")"); continue; }
    if (!cleanFor(lang, allText(a))) { log(lang, "λάθος γράμματα/γλώσσα (προσπάθεια", attempt + ")"); continue; }
    const bad = missingNumbers(allText(a), src);
    if (bad.length) { log(lang, "αριθμοί εκτός στοιχείων:", bad.join(", "), "(προσπάθεια", attempt + ")"); continue; }
    a.title = a.title.slice(0, 90); a.desc = String(a.desc || a.lead).slice(0, 170);
    return a;
  }
  return null;
}

async function main() {
  const data = readJSON(OUT, { articles: [] });
  data.articles = data.articles || [];
  // χειρόγραφα άρθρα (ελεγμένα) μπαίνουν πρώτα, αν δεν υπάρχουν ήδη
  let fresh = null;
  for (const m of MANUAL) if (!data.articles.some((a) => a.slug === m.slug)) { data.articles.push(m); fresh = m; }
  if (fresh && !FORCE) { await finish(data, fresh); return; }
  const last = data.articles.map((a) => a.date).sort().pop();
  if (!FORCE && last && (Date.now() - Date.parse(last + "T00:00:00Z")) / 864e5 < GAP_DAYS) { log("τελευταίο άρθρο", last, "→ το επόμενο σε", GAP_DAYS, "μέρες"); return; }
  const done = new Set(data.articles.map((a) => a.slug));
  const topic = FORCE ? TOPICS.find((t) => t.slug === FORCE) : TOPICS.find((t) => !done.has(t.slug));
  if (!topic) { log("δεν έμειναν θέματα – προσθέστε στο sf-topics.json"); try { await notifyOwner("📰 sfproperties.gr: τελείωσαν τα θέματα των άρθρων – χρειάζονται νέα στο sf-topics.json"); } catch {} return; }
  if (!hasAI()) { log("χωρίς AI key"); return; }
  log("θέμα:", topic.slug);
  const art = { slug: topic.slug, date: new Date().toISOString().slice(0, 10) };
  for (const lang of Object.keys(LANGS)) {
    const a = await write(topic, lang);
    if (!a) { log("απέτυχε η γλώσσα", lang, "→ ξαναδοκιμάζει αύριο"); return; }
    art[lang] = a;
  }
  if (DRY) { console.log(JSON.stringify(art, null, 2).slice(0, 4000)); return; }
  data.articles = [...data.articles.filter((a) => a.slug !== art.slug), art];
  await finish(data, art);
}
async function finish(data, art) {
  data.updated = new Date().toISOString();
  writeJSON(OUT, data);
  log("✓ γράφτηκε", art.slug);
  const urls = [`/odigoi/${art.slug}/`, `/en/guides/${art.slug}/`, `/he/guides/${art.slug}/`].map((p) => "https://sfproperties.gr" + p);
  // ειδοποίηση μηχανών αναζήτησης όταν το άρθρο θα είναι ήδη ορατό (ο worker κρατά cache) – το κάνει το workflow αργότερα
  writeJSON(path.join(ROOT, "sf-data/last-article.json"), { slug: art.slug, urls, key: KEY });
  try { await notifyOwner(`📰 Νέο άρθρο στο sfproperties.gr:\n${art.el.title}\n${urls.join("\n")}`); } catch {}
}
main().catch((e) => { console.error(e); process.exit(1); });
