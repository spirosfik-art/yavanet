// Ακριβές ρολόι για τις αυτοματοποιήσεις: το cron του GitHub καθυστερεί ώρες ή χάνει εκτελέσεις.
// Τρέχει κάθε 5 λεπτά στο Cloudflare, κοιτάζει την ώρα Αθήνας (σωστά και με θερινή ώρα) και ξεκινά ό,τι έχει έρθει η ώρα του.
const REPO = "spirosfik-art/yavanet";
const DAILY = [
  // [ώρα Αθήνας "HH:MM", ημέρες (0=Κυρ … 6=Σάβ) ή null για όλες, workflow, inputs]
  ["08:25", null, "ig-stories.yml", { kind: "morning", publish: "yes", sched: "1" }],
  ["12:50", null, "ig-stories.yml", { kind: "topic", publish: "yes", sched: "1" }],
  ["20:40", null, "ig-stories.yml", { kind: "evening", publish: "yes", sched: "1" }],
  ["19:05", null, "meta.yml", { task: "reel" }],
  ["18:15", [0, 1, 2, 3, 4], "ig-batch.yml", { sched: "1" }],
  ["19:45", [0, 1, 2, 3, 4], "ig-batch.yml", { sched: "1" }],
  ["21:15", [0, 1, 2, 3, 4], "ig-batch.yml", { sched: "1" }],
  ["11:15", [5], "ig-batch.yml", { sched: "1" }],
  ["12:45", [5], "ig-batch.yml", { sched: "1" }],
  ["14:15", [5], "ig-batch.yml", { sched: "1" }],
  ["19:15", [6], "ig-batch.yml", { sched: "1" }],
  ["20:15", [6], "ig-batch.yml", { sched: "1" }],
  ["21:15", [6], "ig-batch.yml", { sched: "1" }],
];
function athens(d) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Athens", hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short" }).formatToParts(d).map((x) => [x.type, x.value]));
  return { h: +p.hour % 24, m: +p.minute, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) };
}
function due(d) {
  const t = athens(d), hm = `${String(t.h).padStart(2, "0")}:${String(t.m - (t.m % 5)).padStart(2, "0")}`, out = [];
  for (const [at, days, wf, inputs] of DAILY) if (at === hm && (!days || days.includes(t.wd))) out.push([wf, inputs]);
  const m5 = t.m - (t.m % 5);
  if (m5 === 15 && t.h >= 7 && t.h <= 22) out.push(["ig-stories.yml", { kind: "alerts", publish: "yes", sched: "1" }]);
  if ((m5 === 5 || m5 === 35) && t.h >= 7 && t.h <= 23) out.push(["meta.yml", { task: "comments" }]);
  return out;
}
async function dispatch(env, wf, inputs) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${wf}/dispatches`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.GH_TOKEN}`, accept: "application/vnd.github+json", "user-agent": "yavanet-cron", "content-type": "application/json" },
    body: JSON.stringify({ ref: "main", inputs }),
  });
  if (r.status !== 204 && env.TELEGRAM_BOT_TOKEN) {
    const txt = `⚠️ yavanet-cron: δεν ξεκίνησε το ${wf} ${JSON.stringify(inputs)} (HTTP ${r.status}) ${(await r.text()).slice(0, 200)}`;
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: env.TELEGRAM_OWNER_CHAT_ID, text: txt }) });
  }
  return r.status;
}
export default {
  async scheduled(event, env, ctx) {
    for (const [wf, inputs] of due(new Date(event.scheduledTime))) ctx.waitUntil(dispatch(env, wf, inputs));
  },
  async fetch(req) {
    const now = new Date();
    return new Response(JSON.stringify({ athens: athens(now), due_now: due(now) }), { headers: { "content-type": "application/json" } });
  },
};
