# Seminary Pages — Expansion Plan

**Status:** plan only, nothing built. Drafted 2026-08-06.
**Current state:** `/seminaries` is a single page — a client-filtered card grid of 13 schools
(`content/seminaries.ts`, 7 fields each: name, city, state, umcAffiliated, modalities,
courseOfStudy, url, note). Every card is an outbound link. There is no per-school page.

---

## 1. The thesis

Seminary websites are written for two audiences at once — prospective students and donors — and
the donor half wins. What a discerner actually wants is buried or absent:

- **Who teaches here, and what are they actually working on?** Faculty pages are alphabetical
  headshot grids with CV PDFs. There is no way to ask "who teaches preaching?" let alone
  "who teaches preaching *anywhere*?"
- **What electives are really offered?** The catalog lists 200 courses; the registrar's schedule
  shows the 40 that ran. Only the second is true.
- **What does it cost, honestly, and what aid is real?** Buried behind a "Request info" form.
- **How big is a class? Who will I actually be with?**
- **What else can I take?** Cross-registration and consortium agreements are the single most
  under-surfaced fact about a divinity school inside a research university, and often the reason
  to pick one.

Discern's lane, restated: **the information is all public; the presentation is the product.**
This is the same lane the site already occupies against GBHEM — don't restate, re-present.

The one thing no seminary site can ever do is **invert the index**: show a discerner
*across all schools* who works on Wesleyan studies, or Black church studies, or congregational
leadership, and where they are. That cross-school view is the feature that justifies the build.

---

## 2. Two hard constraints, decided up front

**(a) Two-layer content: harvested vs. editorial.**
The harvested layer is machine-written, refreshable, and every field carries provenance. The
editorial layer is Wilson's hand-written prose — "what this school is actually like for a
discerner" — and a re-harvest must never touch it. Mixing these is how the data rots or the
voice dies. They live in separate files and merge at render time.

**(b) No number without a source and a date.**
Repo rule already: no invented content on public sites. Extend it — every quantitative claim on a
seminary page renders with an "as of" and links to where it came from. If a field is stale past
its cadence, the page says so rather than showing a confident wrong number.

Live proof this matters — two stale fields found in `content/seminaries.ts` within minutes of
looking:
- It lists **Garrett-Evangelical Theological Seminary**; GBHEM's current roster says
  **Garrett Seminary**. The school renamed and nothing here noticed.
- It lists **Claremont School of Theology as Claremont, CA**. CST's campus situation changed
  (relocation toward Willamette University in Salem, OR, with the Claremont property contested).
  GBHEM's page gives no location, so this one still needs independent verification.

Two hand-typed fields went stale inside 18 months with nobody noticing. That is the argument for
provenance in one line.

---

## 3. Where the data actually comes from

Do **not** plan on thirteen bespoke scrapers for the comparable numbers. There are uniform,
citable sources — use them for anything that goes in a comparison, and scrape only for the
narrative and faculty material that has no structured source.

| Need | Source | Shape | Cadence |
|---|---|---|---|
| Enrollment, headcount by degree, student/faculty ratio, degree completion | **ATS Annual Data Tables + each school's Standard Data Form** | Uniform across all 13 — that's the whole point of ATS | Annual |
| Tuition, fees, % receiving aid, average award, cost of attendance | **IPEDS** (for the university-embedded schools) + school financial-aid page | Public data files / API | Annual |
| MDiv requirements, credit totals, degree maps | School catalog (usually a PDF or a Coursedog/Acalog instance) | Semi-structured | Annual |
| **Electives actually offered** | Registrar's course schedule, last 2–3 terms | Per-school, often a table or a PDF | Per term |
| Faculty roster, rank, field, bio | Faculty directory pages | Per-school HTML | Per term |
| Publications | **ORCID public API**, then institutional repository, then the CV PDF | Structured where ORCID exists | Rolling |
| Cross-registration / consortium | Catalog "academic policies" + consortium sites (BTI, ITC, joint-degree pages) | Prose — needs a human read | Annual |
| Course of Study offerings | GBHEM COS school list + school page | Small | Annual |
| **Senate standing, roster membership, online-credit rule** | **GBHEM Approved Schools of Theology page** | Authoritative, small, closed | Annual — treat a diff as a content emergency |

Two notes on the scrape:
- Respect robots.txt, rate-limit, identify the agent. Use **Playwright** (repo precedent:
  Playwright over claude-in-chrome for anything programmatic).
- Store *extracted fields plus source URL plus fetch date* — not archived page copies. Do not
  republish long verbatim bios. Short attributed quotes or our own summary, always with a link
  back to the school. This is both the copyright-safe answer and the editorially better one,
  since the source prose is exactly the development-office register we're trying to escape.

---

## 4. Data model

Extend `content/types.ts`. The existing `Seminary` becomes the directory-card subset and stays
valid; a new `SeminaryProfile` carries the deep page.

```ts
// Provenance — attached to any harvested value that appears as a fact on the page.
export interface Sourced<T> {
  value: T;
  source: string;      // URL it came from
  asOf: string;        // ISO date of the underlying data, not the fetch
  fetchedAt?: string;
  note?: string;       // caveat, e.g. "MDiv only; school reports all degrees combined"
}

export type FacultyRank =
  | "full" | "associate" | "assistant" | "professor-of-practice"
  | "visiting" | "affiliate" | "emeritus" | "administrator-teaching";

// Controlled vocabulary — the spine of the cross-school faculty index.
// Fixed list, expand deliberately. Free-text kills the inversion.
export type StudyArea =
  | "hebrew-bible" | "new-testament" | "church-history" | "wesleyan-studies"
  | "systematic-theology" | "ethics-public-theology" | "world-christianity"
  | "preaching" | "liturgy-worship" | "pastoral-care-counseling"
  | "practical-theology" | "congregational-leadership" | "evangelism-church-planting"
  | "christian-education-formation" | "youth-ministry" | "chaplaincy"
  | "black-church-studies" | "latino-hispanic-ministry" | "asian-american-ministry"
  | "womanist-feminist-theology" | "rural-small-church" | "religion-and-science"
  | "interreligious" | "spiritual-formation" | "mission-social-justice";

export interface Publication {
  title: string;
  year?: number;
  kind: "book" | "edited-volume" | "article" | "chapter";
  publisher?: string;
  url?: string;
}

export interface FacultyMember {
  id: string;              // seminary-slug + surname slug
  seminarySlug: string;
  name: string;
  title: string;           // as the school states it
  rank: FacultyRank;
  areas: StudyArea[];      // normalized — drives the cross-school index
  degrees?: string[];      // "PhD, Duke University"
  // The editorial field. One or two sentences, our voice, answering
  // "what is this person actually working on and what would you learn from them?"
  // NEVER machine-generated into the published layer without a human read.
  workingOn?: string;
  teaches?: string[];      // named courses they actually teach
  clergyStatus?: string;   // "Elder, Western North Carolina Conference" — matters to discerners
  publications?: Publication[];   // most recent 3–5, not the full CV
  profileUrl: string;      // link back to the school — always
  cvUrl?: string;
  orcid?: string;
  photoUrl?: string;       // link only if licensing is clear; otherwise omit
  sourcedAt: string;
}

export interface CourseOffering {
  code?: string;
  title: string;
  term: string;            // "Fall 2025"
  instructor?: string;
  facultyId?: string;
  areas?: StudyArea[];
  elective: boolean;
  description?: string;    // short; from the catalog
}

export interface DegreeProgram {
  name: string;            // "Master of Divinity"
  abbr: string;            // "MDiv"
  credits?: number;
  typicalYears?: string;   // "3 years full-time, up to 6 part-time"
  modalities: SeminaryModality[];
  umcTrack?: boolean;      // meets ¶324 UM history/doctrine/polity
  requirementsSummary?: string[];
  catalogUrl?: string;
}

export interface CostPicture {
  tuitionPerCredit?: Sourced<number>;
  mdivTotalTuitionEstimate?: Sourced<number>;   // credits × per-credit; label it as such
  fees?: Sourced<string>;
  pctReceivingAid?: Sourced<number>;
  typicalAward?: Sourced<string>;
  namedScholarships?: { name: string; blurb: string; url?: string }[];
  mefEligible?: boolean;   // Ministerial Education Fund
  conferenceAidNote?: string;
  honestNote?: string;     // the thing the school won't say plainly
}

export interface ScalePicture {
  totalEnrollment?: Sourced<number>;
  mdivEnrollment?: Sourced<number>;
  studentFacultyRatio?: Sourced<string>;
  typicalClassSize?: Sourced<string>;
  pctUmc?: Sourced<number>;
  pctPartTime?: Sourced<number>;
  medianAge?: Sourced<number>;
}

export interface Partnership {
  kind: "cross-registration" | "consortium" | "joint-degree" | "host-university" | "extension";
  partner: string;
  blurb: string;           // what a student can actually DO because of it
  url?: string;
}

export interface SeminaryProfile {
  slug: string;
  // --- editorial layer: hand-written, never overwritten by a harvest ---
  lead?: string;           // the honest one-paragraph "what this place is"
  distinctives?: string[];
  whoThrivesHere?: string[];
  weighThat?: string[];    // same honest-tradeoffs pattern as MinistryForm
  // --- harvested layer ---
  scale?: ScalePicture;
  cost?: CostPicture;
  degrees?: DegreeProgram[];
  recentElectives?: CourseOffering[];
  partnerships?: Partnership[];
  facultyIds?: string[];
  courseOfStudyDetail?: string;
  contact?: { admissionsUrl?: string; visitUrl?: string; email?: string };
  lastVerified: string;
}
```

**File layout.** The typed-TS-in-`content/` pattern stops scaling at ~500 faculty records.
Split by role, not by convention:

```
content/seminaries.ts              # unchanged — directory cards (13 records, hand-kept)
content/seminary-editorial.ts      # hand-written layer, one entry per school
data/seminaries/<slug>.json        # harvested profile — machine-written, git-tracked
data/faculty/<slug>.json           # harvested faculty roster per school
scripts/harvest/<slug>.ts          # per-school adapter
scripts/harvest/shared/            # ATS/IPEDS/ORCID loaders, normalizers, StudyArea mapper
```

Keeping the harvested JSON in git is deliberate: a re-harvest shows up as a reviewable diff, and
`git log` becomes the change history for tuition and roster churn. Build reads JSON at compile
time — everything stays statically prerendered, no DB, no runtime fetch. V1 stays a static site.

---

## 5. Routes

| Route | What it is |
|---|---|
| `/seminaries` | Existing directory. Cards now link **inward** to the profile, with a small outbound ↗ to the school. Add filters: study area, cost band, size. |
| `/seminaries/[slug]` | The school page. Sections: at a glance · money · the degree · what's actually taught · the faculty · where you'd be (place + partners) · how to visit. |
| `/seminaries/[slug]/faculty` | Full roster for one school, filterable by area. (Or a section on the main page if rosters run small — decide at pilot.) |
| `/seminaries/faculty` | **The cross-school faculty index.** Filter by `StudyArea`; results grouped by school. The feature no seminary site can build. |
| `/seminaries/compare` | Side-by-side of the comparable, sourced numbers. |

**Section order on `/seminaries/[slug]` is a claim.** Lead with the editorial paragraph and the
faculty, not with rankings or amenities. Money comes third — early enough to be honest, not so
early it reads as the point.

**Anti-ranking rule.** `/compare` shows facts with sources and never a score, a rank, or a
"best for." Same discipline as the Commons rule — describe, don't promote. A discerner comparing
Perkins and Iliff should come away with a clearer picture of both, not a winner. Where the data
genuinely doesn't compare (a school reporting all degrees together vs. MDiv-only), say that in
the cell rather than normalizing it into a false equivalence.

**Tone continuity.** The site's spine is bias-to-Yes — *here is your next step*, not *here are the
hurdles*. Seminary pages inherit it: a cost section that ends in "here is who to ask about aid,"
a faculty section that ends in "here is who to email." Every school page should terminate in a
concrete, low-cost action: visit day, class audit, one named person.

---

## 6. Phasing

**Phase 0 — decide scope + verify the 13.**
Re-verify the current `seminaries.ts` records (Claremont first). Lock the `StudyArea`
vocabulary. Pick the pilot school.

**Phase 1 — pilot ONE school, end to end.** Recommend **Perkins/SMU** — Rio Texas is pack #1,
Wilson knows the institution well enough to catch a wrong page, and it exercises the hard cases
(embedded in a research university, has an extension campus, hosts Course of Study).
Deliverables: the type additions, one harvest adapter, one JSON profile, one full page shipped,
one hand-written editorial layer. **Do not touch school #2 until the pilot page is one Wilson
would send to an actual discerner.** Repo precedent: iterate volume 1 first; harden the tool
before the run.

**Phase 2 — harden the harvester.** Extract everything school-agnostic from the pilot adapter:
ATS/IPEDS loaders, ORCID client, the StudyArea normalizer, the provenance stamper, a validation
pass that fails loudly on a missing source or a stale date.

**Phase 2b — the tier-2 pilot: Austin Presbyterian.** Second school, chosen because it exercises
the ordination-gap map (§8), which Perkins cannot. Prove both page shapes before any fan-out.

**Phase 3 — fan out.** The remaining 11 UMC schools, then the remaining 22 non-UMC Senate
schools, in batches of 3–4. Thirty-five schools after the two pilots — this is the long haul,
and the editorial layer is what paces it. Each batch: harvest → human
read → editorial layer → ship. Expect the editorial layer to be the bottleneck, not the scrape.
Budget it as writing, not engineering.

**Phase 4 — the cross-school index + compare.** Only meaningful once ≥8 schools have normalized
`areas`. Build it last even though it's the headline feature; a half-populated inversion is worse
than none.

**Phase 5 — maintenance cadence.** Annual re-harvest (tuition + ATS tables, late summer),
per-term elective refresh, staleness badge on any page past its window. Write the cadence into
the repo's CLAUDE.md so a future session inherits it.

---

## 7. Decisions (settled 2026-08-06)

1. **Scope: the full University Senate list — 13 UMC + 24 non-UMC = 37 schools.** Settled by the
   GBHEM roster (`research/gbhem-approved-schools-snapshot.md`, captured 2026-08-06). Not a
   judgment call and not a curated selection: the Senate list *is* the boundary, because it is
   the boundary in ¶324.4. See §8 — tier 2 is not a stretch goal, it is where the
   ordination-gap feature earns its keep.
2. **Faculty depth: core full-time faculty only** (~15–35 per school). Adjuncts churn hardest
   and stale faculty data is the worst kind.
3. **`workingOn` ships only where a human has read the person's work**, and is simply absent
   elsewhere. Partial coverage beats uniform mush; nothing unread goes public.
4. **Photos:** hotlink nothing, host nothing, ship text-first. Licensing is per-school and not
   worth the v1 cost. Revisit per school if a page genuinely needs it.
5. **`/compare`:** build it, constrain it to sourced facts, no derived scores, no ranking.

---

## 8. The ordination-gap map (tier 2's reason to exist)

**The correction that shapes this.** The gate in ¶324.4 is **not** ATS accreditation — it is
"a **University Senate-approved** theological school." GBHEM publishes that list, and it is a
closed roster of **37**: the 13 UMC schools plus 24 Senate-approved non-UMC schools. Full
capture in `research/gbhem-approved-schools-snapshot.md` (page last modified 2026-07-07).

Three things fall out of the roster that the site must carry as first-class data:

**(a) The online rule is asymmetric, and it is the most decision-changing fact GBHEM publishes.**
Every UMC school "is approved to provide a fully online master of divinity … to meet the
educational requirements for United Methodist ordination." For the 24 non-UMC schools: *"None of
the schools listed below are approved to provide distance or online education for any classes …
Distance or online classes taken at the schools listed below cannot be counted to meet the
educational requirements for United Methodist ordination."* A candidate at Princeton or Fuller
who takes one class online has a credit that does not count. This gets a prominent, unmissable
panel on every tier-2 page — not a footnote.

Note what this does to the existing `modalities` field: it describes what a school *offers*,
which for tier-2 schools is a different thing from what *counts*. Do not conflate them. Model
them separately or the site will actively mislead.

**(b) Senate standing is a status, not a boolean.** Phillips Theological Seminary currently
carries "University Senate Monitoring with Public Warning." A candidate weighing Phillips needs
to know that plainly and neutrally, with a link to the source and a date.

**(c) The absences matter as much as the list.** Schools UMC candidates commonly assume are
fine and that are **not** on the Senate list as of this capture: **Asbury**, **Truett (Baylor)**,
**Seminary of the Southwest**. Discern should be able to answer "is X approved?" for a school
it doesn't have a page for. That argues for a small, honest lookup — *this school is not on the
University Senate list; that doesn't make it a bad school, but the ¶324.4 graduate requirement
isn't met by the degree itself, and that's a conversation to have with your BOM registrar before
you enroll, not after.* Stated as a fact about the list, never as a judgment about the school.

**¶324.4 is a checklist, so model it as one.** Verbatim from the 2024 Discipline
(`~/church-documents/documents/discipline/bod-2024.json`): the basic graduate theological studies
"shall each be three (3) semester hours, or the equivalent, and may be included within or in
addition to a seminary degree," and shall include:

> Old Testament · New Testament · theology · church history · mission of the church in the world ·
> evangelism · worship/liturgy · preaching · **United Methodist studies in doctrine, polity and
> history** (minimum **6** semester hours combined for the UM studies)

Not pass/fail. ¶335(3)(d) re-imposes the same list at full connection, so it is not escapable
later. This is nine buckets and a credit floor — a schema, not prose.

```ts
export type BasicStudyArea =
  | "old-testament" | "new-testament" | "theology" | "church-history"
  | "mission-of-the-church" | "evangelism" | "worship-liturgy" | "preaching"
  | "um-doctrine" | "um-polity" | "um-history";

export type CoverageStatus =
  | "required"    // baked into the MDiv core — you cannot graduate without it
  | "elective"    // offered, but you must choose it
  | "occasional"  // offered irregularly; verify the term you'd need it
  | "absent";     // not offered here — must be covered elsewhere

export interface RequirementCoverage {
  area: BasicStudyArea;
  status: CoverageStatus;
  courses?: { code?: string; title: string; credits?: number; facultyId?: string }[];
  credits?: number;
  note?: string;
  source: string;   // catalog URL — this claim above all others needs one
  asOf: string;
}

export type SenateStanding =
  | "approved-umc"          // one of the 13
  | "approved-non-umc"      // one of the 24
  | "monitoring-warning"    // approved, but on Senate Monitoring w/ Public Warning
  | "not-listed";           // not on the Senate list at all

export interface OrdinationReadiness {
  senateStanding: Sourced<SenateStanding>;
  // What COUNTS, which is not the same as what the school OFFERS.
  // UMC schools: fully online MDiv counts. Non-UMC Senate schools: NO online or
  // distance class counts toward the ¶324.4 requirement, full stop.
  onlineCredit: Sourced<"fully-counts" | "none-counts">;
  coverage: RequirementCoverage[];
  // Only populated where something is elective/occasional/absent — the actual answer
  // to "what would I have to add?"
  gapSummary?: string;
  // How people actually close the gap at this school. Named, concrete, linked.
  gapRemedies?: {
    kind: "cross-registration" | "online-um-studies" | "summer-intensive"
        | "course-of-study" | "gbhem-approved-alternative";
    blurb: string;
    url?: string;
  }[];
  addedCreditsEstimate?: string;  // "6–9 credits beyond the standard MDiv"
  lastVerified: string;
}
```

**How it renders.** On a UMC school: a quiet green-ish "all nine covered in the core, UM studies
included" panel — reassurance, one glance, done. On Austin Presbyterian or Truett or Seminary of
the Southwest: the honest table — *these seven are in your core; UM doctrine, polity, and history
are the gap; here are the six credits and here is specifically how APTS students have covered
them.* Then the remedies, named and linked.

That panel is the single most useful thing on the site for the person who has already fallen in
love with a school that isn't on the UMC list — which, in a conference like Rio Texas with
Austin Presbyterian and Seminary of the Southwest nearby, is a lot of people. Right now they find
out about the gap late, from a dCOM, as a problem. This turns it into a plan.

**Sourcing caution.** This is the one section where being wrong has real consequences for someone's
timeline and money. Coverage claims come from the school's catalog and course schedule with a
source URL on every row, and the page ends with an unmissable line: *confirm with your Board of
Ordained Ministry registrar before you enroll — they make this call, not us.* Bias-to-Yes here
means "here's how to close it," never "here's why it's fine."

**Tier 2 selection rule — settled.** There is no selection rule, because there is no selection:
tier 2 *is* the 24 Senate-approved non-UMC schools, complete. Nothing gets added because it feels
relevant; nothing gets dropped because it's far away. GBHEM drew the line, we render it. Tier 2
schools carry a clear, non-pejorative label — a legitimate route with a different set of
constraints, not a lesser one.

Build order within tier 2 follows conference relevance, so Rio Texas gets served first:
**Austin Presbyterian**, then **Brite (TCU)** — both Texas, both real to people Wilson knows.

**Phasing impact.** Slot a tier-2 pilot immediately after the Perkins pilot — **Austin
Presbyterian as school #2**, specifically because it exercises the gap map *and* the online-credit
rule, neither of which Perkins can. Proving both page shapes before fanning out is worth more
than three more UMC schools.

**Roster maintenance.** The GBHEM page is itself a harvest target on an annual cadence: it is the
source of truth for who's on the list, who's under monitoring, and the online-credit rule. A diff
in that page is a content emergency, not a routine refresh — a school leaving the list, or
entering monitoring, changes real people's plans.

---

## 9. What this is not

Not a rankings site. Not a lead-gen funnel for the schools. Not a replacement for visiting.
The page's job is to get a discerner to the point where they can send one specific, well-aimed
email — to a named professor, an admissions officer, or their conference's candidacy registrar —
several months earlier than the schools' own sites would have let them.
