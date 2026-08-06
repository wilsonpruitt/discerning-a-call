import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  seminaryProfiles,
  seminaryProfileBySlug,
  seminaryEditorialBySlug,
  facultyBySeminary,
  groupByArea,
} from "@/content";
import {
  basicStudyAreaLabels,
  studyAreaLabels,
  type CoverageStatus,
  type RequirementCoverage,
} from "@/content/types";
import { Container, PageHeader, Card, Eyebrow, Pill, SectionTitle } from "@/components/ui";
import { Fact, SourceLine } from "@/components/sourced-fact";

export function generateStaticParams() {
  return seminaryProfiles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = seminaryProfileBySlug[slug];
  if (!profile) return {};
  return {
    title: profile.name,
    description: `What a discerner needs to know about ${profile.name} — who teaches there, what it costs, what the M.Div. requires, and where it leaves you against ¶324.4.`,
  };
}

const COVERAGE_TONE: Record<CoverageStatus, "ok" | "reed" | "info" | "neutral"> = {
  required: "ok",
  elective: "reed",
  occasional: "reed",
  absent: "neutral",
};

const COVERAGE_LABEL: Record<CoverageStatus, string> = {
  required: "In the core",
  elective: "Elective — you must choose it",
  occasional: "Unclear — ask",
  absent: "Not offered here",
};

// The earned terminal degree — never the last item in the list, which may be an
// honorary doctorate. Honoris causa is an honour, not a qualification, and
// showing it as someone's training would misrepresent them.
function terminalDegree(degrees: string[] | undefined): string | undefined {
  if (!degrees?.length) return undefined;
  const earned = degrees.filter((d) => !/honoris causa|honorary/i.test(d));
  const doctorate = earned.find((d) => /^(PhD|ThD|DPhil|DMin|EdD|DrTheol)/i.test(d));
  return doctorate ?? earned[earned.length - 1];
}

function CoverageRow({ row }: { row: RequirementCoverage }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-hairline py-3.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <div className="sm:w-[38%] sm:shrink-0">
        <p className="text-[15px] font-medium text-ink">
          {basicStudyAreaLabels[row.area]}
        </p>
      </div>
      <div className="sm:flex-1">
        <Pill tone={COVERAGE_TONE[row.status]}>{COVERAGE_LABEL[row.status]}</Pill>
        {row.note ? (
          <p className="mt-1.5 text-[13px] leading-snug text-muted">{row.note}</p>
        ) : null}
      </div>
    </div>
  );
}

export default async function SeminaryProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = seminaryProfileBySlug[slug];
  if (!profile) notFound();

  const editorial = seminaryEditorialBySlug[slug];
  const roster = facultyBySeminary(slug);
  const byArea = groupByArea(roster);
  const { ordination, cost, degrees, concentrations, partnerships, scale } = profile;

  const gaps = ordination.coverage?.filter((c) => c.status !== "required") ?? [];
  const pubSource = roster.find((m) => m.publicationsSource)?.publicationsSource;

  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-12 md:py-16">
          <p className="mb-5 text-[13px]">
            <Link
              href="/seminaries"
              className="unstyled text-muted underline decoration-hairline-strong underline-offset-2"
            >
              ← All seminaries
            </Link>
          </p>
          <PageHeader
            eyebrow={`${profile.city}, ${profile.state}`}
            title={profile.name}
            subtitle={
              ordination.senateStanding.value === "approved-umc"
                ? "One of the thirteen United Methodist schools of theology."
                : "Approved by the University Senate for United Methodist ordination."
            }
            lead={editorial?.lead}
          />
          {editorial?.draft ? (
            <p className="mt-6 rounded-md border border-reed bg-parchment px-4 py-3 text-[13px] text-reed-deep">
              Draft — this school's written sections have not had an editorial
              pass yet. The sourced facts below are checked; the prose is not.
            </p>
          ) : null}
        </Container>
      </section>

      <Container className="py-12 md:py-14">
        {/* --- Ordination first. It's the question underneath the question. --- */}
        <SectionTitle
          eyebrow="Where this leaves you"
          title="The Discipline's requirements, at this school."
        />
        <p className="prose mt-4 max-w-2xl text-[15px] text-muted">
          ¶324.4 asks for nine areas of basic graduate theological study, three
          semester hours each, with a minimum of six hours in United Methodist
          studies. Not pass/fail. ¶335.3(d) asks for them again at full
          connection, so they cannot be put off.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Fact
            label="University Senate standing"
            fact={{
              ...ordination.senateStanding,
              value:
                ordination.senateStanding.value === "approved-umc"
                  ? "Approved — a United Methodist school"
                  : ordination.senateStanding.value === "approved-non-umc"
                    ? "Approved — non–United Methodist"
                    : ordination.senateStanding.value === "monitoring-warning"
                      ? "Approved, but on Senate Monitoring with Public Warning"
                      : "Not on the University Senate list",
            }}
          />
          <Fact
            label="Do online classes count?"
            fact={{
              ...ordination.onlineCredit,
              value:
                ordination.onlineCredit.value === "fully-counts"
                  ? "Yes — a fully online M.Div. here meets the requirement"
                  : "No — no online or distance class here counts toward ¶324.4",
            }}
          />
        </div>

        {ordination.coverage ? (
          <Card className="mt-6 p-6 md:p-7">
            <Eyebrow>The nine areas</Eyebrow>
            <div className="mt-4">
              {ordination.coverage.map((row) => (
                <CoverageRow key={row.area} row={row} />
              ))}
            </div>
            {ordination.coverageSource && ordination.coverageAsOf ? (
              <SourceLine
                source={ordination.coverageSource}
                asOf={ordination.coverageAsOf}
              />
            ) : null}
          </Card>
        ) : null}

        {ordination.gapSummary ? (
          <Card editorial className="mt-5 p-6 md:p-7">
            <Eyebrow>
              {ordination.coverage
                ? `${gaps.length} of 9 need you to plan for them`
                : "What we could and could not verify"}
            </Eyebrow>
            <p className="prose mt-3 text-[15px] text-ink">{ordination.gapSummary}</p>
          </Card>
        ) : null}

        {ordination.gapRemedies?.length ? (
          <div className="mt-5 grid gap-3">
            {ordination.gapRemedies.map((r) => (
              <div
                key={r.blurb.slice(0, 40)}
                className="rounded-md border border-hairline bg-ivory p-5"
              >
                <p className="text-[15px] leading-relaxed text-ink">{r.blurb}</p>
                {r.url ? (
                  <p className="mt-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="unstyled text-[14px] font-medium underline decoration-hairline-strong underline-offset-2"
                    >
                      See the school's page ↗
                    </a>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-5 rounded-md border border-hairline-strong bg-parchment px-4 py-3 text-[14px] leading-relaxed text-ink">
          Confirm all of this with your conference&rsquo;s Board of Ordained
          Ministry registrar before you enroll. They decide which courses satisfy
          which requirement — not the catalogue, and not us.
        </p>

        {/* --- Faculty --- */}
        {roster.length ? (
          <>
            <SectionTitle
              eyebrow="Who teaches here"
              title="The faculty, by what they work on."
              className="mt-16"
            />
            <p className="prose mt-4 max-w-2xl text-[15px] text-muted">
              {roster.length} faculty, grouped by field rather than alphabetically
              — because the useful question is not who is here, it is who is here
              who works on the thing you care about.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[...byArea.entries()].map(([area, members]) => (
                <Card key={area} className="p-5">
                  <h3 className="font-serif text-[18px] font-medium text-fen">
                    {studyAreaLabels[area]}
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {members.map((m) => (
                      <li key={m.id}>
                        <p className="text-[15px] text-ink">{m.name}</p>
                        <p className="text-[13px] leading-snug text-muted">
                          {m.title}
                        </p>
                        {terminalDegree(m.degrees) ? (
                          <p className="mt-0.5 text-[12px] leading-snug text-muted">
                            {terminalDegree(m.degrees)}
                          </p>
                        ) : null}
                        {m.workingOn ? (
                          <p className="mt-1 text-[13px] leading-snug text-ink">
                            {m.workingOn}
                          </p>
                        ) : null}
                        {m.publications?.length ? (
                          <details className="mt-1.5">
                            <summary className="cursor-pointer text-[12px] font-medium text-reed-deep">
                              Recent work ({m.publications.length})
                            </summary>
                            <ul className="mt-1.5 space-y-1.5 border-l border-hairline pl-3">
                              {m.publications.map((p) => (
                                <li
                                  key={p.title.slice(0, 60)}
                                  className="text-[12px] leading-snug text-muted"
                                >
                                  {p.title}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-muted">
              Titles and fields are the school&rsquo;s own; the grouping is ours.{" "}
              {profile.name} does not publish a separate page per professor, so
              there is nowhere deeper to link —{" "}
              <a
                href={roster[0].profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="unstyled underline decoration-hairline-strong underline-offset-2"
              >
                the full listing is here ↗
              </a>
              . Professors answer email from prospective students more often than
              you would guess.
              {pubSource ? (
                <>
                  {" "}
                  Publication lists come from{" "}
                  <a
                    href={pubSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="unstyled underline decoration-hairline-strong underline-offset-2"
                  >
                    the school&rsquo;s own annual listing ↗
                  </a>
                  , are a selection rather than a full CV, and are only shown for
                  people currently on the directory.
                </>
              ) : null}
            </p>
          </>
        ) : null}

        {/* --- The degrees --- */}
        {degrees?.length ? (
          <>
            <SectionTitle
              eyebrow="What you would study"
              title="The degrees."
              className="mt-16"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {degrees.map((d) => (
                <Card key={d.abbr + d.name} className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-[19px] font-medium text-fen">
                      {d.name}
                    </h3>
                    {d.credits ? (
                      <span className="shrink-0 text-[13px] text-muted">
                        {d.credits} hrs
                      </span>
                    ) : null}
                  </div>
                  {d.flag ? (
                    <p className="mt-2">
                      <Pill tone="reed">{d.flag}</Pill>
                    </p>
                  ) : null}
                  {d.blurb ? (
                    <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                      {d.blurb}
                    </p>
                  ) : null}
                  {d.typicalYears ? (
                    <p className="mt-2 text-[13px] text-muted">{d.typicalYears}</p>
                  ) : null}
                  {d.url ? (
                    <p className="mt-3">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="unstyled text-[14px] font-medium underline decoration-hairline-strong underline-offset-2"
                      >
                        Details ↗
                      </a>
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>
            {concentrations?.length ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-muted">
                  M.Div. concentrations:
                </span>
                {concentrations.map((c) => (
                  <Pill key={c}>{c}</Pill>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {/* --- Money --- */}
        {cost ? (
          <>
            <SectionTitle
              eyebrow="What it costs"
              title="Money, plainly."
              className="mt-16"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Fact label="Tuition" fact={cost.tuitionPerCredit} />
              <Fact label="Who gets aid" fact={cost.pctReceivingAid} />
              <Fact label="Typical award" fact={cost.typicalAward} />
              {scale?.outcomes ? (
                <Fact label="After graduation" fact={scale.outcomes} />
              ) : null}
            </div>
            {cost.fees?.length ? (
              <Card className="mt-4 p-5">
                <Eyebrow>Fees, on top of tuition</Eyebrow>
                <ul className="mt-3 space-y-1.5">
                  {cost.fees.map((f) => (
                    <li key={f.label} className="text-[14px] text-muted">
                      <span className="text-ink">{f.label}</span> — {f.amount}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
            {cost.honestNote ? (
              <Card editorial className="mt-4 p-6">
                <p className="prose text-[15px] text-ink">{cost.honestNote}</p>
              </Card>
            ) : null}
            {cost.aidContact ? (
              <p className="mt-4 text-[15px] text-muted">
                Ask{" "}
                <span className="text-ink">{cost.aidContact.name}</span>,{" "}
                {cost.aidContact.role}
                {cost.aidContact.email ? (
                  <>
                    {" — "}
                    <a
                      href={`mailto:${cost.aidContact.email}`}
                      className="unstyled underline decoration-hairline-strong underline-offset-2"
                    >
                      {cost.aidContact.email}
                    </a>
                  </>
                ) : null}
                {cost.aidContact.phone ? ` · ${cost.aidContact.phone}` : null}.
              </p>
            ) : null}
          </>
        ) : null}

        {/* --- Where you'd be --- */}
        {partnerships?.length ? (
          <>
            <SectionTitle
              eyebrow="Where you would be"
              title="Place, and what else is within reach."
              className="mt-16"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {partnerships.map((p) => (
                <Card key={p.partner} className="p-5">
                  <Eyebrow>{p.kind.replace(/-/g, " ")}</Eyebrow>
                  <h3 className="mt-1.5 font-serif text-[18px] font-medium text-fen">
                    {p.partner}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {p.blurb}
                  </p>
                  {p.url ? (
                    <p className="mt-2.5">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="unstyled text-[14px] font-medium underline decoration-hairline-strong underline-offset-2"
                      >
                        More ↗
                      </a>
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>
          </>
        ) : null}

        {profile.courseOfStudy ? (
          <Card editorial className="mt-6 p-6 md:p-7">
            <Eyebrow>If you are a licensed local pastor</Eyebrow>
            <p className="prose mt-3 text-[15px] text-ink">
              {profile.courseOfStudy.blurb}
            </p>
            {profile.courseOfStudy.url ? (
              <p className="mt-3">
                <a
                  href={profile.courseOfStudy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="unstyled text-[14px] font-medium underline decoration-hairline-strong underline-offset-2"
                >
                  Course of Study at {profile.name} ↗
                </a>
              </p>
            ) : null}
          </Card>
        ) : null}

        {/* --- Editorial judgment --- */}
        {editorial?.whoThrivesHere?.length || editorial?.weighThat?.length ? (
          <>
            <SectionTitle
              eyebrow="An honest read"
              title="Who this fits, and what to weigh."
              className="mt-16"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {editorial.whoThrivesHere?.length ? (
                <Card className="p-6">
                  <Eyebrow>Fits if</Eyebrow>
                  <ul className="mt-3 space-y-2.5">
                    {editorial.whoThrivesHere.map((w) => (
                      <li key={w} className="text-[15px] leading-relaxed text-muted">
                        {w}
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
              {editorial.weighThat?.length ? (
                <Card className="p-6">
                  <Eyebrow>Weigh that</Eyebrow>
                  <ul className="mt-3 space-y-2.5">
                    {editorial.weighThat.map((w) => (
                      <li key={w} className="text-[15px] leading-relaxed text-muted">
                        {w}
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </div>
          </>
        ) : null}

        {editorial?.distinctives?.length ? (
          <Card className="mt-5 p-6 md:p-7">
            <Eyebrow>Worth knowing</Eyebrow>
            <ul className="mt-3 space-y-2.5">
              {editorial.distinctives.map((d) => (
                <li key={d} className="text-[15px] leading-relaxed text-muted">
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {/* --- One concrete next step. Every school page ends here. --- */}
        <Card editorial className="mt-16 p-7">
          <Eyebrow>Your next step</Eyebrow>
          <h2 className="mt-2 font-serif text-[22px] font-medium text-fen">
            Send one email this week.
          </h2>
          <p className="prose mt-3 text-[15px] text-muted">
            Not an application — an email. Pick the professor above whose field is
            closest to what you cannot stop thinking about, and ask them what
            they are working on. Then ask admissions to sit in on one class.
            Both are free, and both tell you more than a brochure will.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-[15px]">
            {profile.contact?.visitUrl ? (
              <a
                href={profile.contact.visitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="unstyled font-medium underline decoration-hairline-strong underline-offset-2"
              >
                Visit or attend an online event ↗
              </a>
            ) : null}
            {profile.contact?.admissionsUrl ? (
              <a
                href={profile.contact.admissionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="unstyled font-medium underline decoration-hairline-strong underline-offset-2"
              >
                Admissions ↗
              </a>
            ) : null}
          </div>
        </Card>

        <p className="mt-8 text-[13px] text-muted">
          Everything on this page was checked against the school&rsquo;s own
          published material on{" "}
          {new Date(profile.lastVerified + "T00:00:00").toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric", year: "numeric" },
          )}
          . Costs and curricula change every year — the source link beside each
          fact is the one that stays current.
        </p>
      </Container>
    </>
  );
}
