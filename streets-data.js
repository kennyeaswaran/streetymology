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
            origin: "renamed Feb. 26, 1874, apparently for gentility as the street became a fashionable address; no specific namesake documented {{(source)}}",
            originLink: "https://www.pbssocal.org/shows/lost-la/the-evolution-of-a-corner-downtown-l-a-at-figueroa-seventh" },
          { from: "1897", until: null, name: "Figueroa Street",
            origin: "name transferred from an older Figueroa Street (c. 1853–1857) a few blocks west, which simultaneously became Boylston {{(source)}}",
            originLink: "https://lastreetnames.com/street/figueroa-street/" }
        ],
        note: null,
        categories: ["person", "governor", "renamed"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Figueroa Street", url: "https://lastreetnames.com/street/figueroa-street/" },
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
          { title: "Lost LA: The Evolution of a Corner (PBS SoCal)", url: "https://www.pbssocal.org/shows/lost-la/the-evolution-of-a-corner-downtown-l-a-at-figueroa-seventh" },
          { title: "Los Angeles Revisited: The Pulchritude of Pearl Street", url: "https://losangelesrevisited.blogspot.com/2019/01/the-pulchritude-of-pearl-street.html" },
          { title: "Wikipedia: Figueroa Street", url: "https://en.wikipedia.org/wiki/Figueroa_Street" }
        ]
      },
      {
        label: "south of Pico",
        maxLat: 34.040,
        name: "Figueroa Street",
        namedAfter: "{{José Figueroa (1792–1835)}}, governor of Alta California 1833–1835",
        namedAfterLink: "https://en.wikipedia.org/wiki/Jos%C3%A9_Figueroa",
        planned: "not yet researched",
        built: "not yet researched",
        note: "Pearl ended at Pico; what this stretch was called before 1897 is not yet researched.",
        categories: ["person", "governor"],
        disputed: false,
        sources: [
          { title: "L.A. Street Names: Figueroa Street", url: "https://lastreetnames.com/street/figueroa-street/" },
          { title: "Los Angeles Revisited: The Pulchritude of Pearl Street", url: "https://losangelesrevisited.blogspot.com/2019/01/the-pulchritude-of-pearl-street.html" }
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
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
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
    note: "No longer reaches San Pedro; it merges into Avalon Blvd.",
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
          { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
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
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
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
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
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
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url }
    ]
  },

  "Boylston Street": {
    name: "Boylston Street",
    namedAfter: "Boston's {{Boylston Street}}, suggested in 1897 by financier O.T. Johnson (1839–1916)",
    namedAfterLink: "https://en.wikipedia.org/wiki/Boylston_Street",
    planned: null,
    built: "c. 1853–1857 (as the original Figueroa Street)",
    nameHistory: [
      { from: "c. 1853–1857", until: "Jan. 1897", name: "Figueroa Street",
        origin: "honored Gov. José Figueroa; in Jan. 1897 a city commission moved the name a few blocks east onto the former Pearl Street {{(source)}}",
        originLink: "https://lastreetnames.com/street/boylston-street/" },
      { from: "Jan. 1897", until: "Jan. 1897", name: "De La Guerra Street",
        origin: "the commission's initial replacement choice, almost immediately displaced by Johnson's objection", originLink: null },
      { from: "1897", until: null, name: "Boylston Street", origin: null, originLink: null }
    ],
    note: "The donor side of the [[Figueroa Street]] name transfer.",
    categories: ["borrowed", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Boylston Street", url: "https://lastreetnames.com/street/boylston-street/" },
      { title: "L.A. Street Names: Figueroa Street", url: "https://lastreetnames.com/street/figueroa-street/" }
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
          { title: "Wikipedia: Hill Street (Los Angeles)", url: "https://en.wikipedia.org/wiki/Hill_Street_(Los_Angeles)" },
          { title: "Wikipedia: Bunker Hill (Los Angeles)", url: "https://en.wikipedia.org/wiki/Bunker_Hill_(Los_Angeles)" }
        ]
      }
    ]
  },

  "Towne Avenue": {
    name: "Towne Avenue",
    namedAfter: "Alban Nelson Towne (1829–1895), general manager of the Southern Pacific Railroad",
    namedAfterLink: null,
    planned: null,
    built: "1887",
    note: "Named alongside [[Stanford Avenue]] and [[Crocker Street]] when subdividers of Joseph Wolfskill's old DTLA orchard donated 13 acres at 4th & Alameda for a new SPRR station (the Arcade Depot, opened 1888) and honored the railroad's brass.",
    categories: ["person", "alive"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Towne Avenue", url: "https://lastreetnames.com/street/towne-avenue-dtla/" }
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
    note: "Sibling to [[Towne Avenue]] and [[Stanford Avenue]] — all three trace to the 1887 SPRR station land deal. The exact renaming year is not yet researched.",
    categories: ["person", "renamed"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Towne Avenue (recounts the Crocker/Stanford street swap)", url: "https://lastreetnames.com/street/towne-avenue-dtla/" },
      { title: "Wikipedia: Charles Crocker", url: "https://en.wikipedia.org/wiki/Charles_Crocker" }
    ]
  },

  "Stanford Avenue": {
    name: "Stanford Avenue",
    namedAfter: "{{Leland Stanford}} (1824–1893), president of the Southern Pacific Railroad and governor of California 1862–1863",
    namedAfterLink: "https://en.wikipedia.org/wiki/Leland_Stanford",
    planned: null,
    built: "1887 (as Ruth Avenue)",
    nameHistory: [
      { from: "1887", until: "?", name: "Ruth Avenue",
        origin: "presumably named for a daughter of landowner Joseph Wolfskill, whose old DTLA orchard was being subdivided {{(source)}}",
        originLink: "https://lastreetnames.com/street/towne-avenue-dtla/" },
      { from: "?", until: null, name: "Stanford Avenue",
        origin: "took over the Stanford name once the original Stanford Avenue, a block over, was renamed Crocker Street {{(source)}}",
        originLink: "https://lastreetnames.com/street/towne-avenue-dtla/" }
    ],
    note: "Sibling to [[Towne Avenue]] and [[Crocker Street]] — all three trace to the 1887 SPRR station land deal. The exact renaming year is not yet researched.",
    categories: ["person", "renamed", "governor"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Towne Avenue (recounts the Crocker/Stanford street swap)", url: "https://lastreetnames.com/street/towne-avenue-dtla/" },
      { title: "Wikipedia: Leland Stanford", url: "https://en.wikipedia.org/wiki/Leland_Stanford" }
    ]
  },

  "Wall Street": {
    name: "Wall Street",
    namedAfter: null,
    namedAfterLink: null,
    planned: null,
    built: "not yet researched",
    note: "The Southern California Flower Market (1912, at 421 Wall St.) and later the American Florists' Exchange settled here, making it the core of today's Flower District. The name's own origin is not yet researched: not covered by Kines, and a search across Wikipedia, Homestead Museum, Los Angeles Revisited, LAPL, and a citywide SurveyLA historic context statement turned up no source tying it to New York's Wall Street or to an actual wall.",
    categories: ["unresearched"],
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
    categories: ["unresearched"],
    disputed: false,
    sources: [
      { title: "Wikipedia: Los Angeles Flower District", url: "https://en.wikipedia.org/wiki/Los_Angeles_Flower_District" },
      { title: "Wikipedia: Los Angeles Fashion District", url: "https://en.wikipedia.org/wiki/Los_Angeles_Fashion_District" }
    ]
  },

  "San Julian Street": {
    name: "San Julian Street",
    namedAfter: "Possibly {{St. Julian the Hospitaller}}, patron saint of travelers and innkeepers — an interpretive reading (per J. Michael Walker's 2008 book on L.A.'s saint-named streets) rather than a documented namesake",
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
  "2nd Street": numberedStreet("2nd Street"),
  "3rd Street": numberedStreet("3rd Street"),
  "4th Street": numberedStreet("4th Street", {
    note: "The 1890 petition that turned Fort Street into Broadway cited confusion between “Fort” and “Fourth”.",
    sources: [
      { title: "L.A. Street Names: 1st Street (on the numbering system)", url: "https://lastreetnames.com/street/0001st-street/" },
      { title: ORD_SURVEY.title, url: ORD_SURVEY.url },
      { title: "L.A. Street Names: Broadway (the Fort/Fourth confusion)", url: "https://lastreetnames.com/street/broadway/" }
    ]
  }),
  "5th Street": numberedStreet("5th Street"),
  "6th Street": numberedStreet("6th Street"),
  "7th Street": numberedStreet("7th Street"),
  "8th Street": numberedStreet("8th Street"),
  "9th Street": numberedStreet("9th Street", {
    note: "A donor street twice over: its stretch west of Figueroa became [[James M Wood Boulevard|James M. Wood Blvd]] in 1997, and its continuation east of Central Ave was absorbed by [[Olympic Boulevard|Olympic Blvd]] by 1945.",
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
        built: "not yet researched",
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
          { title: "Wikipedia: Olympic Boulevard (Los Angeles)", url: "https://en.wikipedia.org/wiki/Olympic_Boulevard_(Los_Angeles)" }
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
  { id: "unresearched",label: "Origin not yet researched" }
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
