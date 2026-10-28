// Google Veo (Gemini API): ρεαλιστικά κλιπ βίντεο από περιγραφή.
//   node automation/explainer/veo.mjs check                 → ποια μοντέλα Veo βλέπει το κλειδί
//   node automation/explainer/veo.mjs gen "<prompt>" out.mp4 [seconds]
import fs from "node:fs";
const GK = process.env.GEMINI_API_KEY;
const B = "https://generativelanguage.googleapis.com/v1beta";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
export async function veoModels() {
  const j = await (await fetch(`${B}/models?pageSize=300&key=${GK}`)).json();
  return (j.models || []).map((m) => m.name.replace("models/", "")).filter((n) => /veo/i.test(n));
}
function pick(models) {
  const pref = (process.env.VEO_MODEL || "").split(",").filter(Boolean);
  for (const p of pref) if (models.includes(p)) return p;
  const order = [/veo-3\.1-fast/, /veo-3\.1(?!-lite)/, /veo-3-fast/, /veo-3\.1-lite/, /veo-3/, /veo/];
  for (const re of order) { const m = models.find((x) => re.test(x) && !/-001$/.test(x) === true) || models.find((x) => re.test(x)); if (m) return m; }
  return null;
}
export async function veoGen(prompt, outFile, seconds = 8, model) {
  model = model || pick(await veoModels());
  if (!model) throw new Error("κανένα μοντέλο Veo για αυτό το κλειδί");
  const body = { instances: [{ prompt }], parameters: { aspectRatio: "9:16", durationSeconds: seconds, personGeneration: "allow_all", resolution: process.env.VEO_RES || "720p" } };
  let r = await fetch(`${B}/models/${model}:predictLongRunning?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  let j = await r.json();
  if (!r.ok && /resolution|personGeneration|durationSeconds/i.test(JSON.stringify(j))) { // κάποια μοντέλα δεν δέχονται όλες τις παραμέτρους
    delete body.parameters.resolution; delete body.parameters.personGeneration;
    r = await fetch(`${B}/models/${model}:predictLongRunning?key=${GK}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); j = await r.json();
  }
  if (!r.ok || !j.name) throw new Error(`${model} ${r.status} ${JSON.stringify(j).slice(0, 300)}`);
  log("veo", model, "ξεκίνησε", j.name);
  for (let i = 0; i < 90; i++) {
    await new Promise((s) => setTimeout(s, 10000));
    const op = await (await fetch(`${B}/${j.name}?key=${GK}`)).json();
    if (op.error) throw new Error("veo: " + JSON.stringify(op.error).slice(0, 300));
    if (op.done) {
      const v = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video || op.response?.generatedVideos?.[0]?.video;
      if (!v || !v.uri) throw new Error("veo: χωρίς βίντεο " + JSON.stringify(op.response || op).slice(0, 300));
      const d = await fetch(v.uri + (v.uri.includes("?") ? "&" : "?") + "key=" + GK, { redirect: "follow" });
      fs.writeFileSync(outFile, Buffer.from(await d.arrayBuffer()));
      log("veo ✓", outFile, (fs.statSync(outFile).size / 1e6).toFixed(1) + "MB");
      return { model, file: outFile };
    }
  }
  throw new Error("veo: timeout");
}
if (process.argv[1] && process.argv[1].endsWith("veo.mjs")) {
  const [cmd, a, b, c] = process.argv.slice(2);
  if (cmd === "check") { const m = await veoModels(); log("VEO μοντέλα:", m.join(", ") || "κανένα"); }
  else if (cmd === "gen") { try { await veoGen(a, b, Number(c || 4)); } catch (e) { log("VEO ΣΦΑΛΜΑ", e.message); process.exitCode = 1; } }
}
