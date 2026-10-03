// /weather-warnings/ – Προειδοποιήσεις καιρού στην Ελλάδα: χτίζεται σε κάθε build από τα άρθρα μας (Meteoalarm/ΕΜΥ, κακοκαιρία).
// Το επεξηγηματικό κείμενο: ΜΟΝΟ ελεγμένα στοιχεία (Οκτ. 2026):
//  - Χρώματα: ορισμοί MeteoAlarm (μέσω της σελίδας του FMI για το MeteoAlarm) · η ΕΜΥ διαχειρίζεται το MeteoAlarm για την Ελλάδα (news247, συνέντευξη ΕΜΥ)
//  - Οδηγίες: civilprotection.gov.gr/en/odigies-prostasias/kataigides και /plimmyres
//  - 112 στα ελληνικά και αγγλικά: όπως στη σελίδα /emergency/ (content/emergency.mjs)
import { esc, P, pushBox } from "./templates.mjs";
import { wxLevelLinks } from "./wxlevels.mjs";

const H = (lang, he, en) => (lang === "he" ? he : en);
const A = (lang, slug) => P(lang, "/a/" + slug + "/");

/* ---------- Ανίχνευση άρθρων καιρού ---------- */
const WX_RE = /\b(weather|rain|rainfall|rainstorms?|storms?|thunderstorms?|winds?|gales?|beaufort|heatwave|heat|floods?|flooding|snow|snowfall|hail|frost|red code|bad weather)\b/i;
const FIRE_RE = /wildfire|\bfires?\b|blaze/i;
const FIRE_RISK = /fire[- ](risk|danger)/i;
const METEO_SRC = /meteoalarm|emy\.gr|meteo\.gr|hnms/i;
const txt = (a) => `${a.slug.replace(/-/g, " ")} ${a.en.title} ${(a.alert && a.alert.en) || ""}`;
export function isWeather(a) {
  if (a.guide || a.partner || a.showcase || a.sponsored || a.hidden) return false;
  const t = txt(a);
  if (FIRE_RE.test(t) && !FIRE_RISK.test(t)) return false; // πυρκαγιές: όχι (έχουν δικές τους ειδήσεις)
  const official = (a.sources || []).some((s) => METEO_SRC.test(s.url || ""));
  return official || (!!(a.breaking || a.alert || a.section === "breaking") && (WX_RE.test(t) || FIRE_RISK.test(t)));
}

const LEVELS = {
  red: { he: "אדום", en: "Red", cls: "lv-red" },
  orange: { he: "כתום", en: "Orange", cls: "lv-orange" },
  yellow: { he: "צהוב", en: "Yellow", cls: "lv-yellow" },
};
const TYPES = [
  ["thunder", /thunder|lightning|סופת רעמים|סערות רעמים/i, "⛈️", "סופות רעמים", "Thunderstorms"],
  ["wind", /wind|gale|beaufort|רוחות|בופור/i, "💨", "רוחות חזקות", "Strong winds"],
  ["rain", /rain|flood|גשם|הצפ|שיטפו/i, "🌧️", "גשם והצפות", "Rain & floods"],
  ["heat", /heat|חום|שרב/i, "🌡️", "חום כבד", "Heat"],
  ["snow", /snow|frost|שלג|כפור/i, "❄️", "שלג וקור", "Snow & cold"],
  ["fire", /fire[- ](risk|danger)/i, "🔥", "סכנת שריפות", "Fire risk"],
];
// Περιοχές: μόνο ό,τι αναφέρει το ίδιο το άρθρο (τίτλος/slug/περίληψη)
const REGIONS = [
  [/crete|heraklion|chania|rethymno|lasithi|ierapetra/i, "כרתים", "Crete"],
  [/dodecanese|dodekanis/i, "האיים הדודקאנסיים", "Dodecanese"],
  [/rhodes/i, "רודוס", "Rhodes"],
  [/cyclades|kyklades/i, "האיים הקיקלדיים", "Cyclades"],
  [/north[- ]east aegean|northeast aegean/i, "צפון-מזרח הים האגאי", "North-East Aegean"],
  [/thessal(y|ia)\b/i, "תסליה", "Thessaly"],
  [/sterea|central greece/i, "יוון המרכזית", "Central Greece"],
  [/evia|evvoia|euboea/i, "אוויה", "Evia"],
  [/peloponn?es|peloponnisos/i, "פלופונס", "Peloponnese"],
  [/attica|athens/i, "אטיקה ואתונה", "Attica & Athens"],
  [/ionian/i, "האיים היוניים", "Ionian Islands"],
  [/corfu/i, "קורפו", "Corfu"],
  [/epirus|ipeiros|parga/i, "אפירוס", "Epirus"],
  [/macedonia|thessaloniki|chalkidiki/i, "מקדוניה", "Macedonia"],
  [/thrace|thraki/i, "תרקיה", "Thrace"],
  [/skiathos|sporades/i, "סקיאתוס", "Skiathos"],
  [/lesbos|lesvos/i, "לסבוס", "Lesbos"],
];
export function wxInfo(a) {
  const t = `${txt(a)} ${a.en.dek} ${a.he.title} ${(a.alert && a.alert.he) || ""}`;
  const level = /\bred\b|אדומ|אדום/i.test(t) ? "red" : /\borange\b|\bamber\b|כתומ|כתום/i.test(t) ? "orange" : /\byellow\b|צהוב/i.test(t) ? "yellow" : null;
  const type = TYPES.find((x) => x[1].test(t)) || ["severe", null, "⚠️", "מזג אוויר קשה", "Severe weather"];
  const regs = REGIONS.filter((r) => r[0].test(`${a.slug.replace(/-/g, " ")} ${a.en.title} ${a.en.dek}`)).slice(0, 3);
  return { level, type: { id: type[0], icon: type[2], he: type[3], en: type[4] }, regions: regs.map((r) => ({ he: r[1], en: r[2] })) };
}

/* ---------- Μία γραμμή της λίστας (κοινή για το hub και τις σελίδες επιπέδων) ---------- */
export function wxItemHTML(lang, a, NOW, past = false) {
  const loc = lang === "he" ? "he-IL" : "en-GB";
  const t0 = new Date(a.updatedAt || a.publishedAt);
  const d = { wd: t0.toLocaleDateString(loc, { weekday: "short", timeZone: "Europe/Athens" }), dm: t0.toLocaleDateString("en-GB", { day: "numeric", month: "numeric", timeZone: "Europe/Athens" }).replace("/", "."), hm: t0.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" }) };
  const w = a.wx, lv = w.level ? LEVELS[w.level] : null;
  const isNew = NOW - t0.getTime() < 24 * 3600e3;
  const regs = w.regions.length ? w.regions.map((r) => r[lang]) : [H(lang, "יוון", "Greece")];
  return `<a class="wxa${past ? " past" : ""} ${lv ? lv.cls : "lv-none"}" href="${A(lang, a.slug)}"><span class="when">${esc(d.wd)}<b>${esc(d.dm)}</b><small dir="ltr">${esc(d.hm)}</small></span><span class="wxa-b"><span class="wxa-tags">${lv ? `<span class="lv">${H(lang, "אזהרה", "Warning")}: ${esc(lv[lang])}</span>` : ""}<span class="ty">${w.type.icon} ${esc(w.type[lang])}</span>${isNew && !past ? `<span class="nw">${H(lang, "חדש", "New")}</span>` : ""}</span><h3>${esc(a[lang].title)}</h3><span class="rg">📍 ${regs.map(esc).join(" · ")}</span></span></a>`;
}

/* ---------- Σελίδα ---------- */
const OFFICIAL = [
  ["https://www.emy.gr/en/warnings", "ΕΜΥ / HNMS – אזהרות רשמיות", "HNMS (EMY) – official warnings", "השירות המטאורולוגי הלאומי של יוון", "Hellenic National Meteorological Service"],
  ["https://meteoalarm.org/en/live/region/GR", "MeteoAlarm – מפת האזהרות של יוון", "MeteoAlarm – Greece warnings map", "מפה חיה לפי אזורים וצבעים", "Live map by region and colour"],
  ["https://www.meteo.gr/", "meteo.gr", "meteo.gr", "תחזיות של המצפה הלאומי של אתונה", "Forecasts by the National Observatory of Athens"],
  ["https://civilprotection.gov.gr/en/odigies-prostasias/kataigides", "Civil Protection – הנחיות", "Civil Protection – guidance", "משרד ההגנה האזרחית של יוון", "Greek Ministry of Civil Protection"],
];

export function weatherPage(lang, ctx) {
  const { wxArts, NOW, EM_NUM, exists } = ctx;
  const he = lang === "he", loc = he ? "he-IL" : "en-GB";
  const ts = (a) => new Date(a.updatedAt || a.publishedAt).getTime();
  const week = wxArts.filter((a) => NOW - ts(a) < 7 * 864e5);
  const earlier = wxArts.filter((a) => NOW - ts(a) >= 7 * 864e5 && NOW - ts(a) < 30 * 864e5);
  const recent48 = week.filter((a) => NOW - ts(a) < 48 * 3600e3);
  const item = (a, past) => wxItemHTML(lang, a, NOW, past);
  const upd = new Date(NOW).toLocaleString(loc, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" });
  // CTR: οι αναζητήσεις στο GSC είναι «אזהרה על גשם ברמה חמורה», «אזהרה חמורה על סופת רעמים» κ.λπ. → μπαίνουν στον τίτλο/περιγραφή·
  // η περιγραφή ξεκινά με το πλήθος των προειδοποιήσεων των τελευταίων 48 ωρών όταν υπάρχουν (αλλάζει σε κάθε build).
  const title = H(lang, "אזהרות מזג אוויר ביוון היום: גשם חמור וסופות רעמים", "Greece weather warnings today: severe rain, storms, wind");
  const n48 = recent48.length;
  const description = H(lang,
    `${n48 ? `⚠️ ${n48 === 1 ? "אזהרה חדשה" : `${n48} אזהרות`} ב-48 השעות האחרונות. ` : ""}אזהרה על גשם ברמה חמורה או סופת רעמים ביוון? איפה ומתי, מה אומרים צהוב, כתום ואדום, מה קורה עם מעבורות וטיסות ומה עושים.`,
    `${n48 ? `⚠️ ${n48} new warning${n48 === 1 ? "" : "s"} in the last 48 hours. ` : ""}Severe rain or thunderstorm warning in Greece? Where and when, what yellow, orange and red mean, ferries, flights and what to do.`);
  const status = recent48.length
    ? `<div class="wx-status on"><b>⚠️ ${he ? `${recent48.length === 1 ? "אזהרה או דיווח אחד" : `${recent48.length} אזהרות ודיווחים`} על מזג אוויר קשה ב-48 השעות האחרונות` : `${recent48.length} severe-weather warning${recent48.length === 1 ? "" : "s"} or report${recent48.length === 1 ? "" : "s"} in the last 48 hours`}</b><span>${H(lang, "בדקו את האזור שלכם ברשימה, ואת המצב העדכני במפה הרשמית של MeteoAlarm.", "Check your area below, and the current status on the official MeteoAlarm map.")}</span></div>`
    : `<div class="wx-status off"><b>✅ ${H(lang, "אין אזהרות מזג אוויר חדשות ב-48 השעות האחרונות", "No new weather warnings in the last 48 hours")}</b><span>${H(lang, "אנחנו מפרסמים כאן אזהרות כתומות ואדומות של שירות המטאורולוגיה היווני. לתמונה המלאה ברגע זה, בדקו את המפה הרשמית.", "We publish orange and red warnings from the Greek meteorological service here. For the full picture right now, check the official map.")}</span></div>`;
  const lv = (k, c, txtHe, txtEn) => `<li class="${c}"><b>${k}</b><span>${he ? txtHe : txtEn}</span></li>`;
  const levels = `<ul class="wx-levels">
${lv(H(lang, "ירוק", "Green"), "lv-green", "אין צפי למזג אוויר מסוכן.", "No dangerous weather expected.")}
${lv(H(lang, "צהוב", "Yellow"), "lv-yellow", "מזג אוויר שעלול להיות מסוכן, אבל כנראה לא קיצוני. זהירות בפעילויות שתלויות במזג האוויר (ים, טיולים, הפלגות).", "Potentially dangerous weather, but unlikely to be extreme. Take care with weather-dependent activities (sea, hikes, sailing).")}
${lv(H(lang, "כתום", "Orange"), "lv-orange", "מזג אוויר חמור שעלול לגרום לנזקים או לתאונות. היו זהירים, התעדכנו בתחזית והישמעו להנחיות הרשויות.", "Severe weather that may cause damage or accidents. Be careful, keep up with the latest forecast and follow the authorities' advice.")}
${lv(H(lang, "אדום", "Red"), "lv-red", "מזג אוויר קיצוני ומסוכן מאוד. צפויים נזקים ותאונות בשטח נרחב, ובמקרים רבים סכנת חיים. הקפידו מאוד על הוראות הרשויות. ייתכנו צעדי בטיחות חריגים.", "Extremely severe, very dangerous weather. Major damage and accidents are likely over a wide area, in many cases with a threat to life. Follow the authorities' instructions closely. Exceptional safety measures may be taken.")}
</ul>
<p class="small">${H(lang, `ביוון, האזהרות מתפרסמות על ידי השירות המטאורולוגי הלאומי (<bdi dir="ltr">ΕΜΥ / HNMS</bdi>), שמנהל עבור יוון את מערכת האזהרות האירופית <bdi dir="ltr">MeteoAlarm</bdi>. הצבעים לפי ההגדרות של <bdi dir="ltr">MeteoAlarm</bdi>. מקורות: <a href="https://meteoalarm.org/en/live/region/GR" target="_blank" rel="noopener">MeteoAlarm</a> · <a href="https://www.emy.gr/en/warnings" target="_blank" rel="noopener">ΕΜΥ</a>.`, `In Greece, warnings are issued by the Hellenic National Meteorological Service (EMY / HNMS), which runs the European MeteoAlarm warning system for Greece. Colour definitions follow MeteoAlarm. Sources: <a href="https://meteoalarm.org/en/live/region/GR" target="_blank" rel="noopener">MeteoAlarm</a> · <a href="https://www.emy.gr/en/warnings" target="_blank" rel="noopener">EMY</a>.`)}</p>`;
  const ferryArt = exists("orange-wind-warning-north-east-aegean-2026");
  const tips = he ? [
    "אל תחצו נחלים או דרכים מוצפות, לא ברגל ולא ברכב.",
    "בזמן אזהרה על גשם חזק, התרחקו ממרתפים וממקומות תת-קרקעיים, ועלו למקום גבוה ובטוח.",
    "אם הרכב נתקע במים, צאו ממנו: המים עלולים לסחוף אותו.",
    "בסופת רעמים בחוץ: חפשו מחסה בבניין או ברכב. אל תעמדו מתחת לעץ גבוה בשטח פתוח, והתרחקו מעמודי חשמל, כבלים, חפצי מתכת ומים.",
    "קבעו או הכניסו פנימה חפצים שהרוח יכולה להעיף (למשל במרפסת), וסגרו דלתות וחלונות.",
    "התרחקו מכבלי חשמל ומאזורים שבהם יש סכנת מפולות.",
    "הישמעו להוראות הרשויות.",
  ] : [
    "Do not cross streams or flooded roads, on foot or by car.",
    "During a heavy-rain warning, avoid basements and underground places, and move to higher, safe ground.",
    "If your car gets stuck in water, get out: it may be swept away.",
    "In a thunderstorm outdoors: shelter in a building or a car. Never stand under a tall tree in open ground, and keep away from pylons, cables, metal objects and water.",
    "Secure or bring inside anything the wind can carry (for example on a balcony), and close doors and windows.",
    "Stay away from power lines and areas at risk of landslides.",
    "Follow the authorities' instructions.",
  ];
  const nums = EM_NUM.filter((x) => ["112", "199", "108", "166", "100"].includes(x.n)).map((x) => `<a class="emnum" href="tel:${x.n}"><b dir="ltr">${esc(x.n)}</b><span>${esc(x[lang])}</span></a>`).join("");
  const sec = (id, t, inner) => `<section aria-labelledby="${id}"><div class="zone-h"><h2 id="${id}">${t}</h2></div>${inner}</section>`;
  const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(H(lang, "כל אזהרות מזג האוויר שפרסמנו ביוון, מהחדשה לישנה: גשם וסופות, רוחות חזקות וחום. עם האזור, השעה ומה עושים.", "Every weather warning we have published for Greece, newest first: rain and storms, strong winds and heat. With the area, the time and what to do."))}</p><p class="small">${H(lang, "עודכן", "Updated")}: ${esc(upd)} (${H(lang, "שעון אתונה", "Athens time")})</p></div>
<div class="grid"><div class="col">
${status}
${sec("wx-week", H(lang, "אזהרות ודיווחים מ-7 הימים האחרונים", "Warnings and reports from the last 7 days"), week.length ? `<div class="wxlist">${week.map((a) => item(a, false)).join("")}</div>` : `<div class="empty-note">${H(lang, "לא פורסמו אזהרות מזג אוויר ב-7 הימים האחרונים. 👍", "No weather warnings published in the last 7 days. 👍")}</div>`)}
<p class="small">${H(lang, "הרשימה כוללת את הכתבות שלנו על אזהרות ומזג אוויר קשה. אזהרה יכולה להסתיים או להתעדכן: המצב העדכני תמיד באתר של <bdi dir='ltr'>ΕΜΥ</bdi> ובמפה של <bdi dir='ltr'>MeteoAlarm</bdi>.", "This list is our coverage of warnings and severe weather. A warning may end or be updated: the current status is always on the EMY website and the MeteoAlarm map.")}</p>
${sec("wx-levels", H(lang, "מה אומרים הצבעים: צהוב, כתום, אדום", "What the colours mean: yellow, orange, red"), levels)}
${sec("wx-kinds", H(lang, "מה אומרת כל אזהרה? הסברים לפי סוג ורמה", "What does each warning mean? By type and level"), `<p class="small">${H(lang, "״ברמה בינונית״ = צהוב (Moderate), ״ברמה חמורה״ = כתום (Severe), ״ברמה קיצונית״ = אדום (Extreme).", "Moderate = yellow, Severe = orange, Extreme = red.")}</p>${wxLevelLinks(lang)}<p><a href="${P(lang, "/weather/")}">${H(lang, "🗓️ מזג האוויר ביוון לפי חודשים: טמפרטורות, ים וגשם ←", "🗓️ Greece weather month by month: temperatures, sea and rain →")}</a></p>`)}
<section class="means"><h2>📱 ${H(lang, "הודעות 112 לטלפון", "112 alerts on your phone")}</h2><p>${H(lang, "ביוון נשלחות הודעות חירום מ-112 לטלפונים, ביוונית ובאנגלית. אם קיבלתם הודעה כזו, פעלו לפי ההוראות שבה (למשל להגביל תנועה או להתפנות).", "Greece sends 112 emergency messages to phones, in Greek and English. If you receive one, follow its instructions (for example, limit travel or evacuate).")}</p></section>
${sec("wx-tips", H(lang, "מה עושים בגשם חזק, בהצפות ובסופת רעמים", "What to do in heavy rain, floods and thunderstorms"), `<ul class="wx-tips">${tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="small">${H(lang, "לפי ההנחיות של משרד ההגנה האזרחית של יוון:", "Based on the Greek Civil Protection guidance:")} <a href="https://civilprotection.gov.gr/en/odigies-prostasias/kataigides" target="_blank" rel="noopener">${H(lang, "סופות", "Storms")}</a> · <a href="https://civilprotection.gov.gr/en/odigies-prostasias/plimmyres" target="_blank" rel="noopener">${H(lang, "הצפות", "Floods")}</a></p>`)}
<section class="means"><h2>⛴️ ${H(lang, "רוחות חזקות ומעבורות", "Strong winds and ferries")}</h2><p>${H(lang, "ברוחות חזקות רשויות הנמל עלולות להטיל איסור הפלגה, ומעבורות נשארות בנמל.", "In strong winds the port authorities may ban sailings, and ferries stay in port.")}${ferryArt ? ` ${H(lang, `כך קרה למשל ב-1 באוקטובר 2026 בנמלי רפינה ולאבריו (<a href="${A(lang, "orange-wind-warning-north-east-aegean-2026")}">לכתבה</a>).`, `This happened, for example, on 1 October 2026 at the ports of Rafina and Lavrio (<a href="${A(lang, "orange-wind-warning-north-east-aegean-2026")}">read more</a>).`)}` : ""} ${H(lang, "לפני הפלגה בדקו מול חברת המעבורות, ובדקו גם אם יש שביתה:", "Before sailing, check with the ferry company, and check for strikes too:")} <a href="${P(lang, "/strike-today/")}">${H(lang, "יש שביתה היום?", "Strike today?")}</a></p></section>
${sec("wx-sos", H(lang, "מספרי חירום ביוון", "Emergency numbers in Greece"), `<div class="emnums">${nums}</div><p><a href="${P(lang, "/emergency/")}">${H(lang, "כל מספרי החירום, שגרירות ישראל ומה עושים אם... ←", "All emergency numbers, the Israeli embassy and what to do if... →")}</a></p>`)}
${earlier.length ? sec("wx-earlier", H(lang, "אזהרות קודמות (30 הימים האחרונים)", "Earlier warnings (last 30 days)"), `<div class="wxlist">${earlier.map((a) => item(a, true)).join("")}</div>`) : ""}
${sec("wx-src", H(lang, "מקורות רשמיים", "Official sources"), `<div class="links">${OFFICIAL.map(([u, th, te, sh, se]) => `<a href="${u}" target="_blank" rel="noopener">${esc(he ? th : te)} <small>${esc(he ? sh : se)}</small><span aria-hidden="true">↗</span></a>`).join("")}</div>`)}
__FAQ__
${pushBox(lang, true)}
</div>__WIDGETS__</div>`;
  const faq = he ? [
    ["מה פירוש אזהרה על גשם ברמה חמורה?", "אזהרת גשם ברמה חמורה היא בדרך כלל אזהרה כתומה: לפי ההגדרות של MeteoAlarm, כתום פירושו מזג אוויר חמור שעלול לגרום לנזקים או לתאונות, למשל הצפות. אדום הוא הרמה הגבוהה ביותר, מזג אוויר קיצוני ומסוכן מאוד. בזמן אזהרה כזו אל תחצו דרכים מוצפות, התרחקו ממרתפים והישמעו להוראות הרשויות."],
    ["מה עושים בזמן אזהרה חמורה על סופת רעמים?", "חפשו מחסה בבניין או ברכב. אל תעמדו מתחת לעץ גבוה בשטח פתוח, והתרחקו מעמודי חשמל, כבלים, חפצי מתכת ומים. קבעו או הכניסו פנימה חפצים שהרוח יכולה להעיף, והישמעו להוראות הרשויות."],
    ["מה זה אזהרה כתומה ביוון?", "אזהרה כתומה (Orange) פירושה מזג אוויר חמור שעלול לגרום לנזקים או לתאונות, למשל גשם חזק, סופות רעמים או רוחות חזקות. ממליצים להיזהר, להתעדכן בתחזית ולהישמע להנחיות הרשויות. ביוון את האזהרות מפרסם השירות המטאורולוגי הלאומי (ΕΜΥ) דרך MeteoAlarm."],
    ["מה ההבדל בין אזהרה צהובה, כתומה ואדומה?", "צהוב: מזג אוויר שעלול להיות מסוכן, אבל כנראה לא קיצוני. כתום: מזג אוויר חמור שעלול לגרום לנזקים או לתאונות. אדום: מזג אוויר קיצוני ומסוכן מאוד, עם נזקים ותאונות בשטח נרחב ולעיתים סכנת חיים."],
    ["איפה בודקים אם יש היום אזהרת מזג אוויר ביוון?", "בעמוד הזה ביוונט מופיעות כל האזהרות שפרסמנו בעברית, לפי אזור ושעה. המצב הרשמי והעדכני ביותר נמצא באתר של ΕΜΥ (emy.gr) ובמפה של MeteoAlarm (meteoalarm.org)."],
    ["האם מקבלים התראה לטלפון על מזג אוויר קשה ביוון?", "כן. ביוון נשלחות הודעות חירום מ-112 לטלפונים, ביוונית ובאנגלית. אם קיבלתם הודעה כזו, פעלו לפי ההוראות שבה. במצב חירום חייגו 112."],
  ] : [
    ["What does a severe rain warning mean in Greece?", "A severe rain warning is usually an orange warning: under the MeteoAlarm definitions, orange means severe weather that may cause damage or accidents, such as flooding. Red is the highest level, extremely severe and very dangerous weather. During such a warning do not cross flooded roads, avoid basements and follow the authorities' instructions."],
    ["What should I do during a severe thunderstorm warning?", "Shelter in a building or a car. Never stand under a tall tree in open ground, and keep away from pylons, cables, metal objects and water. Secure or bring inside anything the wind can carry, and follow the authorities' instructions."],
    ["What is an orange weather warning in Greece?", "An orange warning means severe weather that may cause damage or accidents, such as heavy rain, thunderstorms or strong winds. Be careful, keep up with the forecast and follow the authorities' advice. In Greece warnings are issued by the national meteorological service (EMY) through MeteoAlarm."],
    ["What is the difference between yellow, orange and red warnings?", "Yellow: potentially dangerous weather, but unlikely to be extreme. Orange: severe weather that may cause damage or accidents. Red: extremely severe, very dangerous weather, with damage and accidents likely over a wide area and in many cases a threat to life."],
    ["Where can I check if there is a weather warning in Greece today?", "This Yavanet page lists every warning we have published, by area and time. The official, most up-to-date status is on the EMY website (emy.gr) and the MeteoAlarm map (meteoalarm.org)."],
    ["Will I get a phone alert about severe weather in Greece?", "Yes. Greece sends 112 emergency messages to phones, in Greek and English. If you receive one, follow its instructions. In an emergency call 112."],
  ];
  // Οι ερωτήσεις φαίνονται και στη σελίδα (το FAQPage πρέπει να αντιστοιχεί σε ορατό κείμενο)
  const faqHTML = sec("wx-faq", H(lang, "שאלות נפוצות על אזהרות מזג אוויר", "Weather warnings: common questions"), `<div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`);
  return { title, description, body: body.replace("__FAQ__", faqHTML), faq, recent: recent48.length };
}
