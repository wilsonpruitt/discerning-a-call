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
//   - SECOND-PASS FINDING (2026-08-07), PUBLICATIONS: the tracker's first-pass
//     note treated the parser's near-zero hit rate (2/49) as likely evidence
//     of a real ceiling — most bio pages just don't carry a literal "Selected
//     Publications → Books" heading, the one thing parseProfilePage() looks
//     for. A spot-check of 21 of the 47 gap people, reading full pages rather
//     than heading-searching them, found genuine sourced publications for 20
//     of the 21 — mostly named in prose bio paragraphs or in a "Recent Books"
//     sidebar widget, both of which sit entirely outside the parser's search
//     space. That result was strong enough to justify reading all 47: 42 had
//     real, citable titles (with publisher/year where the page itself gives
//     one); only 5 (Balmaceda, Patrick T. Smith, Tinoco Ruiz, Tran, Norbert
//     Wilson) truly have nothing beyond a journal-name list or an untitled
//     work-in-progress. The "Selected Publications" heading was never the
//     wrong signal to look for — it just isn't Duke's dominant pattern, the
//     way it evidently is on the 2 people (Davis, Lian) who do have it. The
//     42 findings are hand-recorded in MANUAL_PUBLICATIONS below, the same
//     read-once-and-record pattern MANUAL_AREA_FALLBACK already uses for
//     areas, rather than teaching the regex parser to chase prose and widget
//     markup it was never built for.
//
// Run: node scripts/harvest/duke.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { htmlToText } from "./lib/text.mts";
import { suggestAreas } from "./lib/areas.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, Publication, SeminaryProfile, StudyArea } from "../../content/types.ts";

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
    const manualPubs = MANUAL_PUBLICATIONS[entry.name];
    if (detail.publications.length) {
      member.publications = detail.publications.map((p) => ({ title: p.title, kind: p.kind, year: p.year }));
      member.publicationsSource = entry.profileUrl;
      member.publicationsAsOf = today();
    } else if (manualPubs?.length) {
      // Second-pass (2026-08-07) hand read — see script header. The parser's
      // "Selected Publications" heading search found nothing here, but the
      // page itself names real, citable work in prose or a "Recent Books"
      // widget the regex parser doesn't look inside.
      member.publications = manualPubs.slice(0, 5);
      member.publicationsSource = entry.profileUrl;
      member.publicationsAsOf = today();
    }
    roster.push(member);
  }
  return roster;
}

// Second-pass (2026-08-07) hand-read publications — see script header. Every
// title here is quoted or closely paraphrased from the person's own Duke bio
// page (prose paragraph or "Recent Books" widget), capped at 5, most-recent-
// first where the page itself gives a year. Years are included only when the
// page states one; omitted rather than guessed. The 5 people read but left
// out entirely (Balmaceda, Patrick T. Smith, Tinoco Ruiz, Tran, Norbert
// Wilson) had nothing beyond a journal-name list or an untitled
// work-in-progress — a real gap, not an unread page.
const MANUAL_PUBLICATIONS: Record<string, Publication[]> = {
  "Jeremy Begbie": [
    { title: "Theology, Music, and Modernity (OUP)", kind: "book" },
    { title: "Abundantly More: The Theological Promise of the Arts in a Reductionist World (Baker)", kind: "book" },
    { title: "The Art of New Creation: Trajectories in Theology and the Arts", kind: "book" },
    { title: "Resounding Truth: Christian Wisdom in the World of Music (Baker/SPCK)", kind: "book" },
    { title: "Theology, Music and Time (CUP)", kind: "book" },
  ],
  "Natalie Carnes": [
    { title: "Attunement: The Art and Politics of Feminist Theology (OUP 2024)", kind: "book", year: 2024 },
    { title: "Image and Presence: A Christological Reflection on Iconoclasm and Iconophilia (Stanford 2017)", kind: "book", year: 2017 },
    { title: "Motherhood: A Confession (Stanford 2017)", kind: "book", year: 2017 },
    { title: "Beauty: A Theological Engagement with Gregory of Nyssa (Cascade 2014)", kind: "book", year: 2014 },
  ],
  "Daniel Castelo": [
    { title: "Second edition of Clark Pinnock's Flame of Love (InterVarsity, 2022)", kind: "book", year: 2022 },
    { title: "T & T Clark Handbook of Pneumatology (Bloomsbury T & T Clark, 2020)", kind: "edited-volume", year: 2020 },
    { title: "The Marks of Scripture: Rethinking the Nature of the Bible (Baker Academic, 2019)", kind: "book", year: 2019 },
    { title: "The Usefulness of Scripture (Eisenbrauns, 2018)", kind: "book", year: 2018 },
    { title: "Embodying Wesley's Catholic Spirit (Pickwick, 2017)", kind: "book", year: 2017 },
  ],
  "Mark Chaves": [
    { title: "American Religion: Contemporary Trends (2nd ed., Princeton, 2017)", kind: "book", year: 2017 },
    { title: "Congregations in America (Harvard, 2004)", kind: "book", year: 2004 },
    { title: "Ordaining Women: Culture and Conflict in Religious Organizations (Harvard, 1997)", kind: "book", year: 1997 },
  ],
  "Farr Curlin": [
    { title: "The Way of Medicine: Ethics and the Healing Profession", kind: "book" },
    { title: "Spirituality and Religion Within the Culture of Medicine: From Evidence to Practice", kind: "edited-volume" },
    { title: "Religion, Conscience and Controversial Clinical Practices, New England Journal of Medicine", kind: "article" },
  ],
  "Frederick Edie": [
    { title: "Book, Bath, Table and Time", kind: "book" },
  ],
  "Aaron Griffith": [
    { title: "God's Law and Order: The Politics of Punishment in Evangelical America (Harvard University Press, 2020)", kind: "book", year: 2020 },
  ],
  "Kevin Hart": [
    { title: "Contemplation: The Movements of the Soul (Columbia UP, 2024)", kind: "book", year: 2024 },
    { title: "Dark-Land: Memoir of a Secret Childhood (Paul Dry Books, 2024)", kind: "book", year: 2024 },
    { title: "The Bible and Western Christian Literature, vol. 5 (T. and T. Clark, 2024)", kind: "edited-volume", year: 2024 },
    { title: "Lands of Likeness: For a Poetics of Contemplation (Chicago UP, 2023)", kind: "book", year: 2023 },
    { title: "Maurice Blanchot on Poetry and Narrative (Bloomsbury, 2023)", kind: "book", year: 2023 },
  ],
  "Jan Holton": [
    { title: "Reframing Trauma: A Psychospiritual Theory and Theology (Fortress, 2025), co-editor", kind: "edited-volume", year: 2025 },
    { title: "Longing for Home (Yale University Press)", kind: "book" },
    { title: "Building the Resilient Community: Lessons from the Lost Boys of Sudan (Cascade Press)", kind: "book" },
  ],
  "Warren Kinghorn": [
    { title: "The Limits of Burnout and the Work of Health Care, Church Life Journal (2026)", kind: "article", year: 2026 },
    { title: "Do Not Harm Yourself, for We Are All Here, Christianity Today (2025)", kind: "article", year: 2025 },
    { title: "Wayfaring: A Christian Approach to Mental Health Care", kind: "book" },
    { title: "Prescribing Together: A Relational Guide to Psychopharmacology", kind: "book" },
    { title: "Spirituality and Religion Within the Culture of Medicine: From Evidence to Practice", kind: "edited-volume" },
  ],
  "Anathea Portier-Young": [
    { title: "The Prophetic Body: Embodiment and Mediation in Biblical Prophetic Literature (Oxford University Press, 2024)", kind: "book", year: 2024 },
    { title: "Scripture and Justice: Catholic and Ecumenical Essays (Lexington Press, 2018), co-edited with Gregory Sterling", kind: "edited-volume", year: 2018 },
    { title: "Apocalypse Against Empire: Theologies of Resistance in Early Judaism (Eerdmans, 2011)", kind: "book", year: 2011 },
  ],
  "Ronald K. Rittgers": [
    { title: "A Widower's Lament: The \"Pious Meditations\" of Johann Christoph Oelhafen (Fortress, 2021)", kind: "book", year: 2021 },
    { title: "Protestants and Mysticism in Reformation Europe (Brill, 2019), co-edited", kind: "edited-volume", year: 2019 },
    { title: "The Reformation Commentary on Scripture: Hebrews and James (Intervarsity Press, 2017)", kind: "book", year: 2017 },
    { title: "The Reformation of Suffering: Pastoral Theology and Lay Piety in Late Medieval and Early Modern Germany (Oxford University Press, 2012)", kind: "book", year: 2012 },
    { title: "The Reformation of the Keys: Confession, Conscience, and Authority in Sixteenth-Century Germany (Harvard University Press, 2004)", kind: "book", year: 2004 },
  ],
  "Lester Ruth": [
    { title: "A History of Contemporary Praise & Worship: Understanding the Ideas That Reshaped the Protestant Church, co-authored with Lim Swee Hong", kind: "book" },
    { title: "Lovin' On Jesus: A Concise History of Contemporary Worship, co-authored with Lim Swee Hong", kind: "book" },
    { title: "How Worship Became Music", kind: "book" },
    { title: "Flow: The Ancient Way to Do Contemporary Worship (edited)", kind: "edited-volume" },
    { title: "Essays on the History of Contemporary Praise and Worship (edited)", kind: "edited-volume" },
  ],
  "Brent A. Strawn": [
    { title: "The Westminster Study Bible (Westminster, 2024)", kind: "edited-volume", year: 2024 },
    { title: "Honest to God Preaching: Talking Sin, Suffering, and Violence (Fortress Press, 2021)", kind: "book", year: 2021 },
    { title: "Lies My Preacher Told Me: An Honest Look at the Old Testament (Westminster John Knox, 2021)", kind: "book", year: 2021 },
    { title: "The Old Testament: A Concise Introduction (Routledge, 2019)", kind: "book", year: 2019 },
    { title: "The Old Testament Is Dying: A Diagnosis and Recommended Treatment (Baker Academic, 2017)", kind: "book", year: 2017 },
  ],
  "David Toole": [
    { title: "Love Made Me an Inventor: The Story of Maggy Barankitse — Humanitarian, Genocide Survivor, Citizen without Borders", kind: "book" },
    { title: "The Morgue in the Garden of Eden: An Essay on Hope … in the Dark (forthcoming)", kind: "book" },
    { title: "Waiting for Godot in Sarajevo: Theological Reflections on Nihilism, Tragedy and Apocalypse", kind: "book" },
  ],
  "J. Ross Wagner": [
    { title: "Being Christian After the Desolation of Gaza", kind: "book" },
    { title: "What Did Jesus Ask?", kind: "book" },
    { title: "Heralds of the Good News: Paul and Isaiah in Concert in the Letter to the Romans", kind: "book" },
    { title: "Reading the Sealed Book: Old Greek Isaiah and the Problem of Septuagint Hermeneutics", kind: "book" },
    { title: "Between Gospel and Election: Explorations in the Interpretation of Romans 9–11, co-edited with Florian Wilk", kind: "edited-volume" },
  ],
  "Matthew Philipp Whelan": [
    { title: "Christianity and Agroecology (Cambridge University Press, 2025)", kind: "book", year: 2025 },
    { title: "Blood in the Fields: Óscar Romero, Catholic Social Teaching, and Land Reform (Catholic University of America Press, 2020)", kind: "book", year: 2020 },
    { title: "Nuevas dimensiones políticas y geopolíticas del cristianismo y la derecha política en las Américas, co-edited with David Días Arias, Gema Santamaría, and Kevin Coleman", kind: "edited-volume" },
  ],
  "Brittany E. Wilson": [
    { title: "The Embodied God: Seeing the Divine in Luke-Acts and the Early Church (Oxford University Press, 2021)", kind: "book", year: 2021 },
    { title: "Unmanly Men: Refigurations of Masculinity in Luke-Acts (Oxford University Press, 2015)", kind: "book", year: 2015 },
  ],
  "Wylin D. Wilson": [
    { title: "Bioenhancement Technologies and the Vulnerable Body: A Theological Engagement", kind: "book" },
    { title: "Womanist Bioethics: Social Justice, Spirituality, and Black Women's Health", kind: "book" },
    { title: "Economic Ethics and the Black Church", kind: "book" },
  ],
  "Norman Wirzba": [
    { title: "Love's Braided Dance: Hope in a Time of Crisis", kind: "book" },
    { title: "Agrarian Spirit: Cultivating Faith, Community, and the Land", kind: "book" },
    { title: "This Sacred Life: Humanity's Place in a Wounded World", kind: "book" },
    { title: "The Paradise of God: Renewing Religion in an Ecological Age", kind: "book" },
    { title: "Food and Faith: A Theology of Eating (2nd Edition)", kind: "book" },
  ],
  "Sarah Jean Barton": [
    { title: "Becoming the Baptized Body: Disability and the Practice of Christian Community (Baylor University Press)", kind: "book" },
    { title: "Spirituality and Religion Within the Culture of Medicine: From Evidence to Practice", kind: "edited-volume" },
  ],
  "Kate Bowler": [
    { title: "The Lives We Actually Have", kind: "book" },
    { title: "Have a Beautiful, Terrible Day!: Daily Meditations for the Ups, Downs & In-Betweens", kind: "book" },
    { title: "Joyful, Anyway", kind: "book" },
    { title: "The Preacher's Wife: Women and Power in American Megaministry (Princeton University Press, 2019)", kind: "book", year: 2019 },
    { title: "Everything Happens for a Reason (and other lies I've loved) (Random House, 2018)", kind: "book", year: 2018 },
  ],
  "Douglas Campbell": [
    { title: "Beyond Justification: Liberating Paul's Gospel", kind: "book" },
    { title: "Pauline Dogmatics: The Triumph of God's Love (Eerdmans, 2020)", kind: "book", year: 2020 },
    { title: "Paul: An Apostle's Journey (Eerdmans, 2018)", kind: "book", year: 2018 },
    { title: "Framing Paul: An Epistolary Biography (Eerdmans, 2014)", kind: "book", year: 2014 },
    { title: "The Deliverance of God: An Apocalyptic Rereading of Justification in Paul (Eerdmans, 2009)", kind: "book", year: 2009 },
  ],
  "Peter Casarella": [
    { title: "Chiara Lubich: Essential Teachings on Unity", kind: "edited-volume" },
    { title: "Pope Francis and the Search for God in América", kind: "book" },
    { title: "Reverberations of the Word: Wounded Beauty in Global Catholicism (2020)", kind: "book", year: 2020 },
    { title: "The Whole is Greater than its Parts: Ecumenism and Inter-religious Encounters in the Age of Pope Francis (2020)", kind: "edited-volume", year: 2020 },
    { title: "Word as Bread: Language and Theology in Nicholas of Cusa (2017)", kind: "book", year: 2017 },
  ],
  "Stephen B. Chapman": [
    { title: "The Lord Bless You", kind: "book" },
    { title: "The Law and the Prophets (2nd ed. 2020; orig. 2000)", kind: "book", year: 2020 },
    { title: "1 Samuel as Christian Scripture (2016)", kind: "book", year: 2016 },
    { title: "The Cambridge Companion to the Hebrew Bible/Old Testament (2016), co-edited", kind: "edited-volume", year: 2016 },
    { title: "Biblischer Text und theologische Theoriebildung (2001), co-edited", kind: "edited-volume", year: 2001 },
  ],
  "Edgardo Colón-Emeric": [
    { title: "The People Called Metodista: Renewing Doctrine, Worship, and Missions from the Margins (Abingdon Press)", kind: "book" },
    { title: "Óscar Romero's Theological Vision: Liberation and the Transfiguration of the Poor (University of Notre Dame Press)", kind: "book" },
    { title: "Wesley, Aquinas, and Christian Perfection: An Ecumenical Dialogue (Baylor University Press)", kind: "book" },
  ],
  "Valerie Cooper": [
    { title: "Segregated Sundays (in progress)", kind: "book" },
    { title: "Word, Like Fire: Maria Stewart, the Bible, and the Rights of African Americans (University of Virginia Press, 2012)", kind: "book", year: 2012 },
  ],
  "Quinton Dixie": [
    { title: "Witness: Two Hundred Years of Faith and Practice at the Abyssinian Baptist Church of Harlem, New York, co-authored with Genna Rae McNeil, Houston Roberson, and Kevin McGruder", kind: "book" },
    { title: "Visions of a Better World: Howard Thurman's Pilgrimage to India and the Origins of African American Nonviolence, co-authored with Peter Eisenstadt", kind: "book" },
    { title: "This Far By Faith, co-authored with Juan Williams", kind: "book" },
    { title: "The Courage to Hope, co-edited with Cornel West", kind: "edited-volume" },
    { title: "Conversations With God (edited)", kind: "edited-volume" },
  ],
  "Curtis Freeman": [
    { title: "Pilgrim Journey: Instruction in the Mystery of the Gospel (Fortress Press, 2023)", kind: "book", year: 2023 },
    { title: "Pilgrim Letters: Instruction in the Basic Teaching of Christ (Fortress Press, 2021)", kind: "book", year: 2021 },
    { title: "Undomesticated Dissent: Democracy and the Public Virtue of Religious Nonconformity (Baylor University Press, 2017)", kind: "book", year: 2017 },
    { title: "Contesting Catholicity: Theology for Other Baptists (Baylor University Press, 2014)", kind: "book", year: 2014 },
    { title: "A Company of Women Preachers: Baptist Prophetesses in Seventeenth-Century England (Baylor University Press, 2011)", kind: "book", year: 2011 },
  ],
  "Polly Ha": [
    { title: "The Future of Freedom (Yale University Press, forthcoming)", kind: "book" },
    { title: "Remapping British Protestant Thought in the Long Reformation, Journal of Medieval and Early Modern History (2023)", kind: "article", year: 2023 },
    { title: "Reformed Government (Oxford University Press, 2021), chief editor", kind: "edited-volume", year: 2021 },
    { title: "The Puritans on Independence (Oxford University Press, 2017), chief editor", kind: "edited-volume", year: 2017 },
    { title: "English Presbyterianism, 1590-1640 (Stanford University Press, 2011)", kind: "book", year: 2011 },
  ],
  "Amy Laura Hall": [
    { title: "Torture, forthcoming in Wiley-Blackwell Encyclopedia of Religious Ethics", kind: "chapter" },
    { title: "Erecting the Pulpit: Muscular Christianity from Teddy Roosevelt to Donald Trump", kind: "book" },
    { title: "Laughing at the Devil: Seeing the World with Julian of Norwich", kind: "book" },
    { title: "Writing Home with Love: Politics for Neighbors and Naysayers", kind: "book" },
    { title: "Conceiving Parenthood: The Protestant Spirit of Biotechnological Reproduction", kind: "book" },
  ],
  "Zebulon M. Highben": [
    { title: "Sing Many Names: Scriptural Images for God in Hymnody", kind: "book" },
    { title: "Augsburg Motet Book (choral anthology)", kind: "edited-volume" },
    { title: "Augsburg Chorale Book (choral anthology)", kind: "edited-volume" },
    { title: "Festschrift in honor of composer Ronald A. Nelson (edited)", kind: "edited-volume" },
  ],
  "Timothy Kimbrough": [
    { title: "A House Divided? Ways Forward for North American Anglicans", kind: "book" },
    { title: "Psalms for Praise and Worship: A Complete Psalter (Abingdon Press)", kind: "book" },
    { title: "Sweet Singer: The Hymns of Charles Wesley (Hinshaw)", kind: "book" },
    { title: "A Theology of the Sacraments Interpreted by John and Charles Wesley", kind: "book" },
    { title: "Translator, Theology in Hymns? by Teresa Berger (Kingswood Imprint of Abingdon Press)", kind: "book" },
  ],
  "Brett McCarty": [
    { title: "Spirituality and Religion Within the Culture of Medicine: From Evidence to Practice", kind: "edited-volume" },
  ],
  "Jerusha Matsen Neal": [
    { title: "Holy Ground: Climate Change, Preaching, and the Apocalypse of Place (Baylor University, 2024)", kind: "book", year: 2024 },
    { title: "The Overshadowed Preacher: Mary, the Spirit, and the Labor of Proclamation (Eerdmans, 2020)", kind: "book", year: 2020 },
    { title: "Blessed: Monologues for Mary (2012)", kind: "book", year: 2012 },
  ],
  "Luke Powery": [
    { title: "Getting to God: Preaching Good News in a Troubled World, with John Rottman and Joni Sancken", kind: "book" },
    { title: "Becoming Human: The Holy Spirit and the Rhetoric of Race", kind: "book" },
    { title: "Living the Questions of the Bible", kind: "book" },
    { title: "Ways of the Word: Learning to Preach for Your Time and Place, with Sally Brown", kind: "book" },
    { title: "Dem Dry Bones: Preaching, Death, and Hope", kind: "book" },
  ],
  "C. Kavin Rowe": [
    { title: "Studies in Luke, Acts, and Paul (Eerdmans, 2024)", kind: "book", year: 2024 },
    { title: "Method, Context, and Meaning in New Testament Studies (Eerdmans, 2024)", kind: "book", year: 2024 },
    { title: "Leading Christian Communities (Eerdmans, 2023)", kind: "book", year: 2023 },
    { title: "Christianity's Surprise: A Sure and Certain Hope (Abingdon, 2020)", kind: "book", year: 2020 },
    { title: "One True Life: the Stoics and Early Christians as Rival Traditions (Yale University Press, 2016)", kind: "book", year: 2016 },
  ],
  "J. Warren Smith": [
    { title: "Early Christian Theology: A History (Eerdmans, forthcoming)", kind: "book" },
    { title: "Ambrose, Augustine, and the Pursuit of Greatness (Cambridge, 2020)", kind: "book", year: 2020 },
    { title: "Christian Grace and Pagan Virtue: The Theological Foundation of Ambrose's Ethics (Oxford, 2010)", kind: "book", year: 2010 },
    { title: "Passion and Paradise: Human and Divine Emotion in the Thought of Gregory of Nyssa (Crossroad, 2004)", kind: "book", year: 2004 },
  ],
  "Laceye Warner": [
    { title: "Methodist Book of Daily Prayer (projected 2024)", kind: "book" },
    { title: "All the Good: A Wesleyan Way of Christmas (2021), editor and contributor", kind: "edited-volume", year: 2021 },
    { title: "From Relief to Empowerment: How Your Church Can Cultivate Sustainable Mission (2018), co-authored with Gaston Warner", kind: "book", year: 2018 },
    { title: "The Method of Our Mission: United Methodist Polity and Organization (2014, rev. 2017)", kind: "book", year: 2017 },
    { title: "Grace to Lead: Practicing Leadership in the Wesleyan Tradition (2010, 2nd ed. 2017), co-authored with Bishop Kenneth Carder", kind: "book", year: 2017 },
  ],
  "Eric Lewis Williams": [
    { title: "More Than Tongues Can Tell: Theological Generosity in Black Pentecostal Thought", kind: "book" },
  ],
  "William Willimon": [
    { title: "The Church We Carry: Loss, Leadership, and the Future of Our Church", kind: "book" },
    { title: "The Last Supper: Conversations That Led to the Cross", kind: "book" },
    { title: "Changing My Mind: The Overlooked Virtue for Faithful Ministry", kind: "book" },
    { title: "Pastor: the Theology and Practice of Ordained Leadership", kind: "book" },
    { title: "Worship as Pastoral Care (1979)", kind: "book", year: 1979 },
  ],
  "Lauren Winner": [
    { title: "A Word to Live By: Church's Teachings for a Changing World, Volume 7", kind: "book" },
    { title: "The Dangers of Christian Practice: On Wayward Gifts, Characteristic Damage, and Sin", kind: "book" },
    { title: "Wearing God: Clothing, Laughter, Fire, and Other Overlooked Ways of Meeting God", kind: "book" },
    { title: "Still: Notes on a Mid-Faith Crisis", kind: "book" },
    { title: "Girl Meets God", kind: "book" },
  ],
};

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

    facultyNote: "Filtered to Duke's own 'Regular Rank Faculty' category in its directory (49 people) — this excludes Adjunct/Visiting, Administrative, Consulting, and Emeritus faculty, all of which Duke lists separately. A few Regular Rank titles (e.g., 'Professor of Food, Economics, and Community') sit outside this site's field vocabulary; where a title alone gave the area normalizer nothing to match, the area below was read from that person's own Duke bio rather than left blank or guessed from outside knowledge. Publications: only 2 of 49 bio pages carry the literal 'Selected Publications → Books' heading this harvest's parser looks for; a full hand read of the other 47 pages (2026-08-07) found real, sourced titles in prose bio paragraphs or a 'Recent Books' widget for 42 more — only 5 (Balmaceda, Patrick T. Smith, Tinoco Ruiz, Tran, Norbert Wilson) genuinely have nothing beyond a journal-name list or an untitled work-in-progress.",

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
