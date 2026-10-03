// /phrasebook/ – שיחון יוונית לישראלים: ~100 משפטים, תעתיק עברי/לטיני, השמעה (speechSynthesis el-GR), חיפוש.
import { esc, P } from "./templates.mjs";
import { toolScript } from "./toolsjs.mjs";

// [κατηγορία, עברית, English, Ελληνικά, תעתיק עברי, Latin]
export const PHRASES = [
  ["basics", "שלום (בנימוס, או לכמה אנשים)", "Hello (polite / to several people)", "Γεια σας", "יאסאס", "yá sas"],
  ["basics", "היי (לאדם אחד שמכירים)", "Hi (to one person you know)", "Γεια σου", "יאסו", "yá su"],
  ["basics", "בוקר טוב", "Good morning", "Καλημέρα", "קאלימרה", "kaliméra"],
  ["basics", "ערב טוב", "Good evening", "Καλησπέρα", "קאליספרה", "kalispéra"],
  ["basics", "לילה טוב", "Good night", "Καληνύχτα", "קאליניחטה", "kaliníchta"],
  ["basics", "תודה", "Thank you", "Ευχαριστώ", "אפחריסטו", "efcharistó"],
  ["basics", "תודה רבה", "Thank you very much", "Ευχαριστώ πολύ", "אפחריסטו פולי", "efcharistó polí"],
  ["basics", "בבקשה / אין בעד מה", "Please / You're welcome", "Παρακαλώ", "פאראקאלו", "parakaló"],
  ["basics", "כן", "Yes", "Ναι", "נֶה", "ne"],
  ["basics", "לא", "No", "Όχι", "אוחי", "óchi"],
  ["basics", "סליחה", "Sorry / Excuse me", "Συγγνώμη", "סיגנומי", "signómi"],
  ["basics", "מה שלומך? (בנימוס)", "How are you? (polite)", "Τι κάνετε;", "טי קאנטה?", "ti kánete?"],
  ["basics", "טוב, תודה", "Fine, thank you", "Καλά, ευχαριστώ", "קאלה, אפחריסטו", "kalá, efcharistó"],
  ["basics", "אני לא מבין / מבינה", "I don't understand", "Δεν καταλαβαίνω", "ד׳ן קאטאלאבנו", "den katalavéno"],
  ["basics", "אתם מדברים אנגלית?", "Do you speak English?", "Μιλάτε αγγλικά;", "מילאטה אנגליקה?", "miláte angliká?"],
  ["basics", "קוראים לי...", "My name is...", "Με λένε...", "מה לנה...", "me léne..."],
  ["basics", "נעים מאוד", "Nice to meet you", "Χάρηκα", "חאריקה", "chárika"],
  ["basics", "אני מישראל", "I am from Israel", "Είμαι από το Ισραήλ", "אימה אפו טו יסראיל", "íme apó to Israíl"],
  ["basics", "להתראות", "Goodbye", "Αντίο", "אנדיו", "andío"],
  ["basics", "מותר?", "Is it allowed?", "Επιτρέπεται;", "אפיטרפטה?", "epitrépete?"],

  ["food", "שולחן לשניים, בבקשה", "A table for two, please", "Ένα τραπέζι για δύο, παρακαλώ", "אנה טראפזי יה ד׳יו, פאראקאלו", "éna trapézi ya dío, parakaló"],
  ["food", "את התפריט, בבקשה", "The menu, please", "Τον κατάλογο, παρακαλώ", "טון קאטאלוגו, פאראקאלו", "ton katálogo, parakaló"],
  ["food", "את החשבון, בבקשה", "The bill, please", "Τον λογαριασμό, παρακαλώ", "טון לוגאריאזמו, פאראקאלו", "ton logariazmó, parakaló"],
  ["food", "מים", "Water", "Νερό", "נרו", "neró"],
  ["food", "בקבוק מים", "A bottle of water", "Ένα μπουκάλι νερό", "אנה בוקאלי נרו", "éna bukáli neró"],
  ["food", "קפה", "Coffee", "Καφές", "קאפס", "kafés"],
  ["food", "בירה", "Beer", "Μπύρα", "בירה", "bíra"],
  ["food", "יין", "Wine", "Κρασί", "קראסי", "krasí"],
  ["food", "לחם", "Bread", "Ψωμί", "פסומי", "psomí"],
  ["food", "דג", "Fish", "Ψάρι", "פסארי", "psári"],
  ["food", "עוף", "Chicken", "Κοτόπουλο", "קוטופולו", "kotópulo"],
  ["food", "סלט", "Salad", "Σαλάτα", "סאלאטה", "saláta"],
  ["food", "בלי בשר", "Without meat", "Χωρίς κρέας", "חוריס קראס", "chorís kréas"],
  ["food", "אני לא אוכל/ת חזיר", "I don't eat pork", "Δεν τρώω χοιρινό", "ד׳ן טרואו חירינו", "den tróo chirinó"],
  ["food", "יש בזה חזיר?", "Is there pork in it?", "Έχει χοιρινό;", "אחי חירינו?", "échi chirinó?"],
  ["food", "אני צמחוני/ת", "I'm vegetarian", "Είμαι χορτοφάγος", "אימה חורטופאגוס", "íme chortofágos"],
  ["food", "היה טעים מאוד", "It was delicious", "Ήταν πολύ νόστιμο", "איטאן פולי נוסטימו", "ítan polí nóstimo"],
  ["food", "לחיים!", "Cheers!", "Γεια μας!", "יאמאס!", "yá mas!"],
  ["food", "אפשר לשלם בכרטיס?", "Can I pay by card?", "Μπορώ να πληρώσω με κάρτα;", "בורו נה פלירוסו מה קארטה?", "boró na pliróso me kárta?"],
  ["food", "קבלה", "Receipt", "Απόδειξη", "אפוד׳יקסי", "apódixi"],

  ["go", "איפה...?", "Where is...?", "Πού είναι...;", "פו אינה...?", "pu íne...?"],
  ["go", "לשדה התעופה, בבקשה", "To the airport, please", "Στο αεροδρόμιο, παρακαλώ", "סטו אארוד׳רומיו, פאראקאלו", "sto aerodrómio, parakaló"],
  ["go", "לנמל פיראוס", "To the port of Piraeus", "Στο λιμάνι του Πειραιά", "סטו לימאני טו פיראה", "sto limáni tu Pireá"],
  ["go", "לכתובת הזאת", "To this address", "Σε αυτή τη διεύθυνση", "סה אפטי טי ד׳יאפת׳ינסי", "se aftí ti diéfthinsi"],
  ["go", "כמה עולה עד המרכז?", "How much is it to the centre?", "Πόσο κοστίζει μέχρι το κέντρο;", "פוסו קוסטיזי מחרי טו קנדרו?", "póso kostízi méchri to kéndro?"],
  ["go", "עצרו כאן, בבקשה", "Stop here, please", "Σταματήστε εδώ, παρακαλώ", "סטאמאטיסטה אד׳ו, פאראקאלו", "stamatíste edó, parakaló"],
  ["go", "מונית", "Taxi", "Ταξί", "טאקסי", "taxí"],
  ["go", "מטרו", "Metro", "Μετρό", "מטרו", "metró"],
  ["go", "אוטובוס", "Bus", "Λεωφορείο", "לאופוריו", "leoforío"],
  ["go", "כרטיס אחד, בבקשה", "One ticket, please", "Ένα εισιτήριο, παρακαλώ", "אנה איסיטיריו, פאראקאלו", "éna isitírio, parakaló"],
  ["go", "אונייה / מעבורת", "Ship / ferry", "Πλοίο", "פליו", "plío"],
  ["go", "באיזו שעה?", "At what time?", "Τι ώρα;", "טי אורה?", "ti óra?"],
  ["go", "שמאלה", "Left", "Αριστερά", "אריסטרה", "aristerá"],
  ["go", "ימינה", "Right", "Δεξιά", "ד׳קסיה", "dexiá"],
  ["go", "ישר", "Straight ahead", "Ευθεία", "אפת׳יה", "efthía"],
  ["go", "זה רחוק?", "Is it far?", "Είναι μακριά;", "אינה מאקריה?", "íne makriá?"],

  ["shop", "כמה זה עולה?", "How much is it?", "Πόσο κάνει;", "פוסו קאני?", "póso káni?"],
  ["shop", "יקר מדי", "Too expensive", "Πολύ ακριβό", "פולי אקריבו", "polí akrivó"],
  ["shop", "יש לכם...?", "Do you have...?", "Έχετε...;", "אחטה...?", "échete...?"],
  ["shop", "יש מידה קטנה יותר?", "Do you have a smaller size?", "Έχετε μικρότερο νούμερο;", "אחטה מיקרוטרו נומרו?", "échete mikrótero número?"],
  ["shop", "יש מידה גדולה יותר?", "Do you have a bigger size?", "Έχετε μεγαλύτερο νούμερο;", "אחטה מגאליטרו נומרו?", "échete megalítero número?"],
  ["shop", "אפשר למדוד?", "Can I try it on?", "Μπορώ να το δοκιμάσω;", "בורו נה טו ד׳וקימאסו?", "boró na to dokimáso?"],
  ["shop", "אני רק מסתכל/ת", "I'm just looking", "Απλώς κοιτάζω", "אפלוס קיטאזו", "aplós kitázo"],
  ["shop", "אני אקח את זה", "I'll take it", "Θα το πάρω", "ת׳ה טו פארו", "tha to páro"],
  ["shop", "פתוח", "Open", "Ανοιχτό", "אניחטו", "anichtó"],
  ["shop", "סגור", "Closed", "Κλειστό", "קליסטו", "klistó"],
  ["shop", "מזומן", "Cash", "Μετρητά", "מטריטה", "metritá"],
  ["shop", "שקית", "Bag", "Σακούλα", "סאקולה", "sakúla"],

  ["health", "בית מרקחת", "Pharmacy", "Φαρμακείο", "פארמאקיו", "farmakío"],
  ["health", "איפה בית המרקחת הקרוב?", "Where is the nearest pharmacy?", "Πού είναι το πιο κοντινό φαρμακείο;", "פו אינה טו פיו קונדינו פארמאקיו?", "pu íne to pio kondinó farmakío?"],
  ["health", "אני צריך/ה רופא", "I need a doctor", "Χρειάζομαι γιατρό", "חריאזומה יאטרו", "chriázome yatró"],
  ["health", "בית חולים", "Hospital", "Νοσοκομείο", "נוסוקומיו", "nosokomío"],
  ["health", "משהו לכאב ראש", "Something for a headache", "Κάτι για πονοκέφαλο", "קאטי יה פונוקפאלו", "káti ya ponokéfalo"],
  ["health", "יש לי חום", "I have a fever", "Έχω πυρετό", "אחו פירטו", "écho piretó"],
  ["health", "כואב לי הגרון", "I have a sore throat", "Πονάει ο λαιμός μου", "פונאי או למוס מו", "ponái o lemós mu"],
  ["health", "כואבת לי הבטן", "I have a stomach ache", "Πονάει η κοιλιά μου", "פונאי אי קיליה מו", "ponái i kiliá mu"],
  ["health", "משכך כאבים", "Painkiller", "Παυσίπονο", "פאפסיפונו", "pafsípono"],
  ["health", "פלסטרים", "Plasters", "Τσιρότα", "צירוטה", "tsiróta"],
  ["health", "קרם הגנה", "Sunscreen", "Αντηλιακό", "אנדיליאקו", "andiliakó"],
  ["health", "מרשם", "Prescription", "Συνταγή", "סינדאיִי", "sindayí"],

  ["sos", "הצילו!", "Help!", "Βοήθεια!", "בואית׳יה!", "voíthia!"],
  ["sos", "תזמינו משטרה!", "Call the police!", "Καλέστε την αστυνομία!", "קאלסטה טין אסטינומיה!", "kaléste tin astinomía!"],
  ["sos", "תזמינו אמבולנס!", "Call an ambulance!", "Καλέστε ασθενοφόρο!", "קאלסטה אסת׳נופורו!", "kaléste asthenofóro!"],
  ["sos", "שריפה!", "Fire!", "Φωτιά!", "פוטיה!", "fotiá!"],
  ["sos", "זה מקרה חירום", "It's an emergency", "Είναι επείγον", "אינה אפיגון", "íne epígon"],
  ["sos", "הלכתי לאיבוד", "I'm lost", "Χάθηκα", "חאת׳יקה", "cháthika"],
  ["sos", "גנבו לי את הדרכון", "My passport was stolen", "Μου έκλεψαν το διαβατήριο", "מו אקלפסאן טו ד׳יאבאטיריו", "mu éklepsan to diavatírio"],
  ["sos", "עברתי תאונה", "I've had an accident", "Είχα ατύχημα", "איחה אטיחימה", "ícha atíchima"],
  ["sos", "איפה השירותים?", "Where is the toilet?", "Πού είναι η τουαλέτα;", "פו אינה אי טואלטה?", "pu íne i tualéta?"],
  ["sos", "עזבו אותי!", "Leave me alone!", "Αφήστε με!", "אפיסטה מה!", "afíste me!"],

  ["num", "0", "0", "μηδέν", "מיד׳ן", "midén"],
  ["num", "1", "1", "ένα", "אנה", "éna"],
  ["num", "2", "2", "δύο", "ד׳יו", "dío"],
  ["num", "3", "3", "τρία", "טריה", "tría"],
  ["num", "4", "4", "τέσσερα", "טסרה", "téssera"],
  ["num", "5", "5", "πέντε", "פנדה", "pénde"],
  ["num", "6", "6", "έξι", "אקסי", "éxi"],
  ["num", "7", "7", "επτά", "אפטה", "eptá"],
  ["num", "8", "8", "οκτώ", "אוקטו", "októ"],
  ["num", "9", "9", "εννέα", "אנאה", "enéa"],
  ["num", "10", "10", "δέκα", "ד׳קה", "déka"],
  ["num", "20", "20", "είκοσι", "איקוסי", "íkosi"],
  ["num", "50", "50", "πενήντα", "פנינדה", "penínda"],
  ["num", "100", "100", "εκατό", "אקאטו", "ekató"],
  ["num", "1,000", "1,000", "χίλια", "חיליה", "chília"],
];

const CATS = [["basics", "👋 בסיס", "👋 Basics"], ["food", "🍽️ מסעדה", "🍽️ Restaurant"], ["go", "🚕 מונית ותחבורה", "🚕 Taxi & transport"], ["shop", "🛍️ קניות", "🛍️ Shopping"], ["health", "💊 בית מרקחת ובריאות", "💊 Pharmacy & health"], ["sos", "🆘 חירום", "🆘 Emergency"], ["num", "🔢 מספרים", "🔢 Numbers"]];

export function phrasebookPage(lang) {
  const he = lang === "he", L = (a, b) => (he ? a : b);
  const title = L("שיחון יוונית לישראלים", "Greek phrasebook for Israelis");
  const description = L(`${PHRASES.length} משפטים שימושיים ביוונית: במסעדה, במונית, בקניות, בבית המרקחת ובמקרה חירום – עם הגייה בעברית והשמעה בלחיצה.`, `${PHRASES.length} useful Greek phrases for the restaurant, taxi, shopping, pharmacy and emergencies – with pronunciation and audio at a tap.`);
  const card = (p) => `<div class="ph" data-s="${esc((p[1] + " " + p[2] + " " + p[3] + " " + p[4] + " " + p[5]).toLowerCase())}"><div class="ph-m">${esc(he ? p[1] : p[2])}</div><div class="ph-g" lang="el">${esc(p[3])}</div><div class="ph-p"${he ? "" : ' dir="ltr"'}>${esc(he ? p[4] : p[5])}</div><button type="button" class="ph-play" data-say="${esc(p[3])}" aria-label="${L("השמעה", "Play")}: ${esc(p[3])}">▶</button></div>`;
  const body = `<div class="page-h"><h1>💬 ${esc(title)}</h1><p>${esc(description)}</p></div>
<div class="grid"><div class="col">
<div class="phbar"><input id="ph-q" type="search" autocomplete="off" placeholder="${L("חיפוש: למשל חשבון, מים, רופא", "Search: e.g. bill, water, doctor")}" aria-label="${L("חיפוש משפט", "Search phrases")}"><nav class="chips" aria-label="${L("קטגוריות", "Categories")}">${CATS.map(([k, a, b]) => `<a href="#ph-${k}">${esc(he ? a : b)}</a>`).join("")}</nav></div>
${he ? `<div class="small ph-key"><b>איך קוראים את ההגייה:</b> <span><b>ד׳</b> – כמו <bdi dir="ltr">th</bdi> במילה <bdi dir="ltr">the</bdi></span> · <span><b>ת׳</b> – כמו <bdi dir="ltr">th</bdi> במילה <bdi dir="ltr">think</bdi></span> · <span><b>ח</b> – כמו בעברית</span><br>▶ משמיע את המשפט ביוונית (אם במכשיר יש קול ביוונית).</div>` : `<p class="small">Pronunciation: the accent marks the stressed syllable; "ch" sounds like the ch in Scottish "loch"; "d" is soft, like the th in "the". ▶ plays the phrase in Greek (if your device has a Greek voice).</p>`}
<p class="ph-empty empty-note" id="ph-none" hidden>${L("לא נמצאו משפטים. נסו מילה אחרת.", "No phrases found. Try another word.")}</p>
${CATS.map(([k, a, b]) => `<section class="phsec" id="ph-${k}"><div class="zone-h"><h2>${esc(he ? a : b)}</h2></div><div class="phs">${PHRASES.filter((p) => p[0] === k).map(card).join("")}</div></section>`).join("")}
<section class="links tl-links"><a href="${P(lang, "/emergency/")}">🆘 ${L("מספרי חירום ושגרירות ישראל", "Emergency numbers & Israeli embassy")}</a><a href="${P(lang, "/shabbat/")}">🕯️ ${L("זמני שבת וכשרות ביוון", "Shabbat times & kosher in Greece")}</a><a href="${P(lang, "/travel/")}">🏝️ ${L("חופשה ביוון", "Holiday in Greece")}</a></section>
<div class="sharebar"><button type="button" class="btn ghost" data-share>${L("📤 שלחו לחברים שטסים ליוון", "📤 Send to friends flying to Greece")}</button></div>
</div>__WIDGETS__</div>
<script type="application/json" id="ph-t">${JSON.stringify({ noVoice: L("אין במכשיר הזה קול ביוונית. אפשר להוסיף קול יווני בהגדרות הנגישות / הדיבור של המכשיר.", "This device has no Greek voice. You can add one in your device's speech / accessibility settings."), noTts: L("הדפדפן הזה לא תומך בהשמעה.", "This browser does not support speech.") })}</script>
${toolScript()}`;
  return { title, description, body, faq: [] };
}
