// Έλεγχος SEO του dist/ (τρέξτε μετά το build): node scripts/seo-audit.mjs [--verbose]
// Ελέγχει: σπασμένα εσωτερικά links, title/description (κενά, διπλά, μήκος), canonical, hreflang (αμοιβαία),
// <html lang/dir>, og:image, JSON-LD που δεν διαβάζεται, εικόνες χωρίς alt, sitemap (πληρότητα), ορφανές σελίδες.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://yavanet.gr";
const VERBOSE = process.argv.includes("--verbose");

const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const f = path.join(d, e.name); e.isDirectory() ? walk(f) : f.endsWith(".html") && files.push(f); });
walk(DIST);
const urlOf = (f) => "/" + path.relative(DIST, f).replace(/index\.html$/, "").replace(/\\/g, "/");
const exists = (u) => {
  const p = decodeURIComponent(u.split("#")[0].split("?")[0]);
  if (!p || p === "/") return fs.existsSync(path.join(DIST, "index.html"));
  const f = path.join(DIST, p);
  return fs.existsSync(f) && fs.statSync(f).isFile() || fs.existsSync(path.join(f, "index.html"));
};
const issues = {};
const add = (k, v) => (issues[k] = issues[k] || []).push(v);
const attr = (s, re) => { const m = s.match(re); return m ? m[1] : null; };
const pages = {};
const inbound = {};
const SKIP_PAGES = new Set(["/404.html", "/offline.html"]);
for (const f of files) {
  const u = urlOf(f);
  if (SKIP_PAGES.has(u)) continue;
  const s = fs.readFileSync(f, "utf8");
  const noindex = /<meta name="robots" content="noindex/.test(s);
  const title = attr(s, /<title>([^<]*)<\/title>/);
  const desc = attr(s, /<meta name="description" content="([^"]*)"/);
  const canon = attr(s, /<link rel="canonical" href="([^"]+)"/);
  const hl = { he: attr(s, /hreflang="he" href="([^"]+)"/), en: attr(s, /hreflang="en" href="([^"]+)"/), xd: attr(s, /hreflang="x-default" href="([^"]+)"/) };
  const lang = attr(s, /<html lang="([^"]+)"/), dir = attr(s, /<html lang="[^"]+" dir="([^"]+)"/);
  pages[u] = { title, desc, canon, hl, noindex };
  if (!title) add("title-missing", u);
  else if (title.length > 70) add("title-long(>70)", `${u} (${title.length})`);
  if (!desc) add("desc-missing", u);
  else if (desc.length < 50) add("desc-short(<50)", `${u}: ${desc}`);
  if (!canon) add("canonical-missing", u);
  else if (canon !== SITE + u) add("canonical-mismatch", `${u} → ${canon}`);
  if (!hl.he || !hl.en || !hl.xd) add("hreflang-missing", u);
  if (!lang || !dir) add("html-lang-dir-missing", u);
  else if ((u.startsWith("/en/") ? "en" : "he") !== lang) add("html-lang-wrong", `${u}: ${lang}`);
  if (!/property="og:image" content="https?:/.test(s)) add("og-image-missing", u);
  if (!/name="twitter:card"/.test(s)) add("twitter-card-missing", u);
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { add("jsonld-invalid", `${u}: ${e.message}`); } }
  if (/\/a\/[^/]+\/$/.test(u) && !/"@type":"(News)?Article"/.test(s)) add("article-ld-missing", u);
  for (const m of s.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) add("img-no-alt", `${u}: ${m[0].slice(0, 90)}`);
  }
  const body = s.slice(s.indexOf("<body"));
  for (const m of body.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    let h = m[1].replace(/&amp;/g, "&");
    if (h.startsWith(SITE)) h = h.slice(SITE.length) || "/";
    if (!h.startsWith("/") || h.startsWith("//")) continue;
    const t = h.split("#")[0].split("?")[0];
    if (!t) continue;
    if (!exists(t)) add("broken-link", `${u} → ${h}`);
    else if (t !== u) (inbound[t] = inbound[t] || new Set()).add(u);
  }
}
// Διπλά title/description
const dup = (k) => { const m = {}; for (const [u, p] of Object.entries(pages)) if (p[k] && !p.noindex) (m[p[k]] = m[p[k]] || []).push(u); return Object.entries(m).filter(([, v]) => v.length > 1); };
for (const [t, us] of dup("title")) add("title-duplicate", `"${t}" × ${us.length}: ${us.slice(0, 4).join(", ")}`);
for (const [t, us] of dup("desc")) add("desc-duplicate", `"${t.slice(0, 60)}…" × ${us.length}: ${us.slice(0, 4).join(", ")}`);
// hreflang αμοιβαία
for (const [u, p] of Object.entries(pages)) {
  if (!p.hl.he || !p.hl.en) continue;
  const other = (u.startsWith("/en/") ? p.hl.he : p.hl.en).replace(SITE, "");
  const op = pages[other];
  if (!op) { add("hreflang-target-missing", `${u} → ${other}`); continue; }
  const back = (u.startsWith("/en/") ? op.hl.en : op.hl.he);
  if (back && back.replace(SITE, "") !== u) add("hreflang-not-reciprocal", `${u} ↔ ${other} (back: ${back})`);
}
// Sitemap
const sm = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
const smUrls = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "")));
for (const u of smUrls) if (!exists(u)) add("sitemap-url-404", u);
for (const [u, p] of Object.entries(pages)) if (!p.noindex && !smUrls.has(u)) add("sitemap-missing", u);
// Ορφανές (καμία εσωτερική σύνδεση από άλλη σελίδα)
for (const [u, p] of Object.entries(pages)) if (!p.noindex && u !== "/" && !inbound[u]) add("orphan", u);
// robots.txt / news sitemap
const robots = fs.existsSync(path.join(DIST, "robots.txt")) ? fs.readFileSync(path.join(DIST, "robots.txt"), "utf8") : "";
for (const m of robots.matchAll(/Sitemap: (\S+)/g)) if (!exists(m[1].replace(SITE, ""))) add("robots-sitemap-404", m[1]);
if (!/Sitemap: .*news/.test(robots)) add("robots-no-news-sitemap", "robots.txt");

const keys = Object.keys(issues).sort();
console.log(`Σελίδες: ${Object.keys(pages).length} · sitemap: ${smUrls.size}`);
if (!keys.length) console.log("✓ Κανένα πρόβλημα");
for (const k of keys) {
  console.log(`\n✗ ${k}: ${issues[k].length}`);
  for (const v of issues[k].slice(0, VERBOSE ? 1e9 : 8)) console.log("   " + v);
}
process.exitCode = issues["broken-link"] || issues["jsonld-invalid"] ? 1 : 0;
