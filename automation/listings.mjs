// Αγγελίες ακινήτων της S.F. Properties (sfproperties.gr) → content/listings.json, για τις σελίδες /nadlan/ του Yavanet.
// node automation/listings.mjs            → ενημερώνει αγγελίες + ισοτιμία EUR→ILS (ΕΚΤ)
// node automation/listings.mjs --dry      → τυπώνει τι βρήκε, χωρίς να γράψει αρχείο
//
// Πηγή: οι δημόσιες σελίδες του sfproperties.gr (δεν υπάρχει feed/API): /poliseis/ και /enoikiaseis/ δίνουν τους
// κωδικούς (/akinita/<id>/), και κάθε σελίδα αγγελίας τα στοιχεία της (πίνακας «Κωδικός / Κατηγορία / Περιοχή / Εμβαδόν…»,
// τιμή, περιγραφή, φωτογραφίες). ΠΟΤΕ δεν «συμπληρώνουμε» στοιχεία: ό,τι δεν διαβάζεται, μένει κενό.
// Αν κάτι αποτύχει (δίκτυο, αλλαγή στη σελίδα), κρατάμε το προηγούμενο αρχείο ή την προηγούμενη εγγραφή της αγγελίας.
// Η περιγραφή μεταφράζεται σε εβραϊκά/αγγλικά με AI μόνο όταν αλλάξει το ελληνικό κείμενο (hash)· χωρίς AI μένει χωρίς μετάφραση.
import path from "node:path";
import crypto from "node:crypto";
import { ROOT, log, readJSON, writeJSON, isoAthens, fetchText, hasAI, claude, parseJSON, notifyOwner } from "./lib.mjs";

const FILE = path.join(ROOT, "content/listings.json");
const BASE = "https://sfproperties.gr";
const ECB = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const DRY = process.argv.includes("--dry");
// Περιοχές που δεν δημοσιεύουμε ποτέ στο Yavanet (οδηγία εκδότη): η αγγελία παραλείπεται και καταγράφεται.
export const EXCLUDED_AREAS = /αμπελ[οό]κηπ|ampelok[iy]p|ψυχικ|psych?ik|psychic|אמפלוקיפ|פסיחיקו/i;
const SOLD_RE = /Πωλήθηκε|Πουλήθηκε|Νοικιάστηκε|Ενοικιάστηκε|\bSold\b|\bRented\b/i;
const KEEP_SOLD_DAYS = 30;

// hash χωρίς κενά/αλλαγές γραμμής: η μορφοποίηση της σελίδας δεν «ακυρώνει» μια σωστή μετάφραση, μόνο αλλαγή κειμένου
export const trHash = (x) => crypto.createHash("sha1").update((String(x.descriptionEl || "") + "|" + (x.features || []).join("|")).replace(/[\s•·]+/g, "")).digest("hex").slice(0, 12);

/* ---------- Βοηθητικά HTML ---------- */
const ent = (s) => String(s || "")
  .replace(/&nbsp;|&#160;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, "&");
// HTML → γραμμές κειμένου (κάθε block στοιχείο σε δική του γραμμή)
const lines = (html) => ent(String(html)
  .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, " ")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/?(p|div|li|ul|ol|h[1-6]|dt|dd|dl|tr|td|th|table|section|article|header|footer|span|strong|b|small|figure|figcaption|label|button|a)\b[^>]*>/gi, "\n")
  .replace(/<[^>]+>/g, " "))
  .split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim()).filter(Boolean);
const num = (s) => { const m = String(s || "").replace(/\./g, "").replace(",", ".").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const meta = (html, prop) => { const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i")) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, "i")); return m ? ent(m[1]).trim() : ""; };

/* ---------- Λίστες: ποιοι κωδικοί υπάρχουν και αν είναι διαθέσιμοι ή πουλήθηκαν/νοικιάστηκαν ---------- */
async function listIds(page, deal) {
  const html = await fetchText(`${BASE}/${page}/`, { timeout: 30000 });
  const out = new Map();
  const re = /href=["'](?:https?:\/\/(?:www\.)?sfproperties\.gr)?\/akinita\/(\d{5,})\/?["']/g;
  let m;
  while ((m = re.exec(html))) {
    const id = m[1];
    // «κάρτα»: από το προηγούμενο <article|<li|<a ως ~1500 χαρακτήρες μετά – εκεί ψάχνουμε σήμα «Πωλήθηκε/Νοικιάστηκε»
    const from = Math.max(0, html.lastIndexOf("<a", m.index) - 400), chunk = html.slice(from, m.index + 1500);
    const nextLink = chunk.slice(m.index - from + 10).search(/\/akinita\/\d{5,}/);
    const card = nextLink > 0 ? chunk.slice(0, m.index - from + 10 + nextLink) : chunk;
    const sold = SOLD_RE.test(lines(card).join(" "));
    const prev = out.get(id);
    out.set(id, { id, deal, sold: prev ? prev.sold && sold : sold });
  }
  return [...out.values()];
}

/* ---------- Σελίδα αγγελίας ---------- */
const LABELS = { "Κωδικός": "code", "Κατηγορία": "category", "Περιοχή": "areaEl", "Εμβαδόν": "sqm", "Υπνοδωμάτια": "bedrooms", "Μπάνια": "bathrooms", "Όροφος": "floorEl", "Έτος κατασκευής": "year", "Ενεργειακή κλάση": "energy" };
const STOP_DESC = /^(Χαρακτηριστικά|Παροχές|Στοιχεία|Επικοινωνία|Τοποθεσία|Παρόμοια|Ενδιαφέρεστε|Κλείστε|Δείτε|Ζητήστε|Φωτογραφίες)(?!\p{L})/u;
export function parseListing(html, id) {
  const L = lines(html);
  const t = ent((html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "").trim();
  // «Μεζονέτα 165 τ.μ., Βούλα, κέντρο · Πώληση | S.F. Properties»
  const tm = t.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*τ\.μ\.,\s*(.+?)\s*·\s*([^|]+?)\s*\|/);
  const h1 = lines((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").join(" ");
  const spec = {};
  L.forEach((l, i) => {
    const k = l.replace(/:$/, "");
    if (LABELS[k] && !spec[LABELS[k]] && L[i + 1] && !LABELS[L[i + 1].replace(/:$/, "")]) spec[LABELS[k]] = L[i + 1];
    const kv = l.match(/^([^:]{3,25}):\s*(.+)$/);
    if (kv && LABELS[kv[1]] && !spec[LABELS[kv[1]]]) spec[LABELS[kv[1]]] = kv[2];
  });
  if (spec.code && spec.code.replace(/\D/g, "") !== String(id)) return null; // λάθος σελίδα
  // Τιμή: η πρώτη «… €» (ή «… € /μήνα») μετά τον τίτλο
  const hi = Math.max(0, L.findIndex((l) => h1 && l === h1));
  const priceLine = L.slice(hi).find((l) => /^[\d.]+\s*€(\s*\/\s*μήνα)?$/.test(l)) || L.slice(hi).find((l) => /\d[\d.]*\s*€/.test(l)) || "";
  const pm = priceLine.match(/(\d[\d.]*)\s*€/);
  // Περιγραφή: το κείμενο κάτω από την επικεφαλίδα «Περιγραφή» ως την επόμενη ενότητα· αλλιώς JSON-LD description
  let descriptionEl = "";
  const di = L.findIndex((l) => /^Περιγραφή( ακινήτου)?$/i.test(l));
  if (di >= 0) { const out = []; for (const l of L.slice(di + 1)) { if (STOP_DESC.test(l) || LABELS[l.replace(/:$/, "")]) break; out.push(l); } descriptionEl = out.join("\n").trim(); }
  if (!descriptionEl) for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { const j = JSON.parse(m[1]); const d = (Array.isArray(j) ? j : [j]).map((x) => x.description).find(Boolean); if (d && d.length > 40) { descriptionEl = ent(d).trim(); break; } } catch {} }
  // Χαρακτηριστικά (chips): λίστα κάτω από «Χαρακτηριστικά»/«Παροχές»
  let features = [];
  const fi = L.findIndex((l) => /^(Χαρακτηριστικά|Παροχές)$/i.test(l));
  if (fi >= 0) for (const l of L.slice(fi + 1, fi + 30)) { if (/^(Περιγραφή|Επικοινωνία|Τοποθεσία|Παρόμοια)/.test(l) || LABELS[l.replace(/:$/, "")]) break; if (l.length < 80) features.push(l); }
  // Φωτογραφίες: όπως τις δείχνει το sfproperties.gr (CDN Spitogatos ή /assets/), χωρίς διπλές
  const imgs = [], seen = new Set(), og = meta(html, "og:image");
  for (const m of [og, ...[...html.matchAll(/https?:\/\/(?:m\d\.spitogatos\.gr\/\d+_\d+x\d+\.(?:jpe?g|webp|png)(?:\?v=\d+)?|(?:www\.)?sfproperties\.gr\/[^"'\s)]*?\/(?:uploads|listings|akinita|photos)\/[^"'\s)]+\.(?:jpe?g|webp|png))/gi)].map((x) => x[0])]) {
    if (!m) continue; const key = (m.match(/\/(\d{6,})_/) || [0, m])[1];
    if (seen.has(key)) continue; seen.add(key); imgs.push(m.replace(/&amp;/g, "&"));
  }
  const category = spec.category || (tm ? tm[4] : "");
  const deal = /Ενοικ/i.test(category) || /Ενοικίαση/.test(t) ? "rent" : "sale";
  const x = {
    id: String(id), deal, category, typeEl: tm ? tm[1] : (h1.match(/^(.+?)\s+\d/) || [0, ""])[1], titleEl: h1 || (tm ? `${tm[1]} ${tm[2]} τ.μ.` : ""),
    areaEl: spec.areaEl || (tm ? tm[3] : ""), price: pm ? num(pm[1]) : null, priceText: priceLine || null,
    sqm: num(spec.sqm) ?? (tm ? num(tm[2]) : null), bedrooms: num(spec.bedrooms), bathrooms: num(spec.bathrooms),
    floorEl: spec.floorEl || null, year: num(spec.year), energy: spec.energy || null,
    features, descriptionEl, images: imgs.slice(0, 40), url: `${BASE}/akinita/${id}/`,
  };
  // Τι ΔΕΝ βρέθηκε καθόλου στη σελίδα (όχι «κενό»): τότε κρατάμε ό,τι είχαμε, αντί να το σβήσουμε
  Object.defineProperty(x, "_missing", { value: { desc: di < 0 && !descriptionEl, features: fi < 0, images: !imgs.length }, enumerable: false });
  if (!x.price || !x.sqm || !x.areaEl) return null; // ελλιπής ανάγνωση → κρατάμε την προηγούμενη εγγραφή
  return x;
}

/* ---------- Μετάφραση (μόνο όταν άλλαξε το ελληνικό κείμενο) ---------- */
const SYS = `You translate Greek real-estate listings for Israeli readers. Translate FAITHFULLY into Hebrew and English.
Rules: do not add, embellish or omit facts, EXCEPT drop any line or phrase that states the asking price or rent (the page shows the official price separately).
Keep street names/numbers in Latin letters in brackets after the Hebrew. Keep bullet lists as lines starting with "• ". Keep paragraph breaks (blank lines).
Never mention the neighbourhoods Ampelokipoi or Psychiko. If the text is already English, the English version is the same text (minus price lines).
Return JSON: {"he":{"desc":"...","features":["..."]},"en":{"desc":"...","features":["..."]}} with features translated 1:1 in the same order.`;
async function translate(x) {
  if (!x.descriptionEl && !x.features.length) return { hash: trHash(x), he: { desc: "", features: [] }, en: { desc: "", features: [] } };
  if (!hasAI()) return null;
  try {
    const j = parseJSON(await claude({ system: SYS, prompt: JSON.stringify({ description: x.descriptionEl, features: x.features }), maxTokens: 4000, temperature: 0.1, role: "select" }));
    const ok = (o) => o && typeof o.desc === "string" && Array.isArray(o.features) && !EXCLUDED_AREAS.test(o.desc + o.features.join(" "));
    if (!ok(j.he) || !ok(j.en)) return null;
    return { hash: trHash(x), he: { desc: j.he.desc.trim(), features: j.he.features.map(String) }, en: { desc: j.en.desc.trim(), features: j.en.features.map(String) } };
  } catch (e) { log("μετάφραση", x.id, e.message); return null; }
}

/* ---------- Ισοτιμία ΕΚΤ ---------- */
export async function ecbRate() {
  const xml = await fetchText(ECB, { timeout: 20000 });
  const date = (xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/) || [])[1];
  const rate = +((xml.match(/currency=['"]ILS['"]\s+rate=['"]([\d.]+)['"]/) || [])[1] || 0);
  if (!date || !(rate > 2 && rate < 8)) throw new Error("ECB: δεν βρέθηκε ILS");
  return { eurIls: rate, date, source: "European Central Bank (ECB) euro reference rates", url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-ils.en.html" };
}

export async function update() {
  const prev = readJSON(FILE, { listings: [] });
  const today = new Date().toISOString().slice(0, 10);
  const out = { ...prev, source: { name: "S.F. Properties", url: BASE + "/" } };
  let changed = false;

  try { const fx = await ecbRate(); if (!prev.fx || prev.fx.date !== fx.date || prev.fx.eurIls !== fx.eurIls) changed = true; out.fx = fx; log(`💱 ECB ${fx.date}: 1€ = ₪${fx.eurIls}`); }
  catch (e) { log("ECB:", e.message, "→ κρατάμε την προηγούμενη ισοτιμία"); }

  let ids = [];
  try { ids = [...(await listIds("poliseis", "sale")), ...(await listIds("enoikiaseis", "rent"))]; }
  catch (e) { log("sfproperties.gr λίστες:", e.message, "→ κρατάμε τις προηγούμενες αγγελίες"); }
  const avail = ids.filter((x) => !x.sold);
  const prevAvail = (prev.listings || []).filter((x) => x.status === "available");
  // Ασφάλεια: αν η σελίδα άλλαξε μορφή και δεν βρίσκουμε σχεδόν τίποτα, δεν σβήνουμε τις αγγελίες
  if (!avail.length || avail.length < prevAvail.length * 0.4) {
    log(`αγγελίες: βρέθηκαν ${avail.length} (πριν ${prevAvail.length}) → χωρίς αλλαγή`);
    if (changed && !DRY) { out.updated = isoAthens(); writeJSON(FILE, out); }
    return out;
  }
  const byId = new Map((prev.listings || []).map((x) => [x.id, x]));
  const next = [], skipped = [];
  for (const c of avail) {
    const old = byId.get(c.id);
    let x = null;
    try { x = parseListing(await fetchText(`${BASE}/akinita/${c.id}/`, { timeout: 30000 }), c.id); } catch (e) { log("αγγελία", c.id, e.message); }
    if (!x && old) { next.push({ ...old, status: "available", lastSeen: today }); continue; }
    if (!x) { skipped.push({ id: c.id, reason: "δεν διαβάστηκε" }); continue; }
    if (old && x._missing.desc) x.descriptionEl = old.descriptionEl || "";
    if (old && x._missing.features) x.features = old.features || [];
    if (old && x._missing.images) x.images = old.images || [];
    if (EXCLUDED_AREAS.test(`${x.areaEl} ${x.titleEl} ${x.descriptionEl}`)) { skipped.push({ id: c.id, reason: "excluded-area", areaEl: x.areaEl }); continue; }
    x.deal = c.deal === "rent" || x.deal === "rent" ? "rent" : "sale";
    x.status = "available"; x.firstSeen = (old && old.firstSeen) || today; x.lastSeen = today;
    x.tr = old && old.tr && old.tr.hash === trHash(x) ? old.tr : (await translate(x)) || (old && old.tr && old.tr.hash === trHash(x) ? old.tr : null);
    next.push(x);
  }
  // Όσες ήταν διαθέσιμες και τώρα φαίνονται «Πωλήθηκε/Νοικιάστηκε»: μένουν 30 μέρες με την ένδειξη. Όσες χάθηκαν εντελώς: φεύγουν.
  const soldIds = new Map(ids.filter((x) => x.sold).map((x) => [x.id, x]));
  for (const old of prev.listings || []) {
    if (next.some((x) => x.id === old.id)) continue;
    if (soldIds.has(old.id) || old.status !== "available") {
      const st = old.status !== "available" ? old.status : old.deal === "rent" ? "rented" : "sold";
      const closedAt = old.closedAt || today;
      if ((Date.parse(today) - Date.parse(closedAt)) / 864e5 <= KEEP_SOLD_DAYS) next.push({ ...old, status: st, closedAt });
    }
  }
  next.sort((a, b) => (a.deal === b.deal ? 0 : a.deal === "sale" ? -1 : 1) || (b.firstSeen || "").localeCompare(a.firstSeen || "") || +b.id - +a.id);
  const sig = (l) => JSON.stringify(l.map(({ lastSeen, ...r }) => r));
  if (sig(next) !== sig(prev.listings || [])) changed = true;
  out.listings = next; out.skipped = skipped;
  const fresh = next.filter((x) => x.status === "available" && !byId.has(x.id));
  log(`🏠 αγγελίες: ${next.filter((x) => x.deal === "sale" && x.status === "available").length} πώληση, ${next.filter((x) => x.deal === "rent" && x.status === "available").length} ενοικίαση, νέες ${fresh.length}, παραλείφθηκαν ${skipped.length}`);
  if (DRY) { console.log(JSON.stringify(out, null, 2).slice(0, 4000)); return out; }
  if (changed) { out.updated = isoAthens(); writeJSON(FILE, out); }
  const noTr = next.filter((x) => x.status === "available" && !x.tr && x.descriptionEl);
  if (fresh.length || noTr.length || skipped.some((s) => s.reason === "excluded-area")) {
    try { await notifyOwner(`🏠 Yavanet /nadlan/: ${fresh.length} νέες αγγελίες${fresh.length ? " (" + fresh.map((x) => x.id).join(", ") + ")" : ""}${noTr.length ? ` · ${noTr.length} χωρίς μετάφραση (χωρίς AI)` : ""}${skipped.length ? ` · παραλείφθηκαν: ${skipped.map((s) => s.id + " " + s.reason).join(", ")}` : ""}`); } catch {}
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) update().catch((e) => { log("listings:", e.message); process.exitCode = 0; });
