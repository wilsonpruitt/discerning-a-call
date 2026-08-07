# Faculty deep-scrape tracker

Tracks per-school coverage of faculty **profile links, degrees, publications, and
email**, and how hard a deeper pass would be. Every school has *some* faculty
data (name/title/area, per the harvest's core scope), but depth beyond that
varies a lot — this is where to look before assuming a gap is "just how the
school is" versus "we didn't dig deep enough yet."

Snapshot taken 2026-08-07, after the boston/claremont/drew/gammon/iliff/mtso
batch. Re-run the counts below with:

```
node -e "
const fs = require('fs');
for (const f of fs.readdirSync('data/faculty').sort()) {
  const d = JSON.parse(fs.readFileSync('data/faculty/'+f));
  const n = d.length;
  console.log(f.replace('.json',''), 'n='+n,
    'perPersonURL='+(new Set(d.map(m=>m.profileUrl)).size>1),
    'pubs='+d.filter(m=>m.publications?.length).length+'/'+n,
    'degrees='+d.filter(m=>m.degrees?.length).length+'/'+n,
    'email='+d.filter(m=>m.email).length+'/'+n);
}"
```

## Legend

- **Per-person pages** — does the school publish an individual page per
  professor (yes/no/partial), and what stands in the way of reading it
  (nothing, a JS modal, a linked PDF, Cloudflare).
- **Priority** — HIGH = a real, fixable gap worth a follow-up harvest pass.
  MEDIUM = partial gap, moderate effort or uncertain payoff. LOW = already
  near the ceiling of what the school publishes; further digging would mean
  going off-site (personal sites, ORCID, Google Scholar), which is a
  different and heavier kind of harvest, not "we missed something here."

| School | n | Per-person pages | Degrees | Pubs | Email | Priority | Notes |
|---|---|---|---|---|---|---|---|
| **Candler** | 53 | No (built pre-harvester, pilot era) | 0/53 | 0/53 | 0/53 | **HIGH** | The one real outlier — zero depth on anything beyond name/title/area. Every other school went through the modern `.mts` harvester; Candler didn't. Full re-harvest with the current pattern would likely bring it in line with Duke/Garrett-tier schools. Biggest single-school payoff on this list (53 people). |
| **Brite** | 18 | Partial (2 distinct URLs — some pagination) | 0/18 | 9/18 | 0/18 | **HIGH** | Zero degrees despite having *some* individual access — looks like the harvest captured publications but never went back for degrees. Worth a targeted re-pass just for the `degrees` field. |
| **Wesley** | 32 | No, but bios are Elementor popups already embedded in the same page HTML — no JS rendering needed, just more careful parsing | 14/32 | 10/32 | 0/32 | **HIGH** | The harvest script's own note says this is mechanically easy (no browser wall) — the low coverage is a parsing-depth choice, not a site-access blocker. Best effort-to-payoff ratio on this list. |
| **Drew** | 25 | No — only a linked CV PDF per person, never opened | 24/25 | 0/25 | 0/25 | **HIGH** | Clear, bounded task: open 25 PDFs. Degrees already came from the directory page itself; publications and `workingOn` are sitting behind PDFs nobody's read yet. |
| **Vanderbilt** | 19 | Yes, every person has a bio page | 15/19 | 6/19 | 0/19 | **HIGH** | Per-person pages exist and were read once already; the harvest's own note says "most of the 19 have none listed" for publications — worth a second look to confirm that's really true page-by-page rather than a parsing miss, given Boston's harvest found long-CV pages need hand-picking rather than a clean heading match. |
| **Phillips** | 9 | Partial — 5 of 9 have bio pages, 4 don't | 5/9 | 3/9 | 9/9 | **HIGH** | Small (9 people) — cheap to fully re-pass. Already has 100% email coverage, so a deeper pass here is low-risk, high-completion-rate. |
| **Garrett** | 38 | Yes | 33/38 | 18/38 | 0/38 | MEDIUM | Real per-person pages via a WordPress REST endpoint (documented, reusable). Decent coverage already; more publications likely available with a fuller per-page read. |
| **Claremont** | 26 | Yes — real individual pages at `cst.edu/faculty/<slug>/`, no modal at all (this row's "FinalSite modal" description was wrong; corrected 2026-08-07) | 24/26 | 21/26 | 0/26 | DONE (2026-08-07) | Each bio page carries a real "Publications" heading the first pass never read past degrees on. Second pass read all 18 gap people's full pages: 13 had genuine sourced publications (10 via a "Publications" heading, 3 — Froelich, Hagiya, C. Miller — via book/chapter titles named in bio prose). 5 (Latif, MacKinnon, Shaikh, Song, Stowe) truly have none. No site-wide faculty-scholarship page exists on cst.edu beyond the individual bio pages. |
| **MTSO** | 14 | Yes | 14/14 | 11/14 | 0/14 | MEDIUM | Nearly complete — 3 people (Baek, Gibson, Stroud) only link a CV PDF instead of listing publications in-page. Small, bounded: open 3 PDFs. |
| **Austin Presbyterian** | 19 | No — FinalSite JS modal, no dedicated page | 18/19 | 0/19 | 0/19 | MEDIUM | Degrees already fully harvested via the modal (this is likely at ceiling for what the modal itself offers). Publications would need a different source per person (CV, personal site) — real effort, uncertain payoff. |
| **Duke** | 49 | Yes | 44/49 | 2/49 | 0/49 | MEDIUM | The harvester specifically looks for a "Selected Publications → Books" heading on each bio page — and finds one on only 2 of 49. That's evidence most Duke bio pages genuinely don't have that section (long personal CVs instead, per Boston's precedent), not a parsing bug — but worth confirming by spot-checking a few pages before writing this off as "that's just Duke." |
| **Gammon** | 9 | No — no per-professor bio pages published | 9/9 | 1/9 | 0/9 | LOW | Small, newly independent (2024) school with thin web infrastructure by design — degrees are already fully sourced from each person's own CV/site/institutional bio elsewhere (cited per-person). Likely near the ceiling of what's publicly findable right now. |
| **Perkins** | 29 | Yes for 2 people; roster-only for the rest | 0/29 | 26/29 | 28/29 | LOW | The deepest-covered school on email and publications (its own annual Faculty Publications PDF, matched to the directory). Degrees are the one true gap, but Perkins publishes no per-professor bio pages to source them from — would need an external source per person. |
| **Iliff** | 16 | Yes for 14, "(Coming Soon)" for 2 | 13/16 | 12/16 | 0/16 | LOW | Already solid. The 2 gaps (George Schmidt, Candice NunnTelfort) have no live bio page yet on Iliff's own site — nothing to scrape until the school publishes one. Re-check on the next annual re-harvest. |
| **Saint Paul** | 10 | Yes | 9/10 | 10/10 | 0/10 | LOW | Essentially complete. Best-covered small school on this list. |

## What "needs a deeper scrape" actually means, school by school

Two different problems hide under one label:

1. **We have the access but didn't fully use it** (Brite's degrees, Wesley's
   popups, Vanderbilt's pub lists, Duke's spot-check) — a re-run of the
   existing `.mts` script with more thorough per-page reading closes these.
   Low risk, no new blocker to solve.
2. **We don't have real per-person access yet** (Drew's CVs, MTSO's 3
   holdouts, Phillips' 4 missing pages, Austin's/Claremont's modal ceiling) —
   closing these means opening PDFs or working within a JS modal's actual
   limits, not a script tweak.

Candler is the one school in neither bucket — it just predates the harvester
entirely and needs the full treatment from scratch.

## Email, as a separate note

Only Perkins and Phillips have any faculty email captured — everywhere else
it's 0/n, but that's very likely because no agent went looking for it, not
because the other 14 schools don't publish it. Faculty bio pages commonly
list an email; this was simply never a harvest target outside those two
schools (Perkins' because it rode along with the PDF match; Phillips'
because it was on the same bio page as degrees). A cheap add: for any school
already in the HIGH/MEDIUM bucket above with real per-person pages (Boston,
Claremont, Duke, Garrett, Iliff, MTSO, Saint Paul, Vanderbilt), pull email at
the same time as the deeper publications/degrees pass — no separate visit
needed.

## Suggested order, if doing a follow-up pass

1. Candler (full re-harvest, biggest single-school gap)
2. Wesley, Brite, Drew (cheapest wins — access already proven, just needs
   more thorough reading or a few PDFs opened)
3. Phillips, MTSO (small, nearly done, cheap to finish)
4. Vanderbilt, Garrett, Claremont (spot-check + deepen where the school
   genuinely publishes more than was captured)
5. Duke, Austin Presbyterian, Gammon, Perkins (likely near ceiling — confirm
   before spending real effort)
6. Iliff, Saint Paul (already essentially complete — skip unless doing the
   annual re-harvest anyway)

Not scored yet: the 20 remaining non-UMC schools this project hasn't
harvested at all (see `discerning-a-call` memory / `NOW.md` for that list) —
this tracker only covers the 16 schools already live.
