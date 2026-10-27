// «יוונט מסביר»: reel εξήγησης (3D + νέον γραφικά + υπότιτλοι λέξη-λέξη + φωνή Gemini).
//   node automation/explainer/render.mjs automation/explainer/episodes/<x>.json <outDir>
// Χωρίς GEMINI_API_KEY: χωρίς φωνή, εκτιμώμενες διάρκειες (για προεπισκόπηση της εικόνας).
// Βγάζει: reel.mp4, cover.jpg, caption.txt
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const DIR = path.dirname(new URL(import.meta.url).pathname);
const [epFile, outArg] = process.argv.slice(2);
const EP = JSON.parse(fs.readFileSync(epFile, "utf8"));
const out = path.resolve(outArg || "explainer-out");
fs.mkdirSync(out, { recursive: true });
const FPS = Number(process.env.FPS || 30);
const GK = process.env.GEMINI_API_KEY;
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const durOf = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim()) || 0;

// ---------- φωνή ----------
let ttsList = null;
async function ttsModels() {
  if (ttsList) return ttsList;
  try {
    const j = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${GK}`, { signal: AbortSignal.timeout(30000) })).json();
    const names = (j.models || []).map((m) => m.name.replace("models/", "")).filter((n) => /tts/i.test(n));
    ttsList = [...names.filter((n) => /3\.1-flash-tts/.test(n)), ...names.filter((n) => !/3\.1-flash-tts/.test(n) && !/lite/.test(n)), ...names.filter((n) => /lite/.test(n))];
  } catch { ttsList = []; }
  if (!ttsList.length) ttsList = ["gemini-2.5-flash-preview-tts"];
  log("tts:", ttsList.join(", "));
  return ttsList;
}
async function speak(text, i) {
  const list = await ttsModels();
  const voice = process.env.TTS_VOICE || EP.voice || "Charon";
  const styled = `Read aloud in Hebrew, like an engaging explainer-video narrator: curious, warm, energetic, natural pace. Read exactly this text and nothing else: ${text}`;
  let m = 0;
  for (let k = 0; k < 6 && m < list.length; k++) {
    let r, j;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${list[m]}:generateContent?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(90000),
        body: JSON.stringify({ contents: [{ parts: [{ text: k < 2 ? styled : text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } } }) });
      j = await r.json().catch(() => ({}));
    } catch (e) { log("tts timeout", i); continue; }
    const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (part) {
      const raw = path.join(out, `a${i}.pcm`), wav = path.join(out, `a${i}.wav`);
      fs.writeFileSync(raw, Buffer.from(part.inlineData.data, "base64"));
      const rate = (/rate=(\d+)/.exec(part.inlineData.mimeType || "") || [, "24000"])[1];
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", rate, "-ac", "1", "-i", raw, "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=1.08", "-ar", "44100", wav]);
      const dur = durOf(wav);
      if (dur > text.length / 7 + 2.5) { log("tts: πολύ μεγάλο", i, dur.toFixed(1), "→ ξανά"); continue; }
      log("tts", i, list[m], dur.toFixed(2) + "s");
      return { wav, dur };
    }
    log("tts", i, list[m], r.status, JSON.stringify(j).slice(0, 140));
    if (r.status === 429 || r.status === 404) m++;
    else await new Promise((s) => setTimeout(s, 6000));
  }
  return null;
}

// ---------- υπότιτλοι: κομμάτια 1–3 λέξεων, χρόνος ανάλογα με το μήκος ----------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function chunks(say, t0, dur) {
  const words = say.split(/\s+/).filter(Boolean).map((w) => ({ hi: /\*/.test(w), w: w.replace(/\*/g, "") }));
  const groups = []; let cur = [];
  for (const w of words) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 13)) { groups.push(cur); cur = []; }
    cur.push(w);
    if (/[.,?!:]$/.test(w.w)) { groups.push(cur); cur = []; }
  }
  if (cur.length) groups.push(cur);
  const weight = (g) => g.reduce((n, x) => n + x.w.length + 1.5 + (/[.,?!:]$/.test(x.w) ? 3 : 0), 0);
  const total = groups.reduce((n, g) => n + weight(g), 0);
  let t = t0;
  return groups.map((g) => { const d = (dur * weight(g)) / total; const c = { t0: t, t1: t + d, html: g.map((x) => (x.hi ? `<em>${esc(x.w)}</em>` : esc(x.w))).join(" ") }; t += d; return c; });
}

// ---------- σκηνές ----------
const PAD = 0.35;
let t = 0;
const scenes = [];
for (const [i, s] of EP.scenes.entries()) {
  const clean = s.say.replace(/\*/g, "");
  const a = GK ? await speak(clean, i) : null;
  const speech = a ? a.dur : Math.max(1.6, clean.length / 12.5);
  const dur = speech + PAD + (i === EP.scenes.length - 1 ? 1.2 : 0);
  scenes.push({ type: s.type, start: t, dur, audio: a && a.wav, speechStart: t + 0.12, chunks: chunks(s.say, t + 0.12, speech) });
  t += dur;
}
const TOTAL = t;
log(`σύνολο ${TOTAL.toFixed(1)}s, ${scenes.length} σκηνές, φωνή: ${scenes.filter((s) => s.audio).length}/${scenes.length}`);

// ---------- καρέ ----------
const { chromium } = require(process.env.PW_MODULE || "playwright");
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.route("http://yv.local/**", (route) => {
  const f = path.join(DIR, new URL(route.request().url()).pathname);
  route.fulfill({ path: f, contentType: f.endsWith(".js") ? "text/javascript" : "text/html" });
});
await page.addInitScript((ep) => { window.EP = ep; }, { scenes });
page.on("pageerror", (e) => log("pageerror", e.message));
await page.goto("http://yv.local/scene.html");
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
if (process.env.STILLS) { // μόνο στατικά καρέ για έλεγχο
  for (const tt of process.env.STILLS.split(",").map(Number)) { await page.evaluate((x) => window.drawFrame(x), tt); await page.screenshot({ path: path.join(out, `still-${tt}.jpg`), type: "jpeg", quality: 85 }); }
  await browser.close(); process.exit(0);
}
const N = Math.ceil(TOTAL * FPS);
const silent = path.join(out, "video.mp4");
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "19", silent], { stdio: ["pipe", "inherit", "inherit"] });
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  await page.evaluate((tt) => window.drawFrame(tt), f / FPS);
  const buf = await page.screenshot({ type: "jpeg", quality: 90 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f === Math.round(FPS * 0.9)) fs.writeFileSync(path.join(out, "cover.jpg"), buf);
  if (f % (FPS * 5) === 0) log(`καρέ ${f}/${N} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();

// ---------- ήχος: φωνή + απαλό μουσικό χαλί ----------
const inputs = [], filters = [];
scenes.forEach((s, i) => { if (s.audio) { inputs.push("-i", s.audio); filters.push(`[${inputs.length / 2}:a]adelay=${Math.round(s.speechStart * 1000)}|${Math.round(s.speechStart * 1000)},volume=1.6[v${i}]`); } });
const bed = `aevalsrc='0.030*sin(2*PI*110*t)*(0.65+0.35*sin(2*PI*0.125*t))+0.022*sin(2*PI*164.81*t)*(0.6+0.4*sin(2*PI*0.09*t))+0.016*sin(2*PI*220*t)+0.010*sin(2*PI*329.63*t)*(0.5+0.5*sin(2*PI*0.5*t))':s=44100:d=${TOTAL.toFixed(2)},lowpass=f=900,afade=t=in:d=1,afade=t=out:st=${(TOTAL - 1.5).toFixed(2)}:d=1.5[bed]`;
const vlabels = scenes.map((s, i) => (s.audio ? `[v${i}]` : "")).join("");
const nv = scenes.filter((s) => s.audio).length;
const fc = [bed, ...filters, `[bed]${vlabels}amix=inputs=${nv + 1}:duration=first:normalize=0,alimiter=limit=0.95[aout]`].join(";");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, ...inputs, "-filter_complex", fc, "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", path.join(out, "reel.mp4")]);
fs.writeFileSync(path.join(out, "caption.txt"), EP.caption);
fs.writeFileSync(path.join(out, "timing.json"), JSON.stringify({ total: TOTAL, scenes: scenes.map((s) => ({ type: s.type, start: +s.start.toFixed(2), dur: +s.dur.toFixed(2), voice: !!s.audio })) }, null, 1));
log("έτοιμο:", path.join(out, "reel.mp4"), (fs.statSync(path.join(out, "reel.mp4")).size / 1e6).toFixed(1) + "MB");
