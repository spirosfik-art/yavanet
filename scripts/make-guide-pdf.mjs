// Φτιάχνει το δώρο εγγραφής στο newsletter: PDF του οδηγού αγοράς ακινήτου (εβραϊκά + αγγλικά) από το ίδιο το άρθρο.
// Τρέχει χειροκίνητα: node scripts/make-guide-pdf.mjs  → site/assets/yavanet-guide-buying-property-{he,en}.pdf
import fs from "node:fs";
import { md } from "../site/md.mjs";
const PW = process.env.PW || "/home/claude/.npm-global/lib/node_modules/playwright/index.mjs";
const { chromium } = await import(PW);
const f = fs.readdirSync("content/articles").find((x) => x.includes("buying-property-in-greece-israelis-guide"));
const a = JSON.parse(fs.readFileSync("content/articles/" + f, "utf8"));
const logo = "data:image/png;base64," + fs.readFileSync("site/assets/icon-192.png").toString("base64");
const b = await chromium.launch();
for (const lang of ["he", "en"]) {
  const he = lang === "he", c = a[lang];
  const date = new Date(a.updatedAt || a.publishedAt).toLocaleDateString(he ? "he-IL" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const html = `<!doctype html><html lang="${lang}" dir="${he ? "rtl" : "ltr"}"><head><meta charset="utf-8"><style>
  @page{size:A4;margin:18mm 16mm}
  body{font-family:"DejaVu Sans","Noto Sans Hebrew",Arial,sans-serif;color:#15202b;font-size:11.5pt;line-height:1.6}
  .cover{background:linear-gradient(160deg,#0B1E3A,#0E5C8C 60%,#2A8BC4);color:#fff;border-radius:14px;padding:34px 30px;margin-bottom:22px}
  .cover img{width:54px;height:54px;border-radius:12px;vertical-align:middle}
  .brand{font-weight:700;font-size:15pt;margin-inline-start:10px;vertical-align:middle}
  h1{font-size:23pt;line-height:1.25;margin:22px 0 10px}
  .dek{opacity:.92;font-size:12.5pt;margin:0}
  .meta{opacity:.75;font-size:9.5pt;margin-top:14px}
  .tldr{background:#f3f6fa;border-inline-start:4px solid #0E5C8C;padding:12px 16px;border-radius:8px;margin:0 0 18px}
  h2{color:#0E5C8C;font-size:15pt;margin:22px 0 6px;break-after:avoid}
  table{border-collapse:collapse;width:100%;font-size:10pt;margin:8px 0;break-inside:avoid}
  td,th{border:1px solid #d5dde6;padding:6px 8px;text-align:start}th{background:#eef3f8}
  a{color:#0E5C8C}
  .end{margin-top:26px;padding:14px 16px;border-radius:10px;background:#fff6e5;font-size:10.5pt}
  </style></head><body>
  <div class="cover"><img src="${logo}"><span class="brand">${he ? "יוונט · Yavanet" : "Yavanet · יוונט"}</span>
  <h1>${c.title}</h1><p class="dek">${c.dek}</p><div class="meta">${he ? "עודכן" : "Updated"}: ${date} · yavanet.gr</div></div>
  <div class="tldr"><b>${he ? "בקצרה" : "In short"}</b><ul>${c.tldr.map((x) => `<li>${x}</li>`).join("")}</ul></div>
  ${md(c.body).replace(/href="\//g, 'href="https://yavanet.gr/')}
  <div class="end">${he ? "המדריך מתעדכן באתר: " : "This guide is kept up to date at: "}<a href="https://yavanet.gr${he ? "" : "/en"}/a/${a.slug}/">yavanet.gr${he ? "" : "/en"}/a/${a.slug}/</a><br>${he ? "מידע כללי בלבד, לא ייעוץ משפטי או מיסויי." : "General information only, not legal or tax advice."}</div>
  </body></html>`;
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: "load" });
  await p.pdf({ path: `site/assets/yavanet-guide-buying-property-${lang}.pdf`, format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#8a97a5">yavanet.gr · <span class="pageNumber"></span>/<span class="totalPages"></span></div>`, margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" } });
  console.log("✓", lang);
}
await b.close();
