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

// Πόσες σελίδες έχει δώσει το site στη Google (sitemap) και πόσες έχει ήδη στο ευρετήριο
const SITE = "sc-domain:yavanet.gr";
const g = async (u, opt = {}) => { const r = await fetch(u, { headers: H, ...opt }); return r.json(); };
const sm = await g(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`);
for (const s of sm.sitemap || []) {
  const c = (s.contents || []).map((x) => `${x.type}: υποβλήθηκαν ${x.submitted}`).join(" · ");
  console.log(`::notice::SITEMAP ${s.path} · τελευταία ανάγνωση ${s.lastDownloaded || "–"} · ${c} · σφάλματα ${s.errors || 0} · προειδοποιήσεις ${s.warnings || 0}`);
}
if (sm.error) console.log("::notice::SITEMAP error " + JSON.stringify(sm.error).slice(0, 200));
// Σελίδες που εμφανίστηκαν έστω και μία φορά στη Google τις τελευταίες 28 μέρες
const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
const pg = await g(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, { method: "POST", body: JSON.stringify({ startDate: start, endDate: end, dimensions: ["page"], rowLimit: 25000 }) });
const pages = (pg.rows || []).map((r) => r.keys[0]);
console.log(`::notice::PAGES με εμφανίσεις στη Google (${start}…${end}): ${pages.length} (άρθρα /a/: ${pages.filter((p) => p.includes("/a/")).length})`);
// Έλεγχος ευρετηρίου (URL Inspection) για δείγμα πρόσφατων σελίδων από το sitemap
const xml = await (await fetch("https://yavanet.gr/sitemap.xml")).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({ u: m[1], d: m[2] || "" }));
console.log(`::notice::SITEMAP σελίδες στο yavanet.gr/sitemap.xml: ${urls.length} (άρθρα: ${urls.filter((x) => x.u.includes("/a/")).length})`);
const N = Number(process.env.INSPECT_N || 120);
const arts = urls.filter((x) => x.u.includes("/a/") && !x.u.includes("/en/"));
const sample = [...arts].sort(() => Math.random() - 0.5).slice(0, N);
const st = {};
for (const x of sample) {
  try {
    const r = await g("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { method: "POST", body: JSON.stringify({ inspectionUrl: x.u, siteUrl: SITE }) });
    const s = r.inspectionResult?.indexStatusResult?.coverageState || (r.error ? "error: " + r.error.message.slice(0, 60) : "?");
    st[s] = (st[s] || 0) + 1;
  } catch (e) { st["error"] = (st["error"] || 0) + 1; }
}
console.log(`::notice::INSPECT δείγμα ${sample.length} εβραϊκών άρθρων: ${Object.entries(st).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join(" · ")}`);
