// Μία φορά (ή όταν αλλάζουν γραμματοσειρές): κατεβάζει τα woff2 της Google Fonts στο site/assets
// και γράφει το site/fonts.css (@font-face), ώστε να φορτώνουν από το yavanet.gr χωρίς τρίτους servers.
import fs from "node:fs";
const CSS = "https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Assistant:wght@400;600;700;800&display=swap";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const css = await (await fetch(CSS, { headers: { "user-agent": UA } })).text();
const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
const keep = new Set(["hebrew", "latin", "latin-ext"]);
const files = new Map(); let out = "";
for (const [, subset, body] of blocks) {
  if (!keep.has(subset)) continue;
  const fam = /font-family:\s*'([^']+)'/.exec(body)[1], w = /font-weight:\s*(\d+)/.exec(body)[1], src = /url\((https:[^)]+\.woff2)\)/.exec(body)[1];
  if (!files.has(src)) files.set(src, `f-${fam.toLowerCase().replace(/\s+/g, "-")}-${files.size}-${subset}.woff2`);
  out += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(/${files.get(src)}) format('woff2');unicode-range:${/unicode-range:\s*([^;]+)/.exec(body)[1].trim()}}\n`;
}
for (const f of fs.readdirSync("site/assets")) if (/^f-.*\.woff2$/.test(f)) fs.unlinkSync("site/assets/" + f);
for (const [src, name] of files) fs.writeFileSync("site/assets/" + name, Buffer.from(await (await fetch(src)).arrayBuffer()));
fs.writeFileSync("site/fonts.css", out);
console.log(`::notice::fonts: ${files.size} αρχεία, ${blocks.length} μπλοκ → ${[...files.values()].join(", ")}`);
