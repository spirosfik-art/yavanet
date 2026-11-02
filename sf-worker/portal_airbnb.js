/* S.F. Properties portal — Airbnb monthly partner commission (addon).
   Served by the sf-portal-addons worker as /__sf/abnb.js.
   - Reads the "Totals" row of each monthly PDF (pdf.js), stores the result
     through the sf_airbnb_comm_set() RPC (amount is computed in the DB from
     airbnb_properties.manager_fee_pct and comm_base).
   - Shows "Προμήθεια <partner>: x €" + Πληρώθηκε/Εκκρεμεί next to each file.
   - Monthly totals per partner at the top of the Airbnb view.
   - Partners only ever receive amount/paid for their own rows (RLS);
     the PDF figures live in airbnb_commission_calc (admin only). */
(function () {
  "use strict";
  if (window.__sfAbnb) return;
  window.__sfAbnb = true;

  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  /* window.__sfAbnbPreview = true -> nothing is written to the database;
     the commission is computed in the browser (used to show the design). */
  var PREVIEW = !!window.__sfAbnbPreview;
  var HANDLER_OF = function (manager) {
    var m = String(manager || "").toLowerCase();
    if (/^(άσι|άση|ασι|asi)/.test(m)) return "asi";
    if (/yaron|γιάρον|γιαρον/.test(m)) return "yaron";
    if (/^(ziv|ζιβ)/.test(m)) return "commission";
    return null;
  };
  function localSet(a) {
    var doc = (docsAll || []).find(function (d) { return String(d.id) === String(a.p_doc); }) || {};
    var p = propById(doc.airbnb_id) || {};
    var pct = +p.manager_fee_pct || 0, amt = null;
    var cb = p.comm_base || (/βλαχογιάννη|vlachogianni/i.test(p.name || "") ? "net_minus_cleaning" : "net");
    p.comm_base = cb;
    if (a.p_net != null) amt = Math.round((cb === "net_minus_cleaning" ? a.p_net - (a.p_clean || 0) : a.p_net) * pct) / 100;
    var prev = comm[a.p_doc] || {};
    return { doc_id: a.p_doc, airbnb_id: doc.airbnb_id, handler: HANDLER_OF(p.manager), period: a.p_period, pct: pct, amount: amt, paid: !!prev.paid };
  }
  function rpcSet(args) {
    if (PREVIEW) return Promise.resolve({ data: localSet(args), error: null });
    return sb().rpc("sf_airbnb_comm_set", args);
  }
  var NAMES = {
    el: { asi: "Άσι", yaron: "Yaron", commission: "Ζιβ" },
    en: { asi: "Asi", yaron: "Yaron", commission: "Ziv" },
    he: { asi: "אסי", yaron: "ירון", commission: "זיו" }
  };
  var MONTHS = {
    el: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    he: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"]
  };
  var TX = {
    el: { comm: "Προμήθεια", paid: "Πληρώθηκε", pending: "Εκκρεμεί", partial: "Μερικώς", reading: "Ανάγνωση PDF…", unread: "Δεν διαβάστηκε το ποσό", edit: "Διόρθωση", save: "Αποθήκευση", cancel: "Άκυρο", month: "Μήνας", net: "Net Payout", clean: "Cleaning Fee", sums: "Προμήθειες συνεργατών ανά μήνα", none: "Δεν υπάρχουν ακόμη μηνιαία αρχεία.", markAll: "Όλα πληρώθηκαν", files: "αρχεία", manual: "χειροκίνητα", saved: "Αποθηκεύτηκε.", fail: "Η αποθήκευση απέτυχε.", formula: "Υπολογισμός" },
    en: { comm: "Commission", paid: "Paid", pending: "Pending", partial: "Partly paid", reading: "Reading PDF…", unread: "Amount could not be read", edit: "Edit", save: "Save", cancel: "Cancel", month: "Month", net: "Net Payout", clean: "Cleaning Fee", sums: "Partner commissions by month", none: "No monthly files yet.", markAll: "Mark all paid", files: "files", manual: "manual", saved: "Saved.", fail: "Saving failed.", formula: "Calculation" },
    he: { comm: "עמלה", paid: "שולם", pending: "ממתין", partial: "שולם חלקית", reading: "קורא PDF…", unread: "לא ניתן לקרוא את הסכום", edit: "תיקון", save: "שמירה", cancel: "ביטול", month: "חודש", net: "Net Payout", clean: "Cleaning Fee", sums: "עמלות שותפים לפי חודש", none: "אין עדיין קבצים חודשיים.", markAll: "סמן הכל כשולם", files: "קבצים", manual: "ידני", saved: "נשמר.", fail: "השמירה נכשלה.", formula: "חישוב" }
  };

  /* ----------------------------------------------------------- helpers */
  function app() { return window.__sfApp; }
  function st() { return app() && app().state; }
  function sb() { return app() && app().sb(); }
  function lang() { var s = st(); return (s && TX[s.lang]) ? s.lang : "el"; }
  function t(k) { return TX[lang()][k]; }
  function isAdmin() { if (PREVIEW && window.__sfAbnbAs) return false; var s = st(); return !!(s && s.role === "admin"); }
  function pname(h) { return (NAMES[lang()][h]) || h || "—"; }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function eur(n) {
    if (n == null || isNaN(n)) return "—";
    var s = Math.abs(n).toFixed(2).split(".");
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (n < 0 ? "−" : "") + s[0] + "," + s[1] + " €";
  }
  function monthLabel(period) {
    if (!period) return "—";
    var p = String(period).split("-");
    return MONTHS[lang()][+p[1] - 1] + " " + p[0];
  }
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "sfab-toast"; el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  /* --------------------------------------------------------------- data */
  var props = null;          // airbnb_properties rows
  var comm = {};             // doc_id -> commission row
  var calc = {};             // doc_id -> calc row (admin only)
  var docsAll = null;        // admin: every airbnb_docs row
  var busy = {};             // doc_id -> true while reading
  var loadedFor = null;

  function loadAll(force) {
    var s = st(), c = sb();
    if (!s || !c || !s.role && !s.myHandler) return Promise.resolve();
    var key = (s.role || "") + "|" + (s.myHandler || "");
    if (!force && loadedFor === key && props) return Promise.resolve();
    loadedFor = key;
    var jobs = [
      c.from("airbnb_properties").select("*").then(function (r) { props = r.data || []; }),
      PREVIEW ? Promise.resolve() : c.from("airbnb_commissions").select("*").then(function (r) {
        comm = {}; (r.data || []).forEach(function (x) { comm[x.doc_id] = x; });
      })
    ];
    if (isAdmin()) {
      if (!PREVIEW) jobs.push(c.from("airbnb_commission_calc").select("*").then(function (r) {
        calc = {}; (r.data || []).forEach(function (x) { calc[x.doc_id] = x; });
      }));
      jobs.push(c.from("airbnb_docs").select("*").then(function (r) { docsAll = r.data || []; }));
    }
    return Promise.all(jobs).then(function () { backfill(); });
  }
  function propById(id) { return (props || []).find(function (p) { return String(p.id) === String(id); }); }

  /* ------------------------------------------------------- PDF reading */
  var pdfReady = null;
  function loadPdfJs() {
    if (pdfReady) return pdfReady;
    pdfReady = new Promise(function (res, rej) {
      if (window.pdfjsLib) return res(window.pdfjsLib);
      var s = document.createElement("script");
      s.src = PDFJS + "pdf.min.js";
      s.onload = function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
        res(window.pdfjsLib);
      };
      s.onerror = rej;
      document.head.appendChild(s);
    });
    return pdfReady;
  }

  /* "1.234,56" / "1,234.56" / "873,76" / "€ 534.00" / "(12,30)" -> number */
  function parseNum(str) {
    var s = String(str).replace(/[€\s ]/g, "").replace(/EUR/i, "");
    var neg = /^\(.*\)$/.test(s) || /^[-−–]/.test(s);
    s = s.replace(/[()−–+-]/g, "");
    if (!/^\d[\d.,]*$/.test(s)) return null;
    var lc = s.lastIndexOf(","), ld = s.lastIndexOf(".");
    if (lc >= 0 && ld >= 0) {
      var dec = lc > ld ? "," : ".";
      s = s.split(dec === "," ? "." : ",").join("");
      s = s.replace(dec, ".");
    } else if (lc >= 0 || ld >= 0) {
      var sep = lc >= 0 ? "," : ".";
      var parts = s.split(sep);
      /* several separators, or exactly 3 digits after one -> thousands */
      if (parts.length > 2 || parts[parts.length - 1].length === 3) s = parts.join("");
      else s = parts[0] + "." + parts[1];
    }
    var n = parseFloat(s);
    if (isNaN(n)) return null;
    return neg ? -n : n;
  }

  /* group text items into rows (same page, y within tolerance) and merge
     items that touch so "873" "," "76" becomes one token */
  function rowsOf(items) {
    var rows = [];
    items.forEach(function (it) {
      if (!it.str || !it.str.trim()) return;
      var y = it.transform[5], x = it.transform[4];
      var row = rows.find(function (r) { return Math.abs(r.y - y) < 2.5; });
      if (!row) { row = { y: y, items: [] }; rows.push(row); }
      row.items.push({ x: x, w: it.width || 0, s: it.str });
    });
    rows.forEach(function (r) {
      r.items.sort(function (a, b) { return a.x - b.x; });
      var merged = [];
      r.items.forEach(function (it) {
        var last = merged[merged.length - 1];
        if (last && it.x - (last.x + last.w) < 1.2 && /[\d.,€]$/.test(last.s) && /^[\d.,€]/.test(it.s)) {
          last.s += it.s; last.w = it.x + it.w - last.x;
        } else merged.push({ x: it.x, w: it.w, s: it.s });
      });
      r.items = merged;
    });
    rows.sort(function (a, b) { return b.y - a.y; });
    return rows;
  }

  function findTotals(pages) {
    for (var p = 0; p < pages.length; p++) {
      var rows = pages[p];
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var k = r.items.findIndex(function (it) { return /^\s*totals?\b/i.test(it.s); });
        if (k < 0) continue;
        var nums = [];
        var first = r.items[k].s.replace(/^\s*totals?:?/i, "").trim();
        if (first) first.split(/\s+/).forEach(function (tok) { var n = parseNum(tok); if (n != null) nums.push({ n: n, x: r.items[k].x, raw: tok }); });
        r.items.slice(k + 1).forEach(function (it) {
          it.s.trim().split(/\s{2,}/).forEach(function (tok) {
            var n = parseNum(tok);
            if (n != null) nums.push({ n: n, x: it.x + it.w / 2, raw: tok });
          });
        });
        /* header positions (column titles may wrap over 2-3 lines) */
        var head = {};
        rows.forEach(function (hr) {
          hr.items.forEach(function (it) {
            var s = it.s.toLowerCase();
            if (s.indexOf("net payout") >= 0 && head.net == null) head.net = it.x + it.w / 2;
            if (s.indexOf("cleaning") >= 0 && head.clean == null) head.clean = it.x + it.w / 2;
          });
        });
        return { nums: nums, head: head };
      }
    }
    return null;
  }

  function pickByHeader(nums, x) {
    if (x == null || !nums.length) return null;
    var best = null, bd = 1e9;
    nums.forEach(function (o) { var d = Math.abs(o.x - x); if (d < bd) { bd = d; best = o; } });
    return best ? best.n : null;
  }

  function detectPeriod(text, fileName) {
    var en = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    var gr = ["ιαν", "φεβ", "μαρ", "απρ", "μαι", "ιουν", "ιουλ", "αυγ", "σεπ", "οκτ", "νοε", "δεκ"];
    function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    var srcs = [norm(fileName), norm(text)];
    for (var i = 0; i < srcs.length; i++) {
      var s = srcs[i];
      var m = s.match(/(?:^|[^a-z])(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)[a-z]*[\s._\-\/,]*(20\d\d)/);
      if (m) return m[2] + "-" + String(en.indexOf(m[1].slice(0, 3)) + 1).padStart(2, "0") + "-01";
      m = s.match(/(ιαν|φεβ|μαρ|απρ|μαι|ιουν|ιουλ|αυγ|σεπ|οκτ|νοε|δεκ)[α-ω]*[\s._\-\/,]*(20\d\d)/);
      if (m) return m[2] + "-" + String(gr.indexOf(m[1]) + 1).padStart(2, "0") + "-01";
      m = s.match(/(?:^|[^0-9])(20\d\d)[\-_. ](0?[1-9]|1[0-2])(?![0-9])/);
      if (m) return m[1] + "-" + String(+m[2]).padStart(2, "0") + "-01";
    }
    /* most common month among dd/mm/yyyy dates in the statement */
    var cnt = {}, re = /\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d\d)\b/g, mm;
    while ((mm = re.exec(text))) {
      var mo = +mm[2]; if (mo < 1 || mo > 12) continue;
      var key = mm[3] + "-" + String(mo).padStart(2, "0") + "-01";
      cnt[key] = (cnt[key] || 0) + 1;
    }
    var best = null; Object.keys(cnt).forEach(function (k) { if (!best || cnt[k] > cnt[best]) best = k; });
    return best;
  }

  async function readPdf(blob, fileName) {
    var lib = await loadPdfJs();
    var buf = await blob.arrayBuffer();
    var doc = await lib.getDocument({ data: buf }).promise;
    var pages = [], text = "";
    for (var i = 1; i <= doc.numPages; i++) {
      var pg = await doc.getPage(i);
      var tc = await pg.getTextContent();
      pages.push(rowsOf(tc.items));
      text += tc.items.map(function (x) { return x.str; }).join(" ") + "\n";
    }
    var tot = findTotals(pages);
    var out = { period: detectPeriod(text, fileName), net: null, clean: null, raw: null };
    if (!tot) return out;
    var ns = tot.nums.map(function (o) { return o.n; });
    out.raw = { totals: tot.nums.map(function (o) { return o.raw; }), head: tot.head };
    if (ns.length === 9) { out.net = ns[2]; out.clean = ns[5]; }
    else {
      out.net = pickByHeader(tot.nums, tot.head.net);
      out.clean = pickByHeader(tot.nums, tot.head.clean);
    }
    return out;
  }

  function fallbackPeriod(doc) {
    var d = doc.uploaded_at ? new Date(doc.uploaded_at) : new Date();
    d = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-01";
  }

  async function processDoc(doc) {
    if (!doc || busy[doc.id] || comm[doc.id]) return;
    busy[doc.id] = true; paintSoon();
    var res = { period: null, net: null, clean: null, raw: null };
    try {
      if (/\.pdf$/i.test(doc.file_name || doc.file_path || "")) {
        var dl = await sb().storage.from("airbnb-docs").download(doc.file_path);
        if (dl.error) throw dl.error;
        res = await readPdf(dl.data, doc.file_name);
      }
    } catch (e) { console.warn("[sfab] read failed", doc.file_name, e); }
    try {
      var r = await rpcSet({
        p_doc: doc.id, p_period: res.period || fallbackPeriod(doc),
        p_net: res.net, p_clean: res.clean, p_source: res.net == null ? "unread" : "pdf", p_raw: res.raw
      });
      if (r.error) throw r.error;
      if (r.data) comm[doc.id] = r.data;
      if (isAdmin()) {
        calc[doc.id] = { doc_id: doc.id, net_payout: res.net, cleaning_fee: res.clean, source: res.net == null ? "unread" : "pdf" };
      }
    } catch (e) { console.warn("[sfab] save failed", e); }
    delete busy[doc.id];
    paintSoon();
  }

  /* admin: read every file that has no commission row yet (one at a time) */
  var backfilling = false;
  async function backfill() {
    if (!isAdmin() || backfilling || !docsAll) return;
    backfilling = true;
    try {
      for (var i = 0; i < docsAll.length; i++) {
        if (!comm[docsAll[i].id]) await processDoc(docsAll[i]);
      }
    } finally { backfilling = false; }
  }

  /* ------------------------------------------------------------ actions */
  async function setPaid(ids, paid) {
    if (!isAdmin()) return;
    if (PREVIEW) { ids.forEach(function (id) { if (comm[id]) comm[id].paid = paid; }); paint(); return; }
    var r = await sb().from("airbnb_commissions")
      .update({ paid: paid, paid_at: paid ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
      .in("doc_id", ids).select();
    if (r.error) { toast(t("fail")); return; }
    (r.data || []).forEach(function (x) { comm[x.doc_id] = x; });
    paint();
  }
  async function saveManual(docId, period, net, clean) {
    var r = await rpcSet({
      p_doc: docId, p_period: period, p_net: net, p_clean: clean, p_source: "manual", p_raw: null
    });
    if (r.error) { toast(t("fail")); return false; }
    comm[docId] = r.data;
    calc[docId] = { doc_id: docId, net_payout: net, cleaning_fee: clean, source: "manual" };
    toast(t("saved"));
    paint();
    return true;
  }

  /* ------------------------------------------------------------ painting */
  var editing = null; // doc id with the edit form open

  function rowHtml(docId, aid) {
    var c = comm[docId], p = propById(aid) || {};
    var who = pname(c && c.handler);
    if (busy[docId] && !c) return '<div class="sfab-line"><span class="sfab-muted">' + t("reading") + "</span></div>";
    if (!c) return isAdmin() ? '<div class="sfab-line"><span class="sfab-muted">' + t("reading") + "</span></div>" : "";
    var k = calc[docId] || {};
    var html = '<div class="sfab-line">';
    html += '<span class="sfab-month">' + esc(monthLabel(c.period)) + "</span>";
    if (c.amount == null) {
      html += '<span class="sfab-warn">' + t("unread") + "</span>";
    } else {
      html += '<span class="sfab-amt">' + t("comm") + " " + esc(who) + ": <b>" + eur(+c.amount) + "</b></span>";
    }
    if (c.amount != null) {
      if (isAdmin()) {
        html += '<button type="button" class="sfab-pay' + (c.paid ? " is-paid" : "") + '" data-sfab-pay="' + esc(docId) + '">' + (c.paid ? "✓ " + t("paid") : t("pending")) + "</button>";
      } else {
        html += '<span class="sfab-pay sfab-ro' + (c.paid ? " is-paid" : "") + '">' + (c.paid ? "✓ " + t("paid") : t("pending")) + "</span>";
      }
    }
    if (isAdmin()) html += '<button type="button" class="sfab-edit" data-sfab-edit="' + esc(docId) + '">' + t("edit") + "</button>";
    html += "</div>";
    if (isAdmin() && c.amount != null && k.net_payout != null) {
      var base = p.comm_base === "net_minus_cleaning"
        ? "(" + eur(+k.net_payout) + " − " + eur(+(k.cleaning_fee || 0)) + ")"
        : eur(+k.net_payout);
      html += '<div class="sfab-formula">' + esc(String(+c.pct)) + "% × " + base + (k.source === "manual" ? " · " + t("manual") : "") + "</div>";
    }
    if (isAdmin() && (editing === docId || c.amount == null)) {
      var needClean = p.comm_base === "net_minus_cleaning";
      html += '<form class="sfab-form" data-sfab-form="' + esc(docId) + '">' +
        "<label>" + t("month") + '<input type="month" name="m" value="' + esc(String(c.period || "").slice(0, 7)) + '" required></label>' +
        "<label>" + t("net") + '<input type="text" inputmode="decimal" name="net" value="' + (k.net_payout != null ? String(k.net_payout).replace(".", ",") : "") + '" placeholder="0,00" required></label>' +
        (needClean ? "<label>" + t("clean") + '<input type="text" inputmode="decimal" name="clean" value="' + (k.cleaning_fee != null ? String(k.cleaning_fee).replace(".", ",") : "") + '" placeholder="0,00" required></label>' : "") +
        '<div class="sfab-form-btns"><button type="submit" class="sfab-save">' + t("save") + "</button>" +
        (c.amount != null ? '<button type="button" class="sfab-cancel" data-sfab-cancel="1">' + t("cancel") + "</button>" : "") + "</div></form>";
    }
    return html;
  }

  function paintDocs() {
    var root = document.getElementById("airbnbDocsRoot");
    if (!root) return;
    var aid = root.getAttribute("data-aid");
    root.querySelectorAll("[data-airbnb-doc-row]").forEach(function (row) {
      var id = row.getAttribute("data-airbnb-doc-row");
      var box = row.nextElementSibling;
      if (!box || !box.classList.contains("sfab-box") || box.getAttribute("data-for") !== id) {
        box = document.createElement("div");
        box.className = "sfab-box";
        box.setAttribute("data-for", id);
        row.parentNode.insertBefore(box, row.nextSibling);
      }
      if (box.contains(document.activeElement) && box.querySelector("form")) return; // don't wipe a form being typed in
      var h = rowHtml(id, aid);
      if (box.__h !== h) { box.innerHTML = h; box.__h = h; }
      /* a file we have not seen yet (just uploaded): read it now */
      if (!comm[id] && !busy[id]) {
        var path = (row.querySelector("[data-airbnb-doc-path]") || {}).getAttribute && row.querySelector("[data-airbnb-doc-path]").getAttribute("data-airbnb-doc-path");
        var name = (row.querySelector(".doc-row-name") || {}).textContent;
        var d = { id: id, file_path: path, file_name: name, airbnb_id: aid, uploaded_at: new Date().toISOString() };
        if (docsAll && !docsAll.some(function (x) { return String(x.id) === String(id); })) docsAll.push(d);
        processDoc(d);
      }
    });
  }

  function monthGroups() {
    var g = {};
    Object.keys(comm).forEach(function (id) {
      var c = comm[id];
      if (PREVIEW && window.__sfAbnbAs && c.handler !== window.__sfAbnbAs) return;
      if (!c.period || c.amount == null) return;
      var key = c.period + "|" + (c.handler || "");
      if (!g[key]) g[key] = { period: c.period, handler: c.handler, sum: 0, n: 0, paid: 0, ids: [] };
      g[key].sum += +c.amount; g[key].n++; if (c.paid) g[key].paid++; g[key].ids.push(c.doc_id);
    });
    return Object.keys(g).map(function (k) { return g[k]; })
      .sort(function (a, b) { return a.period < b.period ? 1 : a.period > b.period ? -1 : String(a.handler).localeCompare(String(b.handler)); });
  }

  function paintSummary() {
    var s = st();
    if (!s || s.view !== "airbnbs") return;
    var vr = document.getElementById("viewRoot");
    if (!vr || !vr.querySelector(".view-head")) return;
    var box = document.getElementById("sfab-sum");
    if (!box) {
      box = document.createElement("div");
      box.id = "sfab-sum";
      vr.querySelector(".view-head").insertAdjacentElement("afterend", box);
    }
    var groups = monthGroups();
    var h = '<div class="sfab-sum-title">' + t("sums") + "</div>";
    if (!groups.length) h += '<div class="sfab-muted">' + (props ? t("none") : t("reading")) + "</div>";
    groups.slice(0, 12).forEach(function (g) {
      var stt = g.paid === g.n ? "paid" : g.paid ? "partial" : "pending";
      h += '<div class="sfab-sum-row">' +
        '<span class="sfab-sum-m">' + esc(monthLabel(g.period)) + " – " + esc(pname(g.handler)) + "</span>" +
        '<span class="sfab-sum-v">' + eur(g.sum) + "</span>" +
        '<span class="sfab-badge sfab-' + stt + '">' + (stt === "paid" ? "✓ " : "") + t(stt) + "</span>" +
        (isAdmin() && stt !== "paid" ? '<button type="button" class="sfab-allpaid" data-sfab-all="' + esc(g.ids.join(",")) + '">' + t("markAll") + "</button>" : "") +
        '<span class="sfab-sum-n">' + g.n + " " + t("files") + "</span>" +
        "</div>";
    });
    if (box.__h !== h) { box.innerHTML = h; box.__h = h; }
  }

  function paint() { paintDocs(); paintSummary(); }
  var raf = 0;
  function paintSoon() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; paint(); }); }

  /* ------------------------------------------------------------- events */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sfab-pay]");
    if (b) { e.preventDefault(); e.stopPropagation(); var id = b.getAttribute("data-sfab-pay"); setPaid([id], !(comm[id] && comm[id].paid)); return; }
    b = e.target.closest("[data-sfab-all]");
    if (b) { e.preventDefault(); e.stopPropagation(); setPaid(b.getAttribute("data-sfab-all").split(","), true); return; }
    b = e.target.closest("[data-sfab-edit]");
    if (b) { e.preventDefault(); e.stopPropagation(); var d = b.getAttribute("data-sfab-edit"); editing = editing === d ? null : d; paint(); return; }
    b = e.target.closest("[data-sfab-cancel]");
    if (b) { e.preventDefault(); e.stopPropagation(); editing = null; paint(); return; }
  }, true);
  document.addEventListener("submit", async function (e) {
    var f = e.target.closest && e.target.closest("[data-sfab-form]");
    if (!f) return;
    e.preventDefault(); e.stopPropagation();
    var id = f.getAttribute("data-sfab-form");
    var m = f.elements.m.value, net = parseNum(f.elements.net.value), cl = f.elements.clean ? parseNum(f.elements.clean.value) : null;
    if (!m || net == null || (f.elements.clean && cl == null)) { f.classList.add("sfab-err"); return; }
    if (await saveManual(id, m + "-01", net, cl)) { editing = null; paint(); }
  }, true);

  /* ------------------------------------------------------------- styles */
  var css = document.createElement("style");
  css.textContent = [
    ".sfab-box{margin:-2px 0 8px;padding:8px 10px 9px;border-radius:10px;background:var(--surface-2,rgba(127,127,127,.07));font-size:13px;line-height:1.35}",
    ".sfab-box:empty{display:none}",
    ".sfab-line{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}",
    ".sfab-month{font-size:11px;letter-spacing:.04em;text-transform:uppercase;opacity:.65;min-width:96px}",
    ".sfab-amt b{font-variant-numeric:tabular-nums;font-weight:650}",
    ".sfab-warn{color:#b45309;font-weight:600}",
    ".sfab-muted{opacity:.6}",
    ".sfab-pay{margin-left:auto;border:1px solid #d97706;color:#b45309;background:transparent;border-radius:999px;padding:3px 11px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}",
    ".sfab-pay.is-paid{border-color:#16a34a;color:#15803d;background:rgba(22,163,74,.08)}",
    ".sfab-ro{cursor:default}",
    ".sfab-edit{border:0;background:transparent;color:inherit;opacity:.55;font:inherit;font-size:12px;text-decoration:underline;cursor:pointer;padding:2px 0}",
    ".sfab-formula{margin-top:3px;font-size:11.5px;opacity:.6;font-variant-numeric:tabular-nums}",
    ".sfab-form{display:flex;flex-wrap:wrap;gap:8px 10px;margin-top:8px;align-items:flex-end}",
    ".sfab-form label{display:flex;flex-direction:column;gap:3px;font-size:11px;opacity:.85;flex:1 1 120px}",
    ".sfab-form input{font:inherit;font-size:14px;padding:7px 9px;border:1px solid rgba(127,127,127,.35);border-radius:8px;background:var(--surface,#fff);color:inherit;min-width:0}",
    ".sfab-form.sfab-err input:invalid,.sfab-form.sfab-err input[name=net]{border-color:#dc2626}",
    ".sfab-form-btns{display:flex;gap:8px}",
    ".sfab-save{border:0;border-radius:8px;padding:8px 14px;background:#111;color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer}",
    ".sfab-cancel{border:1px solid rgba(127,127,127,.35);border-radius:8px;padding:8px 12px;background:transparent;color:inherit;font:inherit;font-size:13px;cursor:pointer}",
    "#sfab-sum{margin:6px 0 18px;padding:14px 16px;border:1px solid rgba(127,127,127,.2);border-radius:14px}",
    ".sfab-sum-title{font-size:12px;letter-spacing:.05em;text-transform:uppercase;opacity:.6;margin-bottom:8px}",
    ".sfab-sum-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:8px 0;border-top:1px solid rgba(127,127,127,.14)}",
    ".sfab-sum-row:first-of-type{border-top:0}",
    ".sfab-sum-m{font-weight:600;flex:1 1 210px}",
    ".sfab-sum-v{font-variant-numeric:tabular-nums;font-weight:650}",
    ".sfab-sum-n{font-size:11.5px;opacity:.5;width:100%}",
    ".sfab-badge{border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600}",
    ".sfab-pending{color:#b45309;background:rgba(217,119,6,.1)}",
    ".sfab-partial{color:#1d4ed8;background:rgba(37,99,235,.1)}",
    ".sfab-paid{color:#15803d;background:rgba(22,163,74,.1)}",
    ".sfab-allpaid{border:0;background:transparent;color:inherit;font:inherit;font-size:12px;text-decoration:underline;opacity:.65;cursor:pointer}",
    ".sfab-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#111;color:#fff;padding:9px 16px;border-radius:10px;font-size:13px;z-index:99999}",
    "@media (max-width:640px){.sfab-month{min-width:0;width:100%}.sfab-pay{margin-left:0}.sfab-sum-m{flex-basis:100%}}",
    "[dir=rtl] .sfab-pay{margin-left:0;margin-right:auto}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------------------------------------------------------- lifecycle */
  var mo = new MutationObserver(function () {
    var s = st();
    if (!s || !s.role && !s.myHandler) return;
    var inAirbnb = s.view === "airbnbs" || document.getElementById("airbnbDocsRoot");
    if (!inAirbnb) return;
    if (s.myHandler === "commission") return; // Ziv has no Airbnb section
    loadAll().then(paintSoon);
    paintSoon();
  });
  function start() { mo.observe(document.body, { childList: true, subtree: true }); }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);

  window.__sfAbnbDebug = { readPdf: readPdf, parseNum: parseNum, detectPeriod: detectPeriod, state: function () { return { props: props, comm: comm, calc: calc, docsAll: docsAll }; }, reload: function () { return loadAll(true).then(paint); } };
})();
