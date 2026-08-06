# The seminary harvester

Phase 2 of `research/seminary-pages-plan.md`: the school-agnostic parts, pulled
out of the Perkins, Austin Presbyterian, and Brite harvests once the pattern
was clear.

Scripts run on **Node's native type stripping** — no `tsx`, no build step, no
new dependency. Hence the `.mts` extension and explicit `.ts`/`.mts` import
paths.

```
pnpm harvest:senate            # check GBHEM's roster, report any diff, write nothing
pnpm harvest:senate --write    # accept the changes
pnpm harvest:senate --fresh    # bypass the week-long fetch cache
pnpm harvest:validate          # check every harvested file; exits non-zero on error
pnpm harvest:areas-check       # compare the area normalizer against recorded data
```

## What's here

| File | Does |
|---|---|
| `lib/fetch.mts` | Identifies itself, honours robots.txt, rate-limits per host, caches to `.harvest-cache/` for a week |
| `lib/text.mts` | HTML→text preserving block boundaries; `pdfToText` via poppler; link extraction |
| `lib/areas.mts` | Faculty title → `StudyArea[]`. Suggests only — see the honest note below |
| `lib/validate.mts` | The rules a harvested file must pass |
| `senate.mts` | GBHEM's approved-schools roster → `data/senate-roster.json`, with diff detection |
| `validate.mts` | CLI over every file in `data/` |

## Rules the validator enforces

These exist because a rule nobody can break is not a rule.

- **Every rendered fact carries a source URL and an `asOf` date.** Warns past 400 days.
- **The asymmetric online rule.** A UMC school must be `fully-counts`; a
  Senate-approved non-UMC school must be `none-counts`. GBHEM's wording, made
  un-forgettable.
- **A coverage table is all nine ¶324.4 areas or none.** A partial table reads
  as a complete one. Brite ships with no table for exactly this reason.
- **A `required-umc-track` row must name who is bound.** Its note has to say, in
  words, that it binds United Methodist students, and which course does it.
- **Any area not `required` needs a note**, and any set of gaps needs both a
  `gapSummary` and at least one `gapRemedy`. Naming a problem without a route
  through it is not the tone this site takes.
- **Senate standing must agree with the stored roster.** A profile cannot claim
  approval GBHEM has not given, and a monitored school must say so.
- **Publications need a source and a date**, cap at five, and are checked for
  the parsing failures that citation-scraping actually produces: a title lost to
  a series code, two citations run together, a truncated author list.
- **An honorary doctorate may never be someone's only degree.** It would render
  as their training. Margaret Aymer's Hood DHumLitt is why this check exists.

## Two rules the pilot batch bought, expensively

**1. Three statuses, not two — because two agents scored the same structure
oppositely.** Duke's bulletin ("UMC students must fulfill educational
requirements... by completing PARISH 777 and 778...") and Phillips' catalogue
("UMC students must also take a course on evangelism, normally fulfilled by
taking PL 725") describe the identical arrangement: not in the universal core,
but binding on United Methodist ordination-track students. Scored independently,
Duke came back 5/9 and Phillips 9/9 — numbers that cannot sit in the same table.
Hence `required-umc-track`. Ask of every row: *required of everyone, required of
me because I'm United Methodist, or merely available?* Those are three different
answers and the reader deserves to know which.

**Where the line falls: does the school state the obligation as its own, or
disclaim it?** Every one of the nine is the *church's* requirement — ¶324.4 binds
the candidate whatever school they attend. What varies is whether the school
takes it up. Four schools, four different sentences, and the difference between
them is the whole of this judgment:

| School | Its own words | Score |
|---|---|---|
| Phillips | "Requirements in Denominational Studies… required to take" — a degree slot every student fills with their own denomination's courses | `required-umc-track` |
| Duke | "must fulfill… by completing", and names them "required electives" | `required-umc-track` |
| Wesley | "church requirements for ordination **and not a Seminary requirement**… Wesley students take these courses as electives" | `elective` |
| Saint Paul | "*may be expected* to take… check with your appropriate judicatories" | `elective` |

A school that points at the Discipline and steps back has left the work to the
student. That is `elective`, and it needs a `gapSummary` and a `gapRemedy` — the
candidate still has to satisfy ¶324.4, and the page's job is to say so and show
the route. Naming specific course numbers does not change this: Wesley names
full course menus and still disclaims the requirement.

The test is **whether the obligation binds, not whether the school names the
course.** Duke names PARISH 777/778 for UM studies and nothing at all for
evangelism or mission, yet its "Ordination Requirements" section binds a UMC
student to all four. Scoring the unnamed ones `elective` would reproduce the very
error this value exists to prevent. Where no course is named, say so in the
note — that is a fact about how hard the requirement is to plan around, not about
whether it binds.

**2. A school's own ¶324.4 mapping is a lead, never the evidence.** Phillips
publishes a table mapping the nine areas to its own courses — the only school so
far that does — and it is genuinely useful for finding the courses fast. It is
not proof. That same document states United Methodist studies as "12
semester-hours" while the three courses it lists sum to 9. A catalogue that
cannot add its own hours cannot be taken at its word about its own compliance.
Verify each row against the stated degree requirements; cite the school's mapping
as corroboration at most.

## On the area normalizer, honestly

It agrees exactly with hand-recorded areas on **28 of 66** people across the
first three schools. That number is not a tuning target.

Most misses are areas a human took from a bio or publication list, not a job
title. Ángel Gallardo's title says "Assistant Professor of Church History" and
gives no hint that he teaches Methodism — the single most useful fact about him
for a UMC candidate at a Presbyterian seminary. Titles carry roughly half the
signal.

Its more valuable use turned out to be the reverse: run against existing data,
it flagged two Brite entries whose areas had come from background knowledge
rather than from Brite's own pages. Both were then sourced properly. Treat
`harvest:areas-check` as an audit of the data at least as much as a draft of it.

## Adding a school

1. `pnpm harvest:senate` — confirm the school is on the roster and note its standing.
2. Write `<slug>.mts` using `lib/fetch.mts` and `lib/text.mts`. Expect it to be
   bespoke; all three schools so far needed different handling (Perkins: PDFs.
   Austin: a JS modal per professor, with no per-professor page. Brite: JS
   pagination). The shared library is for fetching, text, and checking — not for
   pretending the schools are alike.
3. Emit `data/seminaries/<slug>.json` and `data/faculty/<slug>.json`.
4. `pnpm harvest:validate` until clean.
5. Register both in `content/seminary-profiles.ts`, add the directory entry in
   `content/seminaries.ts`, and write the editorial layer with `draft: true`.
6. Leave `workingOn` empty unless a human has read that person's work.

## Cadence

- **GBHEM roster: annually, and a diff is not routine.** A school leaving the
  list or entering monitoring changes what someone part-way through a degree can
  do with it. Read the page, update the affected profiles *and*
  `research/gbhem-approved-schools-snapshot.md`, then `--write`.
- **Tuition and enrolment: annually**, late summer.
- **Faculty and electives: per term.**
