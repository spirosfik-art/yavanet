// Ανάλυση ήχου με Gemini: απομαγνητοφώνηση + περιγραφή φωνής. Είσοδος: AUDIO_B64 (ogg/opus).
const GK = process.env.GEMINI_API_KEY;
const j0 = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=300&key=${GK}`)).json();
const names = (j0.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent")).map((m) => m.name.replace("models/", "")).filter((n) => /gemini/.test(n) && !/tts|image|embedding|live|audio/.test(n));
const order = [...names.filter((n) => /pro/.test(n)), ...names.filter((n) => /flash/.test(n) && !/lite/.test(n)), ...names.filter((n) => /lite/.test(n))];
const prompt = process.env.PROMPT || `This is the audio of a short Hebrew explainer video. 1) Transcribe it exactly in Hebrew. 2) Describe the narrator's voice: gender, approximate age, tone, pace, accent. 3) Is it more likely a human or an AI text-to-speech voice? If AI, which product does it most resemble (e.g. ElevenLabs, Google, Microsoft Azure Neural, OpenAI) and why. 4) Is there background music? Describe it. Answer in English except the transcript.`;
for (const m of order) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "audio/ogg", data: process.env.AUDIO_B64 } }] }] }) });
  const j = await r.json().catch(() => ({}));
  const t = j.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
  if (t) { console.log("MODEL", m); for (const line of t.split("\n")) if (line.trim()) console.log("::notice::" + line.slice(0, 900)); process.exit(0); }
  console.log("skip", m, r.status, JSON.stringify(j).slice(0, 150));
}
