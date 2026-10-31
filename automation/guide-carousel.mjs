// Καθημερινό carousel «για αποθήκευση» από έναν οδηγό του site (Instagram + Facebook).
// Εξώφυλλο → 5 πρακτικά σημεία από τον οδηγό → «στείλτε σε φίλο». Κάθε οδηγός μία φορά.
//   node automation/guide-carousel.mjs render <outdir>     → εικόνες + plan.json
//   node automation/guide-carousel.mjs publish <outdir> <base-url-των-εικόνων>
import fs from "node:fs";
import path from "node:path";
import { ROOT, env, log, loadPublished, notifyOwner, claude, parseJSON } from "./lib.mjs";
import { renderCarousel } from "./ig-carousel.mjs";
import { ctx, api } from "./meta.mjs";

const STATE = path.join(ROOT, "content/ig/guide-carousels.json");
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return []; } };
const CAT_TAGS = { travel: "#טיול_ליוון #חופשה_ביוון", jewish: "#כשר_ביוון #שבת_ביוון", invest: "#נדלן_ביוון #השקעות_נדלן", live: "#לגור_ביוון #רילוקיישן" };
const noGreek = (s) => typeof s === "string" && !/[Ͱ-Ͽ]/.test(s);

function pick() {
  const used = new Set(readState().map((x) => x.slug));
  let reelUsed = new Set(); try { reelUsed = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "content/ig/guide-reels.json"), "utf8")).slice(-6).map((x) => x.slug)); } catch {}
  const now = Date.now();
  const all = loadPublished().filter((a) => a.guide && a.slug && a.he && a.he.body && Array.isArray(a.he.tldr) && !used.has(a.slug) && !reelUsed.has(a.slug) && !a.sensitive && !a.sponsored);
  // Τα πιο «σωσίμα» θέματα πρώτα: λίστες, κοσέρ, τιμές, τι να κάνεις, πού να μείνεις
  const sc = (a) => (/things-to-do|where-to-stay|kosher|shabbat|prices|cost|beaches|tips|mistakes|itinerary|food|restaurants|shopping|day-trip|ferry/.test(a.slug) ? 3 : 0) + ({ travel: 2, jewish: 2, invest: 1, live: 1 }[a.guideCat] || 0) + (now - Date.parse(a.publishedAt) < 30 * 86400e3 ? 1 : 0);
  return all.sort((a, b) => sc(b) - sc(a) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
}

async function build(a) {
  const body = a.he.body.replace(/##\s*שאלות נפוצות[\s\S]*$/, "").slice(0, 6000);
  const j = parseJSON(await claude({
    role: "select", temperature: 0.5, maxTokens: 2000,
    system: "You turn a Hebrew travel/living guide about Greece into an Instagram carousel for Israelis that people will SAVE and SEND to friends. Natural Israeli Hebrew, never Greek letters, no emojis inside items, nothing political. Use ONLY facts that appear in the guide text; no prices or dates unless they are in the text. JSON only.",
    prompt: `Guide title: ${a.he.title}\nGuide text:\n${body}\n\nReturn {"title": "cover title, max 6 words, a list promise like '5 דברים לדעת לפני שנוסעים לכרתים'", "sub": "one short line under the title, max 7 words", "items": [["short heading, max 5 words", "1-2 practical sentences, max 22 words"], ... exactly 5 items], "cta": "question for the last slide like 'מכירים מישהו שנוסע לכרתים?'", "question": "comment prompt for the caption, starting with 👇"}`,
  }));
  if (!j || typeof j.title !== "string" || !Array.isArray(j.items) || j.items.length < 4) throw new Error("AI: μη έγκυρο carousel");
  const items = j.items.slice(0, 5).filter((x) => Array.isArray(x) && x.length >= 2 && noGreek(x[0]) && noGreek(x[1]) && x[0].length <= 40 && x[1].length <= 170).map((x) => [x[0].trim(), x[1].trim()]);
  if (items.length < 4 || !noGreek(j.title)) throw new Error("AI: λίγα έγκυρα σημεία");
  return {
    id: "g-" + a.slug,
    kicker: "שמרו לטיול 🔖",
    title: j.title.trim().slice(0, 48),
    sub: (noGreek(j.sub) ? j.sub : a.he.title).trim().slice(0, 60),
    items,
    cta: [noGreek(j.cta) && j.cta.length < 50 ? j.cta.trim() : "מכירים מישהו שנוסע ליוון?", "שלחו לו את הפוסט 📲"],
    question: noGreek(j.question) && j.question.length < 90 ? j.question.trim() : "👇 שאלות? כתבו בתגובות ונענה",
    tags: `#יוון ${CAT_TAGS[a.guideCat] || ""} #ישראלים_ביוון #יוונט`.replace(/\s+/g, " "),
  };
}

const caption = (c, a) => `${c.title} 🔖\n\n${c.items.map((x, i) => `${i + 1}. ${x[0]}`).join("\n")}\n\n🔖 שמרו את הפוסט לטיול\n📤 מכירים מישהו שנוסע ליוון? שלחו לו\n📖 המדריך המלא באתר: yavanet.gr/a/${a.slug}/ (הקישור בביו)\n\n${c.question}\n\n${c.tags}`;

const [cmd, out = "car-out", base] = process.argv.slice(2);
if (cmd === "render") {
  fs.mkdirSync(out, { recursive: true });
  const last = readState().filter((x) => !x.skipped).pop();
  if (!env.FORCE && last && Date.now() - Date.parse(last.at) < 20 * 3600e3) { log("carousel: έχει ήδη ανέβει σήμερα"); fs.writeFileSync(path.join(out, "plan.json"), "null"); process.exit(0); }
  let a = pick(), car = null;
  for (let tries = 0; a && tries < 3 && !car; tries++) {
    try { car = await build(a); } catch (e) { log("carousel:", a.slug, e.message); const st = readState(); st.push({ slug: a.slug, skipped: true, at: new Date().toISOString() }); fs.writeFileSync(STATE, JSON.stringify(st, null, 1)); a = pick(); }
  }
  if (!car) { log("carousel: δεν βγήκε"); fs.writeFileSync(path.join(out, "plan.json"), "null"); process.exit(0); }
  const files = renderCarousel(car, out, "c", 0);
  fs.writeFileSync(path.join(out, "plan.json"), JSON.stringify({ slug: a.slug, title: car.title, files, caption: caption(car, a), alt: `${car.title} – יוונט, יוון בעברית` }, null, 1));
  console.log(`::notice::carousel: ${a.slug} · ${car.title} · ${files.length} slides`);
  process.exit(0);
}

if (cmd === "publish") {
  const p = JSON.parse(fs.readFileSync(path.join(out, "plan.json"), "utf8"));
  if (!p) process.exit(0);
  const c = await ctx();
  const res = [];
  const wait = async (id) => { for (let i = 0; i < 30; i++) { const r = await api(`/${id}`, { token: c.userToken, params: { fields: "status_code" } }); if (r.status_code === "FINISHED") return; if (r.status_code === "ERROR") throw new Error("container error"); await new Promise((s) => setTimeout(s, 4000)); } };
  if (c.igId && env.CAR_ONLY !== "fb") {
    try {
      const kids = [];
      for (const f of p.files) { const ch = await api(`/${c.igId}/media`, { method: "POST", token: c.userToken, params: { image_url: `${base}/${f}`, is_carousel_item: "true" } }); await wait(ch.id); kids.push(ch.id); }
      const m = await api(`/${c.igId}/media`, { method: "POST", token: c.userToken, params: { media_type: "CAROUSEL", children: kids.join(","), caption: p.caption } });
      await wait(m.id);
      await api(`/${c.igId}/media_publish`, { method: "POST", token: c.userToken, params: { creation_id: m.id } });
      res.push("IG carousel ✓");
    } catch (e) { res.push("IG ✗ " + e.message.slice(0, 120)); }
  }
  if (env.CAR_ONLY !== "ig") {
    try {
      // Facebook: ανάρτηση με πολλές φωτογραφίες (ίδιες εικόνες, ίδια λεζάντα)
      const ids = [];
      for (const f of p.files) { const ph = await api(`/${c.pageId}/photos`, { method: "POST", token: c.pageToken, params: { url: `${base}/${f}`, published: "false" } }); ids.push(ph.id); }
      const params = { message: p.caption };
      ids.forEach((id, i) => { params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id }); });
      await api(`/${c.pageId}/feed`, { method: "POST", token: c.pageToken, params });
      res.push("FB ✓");
    } catch (e) { res.push("FB ✗ " + e.message.slice(0, 120)); }
  }
  const st = readState(); st.push({ slug: p.slug, title: p.title, at: new Date().toISOString(), res }); fs.writeFileSync(STATE, JSON.stringify(st, null, 1));
  log("carousel:", p.slug, res.join(" · "));
  console.log("::notice::" + res.join(" · "));
  await notifyOwner(`🗂 Carousel οδηγού ανέβηκε: ${p.title}\n${res.join(" · ")}`).catch(() => {});
  process.exit(0);
}
console.log("χρήση: render <dir> | publish <dir> <base-url>");
