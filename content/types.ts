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

export interface Step {
  title: string;
  body: string;
  optional?: boolean;
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
  whatItIs: string[];
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
  name: string;
  city: string;
  state: string;
  umcAffiliated: boolean; // one of the UMC University Senate schools
  modalities: SeminaryModality[];
  courseOfStudy?: boolean; // hosts a Course of Study school
  url: string;
  note?: string;
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

export interface ConferencePack {
  slug: string; // "rio-texas"
  name: string;
  region: string;
  intro: string[];
  onRamps: OnRamp[];
  contacts: Contact[];
  localNotes?: string[];
  source?: string; // where this was drawn from, for honesty
}
