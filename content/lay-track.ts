import type { LadderStage } from "./types";

// The Lay Servant Ministries track: three certifications a layperson can
// hold, each a complete step rather than a mandatory rung toward the next.
// Rendered on its own page (/lay-ministry) rather than folded into the main
// ordination ladder, so it can be read as a whole path in its own right.

export const layTrack: LadderStage[] = [
  {
    id: "lay-servant",
    order: 1,
    name: "Certified lay servant",
    track: "lay",
    trackLabel: "Where every lay leader begins",
    summary:
      "The entry certification: trained to lead, care for, and speak within your own church and community.",
    whatItIs: [
      "You are a professing member (or baptized participant of a recognized UM ministry setting) who wants to serve — no prior credential needed to start.",
      "You complete the Basic Course: Ministry of the Baptized, Leading, Caring, Communicating, and Into the World.",
      "Certification is renewed by an advanced course roughly every three years, so the training keeps growing with you.",
    ],
    requirements: [
      "Complete the Basic Course, offered by your district or conference Committee on Lay Servant Ministries.",
      "Recommendation from your pastor and charge conference.",
    ],
    whoToTalkTo: "Your pastor and your conference's director of Lay Servant Ministries.",
    disciplineRefs: ["¶266"],
  },
  {
    id: "lay-speaker",
    order: 2,
    name: "Certified lay speaker",
    track: "lay",
    trackLabel: "Pulpit supply",
    summary:
      "Built on the lay servant certification: authorized to preach when a pastor, DS, or committee requests it.",
    whatItIs: [
      "You've already served as a certified lay servant and completed a track of study on leading worship, preaching, and United Methodist heritage and polity.",
      "You interview with your district committee on Lay Servant Ministries for recommendation to the conference committee.",
      "This is the certification behind most \"pulpit supply\" in a district — filling a pulpit when a church has no pastor available.",
    ],
    requirements: [
      "Certified lay servant status.",
      "Recommendation from your pastor and church council or charge conference.",
      "Completed track of study; interview with the district committee.",
    ],
    whoToTalkTo: "Your district committee on Lay Servant Ministries.",
    disciplineRefs: ["¶267"],
  },
  {
    id: "certified-lay-minister",
    order: 3,
    name: "Certified lay minister (CLM)",
    track: "lay",
    trackLabel: "A lay path that may be the whole calling",
    summary:
      "The fullest lay certification: assigned by a district superintendent to provide ongoing congregational leadership.",
    whatItIs: [
      "A CLM is called and equipped to conduct public worship, care for the congregation, assist in program leadership, develop new and existing faith communities, and preach the Word — without seeking ordination.",
      "The Discipline explicitly names developing new faith communities and community outreach ministries as CLM work — the same early-Methodist pattern of a lay-led class meeting or society before a pastor was ever appointed.",
      "A CLM is not a clergy member, is not itinerant, and is not part of the pension and compensation structure that supports elders and deacons — which is part of why this can be the right shape for planting or sustaining a small or new community.",
    ],
    requirements: [
      "Certified lay servant status, with training and examination by your district committee.",
      "Assignment by your district superintendent to a specific ministry setting.",
    ],
    whoToTalkTo: "Your district superintendent, once your district committee has certified you.",
    disciplineRefs: ["¶268"],
  },
];

export const layTrackById = Object.fromEntries(layTrack.map((s) => [s.id, s]));
