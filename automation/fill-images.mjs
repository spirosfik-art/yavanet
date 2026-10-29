// Φωτογραφίες Pexels για άρθρα-οδηγούς που γράφτηκαν χωρίς φωτογραφία (image.type "art" + meta.imageQuery).
import { loadArticles, saveArticle, log } from "./lib.mjs";
const KEY = process.env.PEXELS_API_KEY;
if (!KEY) { console.log("::warning::χωρίς PEXELS_API_KEY"); process.exit(0); }
const all = loadArticles();
const pid = (u) => (String(u || "").match(/photos\/(\d+)/) || [])[1];
const used = new Set(all.filter((a) => a.image && a.image.type === "photo").map((a) => pid(a.image.url)));
let n = 0;
for (const a of all.filter((x) => x.image && x.image.type === "art" && x.meta && x.meta.imageQuery)) {
  try {
    const d = await (await fetch(`https://api.pexels.com/v1/search?per_page=20&orientation=landscape&query=${encodeURIComponent(a.meta.imageQuery)}`, { headers: { Authorization: KEY } })).json();
    const p = (d.photos || []).find((x) => !used.has(String(x.id)));
    if (!p) { log("καμία φωτογραφία", a.slug); continue; }
    used.add(String(p.id));
    a.image = { type: "photo", url: p.src.large2x || p.src.large, alt: p.alt || a.en.title, credit: `Photo: ${p.photographer} / Pexels`, creditUrl: p.url, license: "Pexels License", fallbackKey: a.image.key };
    saveArticle(a); n++; log("φωτογραφία", a.slug, p.id);
  } catch (e) { log("σφάλμα", a.slug, e.message); }
}
console.log(`::notice::fill-images: ${n} άρθρα πήραν φωτογραφία`);
