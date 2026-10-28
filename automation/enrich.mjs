// Εμπλουτισμός παλιών άρθρων για τη Google: προσθέτει στο τέλος μια πρακτική ενότητα + «שאלות נפוצות»/FAQ.
// Δεν αλλάζει τίποτα από ό,τι ήδη γράφτηκε. Σειρά: σελίδες με κλικ από Google (content/gsc), οδηγοί, νεότερα.
// node automation/enrich.mjs [max]
import fs from "node:fs";
import { log, claude, parseJSON, loadArticles, saveArticle, notifyOwner } from "./lib.mjs";
import { WRITE_SYSTEM, enrichPrompt } from "./prompts.mjs";

const MAX = Number(process.argv[2] || 20);
const clicks = {};
try { const f = fs.readdirSync("content/gsc").filter((x) => x.endsWith(".json")).sort().pop(); for (const r of JSON.parse(fs.readFileSync("content/gsc/" + f, "utf8")).pages || []) { const m = r.keys[0].match(/\/a\/([^/]+)\//); if (m) clicks[m[1]] = (clicks[m[1]] || 0) + r.clicks + r.impressions / 100; } } catch {}
const hasFaq = (b) => /^## (שאלות נפוצות|FAQ|Frequently asked questions)/m.test(b || "");
const todo = loadArticles()
  .filter((a) => a.he && a.en && !a.hidden && !a.enrichedAt && !a.sponsored && !a.showcase && !a.he.profile && !hasFaq(a.he.body))
  .sort((a, b) => (clicks[b.slug] || 0) - (clicks[a.slug] || 0) || (b.guide ? 1 : 0) - (a.guide ? 1 : 0) || String(b.publishedAt).localeCompare(String(a.publishedAt)))
  .slice(0, MAX);
log("to enrich:", todo.length);
const HE = /[֐-׿]/, GR = /[Ͱ-Ͽ]/;
const okSec = (s, he) => typeof s === "string" && /^## \S/.test(s.trim()) && s.length > 120 && s.length < 2200 && (!he || (HE.test(s) && !GR.test(s)));
const okFaq = (f, he) => Array.isArray(f) && f.length >= 2 && f.every((x) => x && /\?\s*$/.test(x.q || "") && (x.a || "").length > 20 && !/\*\*/.test(x.q + x.a) && (!he || (HE.test(x.q) && !GR.test(x.q + x.a))));
let done = 0;
for (const a of todo) {
  try {
    const out = parseJSON(await claude({ system: WRITE_SYSTEM, prompt: enrichPrompt(a), role: "write", maxTokens: 4000, temperature: 0.3 }));
    const he = out.he || {}, en = out.en || {};
    if (!okSec(he.section, true) || !okSec(en.section) || !okFaq(he.faq, true) || !okFaq(en.faq)) { log("skip (validation)", a.slug); continue; }
    const faq = (f, title) => `## ${title}\n\n` + f.slice(0, 3).map((x) => `**${x.q.trim()}**\n${x.a.trim()}`).join("\n\n");
    a.he.body = a.he.body.trimEnd() + "\n\n" + he.section.trim() + "\n\n" + faq(he.faq, "שאלות נפוצות");
    a.en.body = a.en.body.trimEnd() + "\n\n" + en.section.trim() + "\n\n" + faq(en.faq, "FAQ");
    a.enrichedAt = new Date().toISOString();
    a.updatedAt = a.enrichedAt.replace("Z", "+00:00");
    saveArticle(a); done++; log("enriched", a.slug);
  } catch (e) { log("error", a.slug, e.message); if (/ημερήσιο|daily|quota/i.test(e.message)) break; }
}
const left = loadArticles().filter((a) => a.he && a.en && !a.hidden && !a.enrichedAt && !a.sponsored && !a.showcase && !a.he.profile && !hasFaq(a.he.body)).length;
console.log(`::notice::enrich: ${done}/${todo.length} άρθρα εμπλουτίστηκαν · απομένουν ${left}`);
if (done) await notifyOwner(`📚 SEO περιεχόμενο: ${done} παλιά άρθρα πήραν νέα πρακτική ενότητα + «שאלות נפוצות» · απομένουν ${left}`);
