// Έρευνα ζήτησης: προτάσεις αυτόματης συμπλήρωσης Google (εβραϊκά) για θέματα Ελλάδας → research/suggest.json
import fs from "node:fs";
const SEEDS = ["יוון", "אתונה", "כרתים", "רודוס", "סלוניקי", "קורפו", "מיקונוס", "סנטוריני", "חלקידיקי", "זקינתוס", "כפלוניה", "נקסוס", "פארוס", "לפקדה", "מטאורה",
  "נדלן ביוון", "דירה באתונה", "השקעה ביוון", "גולדן ויזה", "לגור ביוון", "רילוקיישן ליוון", "עבודה ביוון", "מיסים ביוון", "משכנתא ביוון", "אזרחות יוונית", "דרכון יווני",
  "טיסות ליוון", "מעבורת", "השכרת רכב ביוון", "חופשה ביוון", "טיול ליוון", "טיול משפחות ביוון", "איים ביוון", "מלון באתונה", "airbnb ביוון", "כשר ביוון", "חבד ביוון", "שבת ביוון",
  "שביתה ביוון", "מזג אוויר ביוון", "יוון בחורף", "יוון בפסח", "יוון באוגוסט", "יוון עם ילדים", "esim יוון", "כסף ביוון", "ביטוח נסיעות יוון", "אנטישמיות ביוון", "בטיחות ביוון",
  "בית ספר ביוון", "פנסיה ביוון", "קופת חולים יוון", "רישיון נהיגה יוון", "ויזה ליוון", "רכישת דירה ביוון", "מכרזים ביוון", "יוונית"];
const EXP = ["", " א", " ב", " ג", " ד", " ה", " ו", " ז", " ח", " ט", " י", " כ", " ל", " מ", " נ", " ס", " ע", " פ", " צ", " ק", " ר", " ש", " ת", " איך", " כמה", " מה", " האם", " למה", " איפה", " מתי"];
const out = {}; let n = 0;
for (const s of SEEDS) {
  const set = new Set();
  for (const e of EXP) {
    try {
      const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=he&gl=il&q=${encodeURIComponent(s + e)}`, { headers: { "user-agent": "Mozilla/5.0" } });
      const j = JSON.parse(new TextDecoder("utf-8").decode(await r.arrayBuffer()));
      (j[1] || []).forEach((x) => set.add(x)); n++;
    } catch (err) { }
    await new Promise((r) => setTimeout(r, 120));
  }
  out[s] = [...set];
}
fs.mkdirSync("research", { recursive: true });
fs.writeFileSync("research/suggest.json", JSON.stringify(out, null, 1));
console.log(`::notice::suggest: ${n} κλήσεις, ${Object.values(out).reduce((a, x) => a + x.length, 0)} προτάσεις`);
