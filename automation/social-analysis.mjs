// Εβδομαδιαία ανάλυση Instagram + Facebook (κάθε Δευτέρα) → Telegram.
// Καλύτερα / χειρότερα posts, κοινό, τι έχουν κοινό, και 5 πειράματα για την επόμενη εβδομάδα.
// Αποθηκεύει content/ig/analysis/<ημερομηνία>.json (το διαβάζουν και τα reels οδηγών).
//   node automation/social-analysis.mjs          → ανάλυση + Telegram
//   DRY_RUN=1 node automation/social-analysis.mjs → μόνο log
import fs from "node:fs";
import path from "node:path";
import { ROOT, env, log, notifyOwner, claude, hasAI, parseJSON, writeJSON, DRY } from "./lib.mjs";
import { ctx, api } from "./meta.mjs";

const DAY = 86400e3;
const now = Date.now();
const since7 = now - 7 * DAY, since14 = now - 14 * DAY;
const ilTime = (ts) => new Date(ts).toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", weekday: "short", hour: "2-digit", hour12: false });
const kindOf = (m) => (m.media_product_type === "REELS" ? "reel" : m.media_type === "CAROUSEL_ALBUM" ? "carousel" : "image");
const KIND_GR = { reel: "reel", carousel: "carousel", image: "εικόνα", fb: "Facebook" };
const first = (s, n = 80) => (s || "").split("\n").find((l) => l.trim()) ?.trim().slice(0, n) || "(χωρίς λεζάντα)";

async function igPosts(c) {
  const out = [];
  let url = `/${c.igId}/media`;
  let params = { fields: "id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count", limit: "50" };
  for (let page = 0; page < 4; page++) {
    const r = await api(url, { token: c.userToken, params });
    const data = r.data || [];
    out.push(...data);
    if (!data.length || Date.parse(data[data.length - 1].timestamp) < since14 || !r.paging?.next) break;
    url = r.paging.next; params = {};
  }
  const recent = out.filter((m) => Date.parse(m.timestamp) >= since14);
  for (const m of recent) {
    m.kind = kindOf(m);
    m.ins = {};
    const metrics = m.kind === "reel" ? "reach,views,saved,shares,total_interactions,ig_reels_avg_watch_time" : "reach,views,saved,shares,total_interactions";
    try {
      const r = await api(`/${m.id}/insights`, { token: c.userToken, params: { metric: metrics } });
      for (const x of r.data || []) m.ins[x.name] = x.values?.[0]?.value ?? x.total_value?.value ?? 0;
    } catch (e) {
      // κάποια μετρική μπορεί να μην υποστηρίζεται: ξαναδοκιμή με τις βασικές
      try {
        const r = await api(`/${m.id}/insights`, { token: c.userToken, params: { metric: "reach,saved,shares" } });
        for (const x of r.data || []) m.ins[x.name] = x.values?.[0]?.value ?? x.total_value?.value ?? 0;
      } catch { m.noIns = true; }
    }
  }
  return recent;
}

async function fbPosts(c) {
  try {
    const r = await api(`/${c.pageId}/posts`, { token: c.pageToken, params: { fields: "id,message,created_time,permalink_url,shares,reactions.summary(true).limit(0),comments.summary(true).limit(0)", since: String(Math.floor(since14 / 1000)), limit: "100" } });
    const posts = (r.data || []).map((p) => ({ id: p.id, kind: "fb", caption: p.message || "", timestamp: p.created_time, permalink: p.permalink_url, like_count: p.reactions?.summary?.total_count || 0, comments_count: p.comments?.summary?.total_count || 0, ins: { shares: p.shares?.count || 0 } }));
    for (const p of posts.filter((p) => Date.parse(p.timestamp) >= since7)) {
      try {
        const r = await api(`/${p.id}/insights`, { token: c.pageToken, params: { metric: "post_impressions_unique,post_clicks" } });
        for (const x of r.data || []) p.ins[x.name === "post_impressions_unique" ? "reach" : "clicks"] = x.values?.[0]?.value || 0;
      } catch { p.noIns = true; }
    }
    return posts;
  } catch (e) { log("fb posts:", e.message); return []; }
}

async function audience(c) {
  const out = {};
  for (const b of ["country", "city", "age", "gender"]) {
    try {
      const r = await api(`/${c.igId}/insights`, { token: c.userToken, params: { metric: "follower_demographics", period: "lifetime", metric_type: "total_value", breakdown: b } });
      const rows = r.data?.[0]?.total_value?.breakdowns?.[0]?.results || [];
      out[b] = rows.map((x) => [x.dimension_values.join(" "), x.value]).sort((a, z) => z[1] - a[1]).slice(0, 6);
    } catch (e) { log("audience", b, e.message.slice(0, 120)); }
  }
  try {
    const r = await api(`/${c.igId}/insights`, { token: c.userToken, params: { metric: "reach,profile_views,accounts_engaged,follows_and_unfollows,website_clicks", period: "day", metric_type: "total_value", since: String(Math.floor(since7 / 1000)), until: String(Math.floor(now / 1000)) } });
    out.account = Object.fromEntries((r.data || []).map((x) => [x.name, x.total_value?.value ?? (x.total_value?.breakdowns?.[0]?.results || []).map((y) => `${y.dimension_values.join("")}:${y.value}`).join(" ")]));
  } catch (e) { log("account insights:", e.message.slice(0, 120)); }
  try {
    const me = await api(`/${c.igId}`, { token: c.userToken, params: { fields: "followers_count,media_count" } });
    out.followers = me.followers_count;
  } catch {}
  try {
    const pg = await api(`/${c.pageId}`, { token: c.pageToken, params: { fields: "followers_count,fan_count" } });
    out.fbFollowers = pg.followers_count || pg.fan_count;
  } catch {}
  return out;
}

// Βαθμολογία: οι αποθηκεύσεις και οι κοινοποιήσεις μετράνε πολύ περισσότερο από τα likes (αυτές φέρνουν νέο κόσμο)
const score = (m) => (m.ins.saved || 0) * 4 + (m.ins.shares || 0) * 5 + (m.comments_count || 0) * 2 + (m.like_count || 0) + (m.ins.reach || 0) / 20;
const sum = (arr, f) => arr.reduce((s, x) => s + (f(x) || 0), 0);

function byGroup(list, keyFn) {
  const g = {};
  for (const m of list) { const k = keyFn(m); (g[k] ||= []).push(m); }
  return Object.entries(g).map(([k, v]) => ({ k, n: v.length, reach: Math.round(sum(v, (m) => m.ins.reach) / v.length), score: +(sum(v, score) / v.length).toFixed(1) })).sort((a, b) => b.score - a.score);
}

const fmt = (m) => `• [${KIND_GR[m.kind]}] «${first(m.caption, 60)}»\n   ${m.ins.views != null ? `👁 ${m.ins.views} · ` : ""}${m.ins.reach != null ? `reach ${m.ins.reach} · ` : ""}❤️ ${m.like_count || 0} · 💬 ${m.comments_count || 0} · 🔖 ${m.ins.saved || 0} · 📤 ${m.ins.shares || 0}${m.ins.ig_reels_avg_watch_time ? ` · ⏱ ${(m.ins.ig_reels_avg_watch_time / 1000).toFixed(1)}″` : ""}\n   ${m.permalink}`;

(async () => {
  const c = await ctx();
  if (!c.igId) throw new Error("δεν βρέθηκε λογαριασμός Instagram στη σελίδα");
  const [ig, fb, aud] = await Promise.all([igPosts(c), fbPosts(c), audience(c)]);
  const week = ig.filter((m) => Date.parse(m.timestamp) >= since7);
  const prev = ig.filter((m) => Date.parse(m.timestamp) < since7);
  const fbWeek = fb.filter((m) => Date.parse(m.timestamp) >= since7);
  const ranked = [...week].sort((a, b) => score(b) - score(a));
  const best = ranked.slice(0, 3), worst = ranked.slice(-3).reverse();
  const tot = (l) => ({ posts: l.length, reach: sum(l, (m) => m.ins.reach), views: sum(l, (m) => m.ins.views), likes: sum(l, (m) => m.like_count), comments: sum(l, (m) => m.comments_count), saves: sum(l, (m) => m.ins.saved), shares: sum(l, (m) => m.ins.shares) });
  const T = tot(week), P = tot(prev);
  const kinds = byGroup(week, (m) => KIND_GR[m.kind]);
  const slot = (ts) => { const d = new Date(ts); const wd = d.toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", weekday: "short" }); const h = Number(d.toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false })); return `${wd} ${h < 12 ? "πρωί" : h < 17 ? "μεσημέρι" : "βράδυ"}`; };
  const hours = byGroup(week, (m) => slot(m.timestamp));

  // ---- Ανάλυση από AI: κοινά στοιχεία, κοινό, πειράματα ----
  let ai = null;
  if (hasAI()) {
    const rows = ranked.map((m, i) => ({ rank: i + 1, type: m.kind, when_israel: ilTime(m.timestamp), caption: (m.caption || "").slice(0, 220), reach: m.ins.reach, views: m.ins.views, likes: m.like_count, comments: m.comments_count, saves: m.ins.saved, shares: m.ins.shares, avg_watch_s: m.ins.ig_reels_avg_watch_time ? +(m.ins.ig_reels_avg_watch_time / 1000).toFixed(1) : undefined }));
    const fbRows = [...fbWeek].sort((a, b) => score(b) - score(a)).slice(0, 12).map((m) => ({ caption: (m.caption || "").slice(0, 160), reach: m.ins.reach, reactions: m.like_count, comments: m.comments_count, shares: m.ins.shares, clicks: m.ins.clicks }));
    try {
      const txt = await claude({
        role: "select", temperature: 0.4, maxTokens: 3000,
        system: "Είσαι στρατηγικός σύμβουλος Instagram/Facebook για το Yavanet, ειδησεογραφικό site στα εβραϊκά για Ισραηλινούς που ταξιδεύουν, ζουν ή αγοράζουν ακίνητα στην Ελλάδα (ο ιδιοκτήτης έχει μεσιτικό γραφείο στην Αθήνα). Ο ιδιοκτήτης ΔΕΝ διαβάζει εβραϊκά: γράψε τα πάντα στα ελληνικά, απλά και πρακτικά, χωρίς ορολογία. Βασίσου ΜΟΝΟ στα δεδομένα· αν τα δεδομένα είναι λίγα, πες το. Καμία πολιτική θεματολογία. Απάντησε μόνο σε JSON.",
        prompt: `Δεδομένα της εβδομάδας (Instagram, ταξινομημένα από καλύτερο σε χειρότερο, με βαθμολογία όπου αποθηκεύσεις και κοινοποιήσεις μετράνε περισσότερο):\n${JSON.stringify(rows)}\n\nΜέσος όρος ανά τύπο: ${JSON.stringify(kinds)}\nΑνά ημέρα/ώρα Ισραήλ: ${JSON.stringify(hours.slice(0, 8))}\nΠροηγούμενη εβδομάδα συνολικά: ${JSON.stringify(P)} · Αυτή: ${JSON.stringify(T)}\nFacebook: ${JSON.stringify(fbRows)}\nΚοινό: ${JSON.stringify(aud)}\n\nΕπέστρεψε JSON:\n{"common_best": ["2-4 σύντομα σημεία: τι έχουν κοινό τα καλύτερα (θέμα, μορφή, πρώτη φράση, ώρα)"],\n "common_worst": ["2-3 σημεία: τι έχουν κοινό τα χειρότερα"],\n "audience": "1-2 προτάσεις: ποιοι μας ακολουθούν και τι τους ενδιαφέρει",\n "experiments": [{"title": "σύντομος τίτλος", "why": "γιατί, με βάση τα νούμερα", "how": "τι ακριβώς να γίνει την επόμενη εβδομάδα"}] (ακριβώς 5),\n "hooks": ["5 πρώτες φράσεις για reels στα εβραϊκά, συγκεκριμένες και περιέργειας, κατανοητές σε 2 δευτερόλεπτα"],\n "hooks_gr": ["η ελληνική μετάφραση των 5 φράσεων, με την ίδια σειρά"]}`,
      });
      ai = parseJSON(txt);
    } catch (e) { log("AI ανάλυση:", e.message); }
  }

  const pct = (a, b) => (b ? ` (${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%)` : "");
  const L = [];
  L.push(`📊 Yavanet · Εβδομαδιαία ανάλυση social`);
  L.push(`📸 Instagram: ${aud.followers ?? "?"} ακόλουθοι${aud.account?.follows_and_unfollows ? ` (${aud.account.follows_and_unfollows})` : ""} · 📘 Facebook: ${aud.fbFollowers ?? "?"}`);
  L.push(`Αυτή την εβδομάδα: ${T.posts} posts · reach ${T.reach}${pct(T.reach, P.reach)} · προβολές ${T.views}${pct(T.views, P.views)} · ❤️ ${T.likes} · 💬 ${T.comments} · 🔖 ${T.saves} · 📤 ${T.shares}`);
  if (aud.account) L.push(`Λογαριασμός: επισκέψεις προφίλ ${aud.account.profile_views ?? "–"} · κλικ στο site ${aud.account.website_clicks ?? "–"} · άτομα που αλληλεπίδρασαν ${aud.account.accounts_engaged ?? "–"}`);
  L.push("");
  L.push("🏆 Καλύτερα:"); best.forEach((m) => L.push(fmt(m)));
  L.push(""); L.push("📉 Χειρότερα:"); worst.forEach((m) => L.push(fmt(m)));
  L.push(""); L.push(`📐 Μέσο reach ανά τύπο: ${kinds.map((k) => `${k.k} ${k.reach} (${k.n})`).join(" · ")}`);
  if (fbWeek.length) { const fbBest = [...fbWeek].sort((a, b) => score(b) - score(a))[0]; L.push(`📘 Καλύτερο Facebook: «${first(fbBest.caption, 60)}» · 👍 ${fbBest.like_count} · 💬 ${fbBest.comments_count} · 📤 ${fbBest.ins.shares}${fbBest.ins.reach != null ? ` · reach ${fbBest.ins.reach}` : ""}`); }
  if (aud.country?.length) L.push(`🌍 Κοινό: ${aud.country.map(([k, v]) => `${k} ${v}`).join(" · ")}${aud.city?.length ? `\n🏙 Πόλεις: ${aud.city.slice(0, 4).map(([k, v]) => `${k} ${v}`).join(" · ")}` : ""}${aud.age?.length ? `\n🎂 Ηλικίες: ${aud.age.slice(0, 3).map(([k, v]) => `${k} ${v}`).join(" · ")}` : ""}${aud.gender?.length ? ` · Φύλο: ${aud.gender.map(([k, v]) => `${k === "F" ? "Γ" : k === "M" ? "Α" : k} ${v}`).join(" ")}` : ""}`);
  if (ai) {
    L.push("");
    if (ai.common_best?.length) { L.push("✅ Τι έχουν κοινό τα καλύτερα:"); ai.common_best.forEach((x) => L.push("• " + x)); }
    if (ai.common_worst?.length) { L.push("⚠️ Τι έχουν κοινό τα χειρότερα:"); ai.common_worst.forEach((x) => L.push("• " + x)); }
    if (ai.audience) L.push("👥 " + ai.audience);
    if (ai.experiments?.length) { L.push(""); L.push("🧪 5 πειράματα για την επόμενη εβδομάδα:"); ai.experiments.slice(0, 5).forEach((x, i) => L.push(`${i + 1}. ${x.title}: ${x.how} (γιατί: ${x.why})`)); }
    if (ai.hooks_gr?.length) { L.push(""); L.push("🎣 Πρώτες φράσεις για reels:"); ai.hooks_gr.slice(0, 5).forEach((x) => L.push("• " + x)); }
  }
  const msg = L.join("\n");
  log(msg);
  for (const line of msg.split("\n").filter(Boolean).slice(0, 9)) console.log("::notice::" + line.replace(/\n/g, " "));

  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Athens" });
  const slim = (m) => ({ kind: m.kind, at: m.timestamp, caption: (m.caption || "").slice(0, 300), permalink: m.permalink, likes: m.like_count, comments: m.comments_count, ...m.ins, score: +score(m).toFixed(1) });
  writeJSON(path.join(ROOT, "content/ig/analysis", date + ".json"), { date, totals: T, prev: P, kinds, hours, audience: aud, best: best.map(slim), worst: worst.map(slim), all: ranked.map(slim), fb: fbWeek.map(slim), ai });
  if (!DRY) {
    // Το Telegram κόβει στα 4000 χαρακτήρες: στέλνουμε σε κομμάτια
    for (let i = 0; i < msg.length; i += 3800) await notifyOwner(msg.slice(i, i + 3800));
  }
})().catch(async (e) => {
  log("social-analysis:", e.message);
  console.log("::warning::" + e.message);
  if (!DRY) await notifyOwner("⚠️ Ανάλυση social: " + e.message).catch(() => {});
});
