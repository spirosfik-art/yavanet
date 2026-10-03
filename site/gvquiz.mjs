// /golden-visa-quiz/ – 5 ερωτήσεις → ποια βαθμίδα Golden Visa ισχύει.
// ΠΗΓΗ για όλους τους κανόνες/ποσά: content/articles/2026-09-25-golden-visa-guide-2026.json (μόνο ό,τι γράφει εκεί).
import { esc, P } from "./templates.mjs";
import { toolScript } from "./toolsjs.mjs";

const GUIDE = "golden-visa-greece-2026-guide";

export function gvQuizPage(lang) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const title = L("איזו ויזת זהב מתאימה לי? שאלון של 5 שאלות", "Which Golden Visa applies to me? A 5-question quiz");
  const description = L("ענו על 5 שאלות קצרות וגלו כמה צריך להשקיע בוויזת הזהב היוונית לפי האזור וסוג הנכס, מה אסור, ומי מבני המשפחה נכלל – לפי הכללים של 2026.", "Answer 5 short questions to see how much you need to invest for the Greek Golden Visa by area and property type, what is not allowed, and which family members are included – under the 2026 rules.");
  const Q = [
    { id: "area", q: L("איפה הנכס שאתם שוקלים?", "Where is the property you are considering?"), o: [
      ["high", L("אטיקה (אתונה והסביבה), סלוניקי, מיקונוס או סנטוריני", "Attica (Athens area), Thessaloniki, Mykonos or Santorini")],
      ["island", L("אי עם יותר מ-3,100 תושבים", "An island with more than 3,100 residents")],
      ["low", L("בכל מקום אחר ביוון", "Anywhere else in Greece")],
      ["unsure", L("עוד לא החלטתי", "I haven't decided yet")]] },
    { id: "type", q: L("איזה סוג נכס?", "What kind of property?"), o: [
      ["home", L("דירה או בית למגורים", "A flat or house")],
      ["convert", L("הסבה של מבנה מסחרי או תעשייתי למגורים, או שיקום מבנה לשימור", "Converting a commercial or industrial building to residential, or restoring a listed building")]] },
    { id: "size", q: L("כמה נכסים ובאיזה גודל?", "How many properties, and how big?"), o: [
      ["ok", L("נכס אחד, לפחות 120 מ״ר שטח מגורים", "One property, at least 120 m² of living space")],
      ["small", L("נכס אחד, קטן מ-120 מ״ר", "One property, under 120 m²")],
      ["multi", L("כמה דירות קטנות שביחד מגיעות לסכום", "Several small flats that add up to the amount")]] },
    { id: "use", q: L("מה תעשו עם הנכס?", "What will you do with the property?"), o: [
      ["self", L("שימוש עצמי / יעמוד ריק", "Personal use / it will stay empty")],
      ["long", L("השכרה לטווח ארוך", "Long-term rental")],
      ["short", L("השכרה קצרה ב-Airbnb או Booking", "Short-term rental on Airbnb or Booking")]] },
    { id: "family", q: L("מי יקבל את האישור?", "Who will be on the permit?"), o: [
      ["me", L("רק אני", "Just me")],
      ["spouse", L("אני ובן/בת הזוג", "Me and my spouse/partner")],
      ["kids", L("אני, בן/בת הזוג והילדים", "Me, my spouse and our children")],
      ["parents", L("גם ההורים", "Our parents too")]] },
  ];
  const T = {
    q: L("שאלה", "Question"), of: L("מתוך", "of"), back: L("→ חזרה", "← Back"), again: L("להתחיל מחדש", "Start again"),
    min: L("השקעה מינימלית", "Minimum investment"), tierHigh: L("המסלול של 800,000 אירו", "The €800,000 route"), tierLow: L("המסלול של 400,000 אירו", "The €400,000 route"), tierConv: L("המסלול של 250,000 אירו", "The €250,000 route"),
    unsure: L("תלוי איפה תקנו", "Depends where you buy"),
    unsureTxt: L("800,000 אירו באטיקה (אתונה והסביבה), סלוניקי, מיקונוס, סנטוריני ואיים עם יותר מ-3,100 תושבים. 400,000 אירו בשאר יוון.", "€800,000 in Attica (Athens area), Thessaloniki, Mykonos, Santorini and islands with more than 3,100 residents. €400,000 in the rest of Greece."),
    convTxt: L("במסלול הזה ההסבה צריכה להסתיים לפני שמגישים את הבקשה, והנכס לא יכול לשמש כמשרד של עסק.", "On this route the conversion must be completed before you apply, and the property cannot be used as a business seat."),
    sizeBad: L("⚠️ לא עומד בכללים: צריך דירה אחת בלבד, של לפחות 120 מ״ר שטח מגורים. אי אפשר לחבר כמה דירות קטנות כדי להגיע לסכום.", "⚠️ Does not meet the rules: you need one property only, with at least 120 m² of living space. You cannot combine several small flats to reach the amount."),
    multiConv: L("⚠️ שימו לב: הכלל הוא נכס אחד בלבד. אי אפשר לחבר כמה נכסים כדי להגיע לסכום.", "⚠️ Note: the rule is one property only. You cannot combine several properties to reach the amount."),
    short: L("⚠️ אסור להשכיר נכס של ויזת זהב ב-Airbnb או ב-Booking. הקנס הוא 50,000 אירו וביטול האישור.", "⚠️ A Golden Visa property may not be let on Airbnb or Booking. The fine is €50,000 plus revocation of the permit."),
    long: L("✓ השכרה לטווח ארוך מותרת.", "✓ Long-term letting is allowed."),
    fam: { me: L("רק אתם על האישור.", "Just you on the permit."), spouse: L("בן או בת הזוג יכולים להיכלל באישור.", "Your spouse or partner can be included."), kids: L("בן/בת הזוג וילדים עד גיל 21 יכולים להיכלל באישור.", "Your spouse and children up to 21 can be included."), parents: L("בן/בת הזוג, ילדים עד גיל 21, וההורים של שני בני הזוג יכולים להיכלל באישור.", "Your spouse, children up to 21, and the parents of both spouses can be included.") },
    fees: L("אגרה ממשלתית: 2,000 אירו למשקיע, 150 אירו לכל בן משפחה בוגר, חינם לילדים עד 18, ועוד 16 אירו לכל כרטיס. ביטוח בריאות חובה לכל מי שמקבל אישור.", "Government fee: €2,000 for the investor, €150 per adult family member, free for children under 18, plus €16 per card. Health insurance is required for everyone on the permit."),
    always: [
      L("כל המחיר משולם לפני שמגישים את הבקשה.", "The full price is paid before you apply."),
      L("עלויות הקנייה: כ-7%–9% ממחיר הדירה (מס רכישה, נוטריון, עורך דין, רישום).", "Purchase costs: about 7–9% of the price (transfer tax, notary, lawyer, registration)."),
      L("אישור שהייה ל-5 שנים שמתחדש כל עוד הנכס בבעלותכם. אין חובה לגור ביוון, ואין זכות לעבוד ביוון.", "A 5-year residence permit, renewable as long as you own the property. No requirement to live in Greece, and no right to work in Greece."),
      L("בפועל כדאי לתכנן 6 עד 10 חודשים מבחירת הנכס ועד שהכרטיס ביד.", "In practice, plan on 6 to 10 months from choosing a property to holding the card."),
      L("לפי הודעת הממשלה מספטמבר 2026, מ-1 ביולי 2027 מס הרכישה על דירות לאזרחים מחוץ לאיחוד האירופי יעלה ל-15.45%. זה עוד לא חוק.", "According to the government's September 2026 announcement, from 1 July 2027 transfer tax on homes for non-EU citizens will rise to 15.45%. It is not law yet."),
    ],
    rulesH: L("מה עוד חשוב לדעת", "What else to know"), famH: L("משפחה ועלויות", "Family and fees"),
    guide: L("📘 המדריך המלא לוויזת זהב 2026", "📘 The full 2026 Golden Visa guide"),
    talk: L("דברו עם יועץ", "Talk to an adviser"), wa: L("שאלה בוואטסאפ", "Ask on WhatsApp"),
    disc: L("זהו מידע כללי לפי הכללים כפי שפורסמו (מעודכן לספטמבר 2026), ואינו ייעוץ משפטי. הכללים משתנים – לפני החלטה התייעצו עם עורך דין.", "This is general information based on the published rules (current as of September 2026), not legal advice. Rules change – consult a lawyer before deciding."),
    share: L("📤 שתפו את השאלון", "📤 Share the quiz"),
  };
  const waHref = `https://wa.me/306906723676?text=${encodeURIComponent(L("שלום, מילאתי את שאלון ויזת הזהב ביוונט ויש לי שאלה", "Hi, I took the Golden Visa quiz on Yavanet and have a question"))}`;
  const data = { Q, T, links: { guide: P(lang, "/a/" + GUIDE + "/"), advisor: P(lang, "/advisor/"), wa: waHref } };
  const faq = [
    [L("כמה צריך להשקיע כדי לקבל ויזת זהב ביוון ב-2026?", "How much must you invest for a Greek Golden Visa in 2026?"), L("800,000 אירו באטיקה (אתונה), סלוניקי, מיקונוס, סנטוריני ואיים עם יותר מ-3,100 תושבים; 400,000 אירו בשאר יוון; ו-250,000 אירו בהסבת מבנה מסחרי או תעשייתי למגורים או בשיקום מבנה לשימור.", "€800,000 in Attica (Athens), Thessaloniki, Mykonos, Santorini and islands with more than 3,100 residents; €400,000 in the rest of Greece; and €250,000 for converting a commercial or industrial building to residential or restoring a listed building.")],
    [L("אפשר להשכיר ב-Airbnb נכס של ויזת זהב?", "Can a Golden Visa property be let on Airbnb?"), L("לא. השכרה קצרה אסורה, והקנס הוא 50,000 אירו וביטול האישור. השכרה לטווח ארוך מותרת.", "No. Short-term letting is banned; the fine is €50,000 plus revocation of the permit. Long-term letting is allowed.")],
  ];
  const body = `<div class="page-h"><h1>${esc(title)}</h1><p>${esc(description)}</p></div>
<div class="grid"><div class="col">
<noscript><div class="empty-note">${L("השאלון דורש JavaScript. בינתיים אפשר לקרוא את", "The quiz needs JavaScript. Meanwhile, read")} <a href="${data.links.guide}">${esc(T.guide)}</a></div></noscript>
<div class="quiz calc" id="gvq" data-q="${esc(JSON.stringify(data))}" hidden aria-live="polite"></div>
<p class="small">${esc(T.disc)}</p>
<section><div class="zone-h"><h2>${L("שאלות נפוצות", "Common questions")}</h2></div><div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></section>
<section class="links tl-links"><a href="${data.links.guide}">${esc(T.guide)}</a><a href="${P(lang, "/a/buying-property-in-greece-israelis-guide/")}">🏠 ${L("המדריך לקניית דירה ביוון", "Buying property in Greece: the guide")}</a><a href="${P(lang, "/madad/")}">📊 ${L("מחירי דירות לפי שכונה", "Property prices by area")}</a><a href="${P(lang, "/tools/")}">🧮 ${L("מחשבון עלויות קנייה", "Purchase cost calculator")}</a></section>
<div class="sharebar"><button type="button" class="btn ghost" data-share>${esc(T.share)}</button></div>
</div>__WIDGETS__</div>
${toolScript()}`;
  return { title, description, body, faq };
}
