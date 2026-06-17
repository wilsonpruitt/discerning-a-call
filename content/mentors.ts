import type { MentorGuide } from "./types";

// Content for the mentor module (/mentors). This complements GBHEM's official
// role definition (Book of Discipline ¶349; BOM Handbook ch. 7) and the Mentor
// Guide in "Answering the Call: Candidacy Guidebook" — it does not replace the
// training a Board of Ordained Ministry provides. The aim is the practical
// "how" of accompaniment, adapted to life stage. Tone: bias-to-Yes, honest,
// never gatekeeping. Discernment belongs to the candidate; certification to the
// district Committee on Ordained Ministry. The mentor walks alongside.

export const mentorGuide: MentorGuide = {
  intro: [
    "Someone has trusted you with a fragile, important sentence: “I think God might be calling me.” Maybe a district has formally assigned you as a candidacy mentor. Maybe you're a pastor a young person looks up to, or simply the person they came to. Either way, you don't have to have the answers. You have to make room.",
    "The United Methodist Church gives mentors a real and named role in discernment — and it draws a careful line around it. Here is what that role asks of you, and, just as importantly, what it does not.",
  ],

  whoFor: [
    "A candidacy mentor formally assigned by your district and trained by the Board of Ordained Ministry.",
    "A supervising pastor or staff member walking with someone exploring a call.",
    "Anyone a person has trusted with the question — a small-group leader, a chaplain, a friend in ministry.",
  ],

  isNot: [
    "A supervisor or a boss",
    "An evaluator who decides their future",
    "An expert with all the answers",
    "A counselor or therapist",
    "“just a friend”",
  ],
  is: [
    "A co-discerner who explores the question alongside them",
    "A consultant they can think out loud with",
    "A catalyst who helps growth happen — then gets out of the way",
  ],
  boundaryNote:
    "This line is deliberate. In the UMC, mentoring is kept separate from the evaluative and supervisory process. The district Committee on Ordained Ministry decides; you accompany. That separation is exactly what frees a candidate to be honest with you — doubts and all — without it counting against them. Guard it.",

  lenses: [
    {
      title: "Scripture",
      body: "Help them hold the call up to the biblical witness — how Scripture speaks of calling, of ministry, and of the unlikely people God has used. Not as proof-texting, but as a mirror.",
    },
    {
      title: "The reality of ministry",
      body: "Tell the truth about the shape of clergy life, not the romance of it — the joys and the costs, itineracy, bivocational realities, the ordinary Tuesday. A call tested against the real thing is a stronger call.",
    },
    {
      title: "Gifts and graces",
      body: "Name honestly where they are gifted and where they will need to grow. Gifts are confirmed by a community, not just felt in private — help them hear what others see.",
    },
    {
      title: "Leadership",
      body: "Notice how they actually lead and are led in real settings, and how people respond to them. Discernment is not only inward; it shows up in a room.",
    },
  ],

  covenantIntro:
    "Early on, make a covenant together — written, signed by everyone including you, and revisited at the start of your meetings. It is a small act that names how you will be with one another, and it sets the whole relationship on trust.",
  covenant: [
    {
      title: "Presence",
      body: "Regular, reliable showing-up. Discernment needs continuity; the relationship is built in the meetings you keep.",
    },
    {
      title: "Prayer",
      body: "Praying with and for one another. This is the engine, not the garnish — you are listening for God together.",
    },
    {
      title: "Hospitality",
      body: "Openness to everyone, a space free of judgment. People share the true thing only where they feel safe.",
    },
    {
      title: "Confidentiality",
      body: "What is shared stays held — and, crucially, you will put nothing in your report to the committee that they have not first read and approved.",
    },
  ],

  rhythm: [
    {
      title: "Open with prayer",
      body: "A devotion or meditation. Lead it yourself at first; invite others to take a turn as trust grows.",
    },
    {
      title: "Check in",
      body: "Where is each person right now? Let the answers be more than “fine.” This is where the real work often surfaces.",
    },
    {
      title: "Discuss",
      body: "Work through the reading or the question at hand — a chapter of the candidacy guidebook, or whatever they're wrestling with. Ask more than you tell.",
    },
    {
      title: "Touch the process",
      body: "Check on practical progress — dates, forms, deadlines, the next step — and answer questions. Let them know you're available between meetings.",
    },
    {
      title: "Close",
      body: "A brief reflection and a closing prayer or ritual. End the way you began: in God's presence, not in a to-do list.",
    },
  ],

  report: [
    "At the end of the process you write a one-page report introducing each person to the district Committee on Ordained Ministry — their self-awareness, their gifts for ministry, how they articulate their call, and the faith journey you have witnessed.",
    "But they read it, sign it, and talk it through with you before it ever reaches the committee. Nothing in it is a surprise. That consent is not a formality — it is the heart of the trust the whole relationship is built on.",
  ],

  groupVsOneOnOne: [
    "The UMC's preferred shape is a candidacy group — a small circle discerning together. Companionship surfaces things solitude cannot, and a candidate hears their own call more clearly among others testing theirs.",
    "Where a group isn't possible, one-on-one mentoring carries the same covenant and the same rhythm. Either way, the work is the same: making room.",
  ],

  lifeStageNotes: [
    {
      stage: "youth",
      label: "Youth",
      body: "They may be testing an idea more than making a decision. Protect their freedom to say “not now” without it feeling like failure — the call can wait for them to grow into it.",
    },
    {
      stage: "college",
      label: "College",
      body: "Vocation is one of many big questions colliding at once. Help them separate “called to ministry” from “called to this major, this relationship, this city.”",
    },
    {
      stage: "young-adult",
      label: "Young adult",
      body: "Often weighing a call against an established career, debt, or a young family. Be honest about cost and timing, and don't rush a decision that has to hold weight.",
    },
    {
      stage: "second-career",
      label: "Second career",
      body: "They bring deep gifts and a lifetime of experience. The task is often translating that into the church's categories — and naming, gently, what they don't yet know.",
    },
    {
      stage: "in-seminary",
      label: "In seminary",
      body: "They're already moving. Your role shifts toward integration — connecting the classroom to the call, and tending the soul that academic formation can crowd out.",
    },
  ],

  trainingIntro:
    "If you are serving as a formal candidacy mentor, your Board of Ordained Ministry trains and assigns you — usually through your conference's Vocational Discernment Coordinator. This page doesn't replace that training; it helps you walk well between the meetings. A few things worth knowing:",
  training: [
    {
      title: "Answering the Call: Candidacy Guidebook",
      body: "The official GBHEM study guide you and the candidate work through. Its Mentor Guide (Appendix A) walks you meeting-by-meeting; this page is the spirit of that, in brief.",
    },
    {
      title: "Training every four years",
      body: "Candidacy mentors are trained at least once each quadrennium so the candidacy, licensing, and ordination requirements stay current. Ask your conference when the next training is.",
    },
    {
      title: "The Book of Discipline",
      body: "¶349 defines the mentoring relationship and the two kinds of mentor (candidacy and clergy); ¶310 and following lay out the candidacy steps themselves.",
    },
    {
      title: "Your Vocational Discernment Coordinator",
      body: "The conference role that recruits, trains, and assigns mentors and runs group mentoring. They are your first contact and your best resource.",
    },
  ],
};
