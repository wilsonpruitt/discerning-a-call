// The rules a harvested file must satisfy before it can ship.
//
// The point of this file is that the discipline in research/seminary-pages-plan.md
// stops depending on anybody remembering it. "No number without a source and a
// date" is only a rule if something fails when it is broken.

import { studyAreaLabels, type FacultyMember, type SeminaryProfile } from "../../../content/types.ts";

export interface Problem {
  file: string;
  where: string;
  message: string;
  severity: "error" | "warn";
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const STALE_DAYS = 400; // an annual cadence, plus slack

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso + "T00:00:00Z").getTime()) / 86_400_000;
}

function checkSourced(
  p: Problem[],
  file: string,
  where: string,
  v: { value?: unknown; source?: string; asOf?: string } | undefined,
) {
  if (!v) return;
  if (!v.source) p.push({ file, where, message: "no source URL — every rendered fact needs one", severity: "error" });
  else if (!/^https?:\/\//.test(v.source)) p.push({ file, where, message: `source is not a URL: ${v.source}`, severity: "error" });
  if (!v.asOf) p.push({ file, where, message: "no asOf date", severity: "error" });
  else if (!ISO.test(v.asOf)) p.push({ file, where, message: `asOf is not YYYY-MM-DD: ${v.asOf}`, severity: "error" });
  else if (daysSince(v.asOf) > STALE_DAYS) p.push({ file, where, message: `asOf is ${Math.round(daysSince(v.asOf))} days old — re-harvest or the page will state a stale figure confidently`, severity: "warn" });
}

// A harvest that invents a field loses it silently: the JSON validates, the type
// has no such property, and the renderer never reads it. Duke's Rural Ministry
// Fellowships — full funding tied to UMC ordination — sat in an invented
// `cost.namedScholarships` and would have shipped invisible. Missing fields
// already fail loudly; unknown ones have to as well.
const KNOWN_KEYS: Record<string, string[]> = {
  cost: ["tuitionPerCredit", "fees", "pctReceivingAid", "typicalAward", "namedScholarships", "aidContact", "honestNote"],
  ordination: ["senateStanding", "onlineCredit", "coverage", "coverageSource", "coverageAsOf", "gapSummary", "gapRemedies"],
  scale: ["totalEnrollment", "mdivEnrollment", "studentFacultyRatio", "typicalClassSize", "outcomes"],
};

function checkUnknownKeys(p: Problem[], file: string, where: string, obj: unknown) {
  const known = KNOWN_KEYS[where];
  if (!known || !obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    if (!known.includes(k)) {
      p.push({ file, where: `${where}.${k}`, message: `not a field the renderer reads — it will be dropped silently. Add it to the type and the page, or fold it into an existing field`, severity: "error" });
    }
  }
}

export function validateProfile(profile: SeminaryProfile, file: string): Problem[] {
  const p: Problem[] = [];
  const need = (cond: unknown, where: string, message: string) => {
    if (!cond) p.push({ file, where, message, severity: "error" });
  };

  for (const section of Object.keys(KNOWN_KEYS)) {
    checkUnknownKeys(p, file, section, (profile as unknown as Record<string, unknown>)[section]);
  }

  need(profile.slug, "slug", "missing");
  need(profile.name, "name", "missing");
  need(profile.lastVerified && ISO.test(profile.lastVerified), "lastVerified", "missing or not YYYY-MM-DD");
  if (profile.lastVerified && ISO.test(profile.lastVerified) && daysSince(profile.lastVerified) > STALE_DAYS) {
    p.push({ file, where: "lastVerified", message: `${Math.round(daysSince(profile.lastVerified))} days old`, severity: "warn" });
  }

  const o = profile.ordination;
  need(o, "ordination", "missing — a seminary page without the ¶324.4 answer has no reason to exist");
  if (o) {
    checkSourced(p, file, "ordination.senateStanding", o.senateStanding);
    checkSourced(p, file, "ordination.onlineCredit", o.onlineCredit);

    // The asymmetric GBHEM rule, enforced rather than trusted to memory.
    const std = o.senateStanding?.value;
    const online = o.onlineCredit?.value;
    if (std === "approved-umc" && online !== "fully-counts") {
      p.push({ file, where: "ordination.onlineCredit", message: "a UMC school's fully online M.Div. counts — GBHEM says so for all thirteen", severity: "error" });
    }
    if ((std === "approved-non-umc" || std === "monitoring-warning") && online !== "none-counts") {
      p.push({ file, where: "ordination.onlineCredit", message: "no online or distance class at a Senate-approved non-UMC school counts toward ¶324.4", severity: "error" });
    }

    if (o.coverage?.length) {
      need(o.coverage.length === 9, "ordination.coverage", `has ${o.coverage.length} rows; ¶324.4 names nine areas — a partial table reads as a complete one`);
      need(o.coverageSource, "ordination.coverageSource", "a coverage table must cite the catalogue it came from");
      need(o.coverageAsOf && ISO.test(o.coverageAsOf), "ordination.coverageAsOf", "missing or malformed");
      const seen = new Set<string>();
      for (const row of o.coverage) {
        if (seen.has(row.area)) p.push({ file, where: `coverage.${row.area}`, message: "duplicate row", severity: "error" });
        seen.add(row.area);
        if (row.status !== "required" && !row.note) {
          p.push({ file, where: `coverage.${row.area}`, message: `status "${row.status}" with no note — anything not in the core must say what to do instead`, severity: "error" });
        }
        // "required-umc-track" is the row most easily inflated into "required".
        // It only means anything if the note says who is bound, so insist the
        // note actually names them.
        if (row.status === "required-umc-track" && row.note && !/united methodist|\bUMC\b|methodist/i.test(row.note)) {
          p.push({ file, where: `coverage.${row.area}`, message: 'status "required-umc-track" but the note never says it binds United Methodist students — say who is held to it', severity: "error" });
        }
      }
      // A UMC-track requirement is not a gap for the person this site serves:
      // a UMC candidate cannot graduate without it either.
      const gaps = o.coverage.filter((c) => c.status !== "required" && c.status !== "required-umc-track");
      if (gaps.length && !o.gapSummary?.length) {
        p.push({ file, where: "ordination.gapSummary", message: `${gaps.length} areas are not in the core but nothing explains the consequence`, severity: "error" });
      }
      if (gaps.length && !o.gapRemedies?.length) {
        p.push({ file, where: "ordination.gapRemedies", message: "gaps named with no way to close them — bias to yes, not to warning", severity: "error" });
      }
    }
  }

  checkSourced(p, file, "cost.tuitionPerCredit", profile.cost?.tuitionPerCredit);
  checkSourced(p, file, "cost.pctReceivingAid", profile.cost?.pctReceivingAid);
  checkSourced(p, file, "cost.typicalAward", profile.cost?.typicalAward);
  checkSourced(p, file, "scale.totalEnrollment", profile.scale?.totalEnrollment);
  checkSourced(p, file, "scale.mdivEnrollment", profile.scale?.mdivEnrollment);
  checkSourced(p, file, "scale.studentFacultyRatio", profile.scale?.studentFacultyRatio);
  checkSourced(p, file, "scale.typicalClassSize", profile.scale?.typicalClassSize);
  checkSourced(p, file, "scale.outcomes", profile.scale?.outcomes);

  return p;
}

export function validateFaculty(members: FacultyMember[], file: string, slug: string): Problem[] {
  const p: Problem[] = [];
  const ids = new Set<string>();

  for (const m of members) {
    const where = m.name || m.id || "(unnamed)";
    if (!m.id) p.push({ file, where, message: "missing id", severity: "error" });
    else if (ids.has(m.id)) p.push({ file, where, message: `duplicate id ${m.id}`, severity: "error" });
    ids.add(m.id);

    if (m.seminarySlug !== slug) {
      p.push({ file, where, message: `seminarySlug "${m.seminarySlug}" does not match the file's school "${slug}"`, severity: "error" });
    }
    if (!m.title) p.push({ file, where, message: "no title — a name alone tells a discerner nothing", severity: "error" });
    if (!m.profileUrl) p.push({ file, where, message: "no profileUrl — we always link back to the school", severity: "error" });
    if (!m.areas?.length) p.push({ file, where, message: "no study areas — invisible to the cross-school index", severity: "error" });

    for (const a of m.areas ?? []) {
      if (!(a in studyAreaLabels)) p.push({ file, where, message: `"${a}" is not in the controlled vocabulary`, severity: "error" });
    }
    if (new Set(m.areas ?? []).size !== (m.areas ?? []).length) {
      p.push({ file, where, message: "duplicate study area", severity: "warn" });
    }

    if (m.publications?.length) {
      if (!m.publicationsSource) p.push({ file, where, message: "publications with no source", severity: "error" });
      if (!m.publicationsAsOf || !ISO.test(m.publicationsAsOf)) p.push({ file, where, message: "publications with no valid asOf", severity: "error" });
      if (m.publications.length > 5) p.push({ file, where, message: `${m.publications.length} publications — a selection, not a CV; cap at five`, severity: "warn" });

      // Citations are lifted verbatim from PDFs and pages whose line-wrapping
      // varies. A "title" that opens with a series code (BZAW 469; …), starts
      // lowercase, or has two citations run together has lost the actual title
      // in parsing. Better to drop the entry than print a book with no name.
      for (const pub of m.publications) {
        const t = pub.title.trim();
        if (/^[A-Z]{2,8}\s*\d+\s*[;,:]/.test(t)) {
          p.push({ file, where, message: `publication opens with a series code, so the title was lost in parsing: "${t.slice(0, 60)}…"`, severity: "error" });
        } else if (/^[a-z]/.test(t)) {
          p.push({ file, where, message: `publication starts mid-sentence: "${t.slice(0, 60)}…"`, severity: "error" });
        // "2015.with L. Goldman, …" — a year full-stopped straight into the next
        // citation. Requires a LETTER after the dot: a digit means a DOI
        // (…2025.2473245), which is legitimate and was a false positive here.
        } else if (/\.\s*with\s+[A-Z]/.test(t) || /\d{4}\.[A-Za-z]/.test(t)) {
          p.push({ file, where, message: `two citations appear to have run together: "${t.slice(0, 70)}…"`, severity: "error" });
        } else if (/[,;]$|\band$|\bedited by [^.]*$/i.test(t) && !/\.$/.test(t)) {
          p.push({ file, where, message: `citation looks truncated mid-list: "…${t.slice(-60)}"`, severity: "warn" });
        } else if (t.length < 25) {
          p.push({ file, where, message: `publication title suspiciously short: "${t}"`, severity: "warn" });
        }
      }
    }

    // Honorary doctorates are an honour, not training. Keeping them is fine;
    // they must simply never be the only doctorate, or the page will present
    // one as someone's qualification.
    const honorary = (m.degrees ?? []).filter((d) => /honoris causa|honorary/i.test(d));
    const earned = (m.degrees ?? []).filter((d) => !/honoris causa|honorary/i.test(d));
    if (honorary.length && !earned.length) {
      p.push({ file, where, message: "only degree listed is honorary — would render as this person's training", severity: "error" });
    }
  }
  return p;
}
