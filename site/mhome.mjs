// Αρχική σελίδα για ΚΙΝΗΤΟ σε στυλ εφαρμογής (σκούρο μπλε + χρυσό).
// Εμφανίζεται μόνο σε οθόνες ≤760px· στον υπολογιστή μένει η κανονική αρχική (βλ. styles.css «.mh»).
// Ίδιο περιεχόμενο και σύνδεσμοι με την κανονική αρχική (το Google βλέπει τα ίδια άρθρα).

// Λεπτά εικονίδια (στυλ Lucide, γραμμή 1.5)
const I = {
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sunset: '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  news: '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  cap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  bank: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  grid: '<path d="M8 6v12M12 6v12M16 6v12"/>',
};
export const mi = (k, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

// Ηλιακός υπολογισμός (NOAA): λεπτά της ημέρας (ώρα Ελλάδας) για ζενίθ z (90.833 = δύση, 98.5 = έξοδος Σαββάτου)
function sunMin(lat, lng, y, m, d, zen, tz) {
  const N = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5);
  const g = (2 * Math.PI / 365) * (N - 1);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const r = (x) => (x * Math.PI) / 180;
  const ha = (Math.acos(Math.cos(r(zen)) / (Math.cos(r(lat)) * Math.cos(decl)) - Math.tan(r(lat)) * Math.tan(decl)) * 180) / Math.PI;
  return 720 - 4 * (lng - ha) - eqt + tz * 60;
}
const hm = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}`;
// Ζώνη ώρας Ελλάδας για μια ημερομηνία (2 ή 3)
const grTz = (y, m, d) => { const s = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }).format(new Date(Date.UTC(y, m - 1, d, 12))); return Number(s) - 12; };

// Η επόμενη (ή η σημερινή) Παρασκευή, ώρα Αθήνας
function nextFriday(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Athens", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(now).map((x) => [x.type, x.value]));
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  const add = wd === 6 ? 6 : (5 - wd + 7) % 7; // Σάββατο → επόμενη Παρασκευή
  const dt = new Date(Date.UTC(+p.year, +p.month - 1, +p.day + add));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export function shabbatStrip(lang) {
  const f = nextFriday();
  const tz = grTz(f.y, f.m, f.d);
  const sat = new Date(Date.UTC(f.y, f.m - 1, f.d + 1));
  const C = [["אתונה", "Athens", 37.984, 23.728], ["סלוניקי", "Thessaloniki", 40.64, 22.944], ["כרתים", "Crete", 35.339, 25.144], ["רודוס", "Rhodes", 36.434, 28.217]];
  const cand = C.map(([he, en, la, lo]) => [lang === "he" ? he : en, hm(sunMin(la, lo, f.y, f.m, f.d, 90.833, tz) - 18)]);
  const out = hm(sunMin(37.984, 23.728, sat.getUTCFullYear(), sat.getUTCMonth() + 1, sat.getUTCDate(), 98.5, tz));
  const sunset = hm(sunMin(37.984, 23.728, f.y, f.m, f.d, 90.833, tz));
  const item = (icon, label, time, on = false) => `<a class="mh-t${on ? " on" : ""}" href="${lang === "he" ? "/shabbat/" : "/en/shabbat/"}">${mi(icon, 18)}<span>${label}</span><b>${time}</b></a>`;
  const date = `${f.d}.${f.m}`;
  return { date, html: cand.map(([n, t]) => item("flame", n, t)).join("") + item("moon", lang === "he" ? "צאת שבת" : "Ends", out, true) + item("sunset", lang === "he" ? "שקיעה" : "Sunset", sunset) };
}

export function mobileHome({ lang, articles, photoOf, P, esc, SECTIONS, fmtDate, waLink }) {
  const he = lang === "he";
  const L = (h, e) => (he ? h : e);
  const pub = articles.filter((a) => !a.partner && !a.sponsored && !a.hidden);
  const withPhoto = (a) => a.image && a.image.type === "photo";
  const guides = pub.filter((a) => a.guide && withPhoto(a) && a.section !== "politics");
  const hero = guides[0] || pub.find(withPhoto) || pub[0];
  const news = pub.filter((a) => !a.guide && a.slug !== (hero && hero.slug)).slice(0, 7);
  const more = guides.filter((a) => a !== hero).slice(0, 6);
  const url = (a) => P(lang, `/a/${a.slug}/`);
  const img = (a, w, h) => (withPhoto(a) ? photoOf(a, w, h) : null);
  const sh = shabbatStrip(lang);
  const svc = [
    ["news", L("חדשות", "News"), "/s/israelis/"],
    ["plane", L("טיסות", "Flights"), "/flights/"],
    ["flame", L("שבת וכשר", "Shabbat"), "/shabbat/"],
    ["house", L("נדל״ן", "Property"), "/invest/"],
    ["alert", L("שביתות", "Strikes"), "/strikes/"],
  ];
  const head = (title, href) => `<div class="mh-h"><h2>${title}</h2><a href="${P(lang, href)}">${mi("grid", 11)}${L("הצג הכל", "View all")}</a></div>`;
  const time = (a) => { const d = new Date(a.publishedAt), ago = (Date.now() - d) / 6e4; return ago < 60 ? L(`לפני ${Math.max(1, Math.round(ago))} דק׳`, `${Math.max(1, Math.round(ago))} min ago`) : ago < 1440 ? L(`לפני ${Math.round(ago / 60)} שע׳`, `${Math.round(ago / 60)} h ago`) : fmtDate(a.publishedAt, lang).split(",")[0]; };
  const secName = (a) => (SECTIONS.find((s) => s.slug === a.section) || {})[lang] || "";
  return `<div class="mh">
  <div class="mh-top">
    <a class="mh-loc" href="${P(lang, "/")}">${mi("pin", 18)}${L("יוונט · יוון בעברית", "Yavanet · Greece in English")}</a>
    <div class="mh-ic"><button type="button" data-search aria-label="${L("חיפוש", "Search")}">${mi("search")}</button><button type="button" data-menu aria-label="${L("תפריט", "Menu")}">${mi("menu")}</button></div>
  </div>
  <div class="mh-sh-l">${L(`שבת · שישי ${sh.date}`, `Shabbat · Friday ${sh.date}`)}</div>
  <nav class="mh-times" aria-label="${L("זמני שבת", "Shabbat times")}">${sh.html}</nav>
  ${hero ? `<a class="mh-hero" href="${url(hero)}">${img(hero, 800, 450) ? `<img src="${esc(img(hero, 800, 450))}" alt="${esc(hero[lang].title)}" width="800" height="450" fetchpriority="high">` : ""}<span class="mh-hero-t"><small>${L("המדריך של השבוע", "Guide of the week")}</small><b>${esc(hero[lang].title)}</b></span><span class="mh-btn">${L("לקריאה", "Read")}</span></a>` : ""}
  <section>${head(L("שירותים", "Services"), "/tools/")}
    <div class="mh-svc">${svc.map(([k, n, u]) => `<a href="${P(lang, u)}">${mi(k)}<span>${n}</span></a>`).join("")}</div>
  </section>
  <section>${head(L("מבזקים מיוון", "Latest from Greece"), "/s/breaking/")}
    <nav class="mh-chips" aria-label="${L("מדורים", "Sections")}"><a class="on" href="${P(lang, "/")}">${L("הכל", "All")}</a>${SECTIONS.filter((s) => s.slug !== "politics").map((s) => `<a href="${P(lang, `/s/${s.slug}/`)}">${esc(s[lang])}</a>`).join("")}</nav>
    <div class="mh-news">${news.map((a) => `<a href="${url(a)}">${img(a, 160, 160) ? `<img src="${esc(img(a, 160, 160))}" alt="" width="72" height="72" loading="lazy">` : `<span class="mh-ph">${mi("news")}</span>`}<span><b>${esc(a[lang].title)}</b><small>${mi("clock", 13)}${esc(secName(a))} · ${time(a)}</small></span></a>`).join("")}</div>
  </section>
  ${more.length ? `<section>${head(L("מדריכים פופולריים", "Popular guides"), "/guides/")}
    <div class="mh-row">${more.map((a) => `<a class="mh-card" href="${url(a)}">${img(a, 560, 320) ? `<img src="${esc(img(a, 560, 320))}" alt="" width="280" height="160" loading="lazy">` : ""}<b>${esc(a[lang].title)}</b></a>`).join("")}</div>
  </section>` : ""}
  <section>${head(L("נדל״ן ביוון", "Property in Greece"), "/invest/")}
    <div class="mh-re">
      <a href="${P(lang, "/a/golden-visa-greece-2026-guide/")}">${mi("bank", 24)}<b>${L("גולדן ויזה 2026", "Golden Visa 2026")}</b><small>${L("תנאים ותהליך", "Rules and process")}</small></a>
      <a href="${P(lang, "/a/mortgage-greece-israelis-guide/")}">${mi("house", 24)}<b>${L("משכנתא לישראלים", "Mortgages for Israelis")}</b><small>${L("מה הבנקים דורשים", "What banks ask for")}</small></a>
      <a href="${P(lang, "/a/buying-property-in-greece-israelis-guide/")}">${mi("receipt", 24)}<b>${L("קניית דירה ביוון", "Buying a home")}</b><small>${L("שלב אחר שלב", "Step by step")}</small></a>
      <a href="${P(lang, "/madad/")}">${mi("map", 24)}<b>${L("מחירי דירות", "Property prices")}</b><small>${L("מחיר למ״ר בכל שכונה", "Price per m² by area")}</small></a>
    </div>
    <a class="mh-cta" href="${waLink}" target="_blank" rel="noopener" data-out="wa-buy-home-mobile"><span><b>${L("רוצים לקנות דירה ביוון?", "Thinking of buying in Greece?")}</b><small>${L("ייעוץ בעברית עם S.F. Properties", "Advice from S.F. Properties")}</small></span><span class="mh-wa">${mi("chat", 16)}${L("וואטסאפ", "WhatsApp")}</span></a>
  </section>
</div>`;
}
