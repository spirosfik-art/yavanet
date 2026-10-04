// Αγγελίες S.F. Properties στο Yavanet: /nadlan/ (πώληση + μακροχρόνια ενοικίαση), /nadlan/<id>/, πλαίσιο «דירות זמינות עכשיו».
// Δεδομένα: content/listings.json (automation/listings.mjs, καθημερινά από το sfproperties.gr + ισοτιμία ΕΚΤ).
// Κανόνες: μόνο ό,τι δείχνει η πηγή (καμία επινόηση), καθαρή αναφορά ότι είναι αγγελίες του μεσιτικού του εκδότη,
// το ποσό σε ₪ είναι κατά προσέγγιση, και ποτέ οι περιοχές Αμπελόκηποι / Ψυχικό.
import fs from "node:fs";
import path from "node:path";
import { esc, P, abs } from "./templates.mjs";

export const EXCLUDED = /αμπελ[οό]κηπ|ampelok[iy]p|ψυχικ|psych?ik|psychic|אמפלוקיפ|פסיחיקו/i;
const WA = "306906723676";
const GEMI = "172090403000";
export const NADLAN_GUIDE = "buying-property-in-greece-israelis-guide";

export function loadListings(root) {
  let d = null;
  try { d = JSON.parse(fs.readFileSync(path.join(root, "content/listings.json"), "utf8")); } catch { return null; }
  const skipped = [];
  const list = (d.listings || []).filter((x) => {
    const bad = EXCLUDED.test([x.areaEl, x.titleEl, x.descriptionEl, x.tr && x.tr.he && x.tr.he.desc, x.tr && x.tr.en && x.tr.en.desc].join(" "));
    if (bad) skipped.push(x.id);
    return !bad && x.id && x.price && x.sqm && x.areaEl;
  });
  // νεότερες πρώτα: πρώτη εμφάνιση, μετά κωδικός (οι κωδικοί Spitogatos αυξάνονται με τον χρόνο)
  list.sort((a, b) => (b.firstSeen || "").localeCompare(a.firstSeen || "") || +b.id - +a.id);
  if (skipped.length) console.warn(`⚠️ /nadlan/: παραλείφθηκαν (εξαιρούμενη περιοχή): ${skipped.join(", ")}`);
  return { ...d, listings: list, sale: list.filter((x) => x.deal === "sale"), rent: list.filter((x) => x.deal === "rent") };
}

/* ---------- Ονόματα: τύπος, περιοχή, όροφος ---------- */
const TYPE = {
  "Διαμέρισμα": ["דירה", "Apartment", "Apartment"], "Γκαρσονιέρα": ["דירת סטודיו", "Studio", "Apartment"], "Μεζονέτα": ["מזונט", "Maisonette", "Apartment"],
  "Βίλα": ["וילה", "Villa", "House"], "Μονοκατοικία": ["בית פרטי", "Detached house", "House"], "Επαγγελματικό κτίριο": ["בניין מסחרי", "Commercial building", "Accommodation"],
  "Γραφείο": ["משרד", "Office", "Accommodation"], "Κατάστημα": ["חנות", "Shop", "Accommodation"], "Οικόπεδο": ["מגרש", "Plot", "Landform"],
};
// [עברית, Latin, main] – main = όνομα περιοχής/δήμου για τον τίτλο
const AREA = {
  "Ζωγράφου": ["זוגרפו", "Zografou", 1], "κέντρο": ["מרכז", "centre"], "Βούλα": ["וולה", "Voula", 1], "Γκράβα": ["גקרבה", "Gkrava"], "Πατήσια": ["פטיסיה", "Patisia", 1],
  "Νέο Παγκράτι": ["ניאו פנגרטי", "Neo Pagrati", 1], "Βύρωνας": ["ווירונס", "Vyronas", 1], "Τερψιθέα": ["טרפסיתאה", "Terpsithea"], "Γλυφάδα": ["גליפדה", "Glyfada", 1],
  "Καρελλάς": ["קרלאס", "Karellas"], "Κορωπί": ["קורופי", "Koropi", 1], "Παγκράτι": ["פנגרטי", "Pagrati", 1], "Άλσος Βεΐκου": ["פארק וייקו", "Alsos Veikou"], "Γαλάτσι": ["גלאצי", "Galatsi", 1],
  "Μεταμόρφωση Βύρωνα": ["מטמורפוסי", "Metamorfosi"], "Εξάρχεια": ["אקסרכיה", "Exarcheia", 1], "Νεάπολη": ["נאפולי", "Neapoli"], "Άνω Πατήσια": ["אנו פטיסיה", "Ano Patisia", 1],
  "Κυψέλη": ["קיפסלי", "Kypseli", 1], "Πολύγωνο": ["פוליגונו", "Polygono", 1], "Τουρκοβούνια": ["טורקובוניה", "Tourkovounia"], "Πετράλωνα": ["פטרלונה", "Petralona", 1],
  "Κεραμεικός": ["קרמיקוס", "Kerameikos", 1], "Γκάζι": ["גאזי", "Gazi"], "Μεταξουργείο": ["מטקסורגיו", "Metaxourgeio"], "Βοτανικός": ["בוטניקוס", "Votanikos"],
  "Κουκάκι": ["קוקאקי", "Koukaki", 1], "Κολωνάκι": ["קולונקי", "Kolonaki", 1], "Κουκάκι - Μακρυγιάννη": ["קוקאקי – מקריגיאני", "Koukaki – Makrygianni", 1], "Μακρυγιάννη": ["מקריגיאני", "Makrygianni"],
  "Πλάκα": ["פלאקה", "Plaka", 1], "Ψυρρή": ["פסירי", "Psyrri", 1], "Γλυφάδα κέντρο": ["מרכז גליפדה", "Glyfada centre", 1], "Βουλιαγμένη": ["בוליאגמני", "Vouliagmeni", 1],
  "Άλιμος": ["אלימוס", "Alimos", 1], "Παλαιό Φάληρο": ["פליאו פלירו", "Palaio Faliro", 1], "Νέα Σμύρνη": ["ניאה סמירני", "Nea Smyrni", 1], "Χαλάνδρι": ["חלנדרי", "Chalandri", 1],
  "Μαρούσι": ["מרוסי", "Marousi", 1], "Κηφισιά": ["קיפיסיה", "Kifisia", 1], "Πειραιάς": ["פיראוס", "Piraeus", 1], "Αθήνα": ["אתונה", "Athens", 1],
};
const GR = { α: "a", ά: "a", β: "v", γ: "g", δ: "d", ε: "e", έ: "e", ζ: "z", η: "i", ή: "i", θ: "th", ι: "i", ί: "i", ϊ: "i", ΐ: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", ό: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", ύ: "y", ϋ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o", ώ: "o" };
const translit = (s) => String(s).toLowerCase().replace(/ου/g, "ou").replace(/αι/g, "ai").replace(/ει/g, "ei").replace(/οι/g, "oi").replace(/ντ/g, "nt").replace(/μπ/g, "mp").replace(/γκ/g, "gk").replace(/./g, (c) => GR[c] ?? c).replace(/(^|[\s(–-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const comp = (c) => AREA[c] || AREA[c.charAt(0).toUpperCase() + c.slice(1)] || [null, translit(c)];
// «Κεραμεικός, Γκάζι - Μεταξουργείο - Βοτανικός» → he/en με τους ίδιους διαχωριστές
export function areaName(areaEl) {
  const parts = String(areaEl).split(/(\s*,\s*|\s+-\s+)/);
  const he = [], en = [];
  let main = null;
  for (const p of parts) {
    if (/^\s*,\s*$/.test(p)) { he.push(", "); en.push(", "); continue; }
    if (/^\s+-\s+$/.test(p)) { he.push(" – "); en.push(" – "); continue; }
    const [h, l, m] = comp(p.trim());
    he.push(h || l); en.push(l);
    if (!main && m) main = { he: h, en: l };
  }
  const first = comp(parts[0].trim());
  main = main || { he: first[0] || first[1], en: first[1] };
  const enFull = en.join("");
  return { he: he.join(""), en: enFull, heFull: he.join("") === enFull ? enFull : `${he.join("")} (${enFull})`, main };
}
// Στα εβραϊκά το λατινικό όνομα σε <bdi>, για σωστή σειρά των παρενθέσεων (RTL)
const areaHTML = (a, he) => he ? (a.he === a.en ? `<bdi>${esc(a.en)}</bdi>` : `${esc(a.he)} (<bdi>${esc(a.en)}</bdi>)`) : esc(a.en);
const floorName = (f, he) => {
  if (!f) return null;
  if (/^Ισόγειο/i.test(f)) return he ? "קומת קרקע" : "Ground floor";
  if (/^Υπόγειο/i.test(f)) return he ? "קומת מרתף" : "Basement";
  let m = f.match(/^(\d+)\s*ος?\s*όροφος/i); if (m) return he ? `קומה ${m[1]}` : `Floor ${m[1]}`;
  m = f.match(/^(\d+)\s*επίπεδα/i); if (m) return he ? `${m[1]} מפלסים` : `${m[1]} levels`;
  return f;
};
const typeOf = (x) => TYPE[x.typeEl] || [x.typeEl, translit(x.typeEl), "Accommodation"];
const commercial = (x) => /Επαγγελματ|Γραφείο|Κατάστημα/.test(x.typeEl || "");

/* ---------- Τιμές ---------- */
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const eur = (v) => "€" + n0(v);
const ilsApprox = (x, fx) => fx && fx.eurIls ? Math.round((x.price * fx.eurIls) / (x.deal === "rent" ? 10 : 1000)) * (x.deal === "rent" ? 10 : 1000) : null;
const fxDate = (fx) => { const [y, m, d] = String(fx.date).split("-"); return `${+d}.${+m}.${y}`; };
const perM2 = (x, he) => x.deal === "rent" ? `€${(x.price / x.sqm).toFixed(1)} ${he ? "למ״ר לחודש" : "per m²/month"}` : `€${n0(x.price / x.sqm)} ${he ? "למ״ר" : "per m²"}`;
const priceMain = (x, he) => x.deal === "rent" ? `${eur(x.price)}${he ? " לחודש" : " /month"}` : eur(x.price);
const STATUS = { available: null, sold: ["נמכר", "Sold"], rented: ["הושכר", "Rented"] };

export const listingUrl = (lang, x) => P(lang, `/nadlan/${x.id}/`);
export function listingTitle(x, lang) {
  const he = lang === "he", t = typeOf(x), a = areaName(x.areaEl);
  return he ? `${t[0]} ${x.sqm} מ״ר ${x.deal === "rent" ? "להשכרה" : "למכירה"} ב${a.main.he}` : `${t[1]}, ${x.sqm} m², for ${x.deal === "rent" ? "rent" : "sale"} in ${a.main.en}`;
}
const waHref = (lang, x) => `https://wa.me/${WA}?text=${encodeURIComponent(lang === "he"
  ? `שלום, ראיתי ביוונט את הנכס ${x.id} (${listingTitle(x, "he")}) ואשמח לפרטים: ${abs(listingUrl("he", x))}`
  : `Hi, I saw listing ${x.id} (${listingTitle(x, "en")}) on Yavanet and would like details: ${abs(listingUrl("en", x))}`)}`;
const srcHref = (x) => `${x.url}?utm_source=yavanet&utm_medium=listing&utm_campaign=nadlan`;
const IMG = (src, alt, eager, cls = "") => `<img${cls ? ` class="${cls}"` : ""} src="${esc(src)}" alt="${esc(alt)}" width="900" height="675" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'} referrerpolicy="no-referrer">`;

export function disclosure(lang) {
  return lang === "he"
    ? `<aside class="nl-disc" role="note"><b>גילוי נאות:</b> אלה מודעות של <a href="https://sfproperties.gr/?utm_source=yavanet&amp;utm_medium=listing&amp;utm_campaign=nadlan" target="_blank" rel="noopener">S.F. Properties</a>, משרד התיווך של המו״ל של יוונט (ספירידון פיקיאס, מתווך נדל״ן מורשה, ΓΕΜΗ ${GEMI}). המחירים כפי שפורסמו על ידי המשרד, וכפופים לשינויים ולזמינות. הסכום בשקלים הוא הערכה בלבד, לפי שער הייחוס של הבנק המרכזי האירופי.</aside>`
    : `<aside class="nl-disc" role="note"><b>Disclosure:</b> these are listings of <a href="https://sfproperties.gr/en/?utm_source=yavanet&amp;utm_medium=listing&amp;utm_campaign=nadlan" target="_blank" rel="noopener">S.F. Properties</a>, the real-estate brokerage of Yavanet's publisher (Spyridon Fikias, licensed real-estate broker, GEMI ${GEMI}). Prices are as published by the agency, subject to change and availability. The shekel amount is an approximation based on the European Central Bank reference rate.</aside>`;
}

/* ---------- Κάρτα ---------- */
export function listingCard(lang, x, fx, eager = false) {
  const he = lang === "he", a = areaName(x.areaEl), st = STATUS[x.status];
  const ils = ilsApprox(x, fx);
  const badge = st ? `<span class="nl-badge closed">${st[he ? 0 : 1]}</span>` : `<span class="nl-badge ${x.deal}">${x.deal === "rent" ? (he ? "להשכרה" : "For rent") : (he ? "למכירה" : "For sale")}</span>`;
  const facts = [`${x.sqm} ${he ? "מ״ר" : "m²"}`, x.bedrooms ? (commercial(x) ? `${x.bedrooms} ${he ? "חדרים" : "rooms"}` : he ? (x.bedrooms === 1 ? "חדר שינה 1" : `${x.bedrooms} חדרי שינה`) : `${x.bedrooms} bed`) : null, floorName(x.floorEl, he)].filter(Boolean).join(" · ");
  return `<a class="nl-card${st ? " closed" : ""}" href="${listingUrl(lang, x)}" data-listing="${esc(x.id)}">
<span class="nl-ph">${x.images && x.images[0] ? IMG(x.images[0], listingTitle(x, lang), eager) : ""}${badge}</span>
<span class="nl-cb"><span class="nl-pr"><b dir="ltr">${priceMain(x, he)}</b>${ils ? `<i dir="ltr">≈ ₪${n0(ils)}</i>` : ""}</span>
<b class="nl-t">${esc(listingTitle(x, lang))}</b>
<span class="nl-a">📍 ${areaHTML(a, he)}</span>
<span class="nl-f">${esc(facts)}</span></span></a>`;
}

/* ---------- Πλαίσιο «διαθέσιμα τώρα» (άρθρα, /invest/, /madad/) ---------- */
export function nadlanBox(lang, D, n = 3) {
  if (!D) return "";
  const list = D.sale.filter((x) => x.status === "available").slice(0, n);
  if (!list.length) return "";
  const he = lang === "he";
  return `<section class="nl-box" aria-labelledby="nlb-h"><div class="zone-h"><h2 id="nlb-h">${he ? "דירות זמינות עכשיו" : "Available now"}</h2><a class="zone-more" href="${P(lang, "/nadlan/")}">${he ? `לכל ${D.sale.length} הנכסים למכירה ←` : `All ${D.sale.length} properties for sale →`}</a></div>
<div class="nl-grid nl-mini">${list.map((x) => listingCard(lang, x, D.fx)).join("")}</div>
<p class="small">${he ? `מודעות של S.F. Properties, משרד התיווך של המו״ל של יוונט (ΓΕΜΗ ${GEMI}). מחירים כפי שפורסמו, כפופים לשינויים.` : `Listings of S.F. Properties, the brokerage of Yavanet's publisher (GEMI ${GEMI}). Prices as published, subject to change.`}</p></section>`;
}

/* ---------- /nadlan/ ---------- */
export function nadlanIndexPage(lang, D) {
  const he = lang === "he";
  const title = he ? "דירות למכירה ביוון לישראלים" : "Property for sale in Greece";
  const intro = he
    ? `${D.sale.length} נכסים למכירה ו-${D.rent.length} דירות להשכרה לטווח ארוך באתונה והסביבה, עם מחיר באירו ובשקלים, מחיר למ״ר ותמונות. מתעדכן כל יום.`
    : `${D.sale.length} properties for sale and ${D.rent.length} long-term rentals in and around Athens, with prices in euros and shekels, price per m² and photos. Updated daily.`;
  const fxNote = D.fx ? (he ? `הסכומים בשקלים (≈) לפי שער בנק אירופה (ECB) מ-${fxDate(D.fx)}: <bdi dir="ltr">€1 = ₪${D.fx.eurIls}</bdi>, הערכה בלבד.` : `≈ ₪ at the European Central Bank rate of ${fxDate(D.fx)}: €1 = ₪${D.fx.eurIls}.`) : "";
  const grid = (list) => `<div class="nl-grid">${list.map((x, i) => listingCard(lang, x, D.fx, i < 2)).join("")}</div>`;
  const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
${disclosure(lang)}
<nav class="nl-tabs" aria-label="${he ? "סוג עסקה" : "Deal type"}"><a href="#sale">${he ? "למכירה" : "For sale"} <b>${D.sale.length}</b></a><a href="#rent">${he ? "להשכרה" : "For rent"} <b>${D.rent.length}</b></a></nav>
<section id="sale" class="nl-sec"><div class="zone-h"><h2>${he ? "נכסים למכירה" : "For sale"}</h2></div>${D.sale.length ? grid(D.sale) : `<div class="empty">${he ? "אין כרגע נכסים למכירה." : "No properties for sale right now."}</div>`}</section>
<section class="means"><h2>${he ? "לפני שקונים" : "Before you buy"}</h2><p>${he ? `<a href="${P(lang, "/a/" + NADLAN_GUIDE + "/")}">המדריך המלא לקניית דירה ביוון</a> · <a href="${P(lang, "/tools/")}#calc-cost">מחשבון עלויות רכישה</a> · <a href="${P(lang, "/madad/")}">מחירי דירות לפי שכונה</a> · <a href="${P(lang, "/golden-visa-quiz/")}">שאלון ויזת זהב</a>` : `<a href="${P(lang, "/a/" + NADLAN_GUIDE + "/")}">The complete buying guide</a> · <a href="${P(lang, "/tools/")}#calc-cost">Purchase cost calculator</a> · <a href="${P(lang, "/madad/")}">Prices by area</a> · <a href="${P(lang, "/golden-visa-quiz/")}">Golden Visa quiz</a>`}</p></section>
<section id="rent" class="nl-sec"><div class="zone-h"><h2>${he ? "דירות להשכרה באתונה" : "Flats for rent in Athens"}</h2></div><p class="small">${he ? "השכרה לטווח ארוך, למי שעובר לגור באתונה. לרשימת המשימות: " : "Long-term rentals for people relocating to Athens. Your to-do list: "}<a href="${P(lang, "/moving-checklist/")}">${he ? "צ׳קליסט מעבר ליוון" : "Moving checklist"}</a> · <a href="${P(lang, "/cost-of-living/")}">${he ? "יוקר המחיה" : "Cost of living"}</a></p>${D.rent.length ? grid(D.rent) : `<div class="empty">${he ? "אין כרגע דירות להשכרה." : "No rentals right now."}</div>`}</section>
<section class="guide-cta"><h2>${he ? "לא מצאתם מה שחיפשתם?" : "Didn't find what you need?"}</h2><p>${he ? "ספרו לנו מה אתם מחפשים (אזור, תקציב, גודל) ונחזור אליכם בעברית." : "Tell us what you're looking for (area, budget, size) and we'll get back to you."}</p><a class="btn wa" href="https://wa.me/${WA}?text=${encodeURIComponent(he ? "שלום, ראיתי את הדירות ביוונט ואני מחפש/ת נכס ביוון" : "Hi, I saw the listings on Yavanet and I'm looking for a property in Greece")}" target="_blank" rel="noopener" data-listing="index">💬 ${he ? "כתבו לנו בוואטסאפ" : "WhatsApp us"}</a></section>
<p class="small">${fxNote} ${he ? "מקור: " : "Source: "}<a href="https://sfproperties.gr/?utm_source=yavanet&amp;utm_medium=listing&amp;utm_campaign=nadlan" target="_blank" rel="noopener">sfproperties.gr</a>${D.updated ? (he ? ` · עודכן: ${esc(String(D.updated).slice(0, 10).split("-").reverse().join("."))}` : ` · Updated: ${esc(String(D.updated).slice(0, 10).split("-").reverse().join("."))}`) : ""}</p>
</div>__WIDGETS__</div>`;
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: title, numberOfItems: D.listings.length, itemListElement: D.listings.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: abs(listingUrl(lang, x)), name: listingTitle(x, lang) })) };
  return { title, description: intro, body, jsonld: [ld] };
}

/* ---------- /nadlan/<id>/ ---------- */
const paras = (s) => String(s || "").trim().split(/\n\s*\n/).map((p) => {
  const ls = p.split("\n").map((l) => l.trim()).filter(Boolean);
  const items = ls.filter((l) => /^[•·-]\s*/.test(l));
  if (items.length && items.length === ls.length) return `<ul>${items.map((l) => `<li>${esc(l.replace(/^[•·-]\s*/, ""))}</li>`).join("")}</ul>`;
  if (items.length) { const head = ls.filter((l) => !/^[•·-]\s*/.test(l)); return `<p>${head.map(esc).join("<br>")}</p><ul>${items.map((l) => `<li>${esc(l.replace(/^[•·-]\s*/, ""))}</li>`).join("")}</ul>`; }
  return `<p>${ls.map(esc).join("<br>")}</p>`;
}).join("");

export function listingPage(lang, x, D) {
  const he = lang === "he", t = typeOf(x), a = areaName(x.areaEl), st = STATUS[x.status], fx = D.fx;
  const title = listingTitle(x, lang), ils = ilsApprox(x, fx), u = listingUrl(lang, x);
  const tr = x.tr && x.tr[lang] ? x.tr[lang] : null;
  const desc = tr ? tr.desc : "";
  const feats = tr ? tr.features : [];
  const floor = floorName(x.floorEl, he);
  const description = he
    ? `${title} (${a.en}): ${priceMain(x, true)}${ils ? ` (≈ ₪${n0(ils)})` : ""}, ${perM2(x, true)}${x.bedrooms ? `, ${commercial(x) ? `${x.bedrooms} חדרים` : x.bedrooms === 1 ? "חדר שינה 1" : `${x.bedrooms} חדרי שינה`}` : ""}${floor ? `, ${floor}` : ""}. מודעה ${x.id} של S.F. Properties.`
    : `${title}: ${priceMain(x, false)}${ils ? ` (≈ ₪${n0(ils)})` : ""}, ${perM2(x, false)}${x.bedrooms ? `, ${x.bedrooms} ${commercial(x) ? "rooms" : x.bedrooms === 1 ? "bedroom" : "bedrooms"}` : ""}${floor ? `, ${floor.toLowerCase()}` : ""}. Listing ${x.id} by S.F. Properties.`;
  const rows = [
    [he ? "סוג עסקה" : "Deal", x.deal === "rent" ? (he ? "השכרה לטווח ארוך" : "Long-term rental") : (he ? "מכירה" : "Sale")],
    [he ? "סוג נכס" : "Type", he ? t[0] : t[1]],
    [he ? "אזור" : "Area", { html: areaHTML(a, he) }],
    [he ? "שטח" : "Size", `${x.sqm} ${he ? "מ״ר" : "m²"}`],
    x.bedrooms ? [commercial(x) ? (he ? "חדרים" : "Rooms") : (he ? "חדרי שינה" : "Bedrooms"), String(x.bedrooms)] : null,
    x.bathrooms ? [he ? "חדרי רחצה" : "Bathrooms", String(x.bathrooms)] : null,
    floor ? [he ? "קומה" : "Floor", floor] : null,
    x.year ? [he ? "שנת בנייה" : "Year built", String(x.year)] : null,
    x.energy ? [he ? "דירוג אנרגטי" : "Energy class", x.energy] : null,
    [he ? "קוד נכס" : "Listing ID", x.id],
  ].filter(Boolean);
  const imgs = (x.images || []).slice(0, 30);
  const gallery = imgs.length ? `<div class="nl-gal" aria-label="${he ? "תמונות" : "Photos"}">${imgs.map((src, i) => `<figure>${IMG(src, `${title} – ${he ? "תמונה" : "photo"} ${i + 1}`, i === 0)}</figure>`).join("")}</div><p class="nl-galn small">${imgs.length > 1 ? (he ? `${imgs.length} תמונות · החליקו לצפייה ←` : `${imgs.length} photos · swipe to view →`) : ""}</p>` : "";
  const calc = x.deal === "sale" && !st ? `<a class="btn ghost" href="${P(lang, "/tools/")}?price=${x.price}${fx ? `&amp;rate=${fx.eurIls}` : ""}#calc-cost" data-listing="${esc(x.id)}" data-act="calc">🧮 ${he ? "כמה תעלה הקנייה עם כל המיסים?" : "Total cost with taxes and fees"}</a>` : "";
  const guide = x.deal === "sale" ? `<a class="btn ghost" href="${P(lang, "/a/" + NADLAN_GUIDE + "/")}">📘 ${he ? "המדריך לקניית דירה ביוון" : "Buying guide for Greece"}</a>` : `<a class="btn ghost" href="${P(lang, "/moving-checklist/")}">🧳 ${he ? "צ׳קליסט מעבר ליוון" : "Moving checklist"}</a>`;
  const more = (x.deal === "sale" ? D.sale : D.rent).filter((y) => y.id !== x.id && y.status === "available").slice(0, 3);
  const body = `<nav class="nl-crumbs small" aria-label="${he ? "פירורי לחם" : "Breadcrumb"}"><a href="${P(lang, "/")}">${he ? "יוונט" : "Yavanet"}</a> › <a href="${P(lang, "/nadlan/")}">${he ? "נכסים למכירה ולהשכרה" : "Property listings"}</a> › <span>${esc(x.id)}</span></nav>
<div class="grid"><div class="col">
<article class="nl-item">
<header class="nl-head">${st ? `<span class="nl-badge closed">${st[he ? 0 : 1]}</span>` : `<span class="nl-badge ${x.deal}">${x.deal === "rent" ? (he ? "להשכרה" : "For rent") : (he ? "למכירה" : "For sale")}</span>`}
<h1>${esc(title)}</h1><p class="nl-area">📍 ${areaHTML(a, he)}${he ? "" : ", Greece"}</p></header>
${gallery}
<div class="nl-pbox">
<div class="nl-pr"><b dir="ltr">${priceMain(x, he)}</b>${ils ? `<i dir="ltr">≈ ₪${n0(ils)}</i>` : ""}<small dir="${he ? "rtl" : "ltr"}">${esc(perM2(x, he))}</small></div>
${fx && ils ? `<p class="small">${he ? `<bdi dir="ltr">≈ ₪${n0(ils)}</bdi> לפי שער בנק אירופה (ECB) מ-${fxDate(fx)} (<bdi dir="ltr">€1 = ₪${fx.eurIls}</bdi>). הסכום בשקלים הוא הערכה בלבד.` : `≈ ₪${n0(ils)} at the European Central Bank rate of ${fxDate(fx)} (€1 = ₪${fx.eurIls}). The shekel amount is an approximation.`}</p>` : ""}
<a class="btn wa nl-wa" href="${waHref(lang, x)}" target="_blank" rel="noopener" data-listing="${esc(x.id)}">💬 ${st ? (he ? "שאלו על נכסים דומים בוואטסאפ" : "Ask about similar properties on WhatsApp") : (he ? "לפרטים ותיאום ביקור בוואטסאפ" : "Ask about this property on WhatsApp")}</a>
<p class="small">${he ? `ציינו את קוד הנכס <b dir="ltr">${esc(x.id)}</b>. ההודעה מגיעה ל-S.F. Properties.` : `Mention listing ID <b>${esc(x.id)}</b>. Your message goes to S.F. Properties.`}</p>
</div>
<div class="tablewrap"><table class="nl-specs"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${v && v.html ? v.html : esc(v)}</td></tr>`).join("")}</tbody></table></div>
${feats.length ? `<ul class="nl-feat">${feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
${desc ? `<section class="prose nl-desc"><h2>${he ? "תיאור הנכס" : "Description"}</h2>${paras(desc)}${he ? `<p class="small">תרגום נאמן של המודעה המקורית. במקרה של סתירה, הנוסח והמחיר באתר הסוכנות קובעים.</p>` : `<p class="small">Faithful translation of the original listing. In case of any discrepancy, the agency's text and price prevail.</p>`}</section>` : ""}
<div class="btnrow nl-links">${calc}${guide}<a class="btn ghost" href="${esc(srcHref(x))}" target="_blank" rel="noopener" data-listing="${esc(x.id)}" data-act="source">↗ ${he ? "המודעה המקורית ב-sfproperties.gr" : "Original listing on sfproperties.gr"}</a></div>
${disclosure(lang)}
</article>
${more.length ? `<section><div class="zone-h"><h2>${x.deal === "sale" ? (he ? "עוד נכסים למכירה" : "More properties for sale") : (he ? "עוד דירות להשכרה" : "More rentals")}</h2><a class="zone-more" href="${P(lang, "/nadlan/")}#${x.deal}">${he ? "לכל הנכסים ←" : "All listings →"}</a></div><div class="nl-grid nl-mini">${more.map((y) => listingCard(lang, y, fx)).join("")}</div></section>` : ""}
</div>__WIDGETS__</div>`;
  const kind = t[2];
  const item = { "@type": kind, name: title, ...(kind !== "Landform" ? { floorSize: { "@type": "QuantitativeValue", value: x.sqm, unitCode: "MTK" } } : {}), ...(x.bedrooms && !commercial(x) ? { numberOfBedrooms: x.bedrooms } : {}), ...(x.bedrooms && commercial(x) ? { numberOfRooms: x.bedrooms } : {}), ...(x.bathrooms ? { numberOfBathroomsTotal: x.bathrooms } : {}), ...(x.year ? { yearBuilt: x.year } : {}), address: { "@type": "PostalAddress", addressLocality: a.en, addressCountry: "GR" } };
  const offer = { "@type": "Offer", price: x.price, priceCurrency: "EUR", availability: st ? "https://schema.org/SoldOut" : "https://schema.org/InStock", businessFunction: x.deal === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell", url: x.url,
    ...(x.deal === "rent" ? { priceSpecification: { "@type": "UnitPriceSpecification", price: x.price, priceCurrency: "EUR", unitCode: "MON" } } : {}),
    offeredBy: { "@type": "RealEstateAgent", name: "S.F. Properties", url: "https://sfproperties.gr/", telephone: "+30 690 672 3676", email: "info@sfproperties.gr", identifier: { "@type": "PropertyValue", propertyID: "ΓΕΜΗ", value: GEMI } } };
  const ld = { "@context": "https://schema.org", "@type": "RealEstateListing", name: title, description, url: abs(u), inLanguage: lang, identifier: x.id, image: imgs.slice(0, 8), offers: offer, about: item };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: he ? "יוונט" : "Yavanet", item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: he ? "דירות למכירה ביוון" : "Property for sale in Greece", item: abs(P(lang, "/nadlan/")) }, { "@type": "ListItem", position: 3, name: title, item: abs(u) }] };
  return { title, description, body, jsonld: [ld, crumbs], image: imgs[0] || null };
}

// Για το /search.json
export function nadlanSearch(lang, D) {
  if (!D) return [];
  const he = lang === "he";
  return [["/nadlan/", he ? "דירות למכירה ולהשכרה ביוון" : "Property for sale and rent in Greece", he ? "דירה למכירה דירות למכירה ביוון אתונה להשכרה שכירות נכס נכסים מודעות" : "flat apartment for sale rent Athens listings property", he ? "עמוד" : "Page"],
    ...D.listings.map((x) => { const a = areaName(x.areaEl); return [`/nadlan/${x.id}/`, listingTitle(x, lang), `${a.he} ${a.en} ${x.id} ${x.deal === "rent" ? (he ? "להשכרה שכירות" : "rent") : (he ? "למכירה קנייה" : "sale buy")}`, he ? "נכס" : "Listing"]; })];
}
