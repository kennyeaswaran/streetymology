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

3. **Get the scanned map** (DPW Land Records — plain HTML, fetch tools OK):
   - **M R** refs: go to
     `https://pw.lacounty.gov/smpm/landrecords/List.aspx?type=Misc&book=030`
     (3-digit book number) and click the page link, or construct the PDF URL
     directly: `https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf`
     (book and page both 3-digit padded). Multi-page refs like 9/13 = pages
     009 through 013 — get them all; the title/recording block is usually on
     the first page.
   - **M B / TR** refs: https://pw.lacounty.gov/smpm/landrecords/TractMaps.aspx
     → Map Book table → files named `TR 1268-011.pdf` (book 1268, page 011).
   - Note the site's warning: scans may be hand-drawn copies of the originals;
     the originals are at the Registrar-Recorder.

4. **Read the map** (PDFs run 100KB–30MB; some are large images): capture
   (a) the recording date, (b) the tract's full name, (c) the street names AS
   PLATTED — this is where original names like "Ruth Avenue" appear — and
   (d) subdivider/surveyor names, which are namesake candidates for streets
   named in the tract.

5. **Cite it.** Source entry:
   `{ title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (recorded [date])", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" }`
   and where appropriate: `planned: { text: "by [recording date] (as [original name], [tract])", url: ... }`.

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
