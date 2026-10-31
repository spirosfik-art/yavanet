// Άμεση ανάρτηση στο social μόλις ένα άρθρο εμφανιστεί live στο yavanet.gr:
//   • κάθε άρθρο (ειδήσεις + οδηγοί) → story σε Instagram + Facebook
//   • κάθε είδηση (όχι οδηγός) → και post στο Instagram (οι οδηγοί πάνε στα reels)
// Δύο φάσεις, γιατί το Instagram θέλει δημόσιο URL για την εικόνα:
//   node automation/instant-social.mjs render   → φτιάχνει τις κάρτες στο content/ig/ + plan στο instant-plan.json
//   (το workflow κάνει commit/push τις κάρτες)
//   node automation/instant-social.mjs publish <sha> → ανεβάζει με raw.githubusercontent.com/<repo>/<sha>/…
import fs from "node:fs";
import path from "node:path";
import { ROOT, env, log, loadArticles, notifyOwner } from "./lib.mjs";
import { renderIgCard, renderStoryCard, igCaption, igAltText, markIgPosted, IG_DIR } from "./ig-card.mjs";
import { ctx, api, postStory } from "./meta.mjs";

const SITE = (env.SITE_URL || "https://yavanet.gr").replace(/\/$/, "");
const REPO = env.GITHUB_REPOSITORY || "spirosfik-art/yavanet";
const STATE = path.join(IG_DIR, "instant.json");
const PLAN = path.join(ROOT, "instant-plan.json");
const MAX_PER_RUN = Number(env.INSTANT_MAX || 6);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return null; } };
const saveState = (s) => { s.done = s.done.slice(-400); fs.writeFileSync(STATE, JSON.stringify(s, null, 1)); };

async function live(url) {
  try { const r = await fetch(url + "?cb=" + Date.now(), { redirect: "follow", signal: AbortSignal.timeout(20000) }); return r.status === 200; } catch { return false; }
}
// Οδηγοί με εικονογράφηση (όχι φωτογραφία): παίρνουμε μια φωτογραφία Pexels από το meta.imageQuery
async function photoFor(a) {
  if (a.image && a.image.type === "photo" && a.image.url) return a;
  const q = (a.meta && a.meta.imageQuery) || "greece travel";
  if (env.PEXELS_API_KEY) {
    try {
      const r = await fetch(`https://api.pexels.com/v1/search?per_page=5&orientation=portrait&query=${encodeURIComponent(q)}`, { headers: { Authorization: env.PEXELS_API_KEY }, signal: AbortSignal.timeout(20000) });
      const j = await r.json();
      const p = (j.photos || [])[0];
      if (p) return { ...a, image: { type: "photo", url: p.src.large2x || p.src.large } };
    } catch (e) { log("pexels:", e.message); }
  }
  return { ...a, image: { type: "photo", url: "/og.png" } };
}
const isPolitical = (a) => a.section === "politics" || /election|בחירות|ממשלה|קואליצ/i.test(`${a.slug} ${a.he.title}`);

const [cmd, sha] = process.argv.slice(2);

if (cmd === "render") {
  const h = Number(new Date().toLocaleString("en-GB", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }));
  if (h < 7) { fs.writeFileSync(PLAN, "[]"); log("instant: νύχτα (πριν τις 07:00) – τα νυχτερινά άρθρα ανεβαίνουν το πρωί"); process.exit(0); }
  let st = readState();
  if (!st) { st = { since: new Date().toISOString(), done: [] }; saveState(st); log("instant: πρώτη εκτέλεση – ξεκινάμε από τώρα (χωρίς παλιά άρθρα)"); }
  const now = Date.now(), since = Math.max(Date.parse(st.since), now - 10 * 3600e3);
  const done = new Set(st.done);
  const cand = loadArticles()
    .filter((a) => a.slug && a.he && a.he.title && !done.has(a.slug) && !a.hidden && !a.sensitive && !a.sponsored && !a.partner && !(a.meta && a.meta.auto) && !isPolitical(a))
    .filter((a) => { const t = Date.parse(a.publishedAt); return t <= now && t >= since; })
    .sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))
    .slice(0, MAX_PER_RUN);
  const plan = [];
  for (const a0 of cand) {
    const url = `${SITE}/a/${a0.slug}/`;
    if (!(await live(url))) { log("instant: όχι ακόμα live", a0.slug); continue; }
    const a = await photoFor(a0);
    const story = renderStoryCard(a);
    const post = !a0.guide ? renderIgCard(a) : null;
    if (!story && !post) { log("instant: δεν φτιάχτηκε κάρτα", a0.slug); continue; }
    plan.push({ slug: a0.slug, guide: !!a0.guide, story, post, caption: post ? igCaption(a0) : "", alt: igAltText(a0) });
    log("instant: έτοιμο", a0.slug, story ? "story" : "", post ? "post" : "");
  }
  fs.writeFileSync(PLAN, JSON.stringify(plan, null, 1));
  console.log(`::notice::instant: ${plan.length} άρθρα για ανάρτηση (${cand.length} υποψήφια)`);
  process.exit(0);
}

if (cmd === "publish") {
  let plan = []; try { plan = JSON.parse(fs.readFileSync(PLAN, "utf8")); } catch {}
  if (!plan.length) { log("instant: τίποτα"); process.exit(0); }
  const st = readState() || { since: new Date().toISOString(), done: [] };
  const raw = (p) => `https://raw.githubusercontent.com/${REPO}/${sha}/${path.basename(p)}`;
  const c = await ctx();
  const report = [];
  for (const j of plan) {
    const res = [];
    if (j.post && c.igId) {
      try {
        const m = await api(`/${c.igId}/media`, { method: "POST", token: c.userToken, params: { image_url: raw(j.post), caption: j.caption, alt_text: j.alt } });
        for (let i = 0; i < 20; i++) { const s = await api(`/${m.id}`, { token: c.userToken, params: { fields: "status_code" } }); if (s.status_code === "FINISHED") break; if (s.status_code === "ERROR") throw new Error("IG επεξεργασία: ERROR"); await sleep(4000); }
        await api(`/${c.igId}/media_publish`, { method: "POST", token: c.userToken, params: { creation_id: m.id } });
        markIgPosted(j.slug); // για να μην το ξανανεβάσουν οι σειρές του ig-batch
        res.push("post ✓");
      } catch (e) { res.push("post ✗ " + e.message.slice(0, 80)); }
    }
    if (j.story) {
      const out = await postStory(raw(j.story)).catch((e) => ["story ✗ " + e.message]);
      res.push(...out);
    }
    st.done.push(j.slug);
    report.push(`• ${j.slug}: ${res.join(" · ")}`);
    log("instant:", j.slug, res.join(" · "));
    await sleep(3000);
  }
  saveState(st);
  console.log("::notice::" + report.join(" ").slice(0, 900));
  if (report.some((r) => /✗/.test(r))) await notifyOwner(`⚠️ Άμεσες αναρτήσεις: κάποιες απέτυχαν\n${report.join("\n")}`).catch(() => {});
  process.exit(0);
}

console.log("χρήση: render | publish <sha>");
