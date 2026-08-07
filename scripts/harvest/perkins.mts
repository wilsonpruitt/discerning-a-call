// Perkins School of Theology (SMU) — one of the 13 UMC schools of theology.
//
// Bespoke bits, for the next school's benefit (per README §"Adding a school"):
//
//   - THIS SCHOOL PREDATES THE HARVESTER. data/faculty/perkins.json and
//     data/seminaries/perkins.json were both hand-assembled before this
//     script existed — deepest coverage of any school on this site for
//     publications (26/29, from Perkins' own annual Faculty Publications PDF,
//     matched to the roster by name) and email (28/29, same PDF's byline
//     match), but 0/29 on degrees. The tracker's original entry called that a
//     real ceiling: "Perkins publishes no per-professor bio pages... would
//     need an external source per person."
//
//   - THAT CEILING WAS WRONG (found 2026-08-07, checking all 29 people, not a
//     sample). facultylistinga-z, the roster page, genuinely has no degree
//     info and reads as if it's the only page Perkins publishes per person.
//     But every name on it (except Ashley Boggan, see below) links to its own
//     individual page at
//     smu.edu/perkins/facultyacademics/facultylistinga-z/<surname-slug> — a
//     real, individually fetchable bio page, no JS modal, no Cloudflare wall,
//     and every one of those 28 pages carries a degrees line: institution,
//     and for most people, a graduation year. Boggan (an affiliate research
//     professor, appointed June 2025, general secretary of GCAH) has no link
//     from the roster page's own markup but the same URL pattern still
//     resolves for her (.../facultylistinga-z/boggan) — found by web search,
//     not roster navigation. Dean Bryan Stone is the only one with a
//     genuinely different profile URL (a dean bio page, not the faculty
//     listing pattern), already the profileUrl on record for him.
//
//   - SLUG PATTERN: lowercase surname, hyphenated for compound/hyphenated
//     surnames (baker-fletcher, clark-soles, nelms-chastain, pope-levison,
//     steuernagel, stevenson-moessner, sutton-adams). Not derivable from a
//     simple slugify(name) — Levison (John R. (Jack) Levison) and
//     Pope-Levison (Priscilla) both reduce to different slugs than a naive
//     surname-last-token split would guess, so the slugs are recorded
//     per-person below rather than computed.
//
//   - PUBLICATIONS AND EMAIL ARE UNCHANGED by this pass — still sourced from
//     Perkins' own annual "Faculty Publications" PDF
//     (smu.edu/-/media/site/perkins/academics-faculty/faculty-pubfall25.pdf
//     as of fall 2025), which has no degree information in it (front matter
//     is a title page and a by-department table of contents, nothing
//     biographical). Degrees are a genuinely separate source from
//     publications/email at this school — the PDF got one job done, the
//     individual pages got the other.
//
// Run: node scripts/harvest/perkins.mts [--fresh]

import { get, today } from "./lib/fetch.mts";
import { htmlToText, pdfToText } from "./lib/text.mts";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FacultyMember, SeminaryProfile } from "../../content/types.ts";

const ROOT = process.cwd();
const fresh = process.argv.includes("--fresh");

const BASE = "https://www.smu.edu";
const ROSTER_URL = `${BASE}/perkins/facultyacademics/facultylistinga-z`;
const PUBLICATIONS_PDF_URL = `${BASE}/-/media/site/perkins/academics-faculty/faculty-pubfall25.pdf`;

// One entry per person, minus id/seminarySlug (derived in buildFaculty()).
// publications/publicationsSource/publicationsAsOf/email carried forward
// unchanged from the pre-harvester hand-assembled file (sourced from the PDF
// above); degrees are this pass's addition, each read from that person's own
// smu.edu/perkins/facultyacademics/facultylistinga-z/<slug> page (or, for
// Stone, his dean bio page).
const ROSTER: Omit<FacultyMember, "seminarySlug">[] = [
  {
    "id": "perkins-allen",
    "name": "O. Wesley Allen Jr.",
    "title": "Lois Craddock Perkins Professor of Homiletics",
    "otherRoles": [
      "Director, Perkins Center for Preaching Excellence"
    ],
    "areas": [
      "preaching"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "wesleya@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/allen",
    "publications": [
      {
        "title": "Preaching and the Thirty Second Commercial. Co-authored with Carrie La Ferle. Westminster John Knox, 2021.",
        "kind": "book",
        "year": 2021
      },
      {
        "title": "Protestant Worship: A Multisensory Introduction for Students and Practitioners. Abingdon Press, 2019. www.cokesbury.com/9781501842665-Protestant-Worship-eBook-ePub",
        "kind": "book",
        "year": 2019
      },
      {
        "title": "The Preacher’s Bible Handbook. Edited by O. Wesley Allen. Westminster John Knox, 2019.",
        "kind": "edited-volume",
        "year": 2019
      },
      {
        "title": "Preaching and the Human Condition: Loving God, Self, and Others. Abingdon Press, 2016.",
        "kind": "book",
        "year": 2016
      },
      {
        "title": "The Sermon without End: A Conversational Approach to Preaching. Co-authored with Ronald J. Allen. Abingdon Press, 2015.",
        "kind": "book",
        "year": 2015
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Emory Graduate School of Arts and Sciences, 1996",
      "MDiv, Yale Divinity School, 1990",
      "BA, Birmingham-Southern College, 1987"
    ]
  },
  {
    "id": "perkins-aquino",
    "name": "Frederick Aquino",
    "title": "Lehman Professor of Christian Doctrine",
    "areas": [
      "systematic-theology"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "faquino@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/aquino",
    "publications": [
      {
        "title": "“Epistemology,” in William J. Abraham: A Theological Profile, edited by Michael J. Gehring and Andrew D. Kinsey. Baylor University Press, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "“Newman and Pope Benedict (Ratzinger) on Faith and Reason,” in John Henry Newman and Joseph Ratzinger: A Theological Encounter, edited by Matthew Levering. Catholic University of America Press, 2025.",
        "kind": "chapter",
        "year": 2025
      },
      {
        "title": "John Henry Newman and Contemporary Philosophy. Edited by Frederick D. Aquino and Joe Milburn. Routledge, 2025",
        "kind": "edited-volume",
        "year": 2025
      },
      {
        "title": "John Henry Newman's An Essay in Aid of a Grammar of Assent: A Critical Guide, Edited by Frederick D. Aquino and Matthew Levering. Emmaus Academic, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "“Newman and Ecumenism: On the Importance of a Connected View.” Urbaniana University Journal - Euntes docete 78 no. 1 (2025): 13-26.",
        "kind": "article",
        "year": 2025
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Southern Methodist University, 2000",
      "MDiv, Abilene Christian University",
      "MA, Abilene Christian University",
      "BA, Abilene Christian University"
    ]
  },
  {
    "id": "perkins-baker-fletcher",
    "name": "Karen Baker-Fletcher",
    "title": "Professor of Systematic Theology",
    "areas": [
      "systematic-theology",
      "womanist-feminist-theology"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "kbakerfl@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/baker-fletcher",
    "publications": [
      {
        "title": "Creating Women’s Theology: A Movement Engaging Process Thought. Wipf & Stock, 2011.",
        "kind": "book",
        "year": 2011
      },
      {
        "title": "Dancing with God: A Womanist Perspective on the Trinity. Chalice Press, 2007.",
        "kind": "book",
        "year": 2007
      },
      {
        "title": "Sisters of Dust, Sisters of Spirit: Womanist Wordings on God and Creation. Fortress Press, 1998.",
        "kind": "book",
        "year": 1998
      },
      {
        "title": "My Sister, My Brother: Womanist and Xodus God-Talk. Co-authored with Garth Kasimu Baker-Fletcher. Bishop Henry McNeal Turner/Sojourner Truth Series in Black Religion, No.12, Orbis Books, 1997.",
        "kind": "book",
        "year": 1997
      },
      {
        "title": "A Singing Something: Womanist Reflections on Anna Julia Cooper. Crossroad/Herder and Herder, 1994.",
        "kind": "book",
        "year": 1994
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Harvard Graduate School of Arts and Sciences (Theology and Literature), 1991",
      "MA, Harvard Graduate School of Arts and Sciences (Religious Studies and Theology), 1987",
      "MDiv, Harvard Divinity School (Theology and Literature), 1984",
      "BA, Wellesley College (Philosophy and French), 1981"
    ]
  },
  {
    "id": "perkins-blount",
    "name": "Farris Blount III",
    "title": "Assistant Professor of Practical Theology",
    "otherRoles": [
      "Director of the Doctor of Ministry degree program",
      "Director of the Black/Africana Church Studies (BACS) program"
    ],
    "areas": [
      "practical-theology",
      "black-church-studies"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "fblount@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/blount",
    "degrees": [
      "PhD, Practical Theology, Boston University School of Theology",
      "MDiv, Harvard Divinity School",
      "BA, International Relations, Stanford University"
    ]
  },
  {
    "id": "perkins-boggan",
    "name": "Ashley Boggan",
    "title": "Affiliate Assistant Research Professor of Methodist Studies",
    "areas": [
      "wesleyan-studies",
      "church-history"
    ],
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/boggan",
    "publications": [
      {
        "title": "Calling on Fire: Reclaiming the Method of Methodism. Abingdon Press, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "Wesleyan Vile-tality: Reclaiming the Heart of Methodist Identity. Abingdon Press, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "American Methodism: A Compact History: Revised and Updated. Abingdon Press, 2022.",
        "kind": "book",
        "year": 2022
      },
      {
        "title": "Nevertheless: American Methodists and Women’s Rights. Wesley’s Foundery Books, 2020.",
        "kind": "book",
        "year": 2020
      },
      {
        "title": "Entangled: A History of American Methodism, Politics, and Sexuality. New Room Books, 2018.",
        "kind": "book",
        "year": 2018
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Drew Theological School, 2017",
      "MA, University of Chicago, 2012",
      "BA, University of Arkansas, 2009"
    ]
  },
  {
    "id": "perkins-bristow",
    "name": "April Johnson Bristow",
    "title": "Clinical Assistant Professor in the Intern Program",
    "otherRoles": [
      "Associate Director, Intern Program"
    ],
    "areas": [
      "practical-theology",
      "congregational-leadership"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "ajbristow@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/bristow",
    "publications": [
      {
        "title": "Contributed “Remember to Rest” to Leaves of Wisdom: A Book of Daily Meditations and Encouragement, Alpha Kappa Alpha Sorority, Incorporated, 2024.",
        "kind": "book",
        "year": 2024
      },
      {
        "title": "Contributed “The Work of Peacemaking” to Our Favorite Sunday School Lesson, Market Square Books, 2023.",
        "kind": "book",
        "year": 2023
      },
      {
        "title": "S. E. L. F. I. E.: A Model for Cultural Intelligence for Faithful Leadership in the Church. Co-authored with Adam Young, North Texas Conference United Methodist Church, 2015.",
        "kind": "book",
        "year": 2015
      },
      {
        "title": "Becoming One Again: Intentional Steps Toward Healing for Divorced/Divorcing Persons. First United Methodist Church, Richardson, 2013.",
        "kind": "book",
        "year": 2013
      },
      {
        "title": "Strengths in Differences: Cultural Competency for Faith Leaders – A Closer Look at Acts 10, for LeadershipFirst, First United Methodist Church, Richardson, 2020.",
        "kind": "book",
        "year": 2020
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "DMin, Pastoral Care, Houston Graduate School of Theology",
      "MDiv, Perkins School of Theology, Southern Methodist University",
      "BS, Rutgers University, 1989"
    ]
  },
  {
    "id": "perkins-clark-soles",
    "name": "Jaime Clark-Soles",
    "title": "Professor of New Testament",
    "otherRoles": [
      "Altshuler Distinguished Teaching Professor"
    ],
    "areas": [
      "new-testament"
    ],
    "schoolArea": "The Biblical Witness",
    "email": "jaimecs@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/clark-soles",
    "publications": [
      {
        "title": "Pasricha, Ishan Caroline Peacock, Roman Palitsky, Jaime Clark-Soles, Jessica L. Maples-Keller, George H. Grant, and Deanna M. Kaplan. “What Motivates Spiritual Health Practitioners in Psychedelic-Assisted Therapy? A Qualitative Study and Implications for Facilitator Training Practices.” Psychedelics 1 no. 9: 1–9 (April 2025). https://doi.org/10.61373/pp025r.0008",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "“Psychedelics, the Bible, and the Divine” Religions 15, no. 5 (May 2024). https://doi.org/10.3390/rel15050582",
        "kind": "article",
        "year": 2024
      },
      {
        "title": "1 Corinthians: Searching the Depths of God. Abingdon, 2021.",
        "kind": "book",
        "year": 2021
      },
      {
        "title": "\"Women in the Bible,\" in Interpretation: Resources for the Use of Scripture in the Church, edited by Samuel Balentine, Brent Strawn, and Susan Hylen. Westminster John Knox, 2020.",
        "kind": "chapter",
        "year": 2020
      },
      {
        "title": "\"Disability in the Johannine Literature (Gospel of John, 1-3 John, Apocalypse),” in The Bible and Disability: A Commentary, edited by Sarah J. Melcher, Mikeal C. Parsons, and Amos Yong. Baylor University Press, 2017.",
        "kind": "chapter",
        "year": 2017
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Yale University, 2000",
      "MDiv, Yale University, 1993",
      "BA, Stetson University, 1989"
    ]
  },
  {
    "id": "perkins-elia",
    "name": "Anthony Elia",
    "title": "Director of Bridwell Library; J.S. Bridwell Foundation Endowed Librarian",
    "areas": [
      "church-history"
    ],
    "email": "aelia@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/elia",
    "publications": [
      {
        "title": "Christ Our Passover (Pascha Nostrum), for organ and mixed choir. Based on texts from 1 Corinthians and Romans. SMU Scholar, Spring 2023.",
        "kind": "book",
        "year": 2023
      },
      {
        "title": "“Oil, Earth, Books, and Holy Spirit: Theological Institutions, Libraries, and the Role of Environmental Sustainability.” ATLA Proceedings, 2021.",
        "kind": "article",
        "year": 2021
      },
      {
        "title": "“The Millennium Project—Nature, Environment, and Time in the Future of Special Collections: Considering the Case of Bridwell Library.” In Preserving the Past & Engaging the Future: Theology and Religion in American Special Collections, edited by M. Patrick Graham, Atla Open Press, 2021.",
        "kind": "chapter",
        "year": 2021
      },
      {
        "title": "Easter Vigil (Introit): This is the Day, for organ and mixed chorus. Premiered at Episcopal Church of the Annunciation, Lewisville, Texas, 2021.",
        "kind": "book",
        "year": 2021
      },
      {
        "title": "“Ecologies of Space in the Paradoxes of Technology and Community: Adaptability and Resilience in Libraries, Churches, and Theological Schools in a COVID-19 World.” ATLA Proceedings, 2020.",
        "kind": "chapter",
        "year": 2020
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "MSLIS, University of Illinois, Urbana-Champaign, 2007",
      "MA, History of Christianity, University of Chicago, 2004",
      "MA, Religious Studies (Biblical Studies focus), Hebrew University of Jerusalem, 2002",
      "BA, Religious Studies, St. Lawrence University, 1997"
    ]
  },
  {
    "id": "perkins-gingles",
    "name": "Dallas J. Gingles",
    "title": "Associate Professor of Practice in Systematic Theology and Christian Ethics",
    "areas": [
      "systematic-theology",
      "ethics-public-theology"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "dgingles@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/gingles",
    "publications": [
      {
        "title": "\"In the Face of Barbarism:\" Bonhoeffer’s Ethics of Everyday Life. Co-edited with Michael DeJonge. Bloomsbury, 2025.",
        "kind": "article",
        "year": 2025
      },
      {
        "title": "The Future of Christian Realism: International Conflict, Political Decay, and the Crisis of Democracy. Co-edited with Rebekah Miles and Joshua Mauldin. Lexington Books, 2023.",
        "kind": "edited-volume",
        "year": 2023
      },
      {
        "title": "“‘Dirty Hands’: Guilt and Regret in Moral Reasoning.” Studies in Christian Ethics 36, no. 1 (February 2023): 107-122.",
        "kind": "chapter",
        "year": 2023
      },
      {
        "title": "“Narrative.” In T&T Clark Handbook of Christian Ethics, edited by Tobias Winright. Bloomsbury, 2020.",
        "kind": "chapter",
        "year": 2020
      },
      {
        "title": "“Justifications and Judgments: Walzer and Bonhoeffer on Politics and the Limits of Ethics.” Journal of the Society of Christian Ethics 37, no. 1 (2017): 83-99.",
        "kind": "article",
        "year": 2017
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Southern Methodist University, 2016",
      "MTS, Perkins School of Theology, Southern Methodist University, 2010",
      "BS, Southwestern Assemblies of God University, 2005"
    ]
  },
  {
    "id": "perkins-heller",
    "name": "Roy L. Heller",
    "title": "Professor of Old Testament",
    "otherRoles": [
      "Altshuler Distinguished Teaching Professor"
    ],
    "areas": [
      "hebrew-bible"
    ],
    "schoolArea": "The Biblical Witness",
    "email": "rheller@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/heller",
    "publications": [
      {
        "title": "Distinguished Teaching Professor",
        "kind": "book"
      },
      {
        "title": "“Nathan’s Sixth Sense: Russian Formalism, Cinematic Technique, and the Character of a Prophet.” In A Sage in New Haven: Studies on the Prophets, the Writings, and the Ancient World in Honor of Robert R. Wilson, edited by Carolyn J. Sharp and Alison Gruseke. Zaphon, 2023.",
        "kind": "chapter",
        "year": 2023
      },
      {
        "title": "The Characters of Elijah and Elisha and the Deuteronomic Evaluation of Prophecy: Miracles and Manipulation. Library of Hebrew Bible/Old Testament Studies 671. Bloomsbury T&T Clark, 2018.",
        "kind": "book",
        "year": 2018
      },
      {
        "title": "Conversations with Scripture: The Book of Judges. Anglican Association of Biblical Scholars Study Series. Morehouse, 2011.",
        "kind": "book",
        "year": 2011
      },
      {
        "title": "The Character of Samuel and the Deuteronomistic Evaluation of Prophecy: Power, Politics, and Prophecy. Library of Hebrew Bible/Old Testament Studies. Bloomsbury T&T Clark, 2006.",
        "kind": "book",
        "year": 2006
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Yale University, 1998",
      "STM, Yale University Divinity School, 1991",
      "MDiv, Yale University Divinity School, 1990",
      "BS, Houston Baptist University, 1986"
    ]
  },
  {
    "id": "perkins-hunt",
    "name": "Robert A. Hunt",
    "title": "Professor of Christian Mission and Interreligious Relations",
    "areas": [
      "world-christianity",
      "interreligious",
      "mission-social-justice"
    ],
    "schoolArea": "The Heritage of the Christian Witness in its Religious and Cultural Context",
    "email": "roberth@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/hunt",
    "publications": [
      {
        "title": "All Brain and No Soul? Real Humanity in an AI Age. Wipf and Stock, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "Do No Harm. Edited by Ernest van Eck and George Hunsberger. Pickwick Publications, 2025. 81-92.",
        "kind": "edited-volume",
        "year": 2025
      },
      {
        "title": "Muslim Faith and Values: A Guide for Christians. Cascade Books, 2019.",
        "kind": "book",
        "year": 2019
      },
      {
        "title": "“Our Journey in Multifaith Education.” In Teaching in a Multifaith World, edited by Eleazar Fernandez. Wipf and Stock, 2016.",
        "kind": "chapter",
        "year": 2016
      },
      {
        "title": "“Public Missiology in an Age of Anxious Tribalism.” Missiology: An International Review. April 2016.",
        "kind": "article",
        "year": 2016
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, University of Malaya, 1994",
      "MDiv, Southern Methodist University, 1982",
      "BA, University of Texas, 1977"
    ]
  },
  {
    "id": "perkins-lee",
    "name": "James Kang Hoon Lee",
    "title": "Professor of the History of Early Christianity",
    "otherRoles": [
      "Altshuler Distinguished Teaching Professor",
      "Director, Graduate Program in Religious Studies"
    ],
    "areas": [
      "church-history"
    ],
    "schoolArea": "The Heritage of the Christian Witness in its Religious and Cultural Context",
    "email": "jklee@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/lee",
    "publications": [
      {
        "title": "Praise Without Ceasing: The Spirituality of St. Augustine. Cascade Books, forthcoming.",
        "kind": "book"
      },
      {
        "title": "“Holiness and Early Latin Christianity.” In T&T Clark Companion to Holiness. Bloomsbury T&T Clark, forthcoming.",
        "kind": "chapter"
      },
      {
        "title": "“Augustine’s Sermons on the Old Testament.” In The Cambridge Companion to Augustine’s Sermons, edited by Andrew Hofer, 81–97. Cambridge University Press, 2025.",
        "kind": "chapter",
        "year": 2025
      },
      {
        "title": "“‘One in the One Shepherd’: St. Augustine and Pastoral Ministry.” Heythrop Journal 63 (2022): 232–244.",
        "kind": "article",
        "year": 2022
      },
      {
        "title": "The Church in the Latin Fathers: Unity in Charity. Lexington Books/Fortress Academic, 2020.",
        "kind": "book",
        "year": 2020
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, University of Notre Dame",
      "MA, Catholic University of America",
      "BA, University of Notre Dame"
    ]
  },
  {
    "id": "perkins-levison",
    "name": "John R. (Jack) Levison",
    "title": "W. J. A. Power Professor of Old Testament Interpretation and Biblical Hebrew",
    "areas": [
      "hebrew-bible"
    ],
    "schoolArea": "The Biblical Witness",
    "email": "jlevison@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/levison",
    "publications": [
      {
        "title": "“Before Modern Feminism: Protestant Women in the Twentieth Century.” In Expanding Energy: The Dynamic Story of North American Christianity, edited by Christopher H. Evans and Mark Lamport. Cascade Books, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "“Are Perfect Love & Sanctification Synonymous? Iva Durham Vennard’s Reinterpretation of J.A. Wood’s Perfect Love.” Wesleyan Theological Journal 56, no. 2 (Fall 2021): 121-36.",
        "kind": "article",
        "year": 2021
      },
      {
        "title": "Models of Evangelism. Baker Academic, 2020.",
        "kind": "book",
        "year": 2020
      },
      {
        "title": "“Pentecost in the Churches: Women in the Pentecostal League of Prayer.” Wesley and Methodist Studies 10, no. 1 (2018): 46-65.",
        "kind": "article",
        "year": 2018
      },
      {
        "title": "Building the Old Time Religion: Women Evangelists in the Progressive Era. New York University Press, 2014.",
        "kind": "book",
        "year": 2014
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Duke University, 1985",
      "MA, Cambridge University, 1982",
      "BA, Wheaton College, 1978"
    ]
  },
  {
    "id": "perkins-lewis",
    "name": "Tamara Lewis",
    "title": "Professor of the Practice of Historical Theology",
    "areas": [
      "church-history",
      "systematic-theology"
    ],
    "schoolArea": "The Heritage of the Christian Witness in its Religious and Cultural Context",
    "email": "telewis@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/lewis",
    "publications": [
      {
        "title": "“Ecclesial Justifications and Resistance to Slavery in British Colonial America.” In Churches and Moral Discernment: Learning from History, vol. 2, edited by Myriam Wijlens, Vladmir Shmaliy, and Simone Sinn. World Council of Churches, Faith and Order Paper, no. 229 (2021): 53-64.",
        "kind": "chapter",
        "year": 2021
      },
      {
        "title": "“Epiphany OT C2, Baptism of the Lord OT C2, Epiphany 2 OT C2.” In Connections: A Lectionary Commentary for Preaching and Worship, Year B, Vol. 1: Advent through Epiphany, edited by Joel B. Green, Thomas G. Long, Luke A. Powery, Cynthia L. Rigby, and Carolyn J. Sharp. Westminster John Knox Press, 2020.",
        "kind": "chapter",
        "year": 2020
      },
      {
        "title": "Review of George Whitefield: Life, Context, and Legacy. Methodist History 58 (2019), 99-101.",
        "kind": "book",
        "year": 2019
      },
      {
        "title": "“Unitarianism.” In Cambridge Companion to the Council of Nicaea, edited by Young Kim. Cambridge University Press, 2019.",
        "kind": "chapter",
        "year": 2019
      },
      {
        "title": "“Isaiah 60: 1-6”; “Genesis 1: 1-5”; “1 Samuel 3: 1-10 (11-20)”- Commentary 2. Connections: A Lectionary Commentary Series. Westminster John Knox Press, 2019.",
        "kind": "article",
        "year": 2019
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Vanderbilt University, 2014",
      "MA, Vanderbilt University, 2011",
      "MDiv, Vanderbilt University, 2000",
      "MA, Tennessee State University, 1999",
      "BA, University of Central Arkansas, 1994"
    ]
  },
  {
    "id": "perkins-long",
    "name": "D. Stephen Long",
    "title": "Cary M. Maguire University Professor of Ethics",
    "areas": [
      "ethics-public-theology",
      "systematic-theology"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "sdlong@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/long",
    "publications": [
      {
        "title": "“On Making a Living Teaching and Researching Christian Ethics,” presidential address. Journal for the Society of Christian Ethics, Fall 2024.",
        "kind": "article",
        "year": 2024
      },
      {
        "title": "On Teaching and Learning Christian Ethics. Georgetown University Press, 2024.",
        "kind": "book",
        "year": 2024
      },
      {
        "title": "Routledge Companion to Christian Ethics. Edited with Rebekah Miles. Routledge, 2022.",
        "kind": "edited-volume",
        "year": 2022
      },
      {
        "title": "The Art of Cycling, Living, and Dying: Moral Theology from Ordinary Life. Cascade Books, 2021.",
        "kind": "book",
        "year": 2021
      },
      {
        "title": "Augustinian and Ecclesial Christian Ethics: On Loving Enemies. Fortress Academic, 2018.",
        "kind": "book",
        "year": 2018
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Duke University, 1991",
      "MDiv, Duke University Divinity School, 1987",
      "BA, Taylor University, 1982"
    ]
  },
  {
    "id": "perkins-magallanes",
    "name": "Hugo Magallanes",
    "title": "Associate Professor of Christianity and Cultures",
    "otherRoles": [
      "Associate Dean for Academic Affairs",
      "Director, CASA",
      "Director, United Methodist Regional Course of Study School for Local Pastors",
      "Director, Global Theological Education"
    ],
    "areas": [
      "latino-hispanic-ministry",
      "world-christianity",
      "mission-social-justice"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "hugo@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/magallanes",
    "publications": [
      {
        "title": "“I Kings 19:9-18 and Genesis 37:1-4, 12-28; Isaiah 56:1, 6-8 and Genesis 45:1-15; Isaiah 51:1-6 and Exodus 1:8--2:10.” In Connections: Year A, Volume 3, Season after Pentecost, edited by Thomas G. Long, Cynthia L. Rigby, Carolyn J. Sharp, Luke A. Powery, and Joel B. Green. Westminster John Knox Press, 2020.",
        "kind": "chapter",
        "year": 2020
      },
      {
        "title": "“Methodist: Immigration in the U.S. and Wesleyan Methodology.” In Immigrant Neighbors Among Us: Immigration Across Theological Traditions, edited by M. Daniel Carroll R. and Leopoldo A. Sanchez, Pickwick Publications, 2015.",
        "kind": "chapter",
        "year": 2015
      },
      {
        "title": "Acción Social: El Pueblo Cristiano Testifica del Amor de Dios (Social Action: The Community of Believers Offers a Witness of God’s Love). Abingdon Press, 2012.",
        "kind": "book",
        "year": 2012
      },
      {
        "title": "“The Protestant Reformation from a Latino Methodist Perspective.” In Our 95 Theses: 500 years after the Reformation, edited by Justo L. González and Alberto L. García. AETH, 2016. Also published in Spanish as: “La Reforma Protestante desde una Perspectiva Metodista Hispana.” En Nuestras 95 Tesis: A 500 Años de la Reforma, editado por Justo L. González y Alberto L. García. AETH, 2016.",
        "kind": "chapter",
        "year": 2016
      },
      {
        "title": "Jesus in the Hispanic Community: Images of Christ from Theology to Popular Religion, edited by Harold J. Recinos and Hugo Magallanes. Westminster John Knox, 2009.",
        "kind": "book",
        "year": 2009
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Drew University, 2002",
      "MPhil, Drew University, 1999",
      "MDiv, Asbury Theological Seminary, 1996",
      "BA (Theology), Seminario Juan Wesley, 1990"
    ]
  },
  {
    "id": "perkins-miles",
    "name": "Rebekah Miles",
    "title": "Albert C. Outler Chair of Wesley Studies",
    "otherRoles": [
      "Altshuler Distinguished Teaching Professor"
    ],
    "areas": [
      "wesleyan-studies",
      "ethics-public-theology"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "rlmiles@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/miles",
    "publications": [
      {
        "title": "The Future of Christian Realism: International Conflict, Political Decay, and the Crisis of Democracy. Co-edited with Dallas Gingles and Josh Mauldin. Lexington Books, 2023.",
        "kind": "edited-volume",
        "year": 2023
      },
      {
        "title": "The Routledge Companion to Christian Ethics. Co-edited with Steve Long. Routledge Press, 2022",
        "kind": "edited-volume",
        "year": 2022
      },
      {
        "title": "When the One You Love is Gone. Abingdon Press, 2012.",
        "kind": "book",
        "year": 2012
      },
      {
        "title": "Georgia Harkness: The Remaking of a Liberal Theologian, Collected Essays from 1929-1942. Westminster John Knox Press, 2010.",
        "kind": "book",
        "year": 2010
      },
      {
        "title": "The Bonds of Freedom: Feminist Theology and Christian Realism. Oxford University Press, 2001.",
        "kind": "book",
        "year": 2001
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, The Divinity School, University of Chicago, 1995",
      "MDiv, Iliff School of Theology, 1988",
      "BA, Hendrix College, 1982"
    ]
  },
  {
    "id": "perkins-nelms-chastain",
    "name": "Emily Nelms Chastain",
    "title": "Assistant Professor of Christian History & Methodist Studies",
    "areas": [
      "church-history",
      "wesleyan-studies"
    ],
    "schoolArea": "The Heritage of the Christian Witness in its Religious and Cultural Context",
    "email": "enelmschastain@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/nelms-chastain",
    "publications": [
      {
        "title": "‘Break[ing] the System’: How the Methodist Student Movement Motivated a Generation to Challenge Their Denomination’s Segregationist Polity. Wesley and Methodist Studies 17, no. 1 (2025): 62–90.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "“Celebrating Women Who Tell Our Stories.\" General Commission on the Status and Role of Women. 8-part series on newly elected women bishops in the UMC, March 2023.",
        "kind": "article",
        "year": 2023
      },
      {
        "title": "“Parity Among Methodist Clergy.\" General Commission on the Status and Role of Women, September 13, 2022.",
        "kind": "article",
        "year": 2022
      },
      {
        "title": "\"Connexionalism Vital to Continued Ministry of the General Commission on the Status and Role of Women.\" General Commission on the Status and Role of Women, June 9, 2022.",
        "kind": "article",
        "year": 2022
      },
      {
        "title": "\"Sexual Ethics Remains Vital to the United Methodist Church.\" General Commission on the Status and Role of Women, April 29, 2022.",
        "kind": "article",
        "year": 2022
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Boston University, 2025",
      "MDiv, Claremont School of Theology, 2019",
      "MA, Religion, Claremont School of Theology, 2019",
      "BA, University of Alabama at Birmingham, 2007"
    ]
  },
  {
    "id": "perkins-pope-levison",
    "name": "Priscilla Pope-Levison",
    "title": "Research Professor of Practical Theology",
    "areas": [
      "practical-theology",
      "evangelism-church-planting"
    ],
    "email": "popelevison@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/pope-levison",
    "publications": [
      {
        "title": "“Before Modern Feminism: Protestant Women in the Twentieth Century.” In Expanding Energy: The Dynamic Story of North American Christianity, edited by Christopher H. Evans and Mark Lamport. Cascade Books, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "“Are Perfect Love & Sanctification Synonymous? Iva Durham Vennard’s Reinterpretation of J.A. Wood’s Perfect Love.” Wesleyan Theological Journal 56, no. 2 (Fall 2021): 121-36.",
        "kind": "article",
        "year": 2021
      },
      {
        "title": "Models of Evangelism. Baker Academic, 2020.",
        "kind": "book",
        "year": 2020
      },
      {
        "title": "“Pentecost in the Churches: Women in the Pentecostal League of Prayer.” Wesley and Methodist Studies 10, no. 1 (2018): 46-65.",
        "kind": "article",
        "year": 2018
      },
      {
        "title": "Building the Old Time Religion: Women Evangelists in the Progressive Era. New York University Press, 2014.",
        "kind": "book",
        "year": 2014
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, University of St. Andrews, Scotland",
      "MDiv, Duke Divinity School",
      "BA, DePauw University"
    ]
  },
  {
    "id": "perkins-recinos",
    "name": "Harold J. Recinos",
    "title": "Professor of Church and Society",
    "areas": [
      "latino-hispanic-ministry",
      "mission-social-justice",
      "ethics-public-theology"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "hrecinos@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/recinos",
    "publications": [
      {
        "title": "On the Sight of Angels. Wipf and Stock, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "Words Chosen for the Wall. Wipf and Stock, 2024.",
        "kind": "book",
        "year": 2024
      },
      {
        "title": "The Place Across the River. Wipf and Stock, 2024.",
        "kind": "book",
        "year": 2024
      },
      {
        "title": "The Looking Glass: Far and Near. Wipf and Stock, 2023.",
        "kind": "book",
        "year": 2023
      },
      {
        "title": "Wading Through Many Voices: Toward a Theology of Public Conversation. Editor. Rowman & Littlefield, 2011.",
        "kind": "book",
        "year": 2011
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, American University, 1993",
      "DMin, New York Theological Seminary, 1986",
      "MDiv, Union Theological Seminary, 1982",
      "BA, College of Wooster, 1978"
    ]
  },
  {
    "id": "perkins-scholz",
    "name": "Susanne Scholz",
    "title": "Professor of Old Testament",
    "areas": [
      "hebrew-bible",
      "womanist-feminist-theology"
    ],
    "schoolArea": "The Biblical Witness",
    "email": "sscholz@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/scholz",
    "publications": [
      {
        "title": "1 Samuel: A Conceptual Feminist Interpretation. Fortress, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "Contemporary Yoga and Sacred Texts. Co-editor. Routledge, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "Doing Biblical Masculinity Studies as Feminist Biblical Studies: Critical Interrogations. Editor. Sheffield Phoenix Press, 2023.",
        "kind": "book",
        "year": 2023
      },
      {
        "title": "Handbook of Feminist Approaches to the Hebrew Bible. Editor. Oxford University Press, 2021",
        "kind": "book",
        "year": 2021
      },
      {
        "title": "The Bible as Political Artifact: On the Feminist Study of the Hebrew Bible. Fortress Press, 2017.",
        "kind": "book",
        "year": 2017
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Union Theological Seminary, New York",
      "MPhil, Union Theological Seminary, New York",
      "STM, Union Theological Seminary, New York",
      "MDiv (equivalent), University of Heidelberg, Germany"
    ]
  },
  {
    "id": "perkins-smith",
    "name": "Abraham Smith",
    "title": "Professor of New Testament",
    "areas": [
      "new-testament"
    ],
    "schoolArea": "The Biblical Witness",
    "email": "abrahams@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/smith",
    "publications": [
      {
        "title": "“Epiphany 5C: Luke 5:1-11” and “Epiphany 4C: Luke 4:21-30.” Working Preacher’s Commentary, 2025.",
        "kind": "article",
        "year": 2025
      },
      {
        "title": "“The Gospel According to Mark: Introduction, Study Notes, and Excursuses.” In The Westminster Study Bible, edited by Emerson B. Powery, Brent A. Strawn, Mary F. Foskett, and Stacy Davis. Westminster John Knox, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "“Pecola’s People: Microhistories, the Politics of Respectability, and Interrogations of the Power of the Outside Gaze.” Biblical Theology Bulletin 54 (2024): 157-167.",
        "kind": "article",
        "year": 2024
      },
      {
        "title": "“Arrested Developments: Dismantling the Disciplinary Network of a Surveillance State.” Reading in These Times. Edited by Fernando F. Segovia and Tat-Siong Benny Liew. Society of Biblical Literature Press, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "Mark: An Introduction and Study Guide (Shaping the Life and Legacy of Jesus), Second Edition. T&T Clark Study Guides to the New Testament. Bloomsbury, 2017.",
        "kind": "book",
        "year": 2017
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Vanderbilt University",
      "MDiv, Interdenominational Theological Center",
      "BA, University of Alabama"
    ]
  },
  {
    "id": "perkins-steuernagel",
    "name": "Marcell Silva Steuernagel",
    "title": "Associate Professor of Church Music",
    "otherRoles": [
      "Director of the Master of Sacred Music Program",
      "Director of the Doctor of Pastoral Music Program"
    ],
    "areas": [
      "church-music",
      "liturgy-worship"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "marcells@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/steuernagel",
    "publications": [
      {
        "title": "The Other Lutherans: Voices from the Global South. Edited by Leopoldo A. Sánchez M. Fortress Academic-Bloomsbury, forthcoming.",
        "kind": "edited-volume"
      },
      {
        "title": "“The Work of Diversity: Ethnoraciality, Identity, and Music in Christian Worship.\" Liturgy 40, no. 1, (2025): 35-61, DOI: 10.1080/0458063X.2025.2473245",
        "kind": "chapter",
        "year": 2025
      },
      {
        "title": "The Spirit and the Song: Pneumatological Reflections on Popular Music: Theology, Religion, and Pop Culture. Kimberly Ervin Alexander, Fortress Academic-Bloomsbury, 2024.",
        "kind": "book",
        "year": 2024
      },
      {
        "title": "Church Music Through the Lens of Performance. Fortress Press, 2024.",
        "kind": "book",
        "year": 2024
      },
      {
        "title": "“Performing Race and Place Through Hymn-Singing: A Brazilian Perspective.” In Hymns and Constructions of Race: Mobility, Agency, De/Coloniality, edited by Philip Burnett, Philip Johnson- Williams, and Erin Johnson-Williams. Routledge, 2024.",
        "kind": "chapter",
        "year": 2024
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Church Music, Baylor University",
      "Master of Music, Federal University of Parana (UFPR), Brazil",
      "Bachelor of Music, Parana School of Music and Arts (EMBAP), Brazil"
    ]
  },
  {
    "id": "perkins-stevenson-moessner",
    "name": "Jeanne Stevenson-Moessner",
    "title": "Susanna Wesley Centennial Chair in Practical Theology; Professor of Pastoral Care and Pastoral Theology",
    "areas": [
      "pastoral-care-counseling",
      "practical-theology"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "jmoessne@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/stevenson-moessner",
    "publications": [
      {
        "title": "Physician of Souls: Ministry as Medicine. Fortress Press, 2024.",
        "kind": "book",
        "year": 2024
      },
      {
        "title": "“(De)colonizing the Image of Female Beauty and (De)commodifying Women: the Industry of Plastic Surgery in Brazil and Texas.” In (De)coloniality and Religious Practices: Liberating Hope, edited by Valburga Schmiedt Streck, Júlio Cézar Adam, and Cláudio Carvalhaes. International Academy of Practical Theology Conference Series, 2021.",
        "kind": "chapter",
        "year": 2021
      },
      {
        "title": "Women with 2020 Vision: American Theologians on the Vote, Voice, and Vision of Women. Edited by Jeanne Stevenson-Moessner, Fortress Press, 2020.",
        "kind": "edited-volume",
        "year": 2020
      },
      {
        "title": "“Quilting at the Society for Pastoral Theology: Lessons Learned.” The Journal of Pastoral Theology 30 (January 14, 2020): 35-47.",
        "kind": "article",
        "year": 2020
      },
      {
        "title": "“‘She Knew She Could Spell’: Katie Geneva Cannon.” The Journal of Pastoral Theology 29, no. 3 (November 8, 2019): 180-185.",
        "kind": "article",
        "year": 2019
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "Dr. of Theology, University of Basel, 1986",
      "MA, Princeton Theological Seminary, 1975",
      "AB, Vanderbilt University, 1970"
    ]
  },
  {
    "id": "perkins-stone",
    "name": "Bryan P. Stone",
    "title": "Leighton K. Farrell Endowed Dean; Professor of Theology",
    "areas": [
      "systematic-theology",
      "evangelism-church-planting"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "bpstone@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/about/dean-bryan-stone",
    "publications": [
      {
        "title": "Christianity and Horror Cinema. Routledge, 2025.",
        "kind": "book",
        "year": 2025
      },
      {
        "title": "Finding Faith Today. Cascade Books, 2018.",
        "kind": "book",
        "year": 2018
      },
      {
        "title": "Evangelism after Pluralism: The Ethics of Christian Witness. Baker Academic, 2018.",
        "kind": "book",
        "year": 2018
      },
      {
        "title": "Evangelism after Christendom: The Theology and Practice of Christian Witness. Brazos Press, 2007.",
        "kind": "book",
        "year": 2007
      },
      {
        "title": "Faith and Film: Theological Themes at the Cinema. Chalice Press, 2000.",
        "kind": "book",
        "year": 2000
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, Religious Studies, Southern Methodist University, 1992",
      "MDiv, Nazarene Theological Seminary",
      "BA, Religion and Philosophy, Southern Nazarene University"
    ]
  },
  {
    "id": "perkins-sutton-adams",
    "name": "Hannah Sutton-Adams",
    "title": "Visiting Assistant Professor of Pastoral Care",
    "areas": [
      "pastoral-care-counseling"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "hlsutton@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/sutton-adams",
    "degrees": [
      "PhD, Theology and Education, Boston College, 2025",
      "MDiv, Perkins School of Theology, Southern Methodist University, 2018",
      "BA, Missiology (minor in English), Lubbock Christian University, 2015"
    ]
  },
  {
    "id": "perkins-walker",
    "name": "Theodore Walker Jr.",
    "title": "Associate Professor of Theological Ethics and Society, Theology and the Sciences",
    "areas": [
      "ethics-public-theology",
      "religion-and-science",
      "black-church-studies"
    ],
    "schoolArea": "The Interpretation of the Christian Witness",
    "email": "twalker@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/walker",
    "publications": [
      {
        "title": "“Viewing the World through a Microscope Lens (and Drama among Nazis): The Life of Ernest Everett Just.” In Leading Figures in the History of Omega Psi Phi Fraternity, edited by Judson L. Jeffries. University Press of Florida, 2025.",
        "kind": "chapter",
        "year": 2025
      },
      {
        "title": "“Interdisciplinary Convergences with Biology and Ethics … Ernest Everett Just and … Fred Hoyle.” In Panentheism and Panpsychism, edited by Godehard Brüntrup, Benedikt Paul Göcke, and Ludwig Jaskolla. Verlag Brill, 2019.",
        "kind": "chapter",
        "year": 2019
      },
      {
        "title": "The Big Bang and God: An Astro-Theology. Co-authored with Theodore Walker, Jr. and Chandra Wickramasinghe. Palgrave Macmillan, 2015.",
        "kind": "book",
        "year": 2015
      },
      {
        "title": "Whiteheadian Ethics: Abstracts and Paper from the Ethics Section of the Philosophy Group at the 6th International Whitehead Conference at the University of Salzburg, July 2006. Cambridge Scholars Publishing, 2008.",
        "kind": "book",
        "year": 2008
      },
      {
        "title": "Mothership Connections: A Black Atlantic Synthesis of Neoclassical Metaphysics and Black Theology. Albany: State University of New York Press, 2004",
        "kind": "book",
        "year": 2004
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "PhD, University of Notre Dame, 1983",
      "BA, University of North Carolina at Chapel Hill, 1976"
    ]
  },
  {
    "id": "perkins-wan",
    "name": "Sze-kar Wan",
    "title": "Professor of New Testament",
    "areas": [
      "new-testament"
    ],
    "schoolArea": "The Biblical Witness",
    "email": "swan@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/wan",
    "publications": [
      {
        "title": "“Two Pseudo-Philonic Works: A New Translation and Introduction.” In More Old Testament Pseudepigrapha, edited by James Davila. Eerdmans, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "“Mainstreaming the Minoritized: Galatians 3:28 as Ethnic Construction.” In Paul’s Gospel, Empire, Race, and Ethnicity: Through the Lens of Minoritized Scholarship, edited by Yung Suk Kim. Pickwick, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "“Reading Romans in Midst of Empires: Chinese Readers Grappling with Romans 13.1–7.” In Global Readings of the New Testament, edited by M. Kovalishyn. Baker, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "“‘I speak to you Gentiles’: Asian Americans as Liminal Gentiles.” In Preaching Romans from Here: Diverse Voices Engage Paul’s Most Famous Letter, edited by L. M. Bowens, et al. Cascade Books, 2024.",
        "kind": "chapter",
        "year": 2024
      },
      {
        "title": "Romans: Empire and Resistance. Bloomsbury, 2021. FACULTY BOOKS",
        "kind": "book",
        "year": 2021
      }
    ],
    "publicationsSource": "https://www.smu.edu/perkins/facultyacademics/faculty-publications",
    "publicationsAsOf": "2025-09-01",
    "degrees": [
      "ThD, Harvard University Divinity School, 1992",
      "MDiv, Gordon-Conwell Theological Seminary, 1982",
      "AB, Brandeis University, 1975"
    ]
  },
  {
    "id": "perkins-white",
    "name": "Pam White",
    "title": "Clinical Assistant Professor in the Intern Program",
    "otherRoles": [
      "Assistant Dean for Contextual Education",
      "Director of the Intern Program"
    ],
    "areas": [
      "practical-theology",
      "congregational-leadership"
    ],
    "schoolArea": "The Witness of the Church and its Ministry",
    "email": "pewhite@smu.edu",
    "profileUrl": "https://www.smu.edu/perkins/facultyacademics/facultylistinga-z/white",
    "degrees": [
      "DMin, Perkins School of Theology, Southern Methodist University",
      "MDiv, Perkins School of Theology, Southern Methodist University",
      "MA, Amberton University",
      "BS, University of North Texas"
    ]
  }
];

function buildFaculty(): FacultyMember[] {
  // ids come straight from the original hand-assembled file's ids (surname-
  // based, e.g. "perkins-stone" not "perkins-dean-bryan-stone") — kept
  // explicit per-entry rather than derived from profileUrl, since Stone's
  // profileUrl points at his dean bio page, not the facultylistinga-z
  // pattern the other 28 use.
  return ROSTER.map((e) => ({ seminarySlug: "perkins", ...e }));
}

async function main() {
  // Touch every page this data is built from, so a future --fresh run has a
  // real cache to diff against even though the fields themselves were
  // assembled by hand from a careful read, same reasoning as Claremont's and
  // Saint Paul's harvests.
  await get(ROSTER_URL, { fresh });
  for (const e of ROSTER) {
    if (e.name !== "Bryan P. Stone") await get(e.profileUrl, { fresh });
  }
  await get(`${BASE}/perkins/about/dean-bryan-stone`, { fresh });
  const pubPdf = await get(PUBLICATIONS_PDF_URL, { fresh, binary: true });
  pdfToText(pubPdf.path); // touched for cache parity; not re-parsed here — see header note

  const faculty = buildFaculty();
  await writeFile(join(ROOT, "data/faculty/perkins.json"), JSON.stringify(faculty, null, 2) + "\n", "utf8");
  console.log(`wrote ${faculty.length} faculty to data/faculty/perkins.json`);

  const profile = buildProfile();
  await writeFile(join(ROOT, "data/seminaries/perkins.json"), JSON.stringify(profile, null, 2) + "\n", "utf8");
  console.log("wrote data/seminaries/perkins.json");
}

function buildProfile(): SeminaryProfile {
  // Unchanged from the pre-harvester hand-assembled profile except
  // lastVerified and facultyNote (new) — this pass touched faculty degrees
  // only, not ordination/cost/degree-program data, which a different pass
  // already verified against Perkins' own pages/PDFs (see each block's own
  // source/asOf).
  return {
  "slug": "perkins",
  "name": "Perkins School of Theology",
  "city": "Dallas",
  "state": "TX",
  "url": "https://www.smu.edu/perkins",
  "lastVerified": today(),
  "ordination": {
    "senateStanding": {
      "value": "approved-umc",
      "source": "https://www.gbhem.org/education/schools-of-theology/",
      "asOf": "2026-07-07",
      "note": "One of the 13 United Methodist schools of theology."
    },
    "onlineCredit": {
      "value": "fully-counts",
      "source": "https://www.gbhem.org/education/schools-of-theology/",
      "asOf": "2026-07-07",
      "note": "GBHEM: all United Methodist schools of theology are approved to provide a fully online M.Div. that meets the educational requirements for UM ordination."
    },
    "coverageSource": "https://www.smu.edu/-/media/site/perkins/registrar/old-new-curriculum-table-ver-3-(2).pdf",
    "coverageAsOf": "2024-08-01",
    "coverage": [
      {
        "area": "old-testament",
        "status": "required",
        "note": "OT 6300 in the core."
      },
      {
        "area": "new-testament",
        "status": "required",
        "note": "NT 6300 in the core."
      },
      {
        "area": "theology",
        "status": "required",
        "note": "ST 6303 Systematic Theology in the core."
      },
      {
        "area": "church-history",
        "status": "required",
        "note": "HX 6300 in the core."
      },
      {
        "area": "preaching",
        "status": "required",
        "note": "PR 6300 Preaching in the core."
      },
      {
        "area": "worship-liturgy",
        "status": "required",
        "note": "WO 6313 Worship in the core."
      },
      {
        "area": "mission-of-the-church",
        "status": "occasional",
        "note": "No core course is labelled this way. MT 6300 Christian Ethics in Social Context is required, and the Division II and IV core electives include World Christianity (WX) and Christianity and Society (XS) options that plausibly satisfy it. Which course your board accepts is a question for your registrar \u2014 don't assume."
      },
      {
        "area": "evangelism",
        "status": "elective",
        "note": "Evangelism (EV) is one of roughly eleven options for the single Division IV practical core elective, and is otherwise unrestricted elective space. Choosable, but not automatic."
      },
      {
        "area": "um-studies",
        "status": "elective",
        "note": "Nothing in the required core covers United Methodist doctrine, polity, or history. The old degree plan states plainly that the 24 unrestricted elective hours \u201cmay include United Methodist Studies and Evangelism.\u201d \u00b6324.4 asks for a minimum of 6 semester hours here."
      }
    ],
    "gapSummary": [
      "Six of the nine \u00b6324.4 areas are in the required core and take care of themselves. Three are not. United Methodist studies \u2014 the 6-hour one \u2014 sits in elective space, as does evangelism, and no core course is labelled \u201cmission of the church in the world.\u201d",
      "This is the thing to notice about a Perkins M.Div.: it is a United Methodist seminary, but the United Methodist studies requirement is something you choose, not something the degree hands you. Plan the elective block around it in your first year rather than discovering the gap in year three."
    ],
    "gapRemedies": [
      {
        "blurb": "Build the 24 unrestricted elective hours around \u00b6324.4 from the start. Six hours of United Methodist studies, three of evangelism, and a course your board will accept for mission of the church \u2014 that is half the elective block, and it still leaves twelve hours free.",
        "url": "https://www.smu.edu/perkins/facultyacademics/degrees/mdiv-inperson"
      },
      {
        "blurb": "Perkins also offers the \u00b6324.4 studies on their own, outside a degree. The nondegree \u201cBasic Graduate Theological Studies\u201d track exists for UMC deacons and for anyone closing a gap.",
        "url": "https://www.smu.edu/perkins/facultyacademics/degrees/otherpgms"
      },
      {
        "blurb": "Ask the Perkins registrar for the current M.Div. degree-progress sheet, and ask your conference's Board of Ordained Ministry registrar which specific course numbers they accept for each \u00b6324.4 area. They make the call, not the catalogue and not us."
      }
    ]
  },
  "scale": {
    "outcomes": {
      "value": "97.1% of reporting M.Div. graduates were employed, in the military, in continuing education, or in volunteer service",
      "source": "https://www.smu.edu/perkins/facultyacademics/degrees/mdiv-inperson",
      "asOf": "2024-06-30",
      "note": "Perkins reports this for academic year 2023\u201324, and it counts *reporting* graduates only."
    }
  },
  "cost": {
    "tuitionPerCredit": {
      "value": "$799 per credit hour (master's, Dallas or hybrid)",
      "source": "https://www.smu.edu/perkins/admission/affording-seminary/cost-summary",
      "asOf": "2026-07-01",
      "note": "Academic year 2026\u201327. D.Min. is $928 and D.P.M. $906. Fees are charged on top \u2014 see below."
    },
    "fees": [
      {
        "label": "General student fee",
        "amount": "$338 per term credit hour, $4,040 maximum"
      },
      {
        "label": "Distance learning fee (hybrid)",
        "amount": "$100 per term credit hour"
      },
      {
        "label": "Hybrid technology fee",
        "amount": "$50 per term"
      },
      {
        "label": "Community life fee",
        "amount": "$25 per term, Dallas and hybrid students"
      }
    ],
    "pctReceivingAid": {
      "value": "98% of master's degree-seeking students",
      "source": "https://www.smu.edu/perkins/admission/affording-seminary",
      "asOf": "2026-08-06"
    },
    "typicalAward": {
      "value": "$17,200 average annual tuition scholarship",
      "source": "https://www.smu.edu/perkins/admission/affording-seminary",
      "asOf": "2026-08-06",
      "note": "For full-time, degree-seeking students. An average, not a floor \u2014 awards vary."
    },
    "aidContact": {
      "name": "Christina Rhodes",
      "role": "Assistant Dean of Enrollment Management",
      "email": "csrhodes@smu.edu",
      "phone": "214-768-3411"
    },
    "honestNote": "The sticker figure most people quote is tuition alone. Perkins charges a general student fee per credit hour on top of it, and hybrid students add two more. Ask for a full cost-of-attendance sheet, not a per-credit number \u2014 and note that applying for admission is also the scholarship application, so applying early matters: Perkins says its funds go first-come, first-served."
  },
  "degrees": [
    {
      "name": "Master of Divinity",
      "abbr": "M.Div.",
      "credits": 75,
      "typicalYears": "3\u20137 years; all requirements within 7 calendar years of first registration",
      "modalities": [
        "residential",
        "hybrid"
      ],
      "blurb": "The ordination degree. 75 credit hours including a supervised internship, with 24 credit hours of elective space.",
      "url": "https://www.smu.edu/perkins/facultyacademics/degrees/mdiv-inperson"
    },
    {
      "name": "Maestr\u00eda en Divinidad",
      "abbr": "M.Div. en espa\u00f1ol",
      "modalities": [
        "hybrid"
      ],
      "blurb": "The M.Div. taught in Spanish \u2014 fully in Spanish for the first two years, with the option to move to a bilingual track after that.",
      "url": "https://www.smu.edu/perkins/facultyacademics/degrees/mdiv-spanish",
      "flag": "New: first cohort begins fall 2026."
    },
    {
      "name": "Master of Arts in Ministry",
      "abbr": "M.A.M.",
      "credits": 36,
      "modalities": [
        "residential",
        "hybrid"
      ],
      "blurb": "36 credit hours plus an internship, for ministerial leadership that doesn't require the full M.Div.",
      "url": "https://www.smu.edu/perkins/facultyacademics/degrees"
    },
    {
      "name": "Master of Theological Studies",
      "abbr": "M.T.S.",
      "credits": 48,
      "modalities": [
        "residential"
      ],
      "blurb": "48 credit hours plus a thesis or summative project. Not an ordination degree \u2014 lay leadership, personal study, or groundwork for a PhD.",
      "url": "https://www.smu.edu/perkins/facultyacademics/degrees/mts"
    },
    {
      "name": "Master of Sacred Music",
      "abbr": "M.S.M.",
      "modalities": [
        "residential"
      ],
      "blurb": "For church musicians; paired with a Doctor of Pastoral Music.",
      "url": "https://www.smu.edu/perkins/facultyacademics/degrees/msm"
    },
    {
      "name": "Basic Graduate Theological Studies (nondegree)",
      "abbr": "Nondegree",
      "modalities": [
        "residential",
        "hybrid"
      ],
      "blurb": "The \u00b6324.4 studies taken on their own, without enrolling in a degree. Built for UMC deacons and for anyone closing a gap.",
      "url": "https://www.smu.edu/perkins/facultyacademics/degrees/otherpgms"
    }
  ],
  "concentrations": [
    "African American church studies",
    "Baptist studies",
    "Health care chaplaincy",
    "Pastoral care",
    "Theology and science"
  ],
  "partnerships": [
    {
      "kind": "host-university",
      "partner": "Southern Methodist University",
      "blurb": "Perkins is a school within SMU, on the Dallas campus at 5905 Bishop Blvd.",
      "url": "https://www.smu.edu/"
    },
    {
      "kind": "extension",
      "partner": "Houston\u2013Galveston sites",
      "blurb": "Classes meet regularly in Houston at St. Paul's UMC, Houston Methodist Hospital, and St. John's UMC downtown; in Galveston at Moody Memorial First UMC. You can serve a Gulf Coast appointment and still take courses in person.",
      "url": "https://www.smu.edu/perkins/about/other-locations"
    },
    {
      "kind": "extension",
      "partner": "Immersion sites beyond Dallas",
      "blurb": "The in-person requirement for the M.Div. and M.A.M. can be met through week-long immersions held in Dallas, Houston\u2013Galveston and elsewhere \u2014 recent ones in McAllen and Waco, Texas, and Memphis, Tennessee. Perkins says it adds locations based on where students actually live.",
      "url": "https://www.smu.edu/perkins/about/other-locations"
    },
    {
      "kind": "consortium",
      "partner": "Bridwell Library",
      "blurb": "Perkins' own theological library, with special collections and the Center for World Methodism.",
      "url": "https://www.smu.edu/perkins/facultyacademics/bridwelllibrary"
    }
  ],
  "courseOfStudy": {
    "blurb": "Perkins administers the United Methodist Regional Course of Study School \u2014 the five-year curriculum required of licensed local pastors who are not in a seminary degree program \u2014 in partnership with GBHEM. It runs in English and, as Curso de Estudio, in Spanish.",
    "url": "https://www.smu.edu/perkins/publicprograms/coss-english"
  },
  "contact": {
    "admissionsUrl": "https://www.smu.edu/perkins/admission",
    "visitUrl": "https://www.smu.edu/perkins/admission/visit",
    "email": "perkins@smu.edu",
    "phone": "214-768-8436"
  },
  "facultyNote": "Perkins publishes no per-professor bio pages on the main facultyacademics/facultylistinga-z roster page itself (name, title, area, email only) \u2014 but a second-pass check (2026-08-07) found that each of the 28 non-dean faculty DOES have its own individual page at smu.edu/perkins/facultyacademics/facultylistinga-z/<surname-slug>, linked from the roster but not obvious from it, and every one of those 28 pages carries a degrees line (institution and, for most, year). Dean Bryan Stone's degrees come from his separate dean bio page. All 29 are checked, not sampled \u2014 the 'Perkins has no per-professor pages' assumption in the first pass was wrong; it only checked the roster page and the annual publications PDF, never the individual profile links. Publications remain sourced from Perkins' own annual Faculty Publications PDF (26/29), matched by name to the roster; email remains sourced from the same PDF's byline match (28/29). Degrees are not in that PDF and were pulled separately from the individual pages."
};
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
