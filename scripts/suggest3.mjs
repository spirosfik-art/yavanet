// Έρευνα v3: (α) ξανά τα ερωτήματα της v2 που απέτυχαν (όριο Google), (β) δεύτερο επίπεδο: κάθε καλή πρόταση ξανά ως ερώτημα
import fs from "node:fs";
const v2 = JSON.parse(fs.readFileSync("research/suggest2.json", "utf8"));
const seeds = JSON.parse(fs.readFileSync("scripts/suggest3-seeds.json", "utf8"));
// ξαναχτίζουμε τη λίστα της v2 για να βρούμε όσα λείπουν
const src = fs.readFileSync("scripts/suggest2.mjs", "utf8");
const grab = (name) => JSON.parse(src.match(new RegExp("const " + name + " = (\\[[^\\]]*\\])"))[1].replace(/'/g, '"'));
const PLACES = grab("PLACES"), PSUF = grab("PSUF"), TOPICS = grab("TOPICS"), QPRE = grab("QPRE");
const ALPHA = " א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת".split(" ").map((x) => (x ? " " + x : ""));
const all = new Set(); for (const p of PLACES) for (const s of PSUF) all.add(p + s); for (const t of TOPICS) { for (const a of ALPHA) all.add(t + a); for (const q of QPRE) all.add(q + t); }
const missing = [...all].filter((q) => !(q in v2));
const list = [...new Set([...missing, ...seeds.map((s) => s + " ")])];
const out = {}; let ok = 0, fail = 0;
for (const q of list) {
  let tries = 0;
  while (tries++ < 3) {
    try { const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=he&gl=il&q=${encodeURIComponent(q)}`, { headers: { "user-agent": "Mozilla/5.0" } });
      if (r.status !== 200) throw new Error(r.status);
      out[q] = JSON.parse(new TextDecoder("utf-8").decode(await r.arrayBuffer()))[1] || []; ok++; break;
    } catch { await new Promise((r) => setTimeout(r, 3000 * tries)); }
  }
  if (!(q in out)) fail++;
  await new Promise((r) => setTimeout(r, 450));
}
fs.writeFileSync("research/suggest3.json", JSON.stringify(out));
console.log(`::notice::suggest3: ${list.length} ερωτήματα (λείπαν ${missing.length}), ok ${ok}, fail ${fail}, ${new Set(Object.values(out).flat()).size} μοναδικές`);
