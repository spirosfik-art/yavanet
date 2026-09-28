import { SITE, SECTIONS, T, LEGAL_PAGES } from "./config.mjs";
import { esc, md, plain } from "./md.mjs";
import { art, SECTION_ART } from "./art.mjs";

export const P = (lang, path) => (lang === "he" ? path : "/en" + path);
export const abs = (p) => SITE.url.replace(/\/$/, "") + p;
export const sec = (slug) => SECTIONS.find((s) => s.slug === slug) || SECTIONS[0];

export function fmtDate(iso, lang) {
  try {
    return new Intl.DateTimeFormat(T[lang].locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" }).format(new Date(iso));
  } catch { return iso; }
}

export function artHTML(a, lang) {
  const img = a.image;
  if (img && img.type === "photo" && img.url) return `<img src="${esc(img.url)}" alt="${esc(img.alt || a[lang].title)}" loading="lazy">`;
  return art((img && img.key) || SECTION_ART[a.section] || "sea", a[lang].title);
}
export function creditHTML(a, lang) {
  const img = a.image;
  if (img && img.type === "photo" && img.credit) return `${esc(img.credit)}${img.creditUrl ? ` · <a href="${esc(img.creditUrl)}" target="_blank" rel="noopener">${esc(img.license || "")}</a>` : ""}`;
  return esc(T[lang].caption);
}

const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  guides: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h6M8 11h6"/></svg>',
  prop: '<svg viewBox="0 0 24 24"><path d="M4 21V9l8-5 8 5v12"/><path d="M9 21v-6h6v6"/></svg>',
  tools: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
};
const WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
const WAVE = (fill) => `<svg class="b" viewBox="0 0 1200 26" preserveAspectRatio="none"><path fill="${fill}" d="M0 14 Q75 2 150 14 T300 14 T450 14 T600 14 T750 14 T900 14 T1050 14 T1200 14 V26 H0Z"/></svg><svg viewBox="0 0 1200 26" preserveAspectRatio="none"><path fill="${fill}" d="M0 16 Q50 8 100 16 T200 16 T300 16 T400 16 T500 16 T600 16 T700 16 T800 16 T900 16 T1000 16 T1100 16 T1200 16 V26 H0Z"/></svg>`;
export const DIVIDER = '<div class="divider" aria-hidden="true"><svg viewBox="0 0 1200 22" preserveAspectRatio="none"><path d="M0 11 Q50 3 100 11 T200 11 T300 11 T400 11 T500 11 T600 11 T700 11 T800 11 T900 11 T1000 11 T1100 11 T1200 11"/></svg></div>';

// Κοινά στοιχεία για όλες τις σελίδες (ορίζονται από το build): επερχόμενη απεργία, Δείκτης Yavanet
export const GLOBAL = { strike: null, madad: false, win: false };
const STRIKE_WORD = { he: "שביתה", en: "Strike" };

export function layout({ lang, title, description, path, altPath, body, jsonld = [], head = "", activeSection = null, activeNav = "home", breaking = null, ogType = "website", noindex = false, image = null }) {
  const t = T[lang];
  const NAME = lang === "he" ? SITE.nameHe : SITE.name;
  const other = lang === "he" ? "en" : "he";
  const heUrl = lang === "he" ? path : altPath;
  const enUrl = lang === "en" ? path : altPath;
  const fullTitle = title ? `${title} | ${NAME}` : `${NAME} · ${t.tagline}`;
  const brk = breaking
    ? `<a class="breaking${breaking.fire ? " fire" : ""}" href="${P(lang, "/a/" + breaking.slug + "/")}"><span class="tag">${esc(t.breakingTag)}</span><span class="txt">${esc(breaking[lang].title)}</span></a>`
    : "";
  const st = GLOBAL.strike;
  const strikeBar = st && !path.includes("/strikes/")
    ? `<a class="strikebar" href="${P(lang, "/strikes/")}"><span class="tag">🚨 ${STRIKE_WORD[lang]} · ${esc(st.when[lang])}</span><span class="txt">${esc(st[lang])}</span></a>`
    : "";
  const navKeys = ["home", "guides", "prop", "tools", "mail"];
  const navHref = { home: P(lang, "/"), guides: P(lang, "/guides/"), prop: P(lang, "/s/real-estate/"), tools: P(lang, "/tools/"), mail: P(lang, "/") + "#newsletter" };
  const nav = navKeys.map((k, i) => `<a href="${navHref[k]}"${activeNav === k ? ' class="on" aria-current="page"' : ""}>${ICONS[k]}<span>${esc(t.nav[i])}</span></a>`).join("");
  const chips = SECTIONS.map((s) => `<a href="${P(lang, "/s/" + s.slug + "/")}"${activeSection === s.slug ? ' aria-current="page"' : ""}>${esc(s[lang])}</a>`).join("");
  const extraChips = [["strikes", lang === "he" ? "🚨 שביתות" : "🚨 Strikes"], ["emergency", lang === "he" ? "🆘 חירום" : "🆘 Emergency"], ["cost-of-living", lang === "he" ? "💶 יוקר המחיה" : "💶 Cost of living"], ...(GLOBAL.win ? [["win", lang === "he" ? "🎁 הגרלה" : "🎁 Giveaway"]] : []), ...(GLOBAL.madad ? [["madad", lang === "he" ? "📊 מדד יוונט" : "📊 Yavanet Index"]] : [])]
    .filter(([k]) => !(path === P(lang, "/") && k !== "win"))
    .map(([k, label]) => `<a class="chip-x" href="${P(lang, "/" + k + "/")}"${activeSection === k ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const legal = LEGAL_PAGES.map((p) => `<a href="${P(lang, "/p/" + p + "/")}">${esc(t.legal[p])}</a>`).join("") + `<button type="button" data-cookie-settings>${esc(t.cookieSettings)}</button>`;
  const cfg = { lang, ga4: SITE.ga4Id, clarity: SITE.clarityId, wa: SITE.whatsappChannel, t: { copied: t.copied, noVoice: t.noVoice, ckSaved: t.ckSaved, ckSave: t.ckSave, nlOk: t.nlOk, nlOkDirect: t.nlOkDirect, nlBad: t.nlBad, formSent: t.formSent, formErr: t.formErr, formBad: t.formBad, loading: t.loading, unavailable: t.unavailable, shabIn: t.shabIn, shabOut: t.shabOut, athens: t.athens, thess: t.thess, readMore: t.readMore, closeLbl: t.closeLbl, next: t.next, prev: t.prev, cities: t.cities, rows: t.rows, yieldGross: t.yieldGross } };
  return `<!doctype html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || t.tagline)}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${abs(path)}">
${heUrl ? `<link rel="alternate" hreflang="he" href="${abs(heUrl)}">` : ""}
${enUrl ? `<link rel="alternate" hreflang="en" href="${abs(enUrl)}">` : ""}
${heUrl ? `<link rel="alternate" hreflang="x-default" href="${abs(heUrl)}">` : ""}
<meta property="og:site_name" content="${NAME}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title || NAME)}">
<meta property="og:description" content="${esc(description || t.tagline)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${esc(image || abs("/og.png"))}">
<meta property="og:locale" content="${lang === "he" ? "he_IL" : "en_GB"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B3A5B">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon-192.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${NAME}" href="${P(lang, "/rss.xml")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Assistant:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="/styles.css">
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
window.YV=${JSON.stringify(cfg)};
</script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
${head}
</head>
<body>
<a class="skip" href="#main">${lang === "he" ? "דלגו לתוכן" : "Skip to content"}</a>
${strikeBar}${brk}
<header class="sky" id="sky">
  <canvas id="stars" aria-hidden="true"></canvas>
  <div class="wrap inner">
    <a class="logo" href="${P(lang, "/")}"><b>${lang === "he" ? "יוו<i>נט</i>" : "Yavan<i>et</i>"}</b><small>${esc(t.tagline)}</small></a>
    <div class="hside">
      <nav class="lang" aria-label="Language">
        <a href="${heUrl || "/"}" hreflang="he" lang="he" aria-current="${lang === "he"}">עב</a>
        <a href="${enUrl || "/en/"}" hreflang="en" lang="en" aria-current="${lang === "en"}">EN</a>
      </nav>
      <div class="skymeta" id="skymeta"></div>
    </div>
    <nav class="tnav" aria-label="${lang === "he" ? "ניווט" : "Navigation"}">${nav}</nav>
  </div>
  <div class="waves" aria-hidden="true">${WAVE("var(--bg)")}</div>
</header>
<div class="wrap"><nav class="chips" aria-label="${esc(t.allSections)}">${chips}${extraChips}</nav></div>
<main class="wrap" id="main">
${body}
<footer>
  <nav aria-label="Legal">${legal}</nav>
  <div>${esc(t.aiNote)}</div>
  <div>${lang === "he" ? "תמונות" : "Photos"}: <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a></div>
  <div>© ${new Date().getFullYear()} ${NAME} · ${esc(SITE.publisher.brand || SITE.publisher[lang])}</div>
</footer>
</main>
<nav class="bnav" aria-label="Main">${nav}</nav>
${SITE.whatsappChannel ? `<a class="wafloat" href="${esc(SITE.whatsappChannel)}" aria-label="WhatsApp" target="_blank" rel="noopener">${WA_SVG}</a>` : ""}
<div class="feed" id="feed" hidden></div>
<div class="sv" id="sv" hidden></div>
<div class="cookie" id="cookie" hidden role="dialog" aria-labelledby="ck-t">
  <b id="ck-t">${esc(t.ckTitle)}</b>
  <span>${esc(t.ckText)} <a href="${P(lang, "/p/cookies/")}">${esc(t.legal.cookies)}</a></span>
  <div class="prefs" id="ck-prefs" hidden>
    <label for="ck-need"><input id="ck-need" type="checkbox" checked disabled>${esc(t.ckNeed)}</label>
    <label for="ck-stats"><input id="ck-stats" type="checkbox">${esc(t.ckStats)}</label>
    <label for="ck-ads"><input id="ck-ads" type="checkbox">${esc(t.ckAds)}</label>
  </div>
  <div class="btns">
    <button type="button" id="ck-all">${esc(t.ckAll)}</button>
    <button type="button" id="ck-none">${esc(t.ckNone)}</button>
    <button type="button" id="ck-set">${esc(t.ckSet)}</button>
  </div>
</div>
<div class="toast" id="toast" hidden role="status"></div>
<script src="/app.js" defer></script>
</body>
</html>`;
}

export function kickerHTML(a, lang) {
  const s = sec(a.section);
  return `<span class="kicker ${s.mark}">${esc(s[lang])}</span>${a.sponsored ? `<span class="spons">${esc(T[lang].sponsored)}</span>` : a.partner ? `<span class="spons">${lang === "he" ? "בשיתוף פעולה" : "In partnership"}</span>` : ""}`;
}
export function heroCard(a, lang) {
  return `<a class="hero" href="${P(lang, "/a/" + a.slug + "/")}"><div class="art">${artHTML(a, lang)}</div><div class="body">${kickerHTML(a, lang)}<h3>${esc(a[lang].title)}</h3><p class="dek">${esc(a[lang].dek)}</p><div class="meta">${fmtDate(a.publishedAt, lang)}</div></div></a>`;
}
export function card(a, lang) {
  return `<a class="card" href="${P(lang, "/a/" + a.slug + "/")}"><div class="art">${artHTML(a, lang)}</div><div>${kickerHTML(a, lang)}<h3>${esc(a[lang].title)}</h3><p>${esc(a[lang].dek)}</p><div class="meta">${fmtDate(a.publishedAt, lang)}</div></div></a>`;
}

export function adBox(lang) {
  const t = T[lang];
  return `<aside class="ad" aria-label="${esc(t.adLabel)}"><span class="lbl">${esc(t.adLabel)}</span><strong>${esc(t.adTitle)}</strong><p>${esc(t.adText)}</p><span class="brand"><img src="/sf-logo-light.png" width="900" height="142" alt="${esc(SITE.ad.brand)}" loading="lazy"><small>${esc(lang === "he" ? SITE.ad.taglineHe : SITE.ad.taglineEn)}</small></span><div class="adrow"><a href="${P(lang, "/advisor/")}">${esc(t.adCta)}</a><span class="admail" dir="ltr">${esc(SITE.ad.email)}</span></div></aside>`;
}

export function newsletterBox(lang, opt = {}) {
  const t = T[lang];
  return `<section class="news" id="${opt.id || "newsletter"}" aria-labelledby="nl-h">
  <h3 id="nl-h">${esc(opt.title || t.nlTitle)}</h3>
  <p style="margin:0">${esc(opt.text || t.nlText)}</p>
  <form data-api="/api/subscribe" data-kind="newsletter"${opt.source ? ` data-source="${esc(opt.source)}"` : ""} novalidate>
    <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input type="hidden" name="lang" value="${lang}">
    <input id="nl-email" name="email" type="email" required autocomplete="email" placeholder="${esc(t.nlPh)}" aria-label="${esc(t.nlPh)}">
    <button class="btn" type="submit">${esc(t.nlBtn)}</button>
    <label class="consent" for="nl-consent" style="flex-basis:100%"><input id="nl-consent" name="consent" type="checkbox" required>${esc(t.nlConsent)}</label>
  </form>
  <div class="btnrow">
    ${SITE.whatsappChannel ? `<a class="btn wa" href="${esc(SITE.whatsappChannel)}" target="_blank" rel="noopener">${esc(t.waJoin)}</a>` : ""}
    ${SITE.telegramChannel ? `<a class="btn ghost" href="${esc(SITE.telegramChannel)}" target="_blank" rel="noopener">${esc(t.tgJoin)}</a>` : ""}
  </div>
</section>`;
}

export function formBox(lang, { id, title, text, kind, fields = [], extra = "" }) {
  const t = T[lang];
  const f = {
    name: `<label for="${id}-name">${esc(t.formName)}<input id="${id}-name" name="name" required autocomplete="name"></label>`,
    email: `<label for="${id}-email">${esc(t.formEmail)}<input id="${id}-email" name="email" type="email" required autocomplete="email"></label>`,
    phone: `<label for="${id}-phone">${esc(t.formPhone)}<input id="${id}-phone" name="phone" type="tel" autocomplete="tel"></label>`,
    area: `<label for="${id}-area">${esc(t.formArea)}<input id="${id}-area" name="area"></label>`,
    budget: `<label for="${id}-budget">${esc(t.formBudget)}<input id="${id}-budget" name="budget" inputmode="numeric"></label>`,
    msg: `<label for="${id}-msg">${esc(t.formMsg)}<textarea id="${id}-msg" name="message" rows="4"></textarea></label>`,
  };
  return `<form class="form" id="${id}" data-api="/api/lead" data-kind="${kind}" novalidate>
  <h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ""}
  <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <input type="hidden" name="lang" value="${lang}"><input type="hidden" name="kind" value="${kind}">${extra}
  ${fields.map((k) => f[k]).join("")}
  <label class="chk" for="${id}-consent"><input id="${id}-consent" name="consent" type="checkbox" required><span>${esc(t.formConsent)} <a href="${P(lang, "/p/privacy/")}">${esc(t.legal.privacy)}</a></span></label>
  <button class="btn" type="submit" style="justify-self:start">${esc(t.formSend)}</button>
  <div class="status" role="status"></div>
</form>`;
}

export function calcBox(lang) {
  const t = T[lang];
  return `<div class="calc" id="calc-cost">
  <div class="row2">
    <label for="c-price">${esc(t.calcPrice)}<input id="c-price" type="number" min="0" step="1000" value="250000" inputmode="numeric"></label>
    <label for="c-rate">${esc(t.calcRate)}<input id="c-rate" type="number" min="0" step="0.01" value="3.47" inputmode="decimal"></label>
  </div>
  <label class="chk" for="c-agent"><input id="c-agent" type="checkbox" checked><span>${esc(t.calcAgent)}</span></label>
  <table id="c-table"></table>
  <p class="fine">${esc(t.calcFine)}</p>
</div>`;
}

export function yieldBox(lang, regions) {
  const t = T[lang];
  return `<div class="calc" id="calc-yield">
  <div class="row2">
    <label for="y-region">${esc(t.yieldRegion)}<select id="y-region">${regions.map((r) => `<option value="${r.id}" data-night="${r.night}" data-occ="${r.occ}">${esc(r[lang])}</option>`).join("")}</select></label>
    <label for="y-price">${esc(t.yieldPrice)}<input id="y-price" type="number" min="0" step="1000" value="250000" inputmode="numeric"></label>
  </div>
  <div class="row2">
    <label for="y-night">${esc(t.yieldNight)} (€)<input id="y-night" type="number" min="0" step="5"></label>
    <label for="y-occ">${esc(t.yieldOcc)} (%)<input id="y-occ" type="number" min="0" max="100" step="1"></label>
  </div>
  <table id="y-table" data-l-gross="${esc(t.yieldGross)}" data-l-net="${esc(t.yieldNet)}" data-l-pct="${esc(t.yieldPct)}"></table>
  <p class="fine">${esc(t.yieldFine)}</p>
</div>`;
}

export function pushBox(lang, big = false) {
  const he = lang === "he";
  return `<div class="widget pushbox${big ? " big" : ""}"><h4>${he ? "🚨 התראות למטיילים" : "🚨 Traveller alerts"}</h4><p class="small">${he ? "שביתה בטיסות או במעבורות? שריפה או מזג אוויר קשה? נשלח התראה ישר לטלפון. בלי אפליקציה, בחינם." : "Flight or ferry strike? Fire or severe weather? We send an alert straight to your phone. No app, free."}</p><button type="button" class="btn gold" data-push>${he ? "🔔 קבלו התראה על שביתות ומבזקים" : "🔔 Get alerts for strikes and breaking news"}</button></div>`;
}

export function partners(lang) {
  const he = lang === "he";
  return `<div class="partners" aria-label="${he ? "שותפים" : "Partners"}">
  <span class="plbl">${he ? "שותפים" : "Partners"}</span>
  <a class="pcard p-sf" href="${P(lang, "/advisor/")}"><span class="pk">${he ? "נדל״ן ביוון" : "Property in Greece"}</span><b>${he ? "קונים דירה ביוון? מלווים אתכם בעברית" : "Buying in Greece? Guidance in Hebrew"}</b><small>${he ? "חיפוש, עורך דין, נוטריון, השכרה וניהול" : "Search, lawyer, notary, rental & management"}</small><img src="/sf-logo-light.png" width="900" height="142" alt="S.F. Properties" loading="lazy"><span class="pgo">${he ? "לשיחה עם יועץ ←" : "Talk to an adviser →"}</span></a>
  <a class="pcard p-yana" href="${P(lang, "/a/athens-with-yana-hebrew-tours-athens/")}"><span class="pk">${he ? "טיולים באתונה" : "Athens tours"}</span><b>${he ? "מטיילים באתונה עם יאנה" : "Athens with Yana"}</b><small>${he ? "טיולי יום, טברנות, יאכטה, אוכל כשר והסעות. הכול בעברית." : "Day tours, tavernas, yacht, kosher food and transfers, in Hebrew."}</small><span class="pgo">${he ? "לפרטים והזמנה ←" : "Details & booking →"}</span></a>
  <a class="pcard p-you" href="mailto:${SITE.ad.email}?subject=${encodeURIComponent(he ? "פרסום ביוונט" : "Advertising on Yavanet")}"><b>${he ? "העסק שלכם כאן?" : "Your business here?"}</b><small>${he ? "הגיעו לישראלים שמתכננים טיול, מעבר או השקעה ביוון." : "Reach Israelis planning a trip, move or investment in Greece."}</small><span class="pgo">${he ? "פרסמו ביוונט ←" : "Advertise on Yavanet →"}</span></a>
</div>`;
}

export function widgets(lang, mostRead, noPush = false) {
  const t = T[lang];
  return `<div class="side">
  ${noPush ? "" : pushBox(lang)}
  <div class="widget most"><h4>${esc(t.mostRead)}</h4><ol>${mostRead.map((a) => `<li><a href="${P(lang, "/a/" + a.slug + "/")}">${esc(a[lang].title)}</a></li>`).join("")}</ol></div>
  <div class="widget"><h4>${esc(t.weather)}</h4><div class="rows" id="w-weather">${esc(t.loading)}</div><div class="small">Open-Meteo</div></div>
  <div class="widget"><h4>${esc(t.fx)}</h4><div class="rate" id="w-fx">…</div><div class="small" id="w-fx-d">ECB · Frankfurter</div></div>
  <div class="widget"><h4>${esc(t.shabbat)}</h4><div class="rows" id="w-shabbat">${esc(t.loading)}</div><div class="small">Hebcal</div></div>
  ${partners(lang)}
</div>`;
}

export function articleBody(a, lang, prev, next) {
  const t = T[lang], c = a[lang], he = lang === "he";
  const url = abs(P(lang, "/a/" + a.slug + "/"));
  const shareRow = (cls = "") => `<div class="share${cls}">
    <a class="btn wa" href="https://wa.me/?text=${encodeURIComponent(c.title + " " + url)}" target="_blank" rel="noopener">${esc(t.shareWa)}</a>
    <a class="btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">${he ? "שתפו בפייסבוק" : "Share on Facebook"}</a>
    <button class="btn ghost" type="button" data-copy="${url}">${esc(t.copy)}</button>`;
  // Οδηγοί: αρίθμηση ενοτήτων και πίνακας περιεχομένων
  let prose = md(c.body), toc = "";
  if (a.guide) {
    let n = 0; const heads = [];
    prose = prose.replace(/<h2>(.*?)<\/h2>/g, (m, h) => { n++; heads.push(h); return `<h2 id="s${n}">${h}</h2>`; });
    if (heads.length > 2) toc = `<nav class="toc" aria-label="${he ? "תוכן העניינים" : "Contents"}"><b>${he ? "במדריך הזה" : "In this guide"}</b><ol>${heads.map((h, i) => `<li><a href="#s${i + 1}">${h}</a></li>`).join("")}</ol></nav>`;
  }
  const cta = a.guide && a.cta === "realestate" ? `<section class="guide-cta"><h2>${he ? "רוצים ליווי אישי, בעברית?" : "Want personal guidance?"}</h2><p>${he ? `${esc(SITE.ad.brand)} מלווה ישראלים בקנייה, בהשכרה ובניהול נכסים ביוון: מהחיפוש, דרך עורך הדין והנוטריון, ועד המפתח והניהול השוטף.` : `${esc(SITE.ad.brand)} helps Israelis buy, rent out and manage property in Greece: from the search, through the lawyer and notary, to the keys and day-to-day management.`}</p><a class="btn gold" href="${P(lang, "/advisor/")}">${he ? "דברו עם יועץ נדל״ן" : "Talk to a property adviser"}</a></section>` : "";
  const src = (a.sources || []).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(" · ");
  return `<article class="full" data-prev="${prev ? P(lang, "/a/" + prev.slug + "/") : ""}" data-next="${next ? P(lang, "/a/" + next.slug + "/") : ""}">
  <div class="art">${artHTML(a, lang)}</div>
  <div class="caption">${creditHTML(a, lang)}</div>
  ${kickerHTML(a, lang)}
  <h1>${esc(c.title)}</h1>
  <p class="dek">${esc(c.dek)}</p>
  <div class="meta">${esc(t.published)}: <time datetime="${a.publishedAt}">${fmtDate(a.publishedAt, lang)}</time>${a.updatedAt ? ` · ${esc(t.updated)}: <time datetime="${a.updatedAt}">${fmtDate(a.updatedAt, lang)}</time>` : ""}</div>
  <div style="margin-top:12px"><button class="btn ghost" type="button" data-listen>▶ ${esc(t.listen)}</button></div>
  ${a.guide ? shareRow(" top") + "</div>" : ""}
  <div class="tldr"><b>${esc(t.thirty)}</b><ul>${c.tldr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
  ${c.means ? `<div class="means"><b>${esc(t.means)}</b><p>${esc(c.means)}</p></div>` : ""}
  ${toc}
  <div class="prose" data-speak>${prose}</div>
  ${cta}
  ${a.sensitive ? `<p class="closing">${esc(t.closing)}</p>` : ""}
  <div class="src"><div>${esc(t.source)} ${src}</div></div>
  ${shareRow()}
    <button class="btn ghost" type="button" data-toggle="report-form">${esc(t.report)}</button>
    <button class="btn ghost" type="button" data-toggle="feedback-form">${esc(t.feedback)}</button>
  </div>
  <div id="report-form" hidden style="margin-top:14px">${formBox(lang, { id: "rep", title: t.reportTitle, kind: "error-report", fields: ["email", "msg"], extra: `<input type="hidden" name="article" value="${a.slug}"><input type="hidden" name="name" value="-">` })}</div>
  <div id="feedback-form" hidden style="margin-top:14px">${formBox(lang, { id: "fb", title: t.feedbackTitle, kind: "feedback", fields: ["name", "email", "msg"], extra: `<input type="hidden" name="article" value="${a.slug}">` })}</div>
  <div class="pager">
    ${prev ? `<a href="${P(lang, "/a/" + prev.slug + "/")}" rel="prev"><span>${esc(t.prev)}</span>${esc(prev[lang].title)}</a>` : ""}
    ${next ? `<a href="${P(lang, "/a/" + next.slug + "/")}" rel="next"><span>${esc(t.next)}</span>${esc(next[lang].title)}</a>` : ""}
  </div>
  <div class="swipehint">${esc(t.swipe)}</div>
</article>`;
}

export { esc, md, plain };
