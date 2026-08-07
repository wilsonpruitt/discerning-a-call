// Gammon Theological Seminary — one of the 13 UMC schools of theology, and the
// only historically Black theological institution (HBTI) of the United
// Methodist Church.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//
//   - THE ITC RELATIONSHIP IS RECENT HISTORY, NOT A STANDING FACT — read this
//     before trusting any older source about Gammon. From 1958 until 2023,
//     Gammon operated as the United Methodist constituent of the
//     Interdenominational Theological Center (ITC), a consortium of
//     historically Black seminaries in Atlanta's University Center; ITC held
//     the degree-granting accreditation and conferred Gammon's M.Div. In
//     April 2023, ITC declared financial exigency (UMNews, umnews.org/en/news
//     /gammon-builds-on-legacy-as-it-looks-forward). Gammon chose to leave
//     rather than go down with it, relaunched as an independent institution in
//     2024 with about seven students, and hired Renita Weems as Chief Academic
//     Officer to rebuild the faculty and curriculum from near scratch. In June
//     2026 — one month before this harvest — Gammon secured its OWN
//     accreditation from SACSCOC and was approved as an Associate Member of
//     ATS (SaportaReport, 2026-07-31: "Gammon received independent
//     accreditation from the Southern Association of Colleges and Schools
//     Commission on Colleges and was approved as an associate member of The
//     Association of Theological Schools"). Full ATS accreditation — the step
//     that would let Gammon's own M.Div. carry ATS's seal without reference to
//     ITC — is still pending a 2026 self-study and peer review; Gammon's own
//     accreditation page says as much (thegammonseminary.org/accreditation).
//     So: the task brief's assumption that this profile would be built from
//     "ITC's shared bulletin" turned out to be exactly backwards for where
//     Gammon stands as of this harvest. Gammon's own site (thegammonseminary
//     .org, not itc.edu, and not gammon-itc.org — the old domain now 301s to
//     the new one) states its OWN 72-credit M.Div. requirements, in its own
//     words, on its own Academics and Admissions pages. There is no joint ITC
//     bulletin to defer to any more. GBHEM's own profile page for Gammon
//     (fetched for this harvest, captured 2026-06-28 per its own footer) has
//     NOT caught up: it still writes "Gammon at ITC is a co-educational,
//     professional graduate school of theology" in the present tense, and
//     lists gammon-itc.org as Gammon's website — both stale. Reported as
//     GBHEM states it, in the senateStanding note, rather than silently
//     corrected — but do not repeat GBHEM's "Gammon at ITC" framing as if it
//     were still Gammon's operating structure; it was, and stopped being, in
//     2023–2024.
//
//   - THE COVERAGE TABLE IS DELIBERATELY OMITTED — Brite's precedent, not
//     Duke's or Saint Paul's. Gammon's own Academics/Admissions pages state
//     one clear, binding fact: "Each candidate in the Master of Divinity,
//     M.Div. program is required to complete 72 credit hours. Students
//     intending to seek ordination in the United Methodist church must
//     complete 24 of those 72 credit hours from Religious Heritage courses
//     offered at GTS and outlined in The Book of Discipline of the United
//     Methodist Church (2016)." That is a real, sourced, binding obligation —
//     but it names no course numbers and gives no area-by-area breakdown of
//     which of the nine ¶324.4 areas the 24 "Religious Heritage" hours cover,
//     unlike Duke's PARISH 777/778 or Saint Paul's numbered curricular table.
//     A newly independent seminary, one month past its own accreditation,
//     with a nine-person faculty built up from scratch since 2024, plausibly
//     has not yet published that level of catalog detail — a Spring 2025
//     course-schedule flyer found in the old gammon-itc.org archive
//     (CourseScheduleGTS_Laughinghouse_1.8.2024-1.pdf) names real courses
//     ("New Testament," "Wesleyan Theology," "History of the Black Church")
//     taught by instructors who are no longer on the current 9-person faculty
//     roster, which makes it useful only as background evidence that a real
//     curriculum exists, not as a citable current source for a per-area
//     table. Per README §2, "a school's own ¶324.4 mapping is a lead, never
//     the evidence" — here there isn't even a lead granular enough to build
//     nine defensible rows from. Building one anyway from the four vague
//     subject clusters named on the Academics page ("biblical studies and
//     languages," "philosophy, theology, ethics, and history," etc.) would be
//     exactly the "partial table reads as a complete one" mistake the README
//     warns against — so, matching Brite, this profile ships gapSummary and
//     gapRemedies but no coverage array. Re-check for a published curriculum
//     map at the next cadence; a newly independent school's catalog detail is
//     the most likely thing here to change term over term.
//
//   - THE SITE ITSELF DISAGREES ON ITS OWN TUITION FIGURE. The Admissions page
//     states "$695 per credit hour" in its "Course Details" section and "$690
//     per credit hour" two sections later in its own FAQ — same page, same
//     fetch, $5 apart. Reported as both, flagged, the same honest-arithmetic
//     move Saint Paul's and Phillips' harvests made for their own internal
//     contradictions (see README §2).
//
//   - NO PER-PROFESSOR PAGES. Gammon's faculty page (a Wix site) lists all
//     nine current full-time faculty with title, a short bio blurb, and a
//     "Contact" button that opens a contact form, not a dedicated bio URL —
//     closer to Perkins' and Austin's pattern than Duke's or Saint Paul's.
//     Degrees are stated in-line in bio prose for some (Weems' Princeton
//     Ph.D., Ward's UCLA Ph.D.) and absent for others; where Gammon's own bio
//     said nothing, degrees below are drawn from each person's own published
//     CV/bio elsewhere (their seminary alma mater's site, their own personal
//     site, or LinkedIn) and cited per-person in ROSTER comments, never from
//     background knowledge. Two roster entries (Buhuro, Grafenreed) are
//     currently pursuing doctorates not yet conferred (a Ph.D. at time of
//     writing for both) — left out of `degrees` entirely rather than listed,
//     since a candidacy is not a degree and the honorary-doctorate rule this
//     project already enforces exists for exactly this kind of
//     training-vs-credential precision.
//
// Run: node scripts/harvest/gammon.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://www.thegammonseminary.org";
const ACADEMICS_URL = `${BASE}/academics`;
const ADMISSIONS_URL = `${BASE}/admissions`;
const FACULTY_URL = `${BASE}/faculty`;
const FINAID_URL = `${BASE}/financial-aid`;
const ACCREDITATION_URL = `${BASE}/accreditation`;
const GBHEM_URL = "https://www.gbhem.org/education/schools-of-theology/gammon-theological-seminary/";

interface Entry {
  name: string;
  title: string;
  otherRoles: string[];
  areas: StudyArea[];
  degrees?: string[];
  publications?: { title: string; kind: "book" | "edited-volume" | "article" | "chapter"; year?: number }[];
}

// All nine appear on Gammon's own faculty page (thegammonseminary.org/faculty)
// with no individual profileUrl — every roster entry below points back to
// that one shared page, per the "no per-professor pages" note above.
const ROSTER: Entry[] = [
  {
    name: "Renita J. Weems",
    title: "Professor of Biblical Studies",
    otherRoles: ["Chief Academic Officer & Dean"],
    areas: ["hebrew-bible", "womanist-feminist-theology"],
    // Ph.D. stated on Gammon's own faculty page: "the first African American
    // woman to earn a Ph.D. in Old Testament Studies from Princeton
    // Theological Seminary."
    degrees: ["Ph.D. in Old Testament Studies, Princeton Theological Seminary"],
    publications: [
      { title: "What Matters Most: Ten Lessons in Living Passionately from the Song of Solomon (Walk Worthy Press, 2004)", kind: "book", year: 2004 },
      { title: "Battered Love: Marriage, Sex, and Violence in the Hebrew Prophets (Fortress Press, 1995)", kind: "book", year: 1995 },
      { title: "Just a Sister Away: A Womanist Vision of Women's Relationships in the Bible (LuraMedia, 1988)", kind: "book", year: 1988 },
    ],
  },
  {
    name: "Candace M. Lewis",
    title: "Professor in Wesleyan Studies",
    otherRoles: ["President & Chief Executive Officer"],
    areas: ["wesleyan-studies", "congregational-leadership"],
    // Degrees not stated on the faculty page's own bio; drawn from ITC's
    // welcome article for her appointment (itc.edu/dr-candace-m-lewis/) and
    // NGUMC's announcement of her Gammon presidency.
    degrees: [
      "D.Min. in Church Leadership Excellence, Wesley Theological Seminary (2014)",
      "M.Div., Gammon Theological Seminary – ITC (1996)",
      "B.A., University of Florida",
    ],
  },
  {
    name: "Danielle J. Buhuro",
    title: "Assistant Professor of Pastoral Theology",
    otherRoles: [],
    areas: ["pastoral-care-counseling", "chaplaincy"],
    // Ph.D. in progress (social media identity, violence, and pastoral
    // theology) per her own Sankofa CPE Center bio (sankofacpe.org/drbuhuro) —
    // not yet conferred, so left out of `degrees` rather than listed as if
    // earned.
    degrees: [
      "D.Min., Chicago Theological Seminary",
      "M.Div., Chicago Theological Seminary",
    ],
  },
  {
    name: "Monica Isabel Rey",
    title: "Assistant Professor of Biblical Studies",
    otherRoles: [],
    // Gammon's own bio: "cultural identity, migration, and contextual
    // readings of scripture," teaching/research experience in Latin America.
    areas: ["hebrew-bible", "latino-hispanic-ministry"],
    // Dissertation "Captive: Gendering Genocide in the Hebrew Bible," defended
    // December 2023 at Boston University, per her own Feminist Studies in
    // Religion contributor bio (fsrinc.org/amo-team/monica-rey-babson-college).
    degrees: ["Ph.D. in Hebrew Bible, Boston University (2023)"],
  },
  {
    name: "C. Anthony Hunt",
    title: "Professor of Practice, Black Church & Wesleyan Studies",
    otherRoles: ["Ordained Elder, The United Methodist Church"],
    areas: ["black-church-studies", "wesleyan-studies"],
    // Degree per his own site (canthonyhunt.com) and his Graduate Theological
    // Foundation faculty page.
    degrees: [
      "Ph.D. in Theological Studies (Philosophical Theology and Ethics), Graduate Theological Foundation, in affiliation with the University of Oxford",
    ],
  },
  {
    name: "Candace M. Laughinghouse",
    title: "Assistant Professor of Theology & Ethics",
    otherRoles: [],
    areas: ["ethics-public-theology", "womanist-feminist-theology"],
    // Degrees per her own site (drlaughinghouse.com) and Chicago Theological
    // Seminary's PhD Students page; dissertation "Nobody's Free Until
    // Everybody's Free: Expanding Coalition Politics Through Anti-Speciest
    // Ecowomanism" (2023).
    degrees: [
      "Ph.D. in Theological Ethics, Chicago Theological Seminary (2023)",
      "Th.M., Duke Divinity School",
      "M.Div., Candler School of Theology, Emory University (Black Church Studies certificate)",
    ],
  },
  {
    name: "Stephen Ward",
    title: "Lecturer in Biblical Studies and Academic Support",
    otherRoles: [],
    areas: ["hebrew-bible", "black-church-studies"],
    // Ph.D. stated on Gammon's own faculty page: "Trained at UCLA with a
    // Ph.D. in Near Eastern Languages and Cultures."
    degrees: ["Ph.D. in Near Eastern Languages and Cultures, UCLA"],
  },
  {
    name: "Mark Grafenreed",
    title: "Assistant Professor of Religious Heritage & Wesleyan/United Methodist Studies",
    otherRoles: [
      "Coordinator of Wesleyan Studies and UMC Ministerial Formation",
      "Ordained Elder in Full Connection, Texas Annual Conference",
      "Licensed Texas attorney",
    ],
    areas: ["wesleyan-studies", "church-history"],
    // Currently a Ph.D. candidate in Religion and Culture at SMU (per SMU's
    // own graduate-student page) — not yet conferred, left out of `degrees`.
    degrees: [
      "M.Div., summa cum laude, Perkins School of Theology, Southern Methodist University (2018)",
      "J.D., magna cum laude, Thurgood Marshall School of Law, Texas Southern University",
      "B.A. in History, Southern Methodist University (1998)",
    ],
  },
  {
    name: "Sakena Young-Scaggs",
    title: "Associate Professor of Contextual Theology and Director of Contextual Education",
    otherRoles: [],
    areas: ["practical-theology", "womanist-feminist-theology", "black-church-studies"],
    // Degree per her own LinkedIn (linkedin.com/in/revdrsys) and her
    // dissertation record; dissertation "Afrofuturism, Womanist
    // Phenomenology, and the Black Imagination: A Liberative Revisioning of
    // Black Humanity" (2019).
    degrees: ["Ph.D. in Women and Gender Studies, Arizona State University (2019)"],
  },
];

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildFaculty(): FacultyMember[] {
  return ROSTER.map((e) => {
    const member: FacultyMember = {
      id: `gammon-${slugifyName(e.name.split(" ").slice(-1)[0])}`,
      seminarySlug: "gammon",
      name: e.name,
      title: e.title,
      areas: e.areas,
      profileUrl: FACULTY_URL,
    };
    if (e.otherRoles.length) member.otherRoles = e.otherRoles;
    if (e.degrees?.length) member.degrees = e.degrees;
    if (e.publications?.length) {
      member.publications = e.publications.slice(0, 5);
      member.publicationsSource = "https://en.wikipedia.org/wiki/Renita_J._Weems";
      member.publicationsAsOf = today();
    }
    return member;
  });
}

async function main() {
  // Touch the pages this profile is built from, so they land in the fetch
  // cache alongside this run even though the JSON below is hand-assembled
  // from the prose (per Duke's and Saint Paul's precedent — the ¶324.4
  // judgment call here especially needs a careful human read, not a
  // mechanical parse).
  await get(ACADEMICS_URL, { fresh });
  await get(ADMISSIONS_URL, { fresh });
  await get(FACULTY_URL, { fresh });
  await get(FINAID_URL, { fresh });
  await get(ACCREDITATION_URL, { fresh });
  await get(GBHEM_URL, { fresh });

  const faculty = buildFaculty();
  await writeFile(join(ROOT, "data/faculty/gammon.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/gammon.json`);

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/gammon.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/gammon.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "gammon",
    name: "Gammon Theological Seminary",
    city: "Atlanta",
    state: "GA",
    url: "https://www.thegammonseminary.org/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-08-06",
        note: 'One of the 13 United Methodist schools of theology, and the only Historically Black Theological Institution (HBTI) of the UMC — Gammon\'s own words, on its Academics page. This University Senate standing is a separate approval track from ATS accreditation (see onlineCredit note): GBHEM\'s own Gammon profile page, captured 2026-06-28, still describes the school in the present tense as operating "in partnership with The Interdenominational Theological Center" and lists gammon-itc.org (a domain that now redirects to thegammonseminary.org) as its website. That framing is out of date. Gammon was ITC\'s United Methodist member school and had its degrees accredited through ITC from 1958 until ITC declared financial exigency in April 2023; Gammon relaunched as an independent institution in 2024, and in June 2026 secured its own accreditation from the Southern Association of Colleges and Schools Commission on Colleges (SACSCOC) plus Associate Membership in the Association of Theological Schools (ATS) — full ATS accreditation is still pending a 2026 self-study and peer review (thegammonseminary.org/accreditation). None of that affects the University Senate standing recorded here, which GBHEM continues to list Gammon under regardless of the ATS transition.',
      },
      onlineCredit: {
        value: "fully-counts",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-08-06",
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. Gammon's own Admissions FAQ independently confirms its M.Div. is offered in \"hybrid, online, and in-person intensive weeks\" formats.",
      },
      gapSummary: [
        "Gammon states one clear, binding rule for United Methodist ordination candidates, in its own words: \"Students intending to seek ordination in the United Methodist church must complete 24 of those 72 [M.Div.] credit hours from Religious Heritage courses offered at GTS and outlined in The Book of Discipline of the United Methodist Church.\" That is real and binding — a UMC candidate cannot graduate without it — but Gammon does not publish, on any page found for this profile, which of ¶324.4's nine areas those 24 \"Religious Heritage\" hours map to, or which specific courses carry which area.",
        "This profile does not show a nine-area coverage table because there is no course-level breakdown to build one from honestly; showing a guessed table would read as more certain than the evidence supports. Gammon is one month past its own independent accreditation as of this writing, rebuilding a nine-person faculty largely hired since 2024 — a published curriculum map naming specific courses against specific requirements may simply not exist yet where an established school's does.",
        "Ask the Registrar for the current Religious Heritage course list and how it maps to old Testament, New Testament, theology, church history, mission, evangelism, worship, preaching, and UM studies specifically, and get the answer in writing before you register — then confirm the same list with your conference's Board of Ordained Ministry.",
      ],
      gapRemedies: [
        {
          blurb: "Email the Office of the Registrar (registrar@thegammonseminary.org) and ask for the specific course list that fulfills the 24-credit-hour Religious Heritage requirement, broken out by ¶324.4 area. Gammon names the office as the point of contact for \"course registration, academic records, and degree completion requirements.\"",
          url: "https://www.thegammonseminary.org/academics",
        },
        {
          blurb: "Ask specifically about Dr. Mark Grafenreed's role as Coordinator of Wesleyan Studies and UMC Ministerial Formation — he is Gammon's named point person for how the Religious Heritage sequence is built, and is himself an ordained UMC elder.",
          url: "https://www.thegammonseminary.org/faculty",
        },
        {
          blurb: "Confirm the Religious Heritage course list with your conference's Board of Ordained Ministry registrar before you rely on it for your ordination file — Gammon states the requirement comes from the Book of Discipline, but your board decides what satisfies your particular file.",
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "About 20 students in Fall 2024–2025, growing to an expected ~75 students for Fall 2026",
        source:
          "https://saportareport.com/gammon-theological-seminarys-new-chapter-prepares-leaders-for-todays-world/columnists/adrianne-murchison/",
        asOf: "2026-07-31",
        note: "Gammon relaunched as an independent institution in 2024 with about seven students; UMNews (umnews.org, reporting on the relaunch) put fall enrollment at about 20 the following year, and SaportaReport's July 31, 2026 report — the most recent figure found — puts expected Fall 2026 enrollment at about 75, with a stated five-year goal of 200–250. Gammon is not yet a full ATS member (Associate Member only, self-study underway as of this harvest), so it has no ATS Fall 2025 Standard Data Form to cite the way this project's other UMC-school profiles do — this figure comes from local press covering the school's own public statements, not from an ATS filing.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$695 per credit hour (as stated in the Admissions page's \"Course Details\" section) — the same page's own FAQ states $690 per credit hour two sections later",
        source: "https://www.thegammonseminary.org/admissions",
        asOf: capturedAt,
        note: "Gammon's Admissions page disagrees with itself by $5 per credit hour between its \"Course Details\" callout and its FAQ answer to \"What are Gammon Tuition & Fees?\" — both fetched from the same page on the same date. Reported as both rather than silently picking one; confirm the current rate with the Financial Aid office before budgeting. At 72 credit hours, the gap between the two figures is $360 total.",
      },
      typicalAward: {
        value: "Gammon Presidential Excellence Award: full first-year tuition (fall, spring, and summer semesters), contingent on maintaining a 3.0 cumulative GPA through the first year",
        source: "https://www.thegammonseminary.org/financial-aid",
        asOf: capturedAt,
        note: "Gammon's own Office of Financial Aid page states the institution does not participate in federal financial aid programs (no FAFSA-based aid) and relies entirely on its own institutional aid, awarded through Populi.",
      },
      namedScholarships: [
        {
          name: "Gammon Presidential Excellence Award",
          blurb: "A full-tuition scholarship covering a new student's first year (fall, spring, and summer), contingent on maintaining a 3.0 cumulative GPA.",
          url: "https://www.thegammonseminary.org/financial-aid",
        },
        {
          name: "Gammon Tuition Reduction Award",
          blurb: "Directly lowers tuition cost; Gammon states eligibility and award amounts vary and directs students to the financial aid office for specifics.",
          url: "https://www.thegammonseminary.org/financial-aid",
        },
        {
          name: "Gammon Academic Gift Award",
          blurb: "A direct monetary gift toward tuition and fees, based on academic excellence, financial need, or specific accomplishment.",
          url: "https://www.thegammonseminary.org/financial-aid",
        },
      ],
      honestNote:
        "Gammon does not participate in federal financial aid — no FAFSA-based grants or loans — so every dollar of aid here is institutional, church-based, or third-party (its Financial Aid Resource Guide points students toward denominational scholarships, GBHEM support for UMC candidates specifically, and the Fund for Theological Education). The seminary also announced a $975,000 grant from GBHEM around the time of its June 2026 accreditation (SaportaReport, 2026-07-31) — a real and recent infusion, but institutional funding for the school, not a named scholarship a candidate applies for directly; ask the Financial Aid office whether or how it affects individual awards.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "MDiv",
        credits: 72,
        typicalYears: "3 years full-time at 12 credit hours per semester",
        modalities: ["hybrid", "online"],
        blurb:
          "72 credit hours across four broad areas Gammon names on its Academics page — biblical studies and languages; philosophy, theology, ethics, and history; persons, society, and culture; and the Church and its mission — with three named specializations (Leadership & Ethics, Womanist Theological Perspective, Social Justice & Advocacy). United Methodist ordination candidates must complete 24 of the 72 credit hours in Religious Heritage courses \"outlined in The Book of Discipline.\" Delivered hybrid and online, with an in-person MDiv Intensive each semester on Gammon's Atlanta campus.",
        url: "https://www.thegammonseminary.org/academics",
      },
    ],

    concentrations: [
      "Leadership & Ethics",
      "Womanist Theological Perspective",
      "Social Justice & Advocacy",
    ],

    partnerships: [
      {
        kind: "consortium",
        partner: "Interdenominational Theological Center (ITC)",
        blurb:
          "Historical, not current, structure — worth naming precisely because most public descriptions of Gammon (including GBHEM's own profile page) haven't caught up. Gammon was the United Methodist member of ITC's consortium of historically Black seminaries and had its M.Div. accredited through ITC from 1958 until ITC declared financial exigency in April 2023. Gammon relaunched as an independent institution in 2024 and secured its own SACSCOC accreditation and ATS Associate Membership in June 2026. Gammon's own site makes no current claim of cross-registration, shared faculty, or shared library access with ITC post-independence; none is asserted here either, for the same reason no coverage table is shown — the evidence for the current, day-to-day relationship (if any remains) is not published.",
        url: "https://www.umnews.org/en/news/gammon-builds-on-legacy-as-it-looks-forward",
      },
    ],

    facultyNote:
      "All nine of Gammon's current full-time faculty, from the school's own Faculty page — a small roster built up almost entirely since the 2024 relaunch (only Renita Weems' 2024 hire as Chief Academic Officer is independently dated in press coverage; the rest are undated on Gammon's site). Gammon publishes no individual per-professor bio pages; every entry above links back to the single shared faculty page. Degrees are drawn from each person's own bio where Gammon's page states one (Weems, Ward); everywhere else, from that person's own CV, personal site, or institutional bio elsewhere, cited per-person in the harvest script's source comments — never from background knowledge. Two faculty (Danielle Buhuro, Mark Grafenreed) are currently pursuing doctorates not yet conferred; those are named in their own bios but deliberately left out of the `degrees` field here, since a Ph.D. candidacy is not a Ph.D.",

    contact: {
      admissionsUrl: "https://www.thegammonseminary.org/admissions",
      email: "communications@thegammonseminary.org",
      phone: "(404) 581-0300",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
