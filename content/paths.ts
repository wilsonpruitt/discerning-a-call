import type { LifeStagePath } from "./types";

// The five life-stage paths — the spine of the product. Each meets a person
// where they actually are, because a fourteen-year-old at an altar call and a
// forty-seven-year-old engineer are not on the same road, even if they end up
// at the same place.

export const paths: LifeStagePath[] = [
  {
    slug: "youth",
    name: "Youth",
    cardLabel: "I'm in middle or high school",
    ageHint: "Middle & high school",
    tagline: "You came forward. That took courage — and you are not alone.",
    intro: [
      "Maybe you came forward at a service, or maybe the thought just won't leave you alone. Either way: thank you for paying attention to it.",
      "Nobody expects you to have this figured out. The goal right now is not to sign you up for anything. It is to help you keep listening, with people who are glad you're here.",
    ],
    realities: [
      {
        title: "Your timeline is long, and that's good",
        body: "Someone who comes forward at fourteen may not engage seriously until twenty-two. That is not falling behind — that is discernment. There is no clock.",
      },
      {
        title: "Your family belongs in this",
        body: "Your parents or guardians are not an obstacle to get around. The best version of this includes them — so tell them, and let the church talk with them too.",
      },
      {
        title: "You can't make a wrong move here",
        body: "Exploring a call is not a promise to become a pastor. You are allowed to wonder, to change your mind, and to wonder again.",
      },
    ],
    firstSteps: [
      {
        title: "Tell your pastor or youth leader",
        body: "Say out loud, to one trusted adult at your church, that you're wondering about a call. That single conversation is the real first step.",
      },
      {
        title: "Read The Christian as Minister",
        body: "It's the book every United Methodist candidate works through, and no one has to give you permission to read it. Ask your pastor for a copy — it will show you what the different kinds of ministry actually are.",
        link: {
          label: "Find it at Cokesbury",
          url: "https://www.cokesbury.com/The-Christian-as-Minister-2",
        },
      },
      {
        title: "Tell your family",
        body: "Let your parents or guardians know you came forward. You don't have to have answers — just let them walk with you.",
      },
      {
        title: "Stay close to your church",
        body: "Keep showing up. Serve where you can — worship, missions, helping with younger kids. Notice where you feel most alive.",
      },
      {
        title: "Ask about a discernment gathering",
        body: "Many conferences host events for young people exploring ministry. Ask your pastor whether yours does, and whether you can go.",
        optional: true,
      },
    ],
    watchFor: [
      "Don't let anyone rush you, and don't rush yourself.",
      "If a year goes by quietly, that's okay. The call keeps.",
      "Write down what draws you now — you'll want to read it again in ten years.",
    ],
    timeline:
      "Think in years, not months. The point of this season is faithfulness, not a finish line.",
    ladderStageIds: ["exploring"],
    resourceIds: ["let-your-life-speak"],
    formIds: ["elder", "deacon", "lay"],
  },
  {
    slug: "college",
    name: "College student",
    cardLabel: "I'm in college",
    ageHint: "Undergraduate years",
    tagline: "A season to explore widely before you narrow anything down.",
    intro: [
      "College is one of the most common places a call gets named — often through campus ministry, a mission trip, or a late-night conversation that won't let go.",
      "You don't have to choose between exploring a call and the rest of your life. This is exactly the season to test it without committing to it.",
    ],
    realities: [
      {
        title: "You do not need a religion major",
        body: "Plenty of pastors studied biology, business, or music. What matters more is staying connected to a community that can help you listen.",
      },
      {
        title: "Campus ministry is your nearest companion",
        body: "A Wesley Foundation or campus minister can be the single most helpful relationship you have right now — start there.",
      },
      {
        title: "Exploring is not deciding",
        body: "You can begin learning about candidacy without entering it. You can visit a seminary without enrolling. Curiosity costs nothing.",
      },
    ],
    firstSteps: [
      {
        title: "Read The Christian as Minister",
        body: "The standard GBHEM entry book for candidacy. Read it now, before any paperwork — it names the forms of United Methodist ministry and asks the questions a district committee will eventually ask you.",
        link: {
          label: "Find it at Cokesbury",
          url: "https://www.cokesbury.com/The-Christian-as-Minister-2",
        },
      },
      {
        title: "Find your campus minister",
        body: "Connect with the Wesley Foundation or United Methodist campus ministry at or near your school. If there isn't one, your home pastor can help you find a guide.",
      },
      {
        title: "Talk with your home pastor over a break",
        body: "Tell the pastor who knows you best that you're discerning. Ask them what they noticed in you that you might not see.",
      },
      {
        title: "Go to a discernment event",
        body: "GBHEM's Exploration event and conference gatherings are built for exactly your stage. They are a low-stakes way to meet others on the same road.",
        optional: true,
      },
      {
        title: "Learn what the paths actually are",
        body: "Read about elders, deacons, local pastors, and lay ministry, so the words people use stop being a fog.",
      },
    ],
    watchFor: [
      "Don't pick a major out of fear; pick what forms you well.",
      "If seminary is on your mind, you can start visiting now — most love prospective students.",
      "Beware of deciding alone. Calls are tested in community.",
    ],
    timeline:
      "Use these years to explore broadly. Formal candidacy can begin now or wait until after graduation.",
    ladderStageIds: ["exploring", "inquiring"],
    resourceIds: ["wesley-foundation", "exploration", "listening-hearts"],
    formIds: ["elder", "deacon", "chaplaincy", "lay"],
  },
  {
    slug: "young-adult",
    name: "Young adult",
    cardLabel: "I'm out of school, early in my work life",
    ageHint: "Twenties & thirties",
    tagline: "Old enough to begin in earnest, young enough to take the long way.",
    intro: [
      "You're past school and into the working world, and the call has either resurfaced or never left. Now the questions get concrete: which form of ministry, how to afford seminary, whether to keep your job.",
      "This is a season where formal candidacy genuinely makes sense — and where you can shape it around the life you already have.",
    ],
    realities: [
      {
        title: "Elder or deacon is a real question now",
        body: "The difference matters: elders are itinerant and sacramental; deacons bridge church and world and often hold their own appointments. It's worth sitting with both.",
      },
      {
        title: "You may not have to quit your job",
        body: "Bivocational and local-pastor paths let many people serve while still working. Seminary itself is increasingly hybrid and online.",
      },
      {
        title: "Starting the process gives you companions",
        body: "Entering candidacy pairs you with a mentor and a group. You stop carrying the question by yourself.",
      },
    ],
    firstSteps: [
      {
        title: "Read The Christian as Minister",
        body: "The standard GBHEM entry book for candidacy, and the cheapest way to find out what you'd actually be signing up for. Read it before you write the letter, not after.",
        link: {
          label: "Find it at Cokesbury",
          url: "https://www.cokesbury.com/The-Christian-as-Minister-2",
        },
      },
      {
        title: "Talk with your pastor and your district superintendent",
        body: "Your pastor opens the door; a letter to your district superintendent formally begins candidacy.",
      },
      {
        title: "Register for your conference's candidacy entry point",
        body: "Most conferences have a summit, orientation, or intake gathering. In Rio Texas, that's the Candidacy Summit.",
      },
      {
        title: "Compare elder, deacon, and local pastor honestly",
        body: "Read the forms of ministry and notice which description makes your chest tighten with recognition.",
      },
      {
        title: "Map the money before you commit",
        body: "Look at the Ministerial Education Fund and seminary aid now, so finances inform the path rather than ambushing it.",
        optional: true,
      },
    ],
    watchFor: [
      "Don't assume seminary means moving and quitting — ask about hybrid options first.",
      "If you're partnered, bring them into the discernment early; this shapes a household, not just a career.",
      "It's normal for the elder/deacon question to take a year to settle.",
    ],
    timeline:
      "From entering candidacy to ordination is typically several years. Beginning now, in earnest, is reasonable.",
    ladderStageIds: ["inquiring", "certified", "provisional", "elder", "deacon"],
    resourceIds: ["umcares", "christian-as-minister", "mef", "candidacy-mentor"],
    formIds: ["elder", "deacon", "local-pastor", "chaplaincy"],
  },
  {
    slug: "second-career",
    name: "Second career",
    cardLabel: "I'm later in life or changing careers",
    ageHint: "Mid-life and beyond",
    tagline: "It is not too late. The church has always been led by the re-called.",
    intro: [
      "You've built a career, maybe a family, maybe a pension — and the call you set aside years ago has come back, or arrived for the first time. You are in good company. Many of the church's finest pastors came late and on purpose.",
      "Your path can honor the life you've already built rather than demanding you blow it up.",
    ],
    realities: [
      {
        title: "The local-pastor track was made for this",
        body: "Many second-career ministers are licensed local pastors who complete the Course of Study while serving — no residential degree required.",
      },
      {
        title: "Your experience is an asset, not a delay",
        body: "Congregations are hungry for leaders who have managed people, money, grief, and real work. You bring that to the table on day one.",
      },
      {
        title: "Family and finances belong in the discernment",
        body: "This is a household decision. Counting the cost honestly — time, income, location — is part of faithfulness, not a lack of faith.",
      },
    ],
    firstSteps: [
      {
        title: "Read The Christian as Minister",
        body: "The standard GBHEM entry book for candidacy. For a second-career call it does double duty: it lays out the forms of ministry — including the local-pastor route — so the conversation at home can be about something concrete.",
        link: {
          label: "Find it at Cokesbury",
          url: "https://www.cokesbury.com/The-Christian-as-Minister-2",
        },
      },
      {
        title: "Have the honest conversation at home",
        body: "Before anything official, talk with your spouse or family about what this could ask of all of you.",
      },
      {
        title: "Tell your pastor and district superintendent",
        body: "Name the call to your pastor, then write to your district superintendent to begin candidacy.",
      },
      {
        title: "Ask specifically about the local-pastor route",
        body: "If a full seminary degree isn't feasible, ask your conference about Licensing School and the Course of Study.",
      },
      {
        title: "Look at hybrid and Course of Study options",
        body: "Several UMC seminaries offer hybrid or online M.Div tracks; Course of Study schools are built around working pastors.",
        optional: true,
      },
    ],
    watchFor: [
      "Don't let the word “seminary” scare you off — ask about Course of Study first.",
      "Itineracy (for elders) may mean relocation; weigh that against family roots.",
      "Your age is not a disqualification. Name any fear about it out loud to your mentor.",
    ],
    timeline:
      "The local-pastor and Course of Study routes can begin quickly once you're certified. Plan in years, but you can start serving sooner than you think.",
    ladderStageIds: ["inquiring", "certified", "licensed", "lay"],
    resourceIds: ["christian-as-minister", "umcares", "mef"],
    formIds: ["local-pastor", "deacon", "lay", "elder"],
  },
  {
    slug: "in-seminary",
    name: "In seminary",
    cardLabel: "I'm already in seminary",
    ageHint: "Currently enrolled",
    tagline: "Studying is not the same as being credentialed — mind both tracks.",
    intro: [
      "You're already in a divinity school or seminary — perhaps you enrolled before sorting out candidacy, or you're testing the call by studying first. Either is fine, and more common than people admit.",
      "The thing to watch is that the academic track and the conference's candidacy track are two different processes. Your degree progress does not automatically advance your credentialing.",
    ],
    realities: [
      {
        title: "Your school and your conference are separate",
        body: "Seminary grants the degree; your annual conference grants the credentials. You have to tend both relationships deliberately.",
      },
      {
        title: "Candidacy has its own clock",
        body: "Boards expect certain steps (certification, Board approval) on their timeline, not your registrar's. Starting candidacy late can delay commissioning even with a degree in hand.",
      },
      {
        title: "Where you study can matter for credentials",
        body: "The UMC asks for some coursework from approved settings. If your school isn't a UMC seminary, confirm what your Board requires before you're surprised.",
      },
    ],
    firstSteps: [
      {
        title: "Read The Christian as Minister",
        body: "Yes, even in seminary. It's the candidacy text, not a theology text — your mentor will work through it with you, and reading it early keeps the process from lagging a year behind your degree.",
        link: {
          label: "Find it at Cokesbury",
          url: "https://www.cokesbury.com/The-Christian-as-Minister-2",
        },
      },
      {
        title: "Contact your home conference's Board now",
        body: "If you haven't entered candidacy, write to your district superintendent and begin — don't wait until you graduate.",
      },
      {
        title: "Map degree requirements against Board requirements",
        body: "Sit down with both lists side by side. Ask your Board's registrar what they require beyond the M.Div.",
      },
      {
        title: "Decide elder vs. deacon before residency",
        body: "Your courses, field education, and the Board's process all bend around this choice. Settle it with your mentor while you still have electives.",
      },
      {
        title: "Find your candidacy mentor and a field-ed setting that fits your call",
        body: "Let your placements test the form of ministry you think you're headed toward.",
        optional: true,
      },
    ],
    watchFor: [
      "A degree alone does not make you commissioned — start candidacy early.",
      "If your seminary isn't UMC-affiliated, verify your Board's coursework requirements now.",
      "Use field education to test the call, not just to check a box.",
    ],
    timeline:
      "Align your candidacy steps with your final year so commissioning can follow graduation without a gap.",
    ladderStageIds: ["certified", "provisional", "elder", "deacon"],
    resourceIds: ["umcares", "christian-as-minister", "candidacy-mentor"],
    formIds: ["elder", "deacon", "chaplaincy"],
  },
];

export const pathBySlug = Object.fromEntries(paths.map((p) => [p.slug, p]));
