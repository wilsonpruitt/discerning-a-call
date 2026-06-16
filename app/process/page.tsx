import type { Metadata } from "next";
import Link from "next/link";
import { ladder } from "@/content";
import { Container, PageHeader, Card, Eyebrow } from "@/components/ui";
import { DisciplineRef } from "@/components/discipline-ref";

export const metadata: Metadata = {
  title: "The candidacy process",
  description:
    "From first stirring to ordination — the United Methodist path to licensed and ordained ministry, explained plainly.",
};

const TRACK_LABELS: Record<string, string> = {
  shared: "The shared beginning",
  licensed: "The licensed local pastor track",
  ordained: "The ordained track",
  lay: "The lay track",
};

export default function ProcessPage() {
  return (
    <>
      <section className="border-b border-hairline">
        <Container className="py-14 md:py-20">
          <PageHeader
            eyebrow="The whole path"
            title="From a first stirring to ordination."
            subtitle="A ladder, not a maze — even if it can feel like one."
            lead="Everyone begins the same way: a conversation. From there the road branches toward licensed, ordained, or lay ministry. Here is the shape of it, in plain language."
          />
          <p className="mt-6 max-w-2xl rounded-lg border border-hairline bg-ivory p-4 text-[14px] text-muted">
            Paragraph references (¶) are to the 2020/2024 Book of Discipline.
            Your own annual conference adds its own steps and timing — always
            treat your Board of Ordained Ministry as the final word.
          </p>
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        <ol className="relative space-y-5 border-l border-hairline-strong pl-6 md:pl-8">
          {ladder.map((stage) => (
            <li key={stage.id} id={stage.id} className="scroll-mt-24">
              <span
                aria-hidden
                className="absolute -left-[7px] mt-2 block h-3 w-3 rounded-full border-2 border-reed bg-parchment"
              />
              <Card className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Eyebrow>{TRACK_LABELS[stage.track] ?? stage.trackLabel}</Eyebrow>
                  {stage.disciplineRefs?.map((ref) => (
                    <DisciplineRef key={ref} refLabel={ref} />
                  ))}
                </div>
                <h2 className="mt-2 font-serif text-[26px] font-medium text-fen">
                  {stage.name}
                </h2>
                <p className="title-italic mt-1 text-[17px]">{stage.summary}</p>

                <ul className="mt-5 space-y-2.5">
                  {stage.whatItIs.map((line, i) => (
                    <li key={i} className="flex gap-3 text-[15px]">
                      <span aria-hidden className="mt-1 text-reed-deep">
                        ·
                      </span>
                      <span className="text-muted">{line}</span>
                    </li>
                  ))}
                </ul>

                {stage.requirements ? (
                  <div className="mt-5 rounded-md border border-hairline bg-parchment p-4">
                    <Eyebrow>What it takes</Eyebrow>
                    <ul className="mt-2 space-y-1.5">
                      {stage.requirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[14px] text-muted"
                        >
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
            Reaching the top of this ladder is not the measure of a faithful
            call. Plenty of people are called to lay ministry, to a local-pastor
            vocation, or to a long, quiet season of discernment that doesn&apos;t
            look like a ladder at all. Read it as a map of possibilities, not a
            scoreboard.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/ministries"
              className="unstyled text-[14px] font-medium text-fen"
            >
              Compare the forms of ministry →
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
