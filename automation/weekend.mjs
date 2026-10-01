// «Το Σαββατοκύριακο στην Αθήνα»: κάθε Πέμπτη μαζεύει εκδηλώσεις από επίσημες πηγές πολιτισμού
// και γράφει ένα άρθρο (εβραϊκά/αγγλικά) με λίστα: τίτλος, ημερομηνία, χώρος, link στην πηγή.
// Κανόνας: κάθε εκδήλωση πρέπει να υπάρχει στο HTML της πηγής (έλεγχος του link) – τίποτα επινοημένο.
// Εκτέλεση: node automation/weekend.mjs   (FORCE=1 για να ξαναγραφτεί το ίδιο Σαββατοκύριακο)
import fs from "node:fs";
import path from "node:path";
import { env, log, fetchText, htmlToText, claude, hasAI, parseJSON, saveArticle, ARTICLES_DIR, notifyOwner, isoAthens } from "./lib.mjs";
import { SITE } from "../site/config.mjs";

// Επίσημες πηγές (δημόσιοι/πολιτιστικοί φορείς). Παίρνουμε μόνο τίτλο, ημερομηνία, χώρο και link.
const SOURCES = [
  { id: "cultureisathens", name: "Culture is Athens (Δήμος Αθηναίων)", url: "https://cultureisathens.gr/en/event-listing-1/", link: /cultureisathens\.gr\/en\/event\// },
  { id: "megaron", name: "Megaron – Athens Concert Hall", url: "https://www.megaron.gr/en/events-2/calendar/", link: /megaron\.gr\/en\/event\// },
  { id: "technopolis", name: "Technopolis – City of Athens", url: "https://athens-technopolis.gr/index.php/en/component/djevents/events", link: /athens-technopolis\.gr\/.*djevents\/details\// },
  { id: "onassis", name: "Onassis Stegi", url: "https://www.onassis.org/whats-on", link: /onassis\.org\/whats-on\/[^"#?]+/ },
  { id: "nationalgallery", name: "National Gallery – Alexandros Soutsos Museum", url: "https://www.nationalgallery.gr/en/exhibitions/", link: /nationalgallery\.gr\/en\/exhibition/ },
];

// Το επόμενο Σαββατοκύριακο (Παρασκευή–Κυριακή) σε ώρα Αθήνας
function weekendDates() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Athens" }));
  const dow = now.getDay(); // 0 Κυριακή … 4 Πέμπτη
  const toFri = (5 - dow + 7) % 7;
  const fri = new Date(now); fri.setDate(now.getDate() + toFri);
  const d = (k) => { const x = new Date(fri); x.setDate(fri.getDate() + k); return x.toISOString().slice(0, 10); };
  return [d(0), d(1), d(2)];
}

// HTML → κείμενο που κρατά τα links ως [κείμενο](url), για να τα «δει» το AI
function withLinks(html, base) {
  const h = String(html).replace(/<a\s[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, inner) => {
    let u; try { u = new URL(href.replace(/&amp;/g, "&"), base).toString(); } catch { return inner; }
    const t = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return t ? ` [${t}](${u}) ` : "";
  });
  const m = h.match(/<main[\s\S]*?<\/main>/i);
  return htmlToText(m ? m[0] : h).slice(0, 14000);
}

const SYSTEM = `You extract cultural events in Athens from official listing pages. You NEVER invent anything: every event, date, venue and URL must appear in the provided text. Return ONLY JSON.`;

(async () => {
  if (!hasAI()) { log("χωρίς κλειδί AI – παράλειψη"); return; }
  const [fri, sat, sun] = weekendDates();
  const slug = `weekend-in-athens-${fri}`;
  const exists = fs.readdirSync(ARTICLES_DIR).some((f) => f.includes(slug));
  if (exists && env.FORCE !== "1") { log("υπάρχει ήδη:", slug); return; }

  const pages = [], allowed = new Map();
  for (const s of SOURCES) {
    try {
      const html = await fetchText(s.url, { timeout: 25000 });
      const txt = withLinks(html, s.url);
      const links = [...txt.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]).filter((u) => s.link.test(u));
      links.forEach((u) => allowed.set(u.replace(/\/$/, ""), s));
      log(`${s.id}: ${links.length} links`);
      if (links.length) pages.push(`### SOURCE ${s.id} (${s.name}) – ${s.url}\n${txt}`);
    } catch (e) { log(`${s.id}: ${e.message}`); }
  }
  if (!pages.length) { await notifyOwner("🗓️ Σαββατοκύριακο στην Αθήνα: καμία πηγή δεν απάντησε – δεν γράφτηκε άρθρο."); return; }

  const prompt = `Weekend: Friday ${fri}, Saturday ${sat}, Sunday ${sun}.
From the listing pages below, pick up to 12 events in Athens that take place on at least one of these three days (single-day events on those dates, or exhibitions/festivals whose date range covers the weekend). Prefer variety (music, theatre, exhibitions, markets, family) and well-known venues. Skip anything whose dates are unclear.
For each event return:
{"url": exact URL from the text, "source": source id, "title_en": title in English (translate it if the text shows it only in Greek; keep the original proper names), "title_he": short natural Hebrew title (keep proper names in Latin letters if no common Hebrew form), "when_en": e.g. "Sat 3 Oct, 20:30" or "until 18 Oct" exactly as supported by the text, "when_he": same in Hebrew, "venue_en": venue in English (transliterate Greek names), "venue_he": venue in Hebrew letters or Latin, "type": one of music|theatre|exhibition|market|festival|film|family|other, "free": true if the text says free admission, else false}
Return {"events":[...]}.

${pages.join("\n\n")}`;
  let out;
  try { out = parseJSON(await claude({ system: SYSTEM, prompt, maxTokens: 4000, temperature: 0.1, role: "select" })); }
  catch (e) { log("AI σφάλμα", e.message); await notifyOwner("🗓️ Σαββατοκύριακο στην Αθήνα: σφάλμα AI – " + e.message.slice(0, 120)); return; }

  // Έλεγχος: μόνο εκδηλώσεις με link που υπάρχει πραγματικά στις σελίδες
  const events = (out.events || []).filter((e) => e && e.url && allowed.has(String(e.url).replace(/\/$/, "")) && e.title_en && e.when_en)
    .filter((e, i, a) => a.findIndex((x) => x.url === e.url) === i).slice(0, 12);
  log(`έγκυρες εκδηλώσεις: ${events.length} από ${(out.events || []).length}`);
  if (events.length < 3) { await notifyOwner(`🗓️ Σαββατοκύριακο στην Αθήνα: βρέθηκαν μόνο ${events.length} έγκυρες εκδηλώσεις – δεν γράφτηκε άρθρο.`); return; }

  const ICON = { music: "🎵", theatre: "🎭", exhibition: "🖼️", market: "🛍️", festival: "🎉", film: "🎬", family: "👨‍👩‍👧", other: "📍" };
  const fmt = (iso, lang) => new Date(iso + "T12:00:00Z").toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
  // «2–4 Οκτωβρίου» όταν είναι ίδιος μήνας
  const range = (lang) => fri.slice(0, 7) === sun.slice(0, 7) ? `${+fri.slice(8)}–${fmt(sun, lang)}` : `${fmt(fri, lang)}–${fmt(sun, lang)}`;
  const tag = (u) => u + (u.includes("?") ? "&" : "?") + "utm_source=yavanet&utm_medium=referral&utm_campaign=weekend";
  const list = (lang) => events.map((e) => {
    const he = lang === "he", free = e.free ? (he ? " · **כניסה חופשית**" : " · **Free entry**") : "";
    return `- ${ICON[e.type] || "📍"} **[${he ? e.title_he || e.title_en : e.title_en}](${tag(e.url)})** – ${he ? e.when_he || e.when_en : e.when_en} · ${he ? e.venue_he || e.venue_en : e.venue_en}${free}`;
  }).join("\n");
  const usedSources = SOURCES.filter((s) => events.some((e) => allowed.get(String(e.url).replace(/\/$/, "")) === s));
  const nFree = events.filter((e) => e.free).length;

  const heBody = `## מה עושים באתונה בסוף השבוע?

${list("he")}

## לפני שיוצאים

- **החנויות:** ביום ראשון רוב החנויות סגורות, חוץ מאזורים תיירותיים. [מה פתוח היום?](/holidays/)
- **שופינג:** [המדריך לשופינג באתונה](/a/athens-shopping-guide-israelis/)
- **מזג האוויר:** [אתונה – מזג אוויר ותחזית](/d/athens/)

את הרשימה הכנו מלוחות האירועים הרשמיים של ${usedSources.map((s) => s.name).join(", ")}. שעות ומחירים יכולים להשתנות – בדקו בקישור של כל אירוע לפני שיוצאים.`;
  const enBody = `## What's on in Athens this weekend?

${list("en")}

## Before you go

- **Shops:** most shops close on Sunday, except tourist areas. [What's open today?](/en/holidays/)
- **Shopping:** [our Athens shopping guide](/en/a/athens-shopping-guide-israelis/)
- **Weather:** [Athens – weather and forecast](/en/d/athens/)

This list comes from the official event calendars of ${usedSources.map((s) => s.name).join(", ")}. Times and prices can change – check each event's link before you go.`;

  const a = {
    slug, section: "living", guide: false, publishedAt: isoAthens(), updatedAt: null, sensitive: false, sponsored: false, breaking: false, geo: null,
    image: { type: "art", key: "people" },
    sources: usedSources.map((s) => ({ name: s.name, url: s.url })),
    he: {
      title: `סוף השבוע באתונה: ${events.length} אירועים ל-${range("he")}`,
      dek: `הופעות, תערוכות ושווקים באתונה בסוף השבוע${nFree ? `, כולל ${nFree} בכניסה חופשית` : ""}. הכול מלוחות האירועים הרשמיים, עם קישור לכל אירוע.`,
      tldr: [`${events.length} אירועים באתונה מיום שישי עד ראשון.`, nFree ? `${nFree} מהם בכניסה חופשית.` : "יש קישור לכל אירוע עם שעות ומחירים.", "ביום ראשון רוב החנויות סגורות – תכננו קניות לשישי או שבת."],
      means: "", body: heBody,
      seoTitle: `מה עושים באתונה בסוף השבוע (${range("he")})`,
      seoDesc: `אירועים באתונה בסוף השבוע: הופעות, תערוכות, שווקים ואירועים בכניסה חופשית, עם קישורים לאתרים הרשמיים.`,
      keywords: ["מה עושים באתונה", "אירועים באתונה", "סוף שבוע באתונה", "הופעות באתונה"],
    },
    en: {
      title: `This weekend in Athens: ${events.length} things to do, ${range("en")}`,
      dek: `Concerts, exhibitions and markets in Athens this weekend${nFree ? `, including ${nFree} with free entry` : ""}. All from official event calendars, with a link to each event.`,
      tldr: [`${events.length} events in Athens from Friday to Sunday.`, nFree ? `${nFree} of them are free.` : "Each event links to its official page with times and prices.", "Most shops close on Sunday – plan shopping for Friday or Saturday."],
      means: "", body: enBody,
      seoTitle: `What's on in Athens this weekend (${range("en")})`,
      seoDesc: `Things to do in Athens this weekend: concerts, exhibitions, markets and free events, with links to the official pages.`,
      keywords: ["things to do in Athens this weekend", "Athens events", "what's on Athens"],
    },
    meta: { itemId: "weekend-" + fri, auto: "weekend", imageQuery: "Athens evening concert crowd", checkedAt: isoAthens() },
  };
  const file = saveArticle(a);
  log("✓ γράφτηκε", file);
  await notifyOwner(`🗓️ Νέο άρθρο «Σαββατοκύριακο στην Αθήνα» (${events.length} εκδηλώσεις): ${SITE.url.replace(/\/$/, "")}/a/${slug}/`);
})().catch((e) => { log("weekend error", e.message); process.exitCode = 1; });
