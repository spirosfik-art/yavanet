// /weather-warnings/<level>/ – Μόνιμες σελίδες ανά επίπεδο/φαινόμενο (π.χ. «אזהרה על גשם ברמה חמורה»).
// Χτίζονται σε κάθε build· το μπλοκ «τελευταίες προειδοποιήσεις» αλλάζει μόλις δημοσιευτεί νέο άρθρο καιρού.
// ΜΟΝΟ ελεγμένα στοιχεία (έρευνα 4 Οκτ. 2026):
//  - Χρώματα MeteoAlarm: Wikipedia «Meteoalarm» (ορισμοί πράσινο/κίτρινο/πορτοκαλί/κόκκινο)
//  - Αντιστοιχία χρώματος ↔ CAP severity (Yellow=Moderate, Orange=Severe, Red=Extreme): παρουσίαση R. Kaltenberger
//    (EMMA/Meteoalarm PM, EFAS 2022) + τεκμηρίωση βιβλιοθήκης meteoalarm (readthedocs) με τους ορισμούς Moderate/Severe/Extreme
//  - ΕΜΥ: «Έκτακτο δελτίο επικίνδυνων καιρικών φαινομένων» (newsbeast.gr, 30.9.2026)
//  - Οδηγίες: civilprotection.gov.gr (καταιγίδες, πλημμύρες) · 112: civilprotection.gov.gr/en/112 + FAQ PDF
//  - Σχολεία: απόφαση Περιφερειάρχη ή Δημάρχου, τηλεκπαίδευση (lifo.gr, 31.3.2026) · Χανιά 30.9.2026 (cretalive.gr)
//  - Πλοία: απαγορευτικό 3.10.2026 Πειραιάς/Ραφήνα/Λαύριο έως 9 μποφόρ (in.gr) · «συνήθως έως 8 μποφόρ», απόφαση πλοιάρχου με λιμεναρχείο (lifo.gr Μικροπράγματα)
import { esc, P } from "./templates.mjs";
import { wxItemHTML } from "./weather.mjs";

const H = (lang, he, en) => (lang === "he" ? he : en);
const ext = (u, t) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;

export const SRC = {
  colours: ["https://en.wikipedia.org/wiki/Meteoalarm", "Wikipedia – MeteoAlarm"],
  cap: ["https://european-flood.emergency.copernicus.eu/sites/default/files/AM/AM2022/5-1_EFAS-Annual-Meeting-2022_Kaltenberger_Hydro-Warnings-and-CAP,Meteoalarm.pdf", "EMMA/MeteoAlarm – Hydro warnings in CAP (2022)"],
  sev: ["https://meteoalarm.readthedocs.io/en/latest/warnings.html", "MeteoAlarm awareness levels (docs)"],
  map: ["https://meteoalarm.org/en/live/region/GR", "MeteoAlarm – Greece"],
  emy: ["https://www.emy.gr/en/warnings", "ΕΜΥ / HNMS – warnings"],
  bulletin: ["https://www.newsbeast.gr/greece/arthro/13390936/ektakto-deltio-epikindynon-kairikon-fainomenon-kokkini-proeidopoiisi-apo-tin-emy", "newsbeast.gr – ΕΜΥ έκτακτο δελτίο (30.9.2026)"],
  storms: ["https://civilprotection.gov.gr/en/odigies-prostasias/kataigides", "Civil Protection – storms"],
  floods: ["https://civilprotection.gov.gr/en/odigies-prostasias/plimmyres", "Civil Protection – floods"],
  c112: ["https://civilprotection.gov.gr/en/112/pote-pos-me-eidopoiei", "Civil Protection – 112: when & how I'm notified"],
  faq112: ["https://civilprotection.gov.gr/sites/default/files/2024-02/FAQ_112_%CE%B1%CE%B3%CE%B3%CE%BB%CE%B9%CE%BA%CF%8C_%CE%95%CE%9E%CE%95%CE%A1%CE%A7%CE%9F%CE%9C%CE%95%CE%9D%CE%9F_%CF%83%CE%BA%CE%AD%CE%BB%CE%BF%CF%82.pdf", "Civil Protection – 112 FAQ (PDF)"],
  schools: ["https://www.lifo.gr/now/greece/ypoyrgeio-paideias-tilekpaideysi-sta-sholeia-poy-tha-parameinoyn-kleista-logo-tis", "lifo.gr – schools closed for bad weather (31.3.2026)"],
  chania: ["https://www.cretalive.gr/kriti/hania-i-anakoinosi-toy-dimoy-gia-ta-kleista-sholeia", "cretalive.gr – Chania schools (30.9.2026)"],
  ferryBan: ["https://www.in.gr/2026/10/03/greece/apagoreytiko-apoplou-se-peiraia-rafina-kai-layrio-logo-9-mpofor/", "in.gr – sailing ban, Piraeus/Rafina/Lavrio (3.10.2026)"],
  beaufort: ["https://mikropragmata.lifo.gr/zoi/mechri-posa-mpofor-epitrepetai-na/", "lifo.gr – how many Beaufort ferries sail in"],
  flights: ["https://www.in.gr/2026/10/02/greece/provlimata-me-tis-ptiseis-stin-kriti-logo-tis-kakokairias/", "in.gr – flight problems in Crete (2.10.2026)"],
};

// Επίπεδα MeteoAlarm: χρώμα ↔ CAP severity ↔ εβραϊκή απόδοση (בינונית / חמורה / קיצונית)
const LV = {
  yellow: { cls: "lv-yellow", he: "צהוב", heF: "צהובה", en: "Yellow", sev: "Moderate", sevHe: "בינונית",
    defHe: "מזג אוויר שעלול להיות מסוכן, אבל כנראה לא קיצוני. התופעות הצפויות אינן חריגות, אבל צריך לשים לב אם מתכננים פעילות שתלויה במזג האוויר.",
    defEn: "Potentially dangerous weather, but unlikely to be extreme. The forecast phenomena are not unusual, but be attentive if you plan activities exposed to the weather." },
  orange: { cls: "lv-orange", he: "כתום", heF: "כתומה", en: "Orange", sev: "Severe", sevHe: "חמורה",
    defHe: "מזג אוויר חמור ומסוכן. צפויות תופעות לא רגילות, שעלולות לגרום לנזקים, לתאונות ולנפגעים.",
    defEn: "Severe, dangerous weather. Unusual phenomena are forecast that may cause damage, accidents and casualties." },
  red: { cls: "lv-red", he: "אדום", heF: "אדומה", en: "Red", sev: "Extreme", sevHe: "קיצונית",
    defHe: "מזג אוויר קיצוני ומסוכן מאוד. צפויות תופעות בעוצמה חריגה, עם נזקים ותאונות בשטח נרחב, ובמקרים רבים סכנת חיים.",
    defEn: "Extremely severe, very dangerous weather. Exceptionally intense phenomena are forecast, with major damage and accidents over a wide area, in many cases with a threat to life." },
};

// Ανίχνευση σχετικών άρθρων (τίτλοι, slug, λέξεις-κλειδιά)
const RE_RAIN = /rain|flood|downpour|גשם|גשמים|הצפ|שיטפו|מבול/i;
const RE_THUNDER = /thunder|lightning|hail|רעמים|ברקים|ברד/i;
const hay = (a) => [a.slug.replace(/-/g, " "), a.en.title, a.he.title, ...(a.en.keywords || []), ...(a.he.keywords || []), ...(a.tags || [])].join(" ");

export const WX_LEVEL_PAGES = [
  { id: "severe-rain", type: "rain", level: "orange", icon: "🌧️",
    he: { name: "אזהרה על גשם ברמה חמורה", short: "גשם ברמה חמורה (כתום)" }, en: { name: "Severe rain warning", short: "Severe rain (orange)" } },
  { id: "moderate-rain", type: "rain", level: "yellow", icon: "🌦️",
    he: { name: "אזהרה על גשם ברמה בינונית", short: "גשם ברמה בינונית (צהוב)" }, en: { name: "Moderate rain warning", short: "Moderate rain (yellow)" } },
  { id: "severe-thunderstorm", type: "thunder", level: "orange", icon: "⛈️",
    he: { name: "אזהרה חמורה על סופת רעמים", short: "סופת רעמים ברמה חמורה (כתום)" }, en: { name: "Severe thunderstorm warning", short: "Severe thunderstorm (orange)" } },
  { id: "moderate-thunderstorm", type: "thunder", level: "yellow", icon: "🌩️",
    he: { name: "אזהרה על סופת רעמים ברמה בינונית", short: "סופת רעמים ברמה בינונית (צהוב)" }, en: { name: "Moderate thunderstorm warning", short: "Moderate thunderstorm (yellow)" } },
  { id: "yellow", type: null, level: "yellow", icon: "🟡",
    he: { name: "אזהרה צהובה ביוון", short: "אזהרה צהובה" }, en: { name: "Yellow weather warning in Greece", short: "Yellow warning" } },
  { id: "orange", type: null, level: "orange", icon: "🟠",
    he: { name: "אזהרה כתומה ביוון", short: "אזהרה כתומה" }, en: { name: "Orange weather warning in Greece", short: "Orange warning" } },
  { id: "red", type: null, level: "red", icon: "🔴",
    he: { name: "אזהרה אדומה ביוון", short: "אזהרה אדומה" }, en: { name: "Red weather warning in Greece", short: "Red warning" } },
];
export const wxLevelUrl = (id) => `/weather-warnings/${id}/`;

// Ποια σελίδα επιπέδου ταιριάζει σε ένα άρθρο καιρού (για σύνδεσμο μέσα στο άρθρο)
export function wxLevelFor(a) {
  const w = a.wx;
  if (!w || !w.level) return [];
  const out = [];
  if (w.level !== "red") {
    const t = w.type.id === "thunder" ? "thunder" : w.type.id === "rain" ? "rain" : null;
    const combo = t && WX_LEVEL_PAGES.find((p) => p.type === t && p.level === w.level);
    if (combo) out.push(combo);
  }
  out.push(WX_LEVEL_PAGES.find((p) => !p.type && p.level === w.level));
  return out;
}
export function wxArticleBox(a, lang) {
  const pg = wxLevelFor(a);
  if (!pg.length) return "";
  const p = pg[0], lv = LV[p.level];
  const sub = H(lang, `מה אומרת אזהרה ${lv.heF} (${lv.sev}), מה עושים, ומה קורה עם מעבורות, טיסות ובתי ספר`, `What a ${lv.en.toLowerCase()} (${lv.sev}) warning means, what to do, and what happens to ferries, flights and schools`);
  return `<a class="fteaser" href="${P(lang, wxLevelUrl(p.id))}"><span class="ft-ic" aria-hidden="true">${p.icon}</span><span class="ft-t"><b>${esc(p[lang].name)}: ${H(lang, "מה זה אומר?", "what does it mean?")}</b><small>${esc(sub)}</small></span><span class="ft-go">${H(lang, "להסבר ←", "Read →")}</span></a>`;
}

// Σύνδεσμοι για το hub
export function wxLevelLinks(lang) {
  return `<div class="links">${WX_LEVEL_PAGES.map((p) => `<a href="${P(lang, wxLevelUrl(p.id))}">${p.icon} ${esc(p[lang].name)} <small>${esc(H(lang, `${LV[p.level].he} · ${LV[p.level].sev}`, `${LV[p.level].en} · ${LV[p.level].sev}`))}</small><span aria-hidden="true">${H(lang, "←", "→")}</span></a>`).join("")}</div>`;
}

function related(p, wxArts) {
  const pick = p.type === "rain" ? wxArts.filter((a) => a.wx.type.id === "rain" || RE_RAIN.test(hay(a)))
    : p.type === "thunder" ? wxArts.filter((a) => a.wx.type.id === "thunder" || RE_THUNDER.test(hay(a)))
    : wxArts.filter((a) => a.wx.level === p.level);
  // Το νεότερο πρώτο (η σελίδα αλλάζει με κάθε νέο άρθρο)
  const ts = (a) => new Date(a.updatedAt || a.publishedAt).getTime();
  return pick.sort((x, y) => ts(y) - ts(x)).slice(0, 8);
}

export function wxLevelPage(lang, p, ctx) {
  const { wxArts, NOW, exists } = ctx;
  const he = lang === "he", lv = LV[p.level];
  const L = (a, b) => (he ? a : b);
  const isRain = p.type === "rain", isThunder = p.type === "thunder", isColour = !p.type;
  const phHe = isRain ? "גשם" : isThunder ? "סופת רעמים" : "", phEn = isRain ? "rain" : isThunder ? "thunderstorm" : "";
  const A = (slug) => P(lang, "/a/" + slug + "/");

  /* ---- Τίτλοι ---- */
  const title = isColour
    ? L(`${p.he.name}: מה זה אומר ומה עושים`, `${p.en.name}: what it means and what to do`)
    : L(`${p.he.name} ביוון: מה זה אומר ומה עושים`, `${p.en.name} in Greece: what it means`);
  const description = isColour
    ? L(`מה זו אזהרה ${lv.heF} (${lv.sev}) של שירות המטאורולוגיה היווני ו-MeteoAlarm, מה עושים בגשם, סערה או רוח, מה קורה למעבורות, לטיסות ולבתי הספר, והאזהרות האחרונות.`,
        `What a ${lv.en.toLowerCase()} (${lv.sev}) weather warning from Greece's met service and MeteoAlarm means, what to do, what happens to ferries, flights and schools, plus the latest warnings.`)
    : L(`${p.he.name} ביוון היא אזהרה ${lv.heF} (${lv.sev}). מה זה אומר, מה עושים, מה קורה למעבורות ולטיסות, הודעות 112 והאזהרות האחרונות על ${phHe}.`,
        `A ${p.en.name.toLowerCase()} in Greece is a ${lv.en.toLowerCase()} (${lv.sev}) warning. What it means, what to do, ferries, flights, 112 alerts and the latest ${phEn} warnings.`);

  /* ---- Τι σημαίνει ---- */
  const meaning = `<div class="wx-status${p.level === "yellow" ? "" : " on"}"><b>${p.icon} ${esc(isColour ? L(`אזהרה ${lv.heF} = רמה ${lv.sevHe} (${lv.sev})`, `${lv.en} warning = ${lv.sev} level`) : L(`${p.he.name} = אזהרה ${lv.heF}`, `${p.en.name} = ${lv.en.toLowerCase()} warning`))}</b><span>${esc(he ? lv.defHe : lv.defEn)}</span></div>
<p>${he
    ? `ביוון, את האזהרות מפרסם השירות המטאורולוגי הלאומי (<bdi dir="ltr">ΕΜΥ / HNMS</bdi>), דרך מערכת האזהרות האירופית <bdi dir="ltr">MeteoAlarm</bdi>. לכל אזהרה יש צבע (צהוב, כתום או אדום) ודרגת חומרה באנגלית: <bdi dir="ltr">Moderate</bdi> לצהוב, <bdi dir="ltr">Severe</bdi> לכתום ו-<bdi dir="ltr">Extreme</bdi> לאדום. כשהאזהרה מתורגמת לעברית, <bdi dir="ltr">Moderate</bdi> הופכת ל״ברמה בינונית״, <bdi dir="ltr">Severe</bdi> ל״ברמה חמורה״ ו-<bdi dir="ltr">Extreme</bdi> ל״ברמה קיצונית״.${isColour ? "" : ` לכן ״${esc(p.he.name)}״ היא בעצם אזהרה <b>${lv.heF}</b> על ${phHe}.`}`
    : `In Greece, warnings are issued by the Hellenic National Meteorological Service (EMY / HNMS) through the European MeteoAlarm system. Each warning has a colour (yellow, orange or red) and a severity: <b>Moderate</b> for yellow, <b>Severe</b> for orange and <b>Extreme</b> for red.${isColour ? "" : ` So a “${esc(p.en.name.toLowerCase())}” is an <b>${lv.en.toLowerCase()}</b> ${phEn} warning.`}`}</p>
${p.level !== "yellow" ? `<p>${he
    ? `באזהרות כתומות ואדומות <bdi dir="ltr">ΕΜΥ</bdi> מוציא בדרך כלל גם ״עלון חירום על תופעות מזג אוויר מסוכנות״ (<bdi dir="ltr" lang="el">Έκτακτο Δελτίο Επικίνδυνων Καιρικών Φαινομένων</bdi>), שמפרט אזורים, שעות ועוצמות. למשל, בעלון מ-30 בספטמבר 2026 הוכרזה אזהרה אדומה בכרתים, עם גשמים חזקים, סופות רעמים ורוחות של 8 עד 9 בופור בים האגאי.`
    : `For orange and red warnings EMY usually also issues an “emergency bulletin of dangerous weather phenomena” (<span lang="el">Έκτακτο Δελτίο Επικίνδυνων Καιρικών Φαινομένων</span>) listing areas, times and intensities. For example, the bulletin of 30 September 2026 put Crete on red, with heavy rain, thunderstorms and 8–9 Beaufort winds over the Aegean.`}</p>` : ""}`;

  /* ---- Οι τρεις βαθμίδες ---- */
  const scale = `<ul class="wx-levels">${["yellow", "orange", "red"].map((k) => `<li class="${LV[k].cls}"><b>${esc(he ? LV[k].he : LV[k].en)}</b><span><strong>${esc(he ? `רמה ${LV[k].sevHe}` : LV[k].sev)}</strong>${he ? ` (<bdi dir="ltr">${LV[k].sev}</bdi>)` : ""}: ${esc(he ? LV[k].defHe : LV[k].defEn)}${k === p.level ? ` ⬅️ ${L("העמוד הזה", "this page")}` : ""}</span></li>`).join("")}</ul>`;

  /* ---- Τι κάνουμε ---- */
  const rainTips = he ? [
    "אל תחצו נחלים או דרכים מוצפות, לא ברגל ולא ברכב.",
    "הימנעו ממרתפים וממקומות תת-קרקעיים, ועלו למקום גבוה ובטוח.",
    "אם הרכב נתקע במים, צאו ממנו: המים עלולים לסחוף אותו.",
    "התרחקו מכבלי חשמל.",
    "צמצמו נסיעות ככל האפשר בזמן האזהרה.",
    "אחרי ההצפה: התרחקו מאזורים מוצפים. המים עלולים להיות מזוהמים, והסכנה לא נגמרת כשהמים יורדים.",
  ] : [
    "Do not cross torrents or flooded roads, on foot or by car.",
    "Avoid basements and underground places, and move to higher, safe ground.",
    "If your car gets stuck in water, leave it: it may be swept away.",
    "Stay away from power lines.",
    "Limit travel as much as possible during the warning.",
    "After a flood: stay away from flooded areas. The water may be polluted, and the danger does not end when the water recedes.",
  ];
  const thunderTips = he ? [
    "בחוץ: חפשו מחסה בבניין או ברכב. אם אין, שבו על הקרקע (בלי לשכב).",
    "לעולם אל תעמדו מתחת לעץ גבוה בשטח פתוח.",
    "התרחקו מנהרות, מאגמים ומהים.",
    "בבית: קבעו או הכניסו פנימה חפצים שהרוח והגשם יכולים לסחוף, והימנעו מלגעת בצנרת המים (מטבח, אמבטיה).",
    "ברכב: עצרו רחוק מעצים שעלולים ליפול, הישארו ברכב עם אורות חירום עד שהסופה עוברת, והימנעו מכבישים מוצפים.",
    "בברד: היכנסו מיד למחסה והישארו שם עד שהמצב משתפר.",
  ] : [
    "Outdoors: shelter in a building or a car. If you can't, sit on the ground (don't lie down).",
    "Never stand under a tall tree in an open space.",
    "Stay away from rivers, lakes and the sea.",
    "Indoors: secure anything the wind or heavy rain can carry, and avoid touching water pipes (kitchen, bathroom).",
    "In a car: park away from trees that could fall, stay inside with hazard lights on until the storm passes, and avoid flooded roads.",
    "In hail: take shelter immediately and stay there until conditions improve.",
  ];
  const tipsList = isRain ? rainTips : isThunder ? thunderTips : [...thunderTips.slice(0, 2), ...rainTips.slice(0, 3)];
  const tipsSrc = isRain ? [SRC.floods] : isThunder ? [SRC.storms] : [SRC.storms, SRC.floods];
  const tipsH = isRain ? L("מה עושים בזמן אזהרת גשם והצפות", "What to do during a rain and flood warning")
    : isThunder ? L("מה עושים בזמן סופת רעמים", "What to do in a thunderstorm")
    : L("מה עושים בזמן אזהרה", "What to do during a warning");
  const levelNote = p.level === "yellow"
    ? L("באזהרה צהובה בדרך כלל אפשר להמשיך כרגיל, אבל כדאי לבדוק את התחזית לפני טיול, שייט או נהיגה בהרים, ולהיות מוכנים לשינוי בתוכניות.", "With a yellow warning you can usually carry on as normal, but check the forecast before a hike, a boat trip or a mountain drive, and be ready to change plans.")
    : p.level === "orange"
    ? L("באזהרה כתומה כדאי לדחות טיולים, שייט ונסיעות לא חיוניות באזור האזהרה, להתעדכן בתחזית ולהישמע להנחיות הרשויות.", "With an orange warning, postpone hikes, boat trips and non-essential travel in the warning area, keep up with the forecast and follow the authorities' advice.")
    : L("באזהרה אדומה הקפידו מאוד על הוראות הרשויות. אם קיבלתם הודעת 112, פעלו מיד לפי מה שכתוב בה (למשל להגביל תנועה או להתפנות).", "With a red warning, follow the authorities' instructions closely. If you receive a 112 message, act on it immediately (for example, limit travel or evacuate).");

  /* ---- Ταξιδιώτες ---- */
  const ex = (slug, he_, en_) => (exists(slug) ? ` <a href="${A(slug)}">${L(he_, en_)}</a>` : "");
  const travel = `<div class="wx-tr">
<h3>⛴️ ${L("מעבורות", "Ferries")}</h3><p>${he
    ? `ברוחות חזקות משמר החופים ורשויות הנמל יכולים להוציא איסור הפלגה (<bdi dir="ltr" lang="el">απαγορευτικό απόπλου</bdi>), והמעבורות נשארות בנמל. אוניות נוסעים מפליגות בדרך כלל עד כ-8 בופור, וההחלטה הסופית היא של הקברניט יחד עם רשות הנמל המקומית. למשל, ב-3 באוקטובר 2026 הוטל איסור הפלגה בפיראוס, ברפינה ובלאבריו ברוחות של עד 9 בופור: האוניות הרגילות הפליגו, אבל הספינות המהירות (הידרופויל) נשארו בנמל. לפני שיוצאים לנמל, בדקו מול חברת המעבורות או סוכן הנסיעות.`
    : `In strong winds the Coast Guard and port authorities can issue a sailing ban (<span lang="el">απαγορευτικό απόπλου</span>) and ferries stay in port. Passenger ships usually sail up to about 8 Beaufort, and the final decision lies with the captain together with the local port authority. For example, on 3 October 2026 a sailing ban was imposed at Piraeus, Rafina and Lavrio in winds of up to 9 Beaufort: conventional ships sailed, but hydrofoils stayed in port. Before heading to the port, check with the ferry company or your travel agent.`} ${L("וגם:", "Also:")} <a href="${P(lang, "/strike-today/")}">${L("יש שביתה היום?", "Strike today?")}</a></p>
<h3>✈️ ${L("טיסות", "Flights")}</h3><p>${L("מזג אוויר חמור יכול לגרום לעיכובים ולשיבושים בטיסות, כמו שקרה בכרתים ב-2 באוקטובר 2026. בדקו את סטטוס הטיסה מול חברת התעופה לפני שיוצאים לשדה, והשאירו מרווח לפני טיסה הביתה.", "Severe weather can cause flight delays and disruption, as happened in Crete on 2 October 2026. Check your flight status with the airline before leaving for the airport, and leave a buffer before your flight home.")}</p>
<h3>🏫 ${L("בתי ספר", "Schools")}</h3><p>${L("ביוון, את ההחלטה לסגור בתי ספר בגלל מזג אוויר מקבלים מושל המחוז (Περιφερειάρχης) או ראש העירייה. לפי משרד החינוך, כשבתי הספר סגורים הלימודים ממשיכים בלמידה מרחוק, כשזה אפשרי. כך למשל עיריית חאניה סגרה את בתי הספר ב-30 בספטמבר 2026 לקראת הסערה.", "In Greece, the decision to close schools because of the weather is taken by the regional governor (Περιφερειάρχης) or the mayor. According to the Education Ministry, when schools close, lessons continue online where possible. For example, the municipality of Chania closed its schools on 30 September 2026 ahead of the storm.")}</p>
<h3>📱 ${L("הודעות 112 לטלפון", "112 alerts on your phone")}</h3><p>${L("כשצפוי אירוע מסוכן, ההגנה האזרחית שולחת הודעת 112. היא מופיעה על המסך עם צליל אזעקה מיוחד (Cell Broadcast), ויכולה להגיע גם כ-SMS שהשולח שלו הוא 112. ההודעות חינמיות. בטלפונים שנמכרו ביוון מדצמבר 2019 הקבלה מופעלת אוטומטית. אם קיבלתם הודעה, פעלו לפי ההוראות שבה. במצב חירום חייגו 112.", "When a dangerous event is expected, Civil Protection sends a 112 alert. It appears on your screen with a distinctive alarm sound (Cell Broadcast), and can also arrive as an SMS from sender 112. Alerts are free. Phones sold in Greece since December 2019 receive them automatically. If you get one, follow its instructions. In an emergency call 112.")}</p>
</div>`;

  /* ---- Τελευταίες προειδοποιήσεις (αυτόματα) ---- */
  const rel = related(p, wxArts);
  const relH = isRain ? L("האזהרות האחרונות על גשם והצפות ביוון", "Latest rain and flood warnings in Greece")
    : isThunder ? L("האזהרות האחרונות על סופות רעמים ביוון", "Latest thunderstorm warnings in Greece")
    : L(`האזהרות ה${lv.he === "צהוב" ? "צהובות" : lv.he === "כתום" ? "כתומות" : "אדומות"} האחרונות ביוון`, `Latest ${lv.en.toLowerCase()} warnings in Greece`);
  const ts = (a) => new Date(a.updatedAt || a.publishedAt).getTime();
  const list = (xs) => `<div class="wxlist">${xs.map((a) => wxItemHTML(lang, a, NOW, NOW - ts(a) > 7 * 864e5)).join("")}</div>`;
  const latest = rel.length ? list(rel)
    : `<div class="empty-note">${L(`לא פרסמנו לאחרונה אזהרות ${lv.he === "צהוב" ? "צהובות" : lv.he === "כתום" ? "כתומות" : "אדומות"}: ביוונט אנחנו מפרסמים בעיקר אזהרות כתומות ואדומות. הנה אזהרות מזג האוויר האחרונות שפרסמנו:`, `No recent ${lv.en.toLowerCase()} warnings: on Yavanet we mainly publish orange and red warnings. Here are the latest weather warnings we have published:`)}</div>${wxArts.length ? list(wxArts.slice(0, 5)) : ""}`;

  /* ---- Παραδείγματα ---- */
  const examples = isRain
    ? `${ex("orange-rain-warning-crete", "אזהרת גשם כתומה בכרתים (ספטמבר 2026)", "Orange rain warning for Crete (September 2026)")}${ex("red-code-crete-severe-weather-storm", " · כרתים באדום: הצפות והודעות 112", " · Crete on red: floods and 112 alerts")}`
    : isThunder ? `${ex("orange-thunderstorm-warning-dodecanese", "אזהרה כתומה על סופות רעמים באיים הדודקאנסיים (אוקטובר 2026)", "Orange thunderstorm warning for the Dodecanese (October 2026)")}`
    : p.level === "red" ? `${ex("red-code-crete-severe-weather-storm", "כרתים באדום: הצפות והודעות 112 (אוקטובר 2026)", "Crete on red: floods and 112 alerts (October 2026)")}` : "";

  /* ---- Άλλες σελίδες επιπέδων ---- */
  const others = WX_LEVEL_PAGES.filter((x) => x.id !== p.id);
  const otherLinks = `<nav class="chips" aria-label="${L("סוגי אזהרות", "Warning types")}">${others.map((x) => `<a href="${P(lang, wxLevelUrl(x.id))}">${x.icon} ${esc(x[lang].short)}</a>`).join("")}</nav>`;

  /* ---- FAQ ---- */
  const faq = isColour ? (he ? [
    [`מה זו אזהרה ${lv.heF} ביוון?`, `אזהרה ${lv.heF} היא ${p.level === "yellow" ? "הרמה הנמוכה" : p.level === "orange" ? "הרמה האמצעית" : "הרמה הגבוהה ביותר"} מבין שלוש רמות האזהרה של MeteoAlarm, שאותן מפרסם ביוון השירות המטאורולוגי הלאומי (ΕΜΥ). דרגת החומרה שלה היא ${lv.sev} (${lv.sevHe}). ${lv.defHe}`],
    [`מה עושים בזמן אזהרה ${lv.heF}?`, `${levelNote} אל תחצו דרכים מוצפות, ובסופת רעמים חפשו מחסה בבניין או ברכב.`],
    [`מה ההבדל בין אזהרה צהובה, כתומה ואדומה?`, `צהוב (Moderate, בינונית): ${LV.yellow.defHe} כתום (Severe, חמורה): ${LV.orange.defHe} אדום (Extreme, קיצונית): ${LV.red.defHe}`],
    [`האם המעבורות מפליגות בזמן אזהרה ${lv.heF}?`, "זה תלוי ברוח ולא בצבע: ברוחות חזקות משמר החופים יכול להוציא איסור הפלגה. אוניות נוסעים מפליגות בדרך כלל עד כ-8 בופור, וההחלטה הסופית היא של הקברניט ורשות הנמל. בדקו מול חברת המעבורות לפני שיוצאים לנמל."],
    ["איפה רואים את האזהרות הרשמיות?", "באתר של ΕΜΥ (emy.gr) ובמפה של MeteoAlarm (meteoalarm.org). ביוונט כל האזהרות שפרסמנו מרוכזות בעמוד אזהרות מזג האוויר, לפי אזור ושעה."],
  ] : [
    [`What is a ${lv.en.toLowerCase()} weather warning in Greece?`, `A ${lv.en.toLowerCase()} warning is ${p.level === "yellow" ? "the lowest" : p.level === "orange" ? "the middle" : "the highest"} of MeteoAlarm's three warning levels, issued in Greece by the national meteorological service (EMY). Its severity is ${lv.sev}. ${lv.defEn}`],
    [`What should I do during a ${lv.en.toLowerCase()} warning?`, `${levelNote} Do not cross flooded roads, and in a thunderstorm shelter in a building or a car.`],
    ["What is the difference between yellow, orange and red warnings?", `Yellow (Moderate): ${LV.yellow.defEn} Orange (Severe): ${LV.orange.defEn} Red (Extreme): ${LV.red.defEn}`],
    [`Do ferries sail during a ${lv.en.toLowerCase()} warning?`, "It depends on the wind, not the colour: in strong winds the Coast Guard can issue a sailing ban. Passenger ships usually sail up to about 8 Beaufort, and the final decision lies with the captain and the port authority. Check with the ferry company before going to the port."],
    ["Where can I see the official warnings?", "On the EMY website (emy.gr) and the MeteoAlarm map (meteoalarm.org). On Yavanet, every warning we have published is on the weather warnings page, by area and time."],
  ]) : (he ? [
    [`מה זה ${p.he.name}?`, `זו אזהרה ${lv.heF} על ${phHe} של השירות המטאורולוגי היווני (ΕΜΥ) ו-MeteoAlarm. דרגת החומרה ${lv.sev}, ובעברית ״${lv.sevHe}״. ${lv.defHe}`],
    [`מה עושים בזמן ${p.he.name}?`, `${levelNote} ${tipsList.slice(0, 3).join(" ")}`],
    [isRain ? "האם צריך לבטל טיול בגלל אזהרת גשם ביוון?" : "האם צריך לבטל טיול בגלל סופת רעמים ביוון?", p.level === "yellow" ? "בדרך כלל לא. אזהרה צהובה פירושה מזג אוויר שעלול להיות מסוכן אבל לא חריג. בדקו את התחזית לפני טיולים בטבע, שייט או נהיגה בהרים." : "לא בהכרח, אבל כדאי לדחות טיולים בטבע, שייט ונסיעות לא חיוניות באזור האזהרה, לבדוק מעבורות וטיסות מול החברות, ולהישמע להנחיות הרשויות."],
    [isRain ? "האם המעבורות והטיסות פועלות בזמן אזהרת גשם?" : "האם המעבורות והטיסות פועלות בזמן סופת רעמים?", "לרוב כן, אבל ייתכנו עיכובים וביטולים. איסור הפלגה תלוי בעיקר ברוח: אוניות נוסעים מפליגות בדרך כלל עד כ-8 בופור. בדקו מול חברת המעבורות וחברת התעופה לפני שיוצאים."],
    ["איך יודעים אם יש אזהרה עכשיו?", "באתר של ΕΜΥ (emy.gr) ובמפה של MeteoAlarm (meteoalarm.org). אם המצב מסוכן, ההגנה האזרחית שולחת גם הודעת 112 לטלפון. ביוונט אנחנו מפרסמים את האזהרות הכתומות והאדומות בעברית."],
  ] : [
    [`What is a ${p.en.name.toLowerCase()} in Greece?`, `It is a ${lv.en.toLowerCase()} ${phEn} warning from Greece's meteorological service (EMY) and MeteoAlarm, with severity ${lv.sev}. ${lv.defEn}`],
    [`What should I do during a ${p.en.name.toLowerCase()}?`, `${levelNote} ${tipsList.slice(0, 3).join(" ")}`],
    [isRain ? "Should I cancel my trip because of a rain warning in Greece?" : "Should I cancel my trip because of a thunderstorm warning in Greece?", p.level === "yellow" ? "Usually not. A yellow warning means potentially dangerous but not unusual weather. Check the forecast before hikes, boat trips or mountain drives." : "Not necessarily, but postpone hikes, boat trips and non-essential travel in the warning area, check ferries and flights with the companies, and follow the authorities' advice."],
    [isRain ? "Do ferries and flights run during a rain warning?" : "Do ferries and flights run during a thunderstorm warning?", "Mostly yes, but delays and cancellations are possible. Sailing bans depend mainly on the wind: passenger ships usually sail up to about 8 Beaufort. Check with the ferry company and the airline before you go."],
    ["How do I know if there is a warning right now?", "On the EMY website (emy.gr) and the MeteoAlarm map (meteoalarm.org). If the situation is dangerous, Civil Protection also sends a 112 alert to phones. On Yavanet we publish orange and red warnings in Hebrew."],
  ]);

  /* ---- Πηγές ---- */
  const srcs = [SRC.emy, SRC.map, SRC.colours, SRC.cap, SRC.sev, ...(p.level !== "yellow" ? [SRC.bulletin] : []), ...tipsSrc, SRC.c112, SRC.faq112, SRC.ferryBan, SRC.beaufort, SRC.flights, SRC.schools, SRC.chania];
  const sources = `<ul class="wx-src">${srcs.map(([u, t]) => `<li>${ext(u, esc(t))}</li>`).join("")}</ul><p class="small">${L("המידע נבדק ב-4 באוקטובר 2026. אזהרה יכולה להתעדכן או להסתיים בכל רגע: המצב העדכני תמיד באתר של ΕΜΥ ובמפה של MeteoAlarm.", "Information checked on 4 October 2026. A warning can be updated or lifted at any moment: the current status is always on the EMY website and the MeteoAlarm map.")}</p>`;

  const sec = (id, t, inner) => `<section aria-labelledby="${id}"><div class="zone-h"><h2 id="${id}">${t}</h2></div>${inner}</section>`;
  const crumbs = `<p class="small"><a href="${P(lang, "/")}">${L("ראשי", "Home")}</a> › <a href="${P(lang, "/weather-warnings/")}">${L("אזהרות מזג אוויר", "Weather warnings")}</a> › ${esc(p[lang].short)}</p>`;
  const h1 = isColour ? title : L(`${p.he.name}: מה זה אומר ומה עושים`, `${p.en.name} in Greece: what it means and what to do`);
  const lead = isColour
    ? L(`הסבר פשוט על אזהרה ${lv.heF} ביוון: מה היא אומרת, מה עושים, ומה קורה עם מעבורות, טיסות ובתי ספר. למטה: האזהרות ה${lv.he === "צהוב" ? "צהובות" : lv.he === "כתום" ? "כתומות" : "אדומות"} האחרונות שפרסמנו, שמתעדכנות אוטומטית.`, `A plain explanation of a ${lv.en.toLowerCase()} warning in Greece: what it means, what to do, and what happens to ferries, flights and schools. Below: the latest ${lv.en.toLowerCase()} warnings we have published, updated automatically.`)
    : L(`קיבלתם ${p.he.name}? הנה מה זה אומר ביוון, מה עושים, ומה קורה עם מעבורות, טיסות ובתי ספר. למטה: האזהרות האחרונות על ${phHe}, שמתעדכנות אוטומטית.`, `Got a ${p.en.name.toLowerCase()} for Greece? Here is what it means, what to do, and what happens to ferries, flights and schools. Below: the latest ${phEn} warnings, updated automatically.`);
  const body = `${crumbs}<div class="page-h"><h1>${esc(h1)}</h1><p>${esc(lead)}</p></div>
<div class="grid"><div class="col">
${meaning}
${sec("wl-latest", relH, latest + `<p><a href="${P(lang, "/weather-warnings/")}">${L("כל אזהרות מזג האוויר ביוון, לפי אזור ושעה ←", "All Greece weather warnings, by area and time →")}</a></p>`)}
${sec("wl-scale", L("צהוב, כתום, אדום: שלוש רמות האזהרה", "Yellow, orange, red: the three warning levels"), scale)}
${sec("wl-do", tipsH, `<section class="means"><p>${esc(levelNote)}</p></section><ul class="wx-tips">${tipsList.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="small">${L("לפי ההנחיות של משרד ההגנה האזרחית של יוון:", "Based on the Greek Civil Protection guidance:")} ${tipsSrc.map(([u]) => ext(u, u.includes("plimmyres") ? L("הצפות", "Floods") : L("סופות", "Storms"))).join(" · ")}</p>`)}
${sec("wl-travel", L("מה זה אומר למטיילים ולתושבים", "What it means for travellers and residents"), travel)}
${examples ? `<p class="small">📰 ${L("לדוגמה:", "Example:")}${examples}</p>` : ""}
${sec("wl-more", L("סוגי אזהרות נוספים", "Other warning types"), otherLinks + `<p><a href="${P(lang, "/weather/")}">${L("מזג האוויר ביוון לפי חודשים ←", "Greece weather month by month →")}</a> · <a href="${P(lang, "/emergency/")}">${L("מספרי חירום ביוון", "Emergency numbers in Greece")}</a></p>`)}
${sec("wl-faq", L("שאלות נפוצות", "Common questions"), `<div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`)}
${sec("wl-src", L("מקורות", "Sources"), sources)}
</div>__WIDGETS__</div>`;
  return { title, description, body, faq, name: p[lang].short };
}
