// Φύλακας (watchdog): τρέχει κάθε ώρα, ανεξάρτητα από την κύρια ροή.
// Ελέγχει ότι (1) το site ανανεώνεται, (2) οι αυτόματες εκτελέσεις τρέχουν και πετυχαίνουν,
// (3) το Telegram bot λαμβάνει μηνύματα. Αν κάτι δεν πάει καλά: ειδοποίηση στο Telegram
// και, όπου γίνεται, αυτόματη επανεκκίνηση.
const env = process.env;
const REPO = env.GITHUB_REPOSITORY || "spirosfik-art/yavanet";
const SITE = (env.SITE_URL || "https://yavanet.gr").replace(/\/$/, "");
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const athensHour = () => Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }).format(new Date())) % 24;
const hoursAgo = (t) => (Date.now() - t) / 3600e3;

async function tg(method, body) {
  if (!env.TELEGRAM_BOT_TOKEN) return null;
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN.trim()}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body || {}) });
  return r.json().catch(() => null);
}
const alert = (text) => env.TELEGRAM_OWNER_CHAT_ID ? tg("sendMessage", { chat_id: env.TELEGRAM_OWNER_CHAT_ID.trim(), text: "🛡 Φύλακας Yavanet\n" + text, disable_web_page_preview: true }) : null;

async function gh(path, opts = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...opts, headers: { accept: "application/vnd.github+json", "user-agent": "yavanet-watchdog", ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}), ...(opts.headers || {}) },
  });
  if (r.status === 204) return {};
  return r.json();
}
async function dispatchPipeline() {
  const r = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/pipeline.yml/dispatches`, {
    method: "POST", headers: { accept: "application/vnd.github+json", "user-agent": "yavanet-watchdog", authorization: `Bearer ${env.GITHUB_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ ref: "main" }),
  });
  return r.status === 204;
}

const problems = [];
const h = athensHour();

// 1. Το live site: πότε ανέβηκε το τελευταίο άρθρο;
try {
  const xml = await (await fetch(`${SITE}/en/rss.xml`, { headers: { "cache-control": "no-cache" } })).text();
  const dates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => Date.parse(m[1])).filter(Boolean);
  if (!dates.length) throw new Error("το RSS του site δεν διαβάζεται");
  const newest = Math.max(...dates);
  const age = hoursAgo(newest);
  log(`τελευταίο άρθρο στο site: πριν ${age.toFixed(1)} ώρες`);
  // Μέρα (9–22): αναμένεται τουλάχιστον 1 άρθρο/ώρα. Ειδοποίηση στις 3 ώρες και ξανά στις 6.
  if (h >= 9 && h <= 22 && ((age >= 3 && age < 4) || (age >= 6 && age < 7))) problems.push(`Δεν έχει ανέβει νέο άρθρο στο site εδώ και ${Math.floor(age)} ώρες.`);
  if (age >= 3 && h >= 9 && h <= 22) { if (env.GITHUB_TOKEN && await dispatchPipeline()) log("επανεκκίνηση ροής"); }
} catch (e) {
  problems.push(`Το site δεν απαντά (${SITE}): ${e.message}`);
}

// 2. Οι αυτόματες εκτελέσεις: τρέχουν; πετυχαίνουν;
try {
  const runs = (await gh("/actions/workflows/pipeline.yml/runs?per_page=10")).workflow_runs || [];
  const done = runs.filter((r) => r.status === "completed");
  const last = runs[0];
  const lastAge = last ? hoursAgo(Date.parse(last.created_at)) : 99;
  log(`τελευταία εκτέλεση: πριν ${(lastAge * 60).toFixed(0)}′, ${last && (last.conclusion || last.status)}`);
  if (lastAge > 1) {
    const ok = env.GITHUB_TOKEN ? await dispatchPipeline() : false;
    if (lastAge < 2) problems.push(`Οι αυτόματες εκτελέσεις σταμάτησαν (τελευταία πριν ${Math.round(lastAge * 60)}′). ${ok ? "Ξεκίνησα μία χειροκίνητα." : ""}`);
  }
  let fails = 0; for (const r of done) { if (r.conclusion === "failure") fails++; else break; }
  if (fails === 3 || fails === 8) problems.push(`Οι τελευταίες ${fails} εκτελέσεις απέτυχαν. Δες: https://github.com/${REPO}/actions`);
  const deploys = (await gh("/actions/workflows/deploy.yml/runs?per_page=3")).workflow_runs || [];
  if (deploys[0] && deploys[0].conclusion === "failure" && hoursAgo(Date.parse(deploys[0].created_at)) < 1.1) problems.push("Το τελευταίο ανέβασμα του site (Deploy) απέτυχε.");
} catch (e) { log("github", e.message); }

// 3. Telegram bot: παραλαμβάνει τα μηνύματα;
try {
  const info = await tg("getWebhookInfo");
  const w = info && info.result;
  if (w && w.url) {
    const errAge = w.last_error_date ? hoursAgo(w.last_error_date * 1000) : 99;
    log(`webhook: pending ${w.pending_update_count}, τελευταίο σφάλμα πριν ${errAge.toFixed(1)}ω ${w.last_error_message || ""}`);
    if (w.pending_update_count > 0 && errAge < 1) problems.push(`Το bot δεν παραλαμβάνει μηνύματα: ${w.last_error_message}. Πιθανόν έληξε το κλειδί GH_DISPATCH_TOKEN.`);
  }
} catch (e) { log("telegram", e.message); }

if (problems.length) { log("ΠΡΟΒΛΗΜΑΤΑ:", problems); await alert(problems.map((p) => "⚠️ " + p).join("\n")); }
else log("✓ όλα εντάξει");
