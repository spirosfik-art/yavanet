// Service worker: γρήγορη φόρτωση και λειτουργία με αδύναμο σήμα.
const V = "yv-v5";
const CORE = ["/", "/en/", "/styles.css", "/app.js", "/icon.svg", "/offline.html"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin || r.url.includes("/api/")) return;
  if (r.mode === "navigate") {
    // Σελίδες: πρώτα δίκτυο (για φρέσκα νέα), αλλιώς cache, αλλιώς offline
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match("/offline.html"))));
    return;
  }
  // Αρχεία (css/js/εικόνες): δείχνουμε αμέσως ό,τι υπάρχει και ανανεώνουμε στο παρασκήνιο
  e.respondWith(caches.match(r).then((m) => {
    const net = fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; }).catch(() => m);
    return m || net;
  }));
});

// Ειδοποιήσεις (Web Push): η ειδοποίηση έρχεται χωρίς περιεχόμενο, το κείμενο το ζητάμε από το site
self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    let m = null;
    try {
      const sub = await self.registration.pushManager.getSubscription();
      const r = await fetch("/api/push?latest=1" + (sub ? "&ep=" + encodeURIComponent(sub.endpoint) : ""), { cache: "no-store" });
      m = await r.json();
    } catch (err) { }
    const he = !m || /[֐-׿]/.test(m.title || "");
    return self.registration.showNotification((m && m.title) || "יוונט", {
      body: (m && m.body) || "", icon: "/icon-192.png", badge: "/icon-192.png", tag: (m && m.tag) || "yavanet",
      dir: he ? "rtl" : "ltr", lang: he ? "he" : "en", data: { url: (m && m.url) || "/" },
    });
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ws) => {
    for (const w of ws) if (w.url === url && "focus" in w) return w.focus();
    return self.clients.openWindow(url);
  }));
});
