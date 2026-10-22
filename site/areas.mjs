// Σελίδες «Πόσο κοστίζει διαμέρισμα στο …» για κάθε γειτονιά του Δείκτη Yavanet (content/madad/YYYY-MM.json).
// /madad/<slug>/ (εβραϊκά) και /en/madad/<slug>/. Ανανεώνονται αυτόματα με κάθε νέο αρχείο μήνα.
import { esc, P, abs } from "./templates.mjs";

export const areaSlug = (a) => String(a.en).toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const areaUrl = (lang, a) => P(lang, `/madad/${areaSlug(a)}/`);

const WA = "306906723676";
const eur = (v) => "€" + Math.round(+v).toLocaleString("en-US");
const ils = (v, fx) => "₪" + Math.round(+v * fx).toLocaleString("en-US");
const pct = (v) => (v == null || v === "" ? null : `${+v > 0 ? "+" : ""}${(+v).toFixed(1)}%`);

export function areaPage(lang, a, madad, fx) {
  const he = lang === "he";
  const n = a[lang] || a.en;
  const [yy, mm] = madad.month.split("-");
  const monthName = new Date(Date.UTC(+yy, +mm - 1, 15)).toLocaleDateString(he ? "he-IL" : "en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const all = madad.areas.filter((x) => x.sale);
  const avg = all.reduce((s, x) => s + +x.sale, 0) / all.length;
  const sorted = [...all].sort((x, y) => +y.sale - +x.sale);
  const rank = sorted.findIndex((x) => x.en === a.en) + 1;
  const yld = a.rent && a.sale ? (a.rent * 12 / a.sale) * 100 : null;
  const vsAvg = Math.round((a.sale / avg - 1) * 100);
  const yr = madad.changeBasis === "year";
  const chgS = pct(a.saleChg), chgR = pct(a.rentChg);
  const group = madad.groups && a.group ? madad.groups[a.group][lang] : null;
  const near = all.filter((x) => x.group === a.group && x.en !== a.en).sort((x, y) => +y.sale - +x.sale);
  const sizes = [45, 70, 95];
  const buyCost = 1.08; // ~8% κόστη αγοράς (φόρος, συμβολαιογράφος, δικηγόρος, μεταγραφή)

  const title = he ? `כמה עולה דירה ב${n}? מחיר למ״ר, ${monthName}` : `How much is a flat in ${n}? Price per m², ${monthName}`;
  const seoTitle = he ? `מחיר דירה ב${n} (אתונה) – מחיר למ״ר ושכירות ${yy}` : `${n} (Athens) property prices – price per m² and rent ${yy}`;
  const description = he
    ? `מחיר ממוצע למ״ר ב${n}: ${eur(a.sale)} (כ-${ils(a.sale, fx)}). שכירות כ-€${(+a.rent).toFixed(1)} למ״ר בחודש${yld ? `, תשואה ברוטו כ-${yld.toFixed(1)}%` : ""}. נתוני ${monthName}.`
    : `Average price per m² in ${n}: ${eur(a.sale)}. Rent about €${(+a.rent).toFixed(1)}/m² a month${yld ? `, gross yield about ${yld.toFixed(1)}%` : ""}. Data for ${monthName}.`;

  const stat = (lbl, val, sub) => `<div class="ar-st"><span>${esc(lbl)}</span><b dir="ltr">${val}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;
  const stats = [
    stat(he ? "מחיר ממוצע למ״ר" : "Average price per m²", eur(a.sale), `<span dir="ltr">${ils(a.sale, fx)}</span>`),
    stat(he ? "שכירות למ״ר בחודש" : "Rent per m² a month", "€" + (+a.rent).toFixed(1), chgR ? `${he ? (yr ? "שינוי בשנה" : "שינוי בחודש") : (yr ? "1-year change" : "1-month change")}: <span dir="ltr">${chgR}</span>` : ""),
    stat(he ? "תשואה ברוטו" : "Gross yield", yld ? yld.toFixed(1) + "%" : "–", he ? "לפני הוצאות ומיסים" : "before costs and taxes"),
    stat(he ? (yr ? "שינוי מחיר בשנה" : "שינוי מחיר בחודש") : (yr ? "Price change, 1 year" : "Price change, 1 month"), chgS || "–", ""),
  ].join("");

  const exRows = sizes.map((s) => `<tr><td dir="ltr">${s} ${he ? "מ״ר" : "m²"}</td><td dir="ltr">${eur(a.sale * s)}</td><td dir="ltr">${ils(a.sale * s, fx)}</td><td dir="ltr">${eur(a.sale * s * buyCost)}</td><td dir="ltr">€${Math.round(a.rent * s).toLocaleString("en-US")}</td></tr>`).join("");
  const exHead = he ? ["גודל", "מחיר משוער", "בשקלים", "כולל עלויות רכישה (~8%)", "שכירות חודשית משוערת"] : ["Size", "Estimated price", "In shekels", "Incl. buying costs (~8%)", "Estimated monthly rent"];

  const compare = he
    ? `${n} ${vsAvg >= 0 ? `יקרה בכ-${vsAvg}%` : `זולה בכ-${-vsAvg}%`} מהממוצע של ${all.length} האזורים במדד (${eur(avg)} למ״ר), ונמצאת במקום ${rank} מתוך ${all.length} ביוקר.`
    : `${n} is about ${Math.abs(vsAvg)}% ${vsAvg >= 0 ? "above" : "below"} the average of the ${all.length} areas in the index (${eur(avg)}/m²), and ranks ${rank} of ${all.length} by price.`;

  const nearHtml = near.length ? `<section><h2>${he ? `השוואה לשכונות אחרות ב${group}` : `Compared with other areas in ${group}`}</h2><ul class="ar-near">${[a, ...near].sort((x, y) => +y.sale - +x.sale).map((x) => `<li${x.en === a.en ? ' class="me"' : ""}><a href="${areaUrl(lang, x)}">${esc(x[lang] || x.en)}</a><i style="width:${Math.round(+x.sale / sorted[0].sale * 100)}%"></i><b dir="ltr">${eur(x.sale)}</b></li>`).join("")}</ul></section>` : "";

  const waTxt = he ? `שלום, ראיתי ביוונט את מחירי הדירות ב${n}. אשמח לקבל הצעות לדירות שם. התקציב שלי: ` : `Hi, I saw the ${n} property prices on Yavanet. I'd like flats there. My budget: `;
  const cta = `<section class="tlvwa"><h2>${he ? `מחפשים דירה ב${n}?` : `Looking for a flat in ${n}?`}</h2><p>${he ? "שלחו לנו בוואטסאפ את התקציב, ונשלח לכם דירות אמיתיות באזור, כולל כל העלויות, בעברית." : "Send us your budget on WhatsApp and we will send you real flats in the area, with all costs."}</p><a class="btn wa" href="https://wa.me/${WA}?text=${encodeURIComponent(waTxt)}" target="_blank" rel="noopener" data-out="wa-area ${esc(a.en)}">${he ? "שלחו לנו בוואטסאפ" : "Message us on WhatsApp"}</a></section>`;

  const faq = he ? [
    [`כמה עולה דירה ב${n}?`, `לפי מדד יוונט (${monthName}), המחיר הממוצע המבוקש הוא כ-${eur(a.sale)} למ״ר. דירה של 70 מ״ר עולה בממוצע כ-${eur(a.sale * 70)}, לפני עלויות רכישה של כ-8%.`],
    [`כמה שכירות אפשר לקבל ב${n}?`, `השכירות הממוצעת היא כ-€${(+a.rent).toFixed(1)} למ״ר בחודש, כלומר כ-€${Math.round(a.rent * 70)} לחודש לדירה של 70 מ״ר.`],
    [`מה התשואה על דירה להשכרה ב${n}?`, yld ? `התשואה ברוטו הממוצעת היא כ-${yld.toFixed(1)}% בשנה, לפני הוצאות, מיסים ותקופות ללא שוכר.` : "אין מספיק נתונים לחישוב תשואה."],
    ["האם ישראלים יכולים לקנות דירה ביוון?", "כן. צריך מספר מס יווני (AFM), חשבון בנק ועורך דין. שימו לב שממשלת יוון הודיעה על מס רכישה של 15% לקונים מחוץ לאיחוד האירופי מיולי 2027."],
  ] : [
    [`How much is a flat in ${n}?`, `According to the Yavanet Index (${monthName}), the average asking price is about ${eur(a.sale)}/m². A 70 m² flat costs about ${eur(a.sale * 70)} on average, before buying costs of about 8%.`],
    [`What rent can you get in ${n}?`, `Average rent is about €${(+a.rent).toFixed(1)}/m² a month, i.e. about €${Math.round(a.rent * 70)} a month for a 70 m² flat.`],
    [`What is the rental yield in ${n}?`, yld ? `Average gross yield is about ${yld.toFixed(1)}% a year, before costs, taxes and vacancies.` : "Not enough data to calculate yield."],
    ["Can foreigners buy property in Greece?", "Yes. You need a Greek tax number (AFM), a bank account and a lawyer. Greece has announced a 15% transfer tax for non-EU buyers from July 2027."],
  ];
  const faqHtml = `<section><h2>${he ? "שאלות נפוצות" : "FAQ"}</h2>${faq.map(([q, ans]) => `<details class="ar-faq"><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join("")}</section>`;

  const src = madad.source ? `<a href="${esc(madad.source.url)}" target="_blank" rel="noopener">${esc(madad.source.name)}</a>` : "";
  const method = he
    ? `המחירים הם ממוצע מחירי המבוקש במודעות למגורים (לא מחירי עסקאות), לפי ${src}, ${esc(monthName)}. ההמרה לשקלים לפי ₪${fx} לאירו. הערכה כללית בלבד ואינה ייעוץ השקעות; המחיר של דירה מסוימת תלוי בקומה, במצב ובמיקום המדויק.`
    : `Prices are average asking prices in residential listings (not transaction prices), from ${src}, ${esc(monthName)}. Shekel conversion at ₪${fx}/€. General estimate only, not investment advice.`;

  const others = sorted.filter((x) => x.en !== a.en).map((x) => `<a href="${areaUrl(lang, x)}">${esc(x[lang] || x.en)}</a>`).join(" · ");
  const css = `<style>.ar-sts{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:18px 0}.ar-st{background:var(--card,#f4f7fa);border-radius:14px;padding:14px 16px}.ar-st span{display:block;font-size:14px;opacity:.75}.ar-st b{display:block;font-size:28px;margin-top:4px}.ar-st small{display:block;font-size:13px;opacity:.7;margin-top:2px}@media(min-width:720px){.ar-sts{grid-template-columns:repeat(4,1fr)}}
.ar-near{list-style:none;padding:0;margin:10px 0}.ar-near li{display:grid;grid-template-columns:9em 1fr 5.5em;align-items:center;gap:10px;padding:6px 0}.ar-near li i{display:block;height:10px;border-radius:6px;background:#2A8BC4;opacity:.55}.ar-near li.me a{font-weight:800}.ar-near li.me i{background:#F0B650;opacity:1}.ar-near b{text-align:left}.ar-faq{border-bottom:1px solid rgba(127,127,127,.25);padding:10px 0}.ar-faq summary{cursor:pointer;font-weight:700}.ar-faq p{margin:8px 0 0}.ar-all{line-height:2}</style>`;

  const body = `${css}<div class="page-h"><p class="small"><a href="${P(lang, "/madad/")}">${he ? "מדד יוונט" : "Yavanet Index"}</a>${group ? ` › ${esc(group)}` : ""}</p><h1>${esc(title)}</h1><p>${esc(compare)}</p></div>
<div class="grid"><div class="col">
<div class="ar-sts">${stats}</div>
<section><h2>${he ? `כמה עולה דירה ב${n} לפי גודל` : `Flat prices in ${n} by size`}</h2><div class="tablewrap"><table class="madad"><thead><tr>${exHead.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${exRows}</tbody></table></div></section>
${cta}
${nearHtml}
${faqHtml}
<p class="small">${method}</p>
<section><h2>${he ? "מחירים בשכונות נוספות" : "Prices in other areas"}</h2><p class="ar-all">${others}</p></section>
<p><a href="${P(lang, "/tlv-vs-athens/")}">${he ? "השוואה: הדירה שלכם בתל אביב = כמה דירות באתונה? ←" : "Compare: your Tel Aviv flat = how many flats in Athens? →"}</a></p>
__NADLAN__
</div>__WIDGETS__</div>`;

  const jsonld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: he ? "מדד יוונט" : "Yavanet Index", item: abs(P(lang, "/madad/")) },
      { "@type": "ListItem", position: 2, name: n, item: abs(areaUrl(lang, a)) },
    ] },
  ];
  return { title, seoTitle, description, body, jsonld };
}
