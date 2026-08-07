// Boston University School of Theology — one of the 13 UMC schools of theology,
// and the oldest: founded in 1839 as the first Methodist seminary in the US.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//   - bu.edu/sth is plain server-rendered HTML (WordPress) — no JS wall, no PDF.
//     A `curl`-with-UA fetch of each page is enough; `lib/fetch.mts`'s `get()`
//     works fine here too (this script's harvest run touches every URL below
//     through it, even though the coverage table — like Duke's and Saint
//     Paul's — is hand-built from a careful read, not parsed).
//   - THE COVERAGE FINDING, and it's a new shape for this project: BU's MDiv
//     has THREE vocational TRACKS (Ecclesial Ministry, Chaplaincy, Global and
//     Community Engagement), declared by the end of the first year, each with
//     its own 15-unit track requirement layered on a shared 30-unit core.
//     Preaching and Worship are named, binding requirements — but only inside
//     the Ecclesial Ministry track, one of three a student of ANY denomination
//     may freely choose. No prior school in this project had requirements
//     that varied by a track a student elects rather than by denomination.
//     Scored `elective`: BU never states that a UMC student in particular is
//     bound to Preaching or Worship, and a student who chooses Chaplaincy or
//     Global and Community Engagement satisfies the MDiv without either.
//     Evangelism, Mission of the Church, and UM Studies are elective on
//     firmer footing still: BU's own Denominational Studies page describes
//     TC-723 (UM Polity), TH-821 (UM History & Doctrine), TC-835
//     (Evangelism), and TM-815 (Christian Mission) as courses the school
//     "offers... which can be taken at any time" — offering language, not
//     Duke's "must fulfill... by completing" or Phillips' "required to take."
//     The same four courses also appear, undifferentiated, as four of several
//     options inside the Ecclesial Ministry track's single "Ecclesiastical
//     Studies (Choose one)" slot — a student can clear that slot with UM
//     Polity alone and never touch Evangelism, Mission, or UM History &
//     Doctrine, or vice versa. Old Testament, New Testament, Theology, and
//     Church History ARE required of every MDiv student regardless of track:
//     they sit in the shared 30-unit core, and BU's own Denominational
//     Studies page confirms the school "requires MDiv students to take two
//     courses each" in those four — the only areas of the nine it states as a
//     flat requirement rather than an offering.
//   - Two sources had to be read together: the MDiv degree-programs page
//     (bu.edu/sth/academics/degree-programs/master-of-divinity/), which
//     states the core/track structure and exact course codes per track, and
//     the Wesleyan-Methodist Community of Learning page
//     (bu.edu/sth/academics/denominational-studies/wesleyan-methodist/),
//     which is the one that actually distinguishes "requires" from "offers."
//     Neither alone gives the ¶324.4 answer.
//   - A parsing trap worth naming: BU's own markup opens `<em>` tags mid-word
//     in several bulletin citations ("Th<em>e Bible and the Hermeneutics...").
//     A mechanical htmlToText strip renders this "Th e Bible" — a defect in
//     the source markup, not the harvester. Eyeball every citation for a
//     stray internal space before it ships; this script's ROSTER below has
//     these hand-corrected already.
//   - Honorary-doctorate trap, a new variant: emilie m. townes holds a D.D.
//     Honoris Causa (United Lutheran Seminary, 2025) — but BU's profile page
//     lists it under "Awards & Honors," not under "Education." Her actual
//     Education block (PhD, DMin, MA, BA) never mentions it. The honorary
//     degree is left out of her `degrees` array entirely rather than folded
//     in and marked "(honorary)" — it was never presented as a credential in
//     the first place, so adding it would manufacture the very trap the
//     validator's rule exists to catch, from the opposite direction.
//   - Faculty directory: bu.edu/sth/about/faculty/ renders every tab's
//     roster (Faculty / Adjunct / Affiliated / Lecturers / Methodist /
//     Retired-Emeritus) in one page, each `<li>` tagged with a
//     `sth_faculty_type-*` class. The `faculty` tag (30 people) is BU's own
//     "core full-time" cut — Methodist Faculty is a cross-cutting subset of
//     the same 30, not an additional roster, and was not double-counted.
//     Each has a real per-professor page at /sth/profile/<slug>/, but unlike
//     Duke's clean "Selected Publications" sections, most are long personal
//     CVs (some 350+ lines) mixing books with lectionary columns, book
//     reviews, and conference-paper lists. Publications below were hand-
//     picked from each CV's Books/Articles/Chapters sections — the cleanest,
//     most complete citations, capped at five — rather than mechanically
//     parsed; a mechanical cut would have surfaced review blurbs and
//     unpublished manuscripts as if they were peer output.
//
// Run: node scripts/harvest/boston.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import type { FacultyMember, Publication, SeminaryProfile, StudyArea } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://www.bu.edu/sth";
const MDIV_URL = `${BASE}/academics/degree-programs/master-of-divinity/`;
const OMDIV_URL = `${BASE}/academics/degree-programs/online-master-of-divinity/`;
const WESLEYAN_METHODIST_URL = `${BASE}/academics/denominational-studies/wesleyan-methodist/`;
const FACULTY_DIR_URL = `${BASE}/about/faculty/`;
const TUITION_FEES_URL = `${BASE}/academics/tuition-financial-aid/tuition-fees/`;
const SCHOLARSHIPS_URL = `${BASE}/academics/tuition-financial-aid/scholarships-fellowships/`;
const ATS_URL = "https://www.ats.edu/member-schools/boston-university-school-of-theology";

interface Entry {
  name: string;
  title: string;
  otherRoles?: string[];
  profileUrl: string;
  areas: StudyArea[];
  degrees?: string[];
  publications?: Publication[];
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

// Boston University School of Theology's "Faculty" tab (core full-time,
// regular rank) from bu.edu/sth/about/faculty/, captured 2026-08-07. Areas,
// degrees, and publications hand-read from each person's own profile page —
// see the file-header note on why this roster is curated rather than parsed.
const ROSTER: Entry[] = [
  {
    name: "Timothy L. Adkins-Jones",
    title: "Assistant Professor of Homiletics",
    profileUrl: `${BASE}/profile/timothy-l-adkins-jones-2/`,
    areas: ["preaching"],
    degrees: ["PhD, Boston University", "MDiv, Boston University", "BA, Amherst College"],
    publications: [
      { title: "Let the Church Say Amen: A Black Communal Homiletic", kind: "book", publisher: "Fortress Press", note: "forthcoming" },
      { title: "\"Black Preaching in Brown Places: Towards the Development of a Black Mestizo Homiletic,\" Homiletic 40, no. 1 (2015)", kind: "article", year: 2015 },
    ],
  },
  {
    name: "Alejandro F. Botta",
    title: "Associate Professor of Hebrew Bible",
    profileUrl: `${BASE}/profile/alejandro-f-botta/`,
    areas: ["hebrew-bible", "latino-hispanic-ministry"],
    degrees: [
      "PhD, summa cum laude, History of the Jewish People, The Hebrew University of Jerusalem",
      "Diploma de Estudios Avanzados, Departamento de Ciencias de las Religiones, Universidad Complutense (Madrid, Spain)",
      "Study of Assyriology and Egyptology, Bayerische-Julius-Maximilians-Universität, Würzburg, Germany",
      "Licenciatura en Teología, Instituto Universitario ISEDET (Buenos Aires, Argentina)",
      "Profesor de Enseñanza Secundaria, Normal y Especial en Historia, and Licenciatura en Historia, Universidad de Buenos Aires",
      "BTh, Instituto Bíblico Buenos Aires",
    ],
    publications: [
      { title: "The Aramaic and Egyptian Legal Traditions at Elephantine: An Egyptological Approach, Library of Second Temple Studies 64 (London and New York: T&T Clark, 2009)", kind: "book", year: 2009 },
      { title: "Los Doce Profetas Menores (Minneapolis: Fortress Press, 2006)", kind: "book", year: 2006 },
      { title: "In the Shadow of Bezalel: Aramaic, Biblical, and Ancient Near Eastern Studies in Honor of Bezalel Porten, editor (Leiden: Brill, 2013)", kind: "edited-volume", year: 2013 },
      { title: "The Bible and the Hermeneutics of Liberation, with Pablo Andiñach, eds., Semeia Studies 59 (Atlanta: Society of Biblical Literature, 2009)", kind: "edited-volume", year: 2009 },
      { title: "\"1 & 2 Chronicles,\" in The Fortress Commentary on the Bible, ed. Matthew J. Coomber, Hugh R. Page Jr., and Gale A. Yee (Minneapolis: Fortress Press, 2014), 439–466", kind: "chapter", year: 2014 },
    ],
  },
  {
    name: "Christopher Boyd Brown",
    title: "Associate Professor of Church History",
    profileUrl: `${BASE}/profile/christopher-boyd-brown/`,
    areas: ["church-history"],
    degrees: [
      "PhD, History, Harvard University",
      "MDiv, Concordia Seminary, St. Louis",
      "MA, History, Harvard University",
      "AB, History and Literature, Harvard University",
    ],
    publications: [
      { title: "Singing the Gospel: Lutheran Hymns and the Success of the Reformation, Harvard Historical Studies 148 (Cambridge, MA: Harvard University Press, 2005)", kind: "book", year: 2005 },
      { title: "\"Art and the Artist in the Lutheran Reformation: Johannes Mathesius and Joachimsthal,\" Church History 86, no. 4 (December 2017): 1081–1120", kind: "article", year: 2017 },
      { title: "\"Devotional Life in Liturgy, Hymns, Music, and Prayer,\" in Lutheran Ecclesiastical Culture: 1550–1675, ed. Robert Kolb, Brill's Companions to the Christian Tradition 11 (Leiden: Brill, 2008), 205–258", kind: "chapter", year: 2008 },
      { title: "\"Paul Gerhardt in Context: Lutheran Hymnody, the Second Reformation, and the Thirty Years' War,\" Journal of the Good Shepherd Institute 8 (2007): 15–31", kind: "article", year: 2007 },
    ],
  },
  {
    name: "Eunil David Cho",
    title: "Assistant Professor of Spiritual Care & Counseling",
    otherRoles: ["Co-Director of the Center for Practical Theology"],
    profileUrl: `${BASE}/profile/eunil-david-cho/`,
    areas: ["pastoral-care-counseling", "practical-theology"],
    degrees: ["PhD, Emory University", "MDiv, Candler School of Theology, Emory University", "BA, University of Michigan, Ann Arbor"],
    publications: [
      { title: "Undocumented Migration as a Theologizing Experience: Religious Stories Korean American Dreamers Tell in the Face of Uncertainty (Leiden: Brill, 2024)", kind: "book", year: 2024 },
      { title: "\"Breaking the Asian American Silence at a Time Like This: Lessons from Esther 4,\" Theology Today 82, no. 3 (2025): 217–231, co-authored with Hyun Woo Kim", kind: "article", year: 2025 },
      { title: "\"The Genesis of William James's Psychology of Religion: From 'The Principles of Psychology' to 'The Varieties of Religious Experience,'\" Religions 16, no. 11 (2025): 1404, co-authored with John Snarey and Shelby Hall", kind: "article", year: 2025 },
    ],
  },
  {
    name: "Rebecca Copeland",
    title: "Associate Professor of Theology",
    profileUrl: `${BASE}/profile/rebecca-copeland/`,
    areas: ["systematic-theology"],
    degrees: [
      "PhD, Emory University",
      "ThM, Candler School of Theology, Emory University",
      "MDiv, Candler School of Theology, Emory University",
      "JD, William and Mary School of Law",
      "BA, University of Miami",
    ],
    publications: [
      { title: "Entangled Being: Unoriginal Sin and Wicked Problems (Waco, TX: Baylor University Press, 2024)", kind: "book", year: 2024 },
      { title: "Created Being: Expanding Creedal Christology (Waco, TX: Baylor University Press, 2020)", kind: "book", year: 2020 },
      { title: "\"The Perils of Premature Judgment: Reading Matthew 21.18–22.14 with the Fig Tree,\" Journal for the Study of the New Testament 45 (2023): 264–283", kind: "article", year: 2023 },
      { title: "\"Bats, Viruses, and Human Beings: A Chiropteraphilic Theodicy,\" Scottish Journal of Theology 74 (2021): 1–11", kind: "article", year: 2021 },
      { title: "\"Ecomimetic Interpretation: Ascertainment, Identification, and Dialogue in Matthew 6:25-34,\" Biblical Interpretation 29 (2021): 67–89", kind: "article", year: 2021 },
    ],
  },
  {
    name: "Cristian De La Rosa",
    title: "Clinical Assistant Professor of Contextual Theology & Practice",
    otherRoles: ["Director, Raíces Latinas Program"],
    profileUrl: `${BASE}/profile/cristian-de-la-rosa/`,
    // No publications list on her own STH profile — her bio names a UMC
    // clergy career (New England Annual Conference) instead. Left absent
    // rather than guessed; see README's "absent rather than guessed."
    areas: ["practical-theology", "latino-hispanic-ministry"],
    degrees: [
      "PhD, Chicago Theological Seminary",
      "MTS, Chicago Theological Seminary",
      "MDiv, Wesley Theological Seminary",
      "BA, University of the Pacific",
      "AA, San Joaquin Delta College",
    ],
  },
  {
    name: "Courtney T. Goto",
    title: "Associate Professor of Religious Education",
    otherRoles: ["Co-Director of the Center for Practical Theology"],
    profileUrl: `${BASE}/profile/courtney-t-goto/`,
    areas: ["christian-education-formation", "practical-theology"],
    degrees: ["PhD, Emory University", "MTS, Harvard Divinity School", "BA, Mills College"],
    publications: [
      { title: "Taking on Practical Theology: The Idolization of Context and the Hope of Community (Leiden: Brill, 2018)", kind: "book", year: 2018 },
      { title: "The Grace of Playing: Pedagogies for Leaning into God's New Creation (Eugene, OR: Pickwick, 2016)", kind: "book", year: 2016 },
      { title: "\"Beyond the Black-White Binary of US Race Relations: A Next Step in Religious Education,\" Religious Education 112, no. 1 (2017)", kind: "article", year: 2017 },
      { title: "\"Experiencing Oppression: Ventriloquism and Epistemic Violence in Practical Theology,\" International Journal of Practical Theology 21, no. 2 (2017): 175–193", kind: "article", year: 2017 },
    ],
  },
  {
    name: "Choi Hee An",
    title: "Clinical Associate Professor of Practical Theology",
    otherRoles: ["Director of the Anna Howard Shaw Center"],
    profileUrl: `${BASE}/profile/choi-hee-an/`,
    areas: ["practical-theology", "womanist-feminist-theology"],
    degrees: [
      "PhD, Chicago Theological Seminary",
      "MA, United Theological Seminary",
      "MDiv, Graduate School of Theology, Hanshin University",
      "BS, The Catholic University of Korea",
    ],
    publications: [
      { title: "A Postcolonial Relationship: Challenges of Asian Immigrants as the Third Other (Albany: State University of New York Press, 2022)", kind: "book", year: 2022 },
      { title: "A Postcolonial Leadership: Asian Immigrant Christian Leadership and Its Challenges (Albany: State University of New York Press, 2020)", kind: "book", year: 2020 },
      { title: "A Postcolonial Self: Korean Immigrant Theology and Church (Albany: State University of New York Press, 2015)", kind: "book", year: 2015 },
      { title: "Engaging the Bible: Critical Readings from Contemporary Women, ed. Choi Hee An and Katheryn Pfisterer Darr (Minneapolis: Fortress Press, 2006)", kind: "edited-volume", year: 2006 },
      { title: "Korean Women and God: Experiencing God in a Multi-Religious Colonial Context (Maryknoll, NY: Orbis Books, 2005)", kind: "book", year: 2005 },
    ],
  },
  {
    name: "Robert Allan Hill",
    title: "Professor of New Testament & Pastoral Theology",
    otherRoles: ["Dean of Marsh Chapel", "Chaplain to the University"],
    profileUrl: `${BASE}/profile/robert-allan-hill/`,
    areas: ["new-testament", "chaplaincy"],
    degrees: ["PhD, New Testament, McGill University", "MDiv, Union Theological Seminary", "BA, Ohio Wesleyan University"],
    publications: [
      { title: "Partnership in the Gospel: Seven Exercises in Liberal Biblical Theology (Eugene, OR: Wipf and Stock, 2024)", kind: "book", year: 2024 },
      { title: "Salt City Prayers (Eugene, OR: Wipf and Stock, 2024)", kind: "book", year: 2024 },
      { title: "An Addressable Community (Eugene, OR: Wipf and Stock, 2020)", kind: "book", year: 2020 },
      { title: "Toward a Common Hope: Chautauqua Lake Sermons (Eugene, OR: Wipf and Stock, 2018)", kind: "book", year: 2018 },
      { title: "Parish Preaching (Eugene, OR: Wipf and Stock, 2016)", kind: "book", year: 2016 },
    ],
  },
  {
    name: "Daryl Ireland",
    title: "Research Associate Professor",
    profileUrl: `${BASE}/profile/daryl-ireland/`,
    areas: ["world-christianity"],
    degrees: ["PhD, Boston University", "MA, Nazarene Theological Seminary", "MDiv, Nazarene Theological Seminary", "BA, Wheaton College"],
    publications: [
      { title: "Chinese Christian Witness: Identity, Creativity, Transmission, and Poetics, co-editor (Leiden: Brill, 2025)", kind: "edited-volume", year: 2025 },
      { title: "New Wineskins: Forming and Reforming the American Society of Missiology, 1973–2023, co-author (Eugene, OR: Wipf & Stock, 2025)", kind: "book", year: 2025 },
      { title: "Visions of Salvation: Chinese Christian Propaganda Posters in an Age of Revolution, editor (Waco, TX: Baylor University Press, 2023)", kind: "edited-volume", year: 2023 },
      { title: "Unlikely Friends: How God Uses Boundary Crossing Friendship to Transform the World, co-editor (Eugene, OR: Cascade Books, 2021)", kind: "edited-volume", year: 2021 },
      { title: "John Song: Chinese Christianity and the Making of a New Man (Waco, TX: Baylor University Press, 2020)", kind: "book", year: 2020 },
    ],
  },
  {
    name: "Filipe Maia",
    title: "Assistant Professor of Theology",
    profileUrl: `${BASE}/profile/filipe-maia/`,
    // Bio and publication record (Methodism and American Empire; Decolonizing
    // Wesleyan Theology; "John Wesley and the Political Economy of
    // Enclosure") are squarely Wesleyan/Methodist studies, not just theology.
    areas: ["systematic-theology", "wesleyan-studies"],
    degrees: [
      "ThD, Harvard Divinity School",
      "MTS, Perkins School of Theology",
      "BTh, Universidade Metodista de São Paulo",
      "BPh, Universidade Metodista de São Paulo",
    ],
    publications: [
      { title: "Trading Futures: Toward a Theological Critique of Financialized Capitalism (Durham, NC: Duke University Press, 2022)", kind: "book", year: 2022 },
      { title: "Decolonizing Wesleyan Theology: Theological Engagements from the Underside of Methodism, editor (Eugene, OR: Cascade Books, 2024)", kind: "edited-volume", year: 2024 },
      { title: "Methodism and American Empire: Reflections on Decolonizing the Church, ed. David W. Scott and Filipe Maia (Nashville, TN: Abingdon, 2023)", kind: "edited-volume", year: 2023 },
      { title: "\"John Wesley and the Political Economy of Enclosure,\" Methodist Review 17 (2025): 29–56", kind: "article", year: 2025 },
      { title: "\"Alter-carnation: Notes on Cannibalism and Coloniality in the Brazilian Context,\" in Beyond Man: Race, Coloniality, and Philosophy of Religion, ed. An Yountae and Eleanor Craig (Durham, NC: Duke University Press, 2021)", kind: "chapter", year: 2021 },
    ],
  },
  {
    name: "Nicolette D. Manglos-Weber",
    title: "Associate Professor of Religion & Society",
    otherRoles: ["Associate Dean of Students & Community Life"],
    profileUrl: `${BASE}/profile/nicolette-d-manglos-weber/`,
    areas: ["world-christianity", "ethics-public-theology"],
    degrees: ["PhD, University of Texas at Austin", "MA, University of Texas at Austin", "BA, Sociology, Wheaton College"],
    publications: [
      { title: "\"Religious Life in African Societies,\" in The Oxford Handbook of the Sociology of Africa, ed. R. Sooryamoorthy and E. N. Khalema (online, September 21, 2022)", kind: "chapter", year: 2022 },
      { title: "\"Ghana's Plans for a National Cathedral are Mired in Controversy and Delays but also Reflect Religion's Strong Role in the Nation's Identity,\" The Conversation, August 15, 2023", kind: "article", year: 2023 },
      { title: "\"US Talks Sanctions against Uganda after a Harsh Anti-Gay Law but Criminalizing Same-Sex Activities has Become a Political Tactic Globally,\" The Conversation, June 22, 2023", kind: "article", year: 2023 },
    ],
  },
  {
    name: "James McCarty",
    title: "Clinical Assistant Professor of Religion & Conflict Transformation",
    otherRoles: ["Director, Tom Porter Religion & Conflict Transformation Program"],
    profileUrl: `${BASE}/profile/james-mccarty/`,
    areas: ["ethics-public-theology", "mission-social-justice"],
    degrees: ["PhD, Emory University", "MA, Claremont School of Theology", "BA, Pepperdine University"],
    publications: [
      { title: "The Business of Incarceration: Theological and Ethical Reflections on the Prison-Industrial Complex, co-edited with Justin Bronson Barringer and Sarah F. Farmer (Eugene, OR: Cascade Books, 2025)", kind: "edited-volume", year: 2025 },
      { title: "The Business of War: Theological and Ethical Reflections on the Military-Industrial Complex, co-edited with Mathew A. Tapie and Justin Bronson Barringer (Eugene, OR: Cascade Books, 2020)", kind: "edited-volume", year: 2020 },
      { title: "\"Desmond Tutu's Spirituality of Protest,\" Spiritus: A Journal of Christian Spirituality 24, no. 1 (2024): 120–137", kind: "article", year: 2024 },
      { title: "\"'Hope is a Discipline': Practicing Moral Imagination in Transformative Justice,\" Journal of the Society of Christian Ethics 43, no. 1 (2023): 129–147", kind: "article", year: 2023 },
      { title: "\"The Power of Hope in the Work of Justice: Christian Ethics after Despair,\" Journal of the Society of Christian Ethics 40, no. 1 (2020): 39–57", kind: "article", year: 2020 },
    ],
  },
  {
    name: "Luis Menéndez-Antuña",
    title: "Associate Professor of New Testament",
    profileUrl: `${BASE}/profile/luis-menendez-antuna/`,
    areas: ["new-testament"],
    degrees: [
      "PhD, Vanderbilt University",
      "MA, Vanderbilt University",
      "MA, Universidad Pontificia Comillas (Madrid)",
      "STB, Universidad Pontificia (Salamanca)",
      "BA, Universidad Deusto (Bilbao)",
    ],
    publications: [
      { title: "Bridging the Interpretive Abyss: Reading the New Testament After the Cultural Studies Turn (Atlanta: Society of Biblical Literature Press, 2025)", kind: "book", year: 2025 },
      { title: "Thinking Sex with the Great Whore: Deviant Sexualities and Empire in the Book of Revelation (London and New York: Routledge, 2018)", kind: "book", year: 2018 },
      { title: "\"The Book of Torture: The Gospel of Mark, Crucifixion, and Trauma,\" Journal of the American Academy of Religion 90, no. 2 (2022): 377–395", kind: "article", year: 2022 },
      { title: "\"Of Social Death and Solitary Confinement: The Political Life of a Gerasene (Luke 8:26–39),\" Journal of Biblical Literature 138, no. 3 (2019): 643–664", kind: "article", year: 2019 },
      { title: "\"Black Lives Matter and Gospel Hermeneutics: Political Life and Social Death in the Gospel of Luke,\" Currents in Theology and Mission 45, no. 4 (October 2018): 29–34", kind: "article", year: 2018 },
    ],
  },
  {
    name: "G. Sujin Pak",
    title: "Professor of the History of Christianity",
    otherRoles: ["Dean of the School of Theology"],
    profileUrl: `${BASE}/profile/g-sujin-pak/`,
    areas: ["church-history"],
    degrees: ["PhD, Duke University, Graduate Program in Religion", "MTS, Duke University Divinity School", "BA, Religion and Psychology, Emory University"],
    publications: [
      { title: "The Reformation of Prophecy: Early Modern Interpretations of the Prophet & Old Testament Prophecy (New York: Oxford University Press, 2018)", kind: "book", year: 2018 },
      { title: "The Judaizing Calvin: Sixteenth-Century Debates on the Messianic Psalms (New York: Oxford University Press, 2010)", kind: "book", year: 2010 },
      { title: "\"Calvin Beyond Literal and Allegorical Readings: Calvin and Old Testament Metaphors,\" in The Old Testament, Calvin, and the Reformed Tradition, ed. Yudha Thianto (Leiden: Brill, 2024), 10–32", kind: "chapter", year: 2024 },
      { title: "\"Three Early Female Protestant Reformers' Appropriation of Prophecy as Interpretation of Scripture,\" Church History 84, no. 1 (2015): 90–123", kind: "article", year: 2015 },
    ],
  },
  {
    name: "Shelly Rambo",
    title: "Professor of Theology",
    profileUrl: `${BASE}/profile/shelly-rambo/`,
    areas: ["systematic-theology"],
    degrees: ["PhD, Emory University", "STM, Yale Divinity School", "MDiv, Princeton Theological Seminary", "BA, Houghton College"],
    publications: [
      { title: "Resurrecting Wounds: Living in the Afterlife of Trauma (Waco, TX: Baylor University Press, 2017)", kind: "book", year: 2017 },
      { title: "Post-Traumatic Public Theology, co-edited with Stephanie Arel (New York: Palgrave MacMillan, 2016)", kind: "edited-volume", year: 2016 },
      { title: "Spirit and Trauma: A Theology of Remaining (Louisville, KY: Westminster John Knox Press, 2010)", kind: "book", year: 2010 },
      { title: "\"Theopoetics of Trauma,\" in Trauma and Transcendence: Suffering and the Limits of Theory, ed. Eric Boynton and Peter Capretto (New York: Fordham University Press, 2018)", kind: "chapter", year: 2018 },
      { title: "\"Refiguring Wounds in the Afterlife (of Trauma),\" in Carnal Hermeneutics, ed. Richard Kearney (New York: Fordham University Press, 2015)", kind: "chapter", year: 2015 },
    ],
  },
  {
    name: "Dana L. Robert",
    title: "William Fairfield Warren Distinguished Professor",
    otherRoles: ["Director of the Center for Global Christianity and Mission"],
    profileUrl: `${BASE}/profile/dana-l-robert/`,
    areas: ["world-christianity"],
    degrees: ["PhD, Yale University", "BA, Louisiana State University"],
    publications: [
      { title: "Faithful Friendships: Embracing Diversity in Christian Community (Grand Rapids: Wm. B. Eerdmans, 2019)", kind: "book", year: 2019 },
      { title: "Christian Mission: How Christianity Became a World Religion (Oxford: Wiley-Blackwell, 2009)", kind: "book", year: 2009 },
      { title: "African Christian Biography: Stories, Lives, and Challenges, editor (Pietermaritzburg: Cluster Publications, 2018)", kind: "edited-volume", year: 2018 },
      { title: "\"Occupy Until I Come\": A.T. Pierson and the Evangelization of the World, Library of Religious Biography (Grand Rapids: Eerdmans, 2003)", kind: "book", year: 2003 },
      { title: "Converting Colonialism: Visions and Realities in Mission History, 1706–1914, editor (Curzon-Eerdmans, 2008)", kind: "edited-volume", year: 2008 },
    ],
  },
  {
    name: "Rady Roldán-Figueroa",
    title: "Professor of the History of Christianity",
    otherRoles: ["Associate Dean for Academic Affairs", "Truman Collins Chair of Missions"],
    profileUrl: `${BASE}/profile/rady-roldan-figueroa/`,
    areas: ["church-history", "world-christianity"],
    degrees: ["ThD, Boston University", "MDiv, New Brunswick Theological Seminary", "BA, University of Puerto Rico"],
    publications: [
      { title: "The Martyrs of Japan: Publication History and Catholic Missions in the Spanish World (1597–1700) (Leiden and Boston: Brill, 2021)", kind: "book", year: 2021 },
      { title: "The Ascetic Spirituality of Juan de Ávila (1499–1569), Studies in the History of Christian Traditions 150 (Leiden and Boston: Brill, 2010)", kind: "book", year: 2010 },
      { title: "The Transatlantic Las Casas: Lascasian Heritage, Indigenous Cultures, Scholastic Thought, and Historical Reception, with David Orique (Leiden: Brill, 2023)", kind: "edited-volume", year: 2023 },
      { title: "Bartolomé de las Casas, O.P.: History, Philosophy, and Theology in the Age of European Expansion, with David T. Orique, eds. (Leiden and Boston: Brill, 2019)", kind: "edited-volume", year: 2019 },
      { title: "The Dominicans in the Americas and the Philippines (c. 1500–c. 1820): Devotional Life, Catholic Literary Culture, and Models of Holiness, with David Orique and Cynthia Folquer (Routledge, 2025)", kind: "edited-volume", year: 2025 },
    ],
  },
  {
    name: "Steven J. Sandage",
    title: "Albert and Jessie Danielsen Professor of Psychology of Religion & Theology",
    profileUrl: `${BASE}/profile/steven-j-sandage/`,
    areas: ["pastoral-care-counseling"],
    degrees: ["PhD, Virginia Commonwealth University", "MS, Virginia Commonwealth University", "MDiv, Trinity Evangelical Divinity School", "Iowa State University"],
    publications: [
      { title: "Spiritual Diversity and Psychotherapy: Engaging the Sacred in Clinical Practice, co-edited with B.D. Strawn (Washington, DC: American Psychological Association, 2022)", kind: "edited-volume", year: 2022 },
      { title: "Relational Spirituality in Psychotherapy: Healing Suffering and Promoting Growth, with D. Rupert, G.S. Stavros, and N.G. Devor (Washington, DC: American Psychological Association, 2020)", kind: "book", year: 2020 },
      { title: "Relational Integration in Psychology and Christian Theology: Theory, Research, and Practice, with J.K. Brown (New York: Routledge, 2018)", kind: "book", year: 2018 },
      { title: "Forgiveness and Spirituality: A Relational Approach, with E.L. Worthington Jr. (Washington, DC: American Psychological Association, 2016)", kind: "book", year: 2016 },
      { title: "Transforming Spirituality: Integrating Theology and Psychology, with F.L. Shults (Grand Rapids, MI: Baker Academic, 2006)", kind: "book", year: 2006 },
    ],
  },
  {
    name: "Chris R. Schlauch",
    title: "Associate Professor, Counseling Psychology & Religion, Psychology of Religion",
    profileUrl: `${BASE}/profile/chris-r-schlauch/`,
    areas: ["pastoral-care-counseling"],
    degrees: ["PhD, University of Chicago", "MDiv, Yale Divinity School", "BA, Rutgers College"],
    publications: [
      { title: "Faithful Companioning: How Pastoral Counseling Heals (Minneapolis: Fortress Press, 1995)", kind: "book", year: 1995 },
      { title: "Psyche and Spirit: Dialectics of Transformation, co-edited with W.W. Meissner (Lanham, MD: University Press of America, 2003)", kind: "edited-volume", year: 2003 },
      { title: "\"Empathy as the Essence of Pastoral Psychotherapy,\" The Journal of Pastoral Care 44, no. 1 (Spring 1990): 3–17", kind: "article", year: 1990 },
      { title: "\"Deeper Affinities: Fundamental Resonances Between Psychoanalysis and Religion,\" Pastoral Psychology 55, no. 1 (September 2006): 61–80", kind: "article", year: 2006 },
      { title: "\"Readings of Winnicott,\" Pastoral Psychology 65, no. 2 (December 2015): 255–281", kind: "article", year: 2015 },
    ],
  },
  {
    name: "Andrew Shenton",
    title: "Professor of Music, James R. Houghton Scholar of Sacred Music",
    profileUrl: `${BASE}/profile/andrew-shenton/`,
    areas: ["church-music"],
    degrees: ["PhD, Harvard University", "MA, Harvard University", "MM, Yale University", "BM, London University", "FRCO (ChM), LRAM, ARCM, Dip. RCM"],
    publications: [
      { title: "Olivier Messiaen's Turangalîla-symphonie, Elements in Music Since 1945 (Cambridge: Cambridge University Press, 2023)", kind: "book", year: 2023 },
      { title: "Christian Sacred Music in the Americas, co-edited with Joanna Smolko (Lanham, MD: Rowman & Littlefield, 2021)", kind: "edited-volume", year: 2021 },
      { title: "Arvo Pärt's Resonant Texts: Choral and Organ Music 1956–2015 (Cambridge: Cambridge University Press, 2018)", kind: "book", year: 2018 },
      { title: "The Cambridge Companion to Arvo Pärt, editor (Cambridge: Cambridge University Press, 2012)", kind: "edited-volume", year: 2012 },
      { title: "Olivier Messiaen's System of Signs: Notes Towards Understanding His Music (Burlington, VT: Ashgate, 2008)", kind: "book", year: 2008 },
    ],
  },
  {
    name: "Shively T. J. Smith",
    title: "Associate Professor of New Testament",
    otherRoles: ["Director, PhD Program"],
    profileUrl: `${BASE}/profile/shively-t-j-smith/`,
    areas: ["new-testament"],
    degrees: ["PhD, Emory University", "ThM, Columbia Theological Seminary", "MDiv, Candler School of Theology, Emory University", "BA, Fisk University"],
    publications: [
      { title: "Strangers to Family: Diaspora and 1 Peter's Invention of God's Household (Waco, TX: Baylor University Press, 2016)", kind: "book", year: 2016 },
      { title: "\"One More Time with Assata on My Mind: A Womanist Rereading of the Escape to Egypt (Matt 2:13–23) in Dialogue with an African American Woman Fugitive Narrative,\" in Womanist Interpretations of the Bible: Expanding the Discourse, ed. Gay L. Byron and Vanessa Lovelace, Semeia Studies 85 (Atlanta: SBL Press, 2016)", kind: "chapter", year: 2016 },
      { title: "\"Writing Briefly,\" in Writing Theologically: Foundations for Learning, ed. Eric D. Barreto (Minneapolis: Fortress Press, 2015), 45–58", kind: "chapter", year: 2015 },
    ],
  },
  {
    name: "George Stavros",
    title: "Clinical Associate Professor of Pastoral Psychology",
    profileUrl: `${BASE}/profile/george-stavros/`,
    areas: ["pastoral-care-counseling"],
    degrees: [
      "PhD, Pastoral Psychology, Boston University",
      "MDiv, Holy Cross Greek Orthodox School of Theology",
      "MS, Sports Administration, St. Thomas University",
      "BS, Industrial Engineering, Purdue University",
    ],
    publications: [
      { title: "\"Attachment Neuroscience and Martin Luther King, Jr's Nonviolence Philosophy: Implications for the 21st Century and Beyond,\" with D.L. Thomas, S.J. Sandage, L. Berg-Cross, and E.J. Nichols, Journal of Black Psychology 48 (2022): 507–546", kind: "article", year: 2022 },
      { title: "\"Latent Trajectories of Change for Clients at a Psychodynamic Training Clinic,\" with P.J. Jankowski, S.J. Sandage, C.A. Bell, D. Rupert, and M. Bronstein, Journal of Clinical Psychology 75, no. 7 (2019)", kind: "article", year: 2019 },
      { title: "\"Trainee Psychotherapy Effectiveness at a Psychodynamic Training Clinic: A Practice-Based Study,\" with D.R. Paine, C.A. Bell, S.J. Sandage, M. Bronstein, C.G. O'Rourke, S.H. Moon, and L.E. Kehoe, Psychoanalytic Psychotherapy 33, no. 1 (2019): 20–33", kind: "article", year: 2019 },
    ],
  },
  {
    name: "emilie m. townes",
    title: "Martin Luther King, Jr. Professor of Religion & Black Studies",
    profileUrl: `${BASE}/profile/emilie-m-townes/`,
    areas: ["black-church-studies", "womanist-feminist-theology"],
    // Her own profile page lists a D.D. Honoris Causa (United Lutheran
    // Seminary, 2025) under "Awards & Honors," never under "Education" —
    // see file-header note. Only the earned degrees below are recorded here.
    degrees: ["PhD, Northwestern University", "DMin, University of Chicago Divinity School", "MA, University of Chicago Divinity School", "BA, University of Chicago"],
    publications: [
      { title: "\"On Making Silence Loud,\" Special Section: Honoring Judith Plaskow, Journal of Feminist Studies in Religion 42, no. 1 (Spring 2025): 81–83", kind: "article", year: 2025 },
    ],
  },
  {
    name: "Nimi Wariboko",
    title: "Walter G. Muelder Professor of Social Ethics",
    profileUrl: `${BASE}/profile/nimi-wariboko/`,
    // No publications list on his own STH profile page; his bio names five
    // monographs in prose without full citation detail (publisher/year), so
    // none are reproduced here rather than reconstructed from memory.
    areas: ["ethics-public-theology"],
    degrees: [
      "PhD, Ethics, summa cum laude, Princeton Theological Seminary",
      "MBA, Finance and Accounting, Columbia University",
      "BSc, Economics, first class honors, University of Port Harcourt, Nigeria",
    ],
  },
  {
    name: "Karen B. Westerfield Tucker",
    title: "Professor of Worship",
    profileUrl: `${BASE}/profile/karen-b-westerfield-tucker/`,
    areas: ["liturgy-worship"],
    degrees: [
      "PhD, Liturgical Studies, University of Notre Dame",
      "MA, Liturgical History, University of Notre Dame",
      "MDiv, The Divinity School, Duke University",
      "BA, Emory & Henry College",
    ],
    publications: [
      { title: "American Methodist Worship (New York: Oxford University Press, 2001)", kind: "book", year: 2001 },
      { title: "The Oxford History of Christian Worship, co-edited with Geoffrey Wainwright (New York: Oxford University Press, 2006)", kind: "edited-volume", year: 2006 },
      { title: "The Oxford History of Christian Worship, revised and online edition, editor (New York: Oxford University Press, 2016– )", kind: "edited-volume", year: 2016 },
      { title: "\"1784 Sunday Service,\" in The Routledge Companion to John Wesley, ed. Clive Murray Norris and Joseph W. Cunningham (London and New York: Routledge, 2023), 148–160", kind: "chapter", year: 2023 },
      { title: "\"Baptism and Ecumenism: Towards a Sacramental Bond of Unity,\" in New Life in the Risen Christ: A Wesleyan Theology of Baptism, ed. Jonathan Powers (Eugene, OR: Cascade/Wipf & Stock, 2023), 271–290", kind: "chapter", year: 2023 },
    ],
  },
  {
    name: "Wesley J. Wildman",
    title: "Professor of Philosophy, Theology, and Ethics, and of Computing and Data Sciences",
    profileUrl: `${BASE}/profile/wesley-j-wildman/`,
    areas: ["systematic-theology", "religion-and-science"],
    degrees: [
      "PhD, Psychology, Flinders University (expected 2025)",
      "PhD, Philosophy of Religion, Graduate Theological Union",
      "BD, University of Sydney",
      "BA Hons I, Flinders University",
      "BA, Flinders University",
    ],
    publications: [
      { title: "Modeling Religion: Simulating the Transformation of Worldviews, Lifeways, and Civilization, with F. LeRon Shults (2024)", kind: "book", year: 2024 },
      { title: "Spirit Tech: The Brave New World of Consciousness Hacking and Enlightenment Engineering, with Kate Stockly (2021)", kind: "book", year: 2021 },
    ],
  },
  {
    name: "Claire E. Wolfteich",
    title: "Professor of Practical Theology & Spirituality Studies",
    otherRoles: ["Co-Director of the Center for Practical Theology"],
    profileUrl: `${BASE}/profile/claire-e-wolfteich/`,
    areas: ["practical-theology", "spiritual-formation"],
    degrees: ["PhD, University of Chicago", "MDiv, University of Chicago", "BA, Yale University"],
    publications: [
      { title: "Motherwork, Public Leadership, and Women's Life Writing: Explorations in Spirituality Studies and Practical Theology (Leiden: Brill Publishers, 2017)", kind: "book", year: 2017 },
      { title: "Catholic Approaches in Practical Theology: International and Interdisciplinary Perspectives, co-edited with Annemie Dillen (Leuven: Peeters Publishers, 2016)", kind: "edited-volume", year: 2016 },
      { title: "Invitation to Practical Theology: Catholic Voices and Visions, editor (Mahwah, NJ: Paulist Press, 2014)", kind: "edited-volume", year: 2014 },
      { title: "Sabbath in the City: Sustaining Urban Pastoral Excellence, co-authored with Bryan Stone (Louisville, KY: Westminster John Knox Press, 2008)", kind: "book", year: 2008 },
      { title: "Lord, Have Mercy: Praying for Justice with Conviction and Humility (San Francisco: Jossey Bass, 2006)", kind: "book", year: 2006 },
    ],
  },
  {
    name: "Peng Yin",
    title: "Assistant Professor of Ethics",
    profileUrl: `${BASE}/profile/peng-yin/`,
    areas: ["ethics-public-theology"],
    degrees: ["PhD, Harvard University", "MAR, Yale Divinity School", "BS, Hong Kong Baptist University"],
    publications: [
      { title: "Persisting in the Good: Thomas Aquinas and Early Chinese Ethics (Oxford: Oxford University Press, 2026)", kind: "book", year: 2026 },
      { title: "\"The Question of Political Legitimacy in Chinese Political Theology,\" in Political Theology in the Asia Pacific, ed. Kwok Pui-Lan (Waco, TX: Baylor University Press, 2024)", kind: "chapter", year: 2024 },
      { title: "\"Matteo Ricci's Legacy for Comparative Theology,\" Modern Theology 41, no. 3 (July 2022)", kind: "article", year: 2022 },
      { title: "\"Virtue and Hierarchy in Early Confucian Ethics,\" Journal of Religious Ethics 49, no. 4 (December 2021)", kind: "article", year: 2021 },
    ],
  },
  {
    name: "Luther Young, Jr.",
    title: "Assistant Professor of Religion & Society",
    profileUrl: `${BASE}/profile/luther-young-jr/`,
    areas: ["black-church-studies"],
    degrees: ["PhD, The Ohio State University", "MA, The Ohio State University", "MDiv, Vanderbilt University", "BS, Belmont University"],
    publications: [
      { title: "\"'Ye Double-Minded': Black Parishioners' Attitudes toward Nonaffirming Church Climates,\" Journal for the Scientific Study of Religion 62, no. 1 (2023): 108–125", kind: "article", year: 2023 },
      { title: "\"To Condemn or Not to Condemn: Perceived Climates Concerning Sexual Orientation in Black Churches,\" Sociology of Religion 83, no. 2 (2022): 169–193", kind: "article", year: 2022 },
      { title: "\"People Jesus Met,\" in Growing in God's Love: A Story Bible, ed. E. Caldwell and C.A. Wehrheim (Louisville, KY: Westminster John Knox Press, 2018), 240–248", kind: "chapter", year: 2018 },
    ],
  },
];

function buildFaculty(): FacultyMember[] {
  return ROSTER.map((e) => {
    const member: FacultyMember = {
      id: `boston-${slugifyName(e.name.replace(/,\s*Jr\.?$/, "").replace(/\./g, ""))}`,
      seminarySlug: "boston",
      name: e.name,
      title: e.title,
      areas: e.areas,
      profileUrl: e.profileUrl,
    };
    if (e.otherRoles?.length) member.otherRoles = e.otherRoles;
    if (e.degrees?.length) member.degrees = e.degrees;
    if (e.publications?.length) {
      member.publications = e.publications;
      member.publicationsSource = e.profileUrl;
      member.publicationsAsOf = today();
    }
    return member;
  });
}

async function main() {
  // Touch every page this profile and roster are built from, so they land in
  // the fetch cache alongside this run — the coverage table and each
  // faculty entry are hand-assembled from a careful read (see file header),
  // not mechanically parsed, matching Duke's and Saint Paul's precedent.
  await get(MDIV_URL, { fresh });
  await get(OMDIV_URL, { fresh });
  await get(WESLEYAN_METHODIST_URL, { fresh });
  await get(TUITION_FEES_URL, { fresh });
  await get(SCHOLARSHIPS_URL, { fresh });
  await get(ATS_URL, { fresh });
  await get(FACULTY_DIR_URL, { fresh });
  for (const e of ROSTER) await get(e.profileUrl, { fresh });

  const faculty = buildFaculty();
  await writeJson("data/faculty/boston.json", faculty);
  console.log(`wrote ${faculty.length} faculty to data/faculty/boston.json`);

  const profile = buildProfile();
  await writeJson("data/seminaries/boston.json", profile);
  console.log("wrote data/seminaries/boston.json");
}

async function writeJson(relPath: string, data: unknown) {
  const { writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  await writeFile(join(ROOT, relPath), JSON.stringify(data, null, 2) + "\n", "utf8");
}

function buildProfile(): SeminaryProfile {
  const capturedAt = today();
  return {
    slug: "boston",
    name: "Boston University School of Theology",
    city: "Boston",
    state: "MA",
    url: "https://www.bu.edu/sth/",
    lastVerified: capturedAt,

    ordination: {
      senateStanding: {
        value: "approved-umc",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-08-06",
        note: "One of the 13 United Methodist schools of theology, and the oldest — founded in 1839 as the first Methodist seminary in the United States.",
      },
      onlineCredit: {
        value: "fully-counts",
        source: "https://www.gbhem.org/education/schools-of-theology/",
        asOf: "2026-08-06",
        note: "GBHEM: all thirteen United Methodist schools of theology are approved to provide a fully online M.Div. that meets UM ordination requirements. BU's own Online MDiv (OMDiv) — launched as a distinct, separate degree from the residential MDiv, built around a single Ecclesial Ministry track, delivered entirely online with a weekly synchronous session — is a second, independent confirmation of the same fact from the school's own site.",
      },
      coverageSource: WESLEYAN_METHODIST_URL,
      coverageAsOf: capturedAt,
      coverage: [
        {
          area: "old-testament",
          status: "required",
          note: "Part of the 30-unit MDiv core shared by all three vocational tracks (Sacred Texts and Interpretation: Hebrew Bible, New Testament). BU's own Denominational Studies page confirms the school 'requires MDiv students to take two courses each' in Hebrew Bible — one of only four areas it states as a flat requirement rather than something it merely offers.",
        },
        {
          area: "new-testament",
          status: "required",
          note: "Same shared-core requirement and same 'requires... two courses each' language as Hebrew Bible, above.",
        },
        {
          area: "theology",
          status: "required",
          note: "Theology and Meaning-Making is one of the six categories in the shared 30-unit MDiv core. The Denominational Studies page states the school requires two courses (6 credits) in Theology, half of which the required first-year sequence (Intro to Christian Traditions / Christianity Engaging Modernity) already provides.",
        },
        {
          area: "church-history",
          status: "required",
          note: "History of Traditions and Institutions is part of the shared 30-unit core. As with Theology, the Denominational Studies page confirms the school requires two courses (6 credits) in Church History, half satisfied by the required first-year sequence, with 'MDiv students... then required to take an additional course in church history... bringing the total... to 6 credits.'",
        },
        {
          area: "mission-of-the-church",
          status: "elective",
          note: "TM-815 Christian Mission is not in the shared 30-unit core. BU's Denominational Studies page lists it, alongside UM Polity, UM History & Doctrine, and Evangelism, as something 'the school offers... which can be taken at any time' — offering language, not a stated requirement. It also appears as one of four options in the Ecclesial Ministry track's single 'Ecclesiastical Studies (Choose one)' slot, so even a student in that track can graduate without ever taking it.",
        },
        {
          area: "evangelism",
          status: "elective",
          note: "TC-835 Evangelism and Contemporary Cultures sits in the same 'offers... which can be taken' list and the same 'choose one of four' Ecclesiastical Studies slot as Mission of the Church, above — available, never stated as binding.",
        },
        {
          area: "worship-liturgy",
          status: "elective",
          note: "TC-817 Introduction to Christian Worship is a named, binding requirement — but only inside the Ecclesial Ministry track, one of three vocational tracks (Ecclesial Ministry, Chaplaincy, Global and Community Engagement) any MDiv student, of any denomination, may freely choose by the end of their first year. A student who declares Chaplaincy or Global and Community Engagement satisfies BU's MDiv without it. The Denominational Studies page also lists Worship among the courses the school merely 'offers... which can be taken at any time,' not among the four it states the school 'requires.'",
        },
        {
          area: "preaching",
          status: "elective",
          note: "STHTC 715 Introduction to Preaching is likewise a named, binding requirement only inside the Ecclesial Ministry track — not part of the shared 30-unit core, and not required of a student who chooses either of the other two tracks.",
        },
        {
          area: "um-studies",
          status: "elective",
          note: "TC-723 United Methodist Polity and Ministry and TH-821 The History and Doctrine of the United Methodist Church are the two courses BU built to cover the Discipline's UM history/doctrine/polity requirement — but the Denominational Studies page describes them, together with Evangelism and Mission, as courses the school 'offers... which can be taken at any time,' never as something a UMC student 'must fulfill' (Duke's language) or is 'required to take' (Phillips'). They also sit inside the Ecclesial Ministry track's 'choose one of four' Ecclesiastical Studies slot: a student can clear that single required slot with UM Polity alone, or skip it entirely by choosing Evangelism or Mission instead.",
        },
      ],
      gapSummary:
        "Four of the nine areas — Old Testament, New Testament, Theology, and Church History — are in the 30-unit core every MDiv student takes, regardless of which of BU's three vocational tracks they choose. The other five — Mission of the Church, Evangelism, Worship, Preaching, and United Methodist Studies — are not: BU's own Denominational Studies page describes the four UM-specific courses (UM Polity, UM History & Doctrine, Evangelism, Mission) as courses it 'offers... which can be taken at any time,' never as a stated obligation, and even Preaching and Worship — required by name inside the Ecclesial Ministry track — aren't required of a UMC student who chooses either of BU's other two tracks. Unlike Duke and Phillips, Boston University never states that a United Methodist student in particular is bound to cover these five areas; the responsibility is handed to the student and their annual conference from the start ('Students pursuing ordination should work closely with their advisors and their denominations... United Methodist students should take the time to be in conversation... with their district superintendent or member of the District Committee on Ordained Ministry'). A candidate has to build the remaining five areas into their own plan of study and confirm the specific courses with their conference's Board of Ordained Ministry — the courses exist and are named, but nothing in BU's plan of study puts them there automatically.",
      gapRemedies: [
        {
          blurb: "Choosing the Ecclesial Ministry track (one of three, declared by the end of the first year) closes two of the five gaps outright: it names Preaching and Worship as binding track requirements. It does not close the other three — UM Polity, UM History & Doctrine, Evangelism, and Mission all sit in a single 'choose one of four' Ecclesiastical Studies slot within that same track, so even Ecclesial Ministry students must deliberately pick beyond the one the slot forces.",
          url: MDIV_URL,
        },
        {
          blurb: "TC-723 (UM Polity, 3 credits) and TH-821 (UM History & Doctrine, 4 credits) together clear ¶324.4's UM-studies requirement in two courses, with no prerequisites and no fixed term — plan them early rather than leaving them to compete for space against Evangelism and Mission inside a single elective slot.",
          url: WESLEYAN_METHODIST_URL,
        },
        {
          blurb: "United Methodist, AME, AMEZ, and CME candidates registered with GBHEM on the UMCares site before each term receive a 100% tuition scholarship — ask the STH Admissions Office how to register early, and confirm directly with your district superintendent or DCOM which specific electives your conference's Board of Ordained Ministry will accept for the five areas not built into BU's core.",
          url: SCHOLARSHIPS_URL,
        },
      ],
    },

    scale: {
      totalEnrollment: {
        value: "277 students (225.40 FTE)",
        source: ATS_URL,
        asOf: "2025-11-01",
        note: "ATS's Fall 2025 report for the whole school, not MDiv only. ATS also reports 32.00 full-time faculty (FTE) for the same period — roughly 9 students per faculty FTE, though BU does not publish that ratio itself.",
      },
    },

    cost: {
      tuitionPerCredit: {
        value: "$12,640/term for full-time residential MDiv, MTS, MSM, and STM students (9–18 units/term); $1,053/unit part-time (6–8 units/term). The Online MDiv (OMDiv) is priced lower: $9,480/term full-time (12–18 units), $790/unit part-time.",
        source: TUITION_FEES_URL,
        asOf: capturedAt,
        note: "2026–2027 rates. Unlike Duke's pace-based pricing, BU prices by residential-vs-online delivery and by full-time-vs-part-time load rather than by a single flat per-credit figure.",
      },
      fees: [
        { label: "Student Services Fee (full-time residential)", amount: "$229/term" },
        { label: "Health and Wellness Fee (full-time residential)", amount: "$295/term" },
        { label: "STH Community Fee", amount: "$75/term" },
        { label: "STH Graduate Program Fee", amount: "$140 (Fall) or $70 (Spring entry), charged once" },
        { label: "Student Health Insurance Plan (2026–2027, residential students not covered elsewhere)", amount: "$4,054/year" },
      ],
      pctReceivingAid: {
        value: "All master's-level students taking at least six units per term are eligible for financial aid in the form of tuition scholarships",
        source: SCHOLARSHIPS_URL,
        asOf: capturedAt,
        note: "BU's own wording, not a rounded percentage it publishes — matching the pattern Duke's and Wesley's pages also use.",
      },
      typicalAward: {
        value: "A 70% tuition scholarship is the example BU's own chart uses, reducing full-time MDiv tuition to roughly $7,395/year (2025–2026 rates) before required fees; the school states final awards may vary by student.",
        source: SCHOLARSHIPS_URL,
        asOf: capturedAt,
      },
      namedScholarships: [
        {
          name: "United Methodist Ordination Scholarship",
          blurb: "MDiv, MTS, and MSM students without a prior MDiv/MTS who are candidates for ordination as an elder or deacon in the United Methodist Church, and who are registered with GBHEM on the UMCares site before the start of classes each term, may receive a 100% tuition scholarship. The single strongest, most direct link this project has found yet between ¶310 candidacy status and full seminary funding — stronger than Duke's geographically-narrow Rural Ministry Fellowships or Candler's certified-candidate policy, since it is not capped by application strength or a priority deadline.",
          url: SCHOLARSHIPS_URL,
        },
        {
          name: "AME/AMEZ/CME Ordination Scholarship",
          blurb: "The same 100% tuition scholarship extended to candidates for ordained ministry in the African Methodist Episcopal, African Methodist Episcopal Zion, and Christian Methodist Episcopal Churches — a direct expression of BU's stated commitment to the wider Wesleyan-Methodist-Holiness family beyond the UMC itself.",
          url: SCHOLARSHIPS_URL,
        },
        {
          name: "UMC Leadership Fellowship",
          blurb: "A renewable fellowship (contingent on maintaining a 2.7 GPA and steady progress toward ordination) for students pursuing ordination as elder or deacon in the UMC who are registered with GBHEM on UMCares — awarded on top of, not instead of, the Ordination Scholarship above.",
          url: SCHOLARSHIPS_URL,
        },
      ],
      honestNote: "BU's baseline is genuinely strong for United Methodist (and AME/AMEZ/CME) ordination candidates specifically — a 100% tuition scholarship with no application-strength tier or priority-deadline cutoff, conditioned only on GBHEM registration and steady progress. Every other student's baseline example is a 70% scholarship that still leaves roughly $7,400/year in tuition plus required fees and Boston's cost of living (BU itself budgets $900–$1,600/month for housing alone). If you are not a registered UMC/AME/AMEZ/CME ordination candidate, ask the Financial Aid Office directly what your realistic award looks like before comparing BU's headline scholarship against another school's.",
    },

    degrees: [
      {
        name: "Master of Divinity",
        abbr: "MDiv",
        credits: 72,
        typicalYears: "3 years full-time (6 semesters); up to 5 academic years for financial-aid eligibility",
        modalities: ["residential"],
        blurb: "72 units: a shared 30-unit core (Sacred Texts & Interpretation, History of Traditions & Institutions, Theology & Meaning-Making, Ethics & Lived Values, Spirituality, Religious Leadership Practices, First Year Formation, and a year-long Contextual Education placement), a 15-unit vocational track chosen by the end of the first year (Ecclesial Ministry, Chaplaincy, or Global and Community Engagement), and 27 free-elective units. Track choice determines which specific courses — including Preaching and Worship — are required.",
        url: MDIV_URL,
      },
      {
        name: "Online Master of Divinity",
        abbr: "OMDiv",
        credits: 72,
        typicalYears: "2–3 years, full- or part-time",
        modalities: ["online"],
        blurb: "Launched in its inaugural year (2026) with a single Ecclesial Ministry track, delivered entirely online with a weekly synchronous 'live classroom.' A distinct, separate degree from the residential MDiv, priced at a base 25% discount to the residential rate. Its one track does require Preaching and Worship, unlike the residential MDiv's Chaplaincy and Global and Community Engagement tracks.",
        url: OMDIV_URL,
      },
      {
        name: "Master of Theological Studies",
        abbr: "MTS",
        typicalYears: "2 years full-time (4 semesters)",
        modalities: ["residential"],
        blurb: "Not an ordination degree — an academic master's for doctoral preparation, teaching, nonprofit work, or lay ministry.",
        url: "https://www.bu.edu/sth/academics/degree-programs/master-of-theological-studies/",
      },
      {
        name: "Master of Sacred Music",
        abbr: "MSM",
        typicalYears: "2 years full-time (4 semesters)",
        modalities: ["residential"],
        blurb: "Choral conducting or organ concentrations, administered jointly with BU's College of Fine Arts.",
        url: "https://www.bu.edu/sth/academics/degree-programs/master-of-sacred-music/",
      },
      {
        name: "Master of Arts in Religion and Public Leadership",
        abbr: "MARPL",
        modalities: ["residential"],
        blurb: "Not an ordination degree — trains religious and spiritual leadership for public-facing roles outside traditional congregational ministry.",
        url: "https://www.bu.edu/sth/academics/degree-programs/master-of-arts-in-religion-and-public-leadership-marpl/",
      },
      {
        name: "Master of Sacred Theology",
        abbr: "STM",
        typicalYears: "1 year full-time (2 semesters)",
        modalities: ["residential"],
        blurb: "An advanced theological degree, typically for MDiv holders pursuing specialized study or doctoral preparation.",
        url: "https://www.bu.edu/sth/academics/degree-programs/master-of-sacred-theology/",
      },
      {
        name: "Doctor of Ministry in Transformational Leadership",
        abbr: "DMin",
        typicalYears: "3 years part-time (6 terms), with intensive residencies in Boston",
        modalities: ["hybrid"],
        blurb: "A professional doctorate for religious leaders already in ministry, built around January and August intensive residencies rather than regular-term coursework; costs roughly $26,780 in tuition and fees over three years.",
        url: "https://www.bu.edu/sth/academics/degree-programs/doctor-of-ministry/",
      },
      {
        name: "Doctor of Philosophy",
        abbr: "PhD",
        typicalYears: "up to 10 academic years",
        modalities: ["residential"],
        blurb: "Funded PhD fellowships cover 100% of tuition and required fees plus a stipend (currently $47,740.50/year) for the first five years, in exchange for teaching/research internships from year two onward.",
        url: "https://www.bu.edu/sth/academics/degree-programs/doctor-of-philosophy/",
      },
    ],

    concentrations: [
      "Spirituality Studies",
      "Theology and Latinx Studies",
      "Global Christianity",
      "Faith and Ecological Justice",
      "Religion and Africana Studies",
      "Religion and Conflict Transformation",
      "Anglican and Episcopal Studies",
    ],

    partnerships: [
      {
        kind: "host-university",
        partner: "Boston University",
        blurb: "The School of Theology sits within Boston University proper (not a freestanding seminary on a host campus), giving students access to BU's broader library, research centers, and cross-school course offerings.",
        url: "https://www.bu.edu/sth/",
      },
      {
        kind: "joint-degree",
        partner: "BU School of Social Work",
        blurb: "The MDiv/MSW dual degree shares roughly a third of its coursework between the two schools, reducing the combined time to complete both degrees compared to taking them separately.",
        url: MDIV_URL,
      },
      {
        kind: "consortium",
        partner: "Boston Theological Interreligious Consortium (BTI)",
        blurb: "Cross-registration with other Boston-area theological schools, including for OMDiv students seeking elective credit online — capped at one quarter of a student's total credits from outside BU's own School of Theology.",
        url: OMDIV_URL,
      },
    ],

    facultyNote:
      "Limited to the 30 people on BU's own \"Faculty\" tab at bu.edu/sth/about/faculty/ — its core full-time, regular-rank roster, distinct from the Adjunct Faculty, Affiliated Faculty (College of Arts & Sciences appointments), Lecturers, and Retired/Emeritus tabs the same page lists separately. A \"Methodist Faculty\" tab also appears on that page, but it is a cross-cutting subset of the same 30 core faculty (14 of them), not an additional roster, and was not double-counted here. Each has a real per-professor page, but most are long personal CVs rather than a curated \"Selected Publications\" list; publications below were hand-picked as the cleanest, most complete citations from each page, capped at five, favoring books and journal articles over lectionary columns, book reviews, and conference-paper listings that clutter several of these CVs.",

    contact: {
      admissionsUrl: `${BASE}/admissions/apply/`,
      email: "sthadmis@bu.edu",
      phone: "617-353-3036",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
