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
const GROUPS = [["tr", "he", "ar", "zh"], ["ru", "fr", "de", "it"]];
const MAX_CALLS = Number(process.env.SF_MAX_CALLS || 40);

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

const SYS = (langs) => `You translate English real-estate listings from an Athens agency (S.F. Properties) into: ${langs.map((l) => `${NAMES[l]} ("${l}")`).join(", ")}.
Rules:
- Translate FAITHFULLY and naturally, as a native professional real-estate copywriter would. Do not add, embellish or omit facts.
- EXCEPTION: drop any paragraph or phrase that states the asking price or the rent (the page shows the official price separately).
- Keep the SAME number of paragraphs in "desc" (except dropped price-only paragraphs) and the SAME number of items in "features", in the same order.
- Keep numbers, m², street and neighbourhood names (write place names in Latin letters as given), and bullet characters "• ".
- "h1" is a short title like "Apartment, 50 m²": translate the property type, keep "m²".
Return ONLY JSON: {${langs.map((l) => `"${l}":{"h1":"...","desc":["..."],"features":["..."]}`).join(",")}}`;

async function translate(src, langs) {
  const j = parseJSON(await claude({ system: SYS(langs), prompt: JSON.stringify(src), maxTokens: 12000, temperature: 0.2, role: "select" }));
  const out = {};
  for (const l of langs) {
    const o = j && j[l];
    if (o && typeof o.h1 === "string" && Array.isArray(o.desc) && Array.isArray(o.features) && o.desc.length >= Math.min(1, src.desc.length))
      out[l] = { h1: o.h1.trim(), desc: o.desc.map((x) => String(x).trim()).filter(Boolean), features: o.features.map(String) };
  }
  return out;
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
    const cur = items[id] && items[id].hash === hash ? items[id] : { hash, t: {} };
    const missing = LANGS.filter((l) => !cur.t[l]);
    if (!missing.length) { items[id] = cur; continue; }
    if (DRY) { log("θα μεταφραζόταν", id, missing.join(",")); continue; }
    if (!hasAI()) { log("χωρίς AI key – σταματάω"); break; }
    for (const g of GROUPS) {
      const langs = g.filter((l) => missing.includes(l));
      if (!langs.length || calls >= MAX_CALLS || aiQuotaHit()) continue;
      calls++;
      try { Object.assign(cur.t, await translate(src, langs)); changed = true; log("✓", id, langs.join(",")); }
      catch (e) { log("μετάφραση", id, e.message); }
    }
    items[id] = cur;
  }
  // αγγελίες που δεν υπάρχουν πια στη λίστα κρατιούνται (οι σελίδες τους μένουν ως «νοικιάστηκε/πουλήθηκε»)
  if (changed && !DRY) { writeJSON(OUT, { updated: new Date().toISOString(), langs: LANGS, items }); log("γράφτηκε", OUT); }
  else log("καμία αλλαγή");
}
main().catch((e) => { console.error(e); process.exit(1); });
