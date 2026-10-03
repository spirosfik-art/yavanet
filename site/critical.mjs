// Critical CSS χωρίς εξαρτήσεις: για κάθε σελίδα κρατάμε μόνο τους κανόνες του styles.css
// που αφορούν κλάσεις/ids που υπάρχουν στο HTML της. Μπαίνουν inline στο <head> και το πλήρες
// styles.css φορτώνει χωρίς να μπλοκάρει. Επειδή το πλήρες αρχείο έρχεται μετά με την ίδια σειρά
// κανόνων, η τελική εμφάνιση είναι ακριβώς ίδια με πριν· απλώς η πρώτη εμφάνιση δεν περιμένει το δίκτυο.

// Κλάσεις που προσθέτει το JS (app.js) στη σελίδα: μπαίνουν πάντα, ώστε όταν το JS γράψει περιεχόμενο
// πριν φτάσει το πλήρες css να μη «πηδάει» η σελίδα. Όσες τελειώνουν σε «-» (π.χ. "wxs-" + είδος) είναι προθέματα.
function jsTokens(js) {
  const t = new Set(["night"]);
  const add = (str) => str.split(/\s+/).forEach((c) => { if (/^-?[_a-zA-Z][\w-]*$/.test(c)) t.add(c); });
  for (const m of js.matchAll(/class=\\?["']([^"'\\]+)/g)) add(m[1]);
  for (const m of js.matchAll(/className\s*=\s*["']([^"']+)/g)) add(m[1]);
  for (const m of js.matchAll(/classList\.(?:add|toggle|remove)\(\s*["']([^"']+)/g)) add(m[1]);
  return t;
}

// Χωρίζει (minified) css σε κανόνες: { sel, body } ή { at, rules } ή { raw, name }
function parse(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    if (head.startsWith("@media") || head.startsWith("@supports") || head.startsWith("@container") || head.startsWith("@layer")) {
      // μπλοκ με εσωτερικούς κανόνες
      let depth = 1, j = open + 1;
      while (j < css.length && depth) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
      out.push({ at: head, rules: parse(css.slice(open + 1, j - 1)) });
      i = j;
    } else if (head.startsWith("@")) {
      // @keyframes, @font-face κ.λπ.: ολόκληρο το μπλοκ ως έχει
      let depth = 1, j = open + 1;
      while (j < css.length && depth) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
      const m = head.match(/^@(?:-webkit-)?keyframes\s+([\w-]+)/);
      out.push({ raw: css.slice(i, j), name: m ? m[1] : null });
      i = j;
    } else {
      const close = css.indexOf("}", open);
      out.push({ sel: head, body: css.slice(open + 1, close) });
      i = close + 1;
    }
  }
  return out;
}

// Ένα κομμάτι selector ταιριάζει αν όλες οι κλάσεις/ids του (εκτός από όσα είναι μέσα σε :not()) υπάρχουν στη σελίδα
function partOk(part, tokens, prefixes) {
  const p = part.replace(/:not\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "");
  const re = /([.#])(-?[_a-zA-Z][\w-]*)/g;
  let m;
  while ((m = re.exec(p))) {
    if (tokens.has(m[1] + m[2])) continue;
    if (m[1] === "." && prefixes.some((x) => m[2].startsWith(x))) continue;
    return false;
  }
  return true;
}
function emit(rules, tokens, kf, pre) {
  let s = "";
  for (const r of rules) {
    if (r.sel !== undefined) {
      if (r.sel.split(",").some((x) => partOk(x, tokens, pre))) s += r.sel + "{" + r.body + "}";
    } else if (r.at) {
      const inner = emit(r.rules, tokens, kf, pre);
      if (inner) s += r.at + "{" + inner + "}";
    } else if (r.name) kf.push(r);
    else s += r.raw; // @font-face κ.λπ.
  }
  return s;
}

export function makeCritical(css, js = "") {
  const rules = parse(css);
  const always = jsTokens(js), pre = [...always].filter((c) => c.endsWith("-"));
  const cache = new Map();
  return (html) => {
    const tokens = new Set();
    for (const t of always) tokens.add("." + t);
    for (const m of html.matchAll(/\sclass="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) tokens.add("." + c);
    for (const m of html.matchAll(/\sid="([^"]*)"/g)) tokens.add("#" + m[1]);
    const key = [...tokens].sort().join(" ");
    if (cache.has(key)) return cache.get(key);
    const kf = [];
    let s = emit(rules, tokens, kf, pre);
    for (const k of kf) if (s.includes(k.name)) s += k.raw;
    cache.set(key, s);
    return s;
  };
}
