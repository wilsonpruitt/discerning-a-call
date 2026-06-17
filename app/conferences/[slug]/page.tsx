import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { conferences, conferenceBySlug } from "@/content";
import { Container, Card, Pill, Eyebrow } from "@/components/ui";

export function generateStaticParams() {
  return conferences.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = conferenceBySlug[slug];
  if (!c) return {};
  return {
    title: `${c.name} — the local on-ramp`,
    description: `How to begin candidacy in the ${c.name}.`,
  };
}

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = conferenceBySlug[slug];
  if (!c) notFound();

  return (
    <>
      <section className="border-b border-hairline bg-ivory">
        <Container className="py-14 md:py-20">
          <Eyebrow>The local on-ramp · {c.region}</Eyebrow>
          <h1
            className="display-md mt-3 font-serif"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
          >
            {c.name}
          </h1>
          <div className="prose mt-5 max-w-2xl space-y-4 text-[17px]">
            {c.intro.map((p, i) => (
              <p key={i} className={i > 0 ? "text-muted" : undefined}>
                {p}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <Eyebrow>How candidacy begins here</Eyebrow>
            {c.onRamps.map((ramp, i) => (
              <Card key={i} className="p-6">
                <h2 className="font-serif text-[23px] font-medium text-fen">
                  {ramp.title}
                </h2>
                <p className="prose mt-2 text-[15px] text-muted">{ramp.body}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ramp.when ? (
                    <div className="rounded-md border border-hairline bg-parchment p-3">
                      <Eyebrow>When</Eyebrow>
                      <p className="mt-1 text-[14px]">{ramp.when}</p>
                    </div>
                  ) : null}
                  {ramp.cost ? (
                    <div className="rounded-md border border-hairline bg-parchment p-3">
                      <Eyebrow>What it asks</Eyebrow>
                      <p className="mt-1 text-[14px]">{ramp.cost}</p>
                    </div>
                  ) : null}
                </div>
                {ramp.link ? (
                  <a
                    href={ramp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="unstyled mt-4 inline-block text-[14px] font-medium text-fen"
                  >
                    Conference page ↗
                  </a>
                ) : null}
              </Card>
            ))}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card editorial className="p-6">
              <Eyebrow>Who to contact</Eyebrow>
              <ul className="mt-3 space-y-4">
                {c.contacts.map((person) => (
                  <li key={person.name}>
                    <p className="text-[15px] font-semibold text-fen">
                      {person.name}
                    </p>
                    <p className="text-[13px] text-muted">{person.role}</p>
                    {person.email ? (
                      <a
                        href={`mailto:${person.email}`}
                        className="text-[14px] text-fen"
                      >
                        {person.email}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>

            {c.localNotes ? (
              <Card className="p-6">
                <Eyebrow>Good to know</Eyebrow>
                <ul className="mt-3 space-y-2.5">
                  {c.localNotes.map((note, i) => (
                    <li key={i} className="flex gap-2 text-[14px] text-muted">
                      <span aria-hidden className="text-reed-deep">
                        —
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </aside>
        </div>

        {c.careerSnapshot ? (
          <section className="mt-14 border-t border-hairline pt-12">
            <Eyebrow>What the road ahead looks like</Eyebrow>
            <h2 className="mt-2 font-serif text-[26px] font-medium text-fen">
              A ministry career here, by the numbers.
            </h2>
            <p className="prose mt-3 max-w-2xl text-[16px] text-muted">
              {c.careerSnapshot.lead}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {c.careerSnapshot.orders.map((o) => (
                <Card key={o.order} className="p-6">
                  <h3 className="font-serif text-[21px] font-medium text-fen">
                    {o.order}
                  </h3>
                  <p className="title-italic mt-1 text-[15px]">{o.blurb}</p>
                  <dl className="mt-4 space-y-3 text-[14px]">
                    <div>
                      <dt className="text-[12px] uppercase tracking-wide text-reed-deep">
                        Over a career
                      </dt>
                      <dd className="mt-0.5 text-muted">{o.fullCareer}</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] uppercase tracking-wide text-reed-deep">
                        Each appointment
                      </dt>
                      <dd className="mt-0.5 text-muted">{o.appointment}</dd>
                    </div>
                  </dl>
                </Card>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-[var(--fg-quiet)]">
              {c.careerSnapshot.note}
            </p>
          </section>
        ) : null}

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Pill tone="reed">Tip</Pill>
          <p className="text-[14px] text-muted">
            New to all this?{" "}
            <Link href="/start" className="font-medium text-fen">
              Find your path first →
            </Link>
          </p>
        </div>

        {c.source ? (
          <p className="mt-8 text-[12px] text-[var(--fg-quiet)]">
            Drawn from {c.source}. Details change — confirm with the conference
            office.
          </p>
        ) : null}
      </Container>
    </>
  );
}
