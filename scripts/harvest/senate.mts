// pnpm harvest:senate
//
// Harvests GBHEM's Approved Schools of Theology page — the authoritative roster
// behind ¶324.4's "University Senate-approved theological school", and the
// source of the online-credit rule.
//
// This is the one harvest where a diff is not routine maintenance. A school
// leaving the list, or entering Senate Monitoring, changes what a real person
// can do with the degree they are part-way through. So the script compares
// against the stored roster and shouts about any change rather than silently
// overwriting it.
//
//   node scripts/harvest/senate.mts           check, report a diff, write nothing
//   node scripts/harvest/senate.mts --write   accept the changes
//   node scripts/harvest/senate.mts --fresh   bypass the fetch cache

import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { get, today } from "./lib/fetch.mts";
import { htmlToText } from "./lib/text.mts";

const SOURCE = "https://www.gbhem.org/education/schools-of-theology/";
const OUT = join(process.cwd(), "data/senate-roster.json");

const write = process.argv.includes("--write");
const fresh = process.argv.includes("--fresh");

interface Roster {
  source: string;
  capturedAt: string;
  umc: string[];
  nonUmc: string[];
  monitoring: string[]; // subset of nonUmc carrying a public warning
  umcOnlineCounts: boolean;
  nonUmcOnlineCounts: boolean;
}

const res = await get(SOURCE, { fresh });
const text = htmlToText(res.body);
const lines = text.split("\n");

function section(startRe: RegExp, endRe: RegExp): string[] {
  const start = lines.findIndex((l) => startRe.test(l));
  if (start < 0) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => endRe.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).map((l) => l.trim());
}

// GBHEM's markup splits words across tags, so the extracted text contains
// "Pittsburgh Theological S eminary" and "Moravian University School of
// Theolog y". Repair that BEFORE classifying — an earlier version filtered
// first and silently lost Pittsburgh, because \bSeminary\b cannot match
// "S eminary". Silently losing a school from the approved list is the single
// worst thing this script could do.
function tidy(name: string): string {
  const KEEP = /^(of|in|at|the|and|for|a)$/i;
  return name
    .replace(/\s+/g, " ")
    // "Theolog y" → "Theology": word followed by a stray single lowercase letter
    .replace(/\b([A-Za-z]{2,})\s+([a-z])\b(?=\s|$)/g, (m, a, b) => (KEEP.test(a) ? m : `${a}${b}`))
    // "S eminary" → "Seminary": stray single capital followed by a word
    .replace(/\b([A-Z])\s+([a-z]{3,})\b/g, "$1$2")
    .replace(/\*+$/, "")
    .trim();
}

// A school name, as opposed to the surrounding marketing prose. Names are short
// and title-cased; the paragraphs around them are neither.
function isSchool(l: string): boolean {
  if (l.length < 6 || l.length > 90) return false;
  if (/[.;:!?]$/.test(l)) return false;
  if (/\b(the University Senate has|are approved|None of the schools|Denotes|Our 13|If you plan|All United Methodist)\b/i.test(l)) return false;
  // Deliberately prefix matches, not whole words — see tidy() above.
  return /^[A-Z]/.test(l) && /(Seminar|School|Divinity|Theolog|Universit|College|Kairos|Religion)/i.test(l);
}

const umcRaw = section(/^United Methodist Schools of Theology$/i, /^Senate-Approved/i);
const nonRaw = section(/^Senate-Approved, Non-United Methodist Schools of Theology$/i, /^(Discover More|\*\*Denotes)/i);

const umc = umcRaw.map(tidy).filter(isSchool);
const monitoring: string[] = [];
const nonUmc = nonRaw
  .map((l) => ({ flagged: /\*\*/.test(l), name: tidy(l) }))
  .filter((x) => isSchool(x.name))
  .map(({ flagged, name }) => {
    if (flagged) monitoring.push(name);
    return name;
  });

const umcOnlineCounts = /All United Methodist schools of theology are approved to provide a fully online/i.test(text);
const nonUmcOnlineCounts = !/cannot be counted to meet the educational requirements/i.test(text);

const roster: Roster = {
  source: SOURCE,
  capturedAt: today(),
  umc,
  nonUmc,
  monitoring,
  umcOnlineCounts,
  nonUmcOnlineCounts,
};

// --- report ---------------------------------------------------------------
console.log(`Fetched ${SOURCE}${res.fromCache ? " (cached — pass --fresh to refetch)" : ""}`);
console.log(`  ${umc.length} United Methodist schools`);
console.log(`  ${nonUmc.length} Senate-approved non-UMC schools`);
console.log(`  ${monitoring.length} on monitoring: ${monitoring.join(", ") || "none"}`);
console.log(`  UMC online counts: ${umcOnlineCounts} · non-UMC online counts: ${nonUmcOnlineCounts}`);

// Expected counts, as of the 2026-07-07 capture. These are tripwires, not
// truth: if GBHEM genuinely changes the list these should be updated, but a
// mismatch far more often means the parser has quietly dropped a school.
if (umc.length !== 13) console.log(`\n!! expected 13 UMC schools, parsed ${umc.length} — check the parser before trusting this`);
if (nonUmc.length !== 24) console.log(`\n!! expected 24 non-UMC schools, parsed ${nonUmc.length} — check the parser before trusting this`);
if (!umcOnlineCounts || nonUmcOnlineCounts) {
  console.log("\n!! THE ONLINE RULE DID NOT PARSE AS EXPECTED.");
  console.log("   Every tier-2 page states that no online class counts. If GBHEM has");
  console.log("   changed that wording, read the page before touching the data.");
}

let previous: Roster | null = null;
try {
  previous = JSON.parse(await readFile(OUT, "utf8")) as Roster;
} catch {
  console.log("\nNo stored roster yet — this run establishes the baseline.");
}

if (previous) {
  const diff = (label: string, before: string[], after: string[]) => {
    const added = after.filter((x) => !before.includes(x));
    const removed = before.filter((x) => !after.includes(x));
    for (const a of added) console.log(`  + ${label}: ${a}`);
    for (const r of removed) console.log(`  - ${label}: ${r}`);
    return added.length + removed.length;
  };
  console.log("\nAgainst the stored roster:");
  const changes =
    diff("UMC", previous.umc, umc) +
    diff("non-UMC", previous.nonUmc, nonUmc) +
    diff("monitoring", previous.monitoring, monitoring);

  if (changes) {
    console.log(`\n!! ${changes} change(s) to the University Senate list.`);
    console.log("   This is not routine. A school leaving the list, or entering monitoring,");
    console.log("   changes what a candidate part-way through a degree can do with it.");
    console.log("   Read GBHEM's page, then update the affected school profiles AND");
    console.log("   research/gbhem-approved-schools-snapshot.md before accepting this.");
  } else {
    console.log("  no changes.");
  }
}

if (write) {
  await writeFile(OUT, JSON.stringify(roster, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${OUT}`);
} else {
  console.log("\n(dry run — pass --write to store)");
}
