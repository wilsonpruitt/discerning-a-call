// Drew University Theological School — one of the 13 UMC schools of theology,
// and (per its own pages) the only one of the 13 originally chartered by the
// General Conference itself.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//   - drew.edu sits behind Cloudflare bot mitigation: a plain `curl` with a
//     generic browser UA gets a hard "Attention Required!" block page, but
//     this project's own identifying UA (see lib/fetch.mts) sailed through
//     with a 200 on every page tried. Whatever Cloudflare's rule is keying on,
//     it isn't hostile to a bot that identifies itself. theology.drew.edu (an
//     older subdomain some search results still point at) fails outright with
//     a TLS handshake error — use drew.edu, not that subdomain.
//   - The faculty directory
//     (https://drew.edu/theological-school/theological-school-academics/our-faculty-inspiring-leaders/)
//     is server-rendered WordPress with NO individual per-professor pages —
//     Perkins' pattern, not Duke's. But unlike Perkins, every entry links a
//     dated CV PDF ("<Name> CV – 2026"). This harvest does not parse those
//     CVs for publications (25 more PDF fetches for a first pass was more
//     than the return justified) — `facultyNote` says so plainly rather than
//     mixing a couple of parsed CVs in with the rest silently uncovered.
//   - The directory page has three unlabelled-then-labelled sections in a
//     single flat list: an implicit "current full-time faculty" block (no
//     heading at all — it just starts after the page's marketing copy),
//     then an explicit "Emeriti Faculty" heading, then "Affiliate Faculty".
//     Scope is the unlabelled first block only (25 people, Aponte through
//     Winderweedle) — same "core full-time only" cut Duke and Saint Paul made,
//     just without a heading of its own to anchor on. Traci C. West, still
//     listed by some secondary sources (and Drew's own faculty-highlights
//     copy) as active, in fact carries the title "James W. Pearsall Professor
//     EMERITA of Christian Ethics and African American Studies" on the
//     current directory page itself — excluded here on that basis, not on
//     background knowledge.
//   - THE COVERAGE FINDING: Drew's MDiv core is NOT built from
//     testament/discipline-named survey courses the way every other school in
//     this project's core is. Its six required courses are cross-disciplinary
//     ("Bible and Its Interpreters," "Transforming Theologies," "Christian
//     Communities in Contexts," "Global Faiths and the Earth," "Gospel Living
//     and Social Transformation," "Identity, Spirituality, and Vocation") and
//     every MDiv student then adds one of four "vocational pathways" (27-28
//     credits) that supplies most of the testament- and practice-specific
//     coursework. A UMC ordination candidate's obvious pathway is "United
//     Methodist Ministry," which Drew's own admissions copy states "meets the
//     educational requirements for ordination as an Elder or Deacon in the
//     United Methodist Church" — and which is the only pathway carrying a
//     dedicated, named "United Methodist Studies (10 credits)" block
//     (WESM600/610/615/630). This coverage table scores what that pathway
//     binds a UMC student to, the same way Duke's and Phillips' tables score
//     what their bulletins bind a UMC student to — see each row's note for
//     the exact course and credit-bucket it comes from.
//   - Two individual WESM course descriptions state their ordination function
//     as a matter of the school's own record, not this site's inference:
//     WESM615 ("Evangelism as Practice") reads "Fulfills the Division of
//     Ordained Ministry requirement in evangelism for United Methodist
//     students" verbatim in Drew's catalog, and WOR610 ("Vital Worship in the
//     21st Century for United Methodists") is described there as "Designed
//     for United Methodist Church Basic Graduate Theological Studies." Those
//     are about as close to a school stating the ¶324.4 obligation in its own
//     words as this project has found.
//   - THE GAP: no pathway at Drew — not United Methodist Ministry, not any of
//     the other three — guarantees a preaching course. Every pathway's
//     "Practices in Ministry" block is "three different categories chosen
//     from" a list that includes Preaching (PREA) as one option among several
//     (Pastoral Care and Counseling, Worship, Religious Education,
//     Professional Ethics, depending on the pathway); a student can complete
//     the United Methodist Ministry pathway's 9-credit Practices in Ministry
//     block entirely on PCC + REDU + Professional Ethics and never take a
//     PREA course. Scored `elective`, with a gap remedy pointing at exactly
//     which line to spend one of those three category-choices on.
//
// Run: node scripts/harvest/drew.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { htmlToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://drew.edu";
const FACULTY_URL = `${BASE}/theological-school/theological-school-academics/our-faculty-inspiring-leaders/`;
const MDIV_CATALOG_URL = "https://drew-theo-catalog.coursedog.com/programs/8pdhNS30m326vL755QMH";
const GRAD_TUITION_URL = `${BASE}/admissions-and-aid/graduate-admissions/graduate-tuition/`;
const FEE_SCHEDULE_URL = `${BASE}/admissions-and-aid/student-financial-services/student-accounts/tuition-and-fees-schedules/`;

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
  titleLines: string[];
  degrees: string[];
}

const DEGREE_RE =
  /^(PhD|ThD|DMin|MDiv|MPhil|MA|MTS|MTh|ThM|BA|BTh|BD|BSB|BMA|MM|Bachelor of)\b/;
const OFFICE_RE = /^(Seminary Hall|Library)\b/;
const PHONE_RE = /^\d{3}-\d{3}-\d{4}$/;
const CV_LINE_RE = /\bCV\s*[–-]?\s*20\d\d$/;
const EMAIL_PLACEHOLDER_RE = /^\[email/i;

// The faculty page is one flat WordPress list, no per-person anchors — a
// per-person block runs from just after the previous "<Name> CV – YYYY"
// marker to the next one. Parsing on that marker, rather than trying to
// detect "start of a new person" any other way, is what makes this reliable:
// title lines, degree lines, and office/phone lines are otherwise
// indistinguishable in shape from each other.
function parseFacultyBlock(lines: string[]): Entry {
  const rawName = lines[0].replace(/,\s*PhD$/i, "").trim();
  const titleLines: string[] = [];
  const degrees: string[] = [];
  for (const line of lines.slice(1)) {
    if (OFFICE_RE.test(line) || PHONE_RE.test(line) || EMAIL_PLACEHOLDER_RE.test(line)) continue;
    if (DEGREE_RE.test(line)) {
      degrees.push(line);
    } else if (!degrees.length) {
      // Titles come before any degree line; once degrees start, a stray
      // non-degree line (there are none in practice) would be mis-sorted, but
      // no entry in this directory currently interleaves them.
      titleLines.push(line);
    }
  }
  return { name: rawName, titleLines, degrees };
}

async function fetchFaculty(): Promise<Entry[]> {
  const { body } = await get(FACULTY_URL, { fresh });
  const text = htmlToText(body);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const startIdx = lines.findIndex((l) => l.startsWith("Edwin David Aponte"));
  const endIdx = lines.findIndex((l) => l === "Emeriti Faculty");
  if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
    throw new Error(
      "could not find the faculty section boundaries — Drew's page structure may have changed; re-check the anchor names",
    );
  }
  const section = lines.slice(startIdx, endIdx);

  const entries: Entry[] = [];
  let block: string[] = [];
  for (const line of section) {
    block.push(line);
    if (CV_LINE_RE.test(line)) {
      entries.push(parseFacultyBlock(block));
      block = [];
    }
  }
  if (block.length) {
    throw new Error(
      `trailing lines after the last CV marker never closed into a block: ${JSON.stringify(block)}`,
    );
  }
  return entries;
}

// A few titles the normalizer's title-only vocabulary doesn't reach — read
// from each person's own Drew title/role rather than outside knowledge, and
// recorded here per the Duke precedent rather than left blank.
const MANUAL_AREA_FALLBACK: Record<string, StudyArea[]> = {
  "Edwin David Aponte": ["practical-theology", "latino-hispanic-ministry"], // "Professor of Religion and Culture"; his own bio identifies him as a scholar of Latino/a religion and practical theology
  "Chris Boesel": ["systematic-theology"], // "Professor of Christian Theology" — the rule for systematic-theology matches a bare "professor of theology," not "of Christian theology"
  "Katherine Brown": ["spiritual-formation"], // "Teaching Professor of Language and Culture," Director of Theological Language and Learning — no area rule matches "Language and Culture" cleanly; her role is formational/pedagogical, not a content discipline, so left thin rather than guessed
  "Gladson Jathanna": ["church-history"], // "Associate Professor of the History of Christianities" — plural "Christianities" doesn't match the singular-phrase rules
  "Robert Paul Seesengood": ["hebrew-bible", "new-testament"], // "Teaching Professor of Bible and Cultures" — no rule matches "Bible and Cultures"; his own faculty-page book blurbs are a Judith commentary and Pauline cultural-studies work, spanning both testaments the way a "Biblical Studies" chair would
  "J. Terry Todd": ["church-history"], // "Associate Professor of American Religious Studies" — a church-history subfield the "American Religious Studies" phrase itself doesn't match
};

function buildFaculty(entries: Entry[]): FacultyMember[] {
  return entries.map((e) => {
    const title = e.titleLines[0] ?? "";
    const otherRoles = e.titleLines.slice(1);
    const signalText = e.titleLines.join(" · ");
    let areas = suggestAreas(signalText);
    if (areas.length === 0) areas = MANUAL_AREA_FALLBACK[e.name] ?? [];

    const surname = e.name.trim().split(/\s+/).slice(-1)[0];
    const member: FacultyMember = {
      id: `drew-${slugifyName(surname)}`,
      seminarySlug: "drew",
      name: e.name,
      title,
      areas,
      profileUrl: FACULTY_URL,
    };
    if (otherRoles.length) member.otherRoles = otherRoles;
    if (e.degrees.length) member.degrees = e.degrees;
    return member;
  });
}

async function main() {
  const entries = await fetchFaculty();
  const faculty = buildFaculty(entries);
  await writeFile(join(ROOT, "data/faculty/drew.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/drew.json`);

  // Touch the pages this profile is built from, so they land in the fetch
  // cache alongside this run even though the coverage table below is
  // hand-assembled from the prose (per README §2 — a school's own mapping,
  // where it has one, is a lead and never the evidence).
  await get(MDIV_CATALOG_URL, { fresh });
  await get(GRAD_TUITION_URL, { fresh });
  await get(FEE_SCHEDULE_URL, { fresh });

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/drew.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/drew.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "drew",
    name: "Drew University Theological School",
    city: "Madison",
    state: "NJ",
    url: "https://drew.edu/theological-school/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: "One of the 13 United Methodist schools of theology.",
      },
      onlineCredit: {
        value: "fully-counts",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. Drew's own MDiv program page independently confirms the degree 'offers completely online or in-person options,' with full- or part-time pacing either way.",
      },
      coverageSource: "https://drew-theo-catalog.coursedog.com/programs/8pdhNS30m326vL755QMH",
      coverageAsOf: capturedAt,
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "Drew's 78-credit MDiv core has no testament-specific survey (its six universal required courses are cross-disciplinary, not OT/NT/Theology/Church-History-named). Every vocational pathway a United Methodist ordination candidate would realistically choose fixes this: the United Methodist Ministry pathway names a required 3-credit Hebrew Bible line (BBCL505, BBCL600, BBCL601, or another HEB course) as its own dedicated requirement, separate from and in addition to the universal-core Bible course (BBCL501, a hermeneutics/interpretation course, not a testament survey).",
        },
        {
          area: "new-testament",
          status: "required",
          note: "Same structure as Old Testament above: the United Methodist Ministry pathway names a required 3-credit Christian Testament line (BBCL506, BBCL605, BBCL606, or another CNT course), on top of the universal core's BBCL501.",
        },
        {
          area: "theology",
          status: "required",
          note: "THEO501 ('Transforming Theologies') is one of the six universal required courses every MDiv student takes, regardless of pathway.",
        },
        {
          area: "church-history",
          status: "required",
          note: "THST501 ('Christian Communities in Contexts') is one of the six universal required courses. Its own catalog description frames it thematically — 'select Christian communities in their historical contexts,' with an explicit emphasis on gender, sexuality, race, and colonialism — rather than as a chronological survey course; a candidate wanting the fuller conventional history sequence would look to electives.",
        },
        {
          area: "mission-of-the-church",
          status: "required-umc-track",
          note: "Bundled into the United Methodist Ministry pathway's required 'United Methodist Studies (10 credits)' block: WESM600, titled 'United Methodist History and Mission,' is a required course inside that block, per its own catalog description covering 'origins, mission, organization, outreach...in the development of United Methodism as an international denomination.' The course reads as UMC's own missionary history and self-understanding of mission specifically, not a general missiology survey — the closest fit this catalog offers to ¶324.4's mission-of-the-church area, and bound on a United Methodist student the same way Duke's unnamed mission elective is bound, just with a course actually named here.",
        },
        {
          area: "evangelism",
          status: "required-umc-track",
          note: "WESM615 ('Evangelism as Practice'), part of the same required 'United Methodist Studies (10 credits)' block in the United Methodist Ministry pathway. Its own catalog description states, in Drew's own words, that it 'Fulfills the Division of Ordained Ministry requirement in evangelism for United Methodist students' — about as direct a statement of the ¶324.4 obligation as a course description gets.",
        },
        {
          area: "worship-liturgy",
          status: "required-umc-track",
          note: "The United Methodist Ministry pathway carries its own dedicated, required 'Worship (3 credits)' line (THST622, WOR610, WOR505, or another WOR course) — a slot that exists in this pathway specifically and is not guaranteed by Drew's other three vocational pathways, where worship is only one option among several inside a shared 'Practices in Ministry' block a student could fill without it. The obvious course to satisfy it is WOR610 ('Vital Worship in the 21st Century for United Methodists'), whose own catalog description says it is 'Designed for United Methodist Church Basic Graduate Theological Studies' — though the pathway's requirement itself is satisfied by any WOR course, not WOR610 specifically.",
        },
        {
          area: "preaching",
          status: "elective",
          note: "No pathway at Drew guarantees a preaching course, including United Methodist Ministry. Its 'Practices in Ministry (9 credits)' block requires three different categories chosen from Preaching (PREA), Pastoral Care and Counseling, Religious Education, and Professional Ethics — a student can complete it entirely on the other three and never take a PREA course. The same is true of the Ministerial Leadership pathway's equivalent block. This is a real gap, not a naming omission: nothing in Drew's own materials states an obligation the way it does for evangelism and worship above.",
        },
        {
          area: "um-studies",
          status: "required-umc-track",
          note: "The core of the United Methodist Ministry pathway's required 'United Methodist Studies (10 credits)' block: WESM610 ('United Methodist Doctrine Polity,' 3 credits) and WESM630 ('United Methodist Book of Discipline,' 1 credit) between them clear ¶324.4's 6-semester-hour UM-studies floor on their own, before WESM600's history component is even counted. No substitute or 'or approved elective' clause is offered for any of the four WESM courses in this block — they are named by code, the way Duke names PARISH 777/778.",
        },
      ],
      gapSummary: [
        "Eight of the nine ¶324.4 areas bind a United Methodist student who takes Drew's United Methodist Ministry vocational pathway — the pathway Drew's own admissions materials say 'meets the educational requirements for ordination as an Elder or Deacon in the United Methodist Church.'",
        "The one area no Drew pathway guarantees, for any student regardless of denomination, is preaching: every pathway's shared 'Practices in Ministry' block treats Preaching (PREA) as one option among several rather than naming it outright, so a student can graduate having never taken a preaching course.",
      ],
      gapRemedies: [
        {
          blurb: "In the United Methodist Ministry pathway's 'Practices in Ministry (9 credits)' block, spend one of the three required category-choices on a PREA course rather than defaulting to Pastoral Care and Counseling, Religious Education, or Professional Ethics — nothing about the pathway rules that choice out, it simply isn't made for you.",
          url: MDIV_CATALOG_URL,
        },
        {
          blurb: "Confirm with your conference's Board of Ordained Ministry registrar whether they expect a dedicated preaching course specifically, or accept Drew's broader homiletics-adjacent electives — the catalog names the PREA course family but does not itself state a preaching-specific graduation requirement the way it does for evangelism and worship above.",
          url: "https://drew-theo-catalog.coursedog.com/",
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "349 students (282.80 FTE)",
        source: "https://www.ats.edu/member-schools/drew-university-theological-school",
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report for the whole school, not MDiv only. ATS also reports 23 full-time faculty (23.00 FTE) for the same period — roughly 12 students per faculty FTE, though Drew does not publish that ratio itself.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$840 per credit hour (Theological School programs: DMin, MDiv, MAR, STM, MATM)",
        source: "https://drew.edu/admissions-and-aid/student-financial-services/student-accounts/tuition-and-fees-schedules/",
        asOf: capturedAt,
        note: "2026–2027 rate. 78 credit hours (the MDiv total) × this rate is roughly $65,520 in gross MDiv tuition before aid. Separate per-term fees apply: a $600 Continuous Registration fee, a $500 General Fee, and (international students only) a $75 administrative fee.",
      },
      fees: [
        { label: "Continuous Registration Fee", amount: "$600 per term" },
        { label: "General Fee", amount: "$500 per term" },
        { label: "International Student Administrative Fee", amount: "$75 per term (international students only)" },
      ],
      typicalAward: {
        value: "United Methodist Initiative: at least 100% tuition for United Methodist applicants to the MDiv who earned at least a 3.2 undergraduate GPA",
        source: "https://drew.edu/admissions-and-aid/graduate-admissions/graduate-tuition/",
        asOf: capturedAt,
        note: "Drew's own wording: 'United Methodist applicants to the Theological School's Master of Divinity degree, who have achieved at least a 3.2 GPA while earning their undergraduate degree, receive a scholarship of at least 100% tuition.' No candidacy-certification requirement is stated — the GPA threshold is the only condition named on this page.",
      },
      namedScholarships: [
        {
          name: "United Methodist Initiative",
          blurb: "At least 100% tuition for any United Methodist MDiv applicant with a 3.2+ undergraduate GPA — no certified-candidate status required by Drew's own published wording, which makes it broader than Candler's candidacy-gated full-tuition policy or Duke's geographically-narrow Rural Ministry Fellowships. Confirm with Admissions whether 'at least 100%' ever exceeds tuition into a living stipend, or is capped at tuition itself; the page's phrasing leaves that open.",
          url: "https://drew.edu/admissions-and-aid/graduate-admissions/graduate-tuition/",
        },
        {
          name: "Sampson-McCann Scholarship",
          blurb: "Set aside specifically for non-United Methodist Theological School applicants engaged in social justice work in urban environments — the counterpart award for the students the United Methodist Initiative doesn't reach.",
          url: "https://drew.edu/admissions-and-aid/graduate-admissions/graduate-tuition/",
        },
        {
          name: "Tipple Scholarship",
          blurb: "Drew's own description: 'The highest scholarship awarded by the Theological School,' for the most exemplary applicant on academic ability and gifts for ministry — not United Methodist-specific.",
          url: "https://drew.edu/admissions-and-aid/graduate-admissions/graduate-tuition/",
        },
      ],
      honestNote: "The United Methodist Initiative's 'at least 100% tuition' for any 3.2-GPA UM applicant is, on paper, the most generous and least conditional UMC-specific award found across this project's schools so far — it names no candidacy certification, no conference residency, no geography. That is also exactly why it is worth confirming directly with Drew's Office of Graduate Admissions rather than budgeting against the web copy alone: the page does not say how the award is renewed year to year, whether it can be reduced if the GPA condition was borderline, or how 'at least' 100% is decided above the floor.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "MDiv",
        credits: 78,
        typicalYears: "2.5–3 years full-time; part-time over 4 years",
        modalities: ["residential", "hybrid", "online"],
        blurb: "78 credits: an integrated six-course common curriculum, a year-long vocational internship and leadership seminar, a mentored portfolio, an immersive intercultural experience, unrestricted electives, and one of four vocational pathways (Ministerial Leadership, United Methodist Ministry, Social Justice Advocacy, or Chaplaincy) that supplies most of the testament- and practice-specific coursework.",
        url: "https://drew-theo-catalog.coursedog.com/programs/8pdhNS30m326vL755QMH",
      },
      {
        name: "Master of Arts in Theology and Ministry",
        abbr: "MATM",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an ordination degree on its own — for lay ministry, nonprofit, and vocational-formation paths that don't require the full MDiv.",
        url: "https://drew.edu/academics/theology-and-ministry-matm/",
      },
      {
        name: "Doctor of Ministry",
        abbr: "DMin",
        modalities: ["hybrid"],
        blurb: "For MDiv holders with ministry experience; Drew states no merit-based scholarships are offered for this degree specifically.",
        url: "https://drew.edu/academics/ministry-dmin/",
      },
    ],

    concentrations: [
      "Ministerial Leadership (vocational pathway)",
      "United Methodist Ministry (vocational pathway)",
      "Social Justice Advocacy (vocational pathway)",
      "Chaplaincy (vocational pathway)",
      "Africana and African American Religion",
      "Religion and Ecology",
      "Religion and Social Justice",
      "Women's and Gender Studies",
      "Conflict Resolution",
    ],

    partnerships: [
      {
        kind: "host-university",
        partner: "Drew University",
        blurb: "The Theological School sits on Drew University's Madison, NJ campus alongside the College of Liberal Arts and the Caspersen School of Graduate Studies; MDiv electives may be drawn from Caspersen offerings with advisor approval.",
        url: "https://drew.edu/theological-school/",
      },
    ],

    facultyNote: "Limited to the 25 people on Drew's faculty directory page listed ahead of its explicit 'Emeriti Faculty' heading — the page's own implicit cut for current, active, full-time faculty; adjunct/affiliate faculty are listed separately below the emeriti section and excluded here on the same basis Duke and Saint Paul used for their own adjunct/emeritus exclusions. Drew publishes no individual per-professor pages — each entry links a dated CV PDF instead, which this harvest did not parse for publications; `workingOn` and `publications` are accordingly absent here across the board rather than partially filled from a sample of CVs.",

    contact: {
      admissionsUrl: "https://drew.edu/theological-school/",
      phone: "973-408-3111",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
