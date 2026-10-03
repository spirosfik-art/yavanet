// /shabbat/ – Ώρες Σαββάτου (υπολογίζονται στον browser, αλγόριθμος NOAA) + κασέρ και εβραϊκοί χώροι ανά πόλη.
// Τα στοιχεία των χώρων: ΜΟΝΟ από την επαληθευμένη έρευνα (Οκτώβριος 2026). Τίποτα επιπλέον.
import { esc, P } from "./templates.mjs";
import { toolScript } from "./toolsjs.mjs";

const H = (lang, he, en) => (lang === "he" ? he : en);

export const SHAB_CITIES = [
  { id: "athens", he: "אתונה", en: "Athens", lat: 37.98376, lng: 23.72784 },
  { id: "thessaloniki", he: "סלוניקי", en: "Thessaloniki", lat: 40.64361, lng: 22.93086 },
  { id: "rhodes", he: "רודוס", en: "Rhodes", lat: 36.43496, lng: 28.21735 },
  { id: "heraklion", he: "הרקליון (כרתים)", en: "Heraklion (Crete)", lat: 35.33908, lng: 25.13231 },
  { id: "chania", he: "חאניה (כרתים)", en: "Chania (Crete)", lat: 35.51124, lng: 24.01921 },
  { id: "corfu", he: "קורפו", en: "Corfu", lat: 39.6243, lng: 19.9217 },
  { id: "mykonos", he: "מיקונוס", en: "Mykonos", lat: 37.44529, lng: 25.32872 },
  { id: "santorini", he: "סנטוריני", en: "Santorini", lat: 36.41667, lng: 25.43333 },
];

// t: type, n: notes. url χωρίς https://
const PLACES = [
  { city: ["אתונה", "Athens"], dest: "athens", items: [
    { name: "Chabad of Greece", t: ["בית חב״ד, בית כנסת, מקווה ומכולת כשרה", "Chabad house, synagogue, mikvah, kosher grocery"], addr: "Aisopou 10, Psiri, Athens", url: "chabad.gr", n: ["תפילות יומיות ובשבת.", "Daily and Shabbat prayers."] },
    { name: "Gostijo", t: ["מסעדה כשרה בשרית", "Kosher meat restaurant"], addr: "Aisopou 10, Psiri, Athens", url: "gostijo.gr", n: ["בהשגחת חב״ד (הרב מנדל הנדל). ארוחות שבת בהזמנה מראש בלבד.", "Supervised by Chabad (Rabbi Mendel Hendel). Shabbat meals by reservation only."] },
    { name: "e-kosher.gr", t: ["מכולת כשרה ומשלוחי ארוחות אונליין של חב״ד", "Online kosher grocery & meal delivery by Chabad"], url: "e-kosher.gr", n: ["משלוחים לכל יוון, כולל האיים.", "Delivers across Greece, including the islands."] },
    { name: "Beth Shalom Synagogue", t: ["בית כנסת ספרדי", "Sephardic synagogue"], addr: "Melidoni 5, Thiseio, Athens", url: "athjcom.gr", n: ["תפילות קבועות.", "Regular services."] },
    { name: "Jewish Museum of Greece", t: ["המוזיאון היהודי של יוון", "Jewish Museum of Greece"], addr: "Nikis 39, Athens", url: "jewishmuseum.gr", closed: true, n: ["סגור זמנית לשיפוצים. הפתיחה המחודשת מתוכננת לתחילת 2027.", "Temporarily closed for renovation. Reopening planned for early 2027."] },
  ] },
  { city: ["סלוניקי", "Thessaloniki"], dest: "thessaloniki", items: [
    { name: "Chabad of Thessaloniki", t: ["בית חב״ד", "Chabad house"], addr: "Salaminou 9, Thessaloniki", url: "jewishthessaloniki.com", n: ["תפילות יומיות ובשבת, ארוחות שבת.", "Daily and Shabbat prayers, Shabbat meals."] },
    { name: "Shalom Kosher Restaurant (Astoria Hotel)", t: ["מסעדה כשרה", "Kosher restaurant"], addr: "Tsimiski & Salaminou 9, Thessaloniki", url: "kosherastoria.com", n: ["בהשגחת הרב יואל קפלן ו-Balkan Kosher. המקורות חלוקים לגבי החודשים שבהם היא פתוחה – בדקו לפני שמגיעים.", "Supervised by Rabbi Yoel Kaplan & Balkan Kosher. Sources differ on the months it is open – check before visiting."] },
    { name: "Yad LeZikaron Synagogue", t: ["בית כנסת", "Synagogue"], addr: "Vasileos Irakleiou 24, Thessaloniki", n: ["סגור זמנית — יש לברר מול הקהילה.", "Temporarily closed — check with the community."] },
    { name: "Jewish Museum of Thessaloniki", t: ["המוזיאון היהודי של סלוניקי", "Jewish Museum of Thessaloniki"], addr: "Agiou Mina 11, Thessaloniki", url: "jmth.gr", n: ["סגור בשבת.", "Closed on Saturday."] },
  ] },
  { city: ["רודוס", "Rhodes"], dest: "rhodes", items: [
    { name: "Chabad of Rhodes", t: ["בית חב״ד", "Chabad house"], addr: "Leof. Iraklidon 84, Ialysos, Rhodes", url: "chabadrhodes.com", n: ["חב״ד מזהירים: הרבה טברנות ברודוס שכתוב עליהן ״כשר״ אינן כשרות.", "Chabad warns that many Rhodes tavernas claiming to be “kosher” are not."] },
    { name: "Jerusalem Restaurant", t: ["מסעדה כשרה בשרית, אוכל לשבת לקחת", "Kosher meat restaurant, Shabbat food to go"], addr: "Leof. Iraklidon 84, Ialysos, Rhodes", n: ["בהשגחת חב״ד רודוס. בחורף כדאי לוודא שהיא פתוחה.", "Supervised by Chabad of Rhodes. In winter, confirm it is open."] },
    { name: "Kahal Shalom Synagogue & Jewish Museum of Rhodes", t: ["בית כנסת היסטורי ומוזיאון", "Historic synagogue & museum"], addr: "Dossiadou & Simiou, Old Town, Rhodes", url: "jewishrhodes.org", n: ["בית הכנסת משנת 1577. אתר לביקור.", "Synagogue dating from 1577. A site to visit."] },
  ] },
  { city: ["כרתים", "Crete"], dest: "crete", items: [
    { name: "Chabad of Crete", t: ["בית חב״ד, טברנה כשרה ומכולת", "Chabad house, kosher tavern & grocery"], addr: "El. Venizelou 44, Hersonissos, Crete", url: "chabadcrete.com", n: ["בחרסוניסוס (אזור הרקליון, לא בחאניה). ארוחות שבת וחג, משלוחים למלונות לפי אזור.", "In Hersonissos (Heraklion area, not Chania). Shabbat and holiday meals, delivery to hotels by area."] },
    { name: "Etz Hayyim Synagogue", t: ["בית כנסת היסטורי בחאניה", "Historic synagogue in Chania"], addr: "Parodos Kondylaki, Old Town, Chania", url: "etz-hayyim-hania.org", n: ["ביקורים בימים שני עד שישי. סגור בשבת ובראשון.", "Visits Monday to Friday. Closed Saturday and Sunday."] },
  ] },
  { city: ["קורפו", "Corfu"], dest: "corfu", items: [
    { name: "Scuola Greca Synagogue", t: ["בית כנסת", "Synagogue"], addr: "Velissariou 4, Old Town, Corfu", n: ["קהילה קטנה, אין רב קבוע, ולא מצאנו אישור לתפילות קבועות. לא מצאנו בית חב״ד או מסעדה כשרה בקורפו – אפשר להזמין משלוח מ-e-kosher.gr.", "Small community, no resident rabbi, and no regular services confirmed. No Chabad or kosher restaurant confirmed in Corfu – use e-kosher.gr delivery."] },
  ] },
  { city: ["מיקונוס (בקיץ בלבד)", "Mykonos (summer only)"], dest: "mykonos", items: [
    { name: "Chabad of Mykonos", t: ["בית חב״ד", "Chabad house"], url: "chabad-mykonos.com", n: ["פעיל בעונת הקיץ בלבד (עונת 2026 הסתיימה ב-16 באוגוסט).", "Summer season only (the 2026 season ended on 16 August)."] },
    { name: "KosherMykonos", t: ["חנות כשרה ומשלוחי ארוחות", "Kosher shop & meal delivery"], url: "koshermykonos.com", n: ["עסק עצמאי, לא של חב״ד.", "Independent, not Chabad."] },
  ] },
  { city: ["סנטוריני", "Santorini"], dest: "santorini", items: [
    { name: "KosherMykonos – Santorini", t: ["משלוחי ארוחות כשרות", "Kosher meal delivery"], url: "koshermykonos.com/pages/santorini-kosher", n: ["בסנטוריני אין בית כנסת ואין בית חב״ד. חב״ד אתונה שולחים גם למיקונוס ולסנטוריני.", "Santorini has no synagogue or Chabad. Chabad of Athens also ships to Mykonos and Santorini."] },
  ] },
];

export function shabbatPage(lang) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const title = L("זמני שבת וכשרות ביוון", "Shabbat times & kosher in Greece");
  const description = L("זמני כניסת ויציאת שבת השבוע ובשבועות הקרובים באתונה, סלוניקי, רודוס, כרתים, קורפו, מיקונוס וסנטוריני, ורשימת בתי חב״ד, מסעדות כשרות ובתי כנסת.", "Candle lighting and Shabbat end times this week and the coming weeks in Athens, Thessaloniki, Rhodes, Crete, Corfu, Mykonos and Santorini, plus Chabad houses, kosher restaurants and synagogues.");
  const cities = SHAB_CITIES.map((c) => ({ id: c.id, n: c[lang], lat: c.lat, lng: c.lng }));
  const maps = (it) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.name + (it.addr ? ", " + it.addr : ""))}`;
  const place = (it) => `<div class="kp${it.closed ? " closed" : ""}"><div class="kp-h"><b>${esc(it.name)}</b><span class="kp-t">${esc(it.t[he ? 0 : 1])}</span></div>
${it.addr ? `<div class="kp-a">📍 <span dir="ltr">${esc(it.addr)}</span></div>` : ""}
<p>${it.closed ? "⚠️ " : ""}${esc(it.n[he ? 0 : 1])}</p>
<div class="kp-l">${it.url ? `<a href="https://${esc(it.url)}" target="_blank" rel="noopener" data-out="kosher-${esc(it.url.split("/")[0])}">🌐 <span dir="ltr">${esc(it.url)}</span></a>` : ""}${it.addr ? `<a href="${maps(it)}" target="_blank" rel="noopener">🗺️ ${L("פתיחה במפות", "Open in Maps")}</a>` : ""}</div></div>`;
  const places = PLACES.map((g) => `<section class="kgroup" id="k-${g.dest}"><h3>${esc(g.city[he ? 0 : 1])} <a class="small" href="${P(lang, "/d/" + g.dest + "/")}">${L("לעמוד היעד", "Destination page")}</a></h3><div class="kps">${g.items.map(place).join("")}</div></section>`).join("");
  const jump = `<nav class="chips" aria-label="${L("ערים", "Cities")}">${PLACES.map((g) => `<a href="#k-${g.dest}">${esc(g.city[he ? 0 : 1].replace(/ \(.*\)$/, ""))}</a>`).join("")}</nav>`;
  const faq = [
    [L("איך מחושבים זמני השבת בעמוד?", "How are the Shabbat times calculated?"), L("הדלקת נרות: 18 דקות לפני השקיעה ביום שישי. צאת השבת: כשהשמש 8.5 מעלות מתחת לאופק במוצאי שבת. החישוב נעשה בדפדפן לפי מיקום העיר ובשעון יוון, כולל מעבר לשעון חורף.", "Candle lighting: 18 minutes before sunset on Friday. Shabbat ends: when the sun is 8.5° below the horizon on Saturday night. The calculation runs in your browser for each city, in Greek time, including the switch to winter time.")],
    [L("איפה יש אוכל כשר באתונה?", "Where can I find kosher food in Athens?"), L("במסעדת Gostijo בפסירי (בהשגחת חב״ד, ארוחות שבת בהזמנה מראש), במכולת של בית חב״ד באותה כתובת, ובמשלוחים של e-kosher.gr לכל יוון.", "At Gostijo restaurant in Psiri (supervised by Chabad, Shabbat meals by reservation), at the Chabad grocery at the same address, and via e-kosher.gr delivery across Greece.")],
    [L("יש אוכל כשר בכרתים?", "Is there kosher food in Crete?"), L("כן, בבית חב״ד כרתים בחרסוניסוס (אזור הרקליון), עם טברנה ומכולת כשרה ומשלוחים למלונות לפי אזור. בחאניה יש את בית הכנסת ההיסטורי עץ חיים.", "Yes, at Chabad of Crete in Hersonissos (Heraklion area), with a kosher tavern and grocery and delivery to hotels by area. Chania has the historic Etz Hayyim synagogue.")],
  ];
  const nojs = `<noscript><div class="empty-note">${L("כדי לראות את זמני השבת צריך להפעיל JavaScript בדפדפן.", "Please enable JavaScript to see the Shabbat times.")}</div></noscript>`;
  const body = `<div class="page-h"><h1>🕯️ ${esc(title)}</h1><p>${esc(description)}</p></div>
<div class="grid"><div class="col">
<section aria-labelledby="h-shnow"><div class="zone-h"><h2 id="h-shnow">${L("השבת הקרובה", "This Shabbat")}</h2><span class="eyebrow" id="shab-week"></span></div>
${nojs}
<div id="shab-app" hidden data-cities="${esc(JSON.stringify(cities))}">
<div class="shcs" id="shab-now"></div>
<div class="calc shab5" id="shab-5"><label for="shab-city">${L("זמני השבת ל-5 השבועות הקרובים ב:", "Shabbat times for the next 5 weeks in:")}<select id="shab-city"></select></label><div class="tablewrap"><table id="shab-table" class="shtable"></table></div></div>
</div>
<p class="small shnote">${L("הזמנים מחושבים לפי המנהג המקובל (הדלקת נרות 18 דקות לפני השקיעה). מומלץ לאמת מול בית חב״ד המקומי.", "Times follow the common custom (candle lighting 18 minutes before sunset; Shabbat ends when the sun is 8.5° below the horizon). We recommend checking with the local Chabad house.")} ${L("זמני ערבי חג אינם מוצגים כאן.", "Holiday eve times are not shown here.")}</p>
</section>
<section aria-labelledby="h-kosher"><div class="zone-h"><h2 id="h-kosher">${L("כשרות, בתי חב״ד ובתי כנסת", "Kosher food, Chabad and synagogues")}</h2></div>
${jump}
<p class="small">${L("המידע נבדק באוקטובר 2026; שעות ועונות משתנים – בדקו לפני ההגעה.", "Information checked in October 2026; hours and seasons change – check before you go.")}</p>
${places}
</section>
<section class="links tl-links"><a href="${P(lang, "/a/jewish-holidays-greece-chabad-kosher-synagogues/")}">✡️ ${L("חגים יהודיים ביוון: חב״ד, בתי כנסת ואוכל כשר", "Jewish holidays in Greece: Chabad, synagogues, kosher food")}</a><a href="${P(lang, "/directory/")}">🗣️ ${L("יוון בעברית: עסקים ושירותים", "Greece in Hebrew: businesses & services")}</a><a href="${P(lang, "/phrasebook/")}">💬 ${L("שיחון יוונית לישראלים", "Greek phrasebook for Israelis")}</a></section>
<section><div class="zone-h"><h2>${L("שאלות נפוצות", "Common questions")}</h2></div><div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></section>
<div class="sharebar"><button type="button" class="btn ghost" data-share>${L("📤 שתפו עם חברים", "📤 Share with friends")}</button></div>
</div>__WIDGETS__</div>
${toolScript()}`;
  return { title, description, body, faq };
}
