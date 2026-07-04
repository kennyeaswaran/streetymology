// Streetymology data validator. Run: node check-data.js
// Checks streets-data.js against the conventions in ADDING-STREETS.md.

const fs = require("fs");
const src = fs.readFileSync(__dirname + "/streets-data.js", "utf8");
const { STREET_DATA, CATEGORIES, NEIGHBORHOODS } = new Function(src + "; return {STREET_DATA, CATEGORIES, NEIGHBORHOODS};")();

// coverage = union of neighborhood bboxes (same as the map)
const BBOX = {
  s: Math.min(...NEIGHBORHOODS.map(n => n.bbox.s)), w: Math.min(...NEIGHBORHOODS.map(n => n.bbox.w)),
  n: Math.max(...NEIGHBORHOODS.map(n => n.bbox.n)), e: Math.max(...NEIGHBORHOODS.map(n => n.bbox.e))
};
const catIds = new Set(CATEGORIES.map(c => c.id));
let errors = 0;
const err = (...m) => { errors++; console.error("ERROR:", ...m); };
const warn = (...m) => console.warn("warn: ", ...m);

function checkEntry(id, v) {
  if (!v.name) err(id, "missing name");
  if (v.namedAfter === undefined) err(id, "missing namedAfter (use null if genuinely nothing)");
  if (!Array.isArray(v.categories) || !v.categories.length) err(id, "missing categories");
  else v.categories.forEach(c => { if (!catIds.has(c)) err(id, "undefined category:", c); });
  if (!Array.isArray(v.sources) || !v.sources.length) err(id, "no sources — every entry must justify its claims");
  else v.sources.forEach(s => { if (!/^https?:\/\//.test(s.url)) err(id, "bad source url:", s.url); });
  if (v.nameHistory) {
    if (v.nameHistory.length < 2) err(id, "nameHistory with <2 entries — omit it for never-renamed streets");
    const last = v.nameHistory[v.nameHistory.length - 1];
    if (last.until !== null) err(id, "nameHistory must end with the current name (until: null)");
    if (!v.categories.includes("renamed")) warn(id, "has nameHistory but no 'renamed' category");
  }
  if (v.disputed && !v.categories.includes("disputed")) warn(id, "disputed:true but no 'disputed' category");
  if (v.formerNames || v.named !== undefined || v.history !== undefined) err(id, "obsolete schema field (formerNames/named/history)");
  if (v.note && /click it|see the|this stretch has/i.test(v.note)) warn(id, "note looks like a cross-reference — segment chips handle that");
  checkBraces(id, "namedAfter", v.namedAfter, v.namedAfterLink);
  (v.nameHistory || []).forEach((h, j) => checkBraces(id, `nameHistory[${j}].origin`, h.origin, h.originLink));
  // [[Street Key]] cross-links must point at existing entries
  const checkCross = (field, text) => {
    if (!text) return;
    for (const m of text.matchAll(/\[\[(.+?)\]\]/g)) {
      const key = m[1].split("|")[0];
      if (!STREET_DATA[key]) err(id, field, "cross-link target not in STREET_DATA:", key);
    }
  };
  checkCross("note", v.note);
  checkCross("namedAfter", v.namedAfter);
  (v.nameHistory || []).forEach((h, j) => checkCross(`nameHistory[${j}].origin`, h.origin));
  // "unknown" = researched but origin not found: goes hand in hand with namedAfter: null
  if (v.namedAfter === null && !v.categories.includes("unknown"))
    warn(id, "namedAfter is null but 'unknown' category missing");
  if (v.categories.includes("unknown") && v.namedAfter !== null)
    warn(id, "'unknown' category but namedAfter is set — pick one");
}

// {{...}} link-span markers: at most one per field, balanced, and pointless without a link
function checkBraces(id, field, text, url) {
  if (!text) return;
  const open = (text.match(/\{\{/g) || []).length, close = (text.match(/\}\}/g) || []).length;
  if (open !== close || open > 1) err(id, field, "unbalanced or multiple {{}} markers");
  if (open && !url) warn(id, field, "has {{}} marker but no link");
}

NEIGHBORHOODS.forEach(nb => {
  if (!nb.id || !nb.name || !nb.bbox) err("NEIGHBORHOODS", nb.id || "?", "needs id, name, bbox");
  else if (nb.bbox.s >= nb.bbox.n || nb.bbox.w >= nb.bbox.e) err("NEIGHBORHOODS", nb.id, "bbox has s>=n or w>=e");
});

for (const [key, v] of Object.entries(STREET_DATA)) {
  if (/^(North|South|East|West)\s/i.test(key)) err(key, "keys must omit directional prefixes");
  if (!v.segments) { checkEntry(key, v); continue; }

  // --- segmented street ---
  if (v.orientation !== "NS" && v.orientation !== "EW") err(key, "segmented street needs orientation 'NS' or 'EW'");
  v.segments.forEach((s, i) => {
    const id = key + "::" + i;
    if (!s.label) err(id, "segment missing label");
    else if (s.label.length > 40) warn(id, "label over 40 chars — chips should be a few words");
    checkEntry(id, s);
  });

  // band coverage: every position along the street resolves to exactly one segment
  const isNS = v.orientation === "NS";
  const lo = isNS ? BBOX.s : BBOX.w, hi = isNS ? BBOX.n : BBOX.e;
  const bandOf = s => isNS ? [s.minLat, s.maxLat] : [s.minLng, s.maxLng];
  for (let x = lo; x < hi; x += (hi - lo) / 200) {
    const hits = v.segments.filter(s => {
      const [mn, mx] = bandOf(s);
      return (mn === undefined || x >= mn) && (mx === undefined || x < mx);
    }).length;
    if (hits !== 1) { err(key, `position ${x.toFixed(4)} matches ${hits} segments (bands must tile with no gaps/overlaps)`); break; }
  }

  // canonical chip order: NS = north→south (descending), EW = west→east (ascending)
  const mid = s => {
    const [mn, mx] = bandOf(s);
    return ((mn !== undefined ? mn : lo) + (mx !== undefined ? mx : hi)) / 2;
  };
  for (let i = 1; i < v.segments.length; i++) {
    const prev = mid(v.segments[i - 1]), cur = mid(v.segments[i]);
    if (isNS && cur >= prev) err(key, "segments out of canonical order — N–S streets list north to south");
    if (!isNS && cur <= prev) err(key, "segments out of canonical order — E–W streets list west to east");
  }
}

if (errors) { console.error(`\n${errors} error(s).`); process.exit(1); }
console.log(`All checks pass: ${Object.keys(STREET_DATA).length} streets, ` +
  Object.values(STREET_DATA).reduce((n, v) => n + (v.segments ? v.segments.length : 1), 0) + " entries.");
