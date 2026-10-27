// Προεπισκόπηση: 12 πρόσφατες κάρτες με το νέο ενιαίο σχέδιο + πώς φαίνονται στο πλέγμα του Instagram (3 στήλες, 3:4).
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
import { renderIgCard, igEligible, IG_DIR } from "./ig-card.mjs";
const dir = path.resolve(IG_DIR, "../articles");
fs.mkdirSync("ig-out", { recursive: true });
const arts = fs.readdirSync(dir).sort().reverse().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f)))).filter(igEligible).slice(0, 12);
let tiles = [];
arts.forEach((a, i) => { const r = renderIgCard(a, null, i); if (r) { fs.copyFileSync(path.join(IG_DIR, a.slug + ".jpg"), `ig-out/t${i}.jpg`); tiles.push(`t${i}.jpg`); } console.log(i, a.slug, r); });
const cells = tiles.map((t) => `<div style="background:url(${t}) center/cover"></div>`).join("");
fs.writeFileSync("ig-out/grid.html", `<!doctype html><body style="margin:0;background:#fff"><div style="display:grid;grid-template-columns:repeat(3,360px);grid-auto-rows:480px;gap:3px;width:1086px">${cells}</div></body>`);
execFileSync("google-chrome", ["--headless=new", "--no-sandbox", "--hide-scrollbars", "--allow-file-access-from-files", "--window-size=1086," + (Math.ceil(tiles.length / 3) * 483), "--screenshot=" + path.resolve("ig-out/grid.png"), "file://" + path.resolve("ig-out/grid.html")], { stdio: "inherit" });
