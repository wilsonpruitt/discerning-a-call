import type { Seminary } from "./types";

// The thirteen United Methodist seminaries (University Senate–approved), plus a
// note on Course of Study schools and the growing number of hybrid/online M.Div
// options. Modalities and program details change — always confirm with the
// school. Listed alphabetically.
//
// Roster last checked against GBHEM's Approved Schools of Theology page
// 2026-08-06 — see research/gbhem-approved-schools-snapshot.md.

export const seminaries: Seminary[] = [
  {
    name: "Boston University School of Theology",
    city: "Boston",
    state: "MA",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    url: "https://www.bu.edu/sth/",
  },
  {
    name: "Candler School of Theology (Emory University)",
    city: "Atlanta",
    state: "GA",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    courseOfStudy: true,
    url: "https://candler.emory.edu/",
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
    name: "Duke Divinity School",
    city: "Durham",
    state: "NC",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    courseOfStudy: true,
    url: "https://divinity.duke.edu/",
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
    name: "Garrett Seminary",
    city: "Evanston",
    state: "IL",
    umcAffiliated: true,
    modalities: ["residential", "hybrid", "online"],
    courseOfStudy: true,
    url: "https://www.garrett.edu/",
    note: "Goes by Garrett Seminary now; Garrett-Evangelical Theological Seminary remains the legal name.",
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
    name: "Saint Paul School of Theology",
    city: "Leawood",
    state: "KS",
    umcAffiliated: true,
    modalities: ["residential", "hybrid", "online"],
    courseOfStudy: true,
    url: "https://www.spst.edu/",
    note: "Campuses in Kansas and Oklahoma; strong hybrid offerings.",
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
    name: "Wesley Theological Seminary",
    city: "Washington",
    state: "DC",
    umcAffiliated: true,
    modalities: ["residential", "hybrid"],
    url: "https://www.wesleyseminary.edu/",
  },
];
