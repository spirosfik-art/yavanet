// Φόρμα «ειδοποίηση με email για προειδοποίηση καιρού» (+ προαιρετικά απεργίες πλοίων/πτήσεων).
// Εμφανίζεται: /weather-warnings/, σελίδες επιπέδων, σελίδες μηνών /weather/…, μέσα σε κάθε άρθρο καιρού (wxArticleBox).
// Υποβολή: app.js (form[data-wxal]) → /api/lead kind "weather-alert" → email επιβεβαίωσης → /api/alerts?a=confirm (double opt-in).
// Στατικό HTML (χωρίς JS για την εμφάνιση) → δεν «πηδάει» η σελίδα· τα στυλ (.wxal) μπαίνουν αυτόματα στο critical CSS.
import { esc, P } from "./templates.mjs";
import { ALERT_REGIONS } from "../lib/alerts.js";

export function wxAlertBox(lang, { id = "wxal", regions = null, level = "severe" } = {}) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const pre = new Set(regions && regions.length ? regions : ["all"]);
  const M = {
    ok: L("כמעט סיימנו: שלחנו לכם מייל. לחצו על הקישור שבו כדי להפעיל את ההתראות.", "Almost done: we sent you an email. Tap the link in it to turn the alerts on."),
    bad: L("נא למלא מייל תקין, לבחור לפחות אזור אחד ולאשר.", "Please enter a valid email, choose at least one area and tick the box."),
    err: L("משהו השתבש, נסו שוב.", "Something went wrong, please try again."),
  };
  const chip = (v, label) => `<label class="wxal-c"><input type="checkbox" name="regions" value="${v}"${pre.has(v) ? " checked" : ""}><span>${esc(label)}</span></label>`;
  return `<form class="form wxal" id="${id}" data-wxal data-m="${esc(JSON.stringify(M))}" novalidate>
<h3>🔔 ${L("קבלו התראה במייל כשיוצאת אזהרת מזג אוויר באזור שלכם", "Get an email when a weather warning is issued for your area")}</h3>
<p>${L("מייל קצר בעברית: רמת האזהרה, האזור, מתי ומה עושים. בלי ספאם, ביטול בלחיצה.", "A short email: the warning level, the area, when, and what to do. No spam, unsubscribe in one tap.")}</p>
<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label for="${id}-email">${L("אימייל", "Email")}<input id="${id}-email" name="email" type="email" required autocomplete="email" dir="ltr"></label>
<fieldset class="wxal-f"><legend>${L("אזורים", "Areas")}</legend><div class="wxal-cs">${chip("all", L("כל יוון", "All of Greece"))}${ALERT_REGIONS.map((r) => chip(r.id, r[lang])).join("")}</div></fieldset>
<fieldset class="wxal-f"><legend>${L("אילו אזהרות?", "Which warnings?")}</legend><div class="wxal-cs">
<label class="wxal-c"><input type="radio" name="level" value="severe"${level !== "all" ? " checked" : ""}><span>🟠🔴 ${L("רק כתומות ואדומות", "Orange and red only")}</span></label>
<label class="wxal-c"><input type="radio" name="level" value="all"${level === "all" ? " checked" : ""}><span>🟡🟠🔴 ${L("כולן (גם צהובות)", "All (yellow too)")}</span></label></div></fieldset>
<label class="chk" for="${id}-strike"><input id="${id}-strike" name="strike" type="checkbox" value="1"><span>🚨 ${L("גם התראה על שביתות שמשבשות מעבורות וטיסות", "Also alert me about strikes disrupting ferries and flights")}</span></label>
<label class="chk" for="${id}-consent"><input id="${id}-consent" name="consent" type="checkbox" required><span>${L("אני מסכים/ה לקבל מיוונט מיילים עם התראות (מזג אוויר, ושביתות אם סימנתי) ולשמירת המייל והאזורים לשם כך. אפשר לבטל בכל מייל.", "I agree to receive alert emails from Yavanet (weather, and strikes if ticked), and to my email and areas being stored for this purpose. Unsubscribe from any email.")} <a href="${P(lang, "/p/privacy/")}">${L("מדיניות פרטיות", "Privacy policy")}</a></span></label>
<button class="btn" type="submit">${L("שלחו לי התראות", "Alert me")}</button>
<div class="status" role="status" aria-live="polite"></div>
</form>`;
}
