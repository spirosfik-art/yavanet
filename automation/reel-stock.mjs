// Ημερήσιο reel με ΠΡΑΓΜΑΤΙΚΑ πλάνα από την Ελλάδα (Pexels, ελεύθερη άδεια) + εβραϊκό κείμενο από πάνω.
// node automation/reel-stock.mjs <outdir>  → <outdir>/reel.mp4, preview.jpg, caption.txt
// Χρειάζεται PEXELS_API_KEY, ffmpeg και Chrome (GitHub Actions).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, env, log } from "./lib.mjs";
import { pickReelArticles } from "./meta.mjs";

const out = path.resolve(process.argv[2] || "out");
fs.mkdirSync(out, { recursive: true });
const NAVY = "#0B3A5B", GOLD = "#F0B650";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const KICK = { travel: "טיולים", "real-estate": "נדל״ן", israelis: "ישראלים ביוון", living: "חיים ביוון", "jewish-greece": "יהדות", breaking: "מבזק", news: "חדשות", greece: "חדשות", economy: "כלכלה", politics: "חדשות" };

// Τι πλάνο ταιριάζει σε κάθε θέμα (αναζήτηση Pexels στα αγγλικά)
const Q = [
  [/airport|flight|טיס|aegean|airline|plane/i, "airplane airport"],
  [/ferry|port|piraeus|מעבור|נמל|ship/i, "ferry boat sea"],
  [/metro|subway|bus|trolley|מטרו|אוטובוס|transport/i, "subway train city"],
  [/acropolis|אקרופוליס|parthenon/i, "acropolis athens"],
  [/crete|כרתים|chania|heraklion/i, "crete greece"],
  [/thessalon|סלוניקי/i, "thessaloniki"],
  [/santorini|סנטוריני/i, "santorini"],
  [/mykonos|מיקונוס/i, "mykonos"],
  [/rhodes|רודוס/i, "rhodes greece"],
  [/island|איים|cyclades|beach|חוף/i, "greek island sea"],
  [/storm|rain|weather|גשם|סופ|מזג/i, "rain city street"],
  [/snow|winter|חורף|שלג|mountain|הרים/i, "snow mountains village"],
  [/real-estate|apartment|housing|דיר|נדל|property|hotel|מלון/i, "apartment building balcony"],
  [/kosher|synagogue|jewish|כשר|יהוד|chabad/i, "old town street evening"],
  [/food|restaurant|taverna|אוכל|מסעד/i, "greek food taverna"],
  [/museum|monaster|church|מוזיאון|מנזר|כנסי/i, "ancient greek ruins"],
  [/athens|אתונה/i, "athens greece city"],
];
const queryFor = (a) => { const t = `${a.slug} ${a.he.title}`; const m = Q.find(([re]) => re.test(t)); return m ? m[1] : "greece"; };

const used = new Set();
async function pexelsClip(query, i) {
  const tries = [query, "athens greece", "greece"];
  for (const q of tries) {
    const r = await fetch(`https://api.pexels.com/videos/search?per_page=20&orientation=portrait&size=medium&query=${encodeURIComponent(q)}`, { headers: { Authorization: env.PEXELS_API_KEY }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) { log("pexels", r.status, q); continue; }
    const j = await r.json();
    for (const v of j.videos || []) {
      if (used.has(v.id) || v.duration < 4) continue;
      const f = (v.video_files || []).filter((x) => x.file_type === "video/mp4" && x.height >= 1280 && x.height > x.width).sort((a, b) => Math.abs(a.height - 1920) - Math.abs(b.height - 1920))[0];
      if (!f) continue;
      used.add(v.id);
      const dst = path.join(out, `v${i}.mp4`);
      const buf = Buffer.from(await (await fetch(f.link, { signal: AbortSignal.timeout(120000) })).arrayBuffer());
      fs.writeFileSync(dst, buf);
      return { file: dst, credit: v.user && v.user.name, q };
    }
  }
  throw new Error("χωρίς βίντεο για " + query);
}

// ---------- Φωνή εκφωνητή (Gemini TTS, δωρεάν κλειδί GEMINI_API_KEY) ----------
const GK = env.GEMINI_API_KEY;
let ttsModel = null, ttsList = [];
async function pickTtsModel() {
  if (ttsModel) return ttsModel;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${GK}`, { signal: AbortSignal.timeout(30000) });
  const j = await r.json();
  const names = (j.models || []).map((m) => m.name.replace("models/", "")).filter((n) => /tts/i.test(n));
  // σειρά προτίμησης· όταν ένα μοντέλο εξαντλήσει το δωρεάν όριο, περνάμε στο επόμενο (το καθένα έχει δικό του όριο)
  // το gemini-3.1-flash-tts διαβάζει μόνο το κείμενο (το 3.8 πρόσθετε λόγια στη δοκιμή) → πρώτο
  ttsList = names.sort((a, b) => (/lite/.test(a) - /lite/.test(b)) || (/flash/.test(b) - /flash/.test(a)) || b.localeCompare(a, undefined, { numeric: true }));
  ttsList = [...ttsList.filter((n) => /3\.1-flash-tts/.test(n)), ...ttsList.filter((n) => !/3\.1-flash-tts/.test(n))];
  if (!ttsList.length) ttsList = ["gemini-2.5-flash-preview-tts"];
  ttsModel = ttsList[0];
  log("tts μοντέλα:", ttsList.join(", "));
  return ttsModel;
}
function durOf(f) { return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim()) || 0; }
async function transcribe(wav, i) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(60000),
      body: JSON.stringify({ contents: [{ parts: [{ text: "Transcribe this audio exactly, in the original language. Output only the transcript." }, { inlineData: { mimeType: "audio/wav", data: fs.readFileSync(wav).toString("base64") } }] }] }) });
    const j = await r.json();
    log("ΑΠΟΜΑΓΝΗΤΟΦΩΝΗΣΗ", i, (j.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(j).slice(0, 120)).replace(/\s+/g, " ").slice(0, 220));
  } catch (e) { log("transcribe", e.message); }
}
async function speak(text, i) {
  await pickTtsModel();
  const styled = `Say in a confident, brisk Israeli TV news anchor voice: ${text}`;
  for (let k = 0; k < 3; k++) {
    log("tts → σκηνή", i, "προσπάθεια", k + 1);
    let r;
    try { r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ttsModel}:generateContent?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(90000),
      body: JSON.stringify({ contents: [{ parts: [{ text: k === 0 ? styled : text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: env.TTS_VOICE || "Charon" } } } } }) }); }
    catch (e) { log("tts timeout", i, e.message); continue; }
    const j = await r.json().catch(() => ({}));
    const part = j.candidates && j.candidates[0] && j.candidates[0].content && (j.candidates[0].content.parts || []).find((p) => p.inlineData);
    if (part) {
      const raw = path.join(out, `a${i}.pcm`), wav = path.join(out, `a${i}.wav`);
      fs.writeFileSync(raw, Buffer.from(part.inlineData.data, "base64"));
      const rate = (/rate=(\d+)/.exec(part.inlineData.mimeType || "") || [, "24000"])[1];
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", rate, "-ac", "1", "-i", raw, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,atempo=1.1", wav]);
      const dur = durOf(wav); log("tts", i, ttsModel, dur.toFixed(1) + "s", text.length, "chars");
      // έλεγχος: αν η διάρκεια είναι πολύ μεγάλη για το κείμενο, μάλλον διάβασε και την οδηγία → ξανά χωρίς οδηγία
      if (dur > text.length / 8 + 2.5 && k < 2) { log("tts: ύποπτα μεγάλη διάρκεια, ξανά χωρίς οδηγία ύφους"); continue; }
      if (process.env.REEL_DEBUG === "1") await transcribe(wav, i);
      return { file: wav, dur };
    }
    log("tts", i, ttsModel, r.status, JSON.stringify(j).slice(0, 160));
    if (r.status === 429 || r.status === 404) { const n = ttsList[ttsList.indexOf(ttsModel) + 1]; if (n) { ttsModel = n; log("tts → αλλαγή μοντέλου:", n); k--; continue; } }
    await new Promise((s) => setTimeout(s, 8000 * (k + 1)));
  }
  return null;
}

const HEAD = (extra = "") => `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@900&family=Assistant:wght@600;800&display=block" rel="stylesheet"><style>*{margin:0;box-sizing:border-box}html,body{background:transparent}body{width:1080px;height:1920px;overflow:hidden;position:relative;font-family:Assistant;color:#fff}
.top{position:absolute;top:150px;right:70px;left:70px;display:flex;justify-content:space-between;align-items:center;font:800 42px Assistant;text-shadow:0 2px 12px rgba(0,0,0,.5)}.top svg{width:96px;height:96px}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 45%,rgba(7,42,67,.85) 75%,rgba(7,42,67,.95) 100%)}
.box{position:absolute;right:70px;left:70px;bottom:330px}h1{font:900 FSpx/1.1 "Frank Ruhl Libre",serif;text-shadow:0 3px 18px rgba(0,0,0,.45)}
.tag{display:inline-block;background:${GOLD};color:${NAVY};font:800 46px Assistant;padding:14px 34px;border-radius:50px;margin-bottom:30px}.n{display:inline-block;width:110px;height:110px;border-radius:50%;background:${GOLD};color:${NAVY};font:900 76px/110px "Frank Ruhl Libre";text-align:center;margin-left:20px;vertical-align:middle}
.mid{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 80px;background:rgba(7,42,67,.45)}.big{font:900 128px/1.08 "Frank Ruhl Libre",serif;text-shadow:0 4px 24px rgba(0,0,0,.5)}.sm{font:700 58px/1.35 Assistant;margin-top:40px}.pill{display:inline-block;background:${GOLD};color:${NAVY};font:800 56px Assistant;padding:24px 52px;border-radius:70px;margin-top:60px}${extra}</style></head><body>`;

function overlay(i, html) {
  const hf = path.join(out, `o${i}.html`);
  fs.writeFileSync(hf, html);
  execFileSync("google-chrome", ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--default-background-color=00000000", "--virtual-time-budget=10000", "--window-size=1080,1920", `--screenshot=${path.join(out, `o${i}.png`)}`, "file://" + hf], { stdio: "ignore", timeout: 60000 });
  return path.join(out, `o${i}.png`);
}

const arts = pickReelArticles(3);
if (arts.length < 2) { log("reel-stock: λίγα άρθρα"); process.exit(0); }
const icon = fs.readFileSync(path.join(ROOT, "site/assets/icon.svg"), "utf8");
const day = new Date().toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem", day: "numeric", month: "long" });
const scenes = [];
// 1. Αγκίστρι (0–2.5″): ερώτηση στον θεατή
const dayName = new Date().toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem", weekday: "long", day: "numeric", month: "long" });
scenes.push({ q: "athens greece city", d: 2.6, say: `חדשות יוון, ${dayName}. ${arts.length} דברים שחשוב לדעת היום.`, html: `${HEAD()}<div class="top"><span>יוונט · יוון בעברית</span>${icon}</div><div class="mid"><div class="big">טסים ליוון?</div><div class="sm">${arts.length} דברים שחשוב לדעת היום<br>📍 <span dir="rtl">${esc(day)}</span></div></div></body></html>` });
arts.forEach((a, k) => {
  const t = a.he.title, fsz = t.length > 70 ? 72 : t.length > 45 ? 84 : 98;
  const dek = (a.he.dek || "").split(/(?<=[.!?])\s/)[0];
  scenes.push({ q: queryFor(a), d: 3.4, say: a.he.title, html: `${HEAD().replace("FS", String(fsz))}<div class="shade"></div><div class="top"><span>יוונט</span>${icon}</div><div class="box"><div><span class="n">${k + 1}</span><span class="tag">${esc(a.breaking || a.strike ? "מבזק" : KICK[a.section] || "יוון")}</span></div><h1>${esc(t)}</h1></div></body></html>` });
});
scenes.push({ q: "greek island sea", d: 2.8, say: "יוונט. כל מה שקורה ביוון, בעברית. שלחו למי שטס ליוון.", html: `${HEAD()}<div class="top"><span>יוונט</span>${icon}</div><div class="mid"><div class="big">מכירים מישהו שטס ליוון?</div><div class="sm">שלחו לו את הסרטון 📲</div><div class="pill">עקבו ⬅ <bdi dir="ltr">@yavanet</bdi></div></div></body></html>` });

const credits = [];
const X = 0.4;
const voice = GK && process.env.REEL_VOICE !== "0";
if (voice) {
  for (let i = 0; i < scenes.length; i++) {
    const a = await speak(scenes[i].say, i);
    if (!a) { log("tts: αποτυχία, συνεχίζουμε χωρίς φωνή"); scenes.forEach((x) => delete x.audio); break; }
    scenes[i].audio = a.file;
    scenes[i].d = Math.max(scenes[i].d, a.dur + 0.5);
    await new Promise((s) => setTimeout(s, 6500)); // όριο αιτημάτων δωρεάν επιπέδου
  }
}
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const clip = await pexelsClip(s.q, i);
  credits.push(clip.credit);
  const ov = overlay(i, s.html);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-stream_loop", "-1", "-ss", "0.3", "-t", String(s.d + X), "-i", clip.file, "-i", ov,
    "-filter_complex", "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,eq=brightness=-0.04:saturation=1.08[b];[b][1:v]overlay=0:0,format=yuv420p[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "20", path.join(out, `c${i}.mp4`)], { stdio: "inherit" });
  log("σκηνή", i, s.q, "→", clip.q);
}
// Ένωση με μαλακές μεταβάσεις + σιωπηλό κανάλι ήχου (απαιτείται από ορισμένες εφαρμογές)
const ins = scenes.flatMap((_, i) => ["-i", path.join(out, `c${i}.mp4`)]);
let f = "", prev = "0", off = 0;
for (let i = 1; i < scenes.length; i++) { off += scenes[i - 1].d; f += `[${prev}][${i}]xfade=transition=fade:duration=${X}:offset=${off.toFixed(2)}[x${i}];`; prev = `x${i}`; }
const tot = off + scenes[scenes.length - 1].d + X;
// Ήχος: η φωνή κάθε σκηνής ξεκινά 0,25″ μετά την αρχή της σκηνής (πάνω σε σιωπηλό «χαλί» όσο όλο το βίντεο)
const aud = scenes.map((sc, i) => ({ f: sc.audio, at: scenes.slice(0, i).reduce((t, x) => t + x.d, 0) + 0.25 })).filter((x) => x.f);
const aIns = aud.flatMap((x) => ["-i", x.f]);
let af = `[${scenes.length}:a]anull[base];`;
aud.forEach((x, k) => { af += `[${scenes.length + 1 + k}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${Math.round(x.at * 1000)}|${Math.round(x.at * 1000)},volume=1.6[v${k}];`; });
af += aud.length ? `[base]${aud.map((_, k) => `[v${k}]`).join("")}amix=inputs=${aud.length + 1}:normalize=0:duration=first[aout]` : `[base]anull[aout]`;
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...ins, "-f", "lavfi", "-t", tot.toFixed(2), "-i", "anullsrc=r=44100:cl=stereo", ...aIns,
  "-filter_complex", `${f}[${prev}]format=yuv420p[v];${af}`, "-map", "[v]", "-map", "[aout]", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", path.join(out, "reel.mp4")], { stdio: "inherit" });
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(out, "reel.mp4"), "-vf", `fps=${(scenes.length / tot).toFixed(4)},scale=270:480,tile=${scenes.length}x1`, "-frames:v", "1", path.join(out, "preview.jpg")], { stdio: "inherit" });
const caption = `טסים ליוון? ${arts.length} דברים שחשוב לדעת היום 🇬🇷\n\n${arts.map((a, i) => `${i + 1}. ${a.he.title}`).join("\n")}\n\n📍 יוון\nהכתבות המלאות באתר — הקישור בביו 👆\n📤 מכירים מישהו שטס ליוון? שלחו לו\n👇 איזו מהחדשות הכי חשובה לכם? כתבו בתגובות\n\n#יוון #אתונה #טיסות_ליוון #ישראלים_ביוון #יוונט`;
fs.writeFileSync(path.join(out, "caption.txt"), caption);
fs.writeFileSync(path.join(out, "count.txt"), String(scenes.length));
fs.writeFileSync(path.join(out, "credits.txt"), "Pexels: " + credits.filter(Boolean).join(", "));
log("reel-stock: έτοιμο", tot.toFixed(1) + "s", arts.map((a) => a.slug).join(", "));
