# Adding streets: the design pattern

How to write entries in `streets-data.js` so every street fits the same pattern.
After any edit, run `node check-data.js` — it enforces most of these rules.

## Philosophy

Boxes are fact-focused: years, names, and links. No narrative prose — that is the
specialty of L.A. Street Names (Kines), which we cite instead of duplicating. Every
year and name claim must be justified by a linked source. Uncertainty is stated,
never papered over: "unverified", "no namesake documented", "not yet researched"
are all legitimate values.

## Workflow for a new street

1. Find the street's OSM name; the data key strips any leading North/South/East/West
   (key "Main Street", not "South Main Street").
2. Research, in rough order: lastreetnames.com → Los Angeles Revisited →
   Homestead Museum blog → Wikipedia → historic maps (LAPL/Calisphere) →
   newspaper archives. (Full list in README.)
3. Decide: single entry, or segments? Segment ONLY if different stretches had
   different name lineages. Different build dates alone can be handled in one
   entry's text.
4. Write the entry (template below), run `node check-data.js`, reload the map.

## Field conventions

- **namedAfter** — one line, with life dates for people. Link the namesake's
  Wikipedia page via `namedAfterLink` when one exists; otherwise null.
  If the origin is uncertain, write "Possibly …" and set `disputed: true` plus
  the "disputed" category.
  By default `namedAfterLink` wraps the *entire* namedAfter string. To link only
  part of it — the normal case — wrap just that part in `{{...}}`, e.g.
  `"{{José Figueroa}} (1792–1835), governor of Alta California 1833–1835"`.
  Link the name itself (plus life dates, for people), not the job description
  or other trailing detail. For a borrowed-name case, link just the place name,
  e.g. `"The port town of {{San Pedro}}, which the street ran toward"`. Same
  marker syntax works in `nameHistory[].origin` / `originLink`; when a source
  only justifies part of the sentence rather than being the namesake's own
  page, put the link on a trailing `{{(source)}}` instead of the whole clause.
- **planned / built** — a string, or `{ text, url }` to link the evidence.
  Convention for old downtown streets: "by 1849" linking the Ord/Hutton survey
  (use the shared `ORD_SURVEY` constant). The 1786 pueblo plan has no street
  names, and no official record exists in between — so 1849 is usually the
  earliest citable date. Remember the survey was partly aspirational: appearing
  on it does not prove the street was built (Hope St existed only on paper until
  the late 1860s). Use "not yet researched" rather than guessing.
- **nameHistory** — ONLY for streets that have been renamed. Chronological;
  each item `{ from, until, name, origin, originLink }`; the final item is the
  current name with `until: null` and usually `origin: null` (the header's
  namedAfter covers it — except when the name arrived by transfer or extension,
  which IS an origin event worth a line, e.g. Figueroa 1897). Each former name
  gets an origin sub-bullet; "no specific namesake documented" is a valid origin.
  Streets that have carried one name since planning/building omit nameHistory
  entirely and just end with the planned/built dates.
- **note** — optional, one line, real content only. No cross-references to other
  stretches (chips handle navigation) and no restating of nameHistory.
- **categories** — at least one. Add new categories to `CATEGORIES` freely, but
  check whether an existing one fits first. Current set: person, alive, governor,
  destination, aspiration, renamed, borrowed, disputed.
- **sources** — every entry needs at least one; include the Kines page whenever
  one exists, plus whatever justifies each specific year/name claim.

## Segments (streets whose stretches have different histories)

When one modern street absorbed several older ones, split it:

- Top level becomes `{ name, orientation, segments: [...] }`.
- `orientation`: "NS" or "EW" (dominant axis; pick the dominant one for diagonals).
- **Canonical segment order = chip order:**
  - N–S streets: north to south (descending latitude)
  - E–W streets: west to east (ascending longitude)
- Bands: `minLat`/`maxLat` for NS, `minLng`/`maxLng` for EW. Bands must tile the
  street with no gaps or overlaps (checker verifies). Boundaries are way-midpoint
  approximations of the historical dividing cross-street; note the cross-street
  in the labels.
- `label`: a few words, e.g. "Chinatown (north of Cesar Chavez)". Locals-legible
  area name first, boundary in parentheses.
- Each segment is a complete entry (its own namedAfter, dates, nameHistory,
  categories, sources). A stretch we haven't researched yet still gets a segment
  with "not yet researched" — that's more honest than letting one stretch's
  history silently claim the whole street.
- When a name moved between roadways (Figueroa 1897), record the transfer as an
  origin line in BOTH roadways' histories: the receiving segment ("name
  transferred from …") and, when we add it, the donor street ("renamed …, its
  name passing to …").

## Adding a neighborhood

Coverage grows neighborhood by neighborhood via the `NEIGHBORHOODS` array at the
top of `streets-data.js` (rough bbox rectangles; use L.A. Times Mapping L.A.
boundaries as the reference for what counts as the neighborhood).

1. Add the neighborhood `{ id, name, bbox }` to `NEIGHBORHOODS`.
2. Open the map. The saved geometry file no longer matches the new coverage, so
   the map refetches from Overpass automatically. Click "Save geometry file" and
   replace `streets-geometry.js` with the download.
3. Run `node coverage-report.js`. It prints, per neighborhood, which streets
   have entries and which still need research, longest first — work down the
   list. It also prints an **extension review** section: single-entry streets
   that now span multiple neighborhoods. For each, decide explicitly:
   - same name lineage along the new stretch → nothing to do;
   - different lineage → split into segments, giving the new stretch its own
     entry (or a "not yet researched" placeholder — never let the old entry
     silently claim the new stretch).
4. Extending a street often crosses a renaming boundary even within one
   neighborhood (Pearl ended at Pico) — check the renaming ordinance's stated
   extent whenever a source gives one.
5. `node check-data.js`, reload the map, commit, push.

## Validation

`node check-data.js` checks: schema completeness, defined categories, source
URLs, nameHistory ends at the present, no obsolete fields, segment band tiling,
canonical chip order, label length, and notes that smell like cross-references.
It exits nonzero on error, so it can gate a future CI/deploy step.
