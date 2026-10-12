// Εικονίδια γραμμής (ίδιο στυλ με την κάτω μπάρα και τις «πόρτες»), αντί για emoji.
// ic("alert") → <svg class="ic">…</svg>. Το χρώμα έρχεται από το currentColor.
const P = {
  alert: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17.2v.01"/>',
  storm: '<path d="M7 15a4 4 0 1 1 .9-7.9A5.5 5.5 0 0 1 18.5 9 3.5 3.5 0 0 1 18 16H8"/><path d="M13 13l-2 4h3l-2 4"/>',
  plane: '<path d="M2 16l20-6-3-3-7 3-5-4-2 1 3 5-4 2-2-1-1 1z"/><path d="M3 21h18"/>',
  gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3.6-5-1.4C7 8 9.5 8 12 8zM12 8c1.5-3 5-3.6 5-1.4C17 8 14.5 8 12 8z"/>',
  facebook: '<path d="M14 21v-7.5h2.6l.4-3H14V8.6c0-.9.3-1.5 1.6-1.5H17V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9v2.3H8.5v3H11V21"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8v.01"/>',
  whatsapp: '<path d="M4 20l1.2-4.1A8 8 0 1 1 8.3 19z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1-.4-2-1.4-2.4-2.4l.9-1-1-2z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  luggage: '<rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9.5 7V4.5h5V7M10 11v5M14 11v5M8.5 20v1.5M15.5 20v1.5"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17.5v.01"/>',
  island: '<path d="M3 19c3-1.5 6-1.5 9 0s6 1.5 9 0"/><path d="M12 17V9M12 9c-2.5-2.5-5.5-2-7-.5M12 9c2.5-2.5 5.5-2 7-.5M12 9c-1-2.7.3-4.8 2-5.5"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10M10 20v-5h4v5"/>',
  news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
  candle: '<path d="M9 21V11h6v10M7 21h10"/><path d="M12 8c-1.2 0-1.8-.9-1.8-1.8C10.2 5 12 3 12 3s1.8 2 1.8 3.2c0 .9-.6 1.8-1.8 1.8z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
};
export const ic = (name, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name] || P.news}</svg>`;
