import type { LadderStage } from "./types";

// The United Methodist path toward licensed or ordained ministry, told as a
// ladder. Structure follows the Book of Discipline; paragraph references are
// given as a courtesy and should be confirmed with your own conference, since
// General Conference revises them and annual conferences add their own steps.

export const ladder: LadderStage[] = [
  {
    id: "exploring",
    order: 1,
    name: "Exploring the call",
    track: "shared",
    trackLabel: "Everyone starts here",
    summary:
      "You sense something. You name it out loud to a pastor and begin to test it in community.",
    whatItIs: [
      {
        text: "Read The Christian as Minister. It is the book candidacy is built on, and nothing stops you from reading it now — it lays out the forms of United Methodist ministry and asks the questions you will be asked later.",
        link: {
          label: "Find it at Cokesbury",
          url: "https://www.cokesbury.com/The-Christian-as-Minister-2",
        },
      },
      "There is no form to file yet. This stage is about honesty and conversation.",
      "Tell your pastor you are wondering about a call. Ask them to walk with you.",
      "Pray, serve, and pay attention to where you come alive and where the church affirms you.",
    ],
    whoToTalkTo:
      "Your home pastor first. They are your doorway into everything that follows.",
  },
  {
    id: "inquiring",
    order: 2,
    name: "Inquiring candidate",
    track: "shared",
    trackLabel: "Entering the process",
    summary:
      "You formally begin candidacy: you contact your district superintendent and are paired with a candidacy mentor.",
    whatItIs: [
      "You write to your district superintendent (DS) to declare your candidacy.",
      "You enroll in the candidacy process and are assigned a trained candidacy mentor who meets with you over several months.",
      "You work back through The Christian as Minister with your mentor, plus the candidacy studies, reflecting on call, gifts, and the forms of ministry.",
    ],
    requirements: [
      "Be a professing member of a United Methodist church (typically for at least one year).",
      "Contact your district superintendent in writing.",
      "Begin the candidacy process and meet regularly with your candidacy mentor.",
    ],
    whoToTalkTo:
      "Your district superintendent, and the candidacy mentor you are assigned.",
    disciplineRefs: ["¶310"],
  },
  {
    id: "certified",
    order: 3,
    name: "Certified candidate",
    track: "shared",
    trackLabel: "Approved to go further",
    summary:
      "Your district committee approves you to continue. This is the first formal threshold.",
    whatItIs: [
      "You complete written work, a psychological assessment, and a background and credit check.",
      "Your charge conference (church council) recommends you.",
      "Your district Committee on Ordained Ministry (dCOM) interviews you and certifies you as a candidate.",
    ],
    requirements: [
      "Written responses to the candidacy questions, reviewed with your mentor.",
      "Psychological assessment, background check, and credit check.",
      "Recommendation by your charge conference.",
      "Approval by the district Committee on Ordained Ministry.",
    ],
    whoToTalkTo:
      "Your candidacy mentor and your district Committee on Ordained Ministry.",
    disciplineRefs: ["¶310"],
  },
  {
    id: "licensed",
    order: 4,
    name: "Licensed local pastor",
    track: "licensed",
    trackLabel: "One track forward",
    summary:
      "If you are appointed to serve a congregation before completing seminary, you are licensed and complete the Course of Study.",
    whatItIs: [
      "You complete Licensing School and are licensed for pastoral ministry while serving under appointment.",
      "You pursue the five-year Course of Study (or a Master of Divinity) over time.",
      "Many second-career pastors serve faithfully for decades on this track without ever seeking ordination — and that is a complete vocation.",
    ],
    requirements: [
      "Certified candidate status.",
      "Completion of Licensing School.",
      "Appointment by the bishop to a ministry setting.",
    ],
    whoToTalkTo:
      "Your district superintendent and the Board of Ordained Ministry's local pastor registrar.",
    disciplineRefs: ["¶311", "¶315"],
  },
  {
    id: "provisional",
    order: 5,
    name: "Provisional (commissioned) member",
    track: "ordained",
    trackLabel: "The ordained track",
    summary:
      "After seminary and Board approval, you are commissioned and serve a residency of two to three years.",
    whatItIs: [
      "You complete a Master of Divinity (or the educational requirements for your track) and the Board's required studies.",
      "The Board of Ordained Ministry examines and approves you; the clergy session votes; the bishop commissions you.",
      "You serve a provisional residency under mentorship before being considered for ordination.",
    ],
    requirements: [
      "Certified candidate status, usually for at least one year.",
      "Master of Divinity or equivalent (with some hours from a UMC-approved seminary).",
      "Approval by the Board of Ordained Ministry and the clergy session.",
    ],
    whoToTalkTo: "The Board of Ordained Ministry and your residency mentor.",
    disciplineRefs: ["¶324", "¶325"],
  },
  {
    id: "elder",
    order: 6,
    name: "Ordained elder",
    track: "ordained",
    trackLabel: "Ordained · Word, Sacrament, Order, Service",
    summary:
      "Elders are “ordained to a lifetime ministry of Word, Sacrament, Order, and Service” (¶332), appointed itinerantly across the conference.",
    whatItIs: [
      "Elders preach, preside at the sacraments, and lead congregations and ministries.",
      "They are itinerant — they “offer themselves without reserve to be appointed and to serve... as the appointive authority may determine” (¶333).",
      "After at least two years as a provisional member, the Board recommends you, the clergy session votes by three-fourths majority, and you are ordained and received into full connection.",
    ],
    requirements: [
      "At least two years of effective service as a provisional member.",
      "Three-fourths-majority approval by the Board of Ordained Ministry and the clergy session.",
    ],
    whoToTalkTo: "The Board of Ordained Ministry.",
    disciplineRefs: ["¶332", "¶335"],
  },
  {
    id: "deacon",
    order: 6,
    name: "Ordained deacon",
    track: "ordained",
    trackLabel: "Ordained · Word, Service, Compassion, Justice",
    summary:
      "Deacons are “ordained by a bishop to a lifetime ministry of Word, Service, Compassion, and Justice... in a ministry that connects” church and world (¶329).",
    whatItIs: [
      "Deacons lead in ministries of compassion, justice, teaching, music, chaplaincy, and more — building bridges between worship and the world.",
      "They are not itinerant in the same way elders are; deacons often seek out and hold their own appointments.",
      "The educational path allows a Master of Divinity or a professional degree plus required theological study.",
    ],
    requirements: [
      "At least two years of effective service as a provisional member.",
      "Three-fourths-majority approval by the Board of Ordained Ministry and the clergy session.",
    ],
    whoToTalkTo: "The Board of Ordained Ministry's deacon registrar.",
    disciplineRefs: ["¶329", "¶330"],
  },
  {
    id: "lay",
    order: 2,
    name: "Lay servant & certified lay minister",
    track: "lay",
    trackLabel: "A lay path that may be the whole calling",
    summary:
      "Not every call leads to ordination. Lay Servant Ministries and the Certified Lay Minister track equip laypeople to lead, preach, and serve.",
    whatItIs: [
      "A certified lay servant is trained to “witness to the Christian faith through spoken communication, to lead within a church and community, and to provide caring ministry” (¶266).",
      "A certified lay minister is “called and equipped to conduct public worship, care for the congregation, assist in program leadership, develop new and existing faith communities, preach the Word,” and is assigned by a district superintendent (¶268).",
      "Many people who begin discerning ordination discover their truest calling is a lay one. The church needs this no less.",
    ],
    whoToTalkTo:
      "Your pastor and your conference's director of Lay Servant Ministries.",
    disciplineRefs: ["¶266", "¶268"],
  },
];

export const ladderById = Object.fromEntries(ladder.map((s) => [s.id, s]));
