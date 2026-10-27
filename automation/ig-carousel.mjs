// Carousels για το Instagram: λίστες «για αποθήκευση και αποστολή» (5–8 slides, 1080x1350).
// Μπαίνουν ΜΕΣΑ στις σειρές των 3 (μία φορά την εβδομάδα στη μεσαία θέση), ώστε να μη χαλάει το πλέγμα.
// Χρήση: node automation/ig-carousel.mjs preview <i> <outdir>   (μόνο εικόνες, για έλεγχο)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { ROOT, log } from "./lib.mjs";

const NAVY = "#0B3A5B", DEEP = "#072A43", GOLD = "#F0B650", CREAM = "#F5EFE4", INK = "#0B2A44";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Περιεχόμενο: μόνο σταθερές πληροφορίες που δεν «λήγουν» (χωρίς τιμές/ημερομηνίες)
export const CAROUSELS = [
  {
    id: "israeli-mistakes-athens",
    kicker: "שמרו לטיול 🔖", title: "5 טעויות שישראלים עושים באתונה", sub: "ואיך להימנע מהן",
    items: [
      ["לא מתקפים כרטיס במטרו", "בכניסה לרציף מעבירים את הכרטיס במכונה. כרטיס שלא תוקף = קנס, גם אם קניתם אותו."],
      ["עולים לאקרופוליס בצהריים", "בחום ובתורים הכי גרוע. הגיעו עם הפתיחה בבוקר או לקראת הסגירה, עם כרטיס שהוזמן מראש."],
      ["יושבים לארוחת ערב ב-18:00", "היוונים אוכלים ערב מ-21:00 ואילך. מוקדם מדי = מסעדה ריקה ובלי אווירה."],
      ["עולים למונית בלי מונה", "בקשו להפעיל מונה או הזמינו דרך אפליקציה כמו FreeNow. מהשדה למרכז יש תעריף קבוע."],
      ["חושבים שבראשון הכול סגור", "החנויות סגורות, אבל בפלאקה, במונסטירקי ובתיסיו רוב המסעדות ובתי הקפה פתוחים."],
    ],
    cta: ["מכירים מישהו שטס לאתונה?", "שלחו לו את הפוסט 📲"],
    question: "👇 איזו טעות אתם עשיתם? ספרו בתגובות",
    tags: "#אתונה #יוון #טיפים_לטיול #טיוליםביוון #יוונט",
  },
  {
    id: "greek-food-must-try",
    kicker: "שמרו לטיול 🔖", title: "7 מאכלים שחייבים לטעום ביוון", sub: "מהסטריט פוד ועד הקינוח",
    items: [
      ["סובלאקי / ג׳ירוס בפיתה", "הסטריט פוד הלאומי. מבקשים ״פיתה גירו״ או ״פיתה סובלאקי״."],
      ["מוסקה", "שכבות של חציל, בשר טחון ורוטב בשמל. מנה ביתית קלאסית."],
      ["סלט יווני (חוריאטיקי)", "עגבנייה, מלפפון, בצל, זיתי קלמטה ופרוסת פטה עבה מלמעלה."],
      ["ספנקופיטה", "מאפה פילו במילוי תרד ופטה. מושלם לארוחת בוקר."],
      ["לוקומדס", "כדורי בצק מטוגנים עם דבש וקינמון. קשה לעצור באחד."],
      ["בוגאצה", "פילו עם קרם סולת, אבקת סוכר וקינמון. הכי טובה בסלוניקי."],
      ["פרדו אספרסו", "האייס קפה של היוונים: אספרסו מוקצף עם קרח."],
    ],
    cta: ["שומרים כשרות?", "המדריך לאוכל כשר ביוון באתר 🍽️"],
    question: "👇 מה המאכל היווני האהוב עליכם? כתבו בתגובות",
    tags: "#אוכל_יווני #יוון #אתונה #טיוליםביוון #יוונט",
  },
  {
    id: "greek-words-for-israelis",
    kicker: "שמרו לטיול 🔖", title: "7 מילים ביוונית שכל ישראלי צריך", sub: "ותקבלו חיוך מכל מלצר",
    items: [
      ["קלימרה", "Καλημέρα = בוקר טוב"],
      ["אפחריסטו", "Ευχαριστώ = תודה"],
      ["פרקלו", "Παρακαλώ = בבקשה / על לא דבר"],
      ["יאסאס", "Γεια σας = שלום (גם בפרידה)"],
      ["נה", "Ναι = כן! (כן, ״נה״ זה כן 😅)"],
      ["אוחי", "Όχι = לא"],
      ["טון לוגריאזמו, פרקלו", "Τον λογαριασμό, παρακαλώ = את החשבון, בבקשה"],
    ],
    cta: ["מכירים מישהו שטס ליוון?", "שלחו לו את הפוסט 📲"],
    question: "👇 איזו מילה ביוונית אתם כבר יודעים? כתבו בתגובות",
    tags: "#יוונית #יוון #אתונה #טיוליםביוון #יוונט",
  },
  {
    id: "airport-to-athens-center",
    kicker: "שמרו לטיול 🔖", title: "מהשדה למרכז אתונה: 4 דרכים", sub: "מה מתאים לכם",
    items: [
      ["מטרו – קו 3 (הכחול)", "ישיר לסינטגמה ולמונסטירקי. עלו לרכבת שכתוב עליה Airport. פועל עד קצת לפני חצות."],
      ["אוטובוס X95", "לכיכר סינטגמה, פועל 24 שעות. הכי זול, אבל איטי בפקקים."],
      ["מונית", "עמדה מסודרת ביציאה מהטרמינל, תעריף קבוע למרכז העיר (גבוה יותר בלילה)."],
      ["הסעה פרטית", "נהג מחכה עם שלט בשם שלכם. הכי נוח למשפחות ועם הרבה מזוודות."],
    ],
    cta: ["כל הפרטים והשעות", "במדריך המלא באתר ✈️"],
    question: "👇 איך אתם מעדיפים להגיע? כתבו בתגובות",
    tags: "#אתונה #שדה_התעופה_אתונה #יוון #טיוליםביוון #יוונט",
  },
];

const statePath = path.join(ROOT, "content/ig/carousels.json");
export const readCarState = () => { try { return JSON.parse(fs.readFileSync(statePath, "utf8")); } catch { return { posted: [] }; } };
export function nextCarousel() {
  const st = readCarState();
  return CAROUSELS.find((c) => !st.posted.includes(c.id)) || null;
}
export function markCarousel(id) {
  const st = readCarState();
  if (!st.posted.includes(id)) st.posted.push(id);
  fs.writeFileSync(statePath, JSON.stringify(st, null, 1));
}
export function carouselCaption(c) {
  return `${c.title} ${c.kicker.includes("🔖") ? "🔖" : ""}\n\n${c.items.map((x, i) => `${i + 1}. ${x[0]}`).join("\n")}\n\nשמרו את הפוסט לטיול 🔖\n📤 מכירים מישהו שטס ליוון? שלחו לו\n\n${c.question}\n\nעוד מדריכים בעברית: yavanet.gr/ig\n\n${c.tags}`;
}

function chrome() {
  for (const c of [process.env.CHROME, "google-chrome", "chromium"]) { if (!c) continue; try { execFileSync("which", [c], { stdio: "ignore" }); return c; } catch {} }
  return null;
}
const HEAD = `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet"><style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;overflow:hidden;position:relative;font-family:Assistant}
h1,h2{font-family:"Frank Ruhl Libre",serif;font-weight:900}.logo svg{width:84px;height:84px}
.sig{position:absolute;bottom:56px;right:76px;left:76px;display:flex;justify-content:space-between;font:600 30px Assistant}`;

function slideHtml(c, i, style, icon) {
  const total = c.items.length + 2;
  const pager = `<div style="position:absolute;top:70px;left:76px;font:800 30px Assistant;opacity:.7">${i + 1}/${total}</div>`;
  if (i === 0) {
    // εξώφυλλο: ίδιο ύφος με τη θέση του στη σειρά (κρεμ ή μπλε)
    const cream = style === 2;
    const bg = cream ? CREAM : `radial-gradient(circle at 50% 35%,#13507b 0%,${NAVY} 50%,${DEEP} 100%)`;
    const fg = cream ? INK : "#fff";
    return `${HEAD}body{background:${bg};color:${fg}}</style></head><body>
<div class="logo" style="position:absolute;top:64px;right:76px">${icon}</div>
<div style="position:absolute;top:330px;right:76px;left:76px"><span style="display:inline-block;background:${GOLD};color:${INK};font:800 40px Assistant;padding:12px 34px;border-radius:40px">${esc(c.kicker)}</span>
<h1 style="font-size:${c.title.length > 30 ? 104 : 120}px;line-height:1.08;margin-top:46px">${esc(c.title)}</h1>
<div style="font:600 50px Assistant;margin-top:34px;opacity:.85">${esc(c.sub)}</div></div>
<div style="position:absolute;bottom:150px;right:76px;font:800 40px Assistant;color:${cream ? NAVY : GOLD}">החליקו לכל הרשימה ←</div>
<div class="sig" style="color:${cream ? "#53697c" : "rgba(255,255,255,.72)"}"><span>yavanet.gr</span><span>יוונט · יוון בעברית</span></div></body></html>`;
  }
  if (i === total - 1) {
    return `${HEAD}body{background:radial-gradient(circle at 50% 40%,#13507b 0%,${NAVY} 50%,${DEEP} 100%);color:#fff}</style></head><body>${pager}
<div class="logo" style="position:absolute;top:64px;right:76px">${icon}</div>
<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 90px">
<h2 style="font-size:96px;line-height:1.1">${esc(c.cta[0])}</h2><div style="font:700 56px/1.35 Assistant;margin-top:36px">${esc(c.cta[1])}</div>
<div style="margin-top:70px;background:${GOLD};color:${INK};font:800 50px Assistant;padding:22px 52px;border-radius:60px">עקבו ⬅ @yavanet</div>
<div style="margin-top:34px;font:600 40px Assistant;opacity:.8">שמרו את הפוסט 🔖</div></div>
<div class="sig" style="color:rgba(255,255,255,.72)"><span>yavanet.gr</span><span>יוונט · יוון בעברית</span></div></body></html>`;
  }
  const [t, d] = c.items[i - 1];
  return `${HEAD}body{background:${CREAM};color:${INK}}</style></head><body>${pager}
<div class="logo" style="position:absolute;top:64px;right:76px">${icon}</div>
<div style="position:absolute;top:250px;right:76px;width:190px;height:190px;border-radius:50%;background:${NAVY};color:${GOLD};display:flex;align-items:center;justify-content:center;font:900 120px 'Frank Ruhl Libre'">${i}</div>
<div style="position:absolute;top:510px;right:76px;left:76px"><h2 style="font-size:${t.length > 18 ? 86 : 100}px;line-height:1.1">${esc(t)}</h2>
<div style="width:120px;height:8px;background:${GOLD};border-radius:4px;margin:44px 0"></div>
<div style="font:600 54px/1.42 Assistant;color:#2c4358">${esc(d)}</div></div>
<div class="sig" style="color:#53697c"><span>yavanet.gr</span><span>יוונט · יוון בעברית</span></div></body></html>`;
}

// Επιστρέφει τα αρχεία (σε σειρά) μέσα στο outDir με πρόθεμα prefix
export function renderCarousel(c, outDir, prefix, style = 2) {
  const bin = chrome();
  if (!bin) throw new Error("χωρίς Chrome");
  const icon = fs.readFileSync(path.join(ROOT, "site/assets/icon.svg"), "utf8");
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "car-"));
  const files = [];
  for (let i = 0; i < c.items.length + 2; i++) {
    const hf = path.join(tmp, `s${i}.html`);
    fs.writeFileSync(hf, slideHtml(c, i, style, icon));
    const name = `${prefix}-s${i}.jpg`;
    execFileSync(bin, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", "--window-size=1080,1350", `--screenshot=${path.join(outDir, name)}`, "file://" + hf], { stdio: "ignore", timeout: 60000 });
    files.push(name);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, a1, a2] = process.argv.slice(2);
  if (cmd === "preview") {
    const out = a2 || "ig-out";
    const list = a1 === "all" ? CAROUSELS : [CAROUSELS[Number(a1 || 0)]];
    for (const c of list) { const f = renderCarousel(c, out, c.id, 2); log("carousel", c.id, f.length); renderCarousel(c, out, c.id + "-navy", 0).slice(0, 1); }
  }
}
