// Προεπισκόπηση όλων των σχεδίων Instagram (χωρίς ανάρτηση) → φάκελος <out>
import fs from "node:fs";
import path from "node:path";
import { loadPublished } from "../automation/lib.mjs";
import { renderIgCard, renderStoryCard, IG_DIR } from "../automation/ig-card.mjs";
const out = path.resolve(process.argv[2] || "design-out");
fs.mkdirSync(out, { recursive: true });
const all = loadPublished().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
const news = all.filter((a) => !a.guide && a.image && a.image.type === "photo" && /^https?:/.test(a.image.url) && !a.sensitive && a.section !== "politics" && a.section !== "sports").slice(0, 3);
const guide = all.find((a) => a.guide && a.image && a.image.type === "photo" && /^https?:/.test(a.image.url));
const mv = (slug, name) => { const f = path.join(IG_DIR, slug + ".jpg"); if (fs.existsSync(f)) fs.renameSync(f, path.join(out, name)); };
news.forEach((a, i) => { if (renderIgCard(a, null, i)) mv(a.slug, `post-${i}.jpg`); });
if (news[0] && renderStoryCard(news[0])) mv(news[0].slug + "-story", "story-news.jpg");
if (guide && renderStoryCard(guide)) mv(guide.slug + "-story", "story-guide.jpg");
console.log("::notice::design preview: " + fs.readdirSync(out).join(", "));
