// Αργίες και ωράριο καταστημάτων στην Ελλάδα, για Ισραηλινούς που έρχονται για ψώνια.
// Πηγές: επίσημες αργίες (ν. 4808/2021 κ.ά., βλ. publicholidays.gr / Wikipedia «Public holidays in Greece»),
// Κυριακές 2026 με ανοιχτά καταστήματα (ΕΣΕΕ / Τύπος: parapolitika.gr, amyna.news), εκπτώσεις (ν. 4177/2013).
// shops: "closed" = τα περισσότερα καταστήματα κλειστά, "open" = ανοιχτά, "short" = ανοιχτά με μειωμένο ωράριο, "sunday" = Κυριακή με ανοιχτά καταστήματα, "sales" = περίοδος εκπτώσεων
import { esc, P } from "./templates.mjs";

export const HOLIDAYS = [
  { d: "2026-10-26", shops: "local", he: "אגיוס דימיטריוס – חג העיר סלוניקי", en: "Agios Dimitrios – Thessaloniki city holiday", nhe: "רק בסלוניקי: שירותים ציבוריים סגורים וחלק מהחנויות סגורות. באתונה יום רגיל.", nen: "Thessaloniki only: public services closed and some shops shut. A normal day in Athens." },
  { d: "2026-10-28", shops: "closed", he: "יום ה״אוחי״ – חג לאומי", en: "Ohi Day – national holiday", nhe: "רוב החנויות, הבנקים והשירותים סגורים. מצעדים בכל הערים.", nen: "Most shops, banks and services closed. Parades in every city." },
  { d: "2026-11-29", shops: "sunday", he: "יום ראשון עם חנויות פתוחות (אחרי הבלאק פריידי)", en: "Shops open on Sunday (after Black Friday)", nhe: "החנויות רשאיות לפתוח, לא חייבות.", nen: "Shops may open; it is optional." },
  { d: "2026-12-13", shops: "sunday", he: "יום ראשון עם חנויות פתוחות (לפני חג המולד)", en: "Shops open on Sunday (before Christmas)", nhe: "החנויות רשאיות לפתוח, לא חייבות.", nen: "Shops may open; it is optional." },
  { d: "2026-12-20", shops: "sunday", he: "יום ראשון עם חנויות פתוחות (לפני חג המולד)", en: "Shops open on Sunday (before Christmas)", nhe: "החנויות רשאיות לפתוח, לא חייבות.", nen: "Shops may open; it is optional." },
  { d: "2026-12-24", shops: "short", he: "ערב חג המולד", en: "Christmas Eve", nhe: "החנויות פתוחות, ובדרך כלל נסגרות מוקדם יותר מהרגיל.", nen: "Shops open, usually closing earlier than normal." },
  { d: "2026-12-25", shops: "closed", he: "חג המולד", en: "Christmas Day", nhe: "כמעט הכול סגור.", nen: "Almost everything closed." },
  { d: "2026-12-26", shops: "closed", he: "היום השני של חג המולד", en: "Second day of Christmas", nhe: "כמעט הכול סגור.", nen: "Almost everything closed." },
  { d: "2026-12-27", shops: "sunday", he: "יום ראשון עם חנויות פתוחות (סוף השנה)", en: "Shops open on Sunday (end of year)", nhe: "החנויות רשאיות לפתוח, לא חייבות.", nen: "Shops may open; it is optional." },
  { d: "2026-12-31", shops: "short", he: "ערב השנה החדשה", en: "New Year's Eve", nhe: "החנויות פתוחות, ובדרך כלל נסגרות מוקדם יותר מהרגיל.", nen: "Shops open, usually closing earlier than normal." },
  { d: "2027-01-01", shops: "closed", he: "השנה החדשה", en: "New Year's Day", nhe: "כמעט הכול סגור.", nen: "Almost everything closed." },
  { d: "2027-01-06", shops: "closed", he: "חג ההתגלות (אפיפניה)", en: "Epiphany", nhe: "רוב החנויות סגורות.", nen: "Most shops closed." },
  { d: "2027-01-11", to: "2027-02-28", shops: "sales", he: "עונת ההנחות של החורף", en: "Winter sales", nhe: "מהיום שני השני של ינואר ועד סוף פברואר, לפי החוק.", nen: "From the second Monday of January to the end of February, by law." },
  { d: "2027-03-15", shops: "closed", he: "״יום שני הנקי״ (תחילת הצום הגדול)", en: "Clean Monday (start of Lent)", nhe: "רוב החנויות סגורות. יוונים יוצאים לפיקניק ומעיפים עפיפונים.", nen: "Most shops closed. Greeks picnic and fly kites." },
  { d: "2027-03-25", shops: "closed", he: "יום העצמאות של יוון", en: "Greek Independence Day", nhe: "רוב החנויות סגורות. מצעד גדול באתונה.", nen: "Most shops closed. Big parade in Athens." },
  { d: "2027-04-30", shops: "short", he: "יום שישי הגדול (לפני הפסחא)", en: "Good Friday (Orthodox)", nhe: "בדרך כלל החנויות פותחות רק בצהריים. שירותים ציבוריים סגורים.", nen: "Shops usually open only from midday. Public services closed." },
  { d: "2027-05-01", shops: "short", he: "שבת לפני הפסחא + אחד במאי", en: "Holy Saturday + May Day", nhe: "השנה האחד במאי יוצא בשבת של הפסחא. הממשלה לפעמים מזיזה את החופשה ליום אחר – נעדכן כשיוכרז.", nen: "This year May Day falls on Holy Saturday. The government sometimes moves the holiday – we will update when announced." },
  { d: "2027-05-02", shops: "closed", he: "פסחא יוונית (איסטר)", en: "Orthodox Easter Sunday", nhe: "החג הכי גדול ביוון. כמעט הכול סגור.", nen: "Greece's biggest holiday. Almost everything closed." },
  { d: "2027-05-03", shops: "closed", he: "יום שני של הפסחא", en: "Easter Monday", nhe: "רוב החנויות סגורות.", nen: "Most shops closed." },
  { d: "2027-06-21", shops: "open", he: "יום שני של רוח הקודש", en: "Whit Monday (Agiou Pnevmatos)", nhe: "בנקים ושירותים ציבוריים סגורים. רוב החנויות בדרך כלל פתוחות.", nen: "Banks and public services closed. Most shops are usually open." },
  { d: "2027-07-12", to: "2027-08-31", shops: "sales", he: "עונת ההנחות של הקיץ", en: "Summer sales", nhe: "מהיום שני השני של יולי ועד סוף אוגוסט, לפי החוק.", nen: "From the second Monday of July to the end of August, by law." },
  { d: "2027-08-15", shops: "closed", he: "חג העלייה של מרים (דקאפנטאוגוסטוס)", en: "Dormition of the Virgin Mary", nhe: "רוב החנויות סגורות, אתונה מתרוקנת. באיים הרבה פתוח.", nen: "Most shops closed and Athens empties. On the islands much stays open." },
  { d: "2027-10-28", shops: "closed", he: "יום ה״אוחי״ – חג לאומי", en: "Ohi Day – national holiday", nhe: "רוב החנויות, הבנקים והשירותים סגורים.", nen: "Most shops, banks and services closed." },
  { d: "2027-12-25", shops: "closed", he: "חג המולד", en: "Christmas Day", nhe: "כמעט הכול סגור.", nen: "Almost everything closed." },
  { d: "2027-12-26", shops: "closed", he: "היום השני של חג המולד", en: "Second day of Christmas", nhe: "כמעט הכול סגור.", nen: "Almost everything closed." },
];

const TAG = {
  closed: ["סגור", "Closed", "c"], open: ["פתוח", "Open", "o"], short: ["שעות מקוצרות", "Shorter hours", "s"],
  sunday: ["ראשון פתוח", "Open Sunday", "o"], sales: ["הנחות", "Sales", "sale"], local: ["חג מקומי", "Local holiday", "s"],
};
const fmt = (iso, lang) => new Date(iso + "T12:00:00Z").toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Υπολογισμός «ανοιχτά/κλειστά σήμερα» (ώρα Αθήνας): τρέχει inline αμέσως μετά τη λωρίδα/το κουτί, ώστε το κείμενο να είναι σωστό ήδη στην πρώτη εμφάνιση
const HOL_JS = "(function () { var esc = function (x) { return String(x == null ? \"\" : x).replace(/[&<>\"]/g, function (c) { return { \"&\": \"&amp;\", \"<\": \"&lt;\", \">\": \"&gt;\", '\"': \"&quot;\" }[c]; }); }; var dataEl = document.getElementById(\"hol-data\"), strip = document.getElementById(\"hol-strip\"), nowBox = document.getElementById(\"hol-now\"); if (!strip && !nowBox) return; var H = []; try { H = JSON.parse((dataEl || {}).textContent || \"[]\"); } catch (e) { } if (!H.length && nowBox) { try { H = JSON.parse(nowBox.getAttribute(\"data-h\") || \"[]\"); } catch (e) { } } var he = document.documentElement.lang !== \"en\"; var parts = {}; try { new Intl.DateTimeFormat(\"en-GB\", { timeZone: \"Europe/Athens\", year: \"numeric\", month: \"2-digit\", day: \"2-digit\", hour: \"2-digit\", hour12: false, weekday: \"short\" }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; }); } catch (e) { return; } var today = parts.year + \"-\" + parts.month + \"-\" + parts.day, hr = parseInt(parts.hour, 10) % 24, wd = parts.weekday; var ev = H.filter(function (h) { return h.d === today && h.s !== \"sales\"; })[0]; var sale = H.filter(function (h) { return h.s === \"sales\" && h.d <= today && h.to >= today; })[0]; var st, cls; if (ev && ev.s === \"closed\") { st = (he ? \"היום רוב החנויות סגורות: \" : \"Most shops are closed today: \") + ev.t; cls = \"c\"; } else if (ev && ev.s === \"short\") { st = (he ? \"היום החנויות פתוחות בשעות מקוצרות: \" : \"Shops open with shorter hours today: \") + ev.t; cls = \"s\"; } else if (ev && ev.s === \"sunday\") { st = he ? \"היום יום ראשון, אבל החנויות רשאיות לפתוח 🛍️\" : \"It's Sunday, but shops may open today 🛍️\"; cls = \"o\"; } else if (ev && ev.s === \"local\") { st = ev.t; cls = \"s\"; } else if (wd === \"Sun\") { st = he ? \"היום יום ראשון: רוב החנויות סגורות (חוץ מאזורים תיירותיים)\" : \"It's Sunday: most shops are closed (except tourist areas)\"; cls = \"c\"; } else if (hr >= 21 || (wd === \"Sat\" && hr >= 20)) { st = he ? \"החנויות כבר נסגרו להיום באתונה\" : \"Shops in Athens have closed for today\"; cls = \"s\"; } else { st = he ? (wd === \"Sat\" ? \"היום החנויות פתוחות (רשתות וקניונים עד 20:00 בערך)\" : \"היום החנויות פתוחות (רשתות וקניונים עד 21:00 בערך)\") : (wd === \"Sat\" ? \"Shops are open today (chains and malls until about 20:00)\" : \"Shops are open today (chains and malls until about 21:00)\"); cls = \"o\"; } if (sale) st += he ? \" · עונת הנחות!\" : \" · Sales season!\"; var nx = H.filter(function (h) { return h.d > today && h.s !== \"local\"; })[0]; var fmtD = function (iso) { try { return new Date(iso + \"T12:00:00Z\").toLocaleDateString(he ? \"he-IL\" : \"en-GB\", { weekday: \"short\", day: \"numeric\", month: \"short\", timeZone: \"UTC\" }); } catch (e) { return iso; } }; var nxt = nx ? ((he ? \"הבא: \" : \"Next: \") + nx.t + \" · \" + fmtD(nx.d)) : \"\"; if (strip) { strip.classList.add(\"hs-\" + cls); document.getElementById(\"hs-today\").textContent = st; if (nxt) document.getElementById(\"hs-next\").textContent = nxt; } if (nowBox) { nowBox.className = \"hol-now hs-\" + cls; nowBox.innerHTML = \"<b>\" + esc(st) + \"</b>\" + (nxt ? \"<span>\" + esc(nxt) + \"</span>\" : \"\"); } })();";
// Λωρίδα στην κορυφή της αρχικής: «Οι χρήστες βλέπουν αμέσως αν σήμερα τα μαγαζιά είναι ανοιχτά» (υπολογίζεται στον browser, ώρα Αθήνας)
export function holidaysStrip(lang) {
  const he = lang === "he";
  return `<a class="hol-strip" href="${P(lang, "/holidays/")}" id="hol-strip" data-lang="${lang}">
  <span class="hs-ic" aria-hidden="true">🛍️</span>
  <span class="hs-t"><b id="hs-today">${he ? "חנויות ביוון: פתוח או סגור?" : "Shops in Greece: open or closed?"}</b><small id="hs-next">${he ? "חגים, ימי ראשון פתוחים ועונות הנחות" : "Holidays, open Sundays and sales seasons"}</small></span>
  <span class="hs-go">${he ? "ללוח המלא ←" : "Full calendar →"}</span>
</a>
<script type="application/json" id="hol-data">${JSON.stringify(HOLIDAYS.map((h) => ({ d: h.d, to: h.to, s: h.shops, t: he ? h.he : h.en })))}</script>
<script>${HOL_JS}</script>`;
}

export function holidaysPage(lang, TODAY) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const up = HOLIDAYS.filter((h) => (h.to || h.d) >= TODAY);
  const rows = up.map((h) => { const tg = TAG[h.shops]; return `<li class="hl hl-${tg[2]}"><time datetime="${h.d}">${esc(fmt(h.d, lang))}${h.to ? ` – ${esc(fmt(h.to, lang))}` : ""}</time><b>${esc(he ? h.he : h.en)}</b><span class="hl-tag">${esc(he ? tg[0] : tg[1])}</span><p>${esc(he ? h.nhe : h.nen)}</p></li>`; }).join("");
  const title = L("חגים ושעות פתיחה של חנויות ביוון", "Greek holidays and shop opening hours");
  const description = L("מתי החנויות ביוון סגורות? כל החגים, ימי ראשון שבהם החנויות פתוחות, עונות ההנחות ושעות הפתיחה הרגילות – לפני שטסים לשופינג באתונה.", "When are shops in Greece closed? All public holidays, the Sundays when shops open, sales seasons and normal opening hours – before you fly to Athens for shopping.");
  const faq = [
    [L("האם החנויות ביוון פתוחות ביום ראשון?", "Are shops in Greece open on Sunday?"), L("בדרך כלל לא. רוב החנויות סגורות בימי ראשון, חוץ מכמה ימי ראשון בשנה שנקבעים בחוק (בעיקר בדצמבר ובתחילת עונות ההנחות) ובאזורים תיירותיים כמו פלאקה ומונסטיראקי, והאיים בקיץ.", "Usually not. Most shops are closed on Sundays, except a few Sundays a year set by law (mainly in December and at the start of the sales seasons) and tourist areas such as Plaka and Monastiraki, and the islands in summer.")],
    [L("מה שעות הפתיחה הרגילות?", "What are normal opening hours?"), L("רשתות, קניונים, רחוב ארמו וסופרמרקטים: בערך 9:00–21:00 בימים שני עד שישי ועד 20:00 בשבת. חנויות קטנות: בימי שני, רביעי ושבת רק בבוקר (עד 15:00 בערך), ובשלישי, חמישי ושישי גם אחר הצהריים (בערך 17:30–20:30).", "Chains, malls, Ermou Street and supermarkets: roughly 9:00–21:00 Monday to Friday and until 20:00 on Saturday. Small shops: Monday, Wednesday and Saturday mornings only (until about 15:00), and Tuesday, Thursday and Friday also in the afternoon (about 17:30–20:30).")],
    [L("מתי ההנחות ביוון?", "When are the sales in Greece?"), L("לפי החוק: הנחות החורף מהיום שני השני של ינואר ועד סוף פברואר, והנחות הקיץ מהיום שני השני של יולי ועד סוף אוגוסט.", "By law: winter sales from the second Monday of January to the end of February, and summer sales from the second Monday of July to the end of August.")],
  ];
  const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(description)}</p></div>
<div class="hol-now" id="hol-now" data-lang="${lang}" data-h="${esc(JSON.stringify(HOLIDAYS.map((h) => ({ d: h.d, to: h.to, s: h.shops, t: he ? h.he : h.en }))))}"></div><script>${HOL_JS}</script>
<section><div class="zone-h"><h2>${L("לוח החגים וימי הקניות", "Holidays and shopping days")}</h2></div><ol class="hol-list">${rows}</ol>
<p class="small">${L("ימי ראשון של 2027 עם חנויות פתוחות יתווספו ברגע שיפורסמו רשמית. בחגים, באזורים תיירותיים ובאיים חלק מהחנויות והמסעדות פתוחות גם כשרוב העיר סגורה.", "The 2027 Sundays with open shops will be added as soon as they are officially published. On holidays, in tourist areas and on the islands some shops and restaurants stay open even when most of the city is closed.")}</p></section>
<section class="hol-links"><a href="${P(lang, "/a/athens-shopping-guide-israelis/")}">🛍️ ${L("המדריך לשופינג באתונה: ארמו, קולונקי, קניונים ואאוטלט", "Athens shopping guide: Ermou, Kolonaki, malls and outlet")}</a><a href="${P(lang, "/a/tax-free-shopping-greece-vat-refund-israelis/")}">💶 ${L("החזר מע״מ (Tax Free): ככה מקבלים כסף בחזרה", "Tax Free: how to get your VAT back")}</a><a href="${P(lang, "/a/jewish-holidays-greece-chabad-kosher-synagogues/")}">🕍 ${L("חגים יהודיים ביוון: חב״ד, בתי כנסת ואוכל כשר", "Jewish holidays in Greece: Chabad, synagogues, kosher food")}</a></section>
<section><div class="zone-h"><h2>${L("שאלות נפוצות", "Common questions")}</h2></div>${faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>
<p class="small">${L("מקורות: רשימת החגים הרשמיים של יוון, איגוד הסוחרים (ΕΣΕΕ) לגבי ימי ראשון, וחוק ההנחות. מידע כללי – שעות מדויקות משתנות מחנות לחנות.", "Sources: Greece's official public holiday list, the Hellenic Confederation of Commerce (ΕΣΕΕ) for Sundays, and the sales law. General information – exact hours vary by shop.")}</p>`;
  return { title, description, body, faq };
}
