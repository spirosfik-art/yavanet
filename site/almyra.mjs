// Σελίδα-βιτρίνα για την Almyra Natural / Almyra Skin (a.showcase === "almyra").
// Στοιχεία μόνο από το almyraskin.gr. Χωρίς διεύθυνση, χωρίς τηλέφωνο, η Ελβίρα μόνο με το μικρό της όνομα.
import { esc, P } from "./templates.mjs";

const SITE_A = "https://almyraskin.gr";
const utm = (path, c) => `${SITE_A}${path}?utm_source=yavanet&utm_medium=showcase&utm_campaign=almyra&utm_content=${c}`;
const IMG = (n) => `${SITE_A}/assets/img/${n}.jpg`;
export const ALMYRA_CARD = IMG("oils");

const C = {
  he: {
    eye: "הכירו את Almyra Natural · Almyra Skin",
    h1a: "מה שהטבע נותן,", h1b: "בבקבוק קטן.",
    lead: "לבנדר, קלנדולה, שמן זית וקצת מלח מהים. קוסמטיקה טבעית שנעשית ביד, באצוות קטנות, וטיפולי פנים הוליסטיים באתונה.",
    badges: ["🌿 בעבודת יד, באצוות קטנות", "🫒 רכיבים טבעיים", "🐰 לא נוסה על בעלי חיים"],
    site: "לאתר של Almyra", book: "לקבוע טיפול", ig: "אינסטגרם",
    wave: "טהור כמו הגלים",
    nameT: "Almyra = מלח הים",
    nameS: "ביוונית, «אלמירה» היא הטעם המלוח של הים. ככה גם המוצרים: פשוטים, טבעיים ונקיים.",
    routineT: "שגרת פנים פשוטה, בחמישה צעדים",
    routineS: "כמה מוצרים טובים, מותאמים לסוג העור שלכם. לא יותר ממה שהעור צריך. בחרו צעד:",
    steps: [
      ["01", "ניקוי", "soap", "סבון פנים", "5€", "בשיטה קרה, 100% שמן זית · 125 גרם", ["חימר ירוק ופחם פעיל", "קלנדולה ולבנדר", "כורכום וחימר אדום"]],
      ["02", "טונר", "toner", "מי פנים (טונר)", "8€", "מחזיר את ה-pH הטבעי של העור · 200 מ״ל", ["לבנדר", "מלפפון"]],
      ["03", "תיקון", "serum", "סרום פנים", "15€", "ריכוז גבוה של רכיבים פעילים · 30 מ״ל", ["חומצה היאלורונית ואלוורה", "הליכריסום וקריתמון ימי"]],
      ["04", "לחות", "cream", "קרם לחות לפנים", "15–20€", "ולצידו קרם עיניים ב-8€", ["לחות לאורך היום", "גם לאזור העיניים"]],
      ["05", "הגנה", "spf", "תחליב הגנה SPF30", "15€", "מרקם קטיפתי וקל · 30 מ״ל", ["מתאים גם לעור רגיש", "וגם לעור נוטה לאקנה"]],
    ],
    skinT: "איזה עור יש לכם?",
    skinS: "בחרו, ונראה לכם במה להתחיל, לפי ההמלצות של Almyra.",
    skins: [
      ["oily", "💧", "עור שמן", "עור שמן לא צריך ניקוי אגרסיבי, הוא צריך איזון.", ["סבון עם חימר ירוק ופחם פעיל", "טונר לבנדר", "לחות קלה", "מסכת חימר ירוק ופחם פעיל"]],
      ["dry", "🍂", "עור יבש", "הקור והחימום מייבשים את העור. שגרה עדינה עושה את ההבדל.", ["סבון קלנדולה ולבנדר", "טונר מלפפון", "קרם לחות", "משחת קלנדולה להזנה"]],
      ["mature", "🌼", "עור בוגר", "הליכריסום הוא צמח יווני שעור בוגר אוהב במיוחד.", ["סרום עם הליכריסום וחומצה היאלורונית", "קרם עיניים", "משחת הליכריסום להזנה עמוקה", "והגנה יומית SPF30"]],
      ["sens", "🌸", "עור רגיש", "פחות זה יותר: רכיבים מרגיעים ומרקמים קלים.", ["קלנדולה, שמרגיעה גירוי", "טונר עדין", "קרם לחות", "SPF30 שמתאים גם לעור רגיש"]],
    ],
    quiz: "לשאלון העור המלא (2 דקות)",
    ingT: "חמישה רכיבים שהעור שלכם אוהב",
    ings: [["💧", "חומצה היאלורונית", "נועלת לחות לעור זוהר."], ["🌼", "הליכריסום", "משקם ומחייה את העור."], ["🌸", "קלנדולה", "מרגיעה אדמומיות וגירוי."], ["🧈", "חמאת שיאה", "מזינה ומעניקה לחות עמוקה."], ["🍵", "תה ירוק", "נוגדי חמצון שמגנים מפני לחצי הסביבה."]],
    treatT: "Almyra Skin: טיפולי פנים הוליסטיים באתונה",
    treatS: "טכניקות עדינות שמחזירות לעור זוהר ואיזון, בלי זמן החלמה. מושלם גם באמצע חופשה.",
    treats: [
      ["deep", "ניקוי פנים עמוק", "60–90 דק׳"], ["diamond", "מיקרודרמבריישן יהלום", "30–45 דק׳"], ["green", "פילינג צמחי", "צמחים · אצות · אנזימים"], ["aha", "פילינג חומצות פירות (AHA)", "בעיקר בחורף"],
      ["chem", "פילינג כימי", "מרקם · גוון · זוהר"], ["microneedling", "מזותרפיה ללא מחטים · מיקרונידלינג", "45 דק׳"], ["acu2", "דיקור קוסמטי לפנים", "45–60 דק׳"], ["rejuvance", "Rejuvance: עיסוי פנים הוליסטי", "ידני לגמרי, בלי מכשירים"],
    ],
    hours: 'שני–שישי <span dir="ltr">10:00–20:00</span> · שבת <span dir="ltr">10:00–15:00</span> (שעון יוון)',
    who: "כל הטיפולים ניתנים על ידי מדענית ביו־רפואית עם התמחות באסתטיקה וקוסמטולוגיה.",
    bodyT: "הריח של יוון, לגוף ולבית",
    bodyS: "סבונים מ-100% שמן זית, שמנים יבשים, בשמים טבעיים ונרות, בתווים של יסמין, סנדלווד, מסטיקה מתוקה ותאנה.",
    body: [["bodysoap", "סבון גוף", "5€", "יסמין · סחלב · סנדלווד · מסטיקה"], ["oils", "שמן גוף יבש", "15€", "יסמין · קוקוס · סנדלווד · מסטיקה"], ["deo", "דאודורנט טבעי", "7€", "שעוות דבורים · שיאה · תה ירוק"], ["perfume", "בושם רול־און", "6€", "יסמין · מגנוליה · סנדלווד · מסטיקה"], ["shower", "סבון שמפו מוצק", "5€", "לשיער, בלי בקבוק פלסטיק"], ["candle", "נר ריחני", "13€", "100% שעווה צמחית, בלי פרפין"]],
    whyT: "למה ישראלים יאהבו את זה",
    why: [["🎁", "מתנה מאתונה שנכנסת לתיק היד", "בקבוקים קטנים של 30 מ״ל"], ["🌿", "ריח של יוון", "מסטיקה, תאנה ושיטה מתוקה"], ["✨", "טיפול פנים באמצע החופשה", "בלי זמן החלמה"], ["📦", "משלוח בכל יוון", "ללוקרים של BOX NOW"]],
    elT: "האישה שמאחורי הרעיון",
    el: "אלווירה תמיד הרגישה שטיפוח העור הוא יותר משגרת יופי: דרך להתקרב לעצמנו ולהקשיב לצרכים שלנו. היא למדה מדעים ביו־רפואיים עם התמחות באסתטיקה וקוסמטולוגיה, התמחתה בהכנת קוסמטיקה מחומרי גלם טבעיים וצמחי מרפא, ועשתה תואר שני בסביבה ובריאות בבית הספר לרפואה של אוניברסיטת אתונה. ככה נולדה Almyra.",
    elQ: "בחירות קטנות ביומיום, כמו קוסמטיקה טבעית ואוכל פחות מעובד, יכולות לתמוך באיזון ההורמונלי שלנו.",
    elBy: "אלווירה · מייסדת Almyra",
    endT: "רוצים להזמין, או לקבוע טיפול באתונה?",
    endS: "האתר של Almyra ביוונית ובאנגלית. שם אפשר להזמין מוצרים, לקבוע תור ולשאול כל שאלה.",
    disc: "תוכן בשיתוף Almyra Natural. המחירים לפי האתר של Almyra, ועשויים להשתנות.",
    back: [["/cost-of-living/", "יוקר המחיה ביוון"], ["/travel/", "חופשה ביוון"], ["/directory/", "עסקים דוברי עברית ביוון"]],
  },
  en: {
    eye: "Meet Almyra Natural · Almyra Skin",
    h1a: "What nature gives us,", h1b: "in a small bottle.",
    lead: "Lavender, calendula, olive oil and a little salt from the sea. Handmade natural cosmetics in small batches, and holistic facial treatments in Athens.",
    badges: ["🌿 Handmade in small batches", "🫒 Pure natural ingredients", "🐰 Never tested on animals"],
    site: "Visit Almyra", book: "Book a treatment", ig: "Instagram",
    wave: "As pure as the waves",
    nameT: "Almyra = the salt of the sea",
    nameS: "In Greek, “almyra” is the salty taste of the sea. The products follow suit: simple, natural and clean.",
    routineT: "A simple face routine, in five steps",
    routineS: "A few good products, suited to your skin. Nothing more than your skin needs. Pick a step:",
    steps: [
      ["01", "Cleanse", "soap", "Face soap", "5€", "Cold process, 100% olive oil · 125g", ["Green clay & activated charcoal", "Calendula & lavender", "Turmeric & red clay"]],
      ["02", "Tone", "toner", "Toning lotion", "8€", "Restores the skin's natural pH · 200ml", ["Lavender", "Cucumber"]],
      ["03", "Repair", "serum", "Face serum", "15€", "High concentration of actives · 30ml", ["Hyaluronic acid & aloe", "Helichrysum & rock samphire"]],
      ["04", "Hydrate", "cream", "Moisturising face cream", "15–20€", "Plus an eye cream at 8€", ["All-day moisture", "Also for the eye area"]],
      ["05", "Protect", "spf", "Sunscreen lotion SPF30", "15€", "Velvety, light texture · 30ml", ["Also for sensitive skin", "And for acne-prone skin"]],
    ],
    skinT: "What's your skin like?",
    skinS: "Pick one and see where to start, following Almyra's own advice.",
    skins: [
      ["oily", "💧", "Oily skin", "Oily skin doesn't need harsh cleansing; it needs balance.", ["Green clay & charcoal soap", "Lavender toner", "Light hydration", "Green clay & charcoal mask"]],
      ["dry", "🍂", "Dry skin", "Cold weather and heating dry the skin out. A gentle routine makes the difference.", ["Calendula & lavender soap", "Cucumber toner", "Moisturising cream", "Calendula salve for nourishment"]],
      ["mature", "🌼", "Mature skin", "Helichrysum is a Greek herb that mature skin loves.", ["Serum with helichrysum & hyaluronic acid", "Eye cream", "Helichrysum salve for deep nourishment", "Daily SPF30"]],
      ["sens", "🌸", "Sensitive skin", "Less is more: soothing ingredients and light textures.", ["Calendula, which soothes irritation", "A gentle toner", "Moisturising cream", "SPF30, suitable for sensitive skin"]],
    ],
    quiz: "Take the full skin quiz (2 minutes)",
    ingT: "Five ingredients your skin loves",
    ings: [["💧", "Hyaluronic acid", "Locks in moisture for glowing skin."], ["🌼", "Helichrysum", "Repairs and revitalises the skin."], ["🌸", "Calendula", "Soothes and calms irritation."], ["🧈", "Shea butter", "Deeply hydrates and nourishes."], ["🍵", "Green tea", "Antioxidants against environmental stress."]],
    treatT: "Almyra Skin: holistic facial treatments in Athens",
    treatS: "Gentle techniques that bring back glow and balance, with no recovery time. Perfect even mid-holiday.",
    treats: [
      ["deep", "Deep facial cleansing", "60–90 min"], ["diamond", "Diamond microdermabrasion", "30–45 min"], ["green", "Herbal peel", "Herbs · algae · enzymes"], ["aha", "Fruit acid peel (AHA)", "Mainly in winter"],
      ["chem", "Chemical peel", "Texture · tone · radiance"], ["microneedling", "Needle-free mesotherapy · Microneedling", "45 min"], ["acu2", "Cosmetic facial acupuncture", "45–60 min"], ["rejuvance", "Rejuvance: holistic face massage", "Purely manual, no machines"],
    ],
    hours: "Mon–Fri 10:00–20:00 · Sat 10:00–15:00 (Greek time)",
    who: "All treatments are carried out by a Biomedical Scientist specialising in Aesthetics and Cosmetology.",
    bodyT: "The scent of Greece, for body and home",
    bodyS: "Soaps made from 100% olive oil, dry oils, natural perfumes and candles, with notes of jasmine, sandalwood, sweet mastic and fig.",
    body: [["bodysoap", "Body soap", "5€", "Jasmine · orchid · sandalwood · mastic"], ["oils", "Dry body oil", "15€", "Jasmine · coconut · sandalwood · mastic"], ["deo", "Natural deodorant", "7€", "Beeswax · shea · green tea"], ["perfume", "Roll-on perfume", "6€", "Jasmine · magnolia · sandalwood · mastic"], ["shower", "Shampoo bar", "5€", "For hair, no plastic bottle"], ["candle", "Scented candle", "13€", "100% plant wax, no paraffin"]],
    whyT: "Why travellers love it",
    why: [["🎁", "A gift from Athens for your hand luggage", "Small 30ml bottles"], ["🌿", "The scent of Greece", "Mastic, fig and sweet acacia"], ["✨", "A facial mid-holiday", "No recovery time"], ["📦", "Delivery across Greece", "To BOX NOW lockers"]],
    elT: "The person behind the idea",
    el: "Elvira has always felt that skincare is more than a beauty routine: a way of coming closer to ourselves and listening to our needs. She studied Biomedical Sciences, specialising in Aesthetics and Cosmetology, went on to specialise in cosmetics from natural raw materials and medicinal plants, and completed a master's in Environment and Health at the School of Medicine of the University of Athens. That is how Almyra was born.",
    elQ: "Small everyday choices, like natural cosmetics and less processed food, can support our hormonal balance.",
    elBy: "Elvira · founder of Almyra",
    endT: "Want to order, or book a treatment in Athens?",
    endS: "Almyra's website is in Greek and English. You can order products, book an appointment and ask anything there.",
    disc: "Content in partnership with Almyra Natural. Prices as listed on Almyra's website and subject to change.",
    back: [["/cost-of-living/", "Cost of living in Greece"], ["/travel/", "Holiday in Greece"], ["/directory/", "Hebrew-speaking businesses"]],
  },
};

const out = (href, cls, inner, label) => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener" data-out="almyra-${esc(label)}">${inner}</a>`;
const img = (n, alt, extra = "") => `<img src="${IMG(n)}" alt="${esc(alt)}" loading="lazy" decoding="async"${extra}>`;

// Μικρά SVG λουλούδια για τη διακόσμηση
const LAV = '<svg viewBox="0 0 40 120" aria-hidden="true"><path d="M20 120V30" stroke="#6B7B4B" stroke-width="3" fill="none"/><path d="M20 80q-12-6-16-18M20 90q12-6 16-18" stroke="#6B7B4B" stroke-width="3" fill="none"/>' + [8, 18, 28, 38, 48].map((y, i) => `<ellipse cx="${i % 2 ? 25 : 15}" cy="${y}" rx="6" ry="8" fill="#9C88D0"/>`).join("") + "</svg>";
const CAL = '<svg viewBox="0 0 80 140" aria-hidden="true"><path d="M40 140V60" stroke="#6B7B4B" stroke-width="3" fill="none"/><path d="M40 110q-18-4-24-20" stroke="#6B7B4B" stroke-width="3" fill="none"/>' + Array.from({ length: 12 }, (_, i) => `<ellipse cx="40" cy="22" rx="6" ry="17" fill="#F2A93B" transform="rotate(${i * 30} 40 40)"/>`).join("") + '<circle cx="40" cy="40" r="10" fill="#B8641E"/></svg>';
const OLV = '<svg viewBox="0 0 90 90" aria-hidden="true"><path d="M5 85Q40 50 85 8" stroke="#6B7B4B" stroke-width="3" fill="none"/>' + [[25, 62, -40], [42, 46, 30], [58, 32, -40], [70, 20, 30]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="5" fill="#8A9A5B" transform="rotate(${r} ${x} ${y})"/>`).join("") + '<ellipse cx="50" cy="58" rx="6" ry="8" fill="#3E4A2F"/></svg>';

export function almyraShowcase(a, lang) {
  const he = lang === "he", c = C[lang];
  const siteBtn = (k, cls = "alm-btn olive") => out(utm("/en/", k), cls, `<span>${esc(c.site)}</span><i aria-hidden="true">↗</i>`, "site-" + k);
  const bookBtn = (k, cls = "alm-btn clay") => out(utm("/en/treatments", k), cls, `<span>${esc(c.book)}</span><i aria-hidden="true">↗</i>`, "book-" + k);
  const igBtn = out("https://www.instagram.com/almyra_skin/", "alm-btn ghost", `<span>📷 ${esc(c.ig)}</span>`, "ig");
  return `<article class="alm" lang="${lang}">
<header class="alm-hero">
  <span class="alm-fl f1">${LAV}</span><span class="alm-fl f2">${CAL}</span><span class="alm-fl f3">${OLV}</span><span class="alm-fl f4">${LAV}</span>
  <div class="alm-copy">
    <span class="alm-eye"><img src="${SITE_A}/assets/img/emblem.png" alt="" width="28" height="28"> ${esc(c.eye)}</span>
    <h1>${esc(c.h1a)}<br><em>${esc(c.h1b)}</em></h1>
    <p class="alm-lead">${esc(c.lead)}</p>
    <div class="alm-badges">${c.badges.map((b) => `<span>${esc(b)}</span>`).join("")}</div>
    <div class="alm-ctas">${siteBtn("hero")}${bookBtn("hero")}</div>
  </div>
  <div class="alm-polas" aria-hidden="true">
    <figure class="p1">${img("catalog", "")}</figure>
    <figure class="p2">${img("darksoaps", "")}</figure>
    <figure class="p3">${img("oils", "")}</figure>
    <span class="alm-bubble">${esc(c.wave)} 🌊</span>
  </div>
  <svg class="alm-waves" viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 Q150 10 300 40 T600 40 T900 40 T1200 40 V80 H0Z" fill="#DCE3D2"/><path d="M0 55 Q150 30 300 55 T600 55 T900 55 T1200 55 V80 H0Z" fill="#C8D3BA"/></svg>
</header>

<section class="alm-name"><b>${esc(c.nameT)}</b><span>${esc(c.nameS)}</span></section>

<section class="alm-sec">
  <h2>${esc(c.routineT)}</h2><p class="alm-sub">${esc(c.routineS)}</p>
  <div class="alm-steps">${c.steps.map(([n, t], i) => `<input type="radio" name="alm-step" id="alm-s${i}"${i === 0 ? " checked" : ""}><label for="alm-s${i}"><b>${n}</b>${esc(t)}</label>`).join("")}
  <div class="alm-stepcards">${c.steps.map(([n, t, im, name, price, note, list], i) => `<div class="alm-stepcard" data-i="${i}"><div class="alm-simg">${img(im, name)}<span class="alm-price">${esc(price)}</span></div><div><span class="alm-kick">${he ? "צעד" : "Step"} ${n} · ${esc(t)}</span><h3>${esc(name)}</h3><p>${esc(note)}</p><ul>${list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`).join("")}</div></div>
</section>

<section class="alm-sec alm-skin">
  <h2>${esc(c.skinT)}</h2><p class="alm-sub">${esc(c.skinS)}</p>
  <div class="alm-chips">${c.skins.map(([k, e, t], i) => `<input type="radio" name="alm-skin" id="alm-k${k}" value="${k}"${i === 0 ? " checked" : ""}><label for="alm-k${k}"><span aria-hidden="true">${e}</span>${esc(t)}</label>`).join("")}
  <div class="alm-skinres">${c.skins.map(([k, e, t, intro, list]) => `<div class="alm-res" data-k="${k}"><span class="alm-bige" aria-hidden="true">${e}</span><div><h3>${esc(t)}</h3><p>${esc(intro)}</p><ol>${list.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div></div>`).join("")}</div></div>
  ${out(utm("/en/quiz", "quiz"), "alm-link", `${esc(c.quiz)} ↗`, "quiz")}
</section>

<section class="alm-sec">
  <h2>${esc(c.ingT)}</h2>
  <div class="alm-seeds">${c.ings.map(([e, t, d], i) => `<div class="alm-seed" style="--i:${i}"><span class="alm-seede" aria-hidden="true">${e}</span><b>${esc(t)}</b><span>${esc(d)}</span><small>${["i", "ii", "iii", "iv", "v"][i]}.</small></div>`).join("")}</div>
</section>

<section class="alm-sec alm-treat">
  <h2>${esc(c.treatT)}</h2><p class="alm-sub">${esc(c.treatS)}</p>
  <div class="alm-tgrid">${c.treats.map(([im, t, d], i) => `<div class="alm-t${i === 7 ? " wide" : ""}">${img(im, t)}<div><b>${esc(t)}</b><span>${esc(d)}</span></div></div>`).join("")}</div>
  <p class="alm-hours">🕙 ${c.hours}</p>
  <p class="alm-who">👩‍🔬 ${esc(c.who)}</p>
  <div class="alm-ctas">${bookBtn("treat")}</div>
</section>

<section class="alm-sec">
  <h2>${esc(c.bodyT)}</h2><p class="alm-sub">${esc(c.bodyS)}</p>
  <div class="alm-shelf">${c.body.map(([im, t, p, d], i) => `<figure style="--i:${i}">${img(im, t)}<span class="alm-tag">${esc(p)}</span><figcaption><b>${esc(t)}</b><span>${esc(d)}</span></figcaption></figure>`).join("")}</div>
</section>

<section class="alm-why"><h2>${esc(c.whyT)}</h2><div>${c.why.map(([e, t, d]) => `<div><span aria-hidden="true">${e}</span><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join("")}</div></section>

<section class="alm-el">
  <div class="alm-elimg">${img("bouquet", he ? "זר פרחי בר" : "Wildflower bouquet")}</div>
  <div><h2>${esc(c.elT)}</h2><p>${esc(c.el)}</p><blockquote>“${esc(c.elQ)}”<cite>${esc(c.elBy)}</cite></blockquote></div>
</section>

<section class="alm-end">
  <span class="alm-fl f5">${CAL}</span><span class="alm-fl f6">${LAV}</span>
  <h2>${esc(c.endT)}</h2><p>${esc(c.endS)}</p>
  <div class="alm-ctas">${siteBtn("end")}${bookBtn("end")}${igBtn}</div>
</section>

<p class="pf-more">${c.back.map(([u, t]) => `<a href="${P(lang, u)}">${esc(t)}</a>`).join(" · ")}</p>
<p class="small pf-disc">${esc(c.disc)}</p>
</article>`;
}
