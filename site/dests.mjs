// Σελίδες προορισμών (/d/<id>/) + «Υπάρχει απεργία σήμερα/αύριο;» (/strike-today/) + ημερολόγιο απεργιών (/strikes.ics)
// Όλα χτίζονται από δεδομένα που ήδη έχουμε: άρθρα, οδηγοί, πτήσεις, απεργίες. Ο καιρός φορτώνει ζωντανά στον browser.
import { esc, P, card, pushBox } from "./templates.mjs";
import { FERRYHOPPER_AFF } from "./config.mjs";

// Ferryhopper: μόνο διευθύνσεις που επιβεβαιώθηκαν (03.10.2026) από τις σελίδες λιμανιών του ίδιου του Ferryhopper.
const FH = "https://www.ferryhopper.com/en/";
const fhUrl = (p) => FH + p + (FERRYHOPPER_AFF ? (p.includes("?") ? "&" : "?") + FERRYHOPPER_AFF : "");
const FERRIES = {
  athens: [["ferries/greece/piraeus", "כל המעבורות מנמל פיראוס", "All ferries from Piraeus port"]],
  rhodes: [["ferry-routes/direct/piraeus-athens-rhodes", "פיראוס ← רודוס", "Piraeus → Rhodes"]],
  crete: [["ferry-routes/direct/athens-to-heraklion", "פיראוס ← הרקליון", "Piraeus → Heraklion"], ["ferry-routes/direct/athens-to-chania", "פיראוס ← חאניה", "Piraeus → Chania"]],
  corfu: [["ferry-routes/direct/igoumenitsa-corfu", "איגומניצה ← קורפו", "Igoumenitsa → Corfu"]],
  santorini: [["ferry-routes/direct/athens-piraeus-to-santorini", "פיראוס ← סנטוריני", "Piraeus → Santorini"], ["ferry-routes/direct/rafina-santorini", "רפינה ← סנטוריני", "Rafina → Santorini"]],
  mykonos: [["ferry-routes/direct/piraeus-athens-to-mykonos", "פיראוס ← מיקונוס", "Piraeus → Mykonos"], ["ferry-routes/direct/rafina-athens-to-mykonos", "רפינה ← מיקונוס", "Rafina → Mykonos"]],
  kos: [["ferry-routes/direct/ferry-athens-kos", "פיראוס ← קוס", "Piraeus → Kos"]],
  paros: [["ferry-routes/direct/athens-piraeus-to-paros", "פיראוס ← פארוס", "Piraeus → Paros"]],
};

const H = (lang, he, en) => (lang === "he" ? he : en);
const A = (lang, slug) => P(lang, "/a/" + slug + "/");

export const DESTS = [
  { id: "athens", he: "אתונה", en: "Athens", lat: 37.98, lng: 23.73, air: ["ATH"], island: false, city: true,
    re: /athens|athenian|piraeus|attica|glyfada|kifisia|plaka|acropolis|אתונה|פיראוס|אטיקה|אקרופוליס/i,
    guides: ["jewish-museum-of-greece-athens-guide", "athens-with-yana-hebrew-tours-athens"],
    intro: ["בירת יוון והשער לאיים: חדשות, מזג אוויר עכשיו, מחיר הטיסה הזול מתל אביב ושביתות במטרו, בנמל ובשדה התעופה.", "Greece's capital and gateway to the islands: news, live weather, the cheapest flight from Tel Aviv and metro, port and airport strikes."] },
  { id: "thessaloniki", he: "סלוניקי", en: "Thessaloniki", lat: 40.64, lng: 22.94, air: ["SKG"], island: false, city: true,
    re: /thessaloniki|salonica|chalkidiki|halkidiki|סלוניקי|חלקידיקי/i,
    guides: ["jewish-history-thessaloniki-guide", "complete-guide-to-chalkidiki-for-israeli-travellers"],
    intro: ["העיר השנייה של יוון, עם היסטוריה יהודית עשירה וחופי חלקידיקי בקרבת מקום: חדשות, מזג אוויר, טיסות ושביתות.", "Greece's second city, rich in Jewish history, with Chalkidiki's beaches nearby: news, weather, flights and strikes."] },
  { id: "rhodes", he: "רודוס", en: "Rhodes", lat: 36.43, lng: 28.22, air: ["RHO"], island: true,
    re: /rhodes|rodos|dodecanese|lindos|רודוס|דודקנס|לינדוס/i,
    guides: ["rhodes-travel-guide-israeli-visitors"],
    intro: ["האי האהוב על הישראלים: חדשות מרודוס, מזג האוויר עכשיו, המחיר הזול לטיסה מתל אביב ושביתות שמשפיעות על הגעה לאי.", "Israelis' favourite island: Rhodes news, live weather, the cheapest flight from Tel Aviv and strikes affecting travel to the island."] },
  { id: "crete", he: "כרתים", en: "Crete", lat: 35.34, lng: 25.13, air: ["HER", "CHQ"], island: true,
    re: /crete|cretan|heraklion|chania|rethymno|elounda|כרתים|הרקליון|חאניה|רתימנו/i,
    guides: ["crete-travel-guide-regions-sights"],
    intro: ["האי הגדול ביוון: חדשות מכרתים, מזג האוויר בהרקליון, טיסות זולות להרקליון ולחאניה, ושביתות רלוונטיות.", "Greece's largest island: Crete news, live weather in Heraklion, cheap flights to Heraklion and Chania, and relevant strikes."] },
  { id: "corfu", he: "קורפו", en: "Corfu", lat: 39.62, lng: 19.92, air: ["CFU"], island: true,
    re: /corfu|kerkyra|ionian|קורפו|קרקירה/i,
    guides: ["complete-guide-to-corfu-island"],
    intro: ["האי הירוק של הים היוני: חדשות מקורפו, מזג אוויר, טיסות מתל אביב ושביתות שמשפיעות על מטיילים.", "The green island of the Ionian: Corfu news, weather, flights from Tel Aviv and strikes affecting travellers."] },
  { id: "santorini", he: "סנטוריני", en: "Santorini", lat: 36.42, lng: 25.43, air: ["JTR"], island: true,
    re: /santorini|thira|\bfira\b|oia|סנטוריני|תירה|איה/i,
    guides: ["santorini-travel-guide-history-and-villages"],
    intro: ["אי הזריחות והשקיעות: חדשות מסנטוריני, מזג אוויר עכשיו, טיסות מתל אביב ושביתות במעבורות ובשדה התעופה.", "The island of sunsets: Santorini news, live weather, flights from Tel Aviv and ferry and airport strikes."] },
  { id: "mykonos", he: "מיקונוס", en: "Mykonos", lat: 37.45, lng: 25.33, air: ["JMK"], island: true,
    re: /mykonos|מיקונוס/i,
    guides: ["the-comprehensive-guide-to-mykonos"],
    intro: ["אי המסיבות והחופים: חדשות ממיקונוס, מזג אוויר, מחיר הטיסה הזול מתל אביב ושביתות רלוונטיות.", "The island of parties and beaches: Mykonos news, weather, the cheapest flight from Tel Aviv and relevant strikes."] },
  { id: "kos", he: "קוס", en: "Kos", lat: 36.89, lng: 27.29, air: ["KGS"], island: true,
    re: /\bkos\b|קוס/i,
    guides: ["complete-guide-to-kos-island"],
    intro: ["אי החופים הארוכים בדודקנס: חדשות מקוס, מזג אוויר עכשיו, טיסות מתל אביב ושביתות במעבורות ובשדה התעופה.", "The Dodecanese island of long beaches: Kos news, live weather, flights from Tel Aviv and ferry and airport strikes."] },
  { id: "paros", he: "פארוס", en: "Paros", lat: 37.08, lng: 25.15, air: ["PAS"], island: true,
    re: /paros|antiparos|פארוס/i,
    guides: ["complete-guide-to-paros-island"],
    intro: ["הלב של הקיקלדים: חדשות מפארוס, מזג אוויר, מעבורות מפיראוס ושביתות שמשפיעות על הגעה לאי.", "The heart of the Cyclades: Paros news, weather, ferries from Piraeus and strikes affecting travel to the island."] },
  { id: "chalkidiki", he: "חלקידיקי", en: "Chalkidiki", lat: 40.23, lng: 23.62, air: ["SKG"], island: false,
    re: /chalkidiki|halkidiki|kassandra|sithonia|חלקידיקי/i,
    guides: ["complete-guide-to-chalkidiki-for-israeli-travellers"],
    intro: ["חצי האי של החופים ליד סלוניקי: חדשות מחלקידיקי, מזג אוויר, טיסות לסלוניקי ושביתות רלוונטיות.", "The beach peninsula near Thessaloniki: Chalkidiki news, weather, flights to Thessaloniki and relevant strikes."] },
];

// Ποιες απεργίες επηρεάζουν ποιον προορισμό
function strikeHits(d, sectors) {
  return (sectors || []).some((s) => ["flights", "public-sector", "other"].includes(s) || (s === "ferries" && (d.island || d.id === "athens")) || (["metro", "buses", "taxis", "trains"].includes(s) && d.city));
}

const haystack = (a) => [a.en && a.en.title, a.en && a.en.dek, a.he && a.he.title, a.en && a.en.body].join(" ");
const isGuide = (a) => a.guide || (a.meta && String(a.meta.itemId || "").startsWith("eg-"));

export function destNews(d, articles, n = 6) {
  return articles.filter((a) => !a.partner && !isGuide(a) && !d.guides.includes(a.slug) && d.re.test(haystack(a))).slice(0, n);
}

const sec = (title, inner, more = "") => `<section><div class="zone-h"><h2>${esc(title)}</h2>${more}</div>${inner}</section>`;

export function destPage(lang, d, ctx) {
  const { articles, FLIGHTS, strikes, fmtDay, SECTOR } = ctx;
  const he = lang === "he", name = d[lang];
  const guides = d.guides.map((s) => articles.find((a) => a.slug === s)).filter(Boolean);
  const news = destNews(d, articles);
  const deals = FLIGHTS && FLIGHTS.deals ? FLIGHTS.deals.filter((x) => d.air.includes(x.dest)).sort((a, b) => a.price - b.price) : [];
  const st = strikes.filter((a) => strikeHits(d, a.strike.sectors));
  const dm = (x) => new Date(x + "T12:00:00Z").toLocaleDateString(he ? "he-IL" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  const flightBox = deals.length ? `<a class="dcard dflight" href="${P(lang, "/flights/")}"><span class="dk">${H(lang, "טיסה זולה מתל אביב", "Cheapest flight from Tel Aviv")}</span><b dir="ltr">€${deals[0].price}</b><small>${H(lang, "הלוך־חזור", "return")} · ${esc(dm(deals[0].depart))}${deals[0].ret ? " – " + esc(dm(deals[0].ret)) : ""} · ${esc(deals[0].airline)}</small><span class="dgo">${H(lang, "לכל המחירים ←", "All prices →")}</span></a>` : "";
  const wxBox = `<div class="dcard dwx" data-lat="${d.lat}" data-lng="${d.lng}" data-lang="${lang}"><span class="dk">${H(lang, `מזג האוויר ב${name} עכשיו`, `Weather in ${name} now`)}</span><b class="dwx-now">…</b><small class="dwx-d"></small><div class="dwx-days"></div><small class="dsrc">Open-Meteo</small></div>`;
  const stBox = `<div class="dcard dstrike${st.length ? " on" : ""}"><span class="dk">${H(lang, "שביתות שמשפיעות על ההגעה", "Strikes affecting travel")}</span>${st.length ? st.slice(0, 3).map((a) => { const nx = a.strike.dates.find((x) => x >= ctx.TODAY); return `<a href="${A(lang, a.slug)}"><b>${esc(fmtDay(nx, lang))}</b> ${esc(a.strike[lang] || a[lang].title)}</a>`; }).join("") : `<b class="ok">${H(lang, "אין שביתות מתוכננות 👍", "No strikes announced 👍")}</b>`}<a class="dgo" href="${P(lang, "/strike-today/")}">${H(lang, "יש שביתה היום או מחר? ←", "Strike today or tomorrow? →")}</a></div>`;

  const fr = FERRIES[d.id] || [];
  const ferryBox = fr.length ? `<div class="dcard dferry"><span class="dk">⛴️ ${H(lang, "כרטיסים ולוחות זמנים למעבורות", "Ferry tickets & timetables")}</span><div class="dfr">${fr.map(([u, h, e]) => `<a class="btn ghost" href="${fhUrl(u)}" target="_blank" rel="noopener" data-out="ferryhopper-${d.id}">${esc(H(lang, h, e))} ↗</a>`).join("")}</div><small>${H(lang, "דרך Ferryhopper. לפני שמפליגים, בדקו אם יש שביתה במעבורות.", "Via Ferryhopper. Before you sail, check for ferry strikes.")} <a href="${P(lang, "/strike-check/")}">${H(lang, "בדיקת שביתות לפי תאריכים", "Check strikes by date")}</a></small></div>` : "";
  const title = H(lang, `${name}: חדשות, מזג אוויר, טיסות ושביתות`, `${name}: news, weather, flights and strikes`);
  const body = `<div class="hub hub-travel dest">
<header class="hub-hero"><div><span class="hs-k" style="color:#F0B650;font-weight:700">${H(lang, "יעדים ביוון", "Greek destinations")}</span><h1>${esc(name)}</h1><p>${esc(d.intro[he ? 0 : 1])}</p></div></header>
<div class="dgrid">${wxBox}${flightBox}${stBox}</div>
${ferryBox}
${guides.length ? sec(H(lang, `המדריך ל${name}`, `${name} guide`), `<div class="cards">${guides.map((a) => card(a, lang)).join("")}</div>`) : ""}
${sec(H(lang, `חדשות מ${name}`, `${name} news`), news.length ? `<div class="cards">${news.map((a) => card(a, lang)).join("")}</div>` : `<div class="empty-note">${H(lang, "עוד אין חדשות מהיעד הזה. ברגע שיהיו, הן יופיעו כאן.", "No news from here yet. They will appear here as soon as there are.")}</div>`)}
${["athens", "thessaloniki", "rhodes", "crete", "corfu", "mykonos", "santorini"].includes(d.id) ? `<a class="fteaser" href="${P(lang, "/shabbat/")}#k-${d.id}"><span class="ft-ic" aria-hidden="true">🕯️</span><span class="ft-t"><b>${H(lang, `זמני שבת וכשרות ב${name}`, `Shabbat times & kosher in ${name}`)}</b><small>${H(lang, "כניסת ויציאת שבת, חב״ד ואוכל כשר", "Candle lighting, Chabad and kosher food")}</small></span><span class="ft-go">${H(lang, "לפרטים ←", "Details →")}</span></a>` : ""}
${sec(H(lang, "יעדים נוספים", "More destinations"), destNav(lang, d.id))}
${pushBox(lang, true)}
</div>`;
  const faq = [
    [H(lang, `כמה עולה טיסה מתל אביב ל${name}?`, `How much is a flight from Tel Aviv to ${name}?`), deals.length ? H(lang, `המחיר הזול ביותר שמצאנו היום הוא €${deals[0].price} הלוך־חזור לאדם. המחירים מתעדכנים כל בוקר בעמוד הטיסות.`, `The cheapest fare we found today is €${deals[0].price} return per person. Prices update every morning on the flights page.`) : H(lang, "המחירים מתעדכנים כל בוקר בעמוד הטיסות של יוונט.", "Prices update every morning on Yavanet's flights page.")],
    [H(lang, `יש שביתות שמשפיעות על הגעה ל${name}?`, `Are there strikes affecting travel to ${name}?`), st.length ? H(lang, `כן, יש ${st.length} שביתות מתוכננות שעשויות להשפיע. הפרטים בעמוד.`, `Yes, ${st.length} announced strike(s) may affect travel. Details on this page.`) : H(lang, "כרגע לא הוכרזו שביתות שמשפיעות על מטיילים.", "No strikes affecting travellers are announced right now.")],
  ];
  return { title, description: d.intro[he ? 0 : 1], body, faq };
}

export function destNav(lang, current) {
  return `<nav class="dnav">${DESTS.map((d) => `<a href="${P(lang, "/d/" + d.id + "/")}"${d.id === current ? ' aria-current="page"' : ""}>${esc(d[lang])}</a>`).join("")}</nav>`;
}

/* «Υπάρχει απεργία σήμερα ή αύριο;» – η απάντηση υπολογίζεται και στον browser (ώρα Αθήνας), ώστε να είναι πάντα σωστή */
export function strikeTodayPage(lang, ctx) {
  const { strikeArts, TODAY, TOMORROW, SECTOR, fmtDay } = ctx;
  const he = lang === "he";
  const data = strikeArts.map((a) => ({ d: a.strike.dates, s: a.strike.sectors.map((x) => (SECTOR[x] || SECTOR.other)[he ? 0 : 1]), t: a.strike[lang] || a[lang].title, u: A(lang, a.slug) }));
  const on = (day) => data.filter((x) => x.d.includes(day));
  const up = data.map((x) => ({ ...x, n: x.d.find((d) => d >= TODAY) })).filter((x) => x.n).sort((a, b) => a.n.localeCompare(b.n)).slice(0, 6);
  const box = (key, label, day) => { const l = on(day); return `<div class="st-ans ${l.length ? "yes" : "no"}" data-day="${key}"><span class="st-l">${label}</span><b class="st-v">${l.length ? H(lang, "כן, יש שביתה", "Yes, there is a strike") : H(lang, "לא, אין שביתה", "No strike")}</b><div class="st-list">${l.map((x) => `<a href="${x.u}">${esc(x.s.join(" · "))}: ${esc(x.t)}</a>`).join("")}</div></div>`; };
  const title = H(lang, "יש שביתה היום או מחר ביוון?", "Is there a strike in Greece today or tomorrow?");
  const intro = H(lang, "תשובה מהירה: שביתות בטיסות, במעבורות, במטרו ובתחבורה הציבורית ביוון, היום ומחר. מתעדכן אוטומטית.", "The quick answer: strikes affecting flights, ferries, metro and public transport in Greece, today and tomorrow. Updated automatically.");
  const ics = "https://yavanet.gr/strikes.ics", webcal = ics.replace("https://", "webcal://");
  const body = `<div class="hub hub-travel strike-now">
<header class="hub-hero"><div><h1>${esc(title)}</h1><p>${esc(intro)}</p></div></header>
<div class="st-grid">${box("today", H(lang, "היום", "Today"), TODAY)}${box("tomorrow", H(lang, "מחר", "Tomorrow"), TOMORROW)}</div>
<script type="application/json" id="st-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<section class="st-cal"><div><h2>${H(lang, "📅 כל השביתות ביומן שלכם", "📅 Every strike in your calendar")}</h2><p>${H(lang, "הוסיפו פעם אחת, וכל שביתה חדשה תופיע אוטומטית ביומן בטלפון.", "Add it once and every new strike appears in your phone calendar automatically.")}</p></div>
<div class="st-btns"><a class="btn" href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}" target="_blank" rel="noopener">Google Calendar</a><a class="btn" href="${webcal}">${H(lang, "אייפון / Outlook", "iPhone / Outlook")}</a></div></section>
<a class="fteaser" href="${P(lang, "/strike-check/")}"><span class="ft-ic" aria-hidden="true">🧳</span><span class="ft-t"><b>${H(lang, "יש שביתה בזמן הטיול שלי?", "A strike during my trip?")}</b><small>${H(lang, "בחרו תאריכים וקבלו התראה במייל", "Pick your dates and get an email alert")}</small></span><span class="ft-go">${H(lang, "לבדיקה ←", "Check →")}</span></a>
${sec(H(lang, "השביתות הקרובות", "Upcoming strikes"), up.length ? `<div class="dstrike dcard on">${up.map((x) => `<a href="${x.u}"><b>${esc(fmtDay(x.n, lang))}</b> ${esc(x.s.join(" · "))}: ${esc(x.t)}</a>`).join("")}</div>` : `<div class="empty-note">${H(lang, "אין כרגע שביתות מתוכננות שמשפיעות על מטיילים. 👍", "No announced strikes affecting travellers right now. 👍")}</div>`, `<a class="zone-more" href="${P(lang, "/strikes/")}">${H(lang, "לכל השביתות", "All strikes")}</a>`)}
${pushBox(lang, true)}
</div>`;
  const faq = [[title, on(TODAY).length || on(TOMORROW).length ? H(lang, "כן. הפרטים המעודכנים בעמוד הזה.", "Yes. Up-to-date details on this page.") : H(lang, "נכון לעכשיו לא הוכרזו שביתות שמשפיעות על מטיילים היום או מחר.", "As of now no strikes affecting travellers are announced for today or tomorrow.")]];
  return { title, description: intro, body, faq };
}

/* Ημερολόγιο iCalendar με όλες τις απεργίες (ολοήμερα γεγονότα) */
export function strikesICS(strikeArts, SITE_URL) {
  const fold = (s) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const ev = [];
  for (const a of strikeArts) for (const d of a.strike.dates) {
    const s = d.replace(/-/g, ""), e = new Date(Date.parse(d + "T12:00:00Z") + 86400e3).toISOString().slice(0, 10).replace(/-/g, "");
    ev.push(["BEGIN:VEVENT", `UID:${a.slug}-${s}@yavanet.gr`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${s}`, `DTEND;VALUE=DATE:${e}`,
      `SUMMARY:${fold("⚠️ שביתה ביוון: " + (a.strike.he || a.he.title))}`, `DESCRIPTION:${fold((a.strike.en || a.en.title) + "\n" + SITE_URL + "/a/" + a.slug + "/")}`,
      `URL:${SITE_URL}/a/${a.slug}/`, "TRANSP:TRANSPARENT", "END:VEVENT"].join("\r\n"));
  }
  // Κανόνας iCalendar: γραμμές έως 75 bytes, οι υπόλοιπες συνεχίζουν με κενό στην αρχή
  const wrap = (line) => { const out = []; let cur = "", n = 0; for (const ch of line) { const b = Buffer.byteLength(ch); if (n + b > 73) { out.push(cur); cur = " "; n = 1; } cur += ch; n += b; } out.push(cur); return out.join("\r\n"); };
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Yavanet//Strikes//HE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:שביתות ביוון · יוונט", "X-WR-TIMEZONE:Europe/Athens", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H", ...ev, "END:VCALENDAR", ""].join("\r\n").split("\r\n").map(wrap).join("\r\n");
}
