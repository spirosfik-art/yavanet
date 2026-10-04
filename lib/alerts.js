// Ειδοποιήσεις καιρού (και απεργιών) με email: κοινά για τη φόρμα (site), το /api/lead, το /api/alerts και το automation/weather-alerts.mjs.
// Τρέχει και σε Cloudflare Workers και σε Node 20+ (Web Crypto: globalThis.crypto.subtle).

// Περιοχές συνδρομής. Το «re» ταιριάζει στο κείμενο του άρθρου (slug, τίτλος, περίληψη στα αγγλικά).
// Άρθρο ΧΩΡΙΣ αναγνωρίσιμη περιοχή = πανελλαδική προειδοποίηση → στέλνεται σε όλους.
export const ALERT_REGIONS = [
  { id: "attica", he: "אתונה ואטיקה", en: "Athens & Attica", re: /attica|attiki|athens|piraeus|rafina|lavrio/i },
  { id: "crete", he: "כרתים", en: "Crete", re: /crete|heraklion|chania|rethymno|lasithi|ierapetra|agios nikolaos/i },
  { id: "dodecanese", he: "רודוס, קוס והדודקאנסיים", en: "Rhodes, Kos & Dodecanese", re: /dodecanese|dodekanis|rhodes|\bkos\b|karpathos|kalymnos|leros|patmos|symi|south(ern)?[- ]aegean/i },
  { id: "cyclades", he: "האיים הקיקלדיים", en: "Cyclades", re: /cyclades|kyklades|santorini|mykonos|naxos|paros|milos|syros|tinos|\bios\b|south(ern)?[- ]aegean/i },
  { id: "ionian", he: "האיים היוניים (קורפו, זקינתוס...)", en: "Ionian (Corfu, Zakynthos...)", re: /ionian|corfu|kerkyra|kefalonia|cephalonia|zakynthos|zante|lefkada|ithaca|paxos/i },
  { id: "thessaloniki", he: "סלוניקי ומקדוניה", en: "Thessaloniki & Macedonia", re: /thessaloniki|macedonia/i },
  { id: "chalkidiki", he: "חלקידיקי", en: "Chalkidiki", re: /chalkidiki|halkidiki|kassandra|sithonia|central macedonia/i },
  { id: "peloponnese", he: "פלופונס", en: "Peloponnese", re: /peloponn?es|peloponnisos|nafplio|kalamata|monemvasia|patras|messinia|argolid/i },
];
export const REGION_IDS = ALERT_REGIONS.map((r) => r.id);
export const ALL = "all";

// Περιοχές ενός άρθρου καιρού ([] = όλη η Ελλάδα)
export function articleRegions(a) {
  const t = `${String(a.slug || "").replace(/-/g, " ")} ${a.en?.title || ""} ${a.en?.dek || ""}`;
  return ALERT_REGIONS.filter((r) => r.re.test(t)).map((r) => r.id);
}

// Επίπεδο συνδρομής: "severe" = μόνο πορτοκαλί/κόκκινο, "all" = όλα (και κίτρινο και αναφορές χωρίς χρώμα)
export const levelOk = (sub, level) => (sub === "all" ? true : level === "orange" || level === "red");
export function regionsOk(subRegions, artRegions) {
  const s = new Set(subRegions);
  if (s.has(ALL) || !artRegions.length) return true;
  return artRegions.some((r) => s.has(r));
}

// Καθαρισμός εισόδου φόρμας
export function cleanRegions(v) {
  const arr = (Array.isArray(v) ? v : String(v || "").split(",")).map((x) => String(x).trim()).filter(Boolean);
  if (arr.includes(ALL)) return [ALL];
  return [...new Set(arr.filter((x) => REGION_IDS.includes(x)))];
}

/* ---------- Υπογεγραμμένα tokens (επιβεβαίωση εγγραφής / διαγραφή) ----------
   Κλειδί: παράγεται από το TELEGRAM_BOT_TOKEN (ίδιο στο Cloudflare και στο GitHub: το scripts/deploy.sh το συγχρονίζει). */
const enc = new TextEncoder();
const b64u = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(String(s).replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const secretOf = (env) => String(env.TELEGRAM_BOT_TOKEN || "").replace(/\s/g, "");
async function hmac(env, purpose, msg) {
  const sec = secretOf(env);
  if (!sec) throw new Error("no-secret");
  const key = await crypto.subtle.importKey("raw", enc.encode("yavanet:alerts:" + purpose + ":" + sec), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)))).slice(0, 24);
}
export async function signToken(env, purpose, data) {
  const p = b64u(enc.encode(JSON.stringify(data)));
  return p + "." + (await hmac(env, purpose, p));
}
export async function readToken(env, purpose, tok, maxAgeMs = 0) {
  const [p, sig] = String(tok || "").split(".");
  if (!p || !sig) return null;
  try {
    if ((await hmac(env, purpose, p)) !== sig) return null;
    const d = JSON.parse(new TextDecoder().decode(unb64u(p)));
    if (maxAgeMs && (!d.at || Date.now() - Date.parse(d.at) > maxAgeMs)) return null;
    return d;
  } catch { return null; }
}
// Σύνδεσμος διαγραφής για κάθε email ειδοποίησης (μόνιμος, χωρίς λήξη)
export async function unsubUrl(env, base, email, lang) {
  return `${base.replace(/\/$/, "")}/api/alerts?a=unsub&t=${encodeURIComponent(await signToken(env, "unsub", { e: email, l: lang === "en" ? "en" : "he" }))}`;
}
