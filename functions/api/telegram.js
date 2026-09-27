// Webhook του Telegram bot: απαντά αμέσως στον ιδιοκτήτη και ξεκινά την εκτέλεση στο GitHub,
// ώστε «Δημοσίευση / Απόρριψη / εντολές» να εφαρμόζονται σε 1–2 λεπτά αντί για έως 15–30.
import { json } from "../../lib/forms.js";

async function sha256hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const tg = (env, method, body) => fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export async function onRequestPost({ request, env }) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.GH_DISPATCH_TOKEN) return json({ ok: false }, 503);
  // Έλεγχος ότι το αίτημα έρχεται πράγματι από το Telegram
  const expected = (await sha256hex("yavanet:" + env.TELEGRAM_BOT_TOKEN)).slice(0, 48);
  if (request.headers.get("x-telegram-bot-api-secret-token") !== expected) return json({ ok: false }, 403);
  const u = await request.json().catch(() => null);
  if (!u) return json({ ok: true });
  const cq = u.callback_query, msg = u.message;
  const chat = String((cq ? cq.message.chat.id : msg && msg.chat.id) || "");
  if (chat !== String(env.TELEGRAM_OWNER_CHAT_ID)) return json({ ok: true }); // αγνοούμε όλους τους άλλους

  if (cq && String(cq.data || "").startsWith("noop")) { await tg(env, "answerCallbackQuery", { callback_query_id: cq.id }); return json({ ok: true }); }
  // Κρατάμε μόνο ό,τι χρειάζεται η εκτέλεση
  const slim = cq
    ? { update_id: u.update_id, callback_query: { id: cq.id, data: cq.data, message: { chat: { id: cq.message.chat.id } } } }
    : { update_id: u.update_id, message: { chat: { id: msg.chat.id }, text: (msg.text || "").slice(0, 2000) } };

  const repo = env.GH_REPO || "spirosfik-art/yavanet";
  const r = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/pipeline.yml/dispatches`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`, accept: "application/vnd.github+json", "user-agent": "yavanet-bot", "content-type": "application/json" },
    body: JSON.stringify({ ref: "main", inputs: { tg_update: JSON.stringify(slim) } }),
  });
  if (!r.ok) {
    console.error("dispatch", r.status, (await r.text()).slice(0, 200));
    // Ασφάλεια: αν το GitHub δεν δέχεται το κλειδί (π.χ. έληξε), γυρνάμε το bot σε «αργή» λειτουργία
    // (έλεγχος κάθε 15′) ώστε να μη χάνεται καμία εντολή, και ειδοποιούμε τον ιδιοκτήτη.
    await tg(env, "deleteWebhook", { drop_pending_updates: false });
    await tg(env, "sendMessage", { chat_id: env.TELEGRAM_OWNER_CHAT_ID, text: "⚠️ Το γρήγορο bot σταμάτησε (το κλειδί GH_DISPATCH_TOKEN δεν γίνεται δεκτό – ίσως έληξε). Συνεχίζω σε αργή λειτουργία: οι εντολές σου εφαρμόζονται μέσα σε 15–30′. Φτιάξε νέο κλειδί για να επανέλθει η γρήγορη λειτουργία." });
    return json({ ok: false }, 503);
  }

  // Άμεση απάντηση στον ιδιοκτήτη
  const action = cq ? String(cq.data || "").split(":")[0] : "";
  const ack = action === "approve" ? "⏳ Εντάξει! Δημοσιεύεται – θα είναι στο site σε ~2 λεπτά."
    : action === "reject" ? "⏳ Εντάξει, απορρίπτεται."
    : action === "edit" ? "✏️ Στείλε την οδηγία σου"
    : "⏳ Λήφθηκε – απάντηση σε ~1 λεπτό.";
  if (cq) {
    await tg(env, "answerCallbackQuery", { callback_query_id: cq.id, text: ack });
    // αφαιρούμε τα κουμπιά για να φαίνεται ότι πατήθηκε
    await tg(env, "editMessageReplyMarkup", { chat_id: cq.message.chat.id, message_id: cq.message.message_id, reply_markup: { inline_keyboard: [[{ text: action === "approve" ? "✅ Εγκρίθηκε" : action === "reject" ? "❌ Απορρίφθηκε" : "✏️ Αλλαγή", callback_data: "noop:0" }]] } });
    if (action !== "edit") await tg(env, "sendMessage", { chat_id: cq.message.chat.id, text: ack });
  } else if ((msg.text || "").startsWith("/")) {
    await tg(env, "sendMessage", { chat_id: msg.chat.id, text: ack });
  }
  return json({ ok: true });
}
