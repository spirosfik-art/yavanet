// Μοιράζει όλα τα καρέ όλων των σκηνών σε K μηχανές και τρέχει το Blender για το μερίδιο της μηχανής k.
//   node shard.mjs <episode.json> <bounds.json> <k> <K> <outDir> <texDir>
import fs from "node:fs"; import { execFileSync } from "node:child_process";
const [ep, bf, k, K, out, tex] = process.argv.slice(2);
const B = JSON.parse(fs.readFileSync(bf, "utf8")), FPS = Number(process.env.FPS || 24), res = process.env.RES || "0.6667", samples = process.env.SAMPLES || "28";
fs.mkdirSync(out, { recursive: true });
let g = 0; const t0 = Date.now();
B.scenes.forEach((sc, i) => {
  const n = Math.max(2, Math.round(sc.need * FPS)); const mine = [];
  for (let f = 1; f <= n; f++, g++) if (g % Number(K) === Number(k)) mine.push(f);
  if (!mine.length) return;
  execFileSync(process.env.BLENDER || "/tmp/blender/blender", ["-b", "-noaudio", "-P", "automation/explainer3d/build.py", "--", "--episode", ep, "--scene", String(i), "--dur", String(sc.need), "--out", out, "--mode", "frames", "--frames", mine.join(","), "--tex", tex, "--samples", samples, "--fps", String(FPS), "--res", res], { stdio: ["ignore", "ignore", "inherit"] });
  console.log(`σκηνή ${i}: ${mine.length} καρέ · ${((Date.now() - t0) / 60000).toFixed(1)}′`);
});
