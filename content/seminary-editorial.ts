import type { SeminaryEditorial } from "./types";

// The hand-written layer. A re-harvest never touches this file.
//
// Everything here is Wilson's voice, not the school's and not a machine's.
// Entries marked `draft: true` were drafted from harvested material and have
// NOT had a human pass yet — the page renders a notice saying so. Clear the
// flag only after reading it and making it yours.

export const seminaryEditorial: SeminaryEditorial[] = [
  {
    slug: "perkins",
    draft: true,
    lead: "Perkins is the South Central Jurisdiction's home seminary, and for most of Rio Texas it is the school people mean when they say seminary. It sits inside SMU in Dallas, which means a divinity school with a research university's library and departments around it. Its most useful feature for someone still serving a church is geographic: the in-person requirement can be met in Houston, Galveston, or wherever else enough students happen to live, rather than only in Dallas.",
    distinctives: [
      "The M.Div. is now offered in Spanish — fully in Spanish for two years, then optionally bilingual, with the first cohort starting fall 2026.",
      "Perkins runs the regional Course of Study school for licensed local pastors, in English and in Spanish, so the licensed and ordained routes are administered under one roof.",
      "Twenty-four of the seventy-five M.Div. hours are unrestricted electives — an unusually large amount of room to shape, and an unusually large amount of room to waste.",
      "CASA and the Black/Africana Church Studies program are named centers with faculty attached, not just course labels.",
    ],
    whoThrivesHere: [
      "People already serving an appointment in Texas who need in-person coursework to come to them.",
      "Spanish-speaking candidates, who now have a route that does not require studying in a second language.",
      "People who want a research university's resources next door and will actually use them.",
    ],
    weighThat: [
      "The elective block is the whole game. Six of the nine ¶324.4 areas are handled by the core; United Methodist studies and evangelism are not. Nobody stops you from spending twenty-four hours elsewhere and arriving at your board short.",
      "Tuition is quoted per credit hour, and the general student fee is charged per credit hour on top of it. The number you first see is not the number you pay.",
      "Perkins says its scholarship funds go first-come, first-served, and the admission application is the scholarship application. Applying late costs money in a way that isn't advertised.",
    ],
  },
  {
    slug: "austin-presbyterian",
    draft: true,
    lead: "Austin Seminary is Presbyterian, and a United Methodist candidate may attend it — the University Senate has approved it for ordination coursework. People choose it for reasons that are usually good ones: they already live in Austin, they know somebody on the faculty, or they want the public-theology emphasis and the University of Texas across town. The thing to be clear-eyed about is that a Presbyterian seminary has no reason to teach United Methodist doctrine and polity, and does not. That is a solvable problem, but only if you solve it early.",
    distinctives: [
      "Seven of the nine ¶324.4 areas sit inside the required M.Div. curriculum — better coverage than some United Methodist schools manage.",
      "Non-Presbyterian students take a one-language track rather than two, which is a real difference in workload.",
      "The M.Div./MSSW with UT Austin is genuine cross-registration: approved social work courses satisfy M.Div. electives.",
      "Austin publishes its federal loan default rate, 3.7%. Almost no seminary volunteers that number.",
      "Ángel Gallardo teaches church history here and taught at Perkins before that — he teaches a course on Methodism, and is the obvious first person to ask about the gap.",
    ],
    whoThrivesHere: [
      "People already rooted in Austin who would have to uproot a family to attend a United Methodist school.",
      "People drawn to public theology — justice, immigration, ecology, race — where the faculty's strength genuinely is.",
      "People pursuing social work, counselling, or advocacy alongside ministry, where the UT dual degree does real work.",
    ],
    weighThat: [
      "United Methodist studies is the gap, and it is six semester hours. Nothing about the degree closes it for you.",
      "The required church history course stops at 1650, so it does not touch Wesley.",
      "No online or distance class taken here counts toward ordination. That rule is GBHEM's, not the school's, and Austin has no reason to warn you about it.",
      "Compare costs carefully — Austin's own pages describe the M.Div. as 180 credits in one place and 78 in another, using different units. Ask for a total, not a rate.",
    ],
  },
];

export const seminaryEditorialBySlug = Object.fromEntries(
  seminaryEditorial.map((e) => [e.slug, e]),
) as Record<string, SeminaryEditorial | undefined>;
