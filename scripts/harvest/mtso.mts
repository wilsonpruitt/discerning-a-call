// Methodist Theological School in Ohio — one of the 13 UMC schools of
// theology, and the smallest independent one in this project so far (not
// university-embedded; not part of a consortium like Duke's Houses of Study
// or ITC's Gammon).
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//   - The MDiv curriculum, its credit total, and its ordination-requirements
//     language all live in one document: the 2025-26 Academic Catalog and
//     Student Handbook PDF (poppler + -layout renders its course-code table
//     cleanly). mtso.edu's own MDiv landing page is marketing prose with no
//     course codes, same pattern as Saint Paul's spst.edu.
//   - Faculty directory (14 full-time faculty) is plain server-rendered HTML
//     at /about-mtso/faculty-directory/, one card per person with name, title,
//     and a link to a real per-professor page. Each per-professor page lists
//     "Education" (degrees) and, for most, a CV-derived publications list —
//     but three (Baek, Gibson, Stroud) print only a "view CV" PDF link with
//     no publications in the page body itself. A follow-up pass (2026-08-07)
//     opened all three CVs (poppler pdftotext -layout): Gibson's and
//     Stroud's each have a clean, separable "PUBLICATIONS" /
//     "SCHOLARLY PUBLICATIONS" heading and are recorded below, sourced to the
//     CV PDF itself rather than the bio page. Baek's CV has no publications
//     section at all — Education, Research Interests, Awards, Teaching,
//     Paper Presentations, Service — she's a 2024 PhD with presentations but
//     no separable publications list yet, so her entry stays without one
//     rather than promoting a talk to a publication.
//   - THE COVERAGE FINDING, and the strongest version of it seen yet: MTSO's
//     catalog states its Evangelism, Mission of the Church, and UM Studies
//     electives are UMC-track electives in THREE separate, independently
//     worded places — the M.Div. requirements page itself ("Students should
//     choose electives most appropriate to their denominational or
//     professional goals... Students pursuing ordination in the United
//     Methodist Church should confirm with their annual conference regarding
//     commissioning requirements and eligibility, but most commonly take the
//     following electives"), and twice more in the separate "Course of Study
//     and Ordination" chapter, for deacons ("a master's degree... plus the
//     completion of 32 credit hours of Basic Graduate Theological Education")
//     and elders ("Those seeking ordination in the United Methodist Church
//     will choose courses in evangelism, mission of the church in the
//     contemporary world, and United Methodist History, Doctrine, and Polity
//     AS ELECTIVES in the M.Div. program. Students should check with their
//     annual conference regarding commissioning requirements and eligibility.
//     Two-thirds or all three of the denominational courses MAY BE REQUIRED
//     TO BE COMPLETED PRIOR TO THE INTERVIEW" — note that the "may be
//     required" there is the annual conference's interview requirement, not
//     an MTSO degree requirement). Every one of the three sentences names the
//     conference/judicatory, not MTSO, as the party holding the obligation —
//     the same shape as Wesley's "church requirements... and not a Seminary
//     requirement" and Saint Paul's "may be expected... check with your
//     appropriate judicatories." Scored elective on all three areas, not
//     required-umc-track: MTSO's own words disclaim the obligation as
//     explicitly as any school in this project has.
//   - Six named MDiv/MTS specializations exist (Spirituality, Biblical
//     Languages and Texts, Interreligious Contexts, Chaplaincy, Unitarian
//     Universalist Studies, Ecology and Justice) — none of them a
//     denominational-studies track, unlike Duke's Houses of Study.
//   - MTSO directs its own regional Course of Study School of Ohio (Joon-Sik
//     Park, director) — folded into `courseOfStudy`, matching Saint Paul and
//     Duke's precedent for this field.
//
// Run: node scripts/harvest/mtso.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { pdfToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://www.mtso.edu";
const FACULTY_DIR_URL = `${BASE}/about-mtso/faculty-directory/`;
const CATALOG_PDF_URL = `${BASE}/site/assets/files/2103/academic_catalog_2025-26_aug18.pdf`;
const TUITION_PDF_URL = `${BASE}/site/assets/files/2748/tuition_sheet_2026-27.pdf`;
const SCHOLARSHIPS_URL = `${BASE}/admissions/scholarships-and-financial-aid/scholarships-for-new-students/premier-scholarships/`;

// The three faculty whose bio pages link a CV PDF instead of listing
// publications in the page body (see top-of-file note). Each person's own
// bio page links their exact CV file; these are that same link, so a
// changed CV shows up as a changed cache key on the next --fresh run.
const BAEK_CV_URL = `${BASE}/site/assets/files/3115/baek-_cv_2024_updated_jul_16.pdf`;
const GIBSON_CV_URL = `${BASE}/site/assets/files/3003/vitaedrgeno2023.pdf`;
const STROUD_CV_URL = `${BASE}/site/assets/files/3113/stroudcv2024.pdf`;

// Core full-time faculty only, read from the live faculty directory
// (https://www.mtso.edu/about-mtso/faculty-directory/, "Full-Time Faculty
// Directory" heading) and each person's own bio page. As with Duke and Saint
// Paul, areas were set by hand from title + bio prose + publication record,
// not auto-applied from suggestAreas() — see the inline notes below for the
// handful the title-only ruleset would have missed or gotten wrong.
interface Entry {
  name: string;
  title: string;
  otherRoles?: string[];
  profileUrl: string;
  areas: StudyArea[];
  degrees?: string[];
  publications?: { title: string; kind: "book" | "edited-volume" | "article" | "chapter"; year?: number; note?: string }[];
  // Set only for Baek/Gibson/Stroud, whose publications were read from a
  // linked CV PDF rather than the bio page itself — publicationsSource
  // should point at the CV, the thing actually read, not the bio page it
  // was linked from.
  publicationsSourceUrl?: string;
  // Override the id's surname segment when taking the last space-separated
  // word would be wrong — a suffix ("Jr.") or a two-word surname
  // ("Van Meter") both break the naive last-word rule Saint Paul's script
  // used safely because none of its names had either shape.
  idSurname?: string;
}

const ROSTER: Entry[] = [
  {
    name: "Lisa Allen-McLaurin",
    title: "Professor of Worship, Music and Spirituality",
    otherRoles: ["Associate Dean"],
    profileUrl: `${BASE}/about-mtso/faculty-directory/lisa-allen-mclaurin/`,
    // suggestAreas("Professor of Worship, Music and Spirituality") correctly
    // finds liturgy-worship and spiritual-formation from "Worship" and
    // "Spirituality"; it has no rule for "Music" alone, so church-music is
    // added by hand. Her 2025 book (Over My Head: The Power of Ancestral
    // Music to Future the Black Church) is explicitly about the Black
    // church, not incidentally about it — black-church-studies added from
    // that, not from the generic title.
    areas: ["liturgy-worship", "spiritual-formation", "church-music", "black-church-studies"],
    degrees: [
      "Ph.D., University of Southern Mississippi, 1993",
      "M.Div., Candler School of Theology, Emory University, 2003",
      "M.M.E., University of Southern Mississippi, 1989",
      "B.M. (Piano Performance), Millsaps College, 1986",
      "B.A. (Music Education), Millsaps College, 1986",
    ],
    publications: [
      { title: "Over My Head: The Power of Ancestral Music to Future the Black Church", kind: "book", year: 2025 },
      { title: "The OneWord Worship Model: A New Paradigm for Church Worship Planning", kind: "book", year: 2023 },
      { title: "A Womanist Theology of Worship: Liturgy, Justice, and Communal Righteousness", kind: "book", year: 2021 },
      { title: "\"Where Will You Go from Here?\" in The Unity of the Church and Human Sexuality: Toward a Faithful United Methodist Witness (GBHEM, 2017)", kind: "chapter", year: 2017 },
      { title: "\"Jesus Will Fix It ... Afterwhile: The Role of Gospel Music in Tyler Perry Productions\" in Womanist and Feminist Responses to Tyler Perry's Cultural Productions (Palgrave Macmillan, 2014)", kind: "chapter", year: 2014 },
    ],
  },
  {
    name: "Jee Hyun Baek",
    title: "Assistant Professor of Theology",
    profileUrl: `${BASE}/about-mtso/faculty-directory/jee-hyun-baek/`,
    areas: ["systematic-theology"],
    degrees: [
      "Ph.D., Boston University School of Theology, 2024",
      "Th.M., Duke Divinity School, 2016",
      "M.Div., Duke Divinity School, 2014",
      "M.A., Ewha Womans University, 2010",
      "B.A., Ewha Womans University, 2008",
    ],
    // Her bio page links a CV PDF (BAEK_CV_URL) rather than listing
    // publications in the page body. Opened 2026-08-07: the CV has Education,
    // Research Interests, Awards, Teaching Experience, Research & Project
    // Management, Paper Presentations and Invited Talks, Service, Ministry,
    // Denominational Affiliation, Languages, and Memberships — no
    // "Publications" heading and nothing else that separates as one. She's a
    // 2024 PhD; her CV's public-facing output so far is presentations, not
    // publications. Left without a publications field rather than promoting
    // a conference talk to a publication.
  },
  {
    name: "Toni Bond",
    title: "Assistant Professor of Ethics",
    profileUrl: `${BASE}/about-mtso/faculty-directory/toni-bond/`,
    // "Ethics" alone triggers ethics-public-theology. Her publication record
    // (reproductive justice, explicitly framed as a "Womanist Theo-Ethic")
    // is read for womanist-feminist-theology, which the bare title gives no
    // hint of — the same kind of title-blindness the README's Ángel
    // Gallardo example warns about.
    areas: ["ethics-public-theology", "womanist-feminist-theology"],
    degrees: [
      "Ph.D., Claremont School of Theology, 2020",
      "M.A. (Theology/Ethics), Claremont School of Theology, 2015",
      "B.A. (Women and Gender Studies), DePaul University, 2012",
    ],
    publications: [
      { title: "\"A Womanist Theo-Ethic of Reproductive Justice\" in T&T Clark Reader in Abortion and Religion: Jewish, Christian, and Muslim Perspectives, eds. Rebecca Todd Peters and Margaret D. Kamitsuka (Bloomsbury, 2022)", kind: "chapter", year: 2022 },
      { title: "\"Laying the Foundations for a Reproductive Justice Movement\" in Radical Reproductive Justice: Foundation, Theory, Practice, Critique (The Feminist Press at CUNY, 2017)", kind: "chapter", year: 2017 },
      { title: "\"Aretha's Funeral and the White Supremacist Imagination,\" Rewire.News (September 7, 2018)", kind: "article", year: 2018 },
      { title: "\"Cherry-Picking the Bible to Mistreat the Stranger: Religion on Family Separation,\" Rewire.News (June 20, 2018)", kind: "article", year: 2018 },
    ],
  },
  {
    name: "Valerie Bridgeman",
    title: "Professor of Homiletics and Hebrew Bible",
    otherRoles: ["Dean and Vice President for Academic Affairs"],
    profileUrl: `${BASE}/about-mtso/faculty-directory/valerie-bridgeman/`,
    areas: ["preaching", "hebrew-bible"],
    degrees: [
      "Ph.D., Baylor University, 2002",
      "M.Div., Austin Presbyterian Theological Seminary, 1990",
      "B.A., Trinity University, 1986",
    ],
    publications: [
      { title: "\"The Thin Place in the Heart of God,\" Journal for Preachers 45, no. 1 (Advent 2021): 27-30", kind: "article", year: 2021 },
      { title: "\"'A Long Ways from Home': Displacement, Lament, and Singing Protest in Psalm 137,\" Perspectives in Religious Studies 44 (2017): 213-23", kind: "article", year: 2017 },
      { title: "\"Song of Solomon Introduction\" and \"Song of Solomon Commentary,\" Baylor Annotated Study Bible, eds. W.H. Bellinger Jr. and Todd D. Still (Baylor University Press, 2014)", kind: "chapter", year: 2014 },
      { title: "\"The Inspiration of Rizpah's Courageous Helplessness\" and \"Personal Reflections on the 'Hybrid' Identity of the Phoenician Woman,\" Global Perspectives on the Bible, eds. Mark Roncace and Joseph Weaver (Pearson Education, 2014)", kind: "chapter", year: 2014 },
    ],
  },
  {
    name: "Christopher Carter",
    title: "Associate Professor of Theology, Ecology and Race",
    profileUrl: `${BASE}/about-mtso/faculty-directory/christopher-carter/`,
    // "Theology" triggers systematic-theology. Neither "Ecology" nor "Race"
    // matches any rule (religion-and-science needs the word "science";
    // mission-social-justice needs "social justice" or similar, not bare
    // "race"/"justice" — the areas.mts comment explicitly warns against
    // matching bare "justice"). His two books (food justice, the ethics of
    // eating animals, both explicitly framed around racial and ecological
    // justice) are read for mission-social-justice by hand.
    areas: ["systematic-theology", "mission-social-justice"],
    degrees: [
      "Ph.D., Claremont School of Theology, 2015",
      "M.Div., Claremont School of Theology, 2010",
      "B.S. (Business Administration), Cornerstone University, 2007",
    ],
    publications: [
      { title: "The Spirit of Soul Food: Race, Faith, and Food Justice", kind: "book", year: 2021 },
      { title: "The Future of Meat Without Animals", kind: "book", year: 2016 },
    ],
  },
  {
    name: "Kate Common",
    title: "Assistant Professor of Public and Practical Theology",
    otherRoles: ["Director, Cross-Cultural Program"],
    profileUrl: `${BASE}/about-mtso/faculty-directory/kathryn-common/`,
    areas: ["ethics-public-theology", "practical-theology"],
    degrees: [
      "Ph.D., Boston University School of Theology",
      "M.A. (Theological Research), Andover Newton Theological School",
      "B.F.A. (Visual Communication Design), Kent State University",
    ],
    publications: [
      { title: "\"Introducing design thinking & practical theology: A new interdisciplinary partnership,\" Practical Matters Journal (October 14, 2019)", kind: "article", year: 2019 },
    ],
  },
  {
    name: "Eugene L. Gibson Jr.",
    title: "Assistant Professor of Homiletics",
    profileUrl: `${BASE}/about-mtso/faculty-directory/eugene-l-gibson-jr/`,
    idSurname: "gibson",
    areas: ["preaching"],
    degrees: [
      "Ph.D., Christian Theological Seminary, 2024",
      "M.A. (Religion/Urban Ministries), Trinity Evangelical Divinity School, 2001",
      "B.Th., Christian Bible College, 1998",
    ],
    // No publications in the page body; his CV (GIBSON_CV_URL) has a clean
    // "PUBLICATIONS" heading, opened 2026-08-07 — one book and four articles
    // (mostly in The African American Pulpit, a journal he later co-edited).
    // Five most-recent, cleanly separable citations kept; two of the CV's
    // own dates straddle a calendar-year turn ("Winter 2001-2002") and are
    // recorded without a single `year` rather than guessed.
    publications: [
      { title: "\"Courage Under Fire: Guarding the Romantic Flame from Life's Fiery Issues\" (MMGI Publishing, Chicago, IL, 2013)", kind: "book", year: 2013 },
      { title: "\"Hymns vs. Praise and Worship in the Twenty-First Century Black Church,\" The African American Pulpit, Trends in the Black Church Edition (Spring 2007)", kind: "article", year: 2007 },
      { title: "\"Neighbor, Go Get Your Harp: The Eulogy of Pastor Eugene Gibson, Sr.,\" The African American Pulpit, Eulogy II Edition (Spring 2005)", kind: "article", year: 2005 },
      { title: "\"The Point of No Return,\" The African American Pulpit (Fall 2004)", kind: "article", year: 2004 },
      { title: "\"To Be or Not to Be in Seminary: That is the Question,\" The African American Pulpit (Winter 2001-2002)", kind: "article" },
    ],
    publicationsSourceUrl: GIBSON_CV_URL,
  },
  {
    name: "Paul Kim",
    title: "Professor of Hebrew Bible in the Williams Chair of Biblical Studies",
    profileUrl: `${BASE}/about-mtso/faculty-directory/paul-kim/`,
    // "Biblical Studies" would claim both testaments, but "Hebrew Bible" is
    // also named — suggestAreas' own OT/NT disambiguation (see lib/areas.mts)
    // resolves this to hebrew-bible alone, matching his actual field.
    areas: ["hebrew-bible"],
    degrees: [
      "Ph.D., Claremont Graduate University, 1998",
      "Th.M., Princeton Theological Seminary, 1992",
      "M.Div., Princeton Theological Seminary, 1991",
      "B.A., Biola University, 1988",
    ],
    publications: [
      { title: "A New Era of Comparison in Biblical Studies: Case Studies in Applied Methodology (co-edited; Lexington Books, 2025)", kind: "edited-volume", year: 2025 },
      { title: "Violence against Women and Children in the Hebrew Bible: Between Trauma and Resilience (co-edited; Bloomsbury T&T Clark, 2024)", kind: "edited-volume", year: 2024 },
      { title: "Judges, Gender, and Intertextuality (co-edited; SBL Press, 2023)", kind: "edited-volume", year: 2023 },
      { title: "Second Wave Intertextuality and the Hebrew Bible (co-edited; SBL Press, 2019)", kind: "edited-volume", year: 2019 },
      { title: "Reading Isaiah: A Literary and Theological Commentary (Smyth & Helwys, 2016)", kind: "book", year: 2016 },
    ],
  },
  {
    name: "Paul Numrich",
    title: "Professor in the Snowden Chair for the Study of Religion and Interreligious Relations",
    profileUrl: `${BASE}/about-mtso/faculty-directory/paul-numrich/`,
    areas: ["interreligious"],
    degrees: [
      "Ph.D. (Comparative Religion), Northwestern University, 1992",
      "M.Div., Garrett-Evangelical Theological Seminary, 1984",
      "B.A., Aurora College, 1979",
    ],
    publications: [
      { title: "The Religious Dimensions of Shared Spaces: When and How Religion Matters in Space-Sharing Arrangements (Lexington Books, 2023)", kind: "book", year: 2023 },
      { title: "\"Epilogue: Understanding a Decentralised Social Movement,\" in The Interfaith Movement: Mobilising Religious Diversity in the 21st Century (Routledge, 2019)", kind: "chapter", year: 2019 },
      { title: "The Abrahamic Encounter: Local Initiatives, Large Implications (co-editor; Wipf and Stock, 2016)", kind: "edited-volume", year: 2016 },
      { title: "The Faith Next Door: American Christians and Their New Religious Neighbors (Oxford University Press, 2009)", kind: "book", year: 2009 },
    ],
  },
  {
    name: "M. Fulgence Nyengele",
    title: "Professor of Pastoral Care and Counseling in the L.A. Beeghly Chair",
    otherRoles: ["Director, Doctor of Ministry Program"],
    profileUrl: `${BASE}/about-mtso/faculty-directory/m-fulgence-nyengele/`,
    areas: ["pastoral-care-counseling"],
    degrees: [
      "Ph.D., Claremont School of Theology, 2002",
      "M.A., Claremont School of Theology, 1999",
      "M.Div., Claremont School of Theology, 1994",
      "B.S., Institut Superieur Pedagogique de Kamina, D.R. Congo, 1989",
    ],
    publications: [
      { title: "African Women's Theology, Gender Relations and Family Systems Theory: Pastoral Theological Considerations and Guidelines for Care and Counseling (Peter Lang, 2004)", kind: "book", year: 2004 },
      { title: "\"Gender Injustice and Pastoral Care in an African Context: Perichoresis as a Transformative Theological Resource,\" Journal of Theology 110 (2006): 45-56", kind: "article", year: 2006 },
    ],
  },
  {
    name: "Joon-Sik Park",
    title: "Professor in the E. Stanley Jones Chair of World Evangelism",
    otherRoles: ["Director, Course of Study School of Ohio"],
    profileUrl: `${BASE}/about-mtso/faculty-directory/joon-sik-park/`,
    // "Evangelism" triggers evangelism-church-planting automatically.
    // world-christianity is added by hand: his publication record is
    // missiology proper (missional ecclesiology, Korean Protestant
    // Christianity, a chapter titled "Evangelism and the Practice of
    // Hospitality" in a Wesleyan-mission volume) — the endowed chair title
    // alone ("World Evangelism") doesn't match any world-christianity rule.
    areas: ["evangelism-church-planting", "world-christianity"],
    degrees: [
      "Ph.D., Southern Baptist Theological Seminary, 1991",
      "M.Div., Asbury Theological Seminary, 1993",
      "B.A., Hankuk University of Foreign Studies, 1980",
    ],
    publications: [
      { title: "Missional Ecclesiologies in Creative Tension: H. Richard Niebuhr and John H. Yoder (Peter Lang, 2007)", kind: "book", year: 2007 },
      { title: "\"The Church as Embodiment of Transformative Trinitarian Faith\" in As if Jesus Mattered: Essays Presented to Glen Harold Stassen (Smyth & Helwys, 2014)", kind: "chapter", year: 2014 },
      { title: "\"Korean Protestant Christianity: A Missiological Reflection,\" International Bulletin of Missionary Research 36, no. 2 (2012)", kind: "article", year: 2012 },
      { title: "\"Evangelism and the Practice of Hospitality\" in Considering the Great Commission: Evangelism and Mission in the Wesleyan Spirit, eds. Stephen Gunter and Elaine Robinson (Abingdon, 2005)", kind: "chapter", year: 2005 },
      { title: "\"'As You Go': John Howard Yoder as a Mission Theologian,\" Mennonite Quarterly Review 78, no. 3 (2004)", kind: "article", year: 2004 },
    ],
  },
  {
    name: "Ryan Schellenberg",
    title: "Professor of New Testament",
    profileUrl: `${BASE}/about-mtso/faculty-directory/ryan-schellenberg/`,
    areas: ["new-testament"],
    degrees: [
      "Ph.D., University of St. Michael's College (University of Toronto), 2012",
      "M.A., Mennonite Brethren Biblical Seminary, 2005",
      "B.A., Canadian Mennonite University, 2003",
    ],
    publications: [
      { title: "Abject Joy: Paul, Prison, and the Art of Making Do (Oxford University Press, 2021)", kind: "book", year: 2021 },
      { title: "T&T Clark Handbook to the Historical Paul (edited with Heidi Wendt; Bloomsbury T&T Clark, 2022)", kind: "edited-volume", year: 2022 },
      { title: "\"'Making My Prayer with Joy': Epistolary Prayer as Emotional Practice in Philippians and 1 Thessalonians,\" Novum Testamentum 64 (2022): 79-98", kind: "article", year: 2022 },
      { title: "\"Subsistence, Swapping, and Paul's Rhetoric of Generosity,\" Journal of Biblical Literature 137 (2018): 215-34", kind: "article", year: 2018 },
      { title: "\"Paul, Samson Occom, and the Constraints of Boasting: A Comparative Rereading of 2 Corinthians 10-13,\" Harvard Theological Review 109 (2016): 512-35", kind: "article", year: 2016 },
    ],
  },
  {
    name: "Beth Stroud",
    title: "Assistant Professor of History",
    profileUrl: `${BASE}/about-mtso/faculty-directory/beth-stroud/`,
    // The title alone ("History") matches no church-history rule — exactly
    // the Ángel Gallardo trap the README warns about. Her own bio states her
    // field as "History of Christianity; American religious history..."
    // verbatim, which does match, so church-history is sourced from that
    // sentence rather than inferred from the job title.
    areas: ["church-history"],
    degrees: [
      "Ph.D., Princeton University, 2018",
      "S.T.M., Lutheran Theological Seminary at Philadelphia, 2010",
      "M.Div., Union Theological Seminary",
      "A.B., Bryn Mawr College",
    ],
    // No publications in the page body; her CV (STROUD_CV_URL) has a clean
    // "SCHOLARLY PUBLICATIONS" heading, opened 2026-08-07 — six co-authored
    // or single-authored items on chaplaincy training and religious history.
    // Five most recent kept (2013's chapter dropped for the cap).
    publications: [
      { title: "\"Training Spiritual Caregivers? Spirituality in Chaplaincy Programs in Theological Education,\" with Wendy Cadge, Patricia K. Palmer, George Fitchett, Trace Haythorn, and Casey Clevenger, in Situating Spirituality, eds. Brian Steensland, Jaime Kucinskas, and Anna Sun (Oxford University Press, 2021)", kind: "chapter", year: 2021, note: "co-authored" },
      { title: "\"Training Chaplains and Spiritual Caregivers: The Emergence and Growth of Chaplaincy Programs in Theological Education,\" with Wendy Cadge, Patricia K. Palmer, George Fitchett, Trace Haythorn, and Casey Clevenger, Pastoral Psychology 69 (June 2020): 187-208", kind: "article", year: 2020, note: "co-authored" },
      { title: "\"Education for Professional Chaplaincy in the US: Mapping Current Practice in Clinical Pastoral Education (CPE),\" with Casey Clevenger, Wendy Cadge, Patricia K. Palmer, Trace Haythorn, and George Fitchett, Journal of Healthcare Chaplaincy (February 7, 2020): 1-16", kind: "article", year: 2020, note: "co-authored" },
      { title: "\"Training Healthcare Chaplains: Yesterday, Today, and Tomorrow,\" with Wendy Cadge, George Fitchett, Trace Haythorn, Patricia K. Palmer, Shelly Rambo, and Casey Clevenger, Journal of Pastoral Care and Counseling 73, no. 4 (December 1, 2019): 211-21", kind: "article", year: 2019, note: "co-authored" },
      { title: "\"Beautiful Babies: Eugenic Display of the White Infant Body, 1854-1922,\" Bulletin for the Study of Religion 43, no. 2 (March 2014)", kind: "article", year: 2014 },
    ],
    publicationsSourceUrl: STROUD_CV_URL,
  },
  {
    name: "Timothy L. Van Meter",
    title: "Associate Professor in the Alford Chair of Christian Education and Youth Ministry",
    otherRoles: ["Coordinator of Ecological Initiatives"],
    profileUrl: `${BASE}/about-mtso/faculty-directory/timothy-l-van-meter/`,
    idSurname: "van-meter",
    areas: ["christian-education-formation", "youth-ministry"],
    degrees: [
      "Ph.D., Emory University, Graduate Division of Religion, 2003",
      "M.Div., Candler School of Theology, Emory University, 1996",
      "B.S., Tennessee Technological University, 1985",
    ],
    publications: [
      { title: "Created in Delight: Youth Ministry and the Mending of the World (Wipf and Stock, 2013)", kind: "book", year: 2013 },
      { title: "\"Do Something in the World: Youth Ministry and Ecology,\" Circuit Rider (November/December/January 2015-16)", kind: "article", year: 2015 },
      { title: "\"Living in the Delight of Creation: Youth Ministry and Practices of Ecological Theology,\" Journal of Youth and Theology 8, no. 2", kind: "article" },
    ],
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
    // Cross-check against the title-based suggester as an audit (per
    // lib/areas.mts's own instruction) — logged, not auto-applied, since
    // every area above was set by hand from title + bio + publications.
    const suggested = suggestAreas(e.title);
    const missed = suggested.filter((a) => !e.areas.includes(a));
    if (missed.length) {
      console.log(`  [areas-audit] ${e.name}: title-suggester also flags ${missed.join(", ")} (title: "${e.title}")`);
    }

    const surname = e.idSurname ?? slugifyName(e.name.split(" ").slice(-1)[0].replace(/\./g, ""));
    const member: FacultyMember = {
      id: `mtso-${surname}`,
      seminarySlug: "mtso",
      name: e.name,
      title: e.title,
      areas: e.areas,
      profileUrl: e.profileUrl,
    };
    if (e.otherRoles?.length) member.otherRoles = e.otherRoles;
    if (e.degrees?.length) member.degrees = e.degrees;
    if (e.publications?.length) {
      member.publications = e.publications.slice(0, 5);
      member.publicationsSource = e.publicationsSourceUrl ?? e.profileUrl;
      member.publicationsAsOf = today();
    }
    return member;
  });
}

async function main() {
  // Touch the pages this profile is built from, so they land in the fetch
  // cache alongside this run even though the JSON below is hand-assembled
  // from the prose — the coverage table especially needs a careful human
  // read (see README §2), not a mechanical parse.
  await get(FACULTY_DIR_URL, { fresh });
  for (const e of ROSTER) await get(e.profileUrl, { fresh });
  const catalogPdf = await get(CATALOG_PDF_URL, { fresh, binary: true });
  const catalogText = pdfToText(catalogPdf.path);
  const tuitionPdf = await get(TUITION_PDF_URL, { fresh, binary: true });
  const tuitionText = pdfToText(tuitionPdf.path);
  await get(SCHOLARSHIPS_URL, { fresh });
  // Baek/Gibson/Stroud's CVs — fetched so they land in the cache alongside
  // this run, same reasoning as the catalog/tuition PDFs above. Their
  // publications are hand-transcribed into the ROSTER, not parsed here; a
  // re-harvest should re-open these three by hand to check for a new CV.
  await get(BAEK_CV_URL, { fresh, binary: true });
  await get(GIBSON_CV_URL, { fresh, binary: true });
  await get(STROUD_CV_URL, { fresh, binary: true });

  // Sanity check: confirm the MDiv table this profile is built from still
  // reads 75 total credit hours and still names the same denominational
  // elective courses, so a silent catalog revision doesn't leave stale course
  // codes in the JSON below.
  if (!/at least 75 credit hours/i.test(catalogText.replace(/\s+/g, " "))) {
    console.warn("WARNING: catalog no longer reads 'at least 75 credit hours' for the M.Div. — re-check the coverage table by hand.");
  }
  if (!/DS660 United Methodist History/.test(catalogText)) {
    console.warn("WARNING: catalog's M.Div. Vocational Core note no longer names DS660/DS665/DS670 — re-check the coverage table.");
  }
  if (!/\$1,112/.test(tuitionText)) {
    console.warn("WARNING: tuition sheet no longer reads $1,112 per credit hour — re-check the cost figures by hand.");
  }

  const faculty = buildFaculty();
  await writeFile(join(ROOT, "data/faculty/mtso.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/mtso.json`);

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/mtso.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/mtso.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "mtso",
    name: "Methodist Theological School in Ohio",
    city: "Delaware",
    state: "OH",
    url: "https://www.mtso.edu/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: "One of the 13 United Methodist schools of theology. MTSO's own catalog states the same thing in its own words: \"MTSO is one of 13 United Methodist seminaries in the United States and is listed as an approved theological school for the education of United Methodist clergy by the University Senate.\"",
      },
      onlineCredit: {
        value: "fully-counts",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. MTSO's own catalog independently confirms the M.Div. is delivered through HyFlex education, with the \"vast majority\" of courses offered in both in-person and online modes simultaneously — course format is not restricted by delivery mode.",
      },
      coverageSource: "https://www.mtso.edu/site/assets/files/2103/academic_catalog_2025-26_aug18.pdf",
      coverageAsOf: "2025-08-18",
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "HB600 Hebrew Bible is one of the M.Div.'s required Methods Core courses, taken by every student.",
        },
        {
          area: "new-testament",
          status: "required",
          note: "NT600 New Testament is one of the M.Div.'s required Methods Core courses, taken by every student.",
        },
        {
          area: "theology",
          status: "required",
          note: "CT600 Constructive Theology is one of the M.Div.'s required Methods Core courses, taken by every student.",
        },
        {
          area: "church-history",
          status: "required",
          note: "CH510 Global Christian History is one of the M.Div.'s required Values Core courses, taken by every student.",
        },
        {
          area: "preaching",
          status: "required",
          note: "HM610 Homiletics is one of the M.Div.'s required Methods Core courses, taken by every student.",
        },
        {
          area: "worship-liturgy",
          status: "required",
          note: "WO600 Worship is one of the M.Div.'s required Methods Core courses, taken by every student.",
        },
        {
          area: "evangelism",
          status: "elective",
          note: "No evangelism course is a required line anywhere in the 75-credit-hour M.Div. table. MTSO's own catalog names ME6## Evangelism Elective as one of several electives \"most commonly\" taken by United Methodist students, in language that disclaims the obligation rather than states it: \"Students pursuing ordination in the United Methodist Church should confirm with their annual conference regarding commissioning requirements and eligibility.\" The separate Course of Study and Ordination chapter repeats the same disclaiming shape for elders: \"Those seeking ordination in the United Methodist Church will choose courses in evangelism, mission of the church in the contemporary world, and United Methodist History, Doctrine, and Polity as electives in the M.Div. program\" — MTSO's word is \"electives,\" twice, in two different chapters of its own catalog.",
        },
        {
          area: "mission-of-the-church",
          status: "elective",
          note: "Bound by the identical language as evangelism above — ME5## Mission Elective sits in the same unrestricted seven-course Vocational Core elective block, named as one of the courses \"most commonly\" taken by UMC students but never made a required line of the degree.",
        },
        {
          area: "um-studies",
          status: "elective",
          note: "DS660 United Methodist History, DS665 United Methodist Doctrine, and DS670 United Methodist Polity are all real, specifically named courses — but, like evangelism and mission above, they sit in the M.Div.'s seven unrestricted Vocational Core elective slots, not its required core. MTSO's ordination chapter goes further than most schools in naming the actual stakes and still keeps the obligation off the degree itself: \"Two-thirds or all three of the denominational courses may be required to be completed prior to the interview\" — a requirement the annual conference's commissioning interview may impose, stated by MTSO as the conference's call, not the seminary's.",
        },
      ],
      gapSummary: [
        "Six of the nine ¶324.4 areas are in MTSO's required M.Div. core: Old Testament, New Testament, theology, church history, preaching, and worship. The other three — evangelism, mission of the church, and United Methodist studies — are real, specifically named courses (ME6## for evangelism, ME5## for mission, DS660/665/670 for UM history, doctrine, and polity) but sit entirely inside the degree's seven unrestricted Vocational Core electives.",
        "MTSO's catalog is unusually direct about this being your call, not the school's: it names the courses most UMC students take, then twice tells you to confirm the actual requirement with your annual conference, whose commissioning interview may require two-thirds or all three of them completed beforehand. Plan those seven electives with all five denominational courses in mind from the start — DS665 and DS670 alone clear ¶324.4's 6-hour UM-studies floor, but the interview requirement is broader than the floor.",
      ],
      gapRemedies: [
        {
          blurb: "DS665 United Methodist Doctrine and DS670 United Methodist Polity together satisfy ¶324.4's 6-semester-hour UM-studies floor on their own; add DS660 United Methodist History, ME5## Mission Elective, and ME6## Evangelism Elective from the same seven-course elective pool to cover the two remaining areas without adding to the 75-credit total.",
          url: "https://www.mtso.edu/academics/registrar/academic-catalog/",
        },
        {
          blurb: "Ask MTSO's Registrar for the current M.Div. degree-progress worksheet, and ask your conference's Board of Ordained Ministry registrar directly which two-thirds (or all three) of the denominational courses your commissioning interview requires completed beforehand — the catalog states that this is the conference's call, not MTSO's, and does not name the fraction itself.",
          url: "https://www.mtso.edu/academics/registrar/",
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "217 students (128.70 FTE)",
        source: "https://www.ats.edu/member-schools/methodist-theological-school-in-ohio",
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report for the whole school, not M.Div. only. ATS also reports \"Full-Time Faculty (FTE): 20.67\" alongside a headcount of 13 full-time faculty for the same period — a higher FTE than headcount, and a headcount that disagrees by one with this profile's own count of 14 people on MTSO's current faculty directory page; reported as ATS states it rather than reconciled by guess, the same pattern Saint Paul's ATS figures showed.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$1,112 per credit hour ($32,248/year full-time, 29 credit hours, for illustration)",
        source: "https://www.mtso.edu/site/assets/files/2748/tuition_sheet_2026-27.pdf",
        asOf: "2026-08-06",
        note: "2026-27 rate, master's degree programs (M.Div., MTS, MAPT, MASJ, MA Counseling Ministries). A flat per-credit rate — MTSO does not price by pace or delivery mode the way Duke does. 75 credit hours × this rate is roughly $83,400 in gross M.Div. tuition before aid.",
      },
      fees: [
        { label: "Instruction fee", amount: "$500 per term, up to $1,000/year maximum" },
        { label: "Course auditing fee", amount: "$200 per course ($75 for auditors 60 and older)" },
      ],
      typicalAward: {
        value: "United Methodist certified candidates for ministry receive a full-tuition scholarship",
        source: "https://www.mtso.edu/admissions/scholarships-and-financial-aid/",
        asOf: "2026-08-06",
        note: "MTSO's own wording: \"If you are a United Methodist certified candidate for ministry, you are eligible to receive a full-tuition scholarship.\" A blanket, candidacy-linked commitment in the same family as Candler's and Duke's Rural Ministry Fellowships, but broader — not geographically restricted the way Duke's is.",
      },
      namedScholarships: [
        {
          name: "Nathaniel H. McCartney Invitational Scholarship",
          blurb: "Full tuition, by nomination, for a United Methodist member with a cumulative GPA of 3.25 or higher who is a certified candidate for ordination — one of several MTSO Premier Scholarships stacking on top of the blanket certified-candidate award above.",
          url: "https://www.mtso.edu/admissions/scholarships-and-financial-aid/scholarships-for-new-students/premier-scholarships/",
        },
        {
          name: "William D. Van Nostran Family Scholarship",
          blurb: "Full tuition for an M.Div. student who is a United Methodist member planning parish ministry in an Ohio Conference, married with a spouse and children, holding at least a 3.0 GPA — one of the most specifically targeted named awards MTSO publishes.",
          url: "https://www.mtso.edu/admissions/scholarships-and-financial-aid/scholarships-for-new-students/premier-scholarships/",
        },
        {
          name: "Kleist Scholarships",
          blurb: "$7,500, renewable up to three years, for recent college graduates with a cumulative GPA of 3.0 or higher and demonstrated financial need and leadership ability, pursuing the M.Div. or MA in Practical Theology.",
          url: "https://www.mtso.edu/admissions/scholarships-and-financial-aid/scholarships-for-new-students/premier-scholarships/",
        },
      ],
      honestNote: "MTSO publishes an unusually long roster of named, mostly full-tuition Premier Scholarships (over twenty), many written for a specific United Methodist Ohio-conference student, but every one requires an application-strength or nomination review — the blanket certified-candidate full-tuition award above is the only one guaranteed by status alone. \"Up to full tuition\" merit aid still depends on GPA bands (2.5 and up, generally, with the strongest awards at 3.5+); MTSO does not publish what share of applicants clear the top bands.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "M.Div.",
        credits: 75,
        typicalYears: "3 years full-time (12 credit hours/semester); 4 years at 9 credit hours/semester",
        modalities: ["residential", "hybrid", "online"],
        blurb: "75 credit hours: a Values Core, Methods Core, and Vocational Core (seven unrestricted electives), plus a required cross-cultural immersion, mid-program review, and capstone. HyFlex delivery — the vast majority of courses are offered simultaneously in person and online.",
        url: "https://www.mtso.edu/academics/academic-programs/masters-degree-programs/master-of-divinity-2024/",
      },
      {
        name: "Master of Arts in Public Theology",
        abbr: "M.A.P.T.",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Includes every course in GBHEM's Certificate in Deacon Studies — MTSO's other named path to the deacon-ordination educational requirement alongside the M.Div.",
        url: "https://www.mtso.edu/academics/academic-programs/masters-degree-programs/",
      },
      {
        name: "Master of Arts in Practical Theology",
        abbr: "M.A.P.T. (Practical)",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an ordination degree on its own — a practice-focused master's with specialization tracks including Youth and Young Adult Ministry, Parish and Community Ministry, and Ecology and Justice.",
        url: "https://www.mtso.edu/academics/academic-programs/masters-degree-programs/",
      },
      {
        name: "Master of Arts in Social Justice",
        abbr: "M.A.S.J.",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an ordination degree — advocacy and justice-movement focused.",
        url: "https://www.mtso.edu/academics/academic-programs/masters-degree-programs/",
      },
      {
        name: "Master of Theological Studies",
        abbr: "M.T.S.",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an ordination degree — an academic degree with a declared 12-credit-hour concentration and thesis or concentration examination.",
        url: "https://www.mtso.edu/academics/academic-programs/masters-degree-programs/master-of-theological-studies-2024/",
      },
      {
        name: "Doctor of Ministry",
        abbr: "D.Min.",
        credits: 31,
        modalities: ["hybrid"],
        blurb: "$630 per credit hour, $19,500 total — a flat program price rather than a per-credit rate that moves with pace, the way Duke's does.",
        url: "https://www.mtso.edu/academics/academic-programs/doctor-of-ministry/",
      },
    ],

    concentrations: [
      "Spirituality Specialization",
      "Biblical Languages and Texts Specialization",
      "Interreligious Contexts Specialization",
      "Chaplaincy Specialization",
      "Unitarian Universalist Studies Specialization",
      "Ecology and Justice Specialization",
    ],

    facultyNote: "Limited to MTSO's 14 full-time faculty on its current Faculty Directory page; the school separately lists adjunct and emeritus faculty not counted here, per the core-full-time-only scope this project uses for every school. Three faculty (Baek, Gibson, Stroud) print only a downloadable CV link on their bio page rather than publications in the page body itself. All three CVs were opened (2026-08-07): Gibson's and Stroud's each have a clean, separable publications heading and are recorded here, sourced to the CV PDF rather than the bio page; Baek's CV has no publications section at all (she's a 2024 PhD with presentations recorded, not yet publications), so her entry stays without one.",

    courseOfStudy: {
      blurb: "MTSO operates the Course of Study School of Ohio (Joon-Sik Park, director) — the regional five-year Course of Study for licensed local pastors, moving toward a Great Lakes Course of Study partnership with Garrett Seminary starting Fall 2026, and offers a separate Advanced Course of Study certificate for the 32-credit-hour graduate requirement.",
      url: "https://www.mtso.edu/academics/academic-programs/course-of-study-school-of-ohio/",
    },

    contact: {
      admissionsUrl: "https://www.mtso.edu/admissions/",
      email: "admissions@mtso.edu",
      phone: "800-333-6876",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
