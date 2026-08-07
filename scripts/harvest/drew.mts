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
//     dated CV PDF ("<Name> CV – 2026").
//   - PUBLICATIONS (added 2026-08-07): every one of the 25 linked CV PDFs was
//     opened and read (`pdfToText`, poppler, same as Perkins). 4 of the 25
//     links (Johnson-DeBaufre, Mark A. Miller, Pressley, J. Terry Todd) 404 —
//     genuinely dead links on Drew's own site, not a fetch bug; confirmed with
//     a direct `curl`. 2 more (Katherine Brown, Kevin Newburg) have CVs that
//     open fine but carry no publications section at all — Brown teaches
//     language/communication skills and lists no scholarly output; Newburg's
//     CV is teaching/service/history-presentations only. The remaining 19
//     yielded a clean, separable publications list. As with MTSO's
//     Baek/Gibson/Stroud precedent, these are hand-transcribed into the
//     PUBLICATIONS map below rather than mechanically parsed out of the PDF
//     text — CV formats vary too much across 25 different people (bare lists,
//     dated headings, mixed conference-presentations-and-publications
//     sections, foreign-language entries) for one parser to trust
//     unsupervised, and a garbled citation is worse than a missing one (see
//     README's citation-parsing warnings). Selections cap at 5, most recent
//     first, and skip "forthcoming"/"in preparation"/"under review" entries
//     that aren't published yet. Re-running this script re-fetches the CV
//     PDFs into the cache (so a human re-reading them for the next annual
//     pass has them on hand) but does NOT re-derive PUBLICATIONS — that map
//     needs a human pass over the fresh PDFs the same way this one did.
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
import { htmlToText, links, pdfToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, Publication, SeminaryProfile, StudyArea } from "../../content/types.ts";

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

async function fetchFaculty(): Promise<{ entries: Entry[]; cvUrls: Record<string, string> }> {
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

  // CV PDF links, keyed by surname. Each anchor's link text reads
  // "<Name> CV – <year>" (or an HTML-entity en/em dash); the surname is the
  // stable key since it's also how FacultyMember ids are built below.
  const cvUrls: Record<string, string> = {};
  for (const { text: linkText, url } of links(body, FACULTY_URL)) {
    if (!/\.pdf$/i.test(url)) continue;
    const m = /^(.+?)\s+CV\s*[–—-]?\s*20\d\d$/.exec(linkText.trim());
    if (!m) continue;
    const surname = m[1].trim().split(/\s+/).slice(-1)[0];
    cvUrls[surname] = url;
  }

  return { entries, cvUrls };
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

// Hand-transcribed from each person's own linked CV PDF, opened and read
// 2026-08-07 (see the top-of-file note). Cap 5, most recent first, skipping
// "forthcoming"/"in preparation"/"under review" entries not yet published.
// Keyed by id (drew-<surname-slug>) rather than full name, matching every
// other lookup table in this file. 6 of the 25 people are absent on purpose:
// 4 whose CV link 404s (Johnson-DeBaufre, Miller, Pressley, Todd) and 2 whose
// CV has no publications section at all (Brown, Newburg) — see the top note.
const PUBLICATIONS: Record<string, Publication[]> = {
  "drew-aponte": [
    { title: "Latine Lived Religions and Religious Identities: ¡Presente!", year: 2026, kind: "edited-volume", publisher: "Bloomsbury Academic", note: "Co-edited with Miguel A. De La Torre; forthcoming September 2026." },
    { title: "Introducing Latinx Theologies", year: 2020, kind: "book", publisher: "Orbis Books", note: "Co-authored with Miguel A. De La Torre." },
    { title: "¡Santo! Varieties of Latino/a Spirituality", year: 2012, kind: "book", publisher: "Orbis Books" },
    { title: "Handbook of Latina/o Theologies", year: 2006, kind: "edited-volume", publisher: "Chalice Press", note: "Co-edited with Miguel A. De La Torre." },
    { title: "Introducing Latino/a Theologies", year: 2001, kind: "book", publisher: "Orbis Books", note: "Co-authored with Miguel A. De La Torre." },
  ],
  "drew-boesel": [
    { title: "Reading Karl Barth: Theology that Cuts both Ways", year: 2023, kind: "book", publisher: "Cascade Books" },
    { title: "In Kierkegaard's Garden with the Poppy Blooms: Why Derrida Doesn't Read Kierkegaard When He Reads Kierkegaard", year: 2021, kind: "book", publisher: "Lexington Books/Fortress Academic" },
    { title: "Divine Multiplicity: Trinities, Diversities, and the Nature of Relation", year: 2014, kind: "edited-volume", publisher: "Fordham University Press", note: "Co-edited with Wesley Ariarajah." },
    { title: "Apophatic Bodies: Negative Theology, Incarnation, and Relationality", year: 2010, kind: "edited-volume", publisher: "Fordham University Press", note: "Co-edited with Catherine Keller." },
    { title: "Risking Proclamation, Respecting Difference: Christian Faith, Imperialistic Discourse, and Abraham", year: 2008, kind: "book", publisher: "Cascade Books" },
  ],
  "drew-filler": [
    { title: "Modern Jewish Ethics, 1970-Present", year: 2025, kind: "edited-volume", publisher: "Brandeis University Press", note: "Co-edited with Jonathan Crane and Mira Wasserman." },
    { title: "Zionism and the Politics of Complexity", year: 2024, kind: "article", publisher: "Shofar 41.3" },
    { title: "Difficult Jewish Texts and Contemporary Political Crisis", year: 2023, kind: "article", publisher: "Religions" },
    { title: "The Incivility of Meir Kahane", year: 2022, kind: "article", publisher: "Journal of Religious Ethics" },
    { title: "The Honesty of Radical Pessimism", year: 2022, kind: "chapter", publisher: "University of Nebraska Press / Jewish Publication Society", note: "In Geoffrey Claussen, ed., Modern Musar: Contested Virtues in Jewish Thought." },
  ],
  "drew-golden": [
    { title: "Religion in the Classroom: Exploring the Issues", year: 2025, kind: "book", publisher: "Bloomsbury Press", note: "Co-authored with Joe McCallister; paperback edition." },
    { title: "Expanding the Borders of a Common Good: Transformational Encounters", year: 2024, kind: "chapter", publisher: "Oxford University Press", note: "In E. VanLaningham, ed., Called Beyond Our Selves: Vocation and the Common Good." },
    { title: "And the Nations Shall Flow Unto It", year: 2023, kind: "chapter", publisher: "Holy Land Books", note: "In S. Sarsar and C. Burnett, eds., What Jerusalem Means to Us: Jewish Perspectives and Reflections." },
    { title: "Encounters Beyond the Daled Amot", year: 2017, kind: "article", publisher: "Conversations 28" },
    { title: "Dawn of the Metal Age: the Origins of Social Complexity in the Southern Levant", year: 2010, kind: "book", publisher: "Equinox Publishing Ltd." },
  ],
  "drew-schol": [
    { title: "A Review of \"Transforming Fire: Imaging Christian Teaching\" by Mark D. Jordan", year: 2022, kind: "article", publisher: "Theology Today (SAGE Publications)", note: "Book review." },
    { title: "Contributor to Abingdon Preaching Manual", year: 2020, kind: "chapter", publisher: "Abingdon Press" },
    { title: "A Review of \"Waiting for a Glacier to Move\" by Jennifer Ayers", year: 2013, kind: "article", publisher: "Religious Education", note: "Book review." },
    { title: "A Playdate with the Early Church", year: 2012, kind: "article", publisher: "FOCUS: Boston University School of Theology Magazine" },
    { title: "Connecting the Dots – Christian call to public witness", year: 2010, kind: "article", publisher: "General Board of Church and Society – Faith in Action" },
  ],
  "drew-jathanna": [
    { title: "Colonization, Conversion, and Co-option: Postcolonial Reflections", year: 2024, kind: "chapter", publisher: "Weltweit Verlag", note: "In Ravinder Salooja, ed., Climbing High Mountains: Colonial Entanglement & Postcolonial Reflections." },
    { title: "Decolonising Eucharist: Reclaiming Postcolonial Alter-natives in the Face of Covid-19", year: 2023, kind: "chapter", publisher: "Cluster Publication", note: "In Lilian Cheelo Siwila, ed., The Church in Exile: Liturgy, Covid-19, and Lockdown Regulations." },
    { title: "Transformative Indigenous Queer Spiritualities: Journeying with Jogappas of India", year: 2022, kind: "chapter", publisher: "WCC & Globethics", note: "In Indigenous Transformative Spiritualities." },
    { title: "Entangled Historiographies of Christian Missions: A Subaltern Conversation and Contention", year: 2022, kind: "chapter", publisher: "LIT Verlag", note: "In Investigations on the \"Entangled History\" of Colonialism and Mission in a New Perspective." },
    { title: "Decolonising Oikoumene", year: 2020, kind: "book", publisher: "ISPCK & CWM" },
  ],
  "drew-kearns": [
    { title: "Trojan Horses Facing the Mirror: A Comparison between Religious Anti-Environmental Movement Organizations in the US and Brazil", year: 2024, kind: "article", publisher: "Journal for the Study of Religion, Nature and Culture 18.3", note: "Co-authored with Renan William dos Santos." },
    { title: "Religion and Nature in North America: An Introduction", year: 2024, kind: "chapter", publisher: "Bloomsbury", note: "Co-authored with Whitney Bauman; in Religion and Nature in North America, co-edited by Kearns and Bauman." },
    { title: "The Tent of Abraham: Judaism, Christianity, and Islam and Nature", year: 2024, kind: "chapter", publisher: "Bloomsbury", note: "Co-authored with Rebecca Gould; in Religion and Nature in North America." },
    { title: "Race, Religion and Environmental Racism in North America", year: 2024, kind: "chapter", publisher: "Bloomsbury", note: "Co-authored with Elaine Nogueira-Godsey and Whitney Bauman; in Religion and Nature in North America." },
    { title: "Climate Change", year: 2023, kind: "chapter", publisher: "Routledge", note: "In Grounding Religion: A Field Guide to the Study of Religion and Ecology, 3rd ed." },
  ],
  "drew-kim": [
    { title: "Reading with Minor Feelings: Racialized Emotions and Children's (Non)agency in Judges 10–12", year: 2020, kind: "article", publisher: "Biblical Interpretation 28.5", note: "Invited article for the thematic issue \"Children in the Bible and Childist Interpretation.\"" },
    { title: "Review of Landscapes of Korean and Korean American Biblical Interpretation, edited by John Ahn.", year: 2020, kind: "article", publisher: "Review of Biblical Literature", note: "Book review." },
    { title: "Queer Hermeneutics: Queering Asian American Identities and Biblical Interpretation", year: 2019, kind: "chapter", publisher: "T&T Clark / Bloomsbury", note: "In T&T Clark Handbook of Asian American Biblical Hermeneutics." },
    { title: "Weeping by the Water: Hydraulic Affects and Political Depression in South Korea after Sewol", year: 2019, kind: "chapter", publisher: "Fordham University Press", note: "In Religion, Emotion, Sensation: Affect Theories and Theologies." },
    { title: "Children of Diaspora: The Cultural Politics of Identity and Diasporic Childhood in the Book of Esther", year: 2019, kind: "chapter", publisher: "T&T Clark / Bloomsbury", note: "In T&T Clark Handbook of Children in the Bible and the Biblical World." },
  ],
  "drew-lee": [
    { title: "Spirit, Qi, and the Multitude: A Comparative Theology for the Democracy of Creation", year: 2014, kind: "book", publisher: "Fordham University Press" },
    { title: "All under Heaven and the City of God: A Familial and Ecclesial Reflection", year: 2024, kind: "chapter", publisher: "Wipf and Stock", note: "In David H. Jensen, ed., Christian Theology in a Pluralistic Age." },
    { title: "Jeong (情), Civility, and the Heart of a Pluralistic Democracy", year: 2022, kind: "chapter", publisher: "Palgrave MacMillan", note: "In Emotions in Korean Philosophy and Religion, ed. Edward Y. J. Chung and Jea Sophia Oh." },
    { title: "My Path to a Theology of Qi", year: 2019, kind: "chapter", publisher: "Routledge", note: "In Theology Without Walls: The Transreligious Imperative, ed. Jerry L. Martin." },
    { title: "Confucian Democracy and a Pluralistic Li-Ki Metaphysics", year: 2018, kind: "article", publisher: "Religions 9, no. 11" },
  ],
  "drew-mann": [
    { title: "Johannis de Segovia Epistola ad Guillielmum de Orliaco", year: 2023, kind: "chapter", publisher: "Harrassowitz", note: "Critical edition in Johannes de Segovia, Opera minora, ed. Ulli Roth et al., Corpus Islamo-Christianum, Series Latina, 12." },
    { title: "On the Dating of Juan de Segovia's Super materia contractuum de censibus annuis", year: 2022, kind: "article", publisher: "Cristianesimo nella storia 43, no. 1" },
    { title: "Engaging the Alumnus/a Donor: A Case Study Based on Drew University's R. S. Thomas Collection", year: 2021, kind: "chapter", publisher: "ATLA", note: "Co-authored with Brian Shetler; in Preserving the Past & Engaging the Future: Theology & Religion in American Special Collections." },
    { title: "Facing the Music: The Whimsical Cadels in a Late Medieval English Book of Hours", year: 2020, kind: "article", publisher: "Peregrinations: Journal of Medieval Art & Architecture 7, no. 2", note: "Co-authored with Anne Bagnall Yardley." },
    { title: "Notable Luther and Melanchthon: An Annotated Copy of Luther's Confitendi ratio", year: 2020, kind: "article", publisher: "Reformation 25, no. 2", note: "Co-authored with Leif McLellan." },
  ],
  "drew-moore": [
    { title: "Jesusviolence: Racism, Speciesism, and Other Violences in and around the Gospels", year: 2026, kind: "book", publisher: "Oxford University Press", note: "E-version November 2025; print version February 2026." },
    { title: "Decolonial Theory and Biblical Unreading: Delinking Biblical Criticism from Coloniality", year: 2024, kind: "book", publisher: "Brill" },
    { title: "The Bible after Deleuze: Affects, Assemblages, Bodies without Organs", year: 2023, kind: "book", publisher: "Oxford University Press" },
    { title: "Revelation: Book of Torment, Book of Bliss", year: 2021, kind: "book", publisher: "Bloomsbury", note: "T&T Clark's Study Guides to the New Testament." },
    { title: "Gospel Jesuses and Other Nonhumans: Biblical Criticism Post-poststructuralism", year: 2017, kind: "book", publisher: "SBL Press", note: "Semeia Studies, 89." },
  ],
  "drew-noguiera-godsey": [
    { title: "Decolonizing Dialogues: Bridging Ecofeminism, Religion, and the Decological Path Forward", year: 2024, kind: "chapter", publisher: "T & T Clark", note: "In Searching for the Future in the Past: Reclaiming Feminist Theological Visions, ed. Kathleen Talvacchia and Keun-joo Christine Pae." },
    { title: "Race, Religion and Environmental Racism in North America", year: 2024, kind: "chapter", publisher: "Bloomsbury Publishing", note: "Revised edition; co-authored with Laurel Kearns and Whitney A. Bauman; in Bloomsbury Religion in North America." },
    { title: "A Decological Way to Dialogue: Rethinking Ecofeminism and Religion", year: 2022, kind: "chapter", publisher: "Routledge", note: "In The Routledge Handbook of Religions, Gender and Society, ed. Emma Tomalin and Caroline Starkey." },
    { title: "Tangible Actions Toward Solidarity: An Ecofeminist Analysis of Women's Participation in Food Justice", year: 2021, kind: "chapter", publisher: "Peeters Publishers", note: "Co-authored with Kelsey Ryan-Simkins; in Valuing Lives, Healing Earth: Religion, Gender, and Life on Earth." },
    { title: "Environmental Racism in the 'True' America: A Reflection on Race, the Earth, and Moral Action after Trump", year: 2021, kind: "chapter", publisher: "Orbis Books", note: "Co-authored with Trad Nogueira-Godsey; in Faith and Reckoning After Trump, ed. Miguel De La Torre." },
  ],
  "drew-pelaez-diaz": [
    { title: "La Santa Muerte – Saint Death", year: 2024, kind: "chapter", publisher: "Bloomsbury Academic", note: "In Latin American and US Latino Religions in North America: An Introduction, ed. Lloyd Daniel Barba." },
    { title: "La Santa Muerte – Saint Death", year: 2023, kind: "chapter", publisher: "Bloomsbury", note: "Online chapter, Bloomsbury Religion in North America / Latin American Religions in North America." },
    { title: "\"You Belong Here\"", year: 2020, kind: "article", publisher: "Auburn Seminary", note: "Report co-authored with Chris Alexander, Erica M. Ramirez, Christian Scharen, and Mary Laurel True." },
    { title: "Central American Migration as the Way of the Cross: Ignacio Ellacuría's 'Crucified Peoples' as a Theological Reframing of the Migrant Experience", year: 2019, kind: "chapter", publisher: "Augsburg Fortress", note: "In Migration and Public Discourse in World Christianity, ed. Afeosemime Adogame, Raimundo César Barreto, and Wanderley Pereira da Rosa." },
  ],
  "drew-shin": [
    { title: "Towards Ecclesial Diversity: A Case Study in Theological Hermeneutics", year: 2024, kind: "article", publisher: "Ecclesiological Investigations" },
    { title: "Review of The Unique and Universal Christ: Refiguring the Theology of Religions by Drew Collins", year: 2023, kind: "article", publisher: "The Scottish Journal of Theology 76, no. 3", note: "Book review." },
    { title: "Baptism and Evangelism", year: 2023, kind: "chapter", publisher: "Cascade Books", note: "In New Life in the Risen Christ: A Wesleyan Theology of Baptism, ed. Jonathan Powers." },
    { title: "Reimagining Evangelism: An Interdisciplinary Assessment and Proposal", year: 2022, kind: "article", publisher: "Witness" },
    { title: "Theology and the Public: Reflections on Hans W. Frei's Hermeneutics, Christology, and Theological Method", year: 2019, kind: "book", publisher: "Lexington Books/Rowman and Littlefield" },
  ],
  "drew-simpson": [
    { title: "Connections: A Lectionary Commentary for Preaching and Worship", year: 2020, kind: "chapter", publisher: "Westminster John Knox Press", note: "Contributor: \"Exodus 20:1-17,\" \"Numbers 21:4-9,\" \"Jeremiah 31:31-34,\" ed. Thomas Long et al." },
    { title: "Abingdon Preaching Annual", year: 2020, kind: "chapter", publisher: "Abingdon Press", note: "Contributor: \"Third Sunday After Epiphany,\" \"First Sunday After Pentecost,\" \"Christ the King Sunday.\"" },
    { title: "Foreword", year: 2011, kind: "chapter", publisher: "Circle Books", note: "In David O. Woodyard, The Church in a Time of Empire." },
    { title: "God Alone Exalted", year: 2009, kind: "chapter", publisher: "UMI Press", note: "Sermon derived from Isaiah 2:1-11, in Gardner C Taylor: Submissions to the Dean, ed. J. Douglas Wiley and Ivan Hicks." },
    { title: "Pastoral Perspective", year: 2009, kind: "chapter", publisher: "Westminster John Knox Press", note: "Contributor: Psalms 4, 22, 23, in Feasting on the Word, Lectionary for Preaching: Year B." },
  ],
  "drew-son": [
    { title: "What is Spiritual Care from a Christian Perspective?: Pastoral Care for Rage and Joy", year: 2025, kind: "chapter", publisher: "Wipf and Stock", note: "In What Is Spiritual Care?, ed. Pamela Cooper-White, Claudia K. Reichenbach, and Emmanuel Y. Lartey." },
    { title: "Recapturing the Bible as the Living Word Through God as Selfobject: The Descriptive Eclipsed into the Prescriptive in Pastoral Practices and the Bible", year: 2023, kind: "chapter", publisher: "Wipf and Stock", note: "In Biblical and Pastoral Bridgework: Interdisciplinary Conversations, ed. Denise Dombkwoski Hopkins and Michael S. Koppel." },
    { title: "Review of Comfort Women: A Movement for Justice and Women's Rights in the United States, edited by Jung Sil Lee and Dennis P. Halpin", year: 2022, kind: "article", publisher: "Journal of International Women's Studies 24, no. 9", note: "Book review." },
    { title: "Pastoral Care in a Korean American Context", year: 2020, kind: "edited-volume", publisher: "Palgrave Macmillan", note: "Editor and contributor of two chapters." },
    { title: "Conversion Experiences of Adults in El Salvador", year: 2020, kind: "article", publisher: "Pastoral Psychology 69" },
  ],
  "drew-spencer-miller": [
    { title: "From White Man's Magic to Black Folks' Wisdom", year: 2023, kind: "chapter", publisher: "Fordham University Press", note: "In Kenneth N. Ngwa et al., eds., Life Under the Baobab Tree: Africana Studies and Religion in a Transitional Age." },
    { title: "Emancipation: Wheel and Come Again", year: 2020, kind: "chapter", publisher: "Paul Walfall" },
    { title: "Looking Forward from the Horizon: A Response in Africana Sisterhood and Solidarity", year: 2016, kind: "chapter", publisher: "SBL Press", note: "In Gay L. Byron and Vanessa Lovelace, eds., Womanist Interpretations of the Bible: Expanding the Discourse." },
    { title: "Creolizing Hermeneutics: A Caribbean Invitation", year: 2015, kind: "chapter", publisher: "SBL Press", note: "In Islands, Islanders, and the Bible: Ruminations, ed. Jione Havea, Margaret Aymer and Steed Vernyl Davidson." },
    { title: "Feminist Hermeneutics: New Testament", year: 2014, kind: "chapter", publisher: "Walter de Gruyter", note: "In Encyclopedia of the Bible and its Reception, Vol. F." },
  ],
  "drew-winderweedle": [
    { title: "Review of Kristina Lizardy Hajbi, Unraveling Religious Leadership: Power, Authority, and Decoloniality", year: 2025, kind: "article", publisher: "Homiletic 50, no. 2", note: "Book review." },
  ],
  "drew-seesengood": [
    { title: "American Standard: The Bible in U.S. Popular Culture", year: 2024, kind: "book", publisher: "Wiley-Blackwell" },
    { title: "The Bible and Cultural Studies: Critical Readings", year: 2023, kind: "book", publisher: "Bloomsbury / T & T Clark", note: "T & T Clark, Critical Readings in Biblical Studies." },
    { title: "Judith", year: 2022, kind: "book", publisher: "Liturgical Press", note: "Co-authored with Jennifer L. Koosed; Wisdom Commentary Series, ed. Barbara Reid and Amy-Jill Levine." },
    { title: "The Bible and New Materialism", year: 2020, kind: "edited-volume", publisher: "Bible & Critical Theory 16.2", note: "Co-edited with Andrew Wilson." },
    { title: "Pasolini's St. Paul", year: 2018, kind: "edited-volume", publisher: "Biblical Interpretation 26.4", note: "Co-edited with Joseph Marchal." },
  ],
};

function buildFaculty(entries: Entry[], cvUrls: Record<string, string>): FacultyMember[] {
  return entries.map((e) => {
    const title = e.titleLines[0] ?? "";
    const otherRoles = e.titleLines.slice(1);
    const signalText = e.titleLines.join(" · ");
    let areas = suggestAreas(signalText);
    if (areas.length === 0) areas = MANUAL_AREA_FALLBACK[e.name] ?? [];

    const surname = e.name.trim().split(/\s+/).slice(-1)[0];
    const id = `drew-${slugifyName(surname)}`;
    const member: FacultyMember = {
      id,
      seminarySlug: "drew",
      name: e.name,
      title,
      areas,
      profileUrl: FACULTY_URL,
    };
    if (otherRoles.length) member.otherRoles = otherRoles;
    if (e.degrees.length) member.degrees = e.degrees;
    const publications = PUBLICATIONS[id];
    if (publications?.length) {
      member.publications = publications.slice(0, 5);
      member.publicationsSource = cvUrls[surname] ?? FACULTY_URL;
      member.publicationsAsOf = today();
    }
    return member;
  });
}

async function main() {
  const { entries, cvUrls } = await fetchFaculty();
  const faculty = buildFaculty(entries, cvUrls);
  await writeFile(join(ROOT, "data/faculty/drew.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/drew.json`);

  // Touch the pages this profile is built from, so they land in the fetch
  // cache alongside this run even though the coverage table below is
  // hand-assembled from the prose (per README §2 — a school's own mapping,
  // where it has one, is a lead and never the evidence).
  await get(MDIV_CATALOG_URL, { fresh });
  await get(GRAD_TUITION_URL, { fresh });
  await get(FEE_SCHEDULE_URL, { fresh });

  // Warm the CV PDF cache for whoever does the next annual publications pass
  // (see the top-of-file note — PUBLICATIONS above is hand-transcribed, not
  // re-derived here). 4 of the 25 links are known-dead (404) as of this
  // writing; failures are logged and skipped rather than aborting the run.
  for (const [surname, url] of Object.entries(cvUrls)) {
    try {
      const pdf = await get(url, { fresh, binary: true });
      pdfToText(pdf.path); // just to confirm it's still readable; not parsed here
    } catch (e) {
      console.warn(`CV fetch/read failed for ${surname} (${url}): ${String(e)}`);
    }
  }

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

    facultyNote: "Limited to the 25 people on Drew's faculty directory page listed ahead of its explicit 'Emeriti Faculty' heading — the page's own implicit cut for current, active, full-time faculty; adjunct/affiliate faculty are listed separately below the emeriti section and excluded here on the same basis Duke and Saint Paul used for their own adjunct/emeritus exclusions. Drew publishes no individual per-professor pages — each entry links a dated CV PDF instead. All 25 CVs were opened and read (2026-08-07): 4 links 404 (Johnson-DeBaufre, Miller, Pressley, Todd — confirmed dead on Drew's own site, not a fetch bug) and 2 more CVs carry no publications section at all (Brown, Newburg); the remaining 19 have a publications selection (cap 5, most recent first) sourced to their own CV PDF. `workingOn` stays empty across the board — no human has yet read any of these 25 people's current work closely enough to summarize it, which is a higher bar than pulling a citation list.",

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
