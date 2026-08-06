// pnpm harvest:validate
//
// Checks every harvested file against the rules in lib/validate.ts and exits
// non-zero on any error. Run it before shipping a school; a red build here is
// cheaper than a wrong number in front of somebody planning their ordination.

import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { validateProfile, validateFaculty, type Problem } from "./lib/validate.mts";
import { suggestAreas } from "./lib/areas.mts";
import type { FacultyMember, SeminaryProfile } from "../../content/types.ts";

const ROOT = process.cwd();
const SEM_DIR = join(ROOT, "data/seminaries");
const FAC_DIR = join(ROOT, "data/faculty");

const showAreas = process.argv.includes("--areas");

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

const problems: Problem[] = [];
let profiles = 0;
let people = 0;

for (const f of (await readdir(SEM_DIR)).filter((n) => n.endsWith(".json"))) {
  const profile = await readJson<SeminaryProfile>(join(SEM_DIR, f));
  problems.push(...validateProfile(profile, `data/seminaries/${f}`));
  profiles++;

  if (profile.slug !== basename(f, ".json")) {
    problems.push({
      file: `data/seminaries/${f}`,
      where: "slug",
      message: `slug "${profile.slug}" does not match the filename`,
      severity: "error",
    });
  }
}

for (const f of (await readdir(FAC_DIR)).filter((n) => n.endsWith(".json"))) {
  const slug = basename(f, ".json");
  const roster = await readJson<FacultyMember[]>(join(FAC_DIR, f));
  problems.push(...validateFaculty(roster, `data/faculty/${f}`, slug));
  people += roster.length;
}

// Every profile must correspond to a school on the stored Senate roster, and
// its standing must agree. This is what stops a page quietly claiming approval
// the Senate has not given.
try {
  const senate = await readJson<{
    umc: string[];
    nonUmc: string[];
    monitoring: string[];
    capturedAt: string;
  }>(join(ROOT, "data/senate-roster.json"));

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const onList = (name: string, list: string[]) =>
    list.some((l) => {
      const a = norm(l), b = norm(name);
      return a === b || a.includes(b) || b.includes(a);
    });

  for (const f of (await readdir(SEM_DIR)).filter((n) => n.endsWith(".json"))) {
    const profile = await readJson<SeminaryProfile>(join(SEM_DIR, f));
    const file = `data/seminaries/${f}`;
    const standing = profile.ordination?.senateStanding?.value;
    const inUmc = onList(profile.name, senate.umc);
    const inNon = onList(profile.name, senate.nonUmc);
    const flagged = onList(profile.name, senate.monitoring);

    if (!inUmc && !inNon) {
      problems.push({ file, where: "name", message: `"${profile.name}" matches no school on the stored Senate roster — check the name or the standing`, severity: "warn" });
    }
    if (inUmc && standing !== "approved-umc") {
      problems.push({ file, where: "senateStanding", message: `roster lists this among the 13 UMC schools but standing is "${standing}"`, severity: "error" });
    }
    if (inNon && !flagged && standing !== "approved-non-umc") {
      problems.push({ file, where: "senateStanding", message: `roster lists this among the 24 non-UMC schools but standing is "${standing}"`, severity: "error" });
    }
    if (flagged && standing !== "monitoring-warning") {
      problems.push({ file, where: "senateStanding", message: `GBHEM flags this school as on Senate Monitoring with Public Warning; standing should be "monitoring-warning", not "${standing}"`, severity: "error" });
    }
  }
} catch {
  problems.push({
    file: "data/senate-roster.json",
    where: "(file)",
    message: "no stored Senate roster — run `pnpm harvest:senate --write` first; without it nothing checks a school's claimed approval",
    severity: "warn",
  });
}

const errors = problems.filter((p) => p.severity === "error");
const warns = problems.filter((p) => p.severity === "warn");

for (const p of [...errors, ...warns]) {
  const tag = p.severity === "error" ? "ERROR" : "warn ";
  console.log(`${tag}  ${p.file}  ${p.where}\n        ${p.message}`);
}

console.log(
  `\n${profiles} profiles, ${people} faculty — ${errors.length} errors, ${warns.length} warnings`,
);

// --areas: compare the normalizer's suggestions against what a human recorded.
// Disagreement is information, never an automatic failure: the rules may be
// thin, or the hand-entry may be wrong. Read both before changing either.
if (showAreas) {
  console.log("\n--- area normalizer vs. recorded data ---");
  let agree = 0, missed = 0, extra = 0;
  for (const f of (await readdir(FAC_DIR)).filter((n) => n.endsWith(".json"))) {
    for (const m of await readJson<FacultyMember[]>(join(FAC_DIR, f))) {
      const guess = new Set(suggestAreas(m.title, m.otherRoles ?? []));
      const have = new Set(m.areas ?? []);
      const onlyGuess = [...guess].filter((a) => !have.has(a));
      const onlyHave = [...have].filter((a) => !guess.has(a));
      if (!onlyGuess.length && !onlyHave.length) { agree++; continue; }
      missed += onlyHave.length;
      extra += onlyGuess.length;
      console.log(
        `  ${m.name}\n    title: ${m.title}` +
          (onlyHave.length ? `\n    rules missed: ${onlyHave.join(", ")}` : "") +
          (onlyGuess.length ? `\n    rules added:  ${onlyGuess.join(", ")}` : ""),
      );
    }
  }
  console.log(`\n  exact agreement on ${agree}/${people}; ${missed} missed by rules, ${extra} added by rules`);
}

process.exit(errors.length ? 1 : 0);
