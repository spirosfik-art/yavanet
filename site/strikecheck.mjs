// /strike-check/ – «Υπάρχει απεργία στο ταξίδι μου;»: ο χρήστης διαλέγει ημερομηνίες, η σελίδα δείχνει τις γνωστές απεργίες
// (ίδια δεδομένα με /strike-today/ και strikes.ics: άρθρα με πεδίο strike). Το site ξαναχτίζεται κάθε ~15 λεπτά.
// Προαιρετικά: ειδοποίηση με email (kind "strike-alert" → /api/lead → επαφή Brevo με STRIKE_ALERT/TRIP_FROM/TRIP_TO, χωρίς λίστα).
import { esc, P } from "./templates.mjs";
import { toolScript } from "./toolsjs.mjs";

export function strikeCheckPage(lang, { strikeArts, TODAY, SECTOR }) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const data = strikeArts.filter((a) => a.strike.dates.some((d) => d >= TODAY)).map((a) => ({ d: a.strike.dates.slice().sort(), s: (a.strike.sectors || []).map((x) => (SECTOR[x] || SECTOR.other)[he ? 0 : 1]), t: a.strike[lang] || a[lang].title, u: P(lang, "/a/" + a.slug + "/") }));
  const title = L("יש שביתה בזמן הטיול שלי?", "Is there a strike during my trip?");
  const description = L("בחרו את תאריכי הטיול ליוון ותראו מיד אם הוכרזו שביתות בטיסות, במעבורות, במטרו או בתחבורה הציבורית בימים האלה. אפשר גם לקבל התראה במייל.", "Pick your Greece trip dates and see straight away whether strikes affecting flights, ferries, the metro or public transport have been announced for those days. You can also get an email alert.");
  const ics = "https://yavanet.gr/strikes.ics", webcal = ics.replace("https://", "webcal://");
  const M = {
    none: L("נכון לעכשיו לא ידוע על שביתות בתאריכים האלה. 👍 שביתות ביוון מוכרזות בדרך כלל כמה ימים מראש – כדאי לבדוק שוב לפני הטיסה.", "No known strikes on these dates yet. 👍 Greek strikes are usually announced a few days ahead – check again before you fly."),
    found: L("שביתות שהוכרזו בתאריכי הטיול:", "Strikes announced during your trip:"),
    bad: L("בחרו תאריך התחלה ותאריך סיום (הסיום אחרי ההתחלה).", "Choose a start and an end date (end after start)."),
    days: L("ימים", "days"),
    alertOk: L("✓ נרשמתם. נשלח לכם מייל אם תוכרז שביתה בתאריכי הטיול.", "✓ Done. We will email you if a strike is announced during your trip."),
    alertBad: L("נא למלא מייל תקין, לבחור תאריכים ולאשר.", "Please enter a valid email, choose dates and tick the box."),
    alertErr: L("משהו השתבש, נסו שוב.", "Something went wrong, please try again."),
  };
  const body = `<div class="hub hub-travel strike-now">
<header class="hub-hero"><div><h1>${esc(title)}</h1><p>${esc(description)}</p></div></header>
<div class="calc sc-form" id="sc" data-m="${esc(JSON.stringify(M))}" data-lang="${lang}">
<div class="row2"><label for="sc-from">${L("יום ההגעה", "Arrival date")}<input type="date" id="sc-from" min="${TODAY}" required></label><label for="sc-to">${L("יום החזרה", "Return date")}<input type="date" id="sc-to" min="${TODAY}" required></label></div>
<button type="button" class="btn" id="sc-go">${L("בדיקה", "Check")}</button>
<div id="sc-res" aria-live="polite"></div>
</div>
<script type="application/json" id="sc-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
<p class="small">${L("לפי השביתות שפורסמו ביוונט (ממקורות רשמיים ומהתקשורת היוונית). שביתות לפעמים מתבטלות או משתנות ברגע האחרון – בדקו תמיד מול חברת התעופה או המעבורות.", "Based on strikes published on Yavanet (from official sources and the Greek media). Strikes are sometimes called off or changed at the last minute – always check with your airline or ferry company.")}</p>
<form class="form" id="sc-alert" novalidate>
<h3>${L("📧 התראה במייל על שביתה בזמן הטיול", "📧 Email alert for a strike during your trip")}</h3>
<p>${L("נשלח לכם מייל אחד על כל שביתה חדשה שתוכרז בתאריכי הטיול. רק על הטיול הזה – לא ניוזלטר.", "We will send you one email for each new strike announced during your trip dates. Only about this trip – not a newsletter.")}</p>
<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label for="sc-email">${L("אימייל", "Email")}<input id="sc-email" name="email" type="email" required autocomplete="email" dir="ltr"></label>
<label class="chk" for="sc-consent"><input id="sc-consent" name="consent" type="checkbox" required><span>${L("אני מסכים/ה לקבל מיוונט מייל על שביתות בתאריכי הטיול שלי ולשמירת המייל והתאריכים לשם כך.", "I agree to receive emails from Yavanet about strikes during my trip dates, and to my email and dates being stored for this purpose.")} <a href="${P(lang, "/p/privacy/")}">${L("מדיניות פרטיות", "Privacy policy")}</a></span></label>
<button class="btn" type="submit" style="justify-self:start">${L("שלחו לי התראה", "Alert me")}</button>
<div class="status" role="status"></div>
</form>
<section class="st-cal"><div><h2>${L("📅 כל השביתות ביומן שלכם", "📅 Every strike in your calendar")}</h2><p>${L("הוסיפו פעם אחת, וכל שביתה חדשה תופיע אוטומטית ביומן בטלפון.", "Add it once and every new strike appears in your phone calendar automatically.")}</p></div>
<div class="st-btns"><a class="btn" href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}" target="_blank" rel="noopener">Google Calendar</a><a class="btn" href="${webcal}">${L("אייפון / Outlook", "iPhone / Outlook")}</a></div></section>
<section class="links tl-links"><a href="${P(lang, "/strike-today/")}">🚨 ${L("יש שביתה היום או מחר?", "Strike today or tomorrow?")}</a><a href="${P(lang, "/strikes/")}">📋 ${L("כל השביתות הקרובות", "All upcoming strikes")}</a><a href="${P(lang, "/a/greece-travel-guide-israelis-2026/")}">✈️ ${L("המדריך לטיסה ליוון", "Flying to Greece guide")}</a></section>
</div>
${toolScript()}`;
  return { title, description, body, faq: [] };
}
