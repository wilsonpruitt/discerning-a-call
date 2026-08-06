import type { Seminary } from "./types";

// The thirteen United Methodist seminaries (University Senate–approved), plus a
// note on Course of Study schools and the growing number of hybrid/online M.Div
// options. Modalities and program details change — always confirm with the
// school. Listed alphabetically.
//
// Roster last checked against GBHEM's Approved Schools of Theology page
// 2026-08-06 — see research/gbhem-approved-schools-snapshot.md.

export const seminaries: Seminary[] = [
  // --- Senate-approved, non–United Methodist. ¶324.4's gate is University
  // Senate approval, not ATS accreditation, and GBHEM's list runs to 24 schools
  // beyond the 13. They are a legitimate route with a different set of
  // constraints — chiefly that no online or distance class taken at one of them
  // counts toward the ordination requirement. Being added as profiles are built.
  {
    slug: "austin-presbyterian",
    name: "Austin Presbyterian Theological Seminary",
    city: "Austin",
    state: "TX",
    umcAffiliated: false,
    modalities: ["residential"],
    url: "https://www.austinseminary.edu/",
    note: "Senate-approved but not United Methodist: seven of the nine ¶324.4 areas are in the required M.Div., but United Methodist studies is not.",
  },

  {
    slug: "brite",
    name: "Brite Divinity School (Texas Christian University)",
    city: "Fort Worth",
    state: "TX",
    umcAffiliated: false,
    modalities: ["residential"],
    url: "https://brite.edu/",
    note: "Senate-approved but not United Methodist — yet it teaches UM history, doctrine, mission, and polity in house, with denominational approval.",
  },

  {
    slug: "phillips",
    name: "Phillips Theological Seminary",
    city: "Tulsa",
    state: "OK",
    umcAffiliated: false,
    modalities: ["residential", "hybrid", "online"],
    url: "https://ptstulsa.edu/",
    note: "The one school on the roster under University Senate Monitoring with Public Warning — still approved, but say the phrase to your registrar. All nine ¶324.4 areas are covered, and Phillips itself limits UM ordination-track students to in-residence courses.",
  },

  {
    slug: "vanderbilt",
    name: "Vanderbilt University Divinity School",
    city: "Nashville",
    state: "TN",
    umcAffiliated: false,
    modalities: ["residential"],
    url: "https://divinity.vanderbilt.edu/",
    note: "Methodist by origin, not by affiliation since 1914. Two chairs in Wesleyan Studies and three named UM courses — all electives, and Vanderbilt claims no denominational approval for them.",
  },

  // --- The thirteen United Methodist schools of theology ---
  {
    name: "Boston University School of Theology",
    city: "Boston",
    state: "MA",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    url: "https://www.bu.edu/sth/",
  },
  {
    slug: "candler",
    name: "Candler School of Theology (Emory University)",
    city: "Atlanta",
    state: "GA",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    courseOfStudy: true,
    url: "https://candler.emory.edu/",
    note: "Certified UMC candidates who apply by the priority deadline receive full tuition — but only four of the nine ¶324.4 areas are in the required curriculum.",
  },
  {
    name: "Claremont School of Theology",
    city: "Los Angeles",
    state: "CA",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    url: "https://cst.edu/",
    note: "Keeps the Claremont name, but relocated to Los Angeles in 2024 — the campus is on Wilshire Blvd.",
  },
  {
    name: "Drew University Theological School",
    city: "Madison",
    state: "NJ",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    url: "https://drew.edu/theological-school/",
  },
  {
    slug: "duke",
    name: "Duke Divinity School",
    city: "Durham",
    state: "NC",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    courseOfStudy: true,
    url: "https://divinity.duke.edu/",
    note: "Five of the nine ¶324.4 areas are in the core everyone takes; the other four Duke requires of United Methodist students specifically.",
  },
  {
    name: "Gammon Theological Seminary (Interdenominational Theological Center)",
    city: "Atlanta",
    state: "GA",
    umcAffiliated: true,
    modalities: ["residential"],
    url: "https://www.itc.edu/gammon/",
    note: "The historically Black UMC seminary, within the ITC consortium.",
  },
  {
    slug: "garrett",
    name: "Garrett Seminary",
    city: "Evanston",
    state: "IL",
    umcAffiliated: true,
    modalities: ["residential", "hybrid", "online"],
    courseOfStudy: true,
    url: "https://www.garrett.edu/",
    note: "Goes by Garrett Seminary now; Garrett-Evangelical Theological Seminary remains the legal name. Eight of the nine ¶324.4 areas are required — the best coverage found so far.",
  },
  {
    name: "Iliff School of Theology",
    city: "Denver",
    state: "CO",
    umcAffiliated: true,
    modalities: ["residential", "hybrid", "online"],
    url: "https://www.iliff.edu/",
  },
  {
    name: "Methodist Theological School in Ohio (MTSO)",
    city: "Delaware",
    state: "OH",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    url: "https://www.mtso.edu/",
  },
  {
    slug: "perkins",
    name: "Perkins School of Theology (Southern Methodist University)",
    city: "Dallas",
    state: "TX",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    courseOfStudy: true,
    url: "https://www.smu.edu/perkins",
    note: "Home seminary for much of the South Central Jurisdiction, including Rio Texas, with a Houston-Galveston extension.",
  },
  {
    slug: "saint-paul",
    name: "Saint Paul School of Theology",
    city: "Leawood",
    state: "KS",
    umcAffiliated: true,
    modalities: ["residential", "hybrid", "online"],
    courseOfStudy: true,
    url: "https://www.spst.edu/",
    note: "Campuses in Kansas and Oklahoma — same degree plan and tuition at both, but most of the faculty are in Kansas.",
  },
  {
    name: "United Theological Seminary",
    city: "Dayton",
    state: "OH",
    umcAffiliated: true,
    modalities: ["residential", "hybrid", "online"],
    url: "https://united.edu/",
  },
  {
    slug: "wesley",
    name: "Wesley Theological Seminary",
    city: "Washington",
    state: "DC",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    url: "https://www.wesleyseminary.edu/",
    note: "Six of the nine ¶324.4 areas are in the required core; Wesley states plainly that the other three are the church's requirement rather than its own, and lists which electives satisfy them.",
  },
];
