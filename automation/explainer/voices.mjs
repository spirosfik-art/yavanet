// Δείγματα φωνών Gemini για την ίδια φράση → out/voice-<Όνομα>.mp3
import fs from "node:fs"; import { execFileSync } from "node:child_process";
const GK = process.env.GEMINI_API_KEY, text = process.env.SAMPLE || "אלפי שקלים עוברים אצלכם באפליקציה בשתי לחיצות. אבל כדי להצביע, עדיין נוסעים לקלפי. למה?";
const voices = (process.env.VOICES || "Charon,Orus,Puck,Fenrir").split(",");
fs.mkdirSync("out", { recursive: true });
const j0 = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${GK}`)).json();
const names = (j0.models || []).map((m) => m.name.replace("models/", "")).filter((n) => /tts/i.test(n));
const list = [...names.filter((n) => /3\.1-flash-tts/.test(n)), ...names.filter((n) => !/3\.1-flash-tts/.test(n))];
for (const v of voices) {
  for (const m of list) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Read aloud in Hebrew as an engaging explainer-video narrator, natural and energetic. Read exactly: ${text}` }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v } } } } }) });
    const j = await r.json().catch(() => ({}));
    const p = j.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
    if (p) { fs.writeFileSync("out/v.pcm", Buffer.from(p.inlineData.data, "base64")); execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "out/v.pcm", "-b:a", "128k", `out/voice-${v}.mp3`]); console.log("✓", v, m); break; }
    console.log("✗", v, m, r.status);
  }
}
fs.rmSync("out/v.pcm", { force: true });
