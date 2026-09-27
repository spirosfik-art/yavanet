// Σελίδα «Μου συνέβη στην Ελλάδα: τι κάνω;» – αριθμοί ελεγμένοι από gov.gr / επίσημες πηγές (Σεπτ. 2026)
export const NUMBERS = [
  { n: "112", he: "מספר החירום האירופי: משטרה, אמבולנס, כיבוי. עונים גם באנגלית.", en: "European emergency number: police, ambulance, fire. Answers in English too." },
  { n: "166", he: "אמבולנס (EKAB)", en: "Ambulance (EKAB)" },
  { n: "100", he: "משטרה", en: "Police" },
  { n: "199", he: "כבאות, כולל שריפות יער", en: "Fire brigade, including wildfires" },
  { n: "108", he: "משמר החופים: מצוקה בים, בחוף או בסירה", en: "Coast Guard: trouble at sea, on the beach or on a boat" },
  { n: "1571", he: "משטרת התיירות: גניבה, מסמכים שאבדו, הונאות", en: "Tourist Police: theft, lost documents, scams" },
  { n: "10400", he: "גרירה ושירותי דרך (ELPA)", en: "Road assistance and towing (ELPA)" },
  { n: "210 779 3777", he: "מרכז הרעלות", en: "Poison control centre" },
  { n: "+972 2 530 3155", he: "חדר המצב של משרד החוץ הישראלי (לישראלים בחו״ל, 24/7)", en: "Israeli Foreign Ministry situation room (Israelis abroad, 24/7)" },
];
export const EMBASSY = {
  he: "שגרירות ישראל באתונה: רחוב Marathonodromon 1, פסיכיקו. הכניסה למחלקה הקונסולרית מרחוב Mouson.",
  en: "Embassy of Israel in Athens: 1 Marathonodromon Street, Psychiko. The consular entrance is on Mouson Street.",
  url: "https://embassies.gov.il/greece/en/contacts",
};
export const CASES = [
  { icon: "🛂", he: { t: "איבדתי את הדרכון / נגנב לי הדרכון", s: ["דווחו בתחנת המשטרה הקרובה או במשטרת התיירות (1571) וקחו עותק של הדיווח.", "פנו למחלקה הקונסולרית של שגרירות ישראל באתונה. היא מנפיקה מסמך נסיעה זמני כדי שתוכלו לחזור לישראל.", "שמרו צילום של הדרכון בטלפון או במייל. זה מזרז מאוד את התהליך."] },
    en: { t: "I lost my passport / it was stolen", s: ["Report it at the nearest police station or to the Tourist Police (1571) and get a copy of the report.", "Contact the consular section of the Israeli Embassy in Athens. It issues a temporary travel document so you can fly home.", "Keep a photo of your passport on your phone or email. It speeds things up a lot."] } },
  { icon: "🏥", he: { t: "צריך רופא", s: ["מצב חירום: חייגו 166 או 112.", "יש לכם ביטוח נסיעות? התקשרו קודם למוקד של חברת הביטוח. הם יפנו אתכם לרופא או לבית חולים ויסגרו את התשלום.", "בתי מרקחת ביוון נותנים הרבה עצות. בית המרקחת התורן רשום על הדלת של כל בית מרקחת סגור.", "באתונה: SOS Médecins, רופא עד הבית, בטלפון 210 821 3300 (בתשלום)."] },
    en: { t: "I need a doctor", s: ["Emergency: call 166 or 112.", "Have travel insurance? Call your insurer's hotline first. They will direct you to a doctor or hospital and handle payment.", "Greek pharmacists give a lot of advice. The on-duty pharmacy is posted on the door of every closed pharmacy.", "In Athens: SOS Médecins home visits, 210 821 3300 (paid)."] } },
  { icon: "🚗", he: { t: "הייתה לי תאונה עם רכב שכור", s: ["יש פצועים? חייגו 112 או 166. אל תזיזו את הרכב אם אין סכנה.", "צלמו את הרכבים, את המקום ואת תעודת הזהות, רישיון הנהיגה והביטוח של הנהג השני.", "אם שני הצדדים מסכימים מה קרה, ממלאים טופס הצהרה משותפת על תאונה. אם לא, קוראים למשטרה (100).", "הודיעו מיד לחברת ההשכרה. בדקו בחוזה מה מספר השירות בדרכים שלה."] },
    en: { t: "I had an accident with a rental car", s: ["Anyone injured? Call 112 or 166. Do not move the car unless it is dangerous.", "Take photos of the cars, the scene, and the other driver's ID, licence and insurance.", "If both sides agree on what happened, fill in a joint accident statement. If not, call the police (100).", "Tell the rental company immediately. Check your contract for its road-assistance number."] } },
  { icon: "👜", he: { t: "גנבו לי תיק / טלפון / ארנק", s: ["דווחו במשטרה או במשטרת התיירות (1571) וקחו עותק של הדיווח. ביטוח הנסיעות יבקש אותו.", "חסמו מיד את כרטיסי האשראי דרך האפליקציה של הבנק או בטלפון.", "נגנב הדרכון? ראו למעלה: שגרירות ישראל."] },
    en: { t: "My bag / phone / wallet was stolen", s: ["Report it to the police or Tourist Police (1571) and get a copy of the report. Your travel insurer will ask for it.", "Block your cards immediately in your bank's app or by phone.", "Passport stolen too? See above: Israeli Embassy."] } },
  { icon: "🔥", he: { t: "יש שריפה או מזג אוויר קשה באזור", s: ["ביוון נשלחות הודעות חירום מ-112 לטלפון, ביוונית ובאנגלית. פעלו לפי ההוראות בהודעה.", "שריפה: חייגו 199. אם מורים לכם להתפנות, התפנו מיד.", "בדקו באתר שלנו את דף המבזקים והמפה."] },
    en: { t: "There is a fire or severe weather nearby", s: ["Greece sends 112 emergency messages to phones, in Greek and English. Follow the instructions.", "Fire: call 199. If told to evacuate, leave immediately.", "Check our breaking-news page and map."] } },
  { icon: "🌊", he: { t: "מצוקה בים", s: ["חייגו 108 (משמר החופים) או 112.", "בחופים עם מציל, שחו רק באזור המסומן."] },
    en: { t: "Trouble at sea", s: ["Call 108 (Coast Guard) or 112.", "On beaches with lifeguards, swim only in the marked area."] } },
];
