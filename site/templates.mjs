import { SITE, SECTIONS, T, LEGAL_PAGES } from "./config.mjs";
import { esc, md, plain } from "./md.mjs";
import { art, SECTION_ART } from "./art.mjs";

export const P = (lang, path) => (lang === "he" ? path : "/en" + path);
export const abs = (p) => SITE.url.replace(/\/$/, "") + p;
export const sec = (slug) => SECTIONS.find((s) => s.slug === slug) || SECTIONS[0];

export function fmtDate(iso, lang) {
  try {
    return new Intl.DateTimeFormat(T[lang].locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" }).format(new Date(iso));
  } catch { return iso; }
}

// Φωτογραφίες Pexels στο σωστό μέγεθος (αντί για 1880px παντού) + srcset για οθόνες retina
const pxl = (u, w) => { try { const x = new URL(u); if (x.host !== "images.pexels.com") return null; x.search = ""; x.searchParams.set("auto", "compress"); x.searchParams.set("cs", "tinysrgb"); x.searchParams.set("w", String(w)); return x.toString(); } catch { return null; } };
const SIZES = { card: [[420, 840], "(max-width:700px) 100vw, 420px"], hero: [[800, 1300], "(max-width:900px) 100vw, 800px"], full: [[800, 1300], "(max-width:900px) 100vw, 800px"] };
export function artHTML(a, lang, kind = "card") {
  const img = a.image;
  if (img && img.type === "photo" && img.url) {
    const alt = esc(img.alt || a[lang].title), eager = kind !== "card";
    const load = eager ? ' fetchpriority="high"' : ' loading="lazy"';
    const [ws, sizes] = SIZES[kind] || SIZES.card;
    if (pxl(img.url, 100)) return `<img src="${esc(pxl(img.url, ws[0]))}" srcset="${ws.map((w) => esc(pxl(img.url, w)) + " " + w + "w").join(", ")}" sizes="${sizes}" alt="${alt}"${load} decoding="async">`;
    return `<img src="${esc(img.url)}" alt="${alt}"${load} decoding="async">`;
  }
  return art((img && img.key) || SECTION_ART[a.section] || "sea", a[lang].title);
}
export function creditHTML(a, lang) {
  const img = a.image;
  if (img && img.type === "photo" && img.credit) return `${esc(img.credit)}${img.creditUrl ? ` · <a href="${esc(img.creditUrl)}" target="_blank" rel="noopener">${esc(img.license || "")}</a>` : ""}`;
  return esc(T[lang].caption);
}

const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  guides: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h6M8 11h6"/></svg>',
  prop: '<svg viewBox="0 0 24 24"><path d="M4 21V9l8-5 8 5v12"/><path d="M9 21v-6h6v6"/></svg>',
  tools: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  travel: '<svg viewBox="0 0 24 24"><path d="M2 16l20-6-3-3-7 3-5-4-2 1 3 5-4 2-2-1-1 1z"/><path d="M3 21h18"/></svg>',
  invest: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/></svg>',
  moving: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  contact: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21.5 19"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};
const NAVL = {
  he: { home: "בית", travel: "חופשה", invest: "השקעה", moving: "לגור ביוון", contact: "צרו קשר", menu: "תפריט", search: "חיפוש" },
  en: { home: "Home", travel: "Holiday", invest: "Invest", moving: "Move", contact: "Contact", menu: "Menu", search: "Search" },
};
const NAV_OF = { strikes: "travel", emergency: "travel", flights: "travel", travel: "travel", "jewish-greece": "travel", madad: "invest", tlv: "invest", "real-estate": "invest", "cost-of-living": "moving", living: "moving" };
function menuSheet(lang) {
  const he = lang === "he", L = (a, b) => (he ? a : b), A = (s) => P(lang, "/a/" + s + "/");
  const g = (title, href, links) => `<section><h3><a href="${href}">${title}</a></h3><ul>${links.filter(Boolean).map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join("")}</ul></section>`;
  return `<div class="msheet" id="msheet" hidden role="dialog" aria-modal="true" aria-label="${L("תפריט", "Menu")}">
<div class="ms-in">
<div class="ms-top"><button type="button" class="ms-search" data-search>${ICONS.search}<span>${L("חיפוש באתר…", "Search the site…")}</span></button><button type="button" class="ms-x" data-menu-close aria-label="${L("סגירה", "Close")}">${ICONS.close}</button></div>
<div class="ms-grid">
${g("🏝️ " + L("חופשה ביוון", "Holiday in Greece"), P(lang, "/travel/"), [[A("greece-travel-guide-israelis-2026"), L("המדריך לטיסה ליוון", "Flying to Greece guide")], [P(lang, "/strikes/"), L("שביתות קרובות", "Upcoming strikes")], [P(lang, "/emergency/"), L("חירום", "Emergency")], GLOBAL.flights ? [P(lang, "/flights/"), L("טיסות זולות", "Cheap flights")] : null, [P(lang, "/directory/"), L("יוון בעברית: עסקים ושירותים", "Hebrew-speaking services")], [A("athens-with-yana-hebrew-tours-athens"), L("טיולים עם יאנה", "Tours with Yana")]])}
${g("🏠 " + L("השקעה בנדל״ן", "Property investment"), P(lang, "/invest/"), [[A("buying-property-in-greece-israelis-guide"), L("המדריך לקניית דירה", "Buying guide")], [A("golden-visa-greece-2026-guide"), L("ויזת זהב", "Golden Visa")], [P(lang, "/madad/"), L("מחירי דירות לפי שכונה", "Prices by area")], [P(lang, "/tlv-vs-athens/"), L("תל אביב מול אתונה", "Tel Aviv vs Athens")], [P(lang, "/tools/"), L("מחשבונים", "Calculators")], [A("managing-property-in-greece-from-israel"), L("ניהול נכס מישראל", "Managing from Israel")]])}
${g("🧳 " + L("לעבור לגור ביוון", "Moving to Greece"), P(lang, "/moving/"), [[A("moving-to-greece-with-family-israelis-guide"), L("המדריך למעבר עם המשפחה", "Moving with family")], [A("greek-tax-number-and-bank-account-guide"), L("מספר מס וחשבון בנק", "Tax number & bank account")], [P(lang, "/cost-of-living/"), L("יוקר המחיה", "Cost of living")]])}
${g("📰 " + L("חדשות", "News"), P(lang, "/"), SECTIONS.map((x) => [P(lang, "/s/" + x.slug + "/"), esc(x[lang])]).concat([[P(lang, "/guides/"), L("כל המדריכים", "All guides")]]))}
${g("💬 " + L("יוונט", "Yavanet"), P(lang, "/contact/"), [[P(lang, "/contact/"), L("צרו קשר: האנשים שלנו", "Contact: our people")], [P(lang, "/") + "#newsletter", L("ניוזלטר", "Newsletter")], [P(lang, "/p/about/"), L("אודות", "About")], [P(lang, "/p/advertise/"), L("פרסום ביוונט", "Advertise")]])}
</div></div></div>
<div class="srch" id="srch" hidden role="dialog" aria-modal="true" aria-label="${L("חיפוש", "Search")}">
<div class="srch-in"><div class="srch-bar">${ICONS.search}<input id="srch-q" type="search" autocomplete="off" enterkeyhint="search" placeholder="${L("מה אתם מחפשים? למשל: רודוס, ויזת זהב, שביתה", "What are you looking for? e.g. Rhodes, Golden Visa, strike")}"><button type="button" class="ms-x" data-search-close aria-label="${L("סגירה", "Close")}">${ICONS.close}</button></div>
<div class="srch-res" id="srch-res" aria-live="polite"></div></div></div>`;
}
const WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
const WAVE = (fill) => `<svg class="b" viewBox="0 0 1200 26" preserveAspectRatio="none"><path fill="${fill}" d="M0 14 Q75 2 150 14 T300 14 T450 14 T600 14 T750 14 T900 14 T1050 14 T1200 14 V26 H0Z"/></svg><svg viewBox="0 0 1200 26" preserveAspectRatio="none"><path fill="${fill}" d="M0 16 Q50 8 100 16 T200 16 T300 16 T400 16 T500 16 T600 16 T700 16 T800 16 T900 16 T1000 16 T1100 16 T1200 16 V26 H0Z"/></svg>`;
export const DIVIDER = '<div class="divider" aria-hidden="true"><svg viewBox="0 0 1200 22" preserveAspectRatio="none"><path d="M0 11 Q50 3 100 11 T200 11 T300 11 T400 11 T500 11 T600 11 T700 11 T800 11 T900 11 T1000 11 T1100 11 T1200 11"/></svg></div>';

// Κοινά στοιχεία για όλες τις σελίδες (ορίζονται από το build): επερχόμενη απεργία, Δείκτης Yavanet
export const GLOBAL = { strike: null, madad: false, win: false, hidden: new Set() };
const STRIKE_WORD = { he: "שביתה", en: "Strike" };


// SEO: τίτλοι/περιγραφές με τις λέξεις που ψάχνουν οι Ισραηλινοί στη Google
const SEO = {
  he: {
    "/": ["יוונט: חדשות יוון בעברית, נדל״ן ביוון וחופשה ביוון לישראלים", "האתר של ישראלים ביוון: חדשות יוון בעברית, קניית דירה ביוון, מחירי נדל״ן באתונה, ויזת זהב, שביתות וטיסות, ומדריכים לרודוס, כרתים ואתונה."],
    "/invest/": ["נדל״ן ביוון לישראלים: השקעה וקניית דירה ביוון", "כל מה שצריך לדעת על השקעה בנדל״ן ביוון: איך קונים דירה באתונה, כמה זה עולה, מחירים לפי שכונה, ויזת זהב, מיסים וליווי אישי בעברית."],
    "/travel/": ["חופשה ביוון: המדריך לישראלים, טיסות, שביתות ואיים", "חופשה ביוון בלי הפתעות: מדריך טיסה ליוון, שביתות קרובות, מה עושים בחירום, מדריכים לרודוס וכרתים, וטיולים באתונה בעברית."],
    "/moving/": ["לעבור לגור ביוון: רילוקיישן ליוון לישראלים", "רילוקיישן ליוון: איזו ויזה, מספר מס וחשבון בנק, בתי ספר, בריאות ויוקר המחיה באתונה לעומת תל אביב. הכול בעברית."],
    "/contact/": ["יועץ נדל״ן דובר עברית ביוון וטיולים באתונה בעברית", "אנשי קשר דוברי עברית ביוון: ליווי בקניית דירה, שיפוץ, השכרה וניהול נכסים, וטיולים וחוויות באתונה."],
    "/madad/": ["מחירי דירות באתונה לפי שכונה (2026)", "כמה עולה מ״ר באתונה? מחירי קנייה ושכירות בכל שכונה: קולונקי, קוקאקי, פנגרטי, גליפדה, קיפסלי ועוד. מתעדכן כל חודש."],
    "/tlv-vs-athens/": ["דירה בתל אביב מול דירה באתונה: מחשבון השוואה", "הכניסו כמה שווה הדירה שלכם בתל אביב וגלו כמה דירות היא קונה באתונה, לפי מחירים אמיתיים לכל שכונה."],
    "/cost-of-living/": ["יוקר המחיה ביוון: אתונה מול תל אביב (2026)", "כמה עולה לחיות ביוון? שכר דירה, סופר, קפה ותחבורה באתונה לעומת תל אביב, בשקלים ובאירו."],
    "/strikes/": ["שביתות ביוון: טיסות, מעבורות ומטרו – עדכונים", "שביתה ביוון? כל השביתות הקרובות בטיסות, מעבורות, מטרו ואוטובוסים, עם תאריכים ומה זה אומר למטיילים."],
    "/emergency/": ["חירום ביוון: מספרי טלפון ושגרירות ישראל באתונה", "מספרי חירום ביוון, שגרירות ישראל באתונה, ומה עושים אם נגנב דרכון, צריך רופא או נתקעים בשביתה."],
    "/directory/": ["יוון בעברית: עסקים ושירותים דוברי עברית ביוון", "עסקים ושירותים בעברית ביוון: ליווי נדל״ן, טיולים באתונה, חב״ד, אוכל כשר, בתי כנסת ועוד."],
    "/tools/": ["מחשבון עלויות קניית דירה ביוון ותשואה משכירות", "חשבו כמה עולה לקנות דירה ביוון (מס רכישה, נוטריון, עורך דין, רישום) ומה התשואה משכירות, בעברית."],
    "/guides/": ["מדריכים לישראלים ביוון: נדל״ן, רילוקיישן וטיולים", "מדריכים מלאים בעברית: קניית דירה ביוון, ויזת זהב, מספר מס וחשבון בנק, מעבר ליוון עם המשפחה, רודוס, כרתים ואתונה."],
  },
  en: {
    "/": ["Yavanet: Greece news for Israelis, property and travel", "Greece news for Israelis: buying property in Greece, Athens prices, Golden Visa, strikes and flights, and guides to Rhodes, Crete and Athens."],
    "/invest/": ["Greek property for Israelis: investing and buying in Greece", "Everything about investing in Greek property: how to buy in Athens, costs, prices by area, Golden Visa, taxes and personal guidance in Hebrew."],
    "/travel/": ["Holiday in Greece: the guide for Israelis", "Flying to Greece, upcoming strikes, emergencies, Rhodes and Crete guides, and tours of Athens in Hebrew."],
    "/moving/": ["Moving to Greece from Israel: relocation guide", "Relocating to Greece: visas, tax number and bank account, schools, healthcare and the cost of living in Athens vs Tel Aviv."],
    "/contact/": ["Hebrew-speaking property adviser and Athens tours", "Hebrew-speaking contacts in Greece: buying, renovating, renting and managing property, plus tours and experiences in Athens."],
    "/madad/": ["Athens property prices by neighbourhood (2026)", "Price per m² to buy and rent in every Athens neighbourhood: Kolonaki, Koukaki, Pangrati, Glyfada, Kypseli and more."],
    "/tlv-vs-athens/": ["Tel Aviv flat vs Athens flats: comparison calculator", "Enter what your Tel Aviv flat is worth and see how many flats it buys in Athens, using real prices by neighbourhood."],
    "/cost-of-living/": ["Cost of living in Greece: Athens vs Tel Aviv (2026)", "Rent, groceries, coffee and transport in Athens compared with Tel Aviv, in euros and shekels."],
    "/strikes/": ["Strikes in Greece: flights, ferries and metro updates", "All upcoming strikes in Greece affecting flights, ferries, metro and buses, with dates and what they mean for travellers."],
    "/emergency/": ["Emergency in Greece: phone numbers and the Israeli embassy", "Emergency numbers in Greece, the Israeli embassy in Athens, and what to do if you lose a passport or need a doctor."],
  },
};
export function seoFor(lang, path) { const k = lang === "en" ? path.replace(/^\/en/, "") || "/" : path; return (SEO[lang] || {})[k] || null; }

export function layout({ lang, title, description, path, altPath, body, jsonld = [], head = "", activeSection = null, activeNav = "home", breaking = null, ogType = "website", noindex = false, image = null }) {
  const t = T[lang];
  const NAME = lang === "he" ? SITE.nameHe : SITE.name;
  const other = lang === "he" ? "en" : "he";
  const heUrl = lang === "he" ? path : altPath;
  const enUrl = lang === "en" ? path : altPath;
  const sx = seoFor(lang, path);
  if (sx) description = sx[1];
  const fullTitle = sx ? (path === P(lang, "/") ? sx[0] : `${sx[0]} | ${NAME}`) : title ? `${title} | ${NAME}` : `${NAME} · ${t.tagline}`;
  const brk = breaking
    ? `<a class="breaking${breaking.fire ? " fire" : ""}" href="${P(lang, "/a/" + breaking.slug + "/")}"><span class="tag">${esc(t.breakingTag)}</span><span class="txt">${esc(breaking[lang].title)}</span></a>`
    : "";
  const st = GLOBAL.strike;
  const strikeBar = st && !path.includes("/strikes/")
    ? `<a class="strikebar" href="${P(lang, "/strikes/")}"><span class="tag">🚨 ${STRIKE_WORD[lang]} · ${esc(st.when[lang])}</span><span class="txt">${esc(st[lang])}</span></a>`
    : "";
  const NL = NAVL[lang];
  const curNav = ["travel", "invest", "moving", "contact"].includes(activeNav) ? activeNav : activeNav === "prop" ? "invest" : NAV_OF[activeSection] || (path === P(lang, "/") ? "home" : null);
  const href = { home: P(lang, "/"), travel: P(lang, "/travel/"), invest: P(lang, "/invest/"), moving: P(lang, "/moving/"), contact: P(lang, "/contact/") };
  const navA = (k) => `<a href="${href[k]}"${curNav === k ? ' class="on" aria-current="page"' : ""}>${ICONS[k]}<span>${esc(NL[k])}</span></a>`;
  const nav = ["home", "travel", "invest", "moving", "contact"].map(navA).join("") + `<button type="button" data-search aria-label="${esc(NL.search)}">${ICONS.search}<span>${esc(NL.search)}</span></button><button type="button" data-menu aria-label="${esc(NL.menu)}">${ICONS.menu}<span>${esc(NL.menu)}</span></button>`;
  const bnav = ["home", "travel", "invest", "moving"].map(navA).join("") + `<button type="button" data-menu>${ICONS.menu}<span>${esc(NL.menu)}</span></button>`;
  const showChips = SECTIONS.some((x) => x.slug === activeSection);
  const chips = showChips ? SECTIONS.map((x) => `<a href="${P(lang, "/s/" + x.slug + "/")}"${activeSection === x.slug ? ' aria-current="page"' : ""}>${esc(x[lang])}</a>`).join("") : "";
  const legal = LEGAL_PAGES.map((p) => `<a href="${P(lang, "/p/" + p + "/")}">${esc(t.legal[p])}</a>`).join("") + `<button type="button" data-cookie-settings>${esc(t.cookieSettings)}</button>`;
  const cfg = { lang, grp: (ogType === "article" ? "Άρθρα / " : "Σελίδες / ") + (activeSection || activeNav || "home"), ga4: SITE.ga4Id, clarity: SITE.clarityId, wa: SITE.whatsappChannel, t: { copied: t.copied, noVoice: t.noVoice, ckSaved: t.ckSaved, ckSave: t.ckSave, nlOk: t.nlOk, nlOkDirect: t.nlOkDirect, nlBad: t.nlBad, formSent: t.formSent, formErr: t.formErr, formBad: t.formBad, loading: t.loading, unavailable: t.unavailable, shabIn: t.shabIn, shabOut: t.shabOut, athens: t.athens, thess: t.thess, readMore: t.readMore, closeLbl: t.closeLbl, next: t.next, prev: t.prev, cities: t.cities, rows: t.rows, yieldGross: t.yieldGross } };
  return `<!doctype html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || t.tagline)}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${abs(path)}">
${heUrl ? `<link rel="alternate" hreflang="he" href="${abs(heUrl)}">` : ""}
${enUrl ? `<link rel="alternate" hreflang="en" href="${abs(enUrl)}">` : ""}
${heUrl ? `<link rel="alternate" hreflang="x-default" href="${abs(heUrl)}">` : ""}
<meta property="og:site_name" content="${NAME}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title || NAME)}">
<meta property="og:description" content="${esc(description || t.tagline)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${esc(image || abs("/og.png"))}">
<meta property="og:locale" content="${lang === "he" ? "he_IL" : "en_GB"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B3A5B">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${NAME}" href="${P(lang, "/rss.xml")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Assistant:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="/styles.css">
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
window.YV=${JSON.stringify(cfg)};
</script>
<script nowprocket data-noptimize="1" data-cfasync="false" data-wpfc-render="false" seraph-accel-crit="1" data-no-defer="1" data-cmp-ab="2">
(function () {
var script = document.createElement("script");
script.async = 1;
script.setAttribute("data-cmp-ab","2");
script.src = 'https://tpembars.com/NTc4ODk4.js?t=578898';
document.head.appendChild(script);
})();
</script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
${head}
</head>
<body>
<a class="skip" href="#main">${lang === "he" ? "דלגו לתוכן" : "Skip to content"}</a>
${strikeBar}${brk}
<header class="sky" id="sky">
  <canvas id="stars" aria-hidden="true"></canvas>
  <div class="wrap inner">
    <a class="logo" href="${P(lang, "/")}"><svg class="lmark" viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="112" fill="#0B3A5B"/><path d="M150 112H232Q262 112 262 142V392H206V168H150Q134 168 134 152V128Q134 112 150 112Z" fill="#fff"/><path d="M318 112H382Q414 112 414 144V168Q414 224 360 262L334 228Q358 210 364 188H318Q302 188 302 172V128Q302 112 318 112Z" fill="#F0B650"/><path d="M120 444Q170 416 220 444T320 444T410 444" fill="none" stroke="#2A8BC4" stroke-width="24" stroke-linecap="round"/></svg><span class="ltxt"><b>${lang === "he" ? "יוו<i>נט</i>" : "Yavan<i>et</i>"}</b><small>${esc(t.tagline)}</small></span></a>
    <div class="hside">
      <nav class="lang" aria-label="Language">
        <a href="${heUrl || "/"}" hreflang="he" lang="he" aria-current="${lang === "he"}">עב</a>
        <a href="${enUrl || "/en/"}" hreflang="en" lang="en" aria-current="${lang === "en"}">EN</a>
      </nav>
      <div class="skymeta" id="skymeta"></div>
    </div>
    <button type="button" class="hsearch" data-search aria-label="${esc(NL.search)}">${ICONS.search}</button>
    <nav class="tnav" aria-label="${lang === "he" ? "ניווט" : "Navigation"}">${nav}</nav>
  </div>
  <div class="waves" aria-hidden="true">${WAVE("var(--bg)")}</div>
</header>
${chips ? `<div class="wrap"><nav class="chips" aria-label="${esc(t.allSections)}">${chips}</nav></div>` : ""}
<main class="wrap" id="main">
${body}
<footer>
  <nav aria-label="Legal">${legal}</nav>
  <div>${esc(t.aiNote)}</div>
  <div>${lang === "he" ? "תמונות" : "Photos"}: <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a></div>
  <div>© ${new Date().getFullYear()} ${NAME} · ${esc(SITE.publisher.brand || SITE.publisher[lang])}</div>
</footer>
</main>
<nav class="bnav" aria-label="Main">${bnav}</nav>
${menuSheet(lang)}
${SITE.whatsappChannel ? `<a class="wafloat" href="${esc(SITE.whatsappChannel)}" aria-label="WhatsApp" target="_blank" rel="noopener">${WA_SVG}</a>` : ""}
<div class="feed" id="feed" hidden></div>
<div class="sv" id="sv" hidden></div>
<div class="cookie" id="cookie" hidden role="dialog" aria-labelledby="ck-t">
  <b id="ck-t">${esc(t.ckTitle)}</b>
  <span>${esc(t.ckText)} <a href="${P(lang, "/p/cookies/")}">${esc(t.legal.cookies)}</a></span>
  <div class="prefs" id="ck-prefs" hidden>
    <label for="ck-need"><input id="ck-need" type="checkbox" checked disabled>${esc(t.ckNeed)}</label>
    <label for="ck-stats"><input id="ck-stats" type="checkbox">${esc(t.ckStats)}</label>
    <label for="ck-ads"><input id="ck-ads" type="checkbox">${esc(t.ckAds)}</label>
  </div>
  <div class="btns">
    <button type="button" id="ck-all">${esc(t.ckAll)}</button>
    <button type="button" id="ck-none">${esc(t.ckNone)}</button>
    <button type="button" id="ck-set">${esc(t.ckSet)}</button>
  </div>
</div>
<div class="toast" id="toast" hidden role="status"></div>
<script src="/app.js" defer></script>
</body>
</html>`;
}

export function kickerHTML(a, lang) {
  const s = sec(a.section);
  return `<span class="kicker ${s.mark}">${esc(s[lang])}</span>${a.sponsored ? `<span class="spons">${esc(T[lang].sponsored)}</span>` : a.partner ? `<span class="spons">${lang === "he" ? "בשיתוף פעולה" : "In partnership"}</span>` : ""}`;
}
export function heroCard(a, lang) {
  return `<a class="hero" href="${P(lang, "/a/" + a.slug + "/")}"><div class="art">${artHTML(a, lang, "hero")}</div><div class="body">${kickerHTML(a, lang)}<h3>${esc(a[lang].title)}</h3><p class="dek">${esc(a[lang].dek)}</p><div class="meta">${fmtDate(a.publishedAt, lang)}</div></div></a>`;
}
export function card(a, lang) {
  return `<a class="card" href="${P(lang, "/a/" + a.slug + "/")}"><div class="art">${artHTML(a, lang)}</div><div>${kickerHTML(a, lang)}<h3>${esc(a[lang].title)}</h3><p>${esc(a[lang].dek)}</p><div class="meta">${fmtDate(a.publishedAt, lang)}</div></div></a>`;
}

export function adBox(lang) {
  const t = T[lang];
  return `<aside class="ad" aria-label="${esc(t.adLabel)}"><span class="lbl">${esc(t.adLabel)}</span><strong>${esc(t.adTitle)}</strong><p>${esc(t.adText)}</p><span class="brand"><img src="/sf-logo-light.png" width="900" height="142" alt="${esc(SITE.ad.brand)}" loading="lazy"><small>${esc(lang === "he" ? SITE.ad.taglineHe : SITE.ad.taglineEn)}</small></span><div class="adrow"><a href="${P(lang, "/advisor/")}">${esc(t.adCta)}</a><span class="admail" dir="ltr">${esc(SITE.ad.email)}</span></div></aside>`;
}

export function newsletterBox(lang, opt = {}) {
  const t = T[lang];
  return `<section class="news" id="${opt.id || "newsletter"}" aria-labelledby="nl-h">
  <h3 id="nl-h">${esc(opt.title || t.nlTitle)}</h3>
  <p style="margin:0">${esc(opt.text || t.nlText)}</p>
  <form data-api="/api/subscribe" data-kind="newsletter"${opt.source ? ` data-source="${esc(opt.source)}"` : ""} novalidate>
    <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input type="hidden" name="lang" value="${lang}">
    <input id="nl-email" name="email" type="email" required autocomplete="email" placeholder="${esc(t.nlPh)}" aria-label="${esc(t.nlPh)}">
    <button class="btn" type="submit">${esc(t.nlBtn)}</button>
    <label class="consent" for="nl-consent" style="flex-basis:100%"><input id="nl-consent" name="consent" type="checkbox" required>${esc(t.nlConsent)}</label>
  </form>
  <div class="btnrow">
    ${SITE.whatsappChannel ? `<a class="btn wa" href="${esc(SITE.whatsappChannel)}" target="_blank" rel="noopener">${esc(t.waJoin)}</a>` : ""}
    ${SITE.telegramChannel ? `<a class="btn ghost" href="${esc(SITE.telegramChannel)}" target="_blank" rel="noopener">${esc(t.tgJoin)}</a>` : ""}
  </div>
</section>`;
}

export function formBox(lang, { id, title, text, kind, fields = [], extra = "" }) {
  const t = T[lang];
  const f = {
    name: `<label for="${id}-name">${esc(t.formName)}<input id="${id}-name" name="name" required autocomplete="name"></label>`,
    email: `<label for="${id}-email">${esc(t.formEmail)}<input id="${id}-email" name="email" type="email" required autocomplete="email"></label>`,
    phone: `<label for="${id}-phone">${esc(t.formPhone)}<input id="${id}-phone" name="phone" type="tel" autocomplete="tel"></label>`,
    area: `<label for="${id}-area">${esc(t.formArea)}<input id="${id}-area" name="area"></label>`,
    budget: `<label for="${id}-budget">${esc(t.formBudget)}<input id="${id}-budget" name="budget" inputmode="numeric"></label>`,
    msg: `<label for="${id}-msg">${esc(t.formMsg)}<textarea id="${id}-msg" name="message" rows="4"></textarea></label>`,
  };
  return `<form class="form" id="${id}" data-api="/api/lead" data-kind="${kind}" novalidate>
  <h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ""}
  <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <input type="hidden" name="lang" value="${lang}"><input type="hidden" name="kind" value="${kind}">${extra}
  ${fields.map((k) => f[k]).join("")}
  <label class="chk" for="${id}-consent"><input id="${id}-consent" name="consent" type="checkbox" required><span>${esc(t.formConsent)} <a href="${P(lang, "/p/privacy/")}">${esc(t.legal.privacy)}</a></span></label>
  <button class="btn" type="submit" style="justify-self:start">${esc(t.formSend)}</button>
  <div class="status" role="status"></div>
</form>`;
}

export function calcBox(lang) {
  const t = T[lang];
  return `<div class="calc" id="calc-cost">
  <div class="row2">
    <label for="c-price">${esc(t.calcPrice)}<input id="c-price" type="number" min="0" step="1000" value="250000" inputmode="numeric"></label>
    <label for="c-rate">${esc(t.calcRate)}<input id="c-rate" type="number" min="0" step="0.01" value="3.47" inputmode="decimal"></label>
  </div>
  <label class="chk" for="c-agent"><input id="c-agent" type="checkbox" checked><span>${esc(t.calcAgent)}</span></label>
  <table id="c-table"></table>
  <p class="fine">${esc(t.calcFine)}</p>
</div>`;
}

export function yieldBox(lang, regions) {
  const t = T[lang];
  return `<div class="calc" id="calc-yield">
  <div class="row2">
    <label for="y-region">${esc(t.yieldRegion)}<select id="y-region">${regions.map((r) => `<option value="${r.id}" data-night="${r.night}" data-occ="${r.occ}">${esc(r[lang])}</option>`).join("")}</select></label>
    <label for="y-price">${esc(t.yieldPrice)}<input id="y-price" type="number" min="0" step="1000" value="250000" inputmode="numeric"></label>
  </div>
  <div class="row2">
    <label for="y-night">${esc(t.yieldNight)} (€)<input id="y-night" type="number" min="0" step="5"></label>
    <label for="y-occ">${esc(t.yieldOcc)} (%)<input id="y-occ" type="number" min="0" max="100" step="1"></label>
  </div>
  <table id="y-table" data-l-gross="${esc(t.yieldGross)}" data-l-net="${esc(t.yieldNet)}" data-l-pct="${esc(t.yieldPct)}"></table>
  <p class="fine">${esc(t.yieldFine)}</p>
</div>`;
}

export function pushBox(lang, big = false) {
  const he = lang === "he";
  const bell = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
  const items = he ? ["שביתות בטיסות, מעבורות ומטרו", "שריפות ומזג אוויר קיצוני", "מבזקים חשובים לישראלים"] : ["Flight, ferry and metro strikes", "Wildfires and severe weather", "Breaking news for Israelis"];
  return `<div class="widget pushbox${big ? " big" : ""}">
<div class="pb-h"><span class="pb-ic">${bell}</span><div><h4>${he ? "התראות למטיילים" : "Traveller alerts"}</h4><span class="pb-sub">${he ? "ישר לטלפון, ברגע שזה קורה" : "Straight to your phone, as it happens"}</span></div></div>
<ul class="pb-list">${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
<button type="button" class="btn pb-btn" data-push>${he ? "הפעלת התראות" : "Turn on alerts"}</button>
<p class="pb-note">${he ? "בחינם · בלי אפליקציה · ביטול בלחיצה" : "Free · No app · Turn off anytime"}</p>
</div>`;
}

export function partners(lang) {
  const he = lang === "he";
  return `<div class="partners" aria-label="${he ? "שותפים" : "Partners"}">
  <span class="plbl">${he ? "שותפים" : "Partners"}</span>
  <a class="pcard p-sf" href="${P(lang, "/advisor/")}"><span class="pk">${he ? "נדל״ן ביוון" : "Property in Greece"}</span><b>${he ? "קונים דירה ביוון? מלווים אתכם בעברית" : "Buying in Greece? Guidance in Hebrew"}</b><small>${he ? "חיפוש, עורך דין, נוטריון, השכרה וניהול" : "Search, lawyer, notary, rental & management"}</small><img src="/sf-logo-light.png" width="900" height="142" alt="S.F. Properties" loading="lazy"><span class="pgo">${he ? "לשיחה עם יועץ ←" : "Talk to an adviser →"}</span></a>
  <a class="pcard p-yana" href="${P(lang, "/a/athens-with-yana-hebrew-tours-athens/")}"><span class="pk">${he ? "טיולים באתונה" : "Athens tours"}</span><b>${he ? "מטיילים באתונה עם יאנה" : "Athens with Yana"}</b><small>${he ? "טיולי יום, טברנות, יאכטה, אוכל כשר והסעות. הכול בעברית." : "Day tours, tavernas, yacht, kosher food and transfers, in Hebrew."}</small><span class="pgo">${he ? "לפרטים והזמנה ←" : "Details & booking →"}</span></a>
  <a class="pcard p-you" href="mailto:${SITE.ad.email}?subject=${encodeURIComponent(he ? "פרסום ביוונט" : "Advertising on Yavanet")}"><b>${he ? "העסק שלכם כאן?" : "Your business here?"}</b><small>${he ? "הגיעו לישראלים שמתכננים טיול, מעבר או השקעה ביוון." : "Reach Israelis planning a trip, move or investment in Greece."}</small><span class="pgo">${he ? "פרסמו ביוונט ←" : "Advertise on Yavanet →"}</span></a>
</div>`;
}

export function widgets(lang, mostRead, noPush = false) {
  const t = T[lang];
  return `<div class="side">
  ${noPush ? "" : pushBox(lang)}
  <div class="widget most"><h4>${esc(t.mostRead)}</h4><ol>${mostRead.map((a) => `<li><a href="${P(lang, "/a/" + a.slug + "/")}">${esc(a[lang].title)}</a></li>`).join("")}</ol></div>
  <div class="widget"><h4>${esc(t.weather)}</h4><div class="rows" id="w-weather">${esc(t.loading)}</div><div class="small">Open-Meteo</div></div>
  <div class="widget"><h4>${esc(t.fx)}</h4><div class="rate" id="w-fx">…</div><div class="small" id="w-fx-d">ECB · Frankfurter</div></div>
  <div class="widget"><h4>${esc(t.shabbat)}</h4><div class="rows" id="w-shabbat">${esc(t.loading)}</div><div class="small">Hebcal</div></div>
  ${partners(lang)}
</div>`;
}

// Μικρό πλαίσιο «✈️ Αθήνα από €104» → /flights/ (ενημερώνεται με κάθε build από content/flights.json)
export function flightTeaser(lang) {
  const d = GLOBAL.flightTop; if (!d) return "";
  const he = lang === "he";
  return `<a class="fteaser" href="${P(lang, "/flights/")}"><span class="ft-ic" aria-hidden="true">✈️</span><span class="ft-t"><b>${he ? `טיסות ליוון מ-<bdi dir="ltr">€${d.price}</bdi> הלוך־חזור` : `Flights to Greece from <bdi dir="ltr">€${d.price}</bdi> return`}</b><small>${he ? `${esc(d.he)} · המחיר הזול היום מתל אביב · עוד ${GLOBAL.flightCount - 1} יעדים` : `${esc(d.en)} · today's lowest fare from Tel Aviv · ${GLOBAL.flightCount - 1} more destinations`}</small></span><span class="ft-go">${he ? "לכל המחירים ←" : "All prices →"}</span></a>`;
}

export function articleBody(a, lang, prev, next) {
  const t = T[lang], c = a[lang], he = lang === "he";
  const url = abs(P(lang, "/a/" + a.slug + "/"));
  const shareRow = (cls = "") => `<div class="share${cls}">
    <a class="btn wa" href="https://wa.me/?text=${encodeURIComponent(c.title + " " + url)}" target="_blank" rel="noopener">${esc(t.shareWa)}</a>
    <a class="btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">${he ? "שתפו בפייסבוק" : "Share on Facebook"}</a>
    <button class="btn ghost" type="button" data-copy="${url}">${esc(t.copy)}</button>`;
  // Οδηγοί: αρίθμηση ενοτήτων και πίνακας περιεχομένων
  let prose = md(c.body), toc = "";
  if (a.guide) {
    let n = 0; const heads = [];
    prose = prose.replace(/<h2>(.*?)<\/h2>/g, (m, h) => { n++; heads.push(h); return `<h2 id="s${n}">${h}</h2>`; });
    if (heads.length > 2) toc = `<nav class="toc" aria-label="${he ? "תוכן העניינים" : "Contents"}"><b>${he ? "במדריך הזה" : "In this guide"}</b><ol>${heads.map((h, i) => `<li><a href="#s${i + 1}">${h}</a></li>`).join("")}</ol></nav>`;
  }
  const cta = a.guide && a.cta === "realestate" ? `<section class="guide-cta"><h2>${he ? "רוצים ליווי אישי, בעברית?" : "Want personal guidance?"}</h2><p>${he ? `${esc(SITE.ad.brand)} מלווה ישראלים בקנייה, בהשכרה ובניהול נכסים ביוון: מהחיפוש, דרך עורך הדין והנוטריון, ועד המפתח והניהול השוטף.` : `${esc(SITE.ad.brand)} helps Israelis buy, rent out and manage property in Greece: from the search, through the lawyer and notary, to the keys and day-to-day management.`}</p><a class="btn gold" href="${P(lang, "/advisor/")}">${he ? "דברו עם יועץ נדל״ן" : "Talk to a property adviser"}</a></section>` : "";
  const src = (a.sources || []).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(" · ");
  return `<article class="full" data-prev="${prev ? P(lang, "/a/" + prev.slug + "/") : ""}" data-next="${next ? P(lang, "/a/" + next.slug + "/") : ""}">
  <div class="art">${artHTML(a, lang, "full")}</div>
  <div class="caption">${creditHTML(a, lang)}</div>
  ${kickerHTML(a, lang)}
  <h1>${esc(c.title)}</h1>
  <p class="dek">${esc(c.dek)}</p>
  <div class="meta">${esc(t.published)}: <time datetime="${a.publishedAt}">${fmtDate(a.publishedAt, lang)}</time>${a.updatedAt ? ` · ${esc(t.updated)}: <time datetime="${a.updatedAt}">${fmtDate(a.updatedAt, lang)}</time>` : ""}</div>
  <div style="margin-top:12px"><button class="btn ghost" type="button" data-listen>▶ ${esc(t.listen)}</button></div>
  ${a.guide ? shareRow(" top") + "</div>" : ""}
  <div class="tldr"><b>${esc(t.thirty)}</b><ul>${c.tldr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
  ${c.means ? `<div class="means"><b>${esc(t.means)}</b><p>${esc(c.means)}</p></div>` : ""}
  ${toc}
  <div class="prose" data-speak>${prose}</div>
  ${cta}
  ${a.section === "travel" && !(a.meta && a.meta.auto === "flights") && !a.partner ? flightTeaser(lang) : ""}
  ${a.sensitive ? `<p class="closing">${esc(t.closing)}</p>` : ""}
  <div class="src"><div>${esc(t.source)} ${src}</div></div>
  ${shareRow()}
    <button class="btn ghost" type="button" data-toggle="report-form">${esc(t.report)}</button>
    <button class="btn ghost" type="button" data-toggle="feedback-form">${esc(t.feedback)}</button>
  </div>
  <div id="report-form" hidden style="margin-top:14px">${formBox(lang, { id: "rep", title: t.reportTitle, kind: "error-report", fields: ["email", "msg"], extra: `<input type="hidden" name="article" value="${a.slug}"><input type="hidden" name="name" value="-">` })}</div>
  <div id="feedback-form" hidden style="margin-top:14px">${formBox(lang, { id: "fb", title: t.feedbackTitle, kind: "feedback", fields: ["name", "email", "msg"], extra: `<input type="hidden" name="article" value="${a.slug}">` })}</div>
  <div class="pager">
    ${prev ? `<a href="${P(lang, "/a/" + prev.slug + "/")}" rel="prev"><span>${esc(t.prev)}</span>${esc(prev[lang].title)}</a>` : ""}
    ${next ? `<a href="${P(lang, "/a/" + next.slug + "/")}" rel="next"><span>${esc(t.next)}</span>${esc(next[lang].title)}</a>` : ""}
  </div>
  <div class="swipehint">${esc(t.swipe)}</div>
</article>`;
}

export { esc, md, plain };
