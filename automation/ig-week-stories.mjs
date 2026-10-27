// Stories της εβδομάδας (1080x1920), ίδιο στυλ με τα εξώφυλλα των highlights. Προγραμματίζονται στο Business Suite.
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
const NAVY = "#0B3A5B", DEEP = "#072A43", GOLD = "#F0B650";
const S = [
  ["d1-ohi", "היום ביוון", "28 באוקטובר: יום ה״אוחי״", ["חג לאומי ביוון: מצעדים בכל הערים", "רוב החנויות והמשרדים סגורים היום", "תחבורה ציבורית בלוח זמנים של חג"], "מטיילים היום? תכננו מראש 👆"],
  ["d2-flights", "טיסות", "טסים ליוון החורף?", ["אתונה, סלוניקי וכרתים פעילות כל השנה", "לפני הטיסה: בדקו עדכוני שביתות", "כל העדכונים בהיילייט ״טיסות״"], "שאלה על טיסה? שלחו לנו הודעה"],
  ["d3-weekend", "סופ״ש באתונה", "3 רעיונות לסוף השבוע", ["1. מוזיאון האקרופוליס", "2. שקיעה מגבעת ליקבטוס", "3. ערב בפסירי ומונסטירקי"], "עוד רעיונות באתר: yavanet.gr"],
  ["d4-museums", "טיפ חינם", "מנובמבר: כניסה חינם ביום ראשון", ["ביום ראשון הראשון של כל חודש", "מנובמבר עד מרץ, באתרים ומוזיאונים", "של משרד התרבות היווני"], "שמרו את הסטורי הזה 🔖"],
  ["d5-realestate", "נדל״ן", "כמה עולה מ״ר באתונה?", ["מחירי מ״ר לפי שכונה", "דירות למגורים ולהשקעה", "הכול בעברית באתר"], "yavanet.gr · שלחו לנו הודעה"],
  ["d6-quiz", "חידון", "מה פירוש ״קלימרה״?", ["א. לילה טוב", "ב. בוקר טוב", "ג. תודה רבה"], "התשובה בסטורי של מחר 👀"],
  ["d7-word", "מילה של השבוע", "אֶפְחָרִיסְטוֹ", ["Ευχαριστώ = תודה", "(ותשובה לחידון: קלימרה = בוקר טוב)", "תגידו את זה למלצר ותקבלו חיוך"], "איזו מילה ללמוד בשבוע הבא? כתבו לנו"],
];
const chrome = ["google-chrome", "chromium"].find((c) => { try { execFileSync("which", [c], { stdio: "ignore" }); return true; } catch { return false; } });
const out = process.argv[2] || "ig-out";
fs.mkdirSync(out, { recursive: true });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
for (const [slug, kick, title, lines, cta] of S) {
  const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;position:relative;color:#fff;font-family:Assistant,sans-serif;background:radial-gradient(circle at 50% 40%,#13507b 0%,${NAVY} 45%,${DEEP} 100%)}
.top{position:absolute;top:150px;left:0;right:0;text-align:center;font:800 40px Assistant;color:rgba(255,255,255,.8);letter-spacing:1px}
.k{position:absolute;top:420px;left:0;right:0;text-align:center}.k span{display:inline-block;background:${GOLD};color:${DEEP};font:800 50px Assistant;padding:14px 44px;border-radius:50px}
h1{position:absolute;top:560px;left:70px;right:70px;text-align:center;font:900 104px/1.12 "Frank Ruhl Libre",serif}
ul{position:absolute;top:960px;left:110px;right:110px;list-style:none;border-top:4px solid ${GOLD};padding-top:50px}
li{font:600 56px/1.35 Assistant;margin-bottom:34px;text-align:center}
.cta{position:absolute;bottom:300px;left:80px;right:80px;text-align:center;font:800 52px Assistant;color:${GOLD}}
.ft{position:absolute;bottom:150px;left:0;right:0;text-align:center;font:800 42px Assistant;color:rgba(255,255,255,.75)}</style></head>
<body><div class="top">יוונט · יוון בעברית</div><div class="k"><span>${esc(kick)}</span></div><h1>${esc(title)}</h1><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul><div class="cta">${esc(cta)}</div><div class="ft">yavanet.gr</div></body></html>`;
  const hf = path.resolve(out, `${slug}.html`);
  fs.writeFileSync(hf, html);
  execFileSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", "--window-size=1080,1920", `--screenshot=${path.resolve(out, `st-${slug}.jpg`)}`, "file://" + hf], { stdio: "ignore", timeout: 60000 });
  fs.rmSync(hf);
  console.log("ok", slug);
}
