// Saint Paul School of Theology — one of the 13 UMC schools of theology,
// and the only one of the 13 GBHEM lists as operating two campuses:
// "Saint Paul School of Theology (Kansas and Oklahoma)".
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//   - spst.edu is WordPress, but its wp-json REST API exposes only generic
//     pages/posts — no custom "faculty" or "courses" post type worth querying.
//     Faculty directory and bio pages are plain server-rendered HTML; no JS
//     wall, no Playwright needed.
//   - The MDiv curriculum lives in the Student Handbook & Catalog PDF
//     (poppler + -layout renders its grid table cleanly), not on any HTML
//     page — the MDiv landing page at spst.edu describes the degree in
//     marketing prose only and names no course codes.
//   - THE TWO-CAMPUS FINDING (see buildProfile's ordination/degrees comments
//     for the sourced detail): the MDiv curricular-requirements table, the
//     79-credit total, and the flat $685/credit-hour tuition rate are single,
//     institution-wide figures in the catalog — Kansas Campus, Oklahoma
//     Campus, and distance education are three *delivery* channels for one
//     degree plan, not three plans. Nothing in the catalog states a
//     campus-specific course list, credit total, or tuition rate. Faculty
//     assignment, by contrast, DOES differ sharply: 8 of 10 core full-time
//     faculty carry a Kansas-campus (913) direct line and only 2 carry an
//     Oklahoma-campus (405) line (Randolph, explicitly "Academic Director of
//     the Oklahoma Campus," and Robinson) — see MANUAL_CAMPUS below. The type
//     model has no `campus` field on FacultyMember or DegreeProgram, so that
//     split is carried in each person's `otherRoles` (a sourced fact about
//     their own office, not an invented field) and summarized in
//     `facultyNote`, rather than invented as a new field. Report flags this
//     as the concrete type-model gap for a future harvest of a school where
//     the *curriculum itself*, not just faculty distribution, differs by site.
//   - THE COVERAGE FINDING: Saint Paul's MDiv requires Evangelism (EVN 3**)
//     and Worship (WOR 301) of every student, regardless of denomination —
//     unlike Duke, Phillips, and Perkins, where at least one of those sat in
//     UMC-track or elective space. But Mission of the Church and UM Studies
//     (UM history/doctrine/polity) are NOT in the required core; they sit in
//     the MDiv's 13.5-credit unrestricted-elective pool, and the catalog's
//     own language is advisory, not binding: "United Methodist students may
//     be expected to take approved courses in UM History, Polity and
//     Doctrine, Evangelism, and Mission of the Church" — "may be expected,"
//     not Duke's "must fulfill" or Phillips' "required to take," and it
//     directs the student to their own judicatory rather than stating a
//     Saint Paul obligation. Scored `elective`, matching Perkins' pattern
//     ("may include," permissive) rather than Duke's or Phillips' binding
//     language. This is a real judgment call — see the coverage notes below
//     and the harvest report's "could not verify" section.
//
// Run: node scripts/harvest/saint-paul.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { htmlToText, pdfToText, links } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://www.spst.edu";
const FACULTY_DIR_URL = `${BASE}/saint-paul-faculty/`;
// The current, publicly linked catalog (from the Student Handbook & Catalog
// page); dated on-disk 2025-08-07 per its filename. This is the source for
// the MDiv curricular-requirements table used below.
const CATALOG_PDF_URL =
  "https://www.spst.edu/wp-content/uploads/2025/08/2025-2026_Student-HANDBOOK-and-CATALOG080725.pdf";
const FINAID_URL = `${BASE}/financial-aid/`;

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Core full-time faculty only (README precedent: Duke's "Regular Rank,"
// Phillips' "core full-time" — adjuncts and emeriti excluded, see
// facultyNote). Read from the live faculty directory page
// (https://www.spst.edu/saint-paul-faculty/), which is more current than the
// 2025-2026 print catalog (e.g. it lists Hartley, Liantonio, and Stauffer,
// none of whom appear in the catalog's faculty-list pages, and it shows
// Sigmon promoted to Associate Professor).
//
// otherRoles carries the office location as a *sourced fact about that
// person's own bio page* (direct phone line / office address), not a
// declared school-wide "campus roster" — the type model has no `campus`
// field, so this is the faithful way to carry it without inventing one.
interface Entry {
  name: string;
  title: string;
  otherRoles: string[];
  profileUrl: string;
  areas: StudyArea[];
  degrees?: string[];
  publications?: { title: string; kind: "book" | "edited-volume" | "article" | "chapter"; year?: number }[];
}

const ROSTER: Entry[] = [
  {
    name: "Sharon Betsworth",
    title: "Professor of Biblical Studies",
    otherRoles: ["Office: Kansas Campus (Leawood, KS), direct line 913-253-5018"],
    profileUrl: `${BASE}/dr-sharon-betsworth/`,
    // Title reads generically ("Biblical Studies"), but her Th.M. (NT,
    // Princeton), doctoral field, and publication list (childist readings of
    // Mark, Exodus, Revelation; contributions to Warren Carter's Mark Wisdom
    // Commentary) are all New Testament — read from her own bio rather than
    // letting suggestAreas() claim Hebrew Bible on the generic title alone.
    areas: ["new-testament"],
    degrees: [
      "Ph.D. in Biblical Studies (New Testament), Graduate Theological Union",
      "Th.M. (New Testament), Princeton Theological Seminary",
      "M.Div., summa cum laude, Wesley Theological Seminary",
      "B.A. (German, History), Luther College",
    ],
    publications: [
      { title: "Sharon Betsworth and Julie Faith Parker, \"'Where Have All the Young Girls Gone?' Discovering the Girls of the Bible through Childist Analysis of Exodus 2 and Mark 5–7,\" Journal of Feminist Studies in Religion 38, no. 2 (Fall 2022)", kind: "article", year: 2022 },
      { title: "\"The Child Snatched Away: Reading Revelation Through a Childist Lens,\" Biblical Interpretation 28 (2020)", kind: "article", year: 2020 },
      { title: "\"Narrative Criticism and Childist Interpretation,\" in Children and Methods: Listening To and Learning From Children in the Biblical World (2020)", kind: "chapter", year: 2020 },
      { title: "Sharon Betsworth and Julie Faith Parker, eds., T&T Clark Handbook of Children in the Bible and Biblical World (2019)", kind: "edited-volume", year: 2019 },
    ],
  },
  {
    name: "Benjamin L. Hartley",
    title: "Professor of Methodist Studies and Mission",
    otherRoles: ["Office: Kansas Campus (Leawood, KS), direct line 913-253-5011"],
    areas: ["wesleyan-studies", "world-christianity"],
    profileUrl: `${BASE}/ben-hartley/`,
    degrees: [
      "Th.D. (Mission Studies, minor Church History), Boston University",
      "M.Div., cum laude (Church History, Urban Ministry concentrations), Boston University",
    ],
    publications: [
      { title: "John R. Mott and the Collaborative Crafting of a World Christian Movement (Cornell University Press, forthcoming 2028)", kind: "book", year: 2028 },
      { title: "\"John R. Mott at War and the Consequences for Internationalism\" in The Young Ecumenical Movement under Pressure (Campus Verlag, forthcoming 2026)", kind: "chapter", year: 2026 },
      { title: "\"Pragmatic Christian Internationalist: John R. Mott's Negotiation of Nationalisms and Racism, 1895-1925,\" in The Young Ecumenical Movement (Brill, 2025)", kind: "chapter", year: 2025 },
      { title: "\"John R. Mott Amidst the Students: Historical and Missiological Gleanings for Today,\" Missiology: An International Review 53(1) (2025)", kind: "article", year: 2025 },
      { title: "\"The Problem and Promise of the Diaconate,\" in Diaconal Studies: Lived Theology for the Church in North America (Regnum Books International, 2024)", kind: "chapter", year: 2024 },
    ],
  },
  {
    name: "Nancy R. Howell",
    title: "Professor of Theology and Philosophy of Religion",
    otherRoles: ["Oubri A. Poppele Professor of Health and Welfare Ministries", "Office: Kansas Campus (Leawood, KS), direct line 913-253-5012"],
    // Title alone reads as systematic theology; her publication record
    // (ecology, animal ethics, science-and-religion) is religion-and-science,
    // read from her bio rather than left off.
    areas: ["systematic-theology", "religion-and-science"],
    profileUrl: `${BASE}/nancy-howell/`,
    degrees: [
      "Ph.D., Claremont Graduate School",
      "M.A., Claremont Graduate School",
      "Th.M., Southeastern Baptist Theological Seminary",
      "M.Div., Southeastern Baptist Theological Seminary",
      "B.S., College of William and Mary",
    ],
    publications: [
      { title: "\"Engaging Indigenous Epistemology, Decolonizing the Western Worldview,\" Religious Studies Review (2023)", kind: "article", year: 2023 },
      { title: "\"Scientific Data, Ecological Conversion, and Transformative Affect,\" HTS Teologiese Studies/Theological Studies 77, no. 3 (2021)", kind: "article", year: 2021 },
      { title: "\"Lessons from the Breakroom,\" in Open and Relational Leadership: Leading with Love (2020)", kind: "chapter", year: 2020 },
      { title: "\"Have You Ever Wondered What It's Like to Be a Chimpanzee?\" in Putting Philosophy to Work: Toward an Ecological Civilization (2018)", kind: "chapter", year: 2018 },
      { title: "\"God and Nature,\" in Gender: God, Macmillan Interdisciplinary Handbooks (2017)", kind: "chapter", year: 2017 },
    ],
  },
  {
    name: "Israel Kamudzandu",
    title: "Lindsey P. Pherigo Associate Professor of New Testament Studies and Biblical Interpretation",
    otherRoles: ["Office: Kansas Campus (Leawood, KS), direct line 913-253-5016"],
    areas: ["new-testament", "world-christianity"],
    profileUrl: `${BASE}/israel-kamudzandu/`,
    degrees: [
      "Ph.D. in Biblical Interpretation (New Testament), Brite Divinity School",
      "M.A. (Theological Studies), United Theological Seminary",
      "M.Div., Africa University",
      "Diploma in Education, University of Zimbabwe",
    ],
    publications: [
      { title: "Translation(s) as Incarnation: A Global South Reading and Interpretation of the Bible and Hymns (Wipf & Stock, 2023)", kind: "book", year: 2023 },
      { title: "Multiethnicity and the Gospel: A Postcolonial Interpretation of Romans (Fortress Press, forthcoming)", kind: "book" },
      { title: "\"Hermeneutics – Biblical Interpretation, Ancient and Modern Methods,\" in Wesleyan Dictionary of Theology (2013)", kind: "chapter", year: 2013 },
      { title: "Abraham Our Father: Paul and Ancestors in Postcolonial Africa (Fortress Press, 2013)", kind: "book", year: 2013 },
      { title: "Abraham as a Spiritual Ancestor: A Postcolonial Zimbabwean Reading of Romans 4 (Brill, 2010)", kind: "book", year: 2010 },
    ],
  },
  {
    name: "Kristen E. Kvam",
    title: "Professor of Theology",
    otherRoles: ["Office: Kansas Campus (Leawood, KS), direct line 913-253-5020"],
    areas: ["systematic-theology", "womanist-feminist-theology"],
    profileUrl: `${BASE}/kristen-kvam/`,
    degrees: ["Ph.D., Emory University", "S.T.M., Yale University", "M.Div., Yale University", "B.A., St. Olaf College"],
    publications: [
      { title: "\"For Such a Time: A Declaration of Inter-Religious Commitment\" (ELCA policy statement), Dialog: A Journal of Theology 58, no. 3 (September 2019): 171–172", kind: "article", year: 2019 },
      { title: "\"Kris Kvam on the Psalms and Feminism,\" interview by Susan Sink, Bear!ngs Online (February 1, 2019)", kind: "article", year: 2019 },
      { title: "Guest editor with Kirsi Stjerna, Dialog: A Journal of Theology, theme issue \"Body, Gender, and Justice,\" 57, no. 3 (September 2018)", kind: "edited-volume", year: 2018 },
      { title: "\"Preface to the Psalter,\" in The Annotated Luther, Vol. 6: The Interpretation of Scripture (Augsburg Fortress Press, 2017): 202–212", kind: "chapter", year: 2017 },
      { title: "\"God's Heart Revealed in Eden: Luther on the Character of God and the Vocation of Humanity,\" in Transformative Lutheran Theologies (Fortress Press, 2010)", kind: "chapter", year: 2010 },
    ],
  },
  {
    name: "Richard Liantonio",
    title: "Assistant Professor of Hebrew Bible",
    otherRoles: [
      "Assistant Director of Library",
      "Title IX Coordinator / Equity Compliance Officer",
      "Office: Kansas Campus (Leawood, KS), direct line 913-253-5036",
    ],
    areas: ["hebrew-bible"],
    profileUrl: `${BASE}/richard-liantonio/`,
    // No degrees listed on his own spst.edu bio page. Two secondary sources
    // disagree on where his Ph.D. is from (one says University of Manchester;
    // the Manchester Wesley Research Centre's own page implies but does not
    // state Nazarene Theological Seminary). Left absent rather than guessed —
    // see harvest report, "could not verify."
    publications: [
      { title: "With Lifted Head and Shining Face: A Cognitive Linguistic Analysis of Metaphors for Happiness in the Psalms and Ancient Near Eastern Literature (under contract, Pickwick Publications)", kind: "book" },
      { title: "Review of The JPS Bible Commentary: Psalms 120–150, by Adele Berlin, Journal of Jewish Studies 75.2 (October 2025)", kind: "article", year: 2025 },
    ],
  },
  {
    name: "Jacob R. Randolph",
    title: "Assistant Professor of History of Christianity",
    otherRoles: ["Academic Director of the Oklahoma Campus", "Office: Oklahoma Campus (Oklahoma City, OK), direct line 405-778-3821"],
    areas: ["church-history"],
    profileUrl: `${BASE}/jacob-randolph/`,
    degrees: [
      "Ph.D. in History of Christianity (Reformation Studies), Baylor University",
      "M.A. in Church History, Gordon-Conwell Theological Seminary",
      "M.A. in New Testament, Gordon-Conwell Theological Seminary",
      "B.A. in Religion, Oklahoma Baptist University",
    ],
    publications: [
      { title: "\"Teaching the Faith and Fomenting Contempt in the Reformation,\" The Anxious Bench (September 20, 2024)", kind: "article", year: 2024 },
      { title: "\"Playing for God: The American Play Movement and Missionary Education in the Early Twentieth Century,\" Fides et Historia 55 (2024): 55–74", kind: "article", year: 2024 },
      { title: "\"A Method to the Madness? Chivalry, Propaganda, and Cultural Memory in the Anabaptist Kingdom of Münster,\" Church History and Religious Culture 103 (2023): 180–205", kind: "article", year: 2023 },
    ],
  },
  {
    name: "Elaine A. Robinson",
    title: "Professor of Methodist Studies and Christian Theology",
    otherRoles: ["Office: Oklahoma Campus (Bishop W. Angie Smith Chapel, Oklahoma City, OK), direct line 405-443-3196"],
    areas: ["wesleyan-studies", "systematic-theology"],
    profileUrl: `${BASE}/elaine-robinson/`,
    degrees: [
      "Ph.D., Emory University",
      "M.T.S., Perkins School of Theology, Southern Methodist University",
      "M.A., California State University, San Bernardino",
      "M.S., Air Force Institute of Technology",
      "B.A., University of Colorado, Boulder",
    ],
    publications: [
      { title: "Leading with Love: Spiritual Disciplines for Practical Leadership (Fortress, 2023)", kind: "book", year: 2023 },
      { title: "Introduction to Theology for Ministry (Foundery Books, 2017)", kind: "book", year: 2017 },
      { title: "Exploring Theology, Fortress Foundations for Learning Series (Fortress Press, 2014)", kind: "book", year: 2014 },
      { title: "Race and Theology (Abingdon Press)", kind: "book" },
      { title: "Godbearing: Evangelism Reconceived (Pilgrim Press, 2006)", kind: "book", year: 2006 },
    ],
  },
  {
    name: "Casey Sigmon",
    title: "Associate Professor of Preaching & Worship",
    otherRoles: ["Director of Pause/Play Center for Preachers", "Office: Kansas Campus (Leawood, KS), direct line 913-253-5017"],
    areas: ["preaching", "liturgy-worship"],
    profileUrl: `${BASE}/casey-sigmon/`,
    degrees: ["Ph.D. in Homiletics and Liturgics, Vanderbilt University", "M.Div., McCormick Theological Seminary", "B.A. in Theater and Film, University of Kansas"],
    publications: [
      { title: "Engaging the Gadfly: How to Move from Reactionary to Reflective Hybrid, Online, and In Person Preaching in the Digital Age (Wipf & Stock; Cascade Books, 2025)", kind: "book", year: 2025 },
      { title: "\"How to Start Designing Worship from a Process Perspective,\" in Preaching the Uncontrolling Love of God (SacraSage Press, 2024)", kind: "chapter", year: 2024 },
      { title: "\"The Courage to Preach in the Digital Age,\" Religions, special issue on preaching and digital technology (2023)", kind: "article", year: 2023 },
      { title: "\"Failure to Discern the Online/Hybrid Body: A Captivity of the Eucharist,\" Currents in Theology and Mission (2023)", kind: "article", year: 2023 },
      { title: "\"Blessed is the One Whose Bowels Can Move: An Essay in Praise of Lament,\" Religions, contemporary Christian worship issue (2022)", kind: "article", year: 2022 },
    ],
  },
  {
    name: "Aaron Stauffer",
    title: "Assistant Professor of Social Ethics and Community Leadership",
    otherRoles: ["Director of Academic Assessment and Institutional Effectiveness", "Office: Kansas Campus (Leawood, KS), direct line 913-253-5013"],
    areas: ["ethics-public-theology", "congregational-leadership"],
    profileUrl: `${BASE}/aaron-stauffer/`,
    degrees: [
      "Ph.D. in Social Ethics, Union Theological Seminary in the City of New York",
      "M.Div. in Interreligious and Ecumenical Studies, Union Theological Seminary in the City of New York",
    ],
    publications: [
      { title: "Listening to the Spirit: The Radical Social Gospel, Sacred Values, and Broad-based Community Organizing (Oxford University Press, 2024)", kind: "book", year: 2024 },
      { title: "\"Under-Connected: Building Relational Power, Solidarity, and Developing Leaders in Broad-Based Community Organizing,\" Religions 16, no. 5 (2025)", kind: "article", year: 2025 },
      { title: "\"Power in the Social Gospel: Howard Kester, Claude Williams and the Southern Tenant Farmers Union,\" Religions 15, no. 9 (2024)", kind: "article", year: 2024 },
    ],
  },
];

function buildFaculty(): FacultyMember[] {
  return ROSTER.map((e) => {
    // Cross-check against the title-based suggester as an audit, per
    // lib/areas.mts's own instruction ("use this to draft and to audit,
    // never to populate unattended") — logged, not auto-applied, since every
    // area above was set by hand from title + bio + publications.
    const suggested = suggestAreas(e.title);
    const missed = suggested.filter((a) => !e.areas.includes(a));
    if (missed.length) {
      console.log(`  [areas-audit] ${e.name}: title-suggester also flags ${missed.join(", ")} (title: "${e.title}")`);
    }

    const member: FacultyMember = {
      id: `saint-paul-${slugifyName(e.name.split(" ").slice(-1)[0])}`,
      seminarySlug: "saint-paul",
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
  // from the prose (the coverage table especially needs a careful human
  // read, not a mechanical parse — see README §2 on why a school's own
  // ¶324.4 mapping, or here its lack of one, is a lead and not the evidence).
  await get(FACULTY_DIR_URL, { fresh });
  for (const e of ROSTER) await get(e.profileUrl, { fresh });
  const catalogPdf = await get(CATALOG_PDF_URL, { fresh, binary: true });
  const catalogText = pdfToText(catalogPdf.path);
  await get(FINAID_URL, { fresh });

  // Sanity check: confirm the MDiv table this profile is built from still
  // reads 79 total credit hours and still names the same required-line
  // courses, so a silent catalog revision doesn't leave stale course codes
  // in the JSON below.
  if (!/79 credit hours/.test(catalogText)) {
    console.warn("WARNING: catalog no longer reads '79 credit hours' for the MDiv — re-check the coverage table by hand.");
  }
  if (!/Evangelism\s+3\s+EVN 3\*\*/.test(catalogText.replace(/\s+/g, " "))) {
    console.warn("WARNING: catalog's MDIV Curricular Requirements table no longer lists Evangelism (EVN 3**) as a required line — re-check.");
  }

  const faculty = buildFaculty();
  await writeFile(join(ROOT, "data/faculty/saint-paul.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/saint-paul.json`);

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/saint-paul.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/saint-paul.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "saint-paul",
    name: "Saint Paul School of Theology",
    city: "Leawood",
    state: "KS",
    url: "https://www.spst.edu/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: 'One of the 13 United Methodist schools of theology. GBHEM lists it as "Saint Paul School of Theology (Kansas and Oklahoma)" — the roster itself names both campuses as one approved school, not two.',
      },
      onlineCredit: {
        value: "fully-counts",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. Saint Paul's own catalog independently confirms its MDiv is offered in \"asynchronous online, synchronous online, hybrid, and on-campus\" formats, with courses of every format accepted toward the same 79-credit degree.",
      },
      coverageSource:
        "https://www.spst.edu/wp-content/uploads/2025/08/2025-2026_Student-HANDBOOK-and-CATALOG080725.pdf",
      coverageAsOf: "2025-08-07",
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "Introduction to the Hebrew Bible (HBS 301) and an Upper-Level Hebrew Bible course (HBS 4**) are both required lines in the MDiv Curricular Requirements table, for every student.",
        },
        {
          area: "new-testament",
          status: "required",
          note: "Introduction to the New Testament (NTS 301) and an Upper-Level New Testament course (NTS 4**) are both required lines in the MDiv Curricular Requirements table, for every student.",
        },
        {
          area: "theology",
          status: "required",
          note: "Introduction to Systematic Theology (THL 301) and an Upper-Level Theology course (THL 4**) are both required lines in the MDiv Curricular Requirements table, for every student.",
        },
        {
          area: "church-history",
          status: "required",
          note: "Traditions I and Traditions II (HST 301, HST 302) are both required lines in the MDiv Curricular Requirements table, for every student.",
        },
        {
          area: "mission-of-the-church",
          status: "elective",
          note: "No course on this subject is a required line in the MDiv Curricular Requirements table. \"Mission of the Church in the Contemporary World\" (CHS 330) and \"Mission of the Church in the World\" (CHS 355) are real courses, but they sit inside the degree's 13.5-hour unrestricted-elective pool (\"Electives (may include Denominational Studies)\"). The table's only mention of it for United Methodist students is a footnote — \"United Methodist students may be expected to take approved courses in ... Mission of the Church\" — advisory language (\"may be expected,\" directing the student to \"check with their appropriate judicatories for specific course requirements\"), not a Saint Paul-stated obligation the way Duke's or Phillips' bulletins state theirs. Scored elective rather than required-umc-track on that basis; see the harvest report for the judgment call.",
        },
        {
          area: "evangelism",
          status: "required",
          note: "Evangelism (EVN 3**) is a required line in the MDiv Curricular Requirements table for every student, regardless of denomination — notably, Saint Paul does not treat this as UMC-specific the way Duke and Phillips do.",
        },
        {
          area: "worship-liturgy",
          status: "required",
          note: "Worship (WOR 301) is a required line in the MDiv Curricular Requirements table for every student, regardless of denomination.",
        },
        {
          area: "preaching",
          status: "required",
          note: "Introduction to Preaching (PRE 401) is a required line in the MDiv Curricular Requirements table for every student.",
        },
        {
          area: "um-studies",
          status: "elective",
          note: "UM History and the Arc of Justice (DST 310), United Methodist Doctrine (DST 311), and United Methodist Polity (DST 330) are real, named courses — but they sit in the same 13.5-hour unrestricted-elective pool as Mission of the Church, not in the required core. The catalog's own language is the same advisory footnote as above: \"United Methodist students may be expected to take approved courses in UM History, Polity and Doctrine...\" — \"may be expected\" and \"should check with their appropriate judicatories,\" not a stated Saint Paul requirement. Compare Perkins, scored elective on nearly identical permissive language (\"may include United Methodist Studies\"), against Duke and Phillips, scored required-umc-track on binding language (\"must fulfill,\" \"required to take\"). If a UM student takes DST 311 (3 hrs) and DST 330 (2 hrs), that alone clears ¶324.4's 6-hour UM-studies floor; DST 320 (UM History, 2–3 hrs) is a third named course in the same pool.",
        },
      ],
      gapSummary:
        "Seven of the nine ¶324.4 areas are in Saint Paul's required MDiv core, including evangelism and worship — areas several other UMC schools leave to UM-specific tracks or electives. The two areas not in the core are mission of the church and United Methodist studies (history, doctrine, polity) itself, which the catalog names as real, specific courses (CHS 330/355 for mission; DST 310/311/330 for UM studies) but places entirely inside the degree's unrestricted-elective pool, with only an advisory footnote pointing United Methodist students toward them. Nothing forces a student to choose those specific electives, and the catalog explicitly punts the specific-course question to \"your appropriate judicatories\" rather than answering it itself. Plan the 13.5 elective hours with UM doctrine, UM polity, and mission of the church in mind from the start, and confirm the exact course choices with your conference's Board of Ordained Ministry registrar — Saint Paul's own wording is deliberately non-committal about which electives satisfy your board.",
      gapRemedies: [
        {
          blurb: "United Methodist Doctrine (DST 311, 3 hrs) and United Methodist Polity (DST 330, 2 hrs) alone clear ¶324.4's 6-semester-hour UM-studies floor; add UM History and the Arc of Justice (DST 310, 3 hrs) or Mission of the Church in the World (CHS 355, 2 hrs) from the same elective pool and you've covered both remaining areas without adding to the 79-credit total.",
          url: "https://www.spst.edu/registrar/",
        },
        {
          blurb: "Saint Paul's Master of Arts in Christian Ministry offers a dedicated UM Studies specialization (Evangelism, Worship, Mission of the Church, UM Doctrine, UM Polity, UM History — 16 credit hours) built explicitly to satisfy the Advanced Course of Study / deacon-track requirement. It is not the MDiv, but its course list is the clearest evidence of exactly which Saint Paul courses the school itself maps to the nine ¶324.4 areas.",
          url: "https://www.spst.edu/deacon-studies/",
        },
        {
          blurb: "Ask the Saint Paul Registrar for the current MDiv degree-progress tracking form, and ask your conference's Board of Ordained Ministry registrar which specific electives they will accept for mission of the church and UM studies. The catalog explicitly defers this decision to your judicatory rather than naming it itself — they make the call, not the catalogue and not us.",
          url: "https://www.spst.edu/registrar/",
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "97 students (63.40 FTE)",
        source: "https://www.ats.edu/member-schools/saint-paul-school-of-theology",
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report, all degree programs combined, not MDiv only. ATS reports \"Number of Full-Time Faculty (FTE): 5 (10.75)\" for the same period — an FTE figure higher than the headcount, the same kind of internal-arithmetic oddity Phillips' catalog showed with its UM-studies hours. It also does not match this profile's own count of 10 named full-time faculty from Saint Paul's current directory; ATS's Standard Data Form category boundaries (e.g., which titles count as \"full-time\") may differ from Saint Paul's own directory heading. Reported as ATS states it rather than reconciled by guess.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$685 per credit hour (MDiv, MATS, and MACM); $685 per credit hour (DMin)",
        source:
          "https://www.spst.edu/wp-content/uploads/2025/08/2025-2026_Student-HANDBOOK-and-CATALOG080725.pdf",
        asOf: "2025-08-07",
        note: "2025–2026 rate. This is a single, flat rate — the catalog states no separate rate for the Kansas Campus, the Oklahoma Campus, or online delivery. 79 credit hours × this rate is roughly $54,115 in gross MDiv tuition before aid.",
      },
      fees: [
        { label: "Application fee (master's level)", amount: "$50 one-time" },
        { label: "Application fee (DMin)", amount: "$60 one-time" },
        { label: "Transcript fee", amount: "$10 per transcript ($25 if expedited)" },
      ],
      typicalAward: {
        value: 'The "Each One, Reach One" scholarship: 50% off tuition, automatic for every admitted degree-seeking student, for the duration of the degree',
        source: "https://www.spst.edu/financial-aid/",
        asOf: "2026-08-06",
        note: "Saint Paul's own phrasing: \"Every admitted degree-seeking student who plans to enroll at Saint Paul will receive a scholarship of 50% off (tuition only) for the duration of their degree program.\" No separate published percentage of applicants who receive aid — this is a universal award, not a subset figure.",
      },
      namedScholarships: [
        {
          name: "Advance Course of Study Award",
          blurb: "A need-based award tied specifically to the Advanced Course of Study — the GBHEM-defined path by which a UMC licensed local pastor completes the graduate theological studies required for provisional membership and ordination as an elder. Saint Paul's own page: students' application to Saint Paul \"acts as the application for the scholarship,\" with no separate form. The clearest named, UMC-ordination-track-specific aid this school publishes.",
          url: "https://www.spst.edu/financial-aid/",
        },
        {
          name: "Fellows Program (Full Tuition Scholarship)",
          blurb: "A full-time tuition scholarship for master's students entering in the fall semester, covering three years of tuition plus books and educational fees. Saint Paul's own financial-aid page does not state a United Methodist-candidacy eligibility requirement for this award (a secondary aggregator site names it the \"Presidential Fellows Scholarship\" and claims a candidacy requirement; that claim could not be verified on spst.edu itself and is not repeated here — see harvest report).",
          url: "https://www.spst.edu/financial-aid/",
        },
      ],
      honestNote:
        "The 50% Each One, Reach One award is automatic and unconditional on admission, which is unusually generous as a baseline — but it is also the ceiling for most students; Saint Paul's other named awards (General Scholarships, Named Endowed Scholarships) are reviewed from undergraduate transcripts after acceptance, not guaranteed. Ask the Financial Aid Office directly whether UMC candidacy status affects eligibility for any award beyond the Advance Course of Study Award named above; the public pages don't say either way for the MDiv itself.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "MDiv",
        credits: 79,
        typicalYears: "3 years full-time; up to 10 calendar years allowed",
        modalities: ["residential", "hybrid", "online"],
        blurb:
          "79 credit hours: contextual education and formation components (orientation, spiritual formation retreats, ministry practica, collaboration groups, mid-degree and summative seminars), Hebrew Bible, New Testament, ethics, Christian religious education, church history, systematic theology, church leadership, pastoral care, preaching, worship, church and society, world religions, and evangelism, plus 13.5 unrestricted elective hours. One curriculum, one credit total, one tuition rate — offered identically at the Kansas Campus (Leawood), the Oklahoma Campus (Oklahoma City), and via distance education; the catalog names no campus-specific requirement, course list, or price.",
        url: "https://www.spst.edu/master-of-divinity-m-div-degree-program/",
      },
      {
        name: "Master of Arts in Christian Ministry",
        abbr: "MACM",
        credits: 38,
        typicalYears: "2 years full-time; up to 8 calendar years allowed",
        modalities: ["residential", "hybrid", "online"],
        blurb:
          "The academic path to deacon ordination (or Advanced Course of Study) in the United Methodist Church. Students choose a specialization; the UM Studies specialization (Evangelism, Worship, Mission of the Church, UM Doctrine, UM Polity, UM History — 16 credit hours) is built explicitly to satisfy the deacon/ACOS educational requirement.",
        url: "https://www.spst.edu/master-of-arts-in-christian-ministry-macm-degree-program/",
      },
      {
        name: "Master of Arts (Theological Studies)",
        abbr: "MA(TS)",
        credits: 38,
        typicalYears: "2 years full-time",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an ordination degree — a thesis-culminating academic degree in religion and theology.",
        url: "https://www.spst.edu/master-of-arts-in-theological-studies/",
      },
      {
        name: "Doctor of Ministry",
        abbr: "DMin",
        credits: 30,
        typicalYears: "3–6 years",
        modalities: ["hybrid"],
        blurb: "For MDiv holders with substantial ministerial leadership experience; a collaborative-focus model with no electives once a focus is chosen.",
        url: "https://www.spst.edu/registrar/",
      },
    ],

    concentrations: [
      "Social Justice and Advocacy (MDiv specialization)",
      "Spirituality and Prophetic Leadership (MDiv specialization)",
      "Women, Society, and Church Studies (MDiv specialization)",
      "Modern Worship Music (MACM specialization)",
      "Prophetic Witness and Service (MACM specialization)",
      "UM Studies (MACM specialization)",
    ],

    partnerships: [
      {
        kind: "host-university",
        partner: "Oklahoma City University",
        blurb:
          "Saint Paul's Oklahoma Campus operates on OCU's campus (Bishop W. Angie Smith Chapel); Saint Paul students, faculty, and staff there use OCU's Dulaney-Browne Library and are subject to OCU policy for IRB review and campus conduct. A \"Three Plus Three\" pathway lets an OCU Religion major finish a bachelor's in three years and move directly into the Saint Paul MDiv without relocating.",
        url: "https://www.spst.edu/three-plus-three/",
      },
      {
        kind: "host-university",
        partner: "Church of the Resurrection",
        blurb: "Saint Paul's Kansas Campus occupies Building C on the Church of the Resurrection campus in Leawood, KS — a United Methodist congregation, not a university, hosting the school's other physical location.",
        url: "https://www.spst.edu/contact/",
      },
      {
        kind: "cross-registration",
        partner: "Kansas City Association of Theological Schools (KCATS)",
        blurb: "Full-time master's students may cross-register for up to six elective credit hours at Central Baptist Theological Seminary, Midwestern Baptist Theological Seminary, or Nazarene Theological Seminary. Flagged exception: the KCATS schools' own agreement excludes United Methodist denominational studies from cross-registration, so this route cannot be used to close the UM-studies gap above.",
        url: "https://www.spst.edu/",
      },
    ],

    courseOfStudy: {
      blurb:
        "Saint Paul operates the United Methodist Church Course of Study School under GBHEM — all 20 required courses, offered multiple times a year in a 7-week online format — for licensed local pastors, plus the Advanced Course of Study for those seeking provisional membership and ordination as an elder.",
      url: "https://www.spst.edu/cos/",
    },

    facultyNote:
      "Limited to Saint Paul's 10 named full-time faculty on its current directory page (\"Full-Time Faculty\" heading); the same page separately lists a Rabbi-in-Residence, a Visiting Assistant Professor, 9 adjunct faculty, and 7 emeritus/emerita faculty, all excluded here per the core-full-time-only scope this project uses for every school. Of the 10, each has an individual bio page (all linked below). Campus assignment is not published by Saint Paul as a declared roster field; it is inferred here from each person's own direct office phone line and address on their own bio page (a 913 Leawood, KS line vs. a 405 Oklahoma City, OK line) — 8 of 10 core faculty carry a Kansas-campus line (Betsworth, Hartley, Howell, Kamudzandu, Kvam, Liantonio, Sigmon, Stauffer); 2 carry an Oklahoma-campus line (Randolph, explicitly titled 'Academic Director of the Oklahoma Campus,' and Robinson). A student choosing to attend in person at the Oklahoma City site specifically, rather than online or at Leawood, would meet a noticeably smaller in-person faculty than at the Kansas Campus — the MDiv curriculum is identical either way (see ordination/degrees notes), but who teaches it in person is not evenly split.",

    contact: {
      admissionsUrl: "https://www.spst.edu/apply-now/",
      visitUrl: "https://www.spst.edu/considering-seminary/",
      phone: "913-253-5000",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
