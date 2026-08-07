// Wesley Theological Seminary (Washington, DC) — one of the 13 UMC schools.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//   - The MDiv degree-requirements text lives in Wesley's own PDF Course
//     Catalog (AY 2026-2027), found from the /academics/catalog/ page's list
//     of PDF links (WTS-Course-Catalog-AY-2026-2027_Final.pdf — the newest
//     one; several stale prior-year catalogs sit on the same page and must
//     not be picked by accident). pdftotext -layout renders the "Required
//     Courses" / "Denominational Requirements" prose cleanly.
//   - Wesley's catalog sits on the OTHER side of the Duke/Phillips line from
//     where an earlier draft of this harvest put it. Its own words: "For
//     those students seeking ordination and commissioning as a deacon or
//     elder in The United Methodist Church, many of the required foundational
//     courses for the M.Div. degree will fulfill the UMC's requirements...
//     Additional courses must be taken as well. These are church requirements
//     for ordination and NOT A SEMINARY REQUIREMENT for the professional
//     Master's degree... Accordingly, Wesley students take these courses AS
//     ELECTIVES toward their degree program." That is Wesley disclaiming the
//     obligation, not taking it up — the required-umc-track test is whether
//     the SCHOOL binds a UMC student, and here the school explicitly says it
//     does not. Evangelism, mission-of-the-church, and um-studies are all
//     `elective`, matching Saint Paul's "may be expected to take... check
//     with your appropriate judicatories" rather than Duke's "must fulfill"
//     or Phillips' "required to take." What Wesley DOES do, unusually well,
//     is name specific course menus for each — six options for evangelism,
//     four for mission, a fixed pair for UM studies — which is real,
//     concrete help for planning electives even though it isn't a
//     requirement. That detail lives in the coverage notes and gapRemedies,
//     not in an inflated status.
//   - Faculty: the public "Meet Our Faculty" grid on
//     /about/leadership-and-faculty/ links each of the 17 core faculty to a
//     "Read More" — which is an Elementor popup, not a separate page (the
//     Austin Presbyterian pattern). The difference from Austin: Wesley's
//     Elementor popups are rendered server-side into the SAME page's raw
//     HTML (each wrapped in a
//     `<div data-elementor-type="popup" data-elementor-id="NNNNN" ...>`
//     block), just hidden by CSS/JS until clicked — so no browser automation
//     is needed, only htmlToText on the right slice of one already-fetched
//     page. This is confirmed by grepping the raw HTML for "Ph.D." and
//     finding real bio/Education/Publications text, not a shell.
//   - The 17 popup IDs are NOT contiguous (73987 sits out of sequence among
//     64439–64671, apparently a later hire inserted after the template block
//     was built) — matched by name, not assumed sequential.
//   - Below the 17-person grid, the same page lists ~15 Emeriti Faculty by
//     name+title only (no bio/no popup) and ~40 Adjunct Faculty by name+degree
//     only (no title, no subject). Emeriti get roster entries (their titles
//     name a field); adjuncts do not (nothing to assign an area from) — see
//     facultyNote.
//   - Second pass (2026-08-07), closing the gap the deep-scrape tracker
//     flagged: re-fetched the live page and read every one of the 17 core
//     popups' raw HTML directly (not just the rendered text), specifically
//     checking the people who were missing `degrees`/`publications` for
//     content the first pass might have walked past. Result: the first pass
//     was already close to the ceiling of what Wesley's popups publish, not
//     a parsing-depth miss — there is no automated parser here to begin
//     with, each entry above is hand-transcribed from its popup. Confirmed
//     by person:
//       - Na's and Page's popups contain no Education/Publications content
//         at all (verified in the raw HTML, not just rendered text) — Page's
//         entire bio is the one sentence "Rev. Dr. Jonathan Page."
//       - Chon's, Sinkfield's, and Lazarus's popups have an Education list
//         but genuinely no Publications section.
//       - Crena's popup likewise has no Publications section (consistent
//         with her not-yet-defended PhD, see below).
//       - Parrish's popup has no "Publications" heading, but does name one
//         forthcoming book in prose — added below, the one real addition
//         this pass found.
//       - The 15 Emeriti Faculty are confirmed, in the raw HTML, to be a
//         bare `<li>` list with no links and no popups — nothing to read
//         past name+title for any of them.
//     Net: publications 10/32 → 11/32 (Parrish). Degrees stay 14/32 — Na and
//     Page's popups have no Education section to add, and Crena's remains a
//     deliberate omission (see below). Next re-harvest: re-check this same
//     set of names before assuming there's more to find; if the popups
//     haven't changed, there isn't.
//   - Two names never earned the degree their bio implies is imminent:
//     Lucila Crena ("will defend her Ph.D. ... this Fall") and Kevin Lazarus
//     ("is completing his Ph.D."). Both have a PhD-track line under the
//     "Education" heading (Lazarus) or bio prose only (Crena). Recorded
//     conservatively: Crena gets no `degrees` field at all (no Education
//     list, and the earned-but-unconferred distinction is real); Lazarus's
//     PhD line is kept but annotated in-progress rather than presented as
//     conferred.
//
// Run: node scripts/harvest/wesley.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { pdfToText } from "./lib/text.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const CATALOG_URL =
  "https://www.wesleyseminary.edu/wp-content/uploads/2026/07/WTS-Course-Catalog-AY-2026-2027_Final.pdf";
const FACULTY_URL = "https://www.wesleyseminary.edu/about/leadership-and-faculty/";
const SCHOLARSHIPS_URL = "https://www.wesleyseminary.edu/admissions/scholarships/";
const COST_URL = "https://www.wesleyseminary.edu/admissions/estimating-the-cost-of-attendance/";
const ATS_URL = "https://www.ats.edu/member-schools/wesley-theological-seminary";

async function main() {
  // --- Touch every source so it's cached/pinned alongside this run, even
  // though the coverage table and faculty roster below are hand-verified
  // against the fetched text (prose/HTML analysis, not mechanical parsing —
  // see README "Two rules the pilot batch bought, expensively"). ---
  const catalogPdf = await get(CATALOG_URL, { fresh, binary: true });
  const catalogText = pdfToText(catalogPdf.path);
  if (!/81 credit hours/.test(catalogText)) {
    console.warn("WARNING: catalog no longer states 81 credit hours for the M.Div. — re-verify the coverage table and degree entry.");
  }
  // Simple substring checks against the layout-preserved text, not a
  // whitespace-collapsed version of it: the catalog is laid out in two
  // columns, and collapsing newlines to spaces before matching interleaves
  // unrelated column text (confirmed by hand while building this table —
  // see the header comment). Each course code is checked independently
  // rather than as one long phrase spanning a line break.
  for (const marker of ["CM-251", "ST-463", "ST-464", "CM-129", "CM-150"]) {
    if (!catalogText.includes(marker)) {
      console.warn(`WARNING: catalog no longer contains "${marker}" — re-verify the denominational-requirements coverage rows by hand.`);
    }
  }

  await get(FACULTY_URL, { fresh });
  await get(SCHOLARSHIPS_URL, { fresh });
  await get(COST_URL, { fresh });
  await get(ATS_URL, { fresh });

  const asOf = today();

  const faculty = buildFaculty();
  await writeFile(
    join(ROOT, "data/faculty/wesley.json"),
    JSON.stringify(faculty, null, 2) + "\n",
    "utf8",
  );
  console.log(`wrote ${faculty.length} faculty to data/faculty/wesley.json`);

  const profile = buildProfile(asOf);
  await writeFile(
    join(ROOT, "data/seminaries/wesley.json"),
    JSON.stringify(profile, null, 2) + "\n",
    "utf8",
  );
  console.log("wrote data/seminaries/wesley.json");
}

// ---------------------------------------------------------------------------
// Faculty
//
// The 17-person "Meet Our Faculty" grid at FACULTY_URL, each entry hand-read
// from its Elementor popup (embedded server-side in that same page's HTML —
// see file header). Plus 15 Emeriti Faculty (name+title only, no popup — the
// page lists them as a bare list below the grid). ~40 Adjunct Faculty (name +
// terminal degree only, no title/subject) are excluded — see facultyNote.
// ---------------------------------------------------------------------------

function id(name: string): string {
  return (
    "wesley-" +
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[().]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  );
}

function buildFaculty(): FacultyMember[] {
  const asOf = today();
  const pub = FACULTY_URL;

  const core: FacultyMember[] = [
    {
      id: id("Paul K.-K. Cho"),
      seminarySlug: "wesley",
      name: "Paul K.-K. Cho",
      title: "Professor of Hebrew Bible and Woodrow and Mildred Miller Chair of Biblical Studies and Theology",
      areas: ["hebrew-bible"],
      degrees: ["BA, Yale University", "MDiv, Yale Divinity School", "PhD, Harvard University"],
      publications: [
        { title: "Myth, History, and Metaphor in the Hebrew Bible", kind: "book", year: 2019, publisher: "Cambridge University Press" },
        { title: "Willingness to Die and the Gift of Life: Suicide and Martyrdom in the Hebrew Bible", kind: "book", year: 2022, publisher: "Eerdmans" },
        { title: "The Integrity of Job 1 and 42:11–17", kind: "article", year: 2014, publisher: "Catholic Biblical Quarterly 76", note: "230–51." },
        { title: "Job 2 and 42:7–10 as Narrative Bridge and Theological Pivot", kind: "article", year: 2017, publisher: "Journal of Biblical Literature 136", note: "857–77." },
        { title: "A House of Her Own: The Tactical Deployment of Strategy in Esther", kind: "article", year: 2021, publisher: "Journal of Biblical Literature 140", note: "663–82." },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Woong-Sik (Timothy) Chon"),
      seminarySlug: "wesley",
      name: "Woong-Sik (Timothy) Chon",
      title: "Director of the Henry Luce III Center for the Arts and Religion & Instructor of Visual Liturgy",
      areas: ["liturgy-worship"],
      degrees: ["MDiv, Union Presbyterian Seminary", "MFA, Pratt Institute", "BFA, Eastern Michigan University"],
      profileUrl: pub,
    },
    {
      id: id("Lucila Crena"),
      seminarySlug: "wesley",
      name: "Lucila Crena",
      title: "Assistant Professor of Ethics and Public Theology",
      areas: ["ethics-public-theology"],
      // No `degrees`: her popup bio names a BA and an MTS but states her PhD
      // (Theology, Ethics, and Culture, University of Virginia) was not yet
      // earned as of the harvest — "will defend her Ph.D. ... dissertation
      // ... this Fall" — and there is no separate "Education" list to quote
      // verbatim the way the other entries have. Recording a partial,
      // hand-summarized degree list here risked exactly the kind of
      // silently-wrong training record the validator's honorary-degree rule
      // exists to catch, so it is left off rather than approximated.
      profileUrl: pub,
    },
    {
      id: id("Rick Elgendy"),
      seminarySlug: "wesley",
      name: "Rick Elgendy",
      title: "The Martha Ashby Carr Professor of Christian Ethics and Public Theology",
      areas: ["ethics-public-theology"],
      degrees: ["Ph.D, University of Chicago", "M.A., University of Chicago", "B.A., Georgetown University"],
      publications: [
        { title: "Renegotiating Power, Theology, and Politics", kind: "edited-volume", year: 2015, publisher: "Palgrave MacMillan", note: "Co-edited with Joshua Daniel; includes Elgendy's introduction and chapter, \"Revelation without Authority.\"" },
        { title: "Hope, Cynicism, and Complicity: Worldly Resistance in Barth", kind: "article", publisher: "Political Theology 17:2", note: "182–98." },
        { title: "Practices of the Self and (Spiritually) Disciplined Resistance: What Michel Foucault Could Have Said about Gregory of Nyssa", kind: "article", publisher: "Studia Patristica LXII", note: "103–13." },
        { title: "Reconsidering Resurrection, Incarnation, and Nature in Schleiermacher's Glaubenslehre", kind: "article", publisher: "International Journal of Systematic Theology 15:3", note: "301–23." },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Michael Koppel"),
      seminarySlug: "wesley",
      name: "Michael Koppel",
      title: "Howard Chandler Robbins Professor of Pastoral Theology and Congregational Care and Associate Dean for Academic Affairs",
      // The normalizer would also fire "congregational-leadership" on the
      // "Congregational Care" clause; read in context that is pastoral care
      // of congregations, not church-administration leadership, so it is not
      // claimed here.
      areas: ["pastoral-care-counseling"],
      degrees: ["Ph.D., Claremont School of Theology, with President's Award for Excellence", "M.Div., Yale University Divinity School, cum laude", "B.A., University of California, Davis, Phi Beta Kappa, cum laude"],
      publications: [
        { title: "Coming Home: The Body in Pastoral and Spiritual Care", kind: "book", note: "Forthcoming." },
        { title: "Bridge Work: Conversations between the Bible and Pastoral Theology", kind: "edited-volume", year: 2017, publisher: "Cambridge Scholars", note: "Co-editor with Denise Dombkowski Hopkins." },
        { title: "The Prophets and Pastoral Care", kind: "chapter", year: 2016, publisher: "The Oxford Handbook of the Prophets, ed. Carolyn Sharp", note: "Forthcoming." },
        { title: "The Contemplative Bow in Teaching and Learning Pastoral Care", kind: "article", year: 2013, publisher: "Teaching Theology & Religion 16.1", note: "76–88." },
        { title: "“Let Them Be Like the Snail that Dissolves into Slime”: Pastoral and Theological Perspectives on Divine and Human Violence in the Bible", kind: "article", year: 2013, publisher: "Journal of Pastoral Theology 23.2", note: "Co-authored with Denise Dombkowski Hopkins; 2.1–2.18." },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Kevin Lazarus"),
      seminarySlug: "wesley",
      name: "Kevin Lazarus",
      title: "Assistant Professor of Systematic Theology and Ethics",
      // His own bio names Methodist studies as something he will teach
      // ("systematic theology, Methodist studies, and disability theology and
      // ministry") though his title alone gives the normalizer no signal for
      // it — added by hand from that sentence, per the Duke MANUAL_AREA
      // pattern.
      areas: ["systematic-theology", "ethics-public-theology", "wesleyan-studies"],
      degrees: [
        "PhD, Emory University (in progress per his own Wesley bio — “is completing his Ph.D. in Religion at Emory University” — not yet conferred)",
        "MDiv, Candler School of Theology",
        "BA, Auburn University",
      ],
      profileUrl: pub,
    },
    {
      id: id("Veronice Miles"),
      seminarySlug: "wesley",
      name: "Veronice Miles",
      title: "Interim Dean, Mary Elizabeth McGehee Joyce Professor of Preaching, and Director of African American Church Studies",
      areas: ["preaching", "black-church-studies"],
      degrees: [
        "Ph.D., Religious Education and Homiletics, Graduate Division of Religion, Emory University, 2009",
        "M.Div., Candler School of Theology, Emory University, 1999",
        "Ed.S., Counseling and Student Personnel Services, University of Florida, 1981",
        "M.Ed., Counselor Education, University of Florida, 1981",
        "B.A., Psychology, University of Florida, 1978",
      ],
      publications: [
        { title: "Embodied Hope: A Homiletical Theology Reflection", kind: "book", year: 2021, publisher: "CASCADE Books" },
        { title: "Twentieth Century Women Preachers and Their Sermons", kind: "chapter", publisher: "A Companion to Preaching and the Sermon, eds. Robert Ellison & Keith A. Francis, Brill", note: "Anticipated 2023." },
        { title: "Disciple, Will You Let Me Wash Your Feet?", kind: "chapter", year: 2021, publisher: "Narrative Mode and Theological Claim in Johannine Literature: Essays in Honor of Gail R. O'Day, eds. Huber, Hylen, and Wright IV, SBL Press", note: "163–68." },
        { title: "Hope Flows from the Inside Out", kind: "article", year: 2019, publisher: "The Thread, Princeton Theological Seminary", note: "June 2019." },
        { title: "Help Wanted: Harvesters for God's Vineyard (Luke 10:1-12, 17-20)", kind: "chapter", year: 2014, publisher: "The World is Waiting for You, eds. Pamela R. Durso and LeAnn Gunter Johns, Smyth & Helwys" },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Hyemin J. Na"),
      seminarySlug: "wesley",
      name: "Hyemin J. Na",
      title: "Assistant Professor of Worship, Media and Culture and Chapel Elder of Oxnam Chapel at Wesley Theological Seminary",
      areas: ["liturgy-worship"],
      profileUrl: pub,
    },
    {
      id: id("Jonathan Page"),
      seminarySlug: "wesley",
      name: "Jonathan Page",
      title: "Director, Lewis Center for Church Leadership",
      areas: ["congregational-leadership"],
      profileUrl: pub,
    },
    {
      id: id("Lorena M. Parrish"),
      seminarySlug: "wesley",
      name: "Lorena M. Parrish",
      title: "Professor of Urban Ministries, Director of the Institute for Community Engagement and Co-Director of the Certificate in Children and Youth Ministry and Advocacy",
      // Her title alone ("Urban Ministries") is outside the site's controlled
      // vocabulary; areas below are read from her own bio's stated
      // specializations ("Urban Ministry; Womanist Theology; ... Theology and
      // the Black Church and Practical Theology") rather than guessed.
      areas: ["practical-theology", "black-church-studies", "womanist-feminist-theology", "youth-ministry"],
      degrees: [
        "Ph.D., Union Theological Seminary (New York)",
        "M.Phil., Union Theological Seminary (New York)",
        "M.Div., Union Theological Seminary (New York)",
        "M.S.S.W., Columbia University School of Social Work",
      ],
      // Her popup has no "Publications" heading, but does name one work in
      // prose: "Her upcoming book is Forsaking the Lowly Jesus for Lifestyles
      // of the Rich and Famous, or How Shall We Be Saved?..." — kept as a
      // forthcoming book, same pattern as Koppel's and Miles's forthcoming
      // entries elsewhere in this file.
      publications: [
        {
          title: "Forsaking the Lowly Jesus for Lifestyles of the Rich and Famous, or How Shall We Be Saved?: A Theological Reflection on the Legacy of Christian Attitudes toward Wealth and Poverty and Its Impact upon the Black Church",
          kind: "book",
          note: "Forthcoming.",
        },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Emily Peck"),
      seminarySlug: "wesley",
      name: "Emily Peck",
      title: "Visiting Professor of Practical Theology and Director of Research and Education at the Hub for (Re)imagining Ministry and Co-Director of the Children and Youth Ministry and Advocacy Specialization",
      areas: ["practical-theology", "christian-education-formation", "spiritual-formation", "youth-ministry", "new-testament"],
      degrees: ["Th.D., Duke University Divinity School", "M.Div., Union Theological Seminary", "B.A., Washington and Lee University"],
      publications: [
        { title: "Nobody's Perfect: Redefining Sin and Mistakes in Adolescent Christian Education", kind: "book", year: 2025, publisher: "Fortress" },
        { title: "Speaking Truth: Women Raising Their Voices in Prayer", kind: "book", year: 2020, publisher: "Abingdon" },
        { title: "Let's Talk About Sex: Meeting Curiosity with Honesty", kind: "chapter", year: 2019, publisher: "When Kids Ask Hard Questions: Faith-Filled Responses to Tough Topics, eds. Bromleigh McClenaghan and Karen Ware Jackson, Chalice" },
        { title: "Arm in Arm with Adolescent Girls: Educating into the New Creation", kind: "book", year: 2018, publisher: "Pickwick" },
        { title: "We Pray With Her: Encouragement for All Women Who Lead", kind: "book", year: 2018, publisher: "Abingdon" },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Kyunglim Shin Lee"),
      seminarySlug: "wesley",
      name: "Kyunglim Shin Lee",
      title: "Bishop Sundo Kim Chair in World Christianity, Professor of the Practice of Spiritual Formation, and Vice President for International Relations at Wesley Theological Seminary",
      areas: ["world-christianity", "spiritual-formation"],
      degrees: [
        "Undergraduate degree, Methodist Theological University (Seoul)",
        "M.Div., Garrett-Evangelical Theological Seminary",
        "D.Min., Wesley Theological Seminary",
      ],
      publications: [
        { title: "Missionary Power, Urgent Inspection of Korean Missionary", kind: "book", year: 2017, publisher: "Hongsungsa Press (Seoul)", note: "Korean-language title, as translated by Wesley's own bio of her." },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("W. Antoni Sinkfield"),
      seminarySlug: "wesley",
      name: "W. Antoni Sinkfield",
      title: "Associate Dean for Community Life",
      // An administrative, not a teaching, title — his popup bio names no
      // courses taught. Read as best-fit from his own stated remit
      // ("responsible for the programmatic, academic and spiritual life of
      // seminary students"); flagged as a judgment call, not a school-stated
      // subject.
      areas: ["spiritual-formation"],
      degrees: [
        "Ph.D. in Ethical and Creative Leadership (specialization: Dr. Martin Luther King, Jr.), Union Institute and University",
        "M.Div., Vanderbilt Divinity School",
        "B.Sc. in Marketing, Tennessee Technological University",
      ],
      profileUrl: pub,
    },
    {
      id: id("Laura C. Sweat Holmes"),
      seminarySlug: "wesley",
      name: "Laura C. Sweat Holmes",
      title: "Professor of New Testament",
      areas: ["new-testament"],
      degrees: ["B.A. in Religious Studies and History, University of North Carolina at Chapel Hill", "M.Div., Princeton Theological Seminary", "Ph.D., Princeton Theological Seminary"],
      publications: [
        { title: "John 1-12: A Commentary in the Wesleyan Tradition", kind: "book", year: 2020, publisher: "New Beacon Bible Commentaries, Beacon Hill Press (Kansas City)", note: "Introduction and concluding section by George Lyons." },
        { title: "The Theological Role of Paradox in the Gospel of Mark", kind: "book", year: 2013, publisher: "Library of New Testament Studies 492, T. & T. Clark (London)" },
        { title: "Transformed Discipleship: A Canonical Reading of Martha and Mary", kind: "chapter", year: 2018, publisher: "The Usefulness of Scripture: Essays in Honor of Robert W. Wall, eds. Castelo, Koenig, and Nienhuis, Eisenbrauns", note: "154–77." },
        { title: "The Gospel of John—A Reading Guide", kind: "article", year: 2014, publisher: "SPU Center for Biblical and Theological Education", note: "Eleven-section commentary, published online, Winter 2014." },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Douglas D. Tzan"),
      seminarySlug: "wesley",
      name: "Douglas D. Tzan",
      title: "Associate Professor of Church History, Mission, and Methodist Studies and Director of the Doctor of Ministry and Course of Study Programs",
      areas: ["church-history", "wesleyan-studies", "world-christianity"],
      degrees: ["Ph.D., Boston University, Religious Studies", "M.Div., Iliff School of Theology, with distinction", "B.Ar.Sc., South Carolina College, magna cum laude with honors"],
      publications: [
        { title: "William Taylor and the Mapping of the Methodist Missionary Tradition: The World His Parish", kind: "book", year: 2019, publisher: "Lexington Books (Lanham, MD)" },
        { title: "John Dempster and the Missionary Origins of Methodist Theological Education", kind: "article", year: 2019, publisher: "Methodist History 58, nos. 1 & 2", note: "October 2019/January 2020: 18–28." },
        { title: "Redeeming Vanity Fair: Theological Debates over Fundraising within the W.F.M.S.", kind: "article", year: 2016, publisher: "Methodist History 55, nos. 1 & 2", note: "October 2016/January 2017: 73–85." },
        { title: "Arioi for Christ: An Exploration of Early Missions by Society Islanders", kind: "article", year: 2009, publisher: "Missiology: An International Review 37, no. 2", note: "221–35." },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Philip Wingeier-Rayo"),
      seminarySlug: "wesley",
      name: "Philip Wingeier-Rayo",
      title: "Visiting Professor of Missiology, World Christianity and Methodist Studies",
      // "Missiology" itself does not match the normalizer's bare /missions?/
      // pattern (the word "mission" is not a substring of "missiology");
      // evangelism-church-planting added by hand from his bio's own framing
      // ("a Wesleyan theology of mission and evangelism") and classes taught
      // (CM-205 Mission of the Church in the Contemporary World).
      areas: ["world-christianity", "wesleyan-studies", "evangelism-church-planting"],
      degrees: [
        "Ph.D., Chicago Theological Seminary, Theology, Ethics, and Culture",
        "M.A., Garrett-Evangelical Theological Seminary, Theological Studies",
        "M.A., Evangelical Theological Seminary (Matanzas, Cuba), Theology",
        "B.A., Earlham College, Human Development & Social Relations, and Spanish",
      ],
      publications: [
        { title: "La Evangelización y la Misión de Dios: Una Teología Bíblica", kind: "book", year: 2020, publisher: "Wesley's Foundery Books (Nashville, TN)" },
        { title: "La Biblia a través de los ojos de Juan Wesley: 52 clases de discipulado para pequeños grupos", kind: "book", year: 2019, publisher: "Upper Room/Discipleship Resources (Nashville, TN)", note: "With foreword by Justo González." },
        { title: "Where are the Poor? A Comparison of the Ecclesial Base Communities and Pentecostalism—A Case Study in Cuernavaca, Mexico", kind: "book", year: 2011, publisher: "Pickwick Publications (Eugene, OR)" },
        { title: "Cuban Methodism: The Untold Story of Survival and Revival", kind: "book", year: 2006, publisher: "Dolphins and Orchids (Atlanta, GA)" },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
    {
      id: id("Carla Works"),
      seminarySlug: "wesley",
      name: "Carla Works",
      title: "President",
      otherRoles: ["Dean", "Woodrow and Mildred Miller Chair of Biblical Theology"],
      areas: ["new-testament"],
      degrees: ["Ph.D., Princeton Theological Seminary", "M.A.R., Yale University Divinity School", "M.A.Th., Southwestern Baptist Theological Seminary", "B.A., Williams Baptist University"],
      publications: [
        { title: "The Least of These: Paul and the Marginalized", kind: "book", year: 2020, publisher: "Eerdmans" },
        { title: "The Church in the Wilderness: Paul's Use of Exodus Traditions in 1 Corinthians", kind: "book", year: 2014, publisher: "Mohr Siebeck" },
        { title: "Philippians", kind: "chapter", year: 2012, publisher: "The Women's Bible Commentary, 3rd Edition, Westminster John Knox" },
      ],
      publicationsSource: pub,
      publicationsAsOf: asOf,
      profileUrl: pub,
    },
  ];

  // Emeriti Faculty: name + title only, no bio/no popup. Areas read from the
  // title text itself; several are genuine judgment calls flagged in the
  // harvest report rather than resolved silently (Birch's "Biblical
  // Theology" spans both testaments the way an unqualified "Biblical
  // Studies" title does elsewhere in this dataset; Marullo's sociology of
  // "Missional Communities" and Sokolove's "Art and Music" have no exact
  // controlled-vocabulary match).
  const emeriti: FacultyMember[] = [
    { id: id("Bruce Birch"), seminarySlug: "wesley", name: "Bruce Birch", title: "Dean Emeritus and Professor Emeritus of Biblical Theology", areas: ["hebrew-bible", "new-testament"], profileUrl: pub },
    { id: id("Sathianathan Clarke"), seminarySlug: "wesley", name: "Sathianathan Clarke", title: "Professor Emeritus of World Religions and Systematic Theology", areas: ["systematic-theology", "interreligious"], profileUrl: pub },
    { id: id("Youtha Hardman-Cromwell"), seminarySlug: "wesley", name: "Youtha Hardman-Cromwell", title: "Emerita Professor of Practice in Ministry and Mission", areas: ["practical-theology"], profileUrl: pub },
    { id: id("Lucy Lind Hogan"), seminarySlug: "wesley", name: "Lucy Lind Hogan", title: "Professor Emerita of Preaching and Worship", areas: ["preaching", "liturgy-worship"], profileUrl: pub },
    { id: id("Eileen Guenther"), seminarySlug: "wesley", name: "Eileen Guenther", title: "Faculty Emerita of Church Music", areas: ["church-music"], profileUrl: pub },
    { id: id("Sam Marullo"), seminarySlug: "wesley", name: "Sam Marullo", title: "Faculty Emeritus Director of Research on Missional Communities; Professor of Sociology", areas: ["congregational-leadership"], profileUrl: pub },
    { id: id("Michael McCurry"), seminarySlug: "wesley", name: "Michael McCurry", title: "Distinguished Professor Emeritus of Public Theology", areas: ["ethics-public-theology"], profileUrl: pub },
    { id: id("Beverly Mitchell"), seminarySlug: "wesley", name: "Beverly Mitchell", title: "Professor Emerita of Church History and Systematic Theology", areas: ["church-history", "systematic-theology"], profileUrl: pub },
    { id: id("Lewis Parks"), seminarySlug: "wesley", name: "Lewis Parks", title: "Emeritus Professor of Theology; Ministry and Congregational Development", areas: ["systematic-theology", "congregational-leadership"], profileUrl: pub },
    { id: id("Sharon Ringe"), seminarySlug: "wesley", name: "Sharon Ringe", title: "Emerita Professor of New Testament", areas: ["new-testament"], profileUrl: pub },
    { id: id("Deborah Sokolove"), seminarySlug: "wesley", name: "Deborah Sokolove", title: "Faculty Emerita of Art and Music", areas: ["church-music"], profileUrl: pub },
    { id: id("Lovett Weems"), seminarySlug: "wesley", name: "Lovett Weems", title: "Emeritus Distinguished Professor of Church Leadership; Senior Consultant, G. Douglass Lewis Center for Church Leadership", areas: ["congregational-leadership"], profileUrl: pub },
    { id: id("Sondra Wheeler"), seminarySlug: "wesley", name: "Sondra Wheeler", title: "Professor Emerita of Christian Ethics", areas: ["ethics-public-theology"], profileUrl: pub },
    { id: id("Josiah Young"), seminarySlug: "wesley", name: "Josiah Young", title: "Professor Emeritus of Systematic Theology", areas: ["systematic-theology"], profileUrl: pub },
    { id: id("Denise Dombkowski Hopkins"), seminarySlug: "wesley", name: "Denise Dombkowski Hopkins", title: "Professor Emerita of Hebrew Bible", areas: ["hebrew-bible"], profileUrl: pub },
  ];

  return [...core, ...emeriti];
}

// ---------------------------------------------------------------------------
// Seminary profile
// ---------------------------------------------------------------------------

function buildProfile(asOf: string): SeminaryProfile {
  const senateSource = "https://www.gbhem.org/education/schools-of-theology/";
  const senateAsOf = "2026-07-07";

  return {
    slug: "wesley",
    name: "Wesley Theological Seminary",
    city: "Washington",
    state: "DC",
    url: "https://www.wesleyseminary.edu/",
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
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements.",
      },
      coverageSource: CATALOG_URL,
      coverageAsOf: asOf,
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "BI-101 and BI-102, Introduction to the Hebrew Bible (6 credit hours), are two of the fixed courses every M.Div. candidate takes in the first 27 hours of study.",
        },
        {
          area: "new-testament",
          status: "required",
          note: "BI-171 and BI-172, Introduction to the New Testament (6 credit hours), are two of the fixed courses every M.Div. candidate takes in the first 27 hours of study.",
        },
        {
          area: "theology",
          status: "required",
          note: "ST-305 and ST-306, Systematic Theology (6 credit hours), are required of every M.Div. candidate (taken after the first 27 credit hours).",
        },
        {
          area: "church-history",
          status: "required",
          note: "CH-101 and CH-102, The Church in History (6 credit hours), are two of the fixed courses every M.Div. candidate takes in the first 27 hours of study.",
        },
        {
          area: "worship-liturgy",
          status: "required",
          note: "PW-101, Foundations in Christian Worship (3 credit hours), is a fixed required course for every M.Div. candidate (in the first 27 hours), on top of the further “Preaching and Worship Distribution Requirement” (any two 300-level PW courses) taken later.",
        },
        {
          area: "preaching",
          status: "required",
          note: "PW-125, Foundations of Preaching (3 credit hours), is a fixed required course for every M.Div. candidate (in the first 27 hours), on top of the further “Preaching and Worship Distribution Requirement” taken later.",
        },
        {
          area: "evangelism",
          status: "elective",
          note: "Wesley's catalog, under “Denominational Requirements,” disclaims rather than asserts this one: “For those students seeking ordination and commissioning as a deacon or elder in The United Methodist Church... [a]dditional courses must be taken as well. These are church requirements for ordination and NOT A SEMINARY REQUIREMENT for the professional Master's degree. Accordingly, Wesley students take these courses AS ELECTIVES toward their degree program.” That is Wesley stepping back from the obligation, not taking it up — the ¶324.4 requirement is real, but it is the Discipline's and your Board's, not Wesley's degree program's. Helpfully, though, Wesley DOES name exactly which electives satisfy it: a menu of six courses — CM-129, CM-222, CM-270, CM-271, CM-273, or CM-470 (2–3 credit hours) — any one of which does the job.",
        },
        {
          area: "mission-of-the-church",
          status: "elective",
          note: "The same disclaiming sentence covers this row too: these are “church requirements for ordination and not a Seminary requirement,” taken “as electives.” Wesley names its menu just as specifically as it does for evangelism: CM-150, CM-205, WR-204, or WR-294 (2–3 credit hours), any one of which satisfies Mission of the Church in the World.",
        },
        {
          area: "um-studies",
          status: "elective",
          note: "Same disclaimer again: not a Seminary requirement, taken as electives. Wesley's named menu here is a fixed pair rather than a choice: Polity of the United Methodist Church CM-251 (2 credit hours) and History and Doctrine in Methodist Traditions ST-463 and ST-464 (4 credit hours) — 6 credit hours total, landing exactly on ¶324.4's 6-hour UM-studies floor with nothing to spare.",
        },
      ],
      gapSummary: [
        "Six of the nine ¶324.4 areas are built into every Wesley M.Div. candidate's required core — no planning needed. The other three — evangelism, mission of the church, and United Methodist studies — sit in elective space: Wesley's own catalog says so directly, calling them “church requirements for ordination and not a Seminary requirement,” taken “as electives.”",
        "That is a real gap in the degree's required core, but a narrow and well-marked one: Wesley doesn't leave you guessing which electives to pick. It names exactly six courses for evangelism (any one), four for mission of the church (any one), and a fixed pair for UM studies (CM-251 plus ST-463/464, totaling precisely the 6 hours ¶324.4 asks for). Treat these three as electives you choose on purpose, early, rather than ones that happen automatically.",
      ],
      gapRemedies: [
        {
          blurb: "Register for CM-251 (Polity of the United Methodist Church) and ST-463/ST-464 (History and Doctrine in Methodist Traditions) as three of your elective slots — together they're exactly the 6 hours ¶324.4 asks for in United Methodist studies, and Wesley names them by course number so there's nothing to guess.",
        },
        {
          blurb: "Pick one evangelism elective (CM-129, CM-222, CM-270, CM-271, CM-273, or CM-470) and one mission elective (CM-150, CM-205, WR-204, or WR-294) — any one from each menu satisfies that area, so choose based on timing or topic rather than worrying which one 'counts.'",
        },
        {
          blurb: "Bring this list to your faculty advisor when you plan your elective schedule, and confirm it with your District Superintendent or conference Board of Ordained Ministry — Wesley's own catalog points you there directly, since these are the church's requirements for certification, not the seminary's for graduation.",
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "410 students (275.20 FTE)",
        source: ATS_URL,
        asOf,
        note: "ATS's member-school page reports this as of Fall 2025, for the whole school, not M.Div. only. ATS also reports 11 full-time faculty (11.00 FTE) for the same period.",
      },
      studentFacultyRatio: {
        value: "11 full-time faculty (11.00 FTE) against 410 students (275.20 FTE)",
        source: ATS_URL,
        asOf,
        note: "Raw counts, not a computed ratio — ATS does not publish one directly, and Wesley's own “Meet Our Faculty” grid lists more than 11 people once visiting/administrative faculty and the president are included, so the ATS full-time-faculty figure is narrower than this profile's faculty roster.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$870 per credit hour (Academic Credit Master level — M.Div., M.A., M.T.S.); $774 per credit hour (Doctor of Ministry level)",
        source: CATALOG_URL,
        asOf: "2026-08-01",
        note: "Stated for the 2026–27 academic year. An 81-credit M.Div. at $870/credit is roughly $70,470 in gross tuition before aid.",
      },
      fees: [
        { label: "Student Fee (5+ credit hours/semester)", amount: "$712 per semester" },
        { label: "Student Fee (4 or fewer credit hours/semester)", amount: "$293 per semester" },
        { label: "Application Fee", amount: "$60, non-refundable" },
        { label: "Confirmation of Admission and Orientation Fee", amount: "$125, due within 30 days of acceptance, non-refundable" },
        { label: "Graduation Fee", amount: "$250" },
      ],
      pctReceivingAid: {
        value: "All Wesley students receive automatic tuition assistance made possible by the Ministerial Education Fund of The United Methodist Church and by endowment income and grants",
        source: CATALOG_URL,
        asOf: "2026-08-01",
        note: "Wesley's own wording, not a rounded percentage it publishes. The same passage states this assistance “enable[s] us to charge a tuition rate that is less than a third of the actual cost” — a benefit built into the sticker tuition rate above for every student, regardless of denomination, not a separate award applied for.",
      },
      typicalAward: {
        value: "Merit scholarships awarded during admissions, tiered by name: Bishop's (100% of tuition), Oxnam (75%), Governor's (60%), Next Call (50%), Presidential (40%), Wesley Merit (25%) — each up to 81 credit hours for the M.Div.",
        source: SCHOLARSHIPS_URL,
        asOf,
        note: "Open to students of all denominations based on prior academic achievement and demonstrated leadership potential; apply for admission by February 1 for that fall's cohort to be considered. Not conditioned on UMC candidacy status.",
      },
      namedScholarships: [
        {
          name: "Ellura Harvey Winters Award",
          blurb: "A first-year-only award covering tuition for an entering student who “exhibits potential for academic excellence and for leadership in The United Methodist Church.” Recipients may be considered for further aid after a successful first year.",
          url: SCHOLARSHIPS_URL,
        },
        {
          name: "United Methodist Student Scholarships",
          blurb: "Wesley states that students from United Methodist annual conferences “are considered for special matching scholarships awarded by Wesley DC and their home conference” — a direct, named link between UMC ordination-track standing and funding, on top of (not instead of) the denomination-neutral merit scholarships above.",
          url: SCHOLARSHIPS_URL,
        },
      ],
      honestNote: "Wesley's scholarships page also directs United Methodist students to the General Board of Higher Education and Ministry, the United Methodist Higher Education Foundation, their conference's Ministerial Education Fund tuition grants, and a long list of named annual-conference scholarships — all administered outside Wesley itself, so this profile does not attempt to price them; ask your conference's Board of Ordained Ministry registrar what applies to you. The Ministerial Education Fund subsidy folded into Wesley's sticker tuition rate benefits every student, not UMC candidates specifically — it is the reason Wesley's per-credit rate looks low next to schools without that denominational subsidy, but it is not a named, candidacy-conditioned award the way the Winters Award and the conference-matching scholarships are.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "M.Div.",
        credits: 81,
        typicalYears: "4 years minimum full-time; must be completed within 10 years of admission",
        modalities: ["residential", "hybrid", "online"],
        blurb: "81 credit hours: foundational courses (Hebrew Bible, New Testament, church history, worship, preaching, pastoral care, leadership, religion and the arts, and more) in the first 27 hours, systematic theology and ethics after, a Preaching and Worship distribution requirement, and Contextual Education (Spiritual Formation for the Practice of Ministry plus a supervised internship). Roughly 21–25 credit hours are open electives.",
        url: "https://www.wesleyseminary.edu/academics/master-of-divinity/",
      },
      {
        name: "Master of Arts",
        abbr: "M.A.",
        credits: 36,
        modalities: ["residential", "hybrid"],
        blurb: "A basic understanding of theological disciplines for existing careers in public life or general theological education — not a full ordination-track degree.",
        url: "https://www.wesleyseminary.edu/academics/master-of-arts/",
      },
      {
        name: "Master of Theological Studies",
        abbr: "M.T.S.",
        credits: 60,
        modalities: ["residential", "hybrid"],
        blurb: "Multi-disciplinary theological education, including a final M.T.S. paper; can support certification for various forms of lay ministry.",
        url: "https://www.wesleyseminary.edu/academics/master-of-theological-studies/",
      },
      {
        name: "Doctor of Ministry",
        abbr: "D.Min.",
        credits: 30,
        typicalYears: "3 years minimum; within 6 years of admission",
        modalities: ["hybrid"],
        blurb: "Intensive-term and online coursework plus a D.Min. project and project paper, for clergy already experienced in ministry practice. A separate Global Track is also offered.",
        url: "https://www.wesleyseminary.edu/academics/doctor-of-ministry/",
      },
    ],

    concentrations: [
      "African-American Church Studies",
      "Children, Youth Ministry, and Advocacy",
      "Urban Ministry",
      "Chaplaincy",
      "Military Chaplaincy",
      "Public Theology",
      "Theology and the Arts",
    ],

    partnerships: [
      {
        kind: "consortium",
        partner: "Washington Theological Consortium",
        blurb: "Cross-registration among Consortium member schools; students pay their home institution's tuition rate for courses taken through it.",
        url: "https://www.wesleyseminary.edu/",
      },
      {
        kind: "joint-degree",
        partner: "American University School of International Service",
        blurb: "Dual-degree routes combining Wesley's M.Div., M.A., or M.T.S. with American University's Master of Public Policy, Master of Public Administration, or M.A. in International Peace and Conflict Resolution.",
        url: "https://www.wesleyseminary.edu/academics/dual-degree-and-specialized-programs/",
      },
    ],

    courseOfStudy: {
      blurb: "Wesley hosts a United Methodist Course of Study School, run mostly online with in-person weekend intensives (Fall/Winter/Spring) plus a July on-campus intensive term, for licensed local pastors working toward the Basic and Advanced Course of Study.",
      url: "https://www.wesleyseminary.edu/academics/course-of-study/",
    },

    facultyNote: "Covers the 17 people in Wesley's own “Meet Our Faculty” grid (bios read from Elementor popups embedded in the same page's HTML — see the harvest script for how) plus the 15 people in its separate “Emeriti Faculty” list (name and title only, no bio). Roughly 40 more names appear under “Adjunct Faculty” (Masters and D.Min. tracks) with a name and terminal degree only — no title and no subject stated anywhere on the page — and are excluded here because there is nothing to assign a study area from; this mirrors Phillips' exclusion of its own affiliate-instructor list for the same reason, though unlike Phillips' case, nothing on Wesley's adjunct list is specifically a United Methodist Studies appointment.",

    contact: {
      admissionsUrl: "https://www.wesleyseminary.edu/apply/",
      phone: "202.885.8600",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
