import type { Metadata } from "next";
import Link from "next/link";
import { ladder } from "@/content";
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

        <Card className="mt-12 p-7">
          <Eyebrow>A little history</Eyebrow>
          <h2 className="mt-2 font-serif text-[26px] font-medium text-fen">
            How this path has changed.
          </h2>
          <p className="title-italic mt-1 text-[17px]">
            The ladder above is today&apos;s. It hasn&apos;t always looked like
            this.
          </p>
          <p className="prose mt-4 text-[16px]">
            The single biggest change came at the 1996 General Conference. If a
            pastor or mentor who was ordained before then describes the path a
            little differently than what you read above, this is usually why —
            the older vocabulary still circulates.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-hairline bg-parchment p-4">
              <Eyebrow>Before 1996</Eyebrow>
              <ul className="mt-2 space-y-2 text-[14px] text-muted">
                <li className="flex gap-2">
                  <span aria-hidden className="text-reed-deep">·</span>
                  <span>
                    <span className="font-medium text-fen">Two ordinations.</span>{" "}
                    Almost everyone was ordained a deacon first, then ordained an
                    elder years later. The deacon was a step you passed{" "}
                    <em>through</em> on the way to elder.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-reed-deep">·</span>
                  <span>
                    The in-between stage was called{" "}
                    <span className="font-medium text-fen">
                      probationary membership.
                    </span>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-reed-deep">·</span>
                  <span>
                    Servant-ministry roles were carried by a separate consecrated
                    lay office, the <em>diaconal minister.</em>
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-hairline bg-parchment p-4">
              <Eyebrow>Since 1996</Eyebrow>
              <ul className="mt-2 space-y-2 text-[14px] text-muted">
                <li className="flex gap-2">
                  <span aria-hidden className="text-reed-deep">·</span>
                  <span>
                    <span className="font-medium text-fen">One ordination.</span>{" "}
                    You are <em>commissioned</em> (not ordained) as a provisional
                    member, then ordained once — as either a deacon or an elder.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-reed-deep">·</span>
                  <span>
                    Deacon and elder are now equal, permanent{" "}
                    <span className="font-medium text-fen">orders.</span> A deacon
                    is a destination, not a stepping-stone.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-reed-deep">·</span>
                  <span>
                    That in-between stage is now called{" "}
                    <span className="font-medium text-fen">
                      provisional membership.
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-5 text-[14px] text-muted">
            So if you hear someone talk about being &ldquo;ordained deacon&rdquo;
            on the way to elder, or about &ldquo;probationary&rdquo; membership,
            they&apos;re describing the pre-1996 path. The steps above are the
            current ones.
          </p>
        </Card>

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
