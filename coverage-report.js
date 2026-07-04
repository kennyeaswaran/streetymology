// Streetymology coverage report. Run: node coverage-report.js
// Compares street geometry against the data file and prints, per neighborhood,
// what still needs research — sorted by street length, so the prominent
// streets come first. Also flags data entries needing attention.

const fs = require("fs");
const dataSrc = fs.readFileSync(__dirname + "/streets-data.js", "utf8");
const { STREET_DATA, NEIGHBORHOODS } =
  new Function(dataSrc + "; return {STREET_DATA, NEIGHBORHOODS};")();

let geom;
try {
  const gSrc = fs.readFileSync(__dirname + "/streets-geometry.js", "utf8");
  const g = new Function(gSrc + "; return STREET_GEOMETRY;")();
  geom = g.data || g; // current ({signature, data}) or legacy format
} catch (e) {
  console.error("Could not read streets-geometry.js — open the map and click 'Save geometry file' first.");
  process.exit(1);
}

// keep in sync with normalizeName in index.html
const normalize = n => n.replace(/^(North|South|East|West|N\.?|S\.?|E\.?|W\.?)\s+/i, "");

const R = 6371000;
function dist(a, b) { // meters between {lat,lon} points
  const dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180;
  const x = dLon * Math.cos((a.lat + b.lat) / 2 * Math.PI / 180);
  return R * Math.hypot(dLat, x);
}
const inBox = (p, b) => p.lat >= b.s && p.lat < b.n && p.lon >= b.w && p.lon < b.e;

// group ways by normalized name
const streets = new Map(); // name -> { length, hoods:Set, count }
for (const way of geom.elements || []) {
  if (!way.geometry || !way.tags || !way.tags.name) continue;
  const name = normalize(way.tags.name);
  if (!streets.has(name)) streets.set(name, { length: 0, hoods: new Set(), count: 0 });
  const s = streets.get(name);
  s.count++;
  for (let i = 1; i < way.geometry.length; i++) s.length += dist(way.geometry[i - 1], way.geometry[i]);
  const mid = way.geometry[Math.floor(way.geometry.length / 2)];
  NEIGHBORHOODS.forEach(nb => { if (inBox(mid, nb.bbox)) s.hoods.add(nb.name); });
}

const km = m => (m / 1000).toFixed(1) + " km";

// --- entries with no geometry (likely a typo or outside coverage) ---
const orphans = Object.keys(STREET_DATA).filter(k => !streets.has(k));
if (orphans.length) {
  console.log("\n== Data entries with NO matching geometry (typo? outside coverage?) ==");
  orphans.forEach(k => console.log("  -", k));
}

// --- single-entry streets spanning multiple neighborhoods: review reminder ---
const review = [...streets.entries()].filter(([name, s]) =>
  STREET_DATA[name] && !STREET_DATA[name].segments && s.hoods.size > 1);
if (review.length) {
  console.log("\n== Extension review: single-entry streets spanning multiple neighborhoods ==");
  console.log("   (Confirm the entry's history applies to every stretch, or split into segments.)");
  review.forEach(([name, s]) => console.log(`  - ${name}  [${[...s.hoods].join(", ")}]`));
}

// --- per-neighborhood to-do lists ---
for (const nb of NEIGHBORHOODS) {
  const todo = [...streets.entries()]
    .filter(([name, s]) => s.hoods.has(nb.name) && !STREET_DATA[name])
    .sort((a, b) => b[1].length - a[1].length);
  const done = [...streets.keys()].filter(name => streets.get(name).hoods.has(nb.name) && STREET_DATA[name]);
  console.log(`\n== ${nb.name}: ${done.length} researched, ${todo.length} to go ==`);
  todo.forEach(([name, s]) => console.log(`  ${km(s.length).padStart(8)}  ${name}`));
}
console.log("");
