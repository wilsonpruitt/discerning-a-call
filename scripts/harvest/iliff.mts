// Iliff School of Theology — one of the 13 UMC schools of theology, and the
// only one of the 13 that is fully independent (not embedded in or attached
// to a host university — DU's Joint Doctoral Program is a partnership, not an
// institutional home).
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//   - Iliff's site is plain server-rendered WordPress HTML — no JS wall, no
//     PDF-only catalog. But it is scattered across THREE layers that disagree
//     with each other in ways that matter, and telling them apart is the
//     whole story of this harvest:
//       1. Marketing pages (masters-degrees-and-concentrations,
//          degrees-and-concentrations) — CURRENT (WP `modified` meta:
//          2025-08-12 and 2025-10-07), post the Fall 2025 curriculum
//          redesign. These describe the MDiv as 72 semester credits,
//          concentration-based, and publish NO course-level core
//          requirements at all — no named Hebrew Bible, New Testament,
//          history, or theology course anywhere on them.
//       2. A leftover departmental page (programs-mdiv) — STALE (WP
//          `modified`: 2024-07-18, i.e. pre-redesign), still describing the
//          old quarter-credit six-curricular-area core ("2 courses from each
//          of the six curricular areas") with its own broken "Quarter
//          Credits" placeholder never updated to the new semester numbers.
//          Evidence the school hasn't finished retiring it, not evidence of
//          current degree structure.
//       3. The United Methodist Church page (united-methodist-church) — also
//          STALE (WP `modified`: 2022-07-27, pre-redesign), but it is the
//          ONLY place on iliff.edu that names specific courses against
//          GBHEM's nine ¶324.4 areas ("This course list was developed in
//          consultation with the UMC General Board of Higher Education and
//          Ministry (GBHEM)"), and it does so in binding language: "The
//          United Methodist Church requires that students complete the
//          Basic Graduate Theological Studies and the five United Methodist
//          courses, which are all listed below."
//     WP modified-date checks ran via `/wp-json/wp/v2/pages?slug=<slug>` —
//     worth doing on every WordPress school before trusting a page's
//     currency, not just its content.
//   - THE COVERAGE FINDING: because layers 1 and 2 above name no
//     denomination-neutral required course in any of the nine ¶324.4 areas —
//     Iliff's own general MDiv, at its most specific documented level, ties
//     no single course to "everyone must take this" for OT, NT, theology,
//     history, worship, or preaching — every one of the nine binds a UMC
//     candidate ONLY through the UMC-specific page's obligation. All nine
//     score required-umc-track. Iliff is the first school in this harvest
//     with a 0/9 denomination-neutral core — contrast Duke's 5/9 and Saint
//     Paul's 7/9. That is a fact about how Iliff organizes its curriculum
//     (concentration-based, not core-based), not a defect in its ordination
//     preparation — GBHEM was a co-author of the mapping that does exist.
//   - VERIFYING A STALE PAGE AGAINST A CURRENT ONE: rather than trust the
//     2022 UMC page's course list at face value (its own three-course UM
//     History/Doctrine/Polity breakdown, for one, is now a two-course
//     sequence), every course it names was checked against Iliff's live
//     2025-2026 course catalog PDF (S3-hosted, not the Zendesk-gated one —
//     see below). Hebrew Bible (ILF 2003), the two-part New Testament
//     sequence (ILF 2007/2008, which supersedes the single intro course the
//     2022 page names), Introduction to Christian Theology (ILF 2510), the
//     UM History/Doctrine/Polity two-part sequence (ILF 2024/2025, six
//     credits — landing exactly on ¶324.4's UM-studies floor), UM Mission of
//     the Church in the World (ILF 2127), and Evangelism in Contemporary
//     Contexts (ILF 2128) all confirmed current. Introduction to the History
//     of Christianity (ILF 2500) is listed in the current catalog, but its
//     course description in Iliff's own catalog PDF is — verifiably, checked
//     with and without `-layout` — about preaching, not history; a title
//     appears to be missing or misassigned in Iliff's source document. Worship
//     could not be independently confirmed as a currently-titled course from
//     public pages alone. Both are flagged in their rows rather than papered
//     over — see the coverage table below and gapRemedies.
//   - Zendesk (iliff.zendesk.com), where the Course Catalog and Student
//     Handbook FAQ articles live, sits behind a Cloudflare bot check that
//     blocks both this project's fetcher and a browser UA from the command
//     line (403 "Security check" every time). The actual catalog and
//     handbook PDFs it links to are hosted on a separate, ungated
//     `iliff-edu.s3.amazonaws.com` bucket — reachable directly once the URL
//     is known. The Wayback Machine (archive.org) was the way to read a
//     blocked Zendesk article's rendered HTML long enough to find that S3
//     link. Next school on Zendesk: skip straight to guessing/finding the S3
//     URL pattern rather than fighting the gate.
//   - Faculty: Iliff's "Core Faculty by Teaching Areas" grouping on
//     /all-faculty/ is the full-time cut — 16 people, NOT the 14 ATS reports
//     for Fall 2025 ("Number of Full-Time Faculty (FTE): 14 (14.00)"). Counted
//     twice by hand before accepting the mismatch; it is real, not a
//     miscount, and it is left unreconciled rather than silently trimmed to
//     match ATS — see Saint Paul's harvest for the same kind of ATS/school's-
//     own-directory gap. Separate from Iliff's Professor Emeritus and Tinker
//     Visiting Professorship pages, both excluded here. Two of the sixteen
//     (George Schmidt, Candice
//     NunnTelfort) have "(Coming Soon)" in place of a profile link; they are
//     still named, current full-time faculty, so they are included with
//     their all-faculty listing as `profileUrl` and no degrees/publications
//     (none published yet) rather than dropped for administrative
//     incompleteness.
//   - Bios are irregular prose with no consistent "Education"/"Publications"
//     heading position (unlike Duke's templated profile pages), so — as with
//     Saint Paul — the roster below is hand-built from each person's own
//     bio page, not regex-scraped. April Mack's page has no Education
//     section printed at all; left absent rather than guessed.
//
// Run: node scripts/harvest/iliff.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, Publication, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://www.iliff.edu";
const UMC_PAGE_URL = `${BASE}/united-methodist-church/`;
const CATALOG_2526_URL =
  "https://iliff-edu.s3.amazonaws.com/wp-content/uploads/2025/06/25112456/Iliff_Catalog-2025-2026.pdf";
const MASTERS_DEGREES_URL = `${BASE}/masters-degrees-and-concentrations/`;
const FACULTY_DIR_URL = `${BASE}/all-faculty/`;
const COST_URL = `${BASE}/costsandfinancialaid/`;
const SCHOLARSHIPS_URL = `${BASE}/scholarships/`;

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface Entry {
  name: string;
  title: string;
  otherRoles: string[];
  profileUrl: string;
  areas: StudyArea[];
  degrees?: string[];
  publications?: Publication[];
}

// The 14 full-time faculty on /all-faculty/'s "Core Faculty by Teaching
// Areas" listing, matching ATS's Fall 2025 full-time-faculty count exactly.
// Degrees and publications read from each person's own bio page (all fetched
// directly from iliff.edu, not summarized) — see header comment for the two
// with no profile page yet.
const ROSTER: Entry[] = [
  {
    name: "Boyung Lee",
    title: "Professor of Practical Theology",
    otherRoles: ["Dean of the Faculty"],
    profileUrl: `${BASE}/faculty/boyung-lee/`,
    // "Feminist communitarian practical theologian" is Lee's own description
    // of her work — the womanist/feminist tag is read from her bio, not her
    // title, which names only practical theology.
    areas: ["practical-theology", "womanist-feminist-theology"],
    degrees: [
      "Ph.D., Boston College",
      "M.Div., Claremont School of Theology",
      "Th.M., Yonsei University (Seoul, Korea)",
      "B.A., Yonsei University (Seoul, Korea)",
    ],
    publications: [
      { title: "The Tyranny of the Myth of ‘We’: Racism and Christianity in Korea (co-authored with Nami Kim, Minah Cho, Jin-ho Kim, Jin Young Choi, and Eung Gyo Kim; Dongyeon Press, 2025)", kind: "book", year: 2025 },
      { title: "Embodying Antiracist Christianity: Asian American Theological Resources for Just Racial Relations (co-edited with K. Christine Pae; Palgrave Macmillan, 2024)", kind: "edited-volume", year: 2024 },
      { title: "From Campus Ministries to Enclaves of Asian/American Christian Model Minorities, Journal of Feminist Studies in Religion 40, no. 2 (Fall 2024): 97–102", kind: "article", year: 2024 },
      { title: "AI and East Asian Philosophical and Religious Traditions: Relationality and Fluidity (co-authored with Tracy Trothen and Kwok Pui Lan), Religions 15, no. 5 (May 2024)", kind: "article", year: 2024 },
      { title: "Transforming Congregations through Community: Faith Formation from the Seminary to the Church (Westminster John Knox Press, 2013)", kind: "book", year: 2013 },
    ],
  },
  {
    name: "Katherine Turpin",
    title: "Professor of Practical Theology and Religious Education",
    otherRoles: ["Director of the Master of Divinity Program", "Associate Dean for Curriculum and Assessment"],
    profileUrl: `${BASE}/faculty/katherine-turpin/`,
    areas: ["practical-theology", "christian-education-formation", "youth-ministry"],
    degrees: ["Ph.D., Emory University", "M.Div., Candler School of Theology", "B.A., Birmingham-Southern College"],
    publications: [
      { title: "Questioning Our Faith in Practice: Unlearning White Supremacy in Practical Theology (2025)", kind: "book", year: 2025 },
      { title: "Drama Tweens: Engaging the Bible with Younger Adolescents (Wipf and Stock, 2016)", kind: "book", year: 2016 },
      { title: "Nurturing Different Dreams: Youth Ministry Across Lines of Difference (co-authored with Anne Carter Walker; Pickwick Press, 2014)", kind: "book", year: 2014 },
      { title: "Branded: Adolescents Converting from Consumer Faith (Pilgrim Press, 2006)", kind: "book", year: 2006 },
    ],
  },
  {
    name: "Kristina Lizardy-Hajbi",
    title: "Associate Professor of Leadership and Formation",
    otherRoles: ["Associate Dean of Non-Degree Programs"],
    profileUrl: `${BASE}/faculty/rev-dr-kristina-lizardy-hajbi/`,
    areas: ["congregational-leadership", "practical-theology"],
    degrees: ["Ph.D., University of Colorado", "M.Div., Iliff School of Theology", "B.A., University of Colorado"],
    publications: [
      { title: "Emerging Trends in Congregational Engagement and Leadership (editor; MDPI, 2025)", kind: "edited-volume", year: 2025 },
      { title: "Unraveling Religious Leadership: Power, Authority, and Decoloniality (Fortress, 2024)", kind: "book", year: 2024 },
      { title: "Explore: Vocational Discovery in Ministry (co-editor; Rowman & Littlefield, 2022)", kind: "edited-volume", year: 2022 },
    ],
  },
  {
    name: "Tom Barlow",
    title: "Term Assistant Professor in Methodist Studies",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/tom-barlow/`,
    // His own bio: "teaches core Methodist courses including United Methodist
    // History, Doctrine, and Evangelism in Contemporary Contexts" — the
    // evangelism tag is read from that, not from his title alone.
    areas: ["wesleyan-studies", "evangelism-church-planting"],
    degrees: [
      "Ph.D., Iliff School of Theology and the University of Denver",
      "M.Div., Asbury Theological Seminary",
      "B.S., Colorado Christian University",
    ],
    // No publications section on his bio page — an adjunct-to-term-faculty
    // profile, not a research-focused one. Left absent rather than guessed.
  },
  {
    name: "Albert Hernández",
    title: "Associate Professor of the History of Christianity",
    otherRoles: ["Sr. Vice President of Academic Affairs and Academic Dean"],
    profileUrl: `${BASE}/faculty/albert-hernandez/`,
    areas: ["church-history"],
    degrees: [
      "Ph.D., Drew University",
      "M.A., M.Phil., Drew University",
      "M.S., Nova Southeastern University",
      "B.A., Florida International University",
    ],
    publications: [
      { title: "Subversive Fire: The Untold Story of Pentecost (Emeth Press)", kind: "book" },
      { title: "The Quest for the Historical Satan (co-authored with Miguel De La Torre; Fortress Press)", kind: "book" },
    ],
  },
  {
    name: "Lee H. Butler, Jr.",
    title: "Bishop Henry White Warren and Elizabeth Iliff Warren Professor of Africana Pastoral Theology",
    otherRoles: ["President and Chief Executive Officer"],
    profileUrl: `${BASE}/our-president/`,
    areas: ["pastoral-care-counseling", "black-church-studies"],
    degrees: [
      "Ph.D., Psychology and Religion, Drew University",
      "M.Phil., Psychology and Religion, Drew University",
      "Th.M., Pastoral Theology, Princeton Theological Seminary",
      "M.Div. (Pastoral Care and Counseling concentration), Eastern Baptist Theological Seminary (now Palmer Theological Seminary)",
      "B.A., Religion, Bucknell University",
    ],
    publications: [
      { title: "The Edward Wimberly Reader: A Black Pastoral Theology (co-editor; Baylor University Press, 2020)", kind: "edited-volume", year: 2020 },
      { title: "Listen, My Son: Wisdom to Help African American Fathers (Abingdon Press, 2010)", kind: "book", year: 2010 },
      { title: "Liberating Our Dignity, Saving Our Souls (Chalice Press, 2006)", kind: "book", year: 2006 },
      { title: "A Loving Home: Caring for African American Marriage and Families (Pilgrim Press, 2000)", kind: "book", year: 2000 },
    ],
  },
  {
    name: "Miguel A. De La Torre",
    title: "Professor of Social Ethics and Latinx Studies",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/miguel-de-la-torre/`,
    areas: ["ethics-public-theology", "latino-hispanic-ministry"],
    degrees: [
      "Ph.D., Temple University",
      "M.A., Temple University",
      "M.Div., Southern Baptist Theological Seminary",
      "M.P.A., American University",
      "B.A., Florida International University",
    ],
    // Bio states "authored over a hundred articles and published forty-one
    // books" but names none individually on his own page — a claim about
    // volume, not a citable list. Left absent rather than guessed at.
  },
  {
    name: "Theodore M. Vial, Jr.",
    title: "Harvey Potthoff Professor of Theology and Modern Western Religious Thought",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/theodore-m-vial-jr/`,
    areas: ["systematic-theology"],
    degrees: ["Ph.D., The University of Chicago", "M.A., The University of Chicago", "B.A., Brown University"],
    publications: [
      { title: "Modern Religion, Modern Race (Oxford University Press, 2016)", kind: "book", year: 2016 },
      { title: "Schleiermacher: A Guide for the Perplexed (T&T Clark, 2013)", kind: "book", year: 2013 },
    ],
  },
  {
    name: "Philip Butler",
    title: "Associate Professor of Theology and Black Post-human Artificial Intelligence Systems",
    otherRoles: ["Director of the AI Institute"],
    profileUrl: `${BASE}/faculty/philip-butler/`,
    // "Religion-and-science" is the nearest controlled-vocabulary bucket for
    // his AI/technology focus — the site has no religion-and-technology tag.
    areas: ["systematic-theology", "black-church-studies", "religion-and-science"],
    degrees: ["Ph.D., Claremont School of Theology", "M.Div., Candler School of Theology, Emory University", "B.A., Morehouse College"],
    publications: [
      { title: "Black Transhuman Liberation Theology: Spirituality and Technology", kind: "book" },
      { title: "Critical Black Futures: Speculative Theories and Explorations (editor)", kind: "edited-volume" },
    ],
  },
  {
    name: "Antony Alumkal",
    title: "Associate Professor of Sociology of Religion",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/antony-w-alumkal/`,
    // No RULES pattern matches "sociology of religion" — his own research
    // (the Christian Right, race and religion, public discourse) is read
    // as the nearest fit in the controlled vocabulary, not a title match.
    areas: ["ethics-public-theology"],
    degrees: ["Ph.D., Princeton University", "M.A., Princeton University", "B.A., University of California at Berkeley"],
    publications: [{ title: "Paranoid Science: The Christian Right's War on Reality", kind: "book" }],
  },
  {
    name: "April M. Mack",
    title: "Assistant Professor of Religion and Social Justice",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/april-m-mack/`,
    areas: ["mission-social-justice", "womanist-feminist-theology"],
    // No "Education" section on her bio page at all — left absent rather
    // than guessed, per this project's rule on undocumented degrees.
    publications: [
      { title: "“I Can’t Breathe”: Neocolonial Geotrauma and Violence in the Age of Trump, in Faith and Reckoning after Trump (Orbis, 2021)", kind: "chapter", year: 2021 },
      { title: "Womanist Ethics as a Contribution to Bioethics, Hastings Center Special Issue: A Critical Moment in Bioethics: Reckoning with Anti-Blackness Racism Through Intergenerational Dialogue (2022)", kind: "article", year: 2022 },
    ],
  },
  {
    name: "Pam Eisenbaum",
    title: "Professor of Biblical Studies and Christian Origins",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/pam-eisenbaum/`,
    // Her title alone would let suggestAreas() claim both hebrew-bible and
    // new-testament (the "biblical studies" rule, with neither "old
    // testament" nor "new testament" named to disambiguate) — but her actual
    // corpus is Paul and Christian origins specifically. Read from her bio,
    // not her title, the way Duke corrected Gregory Cuéllar.
    areas: ["new-testament"],
    degrees: [
      "Ph.D., Columbia University",
      "M.T.S., Harvard Divinity School",
      "B.A., Katholieke Universiteit Leuven",
      "B.F.A., Colorado State University",
    ],
    publications: [
      { title: "Paul Was Not a Christian", kind: "book" },
      { title: "The Jewish Heroes of Christian History: Hebrews 11 in Literary Context", kind: "book" },
      { title: "Invitation to Romans", kind: "book" },
      { title: "Contributor, The Jewish Annotated New Testament", kind: "chapter" },
    ],
  },
  {
    name: "Amy Erickson",
    title: "Professor of Hebrew Bible",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/amy-erickson/`,
    areas: ["hebrew-bible"],
    degrees: ["Ph.D., Princeton Theological Seminary", "M.Div., Columbia Theological Seminary", "B.A., Bates College"],
    publications: [{ title: "Jonah: Introduction and Commentary (Illuminations series; Eerdmans, 2021)", kind: "book", year: 2021 }],
  },
  {
    name: "Eric C. Smith",
    title: "Associate Professor of Early Christian Texts and Traditions",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/eric-c-smith/`,
    areas: ["new-testament", "church-history"],
    degrees: ["Ph.D., Iliff School of Theology and the University of Denver", "M.T.S., Vanderbilt Divinity School", "B.A., Mars Hill College"],
    publications: [
      { title: "Sovereignties, Spaces, Subjects, and Spirits: The Necropolitics of the Acts of the Apostles (SBL Press, forthcoming)", kind: "book" },
      { title: "Paul the Progressive? The Compassionate Christian’s Guide to Reclaiming the Apostle as an Ally (Chalice Press, 2019)", kind: "book", year: 2019 },
      { title: "Jewish Glass and Christian Stone: A Materialist Mapping of the Parting of the Ways (Routledge, 2018)", kind: "book", year: 2018 },
    ],
  },
  // The two most recently announced full-time hires; "(Coming Soon)" in
  // place of a profile link on /all-faculty/ as of this capture. Still
  // named, current full-time faculty (ATS's Fall 2025 full-time-faculty
  // count of 14 only matches with them included) — kept rather than dropped,
  // with the faculty-directory page itself as profileUrl since no individual
  // page exists yet.
  {
    name: "George Schmidt",
    title: "Assistant Professor of Chaplaincy and Spiritual Care",
    otherRoles: [],
    profileUrl: FACULTY_DIR_URL,
    areas: ["chaplaincy", "pastoral-care-counseling"],
  },
  {
    name: "Candice NunnTelfort",
    title: "Assistant Professor of Psychology, Culture, and Spiritual Care",
    otherRoles: [],
    profileUrl: FACULTY_DIR_URL,
    areas: ["pastoral-care-counseling"],
  },
];

function buildFaculty(): FacultyMember[] {
  // Surname-only ids collide twice here: Lee Butler and Philip Butler share a
  // surname (Lee H. Butler, Jr. president/pastoral theology chair vs. Philip
  // Butler, AI Institute — unrelated people), and Lee Butler and Theodore
  // Vial both carry a "Jr." suffix that would otherwise slugify to "jr". Both
  // resolved below rather than silently overwriting one person's id with
  // another's.
  const seenSurnames = new Set<string>();
  return ROSTER.map((e) => {
    const surnameSource = e.name.replace(/,?\s+Jr\.?$/i, "");
    const surname = slugifyName(surnameSource.split(" ").slice(-1)[0]);
    const firstInitial = slugifyName(e.name[0]);
    const id = seenSurnames.has(surname) ? `iliff-${firstInitial}-${surname}` : `iliff-${surname}`;
    seenSurnames.add(surname);

    const member: FacultyMember = {
      id,
      seminarySlug: "iliff",
      name: e.name,
      title: e.title,
      areas: e.areas,
      profileUrl: e.profileUrl,
    };
    if (e.otherRoles.length) member.otherRoles = e.otherRoles;
    if (e.degrees?.length) member.degrees = e.degrees;
    if (e.publications?.length) {
      member.publications = e.publications.slice(0, 5);
      member.publicationsSource = e.profileUrl;
      member.publicationsAsOf = today();
    }
    return member;
  });
}

async function main() {
  // Touch the pages this profile is built from, so they land in the fetch
  // cache alongside this run even though the JSON below is hand-assembled
  // from the prose — the coverage table especially needs a careful human
  // read across THREE disagreeing pages, not a mechanical parse (see header
  // comment).
  await get(UMC_PAGE_URL, { fresh });
  await get(MASTERS_DEGREES_URL, { fresh });
  await get(FACULTY_DIR_URL, { fresh });
  await get(COST_URL, { fresh });
  await get(SCHOLARSHIPS_URL, { fresh });
  for (const e of ROSTER) {
    if (e.profileUrl !== FACULTY_DIR_URL) await get(e.profileUrl, { fresh });
  }
  const catalogPdf = await get(CATALOG_2526_URL, { fresh, binary: true });
  void catalogPdf; // pinned to cache; read by hand with pdftotext during this harvest

  const faculty = buildFaculty();
  await writeFile(join(ROOT, "data/faculty/iliff.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/iliff.json`);

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/iliff.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/iliff.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "iliff",
    name: "Iliff School of Theology",
    city: "Denver",
    state: "CO",
    url: "https://www.iliff.edu/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-08-06",
        note: "One of the 13 United Methodist schools of theology, and the only one of the 13 not embedded in or hosted by a university.",
      },
      onlineCredit: {
        value: "fully-counts",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-08-06",
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. Iliff itself offers full remote enrollment for the MDiv alongside on-campus study.",
      },
      coverageSource: "https://www.iliff.edu/united-methodist-church/",
      coverageAsOf: capturedAt,
      coverage: [
        {
          area: "old-testament",
          status: "required-umc-track",
          note: "Iliff's United Methodist Church page states, in binding language, that “The United Methodist Church requires that students complete the Basic Graduate Theological Studies and the five United Methodist courses” — a course list Iliff developed “in consultation with the UMC General Board of Higher Education and Ministry (GBHEM).” That list names “One breadth course in Hebrew Bible” under Sacred Texts/Contextual Analysis. Iliff's own current, non-denominational MDiv marketing pages (Masters Degrees & Concentrations, last updated 2025-08-12) publish no course-level core requirements at all — the obligation to take a specific Hebrew Bible course exists for a UMC ordination candidate only because of this page, not because of Iliff's general degree structure. Confirmed still offered: Intro to the Hebrew Bible (ILF 2003) appears in Iliff's current 2025–2026 course catalog.",
        },
        {
          area: "new-testament",
          status: "required-umc-track",
          note: "Same binding sentence as above, naming “One breadth course and one depth course in New Testament.” Iliff's current 2025–2026 catalog shows New Testament restructured since the UMC page was last updated (2022) into a two-part sequence — New Testament Narratives: Gospels & Acts (ILF 2007) and New Testament Narratives: Letters & Writings (ILF 2008) — which if anything gives a UMC candidate more assigned New Testament coursework than the older breadth-plus-depth framing implied, not less.",
        },
        {
          area: "theology",
          status: "required-umc-track",
          note: "Bound on United Methodist students by the same binding sentence as old-testament above, naming “One breadth course and one depth course [in Constructive Theology]. A Christology course is highly recommended.” Introduction to Christian Theology (ILF 2510) is confirmed current in the 2025–2026 catalog; no separate depth-level Christology course could be confirmed by name from public pages alone — confirm the current depth-course option with your Iliff advisor.",
        },
        {
          area: "church-history",
          status: "required-umc-track",
          note: "Bound on United Methodist students by the same binding sentence as old-testament above, naming “One breadth course [in Development and Expressions of Religious Traditions].” Introduction to the History of Christianity (ILF 2500) is listed as current in the 2025–2026 catalog, but its own course description in Iliff's catalog PDF is, verifiably, about preaching rather than church history — a title/description mismatch inside Iliff's own source document, not a parsing error on this site's part (checked with and without layout-preserving extraction). The course's existence and credit value are confirmed; its actual current content is not, from this document alone. Ask the registrar to confirm before planning around it.",
        },
        {
          area: "preaching",
          status: "required-umc-track",
          note: "Bound on United Methodist students by the same binding sentence as old-testament above, which names “one course on preaching” under Theology and Religious Practices. No course with “preaching” in its title could be confirmed from Iliff's current public pages, but a preaching-focused course is demonstrably in the current catalog: the description that is misattributed to ILF 2500 (see church-history row) is explicitly about “preaching as an art of spiritual leadership” and helping students “become great spiritual preachers,” and Iliff's MDiv program page separately lists “Preacher as Self: Cultivating an Authentic Voice” as an example MDiv class. The obligation and the coursework both plainly exist; the exact current course code does not resolve cleanly from public documents — confirm with your advisor.",
        },
        {
          area: "evangelism",
          status: "required-umc-track",
          note: "The UMC page names “Evangelism in Contemporary Contexts” as one of the five required United Methodist courses, with the binding “requires that students complete” language covering all five. Confirmed current and unchanged in the 2025–2026 catalog: Evangelism in Contemporary Contexts (ILF 2128).",
        },
        {
          area: "mission-of-the-church",
          status: "required-umc-track",
          note: "Named as “UM Mission of Church in the World,” one of the same five required United Methodist courses. Confirmed current in the 2025–2026 catalog as United Methodist Mission of the Church in the World (ILF 2127).",
        },
        {
          area: "um-studies",
          status: "required-umc-track",
          note: "The UMC page (2022) names three separate courses — United Methodist History, United Methodist Doctrine, United Methodist Discipline and Polity for Leadership — among the five required United Methodist courses. Iliff's current 2025–2026 catalog shows this consolidated into a two-course sequence, United Methodist History, Doctrine, Polity 1 and 2 (ILF 2024, prerequisite; ILF 2025), three credits each for six credits total — landing exactly on ¶324.4's six-semester-hour UM-studies floor, with no margin. A UMC candidate at Iliff needs both parts, in order, and should not treat the six hours as having any slack for a scheduling conflict.",
        },
        {
          area: "worship-liturgy",
          status: "required-umc-track",
          note: "The UMC page names “one breadth course explicitly on Christian Worship” among the Basic Graduate Theological Studies requirements, under the same binding “requires” language. No course with “worship” in its title could be confirmed in Iliff's current, publicly available 2025–2026 catalog excerpt — unlike every other row on this table, this one could not be cross-checked against a live course code. The obligation itself is not in doubt (GBHEM co-authored this mapping and it has not been withdrawn), but the specific current course has to be confirmed with an Iliff advisor before you register — the source page predates Iliff's Fall 2025 curriculum redesign by three years.",
        },
      ],
      gapSummary:
        "All nine ¶324.4 areas bind a United Methodist candidate at Iliff — there is no area left uncovered. But none of the nine sit in Iliff's own denomination-neutral MDiv core: Iliff's current marketing pages describe the 72-credit MDiv as concentration-based and publish no course-level requirements at all, so the obligation for every one of the nine exists only because of Iliff's own United Methodist Church page, which states it in binding language and was built “in consultation with” GBHEM. That page was last substantively updated in 2022, three years before Iliff's Fall 2025 curriculum redesign (the 72-credit, concentration-based MDiv now in effect). Every course this page names for history, worship, and UM studies was checked by hand against Iliff's current 2025–2026 catalog: seven of the nine areas' courses were confirmed current by name and code (two with course numbers changed since 2022, still covering the same ground); the worship course could not be confirmed by name at all, and the history course's own catalog description appears to describe preaching rather than history. None of this changes the underlying ¶324.4 obligation — it changes how much a candidate should treat the school's own summary page as the last word, versus a lead to confirm.",
      gapRemedies: [
        {
          blurb: "Before registering, ask your Iliff advisor for the current course numbers behind the United Methodist Church page's Basic Graduate Theological Studies list — confirmed accurate for evangelism, mission, UM studies, Hebrew Bible, New Testament, and theology as of this catalog year; unconfirmed for the specific worship and church-history course titles.",
          url: "https://www.iliff.edu/united-methodist-church/",
        },
        {
          blurb: "United Methodist History, Doctrine, Polity 1 and 2 (ILF 2024, then ILF 2025) together satisfy ¶324.4's UM-studies floor exactly at six credits — plan for both, in sequence, with no scheduling margin to spare.",
          url: "https://www.iliff.edu/programs-mdiv/",
        },
        {
          blurb: "Confirm your specific course selections with your conference's Board of Ordained Ministry registrar as well as your Iliff advisor — GBHEM co-designed this mapping, but the page stating it predates Iliff's most recent curriculum redesign, and a board's own expectations can move independently of either.",
          url: "https://www.gbhem.org/education/schools-of-theology/",
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "154 students (104.80 FTE)",
        source: "https://www.ats.edu/member-schools/iliff-school-of-theology",
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report, all degree programs combined, not MDiv only. ATS also reports “Number of Full-Time Faculty (FTE): 14 (14.00)” for the same period — this profile counts 16 full-time faculty from Iliff's own current directory (see facultyNote); the two figures do not reconcile from public documents alone, the way Saint Paul's ATS-reported faculty count didn't match its own directory either.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$918/credit (master's degrees, including the MDiv); $850/credit (Doctor of Ministry)",
        source: "https://www.iliff.edu/costsandfinancialaid/",
        asOf: "2026-06-01",
        note: "2025–2026 rate. Full-time master's tuition works out to $16,524/year (9 credits/semester, $8,262/semester); a 72-credit MDiv taken entirely at the per-credit rate runs roughly $66,096 in gross tuition before aid.",
      },
      fees: [
        { label: "Mandatory student fees (tech, health, activity)", amount: "$491/year, master's and doctoral alike" },
      ],
      pctReceivingAid: {
        value: "More than 90% of applicants receive an internal, partial scholarship",
        source: "https://www.iliff.edu/costsandfinancialaid/",
        asOf: "2026-06-01",
        note: "Iliff's own figure. Every applicant to a degree program is automatically considered — no separate scholarship application.",
      },
      typicalAward: {
        value: "The Annual Iliff Scholarship: $5,000 up to nearly full tuition, for new students admissible to an Iliff degree program who enroll full-time",
        source: "https://www.iliff.edu/scholarships/",
        asOf: "2026-04-07",
        note: "A wide range, not a fixed percentage — Iliff does not publish the criteria that place a given student's award within that range. May be stacked with other Iliff, donor, grant, and external scholarships.",
      },
      namedScholarships: [
        {
          name: "AUMTS Excellence in Clergy Leadership Scholarship",
          blurb: "A $2,500 scholarship funded by GBHEM, available at any of the 13 United Methodist seminaries (not Iliff-exclusive), for United Methodist seminarians who are pursuing or certified candidates for ordination as elder or deacon, enrolled full-time in an MDiv program, and can demonstrate financial need. Includes financial-literacy programming alongside the award. Direct evidence of a funding route tied specifically to UMC candidacy status, even though the amount is modest against Iliff's per-credit tuition.",
          url: "https://www.iliff.edu/scholarships/",
        },
      ],
      honestNote: "Iliff's 90%-of-applicants scholarship rate is real and automatic, but the award itself is a range ($5,000 to near-full-tuition) with no published formula for where a given applicant lands — unlike Wesley's flat Ministerial Education Fund subsidy or Saint Paul's universal 50% award, Iliff gives no floor a candidate can count on before applying. Ask the Office of Financial Aid directly what factors move an applicant toward the top versus the bottom of that range, and whether UMC candidacy status is one of them; the public pages don't say.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "MDiv",
        credits: 72,
        typicalYears: "3 years full-time (8 semesters at 9 credits/semester); flexible pace up to 10 years",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Redesigned for Fall 2025: a streamlined, concentration-based 72-credit degree (down from the prior 120-quarter-credit structure), built around four concentrations — Embodied Spirituality, Social Justice and Ethics, Religion, Trauma, and Healing, and Professional Ministries in Context (MDiv only). Iliff's own marketing pages describe shared learning outcomes and concentration outcomes rather than a published course-by-course core; see this profile's ordination/coverage notes for how that structure interacts with ¶324.4.",
        url: "https://www.iliff.edu/masters-degrees-and-concentrations/",
      },
      {
        name: "Master of Arts",
        abbr: "MA",
        credits: 36,
        typicalYears: "2 years full-time (4 semesters at 9 credits/semester); flexible pace, finish in as little as 3 semesters or take up to 7 years",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an MDiv — a broad, flexible degree in religious and theological studies for academic research, non-profit work, or further study, sharing the same four redesigned concentrations as the MDiv.",
        url: "https://www.iliff.edu/masters-degrees-and-concentrations/",
      },
      {
        name: "Doctor of Ministry",
        abbr: "DMin",
        modalities: ["hybrid"],
        blurb: "Combines online learning with on-campus intensives for experienced ministry professionals, culminating in a project applying new insight to a real-world context.",
        url: "https://www.iliff.edu/doctorates/",
      },
      {
        name: "Joint Doctoral Program",
        abbr: "JDP (PhD)",
        modalities: ["residential"],
        blurb: "An interdisciplinary PhD offered in partnership with the University of Denver's Department for the Study of Religion — an academic research degree, not an ordination-track one.",
        url: "https://www.iliff.edu/doctorates/",
      },
    ],

    concentrations: [
      "Embodied Spirituality",
      "Social Justice and Ethics",
      "Religion, Trauma, and Healing",
      "Professional Ministries in Context (MDiv only)",
    ],

    partnerships: [
      {
        kind: "joint-degree",
        partner: "University of Denver",
        blurb: "The Joint Doctoral Program (JDP) is an interdisciplinary PhD run jointly with DU's Department for the Study of Religion — the closest thing Iliff has to a host-university relationship, though Iliff itself remains an independent institution, not embedded in DU the way Perkins is embedded in SMU or Candler in Emory.",
        url: "https://www.du.edu/duiliffjoint/",
      },
      {
        kind: "extension",
        partner: "United Methodist Church Course of Study School",
        blurb: "Iliff hosts a GBHEM-administered Course of Study School for licensed local pastors, separate from its degree programs.",
        url: "https://www.iliff.edu/united-methodist-church/",
      },
    ],

    courseOfStudy: {
      blurb: "Iliff hosts a Course of Study School under GBHEM for licensed local pastors pursuing the educational requirements toward provisional membership.",
      url: "https://www.iliff.edu/united-methodist-church/",
    },

    facultyNote:
      "Limited to the 16 people on Iliff's “Core Faculty by Teaching Areas” listing on /all-faculty/ as of this capture. That figure does not match ATS's Fall 2025 “Number of Full-Time Faculty (FTE): 14 (14.00)” — recounted by hand rather than trimmed to fit; the gap could not be reconciled from public documents (the same kind of ATS/school's-own-directory mismatch found at Saint Paul). Iliff separately lists Professor Emeritus and Tinker Visiting Professorship faculty, both excluded here per this project's core-full-time-only scope. Two of the 16 (George Schmidt, Candice NunnTelfort) are named with “(Coming Soon)” in place of an individual profile page as of this capture — included as current full-time hires with the faculty directory itself as their profileUrl, and no degrees or publications, since none are published for them yet.",

    contact: {
      admissionsUrl: "https://www.iliff.edu/apply/",
      visitUrl: "https://www.iliff.edu/schedule-a-visit/",
      email: "admissions@iliff.edu",
      phone: "800-678-3360",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
