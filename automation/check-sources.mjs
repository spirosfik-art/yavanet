// Έλεγχος όλων των πηγών: node automation/check-sources.mjs
import path from "node:path";
import { ROOT, readJSON, fetchText, parseFeed, extractLinks } from "./lib.mjs";
const { sources } = readJSON(path.join(ROOT, "automation/sources.json"), { sources: [] });
for (const s of sources) {
  if (s.enabled === false || !s.url) { console.log(`–  ${s.id}: απενεργοποιημένη`); continue; }
  try {
    const body = await fetchText(s.url);
    const n = s.type === "rss" ? parseFeed(body).length : s.type === "html" ? extractLinks(body, s.url, s.linkPattern).length : (JSON.parse(body).features || []).length;
    console.log(`${n ? "✓" : "?"}  ${s.id}: ${n} θέματα`);
  } catch (e) { console.log(`✗  ${s.id}: ${e.message}`); }
}
