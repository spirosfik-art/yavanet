// Χειροκίνητη ειδοποίηση: στέλνει το μήνυμα του content/push-queue.json σε όλους τους εγγεγραμμένους,
// μία φορά (γράφει sentAt). Ενεργοποιείται όταν αλλάζει το αρχείο ή χειροκίνητα από το GitHub.
import fs from "node:fs";
import { pushSend, notifyOwner, log } from "./lib.mjs";
import { SITE } from "../site/config.mjs";
const F = new URL("../content/push-queue.json", import.meta.url);
const q = JSON.parse(fs.readFileSync(F, "utf8"));
if (q.sentAt) { log("push-now: ήδη στάλθηκε", q.sentAt); process.exit(0); }
const r = await pushSend(SITE.url, { tag: q.tag, he: q.he, en: q.en });
q.sentAt = new Date().toISOString(); q.result = r;
fs.writeFileSync(F, JSON.stringify(q, null, 2) + "\n");
try { await notifyOwner(`🔔 Ειδοποίηση στάλθηκε: ${r.sent || 0} από ${r.total || 0} συσκευές\n${q.he.title}`); } catch (e) { log("tg", e.message); }
