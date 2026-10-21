// Κάθετη κάρτα 1080x1350 (JPEG) για Instagram από ένα άρθρο: φωτογραφία, εβραϊκός τίτλος, λογότυπο.
// Τρέχει στο GitHub Actions (υπάρχει google-chrome). Αποθηκεύει στο content/ig/<slug>.jpg και το build
// το αντιγράφει στο /igc/<slug>.jpg, ώστε το Instagram (μέσω Make) να το κατεβάσει από το yavanet.gr.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const IG_DIR = path.join(ROOT, "content/ig");

const KICKER = { travel: "טיולים", "real-estate": "נדל״ן", israelis: "ישראלים ביוון", living: "חיים ביוון", "jewish-greece": "יהדות", breaking: "חדשות", news: "חדשות", greece: "חדשות", economy: "כלכלה", politics: "חדשות" };
const TAGS = {
  travel: "#טיוליםביוון #חופשהביוון",
  "real-estate": "#נדלןביוון #דירהבאתונה #השקעהביוון",
  israelis: "#ישראליםביוון",
  living: "#רילוקיישן #חייםביוון",
  "jewish-greece": "#כשרות #יהדותיוון",
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Ποια άρθρα αξίζουν ανάρτηση στο Instagram: οδηγοί/ταξίδια/ακίνητα/ζωή, όχι έκτακτα, ευαίσθητα, συνεργάτες, καιρός, απεργίες.
// Ειδήσεις και έκτακτα περνούν κι αυτά (ο Σπύρος θέλει και ειδήσεις στο Instagram)· όχι ευαίσθητα, συνεργάτες, καιρός.
export const IG_SECTIONS = ["travel", "real-estate", "israelis", "living", "jewish-greece", "breaking", "news", "greece", "economy", "politics"];
export function igEligible(a) {
  if (!a || a.hidden || a.sensitive || a.partner || a.sponsored || a.showcase || a.wx) return false;
  if (a.meta && a.meta.auto) return false;
  if (!a.image || a.image.type !== "photo" || !a.image.url) return false;
  return IG_SECTIONS.includes(a.section) || !!a.breaking || !!a.strike;
}
// Οδηγοί που δεν «λήγουν»: για αναπλήρωση όταν δεν υπάρχει πρόσφατο άρθρο
export function igEvergreen(a) {
  return igEligible(a) && !a.breaking && !a.strike && ["travel", "jewish-greece", "living", "real-estate"].includes(a.section);
}

export function igCaption(a) {
  const tags = ["#יוון #יוונט", TAGS[a.section] || ""].join(" ").trim();
  return `${a.he.title}\n\n${a.he.dek}\n\n🔗 הכתבה המלאה באתר, הקישור בביו\n👈 yavanet.gr/ig\n💬 שאלה? שלחו לנו הודעה\n\n${tags}`;
}

function chromeBin() {
  for (const c of [process.env.CHROME, "google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    if (!c) continue;
    try { execFileSync("which", [c], { stdio: "ignore" }); return c; } catch {}
  }
  return null;
}

// Πολλά σχέδια ώστε το προφίλ στο Instagram να μη φαίνεται ίδιο σε κάθε ανάρτηση.
// Το σχέδιο εναλλάσσεται με τη σειρά (μετρητής από το posted.json)· τα έκτακτα έχουν πάντα το δικό τους «μπλε/κόκκινο».
const ACCENTS = ["#F0B650", "#4FC3E8", "#F28C6B", "#9ED36A"];
function nextVariant() {
  const f = path.join(IG_DIR, "posted.json");
  let n = 0;
  try { n = JSON.parse(fs.readFileSync(f, "utf8")).length; } catch {}
  return n;
}
function cardLayout(v, { img, kicker, title, icon, breaking }) {
  const fsz = (a, b, c) => (title.length > 60 ? a : title.length > 42 ? b : c);
  const base = `*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;font-family:Assistant,sans-serif;overflow:hidden;position:relative}h1{font-family:"Frank Ruhl Libre",serif;font-weight:900;letter-spacing:-.5px}`;
  if (breaking) {
    return { css: `${base}body{background:#120d10;color:#fff}
.ph{position:absolute;inset:0;background:url("${img}") center/cover}.ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,13,16,.2) 30%,rgba(18,13,16,.96) 72%)}
.bar{position:absolute;top:0;left:0;right:0;height:120px;background:#D7263D;display:flex;align-items:center;justify-content:space-between;padding:0 64px;font:800 46px Assistant}
.bar i{font-style:normal;display:inline-block;width:22px;height:22px;border-radius:50%;background:#fff;margin-left:16px;box-shadow:0 0 0 8px rgba(255,255,255,.3)}
.bar svg{width:76px;height:76px}.box{position:absolute;inset:auto 64px 140px 64px}
h1{font-size:${fsz(66, 76, 88)}px;line-height:1.1}.ft{position:absolute;bottom:52px;right:64px;font:600 32px Assistant;color:#e9c9cf}`,
      body: `<div class="ph"></div><div class="bar"><span><i></i>מבזק · ${esc(kicker)}</span>${icon}</div><div class="box"><h1>${esc(title)}</h1></div><div class="ft">yavanet.gr · יוון בעברית</div>` };
  }
  const acc = ACCENTS[Math.floor(v / 4) % ACCENTS.length];
  switch (v % 4) {
    case 1: // תσ φωτογραφία σε όλη την κάρτα, τίτλος κάτω
      return { css: `${base}body{background:#061a2b;color:#fff}
.ph{position:absolute;inset:0;background:url("${img}") center/cover}.ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,26,43,.55) 0%,rgba(6,26,43,0) 22%,rgba(6,26,43,0) 42%,rgba(6,26,43,.95) 78%)}
.top{position:absolute;top:56px;right:64px;left:64px;display:flex;justify-content:space-between;align-items:center;font:800 36px Assistant}.top svg{width:80px;height:80px}
.box{position:absolute;inset:auto 64px 90px 64px}.k{color:${acc};font:800 36px Assistant;letter-spacing:.5px;border-bottom:4px solid ${acc};padding-bottom:6px;display:inline-block;margin-bottom:26px}
h1{font-size:${fsz(66, 78, 90)}px;line-height:1.1}`,
        body: `<div class="ph"></div><div class="top"><span>יוונט</span>${icon}</div><div class="box"><span class="k">${esc(kicker)}</span><h1>${esc(title)}</h1></div>` };
    case 2: // «περιοδικό»: ανοιχτό φόντο, φωτογραφία σε πλαίσιο
      return { css: `${base}body{background:#F5EFE4;color:#0B2A44}
.ph{position:absolute;top:150px;right:64px;left:64px;height:640px;border-radius:28px;background:url("${img}") center/cover;box-shadow:0 24px 50px rgba(11,42,68,.25)}
.top{position:absolute;top:50px;right:64px;left:64px;display:flex;justify-content:space-between;align-items:center;font:800 34px Assistant}.top svg{width:68px;height:68px}
.k{position:absolute;top:118px;right:100px;background:${acc};color:#0B2A44;font:800 32px Assistant;padding:8px 24px;border-radius:30px;z-index:2}
.box{position:absolute;top:840px;right:64px;left:64px}h1{font-size:${fsz(58, 66, 76)}px;line-height:1.14}
.ft{position:absolute;bottom:50px;right:64px;left:64px;border-top:2px solid rgba(11,42,68,.15);padding-top:22px;font:600 30px Assistant;color:#53697c}`,
        body: `<div class="top"><span>יוונט · יוון בעברית</span>${icon}</div><div class="ph"></div><span class="k">${esc(kicker)}</span><div class="box"><h1>${esc(title)}</h1></div><div class="ft">yavanet.gr</div>` };
    case 3: // λευκή κάρτα που «κάθεται» πάνω στη φωτογραφία
      return { css: `${base}body{background:#0B3A5B}
.ph{position:absolute;inset:0;background:url("${img}") center/cover}
.card{position:absolute;right:56px;left:56px;bottom:56px;background:#fff;border-radius:34px;padding:44px 48px 40px;box-shadow:0 30px 60px rgba(0,0,0,.35)}
.k{display:inline-flex;align-items:center;gap:12px;color:#0B3A5B;font:800 32px Assistant;margin-bottom:18px}.k:before{content:"";width:16px;height:16px;border-radius:50%;background:${acc}}
h1{color:#0B2A44;font-size:${fsz(54, 62, 72)}px;line-height:1.14}
.ft{display:flex;justify-content:space-between;align-items:center;margin-top:28px;font:600 28px Assistant;color:#6b7f90}.ft svg{width:60px;height:60px}`,
        body: `<div class="ph"></div><div class="card"><span class="k">${esc(kicker)}</span><h1>${esc(title)}</h1><div class="ft"><span>yavanet.gr · יוון בעברית</span>${icon}</div></div>` };
    default: // το αρχικό: φωτογραφία πάνω, μπλε κάτω
      return { css: `${base}body{background:#0B3A5B}
.ph{position:absolute;inset:0 0 520px 0;background:url("${img}") center/cover}
.ph:after{content:"";position:absolute;inset:auto 0 0 0;height:260px;background:linear-gradient(transparent,#0B3A5B)}
.box{position:absolute;inset:auto 0 0 0;height:600px;padding:40px 72px 0;color:#fff}
.k{display:inline-block;background:${acc};color:#0B3A5B;font-weight:800;font-size:34px;padding:8px 26px;border-radius:40px;margin-bottom:28px}
h1{font-size:${fsz(64, 74, 84)}px;line-height:1.12}
.ft{position:absolute;left:72px;right:72px;bottom:56px;display:flex;align-items:center;justify-content:space-between;font-size:34px;font-weight:600;color:#cfe3f1}
.ft svg{width:76px;height:76px}.wv{position:absolute;right:72px;left:72px;bottom:150px;height:4px;background:#2A8BC4;border-radius:4px;opacity:.7}`,
        body: `<div class="ph"></div><div class="box"><span class="k">${esc(kicker)}</span><h1>${esc(title)}</h1></div><div class="wv"></div><div class="ft"><span>yavanet.gr · יוון בעברית</span>${icon}</div>` };
  }
}

// Επιστρέφει το δημόσιο path (/igc/<slug>.jpg) ή null αν δεν γίνεται (π.χ. τοπικά χωρίς Chrome).
export function renderIgCard(a, kicker, variant) {
  const chrome = chromeBin();
  if (!chrome) return null;
  let img = a.image.url;
  if (img.startsWith("/")) img = "file://" + path.join(ROOT, "site/assets", img);
  img = img.replace(/h=650&w=940/, "w=1400");
  const icon = fs.readFileSync(path.join(ROOT, "site/assets/icon.svg"), "utf8");
  const v = Number.isInteger(variant) ? variant : nextVariant();
  const L = cardLayout(v, { img, kicker: kicker || KICKER[a.section] || "יוון", title: a.he.title, icon, breaking: !!(a.breaking || a.strike) });
  const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet">
<style>${L.css}</style></head><body>${L.body}</body></html>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "igc-"));
  const hf = path.join(tmp, "card.html");
  fs.writeFileSync(hf, html);
  fs.mkdirSync(IG_DIR, { recursive: true });
  const out = path.join(IG_DIR, `${a.slug}.jpg`);
  try {
    // Το Chrome γράφει JPEG όταν το αρχείο τελειώνει σε .jpg (το Instagram δέχεται μόνο JPEG)
    execFileSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", "--window-size=1080,1350", `--screenshot=${out}`, "file://" + hf], { stdio: "ignore", timeout: 60000 });
    const head = fs.readFileSync(out).subarray(0, 3);
    if (!(head[0] === 0xff && head[1] === 0xd8)) throw new Error("not a JPEG");
  } catch (e) {
    console.log("ig-card error:", e.message);
    return null;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return fs.existsSync(out) && fs.statSync(out).size > 20000 ? `/igc/${a.slug}.jpg` : null;
}

// Story 1080x1920 (JPEG): φωτογραφία πάνω, τίτλος, «link στο bio». Το Instagram δεν επιτρέπει αυτοκόλλητο link μέσω API.
export function renderStoryCard(a, kicker) {
  const chrome = chromeBin();
  if (!chrome) return null;
  let img = a.image.url;
  if (img.startsWith("/")) img = "file://" + path.join(ROOT, "site/assets", img);
  img = img.replace(/h=650&w=940/, "w=1400");
  const icon = fs.readFileSync(path.join(ROOT, "site/assets/icon.svg"), "utf8");
  const title = a.he.title;
  const fs1 = title.length > 60 ? 76 : title.length > 42 ? 88 : 100;
  const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;background:#0B3A5B;font-family:Assistant,sans-serif;overflow:hidden;position:relative;color:#fff}
.ph{position:absolute;inset:0 0 760px 0;background:url("${img}") center/cover}
.ph:after{content:"";position:absolute;inset:auto 0 0 0;height:420px;background:linear-gradient(transparent,#0B3A5B)}
.top{position:absolute;top:150px;right:72px;left:72px;display:flex;justify-content:space-between;align-items:center}
.top svg{width:96px;height:96px}.brand{font-size:40px;font-weight:800;background:rgba(11,58,91,.75);padding:10px 26px;border-radius:40px}
.box{position:absolute;inset:auto 0 370px 0;padding:0 72px}
.k{display:inline-block;background:#F0B650;color:#0B3A5B;font-weight:800;font-size:40px;padding:10px 30px;border-radius:44px;margin-bottom:34px}
h1{font-family:"Frank Ruhl Libre",serif;font-weight:900;font-size:${fs1}px;line-height:1.12}
.cta{position:absolute;bottom:200px;left:72px;right:72px;display:flex;justify-content:center}
.cta span{background:#fff;color:#0B3A5B;font-weight:800;font-size:46px;padding:22px 44px;border-radius:60px}
</style></head><body><div class="ph"></div>
<div class="top"><span class="brand">יוונט · yavanet.gr</span>${icon}</div>
<div class="box"><span class="k">${esc(kicker || KICKER[a.section] || "יוון")}</span><h1>${esc(title)}</h1></div>
<div class="cta"><span>👆 הכתבה המלאה · הקישור בביו</span></div></body></html>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "igs-"));
  const hf = path.join(tmp, "story.html");
  fs.writeFileSync(hf, html);
  fs.mkdirSync(IG_DIR, { recursive: true });
  const out = path.join(IG_DIR, `${a.slug}-story.jpg`);
  try {
    execFileSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", "--window-size=1080,1920", `--screenshot=${out}`, "file://" + hf], { stdio: "ignore", timeout: 60000 });
    const head = fs.readFileSync(out).subarray(0, 3);
    if (!(head[0] === 0xff && head[1] === 0xd8)) throw new Error("not a JPEG");
  } catch (e) {
    console.log("story-card error:", e.message);
    return null;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return fs.existsSync(out) && fs.statSync(out).size > 20000 ? `/igc/${a.slug}-story.jpg` : null;
}

// Καταγράφει ότι το άρθρο πήγε στο Instagram, για τη σελίδα yavanet.gr/instagram/ (link στο bio)
export function markIgPosted(slug) {
  const f = path.join(IG_DIR, "posted.json");
  const list = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : [];
  list.push({ slug, at: new Date().toISOString() });
  fs.mkdirSync(IG_DIR, { recursive: true });
  fs.writeFileSync(f, JSON.stringify(list.slice(-60), null, 1));
}
