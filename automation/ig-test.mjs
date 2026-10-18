// Δοκιμή: φτιάχνει μία κάρτα Instagram για ένα άρθρο (χρήση από το workflow IG cards).
import fs from "node:fs"; import path from "node:path";
import { renderIgCard, igCaption, igEligible, IG_DIR } from "./ig-card.mjs";
const slug = process.argv[2];
const dir = path.resolve(IG_DIR, "../articles");
const f = fs.readdirSync(dir).find((x) => x.includes(slug));
const a = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
console.log("eligible", igEligible(a)); console.log(igCaption(a));
console.log("card", renderIgCard(a));
