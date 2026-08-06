// Faculty title → normalized StudyArea[].
//
// This is the spine of the cross-school faculty index: it is what lets someone
// ask "who teaches preaching, anywhere?". Across the first three schools it was
// done by hand sixty-six times, which does not scale to thirty-seven schools.
//
// It suggests; it does not decide. Adapters treat the output as a starting
// point, and `pnpm harvest:areas-check` reports where the rules disagree with
// what a human recorded — a disagreement is a bug in the rules OR in the data,
// and reading both is the point.
//
// MEASURED, so nobody mistakes this for automation: across the first three
// schools it agrees exactly with the hand-recorded areas on 28 of 66 people.
// That is not a ruleset waiting to be tuned into the nineties. Most of the
// misses are areas a human took from a bio or a publication list rather than a
// job title — Ángel Gallardo's title says "Church History" and gives no hint
// that he teaches Methodism, which is the single most useful fact about him for
// a UMC candidate. Titles carry roughly half the signal; the other half has to
// be read for. Use this to draft and to audit, never to populate unattended.
//
// Its more valuable use turned out to be the reverse direction: running it
// against existing data flagged two Brite entries whose areas had come from
// background knowledge rather than from Brite's pages. Both were then sourced
// properly from the school's faculty-books listing.
//
// Endowed chairs are the main trap: "The Right Rev. Sam B. Hulsey Professor of
// Hebrew Bible" and "Susanna Wesley Centennial Chair in Practical Theology"
// both carry a donor's name that must not be matched on. Hence: strip the
// honorific prefix before matching, and never match bare personal names.

import type { StudyArea } from "../../../content/types.ts";

interface Rule {
  area: StudyArea;
  patterns: RegExp[];
}

const RULES: Rule[] = [
  // A chair in "Biblical Studies" spans both testaments; claim both rather
  // than silently picking one.
  { area: "hebrew-bible", patterns: [/\bbiblical studies\b/i, /\bold testament\b/i, /\bhebrew bible\b/i, /\bbiblical hebrew\b/i] },
  { area: "new-testament", patterns: [/\bbiblical studies\b/i, /\bnew testament\b/i, /\bchristian origins\b/i] },
  { area: "church-history", patterns: [/\bchurch history\b/i, /\bhistory of christianity\b/i, /\bhistorical theology\b/i, /\bearly christianity\b/i, /\bchristian history\b/i, /\bpatristic/i, /\breligious history\b/i, /\bhistory of religion/i] },
  { area: "wesleyan-studies", patterns: [/\bwesley(an)?\b(?!\s+centennial)/i, /\bmethodist studies\b/i, /\bmethodism\b/i] },
  { area: "systematic-theology", patterns: [/\bsystematic theology\b/i, /\bchristian doctrine\b/i, /\bconstructive theology\b/i, /\bphilosophical theology\b/i, /\breformed theology\b/i, /\bprofessor of theology\b/i, /\btheology and religion\b/i] },
  { area: "ethics-public-theology", patterns: [/\bethics\b/i, /\bchurch and society\b/i, /\bpublic theology\b/i, /\bsociety\b/i] },
  { area: "world-christianity", patterns: [/\bworld christianity\b/i, /\bglobal christianity\b/i, /\bintercultural\b/i, /\bchristian mission\b/i, /\bmissions?\b/i] },
  { area: "preaching", patterns: [/\bpreaching\b/i, /\bhomiletic/i] },
  { area: "liturgy-worship", patterns: [/\bworship\b/i, /\bliturg/i] },
  { area: "church-music", patterns: [/\bchurch music\b/i, /\bsacred music\b/i, /\bpastoral music\b/i] },
  { area: "pastoral-care-counseling", patterns: [/\bpastoral care\b/i, /\bpastoral counsel/i, /\bpastoral theology\b/i, /\bpsychology and religion\b/i, /\bspiritual care\b/i, /\bcommunal care\b/i] },
  { area: "practical-theology", patterns: [/\bpractical theology\b/i, /\bpractice of ministry\b/i, /\bpractical ministry\b/i, /\bintern program\b/i, /\bcontextual education\b/i, /\bministerial formation\b/i] },
  { area: "congregational-leadership", patterns: [/\bcongregational\b/i, /\bchurch administration\b/i, /\bpastoral ministry and leadership\b/i, /\bleadership\b/i] },
  { area: "evangelism-church-planting", patterns: [/\bevangelis/i, /\bchurch plant/i, /\bfresh expressions\b/i] },
  { area: "christian-education-formation", patterns: [/\bchristian education\b/i, /\breligion education\b/i, /\breligious education\b/i, /\bfaith formation\b/i, /\breligion and education\b/i, /\byouth education\b/i] },
  { area: "youth-ministry", patterns: [/\byouth ministry\b/i, /\byouth and children/i, /\byouth education\b/i] },
  { area: "chaplaincy", patterns: [/\bchaplain/i] },
  { area: "black-church-studies", patterns: [/\bblack church\b/i, /\bafricana\b/i, /\bblack religious\b/i, /\bafrican american\b/i] },
  { area: "latino-hispanic-ministry", patterns: [/\bhispanic\b/i, /\blatin[oax]\b/i, /\bchristianity and cultures\b/i] },
  // NOT /gender/: "Carpenter Initiative on Gender, Sexuality, and Justice" is a
  // justice centre, not a womanist or feminist theology post. The rule fired on
  // it and was wrong.
  { area: "womanist-feminist-theology", patterns: [/\bwomanist\b/i, /\bfeminist\b/i] },
  { area: "religion-and-science", patterns: [/\bscience/i, /\btheology and the sciences\b/i] },
  { area: "interreligious", patterns: [/\binterreligious\b/i, /\binterfaith\b/i, /\bcomparative (religion|theology)\b/i, /\bworld religions\b/i, /\bjewish studies\b/i] },
  { area: "spiritual-formation", patterns: [/\bspiritual (formation|direction|resources|disciplines)\b/i, /\bspirituality\b/i] },
  // NOT bare /justice/: too many centre names contain it incidentally.
  { area: "mission-social-justice", patterns: [/\bsocial justice\b/i, /\btheology and justice\b/i, /\bpeacebuilding\b/i, /\bconflict transformation\b/i] },
];

// Strip the donor half of an endowed title so we never match on a person's name.
// "The Right Rev. Sam B. Hulsey Professor of Hebrew Bible" → "Professor of Hebrew Bible"
export function stripEndowment(title: string): string {
  return title
    .replace(/^.*?\b(Professor|Chair|Lecturer|Instructor|Dean|Librarian)\b/i, "$1")
    .trim();
}

export function suggestAreas(title: string, extra: string[] = []): StudyArea[] {
  const haystack = [stripEndowment(title), ...extra].join(" · ");
  let hits: StudyArea[] = [];
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) hits.push(rule.area);
  }

  // "Biblical Studies" claims both testaments — but only when the title does
  // not already name one. Gregory Cuéllar is "Full Professor of Hebrew Bible
  // and the Ruth A. Campbell Chair of Biblical Studies": an Old Testament
  // scholar whose chair happens to be named broadly. Claiming New Testament
  // for him would put him in front of someone searching for a Gospels teacher.
  if (/\bbiblical studies\b/i.test(haystack)) {
    const ot = /\bold testament\b|\bhebrew bible\b/i.test(haystack);
    const nt = /\bnew testament\b|\bchristian origins\b/i.test(haystack);
    if (ot && !nt) hits = hits.filter((a) => a !== "new-testament");
    if (nt && !ot) hits = hits.filter((a) => a !== "hebrew-bible");
  }

  return hits;
}

export const ruleCount = RULES.length;
