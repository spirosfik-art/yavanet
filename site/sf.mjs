// Σελίδα-βιτρίνα για την S.F. Properties: το πιο «designed» άρθρο του site.
// Ενεργοποιείται όταν το άρθρο έχει a.showcase === "sf". Όλα τα κείμενα είναι εδώ, σε εβραϊκά και αγγλικά.
import { esc, P } from "./templates.mjs";

const SITE_SF = "https://sfproperties.gr";
const utm = (path, content) => `${SITE_SF}${path}${path.includes("?") ? "&" : "?"}utm_source=yavanet&utm_medium=showcase&utm_campaign=sf-profile&utm_content=${content}`;
const PHONE = "+30 690 672 3676";
const WA_NUM = "306906723676";
const wa = (he) => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(he ? "שלום! הגעתי מיוונט ואשמח לשמוע על נכסים באתונה 🏠" : "Hello! I found you on Yavanet and would like to hear about property in Athens 🏠")}`;

const IMG = (id, file) => `https://a0.muscache.com/im/pictures/hosting/Hosting-${id}/original/${file}.jpeg?im_w=960`;
const PHOTOS = [
  [IMG("1746972742935527010", "b54e021c-cfc8-4fbc-b2eb-7ab3fae2b4cd"), "ניאו פסיכיקו", "Neo Psychiko"],
  [IMG("1563682323125383246", "26513994-bc8f-470a-a26c-f879ddf98eb4"), "אתונה · גג עם נוף", "Athens · rooftop with a view"],
  [IMG("1718886687519532162", "07b516a3-7ed1-4597-9d82-c95ab0b83e06"), "קליתאה", "Kallithea"],
  [IMG("1471092267572733567", "04fa7e87-4e74-4012-91ae-b5a10b4bea5e"), "ליד האקרופוליס", "Near the Acropolis"],
  [IMG("1709295761104177340", "e6a9e1dd-34ca-4ba6-bcaa-656aae5e5df5"), "ניאה סמירני", "Nea Smyrni"],
  [IMG("1563595768895425061", "8abec3e2-cad3-4596-975c-e39319c61789"), "אתונה", "Athens"],
];
export const SF_HERO = PHOTOS[0][0];

const C = {
  he: {
    eye: "הכירו את S.F. Properties",
    h1a: "מאחורי כל דלת באתונה",
    h1b: "התחלה חדשה.",
    rotPre: "בית כדי",
    rot: ["לגור בו.", "להשקיע בו.", "להשכיר אותו.", "לחלום עליו.", "להתחיל מחדש."],
    lead: "משרד נדל״ן וניהול נכסים בפילותיי, אתונה. משכירים, מוכרים ומנהלים דירות ווילות, גם לבעלי נכסים שגרים בישראל. ומדברים איתכם בעברית.",
    site: "לאתר של S.F. Properties",
    waBtn: "וואטסאפ בעברית",
    doorHint: "דפקו על הדלת",
    stats: [["66", "", "שכירויות שסגרנו"], ["10", "", "נכסים שמכרנו"], ["4.9", "★", "דירוג ממוצע באירבנב"], ["3", "", "שפות, כולל עברית"]],
    pickT: "מה אתם מחפשים?",
    pickS: "בחרו, ונראה לכם בדיוק איך אנחנו עוזרים.",
    picks: [
      ["buy", "🏠", "לקנות דירה באתונה", ["דירות למכירה באתונה ובריביירה, מסטודיו ועד מזונט", "ליווי מהצפייה הראשונה ועד החתימה אצל הנוטריון", "אחרי הקנייה: השכרה וניהול, אם תרצו"], "לנכסים למכירה", "/en/for-sale/"],
      ["bnb", "✈️", "דירה לאירבנב", ["צילום מקצועי של הצלם שלנו, כלול בניהול", "רישום, מחיר לפי עונה ותקשורת עם האורחים", "ניקיון, מצעים, צ׳ק־אין וצ׳ק־אאוט, ודוח הכנסות חודשי"], "ניהול Airbnb", "/en/management/airbnb/"],
      ["far", "🇮🇱", "יש לי דירה, אני בישראל", ["איש קשר אחד שמכיר את הנכס שלכם", "גביית שכר דירה, חשבונות ותיקונים", "דוח חודשי על כל נכס, בלי לטוס ליוון"], "ניהול נכסים מרחוק", "/en/management/property-care/"],
      ["rent", "🔑", "לשכור דירה", ["דירות להשכרה לטווח ארוך באתונה", "צפיות בתיאום מראש", "חוזה מסודר ומסירת מפתחות"], "לדירות להשכרה", "/en/rentals/"],
      ["villa", "🌊", "וילה ליד הים", ["וילות לקונים מכל העולם", "הצגה פרטית של הנכס", "ליווי מהביקור הראשון ועד המפתח"], "לווילות", "/en/villas/"],
    ],
    svcT: "אתם נהנים מההכנסה. אנחנו עושים את כל השאר.",
    svcS: "שלוש דרכים שהנכס שלכם יעבוד בשבילכם. געו בכרטיס כדי להפוך אותו.",
    svcs: [
      ["🗝️", "השכרה לטווח ארוך", "שוכר טוב, לשנים.", "מוצאים שוכר, בודקים אותו, מנסחים את החוזה ומלווים את השכירות עד החידוש.", "/en/management/long-term-rentals/"],
      ["📸", "Airbnb והשכרה קצרה", "יותר תשואה, בלי כאב ראש.", "מקימים ומפעילים את המודעה, מהתמונה הראשונה ועד הצ׳ק־אאוט האחרון.", "/en/management/airbnb/"],
      ["🛡️", "ניהול נכס", "כתובת אחת לכל דבר.", "מושלם למי שגר בחו״ל: שומרים על הנכס כאילו הוא שלנו, ושולחים לכם דוח כל חודש.", "/en/management/property-care/"],
    ],
    flip: "הפכו ↺",
    more: "עוד פרטים",
    roadT: "מהטלפון הראשון ועד שכר הדירה הראשון",
    road: [["☎️", "ביקור והערכה", "מגיעים לנכס ומציעים מחיר ודרך לנצל אותו."], ["📷", "צילום ופרסום", "צילום מקצועי, Spitogatos, אירבנב ופרסום בחו״ל."], ["🤝", "בחירת לקוח", "עושים את הסיורים ובודקים כל מתעניין לפני שהוא מגיע אליכם."], ["✍️", "חוזה", "חוזה שכירות או חוזה מוקדם, דיווח לרשויות ומסירת מפתחות."], ["💶", "ניהול", "גבייה, חשבונות, תחזוקה ודוח חודשי."]],
    galT: "ככה אנחנו מציגים את הבית שלכם",
    galS: "כל התמונות מדירות שאנחנו מנהלים באירבנב, בצילום של הצלם שלנו.",
    whyT: "למה ישראלים עובדים איתנו",
    why: [["🗣️", "מדברים עברית"], ["📊", "דוח חודשי על כל נכס"], ["📸", "צלם מקצועי משלנו"], ["🌍", "הכול מרחוק, בלי לטוס"], ["👤", "אדם אחד שאחראי על הנכס שלכם"], ["💬", "עונים מהר בוואטסאפ"]],
    revT: "האורחים שלנו אומרים את זה הכי טוב",
    revNote: "ביקורות אמיתיות מדפי האירבנב הציבוריים של דירות שאנחנו מנהלים.",
    areasT: "איפה אנחנו פועלים",
    areas: ["קוקאקי", "פנגרטי", "פטרלונה", "קליתאה", "קיפסלי", "אקסרכיה", "גאזי", "ניאו פסיכיקו", "ניאה סמירני", "וירונאס", "פטיסיה", "גליפאדה", "וולה", "פילותיי", "קורופי"],
    endT: "יש לכם נכס באתונה, או חולמים על אחד?",
    endS: "שלחו הודעה בוואטסאפ. עונים בעברית, ואומרים לכם בכנות מה הנכס יכול להכניס.",
    call: "להתקשר",
    disc: "תוכן ממומן: S.F. Properties היא המו״לית של יוונט. האתר של S.F. Properties זמין ביוונית ובאנגלית.",
    back: [["/advisor/", "יועץ נדל״ן דובר עברית"], ["/madad/", "מחירי דירות באתונה"], ["/invest/", "נדל״ן ביוון"]],
  },
  en: {
    eye: "Meet S.F. Properties",
    h1a: "Behind every door in Athens,",
    h1b: "a new beginning.",
    rotPre: "A home to",
    rot: ["live in.", "invest in.", "rent out.", "dream about.", "start again."],
    lead: "A real-estate and property-management office in Filothei, Athens. We rent, sell and manage flats and villas, including for owners who live abroad. And we speak Hebrew, English and Greek.",
    site: "Visit S.F. Properties",
    waBtn: "WhatsApp us",
    doorHint: "Knock on the door",
    stats: [["66", "", "leases signed"], ["10", "", "properties sold"], ["4.9", "★", "average Airbnb rating"], ["3", "", "languages, incl. Hebrew"]],
    pickT: "What are you looking for?",
    pickS: "Pick one and we'll show you exactly how we help.",
    picks: [
      ["buy", "🏠", "Buy a flat in Athens", ["Flats for sale in Athens and the Riviera, from studios to maisonettes", "With you from the first viewing to the notary", "After you buy: letting and management, if you want"], "Properties for sale", "/en/for-sale/"],
      ["bnb", "✈️", "An Airbnb flat", ["Professional photos by our own photographer, included", "Listing, seasonal pricing and guest messaging", "Cleaning, linen, check-in, check-out and a monthly income report"], "Airbnb management", "/en/management/airbnb/"],
      ["far", "🌍", "I own a flat, I live abroad", ["One contact person who knows your property", "Rent collection, bills and repairs", "A monthly report on every property, no flights needed"], "Remote property care", "/en/management/property-care/"],
      ["rent", "🔑", "Rent a flat", ["Long-term rentals in Athens", "Viewings by appointment", "A proper lease and key handover"], "Flats for rent", "/en/rentals/"],
      ["villa", "🌊", "A villa by the sea", ["Villas for buyers from all over the world", "Private viewings", "With you from the first visit to the keys"], "Villas", "/en/villas/"],
    ],
    svcT: "You enjoy the income. We do everything else.",
    svcS: "Three ways to make your property work for you. Tap a card to flip it.",
    svcs: [
      ["🗝️", "Long-term rentals", "A good tenant, for years.", "We find and check the tenant, draw up the lease and follow the tenancy through to renewal.", "/en/management/long-term-rentals/"],
      ["📸", "Airbnb & short stays", "Higher yield, no running around.", "We set up and run the listing, from the first photo to the last check-out.", "/en/management/airbnb/"],
      ["🛡️", "Property care", "One point of contact for everything.", "Ideal if you live abroad: we look after the property as if it were ours and send you a report every month.", "/en/management/property-care/"],
    ],
    flip: "Flip ↺",
    more: "More",
    roadT: "From the first call to the first rent",
    road: [["☎️", "Visit & valuation", "We see the property and suggest a price and the best use."], ["📷", "Photos & marketing", "Professional photos, Spitogatos, Airbnb and advertising abroad."], ["🤝", "Choosing the client", "We run the viewings and check every candidate before they reach you."], ["✍️", "Contract", "Lease or preliminary agreement, filings and key handover."], ["💶", "Management", "Collections, bills, upkeep and a monthly report."]],
    galT: "This is how we present your home",
    galS: "Every photo is from a home we manage on Airbnb, shot by our own photographer.",
    whyT: "Why owners abroad work with us",
    why: [["🗣️", "We speak Hebrew"], ["📊", "Monthly report per property"], ["📸", "Our own photographer"], ["🌍", "All done remotely"], ["👤", "One person responsible for your home"], ["💬", "Fast replies on WhatsApp"]],
    revT: "Our guests say it best",
    revNote: "Genuine reviews from the public Airbnb pages of homes we manage.",
    areasT: "Where we work",
    areas: ["Koukaki", "Pangrati", "Petralona", "Kallithea", "Kypseli", "Exarcheia", "Gazi", "Neo Psychiko", "Nea Smyrni", "Vyronas", "Patisia", "Glyfada", "Voula", "Filothei", "Koropi"],
    endT: "Own a place in Athens, or dreaming of one?",
    endS: "Send us a WhatsApp message. We'll tell you honestly what your property can earn.",
    call: "Call",
    disc: "Sponsored content: S.F. Properties is Yavanet's publisher.",
    back: [["/advisor/", "Hebrew-speaking property adviser"], ["/madad/", "Athens property prices"], ["/invest/", "Property in Greece"]],
  },
};

const REVIEWS = [
  ["I really loved this brand new spotless place… I really recommend this beautiful studio!", "Guest from Israel · Kallithea"],
  ["We had an amazing time! Everything was perfect! … Would stay here again 10/10.", "Guest from Toronto · Nea Smyrni"],
  ["Beautiful place with a great view. Magnificent view of the sunset.", "Martin · Athens rooftop"],
  ["Good location, peaceful neighborhood, clean and tidy… Seamless check-in.", "Guest from Switzerland · Kallithea"],
  ["Brand-new apartment with everything you need, and it's very clean! Spyridon was very helpful.", "Anthi · Neo Psychiko"],
];

const ext = (href, cls, inner, label) => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener" data-sf="${esc(label)}">${inner}</a>`;

export function sfShowcase(a, lang) {
  const he = lang === "he", c = C[lang];
  const waIco = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 2.5 2.5 4.7 5 5l1.2-1.2-1.8-1-1 .8c-.8-.4-1.6-1.2-2-2l.8-1-1-1.8z"/></svg>';
  const siteBtn = (content, cls = "sfx-btn gold") => ext(utm("/en/", content), cls, `<span>${esc(c.site)}</span><i aria-hidden="true">↗</i>`, "site-" + content);
  const waBtn = (content, cls = "sfx-btn wa") => ext(wa(he), cls, `${waIco}<span>${esc(c.waBtn)}</span>`, "wa-" + content);
  const photo = (p, i, extra = "") => `<figure class="sfx-ph${extra}" style="--i:${i}"><img src="${esc(p[0])}" alt="${esc(he ? p[1] : p[2])}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption>${esc(he ? p[1] : p[2])}</figcaption></figure>`;

  return `<article class="sfx" lang="${lang}">
<header class="sfx-hero">
  <div class="sfx-blob b1" aria-hidden="true"></div><div class="sfx-blob b2" aria-hidden="true"></div>
  <div class="sfx-copy">
    <span class="sfx-eye"><img src="/sf-logo-light.png" alt="S.F. Properties" width="900" height="142"><em>${esc(c.eye)}</em> <span class="spons">${he ? "תוכן ממומן" : "Sponsored"}</span></span>
    <h1>${esc(c.h1a)}<br><span class="sfx-hl">${esc(c.h1b)}</span></h1>
    <p class="sfx-rot">${esc(c.rotPre)} <span class="sfx-rotw" data-words="${esc(JSON.stringify(c.rot))}">${esc(c.rot[0])}</span></p>
    <p class="sfx-lead">${esc(c.lead)}</p>
    <div class="sfx-ctas">${siteBtn("hero")}${waBtn("hero")}</div>
  </div>
  <button class="sfx-door" type="button" aria-label="${esc(c.doorHint)}">
    <span class="sfx-frame"><img src="${esc(PHOTOS[0][0])}" alt="${esc(he ? PHOTOS[0][1] : PHOTOS[0][2])}" fetchpriority="high" referrerpolicy="no-referrer"></span>
    <span class="sfx-leaf" aria-hidden="true"><span class="p1"></span><span class="p2"></span><span class="knob"></span><span class="num">77</span></span>
    <span class="sfx-mat" aria-hidden="true">WELCOME · ברוכים הבאים</span>
    <span class="sfx-tag t1" aria-hidden="true">🔑 ${he ? "המפתחות אצלכם" : "Keys in hand"}</span>
    <span class="sfx-tag t2" aria-hidden="true">★ 4.9 Airbnb</span>
  </button>
</header>

<div class="sfx-stats">${c.stats.map(([n, suf, l]) => `<div class="sfx-stat"><b><span class="sfx-num" data-n="${esc(n)}">${esc(n)}</span>${suf ? `<small>${esc(suf)}</small>` : ""}</b><span>${esc(l)}</span></div>`).join("")}</div>

<section class="sfx-sec sfx-pick">
  <h2>${esc(c.pickT)}</h2><p class="sfx-sub">${esc(c.pickS)}</p>
  <div class="sfx-tabs" role="radiogroup">${c.picks.map(([k, e, t], i) => `<input type="radio" name="sfx-pick" id="sfx-${k}" value="${k}"${i === 0 ? " checked" : ""}><label for="sfx-${k}"><span aria-hidden="true">${e}</span>${esc(t)}</label>`).join("")}
  <div class="sfx-panels">${c.picks.map(([k, e, t, bullets, cta, path]) => `<div class="sfx-panel" data-k="${k}"><span class="sfx-big" aria-hidden="true">${e}</span><div><h3>${esc(t)}</h3><ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>${ext(utm(path, "pick-" + k), "sfx-btn ink", `<span>${esc(cta)}</span><i aria-hidden="true">↗</i>`, "pick-" + k)}</div></div>`).join("")}</div></div>
</section>

<section class="sfx-sec">
  <h2>${esc(c.svcT)}</h2><p class="sfx-sub">${esc(c.svcS)}</p>
  <div class="sfx-flips">${c.svcs.map(([e, t, front, back, path], i) => `<div class="sfx-flip" tabindex="0" style="--i:${i}"><div class="sfx-fin"><div class="sfx-f front"><span class="sfx-big" aria-hidden="true">${e}</span><h3>${esc(t)}</h3><p>${esc(front)}</p><span class="sfx-fl">${esc(c.flip)}</span></div><div class="sfx-f back"><h3>${esc(t)}</h3><p>${esc(back)}</p>${ext(utm(path, "svc-" + i), "sfx-link", `${esc(c.more)} ↗`, "svc-" + i)}</div></div></div>`).join("")}</div>
</section>

<section class="sfx-sec sfx-road">
  <h2>${esc(c.roadT)}</h2>
  <ol>${c.road.map(([e, t, d], i) => `<li style="--i:${i}"><span class="sfx-dot" aria-hidden="true">${e}</span><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("")}</ol>
</section>

<section class="sfx-sec">
  <h2>${esc(c.galT)}</h2><p class="sfx-sub">${esc(c.galS)}</p>
  <div class="sfx-gal">${PHOTOS.slice(1).map((p, i) => photo(p, i, i === 0 ? " wide" : "")).join("")}</div>
</section>

<section class="sfx-why"><h2>${esc(c.whyT)}</h2><div>${c.why.map(([e, t], i) => `<span style="--i:${i}"><b aria-hidden="true">${e}</b>${esc(t)}</span>`).join("")}</div></section>

<section class="sfx-sec">
  <h2>${esc(c.revT)}</h2>
  <div class="sfx-revs">${REVIEWS.map(([q, n], i) => `<figure style="--i:${i}"><span class="sfx-stars" aria-label="5/5">★★★★★</span><blockquote lang="en" dir="ltr">“${esc(q)}”</blockquote><figcaption dir="ltr">${esc(n)} · Airbnb</figcaption></figure>`).join("")}</div>
  <p class="small">${esc(c.revNote)}</p>
</section>

<section class="sfx-areas" aria-label="${esc(c.areasT)}"><h3>📍 ${esc(c.areasT)}</h3>
  <div class="sfx-marq"><div class="sfx-track">${[...c.areas, ...c.areas].map((x, i) => `<span${i >= c.areas.length ? ' aria-hidden="true"' : ""}>${esc(x)}</span>`).join("")}</div></div>
</section>

<section class="sfx-end">
  <div class="sfx-blob b3" aria-hidden="true"></div>
  <h2>${esc(c.endT)}</h2><p>${esc(c.endS)}</p>
  <div class="sfx-ctas">${waBtn("end")}${siteBtn("end")}<a class="sfx-btn ghost" dir="ltr" href="tel:${PHONE.replace(/[^+\d]/g, "")}" data-sf="call">📞 ${esc(PHONE)}</a></div>
  <p class="sfx-addr">📍 ${he ? "פ. פ. גרמנו 77, פילותיי, אתונה" : "P. P. Germanou 77, Filothei, Athens"} · <a dir="ltr" href="mailto:info@sfproperties.gr" data-sf="email">info@sfproperties.gr</a></p>
</section>

<p class="pf-more">${c.back.map(([u, t]) => `<a href="${P(lang, u)}">${esc(t)}</a>`).join(" · ")}</p>
<p class="small pf-disc">${esc(c.disc)}</p>
<div class="sfx-sticky">${waBtn("sticky", "sfx-btn wa")}${siteBtn("sticky", "sfx-btn gold")}</div>
</article>`;
}
