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
    namedAfter: "The city itself — ultimately from {{Nuestra Señora de los Ángeles de Porciúncula}}, the 1769 Spanish naming of the L.A. River",
    namedAfterLink: "https://en.wikipedia.org/wiki/History_of_Los_Angeles",
    planned: "not yet researched",
    built: "by 1854",
    note: "Its northernmost block was the separate Calle de los Negros — site of L.A.'s first Chinatown and the 1871 anti-Chinese massacre — absorbed into Los Angeles Street in 1910.",
    categories: ["place"],
    disputed: false,
    sources: [
      { title: "L.A. Street Names: Los Angeles Street", url: "https://lastreetnames.com/street/los-angeles-street/" },
      { title: "Wikipedia: Calle de los Negros", url: "https://en.wikipedia.org/wiki/Calle_de_los_Negros" }
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
    note: "The donor side of the Figueroa name transfer — see Figueroa Street's history for the receiving side.",
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
  }
};

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
  { id: "place",       label: "Named for a place" }
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
