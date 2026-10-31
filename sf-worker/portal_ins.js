/* S.F. Properties portal — Ασφάλειες (admin only). Injected by the sf-portal-addons worker. */
(function () {
  if (window.__sfIns) return; window.__sfIns = 1;
  var VIEW = 'insurances', RATE = 0.30;
  var cache = { pol: null, docs: null, loading: false, filter: 'insured', q: '' };
  function ready() { try { return typeof NAV !== 'undefined' && typeof state !== 'undefined' && typeof renderView === 'function' && typeof sbClient !== 'undefined' && typeof visibleNavItems === 'function'; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function eur(n) { return (Math.round((+n || 0) * 100) / 100).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  function fmtD(s) { if (!s) return '—'; var p = String(s).slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function daysTo(s) { if (!s) return null; var d = new Date(String(s).slice(0, 10) + 'T00:00:00'); var t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / 864e5); }
  function css() {
    if (document.getElementById('sfins-css')) return;
    var s = document.createElement('style'); s.id = 'sfins-css';
    s.textContent = '.sfins{max-width:1100px}.sfins-head{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;margin:4px 0 18px}.sfins-head h2{margin:0 0 4px;font-size:22px}.sfins-head p{margin:0;opacity:.7;font-size:14px}' +
      '.sfins-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:18px}.sfins-stat{background:var(--card,#fff);border:1px solid var(--line,rgba(0,0,0,.09));border-radius:14px;padding:14px 16px}.sfins-stat b{display:block;font-size:22px;font-weight:600;margin-bottom:2px}.sfins-stat span{font-size:12px;opacity:.7}' +
      '.sfins-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px}.sfins-seg{display:inline-flex;border:1px solid var(--line,rgba(0,0,0,.12));border-radius:999px;overflow:hidden}.sfins-seg button{border:0;background:transparent;padding:8px 14px;font:inherit;font-size:13px;cursor:pointer;color:inherit}.sfins-seg button.on{background:var(--ink,#15201D);color:#fff}.sfins-bar input[type=search]{flex:1;min-width:180px;border:1px solid var(--line,rgba(0,0,0,.12));border-radius:999px;padding:9px 14px;font:inherit;font-size:14px;background:var(--card,#fff);color:inherit}' +
      '.sfins-list{display:flex;flex-direction:column;gap:10px}.sfins-row{background:var(--card,#fff);border:1px solid var(--line,rgba(0,0,0,.09));border-radius:14px;padding:14px 16px}.sfins-row.on{border-color:rgba(30,91,87,.45);box-shadow:0 1px 0 rgba(30,91,87,.15)}.sfins-top{display:flex;gap:12px;align-items:center}.sfins-top .a{flex:1;min-width:0}.sfins-top .a b{display:block;font-size:15px}.sfins-top .a small{opacity:.65;font-size:12.5px}' +
      '.sfins-chk{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;cursor:pointer;user-select:none;padding:8px 12px;border-radius:999px;border:1px solid var(--line,rgba(0,0,0,.14))}.sfins-chk input{width:18px;height:18px;accent-color:#1E5B57}.sfins-row.on .sfins-chk{background:#1E5B57;color:#fff;border-color:#1E5B57}' +
      '.sfins-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}.sfins-grid label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;letter-spacing:.02em;opacity:.85}.sfins-grid input,.sfins-grid select,.sfins-grid textarea{font:inherit;font-size:14px;padding:8px 10px;border:1px solid var(--line,rgba(0,0,0,.14));border-radius:10px;background:var(--bg,#fff);color:inherit;width:100%;box-sizing:border-box}.sfins-grid .w2{grid-column:span 2}.sfins-grid .w4{grid-column:1/-1}' +
      '.sfins-foot{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px;font-size:13px}.sfins-pill{padding:5px 10px;border-radius:999px;background:rgba(30,91,87,.1);color:#1E5B57;font-weight:600}.sfins-pill.warn{background:rgba(201,128,30,.14);color:#9a5b05}.sfins-pill.bad{background:rgba(190,40,40,.12);color:#a32020}.sfins-docs{display:flex;flex-wrap:wrap;gap:6px;flex:1}.sfins-docs a{font-size:12.5px;padding:5px 10px;border-radius:8px;background:rgba(0,0,0,.05);color:inherit;text-decoration:none;cursor:pointer}.sfins-docs a:hover{background:rgba(0,0,0,.09)}' +
      '.sfins-btn{border:1px solid var(--line,rgba(0,0,0,.16));background:var(--card,#fff);color:inherit;border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;cursor:pointer}.sfins-btn.pri{background:#1E5B57;border-color:#1E5B57;color:#fff}.sfins-saved{font-size:12px;opacity:.6}' +
      '@media(max-width:760px){.sfins-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sfins-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sfins-top{flex-wrap:wrap}}';
    document.head.appendChild(s);
  }
  function load(force) {
    if (cache.loading || (!force && cache.pol)) return Promise.resolve();
    cache.loading = true;
    return Promise.all([
      sbClient.from('insurance_policies').select('*'),
      sbClient.from('property_documents').select('id,property_id,file_path,file_name,created_at').eq('category', 'insurance').order('created_at', { ascending: false })
    ]).then(function (r) {
      if (r[0].error) throw r[0].error; if (r[1].error) throw r[1].error;
      cache.pol = {}; (r[0].data || []).forEach(function (x) { cache.pol[x.property_id] = x; });
      cache.docs = {}; (r[1].data || []).forEach(function (d) { (cache.docs[d.property_id] = cache.docs[d.property_id] || []).push(d); });
    }).finally(function () { cache.loading = false; });
  }
  function polOf(p) {
    var x = cache.pol[p.id];
    if (x) return x;
    return { property_id: p.id, insured: !!(p.insuranceExpiry || (cache.docs[p.id] || []).length), end_date: p.insuranceExpiry || null, _virtual: true };
  }
  function render() {
    css();
    var root = document.getElementById('viewRoot'); if (!root) return;
    if (!cache.pol) { root.innerHTML = '<div class="empty" style="padding-top:80px">Φόρτωση ασφαλειών…</div>'; load().then(render).catch(function (e) { root.innerHTML = '<div class="empty"><b>Σφάλμα</b>' + esc(e.message || e) + '</div>'; }); return; }
    var props = (state.properties || []).slice().sort(function (a, b) { return String(a.address || '').localeCompare(String(b.address || ''), 'el'); });
    var q = cache.q.trim().toLowerCase();
    var ins = props.filter(function (p) { return polOf(p).insured; });
    var net = 0, com = 0, unpaid = 0, soon = 0;
    ins.forEach(function (p) { var x = polOf(p); var n = +x.net_premium || 0; net += n; com += n * RATE; if (!x.commission_paid) unpaid += n * RATE; var d = daysTo(x.end_date); if (d != null && d <= 30) soon++; });
    var show = (cache.filter === 'insured' ? ins : props).filter(function (p) { return !q || (String(p.address || '') + ' ' + (p.ownerName || '') + ' ' + (polOf(p).company || '')).toLowerCase().indexOf(q) > -1; });
    var h = '<div class="sfins"><div class="sfins-head"><div><h2>Ασφάλειες κατοικιών</h2><p>Τσεκάρετε όσα σπίτια έχετε ασφαλίσει και ανεβάστε το συμβόλαιο. Η λήξη μπαίνει αυτόματα και στις Ανανεώσεις.</p></div></div>' +
      '<div class="sfins-stats"><div class="sfins-stat"><b>' + ins.length + '</b><span>ασφαλισμένα σπίτια</span></div><div class="sfins-stat"><b>' + eur(net) + '</b><span>καθαρά ασφάλιστρα / έτος</span></div><div class="sfins-stat"><b>' + eur(com) + '</b><span>προμήθεια 30%</span></div><div class="sfins-stat"><b>' + eur(unpaid) + '</b><span>προμήθεια που δεν έχει πληρωθεί' + (soon ? ' · ' + soon + ' λήγουν σε ≤30 μέρες' : '') + '</span></div></div>' +
      '<div class="sfins-bar"><div class="sfins-seg"><button type="button" data-f="insured" class="' + (cache.filter === 'insured' ? 'on' : '') + '">Ασφαλισμένα (' + ins.length + ')</button><button type="button" data-f="all" class="' + (cache.filter === 'all' ? 'on' : '') + '">Όλα τα ακίνητα (' + props.length + ')</button></div><input type="search" placeholder="Αναζήτηση διεύθυνσης, ιδιοκτήτη, εταιρείας…" value="' + esc(cache.q) + '" data-q></div><div class="sfins-list">';
    if (!show.length) h += '<div class="empty"><b>' + (cache.filter === 'insured' ? 'Δεν υπάρχουν ακόμα ασφαλισμένα σπίτια' : 'Δεν βρέθηκαν ακίνητα') + '</b>' + (cache.filter === 'insured' ? 'Πατήστε «Όλα τα ακίνητα» και τσεκάρετε όσα έχετε ασφαλίσει.' : '') + '</div>';
    show.forEach(function (p) {
      var x = polOf(p), on = !!x.insured, docs = cache.docs[p.id] || [];
      h += '<div class="sfins-row' + (on ? ' on' : '') + '" data-pid="' + esc(p.id) + '"><div class="sfins-top"><div class="a"><b>' + esc(p.address || p.id) + (p.floor ? ' · ' + esc(p.floor) : '') + '</b><small>' + esc(p.ownerName || '') + (p.handler ? ' · ' + esc(p.handler) : '') + '</small></div><label class="sfins-chk"><input type="checkbox" data-k="insured"' + (on ? ' checked' : '') + '> ' + (on ? 'Ασφαλισμένο' : 'Έχει ασφάλεια;') + '</label></div>';
      if (on) {
        var n = +x.net_premium || 0, d = daysTo(x.end_date);
        var st = x.end_date == null ? '<span class="sfins-pill warn">Χωρίς ημερομηνία λήξης</span>' : d < 0 ? '<span class="sfins-pill bad">Έληξε ' + fmtD(x.end_date) + '</span>' : d <= 30 ? '<span class="sfins-pill warn">Λήγει σε ' + d + ' μέρες</span>' : '<span class="sfins-pill">Ενεργή έως ' + fmtD(x.end_date) + '</span>';
        h += '<div class="sfins-grid"><label class="w2">Ασφαλιστική εταιρεία<input data-k="company" value="' + esc(x.company) + '" placeholder="π.χ. NEXT GEN"></label><label>Αρ. συμβολαίου<input data-k="policy_no" value="' + esc(x.policy_no) + '"></label><label>Κάλυψη<select data-k="coverage"><option value=""></option>' + ['Κτίριο', 'Περιεχόμενο', 'Κτίριο & περιεχόμενο'].map(function (o) { return '<option' + (x.coverage === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' +
          '<label>Καθαρό ασφάλιστρο (€)<input type="number" step="0.01" min="0" data-k="net_premium" value="' + (x.net_premium == null ? '' : esc(x.net_premium)) + '"></label><label>Μικτό ασφάλιστρο (€)<input type="number" step="0.01" min="0" data-k="gross_premium" value="' + (x.gross_premium == null ? '' : esc(x.gross_premium)) + '"></label><label>Έναρξη<input type="date" data-k="start_date" value="' + esc(x.start_date || '') + '"></label><label>Λήξη<input type="date" data-k="end_date" value="' + esc(x.end_date || '') + '"></label>' +
          '<label class="w4">Σημειώσεις<input data-k="notes" value="' + esc(x.notes) + '"></label></div>' +
          '<div class="sfins-foot">' + st + '<span class="sfins-pill">Προμήθεια 30%: ' + eur(n * RATE) + '</span><label class="sfins-chk" style="padding:5px 10px"><input type="checkbox" data-k="commission_paid"' + (x.commission_paid ? ' checked' : '') + '> Πληρώθηκε</label>' +
          '<div class="sfins-docs">' + (docs.length ? docs.map(function (dd) { return '<a data-open="' + esc(dd.file_path) + '" title="' + esc(fmtD(dd.created_at)) + '">📄 ' + esc(dd.file_name || 'Συμβόλαιο') + '</a>'; }).join('') : '<span style="opacity:.6">Δεν έχει ανέβει συμβόλαιο</span>') + '</div>' +
          '<button type="button" class="sfins-btn pri" data-up>Ανέβασμα συμβολαίου</button><span class="sfins-saved" data-saved></span></div>';
      }
      h += '</div>';
    });
    h += '</div></div>';
    root.innerHTML = h;
  }
  var timers = {};
  function save(pid, patch, row) {
    var p = (state.properties || []).find(function (z) { return z.id === pid; }) || { id: pid };
    var cur = Object.assign({}, polOf(p)); delete cur._virtual;
    var next = Object.assign(cur, patch, { property_id: pid, updated_at: new Date().toISOString() });
    cache.pol[pid] = next;
    clearTimeout(timers[pid]);
    var badge = row && row.querySelector('[data-saved]'); if (badge) badge.textContent = 'Αποθήκευση…';
    timers[pid] = setTimeout(function () {
      sbClient.from('insurance_policies').upsert(next).then(function (r) {
        if (r.error) throw r.error;
        if ('end_date' in patch || 'insured' in patch) {
          var exp = next.insured ? (next.end_date || null) : null;
          return sbClient.from('properties').update({ insurance_expiry: exp }).eq('id', pid).then(function (r2) { if (r2.error) throw r2.error; p.insuranceExpiry = exp; });
        }
      }).then(function () { var b = document.querySelector('.sfins-row[data-pid="' + CSS.escape(pid) + '"] [data-saved]'); if (b) b.textContent = '✓ Αποθηκεύτηκε'; })
        .catch(function (e) { alert('Δεν αποθηκεύτηκε: ' + (e.message || e)); });
    }, 450);
  }
  function upload(pid) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/pdf,image/*';
    inp.onchange = async function () {
      var file = inp.files && inp.files[0]; if (!file) return;
      var row = document.querySelector('.sfins-row[data-pid="' + CSS.escape(pid) + '"]'); var b = row && row.querySelector('[data-saved]'); if (b) b.textContent = 'Ανέβασμα…';
      try {
        var sess = await sbClient.auth.getSession(); var uid = sess && sess.data && sess.data.session && sess.data.session.user && sess.data.session.user.id;
        var safe = (file.name || 'file').replace(/[^a-zA-Z0-9._\-]+/g, '_').slice(-80) || 'file';
        var path = pid + '/insurance/' + Date.now() + '_' + safe;
        var up = await sbClient.storage.from('property-docs').upload(path, file, { contentType: file.type || undefined }); if (up.error) throw up.error;
        var ins = await sbClient.from('property_documents').insert({ property_id: pid, category: 'insurance', file_path: path, file_name: file.name || safe, uploaded_by: uid || null, uploaded_by_handler: state.myHandler || null }).select().single(); if (ins.error) throw ins.error;
        (cache.docs[pid] = cache.docs[pid] || []).unshift(ins.data);
        try { if (typeof docsCache !== 'undefined') delete docsCache[pid]; } catch (e) {}
        render();
      } catch (e) { alert('Το ανέβασμα απέτυχε: ' + (e.message || e)); if (b) b.textContent = ''; }
    };
    inp.click();
  }
  function bind() {
    document.addEventListener('click', function (ev) {
      if (state.view !== VIEW) return;
      var t = ev.target;
      var f = t.closest && t.closest('.sfins-seg button[data-f]'); if (f) { cache.filter = f.getAttribute('data-f'); render(); return; }
      var o = t.closest && t.closest('[data-open]'); if (o) { ev.preventDefault(); sbClient.storage.from('property-docs').createSignedUrl(o.getAttribute('data-open'), 600).then(function (r) { if (r.error) throw r.error; window.open(r.data.signedUrl, '_blank'); }).catch(function (e) { alert(e.message || e); }); return; }
      var u = t.closest && t.closest('[data-up]'); if (u) { upload(u.closest('.sfins-row').getAttribute('data-pid')); return; }
    });
    document.addEventListener('change', function (ev) {
      if (state.view !== VIEW) return;
      var el = ev.target, k = el.getAttribute && el.getAttribute('data-k'); if (!k) return;
      var row = el.closest('.sfins-row'), pid = row.getAttribute('data-pid'), patch = {};
      if (el.type === 'checkbox') patch[k] = el.checked;
      else if (el.type === 'number') patch[k] = el.value === '' ? null : +el.value;
      else patch[k] = el.value === '' ? null : el.value;
      save(pid, patch, row);
      if (k === 'insured' || k === 'net_premium' || k === 'commission_paid' || k === 'end_date') setTimeout(render, 0);
    });
    document.addEventListener('input', function (ev) {
      if (state.view !== VIEW || !ev.target.hasAttribute || !ev.target.hasAttribute('data-q')) return;
      cache.q = ev.target.value; var pos = ev.target.selectionStart; render(); var i = document.querySelector('.sfins [data-q]'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) {} }
    });
  }
  function boot() {
    if (!ready()) return setTimeout(boot, 250);
    try { if (typeof ICONS !== 'undefined' && !ICONS.shield) ICONS.shield = '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>'; } catch (e) {}
    if (!NAV.some(function (n) { return n.id === VIEW; })) {
      var i = NAV.findIndex(function (n) { return n.id === 'renewals'; });
      NAV.splice(i < 0 ? NAV.length : i + 1, 0, { id: VIEW, label: 'Ασφάλειες', group: 'Οικονομικά', icon: 'shield' });
    }
    var vis = window.visibleNavItems;
    window.visibleNavItems = function () { return vis.apply(this, arguments).filter(function (it) { return it.id !== VIEW || state.role === 'admin'; }); };
    try { if (typeof viewTitleFor === 'function') { var vt = window.viewTitleFor; window.viewTitleFor = function (v) { return v === VIEW ? 'Ασφάλειες' : vt.apply(this, arguments); }; } } catch (e) {}
    var rv = window.renderView;
    window.renderView = function () {
      if (state.view === VIEW) {
        if (state.role !== 'admin') { state.view = 'properties'; return rv.apply(this, arguments); }
        var t = document.getElementById('pageTitle'); if (t) t.textContent = 'Ασφάλειες';
        if (!state.dbLoaded) { var r = document.getElementById('viewRoot'); if (r) r.innerHTML = '<div class="empty" style="padding-top:80px">Φόρτωση δεδομένων…</div>'; return; }
        return render();
      }
      return rv.apply(this, arguments);
    };
    bind();
    try { if (state.role && typeof renderSidebar === 'function') renderSidebar(); } catch (e) {}
  }
  boot();
})();
