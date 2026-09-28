export const TI = {
  travel: '<svg viewBox="0 0 24 24"><path d="M2 16l20-6-3-3-7 3-5-4-2 1 3 5-4 2-2-1-1 1z"/><path d="M3 21h18"/></svg>',
  invest: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6M12 3v2"/></svg>',
  moving: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21.5 19"/></svg>',
  calc: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2"/></svg>',
  visa: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/></svg>',
  news: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>',
  strikes: '<svg viewBox="0 0 24 24"><path d="M12 3v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4M7 17v-4a5 5 0 0 1 10 0v4"/><path d="M5 17h14v3H5z"/></svg>',
  emergency: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M12 8v6M9 11h6"/></svg>',
  cost: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/></svg>',
  madad: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  guides: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/></svg>',
  tools: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2"/></svg>',
  tlv: '<svg viewBox="0 0 24 24"><path d="M3 21V9l5-3v15M8 21h13V12l-6-4v13M11 13h1M11 17h1M17 13h1M17 17h1"/></svg>',
  flights: '<svg viewBox="0 0 24 24"><path d="M2 16l20-6-3-3-7 3-5-4-2 1 3 5-4 2-2-1-1 1z"/><path d="M3 21h18"/></svg>',
  dir: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
};
export const tileHTML = (lang, [u, k, h, sub]) => `<a class="tile t-${k}" href="${P(lang, u)}"><span class="ti" aria-hidden="true">${TI[k]}</span><span class="tt"><b>${esc(h)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span></a>`;

import { esc, P, card, pushBox, newsletterBox } from "./templates.mjs";

const A = (lang, slug) => P(lang, "/a/" + slug + "/");
const H = (lang, he, en) => (lang === "he" ? he : en);

// Οι 3 «πόρτες» της αρχικής
export function doorsHTML(lang) {
  const d = [
    ["/travel/", "travel", H(lang, "באים לחופשה", "Coming on holiday"), H(lang, "טיסות, שביתות, איים וטיולים בעברית", "Flights, strikes, islands, tours in Hebrew")],
    ["/invest/", "invest", H(lang, "משקיעים בנדל״ן", "Investing in property"), H(lang, "מחירים, מיסים, מדריכים וליווי אישי", "Prices, taxes, guides, personal guidance")],
    ["/moving/", "moving", H(lang, "עוברים לגור ביוון", "Moving to Greece"), H(lang, "ויזה, מספר מס, בתי ספר ויוקר המחיה", "Visas, tax number, schools, cost of living")],
  ];
  return `<nav class="doors" aria-label="${H(lang, "מה מביא אתכם ליוון?", "What brings you to Greece?")}">
<p class="doors-q">${H(lang, "מה מביא אתכם ליוון?", "What brings you to Greece?")}</p>
<div class="doors-row">${d.map(([u, k, t, s]) => `<a class="door d-${k}" href="${P(lang, u)}"><span class="di">${TI[k]}</span><b>${esc(t)}</b><small>${esc(s)}</small><span class="dgo" aria-hidden="true">${lang === "he" ? "←" : "→"}</span></a>`).join("")}</div>
</nav>`;
}

// Κάρτες ανθρώπων (Άσι, Yana, S.F.)
export function people(lang, which) {
  const he = lang === "he";
  const WA_ASI = "https://wa.me/972546221414?text=" + encodeURIComponent(he ? "היי אסי, הגעתי מיוונט" : "Hi Asi, I found you on Yavanet");
  const WA_YANA = "https://wa.me/306983311161?text=" + encodeURIComponent(he ? "היי יאנה, הגעתי מיוונט" : "Hi Yana, I found you on Yavanet");
  const all = {
    asi: { img: "/asi-avatar.jpg", name: he ? "אסי דורון" : "Asi Doron", role: he ? "קנייה, שיפוץ, השכרה וניהול נכסים" : "Buying, renovating, renting, management", text: he ? "9 שנים ביוון, מלווה משקיעים ישראלים מהפגישה הראשונה ועד המפתח." : "9 years in Greece, guiding Israeli investors from the first meeting to the keys.", more: A(lang, "asi-doron-real-estate-greece-hebrew"), wa: WA_ASI },
    yana: { img: "/yana-portrait.jpg", name: he ? "יאנה" : "Yana", role: he ? "טיולים, טברנות, יאכטות והסעות באתונה" : "Tours, tavernas, yachts, transfers in Athens", text: he ? "מתאמת לכם את החוויות הכי שוות באתונה, בעברית, בהודעת וואטסאפ אחת." : "Arranges the best of Athens for you, in Hebrew, in one WhatsApp message.", more: A(lang, "athens-with-yana-hebrew-tours-athens"), wa: WA_YANA },
    sf: { img: "/icon-192.png", logo: true, name: "S.F. Properties", role: he ? "נדל״ן וניהול נכסים ביוון" : "Real estate & property management", text: he ? "משרד בפילותיי, אתונה. השאירו פרטים ונחזור אליכם בעברית." : "Office in Filothei, Athens. Leave your details and we will get back to you.", more: P(lang, "/advisor/"), moreLabel: he ? "השאירו פרטים" : "Leave your details", wa: null },
  };
  return `<div class="people">${which.map((k) => { const p = all[k]; return `<div class="person">
${p.logo ? `<span class="pmono" aria-hidden="true">S.F.</span>` : `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy">`}
<div><b>${esc(p.name)}</b><span class="prole">${esc(p.role)}</span><p>${esc(p.text)}</p>
<div class="pacts">${p.wa ? `<a class="pbtn wa" href="${esc(p.wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}<a class="pbtn" href="${p.more}">${esc(p.moreLabel || (he ? "להכיר" : "Meet"))}</a></div></div></div>`; }).join("")}</div>`;
}

const sec = (h, body, more) => `<section class="hub-sec"><div class="zone-h"><h2>${h}</h2>${more || ""}</div>${body}</section>`;

export function hubPage(lang, kind, ctx) {
  const { articles, GLOBAL } = ctx;
  const he = lang === "he";
  const bySlug = (s) => articles.find((a) => a.slug === s);
  const isGuide = (a) => a.guide || (a.meta && String(a.meta.itemId || "").startsWith("eg-"));
  const cards = (list) => `<div class="cards">${list.filter(Boolean).map((a) => card(a, lang)).join("")}</div>`;
  const news = (secs, n = 4) => articles.filter((a) => secs.includes(a.section) && !isGuide(a) && !a.partner).slice(0, n);
  const T = {
    travel: {
      title: H(lang, "חופשה ביוון", "Holiday in Greece"), icon: "travel",
      intro: H(lang, "כל מה שצריך לפני ובזמן הטיול: טיסות, שביתות, מה עושים במקרה חירום, מדריכים לאיים, וטיולים בעברית.", "Everything you need before and during your trip: flights, strikes, emergencies, island guides and tours in Hebrew."),
      start: "greece-travel-guide-israelis-2026",
      tools: [["/strikes/", "strikes", H(lang, "שביתות קרובות", "Upcoming strikes"), H(lang, "טיסות, מעבורות, מטרו", "Flights, ferries, metro")], ["/emergency/", "emergency", H(lang, "חירום", "Emergency"), H(lang, "מספרים ושגרירות", "Numbers & embassy")], ...(GLOBAL.flights ? [["/flights/", "flights", H(lang, "טיסות זולות", "Cheap flights"), H(lang, "מתל אביב ליוון", "Tel Aviv to Greece")]] : []), ["/directory/", "dir", H(lang, "יוון בעברית", "Greece in Hebrew"), H(lang, "עסקים ושירותים בעברית", "Hebrew-speaking services")]],
      guides: articles.filter((a) => isGuide(a) && ["travel", "jewish-greece"].includes(a.section) && a.slug !== "greece-travel-guide-israelis-2026"),
      people: ["yana"], newsSecs: ["travel", "breaking"], newsLink: "/s/travel/",
    },
    invest: {
      title: H(lang, "השקעה בנדל״ן ביוון", "Investing in Greek property"), icon: "invest",
      intro: H(lang, "איך קונים, כמה זה עולה, איפה כדאי, ומי ילווה אתכם. מדריכים, מחירים לפי שכונה, מחשבונים וחדשות על מיסים וחוקים.", "How to buy, what it costs, where to buy and who will guide you. Guides, prices by area, calculators, and news on taxes and laws."),
      start: "buying-property-in-greece-israelis-guide",
      tools: [["/madad/", "madad", H(lang, "מחירי דירות", "Property prices"), H(lang, "מחיר למ״ר בכל שכונה", "Price per m² by area")], ["/tlv-vs-athens/", "tlv", H(lang, "תל אביב מול אתונה", "Tel Aviv vs Athens"), H(lang, "הדירה שלך = כמה דירות כאן?", "Your flat = how many here?")], ["/tools/", "calc", H(lang, "מחשבונים", "Calculators"), H(lang, "עלויות קנייה ותשואה", "Buying costs & yield")], ["/advisor/", "people", H(lang, "ייעוץ אישי", "Personal advice"), H(lang, "השאירו פרטים", "Leave your details")]],
      guides: ["golden-visa-greece-2026-guide", "managing-property-in-greece-from-israel", "greek-tax-number-and-bank-account-guide"].map(bySlug),
      people: ["asi", "sf"], newsSecs: ["real-estate"], newsLink: "/s/real-estate/",
    },
    moving: {
      title: H(lang, "לעבור לגור ביוון", "Moving to Greece"), icon: "moving",
      intro: H(lang, "ויזה, מספר מס וחשבון בנק, בתי ספר, בריאות, וכמה באמת עולה לחיות באתונה. הכול בעברית, במקום אחד.", "Visas, tax number and bank account, schools, healthcare, and what it really costs to live in Athens. All in one place."),
      start: "moving-to-greece-with-family-israelis-guide",
      tools: [["/cost-of-living/", "cost", H(lang, "יוקר המחיה", "Cost of living"), H(lang, "אתונה מול תל אביב", "Athens vs Tel Aviv")], ["/madad/", "madad", H(lang, "שכר דירה ומחירים", "Rents & prices"), H(lang, "לפי שכונה", "By area")], ["/directory/", "dir", H(lang, "יוון בעברית", "Greece in Hebrew"), H(lang, "עסקים ושירותים בעברית", "Hebrew-speaking services")], ["/emergency/", "emergency", H(lang, "חירום", "Emergency"), H(lang, "מספרים חשובים", "Key numbers")]],
      guides: ["greek-tax-number-and-bank-account-guide", "golden-visa-greece-2026-guide", "why-israeli-families-move-to-athens-thessaloniki"].map(bySlug),
      people: ["asi", "sf"], newsSecs: ["living", "israelis"], newsLink: "/s/living/",
    },
  }[kind];
  const start = bySlug(T.start);
  const body = `<div class="hub hub-${kind}">
<header class="hub-hero"><span class="hub-ic">${TI[T.icon]}</span><div><h1>${esc(T.title)}</h1><p>${esc(T.intro)}</p></div></header>
${start ? sec(H(lang, "מתחילים כאן", "Start here"), `<a class="hub-start" href="${A(lang, start.slug)}"><span class="hs-k">${H(lang, "המדריך המלא", "The complete guide")}</span><b>${esc(start[lang].title)}</b><span class="hs-d">${esc(start[lang].dek)}</span><span class="hs-go">${H(lang, "לקריאה ←", "Read →")}</span></a>`) : ""}
${sec(H(lang, "כלים שימושיים", "Useful tools"), `<nav class="tiles">${T.tools.map((x) => tileHTML(lang, x)).join("")}</nav>`)}
${T.guides.filter(Boolean).length ? sec(H(lang, "עוד מדריכים", "More guides"), cards(T.guides)) : ""}
${sec(H(lang, "האנשים שלנו", "Our people"), people(lang, T.people), `<a class="zone-more" href="${P(lang, "/contact/")}">${H(lang, "כל אנשי הקשר", "All contacts")}</a>`)}
${sec(H(lang, "חדשות אחרונות", "Latest news"), cards(news(T.newsSecs)), `<a class="zone-more" href="${P(lang, T.newsLink)}">${H(lang, "לכל החדשות", "All news")}</a>`)}
${pushBox(lang, true)}
</div>`;
  return { title: T.title, description: T.intro, body };
}

export function contactPage(lang) {
  const he = lang === "he";
  const title = H(lang, "צרו קשר: האנשים שלנו", "Contact: our people");
  const intro = H(lang, "רוצים לקנות, להשכיר, לטייל או לעבור לגור ביוון? אלה האנשים שיעזרו לכם, בעברית.", "Want to buy, rent, travel or move to Greece? These are the people who will help you, in Hebrew.");
  const body = `<div class="hub">
<header class="hub-hero"><span class="hub-ic">${TI.people}</span><div><h1>${esc(title)}</h1><p>${esc(intro)}</p></div></header>
${sec(H(lang, "נדל״ן והשקעות", "Property & investment"), people(lang, ["asi", "sf"]))}
${sec(H(lang, "טיולים וחוויות באתונה", "Tours & experiences in Athens"), people(lang, ["yana"]))}
${sec(H(lang, "יוונט", "Yavanet"), `<div class="hub-links"><a href="${P(lang, "/directory/")}">${H(lang, "מדריך עסקים בעברית", "Hebrew business directory")}</a><a href="${P(lang, "/p/advertise/")}">${H(lang, "פרסום ביוונט", "Advertise on Yavanet")}</a><a href="${P(lang, "/p/corrections/")}">${H(lang, "דיווח על טעות", "Report a mistake")}</a><a href="mailto:info@sfproperties.gr">info@sfproperties.gr</a></div>`)}
${newsletterBox(lang)}
</div>`;
  return { title, description: intro, body };
}
