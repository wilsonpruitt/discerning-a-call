// Brite Divinity School (Fort Worth, TX) — faculty re-harvest.
//
// This is a re-pass, not a first pass: `data/faculty/brite.json` (18 people)
// predates this harvester and every one of them carried the same generic
// `profileUrl` (https://brite.edu/facultyandstaff), with 0/18 `degrees` even
// though a prior pass had already pulled `publications` for 9/18 from
// https://brite.edu/faculty-books. See research/faculty-deep-scrape-tracker.md.
//
// What's here that wasn't obvious from the directory page alone:
//   - Brite DOES publish a real per-person bio page for every one of the 18
//     (https://brite.edu/staff/<slug>) — the directory page just doesn't
//     link all of them. Six people (Moore, Noya, Oredein, Pape, Robinson,
//     Williams) are missing from the rendered facultyandstaff HTML entirely
//     — the tracker's "some pagination" note. The site's own XML sitemap
//     (brite.edu/sitemaps-1-section-staff-1-sitemap.xml, discovered via
//     robots.txt) is the one place all 18 (plus a couple of emeriti/staff
//     not in our roster) are listed, so that's the source of truth for
//     per-person URLs here, not the directory page.
//   - Each bio page uses a consistent CMS "richtext" block: a
//     `<p><strong>Degrees:</strong></p><ul><li>...</li></ul>` pattern, same
//     shape for "Courses Taught", "Professional Affiliations", and
//     "Select Publications"/"Publications"/"Published Writing" (the heading
//     text itself isn't standardized across people, the markup shape is).
//     Degrees are pulled generically from that pattern — mechanical and
//     reliable. Email is a literal "Email: <a href=mailto:...>" line, present
//     for 14/18; the remaining four (Casey, Jones, Moore, Noya) simply don't
//     publish one on their page.
//   - Publications were left alone here for the 9 people who already had
//     them (their existing data was hand-checked against these same bio
//     pages during this harvest and found to still be accurate — no
//     overwrite risk taken). Four more people (Feldman, Miller, Oredein,
//     Jones) get a small, hand-picked set added the same way Garrett's
//     script hand-picks off messy prose bios: multi-line citations with
//     `<br>` tags, or prose mentions with no formal citation, don't survive
//     a generic parser cleanly enough to trust unattended. Casey, Moore, and
//     Noya (all recent hires) have no publications list or clear book
//     mention on their bio page at all — left absent, per the "ships only
//     where a human has read it" rule, same as before.
//
// Run: node scripts/harvest/brite.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { htmlToText } from "./lib/text.mts";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, Publication } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");
const FACULTY_PATH = join(ROOT, "data/faculty/brite.json");

const SITEMAP_URL = "https://brite.edu/sitemaps-1-section-staff-1-sitemap.xml";

function normalizeSurname(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

// A handful of degree lines carry a copy-paste duplication straight from
// Brite's own markup ("Milligan College, B.A., Milligan College, 1987") —
// fixed here rather than papered over by a generic string-cleanup regex that
// could silently mangle someone else's genuinely repeated institution name.
const DEGREE_FIXUPS: Record<string, (lines: string[]) => string[]> = {
  robinson: (lines) => lines.map((l) => (l.startsWith("Milligan College, B.A.,") ? l.replace(/^Milligan College,\s*/, "") : l)),
};

interface ParsedPage {
  name: string;
  degrees: string[];
  email?: string;
}

function parseStaffPage(html: string): ParsedPage {
  const nameMatch = /<h2 class="mb-0 h3[^"]*">([^<]+)<\/h2>/.exec(html);
  // Most names are bare ("Wil Gafney"); a couple carry an honorific-and-degree
  // wrapper ("Rev. Jeremy L. Williams, Ph.D.") that would otherwise make
  // "Ph.D." look like the surname to match against. Strip a trailing
  // ", <suffix>" clause before taking the last word.
  const name = nameMatch ? htmlToText(nameMatch[1]).trim().replace(/,\s*[A-Za-z.]+\.?$/, "") : "";

  const emailMatch = /Email:\s*<a href="mailto:([^"]+)"/i.exec(html);
  const email = emailMatch ? emailMatch[1].trim() : undefined;

  let degrees: string[] = [];
  // Most bio pages bold the heading ("<strong>Degrees:</strong>"); Shonda
  // Jones's page underlines it instead ("<u>Degrees:</u>") — same CMS block,
  // different rich-text formatting choice by whoever authored that page.
  const blockRe = /<p>(?:<strong>|<u>)\s*([^<]+?)\s*(?:<\/strong>|<\/u>)<\/p>\s*<ul>([\s\S]*?)<\/ul>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html))) {
    const heading = m[1].replace(/:$/, "").trim().toLowerCase();
    if (heading !== "degrees") continue;
    const liRe = /<li>([\s\S]*?)<\/li>/gi;
    let li: RegExpExecArray | null;
    while ((li = liRe.exec(m[2]))) {
      const text = htmlToText(li[1]).replace(/\s+/g, " ").trim().replace(/[.,]$/, "");
      if (text) degrees.push(text);
    }
    break; // Degrees only ever appears once per page
  }

  return { name, degrees, email };
}

interface NewPublication {
  id: string; // faculty id
  source: string;
  pubs: Publication[];
}

// Hand-picked from each person's own bio page (read during this harvest, not
// machine-split) for the 4 people who had zero publications before. See the
// file-header note above for why these aren't parsed generically.
const NEW_PUBLICATIONS: NewPublication[] = [
  {
    id: "brite-feldman",
    source: "https://brite.edu/staff/ariel-feldman",
    pubs: [
      { title: "The Dead Sea Scrolls Rewriting Samuel and Kings: Texts and Commentary. BZAW 469; Berlin: de Gruyter, 2015.", kind: "book", year: 2015 },
      { title: "Scripture and Interpretation: Qumran Texts that Rework the Bible. Edited by D. Dimant. BZAW 449; Berlin: de Gruyter, 2014.", kind: "book", year: 2014, note: "With L. Goldman." },
      { title: "The Rewritten Joshua Scrolls from Qumran: Texts, Translations, and Commentary. BZAW 438; Berlin: de Gruyter, 2013.", kind: "book", year: 2013 },
    ],
  },
  {
    id: "brite-miller",
    source: "https://brite.edu/staff/michael-miller",
    pubs: [
      { title: "Freedom in Resistance and Creative Transformation", kind: "book", note: "Named as his own in his Brite bio; the bio gives no publisher or year." },
      { title: "Reshaping the Contextual Vision in Caribbean Theology", kind: "book", note: "Named as his own in his Brite bio; the bio gives no publisher or year." },
    ],
  },
  {
    id: "brite-oredein",
    source: "https://brite.edu/staff/oluwatomisin-oredein",
    pubs: [
      { title: "The Theology of Mercy Amba Oduyoye: Ecumenism, Feminism, and Communal Practice", kind: "book", note: "University of Notre Dame Press; a Notre Dame Press award winner, per her Brite bio, which gives no publication year." },
      { title: "Theopoetics in Color: Embodied Approaches to Theological Discourse", kind: "edited-volume", note: "Co-edited anthology, per her Brite bio, which gives no publisher or year." },
    ],
  },
  {
    id: "brite-jones",
    source: "https://brite.edu/staff/shonda-jones",
    pubs: [
      { title: "Transforming Service: Reflections of Student Services Professionals in Theological Education. Shonda R. Jones and Pamela R. Lightsey, editors. Pickwick Publications, 2020.", kind: "edited-volume", year: 2020 },
      { title: "“Graduate Theological School Choice: A Case for Multiplicity,” in Transforming Service: Reflections of Student Services Professionals in Theological Education. Pickwick Publications, 2020.", kind: "chapter", year: 2020 },
      { title: "England, K., & Jones, S. (2014). “Indiana.” In J.N. Friedel, J. Killacky, E. Miller, & S. Katsinas (Eds.), Fifty State Systems of Community Colleges: Mission, Governance, Funding & Accountability. Johnson City, TN: The Overmountain Press.", kind: "chapter", year: 2014 },
    ],
  },
];

async function main() {
  const existing: FacultyMember[] = JSON.parse(await readFile(FACULTY_PATH, "utf8"));
  console.log(`Loaded ${existing.length} existing faculty from data/faculty/brite.json`);

  const { body: sitemapXml } = await get(SITEMAP_URL, { fresh });
  const staffUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`Sitemap lists ${staffUrls.length} staff pages`);

  const bySurname = new Map<string, FacultyMember>();
  for (const m of existing) {
    const surname = m.id.replace(/^brite-/, "");
    bySurname.set(surname, m);
  }

  let matched = 0;
  const asOf = today();

  for (const url of staffUrls) {
    const { body } = await get(url, { fresh });
    const parsed = parseStaffPage(body);
    if (!parsed.name) {
      console.warn(`Could not read a name off ${url} — skipping`);
      continue;
    }
    const lastWord = parsed.name.trim().split(/\s+/).pop() ?? "";
    const surname = normalizeSurname(lastWord);
    const person = bySurname.get(surname);
    if (!person) {
      // Emeriti/staff on the sitemap who aren't part of the 18-person roster
      // this file tracks (e.g. David Gouwens, Joretta Marshall, Shelese
      // Moaning) — expected, not an error.
      continue;
    }
    matched++;

    person.profileUrl = url;
    if (parsed.email) person.email = parsed.email;

    let degrees = parsed.degrees;
    const fixup = DEGREE_FIXUPS[surname];
    if (fixup) degrees = fixup(degrees);
    if (degrees.length) person.degrees = degrees;
  }

  console.log(`Matched ${matched}/${staffUrls.length} sitemap pages to the existing 18-person roster`);

  // Three people (Casey, Moore, Noya) have no "Degrees:" list block on their
  // page at all — their earned degrees are stated only in bio prose. Read by
  // hand during this harvest rather than left at zero, but each kept to only
  // what the prose actually names (degree type AND institution both stated),
  // not guessed from "holds degrees from X, Y, and Z" lists that never say
  // what kind of degree came from which school.
  const PROSE_DEGREES: Record<string, string[]> = {
    casey: ["Ph.D. in Religion, Emory University", "M.Div., Yale Divinity School", "S.T.M., Yale Divinity School", "B.M., University of Tennessee, Knoxville"],
    moore: ["Ph.D. in Theology, Yale University"],
    noya: ["Ph.D. in Hebrew Bible, Vanderbilt University"],
  };
  for (const [surname, degrees] of Object.entries(PROSE_DEGREES)) {
    const person = bySurname.get(surname);
    if (person && !person.degrees?.length) person.degrees = degrees;
  }

  for (const add of NEW_PUBLICATIONS) {
    const person = existing.find((m) => m.id === add.id);
    if (!person) {
      console.warn(`No faculty member with id ${add.id} — skipping ${add.pubs.length} publication(s)`);
      continue;
    }
    if (person.publications?.length) {
      console.warn(`${add.id} already has publications — not overwriting`);
      continue;
    }
    person.publications = add.pubs;
    person.publicationsSource = add.source;
    person.publicationsAsOf = asOf;
  }

  const withDegrees = existing.filter((m) => m.degrees?.length).length;
  const withPubs = existing.filter((m) => m.publications?.length).length;
  const withEmail = existing.filter((m) => m.email).length;
  const perPersonUrl = existing.filter((m) => m.profileUrl !== "https://brite.edu/facultyandstaff").length;
  console.log(
    `degrees=${withDegrees}/${existing.length} publications=${withPubs}/${existing.length} ` +
      `email=${withEmail}/${existing.length} perPersonUrl=${perPersonUrl}/${existing.length}`,
  );

  await writeFile(FACULTY_PATH, JSON.stringify(existing, null, 2) + "\n", "utf8");
  console.log("wrote data/faculty/brite.json");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
