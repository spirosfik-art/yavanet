// Ταξινόμηση θεμάτων-κενών με Gemini: κρατάμε/πετάμε, ελληνικός & εβραϊκός τίτλος άρθρου, κατηγορία → research/topics-classified.json
import fs from "node:fs";
import { claude, parseJSON, log } from "../automation/lib.mjs";
const topics = JSON.parse(fs.readFileSync("research/topics.json", "utf8"));
const CATS = ["Ταξίδι – αξιοθέατα", "Ταξίδι – διαμονή", "Ταξίδι – παραλίες", "Ταξίδι – φαγητό", "Ταξίδι – πώς φτάνω/μεταφορές", "Πτήσεις", "Καιρός & εποχές", "Οικογένειες με παιδιά", "Κασέρ & εβραϊκή ζωή", "Ακίνητα & επενδύσεις", "Φόροι & γραφειοκρατία", "Ζωή & δουλειά στην Ελλάδα", "Τιμές & κόστος", "Ασφάλεια", "Γλώσσα & πολιτισμός", "Αγορές", "Νυχτερινή ζωή", "Ζευγάρια", "Άλλο"];
const SYSTEM = `You are an SEO editor for Yavanet, a Hebrew news & guide site about Greece for Israelis. Return JSON only.`;
const out = fs.existsSync("research/topics-classified.json") ? JSON.parse(fs.readFileSync("research/topics-classified.json", "utf8")) : {};
const todo = topics.filter((t) => !out[t.id]);
log("todo", todo.length);
for (let i = 0; i < todo.length; i += 50) {
  const batch = todo.slice(i, i + 50);
  const prompt = `Each item is a cluster of real Google searches by Israelis (Hebrew). Decide if it deserves its OWN article on a site about Greece for Israelis.
keep=false if: not about Greece (Israeli places/brands, other countries, TV series, products, pets), too trivial for an article ("X in English", flag, population only, "is X in Greece"), or pure navigational brand search (a hotel name, a store).
For keep=true give: el = article title in Greek (natural, short), he = article title in Hebrew (natural Israeli Hebrew, SEO-friendly), cat = one of ${JSON.stringify(CATS)}.
Items: ${JSON.stringify(batch.map((t) => ({ id: t.id, q: t.queries.slice(0, 6) })))}
Return {"items":[{"id":"","keep":true|false,"el":"","he":"","cat":""}]}`;
  try {
    const r = parseJSON(await claude({ system: SYSTEM, prompt, role: "select", maxTokens: 8000, temperature: 0.1 }));
    for (const it of r.items || []) if (it && it.id) out[it.id] = it;
    fs.writeFileSync("research/topics-classified.json", JSON.stringify(out));
    log("batch", i, Object.keys(out).length);
  } catch (e) { log("σφάλμα", e.message); if (/ημερήσιο|quota|daily/i.test(e.message)) break; }
}
console.log(`::notice::classify: ${Object.keys(out).length}/${topics.length}, keep ${Object.values(out).filter((x) => x.keep).length}`);
