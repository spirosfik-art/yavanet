// Φωτογραφίες άρθρων από το δικό μας domain (yavanet.gr/img/...): η Google Images πιστώνει το Yavanet, όχι την Pexels.
// Μορφή: /img/<pexels-id>/<πλάτος>[x<ύψος>]/<english-slug>.webp[?n=<αρχείο αν δεν είναι pexels-photo-<id>.jpeg>]
// .webp για τη σελίδα, .jpg για Facebook/WhatsApp (og:image)· η Pexels κάνει τη μετατροπή· το αποτέλεσμα μένει στο cache του Cloudflare για 1 χρόνο.
export async function onRequestGet({ request, params, waitUntil }) {
  const url = new URL(request.url);
  const cache = caches.default, key = new Request(url.toString());
  const hit = await cache.match(key);
  if (hit) return hit;
  const [id, size, file] = params.path || [];
  const m = /^(\d{2,4})(?:x(\d{2,4}))?$/.exec(size || "");
  if (!/^\d{1,12}$/.test(id || "") || !m || !/^[a-z0-9-]{1,90}\.(webp|jpg)$/.test(file || "") || +m[1] > 2000 || (m[2] && +m[2] > 2000)) return new Response("Not found", { status: 404 });
  const n = url.searchParams.get("n") || `pexels-photo-${id}.jpeg`;
  if (!/^[\w.-]{1,120}\.(jpe?g|png)$/i.test(n)) return new Response("Not found", { status: 404 });
  const up = new URL(`https://images.pexels.com/photos/${id}/${n}`);
  up.searchParams.set("auto", "compress"); up.searchParams.set("cs", "tinysrgb"); if (file.endsWith(".webp")) up.searchParams.set("fm", "webp"); up.searchParams.set("w", m[1]);
  if (m[2]) { up.searchParams.set("h", m[2]); up.searchParams.set("fit", "crop"); }
  const res = await fetch(up.toString(), { cf: { cacheTtl: 31536000, cacheEverything: true } });
  if (!res.ok) return new Response("Not found", { status: 404, headers: { "cache-control": "public, max-age=300" } });
  const out = new Response(res.body, { headers: {
    "content-type": res.headers.get("content-type") || (file.endsWith(".jpg") ? "image/jpeg" : "image/webp"),
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
    "access-control-allow-origin": "*",
  } });
  waitUntil(cache.put(key, out.clone()));
  return out;
}
