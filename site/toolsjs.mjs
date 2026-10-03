// Το script των εργαλείων (/tools.js) φορτώνεται μόνο στις σελίδες που το χρειάζονται, με έκδοση από το περιεχόμενο (cache busting).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const V = (() => { try { return createHash("sha1").update(readFileSync(new URL("./assets/tools.js", import.meta.url))).digest("hex").slice(0, 10); } catch { return "1"; } })();
export const toolScript = () => `<script src="/tools.js?v=${V}" defer></script>`;
