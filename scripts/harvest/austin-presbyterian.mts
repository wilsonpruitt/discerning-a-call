// Austin Presbyterian Theological Seminary — one of the 24 Senate-approved
// non-UMC schools of theology.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//
//   - THE MODAL, PROPERLY OPENED. austinseminary.edu/academics/meet-the-faculty
//     lists all 19 core faculty as `<a class="fsConstituentProfileLink"
//     data-constituent-id="N">` — a FinalSite "Constituent" element. Clicking
//     one does NOT navigate anywhere; it fires an AJAX call that fills a
//     single reused `<dialog id="fsEl_20857_0_Dialog">` element with that
//     person's education, work phone, and (for most people) a full prose
//     "Bio" section. lib/fetch.mts's plain fetch() only ever sees the base
//     HTML — the dialog's content does not exist in the DOM until JS clicks
//     the link and the AJAX response lands, so no URL exists to `get()` for
//     any of this. This harvest was done with a real browser (Playwright),
//     clicking each of the 19 `data-constituent-id` links in turn and reading
//     the dialog's `innerText` after each click. The IDs, for the next
//     re-harvest: Allen 5230, Aymer 4459, Bonilla 5657, Budwey 5688,
//     Caruthers 5646, Cuéllar 3480, Foote 5666, Gallardo 5644, Greenway 10,
//     C. Helsel 4458, P. Helsel 4610, Irizarry 5648, Jensen 13, Jeong 5645,
//     Lord 20, Park 2345, Rigby 23, Silva-McCormick 5658, Zirschky 4659.
//
//   - THE CEILING WAS WRONG, THE SAME WAY IT WAS WRONG AT CLAREMONT. The
//     tracker's first-pass note called this "likely at ceiling" for
//     publications because the modal "carries degrees but no publication
//     lists" — but nobody had actually read past the Education section of
//     the dialog to the Bio section beneath it. The Bio prose is where
//     degrees-only harvests stopped short: 13 of 19 people name real, dated
//     books/chapters/articles by title in their own bio text (no separate
//     "Publications" heading exists here — Austin's dialog has exactly two
//     headings, "Education" and "Bio", and everything after "Bio" is a
//     single block of prose a human has to read for titles, same discipline
//     Claremont's second pass needed for Froelich and Hagiya). In-progress
//     work named without a publisher or a stated "forthcoming" status
//     (Gallardo's "first book," Lord's four "current book projects," Rigby's
//     two books "currently completing") is left out, the same call Claremont
//     made on Song's and Stowe's in-progress dissertations — a project isn't
//     a publication until someone says a publisher will print it.
//
//   - EMAIL IS A CONFIRMED CEILING, NOT AN UNCHECKED ONE. Every one of the 19
//     dialogs was read in full: each carries a "Work: Phone number" line and
//     nothing else in the way of direct contact — no personal email field
//     exists in the FinalSite Constituent template this site uses. The
//     separate staff directory (austinseminary.edu/about/directory) was
//     checked independently and shows the same pattern: phone numbers only,
//     plus the single general "info@austinseminary.edu" address. No per-
//     person email exists to harvest — confirmed, not assumed.
//
//   - BUDWEY IS A GENUINE, CONFIRMED GAP, NOT A MISS. Stephanie Budwey's
//     dialog contains only her name, title (printed twice), and work phone —
//     no Education heading, no Bio. This matches the original harvest's
//     18/19 degree count exactly (she was always the one exception) and was
//     re-checked with a longer wait in case the AJAX response was simply
//     slow; the dialog is genuinely thin, not unloaded.
//
//   - NO SITE-WIDE PUBLICATIONS PAGE. Checked for a Brite-style faculty-
//     scholarship showcase: none exists. "Insights: The Faculty Journal of
//     Austin Seminary" is a real, indexed periodical
//     (austinseminary.edu/uploaded/about_us/pdf/insights/…) but it's a
//     magazine of essays, not a publications index, and issues aren't
//     attributed per-person in a way that's citable as an individual's
//     bibliography. "Faculty in the News" is press coverage, not scholarship.
//     The per-person Bio prose inside each modal is the only source.
//
//   - ONE CV PDF EXISTS (Zirschky's, dated November 2019, linked from inside
//     his dialog as "Download CV") — checked and it only confirms the two
//     books already named in his Bio prose, plus book reviews and conference
//     talks not counted as publications under this site's "selection, not a
//     CV" rule. No other dialog links to a CV.
//
// Run: node scripts/harvest/austin-presbyterian.mts [--fresh]
//
// NOTE ON RE-RUNNING: this script's `get()` calls only seed the fetch cache
// for the pages that ARE fetchable (the directory page itself, the M.Div.
// page, and the affording-seminary page) — they exist for the coverage/cost
// sanity checks and citation trail, not to reconstruct the roster below. The
// ROSTER array itself must be re-verified by clicking through the dialogs
// again in a real browser at the next re-harvest; there is no way to script
// around that for this particular school.

import { get, today } from "./lib/fetch.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://www.austinseminary.edu";
const FACULTY_URL = `${BASE}/academics/meet-the-faculty`;
const MDIV_URL = `${BASE}/academics/degree-programs/master-of-divinity-mdiv`;
const AID_URL = `${BASE}/admissions/affording-seminary`;

interface Entry {
  id: string; // preserved from the original hand-built harvest — surname-based,
  // with helsel-carolyn/helsel-philip disambiguating the two Helsels
  name: string;
  title: string;
  otherRoles?: string[];
  areas: StudyArea[];
  workingOn?: string;
  degrees?: string[];
  publications?: { title: string; kind: "book" | "edited-volume" | "article" | "chapter"; year?: number; publisher?: string; note?: string }[];
  publicationsSource?: string;
}

// All 19 core faculty from austinseminary.edu/academics/meet-the-faculty's
// "Faculty" section (the adjunct/emeritus section below it is excluded, same
// core-faculty cut every school in this project uses). Degrees carried
// forward unchanged from the original hand-built harvest (verified again
// against each dialog's Education section during this pass). Publications
// are new: read from each dialog's Bio prose, one browser session, 2026-08-07.
const ROSTER: Entry[] = [
  {
    id: "aps-allen",
    name: "Sarah Allen",
    title: "Associate Dean of Ministerial Formation and Advanced Studies",
    otherRoles: ["Grant director, Borders and Bridges Initiative", "Program director, Bridge to Ministry"],
    areas: ["practical-theology", "christian-education-formation"],
    degrees: ["BA, Austin College, 2003", "MDiv, Austin Presbyterian Theological Seminary, 2007", "DMin, Austin Presbyterian Theological Seminary, 2019"],
    // Bio is administrative/service-focused (Mission Presbytery committees,
    // Progressive Youth Ministry advisory board) — no book, chapter, or
    // article named. A real gap, not an unread dialog.
  },
  {
    id: "aps-aymer",
    name: "Margaret Aymer",
    title: "The First Presbyterian Church, Shreveport, D. Thomason Professor of New Testament Studies",
    otherRoles: ["Vice-President for Academic Affairs and Dean of Faculty"],
    areas: ["new-testament", "womanist-feminist-theology", "black-church-studies"],
    degrees: [
      "BA, Harvard University, 1989",
      "MDiv, Union Theological Seminary, 1996",
      "PhD, Union Theological Seminary, 2004",
      "Doctor of Humane Letters, honoris causa, Hood Theological Seminary, 2013",
    ],
    publications: [
      { title: "Islanders, Islands and the Bible: Ruminations", kind: "book", year: 2015, publisher: "Semeia Studies", note: "with Jione Havea" },
      { title: "James: Diaspora Rhetorics of a Friend of God", kind: "book", year: 2014, publisher: "Sheffield Publishing" },
      { title: "Fortress Commentary on the Bible", kind: "book", year: 2014, publisher: "Fortress Press", note: "with Gale A. Yee" },
      { title: "Confessing the Beatitudes", kind: "book", year: 2011, note: "the 2011 Horizons Bible Study, the annual Bible-study resource for Presbyterian women; won the Award of Excellence from the Associated Church Press" },
      { title: "First Pure, then Peaceable: Frederick Douglass Reads James", kind: "book", year: 2008, publisher: "T&T Clark" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-bonilla",
    name: "Patricia Bonilla",
    title: "Assistant Professor of Christian Education",
    areas: ["christian-education-formation", "latino-hispanic-ministry", "youth-ministry"],
    degrees: [
      "BA, Lake Forest College, 2003",
      "MA in Christian Education, Garrett-Evangelical Theological Seminary, 2007",
      "MPhil, Drew University School of Theology, 2016",
      "PhD, Garrett-Evangelical Theological Seminary (ABD)",
    ],
    // Bio names two venues she's "published in" (Religious Education journal;
    // Wellsprings) without naming an article title in either — left out per
    // this project's rule against printing a title that was never actually
    // given (same call Claremont made on Froelich's two unnamed journal
    // credits). Only the one item below carries an actual title.
    publications: [
      { title: "Connecting Faith and Justice: Junior High Curriculum, Lectionary Year C", kind: "chapter", year: 2018, publisher: "UMC Church and Society" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-budwey",
    name: "Stephanie Budwey",
    title: "Associate Professor of Sacred Music and Dean of the Chapel",
    areas: ["church-music", "liturgy-worship"],
    // Confirmed gap, not a miss: her dialog contains only name, title (twice),
    // and a work phone number — no Education heading, no Bio, re-checked with
    // a longer AJAX wait to rule out a slow load. This is the one person the
    // original harvest also found no degrees for (18/19).
  },
  {
    id: "aps-caruthers",
    name: "Rodney Caruthers II",
    title: "Assistant Professor of New Testament",
    areas: ["new-testament"],
    degrees: [
      "BA, Oakland University",
      "MDiv, Ashland Theological Seminary",
      "ThM, Candler School of Theology, Emory University",
      "MA, Near Eastern Studies, University of Michigan",
      "PhD, Near Eastern Studies, University of Michigan",
    ],
    // Bio is thorough on research interests (Second Temple Judaism, Jewish
    // and Christian Apocrypha, ancient magic) and lists three society
    // memberships and four teaching areas, but names no book, chapter, or
    // article title. A real gap.
  },
  {
    id: "aps-cuellar",
    name: "Gregory L. Cuéllar",
    title: "Full Professor of Hebrew Bible and the Ruth A. Campbell Chair of Biblical Studies",
    areas: ["hebrew-bible", "latino-hispanic-ministry", "mission-social-justice"],
    degrees: ["Texas A&M University, Kingsville, 1999", "MDiv, Southwestern Baptist Theological Seminary, 2000", "PhD, Brite Divinity School at Texas Christian University, 2006"],
    publications: [
      { title: "Migration and Western Biblical Interpretation: Empire, Method, and the Politics of Displacement", kind: "book", year: 2026, publisher: "Brill" },
      { title: "Resacralizing the Other at the U.S.–Mexico Border: A Borderland Hermeneutic", kind: "book", year: 2020, publisher: "Routledge" },
      { title: "Empire, the British Museum, and the Making of the Biblical Scholar in the Nineteenth Century", kind: "book", year: 2019, publisher: "Palgrave" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-foote",
    name: "Ted V. Foote Jr.",
    title: "Professor in the Louis H. and Katherine S. Zbinden Distinguished Chair of Pastoral Ministry and Leadership",
    areas: ["congregational-leadership", "practical-theology"],
    degrees: ["BA, Baylor University, 1975", "MDiv, Austin Presbyterian Theological Seminary, 1979"],
    publications: [
      { title: "Public Education Is a Sacred Calling: Citizen Stakeholders All - For the Common Good", kind: "book", year: 2016, note: "funded by a study grant from The Louisville Institute" },
      { title: "Being Disciples of Jesus in a Dot.Com World", kind: "book", year: 2003, note: "with P. Alex Thornburg" },
      { title: "Being Presbyterian in the Bible Belt", kind: "book", year: 2000, note: "with P. Alex Thornburg" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-gallardo",
    name: "Ángel Jazak Gallardo",
    title: "Assistant Professor of Church History",
    areas: ["church-history", "wesleyan-studies", "latino-hispanic-ministry"],
    workingOn: "Teaches surveys on the history of Christian thought, race and religion in the Americas, and Methodism, plus seminars on figures like Bartolomé de Las Casas. Came to Austin in 2022 from Perkins, where he was associate director of the intern program — which makes him the person here most likely to understand what a United Methodist candidate needs.",
    degrees: ["BA, Eastern University, 2006", "MDiv, Duke University Divinity School, 2009", "PhD, Southern Methodist University, 2018"],
    // His in-progress first book, "Mapping the Nature of Empire," is named in
    // the bio without a publisher or forthcoming status — left out, same
    // "not a publication until a publisher is named" call as elsewhere.
    publications: [
      { title: "Mapping the Origins of Christianity in the Americas", kind: "chapter", year: 2024, publisher: "Bloomsbury Religions in North America Series" },
      { title: "Legacies of Slavery and Dispossession in the Texas/Mexico Borderlands", kind: "chapter", publisher: "Baylor University Press", note: "in an edited volume on borderlands Baptist history; under review as of this bio" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-greenway",
    name: "William Greenway",
    title: "Professor of Philosophical Theology",
    areas: ["systematic-theology"],
    degrees: ["BA, Houghton College, 1986", "MDiv, Princeton Theological Seminary, 1989", "PhD, Princeton Theological Seminary, 1997"],
    publications: [
      { title: "Agape Ethics: Moral Realism and Love for All Life", kind: "book", year: 2017, publisher: "Cascade Books" },
      { title: "The Challenge of Evil: Grace and the Problem of Suffering", kind: "book", year: 2016, publisher: "Westminster John Knox" },
      { title: "For the Love of All Creatures: The Story of Grace in Genesis", kind: "book", year: 2015, publisher: "Eerdmans", note: "named one of the Academy of Parish Clergy's Top Ten Books for Parish Ministry, 2015" },
      { title: "A Reasonable Belief: Why God and Faith Make Sense", kind: "book", year: 2015, publisher: "Westminster John Knox" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-helsel-carolyn",
    name: "Carolyn Browning Helsel",
    title: "Associate Professor in the Blair Monie Distinguished Chair of Homiletics",
    areas: ["preaching", "ethics-public-theology"],
    degrees: ["BA, Whitworth University, 2001", "MDiv, Princeton Theological Seminary, 2004", "ThM, Princeton Theological Seminary, 2010", "PhD, Emory University, 2014"],
    publications: [
      { title: "The Flawed Family of God: Stories about the Imperfect Families in Genesis", kind: "book", year: 2021, publisher: "Westminster John Knox Press", note: "with Song-Mi Suzie Park — the same book Park's own bio names" },
      { title: "The A.B.C.'s of Diversity: Helping Kids Embrace Our Differences", kind: "book", year: 2020, publisher: "Chalice Press", note: "with Y. Joy Harris-Smith" },
      { title: "Anxious to Talk About It: Helping White Christians Talk Faithfully About Race", kind: "book", year: 2018, note: "with Preaching about Racism, won the 2018 Book(s) of the Year Award from the Association of Parish Clergy" },
      { title: "Preaching about Racism: A Guide for Faith Leaders", kind: "book", year: 2018, note: "with Anxious to Talk About It, won the 2018 Book(s) of the Year Award from the Association of Parish Clergy" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-helsel-philip",
    name: "Philip Browning Helsel",
    title: "Associate Professor in the Nancy Taylor Williamson Distinguished Chair in Pastoral Care",
    areas: ["pastoral-care-counseling", "chaplaincy"],
    degrees: ["BA, Anderson University, 2000", "MDiv, Princeton Theological Seminary, 2004", "PhD, Princeton Theological Seminary, 2012"],
    // Bio names research interests (mental illness, grief, family systems,
    // place attachment, aging, creativity) and a grant, but no book, chapter,
    // or article title. A real gap.
  },
  {
    id: "aps-irizarry",
    name: "José R. Irizarry",
    title: "President and Professor of Practical Theology",
    areas: ["practical-theology", "latino-hispanic-ministry"],
    degrees: ["BA, University of Puerto Rico", "MDiv, McCormick Theological Seminary", "PhD, Northwestern University"],
    // Bio is entirely administrative/career history (president since 2022,
    // prior posts at the PC(USA) Board of Pensions, Villanova, Cambridge,
    // etc.) — no publication named. A real gap.
  },
  {
    id: "aps-jensen",
    name: "David H. Jensen",
    title: "Professor in the Clarence N. and Betty B. Frierson Distinguished Chair of Reformed Theology",
    areas: ["systematic-theology"],
    degrees: ["BA, Carleton College, 1990", "MAR, Yale University, 1994", "PhD, Vanderbilt University, 1999"],
    // 11 books named in the bio — capped at 5, most recent first.
    publications: [
      { title: "Christian Theology in a Pluralistic Age", kind: "edited-volume", year: 2024, publisher: "Pickwick Publications" },
      { title: "Christian Understandings of Christ: The Historical Trajectory", kind: "book", year: 2019, publisher: "Fortress" },
      { title: "Always Being Reformed: Challenges and Prospects for the Future of Reformed Theology", kind: "edited-volume", year: 2016, publisher: "Pickwick" },
      { title: "1 and 2 Samuel", kind: "book", year: 2015, publisher: "Westminster John Knox" },
      { title: "God, Desire and a Theology of Human Sexuality", kind: "book", year: 2012, publisher: "Westminster John Knox" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-jeong",
    name: "Donghyun Jeong",
    title: "Assistant Professor of New Testament",
    areas: ["new-testament"],
    degrees: ["BA, Yonsei University, 2009", "MDiv, Presbyterian University and Theological Seminary, 2014", "STM, Yale University Divinity School, 2016", "PhD, Emory University, 2021"],
    // Bio also says his work has "appeared in prestigious academic journals,
    // including the Journal of Biblical Literature and Novum Testamentum"
    // without naming an article title in either — left out, same rule as
    // Bonilla above.
    publications: [
      { title: "Pauline Baptism among the Mysteries: Ritual Messages and the Promise of Initiation", kind: "book", year: 2023, publisher: "De Gruyter" },
      { title: "The Wandering People of God: A (Re)introduction to the Letter to the Hebrews Using a Sociolocative Textual Approach", kind: "chapter", publisher: "SBL Press", note: "in Currents in Korean American and Korean Biblical Interpretation, forthcoming as of this bio" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-lord",
    name: "Jennifer L. Lord",
    title: "The Dorothy B. Vickery Professor of Homiletics and Liturgical Studies",
    areas: ["preaching", "liturgy-worship"],
    degrees: ["AB, Albion College, 1986", "MDiv, Princeton Theological Seminary, 1989", "PhD, Graduate Theological Union, 2003"],
    // Her four named "current book projects" (The Sunday Meeting; Preaching
    // and The Church's Year; Pilgrimage: A Lenten Devotional; Another Year
    // with the Orthodox) have no publisher or forthcoming status — left out.
    // The longest bio of the 19; capped at 5, most recent first.
    publications: [
      { title: "Introduction to the Revised Common Lectionary", kind: "chapter", year: 2021, publisher: "Westminster John Knox", note: "in Connections: A Lectionary Commentary for Preaching and Worship, a multi-volume series she also served as Editorial Board Member for" },
      { title: "Choreography in the Worship Space", kind: "chapter", year: 2014, publisher: "Abingdon", note: "in Worship Matters: Sourcebook for Worship Leaders" },
      { title: "Presiding Basics", kind: "chapter", year: 2014, publisher: "Abingdon", note: "in Worship Matters: Sourcebook for Worship Leaders" },
      { title: "Finding Language and Imagery: Words for Holy Speech", kind: "book", year: 2009, publisher: "Fortress Press", note: "Elements of Preaching series; translated into Mandarin (2015) and Indonesian (2018)" },
      { title: "Sacraments and Preaching", kind: "chapter", year: 2008, publisher: "Abingdon", note: "in New Interpreters Bible Handbook of Preaching" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-park",
    name: "Suzie Park",
    title: "Associate Professor of Old Testament",
    areas: ["hebrew-bible"],
    degrees: ["BA, Amherst College, 2000", "MDiv, Harvard Divinity School, 2003", "MA, Harvard University, 2006", "PhD, Harvard University, 2010"],
    publications: [
      { title: "Love in the Hebrew Bible", kind: "book", year: 2023, publisher: "Westminster John Knox" },
      { title: "The Flawed Family of God: Stories about the Imperfect Families in Genesis", kind: "book", year: 2021, publisher: "Westminster John Knox", note: "with Carolyn Helsel — the same book Helsel's own bio names" },
      { title: "2 Kings", kind: "book", year: 2019, publisher: "Liturgical Press", note: "Wisdom Commentary series" },
      { title: "Transformation and Demarcation of Jacob's 'Flocks' in Genesis 30: 25-43: Identity, Election and the Role of the Divine", kind: "article", year: 2010, note: "Catholic Biblical Quarterly" },
      { title: "The Frustration of Wisdom: Wisdom, Counsel, and Divine Will in 2 Samuel 17:1–23", kind: "article", year: 2009, note: "Journal of Biblical Literature" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-rigby",
    name: "Cynthia L. Rigby",
    title: "The W. C. Brown Professor of Theology",
    areas: ["systematic-theology", "womanist-feminist-theology"],
    degrees: ["BA, Brown University, 1986", "MDiv, Princeton Theological Seminary, 1989", "PhD, Princeton Theological Seminary, 1998"],
    // Two books "currently completing"/"tentatively titled" — no publisher
    // commitment beyond a named press with no date — left out.
    publications: [
      { title: "Holding Faith: A Practical Introduction to Christian Faith", kind: "book", year: 2018, publisher: "Abingdon Press" },
      { title: "Connections", kind: "edited-volume", year: 2018, publisher: "Westminster John Knox", note: "general editor of this nine-volume lectionary commentary series; first volume published 2018" },
      { title: "The Promotion of Social Righteousness", kind: "book", year: 2010, publisher: "Witherspoon Press" },
      { title: "Blessed One: Protestant Perspectives on Mary", kind: "edited-volume", year: 2002, publisher: "Westminster John Knox Press", note: "co-editor with Beverly Gaventa" },
      { title: "Power, Powerlessness, and the Divine: New Inquiries in Bible and Theology", kind: "edited-volume", year: 1997, publisher: "Duke University Press" },
    ],
    publicationsSource: FACULTY_URL,
  },
  {
    id: "aps-silva-mccormick",
    name: "Crystal Silva-McCormick",
    title: "Assistant Professor of Evangelism and Missions and Director of Latinx Programs",
    areas: ["evangelism-church-planting", "world-christianity", "latino-hispanic-ministry", "interreligious"],
    degrees: [
      "BA, missiology, Lubbock Christian University, 2002",
      "MDiv, Austin Presbyterian Theological Seminary, 2010",
      "ThM, Lutheran School of Theology at Chicago",
      "PhD, Lutheran School of Theology at Chicago",
    ],
    // Bio covers ministry service and denominational roles (UCC treasurer,
    // church-plant moderator) but names no book, chapter, or article. A real
    // gap — her 2023 appointment is a two-year teaching position, consistent
    // with not yet having a book-length publication record here.
  },
  {
    id: "aps-zirschky",
    name: "Andrew Zirschky",
    title: "Research Professor in Youth Ministry",
    otherRoles: ["Director of the MAYM program"],
    areas: ["youth-ministry", "practical-theology"],
    degrees: ["BA, Northwest Nazarene University, 1997", "MDiv, Princeton Theological Seminary, 2007", "PhD, Princeton Theological Seminary, 2014"],
    // The only dialog with a "Download CV" link (Nov 2019). Checked it: it
    // confirms these same two books and otherwise lists book reviews and
    // conference talks, which this project doesn't count as publications.
    publications: [
      { title: "Teaching Outside the Box: Five Approaches for Opening Scripture with Teenagers", kind: "book", year: 2017, publisher: "Abingdon Press" },
      { title: "Beyond the Screen: Youth Ministry for the Connected But Alone Generation", kind: "book", year: 2015, publisher: "Abingdon" },
    ],
    publicationsSource: FACULTY_URL,
  },
];

function buildFaculty(): FacultyMember[] {
  return ROSTER.map((e) => {
    const suggested = suggestAreas(e.title);
    const missed = suggested.filter((a) => !e.areas.includes(a));
    if (missed.length) {
      console.log(`  [areas-audit] ${e.name}: title-suggester also flags ${missed.join(", ")} (title: "${e.title}")`);
    }

    const member: FacultyMember = {
      id: e.id,
      seminarySlug: "austin-presbyterian",
      name: e.name,
      title: e.title,
      areas: e.areas,
      profileUrl: FACULTY_URL,
    };
    if (e.otherRoles?.length) member.otherRoles = e.otherRoles;
    if (e.workingOn) member.workingOn = e.workingOn;
    if (e.degrees?.length) member.degrees = e.degrees;
    if (e.publications?.length) {
      member.publications = e.publications.slice(0, 5);
      member.publicationsSource = e.publicationsSource ?? FACULTY_URL;
      member.publicationsAsOf = today();
    }
    return member;
  });
}

async function main() {
  await get(FACULTY_URL, { fresh });
  await get(MDIV_URL, { fresh });
  await get(AID_URL, { fresh });

  const faculty = buildFaculty();
  await writeFile(join(ROOT, "data/faculty/austin-presbyterian.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/austin-presbyterian.json`);

  console.log("NOTE: data/seminaries/austin-presbyterian.json is NOT regenerated by this script —");
  console.log("its ordination/cost/degrees content predates this pass and was verified separately.");
  console.log("Only facultyNote was hand-updated alongside this faculty re-harvest.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
