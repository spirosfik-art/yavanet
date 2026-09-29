// IndexNow: ενημερώνει αμέσως Bing, Yandex, Seznam κ.ά. για νέες/αλλαγμένες σελίδες (η Google δεν το υποστηρίζει).
// INDEXNOW_ALL=1 → όλο το sitemap (μετά από αλλαγή κώδικα), αλλιώς μόνο ό,τι δημοσιεύτηκε τις τελευταίες 6 ώρες.
import fs from "node:fs";
const KEY = "37171a78cbc8f6d58cbf1157ea4cb476", HOST = "yavanet.gr";
const read = (f) => { try { return fs.readFileSync(f, "utf8"); } catch { return ""; } };
let urls;
if (process.env.INDEXNOW_ALL === "1") urls = [...read("dist/sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
else {
  const since = Date.now() - 6 * 3600e3;
  urls = [...read("dist/news-sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>[\s\S]*?<news:publication_date>([^<]+)</g)].filter((m) => Date.parse(m[2]) >= since).map((m) => m[1]);
  if (urls.length) urls.push("https://yavanet.gr/", "https://yavanet.gr/en/");
}
urls = [...new Set(urls)].slice(0, 10000);
if (!urls.length) { console.log("indexnow: τίποτα νέο"); process.exit(0); }
try {
  const r = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }), signal: AbortSignal.timeout(20000) });
  console.log("indexnow:", urls.length, "URL →", r.status);
} catch (e) { console.log("indexnow: σφάλμα", e.message); }
