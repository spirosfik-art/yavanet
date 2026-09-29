// Μία φορά (ή όποτε χρειαστεί): προσθέτει τίτλους/περιγραφές για τη Google στα ήδη δημοσιευμένα άρθρα
// και διορθώνει ορθογραφικά λάθη στον εβραϊκό τίτλο/υπότιτλο. node automation/seo-backfill.mjs [max]
import { log, claude, parseJSON, loadArticles, saveArticle, seoFields, notifyOwner } from "./lib.mjs";
import { WRITE_SYSTEM, seoBackfillPrompt } from "./prompts.mjs";

const MAX = Number(process.argv[2] || 200);
const todo = loadArticles().filter((a) => a.he && a.en && !a.he.profile && !a.he.seoTitle).slice(0, MAX);
log("articles without SEO fields:", todo.length);
const okHe = (orig, neu) => typeof neu === "string" && /[֐-׿]/.test(neu) && !/[Ͱ-Ͽ]/.test(neu) && neu.length >= orig.length * 0.6 && neu.length <= orig.length * 1.5;
let done = 0, fixed = 0;
for (let i = 0; i < todo.length; i += 6) {
  const batch = todo.slice(i, i + 6);
  const list = batch.map((a) => ({ slug: a.slug, section: a.section, he: { title: a.he.title, dek: a.he.dek }, en: { title: a.en.title, dek: a.en.dek } }));
  try {
    const out = parseJSON(await claude({ system: WRITE_SYSTEM, prompt: seoBackfillPrompt(list), role: "write", maxTokens: 6000, temperature: 0.2 }));
    for (const it of out.items || []) {
      const a = batch.find((x) => x.slug === it.slug);
      if (!a || !it.he || !it.en) continue;
      for (const k of ["title", "dek"]) if (it.he[k] && it.he[k] !== a.he[k] && okHe(a.he[k], it.he[k])) { log("fix", a.slug, k, a.he[k], "→", it.he[k]); a.he[k] = it.he[k]; fixed++; }
      Object.assign(a.he, seoFields(it.he)); Object.assign(a.en, seoFields(it.en));
      if (a.he.seoTitle) { saveArticle(a); done++; }
    }
  } catch (e) { log("batch error", e.message); }
}
log(`done ${done}/${todo.length}, hebrew fixes ${fixed}`);
if (done) await notifyOwner(`🔎 SEO: ${done} άρθρα πήραν εβραϊκό τίτλο/περιγραφή για τη Google · διορθώσεις ορθογραφίας: ${fixed}`);
