import type { Metadata } from "next";
import Link from "next/link";
import { layTrack } from "@/content";
import { toBullet } from "@/content/types";
import {
  Container,
  PageHeader,
  Card,
  Eyebrow,
  ContentLinkInline,
} from "@/components/ui";
import { DisciplineRef } from "@/components/discipline-ref";

export const metadata: Metadata = {
  title: "Lay ministry",
  description:
    "A call doesn't have to lead to ordination. Lay servant, lay speaker, and certified lay minister — a complete path of leadership without seminary.",
};

export default function LayMinistryPage() {
  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="A complete path, not a consolation prize"
            title="Not every call points toward ordination."
            subtitle="Lay Servant Ministries: training the church already trusts, that you can start this year."
            lead="Ordination gets most of the attention, but it isn't the only way to lead. Lay Servant Ministries certifies laypeople — while they keep their jobs, their homes, their lives — to lead worship, preach, care for a congregation, and start new ones. For many people this is where a real call finds its finish; for others it's a season on the way to something else. Both are whole."
          />
          <p className="mt-6 max-w-2xl rounded-lg border border-hairline bg-ivory p-4 text-[14px] text-muted">
            Paragraph references (¶) are to the 2020/2024 Book of Discipline,
            Section XI, Lay Servant Ministries. Your own district and
            conference Committee on Lay Servant Ministries set the schedule
            and local requirements.
          </p>
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        <div className="max-w-2xl">
          <Eyebrow>Why this matters</Eyebrow>
          <h2 className="mt-2 font-serif text-[26px] font-medium text-fen">
            The oldest Methodist pattern is a lay one.
          </h2>
          <p className="prose mt-4 text-[16px] text-muted">
            Long before a pastor was appointed to most Methodist societies, a
            class leader — a layperson — was already leading the group in
            prayer, accountability, and care. The Discipline still carries
            that pattern forward: a certified lay minister can develop a new
            faith community or lead outreach ministry (¶268) without the
            cost, timeline, or itinerancy that ordination requires. For a
            small or new community, that difference in cost is not a
            footnote — it can be the difference between a ministry that
            starts and one that waits for funding that may never come.
          </p>
        </div>

        <ol className="relative mt-10 space-y-5 border-l border-hairline-strong pl-6 md:pl-8">
          {layTrack.map((stage) => (
            <li key={stage.id} id={stage.id} className="scroll-mt-24">
              <span
                aria-hidden
                className="absolute -left-[7px] mt-2 block h-3 w-3 rounded-full border-2 border-reed bg-parchment"
              />
              <Card className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow>{stage.trackLabel}</Eyebrow>
                  {stage.disciplineRefs?.map((ref) => (
                    <DisciplineRef key={ref} refLabel={ref} />
                  ))}
                </div>
                <h2 className="mt-2 font-serif text-[26px] font-medium text-fen">
                  {stage.name}
                </h2>
                <p className="title-italic mt-1 text-[17px]">{stage.summary}</p>

                <ul className="mt-5 space-y-2.5">
                  {stage.whatItIs.map((raw, i) => {
                    const line = toBullet(raw);
                    return (
                      <li key={i} className="flex gap-3 text-[15px]">
                        <span aria-hidden className="mt-1 text-reed-deep">
                          ·
                        </span>
                        <span className="text-muted">
                          {line.text}
                          {line.link ? (
                            <>
                              {" "}
                              <ContentLinkInline
                                label={line.link.label}
                                url={line.link.url}
                              />
                            </>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {stage.requirements ? (
                  <div className="mt-5 rounded-md border border-hairline bg-parchment p-4">
                    <Eyebrow>What it takes</Eyebrow>
                    <ul className="mt-2 space-y-1.5">
                      {stage.requirements.map((req, i) => (
                        <li key={i} className="flex gap-2 text-[14px] text-muted">
                          <span aria-hidden className="text-reed-deep">
                            →
                          </span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {stage.whoToTalkTo ? (
                  <p className="mt-4 text-[14px] text-muted">
                    <span className="font-medium text-fen">Who to talk to:</span>{" "}
                    {stage.whoToTalkTo}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ol>

        <Card editorial className="mt-12 p-7">
          <Eyebrow>A reminder</Eyebrow>
          <p className="prose mt-2 text-[16px]">
            You don&apos;t need to know which of these three you&apos;re
            aiming for before you start — most people only decide that after
            the Basic Course. The honest first step is the same one it
            always is: tell your pastor you&apos;re wondering.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/ministries#lay"
              className="unstyled text-[14px] font-medium text-fen"
            >
              See lay ministry alongside the other forms →
            </Link>
            <Link
              href="/process"
              className="unstyled text-[14px] font-medium text-fen"
            >
              See how this sits next to the ordained/licensed tracks →
            </Link>
            <Link
              href="/start"
              className="unstyled text-[14px] font-medium text-fen"
            >
              Find your own next step →
            </Link>
          </div>
        </Card>
      </Container>
    </>
  );
}
