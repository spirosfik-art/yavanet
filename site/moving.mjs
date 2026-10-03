// /moving-checklist/ – λίστα μετακόμισης στην Ελλάδα για Ισραηλινούς. Μόνο γενικά, επαληθευμένα βήματα από τους δικούς μας οδηγούς.
import { esc, P } from "./templates.mjs";
import { toolScript } from "./toolsjs.mjs";

const A = (lang, s) => P(lang, "/a/" + s + "/");

export function movingPage(lang, has) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const FAM = "moving-to-greece-with-family-israelis-guide", AFM = "greek-tax-number-and-bank-account-guide", HEALTH = "healthcare-system-in-greece-guide", GV = "golden-visa-greece-2026-guide";
  const g = (slug, he1, en1) => (has(slug) ? [A(lang, slug), L(he1, en1)] : null);
  const STAGES = [
    { id: "before", h: L("לפני המעבר", "Before you move"), items: [
      ["visa", L("בוחרים מסלול אשרה", "Choose a visa route"), L("כישראלים אפשר לשהות ביוון עד 90 יום בכל 180 יום בלי ויזה. כדי לגור ביוון צריך אישור שהייה – למשל עצמאי כלכלית, נוודים דיגיטליים, ויזת זהב או אישור עבודה. התנאים משתנים, בדקו מול הקונסוליה היוונית.", "Israelis can stay up to 90 days in any 180 without a visa. To live in Greece you need a residence permit – e.g. financially independent person, digital nomad, Golden Visa or a work permit. Conditions change; check with the Greek consulate."), g(FAM, "איזו ויזה מתאימה לכם", "Which visa fits you")],
      ["docs", L("מכינים מסמכים: הכנסה, ביטוח, דיור", "Prepare documents: income, insurance, housing"), L("לפי המסלול: הוכחת הכנסה, ביטוח בריאות פרטי ומקום מגורים.", "Depending on the route: proof of income, private health insurance and a place to live."), g(FAM, "המדריך למעבר עם המשפחה", "Moving with family guide")],
      ["afm", L("מוציאים מספר מס יווני (ΑΦΜ)", "Get a Greek tax number (ΑΦΜ)"), L("צריך אותו כמעט לכל דבר: שכירות, בנק, חשמל ואינטרנט. אפשר לבקש אונליין מישראל בשיחת וידאו עם רשות המסים, או דרך עורך דין.", "You need it for almost everything: renting, a bank account, electricity and internet. It can be requested online from Israel by video call with the tax authority, or through a lawyer."), g(AFM, "איך מוציאים ΑΦΜ", "How to get an ΑΦΜ")],
      ["ins", L("עושים ביטוח בריאות פרטי", "Arrange private health insurance"), L("כל בקשת אשרה דורשת ביטוח בריאות פרטי. כדאי להחזיק בו עד שיש כיסוי ציבורי.", "Every visa application requires private health insurance. It is wise to keep it until public cover is in place."), g(FAM, "בריאות וביטוח", "Health & insurance")],
      ["home", L("מחפשים דירה לטווח ארוך", "Find a long-term rental"), L("בודקים שכונות ומחירים. משפחות רבות בוחרות בפרברים הצפוניים או הדרומיים.", "Compare neighbourhoods and prices. Many families choose the northern or southern suburbs."), [P(lang, "/madad/"), L("מחירים ושכר דירה לפי שכונה", "Prices and rents by area")]],
      ["apply", L("מגישים את בקשת האשרה", "File the visa application"), L("בדקו מול הקונסוליה היוונית איפה ואיך מגישים במסלול שלכם, ואת רשימת המסמכים העדכנית.", "Check with the Greek consulate where and how to file for your route, and the current document list."), g(FAM, "שלבי המעבר", "Moving steps")],
      ["school", L("בוחרים בית ספר לילדים", "Choose a school for the kids"), L("בית ספר ציבורי הוא חינמי ובשפה היוונית. באתונה יש גם בתי ספר בינלאומיים בתשלום.", "Public school is free and in Greek. Athens also has fee-paying international schools."), g(FAM, "בתי ספר ושכר לימוד", "Schools and fees")],
      ["licence", L("בודקים מה עם רישיון הנהיגה", "Check your driving licence"), L("הכללים לשימוש ברישיון ישראלי ולהמרתו תלויים במצב שלכם. בדקו מול הרשויות היווניות או הקונסוליה לפני המעבר.", "The rules for using or exchanging an Israeli licence depend on your situation. Check with the Greek authorities or the consulate before you move."), null],
    ] },
    { id: "week", h: L("השבוע הראשון", "First week"), items: [
      ["sim", L("קונים כרטיס SIM יווני", "Get a Greek SIM card"), L("מספר טלפון יווני נדרש לפתיחת חשבון בנק ולתהליכים דיגיטליים.", "A Greek phone number is needed to open a bank account and for digital processes."), g(AFM, "הסדר הנכון", "The right order")],
      ["bank", L("פותחים חשבון בנק יווני", "Open a Greek bank account"), L("בדרך כלל צריך להגיע לסניף עם דרכון, ΑΦΜ, הוכחת כתובת ומקור הכנסה. החוויה משתנה מבנק לבנק.", "You usually need to visit a branch with passport, ΑΦΜ, proof of address and source of funds. Experience varies by bank."), g(AFM, "מה הבנקים מבקשים", "What banks ask for")],
      ["lease", L("חותמים על חוזה שכירות", "Sign a lease"), L("כתובת קבועה נדרשת להמשך – אישור שהייה, ΑΜΚΑ ורישום לבית ספר.", "A fixed address is needed for the next steps – residence permit, ΑΜΚΑ and school registration."), null],
      ["sos", L("שומרים מספרי חירום ואת פרטי השגרירות", "Save emergency numbers and the embassy"), L("מספר החירום האירופי הוא 112.", "The European emergency number is 112."), [P(lang, "/emergency/"), L("מספרי חירום ושגרירות ישראל", "Emergency numbers & Israeli embassy")]],
    ] },
    { id: "month", h: L("החודש הראשון", "First month"), items: [
      ["permit", L("מסדירים את אישור השהייה", "Complete your residence permit"), L("אחרי ההגעה ממשיכים את תהליך אישור השהייה לפי המסלול שלכם.", "After arrival, continue the residence permit process for your route."), g(FAM, "המדריך למעבר", "Moving guide")],
      ["amka", L("מוציאים ΑΜΚΑ (מספר ביטוח לאומי)", "Get an ΑΜΚΑ (social security number)"), L("אחרי שיש אישור שהייה: עם דרכון, ΑΦΜ והוכחת כתובת, במשרד ΚΕΠ או ΕΦΚΑ. ΑΜΚΑ לבד לא נותן כיסוי רפואי.", "Once you have a residence permit: with passport, ΑΦΜ and proof of address, at a ΚΕΠ or ΕΦΚΑ office. ΑΜΚΑ alone does not give health cover."), g(FAM, "ΑΜΚΑ ובריאות", "ΑΜΚΑ & healthcare")],
      ["utils", L("מחברים חשמל ואינטרנט", "Connect electricity and internet"), L("לרוב יבקשו ממכם ΑΦΜ.", "You will usually be asked for your ΑΦΜ."), g(AFM, "למה צריך ΑΦΜ", "Why you need an ΑΦΜ")],
      ["enrol", L("רושמים את הילדים לבית ספר", "Register the kids at school"), L("בבית ספר ציבורי או בינלאומי, לפי מה שבחרתם.", "At a public or international school, as you chose."), g(FAM, "בתי ספר", "Schools")],
      ["health", L("מבינים את מערכת הבריאות", "Get to know the health system"), L("המערכת הציבורית (ΕΣΥ) לצד רפואה פרטית. שירותי החירום והאמבולנס – ΕΚΑΒ.", "The public system (ESY) alongside private care. Emergency and ambulance services – EKAB."), g(HEALTH, "מערכת הבריאות ביוון", "Healthcare in Greece")],
    ] },
    { id: "ongoing", h: L("שוטף", "Ongoing"), items: [
      ["renew", L("עוקבים אחרי מועד חידוש האישור", "Track your permit renewal date"), L("לכל מסלול יש תוקף וכללי חידוש משלו. רשמו ביומן את תאריך התפוגה.", "Each route has its own validity and renewal rules. Put the expiry date in your calendar."), g(GV, "ויזת זהב: תוקף וחידוש", "Golden Visa: validity & renewal")],
      ["tax", L("מסדרים דוחות מס", "Sort out tax returns"), L("למשל על הכנסה משכירות. ישראלים רבים עובדים עם רואה חשבון יווני. לשאלות תושבות מס – התייעצו עם רואה חשבון.", "For example on rental income. Many Israelis work with a Greek accountant. For tax-residence questions, consult an accountant."), g(AFM, "ΑΦΜ ומיסים", "ΑΦΜ & taxes")],
      ["greek", L("לומדים קצת יוונית", "Learn some Greek"), L("השפה והבירוקרטיה הם האתגרים שהכי מוזכרים. מתחילים מהמשפטים הבסיסיים.", "Language and bureaucracy are the challenges mentioned most. Start with the basics."), [P(lang, "/phrasebook/"), L("שיחון יוונית לישראלים", "Greek phrasebook")]],
      ["news", L("עוקבים אחרי שביתות וחגים", "Keep an eye on strikes and holidays"), L("שביתות בתחבורה וחגים שבהם הכול סגור.", "Transport strikes and holidays when everything is closed."), [P(lang, "/strikes/"), L("שביתות ביוון", "Strikes in Greece")]],
    ] },
  ];
  const total = STAGES.reduce((n, s) => n + s.items.length, 0);
  const title = L("צ׳קליסט מעבר ליוון", "Moving to Greece checklist");
  const description = L("רשימת משימות למעבר מישראל ליוון: לפני המעבר, בשבוע הראשון, בחודש הראשון ובשוטף – עם קישורים למדריכים. ההתקדמות נשמרת בדפדפן.", "A to-do list for moving from Israel to Greece: before you move, the first week, the first month and ongoing – with links to our guides. Your progress is saved in your browser.");
  const item = (st, [id, t, d, link]) => `<li class="ck"><label for="ck-${st}-${id}"><input type="checkbox" id="ck-${st}-${id}" data-ck="${st}-${id}"><span><b>${esc(t)}</b><small>${esc(d)}</small></span></label>${link ? `<a class="ck-l" href="${link[0]}">${esc(link[1])} ${he ? "←" : "→"}</a>` : ""}</li>`;
  const body = `<div class="page-h"><h1>✅ ${esc(title)}</h1><p>${esc(description)}</p></div>
<div class="grid"><div class="col">
<div class="ckprog" id="ck-prog" data-total="${total}"><div><b id="ck-n">0</b>/<span>${total}</span> ${L("משימות הושלמו", "tasks done")}</div><div class="qz-bar"><i id="ck-bar" style="width:0%"></i></div><button type="button" class="btn ghost" id="ck-reset">${L("איפוס", "Reset")}</button></div>
${STAGES.map((s, i) => `<section class="ckst"><div class="zone-h"><h2><span class="ck-num">${i + 1}</span> ${esc(s.h)}</h2><span class="eyebrow" data-ckc="${s.id}"></span></div><ul class="cklist">${s.items.map((x) => item(s.id, x)).join("")}</ul></section>`).join("")}
<p class="small">${L("מידע כללי בלבד ואינו ייעוץ משפטי או מיסויי. הכללים משתנים לפי מסלול ובמהלך הזמן – בדקו מול הקונסוליה היוונית והרשויות. ההתקדמות נשמרת רק בדפדפן הזה.", "General information only, not legal or tax advice. Rules vary by route and change over time – check with the Greek consulate and authorities. Progress is saved only in this browser.")}</p>
<section class="links tl-links"><a href="${P(lang, "/moving/")}">🧳 ${L("לעבור לגור ביוון: כל המידע", "Moving to Greece: everything")}</a><a href="${P(lang, "/cost-of-living/")}">💶 ${L("יוקר המחיה: אתונה מול תל אביב", "Cost of living: Athens vs Tel Aviv")}</a><a href="${P(lang, "/golden-visa-quiz/")}">❓ ${L("שאלון ויזת זהב", "Golden Visa quiz")}</a></section>
<div class="sharebar"><button type="button" class="btn ghost" data-share>${L("📤 שתפו עם מי שעובר איתכם", "📤 Share with whoever is moving with you")}</button></div>
</div>__WIDGETS__</div>
${toolScript()}`;
  return { title, description, body, faq: [] };
}
