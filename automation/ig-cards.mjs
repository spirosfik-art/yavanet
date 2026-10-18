// Φτιάχνει κάθετες κάρτες 1080x1350 για Instagram από άρθρα του Yavanet (τρέχει σε GitHub Actions).
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "ig-out"); fs.mkdirSync(OUT, { recursive: true });
const PICKS = [
  ["kosher-food-greece-kosher-restaurants-athens", "כשרות"],
  ["what-can-you-buy-in-athens-under-260k-shekels", "נדל״ן"],
  ["ferries-in-greece-complete-guide", "טיולים"],
  ["rhodes-travel-guide-israeli-visitors", "איים"],
  ["etz-hayyim-synagogue-chania-crete-guide", "יהדות"],
  ["golden-visa-guide-2026", "נדל״ן"],
  ["santorini-travel-guide-history-and-villages", "איים"],
  ["jewish-holidays-greece-chabad-kosher-synagogues", "יהדות"],
  ["flight-time-tel-aviv-athens-greece-guide", "טיסות"],
];
const icon = fs.readFileSync(path.join(ROOT, "site/assets/icon.svg"), "utf8");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const files = fs.readdirSync(path.join(ROOT, "content/articles"));
const chrome = process.env.CHROME || "google-chrome";
const meta = [];
PICKS.forEach(([slug, kicker], i) => {
  const f = files.find((x) => x.includes(slug)); if (!f) return;
  const a = JSON.parse(fs.readFileSync(path.join(ROOT, "content/articles", f), "utf8"));
  let img = (a.image && a.image.url) || "";
  if (img.startsWith("/")) img = "file://" + path.join(ROOT, "site/assets", img);
  img = img.replace(/h=650&w=940/, "w=1400");
  const title = a.he.title;
  const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;background:#0B3A5B;font-family:Assistant,sans-serif;overflow:hidden;position:relative}
.ph{position:absolute;inset:0 0 520px 0;background:url("${img}") center/cover}
.ph:after{content:"";position:absolute;inset:auto 0 0 0;height:260px;background:linear-gradient(transparent,#0B3A5B)}
.box{position:absolute;inset:auto 0 0 0;height:600px;padding:40px 72px 0;color:#fff}
.k{display:inline-block;background:#F0B650;color:#0B3A5B;font-weight:800;font-size:34px;padding:8px 26px;border-radius:40px;margin-bottom:28px}
h1{font-family:"Frank Ruhl Libre",serif;font-weight:900;font-size:${title.length > 60 ? 64 : title.length > 42 ? 74 : 84}px;line-height:1.12;letter-spacing:-.5px}
.ft{position:absolute;left:72px;right:72px;bottom:56px;display:flex;align-items:center;justify-content:space-between;font-size:34px;font-weight:600;color:#cfe3f1}
.ft svg{width:76px;height:76px}.wv{position:absolute;right:72px;left:72px;bottom:150px;height:4px;background:#2A8BC4;border-radius:4px;opacity:.7}
</style></head><body><div class="ph"></div><div class="box"><span class="k">${esc(kicker)}</span><h1>${esc(title)}</h1></div>
<div class="wv"></div><div class="ft"><span>yavanet.gr · יוון בעברית</span>${icon}</div></body></html>`;
  const hf = path.join(OUT, `card-${i + 1}.html`); fs.writeFileSync(hf, html);
  const png = path.join(OUT, `yavanet-ig-${i + 1}.png`);
  execFileSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", "--window-size=1080,1350", `--screenshot=${png}`, "file://" + hf], { stdio: "inherit" });
  meta.push({ n: i + 1, slug, kicker, title, dek: a.he.dek, url: `https://yavanet.gr/a/${a.slug}/` });
  fs.unlinkSync(hf);
});
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2));
