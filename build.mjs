// Δημιουργία του site: node build.mjs  →  φάκελος dist/
import fs from "node:fs";
import path from "node:path";
import { SITE, SECTIONS, T, LEGAL_PAGES, YIELD_REGIONS, OFFICIAL_LINKS } from "./site/config.mjs";
import { layout, heroCard, card, adBox, newsletterBox, formBox, calcBox, yieldBox, widgets, articleBody, DIVIDER, P, abs, sec, esc, md, plain, artHTML } from "./site/templates.mjs";
import { PAGES } from "./content/pages.mjs";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, "dist");
const LANGS = ["he", "en"];
const NOW = Date.now();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const write = (p, s) => { const f = path.join(OUT, p.endsWith("/") ? p + "index.html" : p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

/* ---------- Φόρτωση άρθρων ---------- */
const REQUIRED = ["slug", "section", "publishedAt", "sources", "he", "en"];
const articles = fs.readdirSync(path.join(ROOT, "content/articles"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const a = JSON.parse(fs.readFileSync(path.join(ROOT, "content/articles", f), "utf8"));
    for (const k of REQUIRED) if (!a[k]) throw new Error(`${f}: λείπει το πεδίο ${k}`);
    for (const l of LANGS) for (const k of ["title", "dek", "tldr", "body"]) if (!a[l][k]) throw new Error(`${f}: λείπει ${l}.${k}`);
    if (!a.sources.length || !a.sources.every((s) => s.name && s.url)) throw new Error(`${f}: χρειάζεται πηγή με όνομα και σύνδεσμο`);
    if (a.hidden) return null;
    return a;
  })
  .filter(Boolean)
  .sort((x, y) => new Date(y.publishedAt) - new Date(x.publishedAt));

const bySection = (s) => articles.filter((a) => a.section === s);
const breakingNow = articles.find((a) => a.breaking && NOW - new Date(a.updatedAt || a.publishedAt).getTime() < 12 * 3600e3) || null;
if (breakingNow) breakingNow.fire = (breakingNow.image && breakingNow.image.key === "fire") || /fire|שריפ/i.test(breakingNow.en.title + breakingNow.he.title);
let mostSlugs = [];
try { mostSlugs = JSON.parse(fs.readFileSync(path.join(ROOT, "content/mostread.json"), "utf8")).slugs || []; } catch {}
const mostRead = (mostSlugs.map((s) => articles.find((a) => a.slug === s)).filter(Boolean).concat(articles)).filter((a, i, arr) => arr.indexOf(a) === i).slice(0, 5);

const orgLd = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: SITE.name, alternateName: SITE.nameHe, url: SITE.url, logo: abs("/icon-512.png"), publishingPrinciples: abs("/p/corrections/"), correctionsPolicy: abs("/p/corrections/") };

/* ---------- Δεδομένα για stories & feed ---------- */
function feedData(lang) {
  const k = (a) => sec(a.section)[lang];
  const url = (a) => P(lang, "/a/" + a.slug + "/");
  const re = bySection("real-estate"), isr = bySection("israelis"), brk = articles.filter((a) => a.breaking);
  const stories = [
    { title: T[lang].storyToday, art: "sun", slides: articles.slice(0, 5).map((a) => ({ kicker: k(a), text: a[lang].title, url: url(a) })) },
    { title: sec("real-estate")[lang], art: "house", slides: re.slice(0, 4).map((a) => ({ kicker: k(a), text: a[lang].tldr[0], url: url(a) })) },
    { title: sec("breaking")[lang], art: "fire", slides: brk.slice(0, 4).map((a) => ({ kicker: k(a), text: a[lang].title, url: url(a) })) },
    { title: sec("israelis")[lang], art: "people", slides: isr.slice(0, 4).map((a) => ({ kicker: k(a), text: a[lang].title, url: url(a) })) },
  ].filter((s) => s.slides.length);
  return { stories, feed: articles.slice(0, 20).map((a) => ({ kicker: k(a), title: a[lang].title, dek: a[lang].dek, url: url(a), art: artHTML(a, lang) })) };
}

/* ---------- Σελίδες ---------- */
for (const lang of LANGS) {
  const t = T[lang];
  const fd = feedData(lang);
  write(P(lang, "/feed.json"), JSON.stringify(fd));

  /* Αρχική */
  const bigBreaking = breakingNow && NOW - new Date(breakingNow.publishedAt).getTime() < 6 * 3600e3 ? breakingNow : null;
  const govPool = bySection("real-estate");
  const heroA = bigBreaking || govPool[0] || bySection("israelis")[0] || articles[0];
  const used = new Set([heroA && heroA.slug]);
  const take = (list, n) => list.filter((a) => !used.has(a.slug)).slice(0, n).map((a) => (used.add(a.slug), a));
  const govCards = take(govPool, 3);
  const isrCards = take(bySection("israelis"), 4);
  const more = take(articles, 6);
  const { art } = await import("./site/art.mjs");
  const storiesHTML = fd.stories.map((s, i) => `<button class="story" type="button" data-story="${i}"><span class="ring"><span>${art(s.art, s.title)}</span></span>${esc(s.title)}</button>`).join("");
  const home = `
<div class="stories" aria-label="Stories">${storiesHTML}</div>
<div class="grid">
  <div class="col">
    <section aria-labelledby="h-gov">
      <div class="zone-h"><h2 id="h-gov">${esc(t.zoneGov)}</h2><span class="eyebrow">${esc(t.zoneGovEye)}</span></div>
      ${heroA ? heroCard(heroA, lang) : `<div class="empty">${esc(t.sectionEmpty)}</div>`}
      <div class="cards" style="margin-top:14px">${govCards.map((a) => card(a, lang)).join("")}</div>
    </section>
    ${DIVIDER}
    <section aria-labelledby="h-isr">
      <div class="zone-h"><h2 id="h-isr">${esc(t.zoneIsr)}</h2><span class="eyebrow">${esc(t.zoneIsrEye)}</span></div>
      <div class="cards two">${isrCards.map((a) => card(a, lang)).join("") || `<div class="empty">${esc(t.sectionEmpty)}</div>`}</div>
    </section>
    ${adBox(lang)}
    ${more.length ? `<section aria-labelledby="h-more"><div class="zone-h"><h2 id="h-more">${esc(t.zoneMore)}</h2></div><div class="cards two">${more.map((a) => card(a, lang)).join("")}</div></section>` : ""}
    ${DIVIDER}
    <section aria-labelledby="h-calc"><div class="zone-h"><h2 id="h-calc">${esc(t.calcTitle)}</h2></div>${calcBox(lang)}</section>
    ${newsletterBox(lang)}
  </div>
  ${widgets(lang, mostRead)}
</div>
<script type="application/json" id="yv-data">${JSON.stringify(fd).replace(/</g, "\\u003c")}</script>`;
  write(P(lang, "/"), layout({ lang, title: "", description: t.tagline, path: P(lang, "/"), altPath: P(lang === "he" ? "en" : "he", "/"), body: home, breaking: breakingNow, activeNav: "home",
    jsonld: [orgLd, { "@context": "https://schema.org", "@type": "WebSite", name: lang === "he" ? SITE.nameHe : SITE.name, alternateName: lang === "he" ? SITE.name : SITE.nameHe, url: abs(P(lang, "/")), inLanguage: lang }] }));

  /* Ενότητες */
  for (const s of SECTIONS) {
    const list = bySection(s.slug);
    const body = `<div class="page-h"><h1>${esc(s[lang])}</h1></div>
<div class="grid"><div class="col">
${list[0] ? heroCard(list[0], lang) : `<div class="empty">${esc(t.sectionEmpty)}</div>`}
<div class="cards two">${list.slice(1).map((a) => card(a, lang)).join("")}</div>
${s.slug === "real-estate" ? adBox(lang) : ""}
${s.slug === "breaking" ? `<a class="btn" href="${P(lang, "/live/")}">${esc(t.liveTitle)}</a>` : ""}
${newsletterBox(lang)}
</div>${widgets(lang, mostRead)}</div>`;
    write(P(lang, `/s/${s.slug}/`), layout({ lang, title: s[lang], description: `${s[lang]} · ${t.tagline}`, path: P(lang, `/s/${s.slug}/`), altPath: P(lang === "he" ? "en" : "he", `/s/${s.slug}/`), body, breaking: breakingNow, activeSection: s.slug, activeNav: s.slug === "real-estate" ? "prop" : "" }));
  }

  /* Άρθρα */
  articles.forEach((a, i) => {
    const prev = articles[i - 1] || null, next = articles[i + 1] || null;
    const related = articles.filter((x) => x !== a && x.section === a.section).slice(0, 3);
    const body = `<div class="grid"><div class="col">${articleBody(a, lang, prev, next)}
${a.section === "real-estate" ? adBox(lang) : ""}
${related.length ? `<section><div class="zone-h"><h2>${esc(t.related)}</h2></div><div class="cards">${related.map((x) => card(x, lang)).join("")}</div></section>` : ""}
${newsletterBox(lang)}
</div>${widgets(lang, mostRead)}</div>`;
    const url = P(lang, `/a/${a.slug}/`);
    const ld = { "@context": "https://schema.org", "@type": "NewsArticle", headline: a[lang].title, description: a[lang].dek, inLanguage: lang, datePublished: a.publishedAt, dateModified: a.updatedAt || a.publishedAt, mainEntityOfPage: abs(url), image: [abs("/og.png")], author: { "@type": "Organization", name: SITE.name, url: SITE.url }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: abs("/icon-512.png") } }, isBasedOn: a.sources.map((s) => s.url), articleSection: sec(a.section)[lang] };
    const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.home, item: abs(P(lang, "/")) }, { "@type": "ListItem", position: 2, name: sec(a.section)[lang], item: abs(P(lang, `/s/${a.section}/`)) }, { "@type": "ListItem", position: 3, name: a[lang].title }] };
    write(url, layout({ lang, title: a[lang].title, description: a[lang].dek, path: url, altPath: P(lang === "he" ? "en" : "he", `/a/${a.slug}/`), body, breaking: breakingNow, activeSection: a.section, ogType: "article", jsonld: [ld, crumbs],
      head: `<meta property="article:published_time" content="${a.publishedAt}">${a.updatedAt ? `<meta property="article:modified_time" content="${a.updatedAt}">` : ""}` }));
  });

  /* Εργαλεία */
  const tools = `<div class="page-h"><h1>${esc(t.toolsTitle)}</h1></div>
<div class="grid"><div class="col">
<section><div class="zone-h"><h2>${esc(t.calcTitle)}</h2></div>${calcBox(lang)}</section>
<section><div class="zone-h"><h2>${esc(t.yieldTitle)}</h2></div>${yieldBox(lang, YIELD_REGIONS)}</section>
${formBox(lang, { id: "alerts", title: lang === "he" ? "התראה על חוקי נדל״ן חדשים" : "Alerts on new property laws", text: lang === "he" ? "נשלח לכם הודעה ברגע שיוצא חוק או החלטה חדשה על נדל״ן ביוון." : "We will message you as soon as a new property law or decision is published in Greece.", kind: "law-alerts", fields: ["name", "email", "phone"] })}
${adBox(lang)}
</div>${widgets(lang, mostRead)}</div>`;
  write(P(lang, "/tools/"), layout({ lang, title: t.toolsTitle, description: t.calcTitle, path: P(lang, "/tools/"), altPath: P(lang === "he" ? "en" : "he", "/tools/"), body: tools, breaking: breakingNow, activeNav: "tools" }));

  /* Σύμβουλος ακινήτων & Ρωτήστε τον ειδικό */
  const advisor = `<div class="page-h"><h1>${esc(t.leadTitle)}</h1><p>${esc(t.leadText)}</p></div>
<div class="grid"><div class="col">
${formBox(lang, { id: "lead", title: t.leadTitle, text: t.leadText, kind: "property-lead", fields: ["name", "email", "phone", "area", "budget", "msg"] })}
${formBox(lang, { id: "ask", title: t.askTitle, text: t.askText, kind: "ask-expert", fields: ["name", "email", "msg"] })}
</div>${widgets(lang, mostRead)}</div>`;
  write(P(lang, "/advisor/"), layout({ lang, title: t.leadTitle, description: t.leadText, path: P(lang, "/advisor/"), altPath: P(lang === "he" ? "en" : "he", "/advisor/"), body: advisor, breaking: breakingNow }));

  /* Έκτακτα live */
  const brkList = bySection("breaking").slice(0, 30);
  const pts = brkList.filter((a) => a.geo && a.geo.lat).map((a) => ({ lat: a.geo.lat, lng: a.geo.lng, title: a[lang].title, url: P(lang, "/a/" + a.slug + "/") }));
  const live = `<div class="page-h"><h1>${esc(t.liveTitle)}</h1><p>${esc(t.liveText)}</p></div>
<div class="grid"><div class="col">
<div id="map" data-points="${esc(JSON.stringify(pts))}" role="region" aria-label="Map"></div>
<section style="display:grid;gap:10px">${brkList.map((a) => `<a class="alert" href="${P(lang, "/a/" + a.slug + "/")}"><strong>${esc(a[lang].title)}</strong><span class="small">${new Date(a.updatedAt || a.publishedAt).toLocaleString(t.locale, { timeZone: "Europe/Athens" })} · ${esc(a.sources[0].name)}</span></a>`).join("") || `<div class="empty">${esc(t.noBreaking)}</div>`}</section>
<section><div class="zone-h"><h2>${esc(t.officialLinks)}</h2></div><div class="links">${OFFICIAL_LINKS.map((o) => `<a href="${o.url}" target="_blank" rel="noopener">${esc(o[lang])}<span aria-hidden="true">↗</span></a>`).join("")}</div></section>
</div>${widgets(lang, mostRead)}</div>`;
  write(P(lang, "/live/"), layout({ lang, title: t.liveTitle, description: t.liveText, path: P(lang, "/live/"), altPath: P(lang === "he" ? "en" : "he", "/live/"), body: live, breaking: breakingNow, activeSection: "breaking" }));

  /* Κατάλογος επιχειρήσεων */
  const biz = JSON.parse(fs.readFileSync(path.join(ROOT, "content/businesses.json"), "utf8"));
  const dir = `<div class="page-h"><h1>${esc(t.dirTitle)}</h1><p>${esc(t.dirText)}</p></div>
<div class="grid"><div class="col">
<div class="cards">${biz.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((b) => `<div class="card" style="grid-template-columns:1fr"><div>${b.featured ? `<span class="spons">${esc(t.sponsored)}</span>` : ""}<h3>${esc(b.name)}</h3><p>${esc(b[lang] || "")}</p><div class="meta">${esc(b.city || "")}${b.url ? ` · <a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.url.replace(/^https?:\/\//, ""))}</a>` : ""}</div></div></div>`).join("") || `<div class="empty">${esc(t.dirEmpty)}</div>`}</div>
${formBox(lang, { id: "biz", title: t.dirAdd, kind: "business-listing", fields: ["name", "email", "phone", "msg"] })}
</div>${widgets(lang, mostRead)}</div>`;
  write(P(lang, "/directory/"), layout({ lang, title: t.dirTitle, description: t.dirText, path: P(lang, "/directory/"), altPath: P(lang === "he" ? "en" : "he", "/directory/"), body: dir, breaking: breakingNow }));

  /* Νομικές σελίδες */
  for (const p of LEGAL_PAGES) {
    const pg = PAGES[p][lang];
    let extra = "";
    if (p === "contact") extra = formBox(lang, { id: "contact", title: t.legal.contact, kind: "contact", fields: ["name", "email", "msg"] });
    if (p === "advertise") extra = formBox(lang, { id: "adv", title: t.legal.advertise, kind: "advertiser", fields: ["name", "email", "phone", "msg"] });
    if (p === "privacy") extra = formBox(lang, { id: "gdpr", title: lang === "he" ? "בקשה לגבי המידע שלי (עיון / מחיקה)" : "Request about my data (access / deletion)", kind: "gdpr-request", fields: ["name", "email", "msg"] });
    const body = `<article class="full"><h1>${esc(pg.title)}</h1><div class="prose">${md(pg.body)}</div></article>${extra}`;
    write(P(lang, `/p/${p}/`), layout({ lang, title: pg.title, description: plain(pg.body).slice(0, 150), path: P(lang, `/p/${p}/`), altPath: P(lang === "he" ? "en" : "he", `/p/${p}/`), body, breaking: breakingNow }));
  }

  /* RSS */
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${lang === "he" ? SITE.nameHe : SITE.name}</title><link>${abs(P(lang, "/"))}</link><description>${esc(t.tagline)}</description><language>${lang}</language>
<atom:link href="${abs(P(lang, "/rss.xml"))}" rel="self" type="application/rss+xml"/>
${articles.slice(0, 40).map((a) => `<item><title>${esc(a[lang].title)}</title><link>${abs(P(lang, "/a/" + a.slug + "/"))}</link><guid>${abs(P(lang, "/a/" + a.slug + "/"))}</guid><pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate><description>${esc(a[lang].dek)}</description><category>${esc(sec(a.section)[lang])}</category></item>`).join("\n")}
</channel></rss>`;
  write(P(lang, "/rss.xml"), rss);
}

/* 404 */
write("404.html", layout({ lang: "he", title: "404", description: "", path: "/404.html", altPath: "/en/", noindex: true, body: `<div class="page-h"><h1>הדף לא נמצא</h1><p>Page not found. <a href="/">Yavanet</a> · <a href="/en/">English</a></p></div>` }));

/* Sitemaps */
const urls = [];
for (const lang of LANGS) {
  urls.push(P(lang, "/"), P(lang, "/tools/"), P(lang, "/live/"), P(lang, "/directory/"), P(lang, "/advisor/"));
  SECTIONS.forEach((s) => urls.push(P(lang, `/s/${s.slug}/`)));
  LEGAL_PAGES.forEach((p) => urls.push(P(lang, `/p/${p}/`)));
  articles.forEach((a) => urls.push(P(lang, `/a/${a.slug}/`)));
}
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${abs(u)}</loc></url>`).join("\n")}\n</urlset>`);
const recent = articles.filter((a) => NOW - new Date(a.publishedAt).getTime() < 2 * 86400e3);
write("news-sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent.flatMap((a) => LANGS.map((lang) => `<url><loc>${abs(P(lang, "/a/" + a.slug + "/"))}</loc><news:news><news:publication><news:name>${lang === "he" ? SITE.nameHe : SITE.name}</news:name><news:language>${lang === "he" ? "he" : "en"}</news:language></news:publication><news:publication_date>${a.publishedAt}</news:publication_date><news:title>${esc(a[lang].title)}</news:title></news:news></url>`)).join("\n")}
</urlset>`);

/* Στατικά αρχεία */
const assets = path.join(ROOT, "site/assets");
for (const f of fs.readdirSync(assets)) {
  let buf = fs.readFileSync(path.join(assets, f));
  if (f === "robots.txt") buf = Buffer.from(buf.toString().replace(/__SITE__/g, SITE.url.replace(/\/$/, "")));
  fs.writeFileSync(path.join(OUT, f), buf);
}
/* Ανακατευθύνσεις για άρθρα που συγχωνεύτηκαν (Cloudflare _redirects) */
const redirects = fs.readdirSync(path.join(ROOT, "content/articles")).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "content/articles", f), "utf8")))
  .filter((a) => a.hidden && a.meta && a.meta.mergedInto)
  .flatMap((a) => [`/a/${a.slug}/ /a/${a.meta.mergedInto}/ 301`, `/en/a/${a.slug}/ /en/a/${a.meta.mergedInto}/ 301`]);
if (redirects.length) fs.writeFileSync(path.join(OUT, "_redirects"), redirects.join("\n") + "\n");

console.log(`✓ Yavanet: ${articles.length} άρθρα, ${urls.length} σελίδες → dist/`);
