import type { ConferencePack } from "./types";

// Conference packs layer local on-ramps on top of the universal content.
// Rio Texas is pack #1. Add more by appending to this array — pages and the
// path-finder pick them up automatically.

export const conferences: ConferencePack[] = [
  {
    slug: "rio-texas",
    name: "Rio Texas Annual Conference",
    region: "Central & South Texas",
    intro: [
      "Rio Texas is the United Methodist annual conference covering much of central and south Texas, from the Hill Country to the border.",
      "Wherever you are in your discernment, the conference's formal on-ramp begins with the Candidacy Summit.",
    ],
    onRamps: [
      {
        title: "Candidacy Summit",
        body: "A required six-hour gathering for anyone exploring licensed or ordained ministry. It introduces the candidacy process, the conference's leadership, and your peers — and forms the mentoring group you will continue with.",
        when: "Offered periodically (e.g., August in San Antonio); a January and later summer session also recur. Watch for application deadlines roughly three to four weeks before.",
        cost: "$200, with the application, a statement of call, ministry-involvement documentation, and Safe Ministry certification. A credit check and disclosure forms are brought to the summit.",
        link: "https://riotexas.org/candidacy-summit",
      },
      {
        title: "Group Candidacy Mentoring",
        body: "After the summit, you join a small group that meets over five sessions (via Zoom) for prayerful reflection, conversation, and communal discernment. This is the second half of the conference's two-part candidacy pathway.",
      },
    ],
    contacts: [
      {
        name: "Rev. Adrienne Zermeño",
        role: "Vocational Discernment Coordinator",
        email: "azermeno@riotx.org",
      },
      {
        name: "Eve Albert",
        role: "Candidacy Summit applications",
        email: "evealbert@riotx.org",
      },
    ],
    localNotes: [
      "Perkins School of Theology (SMU, Dallas) is the seminary closest to home for many Rio Texas candidates, with a Houston-Galveston extension.",
      "Details here are drawn from the conference's public candidacy page and may change — confirm dates and costs with the conference office.",
    ],
    source: "riotexas.org/candidacy-summit",
  },
];

export const conferenceBySlug = Object.fromEntries(
  conferences.map((c) => [c.slug, c]),
);
