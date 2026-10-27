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
  // μόνο οδηγοί που δεν έχουν ημερομηνία λήξης (όχι ειδήσεις «αυτό το Σάββατο»)
  return igEligible(a) && !a.breaking && !a.strike && ["travel", "jewish-greece", "living", "real-estate"].includes(a.section) && /guide|destinations|villages|monaster|where-to|tips|best-|islands|beaches|kosher|chabad/.test(a.slug) && !/20\d\d-\d\d|october|november|december/.test(a.slug);
}

// Τοποθεσία για λέξεις-κλειδιά (αναζήτηση Instagram): από τίτλο/slug, αλλιώς «יוון»
const PLACES = [["אתונה", /athens|אתונה|אתונא/i], ["סלוניקי", /thessalon|סלוניקי/i], ["כרתים", /crete|כרתים|chania|heraklion|חאניה|הרקליון/i], ["רודוס", /rhodes|רודוס/i], ["פיראוס", /piraeus|פיראוס/i], ["מיקונוס", /mykonos|מיקונוס/i], ["סנטוריני", /santorini|סנטוריני/i], ["קורפו", /corfu|קורפו/i], ["חלקידיקי", /chalkidiki|חלקידיקי/i], ["פלופונס", /peloponn|nafplio|פלופונס|נאפפליו/i], ["האיים היווניים", /islands|איים|cyclades|קיקלד/i]];
export function igPlace(a) {
  const t = `${a.slug} ${a.he.title}`;
  const p = PLACES.find(([, re]) => re.test(t));
  return p ? p[0] : "יוון";
}
export function igAltText(a) {
  const place = igPlace(a);
  return `${a.he.title}. ${KICKER[a.section] || "חדשות"} ${place === "יוון" ? "ביוון" : "ב" + place + ", יוון"} – יוונט, חדשות יוון בעברית לישראלים`.slice(0, 900);
}
export function igCaption(a) {
  const pl = igPlace(a);
  const tags = ["#יוון #יוונט", pl !== "יוון" ? "#" + pl.replace(/\s+/g, "") : "", TAGS[a.section] || ""].join(" ").replace(/\s+/g, " ").trim();
  // Ερώτηση στο τέλος → σχόλια· «στείλτε σε φίλο» → shares (το πιο δυνατό σήμα για νέους ακόλουθους)
  const Q = { travel: "👇 כבר הייתם שם? ספרו לנו בתגובות", "real-estate": "👇 הייתם קונים דירה ביוון? כתבו לנו", "jewish-greece": "👇 מכירים עוד מקום כשר? כתבו בתגובות", israelis: "👇 מה דעתכם? כתבו לנו בתגובות" };
  // σε τραγικές ειδήσεις (θάνατοι, δυστυχήματα) χωρίς ερώτηση/«στείλτε σε φίλο» και χωρίς ταξιδιωτικά hashtags
  if (/נהרג|הרוג|נספ|מת |מתו |תאונ|התרסק|אסון|פצוע/.test(a.he.title + " " + a.he.dek)) return `${a.he.title}\n\n${a.he.dek}\n📍 ${igPlace(a) === "יוון" ? "יוון" : igPlace(a) + ", יוון"}\n\n🔗 הכתבה המלאה באתר, הקישור בביו\n👈 yavanet.gr/ig\n\n#יוון #יוונט`;
  const q = Q[a.section] || "👇 מה דעתכם? כתבו לנו בתגובות";
  return `${a.he.title}\n\n${a.he.dek}\n📍 ${igPlace(a) === "יוון" ? "יוון" : igPlace(a) + ", יוון"}\n\n🔗 הכתבה המלאה באתר, הקישור בביו\n👈 yavanet.gr/ig\n💬 שאלה? שלחו לנו הודעה\n\n${q}\n📤 מכירים מישהו שטס ליוון? שלחו לו\n\n${tags}`;
}

function chromeBin() {
  for (const c of [process.env.CHROME, "google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    if (!c) continue;
    try { execFileSync("which", [c], { stdio: "ignore" }); return c; } catch {}
  }
  return null;
}

// Ενιαίο σύστημα για το προφίλ: ΔΥΟ σχέδια που εναλλάσσονται (μονά/ζυγά) → στο πλέγμα των 3 στηλών
// βγαίνει πάντα «σκακιέρα» (φωτογραφία / μπλε), ό,τι κι αν ανέβει μετά. Ίδια παλέτα, ίδιες γραμματοσειρές,
// λογότυπο και υπογραφή στην ίδια θέση. Τα έκτακτα κρατούν το ίδιο σχέδιο, μόνο με κόκκινη ετικέτα.
const NAVY = "#0B3A5B", DEEP = "#072A43", GOLD = "#F0B650", RED = "#E5484D";
function nextVariant() {
  const f = path.join(IG_DIR, "posted.json");
  let n = 0;
  try { n = JSON.parse(fs.readFileSync(f, "utf8")).length; } catch {}
  return n;
}
function cardLayout(v, { img, kicker, title, icon, breaking, alert }) {
  const fsz = (a, b, c) => (title.length > 60 ? a : title.length > 42 ? b : c);
  const tag = breaking ? `<span class="k red">● ${esc(alert)}</span>` : `<span class="k">${esc(kicker)}</span>`;
  const base = `*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;font-family:Assistant,sans-serif;overflow:hidden;position:relative;color:#fff;background:${NAVY}}
h1{font-family:"Frank Ruhl Libre",serif;font-weight:900;letter-spacing:-.5px}
.k{display:inline-block;color:${GOLD};font:800 34px Assistant;letter-spacing:1px;padding-bottom:10px;border-bottom:4px solid ${GOLD};margin-bottom:30px}
.k.red{color:#fff;background:${RED};border:0;padding:8px 24px;border-radius:8px}
.logo{position:absolute;top:64px;right:76px;width:84px;height:84px}.logo svg{width:84px;height:84px}
.sig{position:absolute;bottom:58px;right:76px;left:76px;display:flex;justify-content:space-between;font:600 30px Assistant;color:rgba(255,255,255,.72);letter-spacing:.5px}`;
  if (v !== 2 && v % 2 === 0) {
    // Α · ΦΩΤΟΓΡΑΦΙΑ: εικόνα σε όλη την κάρτα, σκούρο μπλε από κάτω, τίτλος λευκός
    return { css: `${base}
.ph{position:absolute;inset:0;background:url("${img}") center/cover}
.ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,42,67,.3) 0%,rgba(7,42,67,0) 16%,rgba(7,42,67,0) 52%,rgba(7,42,67,.88) 80%,${DEEP} 100%)}
.box{position:absolute;right:76px;left:76px;bottom:140px}h1{font-size:${fsz(60, 70, 80)}px;line-height:1.08;text-shadow:0 2px 18px rgba(0,0,0,.35)}`,
      body: `<div class="ph"></div><div class="logo">${icon}</div><div class="box">${tag}<h1>${esc(title)}</h1></div><div class="sig"><span>yavanet.gr</span><span>יוונט · יוון בעברית</span></div>` };
  }
  if (v === 2) {
    // Γ · ΠΕΡΙΟΔΙΚΟ (κρεμ): ανεβαίνει πάντα ως ολόκληρη σειρά των 3
    return { css: `${base}body{background:#F5EFE4;color:#0B2A44}
.top{position:absolute;top:54px;right:64px;left:64px;display:flex;justify-content:space-between;align-items:center;font:800 36px Assistant;color:#0B2A44}.top svg{width:76px;height:76px}
.ph{position:absolute;top:170px;right:64px;left:64px;height:640px;border-radius:28px;background:url("${img}") center/cover;box-shadow:0 24px 50px rgba(11,42,68,.22)}
.pill{position:absolute;top:140px;right:96px;z-index:2;background:${GOLD};color:#0B2A44;font:800 34px Assistant;padding:10px 28px;border-radius:34px}.pill.red{background:${RED};color:#fff}
.box{position:absolute;top:860px;right:64px;left:64px}h1{color:#0B2A44;font-size:${fsz(62, 72, 82)}px;line-height:1.1}
.ft{position:absolute;bottom:52px;right:64px;left:64px;border-top:2px solid rgba(11,42,68,.15);padding-top:22px;display:flex;justify-content:space-between;font:600 30px Assistant;color:#53697c}`,
      body: `<div class="top"><span>יוונט · יוון בעברית</span>${icon}</div><div class="ph"></div><span class="pill${breaking ? " red" : ""}">${esc(breaking ? alert : kicker)}</span><div class="box"><h1>${esc(title)}</h1></div><div class="ft"><span>yavanet.gr</span><span>יוונט</span></div>` };
  }
  // Β · ΜΠΛΕ: μεγάλη φωτογραφία πάνω (περίπου 60%), μπλε κάτω με τον τίτλο — χωρίς άδειο χώρο
  return { css: `${base}
.strip{position:absolute;top:0;left:0;right:0;height:860px;background:url("${img}") center/cover}
.strip:after{content:"";position:absolute;inset:auto 0 0 0;height:180px;background:linear-gradient(180deg,rgba(11,58,91,0),${NAVY})}
.box{position:absolute;right:76px;left:76px;top:850px}h1{font-size:${fsz(56, 64, 74)}px;line-height:1.1}
.box .k{margin-bottom:20px}`,
    body: `<div class="strip"></div><div class="logo">${icon}</div><div class="box">${tag}<h1>${esc(title)}</h1></div><div class="sig"><span>yavanet.gr</span><span>יוונט · יוון בעברית</span></div>` };
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
  const L = cardLayout(v, { img, kicker: kicker || KICKER[a.section] || "יוון", title: a.he.title, icon, breaking: !!(a.breaking || a.strike), alert: a.strike || /strike|שביתה/i.test(a.slug + a.he.title) ? "שביתה" : "חדשות" });
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
