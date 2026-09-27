// Ένα κανονικό domain: yavanet.pages.dev και www.yavanet.gr → https://yavanet.gr (301, καλό για Google).
// Τα /api/* δεν ανακατευθύνονται, ώστε φόρμες και Telegram να δουλεύουν από όποια διεύθυνση.
const CANONICAL = "yavanet.gr";
const ALIASES = new Set(["yavanet.pages.dev", "www.yavanet.gr"]);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (ALIASES.has(url.hostname) && !url.pathname.startsWith("/api/") && (request.method === "GET" || request.method === "HEAD")) {
    url.hostname = CANONICAL;
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
