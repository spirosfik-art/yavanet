// Εξώφυλλα για τα Highlights του Instagram (1080x1920). Το καθένα ανεβαίνει και ως πρώτο story της
// κατηγορίας του: το Instagram κόβει τον κεντρικό κύκλο για εξώφυλλο, οπότε το εικονίδιο είναι στο κέντρο.
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
const NAVY = "#0B3A5B", DEEP = "#072A43", GOLD = "#F0B650";
const P = (d) => d.map((x) => (x.startsWith("<") ? x : `<path d="${x}"/>`)).join("");
const HL = [
  ["flights", "טיסות", "כל עדכוני הטיסות ישראל–יוון", P(["M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"])],
  ["updates", "עדכונים", "חדשות חשובות מיוון בזמן אמת", P(["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.94 1.94 0 0 0 3.4 0"])],
  ["athens", "אתונה", "מה לראות, לאכול ולעשות באתונה", P(["M3 22h18", "M6 18v-7", "M10 18v-7", "M14 18v-7", "M18 18v-7", "M4 18h16", "M12 2l9 6H3z"])],
  ["islands", "איים", "המדריכים שלנו לאיים היווניים", P(['<circle cx="12" cy="8" r="4"/>', "M2 16c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5", "M2 21c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"])],
  ["kosher", "כשר ושבת", "אוכל כשר, בתי חב״ד וזמני שבת", P(['<rect x="6.5" y="10" width="3.5" height="11" rx=".5"/>', '<rect x="14" y="10" width="3.5" height="11" rx=".5"/>', "M8.25 2.5c1.2 1.6 1.2 3.2 0 4.5-1.2-1.3-1.2-2.9 0-4.5z", "M15.75 2.5c1.2 1.6 1.2 3.2 0 4.5-1.2-1.3-1.2-2.9 0-4.5z", "M3 21h18"])],
  ["realestate", "נדל״ן", "מחירי דירות והשקעות ביוון", P(["M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"])],
  ["faq", "שאלתם", "התשובות לשאלות שלכם", P(['<circle cx="12" cy="12" r="10"/>', "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3", "M12 17h.01"])],
  ["about", "עלינו", "יוונט · יוון בעברית · כתבו לנו בוואטסאפ", P(["M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2-5.4A8.4 8.4 0 1 1 21 11.5z"])],
];
const chrome = ["google-chrome", "chromium"].find((c) => { try { execFileSync("which", [c], { stdio: "ignore" }); return true; } catch { return false; } });
const out = process.argv[2] || "ig-out";
fs.mkdirSync(out, { recursive: true });
for (const [slug, label, sub, svg] of HL) {
  const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;position:relative;color:#fff;font-family:Assistant,sans-serif;background:radial-gradient(circle at 50% 50%,#13507b 0%,${NAVY} 45%,${DEEP} 100%)}
.top{position:absolute;top:150px;left:0;right:0;text-align:center;font:800 40px Assistant;color:rgba(255,255,255,.8);letter-spacing:1px}
.c{position:absolute;left:250px;top:670px;width:580px;height:580px;border-radius:50%;border:12px solid ${GOLD};display:flex;align-items:center;justify-content:center;background:rgba(7,42,67,.55)}
.c svg{width:290px;height:290px;fill:none;stroke:${GOLD};stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
h1{position:absolute;top:1330px;left:60px;right:60px;text-align:center;font:900 120px "Frank Ruhl Libre",serif}
p{position:absolute;top:1500px;left:90px;right:90px;text-align:center;font:600 50px Assistant;color:rgba(255,255,255,.85);line-height:1.3}
.ft{position:absolute;bottom:150px;left:0;right:0;text-align:center;font:800 42px Assistant;color:${GOLD};letter-spacing:1px}</style></head>
<body><div class="top">יוונט · יוון בעברית</div><div class="c"><svg viewBox="0 0 24 24">${svg}</svg></div><h1>${label}</h1><p>${sub}</p><div class="ft">yavanet.gr</div></body></html>`;
  const hf = path.resolve(out, `hl-${slug}.html`);
  fs.writeFileSync(hf, html);
  execFileSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000", "--window-size=1080,1920", `--screenshot=${path.resolve(out, `hl-${slug}.jpg`)}`, "file://" + hf], { stdio: "ignore", timeout: 60000 });
  fs.rmSync(hf);
  console.log("ok", slug);
}
// Προεπισκόπηση: πώς φαίνονται τα 8 εξώφυλλα σε κύκλους, όπως στο προφίλ
const cells = HL.map(([s, l]) => `<div style="text-align:center;font:600 22px sans-serif"><div style="width:150px;height:150px;border-radius:50%;margin:0 auto 8px;background:url(hl-${s}.jpg) center/266px auto;border:3px solid #ddd"></div>${l}</div>`).join("");
fs.writeFileSync(path.resolve(out, "hl-preview.html"), `<!doctype html><html dir="rtl"><body style="margin:0;padding:30px;background:#fff;display:flex;gap:26px">${cells}</body></html>`);
execFileSync(chrome, ["--headless=new", "--no-sandbox", "--hide-scrollbars", "--allow-file-access-from-files", "--window-size=1600,260", `--screenshot=${path.resolve(out, "hl-preview.png")}`, "file://" + path.resolve(out, "hl-preview.html")], { stdio: "ignore", timeout: 60000 });
