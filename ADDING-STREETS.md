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
  stretches of the same street (chips handle that) and no restating of
  nameHistory. Cross-references to OTHER streets use `[[Street Key]]` or
  `[[Street Key|display label]]` — rendered as a link that jumps the map to that
  street and opens its box (the checker verifies targets exist). Use these for
  name-transfer donor/receiver pairs, e.g. 9th ↔ James M. Wood.
- **categories** — at least one. Add new categories to `CATEGORIES` freely, but
  check whether an existing one fits first. Current set: person, alive, governor,
  destination, aspiration, renamed, borrowed, disputed, nature, descriptive,
  place, number, event, unresearched. Use "unresearched" for an entry with
  `namedAfter: null` and genuinely nothing found yet (not simply an uncertain
  candidate — that's "disputed") — e.g. a street outside Kines's coverage where
  no source turned up an origin at all. Swap it out once research lands.
- **sources** — every entry needs at least one; include the Kines page whenever
  one exists, plus whatever justifies each specific year/name claim.
- **When research comes up empty** — a street you've genuinely looked into but
  whose origin no source explains gets `namedAfter: null` plus the "unknown"
  category ("Researched — origin not yet found"; renders violet on the map,
  distinct from grey = not yet researched at all). The checker enforces that
  `namedAfter: null` and "unknown" travel together. Keep sources as the record
  of what WAS found (context, dates, neighboring history), and use the note for
  clearly-labeled leads (e.g. Gladys and the Wolfskill-family naming pattern) —
  speculation is fine in a note as long as it's flagged as speculation.

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

### Executing a split (turning a "segment candidate" note into segments)

1. Confirm the extent from the source ("Vine street, south of First" — you
   need the bounding cross-street, not a vague "north end").
2. Get the boundary coordinate: `node intersect.js "Central Avenue" "2nd Street"`
   prints the intersection lat/lng and the band value to use.
3. Restructure the entry: top level `{ name, orientation, segments: [...] }`,
   canonical order (N→S / W→E), each segment complete with its own
   nameHistory/categories/sources. The stretch whose history you DON'T know
   still gets a segment with honest unknowns.
4. Remove the "segment candidate" note text; the chips now say it.
5. `node check-data.js` (band tiling + order are verified), reload the map,
   click both stretches, and check the chips jump correctly.
6. If only part of a boundary is known (e.g. Central's Wolfskill/original-
   Central line), split where you CAN and leave a note in the southern segment
   saying it may split again — don't wait for perfect knowledge.

### Batch verification (for humans)

End every research batch by listing all new or substantially changed entries
in the final message/commit description. The reviewer (usually Kenny) can then
type each name into the map's search box — it lists every entry, including
segments — to eyeball the popup: links work, dates read right, chips point the
right way.

## Scaling research: batches, leads, and review

- **Work in per-neighborhood batches of ~5–8 streets** (from the
  coverage-report to-do list), one instance per batch. Don't research streets
  one-at-a-time in isolation: the payoff is cross-street context — renaming
  petitions covered several streets at once, families named clusters of
  streets, and one street's Kines page routinely documents its neighbors.
- **Sourced beats complete.** A claim that arrives incidentally (street B's
  history found on street A's page) goes straight into B's entry with that
  citation, even if B hasn't had its full pass — partial entries with
  "not yet researched" fields are fine. Only UNSOURCED material (inferences,
  patterns, recollections) waits in `research-leads.md`.
- **research-leads.md** is the parking lot for hunches and open questions,
  dated, one bullet each. Consume a street's leads during its full pass;
  sweep the file periodically; move closed items to its Resolved section.
- **Separate author from reviewer.** Draft entries in one session (or
  sub-agent), review in another: run `node check-data.js`, spot-check the
  boldest claim of the batch against its source, and check keys against
  geometry via `node coverage-report.js` (orphan section). For large sweeps,
  one sub-agent per neighborhood — never per street — handed this guide and
  the leads file.

## Omnibus documents (one article, dozens of streets)

Some primary documents — the 1897 street-renaming committee report, big
annexation ordinances, tract filings — document many street actions at once.
When you find one, STOP working your current street and bank the document
first:

1. **Transcribe the full list immediately** into a dedicated file
   `omnibus-<year>-<slug>.md` (e.g. omnibus-1897-renaming.md): permalink at
   the top, then every renaming/creation/extension the document records, one
   line each, keeping the document's extent language verbatim ("X street from
   A to B changed to Y") — the extents are what later decide whole-street vs.
   segment. Transcribe even the streets you don't care about yet; the article
   was hard to find and OCR is painful to re-read.
2. **Classify each item** against current coverage (the geometry street list —
   `node coverage-report.js` names them all): IN COVERAGE / OUT (parked for
   future neighborhoods) / GONE (street no longer exists).
3. **Apply to in-coverage streets**: add the citation to each affected entry,
   and for each decide — whole-street renaming (nameHistory line), partial
   extent (new segment), or mere context (note). Tick items off in the omnibus
   file as applied, so partial progress is visible.
4. **Point research-leads.md at the file** with a one-line status (e.g.
   "omnibus-1897-renaming.md: 12/40 applied"). Parked items stay in the
   omnibus file — when a new neighborhood is added, sweep the omnibus files
   before doing fresh research; citations may be waiting.

## Official records for renamings and tracts

**The primary-anchor principle: every entry should ultimately carry at least
one primary-record source** — the Ord/Hutton survey, a Council
ordinance/minutes, a contemporary newspaper report of the action, or a
recorded tract map. Not every name had a Council action (organic pre-1849
names, tract-map names), but every *dated claim* traces to one of these
trails. Secondary sources (Kines, blogs) are fine as interim citations;
upgrading to a primary anchor is standing work — `node check-data.js` reports
how many entries have one. The trails:

- **City Council ordinances and minutes** — every official renaming (e.g.
  Wolfskill→Central 1897, Castelar→Hill 1960) was a Council action. The L.A.
  City Archives & Records Center (Erwin Piper Technical Center) holds minutes
  and indexes back to 1850; recent decades are searchable online via the City
  Clerk's Council File Index.
- **Newspaper reports of Council actions** — often the easiest linkable proxy
  for the ordinance itself. The California Digital Newspaper Collection
  (cdnc.ucr.edu) has the Herald from the 1870s–1900s free (see the Hill Street
  entry's 1874 citation); the L.A. Times archive via LAPL/ProQuest covers the
  rest. NOTE for automated instances: CDNC pages are JavaScript-rendered, so
  fetch tools see empty pages — reading them requires a browser (Claude in
  Chrome) or a human; prepared search recipes live in research-leads.md.
- **Tract maps** — new streets (and their first names) appear on recorded
  subdivision maps, e.g. the Wolfskill Tract or Kysor's Central Park tract.
  Full verified street→tract→scanned-map workflow: see **TRACT-RESEARCH.md**
  (NavigateLA Parcel Description Report gives tract name + Map-Ref; DPW Land
  Records serves the scan; Assessor Legal Search goes tract-name→location).
  This turns testimony like "Downey Harvey tract, recorded Aug. 2, 1886" into
  a linkable primary scan.
- **Bernice Kimball, “Street Names of Los Angeles” (Bureau of Engineering,
  1988)** — the BOE's own compendium of name changes, compiled from city
  records; not online, but LAPL holds it, and Kines relies on it. Worth
  consulting to pin dates the web can't.

## Freeways and numbered streets

- Freeways are in scope. For most, `namedAfter` is the route number's meaning in
  its numbering system — the 5, the 10, and the 405 are meaningful Interstate
  identifiers even on stretches with no other name. Link the system's page and
  add a "system" category when the first such entry lands. The older routes
  (Arroyo Seco Parkway, Harbor/Hollywood/Santa Ana freeways) predate the
  Interstate plan and have genuine name histories deserving full entries.
- Numbered streets share a template via the `numberedStreet(name, opts)` helper
  in streets-data.js: `namedAfter` = ordinal position in the downtown grid,
  numbering in place by 1849 (1846 claims are doubtful — see 1st Street, the
  anchor entry). Category "number"; streets south of the survey's edge (14th+)
  override planned with "not yet researched". Still check each one for its own
  history: renamings flow both ways (10th → Olympic Blvd 1935; 9th west of
  Figueroa → James M. Wood Blvd 1997), so a numbered street can be a donor or
  absorber like any other — record transfers on both sides via `opts`.

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
