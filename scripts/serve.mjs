// Τοπική προεπισκόπηση: http://localhost:8080
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const root = path.resolve("dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".xml": "application/xml", ".webmanifest": "application/manifest+json", ".txt": "text/plain" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.startsWith("/api/")) { res.writeHead(200, { "content-type": "application/json" }); return res.end('{"ok":true,"preview":true}'); }
  let f = path.join(root, p); if (!f.startsWith(root)) return res.end();
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404, { "content-type": types[".html"] }); return res.end(fs.readFileSync(path.join(root, "404.html"))); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f));
}).listen(process.env.PORT || 8080, () => console.log("http://localhost:" + (process.env.PORT || 8080)));
