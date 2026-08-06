// Duke University Divinity School — one of the 13 UMC schools of theology.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//   - Duke's degree-requirements page (the Divinity School Bulletin, a
//     Coursedog-style site) states its MDiv core courses AND its UMC-specific
//     ordination requirements in plain prose, with exact course codes. No PDF,
//     no JS wall — just fetch + htmlToText. The rarity here is that Duke names
//     PARISH 777/778 (Methodist doctrine, history, polity), LTS 730 (worship),
//     and named "Mission or Evangelism" elective slots as a *recommended
//     curricular paradigm specifically for United Methodist students* — more
//     structure than Perkins or Candler give the same requirement, even though
//     it is still elective space, not the universal 24-course core.
//   - Duke's faculty directory is server-rendered HTML (Drupal Views), with a
//     "Regular Rank Faculty" filter (field_faculty_category_target_id=68) that
//     does the "core full-time faculty only" cut for us. Each card carries a
//     clean name/title pair; each person also gets a real per-professor page
//     (some at /faculty/<slug>, a few at /people/<slug> — Natalie Carnes was
//     the one exception found here) with a "Degrees" list and, inconsistently,
//     a "Selected Publications" section. Duke is the first school in this
//     harvest with real per-professor pages — Perkins has none.
//
// Run: node scripts/harvest/duke.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { htmlToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://divinity.duke.edu";
const BULLETIN_MDIV_URL = "https://divinity.bulletins.duke.edu/allprograms/masters/d-div-mdv";

interface DirectoryEntry {
  name: string;
  title: string;
  otherRoles: string[];
  profileUrl: string;
}

// Split "Main Title; Directorship; Another Role" the way the Perkins/Brite
// data does: first clause is `title`, the rest are `otherRoles`.
function splitTitle(raw: string): { title: string; otherRoles: string[] } {
  const parts = raw
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  return { title: parts[0] ?? raw.trim(), otherRoles: parts.slice(1) };
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function fetchDirectoryPage(page: number): Promise<DirectoryEntry[]> {
  const url = `${BASE}/faculty/directory?field_faculty_category_target_id=68&page=${page}`;
  const { body } = await get(url, { fresh });
  const entries: DirectoryEntry[] = [];
  // Match the name+title pair directly rather than trying to delimit a whole
  // "card" block: the card markup nests several <div>s before card-title and
  // card-text, so a naive "first </div></div>" end-of-card pattern closes
  // over the card-title div's own </div> and never reaches card-text's —
  // every title came back empty until this was rewritten to anchor on the
  // two divs that actually matter.
  const re =
    /<div class="card-title">\s*<a href="(\/(?:faculty|people)\/[a-z0-9-]+)">([^<]+)<\/a>\s*<\/div>\s*<div class="card-text">([^<]*)<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const name = htmlToText(m[2]).trim();
    const rawTitle = htmlToText(m[3]).trim();
    const { title, otherRoles } = splitTitle(rawTitle);
    entries.push({
      name,
      title,
      otherRoles,
      profileUrl: new URL(m[1], BASE).toString(),
    });
  }
  return entries;
}

interface ProfileDetail {
  degrees: string[];
  honoraryDegrees: string[];
  publications: { title: string; kind: "book" | "article"; year?: number }[];
  bioSnippet: string;
}

function parseProfilePage(text: string): ProfileDetail {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const degrees: string[] = [];
  const honoraryDegrees: string[] = [];
  {
    const start = lines.findIndex((l) => l === "Degrees");
    // Degree lines are short ("Ph.D., Duke University"); a bio paragraph is
    // not. Some profiles (e.g. Kate Bowler's) never print a "Contact"
    // heading at all, so without a length cap the loop ran straight into her
    // entire bio, In the Media list, and news items — this is the safety
    // valve that stops it there instead.
    const isDegreeLike = (l: string) => l.length <= 90 && !/[.!?]$/.test(l);
    if (start >= 0) {
      let i = start + 1;
      while (i < lines.length && lines[i] !== "Contact" && lines[i] !== "Honorary Degrees" && isDegreeLike(lines[i])) {
        degrees.push(lines[i]);
        i++;
      }
      if (lines[i] === "Honorary Degrees") {
        i++;
        while (i < lines.length && lines[i] !== "Contact" && isDegreeLike(lines[i])) {
          honoraryDegrees.push(lines[i]);
          i++;
        }
      }
    }
  }

  // Bio: the first prose paragraph after the Degrees/Contact block, before
  // any "Recent Books" / "Links" / "In the Media" widget. Long lines only —
  // nav crumbs and office addresses are short.
  let bioSnippet = "";
  {
    const contactIdx = lines.findIndex((l) => l === "Contact");
    const searchFrom = contactIdx >= 0 ? contactIdx + 1 : 0;
    for (let i = searchFrom; i < Math.min(lines.length, searchFrom + 8); i++) {
      if (lines[i].length > 120) {
        bioSnippet = lines.slice(i, i + 2).join(" ");
        break;
      }
    }
  }

  // Selected Publications → Books subsection, when present. Conservative
  // filter: keep a line only if it is a clean, single citation — short
  // enough and ending right at a year, not trailing off into an annotation
  // sentence (the Ellen Davis "Art of Reading Scripture" trap).
  const publications: { title: string; kind: "book" | "article"; year?: number }[] = [];
  {
    const spIdx = lines.findIndex((l) => l === "Selected Publications");
    if (spIdx >= 0) {
      const stopHeadings = new Set([
        "Recent Courses", "In the Media", "News and Stories", "Recent Books",
        "Upcoming Events", "Recent Publications on Scholars@Duke", "Links",
      ]);
      let section: "book" | "article" | null = null;
      for (let i = spIdx + 1; i < lines.length; i++) {
        const l = lines[i];
        if (stopHeadings.has(l)) break;
        if (l === "Books") { section = "book"; continue; }
        if (l === "Articles" || l === "Chapters" || l === "Edited Volumes") {
          section = "article"; // "Books" is already handled and continued above
          continue;
        }
        if (!section) continue;
        if (publications.length >= 5) break;
        const yearMatch = /\b(19|20)\d{2}\b\)?\.?\s*$/.exec(l);
        if (l.length <= 200 && yearMatch) {
          const y = /\b((19|20)\d{2})\b/.exec(l);
          publications.push({ title: l, kind: section, year: y ? Number(y[1]) : undefined });
        }
      }
    }
  }

  return { degrees, honoraryDegrees, publications: publications.slice(0, 5), bioSnippet };
}

async function buildFaculty(): Promise<FacultyMember[]> {
  const dirEntries: DirectoryEntry[] = [];
  for (const page of [0, 1, 2]) {
    dirEntries.push(...(await fetchDirectoryPage(page)));
  }

  const roster: FacultyMember[] = [];
  for (const entry of dirEntries) {
    const { body } = await get(entry.profileUrl, { fresh });
    const text = htmlToText(body);
    const detail = parseProfilePage(text);

    const signalText = [entry.title, ...entry.otherRoles, detail.bioSnippet].join(" · ");
    let areas = suggestAreas(signalText);
    if (areas.length === 0) areas = MANUAL_AREA_FALLBACK[entry.name] ?? [];

    const id = `duke-${slugifyName(entry.name.replace(/\./g, ""))}`;

    const member: FacultyMember = {
      id,
      seminarySlug: "duke",
      name: entry.name,
      title: entry.title,
      areas,
      profileUrl: entry.profileUrl,
    };
    if (entry.otherRoles.length) member.otherRoles = entry.otherRoles;
    // Combine earned + honorary, but never let honorary stand alone (validator rule).
    const earned = detail.degrees;
    if (earned.length || detail.honoraryDegrees.length) {
      member.degrees = [...earned, ...detail.honoraryDegrees.map((d) => `${d} (honorary)`)];
    }
    if (detail.publications.length) {
      member.publications = detail.publications.map((p) => ({ title: p.title, kind: p.kind, year: p.year }));
      member.publicationsSource = entry.profileUrl;
      member.publicationsAsOf = today();
    }
    roster.push(member);
  }
  return roster;
}

// A handful of Regular Rank faculty whose title (plus first bio lines) gives
// the normalizer nothing to match — read from their own Duke profile, not
// from background knowledge, and recorded here rather than silently dropped.
const MANUAL_AREA_FALLBACK: Record<string, StudyArea[]> = {
  "Mark Chaves": ["congregational-leadership"], // sociologist of religion; directs the National Congregations Study (his Duke bio)
  "William Willimon": ["congregational-leadership", "practical-theology"], // bishop; "professor of Christian ministry" per his Duke bio
  "Norbert L. W. Wilson": ["mission-social-justice"], // "Professor of Food, Economics, and Community" — food justice, per his Duke bio
  "Kevin Hart": ["spiritual-formation"], // "Jo Rae Wright University Distinguished Professor" — recent books on contemplation (Lands of Likeness: For a Poetics of Contemplation; Contemplation: The Movements of the Soul), per his Duke bio
};

async function main() {
  const faculty = await buildFaculty();
  await writeFile(
    join(ROOT, "data/faculty/duke.json"),
    JSON.stringify(faculty, null, 2) + "\n",
    "utf8",
  );
  console.log(`wrote ${faculty.length} faculty to data/faculty/duke.json`);

  // Touch the bulletin page so its content is cached/pinned alongside this
  // run, even though the coverage table below is hand-built from it (prose
  // analysis, not something worth mis-parsing mechanically).
  await get(BULLETIN_MDIV_URL, { fresh });

  const profile: SeminaryProfile = buildProfile();
  await writeFile(
    join(ROOT, "data/seminaries/duke.json"),
    JSON.stringify(profile, null, 2) + "\n",
    "utf8",
  );
  console.log("wrote data/seminaries/duke.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "duke",
    name: "Duke University Divinity School",
    city: "Durham",
    state: "NC",
    url: "https://divinity.duke.edu/",
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
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. Duke's own Hybrid M.Div. — online coursework plus in-person immersion weeks — is a separate, even more residential, delivery than the 'fully online' case this rule covers.",
      },
      coverageSource: "https://divinity.bulletins.duke.edu/allprograms/masters/d-div-mdv",
      coverageAsOf: capturedAt,
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "OLDTEST 752 and 753, two of the nine required core courses.",
        },
        {
          area: "new-testament",
          status: "required",
          note: "NEWTEST 754 is one of the nine required core courses.",
        },
        {
          area: "theology",
          status: "required",
          note: "XTIANTHE 755 (Christian Theology) is one of the nine required core courses.",
        },
        {
          area: "church-history",
          status: "required",
          note: "CHURHST 750 and 751 are two of the nine required core courses; AMXTIAN 756 (American Christianity) is a third required course touching the same territory.",
        },
        {
          area: "preaching",
          status: "required",
          note: "PREACHNG 758 is one of the nine required core courses.",
        },
        {
          area: "worship-liturgy",
          status: "required-umc-track",
          note: "Duke's bulletin, under its 'Ordination Requirements' heading — a section distinct from, and prior to, the separately-labelled 'Recommended Curricular Paradigms' that follow it — states as a flat obligation: 'United Methodist (UMC) students must fulfill educational requirements as set forth by the Book of Discipline by completing... one course in worship (LTS 730) or approved elective...' The 'or approved elective' clause allows a substitute, the way Phillips' 'normally fulfilled by taking PL 725' does — but the binding language ('must fulfill... by completing') and the named default course (LTS 730) both sit in the requirements section itself, not in the scheduling advice that comes after it. UMC-track students are held to this; students of other denominations are not.",
        },
        {
          area: "evangelism",
          status: "required-umc-track",
          note: "The same 'Ordination Requirements' sentence that binds UM studies and worship also binds this one, in the same must-fulfill language: 'United Methodist (UMC) students must fulfill educational requirements as set forth by the Book of Discipline by completing... one course in evangelism.' That obligation is what required-umc-track tracks — not whether Duke names a course. It doesn't, here: unlike PARISH 777/778 for UM studies or LTS 730 for worship, no specific evangelism course is ever named in the bulletin. The curricular paradigm labels the slot only generically, as 'Elective (Mission or Evangelism),' and a footnote confirms evangelism and mission are two distinct required electives, not a shared bucket: 'UMC students are encouraged to consider the area in which they are most likely to desire further advanced coursework when deciding the order in which to take the mission of the church, worship, and evangelism required electives.' A UMC student cannot graduate without a course here, but has to identify one themselves from unrestricted electives and should confirm the specific course with their conference's Board of Ordained Ministry registrar.",
        },
        {
          area: "mission-of-the-church",
          status: "required-umc-track",
          note: "Bound by the same sentence as evangelism above ('...and one course in mission'), and the same paradigm footnote confirms it is a separate, distinct requirement from evangelism, not an either/or. The obligation binds the same way UM studies and worship do — but as with evangelism, Duke never names a specific mission course anywhere in the bulletin, only the generic 'Elective (Mission or Evangelism)' slot in its scheduling paradigm. A UMC student is bound to take some course here and has to identify and choose it themselves, then confirm it with their conference's Board of Ordained Ministry registrar.",
        },
        {
          area: "um-studies",
          status: "required-umc-track",
          note: "The strongest-worded line in Duke's 'Ordination Requirements' section: 'United Methodist (UMC) students must fulfill educational requirements as set forth by the Book of Discipline by completing the year-long course on Methodist doctrine, history, and polity (PARISH 777 and 778)...' No substitute is offered, unlike worship's 'or approved elective' — PARISH 777 and 778 are the course, named by number, in a binding-requirements section that stands on its own independent of the separately-labelled 'Recommended Curricular Paradigms' that merely schedule when to take it. A United Methodist student cannot graduate from Duke's M.Div. without it.",
        },
      ],
      // No gapSummary/gapRemedies: with worship, UM studies, evangelism, and
      // mission all scored required-umc-track, every one of the nine areas
      // binds a UMC candidate — there is no gap left to summarize or remedy.
      // The real caution for evangelism and mission (bound, but no course
      // named — the student must identify one and confirm it with their BOM
      // registrar) lives in those two rows' notes above, which the page
      // always renders next to their status pill, so it isn't lost by
      // dropping these fields.
    },

    scale: {
      totalEnrollment: {
        value: "599 students (592.20 FTE)",
        source: "https://www.ats.edu/member-schools/duke-university-divinity-school",
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report for the whole school, not M.Div. only. ATS also reports 45 full-time faculty (FTE) for the same period — roughly 13 students per faculty FTE, though Duke does not publish that ratio itself.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$30,600/year ($15,300 per semester) for the two-year-pace residential M.Div.; $22,950/year ($11,475/semester) for the four-year-pace residential M.Div.; $22,950/year ($7,650/term) for the Hybrid M.Div.",
        source: "https://divinity.duke.edu/admissions/financial-aid/tuition",
        asOf: "2026-08-06",
        note: "2026–2027 rates, full-time enrollment. Duke prices its M.Div. by pace and delivery mode rather than a flat per-credit rate — the 'per-credit' figure moves depending which of the three tracks you're on.",
      },
      fees: [
        { label: "Student Health Fee", amount: "$524.00 per term (residential)" },
        { label: "Transcript Fee", amount: "$120.00 one-time" },
        { label: "Student Life Ministry / Graduate Activity / Graduate Services / Divinity Government Dues", amount: "$86.50 per term (residential)" },
        { label: "Recreational Facilities Fee", amount: "$204.00 per term (residential)" },
        { label: "Mandatory health insurance (SMIP)", amount: "$4,290.00/year, residential students only; hybrid students must show proof of existing coverage instead" },
      ],
      pctReceivingAid: {
        value: "All students admitted to the M.Div., M.T.S., M.A. in Christian Practice, D.Min., and Th.D. programs receive institutional scholarship support",
        source: "https://divinity.duke.edu/admissions/financial-aid/scholarships",
        asOf: "2026-08-06",
        note: "Duke's own wording, not a rounded percentage it publishes. The school reports awarding more than $11 million in scholarship support a year, plus roughly $1.5 million more in external scholarships.",
      },
      typicalAward: {
        value: "Divinity Dean's Scholarship: 50%–100% of tuition (M.Div./M.T.S.); Divinity Tuition Award: 25% of tuition for M.Div./M.T.S. entrants not awarded a Dean's Scholarship, and for M.A. in Christian Practice and D.Min. students",
        source: "https://divinity.duke.edu/admissions/financial-aid/scholarships",
        asOf: "2026-08-06",
      },
      namedScholarships: [
        {
          name: "Rural Ministry Fellowships",
          blurb: "Full merit-based scholarships, funded through The Duke Endowment and administered by Duke's Thriving Rural Communities initiative, specifically for Duke Divinity students from North Carolina's two United Methodist conferences who show a calling to ordained leadership in rural UMC churches in the state. Geographically narrow, but a direct, named link between UMC ordination and full funding.",
          url: "https://divinity.duke.edu/admissions/financial-aid/scholarships",
        },
        {
          name: "Black Church Studies and Latinx Studies Fellowships",
          blurb: "Full-tuition scholarships tied to the Office of Black Church Studies and the Hispanic House of Studies, with mentoring and professional-formation programming attached.",
          url: "https://divinity.duke.edu/admissions/financial-aid/scholarships",
        },
      ],
      honestNote: "Duke's headline scholarship promise is real but not automatically full-ride: the Dean's Scholarship band runs 50%–100% based on the strength of your application, and most M.Div./M.T.S. entrants who don't land it get a flat 25% Tuition Award instead. Compare that against Candler's stated policy of covering 100% of tuition for certified UMC candidacy applicants who hit the priority deadline — Duke has no published equivalent blanket commitment tied specifically to candidacy status, only the narrower, rural-and-NC-specific Rural Ministry Fellowship. If you are a certified UMC candidate weighing Duke against a school with that kind of guarantee, ask Duke's Office of Financial Aid directly whether candidacy status affects your award; the public pages don't say either way.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "M.Div.",
        credits: 24,
        typicalYears: "3 years full-time (six semesters); up to 6 years allowed",
        modalities: ["residential"],
        blurb: "24 courses: nine required core courses, five limited electives (one each from Church Ministry, Black Church Studies, World Christianity, New Testament Exegesis, and Practicing Theology in Ministry), ten electives, two units of Field Education, spiritual formation, and two portfolio reviews.",
        url: "https://divinity.bulletins.duke.edu/allprograms/masters/d-div-mdv",
      },
      {
        name: "Master of Divinity (Four-Year and Student Pastor pacing)",
        abbr: "M.Div. (MDV4)",
        modalities: ["residential"],
        blurb: "The same 24-course degree spread over four years, including a track built for licensed student pastors serving a church while in school.",
        url: "https://divinity.bulletins.duke.edu/allprograms/masters/d-div-mdv",
      },
      {
        name: "Hybrid Master of Divinity",
        abbr: "M.Div. (Hybrid)",
        modalities: ["hybrid"],
        blurb: "Online coursework combined with in-person immersion weeks, for students who need to stay in their current appointment or job while in seminary.",
        url: "https://divinity.duke.edu/academics/masters/mdiv",
      },
      {
        name: "Master of Theological Studies",
        abbr: "M.T.S.",
        modalities: ["residential"],
        blurb: "Not an ordination degree — for doctoral preparation, nonprofit work, lay ministry, teaching, or research.",
        url: "https://divinity.duke.edu/academics/masters",
      },
      {
        name: "Master of Arts in Christian Practice",
        abbr: "M.A.",
        modalities: ["hybrid"],
        blurb: "Built for working professionals who need to keep their job while studying — vocational discernment, spiritual disciplines, and a Duke master's degree without relocating.",
        url: "https://divinity.duke.edu/academics/masters",
      },
      {
        name: "Master of Theology",
        abbr: "Th.M.",
        modalities: ["residential"],
        blurb: "An advanced theological degree for specialized ministerial or academic preparation, often a step toward a Th.D. or Ph.D.",
        url: "https://divinity.duke.edu/academics/masters",
      },
      {
        name: "Doctor of Ministry",
        abbr: "D.Min.",
        modalities: ["residential"],
        blurb: "Charged as a flat term rate rather than per course; recent cohorts split into Traditional Leadership and Missional Innovation tracks.",
        url: "https://divinity.duke.edu/academics/doctoral/dmin",
      },
    ],

    concentrations: [
      "Anglican Studies",
      "Baptist Studies",
      "Black Church Studies",
      "Catholic Studies",
      "Chaplaincy",
      "Faith, Food, and Environmental Justice",
      "Faith-Rooted Advocacy and Conflict Transformation",
      "Gender, Sexuality, Theology, and Ministry",
      "Latinx Studies",
      "Methodist/Wesleyan Studies",
      "Missional Innovation",
      "Preaching",
      "Prison Studies",
      "Reflective and Faithful Teaching",
      "Theology and the Arts",
      "Theology, Medicine, and Culture",
      "Worship",
    ],

    partnerships: [
      {
        kind: "host-university",
        partner: "Duke University",
        blurb: "Duke Divinity School sits on Duke's Durham campus, with dual-degree routes into Duke's Sanford School of Public Policy, Nicholas School of the Environment, and Fuqua/Law/Medicine programs.",
        url: "https://divinity.duke.edu/",
      },
      {
        kind: "joint-degree",
        partner: "UNC-Chapel Hill School of Social Work",
        blurb: "The M.Div./M.S.W. dual degree shares four courses between the two schools and can be started from either campus, reducing the M.Div. side to 20 (or 19 with advanced standing) required courses.",
        url: "https://divinity.bulletins.duke.edu/allprograms/masters/d-div-mdv",
      },
      {
        kind: "consortium",
        partner: "Houses of Study",
        blurb: "Duke runs denominational Houses of Study inside a UMC-founded school — Anglican Episcopal, Asian, Baptist, Hispanic, Methodist, and Presbyterian/Reformed — each with its own scholarships and certificate program, alongside a standalone Office of Black Church Studies.",
        url: "https://divinity.duke.edu/",
      },
    ],

    facultyNote: "Filtered to Duke's own 'Regular Rank Faculty' category in its directory (49 people) — this excludes Adjunct/Visiting, Administrative, Consulting, and Emeritus faculty, all of which Duke lists separately. A few Regular Rank titles (e.g., 'Professor of Food, Economics, and Community') sit outside this site's field vocabulary; where a title alone gave the area normalizer nothing to match, the area below was read from that person's own Duke bio rather than left blank or guessed from outside knowledge.",

    contact: {
      admissionsUrl: "https://divinity.duke.edu/admissions",
      email: "admissions@div.duke.edu",
      phone: "(919) 660-3436",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
