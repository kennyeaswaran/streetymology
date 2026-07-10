// Streetymology — street data for Downtown Los Angeles
// Keyed by normalized street name (directional prefixes N/S/E/W stripped).
// Design note: popups are deliberately fact-focused (years, names, links) rather than
// narrative — prose street biographies are the specialty of lastreetnames.com, which
// we link as a source instead of duplicating.
//
// Schema (general plan for future streets):
//   name           display name
//   namedAfter     who/what the current name honors (short, no narrative).
//                  namedAfterLink wraps the whole string by default; to link only
//                  part of it (the usual case — the namesake's name, not a trailing
//                  job description or aside), wrap that part in {{...}}, e.g.
//                  "{{José Figueroa}} (1792–1835), governor of Alta California
//                  1833–1835". Same {{...}} marker works on nameHistory[].origin /
//                  originLink — use a trailing {{(source)}} when the link is a
//                  citation rather than the namesake's own page.
//   namedAfterLink Wikipedia (or similar) page for the namesake, or null
//   planned        first documented appearance on a plan/survey. String, or
//                  { text, url } to link the plan itself. For most downtown streets
//                  this is "by 1849" linking the Ord/Hutton survey — the city's first;
//                  the 1786 pueblo plan appears to predate street names, and no
//                  official record exists in between.
//   built          when it physically existed as a street (same string-or-object form).
//                  Streets on the 1849 survey were not necessarily built then — the
//                  survey was partly aspirational (see Hope Street).
//   nameHistory    chronological array of { from, until (null = present), name,
//                  origin, originLink } — include ONLY for streets that have been
//                  renamed. Each former name gets its own origin sub-bullet; origin
//                  may be "no namesake documented" when the record is silent.
//                  Streets that have carried one name since planning/building omit
//                  this and simply end with the planned/built dates.
//   note           optional one-line caveat (e.g. a different street once shared a name)
//   categories     tags used by the filter checkboxes
//   disputed       true if the origin attribution is uncertain
//   sources        array of { title, url } justifying the years and names
//
// SEGMENTS: when different stretches of a modern street have different name
// lineages (Broadway's downtown stretch was Fort St; its Chinatown stretch was
// Calle Eternidad), the top-level entry is { name, orientation, segments: [...] }
// where each segment carries the full schema above plus:
//   label          short stretch description (a few words; shown as a chip)
//   minLat/maxLat  which stretch a clicked block belongs to (by way midpoint
//   minLng/maxLng  latitude for N–S streets, longitude for E–W streets;
//                  boundaries are approximate and refinable — a future version
//                  could split by cross-street or explicit way lists)
// orientation is "NS" or "EW". CANONICAL SEGMENT ORDER (= chip order):
//   N–S streets: north to south (descending latitude)
//   E–W streets: west to east (ascending longitude)
// Each segment is its own clickable entity with its own box. A name whose
// footprint moved between roadways (Figueroa, 1897) thus appears in the history
// of each roadway it touched, which is the honest way around — the map selects
// pavement, not names. See ADDING-STREETS.md for the full authoring guide;
// run `node check-data.js` after editing.

// Coverage areas. Adding a neighborhood here expands the map query and redraws
// the dashed coverage outlines; see ADDING-STREETS.md ("Adding a neighborhood").
// Bboxes are rough rectangles; for what counts as each neighborhood, use the
// L.A. Times Mapping L.A. boundaries as the reference.
const NEIGHBORHOODS = [
  { id: "dtla", name: "Downtown", bbox: { s: 34.033, w: -118.272, n: 34.068, e: -118.225 } }
];

const ORD_SURVEY = {
  title: "Ord/Hutton survey, “Plan de la Ciudad de Los Angeles” (Aug. 29, 1849)",
  url: "https://tessa2.lapl.org/digital/collection/maps/id/42/"
};

// The county recorder's certified copy of the Ord survey, filed in Miscellaneous
// Records book 53 (pages 66–73), "A full true and correct copy of original …
// recorded Dec. 2, 1893" (Arthur Bray, County Recorder). A recorder's note on
// sheet 67 splits the plat: portions WEST of Main St on pp. 67-69, EAST of Main
// on pp. 70-72, and the portion NORTH of the Plaza on p. 73. A recorded-map
// primary anchor for the 1849 grid, parallel to the LAPL scan above.
const ORD_RECORDED = {
  title: "Recorded map: Ord's Survey, county-recorder's certified copy, M.R. 53-66/73 (“A full true and correct copy of original,” recorded Dec. 2, 1893) — sheets 68–69 draw the original downtown grid, including the numbered cross streets (Calle 1ª–8ª)",
  url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-068.pdf"
};

const STREET_DATA = {
  "Figueroa Street": {
    name: "Figueroa Street",
    orientation: "NS",
    segments: [
      {
        label: "Pico → White Knoll",
        minLat: 34.040,
        name: "Figueroa Street",
        namedAfter: "{{José Figueroa (1792–1835)}}, governor of Alta California 1833–1835",
        namedAfterLink: "https://en.wikipedia.org/wiki/Jos%C3%A9_Figueroa",
        planned: { text: "by 1849", url: ORD_SURVEY.url },
        built: "by 1849",
        nameHistory: [
          { from: "1849", until: "1874", name: "Calle de los Chapules (“Grasshopper Street”)",
            origin: "named after the insect: grasshoppers crossing this line from the western plains doomed the grape harvest",
            originLink: null },
          { from: "1874", until: "1897", name: "Pearl Street",
            origin: "property owners along Grasshopper Street petitioned for “Pearl Street” over a rival “Union Avenue” proposal; the Herald's report of the Feb. 26, 1874 council debate names no petitioner or namesake — though in 1897, ex-Mayor J. R. Toberman claimed the naming as his own {{(source)}}",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18740227.2.10" },
          { from: "Feb. 1897", until: null, name: "Figueroa Street",
            origin: "Pearl Street was renamed Figueroa Street “being a continuation of that thoroughfare”; the older Figueroa Street (c. 1853–1857) a few blocks west was simultaneously renamed De La Guerra, then Boylston within weeks {{(source)}}",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970202.2.34" }
        ],
        note: null,
        categories: ["person", "governor", "renamed"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Figueroa Street", url: "https://lastreetnames.com/street/figueroa-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Lost LA: The Evolution of a Corner (PBS SoCal)", url: "https://www.pbssocal.org/shows/lost-la/the-evolution-of-a-corner-downtown-l-a-at-figueroa-seventh" },
          { title: "Los Angeles Revisited: The Pulchritude of Pearl Street", url: "https://losangelesrevisited.blogspot.com/2019/01/the-pulchritude-of-pearl-street.html" },
          { title: "Wikipedia: Figueroa Street", url: "https://en.wikipedia.org/wiki/Figueroa_Street" },
          { title: "Los Angeles Herald, “City and Suburbs,” Feb. 27, 1874", url: "https://cdnc.ucr.edu/?a=d&d=LAH18740227.2.10" },
          { title: "Los Angeles Herald, “Work for Unemployed,” Feb. 2, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970202.2.34" },
          { title: "Los Angeles Herald, “Party Lines Knocked Out in the Council,” Feb. 24, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970224.2.20" },
          { title: "Los Angeles Herald, “A Storm of Words” (Toberman's protest; Pearl→Figueroa upheld), Feb. 19, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" }
        ]
      },
      {
        label: "south of Pico",
        maxLat: 34.040,
        name: "Figueroa Street",
        namedAfter: "{{José Figueroa (1792–1835)}}, governor of Alta California 1833–1835",
        namedAfterLink: "https://en.wikipedia.org/wiki/Jos%C3%A9_Figueroa",
        planned: null,
        built: { text: "already \"Figueroa Street\" by Aug. 1895 (near 20th & Flower)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR059/MR059-056.pdf" },
        note: "Pearl ended at Pico, so this stretch needed no 1897 rename. A recorded tract map (Edgar's Subdivision resubdivision, 1895) already labels it \"Figueroa Street\" a year before the citywide renaming — evidence it is the older southern continuation of the pre-1897 Figueroa Street whose downtown stretch became De La Guerra, left untouched rather than renamed alongside Pearl.",
        categories: ["person", "governor"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Figueroa Street", url: "https://lastreetnames.com/street/figueroa-street/" },
          { title: "Los Angeles Revisited: The Pulchritude of Pearl Street", url: "https://losangelesrevisited.blogspot.com/2019/01/the-pulchritude-of-pearl-street.html" },
          { title: "Recorded map: Resubdivision of Edgar's Subdivision of part of Lot 3, Block 1, Hancock's Survey City Donation Lots, M.R. 59-56 (surveyed Aug. 31, 1895 by John Goldsworthy; recorded Mar. 9, 1896)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR059/MR059-056.pdf" }
        ]
      }
    ]
  },

  "Spring Street": {
    name: "Spring Street",
    namedAfter: "Possibly Trinidad Ortega (1832–1903), nicknamed “Primavera” (“Spring”)",
    namedAfterLink: null,
    planned: { text: "by 1849", url: ORD_SURVEY.url },
    built: "by 1849",
    nameHistory: [
      { from: "before 1849", until: "?", name: "Calle Cuidado (“Caution Street”)",
        origin: "unverified — reported in some accounts", originLink: null },
      { from: "?", until: "1849", name: "Calle de Caridad (“Charity Street”)",
        origin: "unverified — a name also carried by today's Grand Avenue", originLink: null },
      { from: "1849", until: null, name: "Spring Street", origin: null, originLink: null }
    ],
    note: "The Ortega attribution first appears in print in 1911; earlier accounts suggested only the season.",
    categories: ["person", "alive", "renamed", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Spring Street", url: "https://lastreetnames.com/street/spring-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 68 labels this street “Calle Primavera” (primavera = spring); the “Calle de Caridad” of the history above is a separate street on the same sheet (“Charity St,” now Grand Avenue)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-068.pdf" },
      { title: "Wikipedia: Spring Street (Los Angeles)", url: "https://en.wikipedia.org/wiki/Spring_Street_(Los_Angeles)" }
    ]
  },

  "Hope Street": {
    name: "Hope Street",
    namedAfter: "The virtue of hope, or possibly Dr. Alexander W. Hope (c. 1820–1856)",
    namedAfterLink: null,
    planned: { text: "by 1849 (as Calle de las Esperanzas)", url: ORD_SURVEY.url },
    built: "late 1860s",
    note: "The 1849 survey was aspirational here — the street existed only on paper for two decades. The “Faith, Hope, and Charity” trio theory is unproven (no Faith Street existed); the Alexander Hope attribution is also unproven.",
    categories: ["aspiration", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Hope Street", url: "https://lastreetnames.com/street/hope-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 68 draws and labels this street “Hope St”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-068.pdf" }
    ]
  },

  "Grand Avenue": {
    name: "Grand Avenue",
    namedAfter: "Nothing specific — chosen as a pleasant replacement for “Charity”",
    namedAfterLink: null,
    planned: { text: "by 1849 (as Charity Street)", url: ORD_SURVEY.url },
    built: "1869 (first block, between 5th and 6th)",
    nameHistory: [
      { from: "1849", until: "1886–1887", name: "Charity Street (Calle de Caridad)",
        origin: "the virtue; residents petitioned for a change, tired of jokes about “living on charity”",
        originLink: null },
      { from: "1886–1887", until: null, name: "Grand Avenue", origin: null, originLink: null }
    ],
    note: null,
    categories: ["aspiration", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Grand Avenue", url: "https://lastreetnames.com/street/grand-avenue/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 68 labels this street “Charity St / Calle de Caridad”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-068.pdf" },
      { title: "Wikipedia: Grand Avenue (Los Angeles)", url: "https://en.wikipedia.org/wiki/Grand_Avenue_(Los_Angeles)" }
    ]
  },

  "Temple Street": {
    name: "Temple Street",
    namedAfter: "{{John (Jonathan) Temple (1796–1866)}}, merchant; opened the city's first general store",
    namedAfterLink: "https://en.wikipedia.org/wiki/Jonathan_Temple",
    planned: null,
    built: "by 1859",
    note: "Named while its namesake was alive.",
    categories: ["person", "alive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Temple Street", url: "https://lastreetnames.com/street/temple-street/" },
      { title: "Wikipedia: Jonathan Temple", url: "https://en.wikipedia.org/wiki/Jonathan_Temple" }
    ]
  },

  "San Pedro Street": {
    name: "San Pedro Street",
    namedAfter: "The port town of {{San Pedro}}, which the street ran toward",
    namedAfterLink: "https://en.wikipedia.org/wiki/San_Pedro,_Los_Angeles",
    planned: null,
    built: "by 1853",
    note: "No longer reaches San Pedro; it merges into Avalon Blvd. Its northernmost block, on the edge of Little Tokyo, became [[Judge John Aiso Street]] in 1997.",
    categories: ["destination"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: San Pedro Street", url: "https://lastreetnames.com/street/san-pedro-street/" },
      { title: "Wikipedia: San Pedro Street", url: "https://en.wikipedia.org/wiki/San_Pedro_Street" }
    ]
  },

  "Broadway": {
    name: "Broadway",
    orientation: "NS",
    segments: [
      {
        label: "Chinatown (north of Cesar Chavez)",
        minLat: 34.0595,
        name: "North Broadway",
        namedAfter: "Extension of downtown's Broadway name (itself borrowed from New York's {{Broadway}}) to this older street in 1909",
        namedAfterLink: "https://en.wikipedia.org/wiki/Broadway_(Manhattan)",
        planned: { text: "by 1849 (as Calle Eternidad)", url: ORD_SURVEY.url },
        built: "by 1849",
        nameHistory: [
          { from: "1849", until: "1888", name: "Calle Eternidad / Eternity Street",
            origin: "led to Calvary Cemetery (est. 1844) — though an 1895 account claims it was “so named because it had neither beginning nor end” {{(source)}}",
            originLink: "https://homesteadmuseum.blog/2016/07/18/museum-director-musings-through-the-viewfinder-on-calle-eternidad-1880s/" },
          { from: "1888", until: "Nov. 1909", name: "Buena Vista Road / Street",
            origin: "renamed (“good view”) when Alfred Solano's 1888 survey extended it past Solano Canyon to the L.A. River {{(source)}}",
            originLink: "https://www.solanocanyon.org/buena-vista-road.html" },
          { from: "Nov. 1909", until: null, name: "North Broadway", origin: null, originLink: null }
        ],
        note: "Resisted several earlier attempts at the Broadway renaming before 1909.",
        categories: ["renamed", "borrowed", "disputed"],
        disputed: true,
        sources: [
          { title: "Solano Canyon history: Buena Vista Road", url: "https://www.solanocanyon.org/buena-vista-road.html" },
          { title: "Homestead Museum: Calle Eternidad in the 1880s", url: "https://homesteadmuseum.blog/2016/07/18/museum-director-musings-through-the-viewfinder-on-calle-eternidad-1880s/" },
          { title: "L.A. Street Names: Broadway", url: "https://lastreetnames.com/street/broadway/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Recorded map: Ord's Survey (E.O.C. Ord's Aug. 29, 1849 “Plan de la Ciudad de Los Angeles”), county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 73, the “portion north of Plaza,” labels this street “Calle de Eternidad / Eternity St”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-073.pdf" }
        ]
      },
      {
        label: "downtown (south of Cesar Chavez)",
        maxLat: 34.0595,
        name: "Broadway",
        namedAfter: "New York City's {{Broadway}}, via an 1890 renaming petition by printer Fred Lind Alles",
        namedAfterLink: "https://en.wikipedia.org/wiki/Broadway_(Manhattan)",
        planned: { text: "by 1849 (as Fort Street)", url: ORD_SURVEY.url },
        built: "by 1849",
        nameHistory: [
          { from: "1849", until: "1890", name: "Fort Street",
            origin: "named after {{Fort Moore}}, built on a nearby hill after the Mexican–American War",
            originLink: "https://en.wikipedia.org/wiki/Fort_Moore" },
          { from: "Feb. 1890", until: null, name: "Broadway", origin: null, originLink: null }
        ],
        note: "Farther south, much of Moneta Ave. also became Broadway (1925–26).",
        categories: ["renamed", "borrowed"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Broadway", url: "https://lastreetnames.com/street/broadway/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheets 68–69 label this street “Fort Street / Calle Fortin”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-069.pdf" },
          { title: "Wikipedia: Broadway (Los Angeles)", url: "https://en.wikipedia.org/wiki/Broadway_(Los_Angeles)" }
        ]
      }
    ]
  },

  "Olive Street": {
    name: "Olive Street",
    namedAfter: "{{The olive}} — though no specific tree or grove at the site is documented",
    namedAfterLink: "https://en.wikipedia.org/wiki/Olive",
    planned: { text: "by 1849", url: ORD_SURVEY.url },
    built: "by 1869 (earliest press mention)",
    note: null,
    categories: ["nature"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Olive Street", url: "https://lastreetnames.com/street/olive-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 68 labels this street “Olive St / Calle Accytuna” (aceituna = olive)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-068.pdf" }
    ]
  },

  "Main Street": {
    name: "Main Street",
    namedAfter: "Its status as the pueblo's principal street — an anglicization of Calle Principal",
    namedAfterLink: null,
    planned: null,
    built: "by 1781 (likely one of the original pueblo's two roads from the plaza)",
    nameHistory: [
      { from: "c. 1781", until: "?", name: "Calle Real (“Royal Road”)",
        origin: "standard Spanish colonial designation for a settlement's principal road", originLink: null },
      { from: "?", until: "c. 1849", name: "Calle Principal",
        origin: "descriptive — the principal street", originLink: null },
      { from: "c. 1849", until: null, name: "Main Street",
        origin: "anglicization, fixed by the Ord/Hutton survey; first found in print May 1851 {{(source)}}",
        originLink: "https://lastreetnames.com/street/main-street-los-angeles/" }
    ],
    note: "Some historians argue Ord mislabeled the 1849 map and the true Calle Principal is today's Los Angeles Street.",
    categories: ["descriptive", "renamed", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Main Street", url: "https://lastreetnames.com/street/main-street-los-angeles/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheets 68–69 label this street “Main Street / Calle Principal”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-069.pdf" },
      { title: "Wikipedia: Main Street (Los Angeles)", url: "https://en.wikipedia.org/wiki/Main_Street_(Los_Angeles)" }
    ]
  },

  "Los Angeles Street": {
    name: "Los Angeles Street",
    orientation: "NS",
    segments: [
      {
        label: "Plaza block (former Calle de los Negros)",
        minLat: 34.0551,
        name: "Los Angeles Street",
        namedAfter: "Extension of the Los Angeles Street name when it absorbed this block in 1910",
        namedAfterLink: null,
        planned: null,
        built: "not yet researched",
        nameHistory: [
          { from: "?", until: "1910", name: "Calle de los Negros (“Negro Alley”)",
            origin: "origin of the name is debated, and few if any Black residents are documented; the block became L.A.'s first Chinatown and was the site of the {{1871 anti-Chinese massacre}}",
            originLink: "https://en.wikipedia.org/wiki/Chinese_massacre_of_1871" },
          { from: "1910", until: null, name: "Los Angeles Street", origin: null, originLink: null }
        ],
        note: null,
        categories: ["renamed", "place", "disputed"],
        disputed: true,
        sources: [
          { title: "L.A. Street Names: Los Angeles Street", url: "https://lastreetnames.com/street/los-angeles-street/" },
          { title: "Wikipedia: Calle de los Negros", url: "https://en.wikipedia.org/wiki/Calle_de_los_Negros" }
        ]
      },
      {
        label: "south of Arcadia St",
        maxLat: 34.0551,
        name: "Los Angeles Street",
        namedAfter: "The city itself — ultimately from {{Nuestra Señora de los Ángeles de Porciúncula}}, the 1769 Spanish naming of the L.A. River",
        namedAfterLink: "https://en.wikipedia.org/wiki/History_of_Los_Angeles",
        planned: "not yet researched",
        built: "by 1854",
        note: null,
        categories: ["place"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Los Angeles Street", url: "https://lastreetnames.com/street/los-angeles-street/" },
          { title: "Wikipedia: Los Angeles Street", url: "https://en.wikipedia.org/wiki/Los_Angeles_Street" }
        ]
      }
    ]
  },

  "1st Street": {
    name: "1st Street",
    namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
    namedAfterLink: null,
    planned: { text: "by 1849", url: ORD_SURVEY.url },
    built: "by 1849",
    note: "Since 1883, 1st Street divides north from south in L.A. addresses (as Main Street divides east from west). Claims dating the numbering to 1846 are doubtful.",
    categories: ["number"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: 1st Street", url: "https://lastreetnames.com/street/0001st-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
    ]
  },

  "Flower Street": {
    name: "Flower Street",
    namedAfter: "Supposedly the blossom-covered hills behind the street",
    namedAfterLink: null,
    planned: { text: "by 1849", url: ORD_SURVEY.url },
    built: "c. 1869 (vacant for twenty years after the survey)",
    note: "The tale that it was once “Faith Street” (completing Faith/Hope/Charity, per Harris Newmark's 1916 memoir) has zero documentary support — Flower has been its only name.",
    categories: ["nature", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Flower Street", url: "https://lastreetnames.com/street/flower-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 68 draws and labels this street “Flower” (the westernmost platted street, against the hills)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-068.pdf" }
    ]
  },

  "Boylston Street": {
    name: "Boylston Street",
    namedAfter: "Boston's {{Boylston Street}}, suggested in 1897 by financier O.T. Johnson (1839–1916)",
    namedAfterLink: "https://en.wikipedia.org/wiki/Boylston_Street",
    planned: null,
    built: "c. 1853–1857 (as the original Figueroa Street)",
    nameHistory: [
      { from: "c. 1853–1857", until: "Feb. 1897", name: "Figueroa Street",
        origin: "honored Gov. José Figueroa; the 1897 street-renaming committee moved the name a few blocks east onto the former Pearl Street, “being a continuation of that thoroughfare” {{(source)}}",
        originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970202.2.34" },
      { from: "Feb. 1897", until: "Feb. 1897", name: "De La Guerra Street",
        origin: "the committee's proposed replacement name for the stretch between 3rd and 6th; at the Feb. 23, 1897 council session O.T. Johnson's representative objected and Boylston was substituted on the spot, on motion of Councilman Toll {{(source)}}",
        originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970224.2.20" },
      { from: "1897", until: null, name: "Boylston Street", origin: null, originLink: null }
    ],
    note: "The donor side of the [[Figueroa Street]] name transfer.",
    categories: ["borrowed", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Boylston Street", url: "https://lastreetnames.com/street/boylston-street/" },
      { title: "L.A. Street Names: Figueroa Street", url: "https://lastreetnames.com/street/figueroa-street/" },
      { title: "Los Angeles Herald, “Work for Unemployed,” Feb. 2, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970202.2.34" },
      { title: "Los Angeles Herald, “Party Lines Knocked Out in the Council,” Feb. 24, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970224.2.20" }
    ]
  },

  "Georgia Street": {
    name: "Georgia Street",
    namedAfter: "{{Georgia Herrick Bell}} (1845–1899), wife of Major Horace Bell, on whose land the street was laid out",
    namedAfterLink: "https://lastreetnames.com/street/georgia-street/",
    planned: null,
    built: "by 1874",
    nameHistory: [
      { from: "1874", until: "1883–1890 (sources differ)", name: "Georgia Street",
        origin: "christened on Bell land; later renamed Georgia Bell to avoid conflict with another, now-defunct Georgia Street {{(source)}}",
        originLink: "https://lastreetnames.com/street/georgia-street/" },
      { from: "by 1890", until: "Feb. 1897", name: "Georgia Bell Street",
        origin: "adjoining stretches platted as Nevada Street (on 1886 Downey Harvey and Dunnigan tract maps) were folded in as Georgia Bell on May 10, 1889, per Gen. Forman's 1897 testimony {{(source)}}",
        originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
      { from: "Feb. 1897", until: null, name: "Georgia Street",
        origin: "the renaming commission proposed reverting to “Nevada”; after Major Bell's furious protest the council compromised on Georgia — one of the street's own former names — and Bell dropped his threatened lawsuit {{(source)}}",
        originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970227.2.12" }
    ],
    note: "The Georgia→Georgia Bell renaming date is unsettled: Kines says 1883; Forman testified Sept. 11, 1890 (or 1880 — OCR unclear). The \"other, now-defunct Georgia Street\" that prompted the original rename is very likely the short \"Georgia St\" on the 1888-recorded Wolfskill Orchard Tract map east of Alameda — now part of [[3rd Street]]'s eastern segment, across downtown from this street.",
    categories: ["person", "alive", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Georgia Street", url: "https://lastreetnames.com/street/georgia-street/" },
      { title: "Los Angeles Herald, “A Storm of Words” (Forman's dated history), Feb. 19, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
      { title: "Los Angeles Herald, editorial note (Georgia compromise passed), Feb. 24, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970224.2.15" },
      { title: "Los Angeles Herald, “Signed the Ordinance,” Feb. 27, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970227.2.12" }
    ]
  },

  "Delong Street": {
    name: "Delong Street",
    namedAfter: "{{George W. De Long}} (1844–1881), Arctic explorer who died leading the Jeannette expedition",
    namedAfterLink: "https://en.wikipedia.org/wiki/George_W._DeLong",
    planned: null,
    built: "not yet researched",
    nameHistory: [
      { from: "?", until: "by 1897", name: "Virginia Street",
        origin: "per Major Horace Bell, named for his daughter Virginia {{(source)}}",
        originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
      { from: "by 1897", until: null, name: "Delong Street",
        origin: "renamed by City Engineer Dockweiler in the explorer's honor — as Dockweiler himself confirmed at the Feb. 18, 1897 hearing {{(source)}}",
        originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" }
    ],
    note: "Not covered by Kines; renaming date (pre-1897) not yet researched.",
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "Los Angeles Herald, “A Storm of Words,” Feb. 19, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
      { title: "Wikipedia: George W. DeLong", url: "https://en.wikipedia.org/wiki/George_W._DeLong" }
    ]
  },

  "Hill Street": {
    name: "Hill Street",
    orientation: "NS",
    segments: [
      {
        label: "Chinatown (north of Cesar Chavez)",
        minLat: 34.0595,
        name: "North Hill Street",
        namedAfter: "Extension of downtown's Hill Street name to this older street in 1960",
        namedAfterLink: null,
        planned: { text: "by 1849 (as Calle del Toro)", url: ORD_SURVEY.url },
        built: "not yet researched",
        nameHistory: [
          { from: "1849", until: "Feb. 1874", name: "Calle del Toro (“Bull Street”)",
            origin: "no specific namesake documented; bullfights were reportedly held in the area until 1872",
            originLink: null },
          { from: "Feb. 1874", until: "1960", name: "Castelar Street",
            origin: "renamed by petition, apparently for {{Emilio Castelar}}, president of Spain's First Republic",
            originLink: "https://en.wikipedia.org/wiki/Emilio_Castelar" },
          { from: "1960", until: null, name: "North Hill Street", origin: null, originLink: null }
        ],
        note: "The Feb. 1874 renaming was part of a wider petition that also covered Grasshopper Street (→ Union Avenue) and Wasp Street (→ Yale Street).",
        categories: ["renamed", "nature"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Hill Street", url: "https://lastreetnames.com/street/hill-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Wikipedia: Hill Street (Los Angeles)", url: "https://en.wikipedia.org/wiki/Hill_Street_(Los_Angeles)" },
          { title: "Recorded map: Ord's Survey (E.O.C. Ord's Aug. 29, 1849 “Plan de la Ciudad de Los Angeles”), county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 73, the “portion north of Plaza,” labels this street “Calle del Toro” and shows the 809 N Hill St parcel as Lot 6, Block 37 (bounded west by Calle de las Virgenes, now W Alpine St)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-073.pdf" },
          { title: "Los Angeles Herald, Feb. 14, 1874: “Common Council” (petition renaming Bull St. to Castelar)", url: "http://cdnc.ucr.edu/cgi-bin/cdnc?a=d&d=LAH18740214.2.12" },
          { title: "Los Angeles Times, Mar. 25, 1960: “Castelar St. Now Is Hill”", url: "https://web.archive.org/web/20151125171258/https://pqasb.pqarchiver.com/latimes/doc/167676581.html" }
        ]
      },
      {
        label: "downtown (south of Cesar Chavez)",
        maxLat: 34.0595,
        name: "Hill Street",
        namedAfter: "{{Bunker Hill}} — the knoll the street ran along, though the hill itself wasn't formally named until 1873, after the street",
        namedAfterLink: "https://en.wikipedia.org/wiki/Bunker_Hill_(Los_Angeles)",
        planned: { text: "by 1849", url: ORD_SURVEY.url },
        built: "by 1849",
        note: null,
        categories: ["nature"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Hill Street", url: "https://lastreetnames.com/street/hill-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheets 68–69 label this street “Hill Street / Calle Loma” (loma = hill/knoll)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-068.pdf" },
          { title: "Wikipedia: Hill Street (Los Angeles)", url: "https://en.wikipedia.org/wiki/Hill_Street_(Los_Angeles)" },
          { title: "Wikipedia: Bunker Hill (Los Angeles)", url: "https://en.wikipedia.org/wiki/Bunker_Hill_(Los_Angeles)" }
        ]
      }
    ]
  },

  "Wilde Street": {
    name: "Wilde Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Sits in the same warehouse pocket as [[Industrial Street]] and [[Merchant Street]], near Central Ave and 4th Place; no source found for the name's origin, and not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Industrial Street": {
    name: "Industrial Street",
    namedAfter: "Descriptive of the surrounding warehouse and manufacturing district",
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Today lined with early-20th-century warehouses turned lofts (Toy Factory Lofts, Biscuit Company Lofts) in the Arts District.",
    categories: ["descriptive"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Merchant Street": {
    name: "Merchant Street",
    namedAfter: "Descriptive — presumably for the wholesale merchants of the surrounding produce/warehouse district",
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: null,
    categories: ["descriptive"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Wholesale District, Los Angeles", url: "https://en.wikipedia.org/wiki/Wholesale_District,_Los_Angeles" }
    ]
  },

  "Mateo Street": {
    name: "Mateo Street",
    namedAfter: "{{Matthew Keller}} (c. 1811–1881), Irish-born shopkeeper, vintner, and city councilman known by the Spanish honorary “Don Mateo”",
    namedAfterLink: "https://en.wikipedia.org/wiki/Matthew_Keller",
    planned: null,
    built: { text: "already \"Mateo\" by Jan. 1887 (the Jan. 1887 additional-lots sheet of the Mills and Wicks Extension of Second St. tract), directly bordering the \"Keller Est.\" label", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" },
    note: "Keller's Rising Sun Vineyard once covered the ground just west of the street; he also owned Rancho Topanga Malibu, sold by his son to the {{Rindge}} family in 1892. The tract's Jan. 1887 sheet confirms Mateo, labeled right against \"Keller Est.,\" but still doesn't mention [[Molino Street|Molino]].",
    categories: ["person"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Mateo Street", url: "https://lastreetnames.com/street/mateo-street/" },
      { title: "Wikipedia: Matthew Keller", url: "https://en.wikipedia.org/wiki/Matthew_Keller" },
      { title: "Los Angeles Revisited: Downtown's Mateo Street & Keller Street", url: "https://losangelesrevisited.blogspot.com/2011/02/downtowns-mateo-street-keller-street.html" },
      { title: "Recorded map: Mills and Wicks Extension of Second St. and adjoining subdivision, M.R. 13-88 (additional lots sheet, Jan. 1887) — labels this street \"Mateo,\" bordering \"Keller Est.\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" }
    ]
  },

  "Traction Avenue": {
    name: "Traction Avenue",
    namedAfter: "The electric traction motor that powered streetcars via a trolley pole and overhead wire — the streetcars once ran along it to the nearby [[Santa Fe Avenue|Santa Fe]] depot",
    namedAfterLink: null,
    planned: null,
    built: { text: "platted as \"Second St\" by Apr.–May 1886 (Mills and Wicks Extension of Second St. tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" },
    nameHistory: [
      { from: "1886", until: "?", name: "Second Street",
        origin: "platted as the eastward extension of downtown's [[2nd Street]] on the Mills and Wicks Extension tract — the tract's own name advertises this — immediately adjacent to [[Hewitt Street|Hewitt]]; evidently this stretch parted ways with the numbered grid rather than staying \"2nd\"",
        originLink: null },
      { from: "?", until: "1915", name: "Stephenson Avenue",
        origin: "no namesake documented; rename date from \"Second\" not yet found", originLink: null },
      { from: "1915", until: null, name: "Traction Avenue",
        origin: "renamed to avoid confusion with the Eastside's bigger, busier Stephenson Avenue, which itself was renamed Whittier Boulevard just five years later {{(source)}}",
        originLink: "https://lastreetnames.com/street/traction-avenue/" }
    ],
    note: "Ground zero for the Arts District's punk-era scene: Al's Bar (1979–2001) and Joel Bloom's General Store (1994) both sat at Traction & [[Hewitt Street|Hewitt]]. Platted as \"Second St,\" a westward-grid street rather than a destination road, it took the streetcar-era \"Traction\" name (via Stephenson) — a fuller break from the numbered grid than most renamed downtown streets get.",
    categories: ["renamed", "descriptive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Traction Avenue", url: "https://lastreetnames.com/street/traction-avenue/" },
      { title: "Recorded map: Mills and Wicks Extension of Second St. and adjoining subdivision, M.R. 13-87 (Apr.–May 1886) — labels this street \"Second,\" immediately east of Hewitt St", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" }
    ]
  },

  "Colyton Street": {
    name: "Colyton Street",
    namedAfter: "The English town of {{Colyton}}, Devon, near the birthplace of tract developer Dr. Frederick Preston Howard (1835–1900), who platted the street",
    namedAfterLink: "https://en.wikipedia.org/wiki/Colyton",
    planned: null,
    built: "1886",
    note: "One block east of Seaton Street, also named in 1886 on Howard's tract for a nearby English town (Seaton is 3 miles from Colyton). Howard's tract also included Huber Street (now part of [[4th Street]]) and Carolina Street (now [[Hewitt Street]]); Kines hasn't found a record proving Howard specifically hailed from the Colyton/Seaton area, though it's a reasonable inference.",
    categories: ["place", "borrowed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Colyton Street", url: "https://lastreetnames.com/street/colyton-street/" },
      { title: "Wikipedia: Colyton", url: "https://en.wikipedia.org/wiki/Colyton" },
      { title: "Recorded map: F.P. Howard & Co.'s Subdivision of the Bliss Tract, M.R. 12-42 (Aug. 1886, recorded Dec. 6, 1886) — labels this street \"Colyton\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" }
    ]
  },

  "Santa Fe Avenue": {
    name: "Santa Fe Avenue",
    namedAfter: "The {{Atchison, Topeka & Santa Fe Railway}} (“the Santa Fe”), whose passenger depot opened near the street's junction with [[1st Street]]",
    namedAfterLink: "https://en.wikipedia.org/wiki/Atchison,_Topeka_and_Santa_Fe_Railway",
    planned: null,
    built: "named May 1887, when the AT&SF officially reached Los Angeles",
    nameHistory: [
      { from: "1886", until: "1887", name: "Tulip Street",
        origin: "platted as \"Tulip\" on the Goodwin Tract, recorded Oct. 6, 1886 — the stretch south of 6th St, between [[Imperial Street|Imperial]] (then \"Palm\") and [[Mesquit Street|Mesquit]]",
        originLink: null },
      { from: "1887", until: null, name: "Santa Fe Avenue",
        origin: "renamed for the {{Atchison, Topeka & Santa Fe Railway}} when it reached Los Angeles in May 1887, a few months after the Goodwin Tract's \"Tulip\" plat",
        originLink: "https://en.wikipedia.org/wiki/Atchison,_Topeka_and_Santa_Fe_Railway" }
    ],
    note: "“Santa Fe” was aspirational even for the railroad itself — no AT&SF train reached the city of Santa Fe until 1880. The company's “La Grande” station opened at Santa Fe & 3rd in 1893; passenger service moved to Union Station in 1939 and the AT&SF folded in 1996. The old freight depot near 2nd is now home to SCI-Arc.",
    categories: ["place", "aspiration", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Santa Fe Avenue", url: "https://lastreetnames.com/street/santa-fe-avenue/" },
      { title: "Recorded map: Plan of the Goodwin Tract, M.R. 11-42 (recorded Oct. 6, 1886, at the request of M.L. Wicks) — labels this street \"Tulip\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR011/MR011-042.pdf" }
    ]
  },

  "Hewitt Street": {
    name: "Hewitt Street",
    orientation: "NS",
    segments: [
      {
        label: "north of 4th",
        minLat: 34.0436,
        name: "Hewitt Street",
        namedAfter: null,
        namedAfterLink: null,
        planned: null,
        built: { text: "already \"Hewitt St\" by May 19, 1875 (Map of the Thomas Tract) and again on the Mills and Wicks Extension of Second St. tract's original Apr.–May 1886 sheet", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-060.pdf" },
        note: "This stretch shows no \"Carolina\" phase on either recorded map — it appears to have carried the name \"Hewitt\" from its earliest platting, unlike the stretch south of 4th (see that segment). Home to ArtShare L.A., around the corner from [[4th Place]].",
        categories: ["unknown"],
        disputed: false,
        sources: [
          { title: "Recorded map: Map of the Thomas Tract, being a portion of the Johnson and Mott Tract, M.R. 3-60/61 (recorded May 19, 1875, at the request of Milton Thomas) — labels this street \"Hewitt\" (Lot 1, Block E = 106 S Hewitt St per NavigateLA)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-060.pdf" },
          { title: "Recorded map: Mills and Wicks Extension of Second St. and adjoining subdivision, M.R. 13-87 (Apr.–May 1886 sheet) — labels this street \"Hewitt\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" }
        ]
      },
      {
        label: "4th to Palmetto (Bliss Tract)",
        maxLat: 34.0436,
        name: "Hewitt Street",
        namedAfter: null,
        namedAfterLink: null,
        planned: null,
        built: null,
        nameHistory: [
          { from: "1886", until: "?", name: "Carolina Street",
            origin: "named on Dr. Frederick Preston Howard's tract, likely for his wife Caroline (née Huber) {{(source)}} — corroborated by the Mills and Wicks Extension tract's separate Jan. 24, 1887 sheet, which shows the SAME corridor, immediately south of 4th/Huber St, also labeled \"Carolina\" (bordering \"O.H. Bliss\")",
            originLink: "https://lastreetnames.com/street/colyton-street/" },
          { from: "?", until: null, name: "Hewitt Street",
            origin: "not yet researched — namesake and rename date unconfirmed; not covered by Kines",
            originLink: null }
        ],
        note: "Home to Al's Bar (1979–2001) and Joel Bloom's General Store (opened 1994 at Traction & Hewitt) — the punk-era venues credited with giving the Arts District its name and first unofficial mayor. The name-change boundary (vs. the \"Hewitt\" stretch north of 4th) matches the Mills and Wicks tract's internal boundary: its Apr.–May 1886 sheet labels \"Hewitt,\" its Jan. 1887 addition \"Carolina\" — both one recorded filing.",
        categories: ["renamed", "unknown"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Colyton Street (Carolina St. → Hewitt St., on the Howard tract)", url: "https://lastreetnames.com/street/colyton-street/" },
          { title: "Recorded map: F.P. Howard & Co.'s Subdivision of the Bliss Tract, M.R. 12-42 (Aug. 1886, recorded Dec. 6, 1886) — labels this street \"Carolina\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" },
          { title: "L.A. Weekly: How the Arts District Got Its Name", url: "https://www.laweekly.com/how-the-arts-district-got-its-name/" },
          { title: "Recorded map: Mills and Wicks Extension of Second St. and adjoining subdivision, M.R. 13-88 (Jan. 24, 1887 addition sheet) — labels this street \"Carolina\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" }
        ]
      }
    ]
  },

  "Palmetto Street": {
    name: "Palmetto Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "1886 (on the Bliss Tract, wholly within it)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" },
    note: "In the Arts District warehouse pocket alongside [[Mateo Street]] and [[Hewitt Street]]; not covered by Kines and no namesake turned up yet. The recorded Bliss Tract map notes \"Palmetto St as herein shown is 30 feet wide and is wholly within the Bliss Tract\" — the south boundary of Howard's 1886 subdivision (see [[Seaton Street]], [[Colyton Street]], [[Hewitt Street]]).",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Recorded map: F.P. Howard & Co.'s Subdivision of the Bliss Tract, M.R. 12-42 (Aug. 1886, recorded Dec. 6, 1886) — labels this street \"Palmetto\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" },
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Factory Place": {
    name: "Factory Place",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "buildings on it date to the 1920s (Factory Place Arts Complex)",
    note: "Possibly descriptive of the warehouse/manufacturing buildings lining it, but unconfirmed — flagged as speculation. 1300 and 1308 Factory Place began as a smoked-fish plant and a stationery warehouse before their 1981 conversion into some of L.A.'s first artist lofts; not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Factory Place Arts Complex: About", url: "https://factorypl.com/about/" },
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Willow Street": {
    name: "Willow Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "already \"Willow St\" by Oct. 6, 1886 (Plan of the Goodwin Tract, at the request of M.L. Wicks)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR011/MR011-042.pdf" },
    note: "In the Arts District warehouse pocket; not covered by Kines. Possibly descriptive (a tree name, as with several other downtown streets), but unconfirmed — flagged as speculation, not a sourced claim. Named alongside [[Mesquit Street|Mesquit]] on the same Goodwin Tract plat.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" },
      { title: "Recorded map: Plan of the Goodwin Tract, M.R. 11-42 (recorded Oct. 6, 1886, at the request of M.L. Wicks; Frank Gibson, County Recorder) — labels this street \"Willow\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR011/MR011-042.pdf" }
    ]
  },

  "Molino Street": {
    name: "Molino Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "“Molino” is Spanish for “mill” — possibly descriptive of a mill once on or near the street, but this is speculation; no source confirms it and Kines hasn't covered the street.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Merrick Street": {
    name: "Merrick Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Meets [[4th Street]] at the former Coca-Cola bottling plant (built 1915, now the Fourth & Traction complex); not covered by Kines and no namesake found yet.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Imperial Street": {
    name: "Imperial Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "already \"Palm St\" by Oct. 6, 1886 (Plan of the Goodwin Tract) — renamed \"Imperial\" by an unresearched later date", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR011/MR011-042.pdf" },
    nameHistory: [
      { from: "1886", until: "?", name: "Palm Street",
        origin: "platted as \"Palm\" on the Goodwin Tract, recorded Oct. 6, 1886 — one of a run of tree/plant-themed street names ([[Willow Street|Willow]], Palm, [[Santa Fe Avenue|Tulip]], [[Mesquit Street|Mesquit]]) south of 6th St",
        originLink: null },
      { from: "?", until: null, name: "Imperial Street",
        origin: "rename date and reason not yet researched",
        originLink: null }
    ],
    note: "Unrelated to Imperial Highway (named 1929–31 for Imperial County produce traffic, far to the south); this short Arts District street's rename is a separate, still only partly researched event. Not covered by Kines.",
    categories: ["renamed", "unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" },
      { title: "Recorded map: Plan of the Goodwin Tract, M.R. 11-42 (recorded Oct. 6, 1886, at the request of M.L. Wicks) — labels this street \"Palm\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR011/MR011-042.pdf" }
    ]
  },

  "Seaton Street": {
    name: "Seaton Street",
    namedAfter: "The English seaside town of {{Seaton}}, Devon, three miles from Colyton — likely the birthplace region of tract developer Dr. Frederick Preston Howard (1835–1900), who platted the street",
    namedAfterLink: "https://en.wikipedia.org/wiki/Seaton,_Devon",
    planned: null,
    built: "1886",
    note: "One block west of [[Colyton Street]], named the same year on the same Howard tract, which also included Huber Street (now part of [[4th Street]]) and Carolina Street (now [[Hewitt Street]]).",
    categories: ["place", "borrowed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Seaton Street", url: "https://lastreetnames.com/street/seaton-street/" },
      { title: "Recorded map: F.P. Howard & Co.'s Subdivision of the Bliss Tract, M.R. 12-42 (Aug. 1886, recorded Dec. 6, 1886) — labels this street \"Seaton\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" }
    ]
  },

  "Myers Street": {
    name: "Myers Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Runs along the Arts District's LA River edge, historically linked to Boyle Heights by the First Street Bridge/Viaduct; not covered by Kines and no namesake confirmed yet.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Anderson Street": {
    name: "Anderson Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Runs along the Arts District's southeastern edge toward the river; not covered by Kines (whose Anderson Avenue entry, a 1969 Vietnam-veteran memorial street in Carson, is a different roadway) and no namesake found yet.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Mill Street": {
    name: "Mill Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "already \"Mill St.\" by Dec. 1903 (Industrial Tract survey, between Alameda and Mateo, north of 7th St)", url: "https://pw.lacounty.gov/sur/nas/landrecords/tract/MB0005/TR0005-056a.pdf" },
    note: "Possibly descriptive, recalling one of early L.A.'s zanja-powered gristmills (e.g. the 1830s \"Stearns' Mill\" on N. Spring St), but no source ties this street to a mill — speculation only. It sits several blocks from the [[Molino Street|Molino]]/[[Hewitt Street|Hewitt]] cluster near 4th–5th, whose separate 1886 tract doesn't mention Mill at all — the two \"mill\"-suggesting names appear unrelated. Not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Recorded map: Industrial Tract, M.B. 5-56 (surveyed Dec. 1903, recorded Mar. 15, 1904)", url: "https://pw.lacounty.gov/sur/nas/landrecords/tract/MB0005/TR0005-056a.pdf" },
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Utah Street": {
    name: "Utah Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Possibly part of a state-name tract pattern (cf. [[Georgia Street]], Connecticut Street) common in 1880s L.A. subdivisions, but unconfirmed for this street — flagged as speculation. Not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Decatur Street": {
    name: "Decatur Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Possibly for naval hero Stephen Decatur (1779–1820), a common namesake for American streets of this name, but unconfirmed here — flagged as speculation. Not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Jesse Street": {
    name: "Jesse Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "already existing by Dec. 1928 (shown cutting the SE corner near Mill/Mateo/Industrial St)", url: "https://pw.lacounty.gov/sur/nas/landrecords/tract/MB0159/TR0159-032.pdf" },
    note: "Runs along the Arts District's southeastern edge toward Boyle Heights; not covered by Kines and no namesake found yet.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Recorded map: Tract No. 10542, M.B. 159-32/33 (Dec. 1928) — shows Jesse St already in place at the SE corner of the tract", url: "https://pw.lacounty.gov/sur/nas/landrecords/tract/MB0159/TR0159-032.pdf" },
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Mesquit Street": {
    name: "Mesquit Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "already \"Mesquit\" by Oct. 6, 1886 (Plan of the Goodwin Tract, at the request of M.L. Wicks)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR011/MR011-042.pdf" },
    note: "Between the 6th and 7th Street viaducts; possibly descriptive (mesquite), but unconfirmed — flagged as speculation. Site of the planned Bjarke Ingels-designed 670 Mesquit mixed-use project. Not covered by Kines. The recorded Goodwin Tract map (which also names [[Willow Street|Willow]] and [[6th Street|6th]] St, called \"Sixth\") already spells it \"Mesquit\" without the terminal E, matching the modern street sign.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" },
      { title: "Recorded map: Plan of the Goodwin Tract, M.R. 11-42 (recorded Oct. 6, 1886, at the request of M.L. Wicks; Frank Gibson, County Recorder) — labels this street \"Mesquit\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR011/MR011-042.pdf" }
    ]
  },

  "Keller Street": {
    name: "Keller Street",
    namedAfter: "{{Matthew Keller}} (c. 1811–1881) — the same “Don Mateo” Keller honored on [[Mateo Street]] — who was one of the promoters of the Aliso Tract that this street was platted as part of",
    namedAfterLink: "https://en.wikipedia.org/wiki/Matthew_Keller",
    planned: "1869, on the Aliso Tract survey",
    built: "not yet researched",
    note: "Originally the tract's northernmost street, with house lots platted on both sides per a historic Aliso Tract map (Seaver Center, Natural History Museum); today a quiet back street behind the city's Piper Tech building, reachable from Ramirez Street.",
    categories: ["person"],
    disputed: false,
    sources: [
      { title: "Los Angeles Revisited: Downtown's Mateo Street & Keller Street", url: "https://losangelesrevisited.blogspot.com/2011/02/downtowns-mateo-street-keller-street.html" },
      { title: "Wikipedia: Matthew Keller", url: "https://en.wikipedia.org/wiki/Matthew_Keller" }
    ]
  },

  "4th Place": {
    name: "4th Place",
    namedAfter: "A short spur off [[4th Street]] in the numbered downtown grid — not a distinct namesake",
    namedAfterLink: null,
    planned: null,
    built: { text: "the 813 E 4th Place parcel (Lot 77) is platted on the Mills and Wicks Extension of Second St. tract, M.R. 13-87/88 (surveyed Apr.–May 1886, additional lots Jan. 1887), fronting the street labeled \"Third\" there", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" },
    note: "Runs between Mateo and Molino streets; home to the 1980s gallery/performance space Dangerous Curve (on an unsafe bend of the street) and, around the corner on Hewitt, the youth arts nonprofit ArtShare L.A. Not covered by Kines.",
    categories: ["number", "descriptive"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" },
      { title: "Recorded map: Mills and Wicks Extension of Second St. and adjoining subdivision, M.R. 13-87/88 (Apr.–May 1886, additional lots Jan. 1887; subdivided at the request of M.L. Wicks and Howard W. Mills, under the direction of Geo. C. Knox) — Lot 77, the parcel at 813 E 4th Place per NavigateLA, fronts the street there labeled \"Third\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" }
    ]
  },

  "7th Place": {
    name: "7th Place",
    namedAfter: "A short spur off [[7th Street]] in the numbered downtown grid — not a distinct namesake",
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Not covered by Kines; no distinct history found beyond its position in the numbered street grid.",
    categories: ["number", "descriptive"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Channing Street": {
    name: "Channing Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "In the Arts District warehouse pocket; not covered by Kines and no namesake found yet.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Conway Place": {
    name: "Conway Place",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "block resubdivided Dec. 1928 as Tract No. 10542, itself carved from Lots K, L, N, O & Q of the 1903–04 Industrial Tract and from Tract No. 1879", url: "https://pw.lacounty.gov/sur/nas/landrecords/tract/MB0159/TR0159-032.pdf" },
    note: "In the Arts District warehouse pocket; not covered by Kines and no namesake found yet. The parcel NavigateLA returns for a Conway Place address is \"Lot F\" (20,129 sq. ft.) of the 1928 Tract No. 10542 map — a large interior lot with no street through it; Conway Place itself doesn't appear in 1928, so it was evidently cut through Lot F later, name and date unconfirmed.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Recorded map: Tract No. 10542, M.B. 159-32/33 (Dec. 1928, resubdivision of the Industrial Tract and Tract No. 1879)", url: "https://pw.lacounty.gov/sur/nas/landrecords/tract/MB0159/TR0159-032.pdf" },
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Lawrence Street": {
    name: "Lawrence Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "In the Arts District warehouse pocket; not covered by Kines and no namesake found yet.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Avery Street": {
    name: "Avery Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "In the Arts District warehouse pocket; not covered by Kines and no namesake found yet (unrelated to the Avery McCarthy of Melrose Avenue's origin story, in Hollywood).",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  "Plaza Del Sol": {
    name: "Plaza Del Sol",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "Spanish for “Plaza of the Sun” — possibly a modern, descriptive development name rather than a personal namesake, but unconfirmed, flagged as speculation. A short modern lane, in the same naming style as other recent Arts District plaza names (Blossom Plaza, Jerry Moss Plaza). Not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arts District, Los Angeles", url: "https://en.wikipedia.org/wiki/Arts_District,_Los_Angeles" }
    ]
  },

  // TODO when South L.A. coverage is added: a third segment — the southern
  // stretch carried the Central name from 1883 (central to Vernon); the
  // Wolfskill/original-Central boundary is not yet pinned (see southern
  // segment's note).
  "Central Avenue": {
    name: "Central Avenue",
    orientation: "NS",
    segments: [
      {
        label: "1st → 2nd (former Vine St)",
        minLat: 34.0477,
        name: "Central Avenue",
        namedAfter: "Extension of the Central Avenue name over this block in the Feb. 1897 citywide renaming",
        namedAfterLink: null,
        planned: null,
        built: "not yet researched",
        nameHistory: [
          { from: "?", until: "Feb. 1897", name: "Vine Street",
            origin: "origin not yet researched; Vine north of 1st kept its name in 1897 (that stretch no longer exists) {{(source)}}",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
          { from: "Feb. 1897", until: null, name: "Central Avenue", origin: null, originLink: null }
        ],
        note: null,
        categories: ["renamed", "descriptive"],
        disputed: false,
        sources: [
          { title: "Los Angeles Herald, “A Storm of Words” (Vine St, south of 1st, → Central), Feb. 19, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
          { title: "Los Angeles Herald, “Talking Retrenchment,” Feb. 21, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ]
      },
      {
        label: "south of 2nd (former Wolfskill Ave)",
        maxLat: 34.0477,
        name: "Central Avenue",
        namedAfter: "Central not to Los Angeles but to {{Vernon}}, just south of the city limits when it was platted",
        namedAfterLink: "https://en.wikipedia.org/wiki/Vernon,_California",
        planned: null,
        built: "by 1883; put on the map by 1887 via Ezra F. Kysor's Central Park tract",
        nameHistory: [
          { from: "by 1887", until: "Feb. 1897", name: "Wolfskill Avenue",
            origin: "named for {{William Wolfskill}}'s old citrus ranch, which this stretch ran through; already labeled \"Wolfskill\" on the recorded 1887 Wolfskill Orchard Tract map, on the tract's edge nearest Alameda",
            originLink: "https://en.wikipedia.org/wiki/William_Wolfskill" },
          { from: "Feb. 1897", until: null, name: "Central Avenue",
            origin: "renamed per the city's street-renaming committee's report, among changes made “in response to urgent requests made before the committee” {{(source)}}",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ],
        note: "Where Wolfskill Ave ended and the original (1883) Central began is not yet pinned — this segment's southern history may split again. Central's stretch through South L.A. became the heart of Black Los Angeles in the 20th century — a history outside current coverage.",
        categories: ["descriptive", "renamed"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Central Avenue", url: "https://lastreetnames.com/street/central-avenue/" },
          { title: "Wikipedia: William Wolfskill", url: "https://en.wikipedia.org/wiki/William_Wolfskill" },
          { title: "Los Angeles Herald, “Talking Retrenchment,” Feb. 21, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" },
          { title: "Los Angeles Herald, “A Storm of Words” (Vine St extent: south of 1st), Feb. 19, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
          { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, July–Aug. 1887) — labels this edge \"Wolfskill\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" }
        ]
      }
    ]
  },

  "Alameda Street": {
    name: "Alameda Street",
    namedAfter: "Spanish for a tree-lined avenue, from {{álamo}} (“cottonwood tree”)",
    namedAfterLink: "https://en.wiktionary.org/wiki/alameda",
    planned: null,
    built: "named Feb. 2, 1855, though the road (or an earlier one nearby) may already have been informally called an alameda",
    note: "Runs from Chinatown to Wilmington (20+ miles); railroad tracks have paralleled it since 1869, when the Los Angeles & San Pedro Railroad — SoCal's first locomotive line — opened.",
    categories: ["nature", "descriptive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Alameda Street", url: "https://lastreetnames.com/street/alameda-street/" }
    ]
  },

  "Agatha Street": {
    name: "Agatha Street",
    namedAfter: "Agatha Sabichi (1871–1963), daughter of prominent landowner and City Council president {{Frank Sabichi}} (1842–1900), on whose land the street was platted",
    namedAfterLink: "https://en.wikipedia.org/wiki/Frank_Sabichi",
    planned: null,
    built: { text: "recorded Sept. 21, 1897 (Wilde and Strong's Subdivision of the Frank Sabichi Tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR066/MR066-064.pdf" },
    note: "Her mother Magdalena was a daughter of pioneer settler William Wolfskill; Agatha later married water-board president John Joseph Fay Jr. The tract map (owners Frank and Magdalena Sabichi) shows Agatha as a new cross street through the family's land, between [[Towne Avenue]], [[Crocker Street]], [[Stanford Avenue]] (platted \"Ruth\"), and [[Gladys Avenue]] — all continuing south from the 1887 Wolfskill Orchard Tract.",
    categories: ["person", "alive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Agatha Street", url: "https://lastreetnames.com/street/agatha-street/" },
      { title: "Wikipedia: Frank Sabichi", url: "https://en.wikipedia.org/wiki/Frank_Sabichi" },
      { title: "Recorded map: Wilde and Strong's Subdivision of the Frank Sabichi Tract, M.R. 66-64 (surveyed by V.J. Rowan, Sept. 1897; recorded Sept. 21, 1897)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR066/MR066-064.pdf" }
    ]
  },

  "Kohler Street": {
    name: "Kohler Street",
    namedAfter: "Charles Kohler (1830–1887), San Francisco-based wine merchant (of Kohler & Frohling) whose vineyards once covered this ground",
    namedAfterLink: null,
    planned: null,
    built: "1887",
    note: "A different, earlier Kohler Street once ran where [[9th Street]] now lies, between San Pedro and Alameda; this stretch took on the name in 1887, months after Kohler suffered a fatal stroke on a San Francisco cable car.",
    categories: ["person"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Kohler Street", url: "https://lastreetnames.com/street/kohler-street/" }
    ]
  },

  "Gladys Avenue": {
    name: "Gladys Avenue",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "1887 (platted as \"Gladys\" in the Wolfskill Orchard Tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" },
    note: "In the heart of Skid Row (Gladys Park sits at 6th & Gladys). Platted in the 1887 Wolfskill Orchard Tract with [[Towne Avenue]], [[Crocker Street]], and [[Stanford Avenue]] (platted \"Ruth\") — the next street over from Ruth, continuing south across the Frank Sabichi Tract that produced [[Agatha Street]], the women's-name pattern. No source names a Wolfskill relative or associate called Gladys; not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "LA Parks: Gladys Park (6th & Gladys St.)", url: "https://recreation.parks.lacity.gov/park/6th-gladys-street" },
      { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, July–Aug. 1887)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" },
      { title: "Recorded map: H.C. Halfpenny's Resubdivision of a part of Block 24 of the Wolfskill Orchard Tract, M.R. 54-84 (recorded Feb. 28, 1895) — Gladys and Ruth named as the block's bounding streets", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR054/MR054-084.pdf" },
      { title: "Recorded map: Wilde and Strong's Subdivision of the Frank Sabichi Tract, M.R. 66-64 (recorded Sept. 21, 1897) — Gladys shown continuing south alongside Ruth, Towne, and Crocker", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR066/MR066-064.pdf" }
    ]
  },

  "Ceres Avenue": {
    name: "Ceres Avenue",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "1887 (platted as \"Ceres\" in the Wolfskill Orchard Tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" },
    note: "Ceres was the Roman goddess of agriculture and the harvest — a tempting fit for a street platted in 1887 in the Wolfskill Orchard Tract, from Joseph Wolfskill's DTLA orchard (see [[Towne Avenue]], [[Stanford Avenue]], [[Gladys Avenue]], [[Omar Street]]). No source confirms intent, but a harvest goddess on a freshly subdivided orchard is a plausible thematic choice, not mere coincidence. Not covered by Kines.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Ceres (mythology)", url: "https://en.wikipedia.org/wiki/Ceres_(mythology)" },
      { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, July–Aug. 1887)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" }
    ]
  },

  "Omar Street": {
    name: "Omar Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: { text: "1887 (platted as \"Omar Ave\" in the Wolfskill Orchard Tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" },
    note: "Part of the same 1887 Wolfskill Orchard Tract package as [[Towne Avenue]], [[Crocker Street]], [[Stanford Avenue]], [[Gladys Avenue]], and [[Ceres Avenue]] — subdivided from Joseph Wolfskill's old DTLA orchard. No source names an actual Omar; not covered by Kines. (NavigateLA lists the modern street as \"Omar Ave,\" matching the tract's original platted name — it may never have been renamed.)",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, July–Aug. 1887) — shows \"Omar Ave\" at 312 Omar St's location", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" }
    ]
  },

  "Towne Avenue": {
    name: "Towne Avenue",
    namedAfter: "Alban Nelson Towne (1829–1895), general manager of the Southern Pacific Railroad",
    namedAfterLink: null,
    planned: null,
    built: "1887",
    note: "Named alongside [[Stanford Avenue]] and [[Crocker Street]] when subdividers of Joseph Wolfskill's old DTLA orchard donated 13 acres at 4th & Alameda for a new SPRR station (the Arcade Depot, opened 1888) and honored the railroad's brass. Confirmed on the original recorded tract map, which labels this street \"Towne\" outright.",
    categories: ["person", "alive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Towne Avenue", url: "https://lastreetnames.com/street/towne-avenue-dtla/" },
      { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, July–Aug. 1887)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" }
    ]
  },

  "Crocker Street": {
    name: "Crocker Street",
    namedAfter: "{{Charles Crocker}} (1822–1888), Southern Pacific Railroad executive and one of the “Big Four” financiers of the Central Pacific",
    namedAfterLink: "https://en.wikipedia.org/wiki/Charles_Crocker",
    planned: null,
    built: "1887 (as Stanford Avenue)",
    nameHistory: [
      { from: "1887", until: "?", name: "Stanford Avenue",
        origin: "named for SPRR president Leland Stanford, part of the same 1887 package as Towne and Ruth (now Stanford) Avenues {{(source)}}",
        originLink: "https://lastreetnames.com/street/towne-avenue-dtla/" },
      { from: "?", until: null, name: "Crocker Street",
        origin: "renamed for Crocker once the “Stanford” name moved a block over to the former Ruth Avenue {{(source)}}",
        originLink: "https://lastreetnames.com/street/towne-avenue-dtla/" }
    ],
    note: "Sibling to [[Towne Avenue]] and [[Stanford Avenue]] — all three trace to the 1887 SPRR station land deal. The exact renaming year is not yet researched. The original recorded tract map confirms this street was platted \"Stanford\" in 1887, one block over from the street platted \"Ruth\" (now [[Stanford Avenue]]).",
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Towne Avenue (recounts the Crocker/Stanford street swap)", url: "https://lastreetnames.com/street/towne-avenue-dtla/" },
      { title: "Wikipedia: Charles Crocker", url: "https://en.wikipedia.org/wiki/Charles_Crocker" },
      { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, July–Aug. 1887)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" }
    ]
  },

  "Stanford Avenue": {
    name: "Stanford Avenue",
    namedAfter: "{{Leland Stanford}} (1824–1893), president of the Southern Pacific Railroad and governor of California 1862–1863",
    namedAfterLink: "https://en.wikipedia.org/wiki/Leland_Stanford",
    planned: null,
    built: "1887 (as Ruth Avenue)",
    nameHistory: [
      { from: "1887", until: "after Feb. 1897", name: "Ruth Avenue",
        origin: "presumably named for a daughter of landowner Joseph Wolfskill, whose old DTLA orchard was being subdivided; the 1897 renaming commission proposed changing it, but the council committee restored the name {{(source)}}",
        originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" },
      { from: "after Feb. 1897", until: null, name: "Stanford Avenue",
        origin: "took over the Stanford name once the original Stanford Avenue, a block over, was renamed Crocker Street {{(source)}}",
        originLink: "https://lastreetnames.com/street/towne-avenue-dtla/" }
    ],
    note: "Sibling to [[Towne Avenue]] and [[Crocker Street]] — all three trace to the 1887 SPRR station land deal. Still Ruth Avenue in Feb. 1897; the exact swap year is not yet researched. The tract map confirms \"Ruth\" as its 1887 platted name, one block from the street platted \"Stanford\" (now [[Crocker Street]]) and one platted \"Gladys\" (see [[Gladys Avenue]]), the same women's-name pattern.",
    categories: ["person", "renamed", "governor"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Towne Avenue (recounts the Crocker/Stanford street swap)", url: "https://lastreetnames.com/street/towne-avenue-dtla/" },
      { title: "Los Angeles Herald, “Talking Retrenchment” (Ruth Avenue restored), Feb. 21, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" },
      { title: "Wikipedia: Leland Stanford", url: "https://en.wikipedia.org/wiki/Leland_Stanford" },
      { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, July–Aug. 1887)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" },
      { title: "Recorded map: H.C. Halfpenny's Resubdivision of a part of Block 24 of the Wolfskill Orchard Tract, M.R. 54-84 (recorded Feb. 28, 1895) — names \"Ruth\" as one of the block's bounding streets", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR054/MR054-084.pdf" }
    ]
  },

  "Wall Street": {
    name: "Wall Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "The Southern California Flower Market (1912, at 421 Wall St.) and later the American Florists' Exchange settled here, making it the core of today's Flower District. The name's origin is not yet researched: not covered by Kines, and no source found (Wikipedia, Homestead Museum, Los Angeles Revisited, LAPL, SurveyLA) ties it to New York's Wall Street or to an actual wall.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Wholesale District, Los Angeles", url: "https://en.wikipedia.org/wiki/Wholesale_District,_Los_Angeles" },
      { title: "Wikipedia: Los Angeles Flower District", url: "https://en.wikipedia.org/wiki/Los_Angeles_Flower_District" }
    ]
  },

  "Santee Street": {
    name: "Santee Street",
    namedAfter: "{{Milton Santee}} (1835–1901), city councilman 1884–1886; later a mining and railroad investor in San Diego County",
    namedAfterLink: "https://en.wikipedia.org/wiki/Milton_Santee",
    planned: null,
    built: "1886",
    note: "Santee later moved to San Diego County, where his second wife had the town of Cowleston renamed Santee in his honor in 1893 — a name that town keeps today.",
    categories: ["person", "alive", "governor"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Santee Street", url: "https://lastreetnames.com/street/santee-street/" },
      { title: "Wikipedia: Milton Santee", url: "https://en.wikipedia.org/wiki/Milton_Santee" }
    ]
  },

  "Santee Alley": {
    name: "Santee Alley",
    namedAfter: "Named for adjacent Santee Street, itself honoring 1880s city councilman {{Milton Santee}} (1835–1901)",
    namedAfterLink: "https://en.wikipedia.org/wiki/Milton_Santee",
    planned: null,
    built: "not yet researched (known as just \"The Alley\" as of 1982; rebranded Santee Alley sometime after)",
    note: "Runs between [[Santee Street]] and Maple Avenue; grew out of wholesale vendors in the Fashion District selling overstock through their back doors on weekends.",
    categories: ["person"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Los Angeles Fashion District", url: "https://en.wikipedia.org/wiki/Los_Angeles_Fashion_District" },
      { title: "The Santee Alley: The Story of Santee Alley", url: "http://thesanteealley.blogspot.com/2013/09/the-story-of-santee-alley.html" }
    ]
  },

  "Maple Avenue": {
    name: "Maple Avenue",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "The western edge of today's Flower District and Fashion District (Maple to Main, 7th to 12th by 1982); not covered by Kines, and no source found for the origin of the name itself — plausibly just the tree, as with Olive and Flower Streets, but that's unconfirmed here.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Los Angeles Flower District", url: "https://en.wikipedia.org/wiki/Los_Angeles_Flower_District" },
      { title: "Wikipedia: Los Angeles Fashion District", url: "https://en.wikipedia.org/wiki/Los_Angeles_Fashion_District" }
    ]
  },

  "San Julian Street": {
    name: "San Julian Street",
    namedAfter: "Possibly {{St. Julian the Hospitaller}}, patron saint of travelers and innkeepers — an interpretive reading per J. Michael Walker's 2008 book, not a documented namesake",
    namedAfterLink: "https://en.wikipedia.org/wiki/Julian_the_Hospitaller",
    planned: null,
    built: { text: "1880s", url: "https://uscatholic.org/articles/200909/street-saints-los-angeles-is-full-of-them/" },
    note: null,
    categories: ["person", "disputed"],
    disputed: true,
    sources: [
      { title: "J. Michael Walker, “Street Saints: Los Angeles Is Full of Them,” U.S. Catholic (Sept. 2009)", url: "https://uscatholic.org/articles/200909/street-saints-los-angeles-is-full-of-them/" },
      { title: "Wikipedia: Skid Row, Los Angeles", url: "https://en.wikipedia.org/wiki/Skid_Row,_Los_Angeles" }
    ]
  },

  "Judge John Aiso Street": {
    name: "Judge John Aiso Street",
    namedAfter: "{{John Fujio Aiso}} (1909–1987), the highest-ranking Japanese American officer in the U.S. Army in World War II and the first Japanese American named to the California State Judiciary",
    namedAfterLink: "https://en.wikipedia.org/wiki/John_Aiso",
    planned: null,
    built: "not yet researched",
    nameHistory: [
      { from: "?", until: "1997", name: "San Pedro Street",
        origin: "this was the northernmost block of [[San Pedro Street]], on the outskirts of Little Tokyo",
        originLink: null },
      { from: "1997", until: null, name: "Judge John Aiso Street", origin: null, originLink: null }
    ],
    note: null,
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Judge John Aiso Street", url: "https://lastreetnames.com/street/judge-john-aiso-street/" },
      { title: "Wikipedia: John Aiso", url: "https://en.wikipedia.org/wiki/John_Aiso" }
    ]
  },

  "Astronaut Ellison S Onizuka Street": {
    name: "Astronaut Ellison S. Onizuka Street",
    namedAfter: "{{Ellison Onizuka}} (1946–1986), the first Asian American in space, killed in the 1986 Space Shuttle Challenger disaster",
    namedAfterLink: "https://en.wikipedia.org/wiki/Ellison_Onizuka",
    planned: null,
    built: "not yet researched",
    nameHistory: [
      { from: "?", until: "1988", name: "Weller Street", origin: "not yet researched", originLink: null },
      { from: "1988", until: null, name: "Astronaut Ellison S. Onizuka Street",
        origin: "renamed in Onizuka's honor two years after the Challenger explosion, with a memorial plaque and shuttle model at the street's center {{(source)}}",
        originLink: "https://lastreetnames.com/street/astronaut-ellison-s-onizuka-street/" }
    ],
    note: "The longest street name in the city.",
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Astronaut Ellison S. Onizuka Street", url: "https://lastreetnames.com/street/astronaut-ellison-s-onizuka-street/" },
      { title: "LAPL: The Long and Winding Story of the Streets of Los Angeles", url: "https://www.lapl.org/news-stories/articles/long-and-winding-story-streets-los-angeles" },
      { title: "Wikipedia: Ellison Onizuka", url: "https://en.wikipedia.org/wiki/Ellison_Onizuka" }
    ]
  },

  "Ducommun Street": {
    name: "Ducommun Street",
    namedAfter: "{{Charles Louis Ducommun}} (1820–1896), watchmaker and merchant who had a mansion here; his hardware store grew into today's Ducommun Inc., California's oldest continuously operating company",
    namedAfterLink: "https://en.wikipedia.org/wiki/Ducommun",
    planned: null,
    built: "by 1875",
    note: null,
    categories: ["person", "alive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Ducommun Street", url: "https://lastreetnames.com/street/ducommun-street/" },
      { title: "Wikipedia: Ducommun", url: "https://en.wikipedia.org/wiki/Ducommun" }
    ]
  },

  "Vignes Street": {
    name: "Vignes Street",
    namedAfter: "{{Jean-Louis Vignes}} (1780–1862), California's first commercial winemaker, whose El Aliso vineyard once covered this ground",
    namedAfterLink: "https://en.wikipedia.org/wiki/Jean-Louis_Vignes",
    planned: null,
    built: "1874",
    note: "Modern historians favor Jean-Louis, but two nephews who worked at the winery — Jean-Marie and Vital Vignes — were also nominated as namesakes in their own obituaries; the street may honor the family generally.",
    categories: ["person", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Vignes Street", url: "https://lastreetnames.com/street/vignes-street/" },
      { title: "Wikipedia: Jean-Louis Vignes", url: "https://en.wikipedia.org/wiki/Jean-Louis_Vignes" }
    ]
  },

  "Garey Street": {
    name: "Garey Street",
    namedAfter: "Almost certainly Thomas Andrew Garey (1830–1909), citrus nurseryman and co-founder of Pomona — his was the only Garey family in town when the street was named",
    namedAfterLink: null,
    planned: null,
    built: { text: "already \"Garey\" by May 19, 1875 (Map of the Thomas Tract, recorded that date) — earlier than the \"c. 1877\" secondary estimate", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-060.pdf" },
    note: "Later absorbed the former Amelia and Messer streets.",
    categories: ["person", "alive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Garey Street", url: "https://lastreetnames.com/street/garey-street/" },
      { title: "Recorded map: Map of the Thomas Tract, being a portion of the Johnson and Mott Tract, M.R. 3-60/61 (recorded May 19, 1875, at the request of Milton Thomas; J.W. Gillette, County Recorder) — labels this street \"Garey\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-060.pdf" }
    ]
  },

  "Jackson Street": {
    name: "Jackson Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "A short Little Tokyo street near [[Judge John Aiso Street]] and Ducommun St. Not covered by Kines (whose only \"Jackson Street\" entry is an unrelated street in Burbank), and no source found for this one's origin.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Little Tokyo, Los Angeles", url: "https://en.wikipedia.org/wiki/Little_Tokyo,_Los_Angeles" }
    ]
  },

  "Rose Street": {
    name: "Rose Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "by 1898 (Sanjuro Mizuno's Santa Fe Hotel, the city's first Japanese boardinghouse, stood at 1st and Rose)",
    note: "Not covered by Kines; no source found for the name's origin. The 1875 Thomas Tract map (which names [[Garey Street|Garey]] and the north end of [[Hewitt Street|Hewitt]]) shows an unlabeled platted street in roughly this position — a positional inference toward an earlier date, not a literal name match.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Little Tokyo, Los Angeles", url: "https://en.wikipedia.org/wiki/Little_Tokyo,_Los_Angeles" },
      { title: "Recorded map: Map of the Thomas Tract, being a portion of the Johnson and Mott Tract, M.R. 3-61 (recorded May 19, 1875) — shows an unlabeled platted street in Rose Street's approximate position", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-060.pdf" }
    ]
  },

  "Toriumi Plaza": {
    name: "Toriumi Plaza",
    namedAfter: "Rev. Howard Toriumi (1916–1987), Union Church minister who led the fight to preserve Little Tokyo through 1960s–70s redevelopment",
    namedAfterLink: null,
    planned: null,
    built: "2012",
    note: "Sits atop a parking garage at the northwest corner of 1st and [[Judge John Aiso Street]].",
    categories: ["person"],
    disputed: false,
    sources: [
      { title: "Little Tokyo Historical Society: Naming Projects (Rev. Howard Toriumi, 2012)", url: "https://www.littletokyohs.org/naming-projects" }
    ]
  },

  "Japanese Village Plaza Mall": {
    name: "Japanese Village Plaza Mall",
    namedAfter: "Descriptive — a shopping plaza built in traditional Japanese village style as part of Little Tokyo's 1970s redevelopment",
    namedAfterLink: null,
    planned: null,
    built: "1978",
    note: "Designed by architect David Hyun, with a Yagura fire tower as its centerpiece, meant to keep the neighborhood's mom-and-pop shops intact through redevelopment.",
    categories: ["descriptive"],
    disputed: false,
    sources: [
      { title: "Discover Nikkei: Shopping Mall in Little Tokyo", url: "https://discovernikkei.org/en/journal/2016/11/16/shopping-mall/" }
    ]
  },

  "Winston Street": {
    name: "Winston Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "by 1887 (118 Winston St. dates to that year)",
    note: "Runs through the Toy District/Skid Row; also home to \"Indian Alley,\" a hub of the Native American community since the 1960s. No source found for the street name's own origin.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "These Days LA: The Arcane History of 118 Winston, Part I", url: "https://www.thesedaysla.com/blogs/communique/los-angeles-history-lesson-118-winston-st" },
      { title: "Wikipedia: Indian Alley", url: "https://en.wikipedia.org/wiki/Indian_Alley" }
    ]
  },

  "Boyd Street": {
    name: "Boyd Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "In the Toy District, part of the historic Wholesale District. No source found for the street name's own origin.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Wholesale District, Los Angeles", url: "https://en.wikipedia.org/wiki/Wholesale_District,_Los_Angeles" }
    ]
  }
};

// ---------------------------------------------------------------------------
// Numbered streets share a template (see ADDING-STREETS.md): ordinal position
// in the downtown grid, numbering in place by 1849. Quirks go in `opts`.
// Streets south of the survey's edge (14th+) get planned: "not yet researched".
// ---------------------------------------------------------------------------
function numberedStreet(name, opts = {}) {
  return Object.assign({
    name,
    namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
    namedAfterLink: null,
    planned: { text: "by 1849", url: ORD_SURVEY.url },
    built: "not yet researched",
    note: null,
    categories: ["number"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
    ]
  }, opts);
}

Object.assign(STREET_DATA, {
  "2nd Street": {
    name: "2nd Street",
    orientation: "EW",
    segments: [
      {
        label: "west of Figueroa",
        maxLng: -118.2530,
        name: "2nd Street",
        namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
        namedAfterLink: null,
        planned: { text: "by 1849", url: ORD_SURVEY.url },
        built: { text: "already \"2nd St\" (drawn but unlabeled directly — confirmed via its \"W. 2nd\" bearing annotation) by Nov. 1909, curving through Crown Hill near Witmer/Columbia/Crown Hill Ave", url: "https://pw.lacounty.gov/smpm/landrecords/pdf/TR0015-166a.pdf" },
        note: null,
        categories: ["number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: ORD_RECORDED.title, url: ORD_RECORDED.url },
          { title: "Recorded map: \"Crownwood\" (Witmer's Subdivision of parts of Lots 2 and 7, Block 38, Hancock Survey; surveyed Nov. 1909 by Chas. Forman Jr.), M.B. 15-166 — shows 2nd St's curving Crown Hill alignment, labeled \"W. 2nd\" along its centerline; alignment against the modern street grid confirms this stretch, multiple points matching to within meters", url: "https://pw.lacounty.gov/smpm/landrecords/pdf/TR0015-166a.pdf" }
        ]
      },
      {
        label: "Bunker Hill Tunnel (Figueroa–Hill)",
        minLng: -118.2530,
        maxLng: -118.2480,
        name: "2nd Street",
        namedAfter: "Its ordinal position in the downtown grid, same as the rest of 2nd Street — this stretch just tunnels under Bunker Hill instead of running at grade",
        namedAfterLink: null,
        planned: null,
        built: { text: "construction began 1916, delayed for years by lawsuits over property and access; formally opened July 25, 1924", url: "https://en.wikipedia.org/wiki/2nd_Street_Tunnel" },
        note: "Built to relieve congestion on the older 3rd Street Tunnel. Its glossy German-tile lining (controversial amid WWI-era anti-German sentiment) later made it one of L.A.'s most filmed locations — Blade Runner, The Terminator, and Kill Bill among them.",
        categories: ["number", "descriptive"],
        disputed: false,
        sources: [
          { title: "Wikipedia: 2nd Street Tunnel", url: "https://en.wikipedia.org/wiki/2nd_Street_Tunnel" },
          { title: "Los Angeles Times: “The automakers' tunnel of love is a cause for reflection” (Dan Neil, Apr. 21, 2009)", url: "https://www.latimes.com/archives/la-xpm-2009-apr-21-fi-ct-neil21-story.html" }
        ]
      },
      {
        label: "Hill St to Alameda",
        minLng: -118.2480,
        maxLng: -118.2381,
        name: "2nd Street",
        namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
        namedAfterLink: null,
        planned: { text: "by 1849", url: ORD_SURVEY.url },
        built: "not yet researched",
        note: null,
        categories: ["number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
        ]
      },
      {
        label: "east of Alameda (Guadalupe St)",
        minLng: -118.2381,
        name: "2nd Street",
        namedAfter: "Its ordinal position in the downtown grid, once this stretch was folded into 2nd Street",
        namedAfterLink: null,
        planned: null,
        built: { text: "already \"Guadalupe St\" by May 19, 1875 (Map of the Thomas Tract, recorded that date)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-060.pdf" },
        nameHistory: [
          { from: "1875", until: "?", name: "Guadalupe Street",
            origin: "labeled \"Guadalupe\" on the recorded Thomas Tract map, one block north of (and parallel to) \"Georgia St\" — the tract's own name for this stretch's [[3rd Street|3rd Street]] counterpart, itself later folded into the numbered grid — putting Guadalupe in the 2nd Street position",
            originLink: null },
          { from: "?", until: null, name: "2nd Street",
            origin: "not directly documented; presumably folded in during the {{Feb. 1897 citywide renaming}} along with other downtown-grid consolidations, though no source specifically names this stretch",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ],
        note: "Seen on the second sheet (M.R. 3-61) of the same Thomas Tract map that names [[Garey Street]] and the north end of [[Hewitt Street]]. Inferred from position (one block north of \"Georgia St,\" which the neighboring [[3rd Street]] entry already ties to this same tract and grid), not from a matching modern parcel — the block hasn't been checked address-by-address the way Garey and Hewitt were.",
        categories: ["number", "renamed"],
        disputed: false,
        sources: [
          { title: "Recorded map: Map of the Thomas Tract, being a portion of the Johnson and Mott Tract, M.R. 3-60/61 (recorded May 19, 1875, at the request of Milton Thomas) — labels this street \"Guadalupe\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-060.pdf" },
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
        ]
      }
    ]
  },
  "3rd Street": {
    name: "3rd Street",
    orientation: "EW",
    segments: [
      {
        label: "west of Boylston (Arnold St)",
        maxLng: -118.2578,
        name: "3rd Street",
        namedAfter: "Its ordinal position in the downtown grid, once this stretch was folded in — before that, a separately named street",
        namedAfterLink: null,
        planned: null,
        built: { text: "already \"Arnold St\" by Mar. 1894 (Compromise Subdivision/Washington Tract survey)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR066/MR066-035.pdf" },
        nameHistory: [
          { from: "by 1894", until: "?", name: "Arnold Street",
            origin: "labeled \"Arnold St\" on the Compromise Subdivision/Washington Tract map, immediately south of that same sheet's \"Third St\" (today's [[Miramar Street]]) — namesake untraced",
            originLink: null },
          { from: "?", until: null, name: "3rd Street",
            origin: "not directly documented; presumably folded in during the {{Feb. 1897 citywide renaming}} along with other downtown-grid consolidations, though no source specifically names this stretch",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ],
        note: "On the same 1894 sheet, the block immediately north — now Miramar Street's Bixel–Boylston stretch — was labeled \"Third St,\" the reverse of what a name-continuity guess would suggest. Found via pixel-to-coordinate alignment of the tract image against the modern street grid, not a lot-level record.",
        categories: ["number", "renamed"],
        disputed: false,
        sources: [
          { title: "Recorded map: Compromise Subdivision / \"Washington Tract,\" M.R. 66-35/36 (surveyed Mar. 1894 by E.D. Severance; recorded May 1, 1897) — labels the Bixel–Boylston block's south side \"Arnold St.\"; alignment against the modern street grid confirms this is 3rd Street's Bixel–Boylston stretch", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR066/MR066-035.pdf" },
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" }
        ]
      },
      {
        label: "Boylston to Alameda",
        minLng: -118.2578,
        maxLng: -118.2381,
        name: "3rd Street",
        namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
        namedAfterLink: null,
        planned: { text: "by 1849", url: ORD_SURVEY.url },
        built: "not yet researched",
        note: null,
        categories: ["number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
        ]
      },
      {
        label: "east of Alameda (Georgia St)",
        minLng: -118.2381,
        name: "3rd Street",
        namedAfter: "Its ordinal position in the downtown grid, once this stretch was folded into 3rd Street",
        namedAfterLink: null,
        planned: null,
        built: { text: "already \"Georgia St\" by Jan. 1888 (recorded Wolfskill Orchard Tract map, final sheet)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" },
        nameHistory: [
          { from: "by 1888", until: "?", name: "Georgia Street",
            origin: "labeled \"Georgia St\" on the recorded Wolfskill Orchard Tract map, east of Alameda — not the unrelated, still-existing [[Georgia Street]] across downtown, which was partly renamed to avoid confusion with \"another, now-defunct Georgia Street,\" almost certainly this one",
            originLink: null },
          { from: "?", until: null, name: "3rd Street",
            origin: "not directly documented; presumably folded in during the {{Feb. 1897 citywide renaming}} along with other downtown-grid consolidations, though no source specifically names this stretch",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ],
        note: "Seen on the final sheet (recorded Jan. 11, 1888) of the same Wolfskill Orchard Tract map that also names [[Omar Street|Omar Ave]], [[Ceres Avenue]], [[Gladys Avenue]], and the old \"Wolfskill Avenue\" stretch of [[Central Avenue]]. The map shows Third St's platted extent running to a boundary, an unplatted gap (almost certainly Alameda, unlabeled here), and \"Georgia St\" resuming on the far side in direct alignment.",
        categories: ["number", "renamed"],
        disputed: false,
        sources: [
          { title: "Recorded map: Wolfskill Orchard Tract, M.R. 30-9/13 (surveyed by J.H. Dockweiler, recorded Jan. 11, 1888) — final sheet (5 of 5) shows \"Georgia St\" just east of Alameda, in line with Third St's alignment", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR030/MR030-009.pdf" },
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
        ]
      }
    ]
  },
  "4th Street": {
    name: "4th Street",
    orientation: "EW",
    segments: [
      {
        label: "west of Alameda",
        maxLng: -118.2381,
        name: "4th Street",
        namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
        namedAfterLink: null,
        planned: { text: "by 1849", url: ORD_SURVEY.url },
        built: "not yet researched",
        note: "The 1890 petition that turned Fort Street into Broadway cited confusion between “Fort” and “Fourth”.",
        categories: ["number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "L.A. Street Names: Broadway (the Fort/Fourth confusion)", url: "https://lastreetnames.com/street/broadway/" },
          { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
        ]
      },
      {
        label: "Alameda–Hewitt (Huber St)",
        minLng: -118.2381,
        maxLng: -118.2354,
        name: "4th Street",
        namedAfter: "Its ordinal position in the downtown grid, once this stretch was folded into 4th Street",
        namedAfterLink: null,
        planned: null,
        built: { text: "already \"Huber St\" by Apr.–May 1886 (Mills and Wicks Extension of Second St. tract, one block north), and again by Aug. 1886 (F.P. Howard & Co.'s Subdivision of the Bliss Tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" },
        nameHistory: [
          { from: "1886", until: "?", name: "Huber Street",
            origin: "named on Dr. Frederick Preston Howard's tract; no specific namesake documented, though possibly for his wife Caroline (née Huber), as with [[Hewitt Street]]'s \"Carolina Street\" one block east {{(source)}} — the Mills and Wicks Extension tract one block north corroborates \"Huber\" a few months earlier, in spring 1886",
            originLink: "https://lastreetnames.com/street/colyton-street/" },
          { from: "?", until: null, name: "4th Street",
            origin: "not directly documented, but this exact block is where the {{Feb. 1897 citywide renaming}} folded Larkin Street and Short Street (“from Fourth street to Santa Fe grounds”) into 4th's eastern reach — the likely, though unconfirmed, rename event for this stretch",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ],
        note: "828 E 4th St, on this block, fronted \"Huber Street\" on the recorded Bliss Tract map — one block north of [[5th Street]]'s \"Poplar Street\" in the same corridor. The Mills and Wicks Extension tract, immediately north of the Bliss Tract, also runs along Huber St as its south boundary and already labels it \"Huber\" that same year.",
        categories: ["number", "renamed"],
        disputed: false,
        sources: [
          { title: "Recorded map: F.P. Howard & Co.'s Subdivision of the Bliss Tract, M.R. 12-42 (subdivided Aug. 1886 by Geo. E. Knox) — shows \"Huber Street\" at 828 E 4th St's location", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" },
          { title: "Recorded map: Mills and Wicks Extension of Second St. and adjoining subdivision, M.R. 13-87/88 (Apr.–May 1886, additional lots Jan. 1887; subdivided at the request of M.L. Wicks and Howard W. Mills, under the direction of Geo. C. Knox) — shows \"Huber St\" as its south boundary", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" },
          { title: "Los Angeles Herald, “Talking Retrenchment” (renaming committee report), Feb. 21, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ]
      },
      {
        label: "east of Hewitt",
        minLng: -118.2354,
        name: "4th Street",
        namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
        namedAfterLink: null,
        planned: "not yet researched",
        built: { text: "the block immediately east of Hewitt was already \"Third St\" by Apr.–May 1886 (Mills and Wicks Extension of Second St. tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" },
        note: "Boyle Heights' 2nd Street, east of the river, also became 4th in the Feb. 1897 renaming (at ex-Mayor Workman's request) — a further predecessor, exact extent not yet researched. East of Hewitt, the Mills and Wicks tract shows a \"Third\" band one row north of \"Huber\" (its Alameda–Hewitt stretch); [[4th Place]] traces to the same \"Third\" band, so where it splits into 4th Place vs. 4th Street proper isn't pinned down.",
        categories: ["number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Los Angeles Herald, “A Storm of Words” (east-of-river changes), Feb. 19, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" },
          { title: "Recorded map: Mills and Wicks Extension of Second St. and adjoining subdivision, M.R. 13-87 (Apr.–May 1886) — labels the block east of Hewitt \"Third\"", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR013/MR013-087.pdf" }
        ]
      }
    ]
  },
  "5th Street": {
    name: "5th Street",
    orientation: "EW",
    segments: [
      {
        label: "west of Alameda",
        maxLng: -118.2382,
        name: "5th Street",
        namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
        namedAfterLink: null,
        planned: { text: "by 1849", url: ORD_SURVEY.url },
        built: "not yet researched",
        note: null,
        categories: ["number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
        ]
      },
      {
        label: "Alameda–Hewitt (Poplar St)",
        minLng: -118.2382,
        maxLng: -118.2351,
        name: "5th Street",
        namedAfter: "Its ordinal position in the downtown grid, once this stretch was folded into 5th Street",
        namedAfterLink: null,
        planned: null,
        built: { text: "already \"Poplar Street\" by Aug. 1886 (F.P. Howard & Co.'s Subdivision of the Bliss Tract)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" },
        nameHistory: [
          { from: "1886", until: "?", name: "Poplar Street",
            origin: "named on Dr. Frederick Preston Howard's tract; no specific namesake documented",
            originLink: null },
          { from: "?", until: null, name: "5th Street",
            origin: "not directly documented, but this exact block is where the {{Feb. 1897 citywide renaming}} folded Lugo Street into 5th (extent not yet researched) — the likely, though unconfirmed, rename event for this stretch",
            originLink: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ],
        note: "1100 E 5th St, on this block, fronted \"Poplar Street\" on the recorded Bliss Tract map — one block south of [[4th Street]]'s \"Huber Street\" in the same corridor.",
        categories: ["number", "renamed"],
        disputed: false,
        sources: [
          { title: "Recorded map: F.P. Howard & Co.'s Subdivision of the Bliss Tract, M.R. 12-42 (subdivided Aug. 1886 by Geo. E. Knox) — shows \"Poplar Street\" at 1100 E 5th St's location", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR012/MR012-042.pdf" },
          { title: "Los Angeles Herald, “Talking Retrenchment” (renaming committee report), Feb. 21, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970221.2.28" }
        ]
      },
      {
        label: "east of Hewitt",
        minLng: -118.2351,
        name: "5th Street",
        namedAfter: "Its ordinal position in the downtown grid — the numbering system was in place by 1849",
        namedAfterLink: null,
        planned: "not yet researched",
        built: "not yet researched",
        note: "Boyle Heights' 4th Street, east of the river, likewise became 5th in the Feb. 1897 renaming — a further predecessor somewhere along this reach; exact extent not yet researched.",
        categories: ["number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Los Angeles Herald, “A Storm of Words” (east-of-river changes), Feb. 19, 1897", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" }
        ]
      }
    ]
  },
  "6th Street": numberedStreet("6th Street", { sources: [
    { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
    { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
    { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
  ] }),
  "7th Street": numberedStreet("7th Street", { sources: [
    { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
    { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
    { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
  ] }),
  "8th Street": numberedStreet("8th Street", { sources: [
    { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
    { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
    { title: ORD_RECORDED.title, url: ORD_RECORDED.url }
  ] }),
  "9th Street": numberedStreet("9th Street", {
    note: "A donor street twice over: its stretch west of Figueroa became [[James M Wood Boulevard|James M. Wood Blvd]] in 1997, and its continuation east of Central Ave was absorbed by [[Olympic Boulevard|Olympic Blvd]] by 1945. It was also a receiver: between San Pedro and Alameda, this stretch absorbed the path of an earlier, separate [[Kohler Street]].",
    sources: [
      { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "L.A. Street Names: James M. Wood Boulevard", url: "https://lastreetnames.com/street/james-m-wood-boulevard/" },
      { title: "L.A. Street Names: Olympic Boulevard", url: "https://lastreetnames.com/street/olympic-boulevard/" }
    ]
  }),
  "10th Street": numberedStreet("10th Street", {
    note: "A remnant: most of 10th became [[Olympic Boulevard|Olympic Blvd]] in 1935, its citywide widening already underway by 1928.",
    sources: [
      { title: "L.A. Street Names: 10th Street", url: "https://lastreetnames.com/street/010th-street/" },
      { title: "L.A. Street Names: Olympic Boulevard", url: "https://lastreetnames.com/street/olympic-boulevard/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
    ]
  }),
  "11th Street": numberedStreet("11th Street"),
  "12th Street": numberedStreet("12th Street"),
  "14th Street": numberedStreet("14th Street", { planned: "not yet researched" }),
  "15th Street": numberedStreet("15th Street", { planned: "not yet researched" }),
  "17th Street": numberedStreet("17th Street", { planned: "not yet researched" }),
  "18th Street": numberedStreet("18th Street", { planned: "not yet researched" }),

  // TODO when Mines Ave. territory (Boyle Heights / East L.A.) enters coverage,
  // extend the eastern segment story; the ex-9th stretch already begins at
  // Central Ave downtown, where 9th's alignment merges into Olympic's.
  "Olympic Boulevard": {
    name: "Olympic Boulevard",
    orientation: "EW",
    segments: [
      {
        label: "west of Central Ave (former 10th St)",
        maxLng: -118.2471,
        name: "Olympic Boulevard",
        namedAfter: "The {{1932 Summer Olympics}}, held in Los Angeles",
        namedAfterLink: "https://en.wikipedia.org/wiki/1932_Summer_Olympics",
        planned: { text: "by 1849 (as 10th Street)", url: ORD_SURVEY.url },
        built: { text: "already \"Tenth\" by Apr. 1875 (W.M. Williams's subdivision of Blocks 72 & 73 of Ord's Survey)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-032.pdf" },
        nameHistory: [
          { from: "by 1849", until: "1935", name: "10th Street",
            origin: "ordinal position in the downtown grid", originLink: null },
          { from: "1935", until: null, name: "Olympic Boulevard",
            origin: "renaming requested July 1929, before the Games; that they were the 10th Olympiad apparently went unremarked at the time {{(source)}}",
            originLink: "https://lastreetnames.com/street/olympic-boulevard/" }
        ],
        note: "The name first landed (1929) on part of Country Club Drive; expansion continued to 1945, also absorbing Louisiana Ave. and Santa Monica's Pennsylvania Ave. on the Westside.",
        categories: ["event", "renamed", "number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Olympic Boulevard", url: "https://lastreetnames.com/street/olympic-boulevard/" },
          { title: "L.A. Street Names: 10th Street", url: "https://lastreetnames.com/street/010th-street/" },
          { title: "Wikipedia: Olympic Boulevard (Los Angeles)", url: "https://en.wikipedia.org/wiki/Olympic_Boulevard_(Los_Angeles)" },
          { title: "Recorded map: W.M. Williams's subdivision of Blocks 72 & 73 of Ord's Survey, M.R. 3-32/33 (Apr. 1875) — labels this street \"Tenth,\" directly tying it to the Ord Survey grid", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR003/MR003-032.pdf" },
          { title: "Recorded map: Thomas S. Ewing's Replat of part of Block B, Dunkelberger Tract, M.R. 59-60 (surveyed Mar. 1896) — labels this street \"Tenth St\" again, a block further west", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR059/MR059-060.pdf" }
        ]
      },
      {
        label: "east of Central Ave (former 9th St)",
        minLng: -118.2471,
        name: "Olympic Boulevard",
        namedAfter: "Extension of the Olympic name (for the {{1932 Summer Olympics}}) over the eastern reach of 9th Street",
        namedAfterLink: "https://en.wikipedia.org/wiki/1932_Summer_Olympics",
        planned: "not yet researched",
        built: "not yet researched",
        nameHistory: [
          { from: "?", until: "by 1945", name: "9th Street",
            origin: "ordinal position in the downtown grid; east of Central Ave, 9th's alignment continues as today's Olympic", originLink: null },
          { from: "by 1945", until: null, name: "Olympic Boulevard",
            origin: "absorbed during Olympic's eastward expansion (1935–1945); the exact renaming date for this stretch is not yet researched {{(source)}}",
            originLink: "https://lastreetnames.com/street/olympic-boulevard/" }
        ],
        note: "The donor street survives to the west as [[9th Street]].",
        categories: ["event", "renamed", "number"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Olympic Boulevard", url: "https://lastreetnames.com/street/olympic-boulevard/" },
          { title: "L.A. Street Names: James M. Wood Boulevard", url: "https://lastreetnames.com/street/james-m-wood-boulevard/" }
        ]
      }
    ]
  },

  "James M Wood Boulevard": {
    name: "James M. Wood Boulevard",
    namedAfter: "James Michael Wood (1945–1996), labor leader and chair of the Community Redevelopment Agency",
    namedAfterLink: null,
    planned: { text: "by 1849 (as 9th Street)", url: ORD_SURVEY.url },
    built: "not yet researched",
    nameHistory: [
      { from: "by 1849", until: "1997", name: "9th Street",
        origin: "ordinal position in the downtown grid", originLink: null },
      { from: "1997", until: null, name: "James M. Wood Boulevard",
        origin: "City Council renamed the stretch between Figueroa and Western to honor Wood the year after his death {{(source)}}",
        originLink: "https://lastreetnames.com/street/james-m-wood-boulevard/" }
    ],
    note: null,
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: James M. Wood Boulevard", url: "https://lastreetnames.com/street/james-m-wood-boulevard/" }
    ]
  }
});

// ---------------------------------------------------------------------------
// Freeways (see ADDING-STREETS.md, "Freeways and numbered streets"). These
// downtown routes predate the Interstate plan and carry genuine names, so each
// gets a full entry keyed on its NAME's meaning rather than a route number.
// Kines (lastreetnames.com) covers surface streets, not freeways, so these
// cite Wikipedia/Caltrans/NPS and contemporary opening dates instead.
// ---------------------------------------------------------------------------
Object.assign(STREET_DATA, {
  "Harbor Freeway": {
    name: "Harbor Freeway",
    namedAfter: "Its destination — the {{Port of Los Angeles}} and the harbor at San Pedro, which it runs south to reach",
    namedAfterLink: "https://en.wikipedia.org/wiki/Port_of_Los_Angeles",
    planned: { text: "proposed as a Figueroa St widening to the harbor in the 1924 Major Traffic Street Plan; adopted into the master freeway plan as the Harbor Parkway, later the Harbor Freeway", url: "https://en.wikipedia.org/wiki/Interstate_110_and_State_Route_110_(California)" },
    built: { text: "first link opened July 30, 1952 (Four Level south to 3rd St, within this coverage); pushed south through the 1950s and completed to San Pedro in 1970", url: "https://en.wikipedia.org/wiki/Interstate_110_and_State_Route_110_(California)" },
    note: "Signed I-110 south of the I-10 junction, SR 110 north to the Four Level; renumbered from Sign Route 11 in 1981. As a three-digit Interstate, I-110 is a spur off parent I-10 (its last two digits) — odd leading digit = spur, even = loop. SR 110 is a California number picked to match I-110. Both carriageways carry the name; it gives way to the [[Arroyo Seco Parkway]] about 0.9 km north of the Four Level.",
    categories: ["destination", "system"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Interstate 110 and State Route 110 (California)", url: "https://en.wikipedia.org/wiki/Interstate_110_and_State_Route_110_(California)" },
      { title: "California Highways (cahighways.org): Route 110", url: "https://www.cahighways.org/ROUTE110.html" },
      { title: "Wikipedia: Interstate Highway System — numbering (spurs vs. loops)", url: "https://en.wikipedia.org/wiki/Interstate_Highway_System#Numbering" },
      { title: "Caltrans, 2014 Named Freeways, Highways, Structures and Other Appurtenances in California (p. 71)", url: "https://web.archive.org/web/20150701114940/http://www.dot.ca.gov/hq/tsip/hseb/products/Named_Freeways_Final.pdf" }
    ]
  },

  "Santa Ana Freeway": {
    name: "Santa Ana Freeway",
    namedAfter: "Its destination — the city of {{Santa Ana}}, seat of Orange County, which it heads southeast toward",
    namedAfterLink: "https://en.wikipedia.org/wiki/Santa_Ana,_California",
    planned: { text: "a downtown-Los-Angeles-to-Orange-County freeway was planned by 1939", url: "https://en.wikipedia.org/wiki/Santa_Ana_Freeway" },
    built: { text: "constructed 1947–1956; the ~3-mile stretch in this coverage is signed US 101 between the Four Level and East L.A. interchanges", url: "https://en.wikipedia.org/wiki/Santa_Ana_Freeway" },
    note: "Signed US 101; originally US 101 its whole length until the 1964 renumbering made everything SE of the East L.A. Interchange I-5. Routes ending in 1 are major north–south highways; 101 is treated as a primary route, not a branch of US 1. Some ways here keep a \"US 99\" ref, a fossil of the old inland route (now I-5 / SR 99). Both carriageways share the name; it changes to the [[Hollywood Freeway]] at the Four Level.",
    categories: ["destination", "place", "system"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Santa Ana Freeway", url: "https://en.wikipedia.org/wiki/Santa_Ana_Freeway" },
      { title: "California Highways (cahighways.org): Route 101", url: "https://www.cahighways.org/ROUTE101.html" },
      { title: "Wikipedia: United States Numbered Highway System — numbering", url: "https://en.wikipedia.org/wiki/United_States_Numbered_Highway_System#Numbering" },
      { title: "Caltrans, 2013 Named Freeways, Highways, Structures and Other Appurtenances in California (p. 63)", url: "https://web.archive.org/web/20150701114940/http://www.dot.ca.gov/hq/tsip/hseb/products/Named_Freeways_Final.pdf" }
    ]
  },

  "Hollywood Freeway": {
    name: "Hollywood Freeway",
    namedAfter: "The {{Hollywood}} district it skirts on the way from downtown through the Cahuenga Pass to the San Fernando Valley",
    namedAfterLink: "https://en.wikipedia.org/wiki/Hollywood",
    planned: null,
    built: { text: "the downtown-to-Valley section opened April 16, 1954, when the route took the Hollywood Freeway name; the older Cahuenga Pass segment had opened in 1940", url: "https://en.wikipedia.org/wiki/Hollywood_Freeway" },
    note: "Signed US 101 — the [[Santa Ana Freeway]] entry explains that number. The 1940 freeway through the Cahuenga Pass was first called the Cahuenga Pass Freeway; the Hollywood Freeway name arrived with the 1954 downtown extension, so this pavement was born with the name. Both one-way carriageways share the name; it flips to the Santa Ana Freeway right at the Four Level, where US 101 crosses SR 110.",
    categories: ["destination", "place", "system"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Hollywood Freeway", url: "https://en.wikipedia.org/wiki/Hollywood_Freeway" },
      { title: "California Highways (cahighways.org): Route 101", url: "https://www.cahighways.org/ROUTE101.html" },
      { title: "Lost LA: Hollywood Versus the Freeway (PBS SoCal)", url: "https://www.pbssocal.org/shows/lost-la/hollywood-versus-the-freeway" }
    ]
  },

  "Santa Monica Freeway": {
    name: "Santa Monica Freeway",
    namedAfter: "Its western destination — the coastal city of {{Santa Monica}}, where the route ends near the ocean",
    namedAfterLink: "https://en.wikipedia.org/wiki/Santa_Monica,_California",
    planned: { text: "named by the California Highway Commission on April 25, 1957", url: "https://www.cahighways.org/ROUTE010.html" },
    built: { text: "first segment opened 1961; completed west to Santa Monica on Jan. 5, 1966. Only its southern edge clips this coverage south of downtown", url: "https://en.wikipedia.org/wiki/Interstate_10_in_California" },
    note: "The east–west I-10 across the south edge of downtown; its continuation east past the East L.A. Interchange is the [[San Bernardino Freeway]]. I-10 is the lowest even-numbered two-digit Interstate: even numbers run east–west and rise from south to north, so 10 marks the southernmost coast-to-coast route. Only its south edge clips this coverage; both one-way carriageways carry the name.",
    categories: ["destination", "place", "system"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Interstate 10 in California", url: "https://en.wikipedia.org/wiki/Interstate_10_in_California" },
      { title: "California Highways (cahighways.org): Route 10", url: "https://www.cahighways.org/ROUTE010.html" },
      { title: "Wikipedia: Interstate Highway System — numbering", url: "https://en.wikipedia.org/wiki/Interstate_Highway_System#Numbering" },
      { title: "Creating the Santa Monica Freeway (PBS SoCal / Departures)", url: "https://www.pbssocal.org/shows/departures/creating-the-santa-monica-freeway" }
    ]
  },

  "San Bernardino Freeway": {
    name: "San Bernardino Freeway",
    namedAfter: "Its eastern destination — the city of {{San Bernardino}}, some 60 miles east, which the route heads toward",
    namedAfterLink: "https://en.wikipedia.org/wiki/San_Bernardino,_California",
    planned: { text: "L.A.'s trial-run Ramona Boulevard opened along this corridor in April 1935, upgraded to the Ramona Parkway/Freeway in the 1940s", url: "https://laist.com/news/transportation/los-angeles-10-freeway-history-ramona-airline-marilyn-reece" },
    built: { text: "built as the Ramona Freeway (US 99) through the 1940s–50s, later renamed the San Bernardino Freeway; folded into I-10 in the 1964 renumbering. Only a short stub enters this coverage at the East L.A. Interchange", url: "https://en.wikipedia.org/wiki/Interstate_10_in_California" },
    nameHistory: [
      { from: "1935", until: "?", name: "Ramona Boulevard, then Ramona Parkway / Ramona Freeway",
        origin: "carried the era's popular \"Ramona\" place-name — widely applied across the San Gabriel Valley and commonly traced to Helen Hunt Jackson's 1884 Southern California novel; the road's own naming record is not pinned to a source here",
        originLink: null },
      { from: "?", until: null, name: "San Bernardino Freeway",
        origin: "renamed for its destination city of San Bernardino", originLink: null }
    ],
    note: "Shares the I-10 designation with the [[Santa Monica Freeway]], whose entry explains that number, the two linked by a short I-5 overlap at the East L.A. Interchange. In this coverage only a single carriageway stub appears at the eastern edge, and OSM still tags it with the old \"US 99\" ref — a fossil of the pre-1964 inland route that ran here before I-10 and I-5 took over the corridor.",
    categories: ["destination", "place", "renamed", "system"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Interstate 10 in California", url: "https://en.wikipedia.org/wiki/Interstate_10_in_California" },
      { title: "LAist: The 10 Freeway, Explained — the early Ramona route", url: "https://laist.com/news/transportation/los-angeles-10-freeway-history-ramona-airline-marilyn-reece" },
      { title: "SoCal Regional Rocks and Roads: East Los Angeles Interchange Complex", url: "https://www.socalregion.com/highways/la_highways/east_los_angeles_interchange/" }
    ]
  },

  "Arroyo Seco Parkway": {
    name: "Arroyo Seco Parkway",
    namedAfter: "The {{Arroyo Seco}} (“dry stream”), the seasonal watercourse it runs alongside between Los Angeles and Pasadena",
    namedAfterLink: "https://en.wikipedia.org/wiki/Arroyo_Seco_(Los_Angeles_County)",
    planned: { text: "added to the state highway system in 1935 as Route 205", url: "https://en.wikipedia.org/wiki/Arroyo_Seco_Parkway" },
    built: { text: "opened Dec. 30, 1940 — the first freeway in the western United States; completed to the Four Level Interchange on Sept. 22, 1953", url: "https://en.wikipedia.org/wiki/Arroyo_Seco_Parkway" },
    nameHistory: [
      { from: "1940", until: "1954", name: "Arroyo Seco Parkway",
        origin: "named for the Arroyo Seco, the seasonal stream it parallels toward Pasadena", originLink: null },
      { from: "Nov. 16, 1954", until: "2010", name: "Pasadena Freeway",
        origin: "renamed for its destination, Pasadena, when the California Highway Commission reclassified the parkway as a freeway", originLink: null },
      { from: "2010", until: null, name: "Arroyo Seco Parkway",
        origin: "the historic parkway name was restored, reflecting its standing as a National Historic Civil Engineering Landmark and National Scenic Byway", originLink: null }
    ],
    note: "Signed SR 110; continues south of the Four Level as the [[Harbor Freeway]] (the map's switch sits a little north of it). When it opened in 1940 it became L.A.'s leg of US 66 — the OSM ways still carry historical US 66, US 6, and US 99 refs. SR 110 is a California number picked to match the adjoining I-110, not a grid position. A National Historic Civil Engineering Landmark (1999) and National Scenic Byway (2002).",
    categories: ["nature", "place", "renamed", "system"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Arroyo Seco Parkway", url: "https://en.wikipedia.org/wiki/Arroyo_Seco_Parkway" },
      { title: "Wikipedia: Interstate 110 and State Route 110 (California)", url: "https://en.wikipedia.org/wiki/Interstate_110_and_State_Route_110_(California)" },
      { title: "National Park Service: Arroyo Seco Parkway", url: "https://www.nps.gov/places/arroyo-seco-parkway.htm" }
    ]
  },

  "I-10 Metro ExpressLanes": {
    name: "I-10 Metro ExpressLanes",
    namedAfter: "Not a place-name — a facility label for the {{high-occupancy toll (HOT) lanes}} in the I-10 corridor, branded “Metro ExpressLanes”",
    namedAfterLink: "https://en.wikipedia.org/wiki/High-occupancy_toll_lane",
    planned: null,
    built: { text: "the I-10 (El Monte Busway) carpool corridor, converted to congestion-priced toll lanes and opened as Metro ExpressLanes in February 2013", url: "https://en.wikipedia.org/wiki/Interstate_10_in_California" },
    note: "“Metro” is the L.A. County Metropolitan Transportation Authority; “ExpressLanes” is its brand for the HOT lanes on the 10 and 110. OSM refs them “I 10 EXPR.” They sit apart from the I-10 main lanes here: through downtown and East L.A. they follow the El Monte Busway, not the I-10 median, and the parallel mainline is tagged by its freeway name ([[San Bernardino Freeway]], historic US 99 ref) rather than “I 10.”",
    categories: ["descriptive", "system"],
    disputed: false,
    sources: [
      { title: "Metro ExpressLanes (official)", url: "https://www.metroexpresslanes.net/" },
      { title: "Wikipedia: Interstate 10 in California", url: "https://en.wikipedia.org/wiki/Interstate_10_in_California" },
      { title: "Wikipedia: High-occupancy toll lane", url: "https://en.wikipedia.org/wiki/High-occupancy_toll_lane" }
    ]
  },

  "Marion Avenue": {
    name: "Marion Avenue",
    namedAfter: null,
    namedAfterLink: null,
    planned: { text: "by Aug. 1886", url: "https://lastreetnames.com/street/marion-avenue/" },
    built: "by Aug. 1886",
    note: "Some historians credit co-developer Everett E. Hall (1854–1936) with naming this for a daughter, Marion — but Kines found no record of her existing, and the street was named a month before Hall's first marriage. An 1897 ordinance briefly renamed it \"Stilson place\" (for co-developer William W. Stilson); restored Feb. 18, 1897.",
    categories: ["unknown"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Marion Avenue", url: "https://lastreetnames.com/street/marion-avenue/" },
      { title: "Los Angeles Herald, Feb. 19, 1897 (restoration of Marion Ave. and other names)", url: "https://cdnc.ucr.edu/?a=d&d=LAH18970219.2.24" }
    ]
  },

  "Court Street": {
    name: "Court Street",
    namedAfter: "Descriptive — likely for the street's own gently curving alignment, a common source for the generic \"court\" street-type name",
    namedAfterLink: null,
    planned: { text: "by Dec. 27, 1884 (recorded)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR006/MR006-138.pdf" },
    built: { text: "by Dec. 27, 1884 (recorded)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR006/MR006-138.pdf" },
    note: "Confirmed unrelated to Bunker Hill's demolished \"Court Street\" (Court Flight's base sat at Broadway & Temple, lat ~34.056): this street runs entirely at lat 34.063–34.069, ~1.2 km north across the Hollywood Freeway, in Angelino Heights/Echo Park — the 1897 Bradbury-rename fight does NOT belong here. Not covered by Kines.",
    categories: ["descriptive", "disputed"],
    disputed: true,
    sources: [
      { title: "Recorded map: Glassell's Subdivision of Lot No. 7 etc., Block 39, Hancock's Survey No. 1, M.R. 6-138 (recorded Dec. 27, 1884, at request of A. Glassell) — labels this street \"Court Street\" directly", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR006/MR006-138.pdf" },
      { title: "Wikipedia: Angelino Heights, Los Angeles", url: "https://en.wikipedia.org/wiki/Angelino_Heights,_Los_Angeles" },
      { title: "On Bunker Hill: Court Flight — The Other Funicular (base location, for comparison)", url: "https://www.onbunkerhill.org/court_flight/" }
    ]
  },

  "Miramar Street": {
    name: "Miramar Street",
    namedAfter: "Descriptive coinage — “Miramar” blends the Spanish mira al mar (“looks toward the sea”)",
    namedAfterLink: null,
    planned: { text: "by 1886 (as an extension of Ocean View Avenue)", url: "https://lastreetnames.com/street/miramar-street/" },
    built: "by 1886",
    nameHistory: [
      { from: "1886", until: "1896", name: "Ocean View Avenue",
        origin: "an eastward extension, in two unconnected portions, of Ocean View Avenue — opened 1886 on the Nob Hill tract, itself borrowing the name of San Francisco's Nob Hill",
        originLink: null },
      { from: "1896", until: "1897", name: "Nob Hill Avenue",
        origin: "residents petitioned to rename the extension \"Nob Hill Avenue\"", originLink: null },
      { from: "1897", until: "1915", name: "Ocean View Avenue",
        origin: "an 1897 city ordinance changed Nob Hill Ave. back to Ocean View Ave., while a separately grown section of Ocean View was renamed Miramar in that same ordinance",
        originLink: null },
      { from: "1915", until: null, name: "Miramar Street",
        origin: "the city unified the rest of Ocean View Avenue under the Miramar name, except for the original 1886 diagonal segment (outside this map's coverage), which still carries \"Ocean View Avenue\" today",
        originLink: null }
    ],
    note: "Bixel–Boylston appears as \"Third St\" on an 1894 tract map — one pre-1915 name this street absorbed (that sheet's \"Arnold St,\" one block south, is 3rd Street instead). Further west through Crown Hill, an 1909 tract's stretch \"establ[ished]\" as 3rd St by Ord. 39,578 is, per alignment, also Miramar — not 3rd Street. Confirmed via pixel-to-coordinate alignment, not lot-level records.",
    categories: ["renamed", "descriptive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Miramar Street / Ocean View Avenue", url: "https://lastreetnames.com/street/miramar-street/" },
      { title: "Recorded map: Compromise Subdivision / \"Washington Tract,\" M.R. 66-35/36 (surveyed Mar. 1894 by E.D. Severance; recorded May 1, 1897) — labels the Bixel–Boylston block's north side \"Third St.\"; alignment against the modern street grid via a pixel-to-coordinate overlay tool confirms this is Miramar's Bixel–Boylston stretch (the sheet's \"Arnold St\", one block south, is modern 3rd Street instead)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR066/MR066-035.pdf" },
      { title: "Recorded map: \"Crownwood\" (Witmer's Subdivision of parts of Lots 2 & 7, Block 38, Hancock Survey), M.B. 15-166 (surveyed Nov. 1909 by Chas. Forman Jr.) — annotates a Crown Hill stretch \"Name establ. por. of 3rd St. Ord. 39,578\"; alignment against the modern street grid, checked at multiple points, matches this stretch to modern Miramar Street (within ~20m) rather than modern 3rd Street (100m+ off)", url: "https://pw.lacounty.gov/smpm/landrecords/pdf/TR0015-166a.pdf" }
    ]
  },

  "Alpine Street": {
    name: "Alpine Street",
    namedAfter: "Possibly California's Alpine County or the Sierra Nevada — real estate agent William P. McIntosh (1849–1930) petitioned for the 1887 rename without stating a reason",
    namedAfterLink: null,
    planned: { text: "by 1849 (as Calle de las Vírgenes / Virgin Street)", url: ORD_SURVEY.url },
    built: "not yet researched",
    nameHistory: [
      { from: "1849", until: "Aug. 1887", name: "Virgin Street (Calle de las Vírgenes)",
        origin: "no explanation given on the 1849 survey — possibly a reference to bachelorettes, nuns, or the Virgin Mary {{(source)}}",
        originLink: "https://lastreetnames.com/street/alpine-street/" },
      { from: "Aug. 1887", until: null, name: "Alpine Street",
        origin: "renamed by petition of real estate agent William P. McIntosh, who'd run a Sierra lumber company near Alpine County in the 1870s but gave no stated reason",
        originLink: null }
    ],
    note: "Confirmed at the lot level via [[Hill Street]]'s Ord-survey citation: 809 N Hill St / 427 W Alpine St share Lot 6, Block 37, bounded by Calle del Toro (Hill) and Calle de las Vírgenes (Alpine).",
    categories: ["renamed", "place", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Alpine Street", url: "https://lastreetnames.com/street/alpine-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 73 labels this street “Calle de las Vírgenes / Virgin St” and shows the 809 N Hill St parcel (Lot 6, Block 37) bounded west by it", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-073.pdf" }
    ]
  },

  "College Street": {
    name: "College Street",
    namedAfter: "Descriptive — a June 1849 church request for a colegio (secondary school) here prompted Ord and Hutton's “College Street” label a month later, though no school was ever built",
    namedAfterLink: null,
    planned: { text: "by 1849 (as Calle del Colegio / College Street)", url: ORD_SURVEY.url },
    built: "not yet researched",
    note: "One of only three Chinatown streets — with Main and part of Adobe — to keep its 1849 Ord-survey name.",
    categories: ["descriptive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: College Street", url: "https://lastreetnames.com/street/college-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 73 labels this street “College”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-073.pdf" }
    ]
  },

  "Yale Street": {
    name: "Yale Street",
    namedAfter: "Possibly {{Yale University}} — no namesake was documented in the 1874 renaming petition, and Kines found no Yale graduates among the neighborhood's known 1870s figures",
    namedAfterLink: "https://en.wikipedia.org/wiki/Yale_University",
    planned: { text: "by 1849 (as Calle de las Avispas / Hornet Street)", url: ORD_SURVEY.url },
    built: "not yet researched",
    nameHistory: [
      { from: "1849", until: "Feb. 1874", name: "Hornet Street (Calle de las Avispas, “Wasp Street”)",
        origin: "avispa means “wasp”; insects were a common naming source in the young pueblo (cf. [[Figueroa Street|Grasshopper St]])",
        originLink: null },
      { from: "Feb. 1874", until: null, name: "Yale Street",
        origin: "renamed by the same petition that changed Bull St to Castelar (now [[Hill Street|N. Hill St]]) and proposed Grasshopper St to Union (Council chose Pearl St instead)",
        originLink: null }
    ],
    note: null,
    categories: ["renamed", "nature", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Yale Street", url: "https://lastreetnames.com/street/yale-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 73 labels this street “Calle de las Arispas” / “Hornet St”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-073.pdf" }
    ]
  },

  "Cleveland Street": {
    name: "Cleveland Street",
    namedAfter: "Possibly {{Grover Cleveland}} (1837–1908), elected president in 1884 — named Jan. 1886 on the Beaudry brothers' tract, which favored Americana-themed street names",
    namedAfterLink: "https://en.wikipedia.org/wiki/Grover_Cleveland",
    planned: "not yet researched",
    built: { text: "named Jan. 1886 on the Beaudry brothers' subdivision tract", url: "https://lastreetnames.com/street/cleveland-street/" },
    note: "An open positional guess ties this to the Ord Survey's “Calle de las Adobes” (sheet 73's northernmost platted street) — but Kines dates the name to a fresh 1886 Beaudry tract with no mention of an 1849 predecessor, so the two may be unrelated streets; unresolved.",
    categories: ["person", "governor", "disputed"],
    disputed: true,
    sources: [
      { title: "L.A. Street Names: Cleveland Street", url: "https://lastreetnames.com/street/cleveland-street/" }
    ]
  },

  "Ord Street": {
    name: "Ord Street",
    namedAfter: "{{Edward Otho Cresap Ord}} (1818–1883), U.S. Army engineer who surveyed and mapped the city in 1849 with William Rich Hutton — Fort Ord near Monterey also honors him",
    namedAfterLink: "https://en.wikipedia.org/wiki/Edward_Ord",
    planned: { text: "by 1849 (as Calle Alta / High Street)", url: ORD_SURVEY.url },
    built: "not yet researched",
    nameHistory: [
      { from: "1849", until: "1886", name: "High Street (Calle Alta)", origin: "no namesake documented", originLink: null },
      { from: "1886", until: "1890", name: "Walters Street", origin: "renamed for resident George Walters", originLink: null },
      { from: "1890", until: null, name: "Ord Street",
        origin: "renamed for surveyor E.O.C. Ord, who had not named it after himself when he mapped the city in 1849 {{(source)}}",
        originLink: "https://lastreetnames.com/street/ord-street/" }
    ],
    note: null,
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Ord Street", url: "https://lastreetnames.com/street/ord-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "Recorded map: Ord's Survey, county-recorder's copy, M.R. 53-66/73 (recorded Dec. 2, 1893) — sheet 73 labels this street “Calle Alta” / “High St”", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR053/MR053-073.pdf" }
    ]
  },

  "Cesar E Chavez Avenue": {
    name: "Cesar E Chavez Avenue",
    namedAfter: "{{Cesar Chavez}} (1927–1993), labor leader who co-founded the United Farm Workers",
    namedAfterLink: "https://en.wikipedia.org/wiki/Cesar_Chavez",
    planned: null,
    built: "not yet researched",
    nameHistory: [
      { from: "not yet researched", until: "Mar. 31, 1994", name: "Macy Street",
        origin: "named for pioneer merchants Obed and Oscar Macy; ran this name along the whole stretch through the Old Plaza/Chinatown area covered by this map",
        originLink: null },
      { from: "Mar. 31, 1994", until: null, name: "Cesar E. Chavez Avenue",
        origin: "Macy Street, Brooklyn Avenue (Boyle Heights/East L.A., outside this map's coverage), and a new Sunset Blvd connector were united and renamed for Chavez on his would-be 67th birthday, pushed by Supervisor Gloria Molina after his 1993 death {{(source)}}",
        originLink: "https://laist.com/news/entertainment/brooklyn-cesar" }
    ],
    note: "Kenny's positional-only guess ties the Ord Survey's “Calle Corta”/Short St (sheet 73's southern tip) to this street's westernmost stub — unconfirmed. In Mar. 2026 a New York Times investigation reported Chavez sexually abused several women and minors, including UFW co-founder Dolores Huerta; California and Denver subsequently renamed the associated holiday.",
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Cesar E. Chavez Avenue", url: "https://lastreetnames.com/street/cesar-e-chavez-avenue/" },
      { title: "Wikipedia: Cesar Chavez Avenue", url: "https://en.wikipedia.org/wiki/Cesar_Chavez_Avenue" },
      { title: "LAist: How L.A.'s Brooklyn Avenue Became Avenida Cesar Chavez", url: "https://laist.com/news/entertainment/brooklyn-cesar" },
      { title: "Wikipedia: Cesar Chavez sexual abuse allegations", url: "https://en.wikipedia.org/wiki/Cesar_Chavez_sexual_abuse_allegations" }
    ]
  },

  "Pico Boulevard": {
    name: "Pico Boulevard",
    namedAfter: "{{Pío de Jesús Pico}} (1801–1894), Alta California's last Mexican governor (1845–1846) and a major landowner",
    namedAfterLink: "https://en.wikipedia.org/wiki/Pio_Pico",
    planned: { text: "by 1855 (most likely 1853), as Pico Street", url: "https://lastreetnames.com/street/pico-boulevard/" },
    built: { text: "already \"Pico\" by Oct. 1885 (Cameron Tract survey)", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR007/MR007-021.pdf" },
    note: "Los Angeles never had an official 13th Street downtown — Pico Street picked up straight after 12th — though a 1903 item still locates a church at “Flower street, corner Pico (Thirteenth) street.” Became Pico Boulevard in 1914.",
    categories: ["person", "governor"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Pico Boulevard", url: "https://lastreetnames.com/street/pico-boulevard/" },
      { title: "Wikipedia: Pío Pico", url: "https://en.wikipedia.org/wiki/Pio_Pico" },
      { title: "Los Angeles Herald, Mar. 8, 1903 (Christ Episcopal Church, “Flower street, corner Pico (Thirteenth) street”)", url: "https://cdnc.ucr.edu/?a=d&d=LAH19030308.2.145" },
      { title: "Recorded map: Cameron Tract, M.R. 7-21 (surveyed by H.J. Stevenson, Oct. 1885; recorded Nov. 23, 1885) — labels this street \"Pico\" directly, at Figueroa", url: "https://pw.lacounty.gov/sur/nas/landrecords/misc/MR007/MR007-021.pdf" }
    ]
  },

  "Venice Boulevard": {
    name: "Venice Boulevard",
    namedAfter: "Descriptive/borrowed — named for the {{Venice}} beach resort the roadway leads to, itself modeled on Venice, Italy",
    namedAfterLink: "https://en.wikipedia.org/wiki/Venice,_Los_Angeles",
    planned: null,
    built: "not yet researched",
    nameHistory: [
      { from: "not yet researched", until: "1938", name: "West 16th Street",
        origin: "part of the numbered downtown grid, absorbed at this end of the corridor only when the 13-mile Venice Boulevard rebranding — championed by Culver City founder Harry H. Culver — finally reached it",
        originLink: null },
      { from: "1938", until: null, name: "Venice Boulevard",
        origin: "consolidated the roadway's many segment names (Center St., St. Marks Blvd., Electric Ave./Blvd., Front St., West 16th St.) under one Venice-themed name, an idea Venice residents floated in 1912 {{(source)}}",
        originLink: "https://lastreetnames.com/street/venice-boulevard/" }
    ],
    note: "A 1927 item locates a business at “the southeast corner of Figueroa street and Venice boulevard, formerly Sixteenth street” — confirming the absorption at this end of the corridor.",
    categories: ["place", "borrowed", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Venice Boulevard", url: "https://lastreetnames.com/street/venice-boulevard/" },
      { title: "Wikipedia: Venice, Los Angeles", url: "https://en.wikipedia.org/wiki/Venice,_Los_Angeles" },
      { title: "Los Angeles Herald, Feb. 26, 1927 (business at Figueroa & Venice Blvd., “formerly Sixteenth street”)", url: "https://cdnc.ucr.edu/?a=d&d=LAH19270226.1.9" }
    ]
  }
});

const CATEGORIES = [
  { id: "person",      label: "Named after a person" },
  { id: "alive",       label: "Namesake alive when named" },
  { id: "governor",    label: "Governors & politicians" },
  { id: "destination", label: "Named for where it goes" },
  { id: "aspiration",  label: "Virtues & aspirations" },
  { id: "renamed",     label: "Has former names" },
  { id: "borrowed",    label: "Borrowed from another city" },
  { id: "disputed",    label: "Origin disputed" },
  { id: "nature",      label: "Named for a plant, tree, or landform" },
  { id: "descriptive", label: "Descriptive of role or position" },
  { id: "place",       label: "Named for a place" },
  { id: "number",      label: "Numbered streets" },
  { id: "event",       label: "Named for an event" },
  { id: "system",      label: "Freeways & route systems" },
  { id: "unknown",     label: "Researched — origin not yet found" }
];

// Similar / related projects, shown from the title-bar button.
const SIMILAR_PROJECTS = [
  { title: "L.A. Street Names (Mark Tapio Kines)",
    url: "https://lastreetnames.com/",
    desc: "Researched prose histories of 2,200+ L.A. County street names — the primary narrative complement to this map." },
  { title: "History of San Francisco Place Names (Noah Veltman)",
    url: "http://sfstreets.noahveltman.com/",
    desc: "Clickable SF street-etymology map with theme filters; the closest predecessor to this project.",
    sub: [
      { title: "“Mapping the History of Street Names” (Veltman's write-up)",
        url: "https://source.opennews.org/articles/mapping-history-street-names/",
        desc: "How the SF map was built, and pitfalls for anyone building one." }
    ] },
  { title: "Open Etymology Map",
    url: "https://etymology.dsantini.it/",
    desc: "Worldwide map generated from OpenStreetMap's name:etymology:wikidata tags." },
  { title: "EqualStreetNames",
    url: "https://equalstreetnames.eu/",
    desc: "Open-source maps of street names by gender, 60+ cities — mostly in Belgium and Germany — built on OSM + Wikidata." },
  { title: "Paristique",
    url: "https://www.paristique.fr/",
    desc: "Interactive map of the history of Paris street names." },
  { title: "NYC honorary street names map",
    url: "https://streetnamesmap-nyc.hub.arcgis.com/",
    desc: "NYC Dept. of Records map of ~2,500 honorary street co-namings." },
  { title: "STNAMES LAB",
    url: "https://en.stnameslab.com/the-project/",
    desc: "Academic research project analyzing street names as cultural markers; focuses on Spain but has searchable maps of North America." },
  { title: "Streetpédia",
    url: "https://streetpedia.fr/",
    desc: "French mobile app with audio street-name histories." }
];
