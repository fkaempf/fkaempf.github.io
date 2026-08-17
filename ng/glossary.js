/* glossary.js - one card for the cryptic names of this site.
   ---------------------------------------------------------------------------
   A reader who meets AN09B017g in a sentence gets a card that says what it is.
   The card holds no text of its own: every word comes from glossary.json, which
   a generator writes from the connectome. Nothing here is typed by hand, thus
   no count and no genotype in this file can go stale or lie.

   The design is the one of the crosses page (ng/first-cross/index.html):
     - the walk refuses whole subtrees and marks only prose;
     - one card at body level, and every handler on the document;
     - hover for a mouse, click and keyboard for all other input.
   Three things are new, and each answers a measured problem:
     - the R notebooks build tables after the page parses, thus the walk refuses
       the pagedtable container by selector and not by time;
     - the card takes the colours of the page it sits on, thus it works in the
       three colour regimes of the site and needs no media query;
     - the crosses page keeps its own card: this script stands down there.

   With JavaScript off the pages keep every word: the marking is additive, and a
   failed fetch leaves the document exactly as it was.
   --------------------------------------------------------------------------- */
(function () {
"use strict";

if (window.NG_GLOSSARY) return;                 /* the script is already here */

var SCHEMA = "avlp743m.glossary";
var VERSION = 1;

/* The report is also the "already here" flag. ?glossary=check prints it. */
var R = { state: "start", keys: 0, marks: 0, walk_ms: 0, mark_ms: 0, total_ms: 0 };
window.NG_GLOSSARY = R;

function now() { return (window.performance && performance.now) ? performance.now() : 0; }

/* ---- glossary.json and glossary.css sit beside this file ----------------- */
function base() {
  var s = document.currentScript, all, i;
  if (!s) {
    all = document.getElementsByTagName("script");
    for (i = all.length - 1; i >= 0; i--) {
      if (/(^|\/)glossary\.js([?#]|$)/.test(all[i].src || "")) { s = all[i]; break; }
    }
  }
  return (s && s.src) ? s.src.replace(/[^\/]*([?#].*)?$/, "") : "../";
}
var BASE = base();

/* The style is a separate file, and this script asks for it. A page therefore
   needs one tag only. A page that links glossary.css in its head keeps that
   link: the second copy is not added. */
function style() {
  var l, i, ls = document.getElementsByTagName("link");
  for (i = 0; i < ls.length; i++) {
    if (/(^|\/)glossary\.css([?#]|$)/.test(ls[i].getAttribute("href") || "")) return;
  }
  l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = BASE + "glossary.css";
  (document.head || document.documentElement).appendChild(l);
}

/* ---- the pages that own their card already ------------------------------- */
/* first-cross builds a card from its live stock table. That card is better
   than a copy, because it cannot go stale. This script does not touch such a
   page: two scripts would mark the same words twice. */
function taken() {
  return !!(document.getElementById("gt-src") ||
            document.getElementById("gt-card") ||
            document.querySelector(".gt"));
}

/* ---- what the walk refuses ---------------------------------------------- */
var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|CODE|PRE|SAMP|KBD|VAR|TEXTAREA|INPUT|SELECT|OPTION|BUTTON|A|SUMMARY|LABEL|H1|H2|H3|H4|TH)$/;
var HTMLNS = "http://www.w3.org/1999/xhtml";
var BADID = { "trk": 1, "gt-src": 1, "gt-card": 1, "glx-card": 1, "TOC": 1 };
var BADCLASS = {
  /* the machinery of the crosses page */
  "trk-host": 1, "gt": 1, "glx": 1,
  /* the table of contents that the notebooks build from their headings */
  "tocify": 1, "tocify-item": 1, "tocify-header": 1,
  /* R output: rmarkdown ships a data frame as JSON and builds the table after
     the document parses, thus the table is plain HTML by the time the walk
     runs. The container is refused, so the time of the walk does not matter. */
  "pagedtable": 1, "pagedtable-wrapper": 1, "pagedtable-header": 1,
  "pagedtable-footer": 1, "pagedtable-not-empty": 1, "table-condensed": 1
};
function refuse(el) {
  if (SKIP.test(el.tagName)) return true;
  /* SVG and MathML: an HTML button in an SVG figure does not draw, thus the
     labels of a plot stay text. */
  if (el.namespaceURI && el.namespaceURI !== HTMLNS) return true;
  if (el.id && BADID[el.id] === 1) return true;
  var c = el.classList, i;
  if (c) for (i = 0; i < c.length; i++) if (BADCLASS[c[i]] === 1) return true;
  if (el.hasAttribute("data-pagedtable") ||
      el.hasAttribute("data-pagedtable-source") ||
      el.hasAttribute("data-glossary-skip")) return true;
  return false;
}

/* ---- the colours of the page --------------------------------------------- */
/* The card asks the page for --bg, --fg, --line and --edge. The scene pages
   define none of them, and dark.css defines no --edge. The values below are the
   colours that the browser computed for this page, and they close both gaps.
   They are read again if the reader changes the colour scheme of the machine. */
/* The values go on the root element, thus the card and every marked word see
   them. The names start with --glx-, thus no page loses a value of its own. */
function paint() {
  var el = document.body, bg = "", root = document.documentElement, fg, a, i, p;
  for (i = 0; i < 3 && el; i++) {
    p = getComputedStyle(el).backgroundColor;
    if (p && p !== "transparent" && !/,\s*0\)$/.test(p)) { bg = p; break; }
    el = el.parentElement;
  }
  fg = getComputedStyle(document.body).color;
  root.style.setProperty("--glx-bg", bg || (isDark(fg) ? "#fff" : "#141414"));
  root.style.setProperty("--glx-fg", fg);
  root.style.setProperty("--glx-dim", fade(fg, ".72"));
  root.style.setProperty("--glx-line", fade(fg, ".28"));
  a = document.querySelector("a[href]");
  root.style.setProperty("--glx-link", a ? getComputedStyle(a).color : fg);
}
function rgb(c) {
  var m = /^rgba?\(([^)]+)\)/.exec(c || "");
  return m ? m[1].split(",") : null;
}
function fade(c, alpha) {
  var p = rgb(c);
  return p ? "rgba(" + (+p[0]) + "," + (+p[1]) + "," + (+p[2]) + "," + alpha + ")" : c;
}
function isDark(c) {
  var p = rgb(c);
  return p ? (+p[0] * 0.299 + +p[1] * 0.587 + +p[2] * 0.114) < 128 : false;
}

/* ---- small helpers for the card ------------------------------------------ */
function txt(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\s+/g, " ").trim();
}
function put(parent, tag, cls, text) {
  var el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.appendChild(document.createTextNode(text));
  parent.appendChild(el);
  return el;
}
function row(dl, label, value) {
  var t = txt(value);
  if (!t || t === "\u2014") return;
  put(dl, "dt", "", label);
  put(dl, "dd", "", t);
}
function list(v, f) {
  var out = [], i;
  if (!v || !v.length) return "";
  for (i = 0; i < v.length; i++) { var s = txt(f ? f(v[i]) : v[i]); if (s) out.push(s); }
  return out.join("; ");
}

/* ---- the card, one entry at a time --------------------------------------- */
/* Every line is dropped when the value is empty. class, hemilineage, nerve and
   dimorphism are empty for large parts of the annotation table, and an empty
   line helps nobody. */
function fill(card, e, src) {
  var dl, sides, s;
  while (card.firstChild) card.removeChild(card.firstChild);
  if (!e) return false;

  put(card, "p", "glx-n", txt(e.name) + (e.also && e.also.length ? " (" + list(e.also) + ")" : ""));
  if (e.what) put(card, "p", "glx-w", txt(e.what));
  if (e.kind === "stock" && e.genotype) put(card, "p", "glx-w", txt(e.genotype));

  dl = document.createElement("dl");

  if (e.kind === "type") {
    row(dl, "Kind", [txt(e["class"]), txt(e.subclass)].filter(Boolean).join(", "));
    row(dl, "Cells", e.cells);
    sides = [];
    if (e.sides) for (s in e.sides) if (e.sides[s]) sides.push(e.sides[s] + " " + side(s));
    row(dl, "Left and right", sides.join(", "));
    row(dl, "Nerve", list(e.enters, function (x) {
      return [txt(x.nerve), txt(x.segment), x.cells ? x.cells + " cells" : ""]
             .filter(Boolean).join(", ");
    }));
    row(dl, "Neuromere", e.neuromere);
    row(dl, "Transmitter", nt(e.transmitter));
    row(dl, "Dimorphism", e.dimorphism);
    row(dl, "Hemilineage", e.hemilineage);
    row(dl, "Also known as", list(e.aliases, function (x) {
      return txt(x.name) + (x.cite ? " (" + txt(x.cite) + ")" : "");
    }));
    if (e.atlas) for (s in e.atlas) row(dl, atlas(s), e.atlas[s]);
  } else if (e.kind === "family") {
    row(dl, "Named by", e.cite);
    /* pC1 covers 42 types and mAL covers 14. The card names the types that this
       site uses, and it says how many types the name covers. */
    row(dl, "Types", named(e));
    row(dl, "Cells", e.cells);
    row(dl, "Transmitter", nt(e.transmitter));
    row(dl, "Dimorphism", e.dimorphism);
  } else if (e.kind === "stock") {
    row(dl, "Chromosome", e.chr);
    row(dl, "Function", e["function"]);
    row(dl, "Location", e.location);
    row(dl, "Condition", e.condition);
    row(dl, "Path", e.path === "a" ? "listed under path A"
                  : e.path === "b" ? "listed under path B" : "");
  }
  /* A note is the one field that a person writes. The card says so. */
  if (e.note) row(dl, e.note.by ? "Note from " + txt(e.note.by) : "Note",
                  e.note.text === undefined ? e.note : e.note.text);
  row(dl, "Pages", list(e.pages, function (x) { return x && x.label ? x.label : x; }));
  /* The receptor name is a guess from light images, and this project does not
     accept it as a fact. It is the last line, and it says what it is. */
  row(dl, "Guess from light images", e.receptor_guess);
  if (dl.childNodes.length) card.appendChild(dl);

  if (src) put(card, "p", "glx-s", src);
  return true;
}
function side(k) {
  return k === "L" ? "left" : k === "R" ? "right" : k === "M" ? "middle" : k;
}
function atlas(k) {
  return /^hemibrain/.test(k) ? "In the hemibrain"
       : /^flywire/.test(k) ? "In FlyWire" : k.replace(/_/g, " ");
}
/* "unclear" is the word of the annotation table. The card uses plain words. */
function nt(v) { return txt(v).replace(/\bunclear\b/g, "not clear"); }
/* The types of a family that this site names, and how many types it covers. */
function named(e) {
  var use = (e.named_here && e.named_here.length) ? e.named_here : e.members;
  var all = e.members || use;
  if (!use || !use.length) return "";
  return list(use) + (all.length > use.length ? " (of " + all.length + " types)" : "");
}
/* One line under the card says which data made it, and when it was read. */
function sourceLine(d) {
  var s = d.source || {}, out = [];
  if (s.dataset) out.push(txt(s.dataset));
  if (s.fetched) out.push("read " + txt(s.fetched).slice(0, 10));
  else if (d.generated) out.push("made " + txt(d.generated).slice(0, 10));
  if (s.kind && s.kind !== "live") out.push("from a saved copy");
  return out.join(", ");
}

/* ---- the walk and the marking -------------------------------------------- */
function run(d) {
  var t0 = now(), t1, t2, t3;

  var IX = d.index, EN = d.entries, keys = [], name, i, min = 99;
  var own = Object.prototype.hasOwnProperty;
  for (name in IX) {
    if (!own.call(IX, name) || !name || !own.call(EN, IX[name])) continue;
    keys.push(name);
    if (name.length < min) min = name.length;
  }
  if (!keys.length) { R.state = "no key"; return; }
  R.keys = keys.length;

  /* One regular expression, the longest name first, thus AN05B023 cannot win
     inside AN05B023c. The name must stand alone: a letter, a digit, a hyphen or
     an underscore beside it stops the match, thus LgLG1a_T1 is not LgLG1a. The
     match keeps the case, because mAL_m1 and pC1_3c carry meaning in their
     case. */
  keys.sort(function (a, b) { return b.length - a.length; });
  var alt = [], esc = /[.*+?^${}()|[\]\\-]/g;
  for (i = 0; i < keys.length; i++) alt.push(keys[i].replace(esc, "\\$&").replace(/ +/g, "\\s+"));
  var RE = new RegExp("(^|[^0-9A-Za-z_\\-])(" + alt.join("|") + ")(?![0-9A-Za-z_\\-])", "g");

  /* PASS ONE: read. A rejected element takes its whole subtree with it, thus
     the base64 images, the R code and the R output are never visited. A text
     node that is shorter than the shortest name is dropped before the regular
     expression runs. Nothing is written and no size is read, thus the browser
     computes no layout during the walk. */
  t1 = now();
  var W = document.createTreeWalker(document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    { acceptNode: function (n) {
        if (n.nodeType === 1) return refuse(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
        var s = n.nodeValue;
        if (!s || s.length < min) return NodeFilter.FILTER_REJECT;
        RE.lastIndex = 0;
        return RE.test(s) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      } });
  var hits = [], node;
  while ((node = W.nextNode())) hits.push(node);
  t2 = now();

  /* PASS TWO: write. Each text node becomes a fragment with the same text, and
     the name inside it becomes a button that carries that same text. */
  var marks = 0;
  for (i = 0; i < hits.length; i++) marks += markNode(hits[i], RE, IX);
  t3 = now();

  R.marks = marks;
  R.walk_ms = t2 - t1;
  R.mark_ms = t3 - t2;

  if (!marks) { R.state = "no name on this page"; R.total_ms = now() - t0; return; }

  /* ---- one card, and every handler on the document ----------------------- */
  var card = document.createElement("div");
  card.id = "glx-card";
  card.hidden = true;
  document.body.appendChild(card);
  paint();
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { paint(); });
  }

  var src = sourceLine(d);
  var open = null, byClick = false, tid = null;
  function up(n, sel) { return (n && n.closest) ? n.closest(sel) : null; }
  function place(b) {
    var q = b.getBoundingClientRect(),
        vw = document.documentElement.clientWidth,
        vh = document.documentElement.clientHeight, w, h, x, y;
    if (!q.width && !q.height) { shut(); return; }
    card.style.left = "0px"; card.style.top = "-9999px";
    w = card.offsetWidth; h = card.offsetHeight;
    x = q.left; if (x + w > vw - 8) x = vw - 8 - w; if (x < 8) x = 8;
    y = q.bottom + 6;
    if (y + h > vh - 8 && q.top - 6 - h > 8) y = q.top - 6 - h;
    card.style.left = (x + (window.pageXOffset || 0)) + "px";
    card.style.top = (y + (window.pageYOffset || 0)) + "px";
  }
  function shut() {
    if (!open) return;
    open.setAttribute("aria-expanded", "false");
    open.removeAttribute("aria-describedby");
    open = null; byClick = false; card.hidden = true;
  }
  function show(b, click) {
    if (!fill(card, EN[IX[b.getAttribute("data-glx")]], src)) return;
    if (open && open !== b) {
      open.setAttribute("aria-expanded", "false");
      open.removeAttribute("aria-describedby");
    }
    open = b; byClick = !!click;
    b.setAttribute("aria-expanded", "true");
    b.setAttribute("aria-describedby", "glx-card");
    card.hidden = false;
    place(b);
  }

  /* Nothing is attached to a word. A page can rebuild a block, and the words
     that survive keep their function. */
  document.addEventListener("click", function (e) {
    var b = up(e.target, ".glx");
    if (!b) return;
    if (open === b && byClick) shut(); else show(b, true);
  });
  document.addEventListener("pointerover", function (e) {
    if (e.pointerType !== "mouse") return;
    var b = up(e.target, ".glx");
    if (b) {
      if (open !== b) { clearTimeout(tid); tid = setTimeout(function () { show(b, false); }, 120); }
      else clearTimeout(tid);
      return;
    }
    if (open && up(e.target, "#glx-card")) clearTimeout(tid);
  });
  document.addEventListener("pointerout", function (e) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(tid);
    if (!open || byClick) return;
    var to = e.relatedTarget;
    if (to && (up(to, ".glx") === open || up(to, "#glx-card"))) return;
    tid = setTimeout(shut, 200);
  });
  document.addEventListener("focusin", function (e) {
    var b = up(e.target, ".glx");
    if (b && open !== b) show(b, false);
  });
  document.addEventListener("focusout", function (e) {
    if (open && e.target === open && e.relatedTarget) shut();
  });
  document.addEventListener("keydown", function (e) {
    if (open && (e.key === "Escape" || e.key === "Esc")) shut();
  }, true);
  document.addEventListener("pointerdown", function (e) {
    if (!open) return;
    if (up(e.target, ".glx") || up(e.target, "#glx-card")) return;
    shut();
  }, true);
  document.addEventListener("scroll", function (e) {
    if (open && e.target !== document) shut();
  }, true);
  window.addEventListener("resize", function () { if (open) place(open); });

  R.state = "ok";
  R.total_ms = now() - t0;
}

function markNode(tn, RE, IX) {
  var s = tn.nodeValue, f = null, last = 0, n = 0, m, name, b;
  if (!tn.parentNode) return 0;
  RE.lastIndex = 0;
  while ((m = RE.exec(s))) {
    name = m[2];
    if (!IX[name]) continue;
    if (!f) f = document.createDocumentFragment();
    f.appendChild(document.createTextNode(s.slice(last, m.index) + m[1]));
    b = document.createElement("button");
    b.type = "button";
    b.className = "glx";
    b.setAttribute("data-glx", name);
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-controls", "glx-card");
    b.setAttribute("aria-label", name + ", show what this name is");
    b.appendChild(document.createTextNode(name));
    f.appendChild(b);
    last = m.index + m[0].length;
    n++;
  }
  if (!f) return 0;
  f.appendChild(document.createTextNode(s.slice(last)));
  tn.parentNode.replaceChild(f, tn);
  return n;
}

/* ---- ?glossary=check reports the names that have no entry ---------------- */
function check(d) {
  if (!/[?&]glossary=check/.test(location.search) || !window.console || !console.warn) return;
  var W = document.createTreeWalker(document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    { acceptNode: function (n) {
        return n.nodeType === 1
          ? (refuse(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP)
          : NodeFilter.FILTER_ACCEPT;
      } });
  var body = [], x;
  while ((x = W.nextNode())) body.push(x.nodeValue);
  body = body.join("\n");
  var SHAPE = /\b(?:[A-Z]{2,6}[0-9]{2,4}[a-z]?|LgLG[0-9]+[ab]?|Lg[A-Z]G[0-9]|WG[0-9]|[a-z]?[A-Z]{1,4}[0-9]{1,3}_[A-Za-z0-9]+|mAL_[A-Za-z0-9]+)\b/g;
  var seen = {}, m, IX = (d && d.index) || {};
  while ((m = SHAPE.exec(body))) {
    if (!IX[m[0]] && !seen[m[0]]) { seen[m[0]] = 1; console.warn("glossary: no entry for " + m[0]); }
  }
  var name, gone = [];
  for (name in IX) if (!d.entries[IX[name]]) gone.push(name);
  if (gone.length) console.warn("glossary: the index names an entry that is absent: " + gone.join(", "));
  console.warn("glossary: " + R.state + ", " + R.keys + " names, " + R.marks + " words, walk " +
               R.walk_ms.toFixed(1) + " ms, mark " + R.mark_ms.toFixed(1) + " ms, all " +
               R.total_ms.toFixed(1) + " ms");
}

/* ---- start: the data and the document, in parallel ----------------------- */
/* The fetch is same origin, as the status file of the crosses page is. Every
   failure is silent: a page with no data, with data of another version, or with
   no network keeps every word that it has now. */
function start() {
  var d = null, ready = false, done = false;
  function go() {
    if (done || !d || !ready) return;
    done = true;
    /* The test waits for the document: the stock table of the crosses page is
       in the file, but a script in the head runs before it. */
    if (taken()) { R.state = "the page has its own card"; return; }
    try { style(); run(d); check(d); }
    catch (err) { R.state = "stopped: " + err; }
  }
  function dom() { ready = true; go(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", dom, false);
  else ready = true;

  try {
    if (!window.fetch) { R.state = "no fetch"; return; }
    window.fetch(BASE + "glossary.json", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || j.schema !== SCHEMA || j.version !== VERSION ||
            !j.index || !j.entries) { R.state = "the data does not fit"; return; }
        d = j; go();
      })
      .catch(function () { R.state = "no data"; });
  } catch (err) { R.state = "no data"; }
  if (ready) go();
}
start();
})();
