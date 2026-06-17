import type { Metadata } from "next";
import Link from "next/link";
import { mentorGuide } from "@/content";
import { Container, PageHeader, Card, Eyebrow, SectionTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "For mentors",
  description:
    "Walking with someone discerning a call — what a United Methodist mentor is, what they are not, and how to make room well, at any life stage.",
};

const g = mentorGuide;

export default function MentorsPage() {
  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="For those who walk alongside"
            title="Mentoring someone discerning a call."
            subtitle="You don't have to have the answers. You have to make room."
            lead={g.intro[0]}
          />
          <p className="mt-5 max-w-2xl text-[16px] text-muted">{g.intro[1]}</p>
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        {/* Who this is for */}
        <SectionTitle eyebrow="Who this is for" title="Maybe that's you." />
        <ul className="mt-6 grid gap-3 md:grid-cols-3">
          {g.whoFor.map((who, i) => (
            <li key={i}>
              <Card className="h-full p-5 text-[15px] text-muted">{who}</Card>
            </li>
          ))}
        </ul>

        {/* What a mentor is / is not */}
        <SectionTitle
          eyebrow="The role"
          title="What a mentor is — and isn't."
          className="mt-16"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-hairline bg-parchment p-5">
            <Eyebrow>A mentor is not</Eyebrow>
            <ul className="mt-3 space-y-2">
              {g.isNot.map((x, i) => (
                <li key={i} className="flex gap-2 text-[15px] text-muted">
                  <span aria-hidden className="mt-px text-reed-deep">
                    ✕
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-hairline bg-ivory p-5">
            <Eyebrow>A mentor is</Eyebrow>
            <ul className="mt-3 space-y-2">
              {g.is.map((x, i) => (
                <li key={i} className="flex gap-2 text-[15px] text-muted">
                  <span aria-hidden className="mt-px text-reed-deep">
                    ·
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Card editorial className="mt-4 p-6">
          <p className="prose text-[16px]">{g.boundaryNote}</p>
        </Card>

        {/* The four lenses */}
        <SectionTitle
          eyebrow="The work"
          title="Four things you help them test the call against."
          className="mt-16"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {g.lenses.map((lens) => (
            <Card key={lens.title} className="p-6">
              <h3 className="font-serif text-[22px] font-medium text-fen">
                {lens.title}
              </h3>
              <p className="mt-2 text-[15px] text-muted">{lens.body}</p>
            </Card>
          ))}
        </div>

        {/* The covenant */}
        <SectionTitle
          eyebrow="How you'll be together"
          title="Make a covenant."
          className="mt-16"
        />
        <p className="mt-4 max-w-2xl text-[16px] text-muted">{g.covenantIntro}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {g.covenant.map((c) => (
            <div
              key={c.title}
              className="rounded-md border border-hairline bg-parchment p-5"
            >
              <h3 className="title-italic text-[18px] text-fen">{c.title}</h3>
              <p className="mt-2 text-[14px] text-muted">{c.body}</p>
            </div>
          ))}
        </div>

        {/* The rhythm of a meeting */}
        <SectionTitle
          eyebrow="The shape of a meeting"
          title="A rhythm you can keep."
          className="mt-16"
        />
        <ol className="relative mt-6 space-y-5 border-l border-hairline-strong pl-6 md:pl-8">
          {g.rhythm.map((beat) => (
            <li key={beat.title}>
              <span
                aria-hidden
                className="absolute -left-[7px] mt-1.5 block h-3 w-3 rounded-full border-2 border-reed bg-parchment"
              />
              <h3 className="font-serif text-[20px] font-medium text-fen">
                {beat.title}
              </h3>
              <p className="mt-1 text-[15px] text-muted">{beat.body}</p>
            </li>
          ))}
        </ol>

        {/* The report */}
        <Card editorial className="mt-16 p-7">
          <Eyebrow>The report — and the trust beneath it</Eyebrow>
          {g.report.map((p, i) => (
            <p
              key={i}
              className={`prose text-[16px] ${i === 0 ? "mt-2" : "mt-3"}`}
            >
              {p}
            </p>
          ))}
        </Card>

        {/* Group vs one-on-one */}
        <SectionTitle
          eyebrow="The setting"
          title="A group, when you can."
          className="mt-16"
        />
        <div className="mt-4 max-w-2xl space-y-3">
          {g.groupVsOneOnOne.map((p, i) => (
            <p key={i} className="text-[16px] text-muted">
              {p}
            </p>
          ))}
        </div>

        {/* Life stages */}
        <SectionTitle
          eyebrow="Meet them where they are"
          title="Walking with different life stages."
          className="mt-16"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {g.lifeStageNotes.map((n) => (
            <Card key={n.stage} className="p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-[20px] font-medium text-fen">
                  {n.label}
                </h3>
                <Link
                  href={`/paths/${n.stage}`}
                  className="unstyled text-[13px] font-medium text-reed-deep"
                >
                  Their path →
                </Link>
              </div>
              <p className="mt-2 text-[15px] text-muted">{n.body}</p>
            </Card>
          ))}
        </div>

        {/* Training */}
        <SectionTitle
          eyebrow="The official track"
          title="Where to get trained."
          className="mt-16"
        />
        <p className="mt-4 max-w-2xl text-[16px] text-muted">{g.trainingIntro}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {g.training.map((t) => (
            <div
              key={t.title}
              className="rounded-md border border-hairline bg-ivory p-5"
            >
              <h3 className="font-serif text-[18px] font-medium text-fen">
                {t.title}
              </h3>
              <p className="mt-2 text-[14px] text-muted">{t.body}</p>
            </div>
          ))}
        </div>

        {/* Closing */}
        <Card editorial className="mt-16 p-7">
          <Eyebrow>One last thing</Eyebrow>
          <p className="prose mt-2 text-[16px]">
            Your job is not to manufacture a call or to screen one out. It is to
            be a faithful, honest companion while God does that work — and to
            point toward the next step when they&apos;re ready for it. That is no
            small ministry.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/process"
              className="unstyled text-[14px] font-medium text-fen"
            >
              See the candidacy process →
            </Link>
            <Link
              href="/paths"
              className="unstyled text-[14px] font-medium text-fen"
            >
              Explore the life-stage paths →
            </Link>
            <Link
              href="/resources"
              className="unstyled text-[14px] font-medium text-fen"
            >
              Browse resources →
            </Link>
          </div>
        </Card>
      </Container>
    </>
  );
}
