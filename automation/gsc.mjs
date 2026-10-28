// Εβδομαδιαία αναφορά Google Search Console → Telegram: τι ψάχνει ο κόσμος και μας βρίσκει.
// Κλειδί: secret GSC_SA_JSON (JSON λογαριασμού υπηρεσίας Google Cloud, με πρόσβαση «Περιορισμένη» στο Search Console).
import crypto from "node:crypto";
import { notifyOwner } from "./lib.mjs";

const raw = process.env.GSC_SA_JSON || "";
if (!raw.trim()) { console.log("::warning::GSC_SA_JSON δεν έχει οριστεί – παράλειψη"); process.exit(0); }
// Δεκτό: ολόκληρο το αρχείο JSON, ή μόνο το private key (με ή χωρίς BEGIN/END, με \n ως κείμενο)
const shape = { len: raw.length, json: raw.trim().startsWith("{"), email: raw.includes("client_email"), begin: raw.includes("BEGIN PRIVATE KEY"), escapedNL: raw.includes("\\n") };
console.log("::notice::secret shape " + JSON.stringify(shape));
let sa;
try { sa = JSON.parse(raw); } catch {
  let k = raw.trim().replace(/^"|",?$/g, "").replace(/\\n/g, "\n").replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/-+/g, "").replace(/\s+/g, "");
  sa = { client_email: process.env.GSC_SA_EMAIL || "yavanet-gsc@cool-agility-513018-j9.iam.gserviceaccount.com", private_key: `-----BEGIN PRIVATE KEY-----\n${k.match(/.{1,64}/g).join("\n")}\n-----END PRIVATE KEY-----\n` };
}
const b64 = (x) => Buffer.from(typeof x === "string" ? x : JSON.stringify(x)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
const jwt = unsigned + "." + crypto.sign("RSA-SHA256", Buffer.from(unsigned), sa.private_key).toString("base64url");
const tok = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) })).json();
if (!tok.access_token) { console.log("::error::token: " + JSON.stringify(tok).slice(0, 300)); process.exit(1); }
const H = { authorization: "Bearer " + tok.access_token, "content-type": "application/json" };

// Ποιο property έχουμε (domain ή URL-prefix)
const sites = (await (await fetch("https://www.googleapis.com/webmasters/v3/sites", { headers: H })).json()).siteEntry || [];
const site = (sites.find((s) => s.siteUrl === "sc-domain:yavanet.gr") || sites.find((s) => /yavanet\.gr/.test(s.siteUrl)) || {}).siteUrl;
if (!site) { console.log("::error::Ο λογαριασμός " + sa.client_email + " δεν έχει πρόσβαση στο yavanet.gr στο Search Console. Βρέθηκαν: " + sites.map((s) => s.siteUrl).join(", ")); process.exit(1); }

const day = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
const END = 2, LEN = 7; // τα δεδομένα της Google έχουν 2–3 μέρες καθυστέρηση
const q = async (body) => (await (await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: "POST", headers: H, body: JSON.stringify(body) })).json()).rows || [];
const range = (off) => ({ startDate: day(END + LEN - 1 + off), endDate: day(END + off) });
const tot = async (off) => (await q({ ...range(off) }))[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
const [cur, prev] = [await tot(0), await tot(LEN)];
const queries = await q({ ...range(0), dimensions: ["query"], rowLimit: 250 });
const pages = await q({ ...range(0), dimensions: ["page"], rowLimit: 10 });
const countries = await q({ ...range(0), dimensions: ["country"], rowLimit: 5 });

const pct = (a, b) => (b ? (a >= b ? "+" : "") + Math.round(((a - b) / b) * 100) + "%" : "νέο");
const pos = (p) => p.toFixed(1);
const short = (u) => decodeURIComponent(u.replace(/^https?:\/\/[^/]+/, "")).slice(0, 60) || "/";
// Ευκαιρίες: πολλές εμφανίσεις, θέση 5–20 (σελίδα 1 κάτω ή σελίδα 2) → με καλύτερο τίτλο/περιεχόμενο ανεβαίνουν
const opps = queries.filter((r) => r.position >= 5 && r.position <= 20 && r.impressions >= 10).sort((a, b) => b.impressions - a.impressions).slice(0, 8);
// Χαμηλό CTR: εμφανιζόμαστε ψηλά αλλά δεν μας πατάνε → θέλει πιο ελκυστικό τίτλο
const lowCtr = queries.filter((r) => r.position <= 6 && r.impressions >= 20 && r.ctr < 0.02).sort((a, b) => b.impressions - a.impressions).slice(0, 5);

const lines = [
  `🔎 Google – εβδομάδα ${range(0).startDate.slice(5)} έως ${range(0).endDate.slice(5)}`,
  `Κλικ: ${cur.clicks} (${pct(cur.clicks, prev.clicks)}) · Εμφανίσεις: ${cur.impressions} (${pct(cur.impressions, prev.impressions)})`,
  `CTR: ${(cur.ctr * 100).toFixed(1)}% · Μέση θέση: ${pos(cur.position)}`,
  "",
  "🏆 Τι έψαξαν και μας βρήκαν (κλικ / εμφανίσεις / θέση):",
  ...queries.slice().sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 12).map((r) => `• ${r.keys[0]} — ${r.clicks} / ${r.impressions} / ${pos(r.position)}`),
  "",
  "📄 Σελίδες με τα περισσότερα κλικ:",
  ...pages.map((r) => `• ${short(r.keys[0])} — ${r.clicks} κλικ`),
  "",
  `🌍 Χώρες: ${countries.map((r) => `${r.keys[0].toUpperCase()} ${r.clicks}`).join(" · ")}`,
];
if (opps.length) lines.push("", "🚀 Ευκαιρίες (σχεδόν στην 1η σελίδα – αξίζει άρθρο/βελτίωση):", ...opps.map((r) => `• ${r.keys[0]} — θέση ${pos(r.position)}, ${r.impressions} εμφανίσεις`));
if (lowCtr.length) lines.push("", "✏️ Μας βλέπουν αλλά δεν πατάνε (θέλει καλύτερο τίτλο):", ...lowCtr.map((r) => `• ${r.keys[0]} — θέση ${pos(r.position)}, CTR ${(r.ctr * 100).toFixed(1)}%`));
const text = lines.join("\n");
console.log(text.split("\n").map((l) => "::notice::" + l).join("\n"));
// Για επόμενες βελτιώσεις (τίτλοι/άρθρα): αποθήκευση των αναζητήσεων
await import("node:fs").then((fs) => { fs.mkdirSync("content/gsc", { recursive: true }); fs.writeFileSync(`content/gsc/${range(0).endDate}.json`, JSON.stringify({ site, range: range(0), totals: cur, prev, queries, pages, countries }, null, 1)); });
if (process.env.NO_TG !== "1") await notifyOwner(text);
