// /weather/ και /weather/greece-in-<month>/ – Ο καιρός στην Ελλάδα ανά μήνα (12 σελίδες + ευρετήριο).
// ΑΡΙΘΜΟΙ: ΜΟΝΟ από Climates to Travel (climatestotravel.com/climate/greece), όπως εμφανίζονται στους πίνακες της σελίδας
// (ελέγχθηκαν δύο φορές, 4 Οκτ. 2026· τα σύνολα «Prec. days» του έτους συμφωνούν με το άθροισμα των μηνών).
// Αθήνα, Θεσσαλονίκη, Ηράκλειο: περίοδος 1991–2020. Ρόδος, Μύκονος, Σαντορίνη: η σελίδα δεν αναφέρει περίοδο.
// Θεσσαλονίκη: η πηγή δεν δίνει θερμοκρασία θάλασσας → «—».
// Αργίες: HOLIDAYS από site/holidays.mjs. Εβραϊκές γιορτές: hebcal.com (5787) και chabad.org (2027).
// Εκδηλώσεις: athensmarathon.gr (8.11.2026), filmfestival.gr (5–15.11.2026), carnifest.com (Καρναβάλι Πάτρας 17.1–14.3.2027),
// Wikipedia «Athens Epidaurus Festival» (Μάιος–Οκτώβριος, Επίδαυρος Παρ.–Σάβ. Ιούλ.–Αύγ.).
// Νησιά εκτός σεζόν: santorinidave.com (Μύκονος, Σαντορίνη). Σκι Παρνασσού: GTP (άνοιγμα 23.12.2025).
import { esc, P, GLOBAL } from "./templates.mjs";
import { HOLIDAYS } from "./holidays.mjs";
import { wxAlertBox } from "./wxalert.mjs";

const H = (lang, he, en) => (lang === "he" ? he : en);

export const MONTHS = [
  { slug: "january", he: "ינואר", in: "בינואר", en: "January" },
  { slug: "february", he: "פברואר", in: "בפברואר", en: "February" },
  { slug: "march", he: "מרץ", in: "במרץ", en: "March" },
  { slug: "april", he: "אפריל", in: "באפריל", en: "April" },
  { slug: "may", he: "מאי", in: "במאי", en: "May" },
  { slug: "june", he: "יוני", in: "ביוני", en: "June" },
  { slug: "july", he: "יולי", in: "ביולי", en: "July" },
  { slug: "august", he: "אוגוסט", in: "באוגוסט", en: "August" },
  { slug: "september", he: "ספטמבר", in: "בספטמבר", en: "September" },
  { slug: "october", he: "אוקטובר", in: "באוקטובר", en: "October" },
  { slug: "november", he: "נובמבר", in: "בנובמבר", en: "November" },
  { slug: "december", he: "דצמבר", in: "בדצמבר", en: "December" },
];
export const monthUrl = (m) => `/weather/greece-in-${m.slug}/`;

// [min °C, max °C, βροχή mm, ημέρες βροχής, θάλασσα °C] ανά μήνα (Ιαν→Δεκ) – Climates to Travel
const D = {
  athens: { he: "אתונה", en: "Athens", dest: "athens", per: "1991–2020",
    min: [7, 7, 9, 12, 16, 21, 23, 24, 20, 16, 12, 8], max: [13, 14, 16, 20, 25, 30, 33, 33, 29, 24, 19, 15],
    mm: [50, 40, 40, 25, 15, 5, 5, 5, 10, 45, 60, 60], days: [9, 7, 8, 6, 4, 1, 1, 1, 3, 5, 8, 11], sea: [16, 15, 15, 16, 18, 22, 24, 25, 24, 22, 19, 17] },
  thessaloniki: { he: "סלוניקי", en: "Thessaloniki", dest: "thessaloniki", per: "1991–2020",
    min: [1, 3, 5, 8, 13, 18, 20, 21, 16, 12, 8, 3], max: [10, 11, 15, 19, 25, 30, 32, 32, 27, 22, 16, 11],
    mm: [40, 30, 25, 40, 50, 20, 25, 15, 25, 35, 45, 50], days: [6, 5, 5, 6, 6, 3, 3, 2, 4, 4, 6, 6], sea: null },
  heraklion: { he: "כרתים (הרקליון)", en: "Crete (Heraklion)", dest: "crete", per: "1991–2020",
    min: [9, 9, 10, 12, 16, 20, 23, 23, 20, 18, 14, 11], max: [15, 16, 17, 20, 24, 28, 29, 29, 27, 24, 20, 17],
    mm: [90, 65, 50, 25, 15, 0, 0, 0, 10, 45, 60, 95], days: [10, 8, 6, 3, 2, 0, 0, 0, 2, 4, 6, 10], sea: [16, 16, 16, 17, 19, 22, 24, 25, 24, 23, 20, 18] },
  rhodes: { he: "רודוס", en: "Rhodes", dest: "rhodes", per: null,
    min: [10, 10, 12, 14, 18, 22, 24, 25, 23, 19, 15, 12], max: [15, 15, 17, 20, 24, 28, 30, 30, 28, 25, 20, 17],
    mm: [145, 90, 65, 40, 25, 0, 0, 0, 0, 45, 100, 140], days: [9, 8, 6, 5, 2, 0, 0, 0, 1, 3, 6, 11], sea: [17, 17, 16, 18, 20, 23, 25, 26, 25, 23, 21, 18] },
  mykonos: { he: "מיקונוס (קיקלדים)", en: "Mykonos (Cyclades)", dest: "mykonos", per: null,
    min: [9, 9, 11, 13, 17, 21, 23, 23, 21, 18, 14, 11], max: [13, 13, 15, 18, 22, 27, 28, 28, 26, 22, 18, 14],
    mm: [100, 70, 60, 25, 15, 5, 0, 0, 10, 45, 65, 100], days: [10, 8, 7, 5, 3, 1, 0, 0, 2, 5, 6, 10], sea: [16, 16, 15, 16, 18, 22, 24, 24, 23, 21, 19, 17] },
  santorini: { he: "סנטוריני (קיקלדים)", en: "Santorini (Cyclades)", dest: "santorini", per: null,
    min: [10, 10, 11, 13, 17, 21, 23, 24, 21, 18, 14, 12], max: [14, 14, 16, 19, 23, 28, 30, 30, 27, 23, 19, 16],
    mm: [115, 80, 65, 30, 15, 5, 0, 0, 15, 60, 70, 100], days: [9, 7, 6, 3, 2, 1, 0, 0, 1, 3, 5, 9], sea: [16, 16, 16, 16, 19, 22, 24, 25, 24, 22, 20, 18] },
};
const PLACES = ["athens", "thessaloniki", "heraklion", "rhodes", "mykonos", "santorini"];
const SRC_CLIMATE = ["https://www.climatestotravel.com/climate/greece", "Climates to Travel – Greece climate"];

// Εβραϊκές γιορτές (ημερομηνίες έναρξης/λήξης, ώρα Ισραήλ δεν αλλάζει την ημέρα) – hebcal.com / chabad.org
const JEWISH = [
  { d: "2026-12-04", to: "2026-12-12", he: "חנוכה", en: "Hanukkah", src: "hebcal" },
  { d: "2027-03-22", to: "2027-03-23", he: "פורים", en: "Purim", src: "hebcal" },
  { d: "2027-04-21", to: "2027-04-28", he: "פסח (ערב החג ב-21 באפריל)", en: "Passover (starts the evening of 21 April)", src: "hebcal" },
  { d: "2027-06-10", to: "2027-06-11", he: "שבועות (ערב החג ב-10 ביוני)", en: "Shavuot (starts the evening of 10 June)", src: "hebcal" },
  { d: "2027-10-01", to: "2027-10-03", he: "ראש השנה (ערב החג ב-1 באוקטובר)", en: "Rosh Hashanah (starts the evening of 1 October)", src: "chabad" },
  { d: "2027-10-10", to: "2027-10-11", he: "יום כיפור (ערב החג ב-10 באוקטובר)", en: "Yom Kippur (starts the evening of 10 October)", src: "chabad" },
  { d: "2027-10-15", to: "2027-10-22", he: "סוכות (ערב החג ב-15 באוקטובר)", en: "Sukkot (starts the evening of 15 October)", src: "chabad" },
];
const SRC_J = { hebcal: ["https://www.hebcal.com/holidays/2026-2027", "Hebcal – Jewish holidays 5787"], chabad: ["https://www.chabad.org/holidays/default_cdo/year/2027/jewish/holidays-2027.htm", "Chabad.org – Jewish holidays 2027"] };

// Εκδηλώσεις με επιβεβαιωμένες ημερομηνίες
const EVENTS = [
  { d: "2026-11-05", to: "2026-11-15", he: "פסטיבל הקולנוע הבינלאומי של סלוניקי", en: "Thessaloniki International Film Festival", u: "https://filmfestival.gr/en/newsroom/news/submissions-open-for-the-67th-tiff/", s: "filmfestival.gr" },
  { d: "2026-11-08", he: "מרתון אתונה (The Authentic) – כבישים נסגרים במסלול", en: "Athens Marathon (The Authentic) – roads close along the route", u: "https://www.athensmarathon.gr/", s: "athensmarathon.gr" },
  { d: "2027-01-17", to: "2027-03-14", he: "עונת הקרנבל של פטרס, הגדול ביוון", en: "Patras Carnival season, Greece's biggest", u: "https://www.carnifest.com/patras-carnival-2027/", s: "carnifest.com" },
];
// Εποχικές σημειώσεις (χωρίς ημερομηνίες έτους) – μήνες 1..12
const SEASON = [
  { m: [11, 12, 1, 2, 3], he: "באיים הקטנים, למשל במיקונוס ובסנטוריני, הרבה מלונות, מסעדות וסיורים סגורים בחורף, ויש פחות מעבורות. במיקונוס יש בחורף לפחות מעבורת אחת ביום לאתונה ולסירוס, ובדרך כלל אין קו ישיר לסנטוריני. בסנטוריני, פירה פעילה כל השנה.", en: "On the smaller islands, such as Mykonos and Santorini, many hotels, restaurants and tours close in winter and there are fewer ferries. In winter Mykonos has at least one ferry a day to Athens and Syros, but usually no direct boat to Santorini. In Santorini, Fira stays active all year.", u: "https://santorinidave.com/best-time-to-visit-mykonos", s: "SantoriniDave" },
  { m: [4], he: "האיים מתעוררים: במיקונוס כ-75% מעסקי התיירות פתוחים עד סוף אפריל, והמעבורות הישירות בין מיקונוס לסנטוריני מתחילות בדרך כלל בתחילת אפריל.", en: "The islands wake up: in Mykonos about 75% of tourist businesses are open by late April, and direct Mykonos–Santorini ferries usually start in early April.", u: "https://santorinidave.com/best-time-to-visit-mykonos", s: "SantoriniDave" },
  { m: [5], he: "במיקונוס כל המלונות והמסעדות פתוחים מאמצע מאי, ובסנטוריני עיירות החוף נפתחות לעונה.", en: "In Mykonos all hotels and restaurants are open by mid-May, and Santorini's beach towns open for the season.", u: "https://santorinidave.com/best-time-of-year-to-visit-santorini", s: "SantoriniDave" },
  { m: [6, 7, 8, 9], he: "עונת התיירות בשיאה. במיקונוס מועדוני החוף פתוחים מסוף יוני עד אמצע ספטמבר.", en: "Peak tourist season. In Mykonos the beach clubs are open from late June to mid-September.", u: "https://santorinidave.com/best-time-to-visit-mykonos", s: "SantoriniDave" },
  { m: [7, 8], he: "קיץ ברוח המלטמי: רוח צפונית שנושבת בים האגאי, לפעמים יומיים עד ארבעה ולפעמים שבועות. היא יכולה לשבש הפלגות בין האיים.", en: "Meltemi season: a northerly wind over the Aegean that blows for two to four days, sometimes for weeks. It can disrupt ferries between the islands.", u: "https://www.climatestotravel.com/climate/greece", s: "Climates to Travel" },
  { m: [5, 6, 7, 8, 9, 10], he: "פסטיבל אתונה-אפידאורוס פועל ממאי עד אוקטובר. בתיאטרון העתיק של אפידאורוס ההופעות בימי שישי ושבת ביולי ובאוגוסט.", en: "The Athens Epidaurus Festival runs from May to October. At the ancient theatre of Epidaurus, performances are on Fridays and Saturdays in July and August.", u: "https://en.wikipedia.org/wiki/Athens_Epidaurus_Festival", s: "Wikipedia" },
  { m: [10], he: "באמצע אוקטובר במיקונוס הרבה מלונות ומסעדות מתחילים להיסגר, ובסוף החודש כבר שקט מאוד. המעבורות הישירות מיקונוס–סנטוריני פועלות בדרך כלל עד סוף אוקטובר.", en: "By mid-October many Mykonos hotels and restaurants start to close, and by the end of the month it is very quiet. Direct Mykonos–Santorini ferries usually run until late October.", u: "https://santorinidave.com/best-time-to-visit-mykonos", s: "SantoriniDave" },
  { m: [12, 1, 2, 3], he: "עונת הסקי בפרנסוס תלויה בשלג. בעונת 2025–2026 האתר נפתח ב-23 בדצמבר.", en: "The ski season at Parnassos depends on snow. In 2025–2026 the resort opened on 23 December.", u: "https://news.gtp.gr/2025/12/22/parnassos-and-voras-kaimaktsalan-ski-resorts-open-for-the-2025-2026-winter-season/", s: "GTP" },
  { m: [9, 10, 11, 12, 1, 2], he: "הסתיו והחורף הם עונת הסערות: בסוף ספטמבר ותחילת אוקטובר 2026 כרתים הייתה תחת אזהרה אדומה, עם הצפות והודעות 112. לפני נסיעה בדקו את אזהרות מזג האוויר.", en: "Autumn and winter are storm season: in late September and early October 2026 Crete was under a red warning, with floods and 112 alerts. Check the weather warnings before you travel.", u: null, s: null, a: "red-code-crete-severe-weather-storm" },
];

const fmtRange = (d, to, lang) => {
  const f = (x) => new Date(x + "T12:00:00Z").toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return to && to !== d ? `${f(d)} – ${f(to)}` : f(d);
};
const monthOf = (iso) => Number(iso.slice(5, 7));
// Γεγονότα του μήνα που δεν έχουν περάσει (μέσα στους επόμενους ~12 μήνες)
// Γεγονότα της ΕΠΟΜΕΝΗΣ εμφάνισης του μήνα (τρέχων μήνας = φέτος, παλαιότεροι μήνες = του χρόνου) που δεν έχουν περάσει
const upcomingIn = (list, mi, TODAY) => {
  const cy = Number(TODAY.slice(0, 4)), cm = Number(TODAY.slice(5, 7));
  const ym = `${mi + 1 >= cm ? cy : cy + 1}-${String(mi + 1).padStart(2, "0")}`;
  return list.filter((x) => (x.to || x.d) >= TODAY && x.d.slice(0, 7) <= ym && (x.to || x.d).slice(0, 7) >= ym);
};

function table(lang, mi) {
  const he = lang === "he";
  const th = he ? ["מקום", "טמפ׳ (מינ׳–מקס׳)", "הים", "ימי גשם", "גשם (מ״מ)"] : ["Place", "Temp (min–max)", "Sea", "Rain days", "Rain (mm)"];
  const rows = PLACES.map((k) => { const p = D[k];
    return `<tr><td><a href="${P(lang, "/d/" + p.dest + "/")}">${esc(p[lang])}</a></td><td><span dir="ltr">${p.min[mi]}–${p.max[mi]}°</span></td><td>${p.sea ? `<span dir="ltr">${p.sea[mi]}°</span>` : "—"}</td><td>${p.days[mi]}</td><td>${p.mm[mi]}</td></tr>`; }).join("");
  return `<div class="tablewrap"><table class="shtable clim"><thead><tr>${th.map((x) => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
const srcNote = (lang) => H(lang,
  `ממוצעים רב-שנתיים בצלזיוס, לפי <a href="${SRC_CLIMATE[0]}" target="_blank" rel="noopener">Climates to Travel</a> (אתונה, סלוניקי והרקליון: 1991–2020). ״ימי גשם״: מספר הימים בחודש עם משקעים. לסלוניקי המקור לא מפרסם את טמפרטורת הים. אלה ממוצעים, לא תחזית: בכל שנה יכולים להיות גלי חום, קור או סערות.`,
  `Long-term averages in Celsius, from <a href="${SRC_CLIMATE[0]}" target="_blank" rel="noopener">Climates to Travel</a> (Athens, Thessaloniki and Heraklion: 1991–2020). “Rain days”: days in the month with precipitation. The source gives no sea temperature for Thessaloniki. These are averages, not a forecast: any year can bring heatwaves, cold spells or storms.`);

// Σύντομη περίληψη από τα δεδομένα (χωρίς επιπλέον ισχυρισμούς)
function summary(lang, mi) {
  const a = D.athens, warm = PLACES.map((k) => [k, D[k].max[mi]]).sort((x, y) => y[1] - x[1])[0][0];
  const seaMax = Math.max(...PLACES.filter((k) => D[k].sea).map((k) => D[k].sea[mi])), seaMin = Math.min(...PLACES.filter((k) => D[k].sea).map((k) => D[k].sea[mi]));
  const m = MONTHS[mi];
  return H(lang,
    `${m.in} הטמפרטורה באתונה נעה בממוצע בין ${a.min[mi]} ל-${a.max[mi]} מעלות, עם כ-${a.days[mi]} ימי גשם בחודש. הים סביב אתונה והאיים בסביבות ${seaMin === seaMax ? seaMin : `${seaMin}–${seaMax}`} מעלות. המקום החם ביותר בטבלה: ${D[warm].he} (עד ${D[warm].max[mi]} מעלות). בסלוניקי ${D.thessaloniki.min[mi]}–${D.thessaloniki.max[mi]} מעלות.`,
    `In ${m.en} Athens averages ${a.min[mi]}–${a.max[mi]}°C, with about ${a.days[mi]} rain days. The sea around Athens and the islands is around ${seaMin === seaMax ? seaMin : `${seaMin}–${seaMax}`}°C. Warmest place in the table: ${D[warm].en} (up to ${D[warm].max[mi]}°C). Thessaloniki: ${D.thessaloniki.min[mi]}–${D.thessaloniki.max[mi]}°C.`);
}

// Ρούχα: κανόνες με βάση τους μέσους όρους (γενικές συμβουλές, όχι στοιχεία)
function packing(lang, mi) {
  const he = lang === "he", a = D.athens, th = D.thessaloniki;
  const out = [];
  if (a.max[mi] >= 28) out.push(he ? ["בגדים קלים ונושמים, כובע, משקפי שמש וקרם הגנה.", "בקבוק מים לסיורים: באתרים העתיקים יש מעט צל."] : ["Light, breathable clothes, a hat, sunglasses and sunscreen.", "A water bottle for sightseeing: ancient sites have little shade."]);
  else if (a.max[mi] >= 22) out.push(he ? ["בגדי קיץ ליום, ושכבה דקה (סווטשירט או ז׳קט קל) לערב ולשייט.", "קרם הגנה ונעליים נוחות להליכה."] : ["Summer clothes for the day and a light layer (sweatshirt or thin jacket) for evenings and boat trips.", "Sunscreen and comfortable walking shoes."]);
  else if (a.max[mi] >= 17) out.push(he ? ["שכבות: חולצות קצרות וארוכות, סוודר וז׳קט קל.", "מעיל גשם קל או מטרייה מתקפלת."] : ["Layers: short and long sleeves, a sweater and a light jacket.", "A light rain jacket or a folding umbrella."]);
  else out.push(he ? ["מעיל חם, סוודרים וצעיף, במיוחד לערבים.", "מטרייה ונעליים שלא נרטבות."] : ["A warm coat, sweaters and a scarf, especially for evenings.", "An umbrella and waterproof shoes."]);
  if (th.min[mi] <= 5) out.push(he ? [`בסלוניקי ובצפון קר יותר (בממוצע ${th.min[mi]}–${th.max[mi]} מעלות): מעיל חורף, כפפות וכובע.`] : [`Thessaloniki and the north are colder (on average ${th.min[mi]}–${th.max[mi]}°C): a winter coat, gloves and a hat.`]);
  const sea = a.sea[mi];
  out.push(sea >= 22 ? (he ? [`בגד ים: הים סביב ${sea} מעלות.`] : [`Swimwear: the sea is around ${sea}°C.`]) : sea >= 19 ? (he ? [`בגד ים לאמיצים: הים סביב ${sea} מעלות, קריר לרוב האנשים.`] : [`Swimwear if you are brave: the sea is around ${sea}°C, cool for most people.`]) : []);
  return out.flat();
}

export function climatePage(lang, mi, ctx) {
  const { exists, TODAY } = ctx;
  const he = lang === "he", L = (a, b) => (he ? a : b), m = MONTHS[mi];
  const prev = MONTHS[(mi + 11) % 12], next = MONTHS[(mi + 1) % 12];
  const a = D.athens, sea = a.sea[mi];
  const title = L(`מזג אוויר ביוון ${m.in}: טמפרטורות, ים וגשם`, `Greece weather in ${m.en}: temperatures, sea and rain`);
  const description = L(
    `מזג האוויר ביוון ${m.in}: באתונה ${a.min[mi]}–${a.max[mi]} מעלות, הים ${sea} מעלות, כ-${a.days[mi]} ימי גשם. טבלה לכרתים, רודוס, סלוניקי, מיקונוס וסנטוריני, חגים ומה לארוז.`,
    `Greece weather in ${m.en}: Athens ${a.min[mi]}–${a.max[mi]}°C, sea ${sea}°C, about ${a.days[mi]} rain days. Crete, Rhodes, Thessaloniki, Mykonos and Santorini, holidays and packing tips.`);

  // Αργίες / εβραϊκές γιορτές / εκδηλώσεις του μήνα (μόνο όσες δεν έχουν περάσει)
  const hol = upcomingIn(HOLIDAYS, mi, TODAY);
  const jew = upcomingIn(JEWISH, mi, TODAY);
  const evs = upcomingIn(EVENTS, mi, TODAY);
  const li = (x, extra = "") => `<li><b>${esc(fmtRange(x.d, x.to, lang))}</b> · ${esc(he ? x.he : x.en)}${extra}</li>`;
  const holHTML = [
    ...hol.map((x) => li(x, (x.nhe || x.nen) ? ` <span class="small">${esc(he ? x.nhe : x.nen)}</span>` : "")),
    ...jew.map((x) => li({ ...x, he: "✡️ " + x.he, en: "✡️ " + x.en })),
    ...evs.map((x) => li(x, ` <span class="small">(<a href="${x.u}" target="_blank" rel="noopener">${esc(x.s)}</a>)</span>`)),
  ];
  const seas = SEASON.filter((s) => s.m.includes(mi + 1) && (!s.a || exists(s.a)));
  const seasHTML = seas.map((s) => `<li>${esc(he ? s.he : s.en)} ${s.u ? `<span class="small">(<a href="${s.u}" target="_blank" rel="noopener">${esc(s.s)}</a>)</span>` : s.a ? `<a href="${P(lang, "/a/" + s.a + "/")}">${L("לכתבה", "Read more")}</a> · <a href="${P(lang, "/weather-warnings/")}">${L("אזהרות מזג אוויר", "Weather warnings")}</a>` : ""}</li>`).join("");

  // Θάλασσα: κείμενο μόνο από τους αριθμούς
  const seaVals = PLACES.filter((k) => D[k].sea).map((k) => D[k].sea[mi]);
  const seaTxt = Math.min(...seaVals) >= 22
    ? L(`כן. ${m.in} הים ביוון חמים: ${Math.min(...seaVals)}–${Math.max(...seaVals)} מעלות בממוצע באתונה, בכרתים, ברודוס ובקיקלדים.`, `Yes. In ${m.en} the sea is warm: ${Math.min(...seaVals)}–${Math.max(...seaVals)}°C on average around Athens, Crete, Rhodes and the Cyclades.`)
    : Math.max(...seaVals) >= 20
    ? L(`אפשר, למי שלא מפחד ממים קרירים: ${Math.min(...seaVals)}–${Math.max(...seaVals)} מעלות בממוצע. הים הכי חם ברודוס (${D.rhodes.sea[mi]}) ובכרתים (${D.heraklion.sea[mi]}).`, `Possible, if you don't mind cool water: ${Math.min(...seaVals)}–${Math.max(...seaVals)}°C on average. Warmest in Rhodes (${D.rhodes.sea[mi]}°C) and Crete (${D.heraklion.sea[mi]}°C).`)
    : L(`לרוב האנשים זה קר: הים ${Math.min(...seaVals)}–${Math.max(...seaVals)} מעלות בממוצע. ${m.in} זו לא עונת ים ביוון.`, `Too cold for most people: the sea averages ${Math.min(...seaVals)}–${Math.max(...seaVals)}°C. ${m.en} is not beach season in Greece.`);
  const wettest = PLACES.map((k) => [k, D[k].days[mi]]).sort((x, y) => y[1] - x[1])[0];
  const warm = PLACES.map((k) => [k, D[k].max[mi]]).sort((x, y) => y[1] - x[1])[0];
  const faq = he ? [
    [`איך מזג האוויר ביוון ${m.in}?`, summary(lang, mi)],
    [`אפשר להתרחץ בים ביוון ${m.in}?`, seaTxt],
    [`כמה ימי גשם יש ביוון ${m.in}?`, `באתונה כ-${a.days[mi]} ימי גשם בממוצע ${m.in}. הכי הרבה ימי גשם בטבלה: ${D[wettest[0]].he} (${wettest[1]}).${mi >= 8 || mi <= 1 ? " בסתיו ובחורף יכולות להיות גם סערות, אז בדקו את אזהרות מזג האוויר לפני הנסיעה." : ""}`],
    [`איפה הכי חם ביוון ${m.in}?`, `לפי הממוצעים בטבלה, ב${D[warm[0]].he.replace(/ \(.*\)$/, "")}: עד ${warm[1]} מעלות ביום. הכי קר בסלוניקי ובצפון: ${D.thessaloniki.min[mi]}–${D.thessaloniki.max[mi]} מעלות.`],
    [`מה לארוז לטיול ליוון ${m.in}?`, packing(lang, mi).join(" ")],
  ] : [
    [`What is the weather like in Greece in ${m.en}?`, summary(lang, mi)],
    [`Can you swim in the sea in Greece in ${m.en}?`, seaTxt],
    [`How many rain days are there in Greece in ${m.en}?`, `Athens has about ${a.days[mi]} rain days on average in ${m.en}. Most rain days in the table: ${D[wettest[0]].en} (${wettest[1]}).${mi >= 8 || mi <= 1 ? " Autumn and winter can also bring storms, so check the weather warnings before you travel." : ""}`],
    [`Where is warmest in Greece in ${m.en}?`, `By the averages in the table, ${D[warm[0]].en.replace(/ \(.*\)$/, "")}: up to ${warm[1]}°C by day. Coldest is Thessaloniki and the north: ${D.thessaloniki.min[mi]}–${D.thessaloniki.max[mi]}°C.`],
    [`What should I pack for Greece in ${m.en}?`, packing(lang, mi).join(" ")],
  ];

  const sec = (id, t, inner) => `<section aria-labelledby="${id}"><div class="zone-h"><h2 id="${id}">${t}</h2></div>${inner}</section>`;
  const crumbs = `<p class="small"><a href="${P(lang, "/")}">${L("ראשי", "Home")}</a> › <a href="${P(lang, "/weather/")}">${L("מזג אוויר ביוון", "Greece weather")}</a> › ${esc(he ? m.he : m.en)}</p>`;
  const monthsNav = `<nav class="chips" aria-label="${L("חודשים", "Months")}">${MONTHS.map((x, i) => `<a href="${P(lang, monthUrl(x))}"${i === mi ? ' aria-current="page"' : ""}>${esc(he ? x.he : x.en)}</a>`).join("")}</nav>`;
  const winterGuide = exists("greece-in-winter-where-to-go-guide") && [10, 11, 0, 1, 2].includes(mi);
  const links = [
    [P(lang, "/weather-warnings/"), L("⚠️ אזהרות מזג אוויר ביוון היום", "⚠️ Greece weather warnings today")],
    [P(lang, "/holidays/"), L("🛍️ חגים ושעות פתיחה של חנויות", "🛍️ Holidays and shop hours")],
    ...(GLOBAL.flights ? [[P(lang, "/flights/"), L("✈️ טיסות זולות מתל אביב ליוון", "✈️ Cheap flights from Tel Aviv")]] : []),
    [P(lang, "/travel/"), L("🏝️ חופשה ביוון: כל היעדים", "🏝️ Holiday in Greece: all destinations")],
    ...(winterGuide ? [[P(lang, "/a/greece-in-winter-where-to-go-guide/"), L("❄️ יוון בחורף: לאן נוסעים", "❄️ Greece in winter: where to go")]] : []),
    [P(lang, "/strike-check/"), L("🚨 שביתה בזמן הטיול?", "🚨 Strike during my trip?")],
  ];
  const body = `${crumbs}<div class="page-h"><h1>${esc(title)}</h1><p>${esc(summary(lang, mi))}</p></div>
<div class="grid"><div class="col">
${monthsNav}
${sec("cl-table", L(`טמפרטורות, ים וגשם ${m.in}`, `Temperatures, sea and rain in ${m.en}`), table(lang, mi) + `<p class="small">${srcNote(lang)}</p>`)}
${sec("cl-sea", L(`ים ${m.in}: אפשר להתרחץ?`, `The sea in ${m.en}: can you swim?`), `<p>${esc(seaTxt)}</p>`)}
${sec("cl-open", L(`מה פתוח ומה קורה ${m.in}`, `What's open and on in ${m.en}`), `${seasHTML ? `<ul class="wx-tips">${seasHTML}</ul>` : ""}${holHTML.length ? `<h3>${L("חגים ואירועים", "Holidays and events")}</h3><ul class="wx-tips">${holHTML.join("")}</ul><p class="small">${L("חגים יווניים", "Greek holidays")}: <a href="${P(lang, "/holidays/")}">${L("לוח החגים המלא", "full calendar")}</a>${jew.length ? ` · ${L("חגים יהודיים", "Jewish holidays")}: ${[...new Set(jew.map((x) => x.src))].map((k) => `<a href="${SRC_J[k][0]}" target="_blank" rel="noopener">${esc(SRC_J[k][1])}</a>`).join(" · ")}` : ""}</p>` : `<p class="small">${L("אין חגים לאומיים ביוון בחודש הזה ברשימה שלנו.", "No Greek national holidays this month on our list.")} <a href="${P(lang, "/holidays/")}">${L("לוח החגים", "Holiday calendar")}</a></p>`}`)}
${sec("cl-pack", L(`מה לארוז ${m.in}`, `What to pack in ${m.en}`), `<ul class="wx-tips">${packing(lang, mi).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`)}
${wxAlertBox(lang)}
${sec("cl-links", L("לתכנון הטיול", "Plan your trip"), `<div class="links">${links.map(([u, t]) => `<a href="${u}">${esc(t)}<span aria-hidden="true">${L("←", "→")}</span></a>`).join("")}</div>`)}
${sec("cl-faq", L("שאלות נפוצות", "Common questions"), `<div class="faq">${faq.map(([q, an]) => `<details><summary>${esc(q)}</summary><p>${esc(an)}</p></details>`).join("")}</div>`)}
<p><a href="${P(lang, monthUrl(prev))}">${L("→ ", "← ")}${esc(L(`מזג אוויר ${prev.in}`, `Weather in ${prev.en}`))}</a> · <a href="${P(lang, "/weather/")}">${L("כל החודשים", "All months")}</a> · <a href="${P(lang, monthUrl(next))}">${esc(L(`מזג אוויר ${next.in}`, `Weather in ${next.en}`))}${L(" ←", " →")}</a></p>
${sec("cl-src", L("מקורות", "Sources"), `<ul class="wx-src"><li><a href="${SRC_CLIMATE[0]}" target="_blank" rel="noopener">${esc(SRC_CLIMATE[1])}</a></li>${[...new Set(seas.filter((s) => s.u).map((s) => s.u))].map((u) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(seas.find((s) => s.u === u).s)}</a></li>`).join("")}${evs.map((x) => `<li><a href="${x.u}" target="_blank" rel="noopener">${esc(x.s)}</a></li>`).join("")}${[...new Set(jew.map((x) => x.src))].map((k) => `<li><a href="${SRC_J[k][0]}" target="_blank" rel="noopener">${esc(SRC_J[k][1])}</a></li>`).join("")}</ul><p class="small">${L("המידע נבדק ב-4 באוקטובר 2026. מועדים ושעות פתיחה משתנים, אז בדקו לפני הנסיעה.", "Information checked on 4 October 2026. Dates and opening hours change, so check before you travel.")}</p>`)}
</div>__WIDGETS__</div>`;
  return { title, description, body, faq, name: he ? m.he : m.en };
}

export function climateIndexPage(lang) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const title = L("מזג אוויר ביוון לפי חודשים: מתי הכי כדאי לטוס?", "Greece weather by month: when is the best time to go?");
  const description = L("מזג האוויר ביוון בכל חודש: טמפרטורות, טמפרטורת הים וימי גשם באתונה, כרתים, רודוס, סלוניקי, מיקונוס וסנטוריני, לפי ממוצעים רב-שנתיים.",
    "Greece weather in every month: temperatures, sea temperature and rain days in Athens, Crete, Rhodes, Thessaloniki, Mykonos and Santorini, from long-term averages.");
  const a = D.athens;
  const th = he ? ["חודש", "אתונה", "הים באתונה", "ימי גשם", "כרתים", "רודוס"] : ["Month", "Athens", "Sea (Athens)", "Rain days", "Crete", "Rhodes"];
  const rows = MONTHS.map((m, i) => `<tr><td><a href="${P(lang, monthUrl(m))}">${esc(he ? m.he : m.en)}</a></td><td><span dir="ltr">${a.min[i]}–${a.max[i]}°</span></td><td><span dir="ltr">${a.sea[i]}°</span></td><td>${a.days[i]}</td><td><span dir="ltr">${D.heraklion.min[i]}–${D.heraklion.max[i]}°</span></td><td><span dir="ltr">${D.rhodes.min[i]}–${D.rhodes.max[i]}°</span></td></tr>`).join("");
  const seaOk = MONTHS.filter((m, i) => a.sea[i] >= 22).map((m) => (he ? m.he : m.en));
  const faq = he ? [
    ["מתי הים ביוון הכי חם?", `לפי הממוצעים, באוגוסט: באתונה ${a.sea[7]} מעלות, ברודוס ${D.rhodes.sea[7]}. הים באתונה ב-22 מעלות ומעלה בחודשים ${seaOk.join(", ")}.`],
    ["מה החודש הכי גשום ביוון?", `באתונה דצמבר, עם כ-${a.days[11]} ימי גשם בממוצע. ברודוס ובכרתים הכי הרבה גשם יורד בדצמבר ובינואר, ובקיץ כמעט לא יורד גשם.`],
    ["מה החודש הכי חם ביוון?", `יולי ואוגוסט: באתונה עד ${a.max[6]} מעלות בממוצע ביום. בגלי חום זה יכול להיות הרבה יותר.`],
  ] : [
    ["When is the sea warmest in Greece?", `On average in August: ${a.sea[7]}°C around Athens and ${D.rhodes.sea[7]}°C in Rhodes. Around Athens the sea is 22°C or more in ${seaOk.join(", ")}.`],
    ["What is the rainiest month in Greece?", `In Athens, December, with about ${a.days[11]} rain days on average. In Rhodes and Crete most rain falls in December and January, and summer is almost dry.`],
    ["What is the hottest month in Greece?", `July and August: Athens averages up to ${a.max[6]}°C by day. Heatwaves can push it much higher.`],
  ];
  const sec = (id, t, inner) => `<section aria-labelledby="${id}"><div class="zone-h"><h2 id="${id}">${t}</h2></div>${inner}</section>`;
  const body = `<p class="small"><a href="${P(lang, "/")}">${L("ראשי", "Home")}</a> › ${L("מזג אוויר ביוון", "Greece weather")}</p><div class="page-h"><h1>${esc(title)}</h1><p>${esc(L("בחרו חודש וראו מה מזג האוויר הממוצע, כמה חם הים, כמה ימי גשם יש, אילו חגים יש ומה לארוז.", "Pick a month to see the average weather, how warm the sea is, how many rain days to expect, which holidays fall then and what to pack."))}</p></div>
<div class="grid"><div class="col">
<nav class="chips" aria-label="${L("חודשים", "Months")}">${MONTHS.map((m) => `<a href="${P(lang, monthUrl(m))}">${esc(he ? m.he : m.en)}</a>`).join("")}</nav>
${sec("ci-table", L("ממוצעים לכל חודש", "Averages for every month"), `<div class="tablewrap"><table class="shtable clim"><thead><tr>${th.map((x) => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div><p class="small">${srcNote(lang)}</p>`)}
${sec("ci-links", L("עוד לפני הנסיעה", "Before you travel"), `<div class="links"><a href="${P(lang, "/weather-warnings/")}">${L("⚠️ אזהרות מזג אוויר ביוון היום", "⚠️ Greece weather warnings today")}<span aria-hidden="true">${L("←", "→")}</span></a><a href="${P(lang, "/holidays/")}">${L("🛍️ חגים ושעות פתיחה", "🛍️ Holidays and opening hours")}<span aria-hidden="true">${L("←", "→")}</span></a><a href="${P(lang, "/travel/")}">${L("🏝️ חופשה ביוון: כל היעדים", "🏝️ Holiday in Greece: all destinations")}<span aria-hidden="true">${L("←", "→")}</span></a></div>`)}
${sec("ci-faq", L("שאלות נפוצות", "Common questions"), `<div class="faq">${faq.map(([q, an]) => `<details><summary>${esc(q)}</summary><p>${esc(an)}</p></details>`).join("")}</div>`)}
</div>__WIDGETS__</div>`;
  return { title, description, body, faq };
}
