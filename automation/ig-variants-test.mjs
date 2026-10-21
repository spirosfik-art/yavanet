// Δοκιμή: όλα τα σχέδια κάρτας Instagram για δύο άρθρα (ένα κανονικό, ένα έκτακτο). Γράφει στο ig-out/.
import fs from "node:fs"; import path from "node:path";
import { renderIgCard, IG_DIR } from "./ig-card.mjs";
const dir = path.resolve(IG_DIR, "../articles");
const load = (s) => JSON.parse(fs.readFileSync(path.join(dir, fs.readdirSync(dir).find((x) => x.includes(s))), "utf8"));
fs.mkdirSync("ig-out", { recursive: true });
const a = load("rhodes-travel-guide-israeli-visitors");
for (const v of [0, 1, 2, 3, 5, 6]) { const r = renderIgCard(a, null, v); if (r) fs.copyFileSync(path.join(IG_DIR, a.slug + ".jpg"), `ig-out/v${v}.jpg`); console.log(v, r); }
const b = load("athens-strike-rallies-october-21");
const r = renderIgCard(b, null, 0); if (r) fs.copyFileSync(path.join(IG_DIR, b.slug + ".jpg"), "ig-out/breaking.jpg"); console.log("breaking", r);
