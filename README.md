# Streetymology (working title)

A zoomable, clickable map of street-name history. Prototype area: Downtown Los Angeles.

## Run it

Open `index.html` in a browser (internet required — it loads OSM map tiles and fetches
street geometry live from the Overpass API). For a local server:
`python3 -m http.server` in this folder, then http://localhost:8000.

## How it works

- Basemap: OpenStreetMap tiles via Leaflet.
- Street geometry: fetched at load from Overpass (named highways in the DTLA bounding
  box, defined in `BBOX` in index.html). Ways sharing a name (after stripping N/S/E/W
  prefixes) are grouped into one clickable street.
- Click target: each street segment carries an invisible ~18px-wide stroke, so the
  street's drawn area is clickable without hunting for a hairline.
- Data: `streets-data.js` — one entry per street; see the schema comment at the top of
  that file, which is the general plan for future entries. Key conventions: "by 1849"
  with a link to the Ord/Hutton survey for planned/built when the survey is the earliest
  record; a chronological `nameHistory` (with per-name origin sub-bullets, which may be
  "no namesake documented") only for streets that have been renamed. Streets without an
  entry render grey; entries render blue; filter checkboxes highlight matches in amber.

## Adding a street

Add an entry to `STREET_DATA` in `streets-data.js`, keyed by the street's OSM name
without directional prefix (e.g. "Main Street", not "South Main Street"). Categories
are defined in `CATEGORIES` in the same file — add new ones freely.

## Known limitations / next steps

- Geometry loading order: `streets-geometry.js` if present → browser cache (7 days) →
  Overpass mirrors (20s timeout each). After a successful network load, click
  "Save geometry file" in the panel and move the downloaded `streets-geometry.js`
  next to `index.html` — from then on the map never depends on Overpass. Delete the
  file and reload to refresh geometry from OSM.
- OSM rarely maps streets as areas (`area:highway` coverage is near zero), so true
  street polygons aren't available; the wide invisible stroke approximates "click the
  street itself".
- Name normalization is simple prefix-stripping; watch for collisions (e.g. two
  distinct streets sharing a base name).
- Seed data (7 streets) is summarized from lastreetnames.com — before going public,
  confirm permissions/attribution with Mark Tapio Kines, and diversify sources
  (newspapers.com, LAPL, county tract maps).

## Expanding coverage

Coverage is neighborhood-based: `NEIGHBORHOODS` in `streets-data.js` drives the
Overpass query, the dashed coverage outlines, and the geometry-file staleness
check. `node coverage-report.js` prints the per-neighborhood research to-do list.
Full workflow in ADDING-STREETS.md.

## Research process

Batched by neighborhood (see ADDING-STREETS.md, "Scaling research"). Unverified
hunches and open questions live in `research-leads.md`; sourced claims go
straight into the data even when found incidentally.

## Research resources

- L.A. Street Names (Mark Tapio Kines): https://lastreetnames.com/
- Los Angeles Revisited blog (deep-dives incl. Pearl/Figueroa): https://losangelesrevisited.blogspot.com/
- The Homestead Museum blog (early L.A., incl. Calle Eternidad): https://homesteadmuseum.blog/
- Solano Canyon street-name histories (Buena Vista/N. Broadway dates): https://www.solanocanyon.org/street-name-histories.html
- Ord/Hutton 1849 survey (LAPL): https://tessa2.lapl.org/digital/collection/maps/id/42/
- Calisphere (historic maps & photos): https://calisphere.org/
- California Digital Newspaper Collection (Herald etc., renaming ordinances): https://cdnc.ucr.edu/
- L.A. City Archives & Records Center (Council minutes/ordinances to 1850): https://clerk.lacity.gov/records
- NavigateLA (recorded tract boundaries): https://navigatela.lacity.org/
- L.A. County tract map search (recorded subdivision maps, scanned): https://pw.lacounty.gov/smpm/landrecords/TractMaps.aspx
- Bernice Kimball, "Street Names of Los Angeles" (BOE, 1988) — at LAPL; the city's own renaming compendium
