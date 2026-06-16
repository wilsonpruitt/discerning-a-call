import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  paths,
  pathBySlug,
  ladderById,
  ministryById,
  resources,
} from "@/content";
import { Container, Card, Pill, ButtonLink, Eyebrow } from "@/components/ui";

export function generateStaticParams() {
  return paths.map((p) => ({ stage: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stage: string }>;
}): Promise<Metadata> {
  const { stage } = await params;
  const path = pathBySlug[stage];
  if (!path) return {};
  return {
    title: `${path.name} — discerning a call`,
    description: path.tagline,
  };
}

export default async function PathPage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const { stage } = await params;
  const path = pathBySlug[stage];
  if (!path) notFound();

  const resourceById = Object.fromEntries(resources.map((r) => [r.id, r]));
  const stageResources = path.resourceIds
    .map((id) => resourceById[id])
    .filter(Boolean);
  const stageLadder = path.ladderStageIds
    .map((id) => ladderById[id])
    .filter(Boolean);
  const stageForms = (path.formIds ?? [])
    .map((id) => ministryById[id])
    .filter(Boolean);

  const others = paths.filter((p) => p.slug !== path.slug);

  return (
    <>
      <section className="border-b border-hairline bg-ivory">
        <Container className="py-14 md:py-20">
          <Link
            href="/paths"
            className="unstyled text-[14px] text-muted hover:text-ink"
          >
            ← All life stages
          </Link>
          <div className="mt-5 max-w-3xl">
            <Eyebrow>{path.ageHint}</Eyebrow>
            <h1
              className="display-md mt-3 font-serif"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
            >
              {path.name}
            </h1>
            <p className="title-italic mt-3 text-[21px]">{path.tagline}</p>
            <div className="prose mt-6 space-y-4 text-[17px]">
              {path.intro.map((para, i) => (
                <p key={i} className={i > 0 ? "text-muted" : undefined}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Main column */}
          <div className="space-y-14">
            {/* First steps */}
            <section>
              <Eyebrow>Your first steps</Eyebrow>
              <h2 className="display-sm mt-2 font-serif">
                What to actually do next.
              </h2>
              <ol className="mt-6 space-y-4">
                {path.firstSteps.map((step, i) => (
                  <li key={i}>
                    <Card className="flex gap-4 p-5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-reed font-serif text-[16px] text-reed-deep">
                        {i + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[17px] font-semibold text-fen">
                            {step.title}
                          </h3>
                          {step.optional ? (
                            <Pill>when you're ready</Pill>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-[15px] text-muted">
                          {step.body}
                        </p>
                      </div>
                    </Card>
                  </li>
                ))}
              </ol>
            </section>

            {/* Realities */}
            <section>
              <Eyebrow>What&apos;s different about your stage</Eyebrow>
              <h2 className="display-sm mt-2 font-serif">
                The things worth naming honestly.
              </h2>
              <div className="mt-6 space-y-4">
                {path.realities.map((r, i) => (
                  <Card key={i} editorial className="p-5">
                    <h3 className="font-serif text-[19px] font-medium text-fen">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-muted">{r.body}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Watch for */}
            <section>
              <Eyebrow>Gentle cautions</Eyebrow>
              <h2 className="display-sm mt-2 font-serif">Keep these in view.</h2>
              <ul className="mt-5 space-y-3">
                {path.watchFor.map((w, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-muted">
                    <span aria-hidden className="mt-1 text-reed-deep">
                      —
                    </span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-6">
              <Eyebrow>A word on timing</Eyebrow>
              <p className="prose mt-3 text-[15px]">{path.timeline}</p>
            </Card>

            {stageLadder.length > 0 ? (
              <Card className="p-6">
                <Eyebrow>Where you are on the path</Eyebrow>
                <ul className="mt-3 space-y-2.5">
                  {stageLadder.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/process#${s.id}`}
                        className="unstyled group block"
                      >
                        <span className="text-[15px] font-medium text-fen group-hover:text-ink">
                          {s.name}
                        </span>
                        <span className="block text-[13px] text-muted">
                          {s.summary}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/process"
                  className="unstyled mt-4 inline-block text-[14px] font-medium text-fen"
                >
                  See the whole process →
                </Link>
              </Card>
            ) : null}

            {stageForms.length > 0 ? (
              <Card className="p-6">
                <Eyebrow>Forms worth a look</Eyebrow>
                <ul className="mt-3 space-y-2.5">
                  {stageForms.map((f) => (
                    <li key={f.id}>
                      <Link
                        href={`/ministries#${f.id}`}
                        className="unstyled group block"
                      >
                        <span className="text-[15px] font-medium text-fen group-hover:text-ink">
                          {f.name}
                        </span>
                        <span className="block text-[13px] text-muted">
                          {f.oneLine}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {stageResources.length > 0 ? (
              <Card className="p-6">
                <Eyebrow>Start with these</Eyebrow>
                <ul className="mt-3 space-y-2.5">
                  {stageResources.map((r) => (
                    <li key={r.id} className="text-[14px]">
                      <span className="font-medium text-fen">{r.title}</span>
                      {r.by ? (
                        <span className="text-muted"> · {r.by}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/resources"
                  className="unstyled mt-4 inline-block text-[14px] font-medium text-fen"
                >
                  All resources →
                </Link>
              </Card>
            ) : null}
          </aside>
        </div>

        {/* Conference callout */}
        <Card editorial className="mt-14 p-7">
          <div className="grid gap-5 md:grid-cols-[1.5fr_auto] md:items-center">
            <div>
              <Eyebrow>When you&apos;re ready for the formal door</Eyebrow>
              <h2 className="mt-2 font-serif text-[24px] font-medium text-fen">
                Your annual conference is the on-ramp.
              </h2>
              <p className="prose mt-2 text-[15px] text-muted">
                Candidacy is run by your conference. If you&apos;re in Rio Texas,
                we&apos;ve laid out the Candidacy Summit and who to contact.
              </p>
            </div>
            <ButtonLink href="/conferences/rio-texas" variant="secondary">
              Rio Texas on-ramp
            </ButtonLink>
          </div>
        </Card>
      </Container>

      {/* Other paths */}
      <section className="border-t border-hairline bg-ivory">
        <Container className="py-12">
          <Eyebrow>Not quite you?</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-3">
            {others.map((p) => (
              <Link
                key={p.slug}
                href={`/paths/${p.slug}`}
                className="unstyled rounded-md border border-hairline-strong bg-parchment px-4 py-2 text-[14px] text-fen hover:bg-sunken"
              >
                {p.cardLabel}
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
