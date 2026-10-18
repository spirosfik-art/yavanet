// Κάθετη κάρτα 1080x1350 (JPEG) για Instagram από ένα άρθρο: φωτογραφία, εβραϊκός τίτλος, λογότυπο.
// Τρέχει στο GitHub Actions (υπάρχει google-chrome). Αποθηκεύει στο content/ig/<slug>.jpg και το build
// το αντιγράφει στο /igc/<slug>.jpg, ώστε το Instagram (μέσω Make) να το κατεβάσει από το yavanet.gr.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const IG_DIR = path.join(ROOT, "content/ig");

const KICKER = { travel: "טיולים", "real-estate": "נדל״ן", israelis: "ישראלים ביוון", living: "חיים ביוון", "jewish-greece": "יהדות", breaking: "חדשות" };
const TAGS = {
  travel: "#טיוליםביוון #חופשהביוון",
  "real-estate": "#נדלןביוון #דירהבאתונה #השקעהביוון",
  israelis: "#ישראליםביוון",
  living: "#רילוקיישן #חייםביוון",
  "jewish-greece": "#כשרות #יהדותיוון",
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Ποια άρθρα αξίζουν ανάρτηση στο Instagram: οδηγοί/ταξίδια/ακίνητα/ζωή, όχι έκτακτα, ευαίσθητα, συνεργάτες, καιρός, απεργίες.
export function igEligible(a) {
  if (!a || a.hidden || a.sensitive || a.partner || a.sponsored || a.showcase || a.breaking || a.strike || a.wx) return false;
  if (a.meta && a.meta.auto) return false;
  if (!a.image || a.image.type !== "photo" || !a.image.url) return false;
  return ["travel", "real-estate", "israelis", "living", "jewish-greece"].includes(a.section);
}

export function igCaption(a) {
  const tags = ["#יוון #יוונט", TAGS[a.section] || ""].join(" ").trim();
  return `${a.he.title}\n\n${a.he.dek}\n\n🔗 הכתבה המלאה באתר, הקישור בביו\n💬 שאלה? שלחו לנו הודעה\n\n${tags}`;
}

function chromeBin() {
  for (const c of [process.env.CHROME, "google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    if (!c) continue;
    try { execFileSync("which", [c], { stdio: "ignore" }); return c; } catch {}
  }
  return null;
}

// Επιστρέφει το δημόσιο path (/igc/<slug>.jpg) ή null αν δεν γίνεται (π.χ. τοπικά χωρίς Chrome).
export function renderIgCard(a, kicker) {
  const chrome = chromeBin();
  if (!chrome) return null;
  let img = a.image.url;
  if (img.startsWith("/")) img = "file://" + path.join(ROOT, "site/assets", img);
  img = img.replace(/h=650&w=940/, "w=1400");
  const icon = fs.readFileSync(path.join(ROOT, "site/assets/icon.svg"), "utf8");
  const title = a.he.title;
  const fs1 = title.length > 60 ? 64 : title.length > 42 ? 74 : 84;
  const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;background:#0B3A5B;font-family:Assistant,sans-serif;overflow:hidden;position:relative}
.ph{position:absolute;inset:0 0 520px 0;background:url("${img}") center/cover}
.ph:after{content:"";position:absolute;inset:auto 0 0 0;height:260px;background:linear-gradient(transparent,#0B3A5B)}
.box{position:absolute;inset:auto 0 0 0;height:600px;padding:40px 72px 0;color:#fff}
.k{display:inline-block;background:#F0B650;color:#0B3A5B;font-weight:800;font-size:34px;padding:8px 26px;border-radius:40px;margin-bottom:28px}
h1{font-family:"Frank Ruhl Libre",serif;font-weight:900;font-size:${fs1}px;line-height:1.12;letter-spacing:-.5px}
.ft{position:absolute;left:72px;right:72px;bottom:56px;display:flex;align-items:center;justify-content:space-between;font-size:34px;font-weight:600;color:#cfe3f1}
.ft svg{width:76px;height:76px}.wv{position:absolute;right:72px;left:72px;bottom:150px;height:4px;background:#2A8BC4;border-radius:4px;opacity:.7}
</style></head><body><div class="ph"></div><div class="box"><span class="k">${esc(kicker || KICKER[a.section] || "יוון")}</span><h1>${esc(title)}</h1></div>
<div class="wv"></div><div class="ft"><span>yavanet.gr · יוון בעברית</span>${icon}</div></body></html>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "igc-"));
  const hf = path.join(tmp, "card.html"), png = path.join(tmp, "card.png");
  fs.writeFileSync(hf, html);
  fs.mkdirSync(IG_DIR, { recursive: true });
  const out = path.join(IG_DIR, `${a.slug}.jpg`);
  try {
    execFileSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", "--window-size=1080,1350", `--screenshot=${png}`, "file://" + hf], { stdio: "ignore", timeout: 60000 });
    // Το Instagram δέχεται μόνο JPEG
    execFileSync("convert", [png, "-quality", "88", out], { stdio: "ignore", timeout: 30000 });
  } catch (e) {
    console.log("ig-card error:", e.message);
    return null;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return fs.existsSync(out) && fs.statSync(out).size > 20000 ? `/igc/${a.slug}.jpg` : null;
}
