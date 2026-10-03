// Δημιουργία του site: node build.mjs  →  φάκελος dist/
import { makeCritical } from "./site/critical.mjs";
import fs from "node:fs";
import path from "node:path";
import { SITE, SECTIONS, T, LEGAL_PAGES, YIELD_REGIONS, OFFICIAL_LINKS } from "./site/config.mjs";
import { GLOBAL, pushBox, layout, heroCard, card, adBox, newsletterBox, formBox, calcBox, yieldBox, tripBox, widgets, articleBody, flightTeaser, DIVIDER, P, abs, sec, esc, md, plain, artHTML } from "./site/templates.mjs";
import { PAGES } from "./content/pages.mjs";
import { tlvPage } from "./site/tlv.mjs";
import { profileBody } from "./site/profile.mjs";
import { sfShowcase } from "./site/sf.mjs";
import { almyraShowcase } from "./site/almyra.mjs";
import { medtourShowcase } from "./site/medtour.mjs";
import { TI, tileHTML, hubPage, contactPage, doorsHTML } from "./site/hubs.mjs";
import { DESTS, destPage, strikeTodayPage, strikesICS } from "./site/dests.mjs";
import { holidaysStrip, holidaysPage } from "./site/holidays.mjs";
import { shabbatPage } from "./site/shabbat.mjs";
import { gvQuizPage } from "./site/gvquiz.mjs";
import { movingPage } from "./site/moving.mjs";
import { phrasebookPage } from "./site/phrasebook.mjs";
import { strikeCheckPage } from "./site/strikecheck.mjs";
import { isWeather, wxInfo, weatherPage } from "./site/weather.mjs";
import { WX_LEVEL_PAGES, wxLevelUrl, wxLevelPage, wxArticleBox } from "./site/wxlevels.mjs";
import { MONTHS, monthUrl, climatePage, climateIndexPage } from "./site/climate.mjs";
import { NUMBERS as EM_NUM, EMBASSY, CASES } from "./content/emergency.mjs";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, "dist");
const LANGS = ["he", "en"];
const NOW = Date.now();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
// Ο αριθμός του Άση δεν εμφανίζεται πουθενά: τα κουμπιά ανοίγουν φόρμα (email + υπηρεσία) και ο αριθμός δίνεται από το /api/lead.
const asiGate = (p, s) => {
  if (typeof s !== "string" || !/972\s?-?54|54-622-1414/.test(s)) return s;
  const he = !/(^|\/)en\//.test(p);
  if (/\.html$|\/$/.test(p) || !/\.[a-z]+$/.test(p)) {
    s = s.replace(/href="https:\/\/wa\.me\/972546221414[^"]*"/g, 'href="#asi" data-asi-gate="wa"')
      .replace(/href="tel:\+?972546221414"/g, 'href="#asi" data-asi-gate="tel"')
      .replace(/"telephone"\s*:\s*"\+?972[^"]*",?/g, "")
      .replace(/\+?972[\s-]?54[\s-]?622[\s-]?1414/g, he ? "הצגת המספר" : "Show number");
  } else {
    s = s.replace(/https:\/\/wa\.me\/972546221414[^\s"'\)\]<\\]*/g, "https://yavanet.gr/a/asi-doron-real-estate-greece-hebrew/")
      .replace(/\+?972[\s-]?54[\s-]?622[\s-]?1414/g, "");
  }
  return s;
};
// Όπου εμφανίζεται το όνομα του εκδότη (Σπύρος) μέσα στο κείμενο της σελίδας, γίνεται σύνδεσμος WhatsApp.
const SPIROS_WA = "306906723676";
const spirosLinks = (p, s) => {
  if (typeof s !== "string" || !(/\.html$|\/$/.test(p) || !/\.[a-z]+$/.test(p))) return s;
  const i = s.indexOf("<body"); if (i < 0) return s;
  const he = !/(^|\/)en\//.test(p);
  const href = `https://wa.me/${SPIROS_WA}?text=${encodeURIComponent(he ? "שלום ספירוס, הגעתי מיוונט" : "Hi Spyros, I found you on Yavanet")}`;
  const body = s.slice(i).replace(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<a\b[\s\S]*?<\/a>|<[^>]+>|[^<]+)/g, (m) =>
    m[0] === "<" ? m : m.replace(/ספירידון פיקיאס|Spyridon Fikias/g, (n) => `<a href="${href}" target="_blank" rel="noopener" data-out="wa-spiros" title="WhatsApp">${n} 💬</a>`));
  return s.slice(0, i) + body;
};
const write = (p, s) => { const f = path.join(OUT, p.endsWith("/") ? p + "index.html" : p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, spirosLinks(p, asiGate(p, s))); };

/* ---------- Φόρτωση άρθρων ---------- */
const REQUIRED = ["slug", "section", "publishedAt", "sources", "he", "en"];
const articles = fs.readdirSync(path.join(ROOT, "content/articles"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const a = JSON.parse(fs.readFileSync(path.join(ROOT, "content/articles", f), "utf8"));
    for (const k of REQUIRED) if (!a[k]) throw new Error(`${f}: λείπει το πεδίο ${k}`);
    for (const l of LANGS) for (const k of ["title", "dek", "tldr", "body"]) if (!a[l][k]) throw new Error(`${f}: λείπει ${l}.${k}`);
    if (!a.sources.length || !a.sources.every((s) => s.name && s.url)) throw new Error(`${f}: χρειάζεται πηγή με όνομα και σύνδεσμο`);
    if (a.hidden) { GLOBAL.hidden.add(a.slug); return null; }
    return a;
  })
  .filter(Boolean)
  .sort((x, y) => new Date(y.publishedAt) - new Date(x.publishedAt));

/* ---------- Προειδοποιήσεις καιρού (/weather-warnings/): άρθρα Meteoalarm/ΕΜΥ και κακοκαιρίας ---------- */
for (const a of articles) if (isWeather(a)) a.wx = wxInfo(a);
const wxTs = (a) => new Date(a.updatedAt || a.publishedAt).getTime();
const wxArts = articles.filter((a) => a.wx).sort((x, y) => wxTs(y) - wxTs(x));
GLOBAL.wxRecent = wxArts.filter((a) => NOW - wxTs(a) < 48 * 3600e3).length;

/* ---------- Σχετικά άρθρα: κοινές λέξεις-κλειδιά/προορισμοί + ίδια ενότητα + ίδιος τύπος (καιρός/απεργία), όχι μόνο τα 3 πιο πρόσφατα ---------- */
const STOP = new Set("greece greek greeks with from that this have will after over into about their more than what when where your they them were been also new news 2025 2026 2027 israel israeli israelis athens".split(" "));
const kwOf = (a) => new Set([...(a.en.keywords || []).flatMap((k) => k.toLowerCase().split(/[^a-z0-9]+/)), ...a.en.title.toLowerCase().split(/[^a-z0-9]+/), ...a.slug.split("-")].filter((w) => w.length > 3 && !STOP.has(w)));
const KW = new Map(articles.map((a) => [a, kwOf(a)]));
function relatedFor(a, n = 3) {
  const k = KW.get(a), t = new Date(a.publishedAt).getTime();
  return articles.filter((x) => x !== a && !x.partner && !x.sponsored && !x.showcase)
    .map((x) => { let sh = 0; for (const w of KW.get(x)) if (k.has(w)) sh++; const days = Math.abs(new Date(x.publishedAt).getTime() - t) / 864e5;
      return [x, sh * 2 + (x.section === a.section ? 1.5 : 0) + (a.wx && x.wx ? 3 : 0) + (a.strike && x.strike ? 3 : 0) + (a.guide && x.guide ? 1 : 0) - Math.min(days, 60) / 30]; })
    .filter(([, s]) => s > 0.5).sort((p, q) => q[1] - p[1]).slice(0, n).map(([x]) => x);
}

// «מבזקים»: οι πιο πρόσφατες ειδήσεις (όχι οδηγοί/συνεργάτες)
const newsOnly = articles.filter((a) => !a.guide && !a.partner && !a.sponsored && !a.showcase && !a.pinned && !/^eg-/.test((a.meta && a.meta.itemId) || ""));
GLOBAL.flash = newsOnly.filter((a) => NOW - new Date(a.publishedAt).getTime() < 72 * 3600e3);
if (GLOBAL.flash.length < 4) GLOBAL.flash = newsOnly.slice(0, 6);

const photoOf = (a) => { const u = (a.image && (a.image.og || (a.image.type === "photo" && a.image.url))) || null; return u && u.startsWith("/") ? abs(u) : u; };
const bySection = (s) => articles.filter((a) => a.section === s);
const breakingNow = articles.find((a) => a.breaking && NOW - new Date(a.updatedAt || a.publishedAt).getTime() < 12 * 3600e3) || null;
if (breakingNow) breakingNow.fire = (breakingNow.image && breakingNow.image.key === "fire") || /fire|שריפ/i.test(breakingNow.en.title + breakingNow.he.title);
let mostSlugs = [];
try { mostSlugs = JSON.parse(fs.readFileSync(path.join(ROOT, "content/mostread.json"), "utf8")).slugs || []; } catch {}
const mostRead = (mostSlugs.map((s) => articles.find((a) => a.slug === s)).filter(Boolean).concat(articles)).filter((a, i, arr) => arr.indexOf(a) === i && !a.partner).slice(0, 5);

/* ---------- Απεργίες (από άρθρα με πεδίο strike) ---------- */
const athensDay = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Athens" }).format(d);
const TODAY = athensDay(new Date(NOW));
const IN3 = athensDay(new Date(NOW + 3 * 86400e3));
const strikeArts = articles.filter((a) => a.strike && Array.isArray(a.strike.dates) && a.strike.dates.length);
const nextDate = (a) => a.strike.dates.find((d) => d >= TODAY);
const upcomingStrikes = strikeArts.filter(nextDate).sort((x, y) => nextDate(x).localeCompare(nextDate(y)));
const pastStrikes = strikeArts.filter((a) => !nextDate(a) && a.strike.dates[a.strike.dates.length - 1] >= athensDay(new Date(NOW - 30 * 86400e3)));
const fmtDay = (d, lang) => new Date(d + "T12:00:00Z").toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { weekday: "short", day: "numeric", month: "numeric", timeZone: "UTC" });
// Η μπάρα στην κορυφή μόνο για απεργίες που επηρεάζουν τις μετακινήσεις (όχι π.χ. φεστιβάλ ή δημόσιο)
const TRAVEL_SECTORS = ["flights", "ferries", "metro", "buses", "trains", "taxis"];
const soon = upcomingStrikes.find((a) => nextDate(a) <= IN3 && (a.strike.sectors || []).some((s) => TRAVEL_SECTORS.includes(s)));
if (soon) {
  const d = nextDate(soon);
  const when = (lang) => d === TODAY ? (lang === "he" ? "היום" : "Today") : d === athensDay(new Date(NOW + 86400e3)) ? (lang === "he" ? "מחר" : "Tomorrow") : fmtDay(d, lang);
  GLOBAL.strike = { he: soon.strike.he || soon.he.title, en: soon.strike.en || soon.en.title, when: { he: when("he"), en: when("en") } };
}
const SECTOR = { flights: ["✈️ טיסות", "✈️ Flights"], ferries: ["⛴️ מעבורות", "⛴️ Ferries"], metro: ["🚇 מטרו", "🚇 Metro"], buses: ["🚌 אוטובוסים", "🚌 Buses"], trains: ["🚆 רכבות", "🚆 Trains"], taxis: ["🚕 מוניות", "🚕 Taxis"], "public-sector": ["🏛️ שירות ציבורי", "🏛️ Public sector"], other: ["⚠️ אחר", "⚠️ Other"] };

/* ---------- Σελίδες εργαλείων (site/*.mjs): διαδρομή, σελίδα, πλακίδιο στο /tools/, λέξεις αναζήτησης ---------- */
const TOOL_DEFS = [
  { u: "/shabbat/", page: (lang) => shabbatPage(lang), nav: "travel", tile: ["shabbat", "זמני שבת וכשרות", "Shabbat & kosher", "כניסת ויציאת שבת, חב״ד ומסעדות", "Candle times, Chabad, restaurants"], k: ["זמני שבת כניסת שבת יציאת שבת הדלקת נרות שבת באתונה שבת ביוון כשר כשרות חבד בית כנסת מסעדה כשרה", "shabbat times candle lighting havdalah kosher chabad synagogue restaurant"] },
  { u: "/golden-visa-quiz/", page: (lang) => gvQuizPage(lang), nav: "invest", tile: ["quiz", "שאלון ויזת זהב", "Golden Visa quiz", "כמה צריך להשקיע? 5 שאלות", "How much? 5 questions"], k: ["ויזת זהב גולדן ויזה golden visa שאלון כמה להשקיע 250000 400000 800000 250 אלף 400 אלף 800 אלף אישור שהייה תושבות", "golden visa quiz how much invest 250000 400000 800000 residence permit"] },
  { u: "/moving-checklist/", page: (lang) => movingPage(lang, (slug) => articles.some((a) => a.slug === slug)), nav: "moving", tile: ["check", "צ׳קליסט מעבר ליוון", "Moving checklist", "כל המשימות, שלב אחרי שלב", "Every task, step by step"], k: ["צקליסט רשימה מעבר רילוקיישן הגירה לעבור לגור ביוון מספר מס בנק אמקה ויזה בית ספר", "checklist moving relocation tax number bank amka visa school"] },
  { u: "/phrasebook/", page: (lang) => phrasebookPage(lang), nav: "travel", tile: ["phrase", "שיחון יוונית", "Greek phrasebook", "משפטים שימושיים עם הגייה", "Useful phrases with audio"], k: ["שיחון יוונית יווני עברי מילים ביוונית משפטים איך אומרים תודה ביוונית בוקר טוב שלום הגייה", "phrasebook greek words phrases how to say thank you good morning pronunciation"] },
  { u: "/weather-warnings/", page: (lang) => weatherPage(lang, { wxArts, NOW, EM_NUM, exists: (slug) => articles.some((a) => a.slug === slug) }), nav: "travel", section: "breaking", tile: ["weather", "אזהרות מזג אוויר", "Weather warnings", "גשם, סערות ורוחות: היום", "Rain, storms, wind: today"], k: ["אזהרת מזג אוויר אזהרה גשם אזהרת גשם ברמה חמורה סערה סופת רעמים רוחות כתום אדום צהוב הצפות שיטפון חום כבד מטאו מזג אוויר ביוון", "weather warning alert rain storm thunderstorm wind orange red yellow flood heat meteoalarm"] },
  { u: "/strike-check/", page: (lang) => strikeCheckPage(lang, { strikeArts, TODAY, SECTOR }), nav: "travel", section: "strikes", tile: ["strikes", "שביתה בזמן הטיול?", "Strike during my trip?", "בדיקה לפי תאריכים + התראה", "Check by dates + alert"], k: ["שביתה טיול תאריכים חופשה טיסה מעבורת התראה מייל", "strike trip dates holiday flight ferry alert email"] },
];
const TOOL_PAGES = (lang) => TOOL_DEFS.map((d) => [d.u, d.page(lang), { nav: d.nav, section: d.section }]);
const TOOL_TILES = (lang) => TOOL_DEFS.map((d) => [d.u, d.tile[0], d.tile[lang === "he" ? 1 : 2], d.tile[lang === "he" ? 3 : 4]]);
const TOOL_SEARCH = (lang) => TOOL_DEFS.map((d) => [d.u, d.tile[lang === "he" ? 1 : 2], d.k[lang === "he" ? 0 : 1], lang === "he" ? "כלי" : "Tool"]);

/* ---------- Δείκτης Yavanet (content/madad/YYYY-MM.json) ---------- */
const madadDir = path.join(ROOT, "content/madad");
const madadFiles = fs.existsSync(madadDir) ? fs.readdirSync(madadDir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort() : [];
const madad = madadFiles.length ? JSON.parse(fs.readFileSync(path.join(madadDir, madadFiles[madadFiles.length - 1]), "utf8")) : null;
let GIVE = null; try { GIVE = JSON.parse(fs.readFileSync(path.join(ROOT, "content/giveaway.json"), "utf8")); } catch {}
if (GIVE && GIVE.active && GIVE.ends < TODAY) GIVE.active = false;
GLOBAL.win = !!(GIVE && GIVE.active);
let FLIGHTS = null; try { FLIGHTS = JSON.parse(fs.readFileSync(path.join(ROOT, "content/flights.json"), "utf8")); } catch {}
GLOBAL.flights = !!(FLIGHTS && FLIGHTS.deals && FLIGHTS.deals.length);
GLOBAL.flightTop = GLOBAL.flights ? FLIGHTS.deals[0] : null;
GLOBAL.flightCount = GLOBAL.flights ? FLIGHTS.deals.length : 0;
GLOBAL.madad = !!(madad && Array.isArray(madad.areas) && madad.areas.length);

const orgLd = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: SITE.name, alternateName: SITE.nameHe, url: SITE.url, logo: abs("/icon-512.png"), publishingPrinciples: abs("/p/corrections/"), correctionsPolicy: abs("/p/corrections/") , sameAs: [SITE.facebookPage, SITE.instagram].filter(Boolean) };

/* ---------- Δεδομένα για stories & feed ---------- */
function feedData(lang) {
  const k = (a) => sec(a.section)[lang];
  const url = (a) => P(lang, "/a/" + a.slug + "/");
  const ph = (a) => (a.image && a.image.type === "photo" && a.image.url) ? { img: a.image.url, credit: a.image.credit || "" } : {};
  const re = bySection("real-estate"), isr = bySection("israelis"), brk = articles.filter((a) => a.breaking);
  const stories = [
    { title: T[lang].storyToday, art: "sun", slides: articles.slice(0, 5).map((a) => ({ kicker: k(a), text: a[lang].title, url: url(a), ...ph(a) })) },
    { title: sec("real-estate")[lang], art: "house", slides: re.slice(0, 4).map((a) => ({ kicker: k(a), text: a[lang].tldr[0], url: url(a), ...ph(a) })) },
    { title: sec("breaking")[lang], art: "fire", slides: brk.slice(0, 4).map((a) => ({ kicker: k(a), text: a[lang].title, url: url(a), ...ph(a) })) },
    { title: sec("israelis")[lang], art: "people", slides: isr.slice(0, 4).map((a) => ({ kicker: k(a), text: a[lang].title, url: url(a), ...ph(a) })) },
  ].filter((s) => s.slides.length);
  return { stories, feed: articles.slice(0, 20).map((a) => ({ slug: a.slug, t: a.publishedAt, kicker: k(a), title: a[lang].title, dek: a[lang].dek, url: url(a), art: artHTML(a, lang) })) };
}

/* ---------- Σελίδες ---------- */
for (const lang of LANGS) {
  const t = T[lang];
  const fd = feedData(lang);
  write(P(lang, "/feed.json"), JSON.stringify(fd));

  /* Αρχική */
  const bigBreaking = breakingNow && NOW - new Date(breakingNow.publishedAt).getTime() < 6 * 3600e3 ? breakingNow : null;
  const govPool = bySection("real-estate").filter((a) => !a.partner);
  const heroA = bigBreaking || govPool.find((a) => !a.guide) || govPool[0] || bySection("israelis").find((a) => !a.partner) || articles[0];
  const used = new Set([heroA && heroA.slug]);
  const take = (list, n) => list.filter((a) => !used.has(a.slug)).slice(0, n).map((a) => (used.add(a.slug), a));
  const govCards = take(govPool, 3);
  const isrCards = take(bySection("israelis"), 4);
  const more = take(articles, 6);
  const { art } = await import("./site/art.mjs");
  const tiles = [
    ["/strikes/", "strikes", lang === "he" ? "שביתות" : "Strikes", lang === "he" ? "טיסות, מעבורות, מטרו" : "Flights, ferries, metro"],
    ["/emergency/", "emergency", lang === "he" ? "חירום" : "Emergency", lang === "he" ? "מה עושים אם..." : "What to do if..."],
    ["/cost-of-living/", "cost", lang === "he" ? "יוקר המחיה" : "Cost of living", lang === "he" ? "אתונה מול תל אביב" : "Athens vs Tel Aviv"],
    ["/madad/", "madad", lang === "he" ? "מחירי דירות" : "Property prices", lang === "he" ? "מחיר למ״ר בכל שכונה" : "Price per m² by area"],
    ["/tlv-vs-athens/", "tlv", lang === "he" ? "תל אביב מול אתונה" : "Tel Aviv vs Athens", lang === "he" ? "הדירה שלך = כמה דירות כאן?" : "Your flat = how many here?"],
    ["/guides/", "guides", lang === "he" ? "מדריכים" : "Guides", lang === "he" ? "נדל״ן, מעבר ואיים" : "Property, moving, islands"],
  ];
  if (GLOBAL.flights) tiles.splice(1, 0, ["/flights/", "flights", lang === "he" ? "טיסות זולות" : "Cheap flights", ""]);
  const qtools = tiles.map(([u, k, h]) => `<a class="qt t-${k}" href="${P(lang, u)}">${TI[k]}<span>${esc(h)}</span></a>`).join("");
  const newsChips = SECTIONS.map((x) => `<a href="${P(lang, "/s/" + x.slug + "/")}">${esc(x[lang])}</a>`).join("");
  const home = `<h1 class="sr-only">${esc((lang === "he" ? SITE.nameHe : SITE.name) + " · " + t.tagline)}</h1>
${holidaysStrip(lang)}
${doorsHTML(lang)}
<nav class="qtools" aria-label="${lang === "he" ? "כלים מהירים" : "Quick tools"}">${qtools}</nav>
${GLOBAL.wxRecent ? `<a class="fteaser wxteaser" href="${P(lang, "/weather-warnings/")}"><span class="ft-ic" aria-hidden="true">⚠️</span><span class="ft-t"><b>${lang === "he" ? (GLOBAL.wxRecent === 1 ? "אזהרת מזג אוויר חדשה ביוון" : `${GLOBAL.wxRecent} אזהרות מזג אוויר ביוון ב-48 השעות האחרונות`) : (GLOBAL.wxRecent === 1 ? "New weather warning in Greece" : `${GLOBAL.wxRecent} weather warnings in Greece in the last 48 hours`)}</b><small>${lang === "he" ? "גשם, סערות ורוחות: איפה, מתי ומה עושים" : "Rain, storms and wind: where, when and what to do"}</small></span><span class="ft-go">${lang === "he" ? "לכל האזהרות ←" : "All warnings →"}</span></a>` : ""}
${flightTeaser(lang)}
<nav class="chips homechips" aria-label="${esc(t.allSections)}"><span class="hc-l">${lang === "he" ? "חדשות:" : "News:"}</span>${newsChips}</nav>
<div class="grid">
  <div class="col">
    <section aria-labelledby="h-gov">
      <div class="zone-h"><h2 id="h-gov">${esc(t.zoneGov)}</h2><span class="eyebrow">${esc(t.zoneGovEye)}</span></div>
      ${heroA ? heroCard(heroA, lang) : `<div class="empty">${esc(t.sectionEmpty)}</div>`}
      <div class="cards" style="margin-top:14px">${govCards.map((a) => card(a, lang)).join("")}</div>
    </section>
    ${DIVIDER}
    <section aria-labelledby="h-isr">
      <div class="zone-h"><h2 id="h-isr">${esc(t.zoneIsr)}</h2><span class="eyebrow">${esc(t.zoneIsrEye)}</span></div>
      <div class="cards two">${isrCards.map((a) => card(a, lang)).join("") || `<div class="empty">${esc(t.sectionEmpty)}</div>`}</div>
    </section>
    ${adBox(lang)}
    ${more.length ? `<section aria-labelledby="h-more"><div class="zone-h"><h2 id="h-more">${esc(t.zoneMore)}</h2></div><div class="cards two">${more.map((a) => card(a, lang)).join("")}</div></section>` : ""}
    <section class="missed" id="missed" hidden aria-labelledby="h-missed"><div class="zone-h"><h2 id="h-missed">${lang === "he" ? "אולי פספסתם" : "You may have missed"}</h2></div><div class="missed-list"></div></section>
    ${DIVIDER}
    <section aria-labelledby="h-calc"><div class="zone-h"><h2 id="h-calc">${esc(t.calcTitle)}</h2></div>${calcBox(lang)}</section>
    ${newsletterBox(lang)}
  </div>
  ${widgets(lang, mostRead)}
</div>
<script type="application/json" id="yv-data">${JSON.stringify(fd).replace(/</g, "\\u003c")}</script>`;
  write(P(lang, "/"), layout({ lang, title: "", description: t.tagline, path: P(lang, "/"), altPath: P(lang === "he" ? "en" : "he", "/"), body: home, breaking: breakingNow, activeNav: "home",
    jsonld: [orgLd, { "@context": "https://schema.org", "@type": "WebSite", name: lang === "he" ? SITE.nameHe : SITE.name, alternateName: lang === "he" ? SITE.name : SITE.nameHe, url: abs(P(lang, "/")), inLanguage: lang, potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: abs(P(lang, "/")) + "?q={search_term_string}" }, "query-input": "required name=search_term_string" } }] }));

  /* Ενότητες */
  for (const s of SECTIONS) {
    const list = bySection(s.slug);
    const body = `<div class="page-h"><h1>${esc(s[lang])}</h1></div>
<div class="grid"><div class="col">
${list[0] ? heroCard(list[0], lang) : `<div class="empty">${esc(t.sectionEmpty)}</div>`}
<div class="cards two">${list.slice(1).map((a) => card(a, lang)).join("")}</div>
${s.slug === "real-estate" ? adBox(lang) : ""}
${s.slug === "breaking" ? `<a class="btn" href="${P(lang, "/live/")}">${esc(t.liveTitle)}</a> <a class="btn ghost" href="${P(lang, "/weather-warnings/")}">⚠️ ${lang === "he" ? "אזהרות מזג אוויר" : "Weather warnings"}</a>` : ""}
${newsletterBox(lang)}
</div>${widgets(lang, mostRead)}</div>`;
    write(P(lang, `/s/${s.slug}/`), layout({ lang, title: s[lang], description: `${s[lang]} · ${t.tagline}`, path: P(lang, `/s/${s.slug}/`), altPath: P(lang === "he" ? "en" : "he", `/s/${s.slug}/`), body, breaking: breakingNow, activeSection: s.slug, activeNav: s.slug === "real-estate" ? "prop" : "",
      jsonld: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.home, item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: s[lang], item: abs(P(lang, `/s/${s.slug}/`)) }] }] }));
  }

  /* Άρθρα */
  articles.forEach((a, i) => {
    const prev = articles[i - 1] || null, next = articles[i + 1] || null;
    const related = relatedFor(a);
    const body = a.showcase === "sf" ? sfShowcase(a, lang) : a.showcase === "almyra" ? almyraShowcase(a, lang) : a.showcase === "medtour" ? medtourShowcase(a, lang) : a[lang].profile ? profileBody(a, lang) : `<div class="grid"><div class="col">${articleBody(a, lang, prev, next)}
${a.wx ? wxArticleBox(a, lang) : ""}
${a.slug === "golden-visa-greece-2026-guide" ? `<a class="fteaser" href="${P(lang, "/golden-visa-quiz/")}"><span class="ft-ic" aria-hidden="true">❓</span><span class="ft-t"><b>${lang === "he" ? "איזו ויזת זהב מתאימה לכם?" : "Which Golden Visa applies to you?"}</b><small>${lang === "he" ? "5 שאלות קצרות ותדעו כמה צריך להשקיע" : "5 short questions to see how much you need to invest"}</small></span><span class="ft-go">${lang === "he" ? "לשאלון ←" : "Take the quiz →"}</span></a>` : ""}
${a.section === "real-estate" && !a.partner ? formBox(lang, { id: "lead-a", kind: "property-lead", fields: ["name", "phone", "email", "msg"],
  title: lang === "he" ? (/15-percent/.test(a.slug) ? "שוקלים לקנות דירה ביוון לפני שהמס משתנה?" : "שוקלים לקנות דירה ביוון?") : (/15-percent/.test(a.slug) ? "Thinking of buying in Greece before the tax changes?" : "Thinking of buying property in Greece?"),
  text: lang === "he" ? "השאירו פרטים ויועץ נדל״ן דובר עברית יחזור אליכם. בלי התחייבות ובחינם. גילוי נאות: הפנייה מגיעה ל-S.F. Properties (ספירידון פיקיאס, מתווך נדל״ן, ΓΕΜΗ 172090403000), המו״ל של יוונט." : "Leave your details and a Hebrew-speaking property adviser will get back to you. Free, no obligation. Disclosure: your request goes to S.F. Properties (Spyridon Fikias, real estate broker, GEMI 172090403000), Yavanet's publisher." }) : ""}
${related.length ? `<section><div class="zone-h"><h2>${esc(t.related)}</h2></div><div class="cards">${related.map((x) => card(x, lang)).join("")}</div></section>` : ""}
${newsletterBox(lang)}
</div>${widgets(lang, mostRead)}</div>`;
    const url = P(lang, `/a/${a.slug}/`);
    const ld = { "@context": "https://schema.org", "@type": "NewsArticle", headline: a[lang].title, description: a[lang].seoDesc || a[lang].dek, ...(a[lang].keywords?.length ? { keywords: a[lang].keywords.join(", ") } : {}), inLanguage: lang, datePublished: a.publishedAt, dateModified: a.updatedAt || a.publishedAt, mainEntityOfPage: abs(url), image: photoOf(a) ? [photoOf(a), abs("/og.png")] : [abs("/og.png")], author: { "@type": "Organization", name: SITE.name, url: SITE.url }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: abs("/icon-512.png") } }, isBasedOn: a.sources.map((s) => s.url), articleSection: sec(a.section)[lang] };
    const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.home, item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: sec(a.section)[lang], item: abs(P(lang, `/s/${a.section}/`)) }, { "@type": "ListItem", position: 3, name: a[lang].title }] };
    // Οδηγοί: οι ενότητες-ερωτήσεις (τίτλος με «?») γίνονται FAQ για Google και για ChatGPT/Gemini
    // + ενότητα «שאלות נפוצות»/FAQ με ερωτήσεις σε έντονα (**Ερώτηση?** και η απάντηση στην επόμενη παράγραφο)
    const faqBody = String(a[lang].body || "");
    const faqSec = (faqBody.match(/^## (?:שאלות נפוצות|FAQ|Frequently asked questions|Common questions)[^\n]*\n([\s\S]*?)(?=\n## |(?![\s\S]))/m) || [])[1] || "";
    const faqItems = a.guide ? [
      // απάντηση = ό,τι υπάρχει ως την επόμενη επικεφαλίδα· αν φτάνει στο τέλος του κειμένου, χωρίς την τελευταία παράγραφο (disclaimer)
      ...[...faqBody.matchAll(/^#{2,3} ([^\n]+\?)[ \t]*\n+([\s\S]*?)(?=\n#{2,3} |(?![\s\S]))/gm)].map((m) => { const ps = m[2].trim().split(/\n\s*\n/); return [m[1].trim(), (m.index + m[0].length >= faqBody.length && ps.length > 1 ? ps.slice(0, -1) : ps).join("\n\n")]; }),
      ...[...faqSec.matchAll(/^\*\*([^*\n]+\?)\*\*[ \t]*\n([^\n]+(?:\n(?!\s*\n)[^\n]+)*)/gm)].map((m) => [m[1].trim(), m[2]]),
    ].map(([q, an]) => [q, plain(an).replace(/\s+/g, " ").trim().slice(0, 600)]).filter((x, i, arr) => x[1].length > 30 && arr.findIndex((y) => y[0] === x[0]) === i) : [];
    const faqLdA = faqItems.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map(([q, an]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: an } })) }] : [];
    write(url, layout({ lang, title: a[lang].title, seoTitle: a[lang].seoTitle || null, description: a[lang].seoDesc || a[lang].dek, path: url, altPath: P(lang === "he" ? "en" : "he", `/a/${a.slug}/`), body, breaking: breakingNow, activeSection: a.section, ogType: "article", jsonld: [ld, crumbs, ...faqLdA, ...(a[lang].profile && a[lang].profile.phone ? [{ "@context": "https://schema.org", "@type": "RealEstateAgent", name: a[lang].profile.name, alternateName: a.slug.startsWith("asi-doron") ? ["אסי דורון", "Asi Doron", "AS-IS by Asi Doron"] : undefined, ...(a[lang].profile.logo ? { logo: abs(a[lang].profile.logo) } : {}), image: abs(a[lang].profile.photo), telephone: a[lang].profile.phone, url: abs(url), knowsLanguage: ["he", "en"], areaServed: (a[lang].profile.areas || []).map((x) => ({ "@type": "Place", name: x })), description: a[lang].dek }] : [])],
      image: photoOf(a), head: `<meta property="article:published_time" content="${a.publishedAt}">${a.updatedAt ? `<meta property="article:modified_time" content="${a.updatedAt}">` : ""}` }));
  });

  /* Εργαλεία */
  const tools = `<div class="page-h"><h1>${esc(t.toolsTitle)}</h1></div>
<div class="grid"><div class="col">
<nav class="tiles" aria-label="${lang === "he" ? "כלים" : "Tools"}">${TOOL_TILES(lang).map((x) => tileHTML(lang, x)).join("")}</nav>
<section><div class="zone-h"><h2>${esc(t.calcTitle)}</h2></div>${calcBox(lang)}</section>
<section><div class="zone-h"><h2>${esc(t.yieldTitle)}</h2></div>${yieldBox(lang, YIELD_REGIONS)}</section>
${GLOBAL.flights ? `<section id="trip"><div class="zone-h"><h2>${lang === "he" ? "כמה יעלה לנו הטיול ליוון?" : "How much will our trip to Greece cost?"}</h2></div>${tripBox(lang, FLIGHTS.deals)}</section>` : ""}
${formBox(lang, { id: "alerts", title: lang === "he" ? "התראה על חוקי נדל״ן חדשים" : "Alerts on new property laws", text: lang === "he" ? "נשלח לכם הודעה ברגע שיוצא חוק או החלטה חדשה על נדל״ן ביוון." : "We will message you as soon as a new property law or decision is published in Greece.", kind: "law-alerts", fields: ["name", "email", "phone"] })}
${adBox(lang)}
</div>${widgets(lang, mostRead)}</div>`;
  {
    const hp = holidaysPage(lang, TODAY);
    write(P(lang, "/holidays/"), layout({ lang, title: hp.title, description: hp.description, path: P(lang, "/holidays/"), altPath: P(lang === "he" ? "en" : "he", "/holidays/"), body: hp.body, breaking: breakingNow, activeNav: "travel", jsonld: [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: hp.faq.map(([q, an]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: an } })) }] }));
  }
  write(P(lang, "/tools/"), layout({ lang, title: t.toolsTitle, description: t.calcTitle, path: P(lang, "/tools/"), altPath: P(lang === "he" ? "en" : "he", "/tools/"), body: tools, breaking: breakingNow, activeNav: "tools" }));

  /* Σύμβουλος ακινήτων & Ρωτήστε τον ειδικό */
  const advisor = `<div class="page-h"><h1>${esc(t.leadTitle)}</h1><p>${esc(t.leadText)}</p></div>
<div class="grid"><div class="col">
${formBox(lang, { id: "lead", title: t.leadTitle, text: t.leadText, kind: "property-lead", fields: ["name", "email", "phone", "area", "budget", "msg"] })}
${formBox(lang, { id: "ask", title: t.askTitle, text: t.askText, kind: "ask-expert", fields: ["name", "email", "msg"] })}
</div>${widgets(lang, mostRead)}</div>`;
  write(P(lang, "/advisor/"), layout({ lang, title: t.leadTitle, description: t.leadText, path: P(lang, "/advisor/"), altPath: P(lang === "he" ? "en" : "he", "/advisor/"), body: advisor, breaking: breakingNow }));

  /* Έκτακτα live */
  const brkList = bySection("breaking").slice(0, 30);
  const pts = brkList.filter((a) => a.geo && a.geo.lat).map((a) => ({ lat: a.geo.lat, lng: a.geo.lng, title: a[lang].title, url: P(lang, "/a/" + a.slug + "/") }));
  const live = `<div class="page-h"><h1>${esc(t.liveTitle)}</h1><p>${esc(t.liveText)}</p></div>
<div class="grid"><div class="col">
<div id="map" data-points="${esc(JSON.stringify(pts))}" role="region" aria-label="Map"></div>
<section style="display:grid;gap:10px">${brkList.map((a) => `<a class="alert" href="${P(lang, "/a/" + a.slug + "/")}"><strong>${esc(a[lang].title)}</strong><span class="small">${new Date(a.updatedAt || a.publishedAt).toLocaleString(t.locale, { timeZone: "Europe/Athens" })} · ${esc(a.sources[0].name)}</span></a>`).join("") || `<div class="empty">${esc(t.noBreaking)}</div>`}</section>
<a class="fteaser" href="${P(lang, "/weather-warnings/")}"><span class="ft-ic" aria-hidden="true">⛈️</span><span class="ft-t"><b>${lang === "he" ? "אזהרות מזג אוויר ביוון" : "Greece weather warnings"}</b><small>${lang === "he" ? "כל האזהרות במקום אחד" : "Every warning in one place"}</small></span><span class="ft-go">${lang === "he" ? "לכל האזהרות ←" : "All warnings →"}</span></a>
<section><div class="zone-h"><h2>${esc(t.officialLinks)}</h2></div><div class="links">${OFFICIAL_LINKS.map((o) => `<a href="${o.url}" target="_blank" rel="noopener">${esc(o[lang])}<span aria-hidden="true">↗</span></a>`).join("")}</div></section>
</div>${widgets(lang, mostRead)}</div>`;
  write(P(lang, "/live/"), layout({ lang, title: t.liveTitle, description: t.liveText, path: P(lang, "/live/"), altPath: P(lang === "he" ? "en" : "he", "/live/"), body: live, breaking: breakingNow, activeSection: "breaking" }));

  /* Απεργίες */
  {
    const he = lang === "he";
    const item = (a, past) => {
      const d = past ? a.strike.dates[a.strike.dates.length - 1] : nextDate(a);
      const dt = new Date(d + "T12:00:00Z"), loc = lang === "he" ? "he-IL" : "en-GB";
      const wd = dt.toLocaleDateString(loc, { weekday: "short", timeZone: "UTC" }), dm = `${dt.getUTCDate()}.${dt.getUTCMonth() + 1}`;
      const more = a.strike.dates.length > 1 ? (he ? ` · ${a.strike.dates.length} ימים` : ` · ${a.strike.dates.length} days`) : "";
      return `<a class="strike${past ? " past" : ""}" href="${P(lang, "/a/" + a.slug + "/")}"><span class="when">${esc(wd || "")}<b>${esc(dm || "")}</b></span><span><h3>${esc(a[lang].title)}</h3><span class="small">${esc(a.strike[lang] || a[lang].dek)}${more}</span><span class="sec">${a.strike.sectors.map((x) => `<span>${esc((SECTOR[x] || SECTOR.other)[he ? 0 : 1])}</span>`).join("")}</span></span></a>`;
    };
    const title = he ? "שביתות ביוון: טיסות, מעבורות ותחבורה" : "Strikes in Greece: flights, ferries and transport";
    const intro = he ? "כל השביתות שמשפיעות על מטיילים ביוון, במקום אחד ובעברית: טיסות, נמלים ומעבורות, מטרו, אוטובוסים ומוניות. מתעדכן אוטומטית." : "Every strike that affects travellers in Greece, in one place: flights, ports and ferries, metro, buses and taxis. Updated automatically.";
    const tips = he ? `<section class="means"><h2>טסים או מפליגים ביום שביתה?</h2><ul><li>בדקו מול חברת התעופה או חברת המעבורות אם הטיסה/ההפלגה מתקיימת.</li><li>שביתה של פקחי טיסה או של עובדי נמל יכולה לבטל גם טיסות מישראל.</li><li>בשביתת מטרו או אוטובוסים, צאו לשדה התעופה מוקדם יותר או הזמינו מונית מראש.</li><li>שביתות ביוון מוכרזות בדרך כלל כמה ימים מראש, ולפעמים מבוטלות ברגע האחרון. שווה לבדוק כאן שוב יום קודם.</li></ul></section>` : `<section class="means"><h2>Flying or sailing on a strike day?</h2><ul><li>Check with your airline or ferry company whether your trip is running.</li><li>Air-traffic-control or port strikes can also cancel flights from Israel.</li><li>On metro or bus strike days, leave for the airport earlier or pre-book a taxi.</li><li>Greek strikes are usually announced days in advance and are sometimes called off at the last minute. Check here again the day before.</li></ul></section>`;
    const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
${pushBox(lang, true)}
<a class="fteaser" href="${P(lang, "/strike-today/")}"><span class="ft-ic" aria-hidden="true">📅</span><span class="ft-t"><b>${he ? "יש שביתה היום או מחר?" : "Strike today or tomorrow?"}</b><small>${he ? "תשובה מהירה, והוספת כל השביתות ליומן בטלפון" : "The quick answer, plus every strike in your phone calendar"}</small></span><span class="ft-go">${he ? "לבדיקה ←" : "Check →"}</span></a>
<a class="fteaser" href="${P(lang, "/strike-check/")}"><span class="ft-ic" aria-hidden="true">🧳</span><span class="ft-t"><b>${he ? "יש שביתה בזמן הטיול שלי?" : "A strike during my trip?"}</b><small>${he ? "בחרו תאריכים וקבלו התראה במייל" : "Pick your dates and get an email alert"}</small></span><span class="ft-go">${he ? "לבדיקה ←" : "Check →"}</span></a>
<section><div class="zone-h"><h2>${he ? "שביתות קרובות" : "Upcoming strikes"}</h2></div>
${upcomingStrikes.length ? `<div class="strikes">${upcomingStrikes.map((a) => item(a, false)).join("")}</div>` : `<div class="empty-note">${he ? "אין כרגע שביתות מתוכננות שמשפיעות על מטיילים. 👍" : "No announced strikes affecting travellers right now. 👍"}</div>`}
</section>
${tips}
${pastStrikes.length ? `<section><div class="zone-h"><h2>${he ? "שביתות אחרונות" : "Recent strikes"}</h2></div><div class="strikes">${pastStrikes.map((a) => item(a, true)).join("")}</div></section>` : ""}
${newsletterBox(lang)}
</div>${widgets(lang, mostRead, true)}</div>`;
    write(P(lang, "/strikes/"), layout({ lang, title, description: intro, path: P(lang, "/strikes/"), altPath: P(he ? "en" : "he", "/strikes/"), body, breaking: breakingNow, activeSection: "strikes" }));
  }

  /* Έκτακτη ανάγκη: «Μου συνέβη στην Ελλάδα, τι κάνω;» */
  {
    const he = lang === "he";
    const title = he ? "קרה לי משהו ביוון: מה עושים?" : "Something happened in Greece: what do I do?";
    const intro = he ? "מספרי חירום, שגרירות ישראל ומה עושים כשהדרכון אבד, כשצריך רופא, אחרי תאונה או גניבה. שמרו את הדף בטלפון." : "Emergency numbers, the Israeli Embassy, and what to do if you lose your passport, need a doctor, have an accident or are robbed. Save this page on your phone.";
    const nums = EM_NUM.map((x) => `<a class="emnum" href="tel:${x.n.replace(/[^+\d]/g, "")}"><b dir="ltr">${esc(x.n)}</b><span>${esc(x[lang])}</span></a>`).join("");
    const cases = CASES.map((c) => `<details class="emcase"><summary>${c.icon} ${esc(c[lang].t)}</summary><ul>${c[lang].s.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>`).join("");
    const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
<section><div class="zone-h"><h2>${he ? "מספרי חירום ביוון" : "Emergency numbers in Greece"}</h2></div><div class="emnums">${nums}</div></section>
<section class="means"><h2>🇮🇱 ${he ? "שגרירות ישראל" : "Israeli Embassy"}</h2><p>${esc(EMBASSY[lang])} <a href="${EMBASSY.url}" target="_blank" rel="noopener">${he ? "טלפונים ושעות פעילות" : "Phones and opening hours"} ↗</a></p></section>
<section><div class="zone-h"><h2>${he ? "מה עושים אם..." : "What to do if..."}</h2></div><div class="emcases">${cases}</div></section>
<a class="fteaser" href="${P(lang, "/weather-warnings/")}"><span class="ft-ic" aria-hidden="true">⛈️</span><span class="ft-t"><b>${he ? "אזהרות מזג אוויר ביוון היום" : "Greece weather warnings today"}</b><small>${he ? "גשם, סערות ורוחות: איפה, מתי ומה עושים" : "Rain, storms and wind: where, when and what to do"}</small></span><span class="ft-go">${he ? "לבדיקה ←" : "Check →"}</span></a>
<p class="small">${he ? "מידע כללי שנבדק מול מקורות רשמיים. במצב חירום תמיד חייגו 112." : "General information checked against official sources. In an emergency always call 112."}</p>
${pushBox(lang, true)}
</div>${widgets(lang, mostRead, true)}</div>`;
    write(P(lang, "/emergency/"), layout({ lang, title, description: intro, path: P(lang, "/emergency/"), altPath: P(he ? "en" : "he", "/emergency/"), body, breaking: breakingNow, activeSection: "emergency" }));
  }

  /* Κόστος ζωής: Αθήνα vs Τελ Αβίβ */
  {
    const he = lang === "he";
    const C = JSON.parse(fs.readFileSync(path.join(ROOT, "content/costs.json"), "utf8"));
    const fx = C.eurIls;
    const money = (v) => `€${v >= 100 ? Math.round(v).toLocaleString("en-US") : v.toFixed(2)}`;
    const ils = (v) => `₪${v * fx >= 100 ? Math.round(v * fx).toLocaleString("en-US") : (v * fx).toFixed(1)}`;
    const rentRow = C.groups[0].items[0];
    const rentPct = Math.round((1 - rentRow.ath / rentRow.tlv) * 100);
    const otherPct = Math.round((1 - 1 / (1 + C.summary.consumerNoRent / 100)) * 100);
    const [cy, cm] = C.updated.split("-");
    const upd = new Date(Date.UTC(+cy, +cm - 1, 15)).toLocaleDateString(he ? "he-IL" : "en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
    const row = (x) => {
      const cheaper = Math.round((1 - x.ath / x.tlv) * 100);
      const max = Math.max(x.ath, x.tlv);
      return `<div class="cmp"><div class="cmp-h"><strong>${esc(x[lang])}</strong>${cheaper > 0 ? `<span class="save" dir="ltr">-${cheaper}%</span>` : `<span class="more" dir="ltr">+${-cheaper}%</span>`}</div>
<div class="cmp-b"><span class="lbl">${he ? "אתונה" : "Athens"}</span><i class="ath" style="width:${Math.round(x.ath / max * 100)}%"></i><span class="v" dir="ltr">${money(x.ath)} · ${ils(x.ath)}</span></div>
<div class="cmp-b"><span class="lbl">${he ? "תל אביב" : "Tel Aviv"}</span><i class="tlv" style="width:${Math.round(x.tlv / max * 100)}%"></i><span class="v" dir="ltr">${money(x.tlv)} · ${ils(x.tlv)}</span></div></div>`;
    };
    const title = he ? "יוקר המחיה: אתונה מול תל אביב" : "Cost of living: Athens vs Tel Aviv";
    const intro = he ? `כמה עולים שכר דירה, קפה, סופר ותחבורה באתונה לעומת תל אביב. בשורה התחתונה: שכר דירה באתונה זול בכ-${rentPct}%, ושאר המחירים זולים בכ-${otherPct}%.` : `What rent, coffee, groceries and transport cost in Athens compared with Tel Aviv. Bottom line: rent in Athens is about ${rentPct}% cheaper, and other prices about ${otherPct}% lower.`;
    const stats = he
      ? `<div class="stats"><div><b dir="ltr">-${rentPct}%</b><span>שכר דירה במרכז העיר</span></div><div><b dir="ltr">-${Math.round((1 - 1 / (1 + C.summary.consumerNoRent / 100)) * 100)}%</b><span>שאר המחירים (בלי שכר דירה)</span></div></div>`
      : `<div class="stats"><div><b dir="ltr">-${rentPct}%</b><span>City-centre rent</span></div><div><b dir="ltr">-${Math.round((1 - 1 / (1 + C.summary.consumerNoRent / 100)) * 100)}%</b><span>Other prices (excluding rent)</span></div></div>`;
    const groups = C.groups.map((g) => `<section><div class="zone-h"><h2>${esc(g[lang])}</h2></div><div class="cmps">${g.items.map(row).join("")}</div></section>`).join("");
    const src = `<a href="${esc(C.source.url)}" target="_blank" rel="noopener">${esc(C.source.name)}</a>`;
    const note = he ? `מחירים ממוצעים לפי ${src} (נתונים שמדווחים גולשים), ${esc(upd)}. ההמרה לשקלים לפי שער של ₪${fx} לאירו. המחירים משתנים לפי שכונה ועונה.` : `Average prices from ${src} (user-reported data), ${esc(upd)}. Shekel conversion at ₪${fx} per euro. Prices vary by neighbourhood and season.`;
    const cta = he ? `<section class="means"><h2>חושבים לעבור לאתונה או לקנות דירה?</h2><p>ב<a href="${P(lang, "/madad/")}">מדד יוונט</a> תמצאו כמה עולה מ״ר בכל שכונה, ובמחשבון שלנו את כל עלויות הרכישה.</p></section>` : `<section class="means"><h2>Thinking of moving to Athens or buying a flat?</h2><p>See what a square metre costs in each neighbourhood in the <a href="${P(lang, "/madad/")}">Yavanet Index</a>, and all purchase costs in our calculator.</p></section>`;
    const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
${stats}
${groups}
<p class="small">${note}</p>
${cta}
${adBox(lang)}
<div class="sharebar"><button type="button" class="btn ghost" data-share>${he ? "📤 שתפו עם חברים" : "📤 Share with friends"}</button></div>
</div>${widgets(lang, mostRead)}</div>`;
    write(P(lang, "/cost-of-living/"), layout({ lang, title, description: intro, path: P(lang, "/cost-of-living/"), altPath: P(he ? "en" : "he", "/cost-of-living/"), body, breaking: breakingNow, activeSection: "cost-of-living" }));
  }

  /* Φτηνές πτήσεις (content/flights.json από automation/flights.mjs) */
  if (GLOBAL.flights) {
    const he = lang === "he";
    const dm = (d) => new Date(d + "T12:00:00Z").toLocaleDateString(he ? "he-IL" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
    const upd = new Date(FLIGHTS.updated).toLocaleString(he ? "he-IL" : "en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" });
    const title = he ? "טיסות זולות מתל אביב ליוון" : "Cheap flights from Tel Aviv to Greece";
    const intro = he ? "המחיר הזול ביותר הלוך־חזור לכל יעד ביוון, בחודשיים הקרובים. מתעדכן כל יום." : "The lowest return fare to each Greek destination over the next two months. Updated daily.";
    const cards = FLIGHTS.deals.map((d, i) => `<a class="fl${i === 0 ? " top" : ""}" href="${esc(d.link)}" target="_blank" rel="noopener sponsored nofollow">
<span class="fl-d"><b>${esc(he ? d.he : d.en)}</b><small>${esc(dm(d.depart))}${d.ret ? " – " + esc(dm(d.ret)) : ""} · ${esc(d.airline)}${d.transfers ? (he ? " · עם עצירה" : " · with stop") : (he ? " · ישירה" : " · direct")}</small></span>
<span class="fl-p"><small>${he ? "הלוך־חזור" : "return"}</small><b dir="ltr">€${d.price}</b><i dir="ltr">≈ ₪${Math.round(d.price * 3.47).toLocaleString("en-US")}</i></span></a>`).join("");
    const note = he ? `המחירים נאספו מחיפושים אחרונים ב-<a href="https://www.aviasales.com" target="_blank" rel="noopener">Aviasales</a> ויכולים להשתנות. עודכן: ${esc(upd)}. הקישורים הם קישורי שותפים: אם תזמינו דרכם, יוונט עשוי לקבל עמלה קטנה, בלי עלות נוספת לכם.` : `Prices come from recent searches on <a href="https://www.aviasales.com" target="_blank" rel="noopener">Aviasales</a> and may change. Updated: ${esc(upd)}. These are affiliate links: if you book through them, Yavanet may earn a small commission at no extra cost to you.`;
    const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
<div class="flights">${cards}</div>
<p class="small">${note}</p>
${pushBox(lang, true)}
<section class="means"><h2>${he ? "לפני שטסים" : "Before you fly"}</h2><p>${he ? `<a href="${P(lang, "/a/greece-travel-guide-israelis-2026/")}">המדריך המלא לטיסה ליוון</a> · <a href="${P(lang, "/strikes/")}">שביתות קרובות</a>` : `<a href="${P(lang, "/a/greece-travel-guide-israelis-2026/")}">Flying to Greece guide</a> · <a href="${P(lang, "/strikes/")}">Upcoming strikes</a>`}</p></section>
</div>${widgets(lang, mostRead, true)}</div>`;
    write(P(lang, "/flights/"), layout({ lang, title, description: intro, path: P(lang, "/flights/"), altPath: P(he ? "en" : "he", "/flights/"), body, breaking: breakingNow, activeSection: "flights", activeNav: "tools" }));
  }

  /* Σελίδες-κόμβοι: Διακοπές / Επένδυση / Μετακόμιση + Επικοινωνία */
  for (const kind of ["travel", "invest", "moving"]) {
    const pg = hubPage(lang, kind, { articles, GLOBAL });
    write(P(lang, `/${kind}/`), layout({ lang, title: pg.title, description: pg.description, path: P(lang, `/${kind}/`), altPath: P(lang === "he" ? "en" : "he", `/${kind}/`), body: pg.body, breaking: breakingNow, activeNav: kind,
      jsonld: [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pg.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.home, item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: pg.title, item: abs(P(lang, `/${kind}/`)) }] }] }));
  }
  {
    const pg = contactPage(lang);
    write(P(lang, "/contact/"), layout({ lang, title: pg.title, description: pg.description, path: P(lang, "/contact/"), altPath: P(lang === "he" ? "en" : "he", "/contact/"), body: pg.body, breaking: breakingNow, activeNav: "contact",
      jsonld: [{ "@context": "https://schema.org", "@type": "RealEstateAgent", name: "S.F. Properties", url: abs(P(lang, "/contact/")), email: "info@sfproperties.gr", address: { "@type": "PostalAddress", streetAddress: "Π. Π. Γερμανού 77", addressLocality: "Φιλοθέη", postalCode: "15237", addressCountry: "GR" }, areaServed: "Athens, Greece", knowsLanguage: ["he", "en", "el"] }] }));
  }
  /* Σελίδες προορισμών + «απεργία σήμερα/αύριο;» */
  {
    const TOMORROW = athensDay(new Date(NOW + 86400e3));
    const crumbs = (name, u) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.home, item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: lang === "he" ? "חופשה ביוון" : "Holiday in Greece", item: abs(P(lang, "/travel/")) }, { "@type": "ListItem", position: 3, name, item: abs(u) }] });
    const faqLd = (faq) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
    for (const d of DESTS) {
      const pg = destPage(lang, d, { articles, FLIGHTS, strikes: upcomingStrikes, fmtDay, SECTOR, TODAY });
      const u = P(lang, `/d/${d.id}/`);
      write(u, layout({ lang, title: pg.title, description: pg.description, path: u, altPath: P(lang === "he" ? "en" : "he", `/d/${d.id}/`), body: pg.body, breaking: breakingNow, activeNav: "travel", jsonld: [crumbs(d[lang], u), faqLd(pg.faq)] }));
    }
    const sp = strikeTodayPage(lang, { strikeArts, TODAY, TOMORROW, SECTOR, fmtDay });
    const su = P(lang, "/strike-today/");
    write(su, layout({ lang, title: sp.title, description: sp.description, path: su, altPath: P(lang === "he" ? "en" : "he", "/strike-today/"), body: sp.body, breaking: breakingNow, activeNav: "travel", activeSection: "strikes", jsonld: [crumbs(sp.title, su), faqLd(sp.faq)] }));
  }
  /* Νέα εργαλεία: ώρες Σαββάτου, κουίζ Golden Visa, λίστα μετακόμισης, φρασεολόγιο, έλεγχος απεργιών */
  for (const [u, pg, extra] of TOOL_PAGES(lang)) {
    write(P(lang, u), layout({ lang, title: pg.title, description: pg.description, path: P(lang, u), altPath: P(lang === "he" ? "en" : "he", u), body: pg.body.replace("__WIDGETS__", widgets(lang, mostRead, true)), breaking: breakingNow, activeNav: (extra && extra.nav) || "tools", activeSection: extra && extra.section,
      jsonld: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.home, item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: pg.title, item: abs(P(lang, u)) }] }, ...(pg.faq && pg.faq.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pg.faq.map(([q, an]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: an } })) }] : [])] }));
  }
  /* Καιρός: σελίδες επιπέδων προειδοποίησης (/weather-warnings/<id>/) + ο καιρός ανά μήνα (/weather/…) */
  {
    const wxCtx = { wxArts, NOW, TODAY, exists: (slug) => articles.some((a) => a.slug === slug) };
    const ld = (lvl2, lvl3, pg) => [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.home, item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: lvl2[0], item: abs(P(lang, lvl2[1])) }, ...(lvl3 ? [{ "@type": "ListItem", position: 3, name: lvl3[0], item: abs(P(lang, lvl3[1])) }] : [])] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pg.faq.map(([q, an]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: an } })) }];
    const wxPage = (u, pg, jsonld, section) => write(P(lang, u), layout({ lang, title: pg.title, description: pg.description, path: P(lang, u), altPath: P(lang === "he" ? "en" : "he", u), body: pg.body.replace("__WIDGETS__", widgets(lang, mostRead, true)), breaking: breakingNow, activeNav: "travel", activeSection: section, jsonld }));
    const hubName = lang === "he" ? "אזהרות מזג אוויר" : "Weather warnings", climName = lang === "he" ? "מזג אוויר ביוון" : "Greece weather";
    for (const p of WX_LEVEL_PAGES) { const u = wxLevelUrl(p.id), pg = wxLevelPage(lang, p, wxCtx); wxPage(u, pg, ld([hubName, "/weather-warnings/"], [pg.name, u], pg), "breaking"); }
    { const pg = climateIndexPage(lang); wxPage("/weather/", pg, ld([climName, "/weather/"], null, pg)); }
    MONTHS.forEach((m, i) => { const u = monthUrl(m), pg = climatePage(lang, i, wxCtx); wxPage(u, pg, ld([climName, "/weather/"], [pg.name, u], pg)); });
  }
  /* Ευρετήριο αναζήτησης */
  {
    const he = lang === "he", L = (a, b) => (he ? a : b);
    const pages = [
      ["/travel/", L("חופשה ביוון", "Holiday in Greece"), L("טיסות טיסה טיול טיולים חופשה שביתות איים מדריך תיירים", "flights strikes islands tours tourist guide"), L("עמוד", "Page")],
      ["/invest/", L("השקעה בנדל״ן ביוון", "Investing in Greek property"), L("קניית דירה נדלן השקעה משקיעים נכס נכסים מחירים ויזת זהב גולדן ויזה מיסים השכרה שכירות airbnb", "buy flat real estate investment prices golden visa taxes"), L("עמוד", "Page")],
      ["/moving/", L("לעבור לגור ביוון", "Moving to Greece"), L("רילוקיישן הגירה מעבר לגור ביוון ויזה מספר מס בנק בית ספר יוקר מחיה", "relocation visa tax number bank school cost of living"), L("עמוד", "Page")],
      ["/contact/", L("צרו קשר: האנשים שלנו", "Contact: our people"), L("אסי דורון יאנה S.F. Properties יועץ נדלן וואטסאפ טלפון", "Asi Doron Yana advisor WhatsApp phone"), L("עמוד", "Page")],
      ["/strikes/", L("שביתות ביוון", "Strikes in Greece"), L("שביתה טיסות מעבורות מטרו אוטובוסים", "strike flights ferries metro buses"), L("כלי", "Tool")],
      ["/emergency/", L("חירום ביוון", "Emergency in Greece"), L("משטרה אמבולנס שגרירות ישראל 112 רופא", "police ambulance Israeli embassy 112 doctor"), L("כלי", "Tool")],
      ["/cost-of-living/", L("יוקר המחיה: אתונה מול תל אביב", "Cost of living: Athens vs Tel Aviv"), L("מחירים שכר דירה סופר קפה תחבורה", "prices rent groceries coffee transport"), L("כלי", "Tool")],
      ["/madad/", L("מחירי דירות לפי שכונה", "Property prices by area"), L("מדד יוונט מחיר למטר שכונות אתונה שכירות", "Yavanet index price per m2 neighbourhoods rent"), L("כלי", "Tool")],
      ["/tlv-vs-athens/", L("תל אביב מול אתונה", "Tel Aviv vs Athens"), L("הדירה שלי כמה דירות מחשבון השוואה", "my flat how many flats calculator compare"), L("כלי", "Tool")],
      ["/tools/", L("מחשבונים", "Calculators"), L("עלויות קנייה תשואה מס רכישה נוטריון", "buying costs yield transfer tax notary"), L("כלי", "Tool")],
      ["/directory/", L("יוון בעברית: עסקים ושירותים", "Greece in Hebrew: businesses"), L("עברית חבד כשר בית כנסת טיולים", "Hebrew Chabad kosher synagogue tours"), L("כלי", "Tool")],
      ["/guides/", L("כל המדריכים", "All guides"), L("מדריך", "guide"), L("עמוד", "Page")],
      ["/holidays/", L("חגים ושעות פתיחה של חנויות", "Holidays and shop opening hours"), L("חג חנויות פתוח סגור יום ראשון הנחות שופינג קניות", "holiday shops open closed sunday sales shopping"), L("כלי", "Tool")],
      ["/strike-today/", L("יש שביתה היום או מחר ביוון?", "Strike in Greece today or tomorrow?"), L("שביתה היום מחר טיסות מעבורות מטרו יומן", "strike today tomorrow flights ferries metro calendar"), L("כלי", "Tool")],
      ...TOOL_SEARCH(lang),
      ...DESTS.map((d) => ["/d/" + d.id + "/", d[lang], L("חדשות מזג אוויר טיסות שביתות מדריך", "news weather flights strikes guide") + " " + d.he + " " + d.en, L("יעד", "Destination")]),
      ...(GLOBAL.flights ? [["/flights/", L("טיסות זולות ליוון", "Cheap flights to Greece"), L("טיסה מחיר תל אביב אתונה", "flight price Tel Aviv Athens"), L("כלי", "Tool")]] : []),
    ].map(([u, tt, k, kind]) => ({ u: P(lang, u), t: tt, d: "", k, s: kind, p: 1 }));
    const arts = articles.map((a) => ({ u: P(lang, "/a/" + a.slug + "/"), t: a[lang].title, d: a[lang].dek, k: [...(a[lang].tldr || []), ...(a[lang].keywords || [])].join(" "), s: (a.guide ? L("מדריך", "Guide") : sec(a.section)[lang]), g: a.guide ? 1 : 0, at: a.publishedAt.slice(0, 10) }));
    write(P(lang, "/search.json"), JSON.stringify(pages.concat(arts)));
  }

  /* Τελ Αβίβ = ; στην Αθήνα (viral εργαλείο) */
  if (GLOBAL.madad) {
    const he = lang === "he";
    const fxC = JSON.parse(fs.readFileSync(path.join(ROOT, "content/costs.json"), "utf8")).eurIls;
    const pg = tlvPage(lang, madad, fxC);
    write(P(lang, "/tlv-vs-athens/"), layout({ lang, title: pg.title, description: pg.description, path: P(lang, "/tlv-vs-athens/"), altPath: P(he ? "en" : "he", "/tlv-vs-athens/"), body: pg.body.replace("__WIDGETS__", widgets(lang, mostRead)), breaking: breakingNow, activeSection: "tlv", activeNav: "tools", image: abs(he ? "/og-tlv.png" : "/og-tlv-en.png") }));
  }

  /* Διαγωνισμός (content/giveaway.json · εμφανίζεται μόνο όταν active=true) */
  if (GIVE && GIVE.active) {
    const he = lang === "he";
    const fmt = (d) => new Date(d + "T12:00:00Z").toLocaleDateString(he ? "he-IL" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const title = he ? `🎁 הגרלה: ${GIVE.prize.he}` : `🎁 Giveaway: ${GIVE.prize.en}`;
    const intro = he ? `הירשמו לניוזלטר של יוונט עד ${fmt(GIVE.ends)} ותיכנסו להגרלה. ההגרלה תתקיים ב-${fmt(GIVE.draw)}.` : `Subscribe to the Yavanet newsletter by ${fmt(GIVE.ends)} to enter. The draw is on ${fmt(GIVE.draw)}.`;
    const rules = he
      ? `<ul><li>ההשתתפות חינם. כל כתובת מייל משתתפת פעם אחת.</li><li>גיל 18 ומעלה.</li><li>ההגרלה תתקיים ב-${fmt(GIVE.draw)} באופן אקראי מבין כל הנרשמים עד ${fmt(GIVE.ends)}. הזוכה יקבל הודעה במייל.</li><li>הפרס אינו ניתן להמרה בכסף. התאריכים לפי זמינות ובתיאום מראש.</li><li>המארגן: ${esc(SITE.publisher.he)}. אפשר לבטל את ההרשמה לניוזלטר בכל רגע.</li></ul>`
      : `<ul><li>Free to enter. One entry per email address.</li><li>Ages 18+.</li><li>A random draw on ${fmt(GIVE.draw)} among everyone who subscribed by ${fmt(GIVE.ends)}. The winner is notified by email.</li><li>The prize cannot be exchanged for cash. Dates subject to availability, arranged in advance.</li><li>Organiser: ${esc(SITE.publisher.en)}. You can unsubscribe at any time.</li></ul>`;
    const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
${GIVE.details && GIVE.details[lang] ? `<section class="means"><p>${esc(GIVE.details[lang])}</p></section>` : ""}
${newsletterBox(lang, { id: "enter", source: "giveaway", title: he ? "להשתתפות בהגרלה" : "Enter the draw", text: he ? "רק מייל, והסכמה לקבל את הניוזלטר." : "Just your email, and agreeing to receive the newsletter." })}
<section><div class="zone-h"><h2>${he ? "תקנון" : "Rules"}</h2></div>${rules}</section>
<div class="sharebar"><button type="button" class="btn ghost" data-share>${he ? "📤 שתפו עם חברים" : "📤 Share with friends"}</button></div>
</div>${widgets(lang, mostRead)}</div>`;
    write(P(lang, "/win/"), layout({ lang, title, description: intro, path: P(lang, "/win/"), altPath: P(he ? "en" : "he", "/win/"), body, breaking: breakingNow, activeSection: "win" }));
  }

  /* Σελίδα οδηγών */
  {
    const he = lang === "he";
    const isGuide = (a) => a.guide || (a.meta && String(a.meta.itemId || "").startsWith("eg-"));
    const cat = (a) => a.guideCat || (a.section === "real-estate" ? "invest" : a.section === "living" ? "live" : a.section === "jewish-greece" ? "jewish" : "travel");
    const CATS = [["invest", "🏠 למשקיעים ולקוני דירות", "🏠 For investors & buyers"], ["live", "🧳 לעבור לגור ביוון", "🧳 Moving to Greece"], ["travel", "🏝️ טיולים ואיים", "🏝️ Travel & islands"], ["jewish", "✡️ יוון היהודית", "✡️ Jewish Greece"]];
    const guides = articles.filter(isGuide);
    const pinned = guides.filter((a) => a.pinned);
    const tools = [["/strikes/", "strikes", he ? "שביתות" : "Strikes"], ["/emergency/", "emergency", he ? "חירום" : "Emergency"], ["/cost-of-living/", "cost", he ? "יוקר המחיה" : "Cost of living"], ["/madad/", "madad", he ? "מחירי דירות" : "Property prices"], ["/tlv-vs-athens/", "tlv", he ? "תל אביב מול אתונה" : "Tel Aviv vs Athens"], ...(GLOBAL.flights ? [["/flights/", "flights", he ? "טיסות זולות" : "Cheap flights"]] : []), ["/tools/", "tools", he ? "מחשבונים" : "Calculators"], ["/directory/", "dir", he ? "יוון בעברית" : "Greece in Hebrew"]];
    const title = he ? "מדריכים: כל מה שישראלי צריך לדעת על יוון" : "Guides: everything Israelis need to know about Greece";
    const intro = he ? "מדריכים מלאים בעברית על קניית דירה, השקעה, מעבר ליוון, טיולים ואיים. מתעדכן כל הזמן." : "Complete guides on buying property, investing, moving to Greece, travel and the islands. Always updated.";
    const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
${pinned.length ? `<section><div class="cards">${pinned.map((a) => card(a, lang)).join("")}</div></section>` : ""}
<nav class="tiles" aria-label="${he ? "כלים" : "Tools"}">${tools.map((x) => tileHTML(lang, x)).join("")}</nav>
${CATS.map(([k, h1, h2]) => { const list = guides.filter((a) => !a.pinned && cat(a) === k); return list.length ? `<section><div class="zone-h"><h2>${esc(he ? h1 : h2)}</h2></div><div class="cards">${list.map((a) => card(a, lang)).join("")}</div></section>` : ""; }).join("")}
</div>${widgets(lang, mostRead)}</div>`;
    write(P(lang, "/guides/"), layout({ lang, title, description: intro, path: P(lang, "/guides/"), altPath: P(he ? "en" : "he", "/guides/"), body, breaking: breakingNow, activeNav: "guides" }));
  }

  /* Δείκτης Yavanet */
  if (GLOBAL.madad) {
    const he = lang === "he";
    const [yy, mm] = madad.month.split("-");
    const monthName = new Date(Date.UTC(+yy, +mm - 1, 15)).toLocaleDateString(he ? "he-IL" : "en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
    const title = he ? `מדד יוונט: מחירי נדל״ן באתונה, ${monthName}` : `Yavanet Index: Athens property prices, ${monthName}`;
    const intro = he ? "כמה עולה מטר רבוע למכירה ולהשכרה בשכונות אתונה, ומה התשואה הצפויה. מתעדכן כל חודש." : "What a square metre costs to buy and to rent in Athens neighbourhoods, and the expected yield. Updated monthly.";
    const max = Math.max(...madad.areas.map((x) => +x.sale || 0));
    const chg = (v) => v == null || v === "" ? "–" : `<span dir="ltr" class="${+v >= 0 ? "up" : "down"}">${+v > 0 ? "+" : ""}${(+v).toFixed(1)}%</span>`;
    const eur = (v) => "€" + Math.round(+v).toLocaleString("en-US");
    const groups = madad.groups ? Object.keys(madad.groups) : [null];
    const row = (x) => {
      const y = x.rent && x.sale ? (x.rent * 12 / x.sale * 100).toFixed(1) + "%" : "–";
      return `<tr><td><strong>${esc(x[lang] || x.en)}</strong></td><td>${eur(x.sale)}</td><td>${chg(x.saleChg)}</td><td>€${(+x.rent).toFixed(1)}</td><td>${chg(x.rentChg)}</td><td dir="ltr">${y}</td><td class="bar"><i style="width:${Math.round((+x.sale || 0) / max * 100)}%"></i></td></tr>`;
    };
    const rows = groups.map((g) => {
      const list = madad.areas.filter((x) => !g || x.group === g).sort((a, b) => (+b.sale || 0) - (+a.sale || 0));
      return (g ? `<tr class="grp"><th colspan="7">${esc(madad.groups[g][lang])}</th></tr>` : "") + list.map(row).join("");
    }).join("");
    const yr = madad.changeBasis === "year";
    const cl = he ? (yr ? "שינוי בשנה" : "שינוי בחודש") : (yr ? "1-year change" : "1-month change");
    const head = he ? ["שכונה", "מכירה ‏€/מ״ר", cl, "שכירות ‏€/מ״ר לחודש", cl, "תשואה ברוטו", ""] : ["Area", "Sale €/m²", cl, "Rent €/m²/month", cl, "Gross yield", ""];
    const src = madad.source ? `<a href="${esc(madad.source.url)}" target="_blank" rel="noopener">${esc(madad.source.name)}</a>` : esc(SITE.ad.brand);
    const method = he
      ? `המחירים הם ממוצע מחירי המבוקש במודעות למגורים (לא מחירי עסקאות ולא שמאות), לפי ${src}, ${esc(monthName)}. תשואה ברוטו = שכירות שנתית חלקי מחיר, לפני הוצאות ומיסים. מידע כללי בלבד ואינו ייעוץ השקעות. לנתונים על נכס מסוים דברו עם ${esc(SITE.ad.brand)}.`
      : `Prices are average asking prices in residential listings (not transaction prices or valuations), from ${src}, ${esc(monthName)}. Gross yield = annual rent divided by price, before costs and taxes. General information only, not investment advice. For a specific property, talk to ${esc(SITE.ad.brand)}.`;
    const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<div class="grid"><div class="col">
<div class="tablewrap"><table class="madad"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
${madad.note && madad.note[lang] ? `<section class="means"><h2>${he ? "מה השתנה החודש" : "This month"}</h2><p>${esc(madad.note[lang])}</p></section>` : ""}
<p class="small">${method}</p>
${adBox(lang)}
${newsletterBox(lang)}
</div>${widgets(lang, mostRead)}</div>`;
    write(P(lang, "/madad/"), layout({ lang, title, description: intro, path: P(lang, "/madad/"), altPath: P(he ? "en" : "he", "/madad/"), body, breaking: breakingNow, activeSection: "madad", activeNav: "prop" }));
  }

  /* Κατάλογος επιχειρήσεων */
  const biz = JSON.parse(fs.readFileSync(path.join(ROOT, "content/businesses.json"), "utf8"));
  const dir = `<div class="page-h"><h1>${esc(t.dirTitle)}</h1><p>${esc(t.dirText)}</p></div>
<div class="grid"><div class="col">
${(() => {
  const he = lang === "he";
  const CAT = { realestate: ["🏠 נדל״ן", "🏠 Real estate"], legal: ["⚖️ עורכי דין", "⚖️ Lawyers"], jewish: ["✡️ קהילה ובתי חב״ד", "✡️ Community & Chabad"], kosher: ["🍽️ אוכל כשר", "🍽️ Kosher food"], culture: ["🏛️ תרבות", "🏛️ Culture"], services: ["🧾 שירותים", "🧾 Services"], health: ["🩺 בריאות", "🩺 Health"], tours: ["🧭 טיולים", "🧭 Tours"] };
  const order = Object.keys(CAT);
  const sorted = biz.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order.indexOf(a.cat) - order.indexOf(b.cat));
  const card = (b) => `<div class="card biz" style="grid-template-columns:1fr"><div>${b.featured ? `<span class="spons">${esc(t.sponsored)}</span>` : ""}<span class="kicker">${esc((CAT[b.cat] || CAT.services)[he ? 0 : 1])}${b.city ? " · " + esc(b.city[lang] || "") : ""}</span><h3>${esc(b.name)}</h3><p>${esc(b[lang] || "")}</p>${b.hebrew ? `<span class="heb">🗣️ ${he ? "שירות בעברית" : "Hebrew spoken"}</span>` : ""}<div class="meta">${b.address ? `📍 <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}" target="_blank" rel="noopener">${esc(b.address)}</a>` : ""}${b.phone ? ` · 📞 <a dir="ltr" href="tel:${b.phone.replace(/[^+\d]/g, "")}">${esc(b.phone)}</a>` : ""}${b.whatsapp ? ` · 💬 <a href="${esc(b.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}${b.url ? ` · <a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.urlLabel || b.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, ""))}</a>` : ""}</div></div></div>`;
  return sorted.length ? `<div class="cards">${sorted.map(card).join("")}</div>` : `<div class="empty">${esc(t.dirEmpty)}</div>`;
})()}
${formBox(lang, { id: "biz", title: t.dirAdd, kind: "business-listing", fields: ["name", "email", "phone", "msg"] })}
</div>${widgets(lang, mostRead)}</div>`;
  write(P(lang, "/directory/"), layout({ lang, title: t.dirTitle, description: t.dirText, path: P(lang, "/directory/"), altPath: P(lang === "he" ? "en" : "he", "/directory/"), body: dir, breaking: breakingNow }));

  /* Νομικές σελίδες: τα στοιχεία εκδότη μπαίνουν από το config (ποτέ placeholders στο live site) */
  function fillPub(pg, lang) {
    const pub = SITE.publisher, d = pub.updated || "27.09.2026";
    const L = (v) => (v && typeof v === "object" ? v[lang] : v) || "";
    const f = (x) => x
      .replace(/\[(שם החברה|Company name)\]/g, pub[lang])
      .replace(/,? ?\[(כתובת|address|Address)\]/g, L(pub.address) ? ", " + L(pub.address) : "")
      .replace(/,? ?\[(מספר רישום עסק \/ ΓΕΜΗ|Business registration \/ ΓΕΜΗ number)\]/g, L(pub.registration) ? ", " + L(pub.registration) : "")
      .replace(/\[(אימייל|email)\]/g, pub.email)
      .replace(/\[(תאריך|date)\]/g, d)
      .replace(/ ?\[(לבדיקת עורך דין|for lawyer review)\]/g, "");
    return { title: f(pg.title), body: f(pg.body) };
  }
  for (const p of LEGAL_PAGES) {
    const pg = fillPub(PAGES[p][lang], lang);
    let extra = "";
    if (p === "contact") extra = formBox(lang, { id: "contact", title: t.legal.contact, kind: "contact", fields: ["name", "email", "msg"] });
    if (p === "advertise") extra = formBox(lang, { id: "adv", title: t.legal.advertise, kind: "advertiser", fields: ["name", "email", "phone", "msg"] });
    if (p === "privacy") extra = formBox(lang, { id: "gdpr", title: lang === "he" ? "בקשה לגבי המידע שלי (עיון / מחיקה)" : "Request about my data (access / deletion)", kind: "gdpr-request", fields: ["name", "email", "msg"] });
    const body = `<article class="full"><h1>${esc(pg.title)}</h1><div class="prose">${md(pg.body)}</div></article>${extra}`;
    write(P(lang, `/p/${p}/`), layout({ lang, title: pg.title, description: plain(pg.body).slice(0, 150), path: P(lang, `/p/${p}/`), altPath: P(lang === "he" ? "en" : "he", `/p/${p}/`), body, breaking: breakingNow }));
  }

  /* RSS */
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${lang === "he" ? SITE.nameHe : SITE.name}</title><link>${abs(P(lang, "/"))}</link><description>${esc(t.tagline)}</description><language>${lang}</language>
<atom:link href="${abs(P(lang, "/rss.xml"))}" rel="self" type="application/rss+xml"/>
${articles.slice(0, 40).map((a) => `<item><title>${esc(a[lang].title)}</title><link>${abs(P(lang, "/a/" + a.slug + "/"))}</link><guid>${abs(P(lang, "/a/" + a.slug + "/"))}</guid><pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate><description>${esc(a[lang].dek)}</description><category>${esc(sec(a.section)[lang])}</category></item>`).join("\n")}
</channel></rss>`;
  write(P(lang, "/rss.xml"), rss);
}

/* «מבזקים» – όλα τα σύντομα νέα, με ώρα Αθήνας */
for (const lang of LANGS) {
  const he = lang === "he", path = P(lang, he ? "/mivzakim/" : "/flash/");
  const list = newsOnly.filter((a) => NOW - new Date(a.publishedAt).getTime() < 7 * 864e5).slice(0, 80);
  const dayOf = (iso) => new Intl.DateTimeFormat(he ? "he-IL" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Athens" }).format(new Date(iso));
  const hm = (iso) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" }).format(new Date(iso));
  let cur = "", rows = "";
  for (const a of list) {
    const d = dayOf(a.publishedAt);
    if (d !== cur) { if (cur) rows += "</ol>"; rows += `<h2 class="fl-day">${esc(d)}</h2><ol class="fl-list">`; cur = d; }
    const al = a.alert && a.alert[lang] ? a.alert[lang] : a.strike ? (he ? "שביתה" : "Strike") : a.breaking ? (he ? "מבזק" : "Breaking") : "";
    rows += `<li><time>${esc(hm(a.publishedAt))}</time><div>${al ? `<span class="alert-tag">${esc(al)}</span>` : ""}<a href="${P(lang, "/a/" + a.slug + "/")}">${esc(a[lang].title)}</a><p>${esc(a[lang].tldr[0] || a[lang].dek)}</p></div></li>`;
  }
  if (cur) rows += "</ol>";
  const title = he ? "מבזקים מיוון" : "Flash news from Greece";
  const intro = he ? "כל החדשות האחרונות מיוון, לפי השעה באתונה. מתעדכן כל הזמן." : "All the latest news from Greece, by Athens time. Updated all the time.";
  write(path, layout({ lang, title, description: intro, path, altPath: P(he ? "en" : "he", he ? "/flash/" : "/mivzakim/"), breaking: breakingNow,
    body: `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(intro)}</p></div><div class="flashpage">${rows || `<div class="empty">${esc(T[lang].sectionEmpty)}</div>`}</div>` }));
}

/* 404 */
write("404.html", layout({ lang: "he", title: "404", description: "", path: "/404.html", altPath: "/en/", noindex: true, body: `<div class="page-h"><h1>הדף לא נמצא</h1><p>Page not found. <a href="/">Yavanet</a> · <a href="/en/">English</a></p></div>` }));

/* Sitemaps */
const urls = [];
const LASTMOD = {};
for (const lang of LANGS) {
  urls.push(P(lang, "/"), P(lang, "/tools/"), P(lang, "/live/"), P(lang, "/strikes/"), P(lang, "/emergency/"), P(lang, "/cost-of-living/"), P(lang, "/guides/"), P(lang, "/directory/"), P(lang, "/advisor/"));
  if (GLOBAL.madad) urls.push(P(lang, "/madad/"), P(lang, "/tlv-vs-athens/"));
  if (GLOBAL.flights) urls.push(P(lang, "/flights/"));
  urls.push(P(lang, lang === "he" ? "/mivzakim/" : "/flash/"));
  urls.push(P(lang, "/travel/"), P(lang, "/invest/"), P(lang, "/moving/"), P(lang, "/contact/"));
  urls.push(P(lang, "/holidays/"), P(lang, "/strike-today/"), ...DESTS.map((d) => P(lang, `/d/${d.id}/`)));
  TOOL_PAGES(lang).forEach(([u]) => urls.push(P(lang, u)));
  urls.push(...WX_LEVEL_PAGES.map((p) => P(lang, wxLevelUrl(p.id))), P(lang, "/weather/"), ...MONTHS.map((m) => P(lang, monthUrl(m))));
  SECTIONS.forEach((s) => urls.push(P(lang, `/s/${s.slug}/`)));
  LEGAL_PAGES.forEach((p) => urls.push(P(lang, `/p/${p}/`)));
  articles.forEach((a) => { const u = P(lang, `/a/${a.slug}/`); urls.push(u); LASTMOD[u] = (a.updatedAt || a.publishedAt).slice(0, 10); });
}
write("strikes.ics", strikesICS(strikeArts, SITE.url.replace(/\/$/, "")));
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${abs(u)}</loc>${LASTMOD[u] ? `<lastmod>${LASTMOD[u]}</lastmod>` : `<lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`}</url>`).join("\n")}\n</urlset>`);
const recent = articles.filter((a) => NOW - new Date(a.publishedAt).getTime() < 2 * 86400e3);
write("news-sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent.flatMap((a) => LANGS.map((lang) => `<url><loc>${abs(P(lang, "/a/" + a.slug + "/"))}</loc><news:news><news:publication><news:name>${lang === "he" ? SITE.nameHe : SITE.name}</news:name><news:language>${lang === "he" ? "he" : "en"}</news:language></news:publication><news:publication_date>${a.publishedAt}</news:publication_date><news:title>${esc(a[lang].title)}</news:title></news:news></url>`)).join("\n")}
</urlset>`);

/* llms.txt: περίληψη του site για ChatGPT, Gemini, Perplexity, Claude (https://llmstxt.org) */
{
  const U = (p) => abs(p);
  const guides = articles.filter((a) => a.guide || (a.meta && /^eg-/.test(String(a.meta.itemId || ""))));
  const latest = newsOnly.slice(0, 20);
  write("llms.txt", `# Yavanet (יוונט)

> Yavanet is an independent news site about Greece for Israelis, in Hebrew (main) and English. It covers news that affects Israelis in Greece: strikes and flights, severe weather and wildfires, Greek property law and taxes, the Golden Visa, relocation, and Jewish Greece. Articles are based on official Greek sources (ministries, civil protection, courts, airports, transport operators), each with a link to the source. Publisher: Spyridon Fikias (S.F. Properties), Athens, Greece.

- Hebrew home: ${U("/")}
- English home: ${U("/en/")}
- Strikes today/tomorrow in Greece: ${U("/en/strike-today/")}
- Cheapest flights Tel Aviv to Greece today: ${U("/en/flights/")}
- Greek property price index by neighbourhood: ${U("/en/madad/")}
- Tools (purchase cost and rental yield calculators): ${U("/en/tools/")}
- Emergency numbers and Israeli embassy in Greece: ${U("/en/emergency/")}
- Sources & corrections policy: ${U("/en/p/corrections/")}

## Guides
${guides.map((a) => `- [${a.en.title}](${U("/en/a/" + a.slug + "/")}): ${a.en.dek}`).join("\n")}

## Destinations
${DESTS.map((d) => `- [${d.en}: news, weather, flights and strikes](${U("/en/d/" + d.id + "/")})`).join("\n")}

## Latest news
${latest.map((a) => `- [${a.en.title}](${U("/en/a/" + a.slug + "/")}) (${String(a.publishedAt).slice(0, 10)})`).join("\n")}
`);
}

/* Στατικά αρχεία */
const assets = path.join(ROOT, "site/assets");
/* Ελαφριά ελαχιστοποίηση (minify) css/js χωρίς εξαρτήσεις: σχόλια, κενά και εσοχές.
   Συντηρητική: στο JS αφαιρεί μόνο ολόκληρες γραμμές σχολίων και την εσοχή (οι αλλαγές γραμμής μένουν). */
const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};])\s*/g, "$1").replace(/;}/g, "}").trim();
const minJs = (s) => {
  const out = []; let inBlock = false;
  for (const raw of s.split("\n")) {
    const l = raw.trim();
    if (inBlock) { if (l.endsWith("*/")) inBlock = false; continue; }
    if (!l || l.startsWith("//")) continue;
    if (l.startsWith("/*") && !l.startsWith("/**/")) { if (!l.endsWith("*/")) inBlock = true; else if (l.indexOf("*/") !== l.length - 2) { out.push(l); continue; } continue; }
    out.push(l);
  }
  return out.join("\n") + "\n";
};
for (const f of fs.readdirSync(assets)) {
  let buf = fs.readFileSync(path.join(assets, f));
  if (f === "robots.txt") buf = Buffer.from(buf.toString().replace(/__SITE__/g, SITE.url.replace(/\/$/, "")));
  if (f === "styles.css") buf = Buffer.from(minCss(buf.toString()));
  if (f === "app.js" || f === "tools.js") buf = Buffer.from(minJs(buf.toString()));
  fs.writeFileSync(path.join(OUT, f), buf);
}
/* Εκδόσεις αρχείων (cache-busting): κάθε αλλαγή σε css/js αλλάζει τη διεύθυνση, ώστε
   κανένας browser/service worker να μη δείξει νέα σελίδα με παλιό στυλ. */
{
  const crypto = await import("node:crypto");
  const h = (f) => crypto.createHash("sha1").update(fs.readFileSync(path.join(OUT, f))).digest("hex").slice(0, 10);
  const vCss = h("styles.css"), vJs = h("app.js");
  const critical = makeCritical(fs.readFileSync(path.join(OUT, "styles.css"), "utf8"), fs.readFileSync(path.join(OUT, "app.js"), "utf8"));
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) return walk(f);
    if (!f.endsWith(".html")) return;
    const s = fs.readFileSync(f, "utf8");
    let n = s.replace('href="/styles.css"', `href="/styles.css?v=${vCss}"`).replace('src="/app.js"', `src="/app.js?v=${vJs}"`);
    // Critical CSS inline + πλήρες styles.css χωρίς μπλοκάρισμα (preload → stylesheet, noscript για χωρίς JS)
    n = n.replace(/<link rel="stylesheet" href="(\/styles\.css\?v=[\w]+)">/, (m, href) =>
      `<style>${critical(n).replace(/<\/style/gi, "<\\/style")}</style>\n<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link rel="stylesheet" href="${href}"></noscript>`);
    // Σελίδες άρθρων: η κεντρική φωτογραφία (LCP) ζητείται από το <head>, πριν διαβαστεί όλο το HTML
    if (/[\\/]a[\\/][^\\/]+[\\/]index\.html$/.test(f)) {
      const im = n.match(/<img src="[^"]*" srcset="([^"]*)" sizes="([^"]*)"[^>]*fetchpriority="high"/);
      if (im) n = n.replace("</title>", `</title>\n<link rel="preload" as="image" imagesrcset="${im[1]}" imagesizes="${im[2]}" fetchpriority="high">`);
    }
    if (n !== s) fs.writeFileSync(f, n);
  });
  walk(OUT);
  const swf = path.join(OUT, "sw.js");
  fs.writeFileSync(swf, fs.readFileSync(swf, "utf8").replace(/const V = "[^"]+";/, `const V = "yv-${vCss.slice(0, 5)}${vJs.slice(0, 5)}";`).replace('"/styles.css", "/app.js", ', `"/styles.css?v=${vCss}", "/app.js?v=${vJs}", `));
}
/* Ανακατευθύνσεις για άρθρα που συγχωνεύτηκαν (Cloudflare _redirects) */
const redirects = fs.readdirSync(path.join(ROOT, "content/articles")).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "content/articles", f), "utf8")))
  .filter((a) => a.hidden && a.meta && a.meta.mergedInto)
  .flatMap((a) => [`/a/${a.slug}/ /a/${a.meta.mergedInto}/ 301`, `/en/a/${a.slug}/ /en/a/${a.meta.mergedInto}/ 301`]);
if (redirects.length) fs.writeFileSync(path.join(OUT, "_redirects"), redirects.join("\n") + "\n");

console.log(`✓ Yavanet: ${articles.length} άρθρα, ${urls.length} σελίδες → dist/`);
