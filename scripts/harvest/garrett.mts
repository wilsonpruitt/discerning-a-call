// Garrett Seminary (Evanston, IL) — harvest.
//
// Bespoke like the three before it. What's different here:
//   - Garrett's own site is mid-rebrand: body copy consistently says "Garrett
//     Seminary" (hero tagline, news posts, footer blurb, nav strapline), but
//     the <title>, meta og:site_name, footer copyright line, and every logo/
//     favicon filename still say "Garrett-Evangelical Theological Seminary."
//     GBHEM's roster already reads "Garrett Seminary" (see
//     data/senate-roster.json), so this profile follows the roster and the
//     school's own prose — not its lagging metadata. No mismatch to flag
//     against the roster; the mismatch is Garrett's site against itself.
//   - The MDiv curriculum guide is a two-page PDF laid out in an actual grid
//     (Foundational / Distribution / Integrative / General Elective), which
//     pdftotext -layout renders as a legible table — no OCR needed.
//   - The richest single find: Garrett's own Academic Bulletin explicitly
//     labels one of its required Foundational courses, THEO 540 "Global
//     Christianity in an Interfaith World," as satisfying "Mission of the
//     Church" for its Basic Graduate Theological Studies / Advanced Course of
//     Study tracks. That is Garrett's own ¶324.4 vocabulary, not our
//     inference — see coverage row below.
//   - Faculty: Garrett runs a WordPress "directories" custom post type with a
//     public, unauthenticated REST API (wp-json/wp/v2/directories, filterable
//     by wp-json/wp/v2/directory_categories). No Playwright needed. Titles
//     live in <h2> headings before an "Education" heading in each person's
//     `content.rendered`; some people carry two headings (an administrative
//     one and an academic one) — the academic one becomes `title`, the
//     administrative one goes to `otherRoles`.
//   - Mark Teasdale appears in the faculty-page "Faculty Publications"
//     carousel with a Garrett title, but has no entry anywhere in the
//     directories API (not in faculty, not in emeriti, not in adjunct). He
//     has left Garrett; the carousel is stale. Dropped rather than harvested
//     — exactly the kind of trap the plan warns about.

import { get, today } from "./lib/fetch.mts";
import { pdfToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import type { StudyArea } from "../../content/types.ts";

const fresh = process.argv.includes("--fresh");

async function main() {
  // --- 1. Confirm self-branding on the homepage (logged, not asserted into JSON beyond name/source) ---
  const home = await get("https://www.garrett.edu/", { fresh });
  const usesGarrettSeminary = /Garrett Seminary (provides|is|forms|welcomes)/i.test(home.body);
  const usesLegacyName = /Garrett-Evangelical Theological Seminary\. All rights reserved/i.test(home.body);
  console.log(
    `Homepage self-branding: body copy uses "Garrett Seminary" = ${usesGarrettSeminary}; ` +
      `footer copyright still reads "Garrett-Evangelical Theological Seminary" = ${usesLegacyName}.`,
  );

  // --- 2. MDiv curriculum guide (PDF) — the ¶324.4 coverage table's primary source ---
  const mdivPdf = await get(
    "https://my.garrett.edu/ICS/icsfs/MDiv_Curriculum_Guide_2025-2026.pdf?target=57162909-e273-4120-8e27-5a5a6bd99e86",
    { fresh, binary: true },
  );
  const mdivText = pdfToText(mdivPdf.path);
  if (!/Total Graduation Credits: 76/.test(mdivText)) {
    console.warn("WARNING: MDiv guide no longer reads 76 total credits — re-check the coverage table by hand.");
  }
  if (!/except for DENOM 603.*DENOM 604/s.test(mdivText.replace(/\n/g, " "))) {
    console.warn("WARNING: MDiv guide's UM-studies exclusion sentence not found verbatim — re-verify um-studies status.");
  }

  // --- 3. Academic Bulletin (PDF) — confirms THEO-540 maps to "Mission of the Church" ---
  const catalogPdf = await get(
    "https://mygets.garrett.edu/ICS/icsfs/Catalog_2024-2025.pdf?target=71dfee13-5198-48e7-b173-845f2cb8b7b7",
    { fresh, binary: true },
  );
  const catalogText = pdfToText(catalogPdf.path);
  if (!/Mission of the Church \(one of the following\)\s*\n?THEO-540/.test(catalogText)) {
    console.warn("WARNING: catalog no longer maps THEO-540 to \"Mission of the Church\" — re-verify that coverage row.");
  }

  // --- 4. Tuition and financial aid pages ---
  const tuitionPage = await get("https://www.garrett.edu/admissions/tuition-fees/", { fresh });
  const aidPage = await get("https://www.garrett.edu/admissions/scholarships-financial-aids/", { fresh });
  if (!/\$963/.test(tuitionPage.body)) console.warn("WARNING: tuition page no longer shows $963/credit — re-check.");
  if (!/50-100% tuition|50%-100% Tuition/i.test(aidPage.body)) {
    console.warn("WARNING: financial aid page no longer states the 50-100% master's scholarship range — re-check.");
  }

  const asOf = today();

  // --- 5. Faculty via the public directories REST API ---
  const facultyList = JSON.parse(
    (await get("https://www.garrett.edu/wp-json/wp/v2/directories?directory_categories=94&per_page=100", { fresh }))
      .body,
  ) as DirectoryEntry[];
  const emeritiList = JSON.parse(
    (await get("https://www.garrett.edu/wp-json/wp/v2/directories?directory_categories=97&per_page=100", { fresh }))
      .body,
  ) as DirectoryEntry[];

  const faculty = [...facultyList.map((e) => parseEntry(e, false)), ...emeritiList.map((e) => parseEntry(e, true))];

  // Manual publication additions sourced from prose bios that name real books
  // with year and/or publisher (validator wants clean titles; these were
  // hand-checked against the source bio, not machine-split from a CV list).
  addPublications(faculty, "garrett-charles-cosgrove", "https://www.garrett.edu/directories/charles-cosgrove/", asOf, [
    { title: "Music at Social Meals in Greek and Roman Antiquity: From the Archaic Period to the Age of Augustus", kind: "book", year: 2022, publisher: "Cambridge University Press" },
    { title: "Fortune and Faith: A Dual Biography of Mayor Augustus Garrett and Seminary Founder Eliza Clark Garrett", kind: "book", year: 2020, publisher: "Southern Illinois University Press" },
    { title: "An Ancient Christian Hymn with Musical Notation: Papyrus Oxyrhynchus 1786", kind: "book", year: 2011, publisher: "Mohr Siebeck" },
    { title: "Appealing to Scripture in Moral Debate: Five Hermeneutical Rules", kind: "book", year: 2002, publisher: "Eerdmans" },
  ]);
  addPublications(faculty, "garrett-osvaldo-vena", "https://www.garrett.edu/directories/osvaldo-vena/", asOf, [
    { title: "Latinx Perspectives on the New Testament", kind: "edited-volume", year: 2022, publisher: "Lexington Books/Fortress Academic", note: "Co-edited with Leticia A. Guardiola-Sáenz." },
    { title: "Postcards from Egypt: Reimagining Jesus in the Gospel of Mark", kind: "book", year: 2020, publisher: "Resource Publications" },
    { title: "Jesus, Disciple of the Kingdom: Mark's Christology for a Community in Crisis", kind: "book", year: 2014, publisher: "Pickwick Publications" },
    { title: "Evangelio de Marcos: Comentario para Exegesis y Traducción", kind: "book", year: 2008, publisher: "United Bible Societies" },
    { title: "Apocalipsis (Revelation)", kind: "book", year: 2008, publisher: "Augsburg Fortress" },
  ]);
  addPublications(faculty, "garrett-brent-p-waters", "https://www.garrett.edu/directories/brent-p-waters/", asOf, [
    { title: "Common Callings and Ordinary Virtues: Christian Ethics for Everyday Life", kind: "book" },
    { title: "Just Capitalism: A Christian Ethic of Globalization", kind: "book" },
    { title: "Christian Moral Theology in the Emerging Technoculture: From Posthuman Back to Human", kind: "book" },
    { title: "This Mortal Flesh: Incarnation and Bioethics", kind: "book" },
  ]);
  // "Faculty Publications" carousel on the faculty page — a title-and-author
  // highlight, not a CV. One book each, sourced to that page. Mark Teasdale's
  // entry is deliberately excluded: he has no entry in the directories API
  // under any category (faculty, emeriti, or adjunct) and appears to have
  // left Garrett; the carousel did not get updated.
  const carouselSource = "https://www.garrett.edu/academics/faculty/";
  addPublications(faculty, "garrett-rolf-nolasco", carouselSource, asOf, [
    { title: "God's Beloved Queer: Identity, Spirituality, and Practice", kind: "book" },
  ]);
  addPublications(faculty, "garrett-gennifer-b-brooks", carouselSource, asOf, [
    { title: "Good News Preaching", kind: "book", note: "Garrett faculty-page highlight; full citation not given there." },
  ]);
  addPublications(faculty, "garrett-nancy-e-bedford", carouselSource, asOf, [
    { title: "Who Was Jesus and What Does It Mean to Follow Him?", kind: "book" },
  ]);
  addPublications(faculty, "garrett-timothy-r-eberhart", carouselSource, asOf, [
    { title: "Rooted and Grounded in Love: Holy Communion for the Whole Creation", kind: "book" },
  ]);
  addPublications(faculty, "garrett-e-byron-ron-anderson", carouselSource, asOf, [
    { title: "Common Worship: Tradition, Formation, Mission", kind: "book" },
  ]);
  addPublications(faculty, "garrett-mai-anh-le-tran", carouselSource, asOf, [
    { title: "Reset the Heart: Unlearning Violence, Relearning Hope", kind: "book" },
  ]);
  addPublications(faculty, "garrett-reginald-blount", carouselSource, asOf, [
    { title: "Let Your Light Shine: Mobilizing for Justice with Children and Youth", kind: "book" },
  ]);
  addPublications(faculty, "garrett-jaeyeon-lucy-chung", carouselSource, asOf, [
    { title: "Korean Women, Self-Esteem, and Practical Theology: Transformative Care", kind: "book" },
  ]);
  addPublications(faculty, "garrett-wonhee-anne-joh", carouselSource, asOf, [
    { title: "Critical Theology Against US Militarism in Asia: Decolonization and Deimperalization", kind: "book" },
  ]);
  addPublications(faculty, "garrett-anna-m-johnson", carouselSource, asOf, [
    { title: "Beyond Indulgences: Luther's Reform of Late Medieval Piety, 1518-1520", kind: "book" },
  ]);
  addPublications(faculty, "garrett-james-l-papandrea", carouselSource, asOf, [
    { title: "Reading the Early Church Fathers", kind: "book" },
  ]);
  addPublications(faculty, "garrett-julie-a-duncan", carouselSource, asOf, [
    { title: "Ecclesiastes (Abingdon Old Testament Commentaries)", kind: "book" },
  ]);
  addPublications(faculty, "garrett-k-k-yeo", carouselSource, asOf, [
    { title: "The Spirit Hovers: Journeying through Chaos with Prayers", kind: "book" },
  ]);
  addPublications(faculty, "garrett-jen-harvey", carouselSource, asOf, [
    { title: "Anti-Racism as Daily Practice: Refuse Shame, Change White Communities, and Help Create a Just World", kind: "book" },
  ]);
  addPublications(faculty, "garrett-kate-ott", carouselSource, asOf, [
    { title: "Sex, Tech & Faith: Ethics for a Digital Age", kind: "book" },
  ]);

  await writeFile(
    "data/faculty/garrett.json",
    JSON.stringify(faculty.sort((a, b) => a.name.localeCompare(b.name)), null, 2) + "\n",
  );

  // --- 6. The profile itself ---
  const profile = buildProfile(asOf);
  await writeFile("data/seminaries/garrett.json", JSON.stringify(profile, null, 2) + "\n");

  console.log(`Wrote data/seminaries/garrett.json and data/faculty/garrett.json (${faculty.length} faculty).`);
}

interface DirectoryEntry {
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
}

interface FacultyOut {
  id: string;
  seminarySlug: string;
  name: string;
  title: string;
  otherRoles?: string[];
  areas: StudyArea[];
  degrees?: string[];
  publications?: { title: string; kind: string; year?: number; publisher?: string; note?: string }[];
  publicationsSource?: string;
  publicationsAsOf?: string;
  profileUrl: string;
}

function idFor(slug: string): string {
  // slug already "firstname-middle-lastname" from WordPress; take the last
  // hyphenated token as the surname key, matching perkins/brite convention
  // loosely ("<school>-<surname>"). Garrett's slugs are the full name, so
  // reuse the whole slug for stability (surnames alone collide too often —
  // "anderson" appears twice).
  return `garrett-${slug}`;
}

function parseEntry(e: DirectoryEntry, emeritus: boolean): FacultyOut {
  const html = e.content.rendered;
  const eduMatch = /<h[23][^>]*>\s*Education\s*<\/h[23]>/i.exec(html);
  const headSection = eduMatch ? html.slice(0, eduMatch.index) : html;
  const headings = [...headSection.matchAll(/<h2[^>]*>(.*?)<\/h2>/gis)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
    .filter((h) => h && h.toLowerCase() !== "education");

  const academic = headings.filter((h) => /professor|lecturer|instructor|senior scholar|faculty emeritus/i.test(h));
  const administrative = headings.filter((h) => !academic.includes(h));

  const title = academic[0] ?? headings[0] ?? "(title not stated)";
  const otherRoles = [...academic.slice(1), ...administrative];

  const eduList = eduMatch
    ? [...html.slice(eduMatch.index!).matchAll(/<li>(.*?)<\/li>/gis)]
        .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#8217;/g, "’").trim())
        .filter(Boolean)
    : [];

  const name = e.title.rendered.replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim();
  let areas = suggestAreas(title, otherRoles);
  // The title-pattern normalizer misses these nine outright — endowed/atypical
  // wording ("Hebrew Scriptures" not "Hebrew Bible", "Senior Scholar of
  // Theology" not "Professor of Theology," etc.). Hand-assigned after reading
  // each title (and, for Schmidt, the bio — "Senior Scholar" alone names no
  // field). Per README: the normalizer suggests, it doesn't decide.
  const areaOverrides: Record<string, StudyArea[]> = {
    "charles-cosgrove": ["church-history"],
    "debora-b-a-junker": ["christian-education-formation"],
    "emma-a-escobar": ["mission-social-justice"],
    "frederick-w-schmidt": ["spiritual-formation"],
    "g-brooke-lester": ["hebrew-bible"],
    "lallene-j-rector": ["pastoral-care-counseling"],
    "luis-r-rivera": ["systematic-theology"],
    "timothy-r-eberhart": ["ethics-public-theology", "mission-social-justice"],
    "wonhee-anne-joh": ["systematic-theology"],
  };
  if (!areas.length && areaOverrides[e.slug]) areas = areaOverrides[e.slug];

  return {
    id: idFor(e.slug),
    seminarySlug: "garrett",
    name,
    title,
    ...(otherRoles.length ? { otherRoles } : {}),
    areas,
    ...(eduList.length ? { degrees: eduList } : {}),
    profileUrl: e.link,
  };
}

function addPublications(
  faculty: FacultyOut[],
  id: string,
  source: string,
  asOf: string,
  pubs: { title: string; kind: string; year?: number; publisher?: string; note?: string }[],
) {
  const person = faculty.find((f) => f.id === id);
  if (!person) {
    console.warn(`No faculty member with id ${id} — skipping ${pubs.length} publication(s).`);
    return;
  }
  person.publications = pubs;
  person.publicationsSource = source;
  person.publicationsAsOf = asOf;
}

function buildProfile(asOf: string) {
  const senateSource = "https://www.gbhem.org/education/schools-of-theology/";
  const senateAsOf = "2026-07-07";
  const mdivGuideUrl =
    "https://my.garrett.edu/ICS/icsfs/MDiv_Curriculum_Guide_2025-2026.pdf?target=57162909-e273-4120-8e27-5a5a6bd99e86";
  const catalogUrl =
    "https://mygets.garrett.edu/ICS/icsfs/Catalog_2024-2025.pdf?target=71dfee13-5198-48e7-b173-845f2cb8b7b7";

  return {
    slug: "garrett",
    name: "Garrett Seminary",
    nameNote:
      "Garrett's own body copy — its homepage hero tagline, news posts, and footer strapline — consistently self-identifies as \"Garrett Seminary,\" matching GBHEM's roster. Its page titles, meta site-name tags, footer copyright line, and logo/favicon filenames still say \"Garrett-Evangelical Theological Seminary\": a rebrand in progress on the same site, not a mismatch with the Senate roster.",
    nameSource: "https://www.garrett.edu/",
    nameAsOf: asOf,
    city: "Evanston",
    state: "IL",
    url: "https://www.garrett.edu/",
    lastVerified: asOf,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: senateSource,
        asOf: senateAsOf,
        note: "One of the 13 United Methodist schools of theology.",
      },
      onlineCredit: {
        value: "fully-counts",
        source: senateSource,
        asOf: senateAsOf,
        note: "GBHEM: all United Methodist schools of theology are approved to provide a fully online M.Div. that meets the educational requirements for UM ordination. Garrett itself offers the MDiv as residential, hybrid, or fully online.",
      },
      coverageSource: mdivGuideUrl,
      coverageAsOf: "2025-08-01",
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "BIBHB 500 Introduction to Hebrew Bible, one of six Foundational Requirements (18 credits total).",
        },
        {
          area: "new-testament",
          status: "required",
          note: "BIBNT 500 Introduction to New Testament, a Foundational Requirement.",
        },
        {
          area: "theology",
          status: "required",
          note: "THEO 500 Introduction to Theology, a Foundational Requirement.",
        },
        {
          area: "church-history",
          status: "required",
          note: "Both HIST 501 History of Christian Thought/Practice I and HIST 502 II are Foundational Requirements — the full year, not a choice of one.",
        },
        {
          area: "mission-of-the-church",
          status: "required",
          note: "THEO 540 Global Christianity in an Interfaith World is a Foundational Requirement, and Garrett's own Academic Bulletin explicitly categorizes THEO-540 under \"Mission of the Church (one of the following)\" in its Basic Graduate Theological Studies and Advanced Course of Study tables — Garrett's own ¶324.4 label for the course, not our inference. See the Academic Bulletin, p.34.",
        },
        {
          area: "evangelism",
          status: "required",
          note: "CL 510 Theology of Evangelism or CL 611 Empowering Congregations for Evangelism — a required Distribution Requirement row (both options are evangelism courses; the OR is between equivalents, not a choice of subject).",
        },
        {
          area: "worship-liturgy",
          status: "required",
          note: "LTRGY 510 United Methodist Worship or LTRGY 511 Worship in Ecumenical Perspective — a required Distribution Requirement row, distinct from the preaching row below.",
        },
        {
          area: "preaching",
          status: "required",
          note: "LTRGY 500 Preaching and Proclamation or LTRGY 502 Preaching in African American Context — a required Distribution Requirement row.",
        },
        {
          area: "um-studies",
          status: "elective",
          note: "Garrett's own MDiv Curriculum Guide says it plainly: \"All courses required for United Methodist ordination are included in the MDiv program, except for DENOM 603 (UM Studies: Wesley and the 19th Century) and DENOM 604 (UM Studies: 20th Century to the Present). These can be taken as general electives.\" ¶324.4's 6-hour UM-studies floor is the one area Garrett's required core does not carry — it has to be chosen from the 15–24 hours of general electives.",
        },
      ],
      gapSummary: [
        "Garrett covers eight of the nine ¶324.4 areas in its required MDiv core — the best result found on this site so far, and it covers Mission of the Church, Evangelism, Preaching, and Worship as named, distinct required courses rather than as options inside a broader distribution choice.",
        "The one gap is United Methodist studies itself: DENOM 603 and DENOM 604, the two courses that carry Wesley-and-19th-century and 20th-century-to-present UM history, doctrine, and polity, are named by Garrett's own curriculum guide as courses students must take from general elective space, not the required core. For a United Methodist seminary this is a narrow but real gap — six specific hours you have to plan for rather than receive automatically.",
      ],
      gapRemedies: [
        {
          blurb: "Register for DENOM 603 and DENOM 604 as two of your 15–24 general elective hours — Garrett names them by course number, so there is nothing to guess about which electives satisfy this.",
          url: mdivGuideUrl,
        },
        {
          blurb: "If you are pursuing deacon's orders or the Advanced Course of Study rather than the full MDiv, Garrett's stackable \"Foundations of Methodist Ministry\" certificate bundles DENOM 603, DENOM 604, UM worship, and evangelism/preaching into a single 15-hour sequence built for exactly this purpose.",
          url: "https://www.garrett.edu/academics/degrees-and-programs/certificates/foundations-of-methodist-ministry/",
        },
        {
          blurb: "Confirm with your conference's Board of Ordained Ministry registrar that DENOM 603/604 taken as general electives satisfy their file the same way a required core course would — the credit is identical, but boards vary in what they ask to see.",
        },
      ],
    },

    cost: {
      tuitionPerCredit: {
        value: "$963 per credit hour (master's programs)",
        source: "https://www.garrett.edu/admissions/tuition-fees/",
        asOf: "2026-07-21",
        note: "Stated for academic year 2026–27. A three-hour course is $2,889. D.Min. is $868/credit and Ph.D. is $448/credit.",
      },
      fees: [
        { label: "Technology fee (5+ credit hours)", amount: "$328 per term" },
        { label: "Technology fee (1–4 credit hours)", amount: "$164 per term" },
        { label: "Student fee (5+ credit hours)", amount: "$149 per term" },
        { label: "Student fee (1–4 credit hours)", amount: "$75 per term" },
        { label: "Matriculation fee (not for auditors)", amount: "$80" },
        { label: "Initial NU netID connection fee", amount: "$55" },
      ],
      pctReceivingAid: {
        value: "Every degree-seeking student who studies at least part-time",
        source: "https://www.garrett.edu/admissions/scholarships-financial-aids/",
        asOf: asOf,
        note: "Garrett states this plainly and repeatedly: no separate scholarship application exists. Applying for admission is applying for aid.",
      },
      typicalAward: {
        value: "Master's students: 50–100%+ of tuition; 65–100% for Early Action (apply by Dec. 31, 2026 for Fall 2027); Ph.D.: 100% of tuition plus fellowships/stipends; D.Min.: 25–50% of tuition",
        source: "https://www.garrett.edu/admissions/scholarships-financial-aids/",
        asOf: asOf,
        note: "These are ranges Garrett states for degree-seeking students generally, not a UMC-candidate-specific award — unlike Candler's certified-candidate 100%-tuition scholarship, Garrett's guaranteed-scholarship policy applies regardless of denomination or ordination track.",
      },
      honestNote:
        "Garrett's \"every degree-seeking student gets a scholarship\" framing is real and unusually broad — broader than a UMC-specific deal, since it applies to every denomination and every master's student. But \"50–100%\" is still a wide range, and the floor (50%) is what a late applicant should expect; the Early Action deadline (Dec. 31 for the following fall) is what moves the floor up to 65%. Ask financial aid what a typical MDiv award actually lands at, not just the advertised range.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "M.Div.",
        credits: 76,
        modalities: ["residential", "hybrid", "online"],
        blurb: "76 credit hours: 18 in Foundational Requirements, 33 in Distribution Requirements, 15–24 general electives, and a 10-credit Integrative sequence (two semesters of Field Education plus the Senior Colloquy capstone). Offered residential, hybrid, or fully online.",
        url: "https://www.garrett.edu/academics/degrees-and-programs/master-divinity/",
      },
      {
        name: "Master of Arts in Pastoral Care and Counseling",
        abbr: "M.A.P.C.C.",
        modalities: ["residential", "hybrid"],
        blurb: "Two tracks: Chaplaincy and Spiritual Care, and Clinical (toward licensure).",
        url: "https://www.garrett.edu/academics/degrees-and-programs/master-arts-pastoral-care-and-counseling/",
      },
      {
        name: "Master of Arts in Theology and Ministry",
        abbr: "M.A.T.M.",
        modalities: ["residential", "hybrid", "online"],
        url: "https://www.garrett.edu/academics/degrees-and-programs/master-arts-theology-ministry/",
      },
      {
        name: "Master of Theological Studies",
        abbr: "M.T.S.",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an ordination degree — academic/pre-doctoral study.",
        url: "https://www.garrett.edu/academics/degrees-and-programs/master-theological-studies/",
      },
      {
        name: "Doctor of Ministry",
        abbr: "D.Min.",
        modalities: ["hybrid"],
        blurb: "Three named tracks: Leadership for Social Transformation, Strategic Leadership in Black Congregations, and Spiritual Direction.",
        url: "https://www.garrett.edu/academics/degrees-and-programs/doctor-ministry/",
      },
      {
        name: "Doctor of Philosophy",
        abbr: "Ph.D.",
        modalities: ["residential"],
        blurb: "Six areas: Biblical Studies; Christian Education and Congregational Studies; History of Christianity and Historical Theology; Liturgical Studies; Theological and Ethical Studies; Pastoral Theology, Personality and Culture. Run jointly with Northwestern University.",
        url: "https://www.garrett.edu/academics/degrees-and-programs/doctor-philosophy/",
      },
      {
        name: "Stackable certificates toward Basic Graduate Theological Studies / Advanced Course of Study",
        abbr: "Nondegree",
        modalities: ["residential", "hybrid"],
        blurb: "\"Basic Christian Tradition\" and \"Foundations of Methodist Ministry\" — 15 hours each — together meet most of ¶324.4's Basic Graduate Theological Studies requirement and the Advanced Course of Study, outside a degree program.",
        url: "https://www.garrett.edu/academics/degrees-and-programs/certificates/christian-theological-studies/",
      },
    ],

    concentrations: [
      "Peace Studies",
      "LGBTQ Studies",
      "Ecological Regeneration",
      "Evangelism and Church Planting",
      "Christian Education",
      "Child Advocacy",
    ],

    partnerships: [
      {
        kind: "host-university",
        partner: "Northwestern University",
        blurb: "Garrett is an autonomous seminary located at the center of Northwestern's Evanston campus. Students get library access, cross-registration in a number of courses and disciplines, and access to NU's athletic and arts facilities.",
        url: "https://www.garrett.edu/",
      },
      {
        kind: "consortium",
        partner: "Association of Chicago Theological Schools (ACTS)",
        blurb: "Twelve Chicago-area seminaries across a range of denominational traditions, with combined full-time faculty near 300 — Garrett's own catalog calls it the largest concentration of theological scholars in an ecumenical relationship in the US. Cross-registration among all twelve, shared lectures and events, and lending privileges at every member library.",
        url: "https://www.actschicago.org/",
      },
    ],

    courseOfStudy: {
      blurb: "Garrett hosts the United Methodist Course of Study School for the General Board of Higher Education and Ministry — the five-year Basic Course of Study for licensed local pastors, run online with both synchronous and asynchronous sessions, plus the Advanced Course of Study for local pastors pursuing ordination as elder. Offered in English and, as the Escuela del Curso de Estudio, in Spanish.",
      url: "https://www.garrett.edu/academics/degrees-and-programs/umc-course-of-study/",
    },

    contact: {
      admissionsUrl: "https://www.garrett.edu/admissions/",
      visitUrl: "https://www.garrett.edu/admissions/admission-events/",
    },

    facultyNote:
      "Garrett publishes individual profile pages for its faculty (unusual among the schools harvested so far — Perkins publishes none). This roster covers the 30 people in Garrett's own \"Faculty\" directory category plus the 8 in \"Emeriti Faculty and Senior Scholars.\" Garrett's site also lists an \"Affiliate and Adjunct Faculty\" category, currently empty, so no adjuncts are omitted by that exclusion — there simply aren't any listed there right now.",
  };
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
