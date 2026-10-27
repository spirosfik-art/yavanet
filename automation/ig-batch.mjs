// Instagram σε ΣΕΙΡΕΣ των 3: κάθε φορά ανεβαίνουν 3 αναρτήσεις μαζί (μία σειρά του πλέγματος),
// ώστε το προφίλ να έχει σταθερό σχέδιο: [φωτο·μπλε·φωτο] → [κρεμ×3] → [μπλε·φωτο·μπλε] → [κρεμ×3] → …
// Χρήση: node automation/ig-batch.mjs render <rows> <outdir>   (φτιάχνει κάρτες + plan.json)
//        node automation/ig-batch.mjs publish <outdir> <baseUrl> (ανεβάζει μέσω Graph API, ενημερώνει posted.json)
import fs from "node:fs";
import path from "node:path";
import { loadArticles, log, notifyOwner } from "./lib.mjs";
import { igEligible, igEvergreen, igCaption, renderIgCard, IG_DIR } from "./ig-card.mjs";
import { ctx, postStory } from "./meta.mjs";

const ROWS = [[0, 1, 0], [2, 2, 2], [1, 0, 1], [2, 2, 2]];
const postedFile = path.join(IG_DIR, "posted.json");
const readPosted = () => { try { return JSON.parse(fs.readFileSync(postedFile, "utf8")); } catch { return []; } };
const rowState = path.join(IG_DIR, "rows.json");
const readRows = () => { try { return JSON.parse(fs.readFileSync(rowState, "utf8")).rows || 0; } catch { return 0; } };

function pick(n) {
  const posted = new Set(readPosted().map((x) => x.slug));
  const all = loadArticles().filter((a) => !posted.has(a.slug)).sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  const recent = all.filter((a) => igEligible(a) && Date.now() - Date.parse(a.publishedAt || 0) < 72 * 3600e3);
  const score = (a) => (a.breaking || a.strike ? 3 : 0) + (["israelis", "travel", "real-estate", "jewish-greece", "living"].includes(a.section) ? 2 : 0);
  recent.sort((a, b) => score(b) - score(a));
  const out = recent.slice(0, n);
  for (const a of all.filter(igEvergreen)) { if (out.length >= n) break; if (!out.includes(a)) out.push(a); }
  // καμία επανάληψη φωτογραφίας στην ίδια σειρά
  return out.slice(0, n);
}

const [cmd, a1, a2, a3] = process.argv.slice(2);
if (cmd === "render") {
  const rows = Number(a1 || 1), out = a2 || "ig-batch";
  fs.mkdirSync(out, { recursive: true });
  const arts = pick(rows * 3);
  if (arts.length < rows * 3) { log("ig-batch: λίγα άρθρα", arts.length); }
  const startRow = readRows();
  const plan = [];
  for (let r = 0; r < Math.floor(arts.length / 3); r++) {
    const pattern = ROWS[(startRow + r) % ROWS.length];
    for (let c = 0; c < 3; c++) {
      const a = arts[r * 3 + c];
      const res = renderIgCard(a, null, pattern[c]);
      if (!res) { log("render failed", a.slug); process.exit(1); }
      const file = `r${r}c${c}-${a.slug}.jpg`;
      fs.copyFileSync(path.join(IG_DIR, a.slug + ".jpg"), path.join(out, file));
      fs.rmSync(path.join(IG_DIR, a.slug + ".jpg"), { force: true });
      plan.push({ row: r, col: c, slug: a.slug, file, caption: igCaption(a), style: pattern[c] });
    }
  }
  fs.writeFileSync(path.join(out, "plan.json"), JSON.stringify(plan, null, 1));
  log("ig-batch: σχέδιο", plan.length, "καρτών");
} else if (cmd === "rerender") {
  // ξαναφτιάχνει ακριβώς τις κάρτες ενός plan.json (ίδια άρθρα/σχέδια) με τον τρέχοντα κώδικα
  const plan = JSON.parse(fs.readFileSync(a1, "utf8")), out = a2 || "ig-batch";
  fs.mkdirSync(out, { recursive: true });
  const arts = Object.fromEntries(loadArticles().map((x) => [x.slug, x]));
  for (const p of plan) { const r = renderIgCard(arts[p.slug], null, p.style); if (!r) { log("fail", p.slug); process.exit(1); } fs.copyFileSync(path.join(IG_DIR, p.slug + ".jpg"), path.join(out, p.file)); fs.rmSync(path.join(IG_DIR, p.slug + ".jpg"), { force: true }); }
  fs.writeFileSync(path.join(out, "plan.json"), JSON.stringify(plan, null, 1));
  log("rerendered", plan.length);
} else if (cmd === "publish") {
  const out = a1, base = a2.replace(/\/$/, "");
  const plan = JSON.parse(fs.readFileSync(path.join(out, "plan.json"), "utf8"));
  const c = await ctx();
  if (!c.igId) throw new Error("δεν βρέθηκε λογαριασμός Instagram");
  const G = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}`;
  const call = async (p, params) => { const r = await fetch(G + p, { method: "POST", body: new URLSearchParams({ ...params, access_token: c.userToken }) }); const j = await r.json(); if (j.error) throw new Error(j.error.message); return j; };
  const wait = async (id) => { for (let i = 0; i < 30; i++) { const r = await (await fetch(`${G}/${id}?fields=status_code&access_token=${c.userToken}`)).json(); if (r.status_code === "FINISHED") return; if (r.status_code === "ERROR") throw new Error("container error"); await new Promise((s) => setTimeout(s, 5000)); } };
  const posted = readPosted();
  const rowsDone = Math.max(...plan.map((p) => p.row)) + 1;
  let ok = 0;
  // Στο πλέγμα η νεότερη μπαίνει πάνω αριστερά: ανεβάζουμε κάθε σειρά από το τέλος προς την αρχή
  const order = [...plan].sort((x, y) => (y.row - x.row) || (y.col - x.col));
  for (const p of order) {
    try {
      const m = await call(`/${c.igId}/media`, { image_url: `${base}/${p.file}`, caption: p.caption });
      await wait(m.id);
      await call(`/${c.igId}/media_publish`, { creation_id: m.id });
      posted.push({ slug: p.slug, at: new Date().toISOString(), style: p.style });
      ok++; log("✓ IG", p.slug);
      await new Promise((s) => setTimeout(s, 20000));
    } catch (e) { log("IG ✗", p.slug, e.message); await notifyOwner(`⚠️ Instagram σειρά: ${p.slug}: ${e.message}`).catch(() => {}); break; }
  }
  fs.writeFileSync(postedFile, JSON.stringify(posted.slice(-200), null, 1));
  if (ok === plan.length) fs.writeFileSync(rowState, JSON.stringify({ rows: readRows() + rowsDone }));
  if (ok) {
    const first = plan.find((p) => p.row === 0 && p.col === 0);
    await postStory(`${base}/${first.file}`).catch(() => {});
    await notifyOwner(`📸 Instagram: ανέβηκε νέα σειρά (${ok} αναρτήσεις)`).catch(() => {});
  }
}
