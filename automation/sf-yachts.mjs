// S.F. Properties Yachting: συγχρονισμός των σκαφών προς πώληση (δημόσια σελίδα πωλήσεων του συνεργάτη) → sf-data/yachts.json.
// Ο worker του sfproperties.gr δείχνει από αυτό τις κάρτες στο /yachting/ και τις σελίδες /yachting/<slug>/.
// Μόνο ανάγνωση (GET) δημόσιων σελίδων· τίποτα δεν αλλάζει στο site-πηγή.
// node automation/sf-yachts.mjs [--dry]
import path from "node:path";
import { ROOT, log, readJSON, writeJSON, fetchText } from "./lib.mjs";

const OUT = path.join(ROOT, "sf-data/yachts.json");
const SRC = "https://atticayachts.com";
const DRY = process.argv.includes("--dry");

const ent = (s) => String(s || "").replace(/&nbsp;|&#160;/g, " ").replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&#8216;|&lsquo;/g, "‘").replace(/&#8217;|&rsquo;/g, "’").replace(/&#8220;|&ldquo;/g, "“").replace(/&#8221;|&rdquo;/g, "”").replace(/&middot;/g, "·").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, "&");
const tx = (h) => ent(String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").trim();
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export function parse(h, url) {
  const o = { src: url };
  o.title = tx((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]);
  const sub = tx((h.match(/<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/) || [])[1]);
  o.location = (sub.split("·")[0] || "").trim();
  o.type = cap((sub.split("·")[1] || "").trim().toLowerCase()).replace(/\byacht\b/i, "yacht");
  const pm = h.match(/Asking Price<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  o.price = pm ? tx(pm[1]) : "";
  o.stats = Object.fromEntries([...h.matchAll(/<p class="mt-3 font-display[^"]*">([\s\S]*?)<\/p>\s*<p class="mt-1\.5[^"]*">([\s\S]*?)<\/p>/g)].map((m) => [tx(m[2]), tx(m[1])]));
  const db = h.match(/data-description-block[^>]*>([\s\S]*?)<button/) || h.match(/data-description-block[^>]*>([\s\S]*?)<\/div>/);
  o.desc = db ? [...db[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => tx(m[1])).filter(Boolean) : [];
  o.specs = [...h.matchAll(/<p class="text-\[10\.5px\] uppercase tracking-\[0\.14em\] text-muted">([\s\S]*?)<\/p>\s*<p class="mt-0\.5 font-medium text-navy">([\s\S]*?)<\/p>/g)].map((m) => [tx(m[1]), tx(m[2])]).filter((x) => x[0] && x[1]);
  const end = h.indexOf("</main>") > 0 ? h.indexOf("</main>") : h.length;
  const pos = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => [m.index, tx(m[1])]);
  o.lists = [];
  for (let k = 0; k < pos.length; k++) {
    if (/General Description|Specifications/i.test(pos[k][1])) continue;
    const seg = h.slice(pos[k][0], k + 1 < pos.length ? pos[k + 1][0] : end);
    const ul = seg.match(/<ul[^>]*>([\s\S]*?)<\/ul>/);
    if (ul) o.lists.push([pos[k][1], [...ul[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((x) => tx(x[1])).filter(Boolean)]);
  }
  const imgs = [];
  for (const m of [...h.matchAll(/<img src="(https:\/\/atticayachts\.com\/wp-content\/uploads\/[^"]+)"[^>]*alt="[^"]*photo \d+"/g), ...h.matchAll(/data-src="(https:\/\/atticayachts\.com\/wp-content\/uploads\/[^"]+)"/g)]) if (!imgs.includes(m[1])) imgs.push(m[1]);
  o.images = imgs;
  // όνομα / μοντέλο / έτος από τον τίτλο: «Heesen 50m – 2021 ELA», «Mondomarine 49m – OCEANOS 2006»
  const [left, right = ""] = o.title.split(/\s+[–-]\s+/);
  const y = right.match(/\b(19|20)\d{2}\b/);
  o.year = y ? y[0] : "";
  o.name = right.replace(/\b(19|20)\d{2}\b/, "").replace(/\s+/g, " ").trim() || left;
  o.model = left.trim();
  return o;
}
const slugOf = (u) => (u.match(/\/yachts\/([^/?#]+)/) || [])[1];

async function mediaSizes(urls) {
  // χάρτης πλήρους εικόνας → μικρότερα μεγέθη (WordPress REST, δημόσιο)
  const want = new Set(urls), map = {};
  for (let page = 1; page <= 120 && want.size; page++) {
    let j;
    try { j = JSON.parse(await fetchText(`${SRC}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=source_url,media_details`, { timeout: 30000 })); } catch (e) { break; }
    if (!Array.isArray(j) || !j.length) break;
    for (const m of j) {
      if (!want.has(m.source_url)) continue;
      const s = (m.media_details && m.media_details.sizes) || {};
      const pick = (k) => s[k] && s[k].source_url;
      map[m.source_url] = { s: pick("medium_large") || pick("boat-thumbnail") || pick("large") || m.source_url, m: pick("large") || pick("1536x1536") || m.source_url, l: pick("1536x1536") || m.source_url, w: (m.media_details || {}).width || 0, h: (m.media_details || {}).height || 0 };
      want.delete(m.source_url);
    }
  }
  return map;
}

async function main() {
  const prev = readJSON(OUT, { yachts: [] });
  const list = await fetchText(`${SRC}/sales/`, { timeout: 30000 });
  const urls = [...new Set([...list.matchAll(/href="(https:\/\/atticayachts\.com\/yachts\/[^/"#?]+)\/?"/g)].map((m) => m[1]))];
  if (urls.length < 5) { log("βρέθηκαν μόνο", urls.length, "σκάφη → τίποτα δεν αλλάζει"); return; }
  log("σκάφη:", urls.length);
  const yachts = [];
  for (const u of urls) {
    try {
      const y = parse(await fetchText(u + "/", { timeout: 30000 }), u);
      y.slug = slugOf(u);
      if (!y.title || !y.images.length) { log("παράλειψη", u); continue; }
      yachts.push(y);
    } catch (e) {
      log(u, e.message);
      const old = (prev.yachts || []).find((x) => x.src === u);
      if (old) yachts.push(old);
    }
  }
  // ίδιο σκάφος καταχωρημένο δύο φορές στην πηγή (ίδιος τίτλος) → κρατάμε μία σελίδα, αυτή με τις περισσότερες φωτογραφίες
  const seen = new Map();
  for (const y of yachts) { const k = y.title.toLowerCase().replace(/\s+/g, " "); const o = seen.get(k); if (!o || y.images.length > o.images.length) seen.set(k, y); }
  if (seen.size < yachts.length) log("διπλά:", yachts.length - seen.size);
  yachts.splice(0, yachts.length, ...yachts.filter((y) => seen.get(y.title.toLowerCase().replace(/\s+/g, " ")) === y));
  const all = yachts.flatMap((y) => y.images);
  const sizes = await mediaSizes(all);
  for (const y of yachts) y.img = y.images.map((u) => sizes[u] || { s: u, m: u, l: u });
  log("εικόνες:", all.length, "με μεγέθη:", Object.keys(sizes).length);
  if (DRY) { console.log(JSON.stringify(yachts.slice(0, 2), null, 2).slice(0, 3000)); return; }
  writeJSON(OUT, { updated: new Date().toISOString(), count: yachts.length, yachts });
  log("γράφτηκε", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
