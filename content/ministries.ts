import type { MinistryForm } from "./types";

// Forms of ministry, with honest "fits if" / "weigh that" notes. The aim is
// discernment, not recruitment — every form here is a complete vocation.

export const ministries: MinistryForm[] = [
  {
    id: "elder",
    name: "Ordained elder",
    oneLine: "Ordained to Word, Sacrament, Order, and Service; itinerant.",
    description: [
      "Elders preach, preside at the Lord's Table and baptism, and lead congregations and ministries.",
      "Elders are itinerant: they agree to go where the bishop appoints them, and the connection agrees to provide them an appointment.",
    ],
    fitsIf: [
      "You feel drawn to preach and to lead a worshiping community.",
      "You are willing to be sent — to hold your home and plans loosely.",
      "Sacramental ministry stirs something deep in you.",
    ],
    weighThat: [
      "Itineracy is real: you may be asked to move, sometimes on the conference's timing rather than yours.",
      "It usually requires a full Master of Divinity — a significant investment of years and money.",
    ],
    pathSummary:
      "Certified candidate → M.Div → commissioned provisional residency → ordained elder.",
  },
  {
    id: "deacon",
    name: "Ordained deacon",
    oneLine: "Ordained to Word, Service, Compassion, and Justice.",
    description: [
      "Deacons connect the church to the world's hurt: in teaching, music, chaplaincy, social justice, mission, and care.",
      "Deacons are not itinerant in the same way as elders; they often seek out and hold their own appointments, including beyond the local church.",
    ],
    fitsIf: [
      "Your call is to bridge worship and the world — to lead the church into service.",
      "You have a specialized ministry (education, music, social work, chaplaincy) you want the church to set apart and bless.",
      "You want to be ordained, but not necessarily itinerant.",
    ],
    weighThat: [
      "You are often responsible for securing your own appointment.",
      "The deacon's role is sometimes misunderstood in local churches; you may spend energy explaining it.",
    ],
    pathSummary:
      "Certified candidate → M.Div or professional degree plus theological study → commissioned residency → ordained deacon.",
  },
  {
    id: "local-pastor",
    name: "Licensed local pastor",
    oneLine: "Licensed to pastor a congregation while completing studies over time.",
    description: [
      "Licensed local pastors carry the full pastoral ministry of the church to which they are appointed — preaching, sacraments there, and care.",
      "They complete the five-year Course of Study (or seminary) while serving, rather than before.",
    ],
    fitsIf: [
      "You are ready to serve a congregation now, especially in a second career.",
      "A full residential seminary degree is not feasible for your life right now.",
      "You feel called to pastor, perhaps in the small membership churches that need shepherds most.",
    ],
    weighThat: [
      "Your license and sacramental authority are tied to your appointment.",
      "If you later seek ordination as an elder, there are additional educational steps.",
    ],
    pathSummary:
      "Certified candidate → Licensing School → appointment → Course of Study or M.Div.",
  },
  {
    id: "chaplaincy",
    name: "Chaplaincy & extension ministry",
    oneLine: "Ministry in hospitals, the military, campuses, prisons, and workplaces.",
    description: [
      "Chaplains carry pastoral presence into settings beyond the local church — bedsides, barracks, dorms, and cells.",
      "In the UMC this is usually pursued as an elder or deacon in an extension ministry, with additional clinical training (such as CPE) for board certification.",
    ],
    fitsIf: [
      "You are drawn to people in crisis, transition, or the margins of institutions.",
      "You can hold space for those of many faiths or none.",
    ],
    weighThat: [
      "Board certification (e.g., through CPE) is a substantial additional path.",
      "You still relate to an annual conference for your credentials.",
    ],
    pathSummary:
      "Ordained track (elder or deacon) → extension ministry appointment → clinical training and certification.",
  },
  {
    id: "lay",
    name: "Lay ministry",
    oneLine: "Certified lay servant, speaker, or minister — leadership without ordination.",
    description: [
      "Lay Servant Ministries equips members to lead, care, and preach in their churches and districts.",
      "A Certified Lay Minister can be assigned by a district superintendent to provide congregational leadership.",
    ],
    fitsIf: [
      "You want to serve and lead without leaving your current work or stage of life.",
      "Your calling is real but does not point toward ordination — or not yet.",
    ],
    weighThat: [
      "Authority is more limited and locally defined than ordained ministry.",
      "For some, this is a season on the way to ordination; for many, it is the whole and sufficient calling.",
    ],
    pathSummary:
      "Lay Servant courses → certified lay servant → (optionally) certified lay minister.",
  },
];

export const ministryById = Object.fromEntries(
  ministries.map((m) => [m.id, m]),
);
