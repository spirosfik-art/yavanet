// «יוונט מסביר» με ρεαλιστικά κλιπ Google Veo + φωνή + υπότιτλοι λέξη-λέξη + μεγάλοι αριθμοί + λογότυπο.
//   node automation/explainer/veo-render.mjs automation/explainer/episodes/<x>.json <outDir>
// VEO_FAKE=1: αντί για Veo, δοκιμαστικά κλιπ (για έλεγχο σύνθεσης χωρίς κόστος).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { veoGen, veoModels } from "./veo.mjs";

const require = createRequire(import.meta.url);
const [epFile, outArg] = process.argv.slice(2);
const EP = JSON.parse(fs.readFileSync(epFile, "utf8"));
const out = path.resolve(outArg || "veo-out");
fs.mkdirSync(out, { recursive: true });
const GK = process.env.GEMINI_API_KEY;
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const run = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
const durOf = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim()) || 0;
const clean = (s) => s.replace(/\*/g, "");

// ---------- 1. Φωνή: μία κλήση για όλο το κείμενο (ίδια φωνή παντού), κόψιμο στις παύσεις ----------
async function tts(text, file) {
  const j0 = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${GK}`)).json();
  const names = (j0.models || []).map((m) => m.name.replace("models/", "")).filter((n) => /tts/i.test(n));
  const list = [...names.filter((n) => /3\.1-flash-tts/.test(n)), ...names.filter((n) => /pro.*tts/.test(n)), ...names.filter((n) => !/3\.1-flash-tts|pro/.test(n) && !/lite/.test(n)), ...names.filter((n) => /lite/.test(n))];
  const prompt = `Read the following Hebrew script aloud as a professional documentary / explainer narrator: warm, confident, engaging, natural rhythm, a clear short pause between sentences. Read exactly the text, nothing else:\n\n${text}`;
  for (const m of list) {
    for (let k = 0; k < 2; k++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(180000),
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.TTS_VOICE || EP.voice || "Charon" } } } } }) }).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {};
      const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (part) {
        const raw = file + ".pcm"; fs.writeFileSync(raw, Buffer.from(part.inlineData.data, "base64"));
        const rate = (/rate=(\d+)/.exec(part.inlineData.mimeType || "") || [, "24000"])[1];
        run(["-f", "s16le", "-ar", rate, "-ac", "1", "-i", raw, "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=1.05", "-ar", "44100", file]);
        log("tts ✓", m, durOf(file).toFixed(1) + "s"); return m;
      }
      log("tts", m, r && r.status, JSON.stringify(j).slice(0, 120));
      if (r && (r.status === 429 || r.status === 404)) break;
    }
  }
  return null;
}
function splitPoints(file, n) {
  let s = "";
  try { execFileSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "silencedetect=noise=-38dB:d=0.22", "-f", "null", "-"], { stdio: ["ignore", "ignore", "pipe"] }); } catch (e) { s = String(e.stderr || ""); }
  if (!s) s = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -af silencedetect=noise=-38dB:d=0.22 -f null - 2>&1`]).toString();
  const st = [...s.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]), en = [...s.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const gaps = st.map((a, i) => ({ a, b: en[i] ?? a, len: (en[i] ?? a) - a, mid: (a + (en[i] ?? a)) / 2 }));
  // χρειαζόμαστε n-1 σημεία: διαλέγουμε τις μεγαλύτερες παύσεις κοντά στα αναμενόμενα σημεία (αναλογικά με το μήκος κειμένου)
  const total = durOf(file), lens = EP.scenes.map((x) => clean(x.say).length + 6), sum = lens.reduce((a, b) => a + b, 0);
  const pts = []; let acc = 0, used = new Set();
  for (let i = 0; i < n - 1; i++) {
    acc += lens[i]; const exp = (total * acc) / sum;
    let best = null, bs = -1e9;
    gaps.forEach((g, k) => { if (used.has(k) || (pts.length && g.mid <= pts.at(-1))) return; const score = g.len * 4 - Math.abs(g.mid - exp); if (score > bs) { bs = score; best = k; } });
    if (best == null || Math.abs(gaps[best].mid - exp) > 2.5) pts.push(exp); else { used.add(best); pts.push(gaps[best].mid); }
  }
  return pts;
}

// ---------- 2α. Πραγματικά πλάνα Pexels (δωρεάν) ----------
const SRC = process.env.CLIP_SOURCE || (EP.scenes.every((s) => s.q) ? "pexels" : "veo");
const usedVid = new Set(), credits = [];
async function pexels(s, i, f, need) {
  const qs = Array.isArray(s.q) ? s.q : [s.q];
  for (const portrait of [true, false]) for (const q of qs) {
    const r = await fetch(`https://api.pexels.com/videos/search?per_page=30&size=large${portrait ? "&orientation=portrait" : ""}&query=${encodeURIComponent(q)}`, { headers: { Authorization: process.env.PEXELS_API_KEY }, signal: AbortSignal.timeout(30000) }).catch(() => null);
    if (!r || !r.ok) { log("pexels", r && r.status, q); continue; }
    const j = await r.json();
    const AVOID = new RegExp(["tiny-planet", "desert", "skyscraper", "istanbul", "turkey", "egypt", "dubai", "india", "china", "time-lapse", "timelapse", ...(s.avoid || [])].join("|"), "i");
    const cands = (j.videos || []).filter((v) => !usedVid.has(v.id) && v.duration >= Math.min(need, 5) && !AVOID.test(v.url || "")).map((v) => {
      const files = (v.video_files || []).filter((x) => x.file_type === "video/mp4" && x.width && x.height);
      const fit = files.filter((x) => (x.height > x.width ? x.height >= 1600 : x.height >= 1080)).sort((a, b) => (a.height * a.width) - (b.height * b.width))[0];
      return fit && { v, fit };
    }).filter(Boolean);
    const pick = cands[0];
    if (!pick) continue;
    usedVid.add(pick.v.id);
    fs.writeFileSync(f, Buffer.from(await (await fetch(pick.fit.link, { signal: AbortSignal.timeout(180000) })).arrayBuffer()));
    credits.push(`${i}: ${pick.v.user?.name || "?"} · ${pick.v.url} (${q})`);
    log("pexels ✓", i, q, `${pick.fit.width}x${pick.fit.height}`, pick.v.duration + "s");
    return f;
  }
  throw new Error("pexels: τίποτα για τη σκηνή " + i);
}

// ---------- 2β. Κλιπ Veo (παράλληλα, ανά 3) ----------
async function clips(durs) {
  const res = [];
  const jobs = EP.scenes.map((s, i) => async () => {
    const f = path.join(out, `clip${i}.mp4`);
    if (fs.existsSync(f) && fs.statSync(f).size > 50000) return (res[i] = f);
    const sec = durs[i] <= 4 ? 4 : durs[i] <= 6 ? 6 : 8;
    if (SRC === "pexels") return (res[i] = await pexels(s, i, f, durs[i]));
    if (process.env.VEO_FAKE) { run(["-f", "lavfi", "-i", `testsrc2=s=720x1280:r=24:d=${sec}`, "-vf", `hue=h=${i * 36}`, "-pix_fmt", "yuv420p", f]); return (res[i] = f); }
    for (let k = 0; k < 3; k++) {
      try { await veoGen(`${s.veo} ${EP.style || ""}`, f, sec); return (res[i] = f); }
      catch (e) { log("veo ✗ σκηνή", i, e.message); if (/quota|429|billing|PERMISSION|403/i.test(e.message) && k === 2) throw e; await new Promise((r) => setTimeout(r, 15000)); }
    }
    throw new Error("veo απέτυχε στη σκηνή " + i);
  });
  for (let i = 0; i < jobs.length; i += 3) await Promise.all(jobs.slice(i, i + 3).map((j) => j()));
  return res;
}

// ---------- 3. Γραφικά (υπότιτλοι, αριθμοί, λογότυπο) ως διαφανή PNG από Chrome ----------
const ICON = `<svg viewBox="0 0 512 512" width="300" height="300"><rect width="512" height="512" rx="112" fill="#0B3A5B" stroke="#F0B650" stroke-width="10"/><path d="M150 112H232Q262 112 262 142V392H206V168H150Q134 168 134 152V128Q134 112 150 112Z" fill="#fff"/><path d="M318 112H382Q414 112 414 144V168Q414 224 360 262L334 228Q358 210 364 188H318Q302 188 302 172V128Q302 112 318 112Z" fill="#F0B650"/><path d="M120 444Q170 416 220 444T320 444T410 444" fill="none" stroke="#2A8BC4" stroke-width="24" stroke-linecap="round"/></svg>`;
const CSS = `*{margin:0}html,body{background:transparent;width:1080px;height:1920px;overflow:hidden;font-family:Assistant,sans-serif}
.cap{position:absolute;top:1220px;left:40px;right:40px;display:flex;justify-content:center;flex-wrap:wrap;gap:0 26px;text-align:center}
.cap b{font:900 104px/1.12 Heebo,sans-serif;color:#fff;-webkit-text-stroke:14px #000;paint-order:stroke fill;text-shadow:0 8px 24px rgba(0,0,0,.55);white-space:nowrap}
.cap b.on{color:#F0B650}.cap b.key{color:#fff}.cap b.key.on{color:#F0B650}
.brand{position:absolute;top:118px;left:0;right:0;text-align:center;font:800 42px Assistant;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.7)}.brand b{color:#F0B650}
.big{position:absolute;top:560px;left:0;right:0;text-align:center;font:900 210px "Frank Ruhl Libre",serif;color:#fff;text-shadow:0 0 40px rgba(240,182,80,.65),0 6px 30px rgba(0,0,0,.6)}
.logo{position:absolute;top:520px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:34px;font:800 76px Assistant;color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.6)}
.grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0,rgba(0,0,0,0) 16%,rgba(0,0,0,0) 52%,rgba(0,0,0,.35) 100%)}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function chunks(say, t0, dur) { // ομάδες 2–4 λέξεων, με χρόνο για κάθε λέξη (καραόκε)
  const words = say.split(/\s+/).filter(Boolean).map((w) => ({ hi: /\*/.test(w), w: w.replace(/\*/g, "") }));
  const groups = []; let cur = [];
  for (const w of words) { const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length; if (cur.length && (cur.length >= 4 || len > 16)) { groups.push(cur); cur = []; } cur.push(w); if (/[.,?!:]$/.test(w.w)) { groups.push(cur); cur = []; } }
  if (cur.length) groups.push(cur);
  const ww = (x) => x.w.length + 1.5 + (/[.,?!:]$/.test(x.w) ? 3 : 0);
  const tot = words.reduce((n, x) => n + ww(x), 0);
  let t = t0;
  return groups.map((g) => { const ws = g.map((x) => { const d = (dur * ww(x)) / tot; const o = { ...x, t0: t, t1: t + d }; t += d; return o; }); return { t0: ws[0].t0, t1: ws.at(-1).t1, words: ws }; });
}

// ---------- κύριο ----------
const fullText = EP.scenes.map((s) => clean(s.say)).join("\n");
const voice = path.join(out, "voice.wav");
let usedTts = null;
if (GK && !fs.existsSync(voice)) usedTts = await tts(fullText, voice);
let bounds, TOTAL;
if (fs.existsSync(voice)) {
  const total = durOf(voice); const pts = splitPoints(voice, EP.scenes.length);
  bounds = [0, ...pts, total]; TOTAL = total + 1.4;
} else { // χωρίς φωνή: εκτίμηση
  let t = 0; bounds = [0]; for (const s of EP.scenes) { t += Math.max(2, clean(s.say).length / 12.5) + .3; bounds.push(t); } TOTAL = t + 1.4;
}
const LEAD = 0.25; // η φωνή ξεκινά λίγο μετά την εικόνα
const scenes = EP.scenes.map((s, i) => { const a = bounds[i] + (i ? LEAD : 0), b = i === EP.scenes.length - 1 ? TOTAL : bounds[i + 1] + LEAD; return { ...s, start: a, dur: b - a, chunks: chunks(s.say, bounds[i] + LEAD, bounds[i + 1] - bounds[i] - .1) }; });
log("σκηνές:", scenes.map((s) => s.dur.toFixed(1)).join(" "), "σύνολο", TOTAL.toFixed(1));

const clipFiles = await clips(scenes.map((s) => s.dur));

// γραφικά
const { chromium } = require(process.env.PW_MODULE || "playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const ov = []; // [{file, t0, t1}]
async function png(name, body, t0, t1) {
  await page.setContent(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Assistant:wght@800&family=Heebo:wght@900&family=Frank+Ruhl+Libre:wght@900&display=block" rel="stylesheet"><style>${CSS}</style></head><body>${body}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const f = path.join(out, name + ".png"); await page.screenshot({ path: f, omitBackground: true }); ov.push({ f, t0, t1 });
}
await png("brand", `<div class="grad"></div><div class="brand">יוונט <b>מסביר</b></div>`, 0, TOTAL);
for (const [i, s] of scenes.entries()) {
  if (s.big) await png(`big${i}`, `<div class="big" dir="auto">${esc(s.big)}</div>`, s.start + .3, s.start + s.dur);
  if (s.logo) await png(`logo${i}`, `<div class="logo">${ICON}<span dir="ltr">@yavanet</span></div>`, s.start + .2, TOTAL);
  for (const [k, c] of s.chunks.entries()) for (const [w, cw] of c.words.entries()) {
    const html = c.words.map((x, j) => `<b class="${j === w ? "on" : ""}">${esc(x.w)}</b>`).join(" ");
    await png(`c${i}_${k}_${w}`, `<div class="cap">${html}</div>`, cw.t0, w === c.words.length - 1 ? c.t1 + .02 : c.words[w + 1].t0);
  }
}
await browser.close();

// ---------- 4. Σύνθεση ----------
// κάθε κλιπ → 1080x1920 30fps, κομμένο στη διάρκεια της σκηνής (αν είναι πιο σύντομο, επιβραδύνεται)
const segs = [];
for (const [i, s] of scenes.entries()) {
  const src = clipFiles[i], cd = durOf(src), need = s.dur + .3;
  const slow = cd < need ? need / cd : 1;
  const seg = path.join(out, `seg${i}.mp4`);
  const ss = cd > need + 2 ? Math.min(1.5, (cd - need) / 3) : 0;
  run(["-ss", ss.toFixed(2), "-i", src, "-vf", `setpts=${slow.toFixed(3)}*PTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,eq=contrast=1.04:saturation=1.06`, "-t", need.toFixed(3), "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", seg]);
  segs.push({ seg, dur: need });
}
// ενώσεις με σύντομο crossfade
const XF = 0.3; let chain = "", last = "[0:v]", off = 0;
segs.forEach((s, i) => { if (!i) { off = s.dur - XF; return; } chain += `${last}[${i}:v]xfade=transition=fade:duration=${XF}:offset=${off.toFixed(3)}[x${i}];`; last = `[x${i}]`; off += s.dur - XF; });
const base = path.join(out, "base.mp4");
run([...segs.flatMap((s) => ["-i", s.seg]), "-filter_complex", chain.replace(/;$/, ""), "-map", last, "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", base]);
// γραφικά από πάνω
const inputs = ov.flatMap((o) => ["-i", o.f]);
let fc = "", cur = "[0:v]";
ov.forEach((o, i) => { fc += `${cur}[${i + 1}:v]overlay=0:0:enable='between(t,${o.t0.toFixed(3)},${o.t1.toFixed(3)})'[o${i}];`; cur = `[o${i}]`; });
const withGfx = path.join(out, "gfx.mp4");
run(["-i", base, ...inputs, "-filter_complex", fc.replace(/;$/, ""), "-map", cur, "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-t", TOTAL.toFixed(3), withGfx]);
// ήχος: φωνή + μουσικό χαλί (χαμηλά, ducking κάτω από τη φωνή)
const bed = `aevalsrc='0.030*sin(2*PI*110*t)*(0.65+0.35*sin(2*PI*0.125*t))+0.022*sin(2*PI*164.81*t)*(0.6+0.4*sin(2*PI*0.09*t))+0.016*sin(2*PI*220*t)+0.010*sin(2*PI*329.63*t)*(0.5+0.5*sin(2*PI*0.5*t))':s=44100:d=${TOTAL.toFixed(2)},lowpass=f=1000,afade=t=in:d=1,afade=t=out:st=${(TOTAL - 1.5).toFixed(2)}:d=1.5`;
const final = path.join(out, "reel.mp4");
if (fs.existsSync(voice)) run(["-i", withGfx, "-i", voice, "-filter_complex", `${bed}[bed];[1:a]adelay=${LEAD * 1000}|${LEAD * 1000},volume=1.5,asplit[v1][v2];[bed][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];[duck][v1]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", final]);
else run(["-i", withGfx, "-filter_complex", `${bed}[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-shortest", final]);
run(["-ss", "1.2", "-i", final, "-frames:v", "1", "-q:v", "3", path.join(out, "cover.jpg")]);
fs.writeFileSync(path.join(out, "caption.txt"), EP.caption);
if (credits.length) fs.writeFileSync(path.join(out, "credits.txt"), "Videos: Pexels\n" + credits.join("\n"));
fs.writeFileSync(path.join(out, "timing.json"), JSON.stringify({ total: TOTAL, tts: usedTts, scenes: scenes.map((s) => ({ start: +s.start.toFixed(2), dur: +s.dur.toFixed(2) })) }, null, 1));
for (const f of fs.readdirSync(out)) if (/^(c\d+_\d+_\d+|big\d+|logo\d+|brand)\.png$|^seg\d+\.mp4$|^base\.mp4$|^gfx\.mp4$|\.pcm$/.test(f)) fs.rmSync(path.join(out, f));
log("έτοιμο:", final, (fs.statSync(final).size / 1e6).toFixed(1) + "MB");
