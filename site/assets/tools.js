/* Yavanet – εργαλεία σελίδων: /shabbat/, /golden-visa-quiz/, /moving-checklist/, /phrasebook/, /strike-check/
   Φορτώνεται μόνο σε αυτές τις σελίδες (μετά το app.js δεν είναι εγγυημένο, γι' αυτό το track καλείται «τεμπέλικα»). */
(function () {
  "use strict";
  var C = window.YV || { lang: "he" };
  var he = C.lang !== "en";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function track(n, p) { try { if (window.YVtrack) window.YVtrack(n, p || {}); } catch (e) { } }
  function toast(m) { try { if (window.YVtoast) return window.YVtoast(m); } catch (e) { } }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  /* ==================== Ώρες Σαββάτου (αλγόριθμος NOAA) ==================== */
  /*SUN-START*/
  var SUN = (function () {
    var R = Math.PI / 180;
    function jd(y, m, d) { return Date.UTC(y, m - 1, d) / 864e5 + 2440587.5; }
    function solar(T) {
      var L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
      var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
      var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
      var C = Math.sin(M * R) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * R) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * R) * 0.000289;
      var om = 125.04 - 1934.136 * T;
      var lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * R);
      var eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(om * R);
      var dec = Math.asin(Math.sin(eps * R) * Math.sin(lam * R));
      var y = Math.pow(Math.tan(eps * R / 2), 2);
      var eq = 4 / R * (y * Math.sin(2 * L0 * R) - 2 * e * Math.sin(M * R) + 4 * e * y * Math.sin(M * R) * Math.cos(2 * L0 * R) - 0.5 * y * y * Math.sin(4 * L0 * R) - 1.25 * e * e * Math.sin(2 * M * R));
      return { dec: dec, eq: eq };
    }
    // Λεπτά UTC (από τα μεσάνυχτα UTC της ημέρας) για ζενίθ z μοιρών, μετά το μεσημέρι (set) ή πριν (rise)
    function event(y, m, d, lat, lng, z, set) {
      var base = jd(y, m, d), t = 720 - 4 * lng; // πρώτη εκτίμηση: ηλιακό μεσημέρι
      for (var i = 0; i < 3; i++) {
        var s = solar((base + t / 1440 - 2451545) / 36525);
        var c = Math.cos(z * R) / (Math.cos(lat * R) * Math.cos(s.dec)) - Math.tan(lat * R) * Math.tan(s.dec);
        if (c > 1 || c < -1) return null;
        var ha = Math.acos(c) / R;
        t = 720 - 4 * lng - s.eq + (set ? 4 * ha : -4 * ha);
      }
      return Date.UTC(y, m - 1, d) + t * 60000;
    }
    return { event: event };
  })();
  /*SUN-END*/

  (function () {
    var box = $("#shab-app"); if (!box) return;
    var cities = []; try { cities = JSON.parse(box.getAttribute("data-cities")); } catch (e) { return; }
    var TZ = "Europe/Athens";
    function athensParts(ms) { var p = {}; new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; }); return p; }
    function hm(ms) { return ms == null ? "–" : new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(ms)); }
    // Στρογγυλοποίηση: η ώρα του κεριού προς τα κάτω (λεπτό), η έξοδος προς τα πάνω – όπως συνηθίζεται, ώστε να μη «βγαίνει» νωρίτερα
    function floorMin(ms) { return ms == null ? null : Math.floor(ms / 60000) * 60000; }
    function ceilMin(ms) { return ms == null ? null : Math.ceil(ms / 60000) * 60000; }
    var now = Date.now(), p = athensParts(now);
    var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    // Παρασκευή αυτής της εβδομάδας (το Σάββατο δείχνουμε ακόμα το τρέχον Σαββάτο)
    var off = wd === 6 ? -1 : (5 - wd);
    var base = Date.UTC(+p.year, +p.month - 1, +p.day);
    var weeks = [];
    for (var w = 0; w < 5; w++) { var f = new Date(base + (off + 7 * w) * 864e5), s = new Date(base + (off + 7 * w + 1) * 864e5); weeks.push([f, s]); }
    function calc(c, wk) {
      var f = wk[0], s = wk[1];
      var set = SUN.event(f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate(), c.lat, c.lng, 90.833, true);
      var out = SUN.event(s.getUTCFullYear(), s.getUTCMonth() + 1, s.getUTCDate(), c.lat, c.lng, 98.5, true);
      return { cand: set == null ? null : floorMin(set - 18 * 60000), out: ceilMin(out) };
    }
    var loc = he ? "he-IL" : "en-GB";
    function dfmt(d, short) { return d.toLocaleDateString(loc, { day: "numeric", month: short ? "short" : "long", timeZone: "UTC" }); }
    function hebDate(d) { try { return new Intl.DateTimeFormat(he ? "he-u-ca-hebrew" : "en-u-ca-hebrew", { day: "numeric", month: "long", timeZone: "UTC" }).format(d); } catch (e) { return ""; } }
    var L = he ? { in: "הדלקת נרות", out: "צאת השבת", inS: "הדלקת נרות", outS: "צאת השבת", fri: "שישי", sat: "שבת" } : { in: "Candle lighting", out: "Shabbat ends", inS: "Candles", outS: "Ends", fri: "Fri", sat: "Sat" };
    // 1) Αυτή την εβδομάδα σε όλες τις πόλεις
    var now1 = $("#shab-now"), wk0 = weeks[0];
    $("#shab-week").textContent = (he ? "שישי–שבת, " : "Fri–Sat, ") + dfmt(wk0[0]) + " – " + dfmt(wk0[1]);
    now1.innerHTML = cities.map(function (c, i) {
      var t = calc(c, wk0);
      return '<button type="button" class="shc" data-i="' + i + '"><b>' + esc(c.n) + '</b><span><i>🕯️ ' + L.inS + '</i><strong dir="ltr">' + hm(t.cand) + '</strong></span><span><i>✨ ' + L.outS + '</i><strong dir="ltr">' + hm(t.out) + "</strong></span></button>";
    }).join("");
    // 2) 5 εβδομάδες για την επιλεγμένη πόλη
    var sel = $("#shab-city"), tbl = $("#shab-table");
    sel.innerHTML = cities.map(function (c, i) { return '<option value="' + i + '">' + esc(c.n) + "</option>"; }).join("");
    var saved = parseInt(lsGet("yv-shab-city") || "0", 10); if (saved >= 0 && saved < cities.length) sel.value = String(saved);
    function draw() {
      var c = cities[+sel.value || 0];
      tbl.innerHTML = "<thead><tr><th>" + (he ? "תאריך" : "Date") + "</th><th>🕯️ " + L.in + "</th><th>✨ " + L.out + "</th></tr></thead><tbody>" + weeks.map(function (wk, i) {
        var t = calc(c, wk), hd = hebDate(wk[1]);
        return '<tr' + (i === 0 ? ' class="cur"' : "") + "><td><b>" + esc(dfmt(wk[0], true)) + "</b>" + (hd ? "<small>" + esc(hd) + "</small>" : "") + '</td><td dir="ltr">' + hm(t.cand) + '</td><td dir="ltr">' + hm(t.out) + "</td></tr>";
      }).join("") + "</tbody>";
    }
    sel.addEventListener("change", function () { lsSet("yv-shab-city", sel.value); draw(); track("shabbat_city", { city: cities[+sel.value].id }); });
    now1.addEventListener("click", function (e) { var b = e.target.closest(".shc"); if (!b) return; sel.value = b.getAttribute("data-i"); lsSet("yv-shab-city", sel.value); draw(); var t = $("#shab-5"); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
    draw();
    box.hidden = false; var nj = $("#shab-nojs"); if (nj) nj.hidden = true;
  })();
})();
