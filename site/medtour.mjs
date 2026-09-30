// Βιτρίνα: Airbnb δίπλα σε ιδιωτικά νοσοκομεία (Άσι Ντόρον + S.F. Properties).
// Ενεργοποιείται όταν το άρθρο έχει a.showcase === "medtour". Όλα τα κείμενα είναι εδώ, σε εβραϊκά και αγγλικά.
import { esc, P, formBox } from "./templates.mjs";

const WA_ASI = "972546221414";
const wa = (he) => `https://wa.me/${WA_ASI}?text=${encodeURIComponent(he ? "היי אסי, קראתי ביוונט על הפרויקט של Airbnb ליד בתי החולים באתונה ואשמח לשמוע פרטים" : "Hi Asi, I read on Yavanet about the Airbnb project near the hospitals in Athens and would like to hear more")}`;
const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=70`;
const HERO = "https://a0.muscache.com/im/pictures/hosting/Hosting-1746972742935527010/original/b54e021c-cfc8-4fbc-b2eb-7ab3fae2b4cd.jpeg?im_w=1200";

const IC = {
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  plane: '<path d="M2 16l20-8-6 12-3-5-5-1z"/><path d="M13 15l3-7"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  cross: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
  wa: '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 2.5 2.5 4.7 5 5l1.2-1.2-1.8-1-1 .8c-.8-.4-1.6-1.2-2-2l.8-1-1-1.8z"/>',
  fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;

const C = {
  he: {
    eye: "פרויקט חדש · נדל״ן באתונה",
    spons: "בשיתוף פעולה",
    h1a: "90% תפוסה, כל השנה.",
    h1b: "גם בחורף.",
    dek: "אסי דורון ו-S.F. Properties פתחו דירות Airbnb באזורים נבחרים ומאוד ממוקדים, ליד בתי חולים פרטיים גדולים. רוב האורחים הם יוונים מכל הארץ שמגיעים לאתונה לניתוחים ולטיפולים, ולכן הדירות מלאות גם בחורף.",
    wa: "שלחו הודעה לאסי",
    form: "אני רוצה לשמוע על הפרויקט",
    statL: "תפוסה",
    statS: "רוב האורחים יוונים",
    sceneT: "זה מתחיל במשפחה אחת מכרתים",
    scene: "אבא צריך טיפול. הרופא הכי טוב נמצא בבית חולים פרטי באתונה, שעה טיסה מהבית. אמא והבת מגיעות איתו. הן לא מחפשות מלון יקר במרכז העיר, הן מחפשות דירה שקטה ונקייה, עם מטבח, חמש דקות מבית החולים.",
    scene3: "והם לא באו רק פעם אחת. הם הזמינו את הדירה בפעם הראשונה, ומאז, בגלל שהטיפולים חוזרים לעיתים קרובות, הם מבקשים מאיתנו את אותה דירה בכל פעם שהם מגיעים לאתונה. הם כבר מרגישים בה בבית.",
    scene2: "וזה לא קורה רק למשפחה אחת. זה קורה כל יום, כל השנה, למשפחות מכל יוון.",
    oppT: "ההזדמנות שהתיירים לא רואים",
    opp: "רוב ה-Airbnb באתונה בנויים על תיירים, ולכן תלויים בעונה ובטיסות. אבל באתונה יש עוד ביקוש, יווני ויציב: בתי החולים הפרטיים הגדולים של יוון נמצאים כאן. מי שגר בכפר, באי או בעיר קטנה, מגיע לאתונה לניתוחים, לבדיקות ולטיפולים, ותמיד עם בן משפחה שמלווה אותו.",
    areasT: "איפה הדירות נמצאות",
    areas: [
      ["אזורים מאוד ממוקדים", "לא בוחרים דירה בכל מקום. האזורים נבחרו בקפידה, לפי הקרבה לבתי החולים הפרטיים הגדולים ולביקוש של המשפחות."],
      ["דקות מבית החולים", "שכונות שקטות של משפחות, קרוב לבית החולים ועם תחבורה נוחה. בדיוק מה שמשפחה צריכה אחרי ניתוח."],
    ],
    cmpT: "Airbnb רגיל מול Airbnb ליד בית חולים",
    cmpA: "Airbnb לתיירים",
    cmpB: "Airbnb ליד בית חולים",
    cmp: [
      ["עונה", "חזק בקיץ, חלש בחורף", "כל השנה, גם בינואר"],
      ["מי האורחים", "תיירים מכל העולם", "בעיקר משפחות יווניות שמגיעות לטיפול"],
      ["אורך השהייה", "לרוב כמה לילות", "לרוב ימים ארוכים יותר"],
      ["תלות בטיסות ובתיירות", "גבוהה", "נמוכה"],
      ["שכנים", "לפעמים רעש ומזוודות בלילה", "אורחים שקטים ומתחשבים"],
      ["תפוסה", "משתנה לפי העונה", "90%"],
    ],
    whyT: "למה זה עובד",
    why: [
      ["cal", "אין עונה", "ינואר מלא כמו אוגוסט. אנשים לא דוחים ניתוח בגלל מזג האוויר."],
      ["plane", "לא תלוי רק בתיירות", "רוב הביקוש מגיע מתוך יוון, ולכן פחות תלוי בטיסות, במשברים או באופנות."],
      ["moon", "אורחים שקטים", "באים להחלים, לא למסיבות. השכנים מרוצים, והדירה נשמרת."],
      ["home", "שכונות של משפחות", "שקט, ירוק ונוח, בלי הלחץ של אזורי התיירות."],
    ],
    teamT: "מי עומד מאחורי הפרויקט",
    asiR: "AS-IS by Asi Doron",
    asiT: "מלווה משקיעים ישראלים כבר 9 שנים, בעברית: בחירת הנכס, בדיקות, קנייה ושיפוץ. המשקיעים שלו מקבלים את המספרים האמיתיים, כפי שהם.",
    sfR: "S.F. Properties",
    sfT: "משרד נדל״ן וניהול נכסים יווני באתונה: הפעלת ה-Airbnb, אורחים, ניקיון ותחזוקה, יום אחרי יום. הצוות המקומי שדואג שהכול יעבוד.",
    teamNote: "ביחד זה אומר שהמשקיע לא קונה רק דירה. הוא נכנס למודל שכבר עובד.",
    stepsT: "איך נכנסים לפרויקט",
    steps: [
      ["שיחה ראשונה", "מספרים לאסי מה התקציב ומה המטרה, בעברית."],
      ["בוחרים דירה", "מוצאים יחד דירה באזור הנכון, קרוב לבתי החולים."],
      ["שיפוץ וריהוט", "מכינים את הדירה בדיוק לאורחים האלה: נוחה, נקייה ונגישה."],
      ["ניהול מלא", "S.F. Properties מפעילה את הדירה, ואתם מקבלים דוח עם המספרים האמיתיים."],
    ],
    formT: "רוצים לשמוע על הפרויקט?",
    formX: "השאירו פרטים ואסי יחזור אליכם בעברית. בלי התחייבות.",
    fbT: "פוסט מוכן לפייסבוק",
    fbX: "לוחצים על הכפתור: הטקסט מועתק, ופייסבוק נפתח. מדביקים את הטקסט בפוסט ומפרסמים.",
    fbBtn: "העתיקו ופרסמו בפייסבוק",
    fbCopy: "העתיקו את הטקסט בלבד",
    fb: "🏥 Airbnb באתונה עם 90% תפוסה, כל השנה?\n\nאסי דורון ו-S.F. Properties פתחו דירות Airbnb באזורים נבחרים ומאוד ממוקדים, ליד בתי חולים פרטיים גדולים. רוב האורחים הם יוונים מכל הארץ שמגיעים לאתונה לניתוחים ולטיפולים, עם בני המשפחה שלהם.\n\n✅ אין עונה, החורף מלא כמו הקיץ\n✅ אורחים שחוזרים שוב ושוב לאותה דירה\n✅ לא תלוי רק בתיירות ובטיסות\n✅ אורחים שקטים בשכונות של משפחות\n✅ ליווי בעברית וניהול מלא\n\nכל הפרטים 👇",
    moreT: "עוד על השותפים",
    more: [["/a/asi-doron-real-estate-greece-hebrew/", "הכירו את אסי דורון"], ["/a/sf-properties-athens-real-estate/", "S.F. Properties"], ["/a/buying-property-in-greece-israelis-guide/", "המדריך לקניית דירה ביוון"]],
    disc: "תוכן בשיתוף AS-IS by Asi Doron ו-S.F. Properties. S.F. Properties היא גם המו״לית של יוונט. נתון התפוסה נמסר על ידי השותפים. אין בכתבה הבטחה לתשואה, וכל השקעה כרוכה בסיכון.",
    credits: "צילומים: S.F. Properties (דירה שלנו); Unsplash: Tobias Reich, Nha Chill, Andrea Davis.",
    caps: ["אחת הדירות שלנו", "סלון מואר ושקט", "חדר שינה נוח להחלמה", "אתונה"],
  },
  en: {
    eye: "New project · Athens real estate",
    spons: "In partnership",
    h1a: "90% occupancy, all year.",
    h1b: "Even in winter.",
    dek: "Asi Doron and S.F. Properties opened Airbnb apartments in very specialised, carefully chosen areas, near large private hospitals. Most guests are Greeks from all over the country who come to Athens for surgery and treatment, so the apartments stay full in winter too.",
    wa: "Message Asi",
    form: "Tell me about the project",
    statL: "occupancy",
    statS: "most guests are Greek",
    sceneT: "It starts with one family from Crete",
    scene: "Dad needs treatment. The best doctor is at a private hospital in Athens, an hour's flight from home. Mum and their daughter come with him. They are not looking for an expensive hotel in the centre; they want a quiet, clean apartment with a kitchen, five minutes from the hospital.",
    scene3: "And they did not come just once. They booked the apartment for the first time, and since then, because the treatments come back often, they ask us for the same apartment every time they come to Athens. They already feel at home there.",
    scene2: "And this does not happen to just one family. It happens every day, all year, to families from all over Greece.",
    oppT: "The opportunity tourists don't see",
    opp: "Most Airbnbs in Athens are built around tourists, so they depend on the season and on flights. But Athens has another kind of demand, Greek and steady: Greece's large private hospitals are here. People who live in villages, on islands or in small towns come to Athens for surgery, tests and treatment, always with a family member at their side.",
    areasT: "Where the apartments are",
    areas: [
      ["Very specialised areas", "We don't buy just anywhere. The areas were chosen carefully, based on how close they are to the large private hospitals and on what families ask for."],
      ["Minutes from the hospital", "Quiet family neighbourhoods, close to the hospital and with easy transport. Exactly what a family needs after surgery."],
    ],
    cmpT: "A regular Airbnb vs an Airbnb near a hospital",
    cmpA: "Tourist Airbnb",
    cmpB: "Airbnb near a hospital",
    cmp: [
      ["Season", "Strong in summer, weak in winter", "All year, January included"],
      ["Who the guests are", "Tourists from all over the world", "Mostly Greek families coming for treatment"],
      ["Length of stay", "Usually a few nights", "Usually longer"],
      ["Dependence on flights and tourism", "High", "Low"],
      ["Neighbours", "Sometimes noise and suitcases at night", "Quiet, considerate guests"],
      ["Occupancy", "Changes with the season", "90%"],
    ],
    whyT: "Why it works",
    why: [
      ["cal", "No season", "January is as full as August. People do not postpone surgery because of the weather."],
      ["plane", "Not dependent on tourism alone", "Most demand comes from inside Greece, so it depends less on flights, crises or trends."],
      ["moon", "Quiet guests", "They come to recover, not to party. Neighbours are happy and the flat is well kept."],
      ["home", "Family neighbourhoods", "Quiet, green and convenient, without the pressure of the tourist areas."],
    ],
    teamT: "Who is behind the project",
    asiR: "AS-IS by Asi Doron",
    asiT: "Has guided Israeli investors for 9 years, in Hebrew: choosing the property, checks, buying and renovation. His investors get the real numbers, as is.",
    sfR: "S.F. Properties",
    sfT: "A Greek real-estate and property-management office in Athens: running the Airbnb, guests, cleaning and maintenance, day after day. The local team that makes everything work.",
    teamNote: "Together, it means the investor is not just buying an apartment. They join a model that already works.",
    stepsT: "How to join the project",
    steps: [
      ["First call", "Tell Asi your budget and your goal, in Hebrew."],
      ["Choose an apartment", "Together we find an apartment in the right area, close to the hospitals."],
      ["Renovation and furnishing", "We prepare the apartment exactly for these guests: comfortable, clean and accessible."],
      ["Full management", "S.F. Properties runs the apartment, and you get a report with the real numbers."],
    ],
    formT: "Want to hear about the project?",
    formX: "Leave your details and Asi will get back to you. No obligation.",
    fbT: "Ready-made Facebook post",
    fbX: "Press the button: the text is copied and Facebook opens. Paste the text into the post and publish.",
    fbBtn: "Copy & post on Facebook",
    fbCopy: "Copy the text only",
    fb: "🏥 An Airbnb in Athens with 90% occupancy, all year round?\n\nAsi Doron and S.F. Properties opened Airbnb apartments in very specialised, carefully chosen areas, near large private hospitals. Most guests are Greeks from all over the country who come to Athens for surgery and treatment, with their families.\n\n✅ No season: winter is as full as summer\n✅ Guests who come back again and again to the same apartment\n✅ Not dependent on tourism and flights alone\n✅ Quiet guests in family neighbourhoods\n✅ Guidance in Hebrew and full management\n\nAll the details 👇",
    moreT: "More about the partners",
    more: [["/a/asi-doron-real-estate-greece-hebrew/", "Meet Asi Doron"], ["/a/sf-properties-athens-real-estate/", "S.F. Properties"], ["/a/buying-property-in-greece-israelis-guide/", "Guide to buying a flat in Greece"]],
    disc: "Content in partnership with AS-IS by Asi Doron and S.F. Properties. S.F. Properties is also Yavanet's publisher. The occupancy figure was provided by the partners. Nothing here is a promise of returns, and every investment carries risk.",
    credits: "Photos: S.F. Properties (one of our apartments); Unsplash: Tobias Reich, Nha Chill, Andrea Davis.",
    caps: ["One of our apartments", "A bright, quiet living room", "A comfortable bedroom for recovery", "Athens"],
  },
};

const GAL = [HERO, U("photo-1751945965597-71171ec7a458"), U("photo-1599202937077-3f7cdc53f2e1"), U("photo-1716210180381-b756fd5ccc94")];

export function medtourShowcase(a, lang) {
  const he = lang === "he", c = C[lang];
  const url = "https://yavanet.gr" + P(lang, "/a/" + a.slug + "/"), fbTxt = c.fb + "\n" + url;
  const waBtn = (cls = "") => `<a class="mtx-btn wa${cls}" href="${esc(wa(he))}" target="_blank" rel="noopener" data-out="wa-asi-medtour">${icon("wa")}<span>${esc(c.wa)}</span></a>`;
  return `<article class="mtx" lang="${lang}">
<header class="mtx-hero" style="--bg:url('${esc(HERO)}')">
  <div class="mtx-hero-in">
    <span class="mtx-eye">${icon("cross")}${esc(c.eye)} <em>${esc(c.spons)}</em></span>
    <h1>${esc(c.h1a)}<br><span>${esc(c.h1b)}</span></h1>
    <p class="mtx-dek">${esc(c.dek)}</p>
    <div class="mtx-ctas">${waBtn()}<a class="mtx-btn ghost" href="#mtx-form">${esc(c.form)}</a></div>
    <div class="mtx-logos"><img src="/asi-logo.jpg" alt="AS-IS by Asi Doron" width="1000" height="797"><img src="/sf-logo-light.png" alt="S.F. Properties" width="900" height="142"></div>
  </div>
  <div class="mtx-ring" role="img" aria-label="90% ${esc(c.statL)}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="v" cx="60" cy="60" r="52" pathLength="100"/></svg><b>90%</b><span>${esc(c.statL)}</span><small>${esc(c.statS)}</small></div>
</header>

<section class="mtx-sec mtx-scene"><h2>${esc(c.sceneT)}</h2><p>${esc(c.scene)}</p><p class="mtx-back">${esc(c.scene3)}</p><p class="mtx-big">${esc(c.scene2)}</p></section>

<section class="mtx-sec"><h2>${esc(c.oppT)}</h2><p>${esc(c.opp)}</p>
<div class="mtx-gal">${GAL.map((s, i) => `<figure class="${i === 0 ? "big" : ""}"><img src="${esc(s)}" alt="${esc(c.caps[i])}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption>${esc(c.caps[i])}</figcaption></figure>`).join("")}</div></section>

<section class="mtx-sec"><h2>${esc(c.areasT)}</h2>
<div class="mtx-areas">${c.areas.map(([n, d], i) => `<div class="mtx-area a${i}"><span class="mtx-pin">${icon("pin")}</span><h3>${esc(n)}</h3><p>${esc(d)}</p><span class="mtx-h">${icon("cross")}</span></div>`).join("")}</div></section>

<section class="mtx-sec"><h2>${esc(c.cmpT)}</h2>
<div class="mtx-cmp" role="table"><div class="r h" role="row"><span role="columnheader"></span><span role="columnheader">${esc(c.cmpA)}</span><span role="columnheader" class="win">${esc(c.cmpB)}</span></div>
${c.cmp.map(([k, x, y]) => `<div class="r" role="row"><b role="rowheader">${esc(k)}</b><span role="cell">${esc(x)}</span><span role="cell" class="win">${esc(y)}</span></div>`).join("")}</div></section>

<section class="mtx-sec"><h2>${esc(c.whyT)}</h2>
<div class="mtx-why">${c.why.map(([k, t, d]) => `<div><span class="mtx-ic">${icon(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}</div></section>

<section class="mtx-sec"><h2>${esc(c.teamT)}</h2>
<div class="mtx-team">
  <div class="mtx-tm"><img src="/asi-avatar-v2.jpg" alt="${he ? "אסי דורון" : "Asi Doron"}" width="400" height="400" loading="lazy"><div><b>${he ? "אסי דורון" : "Asi Doron"}</b><span>${esc(c.asiR)}</span><p>${esc(c.asiT)}</p><a href="${P(lang, "/a/asi-doron-real-estate-greece-hebrew/")}">${he ? "לעמוד של אסי ←" : "Asi's page →"}</a></div></div>
  <div class="mtx-tm sf"><span class="mtx-sflogo"><img src="/sf-logo-light.png" alt="S.F. Properties" width="900" height="142" loading="lazy"></span><div><b>S.F. Properties</b><span>${he ? "ניהול נכסים ו-Airbnb באתונה" : "Property & Airbnb management in Athens"}</span><p>${esc(c.sfT)}</p><a href="${P(lang, "/a/sf-properties-athens-real-estate/")}">${he ? "לעמוד של S.F. Properties ←" : "S.F. Properties page →"}</a></div></div>
</div><p class="mtx-note">${esc(c.teamNote)}</p></section>

<section class="mtx-sec"><h2>${esc(c.stepsT)}</h2>
<ol class="mtx-steps">${c.steps.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("")}</ol>
<div class="mtx-ctas">${waBtn(" big")}</div></section>

<section class="mtx-form" id="mtx-form">${formBox(lang, { id: "lead-medtour", title: c.formT, text: c.formX, kind: "medtour-lead", fields: ["name", "phone", "email", "msg"], extra: `<input type="hidden" name="article" value="${esc(a.slug)}">` })}</section>

<section class="pf-fb mtx-sec" id="pf-fb"><h2>${esc(c.fbT)}</h2><p class="pf-lead">${esc(c.fbX)}</p>
<pre class="pf-fbtext" dir="${he ? "rtl" : "ltr"}">${esc(c.fb)}\n<bdi dir="ltr">${esc(url)}</bdi></pre>
<div class="mtx-ctas"><button type="button" class="pf-btn fb" data-fbpost="${esc(fbTxt)}" data-fburl="${esc(url)}">${icon("fb")}<span>${esc(c.fbBtn)}</span></button><button type="button" class="pf-btn ghost" data-copy="${esc(fbTxt)}"><span>${esc(c.fbCopy)}</span></button></div></section>

<p class="mtx-more">${esc(c.moreT)}: ${c.more.map(([u, t]) => `<a href="${P(lang, u)}">${esc(t)}</a>`).join(" · ")}</p>
<p class="small mtx-disc">${esc(c.disc)}<br>${esc(c.credits)}</p>
<div class="mtx-sticky">${waBtn()}</div>
</article>`;
}
