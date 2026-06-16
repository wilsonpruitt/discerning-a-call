import type { Resource } from "./types";

// Resources for discernment — official tools, books, retreats, mentorship, and
// money. URLs should be checked periodically.

export const resources: Resource[] = [
  {
    id: "umcares",
    category: "official",
    title: "UMCARES — the candidacy system",
    by: "GBHEM",
    url: "https://www.gbhem.org/loans-scholarships/umcares/",
    blurb:
      "The official online system where United Methodist candidacy is tracked. Your candidacy mentor will help you enroll.",
  },
  {
    id: "explore-call",
    category: "official",
    title: "Explore your call to ministry",
    by: "GBHEM",
    url: "https://www.gbhem.org/ministry/explore-your-call-to-ministry/",
    blurb:
      "The denomination's overview of the steps toward licensed and ordained ministry.",
  },
  {
    id: "christian-as-minister",
    category: "book",
    title: "The Christian as Minister",
    by: "GBHEM",
    url: "https://www.cokesbury.com/",
    blurb:
      "The standard entry book for candidacy — an overview of the forms of UMC ministry and the questions you will be asked to reflect on.",
  },
  {
    id: "listening-hearts",
    category: "book",
    title: "Listening Hearts: Discerning Call in Community",
    by: "Suzanne G. Farnham et al.",
    blurb:
      "A gentle, time-tested guide to testing a call in the company of others rather than alone.",
    forStages: ["college", "young-adult", "second-career", "in-seminary"],
  },
  {
    id: "let-your-life-speak",
    category: "book",
    title: "Let Your Life Speak",
    by: "Parker J. Palmer",
    blurb:
      "On vocation as something you listen for rather than manufacture. Good for anyone wrestling with “is this really me?”",
  },
  {
    id: "exploration",
    category: "retreat",
    title: "Exploration",
    by: "GBHEM",
    url: "https://www.gbhem.org/",
    blurb:
      "A biennial denomination-wide discernment event for young adults (roughly 18–26) considering ordained ministry.",
    forStages: ["college", "young-adult"],
  },
  {
    id: "wesley-foundation",
    category: "mentorship",
    title: "Campus ministry & Wesley Foundations",
    blurb:
      "United Methodist campus ministries are often the first place a college call is named and nurtured. Find the one nearest your school.",
    forStages: ["college"],
  },
  {
    id: "candidacy-mentor",
    category: "mentorship",
    title: "Your candidacy mentor",
    blurb:
      "Once you enter the process, you are paired with a trained mentor who walks with you through the studies and the questions. This relationship is the heart of formal discernment.",
  },
  {
    id: "spiritual-director",
    category: "mentorship",
    title: "A spiritual director",
    blurb:
      "Apart from any official role, a spiritual director offers a confidential space to listen for God over the long haul. Many conferences can help you find one.",
  },
  {
    id: "mef",
    category: "financial",
    title: "Ministerial Education Fund (MEF)",
    by: "GBHEM",
    url: "https://www.gbhem.org/loans-scholarships/",
    blurb:
      "Apportioned funds that support seminary education for United Methodist candidates. Ask your conference how to access your share.",
  },
  {
    id: "umhef",
    category: "financial",
    title: "United Methodist Higher Education Foundation",
    url: "https://www.umhef.org/",
    blurb:
      "Scholarships for United Methodist students, including those preparing for ministry.",
  },
];
