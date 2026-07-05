// Find the intersection of two streets in the loaded geometry — used when
// executing a segment split to get the boundary coordinate.
// Usage: node intersect.js "Central Avenue" "2nd Street"

const fs = require("fs");
const g = new Function(fs.readFileSync(__dirname + "/streets-geometry.js", "utf8") + "; return STREET_GEOMETRY;")();
const geom = g.data || g;
const normalize = n => n.replace(/^(North|South|East|West|N\.?|S\.?|E\.?|W\.?)\s+/i, "");

const [a, b] = process.argv.slice(2);
if (!a || !b) { console.error('Usage: node intersect.js "Street A" "Street B"'); process.exit(1); }

function points(name) {
  const pts = [];
  for (const w of geom.elements) {
    if (!w.geometry || !w.tags || !w.tags.name) continue;
    if (normalize(w.tags.name) === name) pts.push(...w.geometry);
  }
  return pts;
}

const pa = points(a), pb = points(b);
if (!pa.length || !pb.length) {
  console.error(`No geometry for: ${!pa.length ? a : b} (names must match OSM minus N/S/E/W prefix)`);
  process.exit(1);
}

let best = { d: Infinity };
for (const p of pa) for (const q of pb) {
  const d = Math.hypot(p.lat - q.lat, (p.lon - q.lon) * 0.83); // rough lat/lng scaling
  if (d < best.d) best = { d, lat: (p.lat + q.lat) / 2, lon: (p.lon + q.lon) / 2 };
}

console.log(`${a} × ${b}`);
console.log(`  lat ${best.lat.toFixed(5)}   lng ${best.lon.toFixed(5)}`);
console.log(`  (~${Math.round(best.d * 111000)} m between nearest points${best.d > 0.001 ? " — LARGE: streets may not actually meet" : ""})`);
console.log(`  For NS-street bands: minLat/maxLat ${best.lat.toFixed(4)}`);
console.log(`  For EW-street bands: minLng/maxLng ${best.lon.toFixed(4)}`);
