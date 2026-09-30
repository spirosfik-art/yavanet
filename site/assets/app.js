/* Yavanet – client script: ουρανός, stories, feed, cookies, φόρμες, εργαλεία, widgets */
(function () {
  "use strict";
  var C = window.YV || { lang: "he", t: {} };
  var L = C.t;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var toastTimer;
  function toast(msg) { var el = $("#toast"); if (!el) return; el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 2800); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Ουρανός με βάση την ώρα Αθήνας ---------- */
  function athensHour() { try { return parseInt(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Athens" }).format(new Date()), 10) % 24; } catch (e) { return new Date().getHours(); } }
  function athensTime() { try { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" }).format(new Date()); } catch (e) { return ""; } }
  var SKY = { dawn: "linear-gradient(180deg,#3B4F7A 0%,#C77D8A 55%,#F2B880 100%)", day: "linear-gradient(180deg,#0E5C8C 0%,#2A8BC4 55%,#7CC3E8 100%)", dusk: "linear-gradient(180deg,#2B2352 0%,#B5487A 50%,#F0A04B 100%)", night: "linear-gradient(180deg,#040B1A 0%,#0B1E3A 60%,#16345C 100%)" };
  var PH = { he: { dawn: "זריחה באתונה", day: "יום באתונה", dusk: "שקיעה באתונה", night: "לילה באתונה" }, en: { dawn: "Sunrise in Athens", day: "Daytime in Athens", dusk: "Sunset in Athens", night: "Night in Athens" } };
  function phase(h) { if (h >= 5 && h < 8) return "dawn"; if (h >= 8 && h < 18) return "day"; if (h >= 18 && h < 21) return "dusk"; return "night"; }
  function paintSky() {
    var sky = $("#sky"); if (!sky) return;
    var h = athensHour(), p = phase(h);
    sky.style.background = SKY[p];
    document.documentElement.classList.toggle("night", h >= 21 || h < 6);
    var m = $("#skymeta"); if (m) m.textContent = PH[C.lang][p] + " · " + athensTime();
    var cv = $("#stars"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), r = cv.getBoundingClientRect();
    cv.width = r.width; cv.height = r.height; ctx.clearRect(0, 0, cv.width, cv.height);
    if (p !== "night" && p !== "dusk") return;
    var n = p === "night" ? 70 : 18, seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < n; i++) { ctx.fillStyle = "rgba(255,255,255," + (0.35 + rnd() * 0.6) + ")"; ctx.beginPath(); ctx.arc(rnd() * cv.width, rnd() * cv.height * 0.8, rnd() * 1.4 + 0.3, 0, 6.3); ctx.fill(); }
  }
  paintSky(); window.addEventListener("resize", paintSky); setInterval(paintSky, 60000);

  /* ---------- Feed & Stories (δεδομένα από τη σελίδα) ---------- */
  var DATA = null;
  try { var dj = $("#yv-data"); if (dj) DATA = JSON.parse(dj.textContent); } catch (e) { }
  function lockScroll(on) { document.body.style.overflow = on ? "hidden" : ""; }
  function loadData(cb) {
    if (DATA) return cb(DATA);
    fetch((C.lang === "he" ? "" : "/en") + "/feed.json").then(function (r) { return r.json(); }).then(function (d) { DATA = d; cb(d); }).catch(function () { });
  }
  function openFeed() {
    loadData(function (d) {
      var f = $("#feed");
      f.innerHTML = '<button class="close" type="button" data-close-feed aria-label="' + esc(L.closeLbl) + '">✕</button>' + d.feed.map(function (a) {
        return '<section class="slide"><div class="bg">' + a.art + '</div><div class="shade"></div><div class="txt"><span class="kicker" style="color:#F0B650">' + esc(a.kicker) + '</span><h2>' + esc(a.title) + '</h2><p style="margin:0;opacity:.9">' + esc(a.dek) + '</p><a class="btn gold" style="justify-self:start" href="' + a.url + '">' + esc(L.readMore) + '</a></div></section>';
      }).join("");
      f.hidden = false; f.scrollTop = 0; lockScroll(true);
    });
  }
  function closeFeed() { var f = $("#feed"); if (f) f.hidden = true; lockScroll(false); }

  var sTimer, sIdx = 0, sSlides = [];
  function openStory(i) { loadData(function (d) { sSlides = d.stories[i].slides; sIdx = 0; $("#sv").hidden = false; lockScroll(true); showSlide(); }); }
  function showSlide() {
    clearTimeout(sTimer);
    var sv = $("#sv");
    if (sIdx < 0) sIdx = 0;
    if (sIdx >= sSlides.length) return closeStory();
    var s = sSlides[sIdx];
    sv.innerHTML = '<div class="bars">' + sSlides.map(function (_, k) { return '<i><b style="width:' + (k < sIdx ? 100 : 0) + '%"></b></i>'; }).join("") + '</div><button class="close" type="button" data-close-story aria-label="' + esc(L.closeLbl) + '">✕</button>' + (s.img ? '<div class="bg" style="background-image:url(&quot;' + s.img.replace(/"/g, '%22') + '&quot;)"></div>' : '') + '<div class="stage' + (s.img ? ' ph' : '') + '"><span class="kicker" style="color:#F0B650">' + esc(s.kicker) + '</span><h3>' + esc(s.text) + '</h3>' + (s.url ? '<a class="btn gold" href="' + s.url + '">' + esc(L.readMore) + '</a>' : '') + '' + (s.credit ? '<small class="cr">' + esc(s.credit) + '</small>' : '') + '<button class="tap" type="button" style="inset-inline-start:0" data-story-prev aria-label="' + esc(L.prev) + '"></button><button class="tap" type="button" style="inset-inline-end:0" data-story-next aria-label="' + esc(L.next) + '"></button></div>';
    var bar = sv.querySelectorAll(".bars b")[sIdx];
    requestAnimationFrame(function () { bar.style.transition = "width 5s linear"; bar.style.width = "100%"; });
    sTimer = setTimeout(function () { sIdx++; showSlide(); }, 5000);
  }
  function closeStory() { clearTimeout(sTimer); var sv = $("#sv"); if (sv) sv.hidden = true; lockScroll(false); }

  /* ---------- Cookies & consent ----------
     GA4 σε «Consent Mode»: φορτώνει πάντα, αλλά ΧΩΡΙΣ cookies και αναγνωριστικά μέχρι να πατήσει κάποιος «Αποδοχή».
     Χωρίς συγκατάθεση στέλνει μόνο ανώνυμα σήματα, ώστε το Analytics να εκτιμά σωστά την επισκεψιμότητα.
     Το Clarity (καταγραφή συμπεριφοράς) φορτώνει ΜΟΝΟ μετά από συγκατάθεση. */
  var loaded = {};
  function loadGA() {
    if (!C.ga4 || loaded.ga) return; loaded.ga = true;
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.ga4; document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", C.ga4, { anonymize_ip: true, content_group: C.grp || "", site_language: C.lang });
  }
  function applyConsent(c) {
    gtag("consent", "update", { analytics_storage: c.stats ? "granted" : "denied", ad_storage: c.ads ? "granted" : "denied", ad_user_data: c.ads ? "granted" : "denied", ad_personalization: c.ads ? "granted" : "denied" });
    loadGA();
    if (c.stats && C.clarity && !loaded.cl) {
      loaded.cl = true;
      (function (c2, l, a, r, i) { c2[a] = c2[a] || function () { (c2[a].q = c2[a].q || []).push(arguments); }; var t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i; var y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, "clarity", "script", C.clarity);
      window.clarity && window.clarity("consent");
    }
  }
  function ckSave(c) {
    c.ts = new Date().toISOString(); c.v = 1;
    store("yv-consent", JSON.stringify(c));
    $("#cookie").hidden = true; applyConsent(c); toast(L.ckSaved);
    try { fetch("/api/consent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(c), keepalive: true }); } catch (e) { }
  }
  var saved = null; try { saved = JSON.parse(store("yv-consent") || "null"); } catch (e) { }
  if (saved) applyConsent(saved); else { loadGA(); if ($("#cookie")) $("#cookie").hidden = false; }

  /* Μετρήσεις συμπεριφοράς: κλικ σε banner, φόρμες, κοινοποιήσεις, γλώσσα (στέλνονται μόνο αν υπάρχει συγκατάθεση) */
  function track(name, params) { try { if (loaded.ga) gtag("event", name, params || {}); } catch (e) { } }

  /* ---------- Clicks ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("button, a"); if (!el) return;
    if (el.hasAttribute("data-push")) { e.preventDefault(); return togglePush(); }
    if (el.hasAttribute("data-feed")) { e.preventDefault(); return openFeed(); }
    if (el.hasAttribute("data-close-feed")) return closeFeed();
    if (el.hasAttribute("data-story")) return openStory(parseInt(el.getAttribute("data-story"), 10));
    if (el.hasAttribute("data-close-story")) return closeStory();
    if (el.hasAttribute("data-story-next")) { sIdx++; return showSlide(); }
    if (el.hasAttribute("data-story-prev")) { sIdx--; return showSlide(); }
    if (el.hasAttribute("data-cookie-settings")) { $("#cookie").hidden = false; return; }
    if (el.id === "ck-all") return ckSave({ stats: true, ads: true });
    if (el.id === "ck-none") return ckSave({ stats: false, ads: false });
    if (el.id === "ck-set") { var pr = $("#ck-prefs"); if (pr.hidden) { pr.hidden = false; el.textContent = L.ckSave; } else ckSave({ stats: $("#ck-stats").checked, ads: $("#ck-ads").checked }); return; }
    if (el.hasAttribute("data-share")) {
      var su = location.href.split("#")[0], st = document.title;
      if (navigator.share) { navigator.share({ title: st, url: su }).catch(function () { }); }
      else { window.open("https://wa.me/?text=" + encodeURIComponent(st + " " + su), "_blank", "noopener"); }
      track("share", { method: navigator.share ? "native" : "whatsapp" }); return;
    }
    if (el.hasAttribute("data-fbpost")) {
      var ft = el.getAttribute("data-fbpost"), fu = el.getAttribute("data-fburl");
      try { navigator.clipboard.writeText(ft).then(function () { toast(L.copied); }, function () { }); } catch (e3) { }
      window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(fu), "_blank", "noopener");
      track("share", { method: "facebook_post" }); return;
    }
    if (el.hasAttribute("data-copy")) {
      var u = el.getAttribute("data-copy");
      try { navigator.clipboard.writeText(u).then(function () { toast(L.copied); }, function () { toast(u); }); } catch (e2) { toast(u); }
      track("share", { method: "copy" }); return;
    }
    if (el.hasAttribute("data-toggle")) { var tg = document.getElementById(el.getAttribute("data-toggle")); if (tg) tg.hidden = !tg.hidden; return; }
    if (el.hasAttribute("data-listen")) return speak();
    if (el.closest(".ad")) track("ad_click", { placement: "house" });
    if (el.classList.contains("wa") || el.classList.contains("wafloat")) track("whatsapp_click");
    if (el.closest(".lang")) track("language_switch", { to: el.getAttribute("hreflang") });
    if (el.closest(".fl")) track("flight_click", { destination: (el.querySelector(".fl-d b") || {}).textContent || "" });
    if (el.closest(".fteaser")) track("flight_teaser_click");
    if (el.closest(".sfteaser")) track("sf_teaser_click");
    if (el.closest("[data-out]")) track("partner_out", { target: el.closest("[data-out]").getAttribute("data-out") });
    if (el.closest("[data-ad]")) track("ad_click", { ad: el.getAttribute("data-ad") });
    if (el.closest(".pcard") || el.closest(".person")) track("partner_click", { partner: ((el.closest(".pcard,.person").querySelector("b") || {}).textContent || "").trim() });
    var href = el.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) track("phone_click");
    if (href.indexOf("mailto:") === 0) track("email_click");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!$("#sv").hidden) closeStory(); else if (!$("#feed").hidden) closeFeed(); } });

  /* ---------- Ανάγνωση φωναχτά ---------- */
  var speaking = false;
  function speak() {
    try {
      if (!("speechSynthesis" in window)) return toast(L.noVoice);
      if (speaking) { speechSynthesis.cancel(); speaking = false; return; }
      var art = $("article.full"); if (!art) return;
      var txt = [$("h1", art), $(".dek", art), $(".tldr", art), $(".means", art), $("[data-speak]", art)].filter(Boolean).map(function (n) { return n.textContent; }).join(". ");
      var u = new SpeechSynthesisUtterance(txt); u.lang = C.lang === "he" ? "he-IL" : "en-GB";
      u.onend = function () { speaking = false; };
      speechSynthesis.cancel(); speechSynthesis.speak(u); speaking = true;
    } catch (e) { toast(L.noVoice); }
  }

  /* ---------- Swipe στα άρθρα ---------- */
  var art = $("article.full");
  if (art) {
    var tx = null, ty = null;
    art.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    art.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        var fwd = C.lang === "he" ? dx > 0 : dx < 0;
        var href = art.getAttribute(fwd ? "data-next" : "data-prev");
        if (href) location.href = href;
      }
    }, { passive: true });
    // χρόνος ανάγνωσης και βάθος scroll
    var maxS = 0; window.addEventListener("scroll", function () { var d = document.documentElement; var p = Math.round(100 * (d.scrollTop + innerHeight) / d.scrollHeight); if (p > maxS) { maxS = p; if (p >= 90) track("article_read_complete"); } }, { passive: true });
  }

  /* ---------- Φόρμες (newsletter, επαφές, αναφορές) ---------- */
  $$("form[data-api]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(f), data = {}; fd.forEach(function (v, k) { data[k] = v; });
      var isNl = f.getAttribute("data-kind") === "newsletter";
      var okEmail = /^\S+@\S+\.\S+$/.test(data.email || "");
      if (!okEmail || !data.consent || (!isNl && !data.name)) return toast(isNl ? L.nlBad : L.formBad);
      data.page = location.pathname; data.referrer = document.referrer || ""; if (f.getAttribute("data-source")) data.source = f.getAttribute("data-source");
      var st = $(".status", f); var btn = $("button[type=submit]", f); btn.disabled = true;
      fetch(f.getAttribute("data-api"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; return r.json().catch(function () { return {}; }); })
        .then(function (res) { f.reset(); var msg = isNl ? (res && res.direct ? L.nlOkDirect : L.nlOk) : L.formSent; if (st) st.textContent = msg; toast(msg); track(isNl ? "newsletter_signup" : "generate_lead", { kind: data.kind || "newsletter" }); })
        .catch(function () { if (st) st.textContent = L.formErr; toast(L.formErr); })
        .then(function () { btn.disabled = false; });
    });
  });

  /* ---------- Υπολογιστής κόστους ---------- */
  function money(n, cur) { try { return new Intl.NumberFormat(C.lang === "he" ? "he-IL" : "en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n); } catch (e) { return Math.round(n) + " " + cur; } }
  function calcCost() {
    var tb = $("#c-table"); if (!tb) return;
    var p = Math.max(0, parseFloat($("#c-price").value) || 0), r = Math.max(0, parseFloat($("#c-rate").value) || 0), ag = $("#c-agent").checked, R = L.rows;
    var rows = [[R.tax, p * 0.0309], [R.notary, p * 0.01], [R.lawyer, p * 0.0124], [R.reg, p * 0.006]];
    if (ag) rows.push([R.agent, p * 0.0248]);
    var tot = rows.reduce(function (s, x) { return s + x[1]; }, 0);
    tb.innerHTML = rows.map(function (x) { return "<tr><td>" + esc(x[0]) + "</td><td>" + money(x[1], "EUR") + "</td></tr>"; }).join("") +
      '<tr class="total"><td>' + esc(R.total) + "</td><td>" + money(tot, "EUR") + "</td></tr><tr><td>" + esc(R.grand) + "</td><td>" + money(p + tot, "EUR") + "</td></tr><tr><td>" + esc(R.ils) + "</td><td>" + money((p + tot) * r, "ILS") + "</td></tr>";
  }
  ["c-price", "c-rate", "c-agent"].forEach(function (id) { var el = document.getElementById(id); if (el) el.addEventListener("input", calcCost); });
  calcCost();

  /* ---------- Υπολογιστής Airbnb ---------- */
  function fillYield() { var s = $("#y-region"); if (!s) return; var o = s.options[s.selectedIndex]; $("#y-night").value = o.getAttribute("data-night"); $("#y-occ").value = Math.round(parseFloat(o.getAttribute("data-occ")) * 100); calcYield(); }
  function calcYield() {
    var tb = $("#y-table"); if (!tb) return;
    var price = parseFloat($("#y-price").value) || 0, night = parseFloat($("#y-night").value) || 0, occ = (parseFloat($("#y-occ").value) || 0) / 100;
    var gross = night * 365 * occ, net = gross * 0.65, pct = price ? (net / price) * 100 : 0;
    tb.innerHTML = "<tr><td>" + esc(tb.getAttribute("data-l-gross")) + "</td><td>" + money(gross, "EUR") + "</td></tr><tr><td>" + esc(tb.getAttribute("data-l-net")) + "</td><td>" + money(net, "EUR") + '</td></tr><tr class="total"><td>' + esc(tb.getAttribute("data-l-pct")) + "</td><td>" + pct.toFixed(1) + "%</td></tr>";
  }
  if ($("#y-region")) { $("#y-region").addEventListener("change", fillYield); ["y-price", "y-night", "y-occ"].forEach(function (id) { document.getElementById(id).addEventListener("input", calcYield); }); fillYield(); }

  /* ---------- Widgets: καιρός, ισοτιμία, Σάββατο ---------- */
  var CITIES = [[37.98, 23.73], [40.64, 22.94], [35.34, 25.13], [36.43, 28.22], [37.45, 25.33]];
  var ww = $("#w-weather");
  if (ww) {
    var lat = CITIES.map(function (c) { return c[0]; }).join(","), lon = CITIES.map(function (c) { return c[1]; }).join(",");
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m&timezone=Europe%2FAthens")
      .then(function (r) { return r.json(); })
      .then(function (d) { var arr = Array.isArray(d) ? d : [d]; ww.innerHTML = arr.map(function (x, i) { return "<div><span>" + esc(L.cities[i]) + "</span><span>" + Math.round(x.current.temperature_2m) + "°</span></div>"; }).join(""); })
      .catch(function () { ww.textContent = L.unavailable; });
  }
  /* Σελίδες προορισμών: ζωντανός καιρός + πρόγνωση 5 ημερών (Open-Meteo, χωρίς κλειδί) */
  var dwx = $(".dwx");
  if (dwx) {
    var he = dwx.getAttribute("data-lang") !== "en";
    var WX = function (c) { return c === 0 ? ["☀️", he ? "שמשי" : "Sunny"] : c <= 2 ? ["🌤️", he ? "מעונן חלקית" : "Partly cloudy"] : c === 3 ? ["☁️", he ? "מעונן" : "Cloudy"] : c <= 48 ? ["🌫️", he ? "ערפל" : "Fog"] : c <= 67 ? ["🌧️", he ? "גשם" : "Rain"] : c <= 77 ? ["🌨️", he ? "שלג" : "Snow"] : c <= 82 ? ["🌦️", he ? "ממטרים" : "Showers"] : ["⛈️", he ? "סופות רעמים" : "Thunderstorms"]; };
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + dwx.getAttribute("data-lat") + "&longitude=" + dwx.getAttribute("data-lng") + "&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=Europe%2FAthens")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var w = WX(d.current.weather_code);
        dwx.querySelector(".dwx-now").textContent = w[0] + " " + Math.round(d.current.temperature_2m) + "°";
        dwx.querySelector(".dwx-d").textContent = w[1] + " · " + (he ? "רוח " : "Wind ") + Math.round(d.current.wind_speed_10m) + (he ? " קמ״ש" : " km/h");
        dwx.querySelector(".dwx-days").innerHTML = d.daily.time.map(function (t, i) {
          var day = new Date(t + "T12:00:00Z").toLocaleDateString(he ? "he-IL" : "en-GB", { weekday: "short", timeZone: "UTC" });
          return "<span><i>" + esc(day) + "</i>" + WX(d.daily.weather_code[i])[0] + "<b>" + Math.round(d.daily.temperature_2m_max[i]) + "°</b><small>" + Math.round(d.daily.temperature_2m_min[i]) + "°</small></span>";
        }).join("");
      })
      .catch(function () { dwx.querySelector(".dwx-now").textContent = "–"; });
  }
  /* «Απεργία σήμερα/αύριο;»: υπολογισμός με ώρα Αθήνας, ώστε η απάντηση να είναι σωστή και μετά τα μεσάνυχτα */
  var sd = document.getElementById("st-data");
  if (sd) {
    try {
      var list = JSON.parse(sd.textContent), heS = C.lang !== "en";
      var aday = function (off) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Athens" }).format(new Date(Date.now() + off * 864e5)); };
      [["today", aday(0)], ["tomorrow", aday(1)]].forEach(function (x) {
        var box = document.querySelector('.st-ans[data-day="' + x[0] + '"]'); if (!box) return;
        var hits = list.filter(function (s) { return s.d.indexOf(x[1]) >= 0; });
        box.className = "st-ans " + (hits.length ? "yes" : "no");
        box.querySelector(".st-v").textContent = hits.length ? (heS ? "כן, יש שביתה" : "Yes, there is a strike") : (heS ? "לא, אין שביתה" : "No strike");
        box.querySelector(".st-list").innerHTML = hits.map(function (s) { return '<a href="' + s.u + '">' + esc(s.s.join(" · ")) + ": " + esc(s.t) + "</a>"; }).join("");
      });
    } catch (e) { }
  }
  var fx = $("#w-fx");
  if (fx) {
    // Ισοτιμία: κύρια πηγή ExchangeRate-API (ενημέρωση κάθε μέρα), εναλλακτική Frankfurter (ΕΚΤ)
    function showFx(rate, label) {
      fx.textContent = "€1 = ₪" + rate.toFixed(2);
      $("#w-fx-d").innerHTML = label;
      var cr = $("#c-rate"); if (cr) { cr.value = rate.toFixed(2); calcCost(); }
    }
    fetch("https://open.er-api.com/v6/latest/EUR").then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.result !== "success" || !d.rates || !d.rates.ILS) throw 0;
        var day = new Date(d.time_last_update_unix * 1000).toLocaleDateString(C.lang === "he" ? "he-IL" : "en-GB");
        showFx(d.rates.ILS, '<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Rates By Exchange Rate API</a> · ' + day);
      })
      .catch(function () {
        return fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=ILS").then(function (r) { return r.json(); })
          .then(function (d) { showFx(d.rates.ILS, "ECB · Frankfurter · " + d.date); });
      })
      .catch(function () { fx.textContent = L.unavailable; fx.classList.add("small"); });
  }
  var sh = $("#w-shabbat");
  if (sh) {
    var geo = [[264371, L.athens], [734077, L.thess]];
    Promise.all(geo.map(function (g) { return fetch("https://www.hebcal.com/shabbat?cfg=json&geonameid=" + g[0] + "&M=on&lg=" + (C.lang === "he" ? "he" : "s")).then(function (r) { return r.json(); }); }))
      .then(function (res) {
        sh.innerHTML = res.map(function (d, i) {
          var cand = (d.items || []).find(function (x) { return x.category === "candles"; }), hav = (d.items || []).find(function (x) { return x.category === "havdalah"; });
          function hm(x) { return x ? new Date(x.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" }) : "–"; }
          return "<div><span>" + esc(geo[i][1]) + " · " + esc(L.shabIn) + "</span><span>" + hm(cand) + "</span></div><div><span>" + esc(geo[i][1]) + " · " + esc(L.shabOut) + "</span><span>" + hm(hav) + "</span></div>";
        }).join("");
      }).catch(function () { sh.textContent = L.unavailable; });
  }

  /* ---------- Χάρτης έκτακτων (Leaflet, μόνο στη σελίδα live) ---------- */
  var map = $("#map");
  if (map) {
    var pts = []; try { pts = JSON.parse(map.getAttribute("data-points") || "[]"); } catch (e) { }
    var css = document.createElement("link"); css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
    var js = document.createElement("script"); js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = function () {
      var m = L2(); function L2() { return window.L.map(map, { scrollWheelZoom: false }).setView([38.6, 23.8], 6); }
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
      pts.forEach(function (p) { window.L.circleMarker([p.lat, p.lng], { radius: 9, color: "#D7263D", fillOpacity: .7 }).addTo(m).bindPopup('<a href="' + p.url + '">' + esc(p.title) + "</a>"); });
    };
    document.body.appendChild(js);
  }

  /* ---------- Ειδοποιήσεις στο κινητό (Web Push) ---------- */
  var PT = C.lang === "he"
    ? { on: "הפעלת התראות", active: "✓ ההתראות פעילות", ok: "מעולה! נשלח התראה כשיש שביתה או מבזק חשוב.", off: "ההתראות בוטלו.", denied: "ההתראות חסומות בדפדפן. אפשר לאשר אותן בהגדרות האתר.", ios: "באייפון: לחצו על כפתור השיתוף ← «הוספה למסך הבית», פתחו את יוונט מהמסך הבית ואז הפעילו התראות.", fail: "לא הצלחנו להפעיל התראות כרגע. נסו שוב מאוחר יותר." }
    : { on: "Turn on alerts", active: "✓ Alerts are on", ok: "Done! We will alert you about strikes and important breaking news.", off: "Alerts turned off.", denied: "Notifications are blocked in your browser. You can allow them in the site settings.", ios: "On iPhone: tap Share → “Add to Home Screen”, open Yavanet from the home screen, then turn on alerts.", fail: "Could not turn on alerts right now. Please try again later." };
  var pushOK = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var standalone = window.navigator.standalone || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  function pushLabel(active) { document.querySelectorAll("[data-push]").forEach(function (b) { b.textContent = active ? PT.active : PT.on; b.classList.toggle("on", !!active); }); }
  function b64ToU8(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); var raw = atob(s + "===".slice((s.length + 3) % 4)); var a = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) a[i] = raw.charCodeAt(i); return a; }
  function pushState() { if (!pushOK) return Promise.resolve(null); return navigator.serviceWorker.getRegistration().then(function (r) { return r ? r.pushManager.getSubscription() : null; }).catch(function () { return null; }); }
  function togglePush() {
    if (isIOS && !standalone && !pushOK) return toast(PT.ios);
    if (!pushOK) return toast(PT.fail);
    pushState().then(function (sub) {
      if (sub) {
        return fetch("/api/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "unsubscribe", subscription: sub.toJSON() }) })
          .then(function () { return sub.unsubscribe(); }).then(function () { pushLabel(false); toast(PT.off); track("push_off"); });
      }
      return Notification.requestPermission().then(function (perm) {
        if (perm !== "granted") { toast(PT.denied); return; }
        return Promise.all([navigator.serviceWorker.register("/sw.js").then(function () { return navigator.serviceWorker.ready; }), fetch("/api/push?key=1").then(function (r) { return r.json(); })])
          .then(function (res) {
            if (!res[1] || !res[1].key) throw new Error("no key");
            return res[0].pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(res[1].key) });
          })
          .then(function (s) { return fetch("/api/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "subscribe", subscription: s.toJSON(), lang: C.lang }) }); })
          .then(function (r) { if (!r.ok) throw new Error("save"); pushLabel(true); toast(PT.ok); track("push_on"); });
      });
    }).catch(function () { toast(PT.fail); });
  }
  if (document.querySelector("[data-push]")) {
    if (!pushOK && !isIOS) document.querySelectorAll("[data-push]").forEach(function (b) { b.hidden = true; });
    else pushState().then(function (s) { pushLabel(!!s); });
  }

  /* Διακριτική υπενθύμιση για ειδοποιήσεις: μετά το 2ο άρθρο, αφού ο αναγνώστης κάνει scroll ή περάσουν 10".
     Δεν ξαναεμφανίζεται για 14 μέρες αν πατήσει «Όχι τώρα», ούτε όταν είναι ήδη εγγεγραμμένος. */
  (function () {
    if (!/\/a\//.test(location.pathname)) return;
    if (!pushOK && !isIOS) return;
    if (typeof Notification !== "undefined" && Notification.permission === "denied") return;
    var reads = (+store("yv-reads") || 0) + 1; store("yv-reads", String(reads));
    var last = +store("yv-np-dismiss") || 0;
    if (reads < 2 || Date.now() - last < 14 * 864e5) return;
    var he = C.lang !== "en", shown = false;
    function show() {
      if (shown) return; shown = true;
      var ck = $("#cookie"); if (ck && !ck.hidden) return;
      pushState().then(function (sub) {
        if (sub) return;
        var d = document.createElement("div"); d.className = "npbar"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", he ? "התראות" : "Alerts");
        d.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>' +
          '<p><b>' + (he ? "רוצים לדעת על שביתות ושריפות?" : "Want to know about strikes and fires?") + '</b><span>' + (he ? "התראה לטלפון רק כשזה חשוב. בחינם." : "A phone alert only when it matters. Free.") + '</span></p>' +
          '<button type="button" class="np-yes">' + (he ? "כן, עדכנו אותי" : "Yes, alert me") + '</button>' +
          '<button type="button" class="np-no" aria-label="' + (he ? "לא עכשיו" : "Not now") + '">' + (he ? "לא עכשיו" : "Not now") + '</button>';
        document.body.appendChild(d);
        requestAnimationFrame(function () { d.classList.add("on"); });
        track("push_prompt_shown");
        function close() { d.classList.remove("on"); setTimeout(function () { d.remove(); }, 300); }
        d.querySelector(".np-yes").onclick = function () { track("push_prompt_yes"); close(); togglePush(); };
        d.querySelector(".np-no").onclick = function () { track("push_prompt_no"); store("yv-np-dismiss", String(Date.now())); close(); };
      });
    }
    setTimeout(show, 10000);
    window.addEventListener("scroll", function onS() { var h = document.documentElement; if ((h.scrollTop + innerHeight) / h.scrollHeight > 0.5) { window.removeEventListener("scroll", onS); show(); } }, { passive: true });
  })();


  /* ---------- Μενού & αναζήτηση ---------- */
  (function () {
    var he = (window.YV && YV.lang) !== "en";
    var ms = document.getElementById("msheet"), sr = document.getElementById("srch"), q = document.getElementById("srch-q"), out = document.getElementById("srch-res");
    if (!ms || !sr) return;
    var last = null;
    function open(el) { closeAll(); last = document.activeElement; el.hidden = false; document.body.classList.add("noscroll"); }
    function closeAll() { [ms, sr].forEach(function (e) { e.hidden = true; }); document.body.classList.remove("noscroll"); }
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-menu],[data-menu-close],[data-search],[data-search-close]");
      if (t) {
        e.preventDefault();
        if (t.hasAttribute("data-menu")) { open(ms); ms.querySelector(".ms-x").focus(); }
        else if (t.hasAttribute("data-search")) { open(sr); render(""); setTimeout(function () { q.focus(); }, 30); load(); }
        else { closeAll(); if (last && last.focus) last.focus(); }
        return;
      }
      if (e.target === ms || e.target === sr) closeAll();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && (!ms.hidden || !sr.hidden)) closeAll(); });
    var idx = null, loading = null;
    function load() { if (idx || loading) return loading; loading = fetch((he ? "" : "/en") + "/search.json").then(function (r) { return r.json(); }).then(function (d) { idx = d; loading = null; if (q.value) render(q.value); }).catch(function () { loading = null; }); return loading; }
    function norm(s) { return String(s || "").toLowerCase().replace(/[֑-ׇ]/g, "").replace(/[״׳"'`’‘.,:;!?()\[\]\-–—/]/g, " ").replace(/\s+/g, " ").trim(); }
    function escH(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function hl(s, toks) { var h = escH(s); toks.forEach(function (t) { if (t.length < 2) return; try { h = h.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>"); } catch (e) { } }); return h; }
    var SUG = he ? ["רודוס", "כרתים", "ויזת זהב", "מחירי דירות", "שביתה", "מספר מס", "חבד", "אסי דורון"] : ["Rhodes", "Crete", "Golden Visa", "property prices", "strike", "tax number", "Chabad", "Asi Doron"];
    function render(v) {
      var toks = norm(v).split(" ").filter(Boolean);
      if (!toks.length) { out.innerHTML = '<div class="srch-sug"><span>' + (he ? "חיפושים פופולריים:" : "Popular:") + "</span>" + SUG.map(function (x) { return '<button type="button" data-sug="' + escH(x) + '">' + escH(x) + "</button>"; }).join("") + "</div>"; return; }
      if (!idx) { out.innerHTML = '<div class="srch-empty">' + (he ? "טוען…" : "Loading…") + "</div>"; return; }
      var res = [];
      idx.forEach(function (it) {
        var T = norm(it.t), D = norm(it.d + " " + it.k), all = T + " " + D, sc = 0;
        for (var i = 0; i < toks.length; i++) { var tk = toks[i]; if (all.indexOf(tk) < 0) return; sc += T.indexOf(tk) >= 0 ? 10 : 3; }
        if (it.p) sc += 6; if (it.g) sc += 4; if (it.at) sc += Math.max(0, 3 - (Date.now() - Date.parse(it.at)) / 864e5 / 10);
        res.push([sc, it]);
      });
      res.sort(function (a, b) { return b[0] - a[0]; });
      if (!res.length) { out.innerHTML = '<div class="srch-empty">' + (he ? "לא מצאנו תוצאות. נסו מילה אחרת." : "No results. Try another word.") + "</div>"; return; }
      out.innerHTML = res.slice(0, 14).map(function (r) { var it = r[1]; return '<a class="sr" href="' + it.u + '"><span class="sk">' + escH(it.s) + "</span><b>" + hl(it.t, toks) + "</b>" + (it.d ? '<span class="sd">' + hl(it.d, toks) + "</span>" : "") + "</a>"; }).join("");
      track("search", { search_term: v });
    }
    var tmr; q.addEventListener("input", function () { clearTimeout(tmr); tmr = setTimeout(function () { render(q.value); }, 120); });
    out.addEventListener("click", function (e) { var b = e.target.closest("[data-sug]"); if (b) { q.value = b.getAttribute("data-sug"); render(q.value); q.focus(); } });
    q.addEventListener("keydown", function (e) { if (e.key === "Enter") { var f = out.querySelector(".sr"); if (f) location.href = f.href; } });
  })();


  /* ---------- S.F. Properties showcase ---------- */
  (function () {
    var root = document.querySelector(".sfx"); if (!root) return;
    var rw = root.querySelector(".sfx-rotw");
    if (rw) { var words = []; try { words = JSON.parse(rw.getAttribute("data-words")); } catch (e) { }
      var wi = 0; if (words.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(function () { rw.classList.add("out"); setTimeout(function () { wi = (wi + 1) % words.length; rw.textContent = words[wi]; rw.classList.remove("out"); }, 350); }, 2300); }
    var nums = root.querySelectorAll(".sfx-num");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target);
        var el = e.target, to = parseFloat(el.getAttribute("data-n")), dec = (el.getAttribute("data-n").split(".")[1] || "").length, t0 = null;
        function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec); if (k < 1) requestAnimationFrame(step); }
        requestAnimationFrame(step); setTimeout(function () { el.textContent = to.toFixed(dec); }, 1700); }); }, { threshold: .3 });
      nums.forEach(function (n) { n.textContent = "0"; io.observe(n); });
    }
    var door = root.querySelector(".sfx-door");
    if (door) door.addEventListener("click", function () { door.classList.toggle("shut"); track("sf_click", { target: "door" }); });
    root.querySelectorAll(".sfx-flip").forEach(function (f) { f.addEventListener("click", function (ev) { if (ev.target.closest("a")) return; f.classList.toggle("on"); }); });
    root.querySelectorAll(".sfx-tabs input").forEach(function (r) { r.addEventListener("change", function () { track("sf_pick", { option: r.value }); }); });
    root.addEventListener("click", function (ev) { var a = ev.target.closest("[data-sf]"); if (a) track("sf_click", { target: a.getAttribute("data-sf") }); });
    var sticky = root.querySelector(".sfx-sticky"), hero = root.querySelector(".sfx-hero"), end = root.querySelector(".sfx-end");
    if (sticky && hero && "IntersectionObserver" in window) { var vis = { h: true, e: false };
      var so = new IntersectionObserver(function (es) { es.forEach(function (e) { vis[e.target === hero ? "h" : "e"] = e.isIntersecting; }); sticky.classList.toggle("show", !vis.h && !vis.e); });
      so.observe(hero); if (end) so.observe(end); }
  })();

  /* ---------- PWA ---------- */
  if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () { }); });
})();
