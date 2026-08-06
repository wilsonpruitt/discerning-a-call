import type { Metadata } from "next";
import Link from "next/link";
import {
  faculty,
  seminaryProfiles,
  seminaryProfileBySlug,
  studyAreaLabels,
  type FacultyMember,
  type StudyArea,
} from "@/content";
import { Container, PageHeader, Card, Eyebrow, Pill } from "@/components/ui";

export const metadata: Metadata = {
  title: "Who teaches what, across schools",
  description:
    "Every professor at the schools profiled here, grouped by what they work on — so you can find the people before you choose the school.",
};

// The one thing no seminary's own site can build: a view across schools. A
// school lists its own faculty; nobody lists them side by side. For someone
// still deciding where to apply, "who works on this, and where are they" is a
// better question than "which school is best," and it is the question nobody
// has been able to ask.

interface AreaGroup {
  area: StudyArea;
  members: FacultyMember[];
  bySchool: { slug: string; name: string; members: FacultyMember[] }[];
}

function buildIndex(): AreaGroup[] {
  const byArea = new Map<StudyArea, FacultyMember[]>();
  for (const m of faculty) {
    for (const area of m.areas) {
      const list = byArea.get(area) ?? [];
      list.push(m);
      byArea.set(area, list);
    }
  }

  const groups: AreaGroup[] = [];
  for (const [area, members] of byArea) {
    const schools = new Map<string, FacultyMember[]>();
    for (const m of members) {
      const list = schools.get(m.seminarySlug) ?? [];
      list.push(m);
      schools.set(m.seminarySlug, list);
    }
    groups.push({
      area,
      members,
      bySchool: [...schools.entries()]
        .map(([slug, ms]) => ({
          slug,
          name: seminaryProfileBySlug[slug]?.name ?? slug,
          members: ms.sort((a, b) => a.name.localeCompare(b.name)),
        }))
        // Most people first: where a field is concentrated is the finding.
        .sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name)),
    });
  }

  return groups.sort(
    (a, b) => b.members.length - a.members.length || studyAreaLabels[a.area].localeCompare(studyAreaLabels[b.area]),
  );
}

function Person({ member }: { member: FacultyMember }) {
  return (
    <li className="text-[14px] leading-snug text-muted">
      {member.profileUrl ? (
        <a
          href={member.profileUrl}
          className="text-ink underline decoration-hairline underline-offset-2"
        >
          {member.name}
        </a>
      ) : (
        <span className="text-ink">{member.name}</span>
      )}
      {member.title ? <> — {member.title}</> : null}
    </li>
  );
}

export default function FacultyIndexPage() {
  const groups = buildIndex();
  const schoolCount = seminaryProfiles.length;

  // Scarcity is a finding in its own right. An area with three people across
  // ten schools tells a candidate something a long list never would.
  const thin = groups.filter((g) => g.members.length <= 6);

  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="Across the schools"
            title="Who teaches what."
            subtitle={`${faculty.length} professors at ${schoolCount} schools, grouped by what they work on.`}
            lead="Every seminary publishes its own faculty. None of them publishes the others'. If you are trying to work out where the people in your field actually are — or whether a field you care about is taught anywhere at all — this is the view that has been missing. Start with the subject, not the school."
          />
        </Container>
      </section>

      <Container className="py-12 md:py-14">
        <Card editorial className="p-6 md:p-7">
          <Eyebrow>How to read this, and how far to trust it</Eyebrow>
          <p className="prose mt-3 text-[15px] text-ink">
            Subject areas here are drawn from each person&rsquo;s job title and,
            where a school publishes one, their own bio. Titles carry roughly
            half the signal: a professor of church history whose title says
            nothing about Methodism may teach the only Methodism course on
            campus. Treat a name here as a lead worth an email, not as the last
            word on what someone works on — and treat an empty area as &ldquo;not
            found in what these schools publish,&rdquo; not as &ldquo;not
            taught.&rdquo;
          </p>
          <p className="prose mt-3 text-[15px] text-muted">
            This covers the {schoolCount} schools profiled so far, out of the 37
            the University Senate has approved. A school missing from a subject
            below may simply not have been profiled yet.{" "}
            <Link
              href="/seminaries"
              className="text-fen underline decoration-hairline underline-offset-2"
            >
              See which schools are covered
            </Link>
            .
          </p>
        </Card>

        {thin.length ? (
          <Card className="mt-5 p-6">
            <Eyebrow>Thin ground</Eyebrow>
            <p className="prose mt-3 text-[15px] text-ink">
              These subjects have six or fewer people across all {schoolCount}{" "}
              schools. If one of them is your reason for going, the choice of
              school may already be made for you — and it is worth writing to
              those people before you apply.
            </p>
            <ul className="mt-3 space-y-1.5">
              {thin.map((g) => (
                <li key={g.area} className="text-[14px] text-muted">
                  <a
                    href={`#${g.area}`}
                    className="text-ink underline decoration-hairline underline-offset-2"
                  >
                    {studyAreaLabels[g.area]}
                  </a>{" "}
                  — {g.members.length}{" "}
                  {g.members.length === 1 ? "person" : "people"} at{" "}
                  {g.bySchool.length}{" "}
                  {g.bySchool.length === 1 ? "school" : "schools"}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div className="mt-12 space-y-10">
          {groups.map((g) => (
            <section key={g.area} id={g.area} className="scroll-mt-24">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline pb-2.5">
                <h2 className="font-serif text-[22px] font-medium text-fen">
                  {studyAreaLabels[g.area]}
                </h2>
                <Pill tone={g.members.length <= 6 ? "reed" : "neutral"}>
                  {g.members.length}{" "}
                  {g.members.length === 1 ? "person" : "people"} ·{" "}
                  {g.bySchool.length}{" "}
                  {g.bySchool.length === 1 ? "school" : "schools"}
                </Pill>
              </div>

              <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {g.bySchool.map((s) => (
                  <div key={s.slug}>
                    <p className="text-[13px] font-medium uppercase tracking-wide text-muted">
                      <Link
                        href={`/seminaries/${s.slug}`}
                        className="hover:text-fen"
                      >
                        {s.name}
                      </Link>
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {s.members.map((m) => (
                        <Person key={`${m.seminarySlug}-${m.name}`} member={m} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
