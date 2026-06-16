import Link from "next/link";
import { paths } from "@/content";
import { Container, ButtonLink, Eyebrow, Card } from "@/components/ui";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-hairline">
        <Container className="py-20 md:py-28">
          <div className="max-w-3xl">
            <Eyebrow>A companion for discerning a call</Eyebrow>
            <h1
              className="display-md mt-4 font-serif"
              style={{ fontSize: "clamp(2.4rem, 6vw, 3.6rem)", lineHeight: 1.08 }}
            >
              You sense a call to ministry. Let&apos;s walk it through together.
            </h1>
            <p className="prose mt-6 text-[19px] text-muted">
              Wherever you are in life — a teenager who came forward at a service,
              a college student, someone mid-career — the next step looks
              different for you. This is a place to find your step, not someone
              else&apos;s.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/start">Where are you?</ButtonLink>
              <ButtonLink href="/process" variant="secondary">
                See the whole process
              </ButtonLink>
            </div>
            <p className="mt-6 max-w-xl text-[14px] text-[var(--fg-quiet)]">
              The goal is not to pipeline anyone into ordination. It is to be a
              faithful companion while you discern.
            </p>
          </div>
        </Container>
      </section>

      {/* Life-stage paths */}
      <section>
        <Container className="py-16 md:py-20">
          <div className="max-w-2xl">
            <Eyebrow>Start with your life stage</Eyebrow>
            <h2 className="display-sm mt-2 font-serif">
              Five roads to the same table.
            </h2>
            <p className="prose mt-3 text-muted">
              A fourteen-year-old and a forty-seven-year-old are not on the same
              road, even if they end up in the same place. Choose the one that
              sounds like you.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((p) => (
              <Link
                key={p.slug}
                href={`/paths/${p.slug}`}
                className="unstyled group"
              >
                <Card className="h-full p-6 transition-colors hover:border-hairline-strong">
                  <span className="eyebrow">{p.ageHint}</span>
                  <h3 className="mt-2 font-serif text-[24px] font-medium text-fen">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-[15px] text-muted">{p.cardLabel}</p>
                  <p className="title-italic mt-4 text-[16px] leading-snug">
                    {p.tagline}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-fen group-hover:text-ink">
                    Find your next step{" "}
                    <span aria-hidden className="text-reed-deep">
                      →
                    </span>
                  </span>
                </Card>
              </Link>
            ))}

            {/* Wizard prompt card */}
            <Link href="/start" className="unstyled group">
              <Card
                editorial
                className="flex h-full flex-col justify-between p-6 transition-colors hover:border-hairline-strong"
              >
                <div>
                  <span className="eyebrow">Not sure which?</span>
                  <h3 className="mt-2 font-serif text-[24px] font-medium text-fen">
                    Let us help you find it
                  </h3>
                  <p className="mt-2 text-[15px] text-muted">
                    Answer a few gentle questions and we&apos;ll point you to your
                    path and your next step.
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-fen group-hover:text-ink">
                  Where are you?{" "}
                  <span aria-hidden className="text-reed-deep">
                    →
                  </span>
                </span>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      {/* What you'll find */}
      <section className="border-t border-hairline bg-ivory">
        <Container className="py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
            <div className="max-w-sm">
              <Eyebrow>What you&apos;ll find here</Eyebrow>
              <h2 className="display-sm mt-2 font-serif">
                Plain answers to the questions nobody quite explained.
              </h2>
              <p className="prose mt-4 text-muted">
                The candidacy process can feel like a fog of paragraphs and
                committees. We try to say it plainly — and always point you back
                to the people who can walk with you.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
              {[
                {
                  href: "/process",
                  title: "The process, step by step",
                  body: "From first stirring to ordination — explained without jargon.",
                },
                {
                  href: "/ministries",
                  title: "Forms of ministry",
                  body: "Elder, deacon, local pastor, chaplain, lay — with honest trade-offs.",
                },
                {
                  href: "/seminaries",
                  title: "Seminaries",
                  body: "The UMC schools, including hybrid and online options.",
                },
                {
                  href: "/resources",
                  title: "Resources & mentorship",
                  body: "Books, retreats, money, and the people who guide you.",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="unstyled bg-ivory p-6 transition-colors hover:bg-parchment"
                >
                  <h3 className="font-serif text-[20px] font-medium text-fen">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] text-muted">{item.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
