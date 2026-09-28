// Σελίδα-προφίλ συνεργάτη (π.χ. Άσι): πιο «landing page» από ένα απλό άρθρο.
// Ενεργοποιείται όταν το άρθρο έχει a[lang].profile.
import { esc, P } from "./templates.mjs";
import { md } from "./md.mjs";

const IC = {
  area: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
  reno: '<path d="M3 21h18M5 21V10l7-6 7 6v11"/><path d="M9 21v-5h6v5"/><path d="M14 4l3-1 1 3"/>',
  rent: '<path d="M4 11v2a1 1 0 0 0 1 1h2l5 4V6L7 10H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  manage: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  wa: '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 2.5 2.5 4.7 5 5l1.2-1.2-1.8-1-1 .8c-.8-.4-1.6-1.2-2-2l.8-1-1-1.8z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k] || IC.check}</svg>`;

export function profileBody(a, lang) {
  const p = a[lang].profile, he = lang === "he";
  const wa = `<a class="pf-btn wa" href="${esc(p.wa)}" target="_blank" rel="noopener">${icon("wa")}<span>${esc(p.waLabel)}</span></a>`;
  return `<article class="pf" lang="${lang}">
<header class="pf-hero">
  <div class="pf-photo"><img src="${esc(p.photo)}" alt="${esc(p.name)}" width="640" height="800"></div>
  <div class="pf-intro">
    <span class="pf-eye">${esc(p.eyebrow)} <span class="spons">${he ? "בשיתוף פעולה" : "In partnership"}</span></span>
    <h1>${esc(p.name)}</h1>
    <p class="pf-role">${esc(p.role)}</p>
    <blockquote>${esc(p.quote)}</blockquote>
    <div class="pf-ctas">${wa}<a class="pf-btn ghost" href="#pf-meet">${icon("cal")}<span>${esc(p.meetLabel)}</span></a></div>
  </div>
</header>
<div class="pf-stats">${p.stats.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join("")}</div>

<section class="pf-sec pf-story"><h2>${esc(p.storyTitle)}</h2>${md(p.story)}</section>

<section class="pf-sec"><h2>${esc(p.servicesTitle)}</h2>
<div class="pf-services">${p.services.map(([k, t, d]) => `<div class="pf-svc"><span class="pf-ic">${icon(k)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}</div></section>

<section class="pf-sec"><h2>${esc(p.stepsTitle)}</h2>
<ol class="pf-steps">${p.steps.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("")}</ol></section>

<section class="pf-sec"><h2>${esc(p.galleryTitle)}</h2><p class="pf-lead">${esc(p.galleryText)}</p>
<div class="pf-gal">${p.gallery.map(([src, alt], i) => `<a href="${esc(src)}" target="_blank" rel="noopener" class="${i === 0 ? "big" : ""}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></a>`).join("")}</div></section>

<section class="pf-sec"><h2>${esc(p.networkTitle)}</h2><p class="pf-lead">${esc(p.networkText)}</p>
<div class="pf-chips">${p.network.map((x) => `<span>${esc(x)}</span>`).join("")}</div></section>

<section class="pf-quote"><p>${esc(p.quote2)}</p><span>${esc(p.name)}</span></section>

<section class="pf-meet" id="pf-meet">
  <img src="${esc(p.avatar || p.photo)}" alt="" width="400" height="400">
  <div><h2>${esc(p.meetTitle)}</h2><p>${esc(p.meetText)}</p>
  <div class="pf-ctas">${wa}<a class="pf-btn ghost" dir="ltr" href="tel:${esc(p.phone.replace(/[^+\d]/g, ""))}">${esc(p.phone)}</a></div></div>
</section>

<p class="pf-more">${p.links.map(([u, t]) => `<a href="${P(lang, u)}">${esc(t)}</a>`).join(" · ")}</p>
<p class="small pf-disc">${esc(p.disclosure)}</p>
<div class="pf-sticky">${wa}</div>
</article>`;
}
