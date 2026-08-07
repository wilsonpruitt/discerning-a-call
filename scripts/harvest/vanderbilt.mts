// pnpm exec node scripts/harvest/vanderbilt.mts
//
// Vanderbilt University Divinity School — Nashville, TN. Slug `vanderbilt`.
// One of the 24 Senate-approved NON-UMC schools, despite having been the
// Methodist Episcopal Church, South's flagship seminary until the 1914
// separation. That history is why this school was assigned; it is not
// evidence for anything on this page — everything below is read off
// Vanderbilt's own current site.
//
// THE BRITE-SHAPED QUESTION, ANSWERED THE OTHER WAY. Brite (also non-UMC)
// states in its own words that its UM history/doctrine/mission/polity
// courses "have been officially approved by appropriate denominational
// offices" and names a Methodist Studies chair. Vanderbilt's equivalent page
// — https://divinity.vanderbilt.edu/methodist-and-wesleyan-studies-at-vanderbilt-divinity-school/
// — says only that a "program of United Methodist Studies" has existed since
// 1985 offering "fellowship," visiting speakers, and "general and specialized
// courses." No sentence anywhere on that page, or in the 2025-26 Divinity
// School Catalog, states denominational approval of specific courses for
// ordination purposes. Two named chairs exist (both "Cal Turner Chancellor's
// Chair... in/of Wesleyan Studies" — a donor name, not a "Methodist Studies"
// title) held by Joerg Rieger and James P. Byrd, so the chair-and-programme
// finding is real; the *approval* finding is not — this page says so plainly
// rather than assuming Brite's pattern repeats.
//
// THE COVERAGE TABLE, AND WHY IT LOOKS DIFFERENT FROM DUKE'S. The 2025-26
// catalog states the M.Div.'s 36-hour "Required Common Curriculum" in exact,
// enumerable course numbers (DIV 6500, 6600, 6700/6708, 6801, plus one
// "approved" theology course, one "approved" ethics course, the two-semester
// Field Education sequence, the M.Div. Seminar/Project, and a choose-2-of-5
// "Ministerial Arts" slot). Four ¶324.4 areas sit inside that universal core.
// The other five — evangelism, mission-of-the-church, worship-liturgy,
// preaching, and um-studies — are NOT bound to any United Methodist student
// anywhere in Vanderbilt's own text. Contrast with Duke's bulletin ("United
// Methodist (UMC) students must fulfill educational requirements... by
// completing...") and Phillips' catalog ("UMC students... are required to
// take..."): Vanderbilt has no equivalent sentence. The closest analogues cut
// the other way on purpose: DIV5352 (Reformed Theology) is stated to be
// "required for candidates seeking ordination" in the PCUSA, and DIV5354
// (UCC Polity) is "intended to meet an ordination requirement for United
// Church of Christ students" — explicit institutional mandates Vanderbilt
// makes for OTHER denominations, in the same catalog, using exactly the
// binding language the README's `required-umc-track` test looks for. No
// United Methodist course (DIV5350 UM Polity and Practice, DIV5351
// Evangelism in the Wesleyan Tradition, DIV6791 History of the UM Tradition,
// DIV6843 Theology in the UM Tradition, or DIV5218 Mission of the Church in
// the World) gets that sentence. DIV5218's description does say it "meets
// the core competencies for mission education for persons seeking ordination
// in the United Methodist Church according to Par.325" — a statement that
// the CONTENT lines up with the Discipline, not that Vanderbilt REQUIRES a
// UMC student to take it. Scored `elective` for all five, honestly, rather
// than reproducing the Duke pattern by assumption. Preaching and worship are
// further diluted: both live inside the generic 2-of-5 Ministerial Arts
// choice, open to every denomination, so a student could clear that
// requirement without either one — the same test that made Candler 4/9.
//
// BESPOKE MECHANICS:
//  - The 2025-26 Divinity School Catalog (registrar.vanderbilt.edu PDF) is
//    the only reliable source for the actual M.Div. requirements; the
//    marketing mdiv/ page never lists a single required course by number.
//  - Faculty: the WordPress-driven /people/ directory renders its lists via
//    client-side JS (a "People Directory" widget), but the AJAX endpoint
//    behind it is a plain, unauthenticated PHP script
//    (peoplemanager-directory-remote-webcomm.php) that returns JSON keyed by
//    a numeric "group" id. group=31 is the core "Faculty" tab (19 people);
//    group=56/190/141 are Dual Appointments/Adjoint/Lecturer, scoped out the
//    same way Duke scoped to "Regular Rank." Per-person profiles (degrees,
//    denomination of ordination, bio, publications) come from the same
//    endpoint with a `pid` parameter and `profile=true` — no browser needed.
//  - Degrees: the "education" field is a flat <br>-joined list, usually
//    followed by a "Denomination of Ordination" or "Denominational
//    Affiliations" paragraph. That paragraph is read (to flag United
//    Methodist faculty) but not stored — FacultyMember has no such field, and
//    the site does not invent one.
//  - Publications: bios are free prose, not a citation database. Two
//    conservative extractors are used — a literal "Selected publications:"
//    list where the school phrases it that way (Byrd), and an italic-title +
//    (Publisher, Year) pattern elsewhere. Anything neither catches is left
//    off rather than guessed at; several of the 19 have none, same as Brite.

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { get, today } from "./lib/fetch.mts";
import { htmlToText, pdfToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import type { FacultyMember, SeminaryProfile, StudyArea } from "../../content/types.ts";

const fresh = process.argv.includes("--fresh");
const ROOT = process.cwd();

const GBHEM_SOURCE = "https://www.gbhem.org/education/schools-of-theology/";
const GBHEM_ASOF = "2026-07-07"; // per research/gbhem-approved-schools-snapshot.md
const CATALOG_URL = "https://registrar.vanderbilt.edu/documents/Divinity-School-Catalog-2025-26.pdf";
const CATALOG_ASOF = "2025-08-01"; // catalog's own effective year
const UMW_PAGE_URL = "https://divinity.vanderbilt.edu/methodist-and-wesleyan-studies-at-vanderbilt-divinity-school/";
const MDIV_PAGE_URL = "https://divinity.vanderbilt.edu/academics/degrees/mdiv/";
const TUITION_URL = "https://divinity.vanderbilt.edu/admissions/tuition/";
const ATS_MEMBER_URL = "https://www.ats.edu/member-schools/vanderbilt-university-divinity-school";
const DIRECTORY_ENDPOINT =
  "https://divinity.vanderbilt.edu/wp-content/themes/anchordown-futurevu/library/remote/peoplemanager-directory-remote-webcomm.php";

// --- fetch the pages the profile prose cites, so they are cached/pinned ----

const catalogPdf = await get(CATALOG_URL, { binary: true, fresh });
const catalogText = pdfToText(catalogPdf.path);
void catalogText; // read by hand for buildProfile(); fetched here so the source is cached alongside this run.

await get(UMW_PAGE_URL, { fresh });
await get(MDIV_PAGE_URL, { fresh });
await get(TUITION_URL, { fresh });
await get(ATS_MEMBER_URL, { fresh });

// --- faculty ----------------------------------------------------------------

interface DirEntry {
  id: number;
  slug: string;
  full_name: string;
  titles: string;
}

interface ProfileRecord {
  id: number;
  slug: string;
  full_name: string;
  titles: string;
  bio: string;
  education: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// The peoplemanager endpoint escapes its rich-text fields once for JSON
// transport (so a literal "<p>" arrives as "&lt;p&gt;"), but the rich text
// itself already contains ordinary HTML entities the editor typed — a
// literal "&nbsp;" or "&#039;" inside the source HTML. One decode pass
// recovers the raw HTML (tags and all); it takes a second pass to resolve
// the entities that were already part of that HTML, exactly as a browser's
// two-stage parse (transport, then HTML) would. Skipping the second pass is
// what left literal "&nbsp;" and "&amp;" sitting in early drafts of this
// harvest's degree lines.
function unescapeAll(s: string): string {
  return decodeEntities(decodeEntities(s));
}

// Vanderbilt's people-manager endpoint appends the person's academic
// department/area to most (not all) title lines as a trailing ", <dept>"
// clause — sometimes genuinely redundant with the title itself ("Professor
// of Religion, Psychology, and Culture, Religion, Psychology, and Culture"),
// sometimes just a shorter synonym ("...Professor of Feminist Theology,
// Theological Studies"). Directorship/role lines carry NO such suffix and
// may contain their own internal commas as part of the real name ("Carpenter
// Program in Religion, Gender and Sexuality") — stripping the text after the
// last comma unconditionally (an earlier version of this script did exactly
// that) truncates those names. The fix: only strip a trailing ", <dept>" when
// <dept> is one of the department names this school's own titles actually
// use, observed directly off the 19-person roster below. Anything else is
// left whole.
const KNOWN_DEPARTMENTS = [
  "Religion, Psychology, and Culture",
  "Hebrew Bible and Ancient Near East",
  "New Testament and Early Christianity",
  "Homiletics and Liturgics",
  "Kelly Miller Smith Institute",
  "Leadership and Ministry",
  "Historical Studies",
  "Theological Studies",
  "Ethics and Society",
].sort((a, b) => b.length - a.length); // longest first, so a short dept name can't pre-empt a longer one that contains it

function stripKnownDepartment(clause: string): string {
  for (const dept of KNOWN_DEPARTMENTS) {
    const suffix = `, ${dept}`;
    if (clause.endsWith(suffix) && clause.length > suffix.length + 5) {
      return clause.slice(0, -suffix.length).trim();
    }
  }
  return clause;
}

async function fetchDirectory(group: number): Promise<DirEntry[]> {
  const url = `${DIRECTORY_ENDPOINT}?showdept=true&affiliated=all&option=choose-department&school=4&department=all&group=${group}&neighborhood=none&person=`;
  const { body } = await get(url, { fresh });
  const parsed = JSON.parse(body) as { data: DirEntry[] };
  return parsed.data;
}

async function fetchProfile(pid: number): Promise<ProfileRecord> {
  const url = `${DIRECTORY_ENDPOINT}?pid=${pid}&profile=true&showdept=true`;
  const { body } = await get(url, { fresh });
  const parsed = JSON.parse(body) as { data: ProfileRecord[] };
  // The endpoint returns one record per attached file (photo, CV, ...); the
  // text fields are identical across them, so the first is enough.
  return parsed.data[0];
}

function splitTitles(raw: string): { title: string; otherRoles: string[] } {
  const clauses = unescapeAll(raw)
    .split(/<br\s*\/?\s*>/i)
    .map((c) => stripKnownDepartment(c.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()))
    .filter(Boolean);
  return { title: clauses[0] ?? unescapeAll(raw).trim(), otherRoles: clauses.slice(1) };
}

// Education field: a flat <br>-joined list of degree lines, occasionally
// followed by an italic "Denomination of Ordination" / "Denominational
// Affiliations" heading and value. Split those two out; only the degree
// lines are stored (FacultyMember has no denomination field — read for the
// Methodist-studies flag below, not persisted as an invented field).
function parseEducation(raw: string): { degrees: string[]; denomination: string | null } {
  const text = unescapeAll(raw).replace(/<p>/gi, "").replace(/<\/p>/gi, "\n");
  const lines = text
    .split(/<br\s*\/?\s*>|\n/i)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);

  const degrees: string[] = [];
  let denomination: string | null = null;
  let inDenomSection = false;
  for (const line of lines) {
    if (/^denomination/i.test(line)) {
      inDenomSection = true;
      continue;
    }
    if (inDenomSection) {
      if (!denomination) denomination = line;
      continue;
    }
    if (/^concentration:/i.test(line)) continue; // Sheppard's sub-line under her PhD entry
    degrees.push(line);
  }
  return { degrees, denomination };
}

// Extractor 1: a literal "Selected publications:" (or "Book publications
// include") heading followed by one or more <ul> lists. Vanderbilt's own
// wording for Byrd; conservative on purpose — only fires when the school
// itself labels the list.
function extractLabeledPublications(bioHtml: string): string[] {
  const marker = /(?:Selected [Pp]ublications|Book publications include)\s*:?\s*<\/p>/;
  const m = marker.exec(bioHtml);
  if (!m) return [];
  const rest = bioHtml.slice(m.index + m[0].length);
  const items: string[] = [];
  const ulRe = /<ul>([\s\S]*?)<\/ul>/g;
  let ulMatch: RegExpExecArray | null;
  let sawNonListParagraph = false;
  // Only consume <ul> blocks that appear before any other <p> paragraph, so a
  // later, unrelated list (e.g. "Courses (selected):") appearing after prose
  // resumes doesn't get swept in.
  const stopIdx = rest.search(/<p>(?!<\/p>)/);
  const window = stopIdx > 0 ? rest.slice(0, stopIdx + 2000) : rest;
  while ((ulMatch = ulRe.exec(window))) {
    if (sawNonListParagraph) break;
    const liRe = /<li>([\s\S]*?)<\/li>/g;
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liRe.exec(ulMatch[1]))) {
      const t = liMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (t) items.push(t);
    }
  }
  return items;
}

// Extractor 2: an italicised title immediately followed by a (Publisher,
// Year) parenthetical, anywhere in the bio prose. Catches the common
// "Her book, <em>Title</em> (Press, 2016), argues..." construction without
// trying to parse full-sentence bios into a bibliography.
function extractProseTitlePublications(bioHtml: string): string[] {
  const pat = /<(em|u)>([^<]{15,220})<\/\1>[\s\xa0]*\(([^()]{2,90}\d{4}[^()]{0,15})\)/g;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = pat.exec(bioHtml))) {
    const title = m[2].replace(/\s+/g, " ").trim();
    const meta = m[3].replace(/\s+/g, " ").trim();
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`${title} (${meta})`);
  }
  return out;
}

function toPublications(titles: string[]): { title: string; kind: "book"; year?: number }[] {
  return titles.slice(0, 5).map((t) => {
    const y = /\b(19|20)\d{2}\b/.exec(t);
    return { title: t, kind: "book" as const, year: y ? Number(y[0]) : undefined };
  });
}

// A few faculty whose title alone (even with the department suffix Vanderbilt
// appends) gives the normalizer too little, or whose bio names a clear extra
// area the title doesn't hint at — read from their own Vanderbilt bio above,
// not from outside knowledge. Additive to whatever the title itself matches.
const MANUAL_AREA_ADDITIONS: Record<string, StudyArea[]> = {
  "Stacey Floyd-Thomas": ["womanist-feminist-theology", "black-church-studies"], // bio: Black Religious Scholars Group, womanist/feminist studies
  "Yara González-Justiniano": ["practical-theology"], // bio: "she is a practical theologian"
  "Jaco Hamman": ["pastoral-care-counseling", "practical-theology"], // bio: psychodynamic theory, clinical training; directs Program in Theology and Practice
  "Forrest Harris": ["black-church-studies"], // directs the Kelly Miller Smith Institute on Black Church Studies
  "Bruce Morrill": ["liturgy-worship"], // bio: "theological scholarship in the area of liturgy and sacraments"
  "Yolanda Pierce": ["church-history", "womanist-feminist-theology"], // bio: African American religious history, womanist theology
  "Joerg Rieger": ["mission-social-justice"], // directs the Wendland-Cook Program in Religion and Justice
  "Phillis Isabella Sheppard": ["pastoral-care-counseling"], // PhD in Theology, Ethics, and the Human Sciences; Religion, Psychology, and Culture faculty
};

// The three faculty whose bios this harvest actually read closely enough to
// say what they're working on, per the site's "ships only where a human has
// read their work" rule — all three carry direct United Methodist relevance:
// the two Wesleyan Studies chairs, plus the one other UMC-ordained scholar on
// the core roster.
const WORKING_ON: Record<string, string> = {
  "James P. Byrd": "Holds one of Vanderbilt's two Cal Turner Chancellor's Chairs in Wesleyan Studies and is UMC-ordained himself. He teaches History of the United Methodist Tradition and co-leads the new Turner-Barnett Program for Pastoral Formation alongside Bishop William McAlilly (retired, Tennessee-Western Kentucky Conference). His own scholarship is on the Bible in American religious and political history, not Methodism specifically — the UM teaching is a role he holds, not the center of his research.",
  "Joerg Rieger": "Holds the other Cal Turner Chancellor's Chair in Wesleyan Studies and is UMC-ordained. He also directs the Wendland-Cook Program in Religion and Justice, and his own research center is theology and economic/political justice movements, with Wesleyan studies as one lens among several rather than his primary output.",
  "Herbert R. Marbury": "UMC-ordained and teaches Hebrew Bible and Black Religious Studies. Not a Methodist-studies appointment, but worth knowing if you are a UMC candidate looking for ordained UM faculty outside the two Wesleyan chairs.",
};

function slugId(slug: string): string {
  return `vanderbilt-${slug}`;
}

async function buildFaculty(): Promise<FacultyMember[]> {
  const dir = await fetchDirectory(31); // "Faculty" tab — core roster, per README's page structure
  const roster: FacultyMember[] = [];

  for (const entry of dir) {
    const profile = await fetchProfile(entry.id);
    const { title, otherRoles } = splitTitles(profile.titles);
    const { degrees, denomination } = parseEducation(profile.education ?? "");
    void denomination; // read to inform MANUAL_AREA_ADDITIONS/WORKING_ON above; not a stored field

    const bioHtml = unescapeAll(profile.bio ?? "");
    let pubTitles = extractLabeledPublications(bioHtml);
    if (pubTitles.length === 0) pubTitles = extractProseTitlePublications(bioHtml);

    let areas = suggestAreas(title, otherRoles);
    const extra = MANUAL_AREA_ADDITIONS[entry.full_name];
    if (extra) areas = Array.from(new Set([...areas, ...extra]));

    const member: FacultyMember = {
      id: slugId(entry.slug),
      seminarySlug: "vanderbilt",
      name: entry.full_name,
      title,
      areas,
      profileUrl: `https://divinity.vanderbilt.edu/bio/${entry.slug}`,
    };
    if (otherRoles.length) member.otherRoles = otherRoles;
    if (degrees.length) member.degrees = degrees;
    const workingOn = WORKING_ON[entry.full_name];
    if (workingOn) member.workingOn = workingOn;
    if (pubTitles.length) {
      member.publications = toPublications(pubTitles);
      member.publicationsSource = member.profileUrl;
      member.publicationsAsOf = today();
    }
    roster.push(member);
  }
  return roster;
}

// --- main --------------------------------------------------------------------

async function main() {
  const faculty = await buildFaculty();
  await writeFile(join(ROOT, "data/faculty/vanderbilt.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/vanderbilt.json`);

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/vanderbilt.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/vanderbilt.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "vanderbilt",
    name: "Vanderbilt University Divinity School",
    city: "Nashville",
    state: "TN",
    url: "https://divinity.vanderbilt.edu/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-non-umc",
        source: GBHEM_SOURCE,
        asOf: GBHEM_ASOF,
        note: "On the University Senate's list of approved non–United Methodist schools of theology. Vanderbilt was the Methodist Episcopal Church, South's flagship seminary until the two formally separated in 1914; that history explains why it sits on this list at all, but it is not evidence of anything below — everything here is read from Vanderbilt's current pages, not its past.",
      },
      onlineCredit: {
        value: "none-counts",
        source: GBHEM_SOURCE,
        asOf: GBHEM_ASOF,
        note: "GBHEM: no online or distance class at a Senate-approved non-UMC school counts toward ¶324.4, regardless of what the school offers. Vanderbilt's M.Div. is itself residential — the catalog requires the final year of study in residence at the Divinity School — so this mostly matters if you cross-register into online coursework elsewhere at Vanderbilt; it would not count for ordination purposes even if it counted toward the degree.",
      },
      coverageSource: CATALOG_URL,
      coverageAsOf: CATALOG_ASOF,
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "DIV 6500 Hebrew Bible is one of the M.Div.'s 36-hour Required Common Curriculum courses, taken by every student regardless of denomination — the catalog requires it within the first 24 hours of coursework.",
        },
        {
          area: "new-testament",
          status: "required",
          note: "DIV 6600 New Testament is a Required Common Curriculum course for every M.Div. student, also required within the first 24 hours.",
        },
        {
          area: "theology",
          status: "required",
          note: "DIV 6801 Introduction to Christian Theology plus one further 'approved course in theological studies' are both Required Common Curriculum courses for every student — 6 hours, no denominational distinction.",
        },
        {
          area: "church-history",
          status: "required",
          note: "DIV 6700 and 6708, History of Global Christianities I and II, are two Required Common Curriculum courses (6 hours) every M.Div. student takes. Vanderbilt frames the sequence globally rather than calling it 'church history,' but it is the school's own required history-of-Christianity core and the closest thing it has to this area — no United Methodist distinction is made.",
        },
        {
          area: "mission-of-the-church",
          status: "elective",
          note: "DIV5218 Mission of the Church in the World is an elective, and its own catalog description states that it 'meets the core competencies for mission education for persons seeking ordination in the United Methodist Church according to Par.325 in The United Methodist Book of Discipline' — but nowhere does Vanderbilt's catalog say a United Methodist student must take it, or any other course, to satisfy this area. Compare DIV5354 (UCC Polity), which the same catalog calls 'intended to meet an ordination requirement for United Church of Christ students': Vanderbilt uses binding language for other denominations but not for this UM-relevant course. Scored elective, not required-umc-track, on that basis.",
        },
        {
          area: "evangelism",
          status: "elective",
          note: "DIV5351 Evangelism in the Wesleyan Tradition is an open elective on the biblical, historical, and theological foundations of evangelism. It also sits inside the Required Common Curriculum's generic 'choose 2 of 5 Ministerial Arts' slot (Pastoral Theology and Care / Christian Worship / Fundamentals of Preaching / an approved leadership course / an approved religious-education course) alongside worship and preaching — a student could clear that requirement without touching evangelism, worship, or preaching at all by choosing, say, Pastoral Theology and a leadership course. No sentence in the catalog binds a United Methodist student to DIV5351 or to this area specifically.",
        },
        {
          area: "worship-liturgy",
          status: "elective",
          note: "DIV 6701 Introduction to Christian Worship is one of the five options in the same choose-2-of-5 Ministerial Arts slot described under evangelism above — available, not required of every student, and not named as a United Methodist obligation anywhere in the catalog.",
        },
        {
          area: "preaching",
          status: "elective",
          note: "DIV 6901 Fundamentals of Preaching sits in the same choose-2-of-5 Ministerial Arts slot. A student can satisfy the Required Common Curriculum's two-course requirement here by picking the other four options and never take a preaching course; no United Methodist-specific obligation is stated.",
        },
        {
          area: "um-studies",
          status: "elective",
          note: "Vanderbilt offers real United Methodist Studies coursework — DIV5350 United Methodist Church Polity and Practice, DIV6791 The History of the United Methodist Tradition, and DIV6843 Theology in the United Methodist Tradition, the last taught by Joerg Rieger, one of the two Cal Turner Chancellor's Chairs in Wesleyan Studies — but all three are open electives. Unlike Duke ('United Methodist (UMC) students must fulfill educational requirements... by completing the year-long course on Methodist doctrine, history, and polity') or Phillips ('United Methodist students are required to take DS 550... DS 575... DS 625'), nothing in Vanderbilt's 2025-26 catalog obligates a UMC ordination-track student to take any of its three named UM courses. The school's own 'Methodist and Wesleyan Studies' page describes a programme of fellowship, visiting speakers, and course offerings that goes back to 1985 — it never uses the word 'required,' and never claims denominational approval of the courses the way Brite's equivalent page does.",
        },
      ],
      gapSummary: [
        "Vanderbilt's relationship to ¶324.4 is genuinely different from every other non-UMC school this project has looked at, and the difference matters more than the raw 4-of-9 number suggests. Brite (also non-UMC) says outright that its United Methodist history/doctrine/mission/polity courses have been officially approved by denominational offices, and names a chair whose title says 'Methodist Studies.' Duke and Phillips (a UMC school and a monitored non-UMC school) both write, in their own bulletins, that a United Methodist ordination-track student MUST complete specific named courses. Vanderbilt does none of the three.",
        "It has real Wesleyan/Methodist infrastructure — two Cal Turner Chancellor's Chairs in Wesleyan Studies (Joerg Rieger and James P. Byrd, both UMC-ordained), three named United Methodist courses, a United Methodist Studies programme dating to 1985, a new Turner-Barnett Program for Pastoral Formation mentored by a retired UMC bishop, and a full-tuition scholarship reserved for a UMC ordination candidate (below). What it does not have, on its own published pages, is any statement that a United Methodist student is bound to take that coursework, or that the coursework carries denominational approval for ¶324.4 purposes.",
        "Five of the nine areas — evangelism, mission of the church, worship, preaching, and United Methodist studies itself — are yours to plan for deliberately, the way a UMC candidate at any purely ecumenical school would have to, not something the degree structure hands you.",
      ],
      gapRemedies: [
        {
          blurb: "If you are on the M.Div. track, plan your two Ministerial Arts electives and your general electives around DIV5350 (UM Polity and Practice), DIV5351 (Evangelism in the Wesleyan Tradition), DIV6791 or DIV6843 (UM History/Theology), and DIV5218 (Mission of the Church in the World) deliberately — none of them will be assigned to you by the degree structure, and DIV5218's own description ties it to ¶325's mission-education competency.",
        },
        {
          blurb: "Talk to James P. Byrd or Joerg Rieger, the two Cal Turner Chancellor's Chairs in Wesleyan Studies — both are UMC-ordained and can advise on which of Vanderbilt's UM-specific electives, in what order, will read clearly on a candidacy file.",
          url: UMW_PAGE_URL,
        },
        {
          blurb: "Confirm every course choice with your conference's Board of Ordained Ministry registrar before you register. Because Vanderbilt makes no institutional claim that its UM coursework satisfies ¶324.4 the way Duke's or Phillips' catalogs do for their students, the burden of documenting that a given Vanderbilt course covers a given area falls more heavily on you and your board than it would at a school that states the mapping itself.",
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "188 students (192.70 FTE)",
        source: ATS_MEMBER_URL,
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report for the whole Divinity School, not M.Div. only. The same report lists 24 full-time faculty (25.58 FTE) for the same period.",
      },
      studentFacultyRatio: {
        value: "24 full-time faculty (25.58 FTE) against 188 students (192.70 FTE)",
        source: ATS_MEMBER_URL,
        asOf: "2025-11-01",
        note: "Raw counts reported rather than a computed ratio, since ATS does not publish one directly and this harvest's own faculty roster (the school's 'Faculty' directory tab, scoped the way Duke's 'Regular Rank' was) turned up 19 people rather than 24 — the difference is most likely faculty who hold appointments counted elsewhere by ATS (e.g. joint with the Graduate Department of Religion) without appearing on the Divinity School's own public Faculty tab.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$1,236 per credit hour (M.Div./M.T.S. and D.Min.)",
        source: TUITION_URL,
        asOf: "2025-08-01",
        note: "2025-26 rate. A full-time M.Div. year (24 hours) runs $29,664 in tuition alone before the mandatory Student Services Fee, Student Health Fee, and student health insurance (domestic: $4,244/year; international: $4,484/year) layered on top.",
      },
      typicalAward: {
        value: "Named merit scholarships (Brandon Honor, Carpenter, Dean's, Kelly Miller Smith, Divinity Merit) range from partial to full tuition for M.Div./M.T.S. students who apply by January 15",
        source: TUITION_URL,
        asOf: "2025-08-01",
        note: "Vanderbilt states that 'our average tuition award is also higher' than peer schools but does not publish a single headline percentage or dollar figure the way Phillips or Duke do. No separate GBHEM/Ministerial Education Fund note is stated on this page.",
      },
      namedScholarships: [
        {
          name: "Blakemore/West End UMC Scholarship",
          blurb: "A full-tuition scholarship for an entering M.Div. candidate, awarded 'on the basis of academic achievement and promise for ministry in the United Methodist Church' — renewable for up to 72 credit hours while enrolled full-time. This is the direct, named link between UMC candidacy and full funding at a school that otherwise makes no institutional commitment tied to ¶324.4 coverage.",
          url: TUITION_URL,
        },
        {
          name: "Turner-Barnett Program for Pastoral Formation",
          blurb: "A new (2026-27 first cohort) mentor-driven program for two cohorts of three students with 'a clear vocational focus on pastoral ministry': full tuition, a stipend, a placement in a local congregation, and mentoring led by Bishop William T. McAlilly (retired, Tennessee-Western Kentucky Conference of the UMC) alongside Associate Dean James P. Byrd. Eligibility is stated as pastoral-ministry focus generally, not United Methodist affiliation specifically — but the mentoring structure is built around a retired UMC bishop and a Wesleyan Studies chair, so a UMC candidate should ask Admissions whether that shapes the applicant pool.",
          url: "https://divinity.vanderbilt.edu/vanderbilt-divinity-school-receives-gift-for-new-turner-barnett-program-for-pastoral-formation/",
        },
      ],
      honestNote: "Vanderbilt's catalog also lists several smaller, older UMC-linked scholarship funds by name (the Missouri Annual Conference Scholarship Fund, the Marquand [Missouri] United Methodist Church Scholarship, the Practice of Leadership in Ministry Fund honoring a UMC bishop, the West End United Methodist Scholarship Fund) that this page does not itemize individually — ask the Office of Financial Aid for the full current list, since fund availability and amounts change year to year in ways a harvested snapshot cannot track reliably.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "M.Div.",
        credits: 72,
        typicalYears: "3 years full-time",
        modalities: ["residential"],
        blurb: "The ordination degree: 36 hours of Required Common Courses, a 12-hour Concentration (one of ten), and 24 hours of electives, plus Field Education and a capstone Seminar and Project. As an ecumenical school, Vanderbilt provides ordination-track coursework for Protestant denominations and the Unitarian Universalist Church generally — advisers include denominational liaisons for a dozen named traditions, United Methodist among them, but the catalog does not bind United Methodist candidates to a specific path the way it does explicitly for PCUSA and UCC candidates.",
        url: "https://divinity.vanderbilt.edu/academics/degrees/mdiv/",
      },
      {
        name: "Master of Theological Studies",
        abbr: "M.T.S.",
        credits: 48,
        modalities: ["residential"],
        blurb: "Not an ordination degree — built for teaching, doctoral preparation, diaconal ministry in some traditions, or nonprofit/social-justice work.",
        url: "https://divinity.vanderbilt.edu/academics/degrees/mts/",
      },
      {
        name: "Doctor of Ministry in Integrative Chaplaincy",
        abbr: "D.Min.",
        credits: 36,
        typicalYears: "3 years",
        modalities: ["hybrid"],
        blurb: "Requires an existing M.Div., M.T.S., or equivalent plus current work as a chaplain. Hybrid by design: synchronous online seminars, asynchronous content, and three 3.5-day on-campus intensives in the first three semesters.",
        url: "https://divinity.vanderbilt.edu/academics/degrees/dmin/",
      },
    ],

    concentrations: [
      "Black Religion and Culture Studies",
      "Chaplaincy",
      "Pastoral and Prophetic Congregational Leadership",
      "Global Christianities and Interreligious Encounter",
      "Mediterranean and Near Eastern Studies",
      "Prison and Carceral Studies",
      "Religion and Economic Justice",
      "Religion and the Arts",
      "Religion, Gender, and Sexuality",
      "Spirituality and Social Activism",
    ],

    partnerships: [
      {
        kind: "host-university",
        partner: "Vanderbilt University",
        blurb: "The Divinity School sits inside Vanderbilt University with dual-degree routes into Law (M.Div.-J.D.), Medicine (M.Div.-M.D.), Nursing (M.S.N./M.Div.), Education (M.Div./M.Ed.), and the Owen Graduate School of Management (M.B.A.-M.Div.).",
        url: "https://divinity.vanderbilt.edu/",
      },
      {
        kind: "consortium",
        partner: "School of Theology at Sewanee: The University of the South",
        blurb: "Students discerning ordination in the Episcopal Church may begin fulfilling Anglican Studies requirements through this cross-registration consortium.",
      },
      {
        kind: "extension",
        partner: "Disciples Divinity House at Vanderbilt",
        blurb: "The Christian Church (Disciples of Christ) maintains a house two blocks from the Divinity School offering scholarship support, low-cost housing, and community specifically for Disciples students — the closest analogue on Vanderbilt's campus to what Brite calls a denominational programme, though for a different tradition than United Methodism.",
        url: "https://registrar.vanderbilt.edu/documents/Divinity-School-Catalog-2025-26.pdf",
      },
    ],

    facultyNote: "Scoped to Vanderbilt's own 'Faculty' directory tab (19 people) — the school's people-manager system separately lists Dual Appointments, Adjoint Faculty, and Lecturers, all excluded here the way Duke's harvest scoped to 'Regular Rank' only. ATS's Fall 2025 report counts 24 full-time faculty for the Divinity School as a whole, 5 more than this roster; the gap is most likely joint appointments with the Graduate Department of Religion that don't surface on the Divinity School's own public Faculty tab. Every person below has an individual bio page. Two hold the Cal Turner Chancellor's Chair in Wesleyan Studies (James P. Byrd, Joerg Rieger); a third core faculty member, Herbert R. Marbury, is separately UMC-ordained per his own bio. Degrees and denomination-of-ordination come from each person's own 'education' field; publications are drawn only where the bio names a clear, citable list — most of the 19 have none listed, which is a fact about what Vanderbilt publishes, not about their output.",

    contact: {
      admissionsUrl: "https://divinity.vanderbilt.edu/admissions/",
      email: "divinity-admissions@vanderbilt.edu",
      phone: "615-343-3963",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
