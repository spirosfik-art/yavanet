// Μικρός μετατροπέας Markdown σε HTML (επικεφαλίδες, παράγραφοι, λίστες, links, έντονα).
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function inline(s) {
  let out = esc(s);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (m, t, u) => {
    const ext = u.startsWith("http");
    return `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`;
  });
  return out;
}

export function md(src) {
  const lines = String(src || "").replace(/\r/g, "").split("\n");
  const html = [];
  let para = [], list = null, table = null;
  const flushTable = () => {
    if (!table) return;
    const [head, ...rows] = table.filter((r) => !/^\|?\s*:?-{2,}/.test(r));
    const cells = (r) => r.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    html.push(`<div class="tablewrap"><table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    table = null;
  };
  const flushPara = () => { if (para.length) { html.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list) { html.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.type}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); flushTable(); continue; }
    if (line.startsWith("|")) { flushPara(); flushList(); (table ||= []).push(line); continue; }
    flushTable();
    let m;
    if ((m = line.match(/^(#{2,4})\s+(.*)$/))) { flushPara(); flushList(); const lv = m[1].length; html.push(`<h${lv}>${inline(m[2])}</h${lv}>`); continue; }
    if ((m = line.match(/^[-*]\s+(.*)$/))) { flushPara(); if (!list || list.type !== "ul") { flushList(); list = { type: "ul", items: [] }; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) { flushPara(); if (!list || list.type !== "ol") { flushList(); list = { type: "ol", items: [] }; } list.items.push(m[1]); continue; }
    flushList(); para.push(line);
  }
  flushPara(); flushList(); flushTable();
  return html.join("\n");
}

// Καθαρό κείμενο (για περιγραφές, ανάγνωση φωναχτά κ.λπ.)
export function plain(src) {
  return String(src || "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\|/g, " ").replace(/-{3,}/g, " ").replace(/[#*_>`]/g, "").replace(/\s+/g, " ").trim();
}
