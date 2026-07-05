# Finding the original recorded map for a street or segment

Verified workflow (walked end-to-end 2026-07 with Wolfskill Orchard Tract).
Recorded subdivision maps give: the recording date, the original platted
street names, the subdivider, and the surveyor — often the single best
primary anchor for `planned` and for pre-newspaper street names.

REQUIRES A BROWSER (Claude in Chrome or a human): NavigateLA and the Assessor
portal are JavaScript apps; fetch tools see nothing.

## The pipeline

1. **Pick an address on the stretch you care about.** Any building address on
   the relevant block (OSM/Google). For a segmented street, pick addresses on
   the specific segment.

2. **NavigateLA** (https://navigatela.lacity.org/navigatela/ — slow to load;
   wait for the spinner):
   - Type the address in the search box, Enter. If "ADDRESS NOT FOUND", pick
     the closest neighbor from the offered list (fine for our purpose).
   - In the Report Window that opens, scroll the report list and click
     **"Parcel Description Report"**.
   - Read off: **Tract** (name), **Map-Ref**, Lot/Block. Map-Ref formats:
     - `M R 30-9/13` = **Miscellaneous Records** book 30, pages 9–13 — the
       series where 1870s–1890s subdivisions live (most of downtown).
     - `M B 52-13` = tract **Map Book** — the post-~1900 tract-map series.
   - (The report window also offers "Cadastral Map" and "Assessor Map" —
     engineering sheets that annotate tract references; useful as backup.)

3. **Get the scanned map** (DPW Land Records):
   - **M R (Misc Records) refs** — URL pattern is reliable, construct it directly:
     `https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf`
     (book folder `MR030`, book+page both 3-digit zero-padded). Multi-page refs
     like 9/13 = pages 009 through 013 — get them all; the title/recording
     block is usually on the first page. You can sanity-check a guessed URL
     with the fetch tool (`mcp__workspace__web_fetch`) before opening a
     browser: a real file reports `Content-Type: application/pdf`, a wrong
     guess reports the DPW "Page Not Found" HTML page. The fetch tool reaches
     this domain fine — but see the network note below before assuming more.
   - **M B (Map Book / Tract) refs** — do NOT guess the plain
     `TR{book}-{page}.pdf` pattern; it 404s more often than not, because the
     real filename frequently carries a letter suffix (`056a`, `056b`, `081A`)
     for reasons that have nothing to do with your tract (see gotcha below).
     Instead, get the exact filename from the book's own page-listing:
     `https://pw.lacounty.gov/smpm/landrecords/List.aspx?type=Tract&book=0159`
     (4-digit book number) — this is a plain page (no login/postback needed)
     that lists every real filename in that book, e.g. `TR0159-032`. Click the
     link (or read its `.href` via `javascript_tool` — see gotcha below) to
     get the real URL, which follows
     `https://pw.lacounty.gov/sur/nas/landrecords/tract/MB{4-digit book}/TR{4-digit book}-{3-digit page}{suffix}.pdf`.
     The TractMaps.aspx browse-by-range page (Map Book table → book →
     individual page) gets you to the same List.aspx URL two clicks slower;
     going straight to `List.aspx?type=Tract&book=XXXX` is faster once you
     know the book number.
   - Note the site's warning: scans may be hand-drawn copies of the originals;
     the originals are at the Registrar-Recorder.

4. **Read the map** (PDFs run 100KB–30MB; some are large images, and virtually
   none of them have a text layer — `web_fetch` on a real one reports "empty
   or contains no machine-readable text"; you have to actually look at it).
   Capture (a) the recording date, (b) the tract's full name, (c) the street
   names AS PLATTED — this is where original names like "Ruth Avenue" appear
   — and (d) subdivider/surveyor names, which are namesake candidates for
   streets named in the tract. **Scan the WHOLE plat, not just the block you
   went looking for** — see "Cross-link every street a map touches" below.

5. **Cite it.** Source entry:
   `{ title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (recorded [date])", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" }`
   and where appropriate: `planned: { text: "by [recording date] (as [original name], [tract])", url: ... }`.

## Cross-link every street a map touches

Once you've opened a tract map for any reason, treat it as a shared resource,
not a single-street lookup:

- **Read every street name drawn on the plat**, not just the one you were
  chasing. A single subdivision map routinely names 4–6 streets at once (the
  Bliss Tract alone: Seaton, Colyton, Carolina/Hewitt, Huber, Poplar,
  Palmetto).
- **Add the map as a source to every one of those streets' entries** (or
  segments) currently in streets-data.js — check `grep` for the street name
  first — UNLESS that street/segment already has an earlier-dated source for
  the same name (don't let a later map crowd out an earlier one; add both if
  the later map adds real information, e.g. a narrower date or a subdivider
  name).
- A name appearing on the map only proves the name existed by the recording
  date on THAT block — if the street continues past the tract's boundary,
  that's still worth a citation on the segment/stretch the map actually
  covers, not the whole street, unless it's a single-entry (unsegmented)
  street where the whole thing shares one history.
- This is cheap to do in the same sitting you're already reading the map —
  expensive to do later, since you'd have to re-open and re-read it.

## Network access notes (2026-07)

- **The sandbox shell's `bash`/`curl` cannot reach `pw.lacounty.gov` at all** —
  confirmed blocked by the outbound proxy (`403 blocked-by-allowlist`).
  Don't waste time trying to `wget`/`curl`/`requests.get` these URLs to
  download a batch for local `pdftoppm`/`pdftotext` processing — it will not
  connect, no matter the tool. (`pdftoppm`/`pdftotext`/`pdfinfo` ARE installed
  in the sandbox, so this would be worth retrying if the allowlist ever
  changes — batch-downloading candidate pages and converting to PNG would be
  faster than one-at-a-time browser round trips.)
- **`mcp__workspace__web_fetch` (the dedicated fetch tool) DOES reach this
  domain** — useful for a fast existence-check on a guessed URL (`Page Not
  Found` HTML vs. `Content-Type: application/pdf`) without spinning up the
  browser. It's a dead end for actually reading a map, though: real tract
  scans report "empty or contains no machine-readable text" (no OCR layer),
  so seeing the content still requires the browser.
- **Only Claude in Chrome can actually render/read a map.** Chrome's native
  PDF viewer frequently gets stuck on page 1 and won't respond to synthetic
  scroll/click/page-number actions (confirmed stuck across many attempts,
  even though zooming shows it's a live capture). Fix: load the same URL
  through Google's viewer instead —
  `https://docs.google.com/viewer?url={URL-encoded PDF URL}&embedded=true` —
  which renders as normal scrollable HTML/DOM content that DOES respond to
  scroll and click.

## Batch mode — the fast path (recommended after 2026-07 experience)

The slow part of the browser pipeline is READING maps: browser round-trips
through the Google-viewer workaround, screenshot by screenshot. Skip all of
that by getting the PDFs into the project folder, where any instance can read
them directly as images — no browser needed for the reading step at all:

1. An instance prepares the shopping list: NavigateLA lookups (browser,
   unavoidable, but fast — it's the PDF reading that was slow) to collect
   Map-Refs for a batch of target streets, then constructs candidate PDF URLs
   and existence-checks them with `mcp__workspace__web_fetch` (Content-Type
   `application/pdf` = real; HTML = wrong guess). Output: a list of verified
   URLs, presented as clickable links.
2. **Kenny downloads the batch** — click each link, save into `tracts/` in the
   project folder (gitignored; they're re-downloadable). A dozen PDFs is a
   couple of minutes of human clicking, versus ~10 browser-minutes each for
   an instance.
3. Any instance (no browser required) converts and reads:
   `pdftoppm -png -r 150 "tracts/MR030-009.pdf" /tmp/mr30` then Read the PNGs
   (re-render at `-r 300` and crop for fine label text). Transcribe street
   names, recording dates, subdivider/surveyor from the title block; apply to
   entries per the conventions above.

This also decouples the roles: a browser session harvests Map-Refs; a
non-browser session (cheaper, faster) does the map-reading and data entry.

## Gotchas found the hard way

- **Page-number suffixes are common and not guessable.** A single page number
  in a Map Book can hold several unrelated filings: `TR0005-056a` was the
  Industrial Tract we wanted; `TR0005-056b` on the very same page number was
  an unrelated Long Beach subdivision (J.W. Boyd Tract), and `TR0005-057a`
  was yet another unrelated Long Beach tract (Palm Island Tract). **Adjacent
  or same-numbered pages are NOT guaranteed to continue or relate to the
  tract you want** — always check the title block of whatever you actually
  load.
- **ASP.NET postback links** (`href="javascript:__doPostBack(...)"`, seen on
  `TractMaps.aspx`'s book-range table) usually do NOT respond to normal
  clicks (coordinate-based or `ref`-based) — many attempts produced no visible
  change. Two working fixes: (1) skip the picker entirely and go straight to
  `List.aspx?type=Tract&book=XXXX` once you know the book number (see above),
  or (2) if you must use the picker, call
  `mcp__claude-in-chrome__javascript_tool` and execute the postback directly,
  e.g. `__doPostBack('ctl00$main$DataListTM$ctl00$LinkButtonTM','')`, then
  read the resulting page. Note that reading a real anchor's `.href` via
  `javascript_tool` sometimes comes back `[BLOCKED: Cookie/query string data]`
  (the tool redacts values that look like session/viewstate data) — if that
  happens, use `find`/`read_page` to get an element `ref` and click it via
  the `computer` tool instead of reading `.href` in JS.
- **NavigateLA search box sometimes drops typed text** if you click+type
  before the page has fully finished loading — retry the click+type+Enter
  sequence once if the box comes back empty.
- **A block's modern NavigateLA Map-Ref can silently stop matching the
  historic tract map you're citing.** Later resubdivisions overwrite the
  Tract/Map-Ref a parcel reports — the county records the LATEST plat, not
  the founding one. Found this checking 3rd St east of Alameda: the block is
  clearly shown as part of the Wolfskill Orchard Tract (M.R. 30-9/13, 1888) on
  the map itself, but a 2026 NavigateLA lookup nearby returned a 20th-century
  resubdivision tract (M.B. 851-82/83) instead — not because the read is
  wrong, but because that block has been replatted since 1888. **Don't treat
  a non-matching modern Tract/Map-Ref as refuting an old map's own drawn
  content** — it only tells you the land was resubdivided later. When this
  happens, cite the historic map on its own evidence and say so explicitly in
  the note (what it shows directly) rather than leaning on a parcel match
  that isn't there.
- **The Assessor's "Lot" field is a free cross-check, and it's easy to
  ignore.** NavigateLA's Parcel Description Report includes a `Lot` field
  (e.g. `LT F`) alongside Tract/Map-Ref — this is the SAME lot lettering
  used on the recorded map itself, and it tells you whether the parcel you
  clicked is actually a labeled lot on the plat (an ordinary building
  parcel) or something else. Cross-checking it against the map BEFORE
  writing up a finding would have caught a real mistake (see next section).

## Verifying a map-feature guess against reality

The riskiest kind of claim in this whole workflow is "this feature on the old
map = this modern street," when the match is inferred from alignment/shape
rather than a literal label. That's exactly where an error happened: a
NavigateLA parcel for a Conway Place address came back with `Tract TR 10542`,
`Lot F` — but the write-up jumped past the `Lot F` field, noticed a *street*
labeled "Industrial Street" running along roughly the right alignment a bit
further south on the same map, and guessed Conway Place was that street
renamed. Kenny caught it by looking at the map himself: `Lot F` is a large,
landlocked interior building lot with no street on it or along it in 1928 at
all; "Industrial Street" is a distinct, separate street on the tract's south
edge. The real (still open) finding is that Conway Place doesn't appear under
any name on the 1928 map — it was evidently cut through later.

Lessons for next time:
- **Check the `Lot` field first, and treat it as authoritative** — it's
  usually a one-letter/one-number match against the map's own lot labels,
  and confirms or refutes a hypothesis in seconds.
- **When the best available evidence is still an eyeballed alignment match**
  (no label, no lot-number confirmation), don't write it into streets-data.js
  as a stated fact. Either flag it explicitly as an unconfirmed inference in
  the note (as ADDING-STREETS.md already asks for), or — better, when the
  claim is the actual new finding rather than incidental context — crop and
  zoom a screenshot of the disputed area and show it to the human before
  committing to the interpretation. A human glancing at the plat catches
  mismatches an instance narrating its own reasoning can talk itself past.

## Reverse direction: tract name → location

The **Assessor Portal Legal Search** (https://portal.assessor.lacounty.gov/ →
LEGAL SEARCH tab) searches parcels by legal-description text: typing
`WOLFSKILL` lists every parcel in the Wolfskill Orchard Tract with addresses —
instantly showing a tract's footprint. Use when a source names a tract
("Downey Harvey tract") and you need to know which streets it touched.

## Caveats

- A street usually crosses MANY tracts; the tract containing a parcel tells
  you about that block, not the whole street. Sample 2–3 addresses per
  stretch, and expect different answers along the way — that's segment
  evidence, not noise.
- A street may predate the tract fronting it (tracts subdivide land along an
  existing road). A name on the tract map proves the name existed BY the
  recording date, not that the tract coined it.
- NavigateLA sometimes needs a second search attempt after first load;
  waits of 4–6 seconds between actions are normal.

## What to run this on first

1. Streets/segments with `planned: "not yet researched"` (grep streets-data.js).
2. The pending extent questions: where Larkin/Short ran (4th St), Lugo (5th),
   the Wolfskill Ave / original-Central boundary, Figueroa south of Pico.
3. Namesake hunches tied to subdivisions: Gladys/Wolfskill-family pattern,
   Agatha (1897 tract?), Ruth Avenue's 1887 tract.
