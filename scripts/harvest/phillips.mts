// pnpm exec node scripts/harvest/phillips.mts
//
// Phillips Theological Seminary — Tulsa, OK. Slug `phillips`.
//
// The one thing that makes this school different from every other harvest so
// far: it is the ONLY school on the Senate's non-UMC list carrying **on the
// public roster page itself** — "University Senate Monitoring with Public
// Warning." GBHEM's own page says nothing beyond that label (no explanation
// of consequence, no timing rule for enrolled-vs-graduated students). The
// University Senate Guidelines document (a separate GBHEM publication) does
// define the category — "Approved for listing with public warning" is a
// PUBLIC sub-category of "Approved for listing," distinct from "Not approved
// for listing" — but even that document says nothing about how the warning
// interacts with a candidate's ¶324.4 satisfaction. That silence is reported
// in the JSON below via `note`, not resolved by inference.
//
// The second load-bearing fact: Phillips markets and structurally offers
// substantial online/hybrid coursework (ATS approves it for "Comprehensive
// (Half or More of a Degree)" distance education), and Phillips' OWN catalog
// states plainly that none of that counts for a UMC ordination-track student
// — they are "limited to 'in-residence' courses only." What the school OFFERS
// and what COUNTS are opposite ends of the spectrum here, more starkly than
// at Brite or Austin Presbyterian, which is exactly why the plan calls this
// out as the single most decision-changing fact on the page.
//
// Bespoke because: (a) Phillips' catalog contains its OWN ¶324.4-to-course
// summary table, and that table is NOT a reliable source — it states the UM
// denominational-studies total as "12 semester-hours" while the three named
// courses it lists sum to 9. Every coverage row below is scored against the
// Phase I/Phase II curriculum breakdown and the "Requirements in
// Denominational Studies" section directly; the summary table is mentioned in
// notes only as corroboration, never as the basis for a row. That breakdown
// also revealed a distinction Duke's harvest surfaced and this one originally
// missed: a course a UM student is bound to is not automatically evidence
// that the AREA is UMC-specific — mission-of-the-church (ET 525) turns out to
// be one of exactly three fixed courses in the universal Phase II "Theology &
// Ethics" requirement, taken by every MDiv student regardless of denomination,
// while evangelism (PL 725) and the three DS courses genuinely exist only
// because Phillips binds UMC ordination-track students to them. Same for
// theology and church-history: the universal Phase I/II core (Intro Theology
// + Constructive Theology; History of Christianity I & II) already satisfies
// those areas on its own, and the UM-specific DS 575/DS 550 additions are
// counted under um-studies, not double-counted here. This is why the schema
// carries a `required-umc-track` status distinct from `required`.
// (b) the faculty directory mixes professors who have an individual bio page
// with several who do not — profileUrl falls back to the shared directory
// page for those. Re-checked 2026-08-07: Arthur Carter and F. Douglas Powe
// now both have real, sitemap-indexed bio pages (afcarter/, doug-powe/) that
// did not exist (or were not yet linked/indexed) at the first pass. Bessler
// and Utley still have none — confirmed by reading the faculty-directory
// page's raw HTML (their entries have no <a href> wrapper, unlike everyone
// with a page) and by checking page-sitemap.xml's full ~140-URL list, which
// contains neither name. A search engine surfaced a URL under Utley's name
// (ptstulsa.edu/nancy-claire-pittman-copy-copy-copy/) whose <title> says
// "Allie Utley" but whose body is verbatim Nancy Claire Pittman's old bio —
// a stale WordPress duplicate, not in the sitemap, not a real page; (c) the
// "Comprehensive Faculty Bibliography" PDF the bio pages link to is dated
// 2019/2020 — visibly stale — so publications below are read from the (more
// current) prose bios instead, not that PDF.

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { get, today } from "./lib/fetch.mts";
import { htmlToText, pdfToText } from "./lib/text.mts";
import type { FacultyMember, SeminaryProfile } from "../../content/types.ts";

const fresh = process.argv.includes("--fresh");
const ROOT = process.cwd();

const GBHEM_SOURCE = "https://www.gbhem.org/education/schools-of-theology/";
const GBHEM_ASOF = "2026-07-07"; // page's own last-modified date, per research/gbhem-approved-schools-snapshot.md
const CATALOG_URL =
  "https://ptstulsa.edu/wp-content/uploads/2024/10/2024-2025-MASTERS-DEGREE-PROGRAMS-CATALOG-FINAL-REV-10012024.pdf";
const CATALOG_ASOF = "2024-10-01";
const COSTS_URL = "https://ptstulsa.edu/prospective-students/costs-scholarships/";
const FACULTY_DIR_URL = "https://ptstulsa.edu/faculty-directory/";
const ATS_MEMBER_URL = "https://www.ats.edu/member-schools/phillips-theological-seminary";

// --- fetch everything the profile needs -----------------------------------

const catalogPdf = await get(CATALOG_URL, { binary: true, fresh });
const catalogText = pdfToText(catalogPdf.path);

const costsPage = await get(COSTS_URL, { fresh });
const costsText = htmlToText(costsPage.body);

const facultyDirPage = await get(FACULTY_DIR_URL, { fresh });
const facultyDirText = htmlToText(facultyDirPage.body);

const atsPage = await get(ATS_MEMBER_URL, { fresh });
const atsText = htmlToText(atsPage.body);

// Sanity checks against the live pull — these are the sentences the profile's
// most consequential claims are built on. If Phillips or GBHEM changes the
// wording, this script should fail loudly rather than silently keep quoting
// the old text.
function must(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`);
}

must(
  /limited to.{0,5}.in-residence.{0,5}. courses only/i.test(catalogText),
  "catalog no longer states the in-residence-only rule for UMC ordination-track students verbatim — re-read the Online/On-Campus Requirements section",
);
must(
  /United Methodist students are required to take/i.test(catalogText),
  "catalog no longer states the UM-studies course sequence — re-read the Requirements in Denominational Studies section",
);
must(
  /Approval to Offer Distance \(Online\) Education:/i.test(atsText),
  "ATS member page layout changed — re-check the distance-education line",
);

// --- ordination readiness --------------------------------------------------

const ordination: SeminaryProfile["ordination"] = {
  senateStanding: {
    value: "monitoring-warning",
    source: GBHEM_SOURCE,
    asOf: GBHEM_ASOF,
    note:
      "GBHEM lists Phillips among the 24 Senate-approved non-UMC schools of theology, marked \"**\" — the page's own key: \"Denotes institutions on University Senate Monitoring with Public Warning.\" Phillips is the only school on the current list carrying this mark. GBHEM's roster page says nothing further about what the warning means for a candidate or whether it affects satisfaction of ¶324.4. A separate GBHEM publication, the University Senate Guidelines, defines \"Approved for listing with public warning\" as a PUBLIC sub-category of continued approval — distinct from and less severe than \"Not approved for listing\" — so Phillips remains an approved school, not a disapproved one. Neither document states whether the warning depends on when a student enrolls or graduates, or changes anything about degree-completion for ordination purposes. That is a real gap in what GBHEM publishes, not an oversight in this summary — ask your Board of Ordained Ministry registrar directly.",
  },
  onlineCredit: {
    value: "none-counts",
    source: GBHEM_SOURCE,
    asOf: GBHEM_ASOF,
    note:
      "GBHEM: no online or distance class at a Senate-approved non-UMC school counts toward ¶324.4, regardless of what the school offers. Phillips' own 2024–25 catalog confirms the same rule from its side: \"United Methodist Church students enrolled in an ordination track degree program (MDiv or MAMC) are limited to 'in-residence' courses only and may not register for online distance education courses offered by any non-UMC Seminary, including Phillips, according to policies set by the University Senate of the United Methodist Church.\" This is the single most decision-changing fact on this page: Phillips is ATS-approved to deliver \"Comprehensive (Half or More of a Degree)\" by distance education, and a non-UMC student there can take the bulk of the MDiv online — a UMC ordination-track student cannot count any of it.",
  },
  coverageSource: CATALOG_URL,
  coverageAsOf: CATALOG_ASOF,
  // Scored against the curriculum breakdown itself (Phase I/Phase II course
  // lists and the "Requirements in Denominational Studies" section), not
  // against Phillips' own summary table further down the catalog. That table
  // is corroboration at best, never the source — it states the UM
  // denominational-studies total as "12 semester-hours" while the three
  // courses it lists sum to 9, which is reason enough not to lean on it.
  //
  // The load-bearing distinction, checked row by row against the Phase II
  // breakdown: a slot is universal `required` only if a SPECIFIC, singularly
  // named course fills it for every MDiv student regardless of denomination.
  // Where the catalog instead says a denomination-specific course "satisfies
  // Phase II requirement for [a generic slot]," the generic slot itself may
  // already be covered by other fixed courses (theology, church-history are —
  // see below), or the specifically-named course may exist ONLY because
  // Phillips binds UMC ordination-track students to it (evangelism, um-studies
  // are). Those get `required-umc-track`, not `required`.
  coverage: [
    {
      area: "old-testament",
      status: "required",
      note: "Introduction to the Hebrew Bible (3 hrs) is a required Phase I course for every MDiv student, no denomination distinction.",
    },
    {
      area: "new-testament",
      status: "required",
      note: "Introduction to the New Testament (3 hrs) is a required Phase I course for every MDiv student, no denomination distinction.",
    },
    {
      area: "theology",
      status: "required",
      note:
        "Introduction to Theology (Phase I) and Constructive Theology (Phase II) are both fixed, specifically named required courses for every MDiv student regardless of denomination — 6 hours on their own, satisfying this area without needing anything UM-specific. DS 575 United Methodist Doctrine (3 hrs) is an ADDITIONAL, UMC-specific course a United Methodist student also takes — it fills the Phase II curriculum's generic 'advanced theology elective' slot for them specifically, and is counted under the um-studies row below rather than needed here.",
    },
    {
      area: "church-history",
      status: "required",
      note:
        "History of Christianity I and II (6 hrs) are fixed, specifically named required Phase I courses for every MDiv student regardless of denomination, satisfying this area on their own. DS 550 United Methodist History (3 hrs) is an ADDITIONAL, UMC-specific course a United Methodist student also takes — it fills the Phase II curriculum's generic 'advanced History of Christianity elective' slot for them specifically, and is counted under the um-studies row below rather than needed here.",
    },
    {
      area: "mission-of-the-church",
      status: "required",
      note:
        "ET 525 Ethics, Culture, and the Mission of the Church is one of exactly three fixed, specifically named courses making up the Phase II 'Theology & Ethics' requirement (alongside Constructive Theology and an advanced theology elective) — required of every MDiv student, not a UMC-specific addition. The catalog's United Methodist Studies section also names this course for UM students, which corroborates but is not the basis for this row.",
    },
    {
      area: "evangelism",
      status: "required-umc-track",
      note:
        "No course titled evangelism, and no 'Evangelism' slot, appears anywhere in the standard 81-hour MDiv's Phase I–III curriculum breakdown — the closest generic slot is an unrestricted 'Elective in this area' inside Faith & Public Discourse. The catalog's Requirements in Denominational Studies / United Methodist Studies sections are explicit that United Methodist ordination-track students specifically must take a course on evangelism, normally PL 725 The Church and Evangelism, in addition to their denominational-studies sequence. That binds United Methodist students to a named course the general MDiv core does not otherwise require.",
    },
    {
      area: "worship-liturgy",
      status: "required",
      note:
        "Worship (The Theology and Practice of Public Worship, 3 hrs) is a fixed, specifically named required Phase II course ('Practices of Theological Leadership') for every MDiv student, no denomination distinction.",
    },
    {
      area: "preaching",
      status: "required",
      note:
        "Preaching (3 hrs) is a fixed, specifically named required Phase II course ('Practices of Theological Leadership') for every MDiv student, no denomination distinction.",
    },
    {
      area: "um-studies",
      status: "required-umc-track",
      note:
        "The catalog's Requirements in Denominational Studies section states that United Methodist students are required to take DS 550 United Methodist History (3 hrs), DS 575 United Methodist Doctrine (3 hrs), and DS 625 United Methodist Polity (3 hrs) — three specifically named courses that exist as a requirement only because Phillips binds United Methodist ordination-track students to them; a Disciples, Presbyterian, Baptist, UCC, or Unitarian Universalist student fills the same generic curriculum slots with their own denomination's course instead. The three named UM courses sum to 9 semester-hours, above ¶324.4's 6-hour floor. Flag for your registrar: the same catalog section's introductory sentence states the United Methodist denominational-studies total as \"12 semester-hours,\" which does not match the 9 hours the three named courses actually sum to. This discrepancy is in Phillips' own text; we did not resolve it by assumption — ask the registrar which figure is current.",
    },
  ],
  // No gaps to report: every one of the nine ¶324.4 areas is either in the
  // universal MDiv core or a specifically named course Phillips binds United
  // Methodist ordination-track students to. Per the validator, a
  // required-umc-track row is not a gap — a UMC candidate cannot graduate
  // without it either — so gapSummary/gapRemedies are correctly omitted.
};

// --- cost -------------------------------------------------------------------

function grab(text: string, label: string): string | undefined {
  const i = text.indexOf(label);
  if (i < 0) return undefined;
  const rest = text.slice(i + label.length, i + label.length + 200);
  const m = /\$\s*[\d,]+(\.\d+)?/.exec(rest);
  return m?.[0].replace(/\s+/g, " ").trim();
}

const tuitionPerCredit = grab(costsText, "Degree-seeking students (per credit hour)");
must(!!tuitionPerCredit, "could not find the per-credit tuition figure on the costs page — page layout may have changed");

const cost: SeminaryProfile["cost"] = {
  tuitionPerCredit: {
    value: `${tuitionPerCredit} per credit hour (degree-seeking master's students)`,
    source: COSTS_URL,
    asOf: "2025-08-01", // stated as the "2025-2026 Academic Year" figure
    note:
      "81 semester-hours × this rate is roughly $38,880 in gross MDiv tuition before aid. General Student fee ($100/semester), Student Life fee ($25/semester), and course-specific fees (immersion trips, audits) are charged on top.",
  },
  pctReceivingAid: {
    value: "Flat tuition assistance to nearly every degree-seeking student, not a % applicant figure",
    source: COSTS_URL,
    asOf: "2025-08-01",
    note:
      "Phillips does not publish a headline \"% receiving aid\" figure the way Perkins or Austin do. Instead it states a flat schedule: \"DOC/UCC Students: 100% ... Underrepresented Groups: 100% ... All Other Students: 80%\" tuition assistance for anyone in good academic standing across its five master's and DMin programs. Read literally, this is close to full or 80% tuition coverage for most enrolled students, before any named scholarship — an unusually generous baseline. Confirm current terms with Admissions before counting on it.",
  },
  typicalAward: {
    value: "80% tuition assistance baseline for most students; 100% for Disciples/UCC-affiliated and underrepresented-group students",
    source: COSTS_URL,
    asOf: "2025-08-01",
    note:
      "On top of the baseline, named awards exist: the Phillips Seminary Scholars Program sets aside one full-tuition-plus-stipend award specifically for a Methodist student (of eight total Scholars awards beginning fall 2025), and several other named fellowships (Matthew A. Thompson, Peake, FCC Tulsa I–III) cover full tuition, fees, and a stipend for a single qualifying student each year.",
  },
  honestNote:
    "Phillips' own numbers are unusually candid: it names the exact tuition-assistance percentage by category rather than an average award, and one Phillips Seminary Scholars slot is explicitly reserved for a Methodist student — worth asking Admissions about directly if you are UMC. It does not, however, publish a Ministerial Education Fund note or any UMC-specific denominational-aid statement beyond that one named award; ask your conference registrar what conference-level aid, if any, applies to a non-UMC Senate school.",
};

// --- scale -------------------------------------------------------------------

const enrollMatch = /Number of Students \(FTE\):\s*(\d+)\s*\((\d+\.\d+)\)/.exec(atsText);
const facMatch = /Number of Full-Time Faculty \(FTE\):\s*(\d+)\s*\((\d+\.\d+)\)/.exec(atsText);
must(!!enrollMatch, "ATS member page no longer reports enrollment in the expected format");
must(!!facMatch, "ATS member page no longer reports faculty counts in the expected format");

const scale: SeminaryProfile["scale"] = {
  totalEnrollment: {
    value: `${enrollMatch![1]} students (${enrollMatch![2]} FTE), reported Fall 2025`,
    source: ATS_MEMBER_URL,
    asOf: today(),
    note: "ATS's member-school page reports this as of Fall 2025; headcount and FTE both cover all degree programs, not MDiv alone.",
  },
  studentFacultyRatio: {
    value: `${facMatch![1]} full-time faculty (${facMatch![2]} FTE) against ${enrollMatch![1]} students`,
    source: ATS_MEMBER_URL,
    asOf: today(),
    note: "We report the raw counts rather than compute a single ratio — ATS does not publish one directly, and the FTE figure exceeding the headcount figure for faculty suggests some faculty carry overload appointments counted fractionally elsewhere.",
  },
};

// --- degrees -----------------------------------------------------------------

const degrees: SeminaryProfile["degrees"] = [
  {
    name: "Master of Divinity",
    abbr: "MDiv",
    credits: 81,
    modalities: ["residential", "hybrid"],
    blurb:
      "The ordination degree. A minimum of 24 of the 81 hours must be completed in residence in Tulsa or at a Phillips immersion, of which up to 12 may be met via synchronous Zoom — but a United Methodist ordination-track student is held to in-residence courses only, per University Senate policy, so that flexibility does not apply if you are a UMC candidate.",
    url: "https://ptstulsa.edu/prospective-students/programs-of-study/",
  },
  {
    name: "Master of Arts in Ministry and Culture",
    abbr: "MAMC",
    credits: 48,
    modalities: ["residential", "hybrid"],
    blurb: "A 48-hour alternative to the MDiv for ministry that doesn't require ordination's full degree; also carries the same in-residence-only restriction for UMC ordination-track students.",
    url: "https://ptstulsa.edu/prospective-students/programs-of-study/",
  },
  {
    name: "Master of Arts in Social Justice",
    abbr: "MASJ",
    credits: 39,
    modalities: ["residential", "hybrid"],
    blurb: "Not an ordination degree.",
    url: "https://ptstulsa.edu/prospective-students/programs-of-study/",
  },
  {
    name: "Master of Theological Studies",
    abbr: "MTS",
    credits: 48,
    modalities: ["residential", "hybrid"],
    blurb: "General Theological Studies or Pre-doctoral Theological Studies tracks; not an ordination degree.",
    url: "https://ptstulsa.edu/prospective-students/programs-of-study/",
  },
  {
    name: "Doctor of Ministry",
    abbr: "DMin",
    credits: 30,
    modalities: ["hybrid"],
    blurb: "Phillips describes this explicitly as a hybrid program (online and on-campus).",
    url: "https://ptstulsa.edu/prospective-students/programs-of-study/",
    flag: "Phillips' own hybrid DMin is the clearest example on this page of how much online delivery it offers generally — none of which changes the MDiv/MAMC in-residence rule for UMC ordination-track students.",
  },
  {
    name: "Graduate Certificate Program",
    abbr: "Cert.",
    credits: 16,
    modalities: ["online"],
    blurb: "Phillips states this \"can be completed 100% online.\" Not a degree and not an ordination-relevant credential.",
    url: "https://ptstulsa.edu/prospective-students/programs-of-study/",
  },
];

const concentrations = [
  "Black Church Studies and African American Faith Life",
  "Baptist Studies",
  "Unitarian Universalist Studies",
];

// --- faculty note ------------------------------------------------------------

const facultyNote =
  "Roster limited to Phillips' 9 core full-time faculty listed in its main \"Faculty Directory\" heading. The same page separately lists 6 emeritae/i professors and 4 \"Adjunct and Affiliate Faculty\" — including Trista Soendker Nicholson, an Affiliate Instructor of United Methodist Studies — which this roster deliberately omits per the core-full-time-only scope. Of the 9 core faculty, 7 (Barnett, Davison, Capretto, McCallie, Warren Carter, Arthur Carter, Powe) now have individual bio pages; the remaining 2 (Bessler, Utley) appear only as a name and title on the shared directory page — confirmed, not just unfound, by checking the directory page's own HTML for a missing link and by checking that neither name appears anywhere in the school's ~140-URL page sitemap.";

// --- assemble the profile -----------------------------------------------

const profile: SeminaryProfile = {
  slug: "phillips",
  name: "Phillips Theological Seminary",
  city: "Tulsa",
  state: "OK",
  url: "https://ptstulsa.edu/",
  ordination,
  scale,
  cost,
  degrees,
  concentrations,
  facultyNote,
  contact: {
    admissionsUrl: "https://ptstulsa.edu/prospective-students/ask-admissions/",
    visitUrl: "https://ptstulsa.edu/prospective-students/schedule-a-campus-visit/",
    phone: "918-610-8303",
  },
  lastVerified: today(),
};

// --- faculty roster -----------------------------------------------------

const faculty: FacultyMember[] = [
  {
    id: "phillips-barnett",
    seminarySlug: "phillips",
    name: "Lisa Barnett",
    title: "Associate Professor of American Religious History",
    otherRoles: ["Director of Formation for Disciples Students"],
    areas: ["church-history"],
    email: "lisa.barnett@ptstulsa.edu",
    degrees: [
      "PhD in U.S. History, Texas Christian University",
      "Master of Theology (ThM) in American Religious History, Brite Divinity School",
      "Master of Divinity, Brite Divinity School",
      "BA in Oral Communication Education, University of Central Oklahoma",
    ],
    publications: [
      {
        title: "Peyote Politics: The Making of the Native American Church, 1880–1937",
        kind: "book",
        year: 2025,
        publisher: "University of Oklahoma Press",
      },
      {
        title: "Border Policing: A History of Enforcement and Evasion in North America",
        kind: "chapter",
        publisher: "University of Texas Press",
        note: "Contributed a chapter to this edited volume; the chapter's own title and year are not stated on Phillips' bio page.",
      },
      {
        title: "Religion in the North American West",
        kind: "chapter",
        publisher: "University of Nebraska Press",
        note: "Forthcoming (per Phillips' bio page, checked 2026-08-07) — a chapter on the Otoe Church of the First Born. Chapter title and year not stated.",
      },
      {
        title: "Oklahoma Women Lead the Way into the KKK",
        kind: "chapter",
        publisher: "University of Oklahoma Press",
        note: "Forthcoming (per Phillips' bio page, checked 2026-08-07) chapter in the edited collection American West between the World Wars. Year not stated.",
      },
    ],
    publicationsSource: "https://ptstulsa.edu/lisa-barnett-2/",
    publicationsAsOf: today(),
    profileUrl: "https://ptstulsa.edu/lisa-barnett-2/",
  },
  {
    id: "phillips-bessler",
    seminarySlug: "phillips",
    name: "Joe Bessler",
    title: "Robert Travis Peake Professor of Theology",
    areas: ["systematic-theology"],
    email: "joe.bessler@ptstulsa.edu",
    // Re-checked 2026-08-07: no bio-page link on the faculty directory (its
    // HTML block for Bessler has no <a href> wrapper, unlike the 5 who do),
    // no entry in page-sitemap.xml's ~140 URLs, and guessed slugs
    // (joe-bessler, bessler) redirect to an unrelated image and a 2010 blog
    // post, not a bio page. Genuinely absent, not a harvest miss.
    profileUrl: FACULTY_DIR_URL,
  },
  {
    id: "phillips-capretto",
    seminarySlug: "phillips",
    name: "Peter Capretto",
    title: "Associate Professor of Psychology, Culture, and Religion",
    areas: ["pastoral-care-counseling"],
    email: "peter.capretto@ptstulsa.edu",
    degrees: [
      "PhD, Vanderbilt University, 2019",
      "MA, Vanderbilt University, 2016",
      "MTS, Vanderbilt Divinity School, 2012",
      "BA, Allegheny College, 2010",
    ],
    publications: [
      {
        title: "Beyond the Empathy Trap: Cultivating Freedom and Solidarity in an Ethic of Care",
        kind: "book",
        year: 2026,
        publisher: "Fordham University Press",
      },
      {
        title: "Spiritual Direction and the Other: Interdisciplinary Explorations of Accompaniment",
        kind: "edited-volume",
        year: 2026,
        publisher: "Routledge",
      },
      {
        title: "Trauma and Transcendence: Suffering and the Limits of Theory",
        kind: "edited-volume",
        year: 2018,
        publisher: "Fordham University Press",
      },
    ],
    publicationsSource: "https://ptstulsa.edu/peter-capretto/",
    publicationsAsOf: today(),
    profileUrl: "https://ptstulsa.edu/peter-capretto/",
  },
  {
    id: "phillips-carter-arthur",
    seminarySlug: "phillips",
    name: "Arthur Carter",
    title: "Assistant Professor of New Testament",
    otherRoles: [
      "Director of Black Church Studies and African American Faith-Life",
      "Director of Formation for Baptist Students",
    ],
    areas: ["new-testament", "black-church-studies"],
    email: "arthur.carter@ptstulsa.edu",
    degrees: [
      "PhD, Vanderbilt University, 2016",
      "MA, Vanderbilt University",
      "MA, University of Manchester, UK (with Distinction, Biblical Studies)",
      "MDiv, Colgate Rochester Crozer Divinity School",
      "BA, Wake Forest University (Physics)",
    ],
    // Re-checked 2026-08-07: a real individual bio page now exists (not on
    // page-sitemap.xml's listing when this school was first harvested, but
    // live and indexed now). Its "Research" and "Publications" accordion
    // sections are both present but literally empty in the page HTML — not a
    // parsing miss, the school just hasn't filled them in yet.
    profileUrl: "https://ptstulsa.edu/afcarter/",
  },
  {
    id: "phillips-carter-warren",
    seminarySlug: "phillips",
    name: "Warren Carter",
    title: "LaDonna Kramer Meinders Professor of New Testament",
    areas: ["new-testament"],
    email: "warren.carter@ptstulsa.edu",
    degrees: [
      "PhD, Princeton Theological Seminary",
      "ThM, Melbourne College of Divinity",
      "BD, Melbourne College of Divinity",
      "BA, Victoria University of Wellington",
    ],
    profileUrl: "https://ptstulsa.edu/warren-carter-2/",
  },
  {
    id: "phillips-davison",
    seminarySlug: "phillips",
    name: "Lisa W. Davison",
    title: "Johnnie Eargle Cadieux Professor of Hebrew Bible",
    otherRoles: ["Vice President of Academic Affairs and Dean"],
    areas: ["hebrew-bible"],
    email: "lisa.davison@ptstulsa.edu",
    degrees: [
      "PhD, Vanderbilt University",
      "MA, Vanderbilt University",
      "MDiv, Brite Divinity School",
      "BA, Lynchburg College",
    ],
    publications: [
      {
        title: "Preaching the Women of the Bible",
        kind: "book",
        year: 2006,
      },
      {
        title: "More Than a Womb: Childfree Women as Agents of the Holy",
        kind: "book",
        note: "Publication year not stated on Phillips' bio page.",
      },
      {
        title: "The Preacher's Bible Handbook",
        kind: "chapter",
        publisher: "Westminster John Knox Press",
        note: "Contributed six essays, ed. Wes Allen (Phillips' bio page abbreviates the publisher \"WJK\"). Year not stated.",
      },
      {
        title: "Just Women Bible Study",
        kind: "chapter",
        note: "Contributed the essays \"Ruth & Naomi\" and \"Bathsheba.\" Publisher and year not stated on Phillips' bio page.",
      },
      {
        title: "The Living Pulpit: Sermons that Illustrate Preaching in the Stone-Campbell Movement 1968–2018",
        kind: "chapter",
        note: "One of her sermons was selected for inclusion in this collection. Publisher and year not stated on Phillips' bio page. Publications capped at 5 for this profile — several more of Davison's shorter contributions (Tabletalk, the Encyclopedia of the Stone-Campbell Movement, The New Interpreter's Study Bible, The College Study Bible, the New Proclamation Series) are named on her bio page but omitted here for lack of room, not for lack of a source.",
      },
    ],
    publicationsSource: "https://ptstulsa.edu/lisa-davison/",
    publicationsAsOf: today(),
    profileUrl: "https://ptstulsa.edu/lisa-davison/",
  },
  {
    id: "phillips-mccallie",
    seminarySlug: "phillips",
    name: "Kathleen McCallie",
    title: "Associate Professor of Ministerial Leadership and Ethics",
    otherRoles: ["Director of Formation for UCC Students"],
    areas: ["congregational-leadership", "ethics-public-theology"],
    email: "kathy.mccallie@ptstulsa.edu",
    degrees: [
      "PhD, Political Science, University of Oklahoma, 2006",
      "MDiv, Southern Methodist University, Perkins School of Theology, 1998",
      "MA, Oklahoma State University, 1984",
      "BA, Oklahoma State University, 1981",
    ],
    profileUrl: "https://ptstulsa.edu/kathleen-mccallie/",
  },
  {
    id: "phillips-powe",
    seminarySlug: "phillips",
    name: "F. Douglas Powe Jr.",
    title: "Mouzon Biggs, Jr. Professor of Methodist Studies",
    otherRoles: ["President"],
    areas: ["wesleyan-studies"],
    email: "douglas.powe@ptstulsa.edu",
    // PhD is the only degree Phillips' bio page states with an explicit
    // abbreviation ("Rev. F. Douglas Powe Jr., PhD" plus "Emory University's
    // Graduate Division of Religion"). It also names Ohio Wesleyan
    // University and Emory's Candler School of Theology as "a graduate of,"
    // without stating which degree came from which — not recorded here to
    // avoid guessing (Candler almost certainly means an MDiv, but the page
    // itself never says so).
    degrees: ["PhD, Emory University, Graduate Division of Religion"],
    publications: [
      {
        title: "Sustaining While Disrupting: The Challenge of Congregational Innovation",
        kind: "book",
        year: 2022,
        publisher: "Fortress Press",
        note: "With Lovett H. Weems Jr. Full title/year/publisher confirmed via the publisher's own listing (ISBN 9781506479200) — Phillips' bio page names only the short title.",
      },
      {
        title: "The Adept Church: Navigating Between a Rock and a Hard Place",
        kind: "book",
        year: 2020,
        publisher: "Abingdon Press",
        note: "Full title/year/publisher confirmed via Abingdon Press's own listing (ISBN 9781501896521) — Phillips' bio page names only the short title.",
      },
      {
        title: "Transforming Evangelism: The Wesleyan Way of Sharing Faith",
        kind: "book",
        year: 2006,
        publisher: "Discipleship Resources",
        note: "With Henry H. Knight III. Full title/year/publisher confirmed via the publisher's own listing (ISBN 9780881774856) — Phillips' bio page names only the short title.",
      },
    ],
    publicationsSource: "https://ptstulsa.edu/doug-powe/",
    publicationsAsOf: today(),
    // Re-checked 2026-08-07: a real individual bio/president page now
    // exists, indexed in page-sitemap.xml, distinct from the shared
    // directory. Narrative bio only — no separate "Education and CV"
    // list the way most of the other bio pages have.
    profileUrl: "https://ptstulsa.edu/doug-powe/",
  },
  {
    id: "phillips-utley",
    seminarySlug: "phillips",
    name: "Allie Utley",
    title: "Assistant Professor of Liturgy and Practical Theology",
    areas: ["liturgy-worship", "practical-theology"],
    email: "allie.utley@ptstulsa.edu",
    // Re-checked 2026-08-07: no link on the faculty directory (no <a href>
    // wrapper on her block, same as Bessler), and no entry in
    // page-sitemap.xml's ~140 URLs. A search engine surfaced
    // ptstulsa.edu/nancy-claire-pittman-copy-copy-copy/ under her name —
    // its <title> tag says "Allie Utley" but the actual page body is
    // entirely Nancy Claire Pittman's old bio (a stale/mislabeled WordPress
    // duplicate, not indexed in the sitemap either). Confirmed unusable by
    // reading the raw page, not just the search snippet — genuinely no bio
    // page exists for her right now.
    profileUrl: FACULTY_DIR_URL,
  },
];

// --- write -----------------------------------------------------------------

// Confirm every faculty member's directory listing text is actually present
// in the page we scraped, so a re-run catches a departed or renamed professor
// rather than silently keeping a stale entry.
for (const f of faculty) {
  const words = f.name.trim().split(/\s+/).filter((w) => !/^(Jr\.?|Sr\.?|II|III|IV)$/i.test(w));
  const surname = words[words.length - 1].replace(/\.$/, "");
  must(
    facultyDirText.includes(f.name) || facultyDirText.includes(surname),
    `"${f.name}" no longer appears on the faculty directory page — re-check the roster`,
  );
}

await writeFile(
  join(ROOT, "data/seminaries/phillips.json"),
  JSON.stringify(profile, null, 2) + "\n",
  "utf8",
);
await writeFile(
  join(ROOT, "data/faculty/phillips.json"),
  JSON.stringify(faculty, null, 2) + "\n",
  "utf8",
);

console.log(`Wrote data/seminaries/phillips.json and data/faculty/phillips.json (${faculty.length} faculty).`);
