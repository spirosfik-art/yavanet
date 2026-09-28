// Φτηνές πτήσεις Τελ Αβίβ → Ελλάδα (Travelpayouts / Aviasales Data API, δωρεάν με token).
// node automation/flights.mjs            → ενημερώνει content/flights.json (καθημερινά)
// node automation/flights.mjs weekly     → + άρθρο «Οι 5 φθηνότερες πτήσεις της εβδομάδας» + ειδοποίηση
// Χωρίς TRAVELPAYOUTS_TOKEN απλώς τερματίζει (τίποτα δεν σπάει).
import path from "node:path";
import { ROOT, env, log, writeJSON, readJSON, isoAthens, athensNow, saveArticle, loadArticles, pushSend, notifyOwner } from "./lib.mjs";
import { SITE } from "../site/config.mjs";

const TOKEN = env.TRAVELPAYOUTS_TOKEN, MARKER = env.TRAVELPAYOUTS_MARKER || "";
const FILE = path.join(ROOT, "content/flights.json");
export const DESTS = {
  ATH: ["אתונה", "Athens"], SKG: ["סלוניקי", "Thessaloniki"], HER: ["הרקליון, כרתים", "Heraklion, Crete"], CHQ: ["חאניה, כרתים", "Chania, Crete"],
  RHO: ["רודוס", "Rhodes"], JMK: ["מיקונוס", "Mykonos"], JTR: ["סנטוריני", "Santorini"], CFU: ["קורפו", "Corfu"], KGS: ["קוס", "Kos"], ZTH: ["זקינתוס", "Zakynthos"],
};
const AIRLINES = { LY: "El Al", IZ: "Arkia", "6H": "Israir", BZ: "Blue Bird", A3: "Aegean", OA: "Olympic Air", W6: "Wizz Air", W4: "Wizz Air", "5W": "Wizz Air", FR: "Ryanair", GQ: "Sky Express", U2: "easyJet", RK: "Ryanair UK", HV: "Transavia", VY: "Vueling", TK: "Turkish", PC: "Pegasus", U8: "TUS Airways", "3F": "FlyOne", EW: "Eurowings", LH: "Lufthansa", OS: "Austrian", SN: "Brussels", LX: "Swiss", AZ: "ITA" };

const ym = (d) => d.toISOString().slice(0, 7);
async function query(dest, month) {
  const u = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
  Object.entries({ origin: "TLV", destination: dest, departure_at: month, one_way: "false", currency: "eur", sorting: "price", limit: "10", token: TOKEN }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { headers: { "Accept-Encoding": "gzip" } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.success) { log("flights", dest, month, r.status, JSON.stringify(j).slice(0, 160)); return []; }
  return j.data || [];
}
const link = (l) => {
  const url = new URL("https://www.aviasales.com" + (l && l.startsWith("/") ? l : "/"));
  if (MARKER) url.searchParams.set("marker", MARKER);
  return url.toString();
};

export async function update() {
  const now = new Date(), next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const today = now.toISOString().slice(0, 10);
  const deals = [];
  for (const dest of Object.keys(DESTS)) {
    const rows = [...(await query(dest, ym(now))), ...(await query(dest, ym(next)))]
      .filter((x) => x.price > 0 && x.departure_at && x.departure_at.slice(0, 10) >= today)
      .sort((a, b) => a.price - b.price);
    if (!rows.length) continue;
    const x = rows[0];
    deals.push({
      dest, he: DESTS[dest][0], en: DESTS[dest][1], price: Math.round(x.price),
      depart: x.departure_at.slice(0, 10), ret: x.return_at ? x.return_at.slice(0, 10) : null,
      airline: AIRLINES[x.airline] || x.airline || "", transfers: (x.transfers || 0) + (x.return_transfers || 0), link: link(x.link),
    });
  }
  deals.sort((a, b) => a.price - b.price);
  const out = { updated: isoAthens(), source: { name: "Aviasales", url: "https://www.aviasales.com" }, deals };
  if (deals.length) writeJSON(FILE, out);
  log(`✈️ πτήσεις: ${deals.length} προορισμοί`);
  return out;
}

const dm = (d) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;
function weeklyArticle(data) {
  const top = data.deals.slice(0, 5), { date } = athensNow();
  const cheapest = top[0];
  const table = (he) => [
    he ? "| יעד | מחיר הלוך־חזור | תאריכים | חברה |" : "| Destination | Return price | Dates | Airline |", "|---|---|---|---|",
    ...top.map((d) => `| [${he ? d.he : d.en}](${d.link}) | €${d.price} | ${dm(d.depart)}${d.ret ? "–" + dm(d.ret) : ""} | ${d.airline}${d.transfers ? (he ? " (עם עצירה)" : " (with stop)") : ""} |`),
  ].join("\n");
  const body = (he) => he
    ? `הטיסות הזולות ביותר מתל אביב ליוון שנמצאו השבוע, הלוך־חזור לאדם:\n\n${table(true)}\n\nלחצו על שם היעד כדי לראות את הטיסה ולהזמין. המחירים נאספו מחיפושים אחרונים ויכולים להשתנות מהר, אז כדאי לבדוק מיד.\n\n[כל המחירים המעודכנים לכל היעדים](/flights/) · [מדריך הטיסה ליוון](/a/greece-travel-guide-israelis-2026/)`
    : `The cheapest flights from Tel Aviv to Greece found this week, return, per person:\n\n${table(false)}\n\nClick a destination to see the flight and book. Prices come from recent searches and change fast, so check soon.\n\n[All current prices for every destination](/en/flights/) · [Flying to Greece guide](/en/a/greece-travel-guide-israelis-2026/)`;
  return {
    slug: `cheapest-flights-tel-aviv-greece-${date}`, section: "travel",
    publishedAt: isoAthens(), updatedAt: null, sensitive: false, sponsored: false, breaking: false, geo: null,
    image: { type: "illustration", key: "plane" },
    sources: [{ name: "Aviasales", url: "https://www.aviasales.com" }],
    he: {
      title: `הטיסות הזולות ליוון השבוע: מ-€${cheapest.price} הלוך־חזור`,
      dek: `${top.length} המחירים הזולים ביותר מתל אביב ליעדים ביוון, עם תאריכים וקישור להזמנה.`,
      tldr: [`הכי זול השבוע: ${cheapest.he}, €${cheapest.price} הלוך־חזור.`, `${top.map((d) => d.he).join(", ")}.`, "המחירים משתנים מהר. כדאי לבדוק ולהזמין מוקדם."],
      means: "אם אתם מתכננים חופשה ביוון, זה הזמן לבדוק מחירים. תאריכים גמישים יכולים לחסוך הרבה.",
      body: body(true),
    },
    en: {
      title: `This week's cheapest flights to Greece: from €${cheapest.price} return`,
      dek: `The ${top.length} lowest fares from Tel Aviv to Greek destinations, with dates and booking links.`,
      tldr: [`Cheapest this week: ${cheapest.en}, €${cheapest.price} return.`, `${top.map((d) => d.en).join(", ")}.`, "Prices change fast. Check and book early."],
      means: "If you are planning a holiday in Greece, now is the time to check prices. Flexible dates can save a lot.",
      body: body(false),
    },
    meta: { manual: false, auto: "flights", checkedAt: isoAthens() },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!TOKEN) { log("✈️ χωρίς TRAVELPAYOUTS_TOKEN: παράλειψη"); process.exit(0); }
  const data = await update();
  if (process.argv[2] === "weekly" && data.deals.length >= 3) {
    const a = weeklyArticle(data);
    if (!loadArticles().some((x) => x.slug === a.slug)) {
      saveArticle(a);
      const url = (l) => SITE.url + (l === "en" ? "/en" : "") + "/a/" + a.slug + "/";
      try { await pushSend(SITE.url, { tag: a.slug, he: { title: "✈️ " + a.he.title, body: a.he.dek, url: url("he") }, en: { title: "✈️ " + a.en.title, body: a.en.dek, url: url("en") } }); } catch (e) { log("push", e.message); }
      try { await notifyOwner(`✈️ ${a.he.title}\n${url("he")}`); } catch {}
      log("✓ εβδομαδιαίο άρθρο πτήσεων", a.slug);
    }
  }
}
