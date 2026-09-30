// Χειροκίνητη ειδοποίηση: στέλνει το μήνυμα του content/push-queue.json σε όλους τους εγγεγραμμένους,
// μία φορά (γράφει sentAt). Ενεργοποιείται όταν αλλάζει το αρχείο ή χειροκίνητα από το GitHub.
import fs from "node:fs";
import { pushSend, notifyOwner, log } from "./lib.mjs";
import { SITE } from "../site/config.mjs";
const F = new URL("../content/push-queue.json", import.meta.url);
const q = JSON.parse(fs.readFileSync(F, "utf8"));
if (q.sentAt) { log("push-now: ήδη στάλθηκε", q.sentAt); process.exit(0); }
const details = [];
const r = await pushSend(SITE.url, { tag: q.tag, he: q.he, en: q.en }, { since: q.onlySince, details });
q.sentAt = new Date().toISOString(); q.result = r; q.details = details;
log(JSON.stringify(details));
fs.writeFileSync(F, JSON.stringify(q, null, 2) + "\n");
try { await notifyOwner(`🔔 Ειδοποίηση στάλθηκε: ${r.sent || 0} από ${r.total || 0} συσκευές\n${q.he.title}\n` + details.map((d) => `${d.skipped ? "⏭" : d.status === 201 || d.status === 200 ? "✅" : "❌"} ${d.host} · ${(d.at || "").slice(0, 16)} · ${d.lang}${d.status ? " · " + d.status : ""}`).join("\n")); } catch (e) { log("tg", e.message); }
