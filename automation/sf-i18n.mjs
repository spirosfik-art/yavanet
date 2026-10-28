// S.F. Properties (sfproperties.gr): μετάφραση αγγελιών σε 8 γλώσσες για τις σελίδες /tr|he|ar|zh|ru|fr|de|it/properties/<id>/.
// Διαβάζει τις αγγλικές σελίδες αγγελιών του sfproperties.gr, μεταφράζει τίτλο, περιγραφή και χαρακτηριστικά με AI
// ΜΟΝΟ όταν αλλάξει το αγγλικό κείμενο (hash), και γράφει το αποτέλεσμα στο sf-data/listings-i18n.json.
// Το workflow το ανεβάζει στο branch «sf-data», από όπου το διαβάζει ο worker του sfproperties.gr.
// node automation/sf-i18n.mjs            → ενημέρωση
// node automation/sf-i18n.mjs --dry      → μόνο εμφάνιση του τι θα μεταφραζόταν
import path from "node:path";
import { ROOT, log, readJSON, writeJSON, fetchText, hasAI, claude, parseJSON, sha, aiQuotaHit } from "./lib.mjs";

const OUT = path.join(ROOT, "sf-data/listings-i18n.json");
const BASE = "https://sfproperties.gr";
const DRY = process.argv.includes("--dry");
const LANGS = ["tr", "he", "ar", "zh", "ru", "fr", "de", "it"];
const NAMES = { tr: "Turkish", he: "Hebrew", ar: "Arabic", zh: "Simplified Chinese", ru: "Russian", fr: "French", de: "German", it: "Italian" };
const MANUAL = readJSON(path.join(ROOT, "automation/sf-i18n-manual.json"), {});
const MAX_CALLS = Number(process.env.SF_MAX_CALLS || 60);

const ent = (s) => String(s || "")
  .replace(/&nbsp;|&#160;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, "&");
const txt = (h) => ent(String(h).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").trim();

export function parse(html) {
  const h1 = txt((html.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || "");
  const dm = html.match(/<div class="pdp-desc[^"]*" id="pdp-desc">([\s\S]*?)<\/div>/);
  const desc = dm ? [...dm[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => txt(m[1])).filter(Boolean) : [];
  const fm = html.match(/<h2>Features<\/h2>([\s\S]*?)<\/section>/);
  const features = fm ? [...fm[1].matchAll(/>([^<]*[^\s<][^<]*)</g)].map((m) => ent(m[1]).trim()).filter(Boolean) : [];
  return { h1, desc, features };
}

const SYS = (lang) => `You translate a real-estate listing from an Athens agency (S.F. Properties) into ${NAMES[lang]}.
Rules:
- Translate FAITHFULLY and naturally, as a native ${NAMES[lang]} professional real-estate copywriter would. Do not add, embellish or omit facts.
- EXCEPTION: drop any paragraph or line that states the asking price or the asking rent (the page shows the official price separately).
- Write ONLY in ${NAMES[lang]} script; place and street names may stay in Latin letters exactly as given. Never output Greek letters.
- Keep numbers, m², bullet characters "• ", emojis and line breaks.
Return ONLY JSON: {"desc":["paragraph", "..."]} with one item per input paragraph (minus dropped price lines).`;
// Γράμματα που ΔΕΝ επιτρέπονται σε κάθε γλώσσα (π.χ. ελληνικά ή κορεατικά μέσα σε εβραϊκό κείμενο = χαλασμένη μετάφραση)
const SCRIPTS = { greek: /[\u0370-\u03FF\u1F00-\u1FFF]/, cyr: /[\u0400-\u04FF]/, heb: /[\u0590-\u05FF]/, arab: /[\u0600-\u06FF]/, cjk: /[\u3040-\u30FF\u3400-\u9FFF]/, hangul: /[\uAC00-\uD7AF\u1100-\u11FF]/ };
const BAN = { tr: ["greek", "cyr", "heb", "arab", "cjk", "hangul"], fr: ["greek", "cyr", "heb", "arab", "cjk", "hangul"], de: ["greek", "cyr", "heb", "arab", "cjk", "hangul"], it: ["greek", "cyr", "heb", "arab", "cjk", "hangul"],
  ru: ["greek", "heb", "arab", "cjk", "hangul"], he: ["greek", "cyr", "arab", "cjk", "hangul"], ar: ["greek", "cyr", "heb", "cjk", "hangul"], zh: ["greek", "cyr", "heb", "arab", "hangul"] };
const NEED = { he: SCRIPTS.heb, ar: SCRIPTS.arab, zh: SCRIPTS.cjk, ru: SCRIPTS.cyr };
export function cleanFor(lang, text) {
  if (BAN[lang].some((k) => SCRIPTS[k].test(text))) return false;
  if (NEED[lang] && (text.match(new RegExp(NEED[lang].source, "g")) || []).length < text.replace(/\s/g, "").length * 0.3) return false;
  return true;
}
async function translate(src, lang) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    let j;
    try { j = parseJSON(await claude({ system: SYS(lang), prompt: JSON.stringify({ paragraphs: src.desc }), maxTokens: 8000, temperature: 0.2, role: "select" })); }
    catch (e) { if (aiQuotaHit()) throw e; log("  ✗", lang, e.message.slice(0, 120)); continue; }
    const desc = j && Array.isArray(j.desc) ? j.desc.map((x) => String(x).trim()).filter(Boolean) : [];
    if (desc.length && cleanFor(lang, desc.join("\n"))) return { desc };
    log("  ✗", lang, "απορρίφθηκε (προσπάθεια", attempt + ")");
  }
  return null;
}

async function main() {
  const prev = readJSON(OUT, { items: {} });
  const list = await fetchText(`${BASE}/en/properties/`, { timeout: 30000 });
  const ids = [...new Set([...list.matchAll(/href="\/en\/properties\/(\d{5,})\/"/g)].map((m) => m[1]))];
  if (ids.length < 3) { log("sfproperties: βρέθηκαν μόνο", ids.length, "αγγελίες → τίποτα δεν αλλάζει"); return; }
  log("αγγελίες:", ids.length);
  const items = { ...(prev.items || {}) };
  let calls = 0, changed = false;
  for (const id of ids) {
    if (calls >= MAX_CALLS || aiQuotaHit()) break;
    let src;
    try { src = parse(await fetchText(`${BASE}/en/properties/${id}/`, { timeout: 30000 })); } catch (e) { log(id, "σελίδα:", e.message); continue; }
    if (!src.h1 || !src.desc.length) { log(id, "χωρίς περιγραφή – παράλειψη"); continue; }
    const hash = sha(JSON.stringify(src));
    if (MANUAL[id] && MANUAL[id].hash === hash) { if (!items[id] || !items[id].manual || items[id].hash !== hash) { items[id] = { hash, manual: true, t: MANUAL[id].t }; changed = true; } continue; }
    const cur = items[id] && items[id].hash === hash && !items[id].manual ? items[id] : { hash, t: {} };
    const missing = LANGS.filter((l) => !cur.t[l]);
    if (!missing.length) { items[id] = cur; continue; }
    if (DRY) { log("θα μεταφραζόταν", id, missing.join(",")); continue; }
    if (!hasAI()) { log("χωρίς AI key – σταματάω"); break; }
    for (const l of missing) {
      if (calls >= MAX_CALLS || aiQuotaHit()) break;
      calls++;
      try { const r = await translate(src, l); if (r) { cur.t[l] = r; changed = true; log("✓", id, l); } }
      catch (e) { log("μετάφραση", id, l, e.message); }
    }
    items[id] = cur;
  }
  // αγγελίες που δεν υπάρχουν πια στη λίστα κρατιούνται (οι σελίδες τους μένουν ως «νοικιάστηκε/πουλήθηκε»)
  if (changed && !DRY) { writeJSON(OUT, { updated: new Date().toISOString(), langs: LANGS, items }); log("γράφτηκε", OUT); }
  else log("καμία αλλαγή");
}
main().catch((e) => { console.error(e); process.exit(1); });
