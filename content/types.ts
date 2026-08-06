// Content model for Discerning a Call.
// Everything the site renders is data — editable here without touching pages.
// Universal UMC content lives in the top-level files; conference-specific
// material is layered on top as a ConferencePack (multi-tenant from day one).

export type LifeStageSlug =
  | "youth"
  | "college"
  | "young-adult"
  | "second-career"
  | "in-seminary";

export type LadderTrack = "shared" | "ordained" | "licensed" | "lay";

// An outbound link attached to a piece of content. Used sparingly — a step or
// bullet earns one only when there is a single obvious place to go next.
export interface ContentLink {
  label: string;
  url: string;
}

export interface Step {
  title: string;
  body: string;
  optional?: boolean;
  link?: ContentLink;
}

// A ladder bullet. Plain strings stay valid; use the object form only when the
// bullet needs a link.
export interface Bullet {
  text: string;
  link?: ContentLink;
}

export function toBullet(b: string | Bullet): Bullet {
  return typeof b === "string" ? { text: b } : b;
}

export interface Reality {
  title: string;
  body: string;
}

export interface LifeStagePath {
  slug: LifeStageSlug;
  name: string; // "Youth"
  cardLabel: string; // short label for entry cards
  ageHint: string; // "Middle & high school"
  tagline: string; // italic serif subtitle
  intro: string[]; // paragraphs
  realities: Reality[]; // what is distinct about discerning at this stage
  firstSteps: Step[]; // ordered, concrete next steps
  watchFor: string[]; // honest cautions and encouragements
  timeline: string; // a realistic word about timing
  ladderStageIds: string[]; // rungs of the process most relevant now
  resourceIds: string[]; // resources worth starting with
  formIds?: string[]; // forms of ministry worth a look
}

export interface LadderStage {
  id: string;
  order: number;
  name: string;
  track: LadderTrack;
  trackLabel: string; // human label for the track
  summary: string;
  whatItIs: (string | Bullet)[];
  requirements?: string[];
  whoToTalkTo?: string;
  disciplineRefs?: string[]; // Book of Discipline paragraph references
}

export interface MinistryForm {
  id: string;
  name: string;
  oneLine: string;
  description: string[];
  fitsIf: string[];
  weighThat: string[]; // honest trade-offs
  pathSummary: string;
}

export type SeminaryModality = "residential" | "hybrid" | "online";

export interface Seminary {
  // Present once the school has a deep profile page at /seminaries/<slug>.
  // Absent = the card still links out to the school, as it always has.
  slug?: string;
  name: string;
  city: string;
  state: string;
  umcAffiliated: boolean; // one of the UMC University Senate schools
  modalities: SeminaryModality[];
  courseOfStudy?: boolean; // hosts a Course of Study school
  url: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Seminary profiles — the deep per-school pages.
//
// Two layers, deliberately kept apart (see research/seminary-pages-plan.md):
//   harvested  → data/seminaries/<slug>.json, data/faculty/<slug>.json.
//                Machine-written, re-runnable, provenance on every fact.
//   editorial  → content/seminary-editorial.ts. Hand-written prose.
//                A re-harvest must never touch it.
// ---------------------------------------------------------------------------

// Provenance wrapper. Anything that renders as a *fact* about a school carries
// one. If we can't source it, the field is absent — never guessed.
export interface Sourced<T> {
  value: T;
  source: string; // URL it came from
  asOf: string; // ISO date of the underlying data
  note?: string; // caveat, e.g. "figure covers all master's students, not MDiv only"
}

// The controlled vocabulary behind the cross-school faculty index. Fixed list —
// expand deliberately. Free text here would kill the whole point, which is
// being able to ask "who teaches preaching *anywhere*?"
export type StudyArea =
  | "hebrew-bible"
  | "new-testament"
  | "church-history"
  | "wesleyan-studies"
  | "systematic-theology"
  | "ethics-public-theology"
  | "world-christianity"
  | "preaching"
  | "liturgy-worship"
  | "church-music"
  | "pastoral-care-counseling"
  | "practical-theology"
  | "congregational-leadership"
  | "evangelism-church-planting"
  | "christian-education-formation"
  | "youth-ministry"
  | "chaplaincy"
  | "black-church-studies"
  | "latino-hispanic-ministry"
  | "womanist-feminist-theology"
  | "religion-and-science"
  | "interreligious"
  | "spiritual-formation"
  | "mission-social-justice";

export const studyAreaLabels: Record<StudyArea, string> = {
  "hebrew-bible": "Hebrew Bible / Old Testament",
  "new-testament": "New Testament",
  "church-history": "Church history",
  "wesleyan-studies": "Wesleyan & Methodist studies",
  "systematic-theology": "Systematic theology",
  "ethics-public-theology": "Ethics & public theology",
  "world-christianity": "World Christianity",
  preaching: "Preaching",
  "liturgy-worship": "Liturgy & worship",
  "church-music": "Church music",
  "pastoral-care-counseling": "Pastoral care & counseling",
  "practical-theology": "Practical theology",
  "congregational-leadership": "Congregational leadership",
  "evangelism-church-planting": "Evangelism & church planting",
  "christian-education-formation": "Christian education & formation",
  "youth-ministry": "Youth ministry",
  chaplaincy: "Chaplaincy",
  "black-church-studies": "Black church studies",
  "latino-hispanic-ministry": "Latino/Hispanic ministry",
  "womanist-feminist-theology": "Womanist & feminist theology",
  "religion-and-science": "Religion & science",
  interreligious: "Interreligious engagement",
  "spiritual-formation": "Spiritual formation",
  "mission-social-justice": "Mission & social justice",
};

export interface Publication {
  title: string;
  year?: number;
  kind: "book" | "edited-volume" | "article" | "chapter" | "recording";
  publisher?: string;
  note?: string; // co-authored, translated, etc.
}

export interface FacultyMember {
  id: string; // "<seminary-slug>-<surname>"
  seminarySlug: string;
  name: string;
  title: string; // as the school states it
  otherRoles?: string[]; // directorships, deanships — often the real story
  areas: StudyArea[]; // normalized; drives the cross-school index
  schoolArea?: string; // the school's own division label, preserved as-is
  email?: string;
  // The editorial field, and the one that carries the thesis: what is this
  // person actually working on, and what would you learn from them?
  // Ships ONLY where a human has read their work. Absent otherwise —
  // partial coverage beats uniform mush.
  workingOn?: string;
  // Highest degrees, as the school states them. Where someone earned their
  // doctorate says something about how they were trained.
  degrees?: string[];
  // A selection, not a CV — most recent first, capped at five. Perkins publishes
  // an annual faculty publications PDF; Austin's modals carry degrees but no
  // publication lists.
  //
  // ⚠ Merge on NAME only, and take titles from the directory, never from the
  // publications document — Perkins' 2025 PDF is a different vintage than its
  // A-Z page and disagrees with it about who holds which chair.
  publications?: Publication[];
  publicationsSource?: string;
  publicationsAsOf?: string;
  profileUrl: string; // always link back to the school
}

// ¶324.4's basic graduate theological studies. Nine buckets, 3 semester hours
// each, with a 6-hour floor on UM studies combined. Not pass/fail. ¶335.3(d)
// re-imposes the same list at full connection, so it can't be deferred.
export type BasicStudyArea =
  | "old-testament"
  | "new-testament"
  | "theology"
  | "church-history"
  | "mission-of-the-church"
  | "evangelism"
  | "worship-liturgy"
  | "preaching"
  | "um-studies";

export const basicStudyAreaLabels: Record<BasicStudyArea, string> = {
  "old-testament": "Old Testament",
  "new-testament": "New Testament",
  theology: "Theology",
  "church-history": "Church history",
  "mission-of-the-church": "Mission of the church in the world",
  evangelism: "Evangelism",
  "worship-liturgy": "Worship / liturgy",
  preaching: "Preaching",
  "um-studies": "United Methodist studies (doctrine, polity, history)",
};

export type CoverageStatus =
  | "required" // in the core — you can't graduate without it
  | "elective" // offered, but you must choose it
  | "occasional" // offered irregularly; verify for the term you need
  | "absent"; // not offered here; must be covered elsewhere

export interface RequirementCoverage {
  area: BasicStudyArea;
  status: CoverageStatus;
  note?: string;
}

export type SenateStanding =
  | "approved-umc" // one of the 13
  | "approved-non-umc" // one of the 24
  | "monitoring-warning" // approved, but on Senate Monitoring with Public Warning
  | "not-listed";

// What a candidate needs to know about this school and ¶324.4. The one section
// where being wrong costs someone real time and money — every claim sourced,
// and the page always ends by pointing at the BOM registrar.
export interface OrdinationReadiness {
  senateStanding: Sourced<SenateStanding>;
  // What COUNTS is not the same as what the school OFFERS. UMC schools: a fully
  // online MDiv counts. Senate-approved non-UMC schools: no online or distance
  // class counts toward ¶324.4 at all.
  onlineCredit: Sourced<"fully-counts" | "none-counts">;
  coverage?: RequirementCoverage[];
  coverageSource?: string; // catalog/registrar URL behind the coverage table
  coverageAsOf?: string;
  gapSummary?: string;
  gapRemedies?: { blurb: string; url?: string }[];
}

export interface DegreeProgram {
  name: string;
  abbr: string;
  credits?: number;
  typicalYears?: string;
  modalities: SeminaryModality[];
  blurb?: string;
  url?: string;
  flag?: string; // something a discerner would want called out
}

export interface CostPicture {
  tuitionPerCredit?: Sourced<string>;
  fees?: { label: string; amount: string }[];
  pctReceivingAid?: Sourced<string>;
  typicalAward?: Sourced<string>;
  aidContact?: { name: string; role: string; email?: string; phone?: string };
  honestNote?: string;
}

export interface ScalePicture {
  totalEnrollment?: Sourced<string>;
  mdivEnrollment?: Sourced<string>;
  studentFacultyRatio?: Sourced<string>;
  typicalClassSize?: Sourced<string>;
  outcomes?: Sourced<string>;
}

export interface Partnership {
  kind: "cross-registration" | "consortium" | "joint-degree" | "host-university" | "extension";
  partner: string;
  blurb: string;
  url?: string;
}

// Hand-written. Never overwritten by a harvest.
export interface SeminaryEditorial {
  slug: string;
  lead?: string;
  distinctives?: string[];
  whoThrivesHere?: string[];
  weighThat?: string[];
  draft?: boolean; // true = machine-drafted, awaiting a human pass; renders with a notice
}

// Harvested. Written by scripts/harvest/<slug>.ts, reviewed as a git diff.
export interface SeminaryProfile {
  slug: string;
  name: string;
  city: string;
  state: string;
  url: string;
  ordination: OrdinationReadiness;
  scale?: ScalePicture;
  cost?: CostPicture;
  degrees?: DegreeProgram[];
  concentrations?: string[];
  partnerships?: Partnership[];
  courseOfStudy?: { blurb: string; url?: string };
  contact?: { admissionsUrl?: string; visitUrl?: string; email?: string; phone?: string };
  lastVerified: string;
}

export type ResourceCategory =
  | "official"
  | "assessment"
  | "book"
  | "retreat"
  | "mentorship"
  | "financial";

export interface Resource {
  id: string;
  category: ResourceCategory;
  title: string;
  by?: string;
  url?: string;
  blurb: string;
  forStages?: LifeStageSlug[];
}

export interface OnRamp {
  title: string;
  body: string;
  when?: string;
  cost?: string;
  link?: string;
}

export interface Contact {
  name: string;
  role: string;
  email?: string;
}

export interface MentorBeat {
  title: string;
  body: string;
}

export interface MentorLifeStageNote {
  stage: LifeStageSlug;
  label: string;
  body: string;
}

export interface MentorTrainingItem {
  title: string;
  body: string;
  url?: string;
}

// The mentor module. Built to *complement* GBHEM's official role definition
// (Book of Discipline ¶349; BOM Handbook ch. 7) — not restate it — by surfacing
// the practical "how" of accompaniment and adapting it to life stage.
export interface MentorGuide {
  intro: string[];
  whoFor: string[];
  isNot: string[]; // what a mentor is NOT (¶ Ch.17: not supervisor/expert/counselor/"just friends")
  is: string[]; // co-discerner, consultant, catalyst
  boundaryNote: string; // why the separation from evaluation matters
  lenses: MentorBeat[]; // the four things a mentor helps a candidate test the call against
  covenantIntro: string;
  covenant: MentorBeat[]; // presence, prayer, hospitality, confidentiality
  rhythm: MentorBeat[]; // the shape of a meeting
  report: string[]; // the consent-gated report to the dCOM
  groupVsOneOnOne: string[];
  lifeStageNotes: MentorLifeStageNote[];
  trainingIntro: string;
  training: MentorTrainingItem[];
}

// A realistic look at what a ministry career has actually looked like in a
// conference, by order — drawn from its journal's clergy records. Helps a
// discerner picture the road ahead honestly. See the rio-texas-journal
// /careers analysis for the source numbers.
export interface CareerOrderSnapshot {
  order: string; // "Elders", "Deacons", "Licensed local pastors"
  blurb: string; // one honest line about the shape of this vocation
  stat1: string; // history: full-career summary · snapshot: who's serving now
  stat2: string; // history: appointment length · snapshot: current-church tenure
}
export interface CareerSnapshot {
  // "history" = full career service records (e.g. Rio Texas); "snapshot" =
  // only a current appointment book (e.g. North Georgia). Drives the labels.
  kind: "history" | "snapshot";
  lead: string;
  orders: CareerOrderSnapshot[];
  note: string; // source + honest caveat (incl. demographics not recorded)
  sourceUrl?: string;
}

export interface ConferencePack {
  slug: string; // "rio-texas"
  name: string;
  region: string;
  intro: string[];
  onRamps: OnRamp[];
  contacts: Contact[];
  localNotes?: string[];
  source?: string; // where this was drawn from, for honesty
  careerSnapshot?: CareerSnapshot; // what a ministry career has looked like here
}
