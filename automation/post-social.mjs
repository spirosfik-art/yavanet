// Στέλνει τις αναρτήσεις Facebook (Make) / Telegram που μπήκαν σε ουρά από το run.mjs,
// ΜΟΝΟ αφού η σελίδα του άρθρου απαντά 200 στο live site (μετά το deploy).
// Έτσι το Facebook φτιάχνει σωστή προεπισκόπηση (τίτλος + εικόνα) αντί για «404».
import { STATE_FILE, env, DRY, log, readJSON, writeJSON, tg } from "./lib.mjs";

const state = readJSON(STATE_FILE, {});
const q = state.socialQueue || [];
if (!q.length) { log("social: τίποτα σε ουρά"); process.exit(0); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function isLive(url) {
  for (let i = 0; i < 8; i++) {           // έως ~2 λεπτά αναμονή για να «απλώσει» το Cloudflare
    try {
      const r = await fetch(url + (url.includes("?") ? "&" : "?") + "cb=" + Date.now(), { redirect: "follow" });
      if (r.status === 200) return true;
    } catch {}
    await sleep(15000);
  }
  return false;
}

const keep = [];
let siteDown = false;                     // αν μία σελίδα δεν είναι live, δεν περιμένουμε ξανά για τις υπόλοιπες
for (const job of q) {
  const ageH = (Date.now() - Date.parse(job.at)) / 3600e3;
  if (siteDown || !(await isLive(job.url))) {
    siteDown = true;
    if (ageH < 6) { keep.push(job); log("social: η σελίδα δεν είναι ακόμα live, ξανά στο επόμενο τρέξιμο", job.slug); }
    else log("social: εγκατάλειψη (6+ ώρες χωρίς live σελίδα)", job.slug);
    continue;
  }
  await sleep(5000);
  if (DRY) { log("social (dry):", job.slug); continue; }
  if (job.telegram) await tg("sendMessage", job.telegram).catch((e) => log("telegram", e.message));
  if (job.make && env.MAKE_WEBHOOK_URL) {
    await fetch(env.MAKE_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(job.make) })
      .then(() => log("✓ facebook (Make)", job.slug)).catch((e) => log("make webhook", e.message));
  }
}
state.socialQueue = keep;
if (!DRY) writeJSON(STATE_FILE, state);
