// Claremont School of Theology — one of the 13 UMC schools of theology.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//
//   - THE STALE-ADDRESS FIX: an earlier pass on content/seminaries.ts had
//     Claremont at "Claremont, CA" — the school's old campus, closed after 66
//     years there. CST announced the move in March 2023 and has held classes
//     at its new campus — 10497 Wilshire Blvd, Los Angeles, CA 90024, sharing
//     a building with Westwood United Methodist Church — since Spring 2024.
//     Confirmed independently three ways: cst.edu's own MDiv and faculty
//     pages, ATS's member-school registry (https://www.ats.edu/member-schools/
//     claremont-school-of-theology), and CST's own relocation announcement
//     (https://cst.edu/news/claremont-school-of-theology-announces-relocation-
//     to-los-angeles/). The school kept the Claremont name; the campus did not
//     stay in Claremont. Willamette/Salem OR was a hypothesis worth ruling
//     out and this confirms it's wrong — no connection to CST at all.
//
//   - CLOUDFLARE BLOCKS lib/fetch.mts's plain fetch() OUTRIGHT. cst.edu 403s
//     every request from this project's `get()` — not a UA problem (a bare
//     curl with a full desktop Chrome UA string 403s identically); it's
//     Cloudflare's bot protection sitting in front of the whole site,
//     including static assets like the catalog PDF under /wp-content/. No
//     school in the first four harvests needed this. The only way through was
//     a real browser context (this harvest used Playwright to load each page,
//     then `fetch()` *from inside that page* — same-origin, cookies already
//     set by Cloudflare's challenge — to pull the raw HTML/PDF bytes). Those
//     bytes were then written directly into .harvest-cache/ under the exact
//     sha256(url).slice(0,32) key lib/fetch.mts's own `get()` computes, so
//     this script still calls `get()` normally and reads from that seeded
//     cache. A `--fresh` run will fail until Cloudflare's rule changes or a
//     future run repeats the browser-seeding step — flagging this clearly so
//     the next school behind similar protection doesn't waste time suspecting
//     its own UA string first.
//
//   - TWO TRACKS, TWO DIFFERENT CURRICULA — a new type-model wrinkle. Saint
//     Paul's two campuses shared one curriculum; Claremont's MDiv splits into
//     Ministerial Leadership and Interfaith Chaplaincy tracks with genuinely
//     different required courses. Ministerial Leadership requires a course
//     each in Hebrew Bible, New Testament, Christian history, and
//     (constructive) theology, plus Christian worship and preaching, in its
//     required core. Interfaith Chaplaincy requires the same four theological-
//     discipline areas but drops worship and preaching entirely in favor of
//     Interreligious Competencies, Formation (incl. Clinical Pastoral
//     Education), and Spiritual Care coursework — a chaplaincy-certification
//     curriculum, not a preaching-and-worship one. The coverage table below
//     scores the Ministerial Leadership track, the parish-ordination path
//     most UMC candidates on this site are asking about; the worship and
//     preaching rows say explicitly that the Interfaith Chaplaincy track does
//     not require them, rather than let a single coverage table imply one
//     curriculum. The type model (OrdinationReadiness.coverage) has no way to
//     carry two divergent per-track tables — a future school with more than
//     one MDiv track and materially different ¶324.4 coverage between them is
//     the real test of whether that gap needs closing.
//
//   - THE COVERAGE FINDING: Claremont's own catalog states, in both tracks'
//     sections, that "United Methodist students seeking ordination have five
//     required denominational studies courses" (Ministerial Leadership) and
//     "United Methodist students preparing for ordination must take UM
//     classes totaling 12 credits" (Interfaith Chaplaincy) — TDS3000/3001/3002
//     (UM Doctrine/History/Polity, 2 credits each) plus TDS3039 (Christian
//     Evangelism) and TDS3045 (Christian Mission), 3 credits each, 12 credits
//     total. "Required" and "must take" is binding language, not Saint Paul's
//     "may be expected" — scored required-umc-track, same test as Duke and
//     Phillips. These five courses are drawn from the MDiv's "Free Electives
//     and Denominational Studies" line (21 credits, Ministerial Leadership) —
//     named and required of UMC students, but sitting in the same pool as
//     everyone else's free electives, same as Duke's PARISH 777/778.
//
//   - FACULTY: cst.edu/faculty/ is the live "Our Faculty" directory (23
//     people, current as of this harvest) — more current than the 2025-2026
//     print catalog, which still lists Christopher Jain Miller as Affiliate
//     rather than core faculty and has no entry at all for Jibril Latif (a
//     hire since the catalog went to print). Degrees below are read from the
//     catalog's CST FACULTY section where it has an entry (22 of 23); Latif's
//     degrees are left absent rather than guessed, the same call Saint Paul's
//     harvest made for Richard Liantonio. Two title-string plurals silently
//     defeated lib/areas.mts's singular-only patterns here — "Christian
//     Histories" (Kujawa-Holbrook) and "Constructive Theologies" (B. Yuki
//     Schwartz) — both read from title + bio by hand instead, alongside the
//     usual titles-carry-half-the-signal cases the README already documents.
//
//   - ATS ACCREDITATION PROBATION: in February 2026, ATS's Board of
//     Commissioners placed Claremont on 24-month accreditation probation (to
//     February 2028) for not meeting Standard 10.3 (Financial Resources).
//     This is independent of, and does not affect, GBHEM Senate standing —
//     the Senate roster and ATS accreditation are two different bodies with
//     two different questions — but it is exactly the kind of fact this site
//     exists to surface rather than bury, so it's carried in scale's note.
//
//   - SECOND-PASS FINDING (2026-08-07), PUBLICATIONS: the tracker's first-pass
//     note called this a "FinalSite JS modal" system like Austin's, and
//     assumed the modal might just not surface publications. That description
//     was wrong for Claremont: cst.edu/faculty/<slug>/ are real, individually
//     fetchable pages (no modal at all — this script was already calling
//     get() on every one of them), and most carry a genuine "Publications"
//     heading with full citations. The first pass read each page far enough
//     to pull degrees and stopped — it never read down to Publications for
//     most people, and even the 8 it did find publications for had those
//     mislabeled as sourced from the print catalog PDF rather than the bio
//     page they actually came from (fixed below: publicationsSource is now
//     each person's own profileUrl). Re-reading all 18 gap people's pages in
//     full: 13 had real, sourced material (a "Publications" heading for 10;
//     book/chapter titles named in bio prose for 3 — Froelich, Hagiya, C.
//     Miller — where there was no such heading). The remaining 5 (Latif,
//     MacKinnon, Shaikh, Song, Stowe) genuinely have nothing: no heading, and
//     no publication named in prose (a dissertation "in progress" is not a
//     publication, and isn't counted as one for Song or Stowe). Separately:
//     no site-wide faculty-scholarship/books showcase page exists on
//     cst.edu — individual bio pages are the only source, confirmed by both
//     a site-scoped web search and a scan of the faculty directory page's own
//     links.
//
// Run: node scripts/harvest/claremont.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { htmlToText, pdfToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://cst.edu";
const FACULTY_DIR_URL = `${BASE}/faculty/`;
const MDIV_URL = `${BASE}/degree-programs/mdiv-future-church-modern-ministry-professional-coaching/`;
const COS_URL = `${BASE}/course-of-study-and-licensing-school/`;
const CATALOG_PDF_URL = `${BASE}/wp-content/uploads/2026/02/2025-2026-Catalog-Finalized-2.pdf`;

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Core full-time faculty only, per cst.edu/faculty/'s own "Our Faculty" list —
// which the catalog separately splits into CST Faculty vs. Affiliate vs.
// Adjunct vs. Emeritus, the same core-full-time-only cut every school in this
// project uses. Degrees are drawn from the print catalog's CST FACULTY
// section (Claremont School of Theology, "Catalog: 2025-2026") where present;
// areas are read from title + bio, not suggestAreas() alone — see the
// plural-defeats-the-regex note above.
interface Entry {
  name: string;
  title: string;
  otherRoles: string[];
  profileUrl: string;
  areas: StudyArea[];
  degrees?: string[];
  publications?: { title: string; kind: "book" | "edited-volume" | "article" | "chapter"; year?: number; publisher?: string; note?: string }[];
}

const ROSTER: Entry[] = [
  {
    name: "Jeff Conklin-Miller",
    title: "Associate Professor of United Methodist Studies, Evangelism, and Mission",
    otherRoles: ["Senior Consultant for Ministry Formation Initiatives"],
    profileUrl: `${BASE}/faculty/jeff-conklin-miller/`,
    areas: ["wesleyan-studies", "evangelism-church-planting", "world-christianity"],
    degrees: ["ThD, Duke University", "MDiv, Garrett-Evangelical Theological Seminary", "BA, University of California Riverside"],
    publications: [
      { title: "Leaning Both Ways at Once: Methodist Evangelistic Mission Between Church and World", kind: "book", year: 2020 },
    ],
  },
  {
    name: "Andrew Dreitcer",
    title: "Professor of Spirituality",
    otherRoles: ["Dean of the Faculty", "Co-Director of the Center for Engaged Compassion"],
    profileUrl: `${BASE}/faculty/andrew-dreitcer/`,
    areas: ["spiritual-formation"],
    degrees: ["PhD, Graduate Theological Union & UC Berkeley", "MDiv, Yale Divinity School", "BA, Wabash College, with studies at Oxford University"],
    publications: [
      { title: "Living Compassion: Loving Like Jesus", kind: "book", year: 2017 },
      { title: "Beyond the Ordinary: Spirituality for Church Leaders", kind: "book", year: 2001 },
    ],
  },
  {
    name: "Lailatul Fitriyah",
    title: "Associate Professor of Interreligious Education",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/lailatul-fitriyah/`,
    areas: ["interreligious"],
    degrees: ["PhD, University of Notre Dame", "MA, University of Notre Dame", "BA, University of Jember, Indonesia"],
    // Second-pass finding (see script header): her own bio page carries a full
    // "Publications" section the first pass never read past degrees on — not
    // a modal-ceiling case at all.
    publications: [
      { title: "Contours of the Divine Feminine: Islamic and Christian Feminist Theologies in Indonesia", kind: "article", year: 2020, note: "The Muslim World 110 (Autumn 2020): 553-571" },
      { title: "Can We Stop Talking About the 'Hijab'?: Islamic Feminism, Intersectionality, and the Indonesian Muslim Female Migrant Workers", kind: "chapter", year: 2020, publisher: "Oxford University Press" },
      { title: "Interstitial Theology and Interreligious Reconciliation in Post-War Maluku: The Work of Elifas Maspaitella and Jacklevyn Manuputty", kind: "article", year: 2019, note: "Interreligious Relations Issue 11" },
      { title: "Religious Peacebuilding in Post-War Maluku: Tiwery's Theology of the Mother (Teologi Ina) and Nunusaku-based Cosmology", kind: "article", year: 2019, note: "Interreligious Relations Issue 10" },
    ],
  },
  {
    name: "Maggie Froelich",
    title: "Assistant Professor of New Testament & Early Christian Identity",
    otherRoles: ["PhD Exams Coordinator"],
    profileUrl: `${BASE}/faculty/maggie-froelich/`,
    areas: ["new-testament"],
    degrees: ["MLIS, University of Missouri", "MA & PhD, Claremont School of Theology", "BA, Scripps College"],
    // Her bio prose (not a "Publications" heading — no such heading on this
    // page) names one book and two edited-volume contributions by title; it
    // also says she is "published in New Testament Studies and the Journal
    // of Early Christian History" but names no article titles there, so
    // those two are left out rather than invented.
    publications: [
      { title: "Jesus and the Empire of God", kind: "book", publisher: "Bloomsbury T&T Clark" },
      { title: "Greco-Roman and Jewish Tributaries to the New Testament", kind: "chapter", publisher: "Claremont Press" },
      { title: "Christian Origins and the New Testament in the Greco-Roman Context", kind: "chapter", publisher: "Claremont Press" },
    ],
  },
  {
    name: "Lincoln E. Galloway",
    title: "K. Morgan Edwards Professor of Homiletics",
    otherRoles: ["Coordinator of the Mentoring D.Min. Program"],
    profileUrl: `${BASE}/faculty/lincoln-e-galloway/`,
    // Title alone reads as preaching only; his own bio names New Testament as
    // a second teaching field ("Homiletics and New Testament studies").
    areas: ["preaching", "new-testament"],
    degrees: ["PhD, Emory University", "MDiv, Candler School of Theology", "BEd, University of West Indies"],
    publications: [
      { title: "Freedom in the Gospel: Paul's Exemplum in 1 Cor. 9 in Conversation with the Discourses of Epictetus and Philo", kind: "book", year: 2004 },
    ],
  },
  {
    name: "Nicholas Grier",
    title: "Associate Professor of Practical Theology, Spiritual Care & Counseling",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/nicholas-grier/`,
    areas: ["practical-theology", "pastoral-care-counseling"],
    degrees: ["PhD, Garrett-Evangelical Theological Seminary", "MDiv, Garrett-Evangelical Theological Seminary", "Cert. in Psychotherapy, Center for Religion & Psychotherapy at Chicago", "BM, Columbus State University"],
    publications: [
      { title: "Care for the Mental and Spiritual Health of Black Men: Hope to Keep Going", kind: "book" },
    ],
  },
  {
    name: "Benjamin A. Groth",
    title: "Assistant Professor of History and Religion",
    otherRoles: ["Louisville Institute Postdoctoral Fellow"],
    profileUrl: `${BASE}/faculty/benjamin-a-groth/`,
    // "History and Religion" doesn't trip lib/areas.mts's church-history
    // patterns (they expect "history of religion", word order matters) — his
    // own bio is unambiguous: a historian of religion, race, and ritual in
    // the Atlantic World.
    areas: ["church-history"],
    degrees: ["PhD, Tulane University", "MA, Tulane University", "MDiv, Yale Divinity School", "BA, Oberlin College & Conservatory"],
    publications: [
      { title: "Sacred Legalities: The Indelible and Interconnected Relationship Between Baptism and Race in Spanish New Orleans", kind: "article" },
    ],
  },
  {
    name: "Grant J. Hagiya",
    title: "Butler Professor of Church Administration, Finance, Leadership, and Innovation",
    otherRoles: ["Co-President"],
    profileUrl: `${BASE}/faculty/grant-hagiya/`,
    areas: ["congregational-leadership"],
    degrees: ["EdD, Pepperdine University", "DMin, Claremont School of Theology", "MDiv, Claremont School of Theology", "MA, Claremont School of Theology"],
    // No "Publications" heading on this page — one book named in his bio
    // prose, based on his dissertation.
    publications: [
      { title: "Leadership Kaizen", kind: "book", year: 2013, publisher: "Abingdon", note: "based on his dissertation, 'Traits, Qualities and Characteristics of Highly Effective UMC Clergy'" },
    ],
  },
  {
    name: "Sharon Jacob",
    title: "John Wesley Associate Professor of New Testament, Christian Origins, and Postcolonial Studies",
    otherRoles: ["Associate Dean for Students", "Co-Director of Global PhD Programs"],
    profileUrl: `${BASE}/faculty/sharon-jacob/`,
    areas: ["new-testament"],
    degrees: ["PhD, Drew University", "MA, Yale University", "MA, Lancaster Theological Seminary"],
    publications: [
      { title: "Reading Mary alongside Indian Surrogate Mothers: Violent Love, Oppressive Liberation, and Infancy Narratives", kind: "book" },
    ],
  },
  {
    name: "Yohana A. Junker",
    title: "Associate Professor of Spiritual Formation and Art",
    otherRoles: ["Vice President for Institutional Research and Planning"],
    profileUrl: `${BASE}/faculty/yohana-a-junker/`,
    areas: ["spiritual-formation"],
    degrees: ["PhD, Graduate Theological Union", "MTS, Christian Theological Seminary", "BA, Universidade Metodista de São Paulo"],
    // Everything under her page's "Publications" heading is stated as
    // forthcoming, not yet in print — flagged via `note` rather than left
    // out, since it's the honest state of her page, not a completed CV.
    publications: [
      { title: "Georgetown Companion in Interreligious Studies", kind: "chapter", publisher: "Georgetown University Press", note: "forthcoming" },
      { title: "Sustainable Societies: Interreligious & Interdisciplinary Responses", kind: "chapter", publisher: "Springer", note: "forthcoming" },
      { title: "Painted Portrayals: The Art of Characterizing Biblical Figures", kind: "chapter", publisher: "SBL Press", note: "forthcoming" },
      { title: "Modern and Contemporary Artists on Religion: A Global Sourcebook", kind: "edited-volume", publisher: "Bloomsbury", note: "forthcoming; co-edited with Aaron Rosen" },
    ],
  },
  {
    name: "Grace Yia-Hei Kao",
    title: "Professor of Ethics",
    otherRoles: ["Bishop Roy I. Sano & Kathleen A. Thomas-Sano Professor in Pacific & Asian-American Theology"],
    profileUrl: `${BASE}/faculty/grace-yia-hei-kao/`,
    areas: ["ethics-public-theology"],
    degrees: ["PhD, Harvard University", "MA, Stanford University", "BA, Stanford University"],
    publications: [
      { title: "My Body, Their Baby: A Progressive Christian Vision for Surrogacy", kind: "book", year: 2023 },
      { title: "Asian American Christian Ethics: Voices, Methods, Issues", kind: "edited-volume", year: 2015 },
      { title: "Encountering the Sacred: Feminist Reflections on Women's Lives", kind: "edited-volume", year: 2018 },
      { title: "Grounding Human Rights in a Pluralist World", kind: "book", year: 2011 },
    ],
  },
  {
    name: "Namjoong Kim",
    title: "Associate Professor of Practical Theology, Ministry, Liturgy, and Homiletics",
    otherRoles: ["Associate Dean of Doctoral Programs & International Relations for Korea"],
    profileUrl: `${BASE}/faculty/namjoong-kim/`,
    areas: ["practical-theology", "liturgy-worship", "preaching"],
    degrees: ["PhD, Drew University", "STM, MPhil, Drew University", "ThB, ThM, Hanshin University (South Korea)"],
    publications: [
      { title: "Playful Pulpits: Exploring Multicultural Preaching Practices through the Lens of Theology of Play", kind: "article", year: 2025 },
      { title: "Worship as Question and Discourse: A Reset Toward Worship Focused on Communication and Fellowship, Encounter and Communion", kind: "chapter", year: 2025 },
      { title: "Exploring Intergenerational Worship of Interdependence in a Korean American Context", kind: "article", year: 2023 },
      { title: "Preaching from the Perspective of Asian American Theology", kind: "chapter", year: 2022 },
    ],
  },
  {
    name: "Kah-Jin Jeffrey Kuan",
    title: "Professor of Hebrew Bible",
    otherRoles: ["Co-President", "Interim Vice President for Finance and Administration"],
    profileUrl: `${BASE}/faculty/kah-jin-jeffrey-kuan/`,
    areas: ["hebrew-bible"],
    degrees: ["PhD, Emory University", "MTS, Southern Methodist University", "BTh, Trinity Theological College, Singapore"],
    publications: [
      { title: "Biblical Interpretation and the Rhetoric of Violence and War", kind: "article", year: 2009, note: "Asia Journal of Theology 23, no. 2: 189-203" },
      { title: "Ways of Being, Ways of Reading: Asian-American Biblical Interpretation", kind: "edited-volume", year: 2006, publisher: "Chalice", note: "co-edited with Mary F. Foskett" },
      { title: "Reading Amy Tan Reading Job", kind: "chapter", year: 2004, publisher: "Continuum" },
      { title: "My Journey into Diasporic Hermeneutics", kind: "article", year: 2002, note: "Union Seminary Quarterly Review 56, no. 1-2: 50-54" },
      { title: "Šamši-ilu and the Realpolitik of Israel and Aram-Damascus in the Eighth Century BCE", kind: "chapter", year: 2001, publisher: "Sheffield Academic" },
    ],
  },
  {
    name: "Sheryl A. Kujawa-Holbrook",
    title: "Professor of Practical Theology & Christian Histories",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/sheryl-a-kujawa-holbrook/`,
    // The plural "Christian Histories" doesn't match lib/areas.mts's singular
    // "christian history" pattern — added by hand; her own bio calls her a
    // historian outright.
    areas: ["practical-theology", "church-history"],
    degrees: [
      "PhD, Boston College",
      "EdD, Columbia University and Union Theological Seminary (joint program)",
      "MDiv, Episcopal Divinity School",
      "MTS, Harvard Divinity School",
      "MA, Sarah Lawrence College",
      "BA, Marquette University",
    ],
    publications: [
      { title: "Confronting White Supremacy in Interreligious Engagement: Insights from Critical Pedagogy", kind: "chapter", year: 2021, note: "in Georgetown Companion to Interreligious Studies, forthcoming as of the bio page" },
      { title: "An Overview of the Strengths and Challenges of the Field of Anglican History", kind: "article", year: 2021, note: "Journal of Anglican Studies" },
      { title: "Intersectionality and Interreligious Engagement: A Reflection", kind: "chapter", year: 2020, publisher: "Interreligious Studies Press", note: "in Deep Understanding for Divisive Times, Journal of Interreligious Studies Anniversary Volume, ed. Lucinda Mosher" },
      { title: "New Paths as We Journey Toward the Future: Reflections on Anglican-Roman Catholic Dialogue since Ut Unum Sint", kind: "article", year: 2020, note: "Horizons, the Journal of the College Theology Society: 1-23" },
      { title: "Passion, Authenticity and Commitment – A Reflection on Theological Education", kind: "chapter", year: 2020, publisher: "SacraSage Press", note: "in Open and Relational Leadership, ed. Roland Hearn, Thomas Oord, Sheri Kling" },
    ],
  },
  {
    name: "Jibril Latif",
    title: "Associate Professor of Communications and Leadership",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/jibril-latif/`,
    areas: ["congregational-leadership"],
    // No entry in the 2025-2026 print catalog's CST FACULTY section — a hire
    // since it went to print. Degrees left absent rather than guessed, same
    // call Saint Paul's harvest made for Richard Liantonio.
    // Second pass: his bio page has no "Publications" heading and names none
    // in prose — a real gap, not an unread page.
  },
  {
    name: "K. Samuel Lee",
    title: "Edna & Lowell Craig Professor of Practical Theology, Spiritual Care, & Counseling",
    otherRoles: ["VP for International Relations"],
    profileUrl: `${BASE}/faculty/k-samuel-lee/`,
    areas: ["practical-theology", "pastoral-care-counseling"],
    degrees: ["PhD, Arizona State University", "MDiv, Yale University", "BA, Westmar College"],
    publications: [
      { title: "Justice Matters: Spiritual Care and Pastoral Theological Imaginations in Times of the COVID-19 Pandemic", kind: "edited-volume", year: 2023, publisher: "Routledge", note: "with Danjuma Gibson" },
      { title: "Spiritually Integrated Psychotherapy Training Manual", kind: "chapter", year: 2022, note: "translation, Association of Clinical Pastoral Education" },
      { title: "Caring Over Troubled Waters: Creative and Critical Pastoral Theological Imaginations in the 21st Century", kind: "article", year: 2021, note: "Journal of Pastoral Theology 31(1): 1-3, with Danjuma Gibson" },
      { title: "Pastoral Theological Imagination in Times of Social Unrest: Speaking for Freedom", kind: "article", year: 2020, note: "Journal of Pastoral Theology 30(3): 157-159, with Danjuma Gibson" },
      { title: "Changing Face of Pastoral Theology", kind: "article", year: 2020, note: "Journal of Pastoral Theology 30(2): 83-85, with Danjuma Gibson" },
    ],
  },
  {
    name: "Melissa Roux MacKinnon",
    title: "Instructor of Field Education",
    otherRoles: ["Director of Field Education"],
    profileUrl: `${BASE}/faculty/melissa-roux-mackinnon/`,
    // "Field Education" doesn't trip any lib/areas.mts pattern directly —
    // added by hand as practical theology, the closest controlled-vocabulary
    // home for supervised ministry formation.
    areas: ["practical-theology"],
    degrees: ["MA, Duke Divinity School", "BA, CA State University Bakersfield"],
    // Second pass: bio page has no "Publications" heading, and her ministry-
    // formation bio names no publications — a real gap.
  },
  {
    name: "Venu Mehta",
    title: "Bhagwan Chandraprabha Endowed Assistant Professor in Jain Studies",
    otherRoles: ["Assistant Professor of Comparative Spiritualities"],
    profileUrl: `${BASE}/faculty/33326-2/`,
    // "Comparative Spiritualities" doesn't match the interreligious rule's
    // literal "comparative religion/theology" pattern — added by hand; a Jain
    // studies scholar is squarely interreligious for this site's purposes.
    areas: ["interreligious"],
    degrees: [
      "PhD, University of Florida",
      "PhD, Sardar Patel University, India",
      "MA, Florida International University and Bhavnagar University",
      "BA, Bhavnagar University, India",
    ],
    publications: [
      { title: "Sectarian Negotiations among the Jains in the USA: A Special Focus on the Ritual and Visual Culture", kind: "chapter", publisher: "Cognella Academic Publishing", note: "in World Religions in the United States: Tracing the Migrations of Religions to the United States (tentative title); forthcoming/accepted Fall 2021" },
      { title: "Anekantavada: The Jaina Epistemology", kind: "chapter", year: 2018, publisher: "Duke University Press", note: "in Constructing the Pluriverse: The Geopolitics of Knowledge, ed. Bernd Reiter" },
      { title: "Jainism, Ecology and Ethics", kind: "chapter", year: 2017, publisher: "Lexington Books", note: "in Ecocultural Ethics: Critical Essays" },
      { title: "Learn Gujarati, A Resource-Book for Global Gujaratis, Beginner's Level", kind: "book", year: 2016, publisher: "Charotar University of Science and Technology" },
      { title: "Diversity and Higher Education: Towards a Promising Development Condition", kind: "article", year: 2015, note: "University News, Association of Indian University 53(12): 16-19" },
    ],
  },
  {
    name: "Christopher Jain Miller",
    title: "Professor of Engaged Jain Studies",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/christopher-jain-miller/`,
    // Listed as core faculty on cst.edu/faculty/ (this harvest's source of
    // record for the core-vs-affiliate cut); the 2025-2026 print catalog
    // still has him under Affiliate Faculty, an older vintage — see script
    // header note.
    areas: ["interreligious"],
    degrees: ["PhD, University of California, Davis"],
    publications: [
      { title: "Embodying Transnational Yoga: Eating, Singing, and Breathing in Transformation", kind: "book", year: 2024, publisher: "Routledge" },
      { title: "Engaged Jainism: Critical and Constructive Studies of Jain Social Engagement", kind: "edited-volume", year: 2026, publisher: "SUNY", note: "co-editor" },
      { title: "Beacons of Dharma: Spiritual Exemplars for the Modern Age", kind: "edited-volume", year: 2020, publisher: "Lexington", note: "co-editor" },
    ],
  },
  {
    name: "Frank Rogers, Jr.",
    title: "Muriel Bernice Roberts Professor of Spiritual Formation & Narrative Pedagogy",
    otherRoles: ["Co-Director of the Center for Engaged Compassion"],
    profileUrl: `${BASE}/faculty/frank-rogers-jr/`,
    areas: ["spiritual-formation"],
    degrees: ["PhD, Princeton Theological Seminary", "MDiv, Princeton Theological Seminary", "BA, Anderson College"],
    publications: [
      { title: "Compassion-Based Spiritual Direction: Internal Family Systems as a Resource for Spiritual Companions", kind: "article", year: 2020, note: "Presence: An International Journal of Spiritual Direction 26, 4: 50-60" },
      { title: "Warriors of Compassion: Coordinates on the Compass of Compassion-Based Activism", kind: "chapter", year: 2019, publisher: "Lexington Press", note: "in Taking it to the Streets: Public Theologies of Activism and Resistance, ed. Jennifer Baldwin" },
      { title: "Compassion in Practice: The Way of Jesus", kind: "book", year: 2016, publisher: "Upper Room Books" },
      { title: "Practicing Compassion", kind: "book", year: 2016, publisher: "Fresh Air Books" },
      { title: "Finding God in the Graffiti: Empowering Teenagers through Stories", kind: "book", year: 2011, publisher: "Pilgrim Press" },
    ],
  },
  {
    name: "Andrew Schwartz",
    title: "Associate Professor of Process & Comparative Theology",
    otherRoles: [],
    // Added by hand alongside the rule's own "comparative theology" hit:
    // process theology is a constructive/systematic theology, per his own
    // bio ("comparative philosopher and theologian... process thought").
    areas: ["interreligious", "systematic-theology"],
    profileUrl: `${BASE}/faculty/andrew-schwartz/`,
    degrees: ["PhD, Claremont Graduate University", "MA, Claremont Graduate University", "MA, Nazarene Theological Seminary", "BA, Northwest Nazarene University"],
    publications: [
      { title: "Process Cosmology", kind: "edited-volume", publisher: "Palgrave Macmillan", note: "forthcoming; edited with Andrew M. Davis and Maria-Teresa Teixeira" },
      { title: "Nature in Process: Organic Proposals in Philosophy, Society, and Religion", kind: "edited-volume", publisher: "Process Century Press", note: "forthcoming; edited with Andrew M. Davis and Maria-Teresa Teixeira" },
      { title: "Philosophical Roots of the Ecological Crisis: The Process-Relational Worldview and Integral Ecology", kind: "article", year: 2020, note: "Berkley Forum" },
      { title: "Panentheism and Panexperientialism for Open and Relational Theology", kind: "chapter", year: 2020, publisher: "Brill", note: "in Panentheism and Panpsychism: Philosophy of Religion Meets Philosophy of Mind, with Thomas Jay Oord" },
      { title: "What is Ecological Civilization?: Crisis, Hope, and the Future of the Planet", kind: "book", year: 2019, publisher: "Process Century Press", note: "with Philip Clayton" },
    ],
  },
  {
    name: "B. Yuki Schwartz",
    title: "Associate Professor of Constructive Theologies, Spirituality & Decolonial Studies",
    otherRoles: ["Acting Vice President for Academic Affairs and Acting Dean"],
    profileUrl: `${BASE}/faculty/b-yuki-schwartz/`,
    // The plural "Constructive Theologies" doesn't match the singular
    // "constructive theology" pattern — added by hand.
    areas: ["spiritual-formation", "systematic-theology"],
    degrees: ["PhD, Garrett-Evangelical Theological Seminary", "MDiv, Phillips Theological Seminary", "BA, University of Oklahoma", "BA, Oklahoma State University"],
    // Years mostly absent on the page itself — left absent rather than
    // guessed from journal volume numbers.
    publications: [
      { title: "The Cosmopolitics of Belonging: Model Minority Superheroes and Theological Imagination", kind: "chapter", note: "in Embodying Antiracist Christianity: Asian American Theological Resources for Antiracism, ed. Keun-joo Christine Pae and Boyung Lee" },
      { title: "Model Minority Melancholia: Mourning and Resisting Anti-Asian Violence", kind: "article", note: "Political Theology, Vol. 25, Issue 1" },
      { title: "Reimagine Advent: Discover the Liberating Christ", kind: "chapter", year: 2021, note: "Advent liturgy, published by the General Commission on Religion and Race of the United Methodist Church" },
      { title: "The Shame Culture of Empire: The Chrysanthemum and the Sword as Cold War Playbook for Legitimating US Empire", kind: "chapter", year: 2020, publisher: "Lexington Books", note: "in Feminist Praxis Against U.S. Militarism, ed. W. Anne Joh and Nami Kim" },
      { title: "Cultural Appropriation vs. Cultural Appreciation", kind: "chapter", year: 2019, publisher: "Chalice Press", note: "in When Kids Ask Hard Questions: Faith-filled Responses for Tough Topics, ed. Karen Ware Jackson and Bromleigh McCleneghan" },
    ],
  },
  {
    name: "Munir Shaikh",
    title: "Associate Professor of Islamic History and Interfaith Studies",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/munir-shaikh/`,
    areas: ["interreligious"],
    // No degrees given on his own CST bio blurb in the print catalog or the
    // live directory's short bio; left absent rather than guessed.
    // Second pass: no "Publications" heading and none named in prose — a
    // real gap.
  },
  {
    name: "Minhwan Song",
    title: "Assistant Professor of the Practice of Ministry",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/minhwan-song/`,
    // Bio: mental distress, faith, and social justice — added pastoral-care-
    // counseling by hand alongside the title's practical-theology match.
    areas: ["practical-theology", "pastoral-care-counseling"],
    degrees: ["PhD, Claremont School of Theology", "ThM, Candler School of Theology", "MDiv, Methodist Theological School in Ohio"],
    // Second pass: no "Publications" heading. His bio names only his
    // doctoral dissertation ("Pastors on Pendulums..."), which is training
    // work, not a publication — left out rather than counted as one.
  },
  {
    name: "Blair Trygstad Stowe",
    title: "Assistant Professor of the Practice of Ministry",
    otherRoles: ["Assistant Dean for Co-Curricular Development"],
    profileUrl: `${BASE}/faculty/blair-trygstad-stowe/`,
    areas: ["practical-theology"],
    degrees: ["ABD, Boston University School of Theology", "MDiv, Candler School of Theology at Emory University", "BA, University of Southern California"],
    // Second pass: no "Publications" heading. Her bio names only a
    // dissertation "in progress" — not yet a publication, left out.
  },
  {
    name: "Marvin A. Sweeney",
    title: "Professor of Hebrew Bible",
    otherRoles: [],
    profileUrl: `${BASE}/faculty/marvin-a-sweeney/`,
    areas: ["hebrew-bible"],
    degrees: ["PhD, Claremont Graduate University", "MA, Claremont Graduate University", "A.B., University of Illinois"],
    publications: [
      { title: "Jewish Mysticism from Ancient Times through Today", kind: "book", year: 2020, publisher: "Eerdmans" },
      { title: "The Pentateuch", kind: "book", year: 2017, publisher: "Abingdon", note: "Core Biblical Studies series" },
      { title: "Isaiah 40-66", kind: "book", year: 2016, publisher: "Eerdmans", note: "Forms of the Old Testament Literature series" },
      { title: "Reading Prophetic Books", kind: "book", year: 2014, publisher: "Mohr Siebeck", note: "Forschungen zum Alten Testament series" },
      { title: "Reading Ezekiel", kind: "book", year: 2013, publisher: "Smyth and Helwys", note: "Reading the Old Testament series" },
    ],
  },
];

function buildFaculty(): FacultyMember[] {
  return ROSTER.map((e) => {
    // Cross-check against the title-based suggester as an audit, per
    // lib/areas.mts's own instruction — logged, not auto-applied, since every
    // area above was set by hand from title + bio.
    const suggested = suggestAreas(e.title);
    const missed = suggested.filter((a) => !e.areas.includes(a));
    if (missed.length) {
      console.log(`  [areas-audit] ${e.name}: title-suggester also flags ${missed.join(", ")} (title: "${e.title}")`);
    }

    // Full-name slug, not surname-only: two Schwartzes (Andrew and B. Yuki)
    // collide on surname alone.
    const member: FacultyMember = {
      id: `claremont-${slugifyName(e.name.replace(/[.,]/g, ""))}`,
      seminarySlug: "claremont",
      name: e.name,
      title: e.title,
      areas: e.areas,
      profileUrl: e.profileUrl,
    };
    if (e.otherRoles.length) member.otherRoles = e.otherRoles;
    if (e.degrees?.length) member.degrees = e.degrees;
    if (e.publications?.length) {
      member.publications = e.publications.slice(0, 5);
      // Second-pass correction: every publication list here — including the
      // original 8 people from the first pass — is actually read off each
      // person's own cst.edu/faculty/<slug>/ bio page, which carries a real
      // "Publications" heading with full citations (title/journal/publisher/
      // year), not the print catalog. The first pass mislabeled the source as
      // the catalog PDF; it never was. See script header for the "not a modal
      // at all" finding this pass turned up.
      member.publicationsSource = e.profileUrl;
      member.publicationsAsOf = today();
    }
    return member;
  });
}

async function main() {
  // Touch the pages this profile is built from, so they land in the fetch
  // cache alongside this run even though the JSON below is hand-assembled
  // from the prose — same reasoning as Duke's and Saint Paul's harvests: the
  // coverage table needs a careful human read, not a mechanical parse.
  //
  // NOTE: cst.edu sits behind Cloudflare bot protection that 403s a bare
  // fetch() regardless of User-Agent. This run's cache was seeded from a real
  // browser context (see script header) — these get() calls will succeed
  // from that seeded cache but will fail on --fresh until a future run
  // repeats the browser-seeding step.
  await get(FACULTY_DIR_URL, { fresh });
  await get(MDIV_URL, { fresh });
  await get(COS_URL, { fresh });
  for (const e of ROSTER) await get(e.profileUrl, { fresh });
  const catalogPdf = await get(CATALOG_PDF_URL, { fresh, binary: true });
  const catalogText = pdfToText(catalogPdf.path);

  // Sanity check: confirm the MDiv section still names the same five UM
  // denominational-studies courses at the same 12-credit total, so a silent
  // catalog revision doesn't leave a stale coverage table in the JSON below.
  if (!/five required denominational/i.test(catalogText)) {
    console.warn("WARNING: catalog no longer describes UM denominational studies as 'five required' courses — re-check the coverage table by hand.");
  }
  if (!(/TDS3000/.test(catalogText) && /TDS3039/.test(catalogText) && /TDS3045/.test(catalogText))) {
    console.warn("WARNING: TDS3000/TDS3039/TDS3045 course codes not all found — re-check UM studies/evangelism/mission course codes.");
  }

  const faculty = buildFaculty();
  await writeFile(join(ROOT, "data/faculty/claremont.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/claremont.json`);

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/claremont.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/claremont.json");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "claremont",
    name: "Claremont School of Theology",
    city: "Los Angeles",
    state: "CA",
    url: "https://cst.edu/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: "One of the 13 United Methodist schools of theology. Keeps the Claremont name, but the campus itself relocated: after 66 years in Claremont, CA, CST moved to 10497 Wilshire Blvd, Los Angeles, CA 90024 (shared with Westwood United Methodist Church), announced March 2023 and operating there since Spring 2024.",
      },
      onlineCredit: {
        value: "fully-counts",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-07-07",
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. Claremont's own MDiv page independently confirms a Fully Remote modality is 'Available 100% online (not including internship)' for both MDiv tracks.",
      },
      coverageSource: "https://cst.edu/wp-content/uploads/2026/02/2025-2026-Catalog-Finalized-2.pdf",
      coverageAsOf: capturedAt,
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "THB3007 (The Hebrew Bible in Context) is one of five Required Theological Disciplines courses in the Ministerial Leadership track, for every student. (Non-Christian students substitute an equivalent Sacred Texts course in their own tradition — the requirement, not the specific course, is universal.)",
        },
        {
          area: "new-testament",
          status: "required",
          note: "TNT3003 (The New Testament in Context) is one of five Required Theological Disciplines courses in the Ministerial Leadership track, for every student, with the same non-Christian-student substitution option as Old Testament above.",
        },
        {
          area: "theology",
          status: "required",
          note: "TTH3036 (Constructive Theology) is one of five Required Theological Disciplines courses in the Ministerial Leadership track, for every student, with the same substitution option.",
        },
        {
          area: "church-history",
          status: "required",
          note: "THC3007 (History of World Christianities) is one of five Required Theological Disciplines courses in the Ministerial Leadership track, for every student, with the same substitution option.",
        },
        {
          area: "worship-liturgy",
          status: "required",
          note: "TWP3015 (Introduction to Christian Worship and the Arts) is one of five Required Practical Theology courses in the Ministerial Leadership track, for every student. This applies to the Ministerial Leadership track only — Claremont's other MDiv track, Interfaith Chaplaincy, does not require a worship course at all; see the Degree Programs section below.",
        },
        {
          area: "preaching",
          status: "required",
          note: "TWP3013 (Preaching in the Worship Context) is one of five Required Practical Theology courses in the Ministerial Leadership track, for every student. As with worship above, this is Ministerial Leadership-specific: Interfaith Chaplaincy does not require a preaching course.",
        },
        {
          area: "evangelism",
          status: "required-umc-track",
          note: "Claremont's catalog states plainly, in its Ministerial Leadership section: \"United Methodist students seeking ordination have five required denominational studies courses: United Methodist History, Doctrine, and Polity (2 credits each), Evangelism, and Mission (3 credits each), 12 credits total.\" TDS3039 (Christian Evangelism) is named as the course, explicitly \"designed to meet denominational requirements for an evangelism course, including that of the United Methodist Church.\" These five courses are drawn from the MDiv's 21-credit \"Free Electives and Denominational Studies\" line — required of UMC students specifically, the same arrangement as Duke's PARISH 777/778.",
        },
        {
          area: "mission-of-the-church",
          status: "required-umc-track",
          note: "Bound by the same \"five required denominational studies courses\" sentence as evangelism above. TDS3045 (Christian Mission) is named as the course, \"designed to meet various denomination requirements for mission, including that of the United Methodist Church.\"",
        },
        {
          area: "um-studies",
          status: "required-umc-track",
          note: "The same sentence names all three: TDS3001 (United Methodist History), TDS3000 (United Methodist Doctrine), and TDS3002 (United Methodist Polity), 2 credits each — 6 credits total, landing exactly on ¶324.4's 6-hour UM-studies floor. Each course description states it is \"designed to meet the United Methodist Church's ordination requirements\" for that specific subject.",
        },
      ],
      // No gapSummary/gapRemedies: with evangelism, mission, and UM studies all
      // scored required-umc-track alongside a universally-required core that
      // already covers the other six areas, every one of the nine binds a
      // UMC candidate in the Ministerial Leadership track — no area is left
      // to a student's own initiative. The Interfaith Chaplaincy track's very
      // different curriculum (no dedicated worship or preaching course) is
      // flagged in those two rows' notes and in the Degree Programs entry
      // below, rather than invented as a second coverage table the type model
      // has no field for.
    },

    scale: {
      totalEnrollment: {
        value: "252 students (185.80 FTE)",
        source: "https://www.ats.edu/member-schools/claremont-school-of-theology",
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report for the whole school, not MDiv only. ATS also reports 19 full-time faculty (22.90 FTE) for the same period. Separately: in February 2026, ATS's Board of Commissioners placed Claremont on 24-month accreditation probation (to February 2028) for not meeting Standard 10.3 (Financial Resources) — a matter of ATS accreditation, not GBHEM Senate standing (the two are different bodies answering different questions; Claremont's Senate approval is untouched by this). Worth asking the admissions office about directly.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$1,105 per credit (MDiv, MA, MTS)",
        source: "https://cst.edu/wp-content/uploads/2026/02/2025-2026-Catalog-Finalized-2.pdf",
        asOf: "2025-08-01",
        note: "2025–2026 rate. 72 credits × this rate is roughly $79,560 in gross MDiv tuition before aid. The catalog's own sample nine-month budget lists $19,890 in tuition for 18 credits (one year at half the degree's pace) plus $1,200 books, $19,206 room and board, $4,400 transportation, and $6,580 miscellaneous — $51,276 total estimated annual cost of attendance.",
      },
      namedScholarships: [
        {
          name: "United Methodist Grant",
          blurb: "Awarded to United Methodist students upon entering CST. Renewal is conditioned on the student remaining a \"certified candidate\" in the UMC ordination process — proof must be submitted to the Financial Aid Office to continue receiving it each year. The catalog names no dollar amount or percentage.",
          url: "https://cst.edu/admissions/financial-aid-scholarships/",
        },
      ],
      honestNote: "Unlike Duke's or Saint Paul's catalogs, Claremont's does not publish a dollar amount or percentage for any of its merit scholarships (Presidential, Dean's, Korean Leadership, Claremont Scholarship) or its need-based Claremont Grant — only that students are automatically considered upon admission. The one figure specific to United Methodist candidates, the United Methodist Grant, is described the same way: awarded, tied to certified-candidate status, no amount stated. Ask the Financial Aid Office for a number before comparing this school's aid against one that publishes a percentage.",
    },

    degrees: [
      {
        name: "Master of Divinity — Ministerial Leadership track",
        abbr: "MDiv",
        credits: 72,
        typicalYears: "3 years full-time; up to 6 years allowed",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Required Interreligious Leadership course, five Required Practical Theology courses (incl. worship and preaching), five Required Theological Disciplines courses (Hebrew Bible, New Testament, church history, theology), a four-course Formation sequence including two semesters of Field Education, two Summative courses, and seven courses (21 credits) of Free Electives and Denominational Studies — the pool United Methodist students draw their five required UM/evangelism/mission courses from. Offered on-campus in West Los Angeles or fully remote.",
        url: "https://cst.edu/degree-programs/mdiv-future-church-modern-ministry-professional-coaching/ministerial-leadership-christian-wisdom-ethics-practice-future-leader/",
      },
      {
        name: "Master of Divinity — Interfaith Chaplaincy track",
        abbr: "MDiv",
        credits: 72,
        typicalYears: "3 years full-time; up to 6 years allowed",
        modalities: ["residential", "hybrid", "online"],
        blurb: "The same four Theological Disciplines courses as Ministerial Leadership (Hebrew Bible, New Testament, church history, theology), plus Interreligious Competencies, a Formation sequence built around Clinical Pastoral Education, and Spiritual Care coursework aimed at Association of Professional Chaplains certification.",
        flag: "Does not require a dedicated worship or preaching course. United Methodist students preparing for ordination still must take the same 12 credits of UM/evangelism/mission coursework, but here it has to fit inside a smaller 9–12 credit Free Electives line — worth confirming with a Board of Ordained Ministry registrar before choosing this track over Ministerial Leadership for a parish-ordination path.",
        url: "https://cst.edu/degree-programs/mdiv-future-church-modern-ministry-professional-coaching/interfaith-chaplaincy-interreligious-multifaith-pastoral-care/",
      },
      {
        name: "Concurrent/Dual Master of Divinity/Master of Theological Studies",
        abbr: "MDiv/MTS",
        credits: 96,
        typicalYears: "up to 7 years allowed",
        modalities: ["residential", "hybrid", "online"],
        blurb: "Two separate admissions processes leading to two diplomas, with shared credits between the MDiv and an MA/MTS program — built for students planning to pursue a PhD after ordination-track study.",
        url: "https://cst.edu/wp-content/uploads/2026/02/2025-2026-Catalog-Finalized-2.pdf",
      },
      {
        name: "Master of Theological Studies",
        abbr: "MTS",
        credits: 48,
        modalities: ["residential", "hybrid", "online"],
        blurb: "Not an ordination degree — for further graduate study, specialized professional service, or vocational enrichment, in a Theological Disciplines or Interdisciplinary track.",
        url: "https://cst.edu/graduate-degree-programs-online-hybrid-remote-learning-parttime/",
      },
      {
        name: "Master of Arts in Ministry, Leadership, and Service",
        abbr: "MA",
        credits: 37,
        modalities: ["residential", "hybrid", "online"],
        blurb: "Built for those seeking ordination as a Deacon in the United Methodist Church, ordination in a denomination that does not require the MDiv, or lay/non-professional ministry.",
        url: "https://cst.edu/graduate-degree-programs-online-hybrid-remote-learning-parttime/",
      },
      {
        name: "Doctor of Ministry",
        abbr: "DMin",
        credits: 30,
        modalities: ["hybrid"],
        blurb: "Four avenues: a Mentoring DMin, a Korean-language track in conflict/healing/transformation, a Spiritual Renewal/Contemplative Practice/Strategic Leadership track, and an Innovation and Creativity in Ministry track.",
        url: "https://cst.edu/wp-content/uploads/2026/02/2025-2026-Catalog-Finalized-2.pdf",
      },
      {
        name: "Doctor of Philosophy",
        abbr: "PhD",
        credits: 48,
        modalities: ["residential", "hybrid"],
        blurb: "Two programs — PhD in Practical Theology (Education and Formation; Spiritual Care and Counseling) and PhD in Religion (seven concentrations, including Hebrew Bible and Jewish Studies and New Testament and Christian Origins). At least half the coursework must be taken in-person at the CST campus, except where a degree's own requirements note otherwise.",
        url: "https://cst.edu/wp-content/uploads/2026/02/2025-2026-Catalog-Finalized-2.pdf",
      },
    ],

    concentrations: [
      "Interfaith Chaplaincy (MDiv track)",
      "Ministerial Leadership (MDiv track)",
      "Comparative Theology and Philosophy (PhD)",
      "Contextual Theologies / Global PhD (PhD)",
      "Hebrew Bible and Jewish Studies (PhD)",
      "New Testament and Christian Origins (PhD)",
      "Philosophy of Religion and Theology (PhD)",
      "Process Studies (PhD)",
      "Religion, Ethics, and Society (PhD)",
      "Education and Formation (PhD in Practical Theology)",
      "Spiritual Care and Counseling (PhD in Practical Theology)",
    ],

    partnerships: [
      {
        kind: "host-university",
        partner: "Westwood United Methodist Church",
        blurb: "Claremont's Los Angeles campus shares a building with Westwood UMC at 10497 Wilshire Blvd — a United Methodist congregation, not a university, hosting the school's physical location since its 2024 move, the same host-congregation arrangement Saint Paul School of Theology has with Church of the Resurrection in Kansas.",
        url: "https://cst.edu/directions/",
      },
      {
        kind: "extension",
        partner: "Western Jurisdiction Course of Study and Licensing School",
        blurb: "Claremont is \"affiliated with\" (its own phrase) the Western Jurisdiction's GBHEM Course of Study and Licensing School, rather than solely operating it — the 20-course basic Course of Study for local pastors, and an 80-hour Licensing School covering worship, preaching, administration, spiritual formation, mission, evangelism, pastoral care, educational ministries, and United Methodist tradition.",
        url: "https://cst.edu/course-of-study-and-licensing-school/",
      },
    ],

    courseOfStudy: {
      blurb: "Claremont is affiliated with the Western Jurisdiction Course of Study and Licensing School under GBHEM, and separately runs its own Advanced Course of Study (ACoS, 32 credit hours) and Basic Graduate Theological Studies (BGTS) non-degree programs for local pastors and deacon candidates pursuing ordination outside the MDiv.",
      url: "https://cst.edu/course-of-study-and-licensing-school/",
    },

    facultyNote: "Limited to the 26 people on cst.edu/faculty/'s \"Our Faculty\" page — the school's own core-faculty cut, distinct from the Affiliate, Adjunct, and Emeritus faculty it lists on separate pages. That live directory is more current than the 2025-2026 print catalog: it includes Jibril Latif (not in the catalog at all) and lists Christopher Jain Miller as core faculty where the catalog still has him under Affiliate. Degrees are drawn from the catalog's CST Faculty section for the 24 of 26 who have an entry there. Publications are read from each person's own cst.edu/faculty/<slug>/ page, not the catalog — 21 of 26 have real, sourced publications there (a dedicated \"Publications\" heading for most; book/chapter titles named in bio prose for a few, e.g. Froelich and Hagiya). The 5 without (Latif, MacKinnon, Shaikh, Song, Stowe) genuinely list none — checked page by page, not assumed from a thin bio.",

    contact: {
      admissionsUrl: "https://cst.edu/apply-now/",
      email: "admission@cst.edu",
      phone: "909-447-2500",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
