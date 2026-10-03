// Υπογραφή για το email καλωσορίσματος: το link επιβεβαίωσης του Brevo γυρίζει στο site με w=<token>,
// ώστε να στέλνουμε το καλωσόρισμα μόνο σε όποιον πάτησε πραγματικά «επιβεβαίωση».
const enc = new TextEncoder();
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
async function hmac(env, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode("yavanet:welcome:" + String(env.TELEGRAM_BOT_TOKEN || "").replace(/\s/g, "")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
  return [...sig].slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function welcomeToken(env, email, lang) { const p = b64u(email + "|" + lang); return p + "." + (await hmac(env, p)); }
export async function readWelcomeToken(env, tok) {
  const [p, sig] = String(tok || "").split(".");
  if (!p || !sig || (await hmac(env, p)) !== sig) return null;
  try { const [email, lang] = unb64u(p).split("|"); return { email, lang: lang === "en" ? "en" : "he" }; } catch { return null; }
}
