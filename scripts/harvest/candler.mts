// Candler School of Theology (Emory University) — depth pass.
//
// Candler's 53-person faculty roster in data/faculty/candler.json predates the
// modern harvester (built in the site's pilot phase): name/title/area only, all
// 53 sharing one placeholder profileUrl (the directory page itself). This script
// answers the open question from research/faculty-deep-scrape-tracker.md — do
// real per-person pages exist? — and closes the gap if so.
//
// They do. Bespoke bits, for the next school's benefit (per README §"Adding a
// school"):
//   - The faculty directory (https://candler.emory.edu/candler-faculty/faculty-directory/)
//     is server-rendered WordPress HTML — no REST API exposes the custom post
//     type (checked /wp-json/wp/v2/types; only "non-faculty-members" is there).
//     Each directory card is a plain <div class="faculty-single"> with a
//     <p class="label"> name, <p class="titles"> title, and a link to
//     /faculty-profiles/<slug>/ — trivial regex extraction, no JS needed.
//   - The directory page lists 70 people; this site's roster deliberately
//     covers 53 of them (the seminary profile's own facultyNote explains the
//     other 4 don't map onto the site's field vocabulary). Matched here by
//     normalized name, not by re-scoping — this is a depth pass, not a
//     re-harvest of who counts.
//   - Each profile page is a tabbed layout (About / Selected Publications /
//     Selected Honors / sometimes Selected Courses) built with a "cb12-tab"
//     component. Degrees and a mailto: EMAIL button sit in the page header,
//     outside any tab, so they're always present when the school publishes
//     them (52/53 have an email link; all 53 have a Degrees list — the one
//     exception is Damon Williams, an administrator with no listed email).
//   - The Publications tab is inconsistently labelled ("Selected Publications"
//     on most pages, bare "PUBLICATIONS" on a few) and only 45 of 53 people
//     have one at all — the rest only have About + Honors/Courses tabs, a real
//     ceiling, not a parsing miss. Two profiles (Strom, D. Williams) render
//     inside an older "jquery-tabs" widget for one *other* tab (Honors), but
//     their Publications tab uses the same current markup as everyone else.
//   - Within the Publications tab, citations are grouped under sub-headings
//     (BOOKS / CHAPTERS AND ARTICLES / EDITED VOLUMES / MUSIC / DIGITAL
//     EXHIBITS, rendered inconsistently as <p class="subhead">, <strong>, or
//     bare <p> text) that set the Publication `kind` for everything under
//     them until the next heading. A few people (e.g. Emory Fine Arts choir
//     director) publish MUSIC as their main output — mapped to `recording`.
//
// Run: node scripts/harvest/candler.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, Publication } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const DIRECTORY_URL = "https://candler.emory.edu/candler-faculty/faculty-directory/";

// --- tiny HTML helpers (regex-based; Candler's markup is simple enough that
// the shared htmlToText's block-collapsing would lose the tab/heading
// structure this parse actually depends on) ---

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", mdash: "—", ndash: "–", hellip: "…",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED_ENTITIES[n.toLowerCase()] ?? m);
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function normalizeName(name: string): string {
  return decodeEntities(name)
    .toLowerCase()
    .replace(/[‘’“”'".,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// --- directory listing: name, title, per-person URL for all 70 cards ---

interface DirectoryEntry {
  name: string;
  title: string;
  url: string;
}

function parseDirectory(html: string): DirectoryEntry[] {
  const re =
    /<div class="faculty-single relative"[^>]*>[\s\S]*?<p class="label">([^<]+)<\/p>\s*<p class="titles">([^<]*)<\/p>[\s\S]*?<a href="(https:\/\/candler\.emory\.edu\/faculty-profiles\/[a-z0-9-]+\/)"/g;
  const out: DirectoryEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push({ name: stripTags(m[1]), title: stripTags(m[2]), url: m[3] });
  }
  return out;
}

// --- per-person profile page: degrees, email, publications ---

function extractHeader(html: string): string {
  const start = html.indexOf("cb12-header-content");
  const end = html.indexOf("cb12-tabs-container");
  return start >= 0 ? html.slice(start, end >= 0 ? end : undefined) : "";
}

function extractDegrees(header: string): string[] {
  const m = /<p class="label">Degrees<\/p><p>([\s\S]*?)<\/p>/.exec(header);
  if (!m) return [];
  return [...m[1].matchAll(/<span>([\s\S]*?)<\/span>/g)]
    .map((s) => stripTags(s[1]))
    .filter(Boolean);
}

function extractEmail(header: string): string | undefined {
  const m = /href="mailto:([^"]+)"/.exec(header);
  return m ? decodeEntities(m[1]) : undefined;
}

// Finds the tab whose nav label contains "publications" (case-insensitive —
// Candler renders this as "Selected Publications" on most pages, bare
// "PUBLICATIONS" on a few) and returns that tab's inner HTML via a
// depth-aware <div> walk (citations nest <a>/<em> freely; a non-greedy regex
// up to the next "</div>" truncates mid-citation on nearly every page).
function extractPublicationsTab(html: string): string | null {
  const navMatches = [...html.matchAll(/data-tab="cb12-tab-(\d+)" class="cb12-tab">([^<]+)/g)];
  const hit = navMatches.find((m) => stripTags(m[2]).toLowerCase().includes("publications"));
  if (!hit) return null;
  const marker = `<div class="tab-content cb12-tab cb12-tab-content" data-tab="cb12-tab-${hit[1]}">`;
  const start = html.indexOf(marker);
  if (start < 0) return null;
  let i = start + marker.length;
  let depth = 1;
  const divRe = /<div\b|<\/div>/g;
  divRe.lastIndex = i;
  let m: RegExpExecArray | null;
  let contentEnd = -1;
  while ((m = divRe.exec(html))) {
    depth += m[0] === "<div" ? 1 : -1;
    if (depth === 0) { contentEnd = m.index; break; }
  }
  return contentEnd >= 0 ? html.slice(i, contentEnd) : null;
}

const HEADING_KIND: Record<string, Publication["kind"]> = {
  "books": "book",
  "edited volumes": "edited-volume",
  "edited books": "edited-volume",
  "chapters and articles": "article",
  "articles and chapters": "article",
  "articles": "article",
  "chapters": "chapter",
  "music": "recording",
  "recordings": "recording",
  "digital exhibits": "article", // closest fit in the controlled kind vocabulary
};

interface ParsedPub extends Publication {
  sortYear: number; // internal only — forthcoming items sort as newest
}

// Sub-headings inside the tab (BOOKS, CHAPTERS AND ARTICLES, ...) set the kind
// for citations that follow, in whatever markup the page happens to use for
// them (<p class="subhead">, <strong>, or bare text — all three appear).
// Title extraction prefers, in order: a quoted "..." title (the convention
// for articles/chapters), the first <a> link text, the first <em> text, else
// the text up to the first comma — matching what Candler's own page visually
// treats as the title in each case.
function parsePublications(tabHtml: string): ParsedPub[] {
  const paras = [...tabHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  const pubs: ParsedPub[] = [];
  let kind: Publication["kind"] = "article";
  for (const inner of paras) {
    const text = stripTags(inner);
    if (!text) continue;

    const headingKind = HEADING_KIND[text.toLowerCase()];
    if (headingKind && text.length < 40) {
      kind = headingKind;
      continue;
    }

    let title: string | null = null;
    const quoted = /["“]([^"”]{8,220})["”]/.exec(text);
    const aText = /<a\b[^>]*>([\s\S]*?)<\/a>/.exec(inner);
    const emText = /<em\b[^>]*>([\s\S]*?)<\/em>/.exec(inner);
    if (quoted) title = quoted[1];
    else if (aText && stripTags(aText[1]).length >= 8) title = stripTags(aText[1]);
    else if (emText && stripTags(emText[1]).length >= 8) title = stripTags(emText[1]);
    else title = text.split(/[.,]/)[0];
    title = title.replace(/^["“]+|["”“]+$/g, "").replace(/[,.]$/, "").trim();
    if (!title || title.length < 4) continue;

    const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)];
    const year = years.length ? Number(years[years.length - 1][0]) : undefined;
    const forthcoming = /forthcoming/i.test(text);

    let rest = text;
    const anchor = title.slice(0, Math.min(20, title.length));
    const tIdx = rest.indexOf(anchor);
    if (tIdx >= 0) rest = rest.slice(tIdx + title.length);
    rest = rest.replace(/^[\s"“”',.:;]+/, "").replace(/[\s,.]+$/, "").trim();
    // Drop a lone trailing ")" left over when the matched span cut across a
    // parenthetical, e.g. "GIA Publications, 2026" from "...2026.)".
    if ((rest.match(/\(/g)?.length ?? 0) < (rest.match(/\)/g)?.length ?? 0)) {
      rest = rest.replace(/\)+$/, "").trim();
    }
    rest = rest.slice(0, 150);

    const pub: ParsedPub = { title, kind, sortYear: year ?? (forthcoming ? 9999 : 0) };
    if (year) pub.year = year;
    if (rest) {
      if (kind === "book" || kind === "edited-volume") pub.publisher = rest;
      else pub.note = rest;
    }
    pubs.push(pub);
  }
  return pubs;
}

// The directory page's rendered card set isn't perfectly stable between
// fetches — two people (the dean and a visiting professor) were present in an
// initial manual check of the live page but absent from the HTML this script
// actually received and cached. Their profile URLs follow the same
// /faculty-profiles/<slug>/ pattern and were confirmed live (200, correct
// <title>) directly, so they're recorded here rather than silently dropped.
const MANUAL_PROFILE_URL: Record<string, string> = {
  "Terrence L. Johnson": "https://candler.emory.edu/faculty-profiles/terrence-l-johnson/",
  "Shanise N. Palmer": "https://candler.emory.edu/faculty-profiles/shanise-n-palmer/",
};

async function main() {
  const existingRaw = await readFile(join(ROOT, "data/faculty/candler.json"), "utf8");
  const existing: FacultyMember[] = JSON.parse(existingRaw);

  const { body: dirHtml } = await get(DIRECTORY_URL, { fresh });
  const directory = parseDirectory(dirHtml);
  const byName = new Map(directory.map((e) => [normalizeName(e.name), e]));
  for (const [name, url] of Object.entries(MANUAL_PROFILE_URL)) {
    if (!byName.has(normalizeName(name))) byName.set(normalizeName(name), { name, title: "", url });
  }

  const asOf = today();
  let withDegrees = 0, withPubs = 0, withEmail = 0, unmatched = 0;

  const roster: FacultyMember[] = [];
  for (const person of existing) {
    const dirEntry = byName.get(normalizeName(person.name));
    if (!dirEntry) {
      unmatched++;
      console.warn(`No directory match for "${person.name}" — leaving record untouched.`);
      roster.push(person);
      continue;
    }

    const { body: pageHtml } = await get(dirEntry.url, { fresh });
    const header = extractHeader(pageHtml);
    const degrees = extractDegrees(header);
    const email = extractEmail(header);
    const pubTab = extractPublicationsTab(pageHtml);
    const pubs = pubTab ? parsePublications(pubTab) : [];
    pubs.sort((a, b) => b.sortYear - a.sortYear);
    const publications: Publication[] = pubs
      .slice(0, 5)
      .map(({ sortYear, ...p }) => p);

    const merged: FacultyMember = {
      ...person,
      profileUrl: dirEntry.url, // was the shared directory URL; now a real per-person page
    };
    if (degrees.length) { merged.degrees = degrees; withDegrees++; }
    if (email) { merged.email = email; withEmail++; }
    if (publications.length) {
      merged.publications = publications;
      merged.publicationsSource = dirEntry.url;
      merged.publicationsAsOf = asOf;
      withPubs++;
    }
    roster.push(merged);
  }

  await writeFile(
    join(ROOT, "data/faculty/candler.json"),
    JSON.stringify(roster, null, 2) + "\n",
    "utf8",
  );
  console.log(
    `wrote ${roster.length} faculty to data/faculty/candler.json ` +
      `(degrees ${withDegrees}/${roster.length}, publications ${withPubs}/${roster.length}, ` +
      `email ${withEmail}/${roster.length}, unmatched ${unmatched})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
